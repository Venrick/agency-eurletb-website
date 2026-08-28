/* i18n.js - shared language switcher - EURL ETB Achouri Toufik */
(function () {
  var style = document.createElement("style");
  style.textContent =
    "html,body{overflow-x:hidden}" +
    ".lang-btn{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:1.5px;line-height:1;padding:4px 10px;border:none;border-radius:2px;background:transparent;color:rgba(255,255,255,.6);cursor:pointer;transition:color .2s ease,background-color .2s ease}" +
    ".lang-btn:hover{color:#fff}" +
    ".lang-btn.active{background:#c19f5d;color:#1e243c}" +
    ".lang-compact{position:relative}" +
    ".lang-compact-btn{display:flex;align-items:center;gap:6px;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:11px;letter-spacing:1.5px;line-height:1;padding:7px 10px;border:1px solid rgba(193,159,93,.35);border-radius:3px;background:transparent;color:#fff;cursor:pointer;transition:border-color .2s ease}" +
    ".lang-compact-btn:hover{border-color:rgba(193,159,93,.65)}" +
    ".lang-globe{width:13px;height:13px;stroke:#c19f5d;flex-shrink:0}" +
    ".lang-caret{width:9px;height:9px;stroke:rgba(255,255,255,.7);flex-shrink:0;transition:transform .2s ease}" +
    ".lang-compact.open .lang-caret{transform:rotate(180deg)}" +
    ".lang-menu{position:absolute;top:calc(100% + 6px);inset-inline-start:0;z-index:130;min-width:148px;background:#1e243c;border:1px solid rgba(193,159,93,.35);border-radius:4px;box-shadow:0 10px 28px rgba(0,0,0,.4);padding:4px}" +
    ".lang-opt{display:block;width:100%;text-align:start;font-family:'Barlow Condensed',sans-serif;font-size:12.5px;font-weight:600;letter-spacing:1.1px;line-height:1.2;padding:9px 10px;border:none;border-radius:2px;background:transparent;color:rgba(255,255,255,.78);cursor:pointer;transition:background-color .15s ease,color .15s ease}" +
    ".lang-opt:hover{background:rgba(193,159,93,.16);color:#fff}" +
    ".lang-opt-code{color:#c19f5d;font-size:10.5px;letter-spacing:1.5px}" +
    ".lang-sep{color:rgba(255,255,255,.35)}" +
    "@media(max-width:768px){" +
      "#mainbar{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}" +
      "#mainbar>div{display:contents}" +
      "#mainbar>a{grid-column:2;grid-row:1;justify-self:center}" +
      "#mainbar .lang-compact{grid-column:1;grid-row:1;justify-self:start}" +
      "#mainbar .lang-compact-btn{min-height:44px}" +
      "#mainbar .hamburger{grid-column:3;grid-row:1;justify-self:end;min-width:44px;min-height:44px;align-items:center;justify-content:center}" +
    "}" +
    "@media(max-width:1023px) and (min-width:769px){.nav-desktop{gap:12px !important}}" +
    "html[dir=rtl] #hero-content{margin-left:0 !important;margin-right:0}" +
    "@media(min-width:768px){html[dir=rtl] #hero-content{margin-right:48px !important}}" +
    "@media(min-width:1024px){html[dir=rtl] #hero-content{margin-right:96px !important}}" +
    "html[dir=rtl] #hero-overlay{background:linear-gradient(-105deg,rgba(15,19,35,0.88) 45%,rgba(15,19,35,0.55) 100%) !important}" +
    "html[dir=rtl] .corner-tl{left:auto !important;right:48px !important;border-right:2px solid #c19f5d;border-left:none}" +
    "html[dir=rtl] .corner-br{right:auto !important;left:48px !important;border-left:2px solid #c19f5d;border-right:none}" +
    "html[dir=rtl] .hero-vline{right:auto !important;left:38%}" +
    "html[dir=rtl] .hero-circle{right:auto !important;left:15%}" +
    "html[dir=rtl] .hero-dots{right:auto !important;left:10%}" +
    "html[dir=rtl] .font-condensed,html[dir=rtl] .nav-link,html[dir=rtl] .nav-drawer a,html[dir=rtl] .fnav-link,html[dir=rtl] .lang-opt,html[dir=rtl] .lang-compact-btn{letter-spacing:0 !important}";
  document.head.appendChild(style);
  var I18N = {
    en: {
      "nav.home":"Home","nav.about":"About","nav.services":"Services",
      "nav.companies":"Companies","nav.projects":"Projects",
      "nav.quality":"Quality & HSE","nav.contact":"Contact",
      "topbar.call":"Call","topbar.email":"Email",
      "hero.eyebrow":"Excellence in Construction",
      "hero.headline":"Building the <span class=\"text-gold\">Future</span><br>With Precision<br>&amp; Integrity",
      "hero.sub":"EURL ETB Achouri Toufik delivers world-class construction solutions, merging architectural innovation with industrial strength.",
      "hero.btn_projects":"View Our Projects \u2192","hero.btn_quote":"Get a Quote",
      "footer.tagline":"Building tomorrow's landmarks with precision, integrity, and an unwavering commitment to quality craftsmanship since 2009.",
      "footer.address":"Zone Industrielle, Blida, Algeria",
      "footer.nav_title":"Navigation","footer.nav_home":"Home","footer.nav_about":"About Us",
      "footer.nav_services":"Services","footer.nav_projects":"Projects",
      "footer.nav_quality":"Quality & HSE","footer.nav_contact":"Contact",
      "footer.services_title":"Core Services",
      "footer.svc_residential":"Residential Construction","footer.svc_commercial":"Commercial Buildings",
      "footer.svc_industrial":"Industrial Works","footer.svc_renovation":"Renovation & Retrofit",
      "footer.svc_pm":"Project Management","footer.svc_arch":"Architectural Design",
      "footer.talk_title":"Let's Talk",
      "footer.talk_desc":"Have a project in mind? We'd love to hear about it.",
      "footer.talk_btn":"Contact Us \u2192","footer.rights":"All rights reserved."
    },
    fr: {
      "nav.home":"Accueil","nav.about":"\u00C0 propos","nav.services":"Services",
      "nav.companies":"Entreprises","nav.projects":"Projets",
      "nav.quality":"Qualit\u00E9 & HSE","nav.contact":"Contact",
      "topbar.call":"Appeler","topbar.email":"E-mail",
      "hero.eyebrow":"Excellence dans la Construction",
      "hero.headline":"Construire l'<span class=\"text-gold\">Avenir</span><br>Avec Pr\u00E9cision<br>&amp; Int\u00E9grit\u00E9",
      "hero.sub":"EURL ETB Achouri Toufik livre des solutions de construction de classe mondiale, alliant innovation architecturale et solidit\u00E9 industrielle.",
      "hero.btn_projects":"Voir Nos Projets \u2192","hero.btn_quote":"Obtenir un Devis",
      "footer.tagline":"B\u00E2tir les rep\u00E8res de demain avec pr\u00E9cision, int\u00E9grit\u00E9 et un engagement sans faille pour un savoir-faire de qualit\u00E9 depuis 2009.",
      "footer.address":"Zone Industrielle, Blida, Alg\u00E9rie",
      "footer.nav_title":"Navigation","footer.nav_home":"Accueil","footer.nav_about":"\u00C0 propos",
      "footer.nav_services":"Services","footer.nav_projects":"Projets",
      "footer.nav_quality":"Qualit\u00E9 & HSE","footer.nav_contact":"Contact",
      "footer.services_title":"Services Principaux",
      "footer.svc_residential":"Construction R\u00E9sidentielle","footer.svc_commercial":"B\u00E2timents Commerciaux",
      "footer.svc_industrial":"Travaux Industriels","footer.svc_renovation":"R\u00E9novation & Modernisation",
      "footer.svc_pm":"Gestion de Projets","footer.svc_arch":"Conception Architecturale",
      "footer.talk_title":"Parlons-en",
      "footer.talk_desc":"Un projet en t\u00EAte\u00A0? Nous serions ravis d'en entendre parler.",
      "footer.talk_btn":"Contactez-Nous \u2192","footer.rights":"Tous droits r\u00E9serv\u00E9s."
    },
    ar: {
      "nav.home":"\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629","nav.about":"\u0645\u0646 \u0646\u062D\u0646",
      "nav.services":"\u062E\u062F\u0645\u0627\u062A\u0646\u0627","nav.companies":"\u0634\u0631\u0643\u0627\u062A\u0646\u0627",
      "nav.projects":"\u0645\u0634\u0627\u0631\u064A\u0639\u0646\u0627",
      "nav.quality":"\u0627\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u0633\u0644\u0627\u0645\u0629",
      "nav.contact":"\u0627\u062A\u0635\u0644 \u0628\u0646\u0627",
      "topbar.call":"\u0627\u062A\u0635\u0644","topbar.email":"\u0628\u0631\u064A\u062F",
      "hero.eyebrow":"\u0646\u062A\u0645\u064A\u0651\u0632 \u0641\u064A \u0627\u0644\u0628\u0646\u0627\u0621",
      "hero.headline":"\u0646\u0628\u0646\u064A <span class=\"text-gold\">\u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644</span><br>\u0628\u0625\u062A\u0642\u0627\u0646 \u0648\u0623\u0645\u0627\u0646\u0629",
      "hero.sub":"\u0645\u0624\u0633\u0633\u0629 \u0639\u0627\u0634\u0648\u0631\u064A \u062A\u0648\u0641\u064A\u0642 \u062A\u0642\u062F\u0645 \u062D\u0644\u0648\u0644\u0627\u064B \u0625\u0646\u0634\u0627\u0626\u064A\u0629 \u0639\u0627\u0644\u0645\u064A\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u0649\u060C \u062A\u062C\u0645\u0639 \u0628\u064A\u0646 \u0627\u0644\u0625\u0628\u062F\u0627\u0639 \u0641\u064A \u0627\u0644\u062A\u0635\u0645\u064A\u0645 \u0648\u0627\u0644\u0645\u062A\u0627\u0646\u0629 \u0641\u064A \u0627\u0644\u062A\u0646\u0641\u064A\u0630.",
      "hero.btn_projects":"\u0634\u0627\u0647\u062F \u0623\u0639\u0645\u0627\u0644\u0646\u0627 \u2190",
      "hero.btn_quote":"\u0627\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631",
      "footer.tagline":"\u0646\u0628\u0646\u064A \u0645\u0639\u0627\u0644\u0645 \u0627\u0644\u063A\u062F \u0628\u062F\u0642\u0629 \u0648\u0646\u0632\u0627\u0647\u0629 \u0648\u0627\u0644\u062A\u0632\u0627\u0645 \u0631\u0627\u0633\u062E \u0628\u0627\u0644\u062C\u0648\u062F\u0629 \u0627\u0644\u062D\u0631\u0641\u064A\u0629 \u0645\u0646\u0630 \u0639\u0627\u0645 2009.",
      "footer.address":"\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629\u060C \u0627\u0644\u0628\u0644\u064A\u062F\u0629\u060C \u0627\u0644\u062C\u0632\u0627\u0626\u0631",
      "footer.nav_title":"\u0627\u0644\u062A\u0646\u0642\u0644",
      "footer.nav_home":"\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629","footer.nav_about":"\u0645\u0646 \u0646\u062D\u0646",
      "footer.nav_services":"\u062E\u062F\u0645\u0627\u062A\u0646\u0627","footer.nav_projects":"\u0645\u0634\u0627\u0631\u064A\u0639\u0646\u0627",
      "footer.nav_quality":"\u0627\u0644\u062C\u0648\u062F\u0629 \u0648\u0627\u0644\u0633\u0644\u0627\u0645\u0629",
      "footer.nav_contact":"\u0627\u062A\u0635\u0644 \u0628\u0646\u0627",
      "footer.services_title":"\u062E\u062F\u0645\u0627\u062A\u0646\u0627 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629",
      "footer.svc_residential":"\u0627\u0644\u0628\u0646\u0627\u0621 \u0627\u0644\u0633\u0643\u0646\u064A",
      "footer.svc_commercial":"\u0627\u0644\u0645\u0628\u0627\u0646\u064A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
      "footer.svc_industrial":"\u0627\u0644\u0623\u0634\u063A\u0627\u0644 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629",
      "footer.svc_renovation":"\u0627\u0644\u062A\u062C\u062F\u064A\u062F \u0648\u0627\u0644\u062A\u0623\u0647\u064A\u0644",
      "footer.svc_pm":"\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639",
      "footer.svc_arch":"\u0627\u0644\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u0645\u0639\u0645\u0627\u0631\u064A",
      "footer.talk_title":"\u062F\u0639\u0646\u0627 \u0646\u062A\u062D\u062F\u062B",
      "footer.talk_desc":"\u0647\u0644 \u0644\u062F\u064A\u0643 \u0645\u0634\u0631\u0648\u0639 \u0641\u064A \u0630\u0647\u0646\u0643\u061F \u064A\u0633\u0639\u062F\u0646\u0627 \u0633\u0645\u0627\u0639 \u0641\u0643\u0631\u062A\u0643.",
      "footer.talk_btn":"\u0627\u062A\u0635\u0644 \u0628\u0646\u0627 \u2190",
      "footer.rights":"\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629."
    }
  };
  var STORAGE_KEY = "site-lang";
  var LANG_META = { en: "English", fr: "Fran\u00E7ais", ar: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" };
  var LANG_CODES = ["en", "fr", "ar"];

  function closeCompact() {
    document.querySelectorAll(".lang-compact").forEach(function (box) {
      box.classList.remove("open");
      var menu = box.querySelector(".lang-menu");
      var btn  = box.querySelector(".lang-compact-btn");
      if (menu) menu.hidden = true;
      if (btn)  btn.setAttribute("aria-expanded", "false");
    });
  }

  function openCompact(box) {
    closeCompact();
    box.classList.add("open");
    var menu = box.querySelector(".lang-menu");
    var btn  = box.querySelector(".lang-compact-btn");
    if (menu) menu.hidden = false;
    if (btn)  btn.setAttribute("aria-expanded", "true");
  }

  function syncCompact(lang) {
    document.querySelectorAll(".lang-compact").forEach(function (box) {
      var current = box.querySelector(".lang-current");
      var menu    = box.querySelector(".lang-menu");
      if (current) current.textContent = lang.toUpperCase();
      if (!menu) return;
      menu.innerHTML = "";
      LANG_CODES.forEach(function (c) {
        if (c === lang) return;
        var opt = document.createElement("button");
        opt.type = "button";
        opt.className = "lang-opt";
        opt.setAttribute("data-lang", c);
        opt.setAttribute("role", "menuitem");
        opt.innerHTML = LANG_META[c] + " <span class=\"lang-sep\">-</span> <span class=\"lang-opt-code\">" + c.toUpperCase() + "</span>";
        opt.addEventListener("click", function () { applyI18n(c); closeCompact(); });
        menu.appendChild(opt);
      });
    });
  }

  function applyI18n(lang) {
    var t = I18N[lang] || I18N.en;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (Object.prototype.hasOwnProperty.call(t, key)) el.textContent = t[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (Object.prototype.hasOwnProperty.call(t, key)) el.innerHTML = t[key];
    });
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
    syncCompact(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  function currentLang() {
    try {
      var p = new URLSearchParams(window.location.search);
      var q = p.get("lang");
      if (q && I18N[q]) return q;
      var saved = localStorage.getItem(STORAGE_KEY);
      if (I18N[saved]) return saved;
    } catch (e) {}
    return "en";
  }

  /* Footer active link: uses data-i18n attr so it works under all languages */
  function highlightFooterLink() {
    var currentPage   = window.location.pathname.split("/").pop() || "index.html";
    var isServicePage = /^service-.*\.html$/.test(currentPage);
    document.querySelectorAll("[data-i18n=\'footer.nav_title\']").forEach(function (titleEl) {
      var ul = titleEl.parentElement && titleEl.parentElement.querySelector("ul");
      if (!ul) return;
      ul.querySelectorAll("a.fnav-link").forEach(function (a) {
        var href   = a.getAttribute("href");
        var active = href === currentPage || (isServicePage && href === "services.html");
        a.classList.toggle("text-gold",     active);
        a.classList.toggle("text-white/55", !active);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyI18n(currentLang());
    highlightFooterLink();
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { applyI18n(btn.getAttribute("data-lang")); });
    });
    document.querySelectorAll(".lang-compact").forEach(function (box) {
      var btn = box.querySelector(".lang-compact-btn");
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var menu = box.querySelector(".lang-menu");
        if (menu && !menu.hidden) closeCompact(); else openCompact(box);
      });
    });
    document.addEventListener("click",   function (e) { if (!e.target.closest(".lang-compact")) closeCompact(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCompact(); });
  });

})();
