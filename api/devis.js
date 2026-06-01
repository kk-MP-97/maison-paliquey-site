/**
 * Maison Paliquey — API route Vercel
 * POST /api/devis
 * =====================================================================
 * « Demander un devis » depuis le configurateur /commander (ou le
 * simulateur). NE déclenche PAS de paiement : crée un LEAD (prospect)
 * avec le panier composé + les dates de séjour, pour que l'équipe valide
 * puis renvoie le devis accompagné d'un lien de paiement (app-interne →
 * mollie-create-payment).
 *
 * Le prix est recalculé serveur (estimation indicative stockée dans les
 * notes du lead). Pour la gamme Luxe, le prix reste « sur devis ».
 *
 * Variables d'env : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *                   (RESEND_* optionnels — la notif interne passe par Slack)
 */

import { computeQuote, prestationType } from "../shared/pricing.mjs";

const rateLimitMap = new Map();
function rateLimit(ip) {
  const now = Date.now();
  const e = rateLimitMap.get(ip) || { count: 0, reset: now + 60_000 };
  if (now > e.reset) { e.count = 0; e.reset = now + 60_000; }
  e.count += 1; rateLimitMap.set(ip, e);
  return e.count <= 8;
}
function clip(s, n) { return String(s || "").slice(0, n); }
function fmtEuros(c) { return (c / 100).toFixed(2).replace(".", ",") + " €"; }
function baseUrlFrom(req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").toString().split(",")[0];
  const host = (req.headers["x-forwarded-host"] || req.headers.host || "www.maisonpaliquey.fr").toString();
  return `${proto}://${host}`;
}

let _tarifs = null, _at = 0;
async function loadTarifs(baseUrl) {
  if (_tarifs && Date.now() - _at < 5 * 60_000) return _tarifs;
  const res = await fetch(`${baseUrl}/assets/data/tarifs.json`, { cache: "no-cache" });
  if (!res.ok) throw new Error("tarifs.json indisponible");
  _tarifs = (await res.json()).tarifs || [];
  _at = Date.now();
  return _tarifs;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    const ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown").toString().split(",")[0].trim();
    if (!rateLimit(ip)) return res.status(429).json({ error: "Trop de demandes, réessayez dans une minute." });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    if (body._honey) return res.status(200).json({ ok: true });

    const items = Array.isArray(body.items) ? body.items : [];
    const sejour = body.sejour || {};
    const client = body.client || {};
    const luxe = body.gamme_simulee === "luxe";

    const prenom = clip(client.prenom, 120).trim();
    const nom = clip(client.nom, 120).trim();
    const email = clip(client.email, 200).trim();
    const telephone = clip(client.telephone, 40).trim();
    const message = clip(client.message, 1000).trim();
    if (!prenom || !nom || !email || !telephone) return res.status(400).json({ error: "Coordonnées incomplètes." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Email invalide." });
    if (!sejour.debut || !sejour.fin) return res.status(400).json({ error: "Dates de séjour manquantes." });
    if (!items.length) return res.status(400).json({ error: "Panier vide." });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      console.error("devis: vars d'env manquantes");
      return res.status(500).json({ error: "Configuration serveur incomplète." });
    }

    const baseUrl = baseUrlFrom(req);
    const tarifs = await loadTarifs(baseUrl);
    const quote = computeQuote({ items, sejour, tarifs });
    if (quote.errors.length) return res.status(400).json({ error: quote.errors[0] });
    if (!quote.lines.length) return res.status(400).json({ error: "Panier invalide." });

    const recapLignes = quote.lines.map((l) =>
      `  • ${l.qty}× ${l.nom}${l.gamme === "premium" ? " (premium)" : ""}` +
      `${l.weekly ? ` × ${l.weeks_applied} sem` : ""} → ${fmtEuros(l.line_cents)}`).join("\n");
    const estimation = luxe ? "sur devis (gamme Luxe)" : fmtEuros(quote.total_cents);

    const contactName = `${prenom} ${nom}`.trim();
    const prospectId = `web-devis-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    // Bloc JSON parsable par l'app-interne (validation → devis + lien paiement)
    const cartJson = JSON.stringify({
      items: quote.lines.map((l) => ({ id: l.id, qty: l.qty, gamme: l.gamme })),
      sejour, total_cents: luxe ? null : quote.total_cents,
      type_prestation: prestationType(quote.lines),
    });
    const notes = [
      `DEMANDE DE DEVIS (site web)`,
      `Séjour : ${sejour.debut} → ${sejour.fin} (${quote.weeks} sem${quote.free_weeks ? `, ${quote.free_weeks} offerte(s)` : ""})`,
      ``,
      `Panier :`,
      recapLignes,
      ``,
      `Estimation : ${estimation}`,
      message ? `\nMessage client : ${message}` : "",
      ``,
      `<!--CART:${cartJson}-->`,
    ].filter((l) => l !== undefined).join("\n");

    // ── Création du lead (prospect) ──────────────────────────────
    const prospectPayload = {
      id: prospectId,
      entreprise: "Particulier",
      contact: contactName || null,
      email: email || null,
      telephone: telephone || null,
      etape: "lead",
      priorite: "haute",
      notes,
    };
    const r = await fetch(`${SUPABASE_URL}/rest/v1/prospects`, {
      method: "POST",
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(prospectPayload),
    });
    if (!r.ok) {
      const txt = await r.text();
      console.error("devis prospects insert failed:", r.status, txt);
      return res.status(502).json({ error: "Enregistrement impossible. Réessayez ou contactez-nous." });
    }

    // Action initiale (type 'devis')
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/prospect_actions`, {
        method: "POST",
        headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          prospect_id: prospectId, type: "devis",
          notes: `Demande de devis web — ${estimation}`, auteur: "site-vitrine",
        }),
      });
    } catch (e) { console.warn("devis action insert:", e); }

    // ── Email à l'équipe (contact@) — comme l'ancien parcours « Réserver »
    //    avant Mollie. Best-effort : n'échoue pas la demande.
    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const RESEND_FROM = process.env.RESEND_FROM || "Maison Paliquey <contact@maisonpaliquey.fr>";
      const RESEND_TO = process.env.RESEND_TO || "contact@maisonpaliquey.fr";
      if (RESEND_API_KEY) {
        const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const rowsHtml = quote.lines.map((l) =>
          `<tr><td style="padding:6px 12px;border-bottom:1px solid #E5DDD3;">${esc(l.qty)}× ${esc(l.nom)}${l.gamme === "premium" ? " (premium)" : ""}${l.weekly ? ` · ${l.weeks_applied} sem` : ""}</td><td style="padding:6px 12px;border-bottom:1px solid #E5DDD3;text-align:right;">${fmtEuros(l.line_cents)}</td></tr>`
        ).join("");
        const html = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;font-family:-apple-system,Segoe UI,Arial,sans-serif;background:#FDFAF6;color:#1B2A4A;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #E5DDD3;border-radius:16px;overflow:hidden;">
    <div style="background:#1B2A4A;color:#FDFAF6;padding:22px 26px;">
      <div style="font-family:Georgia,serif;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#C4A882;">Demande de devis — site web</div>
      <h1 style="font-family:Georgia,serif;font-weight:300;font-size:24px;margin:6px 0 0;">${esc(contactName)}</h1>
    </div>
    <div style="padding:22px 26px;font-size:14px;line-height:1.6;">
      <p style="margin:0 0 6px;"><strong>Email :</strong> ${esc(email)} · <strong>Tél :</strong> ${esc(telephone)}</p>
      <p style="margin:0 0 6px;"><strong>Séjour :</strong> ${esc(sejour.debut)} → ${esc(sejour.fin)} (${quote.weeks} sem${quote.free_weeks ? `, ${quote.free_weeks} offerte(s)` : ""})</p>
      <table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:13px;">${rowsHtml}
        <tr><td style="padding:8px 12px;font-weight:600;">Estimation</td><td style="padding:8px 12px;text-align:right;font-weight:600;">${esc(estimation)}</td></tr>
      </table>
      ${message ? `<p style="margin:0 0 6px;"><strong>Message :</strong> ${esc(message)}</p>` : ""}
      <p style="margin:16px 0 0;font-size:12px;color:#6B7280;">Lead créé dans Prospection (${esc(prospectId)}). Valide-le pour envoyer le devis + lien de paiement au client.</p>
    </div>
  </div></body></html>`;
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({ from: RESEND_FROM, to: [RESEND_TO], reply_to: email, subject: `[Devis web] ${contactName} — ${estimation}`, html }),
        });
      }
    } catch (e) { console.warn("devis email équipe:", e); }

    // Notif Slack interne (best-effort)
    try {
      fetch(`${SUPABASE_URL}/functions/v1/notify_slack`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}`, apikey: SERVICE_ROLE },
        body: JSON.stringify({
          event: "nouveau_lead_b2c",
          prospect_id: prospectId,
          source: `site-vitrine · demande de devis`,
          client_nom: contactName,
          email, telephone,
          message: `Devis ${estimation} — séjour ${sejour.debut}→${sejour.fin}`,
          client_type: "particulier",
        }),
      }).catch(() => {});
    } catch (e) { /* noop */ }

    return res.status(200).json({ ok: true, prospect_id: prospectId, estimation });
  } catch (err) {
    console.error("devis handler error:", err);
    return res.status(500).json({ error: "Erreur serveur inattendue." });
  }
}
