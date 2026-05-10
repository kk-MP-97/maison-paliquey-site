/**
 * reservation.js — Pré-remplissage du formulaire /reservation depuis les
 * query params transmis par le simulateur tarifs.
 *
 * Params lus :
 *   ?panier=id1:qty,id2:qty&total=XX.XX&gamme=confort|premium|luxe
 *   &duree_semaines=N
 *   ?type=professionnel&activite=...&volumes_hebdo=...&estim_hebdo=...&estim_mensuel=...
 *
 * Comportement :
 *   - Affiche un bandeau d'info "Voici votre estimation"
 *   - Pré-remplit textarea `message` avec un récap formaté
 *   - Pré-sélectionne select `type_client` si type=professionnel
 *   - Pré-sélectionne select `service` selon contenu panier
 */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  if (params.toString().length === 0) return; // pas de prefill

  // ─── Helpers ──────────────────────────────────────────────
  function fmtEUR(n) {
    var v = Number(n);
    if (isNaN(v)) return n + ' €';
    return v.toFixed(2).replace('.', ',') + ' €';
  }

  function parsePanier(str) {
    if (!str) return [];
    return str.split(',').map(function (entry) {
      var parts = entry.split(':');
      return { id: parts[0], qty: parseFloat(parts[1]) || 0 };
    }).filter(function (e) { return e.id && e.qty > 0; });
  }

  // ─── Récupération des données ─────────────────────────────
  var panier = parsePanier(params.get('panier'));
  var total = params.get('total');
  var gamme = params.get('gamme');
  var dureeSem = parseInt(params.get('duree_semaines'), 10);
  var typeClient = params.get('type');
  var activite = params.get('activite');
  var volumesHebdoRaw = params.get('volumes_hebdo');
  var estimHebdo = params.get('estim_hebdo');
  var estimMensuel = params.get('estim_mensuel');
  var volumesHebdo = parsePanier(volumesHebdoRaw);

  var isB2B = typeClient === 'professionnel' || volumesHebdo.length > 0;
  var hasPanier = panier.length > 0 || volumesHebdo.length > 0;

  if (!hasPanier && !typeClient && !gamme) return;

  // ─── Chargement de tarifs.json pour traduire les IDs ──────
  fetch('assets/data/tarifs.json?v=1.0.16', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      var map = data
        ? Object.fromEntries(data.tarifs.map(function (t) { return [t.id, t]; }))
        : {};

      // Construire le texte de pré-remplissage
      var lignes = [];
      var serviceDetected = null;

      if (isB2B && volumesHebdo.length > 0) {
        lignes.push('▌ DEMANDE PROFESSIONNELLE');
        if (activite) lignes.push('Activité : ' + activite);
        lignes.push('');
        lignes.push('Volumes hebdomadaires habituels :');
        volumesHebdo.forEach(function (e) {
          var t = map[e.id];
          var nom = t ? t.nom : e.id;
          var unit = t && t.unite === 'kg' ? ' kg' : '';
          lignes.push('  • ' + e.qty + (unit || ' ×') + '  ' + nom);
          if (t) {
            if (t.categorie === 'kit' || t.categorie === 'location') serviceDetected = 'location';
            else if (t.categorie === 'pressing_vetement' && !serviceDetected) serviceDetected = 'pressing';
            else if (!serviceDetected) serviceDetected = 'blanchisserie';
          }
        });
        if (estimHebdo) lignes.push('');
        if (estimHebdo) lignes.push('Estimation au tarif public : ' + fmtEUR(estimHebdo) + ' / semaine');
        if (estimMensuel) lignes.push('  ≈ ' + fmtEUR(estimMensuel) + ' / mois (× 4,33)');
        lignes.push('');
        lignes.push('→ Merci de me proposer une grille préférentielle adaptée à mon volume.');
      } else if (hasPanier) {
        lignes.push('▌ MA SIMULATION');
        if (gamme && (gamme === 'confort' || gamme === 'premium' || gamme === 'luxe')) {
          var gammeLabel = { confort: 'Confort', premium: 'Premium', luxe: 'Luxe' }[gamme];
          lignes.push('Gamme location : ' + gammeLabel + (gamme === 'luxe' ? ' (sur devis personnalisé)' : ''));
        }
        if (dureeSem && dureeSem > 0) {
          var off = Math.floor(dureeSem / 4);
          var dureeLine = 'Durée : ' + dureeSem + ' semaine' + (dureeSem > 1 ? 's' : '');
          if (off > 0) {
            dureeLine += '  (★ ' + off + ' semaine' + (off > 1 ? 's' : '') + ' offerte' + (off > 1 ? 's' : '') + ' — location au mois)';
          }
          lignes.push(dureeLine);
        }
        lignes.push('');
        lignes.push('Articles :');
        panier.forEach(function (e) {
          var t = map[e.id];
          var nom = t ? t.nom : e.id;
          var unit = t && t.unite === 'kg' ? ' kg' : '';
          lignes.push('  • ' + e.qty + (unit || ' ×') + '  ' + nom);
          if (t) {
            if (t.categorie === 'kit' || t.categorie === 'location') serviceDetected = 'location';
            else if (t.categorie === 'pressing_vetement' && !serviceDetected) serviceDetected = 'pressing';
            else if (!serviceDetected) serviceDetected = 'blanchisserie';
          }
        });
        if (total && total !== 'devis') {
          lignes.push('');
          lignes.push('Total estimé : ' + fmtEUR(total));
        } else if (total === 'devis') {
          lignes.push('');
          lignes.push('Total : sur devis personnalisé (gamme Luxe)');
        }
      }

      // Détection multi-services
      var hasLocation = panier.concat(volumesHebdo).some(function (e) {
        var t = map[e.id]; return t && (t.categorie === 'kit' || t.categorie === 'location');
      });
      var hasPressing = panier.concat(volumesHebdo).some(function (e) {
        var t = map[e.id]; return t && t.categorie === 'pressing_vetement';
      });
      var hasBlanchisserie = panier.concat(volumesHebdo).some(function (e) {
        var t = map[e.id];
        return t && (t.categorie === 'forfait' || t.categorie === 'blanchisserie_linge_maison');
      });
      var multiCount = (hasLocation ? 1 : 0) + (hasPressing ? 1 : 0) + (hasBlanchisserie ? 1 : 0);
      if (multiCount > 1) serviceDetected = 'multiple';

      // ─── Application au formulaire ────────────────────────
      var form = document.querySelector('form[data-endpoint]');
      if (!form) return;

      // Type client
      var selType = form.querySelector('select[name="type_client"]');
      if (selType && isB2B) {
        selType.value = 'professionnel';
        selType.dispatchEvent(new Event('change'));
      }

      // Service souhaité
      var selService = form.querySelector('select[name="service"]');
      if (selService && serviceDetected) {
        selService.value = serviceDetected;
      }

      // Textarea message
      var ta = form.querySelector('textarea[name="message"]');
      if (ta && lignes.length > 0) {
        ta.value = lignes.join('\n') + '\n\n— Précisez votre période souhaitée et toute contrainte particulière —';
        ta.style.minHeight = '280px';
      }

      // ─── Bandeau d'info au-dessus du formulaire ───────────
      var section = form.parentNode;
      if (section) {
        var banner = document.createElement('div');
        banner.className = 'mp-banner mp-banner--accent';
        banner.style.marginBottom = '1.5rem';
        var moisCount = dureeSem ? Math.floor(dureeSem / 4) : 0;
        var totalDisplay = total === 'devis'
          ? 'sur devis personnalisé'
          : (total ? fmtEUR(total) + (isB2B ? ' / sem' : '') : '');
        banner.innerHTML =
          '<svg class="mp-icon mp-icon--xl"><use href="#mp-document"/></svg>' +
          '<div>' +
            '<strong>Votre simulation a été pré-remplie ci-dessous.</strong><br>' +
            '<span>' +
              (isB2B ? 'Demande professionnelle' : 'Demande particulier') +
              (gamme ? ' · gamme ' + gamme : '') +
              (dureeSem && dureeSem > 1 ? ' · ' + dureeSem + ' sem' + (moisCount > 0 ? ' (' + moisCount + ' mois entamé' + (moisCount > 1 ? 's' : '') + ')' : '') : '') +
              (totalDisplay ? ' · ' + totalDisplay : '') +
              '. Vérifiez et complétez votre demande.' +
            '</span>' +
          '</div>';
        section.insertBefore(banner, form);

        // Inline du sprite SVG depuis tarifs.html (si disponible) — sinon fallback emoji
        // (ici, le sprite n'est pas dans reservation.html donc on injecte une icône simple)
        if (!document.getElementById('mp-document')) {
          var svgInline = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svgInline.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
          svgInline.setAttribute('aria-hidden', 'true');
          svgInline.innerHTML =
            '<defs>' +
              '<symbol id="mp-document" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
                '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/>' +
                '<path d="M14 3v5h5"/>' +
                '<line x1="8" y1="13" x2="16" y2="13"/>' +
                '<line x1="8" y1="16" x2="16" y2="16"/>' +
                '<line x1="8" y1="19" x2="13" y2="19"/>' +
              '</symbol>' +
            '</defs>';
          document.body.insertBefore(svgInline, document.body.firstChild);
        }
      }
    })
    .catch(function (err) {
      console.warn('[reservation] Pré-remplissage tarifs indisponible:', err);
    });
})();
