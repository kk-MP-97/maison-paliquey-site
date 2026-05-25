/**
 * tarifs.js — Interactions de la page /tarifs
 *
 * v1.0.5 (PHASE 1) : recherche live « à la pièce » + toggle B2C/B2B + scroll padding
 * v1.0.6 (PHASE 2) : simulateur B2C fonctionnel
 *   - Tabs catégories (Forfaits, Literie, Bain, Table, Rideaux, Pressing)
 *   - Stepper +/- par article, total live
 *   - Récap panier (accordéon)
 *   - Détection forfait : suggère l'upgrade quand panier ≈ compo forfait avec éco ≥ 2 €
 *   - Actions : imprimer, email, réserver (avec panier en query string)
 */
(function () {
  "use strict";

  // ═════════════════════════════════════════════════════════
  // 0. Accessibilité — aria-hidden auto sur les icônes décoratives
  //    (.mp-icon est toujours décoratif : le sens vient du texte adjacent)
  // ═════════════════════════════════════════════════════════
  function markIconsAsHidden(root) {
    (root || document).querySelectorAll(".mp-icon").forEach(function (svg) {
      if (!svg.hasAttribute("aria-hidden")) svg.setAttribute("aria-hidden", "true");
    });
  }
  markIconsAsHidden();

  // Observer pour les SVG injectés dynamiquement par le simulateur
  if ("MutationObserver" in window) {
    var iconObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) markIconsAsHidden(node);
        });
      });
    });
    iconObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ═════════════════════════════════════════════════════════
  // 1. Recherche live dans l'accordéon "à la pièce"
  // ═════════════════════════════════════════════════════════
  var searchInput = document.getElementById("piece-search");
  var pieceAccordion = document.querySelector(".piece-accordion");

  if (searchInput && pieceAccordion) {
    var allItems = Array.prototype.slice.call(pieceAccordion.querySelectorAll(".piece-list li"));
    var allCats  = Array.prototype.slice.call(pieceAccordion.querySelectorAll(".piece-cat"));

    function normalize(s) {
      return (s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim();
    }

    function applyFilter(query) {
      var q = normalize(query);
      if (q.length === 0) {
        allItems.forEach(function (li) { li.classList.remove("is-hidden"); });
        allCats.forEach(function (cat) { cat.removeAttribute("open"); });
        return;
      }
      allCats.forEach(function (cat) {
        var items = cat.querySelectorAll(".piece-list li");
        var anyVisible = false;
        items.forEach(function (li) {
          var label = normalize(li.querySelector(".nom").textContent);
          var match = label.indexOf(q) !== -1;
          li.classList.toggle("is-hidden", !match);
          if (match) anyVisible = true;
        });
        if (anyVisible) { cat.setAttribute("open", ""); } else { cat.removeAttribute("open"); }
      });
    }

    var debounceId = null;
    searchInput.addEventListener("input", function (e) {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(function () { applyFilter(e.target.value); }, 80);
    });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { searchInput.value = ""; applyFilter(""); }
    });
  }

  // ═════════════════════════════════════════════════════════
  // 2. Compensation sticky double pour les ancres
  // ═════════════════════════════════════════════════════════
  function setScrollPadding() {
    var header = document.querySelector(".site-header");
    var nav    = document.querySelector(".tarifs-quicknav");
    var h = header ? header.getBoundingClientRect().height : 0;
    var n = nav    ? nav.getBoundingClientRect().height    : 0;
    document.documentElement.style.scrollPaddingTop = Math.round(h + n + 8) + "px";
  }
  setScrollPadding();
  window.addEventListener("resize", setScrollPadding);

  // ═════════════════════════════════════════════════════════
  // 3. SIMULATEUR B2C
  // ═════════════════════════════════════════════════════════
  var simuPanel = document.getElementById("simu-panel");
  if (!simuPanel) return; // page sans simulateur, on s'arrête là

  // ─── Toggle B2C / B2B ────────────────────────────────────
  var modeButtons = document.querySelectorAll(".simu-toggle button");
  var modePanels  = document.querySelectorAll(".simu-mode");
  modeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-mode");
      modeButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      modePanels.forEach(function (p) {
        if (p.getAttribute("data-mode") === mode) p.removeAttribute("hidden");
        else p.setAttribute("hidden", "");
      });
    });
  });

  // ─── State ───────────────────────────────────────────────
  var state = {
    tarifs: null,         // tableau brut
    map: {},              // id → tarif
    catActive: "location", // Phase 1 E2 — Location par défaut
    panier: {},           // { tarifId: qty }
    gammeLocation: "confort",      // 'confort' | 'premium' | 'luxe'
    dureeSemainesLocation: 1,      // durée en semaines (kit + location à la pièce)
  };

  // Promo location longue durée : 1 semaine offerte par mois entamé.
  // Formule linéaire : billedWeeks = weeks - floor(weeks / 4)
  //   1 → 1 ; 2 → 2 ; 3 → 3 ; 4 → 3 ; 5 → 4 ; 6 → 5 ; 7 → 6 ; 8 → 6 ; 12 → 9 …
  function computeBilledWeeks(weeks) {
    var w = Math.max(1, Math.round(weeks));
    return w - Math.floor(w / 4);
  }
  function offeredWeeks(weeks) {
    return Math.max(0, Math.floor(weeks / 4));
  }

  // Helper : retourne la variante weekend d'un kit/location (si elle existe)
  function getWeekendVariant(t) {
    if (t.duree === 'weekend') return t;
    var weId = t.id + '_we';
    return state.map[weId] || null;
  }

  // Helper : true si on est en mode Weekend (durée = 0 semaine = 1 forfait WE)
  function isWeekendMode() {
    return state.dureeSemainesLocation === 0;
  }

  // Helper : prix unitaire d'un tarif selon la gamme active (location uniquement)
  function getPrix(t) {
    if (state.catActive === "location" && state.gammeLocation === "premium" && t.prix_premium) {
      return t.prix_premium;
    }
    // Note : en Luxe, on ne facture pas — affichage "sur devis", computeTotal renvoie 0
    if (state.catActive === "location" && state.gammeLocation === "luxe") {
      return 0;
    }
    return t.prix_ttc;
  }

  // ─── Helpers ─────────────────────────────────────────────
  function fmtEUR(n) {
    return n.toFixed(2).replace(".", ",") + " €";
  }
  function uniteLabel(unite) {
    if (unite === "kg") return " / kg";
    if (unite === "m2") return " / m²";
    if (unite === "semaine") return " / sem.";
    return "";
  }
  function pluralize(n, sing, plur) {
    return n <= 1 ? sing : plur;
  }

  // Sélection : pour chaque tab, on définit le filtre tarifs à afficher
  // L'ordre de priorité dans le tri est : kit > location pour la catégorie 'location'
  var TAB_FILTERS = {
    forfait:  function (t) { return t.categorie === "forfait"; },
    location: function (t) { return t.categorie === "kit" || t.categorie === "location"; },
    literie:  function (t) { return t.categorie === "blanchisserie_linge_maison" && t.sous_categorie === "literie"; },
    bain:     function (t) { return t.categorie === "blanchisserie_linge_maison" && t.sous_categorie === "bain"; },
    table:    function (t) { return t.categorie === "blanchisserie_linge_maison" && t.sous_categorie === "table"; },
    rideaux:  function (t) { return t.categorie === "blanchisserie_linge_maison" && t.sous_categorie === "rideaux"; },
    pressing: function (t) { return t.categorie === "pressing_vetement"; },
  };

  // Pour les onglets qui mêlent plusieurs catégories, on a besoin d'un tri custom
  // (ici : kits AVANT location à la pièce, plus pédagogique commercialement)
  var CAT_ORDER_FOR_LOCATION = { kit: 1, location: 2 };
  function sortItemsForTab(catActive, items) {
    if (catActive === "location") {
      return items.slice().sort(function (a, b) {
        var oa = CAT_ORDER_FOR_LOCATION[a.categorie] || 99;
        var ob = CAT_ORDER_FOR_LOCATION[b.categorie] || 99;
        if (oa !== ob) return oa - ob;
        return a.ordre - b.ordre;
      });
    }
    return items;
  }

  // ─── Chargement des données ──────────────────────────────
  function loadTarifs() {
    return fetch("assets/data/tarifs.json?v=1.0.16", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        state.tarifs = data.tarifs.sort(function (a, b) { return a.ordre - b.ordre; });
        state.map = Object.fromEntries(state.tarifs.map(function (t) { return [t.id, t]; }));
        renderPanel();
        // Le panneau B2B est aussi rendu (caché jusqu'au toggle)
        if (typeof renderPanelPro === "function") renderPanelPro();
      })
      .catch(function (err) {
        simuPanel.innerHTML =
          '<p class="simu-empty">Impossible de charger les tarifs. Merci de recharger la page ou de nous contacter.</p>';
        if (typeof simuPanelPro !== "undefined" && simuPanelPro) {
          simuPanelPro.innerHTML = '<p class="simu-empty">Impossible de charger les tarifs.</p>';
        }
        console.error("[Simulateur] Échec chargement tarifs.json:", err);
      });
  }

  // ─── Render : panneau articles selon catégorie active ────
  function renderPanel() {
    if (!state.tarifs) return;
    var filter = TAB_FILTERS[state.catActive];
    var items = sortItemsForTab(state.catActive, state.tarifs.filter(filter));
    if (items.length === 0) {
      simuPanel.innerHTML = '<p class="simu-empty">Aucun article dans cette catégorie.</p>';
      return;
    }

    var html = '';
    var isLocation = state.catActive === "location";
    var isLuxe = isLocation && state.gammeLocation === "luxe";

    // Note contextuelle + sélecteur gamme + sélecteur durée pour l'onglet Location
    if (isLocation) {
      html += '<div class="mp-banner mp-banner--info">' +
        '<svg class="mp-icon"><use href="#mp-beach"/></svg>' +
        '<div><strong>Pour vos weekends et séjours.</strong> Choisissez votre gamme et la durée ci-dessous. Le linge vous est remis en main propre et repris en fin de séjour.</div>' +
      '</div>';

      // Sélecteur de gamme
      html += '<div class="simu-gamme-selector" role="radiogroup" aria-label="Choisir la gamme de linge">';
      [
        { id: "confort", icon: "mp-confort", label: "Confort", desc: "Coton 100 % qualité pro" },
        { id: "premium", icon: "mp-premium", label: "Premium", desc: "Lin, percale, finitions soignées" },
        { id: "luxe",    icon: "mp-luxe",    label: "Luxe",    desc: "Sur devis · sur-mesure, broderies" },
      ].forEach(function (g) {
        var pressed = state.gammeLocation === g.id ? "true" : "false";
        html += '<button type="button" role="radio" data-gamme="' + g.id + '" aria-checked="' + pressed + '" class="simu-gamme' + (state.gammeLocation === g.id ? ' is-active' : '') + (g.id === "luxe" ? ' simu-gamme--luxe' : '') + '">';
        html +=   '<span class="g-label"><svg class="mp-icon"><use href="#' + g.icon + '"/></svg> ' + g.label + '</span>';
        html +=   '<span class="g-desc">' + g.desc + '</span>';
        html += '</button>';
      });
      html += '</div>';

      // Sélecteur de durée (avec promo « 1 sem offerte / mois entamé »)
      var dureeActive = state.dureeSemainesLocation;
      var presets = [
        { weeks: 0,  label: "WE", isWeekend: true },
        { weeks: 1,  label: "1 sem" },
        { weeks: 2,  label: "2 sem" },
        { weeks: 4,  label: "4 sem · 1 mois", promo: true },
        { weeks: 8,  label: "8 sem · 2 mois", promo: true },
      ];
      var isCustom = !presets.some(function (p) { return p.weeks === dureeActive; });
      var disabled = isLuxe ? ' disabled' : '';

      html += '<div class="simu-duree-section"' + (isLuxe ? ' aria-disabled="true"' : '') + '>';
      html +=   '<div class="simu-duree-label">Durée du séjour</div>';
      html +=   '<div class="simu-duree-selector" role="radiogroup" aria-label="Choisir la durée">';
      presets.forEach(function (p) {
        var isOn = (!isCustom && dureeActive === p.weeks);
        var off = offeredWeeks(p.weeks);
        var promoTag = off > 0
          ? '<span class="simu-duree-promo">★ ' + off + ' sem offerte' + (off > 1 ? 's' : '') + '</span>'
          : (p.isWeekend ? '<span class="simu-duree-promo simu-duree-promo--we">3 jours</span>' : '');
        html += '<button type="button" role="radio" data-duree="' + p.weeks + '" aria-checked="' + isOn + '" class="simu-duree' + (isOn ? ' is-active' : '') + (p.isWeekend ? ' simu-duree--we' : '') + '"' + disabled + '>';
        html +=   '<span class="d-label">' + p.label + '</span>';
        html +=   promoTag;
        html += '</button>';
      });
      // Bouton "+" custom
      html += '<button type="button" role="radio" data-duree="custom" aria-checked="' + isCustom + '" class="simu-duree simu-duree--custom' + (isCustom ? ' is-active' : '') + '"' + disabled + '>';
      html +=   '<span class="d-label">+</span>';
      html +=   '<span class="d-sub">Plus long</span>';
      html += '</button>';
      html += '</div>';

      // Champ de saisie libre si custom
      if (isCustom) {
        html += '<div class="simu-duree-custom-input">';
        html +=   '<label for="simu-duree-input">Nombre de semaines :</label>';
        html +=   '<input type="number" id="simu-duree-input" min="1" max="104" step="1" value="' + dureeActive + '"' + disabled + ' />';
        var off = offeredWeeks(dureeActive);
        if (off > 0) {
          html += '<span class="simu-duree-eco">→ ' + off + ' semaine' + (off > 1 ? 's' : '') + ' offerte' + (off > 1 ? 's' : '') + '</span>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    html += '<div class="simu-articles' + (isLuxe ? ' is-luxe' : '') + '">';
    items.forEach(function (t) {
      var qty = state.panier[t.id] || 0;
      var unitPrice = getUnitPrice(t);
      var isHebdoCat = (t.categorie === "kit" || t.categorie === "location");
      var billed = (isLocation && isHebdoCat)
        ? (isWeekendMode() ? 1 : computeBilledWeeks(state.dureeSemainesLocation))
        : 1;
      var lineTotal = qty * unitPrice * billed;
      // Suffixe d'unité avec gestion durée pour kit/location
      var unite = uniteLabel(t.unite);
      if (isHebdoCat) {
        unite = isWeekendMode() ? ' / WE' : ' / sem.';
      }
      var stepClass = t.unite === "kg" ? "simu-article simu-article--kilo" : "simu-article";
      var step = t.unite === "kg" ? "0.5" : "1";
      var max = t.unite === "kg" ? "50" : "99";

      // Affichage du prix unitaire (selon gamme)
      var prixHtml;
      if (isLuxe) {
        prixHtml = '<span class="prix prix-devis">Sur devis</span>';
      } else if (isLocation && state.gammeLocation === "premium" && t.prix_premium) {
        prixHtml = '<span class="prix"><strong>' + fmtEUR(unitPrice) + '</strong>' + unite +
                   ' <span class="prix-old">(Confort ' + fmtEUR(t.prix_ttc) + ')</span></span>';
      } else {
        prixHtml = '<span class="prix"><strong>' + fmtEUR(unitPrice) + '</strong>' + unite + '</span>';
      }

      // Total ligne (Sur devis si Luxe ; sinon multiplié par durée si location)
      var lineTotalHtml;
      if (isLuxe) {
        lineTotalHtml = '<div class="simu-line-total simu-line-total--devis">— €</div>';
      } else if (isHebdoCat && qty > 0 && isWeekendMode()) {
        lineTotalHtml = '<div class="simu-line-total"><span class="line-mult">× 1 WE</span> ' + fmtEUR(lineTotal) + '</div>';
      } else if (billed > 1 && qty > 0) {
        lineTotalHtml = '<div class="simu-line-total"><span class="line-mult">×' + billed + ' sem</span> ' + fmtEUR(lineTotal) + '</div>';
      } else {
        lineTotalHtml = '<div class="simu-line-total' + (qty <= 0 ? ' is-empty' : '') + '">' + fmtEUR(lineTotal) + '</div>';
      }

      var disabledAttr = isLuxe ? ' disabled' : (qty <= 0 ? ' disabled' : '');
      var disabledIncAttr = isLuxe ? ' disabled' : '';

      html += '<div class="' + stepClass + (qty > 0 ? ' is-active' : '') + '" data-id="' + t.id + '">';
      html +=   '<div class="simu-article-info">';
      html +=     '<span class="nom">' + escapeHtml(t.nom) + '</span>';
      html +=     prixHtml;
      html +=   '</div>';
      html +=   '<div class="simu-stepper">';
      html +=     '<button type="button" data-action="dec" aria-label="Diminuer la quantité"' + disabledAttr + '>−</button>';
      html +=     '<input type="number" min="0" max="' + max + '" step="' + step + '" value="' + qty + '" aria-label="Quantité de ' + escapeHtml(t.nom) + '"' + disabledIncAttr + ' />';
      html +=     '<button type="button" data-action="inc" aria-label="Augmenter la quantité"' + disabledIncAttr + '>+</button>';
      html +=   '</div>';
      html +=   lineTotalHtml;
      html += '</div>';
    });
    html += '</div>';

    // Bandeau de remise location longue durée (visible si offerWeeks > 0)
    if (isLocation && !isLuxe) {
      var off = offeredWeeks(state.dureeSemainesLocation);
      if (off > 0) {
        var moisCount = Math.floor(state.dureeSemainesLocation / 4);
        var ecoTotal = 0;
        Object.entries(state.panier).forEach(function (e) {
          var t = state.map[e[0]];
          if (!t || (t.categorie !== "kit" && t.categorie !== "location")) return;
          ecoTotal += e[1] * getUnitPrice(t) * off;
        });
        html += '<div class="mp-banner mp-banner--promo">';
        html +=   '<svg class="mp-icon mp-icon--lg"><use href="#mp-bulb"/></svg>';
        html +=   '<div>';
        html +=     '<strong>' + off + ' semaine' + (off > 1 ? 's' : '') + ' offerte' + (off > 1 ? 's' : '') + ' !</strong> ';
        html +=     '<span>Location au mois (' + moisCount + ' mois entamé' + (moisCount > 1 ? 's' : '') + '). ';
        if (ecoTotal > 0) {
          html += 'Économie sur votre panier : <strong class="eco-amount">' + fmtEUR(ecoTotal) + '</strong>.';
        } else {
          html += 'Sélectionnez vos articles pour voir l\'économie réelle.';
        }
        html +=     '</span>';
        html +=   '</div>';
        html += '</div>';
      }
    }

    // Bandeau Luxe : invitation au devis personnalisé
    if (isLuxe) {
      html += '<div class="mp-banner mp-banner--accent mp-banner--with-cta">' +
        '<div>' +
          '<svg class="mp-icon mp-icon--lg" style="margin-right:0.4em;vertical-align:-0.3em"><use href="#mp-luxe"/></svg>' +
          '<strong>Gamme Luxe — sur devis personnalisé.</strong><br>' +
          '<span>Linge sur-mesure, matières d\'exception, broderies et monogrammes. Décrivez-nous votre projet, nous revenons vers vous sous 24 h.</span>' +
        '</div>' +
        '<a href="/reservation?type=particulier&gamme=luxe" class="btn btn-primary btn-sm">Demander un devis Luxe →</a>' +
      '</div>';
    }

    simuPanel.innerHTML = html;

    // Bind sur le sélecteur de gamme (location uniquement)
    if (isLocation) {
      simuPanel.querySelectorAll(".simu-gamme").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.gammeLocation = btn.getAttribute("data-gamme");
          renderPanel();
          renderRecap();
          renderTotal();
          renderSuggestion();
        });
      });
      // Sélecteur de durée
      simuPanel.querySelectorAll(".simu-duree").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (btn.hasAttribute("disabled")) return;
          var val = btn.getAttribute("data-duree");
          if (val === "custom") {
            // Bascule sur custom : on garde la valeur actuelle si déjà custom, sinon on propose une valeur
            var current = state.dureeSemainesLocation;
            var presets = [1, 2, 4, 8];
            if (presets.indexOf(current) !== -1) {
              state.dureeSemainesLocation = 12; // valeur par défaut suggérée pour custom
            }
          } else {
            state.dureeSemainesLocation = parseInt(val, 10);
          }
          renderPanel();
          renderRecap();
          renderTotal();
        });
      });
      // Input custom
      var customInput = simuPanel.querySelector("#simu-duree-input");
      if (customInput) {
        customInput.addEventListener("change", function () {
          var v = parseInt(customInput.value, 10);
          if (isNaN(v) || v < 1) v = 1;
          if (v > 104) v = 104;
          state.dureeSemainesLocation = v;
          renderPanel();
          renderRecap();
          renderTotal();
        });
      }
    }

    // Bind events sur les steppers
    simuPanel.querySelectorAll(".simu-article").forEach(function (row) {
      var id = row.getAttribute("data-id");
      var input = row.querySelector("input");
      var btnDec = row.querySelector('[data-action="dec"]');
      var btnInc = row.querySelector('[data-action="inc"]');
      var step = parseFloat(input.getAttribute("step")) || 1;

      btnInc.addEventListener("click", function () {
        var v = (parseFloat(input.value) || 0) + step;
        setQty(id, v);
      });
      btnDec.addEventListener("click", function () {
        var v = (parseFloat(input.value) || 0) - step;
        setQty(id, v);
      });
      input.addEventListener("change", function () {
        setQty(id, parseFloat(input.value) || 0);
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  // ─── Gestion du panier ──────────────────────────────────
  function setQty(id, qty) {
    var t = state.map[id];
    if (!t) return;
    // En mode Luxe, on bloque l'ajout : redirection devis
    if (state.catActive === "location" && state.gammeLocation === "luxe") return;
    var step = t.unite === "kg" ? 0.5 : 1;
    qty = Math.max(0, Math.round(qty / step) * step);
    if (qty === 0) {
      delete state.panier[id];
    } else {
      state.panier[id] = qty;
    }
    // Re-render light : juste la ligne concernée + total + récap
    renderPanel();
    renderRecap();
    renderTotal();
    renderSuggestion();
  }

  function resetPanier() {
    state.panier = {};
    renderPanel();
    renderRecap();
    renderTotal();
    renderSuggestion();
  }

  // ─── Render : récap panier ──────────────────────────────
  var recapEl   = document.getElementById("simu-recap");
  var recapCount = document.getElementById("simu-recap-count");
  function renderRecap() {
    var entries = Object.entries(state.panier).filter(function (e) { return e[1] > 0; });
    if (recapCount) {
      var n = entries.length;
      recapCount.textContent = n + " " + pluralize(n, "article", "articles");
    }
    if (!recapEl) return;
    if (entries.length === 0) {
      recapEl.innerHTML = '<p class="simu-empty">Votre panier est vide. Sélectionnez des articles ci-dessus pour commencer.</p>';
      return;
    }
    var html = '<ul class="simu-recap-list">';
    entries.forEach(function (e) {
      var t = state.map[e[0]];
      var qty = e[1];
      var isHebdoItem = t.categorie === "kit" || t.categorie === "location";
      var qtyStr = t.unite === "kg" ? qty + " kg" : "×" + qty;
      // Pour kit/location : ajout de la durée dans le récap
      if (isHebdoItem && state.dureeSemainesLocation > 1) {
        var billed = computeBilledWeeks(state.dureeSemainesLocation);
        qtyStr += ' · ' + state.dureeSemainesLocation + ' sem (' + billed + ' fact.)';
      }
      var totalStr = (state.gammeLocation === "luxe" && isHebdoItem)
        ? "sur devis"
        : fmtEUR(lineCost(t, qty));
      html += '<li>';
      html +=   '<span class="ligne-nom"><span class="qty">' + qtyStr + '</span>' + escapeHtml(t.nom) + '</span>';
      html +=   '<span class="ligne-total">' + totalStr + '</span>';
      html += '</li>';
    });
    html += '</ul>';
    recapEl.innerHTML = html;
  }

  // Helper : prix unitaire HEBDO d'un kit/location selon gamme courante
  // (sans multiplier par la durée — la multiplication est faite par lineCost)
  function getUnitPrice(t) {
    if (t.categorie !== "kit" && t.categorie !== "location") return t.prix_ttc;
    // Mode Weekend : prix de la variante *_we (ou prix du produit s'il est lui-même weekend)
    if (isWeekendMode()) {
      var we = getWeekendVariant(t);
      return we ? we.prix_ttc : 0;
    }
    if (state.gammeLocation === "premium" && t.prix_premium) return t.prix_premium;
    if (state.gammeLocation === "luxe") return 0;
    return t.prix_ttc;
  }

  // Coût d'une ligne du panier = qty × prix_unit × (durée si kit/location)
  // Avec promo « 1 sem offerte / mois entamé » sur la durée
  function lineCost(t, qty) {
    var unit = getUnitPrice(t);
    if (t.categorie === "kit" || t.categorie === "location") {
      // Mode WE : un seul forfait weekend, pas de multiplication par semaines
      if (isWeekendMode()) return qty * unit;
      return qty * unit * computeBilledWeeks(state.dureeSemainesLocation);
    }
    return qty * unit;
  }

  // Compat : ancienne API utilisée ailleurs dans le code
  function getPriceForRecap(t) { return getUnitPrice(t); }

  // ─── Render : total ─────────────────────────────────────
  var totalEl = document.getElementById("simu-total-montant");
  function computeTotal() {
    return Object.entries(state.panier).reduce(function (sum, e) {
      var t = state.map[e[0]];
      if (!t) return sum;
      return sum + lineCost(t, e[1]);
    }, 0);
  }
  function renderTotal() {
    if (!totalEl) return;
    // Si on est sur Luxe ET le panier ne contient que des kits/location → "sur devis"
    var entries = Object.entries(state.panier).filter(function (e) { return e[1] > 0; });
    var allLuxeLocation = state.catActive === "location" && state.gammeLocation === "luxe" &&
      entries.length > 0 &&
      entries.every(function (e) { var t = state.map[e[0]]; return t && (t.categorie === "kit" || t.categorie === "location"); });
    if (allLuxeLocation) {
      totalEl.textContent = "Sur devis";
    } else {
      totalEl.textContent = fmtEUR(computeTotal());
    }
  }

  // ─── Suggestion forfait ─────────────────────────────────
  // Détecte si le panier match une compo forfait, suggère si éco ≥ 2 €
  var SEUIL_ECO = 2.00;
  var suggestionEl = document.getElementById("simu-suggestion");

  function findMatchingForfait() {
    if (!state.tarifs || Object.keys(state.panier).length === 0) return null;
    // On cherche un forfait dont la compo est strictement incluse dans le panier
    var forfaits = state.tarifs.filter(function (t) {
      return t.categorie === "forfait" && t.composition && t.composition.items.length > 0;
    });
    var bestMatch = null;
    forfaits.forEach(function (forfait) {
      // Agréger la compo : { id: qtyAttendue }
      var compoMap = {};
      forfait.composition.items.forEach(function (it) {
        compoMap[it.id] = (compoMap[it.id] || 0) + it.qty;
      });
      // Vérifier que TOUS les composants sont dans le panier avec qty ≥ requise
      var matches = Object.entries(compoMap).every(function (c) {
        return (state.panier[c[0]] || 0) >= c[1];
      });
      if (!matches) return;
      // Calculer le coût pièce des composants requis
      var coutPiece = Object.entries(compoMap).reduce(function (s, c) {
        var t = state.map[c[0]];
        return s + (t ? t.prix_ttc * c[1] : 0);
      }, 0);
      var eco = coutPiece - forfait.prix_ttc;
      if (eco >= SEUIL_ECO) {
        if (!bestMatch || eco > bestMatch.eco) {
          bestMatch = { forfait: forfait, eco: eco, coutPiece: coutPiece, compoMap: compoMap };
        }
      }
    });
    return bestMatch;
  }

  function renderSuggestion() {
    if (!suggestionEl) return;
    var match = findMatchingForfait();
    if (!match) { suggestionEl.setAttribute("hidden", ""); suggestionEl.innerHTML = ""; return; }
    suggestionEl.removeAttribute("hidden");
    suggestionEl.className = "mp-banner mp-banner--promo mp-banner--with-cta simu-suggestion";
    suggestionEl.innerHTML =
      '<svg class="mp-icon mp-icon--lg"><use href="#mp-bulb"/></svg>' +
      '<div>' +
        '<strong>Conseil :</strong> avec le <strong>' + escapeHtml(match.forfait.nom) + '</strong>, ' +
        'vous économiseriez <span class="eco">' + fmtEUR(match.eco) + '</span> ' +
        'sur cette partie de votre panier.' +
      '</div>' +
      '<button type="button" class="btn btn-primary btn-sm" data-action="apply-forfait">' +
        'Appliquer le forfait' +
      '</button>';
    suggestionEl.querySelector('[data-action="apply-forfait"]').addEventListener("click", function () {
      // Retirer les composants requis et ajouter le forfait
      Object.entries(match.compoMap).forEach(function (c) {
        var current = state.panier[c[0]] || 0;
        var newQty = current - c[1];
        if (newQty <= 0) delete state.panier[c[0]]; else state.panier[c[0]] = newQty;
      });
      state.panier[match.forfait.id] = (state.panier[match.forfait.id] || 0) + 1;
      renderPanel();
      renderRecap();
      renderTotal();
      renderSuggestion();
    });
  }

  // ─── Tabs catégories ────────────────────────────────────
  var catButtons = document.querySelectorAll(".simu-tabs button");
  catButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.catActive = btn.getAttribute("data-cat");
      catButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      renderPanel();
    });
  });

  // ─── Bouton reset ───────────────────────────────────────
  var resetBtn = document.getElementById("simu-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (Object.keys(state.panier).length === 0) return;
      if (window.confirm("Vider votre panier de simulation ?")) {
        resetPanier();
      }
    });
  }

  // ─── Actions : imprimer, email, réserver ────────────────
  function buildPanierText() {
    var entries = Object.entries(state.panier).filter(function (e) { return e[1] > 0; });
    if (entries.length === 0) return null;
    var hasLocation = entries.some(function (e) {
      var t = state.map[e[0]];
      return t && (t.categorie === "kit" || t.categorie === "location");
    });
    var lignes = entries.map(function (e) {
      var t = state.map[e[0]];
      var qty = e[1];
      var isHebdoItem = t.categorie === "kit" || t.categorie === "location";
      var qtyStr = t.unite === "kg" ? qty + " kg" : "×" + qty;
      var line = "  • " + qtyStr + "  " + t.nom;
      if (state.gammeLocation === "luxe" && isHebdoItem) {
        line += "  → sur devis (gamme Luxe)";
      } else {
        line += "  → " + fmtEUR(lineCost(t, qty));
      }
      return line;
    });
    var header = "";
    if (hasLocation) {
      var gammeLabel = { confort: "Confort", premium: "Premium", luxe: "Luxe (sur devis)" }[state.gammeLocation];
      header = "Gamme location : " + gammeLabel + "\n";
      header += "Durée : " + state.dureeSemainesLocation + " semaine" + (state.dureeSemainesLocation > 1 ? "s" : "");
      var off = offeredWeeks(state.dureeSemainesLocation);
      if (off > 0) {
        header += "  (★ " + off + " semaine" + (off > 1 ? "s" : "") + " offerte" + (off > 1 ? "s" : "") + " — location au mois)";
      }
      header += "\n\n";
    }
    var totalLine = (state.gammeLocation === "luxe" && hasLocation)
      ? "\n\nTotal estimé : sur devis personnalisé"
      : "\n\nTotal estimé : " + fmtEUR(computeTotal());
    return header + lignes.join("\n") + totalLine;
  }

  function buildPanierForReservation() {
    var entries = Object.entries(state.panier).filter(function (e) { return e[1] > 0; });
    return entries.map(function (e) { return e[0] + ":" + e[1]; }).join(",");
  }

  var printBtn = document.getElementById("simu-print");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      var txt = buildPanierText();
      if (!txt) { window.alert("Votre panier est vide."); return; }
      var w = window.open("", "_blank", "width=600,height=800");
      var html = "<!doctype html><html><head><meta charset='utf-8'><title>Mon panier — Maison Paliquey</title>" +
        "<style>body{font-family:Georgia,serif;padding:2rem;color:#1B2A4A;line-height:1.6}h1{font-weight:400;border-bottom:1px solid #C4A882;padding-bottom:0.5rem}pre{font-family:inherit;white-space:pre-wrap}.total{font-size:1.3rem;font-weight:600;margin-top:1rem;border-top:1px solid #C4A882;padding-top:1rem}</style>" +
        "</head><body>" +
        "<h1>Estimation Maison Paliquey</h1>" +
        "<p>Cap Ferret · " + new Date().toLocaleDateString("fr-FR") + "</p>" +
        "<pre>" + escapeHtml(txt) + "</pre>" +
        "<p style='font-size:0.85rem;color:#6B7280;margin-top:2rem;'>Estimation indicative TTC. Prix définitif sur devis ou ticket de caisse. Maison Paliquey — SAS LAVOK · Lège-Cap-Ferret · contact@maisonpaliquey.fr</p>" +
        "<script>window.print();<\/script>" +
        "</body></html>";
      w.document.write(html);
      w.document.close();
    });
  }

  var emailBtn = document.getElementById("simu-email");
  if (emailBtn) {
    emailBtn.addEventListener("click", function () {
      var txt = buildPanierText();
      if (!txt) { window.alert("Votre panier est vide."); return; }
      var subject = encodeURIComponent("Mon estimation Maison Paliquey");
      var body = encodeURIComponent(
        "Bonjour,\n\nVoici l'estimation que j'ai composée sur le simulateur Maison Paliquey :\n\n" +
        txt +
        "\n\nMerci de me confirmer la disponibilité et les modalités.\n\nCordialement"
      );
      window.location.href = "mailto:?subject=" + subject + "&body=" + body;
    });
  }

  var reserverBtn = document.getElementById("simu-reserver");
  if (reserverBtn) {
    reserverBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var panierStr = buildPanierForReservation();
      var total = computeTotal();
      var entries = Object.entries(state.panier).filter(function (e) { return e[1] > 0; });
      var hasLocation = entries.some(function (e) {
        var t = state.map[e[0]];
        return t && (t.categorie === "kit" || t.categorie === "location");
      });
      var url = "/reservation";
      if (panierStr) {
        url += "?panier=" + encodeURIComponent(panierStr);
        if (hasLocation) {
          url += "&gamme=" + state.gammeLocation;
          url += "&duree_semaines=" + state.dureeSemainesLocation;
          if (state.gammeLocation === "luxe") {
            url += "&total=devis";
          } else {
            url += "&total=" + total.toFixed(2);
          }
        } else {
          url += "&total=" + total.toFixed(2);
        }
      }
      window.location.href = url;
    });
  }

  // ─── Toggle B2C/B2B (init des panneaux cachés) ──────────
  var b2bPanel = document.querySelector('.simu-mode[data-mode="b2b"]');
  if (b2bPanel && !b2bPanel.hasAttribute("hidden")) b2bPanel.setAttribute("hidden", "");

  // ═════════════════════════════════════════════════════════
  // 4. SIMULATEUR B2B (volumes hebdomadaires)
  // ═════════════════════════════════════════════════════════

  // Profils d'activité : sélection d'IDs d'articles pertinents par activité
  var B2B_PROFILES = {
    hebergement: {
      label: "Hébergement saisonnier (villas, gîtes, AirBnb)",
      items: [
        // Forfaits lit (vente de blanchi, pas de location)
        "forfait_lit_140_180_coton_blanchi_2_taies",
        "forfait_lit_140_180_lin_blanchi_2_taies",
        "forfait_lit_90_coton_blanchi_1_taie",
        // Kits location (pour location complète)
        "kit_lit_2p",
        "kit_lit_1p",
        "kit_bain",
        "kit_villa_4p",
        "kit_weekend_2p",
        // Linge plat à la pièce / serviettes / nappes pour le complément
        "drap_de_bain",
        "serviette_de_toilette",
      ],
    },
    hotellerie: {
      label: "Hôtellerie, B&B, conciergerie",
      items: [
        "forfait_lit_140_180_coton_blanchi_2_taies",
        "forfait_lit_140_180_lin_blanchi_2_taies",
        "forfait_lit_90_coton_blanchi_1_taie",
        "drap_de_bain",
        "serviette_de_toilette",
        "tapis_de_bain",
        "robe_de_chambre_peignoir",
        "machine_4_5_kg_lavee_sechee",
        "lavage_au_kilo_tout_venant",
      ],
    },
    restauration: {
      label: "Restauration, traiteur, spa",
      items: [
        "nappe_grande_taille",
        "nappe_moyenne_taille",
        "nappe_petite_taille",
        "serviette_de_table",
        "torchon",
        "drap_de_bain",
        "serviette_de_toilette",
        "tapis_de_bain",
        "machine_4_5_kg_lavee_sechee",
        "lavage_au_kilo_tout_venant",
      ],
    },
  };

  var SEMAINES_PAR_MOIS = 4.33; // moyenne (52 semaines / 12 mois)

  var stateB2B = {
    catActive: "hebergement",
    panier: {}, // { id: qty hebdomadaire }
  };

  var simuPanelPro = document.getElementById("simu-panel-pro");
  var recapElPro   = document.getElementById("simu-recap-pro");
  var recapCountPro = document.getElementById("simu-recap-count-pro");
  var totalHebdoEl   = document.getElementById("simu-total-hebdo");
  var totalMensuelEl = document.getElementById("simu-total-mensuel");

  function renderPanelPro() {
    if (!state.tarifs || !simuPanelPro) return;
    var profile = B2B_PROFILES[stateB2B.catActive];
    if (!profile) return;
    var items = profile.items
      .map(function (id) { return state.map[id]; })
      .filter(Boolean);

    if (items.length === 0) {
      simuPanelPro.innerHTML = '<p class="simu-empty">Aucun article disponible pour ce profil.</p>';
      return;
    }

    var html = '<div class="simu-articles">';
    items.forEach(function (t) {
      var qty = stateB2B.panier[t.id] || 0;
      var lineTotal = qty * t.prix_ttc;
      // B2B : pas de toggle weekend, affichage standard (le hebdoSuffix gère 'par semaine')
      var unite = uniteLabel(t.unite);
      var stepClass = t.unite === "kg" ? "simu-article simu-article--kilo" : "simu-article";
      var step = t.unite === "kg" ? "0.5" : "1";
      var max = t.unite === "kg" ? "500" : "999";

      // "par semaine" UNIQUEMENT pour les vraies prestations hebdomadaires
      // (kits + location à la pièce). Les forfaits blanchis, pressing,
      // machine au kilo, blanchisserie pièce sont des PRESTATIONS à l'unité —
      // le volume hebdo est saisi mais le tarif n'est pas indexé sur la semaine.
      var isHebdoItem = t.categorie === "kit" || t.categorie === "location";
      var hebdoSuffix = isHebdoItem
        ? ' · <em style="font-style: italic; opacity: 0.75;">par semaine</em>'
        : '';

      html += '<div class="' + stepClass + (qty > 0 ? ' is-active' : '') + '" data-id="' + t.id + '">';
      html +=   '<div class="simu-article-info">';
      html +=     '<span class="nom">' + escapeHtml(t.nom) + '</span>';
      html +=     '<span class="prix"><strong>' + fmtEUR(t.prix_ttc) + '</strong>' + unite + hebdoSuffix + '</span>';
      html +=   '</div>';
      html +=   '<div class="simu-stepper">';
      html +=     '<button type="button" data-action="dec" aria-label="Diminuer"' + (qty <= 0 ? ' disabled' : '') + '>−</button>';
      html +=     '<input type="number" min="0" max="' + max + '" step="' + step + '" value="' + qty + '" aria-label="Quantité hebdo de ' + escapeHtml(t.nom) + '" />';
      html +=     '<button type="button" data-action="inc" aria-label="Augmenter">+</button>';
      html +=   '</div>';
      html +=   '<div class="simu-line-total' + (qty <= 0 ? ' is-empty' : '') + '">' + fmtEUR(lineTotal) + '</div>';
      html += '</div>';
    });
    html += '</div>';
    simuPanelPro.innerHTML = html;

    // Bind events
    simuPanelPro.querySelectorAll(".simu-article").forEach(function (row) {
      var id = row.getAttribute("data-id");
      var input = row.querySelector("input");
      var btnDec = row.querySelector('[data-action="dec"]');
      var btnInc = row.querySelector('[data-action="inc"]');
      var step = parseFloat(input.getAttribute("step")) || 1;

      btnInc.addEventListener("click", function () {
        setQtyPro(id, (parseFloat(input.value) || 0) + step);
      });
      btnDec.addEventListener("click", function () {
        setQtyPro(id, (parseFloat(input.value) || 0) - step);
      });
      input.addEventListener("change", function () {
        setQtyPro(id, parseFloat(input.value) || 0);
      });
    });
  }

  function setQtyPro(id, qty) {
    var t = state.map[id];
    if (!t) return;
    var step = t.unite === "kg" ? 0.5 : 1;
    qty = Math.max(0, Math.round(qty / step) * step);
    if (qty === 0) { delete stateB2B.panier[id]; } else { stateB2B.panier[id] = qty; }
    renderPanelPro();
    renderRecapPro();
    renderTotalPro();
  }

  function resetPanierPro() {
    stateB2B.panier = {};
    renderPanelPro();
    renderRecapPro();
    renderTotalPro();
  }

  function renderRecapPro() {
    var entries = Object.entries(stateB2B.panier).filter(function (e) { return e[1] > 0; });
    if (recapCountPro) {
      var n = entries.length;
      recapCountPro.textContent = n + " " + pluralize(n, "article", "articles");
    }
    if (!recapElPro) return;
    if (entries.length === 0) {
      recapElPro.innerHTML = '<p class="simu-empty">Saisissez vos volumes hebdomadaires ci-dessus pour voir l\'estimation.</p>';
      return;
    }
    var html = '<ul class="simu-recap-list">';
    entries.forEach(function (e) {
      var t = state.map[e[0]];
      var qty = e[1];
      var lineTotal = qty * t.prix_ttc;
      // Idem renderPanelPro : "/sem" uniquement pour kits + location à la pièce
      var isHebdoItem = t.categorie === "kit" || t.categorie === "location";
      var qtyBase = t.unite === "kg" ? qty + " kg" : "×" + qty;
      var qtyStr  = isHebdoItem ? qtyBase + "/sem" : qtyBase;
      var totalStr = fmtEUR(lineTotal) + (isHebdoItem ? " / sem" : "");
      html += '<li>';
      html +=   '<span class="ligne-nom"><span class="qty">' + qtyStr + '</span>' + escapeHtml(t.nom) + '</span>';
      html +=   '<span class="ligne-total">' + totalStr + '</span>';
      html += '</li>';
    });
    html += '</ul>';
    recapElPro.innerHTML = html;
  }

  function computeHebdo() {
    return Object.entries(stateB2B.panier).reduce(function (s, e) {
      var t = state.map[e[0]];
      return s + (t ? t.prix_ttc * e[1] : 0);
    }, 0);
  }
  function renderTotalPro() {
    var hebdo = computeHebdo();
    if (totalHebdoEl)   totalHebdoEl.textContent   = fmtEUR(hebdo);
    if (totalMensuelEl) totalMensuelEl.textContent = fmtEUR(hebdo * SEMAINES_PAR_MOIS);
  }

  // ─── Tabs profils B2B ───────────────────────────────────
  var catProButtons = document.querySelectorAll('[data-cat-pro]');
  catProButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      stateB2B.catActive = btn.getAttribute("data-cat-pro");
      catProButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      renderPanelPro();
    });
  });

  // ─── Reset B2B ──────────────────────────────────────────
  var resetBtnPro = document.getElementById("simu-reset-pro");
  if (resetBtnPro) {
    resetBtnPro.addEventListener("click", function () {
      if (Object.keys(stateB2B.panier).length === 0) return;
      if (window.confirm("Réinitialiser vos volumes hebdomadaires ?")) {
        resetPanierPro();
      }
    });
  }

  // ─── Conversion en devis ────────────────────────────────
  var devisBtn = document.getElementById("simu-devis-pro");
  if (devisBtn) {
    devisBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var entries = Object.entries(stateB2B.panier).filter(function (e) { return e[1] > 0; });
      if (entries.length === 0) {
        window.alert("Saisissez d'abord vos volumes hebdomadaires pour générer un devis.");
        return;
      }
      var panierStr = entries.map(function (e) { return e[0] + ":" + e[1]; }).join(",");
      var hebdo = computeHebdo();
      var mensuel = hebdo * SEMAINES_PAR_MOIS;
      var profile = B2B_PROFILES[stateB2B.catActive];
      var url = "/reservation?type=professionnel" +
        "&activite=" + encodeURIComponent(profile.label) +
        "&volumes_hebdo=" + encodeURIComponent(panierStr) +
        "&estim_hebdo=" + hebdo.toFixed(2) +
        "&estim_mensuel=" + mensuel.toFixed(2);
      window.location.href = url;
    });
  }

  // ─── Init ───────────────────────────────────────────────
  // loadTarifs() rend les deux panneaux (B2C + B2B) en une seule passe
  loadTarifs();

})();
