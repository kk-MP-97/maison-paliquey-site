#!/usr/bin/env node
/**
 * generate-tarifs-html.mjs
 * ───────────────────────────────────────────────────────────
 * Régénère 3 sections de site-vitrine/tarifs.html depuis tarifs.json :
 *   • Cards Forfaits (entre <!-- TARIFS:FORFAITS:START/END -->)
 *   • Cards Kits     (entre <!-- TARIFS:KITS:START/END -->)
 *   • Accordéon À la pièce (entre <!-- TARIFS:PIECE:START/END -->)
 *
 * Source : assets/data/tarifs.json (lui-même généré par generate-tarifs-json.mjs)
 *
 * Usage :
 *   node scripts/generate-tarifs-html.mjs
 *   npm run tarifs:sync   (lance JSON puis HTML en chaîne)
 *
 * Le script préserve tout le reste de tarifs.html. Si un marqueur manque,
 * il échoue avec un message clair.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const ROOT       = resolve(__dirname, '..');
const HTML_PATH  = resolve(ROOT, 'tarifs.html');
const JSON_PATH  = resolve(ROOT, 'assets/data/tarifs.json');

const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
const map  = Object.fromEntries(data.tarifs.map((t) => [t.id, t]));

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────
const fmtEUR = (n) => {
  // 4.7 → "4,70 €" ; 5 → "5 €" (sans décimales si entier)
  const v = Number(n);
  if (Number.isInteger(v)) return v + ' €';
  return v.toFixed(2).replace('.', ',') + ' €';
};
const uniteSuffix = (unite) => {
  if (unite === 'kg') return ' / kg';
  if (unite === 'm2') return ' / m²';
  if (unite === 'semaine') return ' / sem.';
  return '';
};
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]),
  );
const SEUIL_ECO = 2.0;

// ─────────────────────────────────────────────────────────────────────
// Bloc FORFAITS
// ─────────────────────────────────────────────────────────────────────
function renderForfaits() {
  const forfaits = data.tarifs
    .filter((t) => t.categorie === 'forfait')
    .sort((a, b) => a.ordre - b.ordre);

  return forfaits
    .map((t) => {
      const featured = t.featured;
      const cardClass = 'forfait-card reveal' + (featured ? ' ' + featured.cardClass : '');
      const badge = featured && featured.badge
        ? `          <span class="forfait-badge">${escapeHtml(featured.badge)}</span>\n`
        : '';

      // Sous-titre du H3 (extrait depuis le nom : "Forfait Lit 90 coton blanchi 1 taie")
      // On hardcode un mapping minimal pour rester lisible
      const subtitleMap = {
        forfait_lit_90_coton_blanchi_1_taie:        '— 1 personne · blanchi',
        forfait_lit_90_lin_blanchi_1_taie:          '— 1 personne · drap plat en lin',
        forfait_lit_140_180_coton_blanchi_2_taies:  '— 2 personnes · blanchi',
        forfait_lit_140_180_lin_blanchi_2_taies:    '— 2 personnes · drap plat en lin',
        machine_4_5_kg_lavee_sechee:                '— lavée + séchée',
        lavage_au_kilo_tout_venant:                 '— tout-venant',
      };
      // Titre simplifié (on retire le qualificatif)
      const titleMap = {
        forfait_lit_90_coton_blanchi_1_taie:        'Forfait Lit 90 coton',
        forfait_lit_90_lin_blanchi_1_taie:          'Forfait Lit 90 lin',
        forfait_lit_140_180_coton_blanchi_2_taies:  'Forfait Lit 140-180 coton',
        forfait_lit_140_180_lin_blanchi_2_taies:    'Forfait Lit 140-180 lin',
        machine_4_5_kg_lavee_sechee:                'Machine 4/5 kg',
        lavage_au_kilo_tout_venant:                 'Lavage au kilo',
      };
      const title = titleMap[t.id] || t.nom;
      const subtitle = subtitleMap[t.id] || '';

      // Note + composition
      const note = t.composition && t.composition.note
        ? `<p class="forfait-note">${escapeHtml(t.composition.note)}.</p>\n          `
        : '';

      // Composition affichée
      let compoHtml = '';
      if (t.composition && t.composition.items && t.composition.items.length > 0) {
        const lis = t.composition.items.map((it) => {
          const qtyStr = it.qty === 1 || (it.qty + '').endsWith('1')
            ? `×${it.qty}`
            : `×${it.qty}`;
          return `            <li>${escapeHtml(it.label)} <span class="qty">${qtyStr}</span></li>`;
        }).join('\n');
        compoHtml = `<ul class="forfait-compo">\n${lis}\n          </ul>\n          `;
      } else if (t.id === 'machine_4_5_kg_lavee_sechee') {
        // Cas spécial : pas de compo article mais des bénéfices à mettre en avant
        compoHtml = `<ul class="forfait-compo">\n            <li>Tout-venant jusqu'à 5 kg <span class="qty">~1 sac</span></li>\n            <li>Lavage écologique <span class="qty">✓</span></li>\n            <li>Séchage <span class="qty">✓</span></li>\n          </ul>\n          `;
      } else if (t.id === 'lavage_au_kilo_tout_venant') {
        compoHtml = `<ul class="forfait-compo">\n            <li>Lavage écologique <span class="qty">✓</span></li>\n            <li>Séchage <span class="qty">✓</span></li>\n            <li>Pliage soigné <span class="qty">✓</span></li>\n          </ul>\n          `;
      }

      // Bandeau économie / neutre
      let econoHtml = '';
      if (t.composition && t.composition.items && t.composition.items.length > 0) {
        const coutPiece = t.composition.items.reduce((s, it) => {
          const it2 = map[it.id];
          return s + (it2 ? it2.prix_ttc * it.qty : 0);
        }, 0);
        const eco = coutPiece - t.prix_ttc;
        if (eco >= SEUIL_ECO) {
          econoHtml = `<div class="forfait-econo">\n            À la pièce : <strong>${fmtEUR(coutPiece)}</strong> · <strong>Économie ${fmtEUR(eco)}</strong>\n          </div>\n          `;
        } else {
          // Variante neutre selon le matériau
          const neutralLabel = t.id.includes('lin')
            ? 'Tarif tout-inclus · qualité lin'
            : 'Tarif tout-inclus blanchi';
          econoHtml = `<div class="forfait-econo forfait-econo--neutral">\n            ${neutralLabel}\n          </div>\n          `;
        }
      }
      // Pour Machine et Lavage au kilo : pas de bandeau économie
      if (!t.composition || (t.composition && t.composition.items.length === 0 && t.id.startsWith('forfait'))) {
        econoHtml = '';
      }

      // Prix (avec unité spéciale pour kilo)
      let prixHtml;
      if (t.unite === 'kg') {
        prixHtml = `<div class="forfait-prix">\n            <span class="label">Au kilo</span>\n            <div><span class="montant">${fmtEUR(t.prix_ttc)}</span> <span class="unite">/ kg</span></div>\n          </div>`;
      } else {
        prixHtml = `<div class="forfait-prix">\n            <span class="label">Forfait</span>\n            <div><span class="montant">${fmtEUR(t.prix_ttc)}</span></div>\n          </div>`;
      }

      return `        <article class="${cardClass}">
${badge}          <h3>${escapeHtml(title)}<br><span style="font-size: 0.85rem; color: var(--mp-gray); font-family: var(--font-body); font-weight: 400;">${escapeHtml(subtitle)}</span></h3>
          ${note}${compoHtml}${econoHtml}${prixHtml}
        </article>`;
    })
    .join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────
// Bloc KITS
// ─────────────────────────────────────────────────────────────────────
function renderKits() {
  // Exclusion 2026-05-17 : on n'affiche PAS encore en cards les nouveaux kits weekend
  // (kit_lit_1p_we, kit_lit_2p_we, kit_bain_we). Le kit_weekend_2p existant reste rendu
  // avec son nouveau prix 39€ et sa composition redressée. V2 prévue pour les autres.
  const kits = data.tarifs
    .filter((t) => t.categorie === 'kit' && !t.id.endsWith('_we'))
    .sort((a, b) => a.ordre - b.ordre);

  // Ordre commercial : Lit 1pl, Lit 2pl, Bain, Villa 4p, Weekend 2p
  // Le sort par ordre (10,11,12,13,14) donne déjà ce résultat

  return kits
    .map((t) => {
      const featured = t.featured;
      const cardClass = 'kit-card reveal' + (featured && featured.cardClass ? ' ' + featured.cardClass : '');
      const tagline = featured && featured.taglineOverride ? featured.taglineOverride : (t.composition && t.composition.note) || '';

      // Composition formatée (les compos kits sont déjà textuelles)
      let compoLis = '';
      if (t.composition && t.composition.items) {
        compoLis = t.composition.items.map((it) => {
          return `              <li>${escapeHtml(it.label)} <span class="qty">×${it.qty}</span></li>`;
        }).join('\n');
      }

      const confort = fmtEUR(t.prix_ttc);
      const premium = t.prix_premium ? fmtEUR(t.prix_premium) : null;
      // Unité d'affichage : weekend (3 jours forfaitaires) ou semaine.
      // Avant 2026-05-23 : "/ sem." hardcodé pour tous les kits → faux pour
      // Kit Weekend 2 personnes (39 € sur 3 jours, pas sur la semaine).
      const uniteSuffix = t.duree === 'weekend' ? '/ week-end' : '/ sem.';

      return `        <article class="${cardClass}">
          <header class="kit-header">
            <h3>${escapeHtml(t.nom)}</h3>
            <div class="kit-tagline">${escapeHtml(tagline)}</div>
          </header>
          <div class="kit-compo">
            <h4>Composition</h4>
            <ul>
${compoLis}
            </ul>
          </div>
          <div class="kit-gammes">
            <div class="kit-gamme"><span class="label">Confort</span><div class="prix">${confort}<span class="unite">${uniteSuffix}</span></div></div>
            <div class="kit-gamme"><span class="label">Premium</span><div class="prix">${premium || 'Sur devis'}<span class="unite">${uniteSuffix}</span></div></div>
            <div class="kit-gamme kit-gamme--devis"><span class="label">Luxe</span><div class="prix">Sur devis</div></div>
          </div>
        </article>`;
    })
    .join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────
// Bloc PIECE (accordéon À la pièce)
// ─────────────────────────────────────────────────────────────────────
function renderAccordion() {
  // Définition des 6 sous-catégories à afficher avec leur titre + sous-titre
  const sections = [
    {
      id: 'piece-blanchisserie-literie',
      title: 'Blanchisserie · Literie',
      subtitle: 'Draps, housses, couettes, oreillers, alèses',
      filter: (t) => t.categorie === 'blanchisserie_linge_maison' && t.sous_categorie === 'literie',
    },
    {
      id: 'piece-blanchisserie-bain',
      title: 'Blanchisserie · Bain',
      subtitle: 'Serviettes, draps de bain, peignoirs, foutta',
      filter: (t) => t.categorie === 'blanchisserie_linge_maison' && t.sous_categorie === 'bain',
    },
    {
      id: 'piece-blanchisserie-table',
      title: 'Blanchisserie · Table',
      subtitle: 'Nappes, serviettes de table, torchons',
      filter: (t) => t.categorie === 'blanchisserie_linge_maison' && t.sous_categorie === 'table',
    },
    {
      id: 'piece-blanchisserie-rideaux',
      title: 'Rideaux, voilages & tapis',
      subtitle: 'Tarification au m²',
      filter: (t) => t.categorie === 'blanchisserie_linge_maison' && t.sous_categorie === 'rideaux',
    },
    {
      id: 'piece-pressing',
      title: 'Pressing · Vêtements',
      subtitle: 'Chemise, pantalon, costume, manteau, robe',
      filter: (t) => t.categorie === 'pressing_vetement',
    },
    {
      id: 'piece-location',
      title: 'Location à la pièce',
      subtitle: 'Pour compléter un kit ou louer ponctuellement · prix gamme Confort',
      // Exclusion 2026-05-17 : les locations weekend sont en DB mais pas exposées
      // dans l'accordion à la pièce (faible valeur commerciale unitaire).
      filter: (t) => t.categorie === 'location' && !t.id.endsWith('_we'),
    },
  ];

  // Fusion d'affichage 2026-05-23 : le public ne distingue pas drap de bain
  // et drap de douche. On garde la séparation côté seedTarifs / Supabase (utile
  // ops & caisse) mais on n'expose qu'une seule entrée « Drap de bain » au prix
  // le plus élevé des deux. La règle vaut uniquement pour la grille publique.
  function fusionnerDrapsBainDouche(items) {
    const bain   = items.find((t) => t.id === 'drap_de_bain');
    const douche = items.find((t) => t.id === 'drap_de_douche');
    if (!bain || !douche) return items; // pas de fusion possible → on laisse en l'état
    const prixMax = Math.max(Number(bain.prix_ttc) || 0, Number(douche.prix_ttc) || 0);
    const fusionne = { ...bain, prix_ttc: prixMax };
    return items
      .filter((t) => t.id !== 'drap_de_douche')
      .map((t) => (t.id === 'drap_de_bain' ? fusionne : t));
  }

  return sections.map((section) => {
    let items = data.tarifs
      .filter(section.filter)
      .sort((a, b) => a.ordre - b.ordre);

    if (section.id === 'piece-blanchisserie-bain') {
      items = fusionnerDrapsBainDouche(items);
    }

    const lis = items.map((t) => {
      const unitSpan = t.unite === 'm2' || t.unite === 'kg' || t.unite === 'semaine'
        ? ` <span class="unite">${uniteSuffix(t.unite).trim()}</span>`
        : '';
      // Le prix est en gros + unité éventuelle dans un sous-span
      let prixContent;
      if (t.unite === 'm2') {
        prixContent = `${fmtEUR(t.prix_ttc)} <span class="unite">/ m²</span>`;
      } else if (t.unite === 'kg') {
        prixContent = `${fmtEUR(t.prix_ttc)} <span class="unite">/ kg</span>`;
      } else if (t.unite === 'semaine') {
        prixContent = `${fmtEUR(t.prix_ttc)} <span class="unite">/ sem.</span>`;
      } else {
        prixContent = fmtEUR(t.prix_ttc);
      }
      // Pour les rideaux et location, le nom n'a pas le suffixe (m²) car déjà dans l'unité
      let nom = t.nom;
      if (t.categorie === 'blanchisserie_linge_maison' && t.sous_categorie === 'rideaux') {
        // Retirer " (m²)" du nom car l'unité est affichée à part
        nom = nom.replace(/\s*\(m²\)$/, '');
      }
      return `            <li><span class="nom">${escapeHtml(nom)}</span><span class="prix">${prixContent}</span></li>`;
    }).join('\n');

    return `        <details class="piece-cat" id="${section.id}">
          <summary>
            <span class="piece-cat-title">
              <strong>${escapeHtml(section.title)}</strong>
              <span>${escapeHtml(section.subtitle)}</span>
            </span>
          </summary>
          <ul class="piece-list">
${lis}
          </ul>
        </details>`;
  }).join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────
// Patching de tarifs.html
// ─────────────────────────────────────────────────────────────────────
function patchSection(html, marker, content) {
  const start = `<!-- TARIFS:${marker}:START -->`;
  const end   = `<!-- TARIFS:${marker}:END -->`;
  const startIdx = html.indexOf(start);
  const endIdx   = html.indexOf(end);
  if (startIdx < 0 || endIdx < 0) {
    throw new Error(`Marqueurs manquants pour ${marker} dans tarifs.html (${start} ou ${end})`);
  }
  if (endIdx < startIdx) {
    throw new Error(`Marqueurs ${marker} dans le mauvais ordre`);
  }
  return html.slice(0, startIdx + start.length) + '\n\n' + content + '\n\n      ' + html.slice(endIdx);
}

let html = readFileSync(HTML_PATH, 'utf8');
html = patchSection(html, 'FORFAITS', renderForfaits());
html = patchSection(html, 'KITS',     renderKits());
html = patchSection(html, 'PIECE',    renderAccordion());
writeFileSync(HTML_PATH, html, 'utf8');

const counts = {
  forfaits:  data.tarifs.filter((t) => t.categorie === 'forfait').length,
  kits:      data.tarifs.filter((t) => t.categorie === 'kit').length,
  pieces:    data.tarifs.filter((t) =>
    t.categorie === 'blanchisserie_linge_maison' ||
    t.categorie === 'pressing_vetement' ||
    t.categorie === 'location').length,
};

console.log(`✅ Régénéré tarifs.html`);
console.log(`   ${counts.forfaits} forfaits · ${counts.kits} kits · ${counts.pieces} articles à la pièce`);
