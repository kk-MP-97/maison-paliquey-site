/**
 * Maison Paliquey — Configurateur /commander
 * =====================================================================
 * Rend les kits + ajouts à la carte, calcule le total EN LIVE via le
 * moteur partagé (shared/pricing.mjs — la même logique que le serveur),
 * puis poste le panier à /api/checkout qui RECALCULE le prix avant de
 * créer le paiement Mollie. Le navigateur ne décide jamais du prix débité.
 * =====================================================================
 */
import { computeQuote } from "../../shared/pricing.mjs";

const TARIFS_URL = "assets/data/tarifs.json?v=1.0.16";

// Catégories proposées en "ajout à la carte" (hors kits).
const ADDON_CATEGORIES = [
  { key: "location", label: "Location à la pièce — semaine" },
  { key: "forfait", label: "Forfaits" },
];

const state = {
  tarifs: [],
  byId: {},
  cart: new Map(), // id -> { qty, gamme }
  sejour: { debut: "", fin: "" },
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function fmtEUR(cents) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ── Chargement ────────────────────────────────────────────────────
init();

async function init() {
  const form = $("[data-cfg-form]");
  if (!form) return;

  // Bornes de dates : pas de date passée.
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
  recompute();
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
    ? t.composition.items.map((i) => `${i.qty}× ${i.label}`).join(" · ")
    : "";
  const note = t.composition && t.composition.note ? t.composition.note : "";
  const hasPremium = t.prix_premium != null;
  const dureeLabel = t.duree === "weekend" ? "/ week-end" : "/ semaine";
  return `
  <div class="kit-card" data-kit="${t.id}" data-active="false">
    <h3>${esc(t.nom)}</h3>
    <div class="kit-card__compo">${esc(compo)}${note ? `<br><em>${esc(note)}</em>` : ""}</div>
    ${hasPremium ? `
    <div class="gamme-tabs" role="group" aria-label="Gamme ${esc(t.nom)}">
      <button type="button" data-gamme="standard" aria-pressed="true">Standard</button>
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

  // Steppers + gamme (délégation)
  document.addEventListener("click", (ev) => {
    const card = ev.target.closest("[data-kit], [data-addon]");
    if (!card) return;
    const id = card.dataset.kit || card.dataset.addon;

    if (ev.target.matches("[data-inc]")) { changeQty(id, +1, card); }
    else if (ev.target.matches("[data-dec]")) { changeQty(id, -1, card); }
    else if (ev.target.matches("[data-gamme]")) { setGamme(id, ev.target, card); }
  });

  form.addEventListener("submit", onSubmit);
}

function changeQty(id, delta, card) {
  const cur = state.cart.get(id) || { qty: 0, gamme: "standard" };
  cur.qty = Math.max(0, cur.qty + delta);
  if (cur.qty === 0) state.cart.delete(id);
  else state.cart.set(id, cur);

  const out = $("[data-qty]", $(`[data-stepper]`, card));
  if (out) out.textContent = String(cur.qty);
  if (card.dataset.kit) card.dataset.active = cur.qty > 0 ? "true" : "false";
  recompute();
}

function setGamme(id, btn, card) {
  const cur = state.cart.get(id) || { qty: 0, gamme: "standard" };
  cur.gamme = btn.dataset.gamme;
  state.cart.set(id, cur);
  if (cur.qty === 0) state.cart.delete(id);

  $$("[data-gamme]", card).forEach((b) =>
    b.setAttribute("aria-pressed", String(b === btn)));
  // MAJ prix affiché de la carte
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

  // Info durée
  const info = $("[data-duree-info]");
  if (state.sejour.debut && state.sejour.fin && quote.nights > 0) {
    info.textContent = `Séjour de ${quote.nights} nuit(s) — ${quote.weeks} semaine(s)` +
      (quote.free_weeks > 0 ? `, dont ${quote.free_weeks} offerte(s).` : ".");
  } else {
    info.textContent = "";
  }

  // Lignes
  const linesEl = $("[data-sum-lines]");
  if (!quote.lines.length) {
    linesEl.innerHTML = `<p class="sum-empty">Sélectionnez vos kits pour voir le total.</p>`;
  } else {
    let html = quote.lines.map((l) => {
      const wk = l.weekly ? ` × ${l.weeks_applied} sem` : "";
      const gamme = l.gamme === "premium" ? " (premium)" : "";
      return `<div class="sum-line"><span>${esc(l.nom)}${gamme} <small>×${l.qty}${wk}</small></span><span>${fmtEUR(l.line_cents)}</span></div>`;
    }).join("");
    if (quote.savings_cents > 0) {
      html += `<div class="sum-line sum-offer"><span>Semaine(s) offerte(s)</span><span>−${fmtEUR(quote.savings_cents)}</span></div>`;
    }
    linesEl.innerHTML = html;
  }

  $("[data-sum-total]").textContent = quote.lines.length ? fmtEUR(quote.total_cents) : "—";

  // Bouton payer : actif si panier non vide + dates valides
  const ready = quote.lines.length > 0 && quote.total_cents > 0 &&
    state.sejour.debut && state.sejour.fin && quote.nights > 0 && !quote.errors.length;
  $("[data-pay]").disabled = !ready;

  state._quote = quote;
}

// ── Soumission ─────────────────────────────────────────────────────
async function onSubmit(ev) {
  ev.preventDefault();
  hideError();
  const form = ev.currentTarget;

  if (form._honey && form._honey.value) return; // bot
  const required = ["prenom", "nom", "email", "telephone"];
  for (const name of required) {
    if (!form[name] || !form[name].value.trim()) {
      showError("Merci de compléter vos coordonnées (prénom, nom, email, téléphone).");
      form[name] && form[name].focus();
      return;
    }
  }
  if (!state.sejour.debut || !state.sejour.fin) {
    showError("Indiquez vos dates d'arrivée et de départ.");
    return;
  }
  const items = Array.from(state.cart.entries()).map(([id, v]) => ({ id, qty: v.qty, gamme: v.gamme }));
  if (!items.length) { showError("Votre panier est vide."); return; }

  const btn = $("[data-pay]");
  btn.disabled = true;
  const label = btn.textContent;
  btn.textContent = "Redirection vers le paiement…";

  try {
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
      _honey: (form._honey && form._honey.value) || "",
    };
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.checkout_url) {
      showError(data.error || "Le paiement n'a pas pu être initialisé. Réessayez ou contactez-nous.");
      btn.disabled = false;
      btn.textContent = label;
      return;
    }
    window.location.href = data.checkout_url; // → page Mollie
  } catch (e) {
    showError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    btn.disabled = false;
    btn.textContent = label;
  }
}

// ── Utilitaires ────────────────────────────────────────────────────
function toCents(eur) { return Math.round(Number(eur || 0) * 100); }
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function showError(msg) {
  const el = $("[data-cfg-error]");
  el.textContent = msg;
  el.dataset.show = "true";
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}
function hideError() {
  const el = $("[data-cfg-error]");
  el.dataset.show = "false";
}
