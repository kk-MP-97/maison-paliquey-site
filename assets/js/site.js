/* ==========================================================================
   Maison Paliquey — Site vitrine v1.0.0
   JS partagé : menu mobile, scroll reveal, formulaires, mise en surbrillance
   du lien actif. Zéro dépendance, ~1.5 KB minifié.
   ========================================================================== */
(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. Menu mobile — drawer fullscreen
  // ---------------------------------------------------------------------
  var toggle = document.querySelector(".mobile-toggle");
  var drawer = document.querySelector(".mobile-drawer");

  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      drawer.setAttribute("data-open", String(!isOpen));
      document.body.style.overflow = isOpen ? "" : "hidden";
    });

    // Fermer le drawer quand on clique sur un lien
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        drawer.setAttribute("data-open", "false");
        document.body.style.overflow = "";
      });
    });

    // Fermer avec Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") {
        toggle.click();
      }
    });
  }

  // ---------------------------------------------------------------------
  // 2. Surligner le lien de nav de la page courante
  // ---------------------------------------------------------------------
  var path = window.location.pathname.replace(/\/$/, "") || "/";
  var pageName = path === "/" ? "index.html" : path.split("/").pop();
  document.querySelectorAll(".site-nav a, .mobile-drawer a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    var name = href.replace(/\/$/, "").split("/").pop() || "index.html";
    if (name === pageName || (pageName === "index.html" && (href === "/" || href === "index.html"))) {
      a.setAttribute("aria-current", "page");
    }
  });

  // ---------------------------------------------------------------------
  // 3. Scroll reveal — fade-in au scroll via IntersectionObserver
  // ---------------------------------------------------------------------
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) { observer.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  // ---------------------------------------------------------------------
  // 3bis. Affichage conditionnel du champ "entreprise" selon type_client
  // ---------------------------------------------------------------------
  document.querySelectorAll('select[name="type_client"]').forEach(function (sel) {
    var form = sel.closest('form');
    if (!form) return;
    var group = form.querySelector('#f-entreprise-group');
    if (!group) return;
    var input = group.querySelector('input[name="entreprise"]');
    function sync() {
      var isPro = sel.value === 'professionnel';
      group.hidden = !isPro;
      if (input) input.required = isPro;
    }
    sel.addEventListener('change', sync);
    sync();
  });

  // ---------------------------------------------------------------------
  // 4. Formulaires — soumission AJAX vers /api/* (réservation & contact)
  // ---------------------------------------------------------------------
  document.querySelectorAll("form[data-endpoint]").forEach(function (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var endpoint = form.getAttribute("data-endpoint");
      var feedback = form.querySelector(".form-feedback");
      var submitBtn = form.querySelector('[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.textContent : "";

      if (feedback) { feedback.removeAttribute("data-state"); feedback.textContent = ""; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Envoi en cours…"; }

      try {
        var data = Object.fromEntries(new FormData(form).entries());
        // Honeypot anti-spam
        if (data._honey) { throw new Error("spam"); }
        delete data._honey;

        var res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          var errData = await res.json().catch(function () { return {}; });
          throw new Error(errData.error || "Erreur serveur");
        }

        if (feedback) {
          feedback.setAttribute("data-state", "success");
          feedback.textContent = "Merci ! Votre demande a bien été envoyée. Nous vous répondons sous 24 h ouvrées.";
        }
        form.reset();
      } catch (err) {
        if (feedback) {
          feedback.setAttribute("data-state", "error");
          feedback.textContent = "Désolé, l'envoi a échoué. Merci de réessayer ou de nous écrire directement à contact@maisonpaliquey.fr.";
        }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
      }
    });
  });

  // ---------------------------------------------------------------------
  // 5. Année automatique dans le footer
  // ---------------------------------------------------------------------
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }
})();
