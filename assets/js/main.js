/* ==========================================================================
   Elettro SI.CO — main.js  (versione robusta, senza librerie esterne)
   PRINCIPIO: funziona prima, bello poi. Il contenuto è SEMPRE visibile.
   Le animazioni sono solo un miglioramento e non possono MAI nascondere nulla.
   Se questo file va in errore, il sito resta perfettamente leggibile:
   il default in CSS è "tutto visibile", e ogni blocco è isolato in try/catch.
   Niente GSAP, niente ScrollTrigger, niente Lenis, niente scroll-jacking.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  // Segnala che la JS è attiva: solo ora il CSS può nascondere per animare.
  doc.documentElement.classList.add("js");

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  // Esegue una funzione senza mai propagare errori (il resto continua a girare).
  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn("[esico]", e); } }

  /* ---- Reveal on scroll (IntersectionObserver + failsafe) ---------------- */
  function initReveal() {
    var els = doc.querySelectorAll(".anim, .anim-up");
    if (!els.length) return;

    // reduced-motion o niente IntersectionObserver → mostra subito tutto.
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    els.forEach(function (el) { io.observe(el); });

    // FAILSAFE: qualunque cosa accada, dopo il load mostra tutto.
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        doc.querySelectorAll(".anim:not(.is-visible), .anim-up:not(.is-visible)")
          .forEach(function (el) { el.classList.add("is-visible"); });
      }, 1200);
    });
  }

  /* ---- Count-up sulle stat (fail-safe: mostra sempre il numero finale) ---- */
  function initCountUp() {
    var nums = doc.querySelectorAll("[data-count]");
    if (!nums.length) return;

    function finalText(el) {
      return (el.getAttribute("data-prefix") || "") + el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    }
    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (reduce || isNaN(target)) { el.textContent = finalText(el); return; }
      var prefix = el.getAttribute("data-prefix") || "", suffix = el.getAttribute("data-suffix") || "";
      var dur = 1400, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step); else el.textContent = finalText(el);
      }
      requestAnimationFrame(step);
    }

    if (reduce || !("IntersectionObserver" in window)) {
      nums.forEach(function (el) { el.textContent = finalText(el); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { io.observe(el); });
    // failsafe
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        nums.forEach(function (el) { if (!el.dataset.done) el.textContent = finalText(el); });
      }, 2000);
    });
  }

  /* ---- Header: aggiunge sfondo/blur dopo un piccolo scroll --------------- */
  function initHeader() {
    var header = doc.querySelector("[data-header]");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 12); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Nav mobile (hamburger) -------------------------------------------- */
  function closeMobileNav() {
    var nav = doc.querySelector("[data-mobile-nav]");
    var btn = doc.querySelector("[data-nav-toggle]");
    if (nav) nav.classList.remove("is-open");
    if (btn) { btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "Apri il menu"); }
  }
  function initNav() {
    var toggle = doc.querySelector("[data-nav-toggle]");
    var nav = doc.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    });
    // chiudi cliccando un link o con Esc
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeMobileNav(); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { closeMobileNav(); toggle.focus(); }
    });
  }

  /* ---- Sticky tap-to-call su mobile (appare allo scroll) ----------------- */
  function initCallBar() {
    var bar = doc.querySelector("[data-callbar]");
    if (!bar) return;
    var onScroll = function () { bar.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ===== COOKIE CONSENT (Garante/ePrivacy) ================================ */
  var CONSENT_KEY = "esico_consent_v1";
  function getConsent() { try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch (e) { return null; } }
  function saveConsent(obj) {
    obj.ts = new Date().toISOString();
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(obj)); } catch (e) {}
    applyConsent(obj);
  }
  function applyConsent(obj) {
    if (obj && obj.maps) doc.body.setAttribute("data-consent-maps", "1");
    else doc.body.removeAttribute("data-consent-maps");
  }
  function initCookie() {
    var banner = doc.querySelector("[data-cookie]");
    var existing = getConsent();
    if (existing) applyConsent(existing);
    if (!banner) return;

    function open() { banner.hidden = false; requestAnimationFrame(function () { banner.classList.add("is-open"); }); }
    function close() { banner.classList.remove("is-open", "show-prefs"); window.setTimeout(function () { banner.hidden = true; }, 400); }
    if (!existing) open();

    var togAnalytics = banner.querySelector("#pref-analytics");
    var togMaps = banner.querySelector("#pref-maps");

    banner.querySelectorAll("[data-cookie-accept]").forEach(function (b) {
      b.addEventListener("click", function () { saveConsent({ necessary: true, analytics: true, maps: true }); close(); });
    });
    banner.querySelectorAll("[data-cookie-reject]").forEach(function (b) {
      b.addEventListener("click", function () { saveConsent({ necessary: true, analytics: false, maps: false }); close(); });
    });
    banner.querySelectorAll("[data-cookie-prefs]").forEach(function (b) {
      b.addEventListener("click", function () { banner.classList.toggle("show-prefs"); });
    });
    banner.querySelectorAll("[data-cookie-save]").forEach(function (b) {
      b.addEventListener("click", function () {
        saveConsent({ necessary: true, analytics: !!(togAnalytics && togAnalytics.checked), maps: !!(togMaps && togMaps.checked) });
        close();
      });
    });
    doc.querySelectorAll("[data-cookie-open]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        var c = getConsent();
        if (togAnalytics) togAnalytics.checked = !!(c && c.analytics);
        if (togMaps) togMaps.checked = !!(c && c.maps);
        banner.classList.add("show-prefs");
        open();
      });
    });
  }

  /* ---- Mappa click-to-load (nessun cookie di terze parti prima del consenso) */
  function initMap() {
    var map = doc.querySelector("[data-map]");
    if (!map) return;
    var loadBtn = map.querySelector("[data-map-load]");
    var src = map.getAttribute("data-map-src");
    if (!loadBtn || !src) return;
    loadBtn.addEventListener("click", function () {
      var c = getConsent();
      if (!c || !c.maps) {
        var opener = doc.querySelector("[data-cookie-open]");
        if (opener) opener.click();
        return;
      }
      var iframe = doc.createElement("iframe");
      iframe.src = src;
      iframe.title = "Mappa della sede — Via F.lli Picardi 124, Sesto San Giovanni";
      iframe.loading = "lazy";
      iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      iframe.allowFullscreen = true;
      var ph = map.querySelector(".map__placeholder");
      if (ph) ph.remove();
      map.appendChild(iframe);
    });
  }

  /* ---- Form contatti (progressive enhancement) --------------------------- */
  function initForm() {
    var form = doc.querySelector("[data-form]");
    if (!form) return;
    var status = form.querySelector("[data-form-status]");
    form.addEventListener("submit", function (e) {
      if (form.getAttribute("data-endpoint")) return; // backend reale, se presente
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      if (status) { status.setAttribute("data-state", "ok"); status.textContent = "Grazie! Apriamo la tua email per completare l’invio…"; }
      var body = "Nome: " + (data.get("nome") || "") + "\r\nTelefono: " + (data.get("telefono") || "") + "\r\n\r\n" + (data.get("messaggio") || "");
      window.location.href = "mailto:info@elettrosico.it?subject=" +
        encodeURIComponent("Richiesta sopralluogo — dal sito") + "&body=" + encodeURIComponent(body);
    });
  }

  /* ---- Anno corrente nel footer ------------------------------------------ */
  function initYear() {
    doc.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---- Bootstrap (ogni blocco isolato) ----------------------------------- */
  function init() {
    safe(initReveal);
    safe(initCountUp);
    safe(initHeader);
    safe(initNav);
    safe(initCallBar);
    safe(initCookie);
    safe(initMap);
    safe(initForm);
    safe(initYear);
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();
