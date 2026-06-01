/**
 * Maison Paliquey — Configurateur /commander
 * =====================================================================
 * Rend les kits + ajouts à la carte, calcule le total EN LIVE via le
 * moteur partagé (shared/pricing.mjs — la même logique que le serveur).
 *
 * Deux issues :
 *   • « Payer et réserver »  → /api/checkout (paiement Mollie immédiat,
 *     le prix est RECALCULÉ serveur ; le navigateur ne décide pas du montant).
 *   • « Demander un devis »  → /api/devis (crée un lead ; l'équipe valide
 *     puis renvoie le devis avec un lien de paiement).
 *
 * Prefill : si on arrive depuis le simulateur tarifs
 *   (?panier=id:qty,...&gamme=confort|premium|luxe&duree_semaines=N),
 *   les éléments sont pré-cochés et les dates pré-remplies — le client
 *   ne recommence pas à zéro.
 *
 * Cohérence : une formule week-end ne peut couvrir plus de 3 jours
 *   (cf. WEEKEND_MAX_NIGHTS). Les kits week-end sont désactivés si le
 *   séjour saisi dépasse 3 jours.
 * =====================================================================
 */
import { computeQuote, isWeekendTarif, WEEKEND_MAX_NIGHTS } from "../../shared/pricing.mjs";

const TARIFS_URL = "assets/data/tarifs.json?v=1.0.16";

const ADDON_CATEGORIES = [
  { key: "location", label: "Location à la pièce — semaine" },
  { key: "forfait", label: "Forfaits" },
];

// Le simulateur utilise confort/premium/luxe ; le moteur kit utilise standard/premium.
const GAMME_MAP = { confort: "standard", premium: "premium", luxe: "premium" };

const state = {
  tarifs: [],
  byId: {},
  cart: new Map(), // id -> { qty, gamme }
  sejour: { debut: "", fin: "" },
  devisOnly: false, // gamme Luxe = sur devis, pas de paiement immédiat
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function fmtEUR(cents) { return (cents / 100).toFixed(2).replace(".", ",") + " €"; }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function addDaysISO(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

init();

async function init() {
  const form = $("[data-cfg-form]");
  if (!form) return;

  const debutEl = $("[data-debut]");
  const finEl = $("[data-fin]");
  debutEl.min = todayISO();
  finEl.min = todayISO();

  try {
    const res = await fetch(TARIFS_URL, { cache: "no-cache" });
    const data = await res.json();
    state.tarifs = data.tarifs || [];
    state.byId = Object.fromEntries(state.tarifs.map((t) => [t.id, t]));
  } catch (e) {
    showError("Impossible de charger la grille tarifaire. Réessayez plus tard.");
    return;
  }

  renderKits();
  renderAddons();
  bindEvents(form, debutEl, finEl);
  applyPrefillFromURL(debutEl, finEl);
  recompute();
}

// ── Prefill depuis le simulateur ───────────────────────────────────
function applyPrefillFromURL(debutEl, finEl) {
  const p = new URLSearchParams(window.location.search);
  const panier = p.get("panier");
  if (!panier) return;

  const gammeParam = (p.get("gamme") || "").toLowerCase();
  const mappedGamme = GAMME_MAP[gammeParam] || "standard";
  state.devisOnly = gammeParam === "luxe";

  // Items
  panier.split(",").forEach((entry) => {
    const [id, qtyStr] = entry.split(":");
    const qty = parseInt(qtyStr, 10);
    const tarif = state.byId[id];
    if (!tarif || !qty || qty <= 0) return;
    const gamme = tarif.prix_premium != null ? mappedGamme : "standard";
    state.cart.set(id, { qty, gamme });
  });

  // Dates : on dérive un séjour cohérent depuis la durée simulée.
  const dureeSem = parseInt(p.get("duree_semaines"), 10);
  const hasWeekendItem = Array.from(state.cart.keys()).some((id) => isWeekendTarif(state.byId[id]));
  const debut = todayISO();
  let fin;
  if (hasWeekendItem || dureeSem === 0) {
    fin = addDaysISO(debut, WEEKEND_MAX_NIGHTS); // séjour week-end (3 jours)
  } else if (Number.isFinite(dureeSem) && dureeSem >= 1) {
    fin = addDaysISO(debut, dureeSem * 7);
  }
  if (fin) {
    state.sejour.debut = debut;
    state.sejour.fin = fin;
    debutEl.value = debut;
    finEl.value = fin;
    finEl.min = debut;
  }

  // Refléter dans le DOM (quantités, gamme, états actifs)
  syncDOMFromCart();
}

function syncDOMFromCart() {
  $$("[data-kit], [data-addon]").forEach((card) => {
    const id = card.dataset.kit || card.dataset.addon;
    const item = state.cart.get(id);
    const out = $("[data-qty]", card);
    if (out) out.textContent = String(item ? item.qty : 0);
    if (card.dataset.kit) card.dataset.active = item && item.qty > 0 ? "true" : "false";
    if (item && item.gamme) {
      $$("[data-gamme]", card).forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.gamme === item.gamme)));
      const t = state.byId[id];
      const priceEl = $("[data-price]", card);
      if (t && priceEl) {
        const c = item.gamme === "premium" && t.prix_premium != null
          ? toCents(t.prix_premium) : toCents(t.prix_ttc);
        priceEl.textContent = fmtEUR(c);
      }
    }
  });
}

// ── Rendu des kits ─────────────────────────────────────────────────
function renderKits() {
  const grid = $("[data-kit-grid]");
  const kits = state.tarifs
    .filter((t) => t.categorie === "kit")
    .sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
  grid.innerHTML = kits.map(kitCardHTML).join("");
}

function kitCardHTML(t) {
  const compo = t.composition && t.composition.items
    ? t.composition.items.map((i) => `${i.qty}× ${i.label}`).join(" · ") : "";
  const note = t.composition && t.composition.note ? t.composition.note : "";
  const hasPremium = t.prix_premium != null;
  const dureeLabel = t.duree === "weekend" ? "/ week-end" : "/ semaine";
  return `
  <div class="kit-card" data-kit="${t.id}" data-active="false" data-weekend="${isWeekendTarif(t) ? "true" : "false"}">
    <h3>${esc(t.nom)}</h3>
    <div class="kit-card__compo">${esc(compo)}${note ? `<br><em>${esc(note)}</em>` : ""}</div>
    <div class="kit-card__flag" data-flag hidden>Limité à 3 jours — séjour trop long</div>
    ${hasPremium ? `
    <div class="gamme-tabs" role="group" aria-label="Gamme ${esc(t.nom)}">
      <button type="button" data-gamme="standard" aria-pressed="true">Confort</button>
      <button type="button" data-gamme="premium" aria-pressed="false">Premium</button>
    </div>` : ""}
    <div class="kit-card__price"><span data-price>${fmtEUR(toCents(t.prix_ttc))}</span> <span class="unit">${dureeLabel}</span></div>
    <div class="stepper" data-stepper>
      <button type="button" data-dec aria-label="Retirer">−</button>
      <output data-qty>0</output>
      <button type="button" data-inc aria-label="Ajouter">+</button>
    </div>
  </div>`;
}

// ── Rendu des ajouts à la carte ───────────────────────────────────
function renderAddons() {
  const wrap = $("[data-addons]");
  let html = "";
  for (const cat of ADDON_CATEGORIES) {
    const items = state.tarifs
      .filter((t) => t.categorie === cat.key)
      .sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    if (!items.length) continue;
    html += `<div class="addon-cat">${esc(cat.label)}</div><div class="addon-list">`;
    html += items.map(addonRowHTML).join("");
    html += `</div>`;
  }
  wrap.innerHTML = html;
}

function addonRowHTML(t) {
  const weekly = t.categorie === "location";
  const unit = weekly ? "/ semaine" : "/ pièce";
  return `
  <div class="addon-row" data-addon="${t.id}">
    <div class="addon-row__name">${esc(t.nom)}<small>${fmtEUR(toCents(t.prix_ttc))} ${unit}</small></div>
    <div class="stepper" data-stepper>
      <button type="button" data-dec aria-label="Retirer">−</button>
      <output data-qty>0</output>
      <button type="button" data-inc aria-label="Ajouter">+</button>
    </div>
  </div>`;
}

// ── Événements ─────────────────────────────────────────────────────
function bindEvents(form, debutEl, finEl) {
  debutEl.addEventListener("change", () => {
    state.sejour.debut = debutEl.value;
    if (debutEl.value) finEl.min = debutEl.value;
    recompute();
  });
  finEl.addEventListener("change", () => {
    state.sejour.fin = finEl.value;
    recompute();
  });

  document.addEventListener("click", (ev) => {
    const card = ev.target.closest("[data-kit], [data-addon]");
    if (!card) return;
    const id = card.dataset.kit || card.dataset.addon;
    if (ev.target.matches("[data-inc]")) changeQty(id, +1, card);
    else if (ev.target.matches("[data-dec]")) changeQty(id, -1, card);
    else if (ev.target.matches("[data-gamme]")) setGamme(id, ev.target, card);
  });

  form.addEventListener("submit", (ev) => { ev.preventDefault(); submit("pay"); });
  const devisBtn = $("[data-devis]");
  if (devisBtn) devisBtn.addEventListener("click", () => submit("devis"));
}

function changeQty(id, delta, card) {
  const cur = state.cart.get(id) || { qty: 0, gamme: "standard" };
  cur.qty = Math.max(0, cur.qty + delta);
  if (cur.qty === 0) state.cart.delete(id);
  else state.cart.set(id, cur);
  const out = $("[data-qty]", card);
  if (out) out.textContent = String(cur.qty);
  if (card.dataset.kit) card.dataset.active = cur.qty > 0 ? "true" : "false";
  recompute();
}

function setGamme(id, btn, card) {
  const cur = state.cart.get(id) || { qty: 0, gamme: "standard" };
  cur.gamme = btn.dataset.gamme;
  state.cart.set(id, cur);
  if (cur.qty === 0) state.cart.delete(id);
  $$("[data-gamme]", card).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  const t = state.byId[id];
  const priceEl = $("[data-price]", card);
  if (t && priceEl) {
    const c = cur.gamme === "premium" && t.prix_premium != null ? toCents(t.prix_premium) : toCents(t.prix_ttc);
    priceEl.textContent = fmtEUR(c);
  }
  recompute();
}

// ── Calcul + rendu du récap ────────────────────────────────────────
function recompute() {
  const items = Array.from(state.cart.entries()).map(([id, v]) => ({ id, qty: v.qty, gamme: v.gamme }));
  const quote = computeQuote({ items, sejour: state.sejour, tarifs: state.tarifs });

  // Cohérence week-end : désactiver les kits week-end si séjour > 3 jours
  const tooLongForWeekend = quote.nights > 0 && quote.nights > WEEKEND_MAX_NIGHTS;
  $$('[data-kit][data-weekend="true"]').forEach((card) => {
    card.dataset.unavailable = tooLongForWeekend ? "true" : "false";
    const flag = $("[data-flag]", card);
    if (flag) flag.hidden = !tooLongForWeekend;
    if (tooLongForWeekend) {
      const id = card.dataset.kit;
      if (state.cart.has(id)) { state.cart.delete(id); const o = $("[data-qty]", card); if (o) o.textContent = "0"; card.dataset.active = "false"; }
    }
  });
  // Si on a retiré des items, recalculer une fois
  const items2 = Array.from(state.cart.entries()).map(([id, v]) => ({ id, qty: v.qty, gamme: v.gamme }));
  const q = items2.length !== items.length
    ? computeQuote({ items: items2, sejour: state.sejour, tarifs: state.tarifs })
    : quote;

  const info = $("[data-duree-info]");
  if (state.sejour.debut && state.sejour.fin && q.nights > 0) {
    info.textContent = `Séjour de ${q.nights} nuit(s) — ${q.weeks} semaine(s)` +
      (q.free_weeks > 0 ? `, dont ${q.free_weeks} offerte(s).` : ".");
  } else { info.textContent = ""; }

  const linesEl = $("[data-sum-lines]");
  if (!q.lines.length) {
    linesEl.innerHTML = `<p class="sum-empty">Sélectionnez vos kits pour voir le total.</p>`;
  } else {
    let html = q.lines.map((l) => {
      const wk = l.weekly ? ` × ${l.weeks_applied} sem` : "";
      const gamme = l.gamme === "premium" ? " (premium)" : "";
      return `<div class="sum-line"><span>${esc(l.nom)}${gamme} <small>×${l.qty}${wk}</small></span><span>${fmtEUR(l.line_cents)}</span></div>`;
    }).join("");
    if (q.savings_cents > 0) {
      html += `<div class="sum-line sum-offer"><span>Semaine(s) offerte(s)</span><span>−${fmtEUR(q.savings_cents)}</span></div>`;
    }
    linesEl.innerHTML = html;
  }

  // Erreur métier (week-end > 3 jours)
  if (q.errors && q.errors.length) showError(q.errors[0]); else hideError();

  const totalEl = $("[data-sum-total]");
  if (state.devisOnly) totalEl.textContent = "sur devis";
  else totalEl.textContent = q.lines.length ? fmtEUR(q.total_cents) : "—";

  const datesOk = !!(state.sejour.debut && state.sejour.fin && q.nights > 0);
  const cartOk = q.lines.length > 0 && !(q.errors && q.errors.length);

  // Payer : possible si prix calculable (pas Luxe) + dates + panier sain
  $("[data-pay]").disabled = !(cartOk && datesOk && q.total_cents > 0 && !state.devisOnly);
  // Devis : possible dès qu'il y a un panier + dates (même Luxe)
  $("[data-devis]").disabled = !(cartOk && datesOk);

  // Note adaptée si Luxe
  const payNote = $("[data-pay-note]");
  if (payNote) payNote.style.display = state.devisOnly ? "none" : "";

  state._quote = q;
}

// ── Soumission (pay | devis) ───────────────────────────────────────
async function submit(mode) {
  hideError();
  const form = $("[data-cfg-form]");
  if (form._honey && form._honey.value) return;

  const required = ["prenom", "nom", "email", "telephone"];
  for (const name of required) {
    if (!form[name] || !form[name].value.trim()) {
      showError("Merci de compléter vos coordonnées (prénom, nom, email, téléphone).");
      form[name] && form[name].focus();
      return;
    }
  }
  if (!state.sejour.debut || !state.sejour.fin) { showError("Indiquez vos dates d'arrivée et de départ."); return; }
  const items = Array.from(state.cart.entries()).map(([id, v]) => ({ id, qty: v.qty, gamme: v.gamme }));
  if (!items.length) { showError("Votre panier est vide."); return; }
  if (state._quote && state._quote.errors && state._quote.errors.length) { showError(state._quote.errors[0]); return; }

  const payload = {
    items,
    sejour: { debut: state.sejour.debut, fin: state.sejour.fin },
    client: {
      prenom: form.prenom.value.trim(),
      nom: form.nom.value.trim(),
      email: form.email.value.trim(),
      telephone: form.telephone.value.trim(),
      message: (form.message && form.message.value.trim()) || "",
    },
    gamme_simulee: state.devisOnly ? "luxe" : undefined,
    _honey: (form._honey && form._honey.value) || "",
  };

  const btn = mode === "pay" ? $("[data-pay]") : $("[data-devis]");
  const otherBtn = mode === "pay" ? $("[data-devis]") : $("[data-pay]");
  const label = btn.textContent;
  btn.disabled = true; otherBtn.disabled = true;
  btn.textContent = mode === "pay" ? "Redirection vers le paiement…" : "Envoi de la demande…";

  try {
    const endpoint = mode === "pay" ? "/api/checkout" : "/api/devis";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (mode === "pay") {
      if (!res.ok || !data.checkout_url) {
        showError(data.error || "Le paiement n'a pas pu être initialisé. Réessayez ou contactez-nous.");
        resetButtons(btn, otherBtn, label); return;
      }
      window.location.href = data.checkout_url;
    } else {
      if (!res.ok || !data.ok) {
        showError(data.error || "La demande n'a pas pu être envoyée. Réessayez ou contactez-nous.");
        resetButtons(btn, otherBtn, label); return;
      }
      showDevisSuccess();
    }
  } catch (e) {
    showError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    resetButtons(btn, otherBtn, label);
  }
}

function resetButtons(btn, otherBtn, label) {
  btn.textContent = label;
  recompute(); // réactive les boutons selon l'état
}

function showDevisSuccess() {
  const aside = $(".summary__body");
  if (aside) {
    aside.innerHTML = `
      <div style="text-align:center;padding:1rem 0">
        <div style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:#1B2A4A;margin-bottom:.4rem">Demande envoyée, merci ✓</div>
        <p style="color:#374151;font-size:.9rem;line-height:1.6">Notre équipe valide votre demande et vous renvoie votre devis sous 24 h, avec un lien de paiement sécurisé pour confirmer votre réservation.</p>
        <a href="/" class="btn btn-outline btn-sm" style="margin-top:.8rem">Retour à l'accueil</a>
      </div>`;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Utilitaires ────────────────────────────────────────────────────
function toCents(eur) { return Math.round(Number(eur || 0) * 100); }
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function showError(msg) {
  const el = $("[data-cfg-error]");
  el.textContent = msg; el.dataset.show = "true";
}
function hideError() {
  const el = $("[data-cfg-error]");
  el.dataset.show = "false";
}
