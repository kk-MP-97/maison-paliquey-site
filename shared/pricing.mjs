/**
 * Maison Paliquey — Moteur de prix partagé (isomorphe navigateur + serveur)
 * =====================================================================
 * UNE seule source de vérité, importée à la fois par :
 *   - le configurateur front  (assets/js/commander.js)
 *   - la route serveur         (api/checkout.js, api/paiement-statut.js)
 * → le prix affiché et le prix débité ne peuvent jamais diverger.
 *
 * Fonctions pures : aucune dépendance Node/DOM. Les tarifs sont injectés.
 *
 * RÈGLES (cadrage Karl 2026-06-01) :
 *   - Location à la semaine (kits "semaine" + catégorie "location") :
 *       prix = prix_unitaire × quantité × semaines_facturées
 *       1 SEMAINE OFFERTE TOUTES LES 4 → semaines_facturées = n − floor(n/4)
 *       (4 prises = 3 payées, 8 = 6, etc.)
 *   - Kits "weekend" : forfait 3 jours fixe (pas de multiplication semaine).
 *   - Forfaits / blanchisserie / pressing : prestation one-off (× quantité).
 *   - Gamme "premium" : applique prix_premium quand il existe, sinon prix_ttc.
 * =====================================================================
 */

// Catégories facturées à la semaine (séjour) et éligibles à la semaine offerte.
const WEEKLY_CATEGORIES = ["kit", "location"];

/** Nombre de nuits entre deux dates ISO (YYYY-MM-DD). */
export function nightsBetween(debut, fin) {
  if (!debut || !fin) return 0;
  const d1 = new Date(debut + "T00:00:00Z");
  const d2 = new Date(fin + "T00:00:00Z");
  if (isNaN(d1) || isNaN(d2)) return 0;
  const ms = d2 - d1;
  if (ms <= 0) return 0;
  return Math.round(ms / 86400000);
}

/** Nombre de semaines d'un séjour (arrondi au supérieur, minimum 1). */
export function weeksFromNights(nights) {
  if (!nights || nights <= 0) return 1;
  return Math.max(1, Math.ceil(nights / 7));
}

/** Semaines facturées : 1 offerte toutes les 4 (n − floor(n/4)). */
export function billableWeeks(weeks) {
  const n = Math.max(1, Math.floor(weeks || 1));
  return n - Math.floor(n / 4);
}

/** Convertit un prix euros (number) en centimes entiers. */
function toCents(eur) {
  return Math.round(Number(eur || 0) * 100);
}

function isWeekly(tarif) {
  if (!tarif) return false;
  if (tarif.categorie === "kit") return tarif.duree === "semaine";
  return WEEKLY_CATEGORIES.includes(tarif.categorie); // "location" = semaine
}

function unitCents(tarif, gamme) {
  if (gamme === "premium" && tarif.prix_premium != null) {
    return toCents(tarif.prix_premium);
  }
  return toCents(tarif.prix_ttc);
}

/**
 * Calcule le devis complet.
 * @param {Object} opts
 * @param {Array<{id:string, qty:number, gamme?:string}>} opts.items
 * @param {{debut?:string, fin?:string}} [opts.sejour]
 * @param {Array<Object>} opts.tarifs  liste brute tarifs.json (clé .tarifs)
 * @returns {{lines:Array, total_cents:number, subtotal_full_cents:number,
 *            savings_cents:number, weeks:number, billable_weeks:number,
 *            free_weeks:number, errors:Array<string>}}
 */
export function computeQuote({ items = [], sejour = {}, tarifs = [] }) {
  const byId = Object.fromEntries(tarifs.map((t) => [t.id, t]));
  const nights = nightsBetween(sejour.debut, sejour.fin);
  const weeks = weeksFromNights(nights);
  const billable = billableWeeks(weeks);
  const freeWeeks = weeks - billable;

  const lines = [];
  const errors = [];
  let total = 0;
  let totalFull = 0;

  for (const it of items) {
    const qty = Math.max(0, Math.floor(Number(it.qty) || 0));
    if (qty <= 0) continue;
    const tarif = byId[it.id];
    if (!tarif) {
      errors.push(`Article inconnu : ${it.id}`);
      continue;
    }
    const gamme = it.gamme === "premium" ? "premium" : "standard";
    const u = unitCents(tarif, gamme);
    const weekly = isWeekly(tarif);
    const mult = weekly ? billable : 1;
    const multFull = weekly ? weeks : 1;
    const lineCents = u * qty * mult;
    const lineFull = u * qty * multFull;
    total += lineCents;
    totalFull += lineFull;
    lines.push({
      id: tarif.id,
      nom: tarif.nom,
      categorie: tarif.categorie,
      gamme,
      qty,
      unit_cents: u,
      weekly,
      weeks_applied: mult,
      line_cents: lineCents,
    });
  }

  return {
    lines,
    total_cents: total,
    subtotal_full_cents: totalFull,
    savings_cents: Math.max(0, totalFull - total),
    weeks,
    billable_weeks: billable,
    free_weeks: freeWeeks,
    nights,
    errors,
  };
}

/** Décide le type_prestation de la commande à partir du panier. */
export function prestationType(lines) {
  const cats = new Set(lines.map((l) => l.categorie));
  if (cats.has("kit") || cats.has("location")) return "location";
  if (cats.has("pressing_vetement")) return "pressing";
  return "lavage";
}
