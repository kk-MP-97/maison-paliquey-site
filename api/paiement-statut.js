/**
 * Maison Paliquey — API route Vercel
 * GET /api/paiement-statut?id=<paiement_uuid>
 * =====================================================================
 * Lecture seule du statut d'un paiement, pour la page /paiement-confirme.
 * Ne déclenche aucune action : la vérité Mollie est gérée par l'edge
 * function `mollie-webhook`. On lit simplement la ligne `paiements`.
 *
 * Variables d'environnement :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Renvoie : { status, amount_cents } où status ∈ mollie_status
 *   (open|pending|authorized|paid|failed|canceled|expired|refunded)
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  const id = (req.query && req.query.id) ? String(req.query.id) : "";
  if (!/^[0-9a-fA-F-]{8,40}$/.test(id)) {
    return res.status(400).json({ error: "Référence invalide" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return res.status(500).json({ error: "Configuration serveur incomplète" });
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/paiements?id=eq.${encodeURIComponent(id)}&select=mollie_status,amount_cents`;
    const r = await fetch(url, {
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    if (!r.ok) {
      console.error("paiement-statut lookup failed:", r.status, await r.text());
      return res.status(502).json({ error: "Lecture impossible" });
    }
    const rows = await r.json();
    if (!rows.length) return res.status(404).json({ error: "Paiement introuvable" });
    return res.status(200).json({
      status: rows[0].mollie_status,
      amount_cents: rows[0].amount_cents,
    });
  } catch (e) {
    console.error("paiement-statut error:", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
