/**
 * generate-tarifs-json.mjs — Build script du site-vitrine
 *
 * Lit la source de vérité `app-interne/src/lib/seedTarifs.js` et génère
 * `site-vitrine/assets/data/tarifs.json` consommé par le simulateur.
 *
 * Usage : node scripts/generate-tarifs-json.mjs
 *
 * Dépend du repo monorepo : `app-interne/` doit être un sibling.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_VITRINE = resolve(__dirname, '..');
const SEED_PATH    = resolve(ROOT_VITRINE, '../app-interne/src/lib/seedTarifs.js');
const OUT_PATH     = resolve(ROOT_VITRINE, 'assets/data/tarifs.json');

const seedUrl = pathToFileURL(SEED_PATH).href;
const { TARIF_CATEGORIES, SEED_TARIFS } = await import(seedUrl);

// ─────────────────────────────────────────────────────────────────────
// Compositions enrichies (forfaits + kits) — pédagogique pour le simu
// Source : libellés seedTarifs + connaissance métier Maison Paliquey
// ─────────────────────────────────────────────────────────────────────
const COMPOSITIONS = {
  // Forfaits — composition de référence pour calcul d'économie
  // Règle métier : drap-housse OU drap plat (un seul, au choix client).
  // Forfaits LIN : drap PLAT lin uniquement (pas de drap-housse).
  forfait_lit_90_coton_blanchi_1_taie: {
    items: [
      { id: 'drap_plat_drap_housse_1_pers', label: 'Drap-housse ou drap plat (1 pers)', qty: 1 },
      { id: 'housse_couette_coton_90_120',  label: 'Housse couette coton 90/120', qty: 1 },
      { id: 'taie_d_oreiller',              label: "Taie d'oreiller", qty: 1 },
    ],
    note: 'Tout en coton, traitement « blanc » (anti-taches, finition pressing)',
  },
  forfait_lit_90_lin_blanchi_1_taie: {
    items: [
      { id: 'drap_lin_metis',               label: 'Drap plat lin métis',          qty: 1 },
      { id: 'housse_couette_lin_90_120',    label: 'Housse couette lin 90/120',    qty: 1 },
      { id: 'taie_d_oreiller',              label: "Taie d'oreiller",              qty: 1 },
    ],
    note: 'Drap plat en lin métis · housse couette en lin · sans drap-housse',
  },
  forfait_lit_140_180_coton_blanchi_2_taies: {
    items: [
      { id: 'drap_housse_double',             label: 'Drap-housse ou drap plat (double)', qty: 1 },
      { id: 'housse_couette_coton_140_180',   label: 'Housse couette coton 140/180',      qty: 1 },
      { id: 'taie_d_oreiller',                label: "Taies d'oreiller",                  qty: 2 },
    ],
    note: 'Lit double · traitement « blanc » coton intégral',
  },
  forfait_lit_140_180_lin_blanchi_2_taies: {
    items: [
      { id: 'drap_lin_metis',               label: 'Drap plat lin métis',           qty: 1 },
      { id: 'housse_couette_lin_140_180',   label: 'Housse couette lin 140/180',    qty: 1 },
      { id: 'taie_d_oreiller',              label: "Taies d'oreiller",              qty: 2 },
    ],
    note: 'Lit double · drap plat lin métis · housse couette lin · sans drap-housse',
  },
  machine_4_5_kg_lavee_sechee: {
    items: [],
    note: 'Lavage + séchage tout-venant, sans repassage. Idéal vacances.',
  },
  lavage_au_kilo_tout_venant: {
    items: [],
    note: 'Tout-venant lavé+séché au kilo. Sans repassage.',
  },
  // Kits — déjà notés dans seedTarifs, on enrichit en structuré
  kit_lit_1p: {
    items: [
      { label: 'Drap-housse', qty: 1 },
      { label: 'Drap plat',   qty: 1 },
      { label: 'Housse de couette', qty: 1 },
      { label: 'Taie d\'oreiller', qty: 1 },
    ],
    note: '1 personne · linge remis en boutique, repris',
  },
  kit_lit_2p: {
    items: [
      { label: 'Drap-housse double', qty: 1 },
      { label: 'Drap plat double',   qty: 1 },
      { label: 'Housse de couette',  qty: 1 },
      { label: 'Taies d\'oreiller',  qty: 2 },
    ],
    note: 'Lit 2 personnes · linge remis en boutique, repris',
  },
  kit_bain: {
    items: [
      { label: 'Serviettes de toilette', qty: 2 },
      { label: 'Drap de bain', qty: 1 },
      { label: 'Tapis de bain', qty: 1 },
    ],
    note: 'Salle de bain complète · 1 personne',
  },
  kit_villa_4p: {
    items: [
      { label: 'Kits Lit 2 places', qty: 2 },
      { label: 'Kits Bain', qty: 4 },
    ],
    note: 'Villa famille 4 personnes · le tout-en-un séjour',
  },
  kit_weekend_2p: {
    items: [
      { label: 'Kit Lit 2 places', qty: 1 },
      { label: 'Kits Bain', qty: 2 },
    ],
    note: 'Court séjour 3 jours · 2 personnes',
  },
  // Kits Weekend (révision 2026-05-17) — exposés dans le JSON mais
  // pas encore rendus en cards sur le site (V2). Compositions enrichies
  // pour cohérence du simulateur et de la grille.
  kit_lit_1p_we: {
    items: [
      { label: 'Drap-housse', qty: 1 },
      { label: 'Drap plat',   qty: 1 },
      { label: 'Housse de couette', qty: 1 },
      { label: "Taie d'oreiller", qty: 1 },
    ],
    note: '1 personne · forfait 3 jours (vendredi-lundi)',
  },
  kit_lit_2p_we: {
    items: [
      { label: 'Drap-housse double', qty: 1 },
      { label: 'Drap plat double',   qty: 1 },
      { label: 'Housse de couette',  qty: 1 },
      { label: "Taies d'oreiller",  qty: 2 },
    ],
    note: 'Lit 2 personnes · forfait 3 jours (vendredi-lundi)',
  },
  kit_bain_we: {
    items: [
      { label: 'Serviettes de toilette', qty: 2 },
      { label: 'Drap de bain', qty: 1 },
      { label: 'Tapis de bain', qty: 1 },
    ],
    note: 'Salle de bain complète · forfait 3 jours',
  },
};

// ─────────────────────────────────────────────────────────────────────
// Prix gamme PREMIUM pour les kits & location à la pièce
// Source : tarifs.html (cards Kits & Location à la pièce, gamme Premium)
// La gamme LUXE est sur devis (pas chiffrée).
// ─────────────────────────────────────────────────────────────────────
const PRIX_PREMIUM = {
  // Kits — révision 2026-05-10 (Karl) : Lit 1pl 28,50→36 et Weekend 52→62
  // pour aligner les ratios Premium/Confort sur ~×1,63 cohérent avec Bain/Villa
  kit_lit_1p:                    36.00,
  kit_lit_2p:                    45.00,
  kit_bain:                      26.00,
  kit_villa_4p:                  155.00,
  kit_weekend_2p:                62.00,
  // Location à la pièce
  loc_drap_housse:               6.50,
  loc_drap_plat:                 6.50,
  loc_housse_couette:            9.50,
  loc_serviette_bain:            4.50,
  loc_drap_bain_xl:              6.00,
};

// ─────────────────────────────────────────────────────────────────────
// Mise en avant commerciale — badges et cards "featured" sur les cards
// Modifiable au gré des arbitrages commerciaux (best-seller, le + choisi…)
// ─────────────────────────────────────────────────────────────────────
const FEATURED = {
  // Forfait phare (badge texte + card avec bordure top sand)
  forfait_lit_140_180_coton_blanchi_2_taies: {
    cardClass: 'forfait-card--featured',
    badge: 'Le + choisi',
  },
  // Kit phare (juste card hero, pas de badge texte — la tagline le dit)
  kit_lit_2p: {
    cardClass: 'kit-card--hero',
    badge: null,
    taglineOverride: '2 personnes · le best-seller',
  },
};

// ─────────────────────────────────────────────────────────────────────
// Top 20 articles « les plus demandés » — pour brochure & accroche page
// Sélection métier (validable par Karl, modifiable)
// ─────────────────────────────────────────────────────────────────────
const TOP_20 = [
  // Literie (5)
  'drap_plat_drap_housse_1_pers',
  'drap_housse_double',
  'housse_couette_coton_140_180',
  'housse_couette_lin_140_180',
  'taie_d_oreiller',
  // Bain (5)
  'serviette_de_toilette',
  'drap_de_bain',
  'drap_de_plage_piscine_spa',
  'foutta',
  'robe_de_chambre_peignoir',
  // Table (1) — nappes & serviettes de table retirées 2026-06-01
  'torchon',
  // Pressing (5)
  'chemise_lavee_repassee',
  'pantalon',
  'pull',
  'veste_blazer',
  'costume_2_pieces',
  // Forfait phare (2)
  'machine_4_5_kg_lavee_sechee',
  'lavage_au_kilo_tout_venant',
];

// ─────────────────────────────────────────────────────────────────────
// Sous-catégories de la blanchisserie pour l'accordéon « à la pièce »
// ─────────────────────────────────────────────────────────────────────
const SUB_CATS = {
  literie:  { label: 'Literie',                ordre: 1 },
  bain:     { label: 'Bain & serviettes',      ordre: 2 },
  table:    { label: 'Torchons', ordre: 3 },
  rideaux:  { label: 'Rideaux, voilages & tapis', ordre: 4 },
};

// ─────────────────────────────────────────────────────────────────────
// Build de l'objet final
// ─────────────────────────────────────────────────────────────────────
const tarifs = SEED_TARIFS.filter((t) => t.actif).map((t) => ({
  id: t.id,
  nom: t.nom,
  categorie: t.categorie,
  sous_categorie: t.sous_categorie,
  unite: t.unite,
  prix_ttc: t.prix_ttc,                  // gamme Confort pour kits/location
  prix_premium: PRIX_PREMIUM[t.id] || null, // gamme Premium (null si non concerné)
  duree: t.duree || null,                // 'semaine' | 'weekend' | null (révision 2026-05-17)
  prix_ancien: t.prix_ancien,
  notes: t.notes,
  ordre: t.ordre,
  composition: COMPOSITIONS[t.id] || null,
  is_top: TOP_20.includes(t.id),
  featured: FEATURED[t.id] || null,
}));

const out = {
  generated_at: new Date().toISOString(),
  source: 'app-interne/src/lib/seedTarifs.js',
  categories: TARIF_CATEGORIES,
  sous_categories: SUB_CATS,
  tarifs,
  top_20: TOP_20,
};

await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');

console.log(`✅ Généré ${OUT_PATH}`);
console.log(`   ${tarifs.length} tarifs · ${Object.keys(COMPOSITIONS).length} compositions · ${TOP_20.length} top items`);
