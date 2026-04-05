/**
 * Maison Paliquey — API route Vercel
 * POST /api/reservation
 *
 * Reçoit une demande de devis / contact depuis les formulaires du site
 * (reservation.html, contact.html) et envoie un email à Karl via Resend.
 *
 * Variables d'environnement requises (Vercel → Settings → Environment) :
 *   RESEND_API_KEY        → clé API Resend (commence par "re_")
 *   RESEND_FROM           → expéditeur vérifié, ex. "Maison Paliquey <contact@maisonpaliquey.fr>"
 *   RESEND_TO             → destinataire interne, ex. "contact@maisonpaliquey.fr"
 *
 * Runtime : Node.js (Vercel Serverless Function standard)
 * Dépendance : aucune (fetch natif Node 18+)
 */

const ALLOWED_FIELDS = [
  "prenom", "nom", "email", "telephone",
  "type_client", "service", "message",
  "entreprise",
];

// Anti-spam : limite basique par IP (en mémoire — reset à chaque cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;            // 5 envois max / IP / minute

function rateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW_MS };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + RATE_LIMIT_WINDOW_MS;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count <= RATE_LIMIT_MAX;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailHtml(data) {
  const rows = [
    ["Nom",              `${data.prenom || ""} ${data.nom || ""}`.trim() || "—"],
    ["Email",            data.email || "—"],
    ["Téléphone",        data.telephone || "—"],
    ["Type de client",   data.type_client === "professionnel" ? "Professionnel" : "Particulier"],
    ["Service souhaité", data.service || "—"],
  ];
  const rowsHtml = rows.map(([k, v]) =>
    `<tr><td style="padding:8px 14px; background:#F4EFE8; font-weight:500; color:#1B2A4A; border-bottom:1px solid #E5DDD3;">${k}</td><td style="padding:8px 14px; color:#1B2A4A; border-bottom:1px solid #E5DDD3;">${escapeHtml(v)}</td></tr>`
  ).join("");

  return `<!doctype html>
<html lang="fr">
<body style="margin:0; padding:24px; font-family:-apple-system,Segoe UI,Arial,sans-serif; background:#FDFAF6; color:#1B2A4A;">
  <div style="max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #E5DDD3; border-radius:16px; overflow:hidden;">
    <div style="background:#1B2A4A; color:#FDFAF6; padding:24px 28px;">
      <div style="font-family:Georgia,serif; font-size:14px; letter-spacing:0.14em; text-transform:uppercase; color:#C4A882; margin-bottom:6px;">Nouvelle demande</div>
      <h1 style="font-family:Georgia,serif; font-weight:300; font-size:26px; margin:0;">Maison Paliquey — ${data.type_client === "professionnel" ? "Demande professionnelle" : "Demande particulier"}</h1>
    </div>
    <div style="padding:28px;">
      <table style="width:100%; border-collapse:collapse; font-size:14px;">${rowsHtml}</table>
      <h2 style="font-family:Georgia,serif; font-weight:400; font-size:18px; margin:24px 0 10px; color:#1B2A4A;">Message</h2>
      <div style="padding:16px 18px; background:#F4EFE8; border-left:3px solid #C4A882; border-radius:8px; white-space:pre-wrap; font-size:14px; line-height:1.6;">${escapeHtml(data.message || "")}</div>
      <p style="margin:24px 0 0; font-size:12px; color:#6B7280;">Reçu via le site maisonpaliquey.fr — répondre directement à ${escapeHtml(data.email || "")} pour contacter ce client.</p>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  // CORS basique (utile si le front est servi sur un domaine différent)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    // Rate limit par IP
    const ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown").toString().split(",")[0].trim();
    if (!rateLimit(ip)) {
      return res.status(429).json({ error: "Trop de demandes. Merci de réessayer dans une minute." });
    }

    // Parse body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    // Honeypot anti-bot
    if (body._honey) return res.status(200).json({ ok: true }); // silencieux

    // Validation
    const data = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key]) data[key] = String(body[key]).slice(0, 2000);
    }
    if (!data.email || !data.message || !data.prenom) {
      return res.status(400).json({ error: "Champs obligatoires manquants (prénom, email, message)." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return res.status(400).json({ error: "Email invalide." });
    }

    // Config Resend
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Maison Paliquey <contact@maisonpaliquey.fr>";
    const to = process.env.RESEND_TO || "contact@maisonpaliquey.fr";
    if (!apiKey) {
      console.error("RESEND_API_KEY manquante dans l'environnement Vercel.");
      return res.status(500).json({ error: "Configuration serveur incomplète." });
    }

    // Envoi via API Resend
    const subject = `[${data.type_client === "professionnel" ? "Pro" : "Particulier"}] Demande de ${data.service || "contact"} — ${data.prenom} ${data.nom || ""}`.trim();
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject,
        html: buildEmailHtml(data),
      }),
    });

    if (!resendRes.ok) {
      const errTxt = await resendRes.text();
      console.error("Resend error:", resendRes.status, errTxt);
      return res.status(502).json({ error: "Échec de l'envoi de l'email." });
    }

    // ─── Création d'un lead dans la prospection B2B ───────────────
    // Uniquement pour les demandes "professionnel" : on insère un
    // prospect en étape "lead" via Supabase REST (service role).
    // L'échec de cette étape ne doit pas bloquer la réponse au visiteur
    // (l'email Resend, lui, a déjà été envoyé avec succès).
    if (data.type_client === "professionnel") {
      try {
        const supaUrl = process.env.SUPABASE_URL;
        const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supaUrl && supaKey) {
          const prospectId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const contactName = `${data.prenom || ""} ${data.nom || ""}`.trim() || null;
          const notesSource = [
            `Source : formulaire site (${data.service || "contact"})`,
            data.message ? `\nMessage :\n${data.message}` : "",
          ].join("");
          const prospectPayload = {
            id: prospectId,
            entreprise: data.entreprise || contactName || "(non renseigné)",
            contact: contactName,
            email: data.email || null,
            telephone: data.telephone || null,
            etape: "lead",
            priorite: "moyenne",
            notes: notesSource,
          };
          const supaRes = await fetch(`${supaUrl}/rest/v1/prospects`, {
            method: "POST",
            headers: {
              apikey: supaKey,
              Authorization: `Bearer ${supaKey}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify(prospectPayload),
          });
          if (!supaRes.ok) {
            const errTxt = await supaRes.text();
            console.error("Supabase prospects insert failed:", supaRes.status, errTxt);
          }
        } else {
          console.warn("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant — prospect non créé.");
        }
      } catch (supaErr) {
        console.error("Supabase prospect insert error:", supaErr);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("reservation handler error:", err);
    return res.status(500).json({ error: "Erreur serveur inattendue." });
  }
}
