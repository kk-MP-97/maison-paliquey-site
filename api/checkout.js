/**
 * Maison Paliquey — API route Vercel
 * POST /api/checkout
 * =====================================================================
 * Checkout public self-service pour les commandes de linge (kits + pièces
 * à la carte). Étapes :
 *   1. valide le panier + coordonnées + dates,
 *   2. RECALCULE le prix côté serveur depuis tarifs.json (le montant envoyé
 *      par le navigateur est ignoré — anti-fraude),
 *   3. crée une commande Supabase (source='web', statut_paiement='en_attente'),
 *   4. crée la ligne `paiements` + le paiement Mollie,
 *   5. renvoie l'URL de checkout Mollie.
 *
 * Le paiement réussi (traité par l'edge function `mollie-webhook`) vaut
 * RÉSERVATION FERME (commandes.statut_paiement='paye').
 *
 * Variables d'environnement (Vercel → Settings → Environment) :
 *   MOLLIE_API_KEY              → test_xxx (puis live_xxx après QA)
 *   SUPABASE_URL                → https://yiuxiwcvmixzmeimocbp.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY   → service role (écriture commandes/paiements)
 *   (RESEND_* déjà présents — les emails sont envoyés par le webhook Supabase)
 *
 * Runtime : Node.js (ESM, fetch natif). Aucune dépendance externe.
 */

import { computeQuote, prestationType } from "../shared/pricing.mjs";

// ── Anti-spam basique par IP (mémoire, reset au cold start) ──────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
function rateLimit(ip) {
  const now = Date.now();
  const e = rateLimitMap.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW_MS };
  if (now > e.reset) { e.count = 0; e.reset = now + RATE_LIMIT_WINDOW_MS; }
  e.count += 1;
  rateLimitMap.set(ip, e);
  return e.count <= RATE_LIMIT_MAX;
}

// ── Cache tarifs.json (servi statiquement par le même domaine) ───────
let _tarifsCache = null;
let _tarifsCacheAt = 0;
async function loadTarifs(baseUrl) {
  const now = Date.now();
  if (_tarifsCache && now - _tarifsCacheAt < 5 * 60_000) return _tarifsCache;
  const res = await fetch(`${baseUrl}/assets/data/tarifs.json`, { cache: "no-cache" });
  if (!res.ok) throw new Error("tarifs.json indisponible");
  const data = await res.json();
  _tarifsCache = data.tarifs || [];
  _tarifsCacheAt = now;
  return _tarifsCache;
}

function baseUrlFrom(req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").toString().split(",")[0];
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "www.maisonpaliquey.fr").toString();
  return `${proto}://${host}`;
}

function fmtEuros(cents) { return (cents / 100).toFixed(2).replace(".", ",") + " €"; }
function clip(s, n) { return String(s || "").slice(0, n); }

async function supaInsert(supaUrl, supaKey, table, row) {
  const res = await fetch(`${supaUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: supaKey,
      Authorization: `Bearer ${supaKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`${table} insert ${res.status}: ${txt}`);
  return txt ? JSON.parse(txt) : null;
}

async function supaPatch(supaUrl, supaKey, table, match, patch) {
  const qs = Object.entries(match).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join("&");
  const res = await fetch(`${supaUrl}/rest/v1/${table}?${qs}`, {
    method: "PATCH",
    headers: {
      apikey: supaKey,
      Authorization: `Bearer ${supaKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`${table} patch ${res.status}:`, txt);
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown").toString().split(",")[0].trim();
    if (!rateLimit(ip)) return res.status(429).json({ error: "Trop de tentatives, réessayez dans une minute." });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    if (body._honey) return res.status(200).json({ ok: true }); // bot → no-op silencieux

    const items = Array.isArray(body.items) ? body.items : [];
    const sejour = body.sejour || {};
    const client = body.client || {};

    // ── Validation coordonnées
    const prenom = clip(client.prenom, 120).trim();
    const nom = clip(client.nom, 120).trim();
    const email = clip(client.email, 200).trim();
    const telephone = clip(client.telephone, 40).trim();
    const message = clip(client.message, 1000).trim();
    if (!prenom || !nom || !email || !telephone) {
      return res.status(400).json({ error: "Coordonnées incomplètes." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Email invalide." });
    }
    if (!sejour.debut || !sejour.fin) {
      return res.status(400).json({ error: "Dates de séjour manquantes." });
    }
    if (!items.length) return res.status(400).json({ error: "Panier vide." });

    // ── Config
    const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!MOLLIE_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      console.error("checkout: vars d'env manquantes (MOLLIE_API_KEY / SUPABASE_URL / SERVICE_ROLE)");
      return res.status(500).json({ error: "Configuration serveur incomplète." });
    }

    const baseUrl = baseUrlFrom(req);

    // ── Recalcul AUTORITAIRE du prix
    const tarifs = await loadTarifs(baseUrl);
    const quote = computeQuote({ items, sejour, tarifs });
    if (quote.errors.length) return res.status(400).json({ error: quote.errors[0] });
    if (!quote.lines.length || quote.total_cents <= 0) {
      return res.status(400).json({ error: "Panier invalide." });
    }

    // ── Création de la commande
    const commandeId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const customerName = `${prenom} ${nom}`.trim();
    const recap = quote.lines.map((l) => `${l.qty}× ${l.nom}${l.gamme === "premium" ? " (premium)" : ""}${l.weekly ? ` (${l.weeks_applied} sem)` : ""}`).join(" · ");
    const description = clip(`Réservation linge — ${recap}`, 250);
    const notes = [
      `Commande web — ${customerName}`,
      `Email : ${email} · Tél : ${telephone}`,
      `Séjour : ${sejour.debut} → ${sejour.fin} (${quote.weeks} sem, ${quote.free_weeks} offerte(s))`,
      `Détail : ${recap}`,
      message ? `Message : ${message}` : "",
    ].filter(Boolean).join("\n");

    await supaInsert(SUPABASE_URL, SERVICE_ROLE, "commandes", {
      id: commandeId,
      source: "web",
      statut: "reserve",
      statut_paiement: "en_attente",
      type_prestation: prestationType(quote.lines),
      articles: quote.lines,
      prix_total: quote.total_cents / 100,
      sejour_debut: sejour.debut,
      sejour_fin: sejour.fin,
      notes,
    });

    // ── Ligne paiements (avant Mollie pour récupérer l'uuid)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const inserted = await supaInsert(SUPABASE_URL, SERVICE_ROLE, "paiements", {
      commande_id: commandeId,
      mollie_status: "open",
      amount_cents: quote.total_cents,
      currency: "EUR",
      description,
      customer_email: email,
      customer_name: customerName,
      metadata: { canal: "web", telephone, sejour, recap },
      expires_at: expiresAt,
    });
    const paiementId = Array.isArray(inserted) ? inserted[0].id : inserted.id;

    // ── Création paiement Mollie
    const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${MOLLIE_API_KEY}` },
      body: JSON.stringify({
        amount: { currency: "EUR", value: (quote.total_cents / 100).toFixed(2) },
        description,
        redirectUrl: `${baseUrl}/paiement-confirme?id=${encodeURIComponent(paiementId)}`,
        webhookUrl: `${SUPABASE_URL}/functions/v1/mollie-webhook`,
        metadata: { paiement_id: paiementId, commande_id: commandeId },
      }),
    });
    if (!mollieRes.ok) {
      const txt = await mollieRes.text();
      console.error("Mollie create failed:", mollieRes.status, txt);
      // Rollback : on supprime la ligne paiement orpheline et on annule la commande
      await supaPatch(SUPABASE_URL, SERVICE_ROLE, "paiements", { id: paiementId }, { mollie_status: "failed" });
      await supaPatch(SUPABASE_URL, SERVICE_ROLE, "commandes", { id: commandeId }, { statut: "annule", statut_paiement: "expire" });
      return res.status(502).json({ error: "Le service de paiement est momentanément indisponible." });
    }
    const payment = await mollieRes.json();
    const checkoutUrl = payment._links?.checkout?.href;
    if (!payment.id || !checkoutUrl) {
      console.error("Mollie response incomplete:", payment);
      return res.status(502).json({ error: "Réponse de paiement incomplète." });
    }

    await supaPatch(SUPABASE_URL, SERVICE_ROLE, "paiements", { id: paiementId }, {
      mollie_payment_id: payment.id,
      checkout_url: checkoutUrl,
    });

    return res.status(200).json({
      ok: true,
      paiement_id: paiementId,
      checkout_url: checkoutUrl,
      total: fmtEuros(quote.total_cents),
    });
  } catch (err) {
    console.error("checkout handler error:", err);
    return res.status(500).json({ error: "Erreur serveur inattendue." });
  }
}
