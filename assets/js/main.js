/* ==========================================================================
   Elettro SI.CO — main.js
   Lenis (smooth scroll) + GSAP + ScrollTrigger. Solo transform/opacity.
   Ogni effetto è protetto da prefers-reduced-motion e degrada senza JS.
   Struttura: motion · reveal · hero · hairline · count-up · works pin ·
              underline draw · cookie consent · sticky call · map · form · nav
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  root.classList.add("js"); // abilita gli stati iniziali del reveal solo con JS

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";

  if (hasGSAP && hasST) window.gsap.registerPlugin(window.ScrollTrigger);

  /* ---- Smooth scroll (Lenis) sincronizzato a ScrollTrigger --------------- */
  var lenis = null;
  if (hasLenis && !reduce) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
    });
    // Un solo loop guida lenis.raf: via gsap.ticker se GSAP c'è, altrimenti RAF proprio.
    if (hasST) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* Anchor smooth scroll (usa Lenis se presente) */
  doc.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id.length < 2) return;
    var target = doc.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.scrollY - 84;
    if (lenis) lenis.scrollTo(top, { duration: 1.1 });
    else window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
    closeMobileNav();
  });

  /* ---- Reveal on scroll (opacity + translateY, stagger sui gruppi) ------- */
  function initReveal() {
    if (reduce || !hasST) {
      // niente animazione → mostra tutto
      doc.querySelectorAll(".anim, .anim-up").forEach(function (el) {
        el.style.opacity = "1"; el.style.transform = "none";
      });
      return;
    }
    var gsap = window.gsap;

    // elementi singoli
    gsap.utils.toArray(".anim, .anim-up").forEach(function (el) {
      if (el.closest("[data-stagger]")) return; // gestiti dal gruppo
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    // gruppi con stagger
    gsap.utils.toArray("[data-stagger]").forEach(function (group) {
      var items = group.querySelectorAll(".anim, .anim-up");
      gsap.to(items, {
        opacity: 1, y: 0, duration: 0.75, ease: "power3.out", stagger: 0.09,
        scrollTrigger: { trigger: group, start: "top 82%" }
      });
    });
  }

  /* ---- Hero: reveal a maschera delle righe + fade-up ritardato ----------- */
  function initHero() {
    var hero = doc.querySelector("[data-hero]");
    if (!hero) return;
    if (reduce || !hasGSAP) {
      hero.querySelectorAll(".reveal-lines .line > span").forEach(function (s) { s.style.transform = "none"; });
      hero.querySelectorAll(".anim, .anim-up").forEach(function (el) { el.style.opacity = "1"; el.style.transform = "none"; });
      return;
    }
    var gsap = window.gsap;
    var tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo(hero.querySelectorAll(".reveal-lines .line > span"),
      { yPercent: 105 },
      { yPercent: 0, duration: 1.0, ease: "expo.out", stagger: 0.075 });
    tl.to(hero.querySelectorAll("[data-hero-fade]"), {
      opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.12
    }, "-=0.55");

    // micro-parallax sullo sfondo
    if (hasST) {
      var bg = hero.querySelector("[data-hero-parallax]");
      if (bg) {
        gsap.to(bg, {
          yPercent: 12, ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
        });
      }
    }
  }

  /* ---- Hairline che si disegna (scaleX) ---------------------------------- */
  function initRules() {
    if (reduce || !hasST) return;
    var gsap = window.gsap;
    gsap.utils.toArray("[data-rule]").forEach(function (el) {
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1, duration: 1.0, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%" }
      });
    });
  }

  /* ---- Parallax leggero sulle immagini ----------------------------------- */
  function initParallax() {
    if (reduce || !hasST) return;
    var gsap = window.gsap;
    gsap.utils.toArray("[data-parallax]").forEach(function (el) {
      var amt = parseFloat(el.getAttribute("data-parallax")) || 8;
      gsap.fromTo(el, { yPercent: -amt }, {
        yPercent: amt, ease: "none",
        scrollTrigger: { trigger: el.closest(".frame") || el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* ---- Count-up sulle stat ----------------------------------------------- */
  function initCountUp() {
    var nums = doc.querySelectorAll("[data-count]");
    if (!nums.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var dur = 1400;
      if (reduce) { el.textContent = prefix + target + suffix; return; }
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        el.textContent = prefix + val + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (hasST) {
      nums.forEach(function (el) {
        window.ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: function () { run(el); } });
      });
    } else if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
      }, { threshold: 0.4 });
      nums.forEach(function (el) { io.observe(el); });
    } else {
      nums.forEach(run);
    }
  }

  /* ---- Lavori: galleria pinnata con scrub orizzontale -------------------- */
  function initWorks() {
    var pin = doc.querySelector("[data-works-pin]");
    if (!pin) return;
    var track = pin.querySelector("[data-works-track]");
    if (!track) return;

    var mobile = window.matchMedia("(max-width: 760px)").matches;
    if (reduce || !hasST || mobile) {
      pin.classList.add("is-static"); // scroll orizzontale nativo, leggibile
      return;
    }
    var gsap = window.gsap;

    var st = window.ScrollTrigger.create({
      trigger: pin,
      start: "top top",
      end: function () { return "+=" + (track.scrollWidth - window.innerWidth + 120); },
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      animation: gsap.to(track, {
        x: function () { return -(track.scrollWidth - window.innerWidth + 80); },
        ease: "none"
      })
    });
    return st;
  }

  /* ---- Underline disegnato a mano (SVG draw-on) -------------------------- */
  function initUnderlines() {
    // Default (CSS): tratto pieno → leggibile senza JS e con reduced-motion.
    // Con GSAP animiamo il "disegno" applicando il dash solo durante l'animazione.
    if (reduce || !hasST) return;
    var gsap = window.gsap;
    doc.querySelectorAll(".mark__ul path").forEach(function (path) {
      try { path.setAttribute("pathLength", "1"); } catch (e) {}
      gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.to(path, {
        strokeDashoffset: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: path.closest(".mark") || path, start: "top 82%", once: true }
      });
    });
  }

  /* ---- Header: blur/border al primo scroll ------------------------------- */
  function initHeader() {
    var header = doc.querySelector("[data-header]");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Nav mobile -------------------------------------------------------- */
  function closeMobileNav() {
    var nav = doc.querySelector("[data-mobile-nav]");
    var btn = doc.querySelector("[data-nav-toggle]");
    if (nav) nav.classList.remove("is-open");
    if (btn) { btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "Apri il menu"); }
  }

  /* ---- Sticky tap-to-call su mobile (appare allo scroll) ----------------- */
  function initCallBar() {
    var bar = doc.querySelector("[data-callbar]");
    if (!bar) return;
    function onScroll() { bar.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ===== COOKIE CONSENT (Garante/ePrivacy) ================================
     - Banner alla prima visita, prima di caricare cookie non necessari.
     - Accetta tutti / Rifiuta tutti / Preferenze, pari evidenza.
     - Nessuna casella pre-selezionata. X ≠ consenso.
     - Salva in localStorage. Revoca via [data-cookie-open].
     ====================================================================== */
  var CONSENT_KEY = "esico_consent_v1";

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY)); }
    catch (e) { return null; }
  }
  function saveConsent(obj) {
    obj.ts = new Date().toISOString();
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(obj)); } catch (e) {}
    applyConsent(obj);
  }
  function applyConsent(obj) {
    // Sblocca le terze parti solo con consenso (es. mappa).
    if (obj && obj.maps) doc.body.setAttribute("data-consent-maps", "1");
    else doc.body.removeAttribute("data-consent-maps");
    // (analitici: attivare qui il loader solo se obj.analytics === true)
  }

  function initCookie() {
    var banner = doc.querySelector("[data-cookie]");
    var existing = getConsent();
    if (existing) applyConsent(existing);
    if (!banner) return;

    function openBanner() {
      banner.hidden = false;
      requestAnimationFrame(function () { banner.classList.add("is-open"); });
    }
    function closeBanner() {
      banner.classList.remove("is-open", "show-prefs");
      window.setTimeout(function () { banner.hidden = true; }, 400);
    }

    // prima visita → apri (X non equivale a consenso: non c'è la X)
    if (!existing) openBanner();

    var togAnalytics = banner.querySelector("#pref-analytics");
    var togMaps = banner.querySelector("#pref-maps");

    banner.querySelectorAll("[data-cookie-accept]").forEach(function (b) {
      b.addEventListener("click", function () {
        saveConsent({ necessary: true, analytics: true, maps: true });
        closeBanner();
      });
    });
    banner.querySelectorAll("[data-cookie-reject]").forEach(function (b) {
      b.addEventListener("click", function () {
        saveConsent({ necessary: true, analytics: false, maps: false });
        closeBanner();
      });
    });
    banner.querySelectorAll("[data-cookie-prefs]").forEach(function (b) {
      b.addEventListener("click", function () { banner.classList.toggle("show-prefs"); });
    });
    banner.querySelectorAll("[data-cookie-save]").forEach(function (b) {
      b.addEventListener("click", function () {
        saveConsent({
          necessary: true,
          analytics: !!(togAnalytics && togAnalytics.checked),
          maps: !!(togMaps && togMaps.checked)
        });
        closeBanner();
      });
    });

    // revoca / riapertura da footer
    doc.querySelectorAll("[data-cookie-open]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        var c = getConsent();
        if (togAnalytics) togAnalytics.checked = !!(c && c.analytics);
        if (togMaps) togMaps.checked = !!(c && c.maps);
        banner.classList.add("show-prefs");
        openBanner();
      });
    });
  }

  /* ---- Mappa click-to-load (nessun cookie prima del consenso) ------------ */
  function initMap() {
    var map = doc.querySelector("[data-map]");
    if (!map) return;
    var loadBtn = map.querySelector("[data-map-load]");
    var src = map.getAttribute("data-map-src");
    if (!loadBtn || !src) return;

    loadBtn.addEventListener("click", function () {
      var c = getConsent();
      if (!c || !c.maps) {
        // apri le preferenze cookie: la mappa richiede consenso terze parti
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
      // Nessun endpoint configurato: mostriamo un fallback chiaro.
      // TODO: collegare a un endpoint (es. Formspree / Vercel function).
      if (form.getAttribute("data-endpoint")) return; // lascia inviare al backend reale
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      var tel = encodeURIComponent(data.get("telefono") || "");
      var msg = encodeURIComponent(data.get("messaggio") || "");
      var nome = encodeURIComponent(data.get("nome") || "");
      if (status) {
        status.setAttribute("data-state", "ok");
        status.textContent = "Grazie! Apriamo la tua email per completare l’invio…";
      }
      var body = "Nome: " + decodeURIComponent(nome) + "%0D%0ATelefono: " + decodeURIComponent(tel) + "%0D%0A%0D%0A" + decodeURIComponent(msg);
      window.location.href = "mailto:info@elettrosico.it?subject=" +
        encodeURIComponent("Richiesta sopralluogo — dal sito") + "&body=" + body;
    });
  }

  /* ---- Anno corrente nel footer ------------------------------------------ */
  function initYear() {
    doc.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---- Bootstrap --------------------------------------------------------- */
  function init() {
    initHeader();
    initHero();
    initReveal();
    initRules();
    initParallax();
    initCountUp();
    initWorks();
    initUnderlines();
    initCookie();
    initCallBar();
    initMap();
    initForm();
    initYear();

    // toggle nav mobile
    var toggle = doc.querySelector("[data-nav-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var nav = doc.querySelector("[data-mobile-nav]");
        var open = nav && nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
      });
      // chiudi con Esc
      doc.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          var nav = doc.querySelector("[data-mobile-nav]");
          if (nav && nav.classList.contains("is-open")) { closeMobileNav(); toggle.focus(); }
        }
      });
    }

    if (hasST) window.ScrollTrigger.refresh();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();

  // ricalcola i trigger quando i font caricano (evita salti di layout)
  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready.then(function () { if (hasST) window.ScrollTrigger.refresh(); });
  }
})();
