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
    "html[dir=rtl] .timeline-item{padding-left:0 !important;padding-right:32px !important}html[dir=rtl] .timeline-item::before{left:auto !important;right:0 !important}html[dir=rtl] .timeline-item::after{left:auto !important;right:4px !important}html[dir=rtl] .value-card::before{left:auto;right:0}" +
    "html[dir=rtl] .font-condensed,html[dir=rtl] .nav-link,html[dir=rtl] .nav-drawer a,html[dir=rtl] .fnav-link,html[dir=rtl] .lang-opt,html[dir=rtl] .lang-compact-btn{letter-spacing:0 !important}"+

    "/* footer (shared, single source of truth) */"+
    ".fnav-link{transition:color .2s,padding-left .2s;display:flex;align-items:center;gap:0}"+
    ".fnav-link::before{content:'';width:0;height:1px;background:#c19f5d;display:inline-block;transition:width .2s,margin-right .2s}"+
    ".fnav-link:hover{color:#fff !important;padding-left:4px}"+
    ".fnav-link:hover::before{width:14px;margin-right:6px}"+
    ".footer-topline{height:3px;background:linear-gradient(to right,transparent,#c19f5d 20%,#c19f5d 80%,transparent)}";
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
      "footer.talk_btn":"Contact Us \u2192","footer.rights":"All rights reserved.",
      "about.title":"About Us — EURL ETB Achouri Toufik",
      "about.breadcrumb_home":"Home",
      "about.breadcrumb_current":"About Us",
      "about.hero_eyebrow":"Who We Are",
      "about.hero_headline":"Built on Trust.<br><span class=\"text-gold\">Driven by Excellence.</span>",
      "about.hero_sub":"For over 15 years, EURL ETB Achouri Toufik has delivered construction projects that stand the test of time — from residential homes to large-scale industrial facilities across Algeria.",
      "about.story_eyebrow":"Our Story",
      "about.story_headline":"15 Years of Building<br>Algeria's <span class=\"text-gold\">Infrastructure</span>",
      "about.story_lead":"Founded in 2009 by Toufik Achouri, our company began as a small contracting firm with a clear mission — to deliver construction projects that prioritize quality, safety, and client satisfaction above all else. Over the years, we have grown into a fully integrated construction group trusted by both private clients and public institutions across Algeria.",
      "about.story_alt_site":"Construction site",
      "about.story_alt_plan":"Blueprint planning",
      "about.timeline_2009_label":"2009 — Founded",
      "about.timeline_2009_text":"EURL ETB Achouri Toufik established in Blida, Algeria, with a focus on residential construction.",
      "about.timeline_2013_label":"2013 — Expansion",
      "about.timeline_2013_text":"Expanded into commercial and industrial projects, growing the team to over 30 engineers and technicians.",
      "about.timeline_2018_label":"2018 — Certification",
      "about.timeline_2018_text":"Achieved ISO 9001 quality management certification and launched our heavy machinery division.",
      "about.timeline_2024_label":"2024 — Today",
      "about.timeline_2024_text":"240+ projects completed, 50+ expert engineers, and a reputation for delivering on time, every time.",
      "about.mission_eyebrow":"What Drives Us",
      "about.mission_heading":"Mission & Vision",
      "about.mission_title":"Our Mission",
      "about.mission_body":"To deliver construction projects of the highest quality — on time and within budget — while maintaining the safety of our workforce and the trust of our clients. We are committed to building structures that last generations and relationships that endure.",
      "about.vision_title":"Our Vision",
      "about.vision_body":"To become Algeria's most trusted construction group — recognized not only for the scale of our projects but for the integrity with which we execute them. We envision a future where every community we build in is stronger because of our presence.",
      "about.values_eyebrow":"What We Stand For",
      "about.values_heading":"Our Core Values",
      "about.val_integrity_title":"Integrity",
      "about.val_integrity_body":"We operate with full transparency in every project. Our clients always know exactly what to expect — no surprises, no shortcuts.",
      "about.val_excellence_title":"Excellence",
      "about.val_excellence_body":"We hold ourselves to the highest standards — from the materials we source to the precision of our execution on every project.",
      "about.val_teamwork_title":"Teamwork",
      "about.val_teamwork_body":"Our strength lies in our people. Every engineer, technician, and site worker is a valued member of a team that moves as one.",
      "about.val_client_title":"Client Focus",
      "about.val_client_body":"Our clients are at the center of every decision we make. Their vision drives our work, and their satisfaction defines our success.",
      "about.val_reliability_title":"Reliability",
      "about.val_reliability_body":"Deadlines are commitments. We plan meticulously and execute with discipline so that every project is delivered on schedule.",
      "about.val_safety_title":"Safety First",
      "about.val_safety_body":"The wellbeing of our workforce is non-negotiable. We maintain rigorous safety protocols on every site, every day, without exception.",
      "about.stat_years":"Years Experience",
      "about.stat_projects":"Projects Completed",
      "about.stat_engineers":"Expert Engineers",
      "about.stat_awards":"Awards Won",
      "about.certs_eyebrow":"Recognition",
      "about.certs_heading":"Certifications & Awards",
      "about.certs_subtitle":"Our work has been recognized by leading industry bodies — a testament to our unwavering commitment to quality and safety.",
      "about.cert_iso_title":"ISO 9001",
      "about.cert_iso_sub":"Quality Management Systems Certified",
      "about.cert_ohsas_title":"OHSAS 18001",
      "about.cert_ohsas_sub":"Occupational Health & Safety Standard",
      "about.cert_award_title":"Best Contractor",
      "about.cert_award_sub":"Algeria Construction Awards 2022",
      "about.cert_license_title":"Licensed & Bonded",
      "about.cert_license_sub":"Ministry of Construction Algeria",
      "about.cta_heading":"Ready to Start Your <span class=\"text-gold\">Next Project?</span>",
      "about.cta_sub":"Let's talk about what you're building. Our team is ready to bring your vision to life with precision and expertise.",
      "about.cta_btn_quote":"Get a Free Quote →",
      "about.cta_btn_work":"View Our Work",
      "services.title":"Services | EURL ETB Achouri Toufik",
      "services.breadcrumb_home":"Home",
      "services.breadcrumb_current":"Services",
      "services.hero_eyebrow":"Our Expertise",
      "services.hero_headline":"Comprehensive <span class=\"text-gold\">Construction</span> Services",
      "services.hero_sub":"From residential homes to large-scale industrial facilities, we deliver tailored solutions with precision and integrity.",
      "services.grid_eyebrow":"What We Offer",
      "services.grid_headline":"Built for Every <span class=\"text-gold\">Scale</span>",
      "services.card_residential_desc":"Custom single-family homes, multi-unit residential complexes, and apartment buildings crafted with premium materials and modern architectural design standards.",
      "services.card_commercial_desc":"Office complexes, retail centres, and mixed-use commercial facilities engineered for operational efficiency and long-term durability.",
      "services.card_industrial_desc":"Warehouses, production facilities, and logistics hubs engineered for heavy-duty operations and long-term durability.",
      "services.card_renovation_desc":"Structural reinforcements, interior remodeling, and full-scale refurbishment of existing buildings, breathing new life into aging infrastructure with modern finishes.",
      "services.card_pm_desc":"End-to-end project coordination from procurement to final handover. We manage timelines, subcontractors, materials, and quality control at every phase.",
      "services.card_arch_desc":"Detailed architectural drawings, concept design, and technical documentation ensuring every build meets national and international engineering codes.",
      "services.card_learn_more":"Learn More",
      "services.process_eyebrow":"How We Work",
      "services.process_heading":"Our Construction Process",
      "services.process_step1_title":"Site Assessment",
      "services.process_step1_body":"Detailed on-site evaluation, soil analysis, and feasibility study to establish accurate project scope and timeline.",
      "services.process_step2_title":"Planning & Design",
      "services.process_step2_body":"Architectural drawings, structural calculations, and material selection aligned with your requirements and budget.",
      "services.process_step3_title":"Construction",
      "services.process_step3_body":"Mobilization of our certified workforce and machinery, with daily progress reporting and strict quality control.",
      "services.process_step4_title":"Handover & Support",
      "services.process_step4_body":"Final inspection, documentation delivery, and ongoing maintenance support to ensure long-term performance.",
      "services.cta_heading":"Ready to Start Your Next Project?",
      "services.cta_sub":"Our team is ready to deliver — from blueprint to final inspection. Contact us today for a free consultation and quote.",
      "services.cta_btn_quote":"Get a Free Quote →",
      "services.cta_btn_projects":"View Our Projects"
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
      "footer.talk_btn":"Contactez-Nous \u2192","footer.rights":"Tous droits r\u00E9serv\u00E9s.",
      "about.title":"À propos de nous — EURL ETB Achouri Toufik",
      "about.breadcrumb_home":"Accueil",
      "about.breadcrumb_current":"À propos de nous",
      "about.hero_eyebrow":"Qui sommes-nous",
      "about.hero_headline":"Bâti sur la confiance.<br><span class=\"text-gold\">Porté par l'excellence.</span>",
      "about.hero_sub":"Depuis plus de 15 ans, EURL ETB Achouri Toufik réalise des projets de construction durables — des habitations résidentielles aux grandes installations industrielles à travers l'Algérie.",
      "about.story_eyebrow":"Notre histoire",
      "about.story_headline":"15 ans à bâtir<br><span class=\"text-gold\">l'infrastructure</span> algérienne",
      "about.story_lead":"Fondée en 2009 par Toufik Achouri, notre entreprise a débuté comme une petite entreprise de construction avec une mission claire : la qualité, la sécurité et la satisfaction du client avant tout. Au fil des années, nous sommes devenus un groupe de construction intégré, reconnu par les clients privés comme par les institutions publiques à travers l'Algérie.",
      "about.story_alt_site":"Chantier de construction",
      "about.story_alt_plan":"Plan architectural",
      "about.timeline_2009_label":"2009 — Fondation",
      "about.timeline_2009_text":"EURL ETB Achouri Toufik est fondée à Blida, avec un premier axe sur la construction résidentielle.",
      "about.timeline_2013_label":"2013 — Expansion",
      "about.timeline_2013_text":"Extension vers les projets commerciaux et industriels, équipe portée à plus de 30 ingénieurs et techniciens.",
      "about.timeline_2018_label":"2018 — Certification",
      "about.timeline_2018_text":"Obtention de la certification ISO 9001 et lancement de notre division d'engins lourds.",
      "about.timeline_2024_label":"2024 — Aujourd'hui",
      "about.timeline_2024_text":"Plus de 240 projets réalisés, plus de 50 ingénieurs experts, une réputation de fiabilité à toute épreuve.",
      "about.mission_eyebrow":"Ce qui nous anime",
      "about.mission_heading":"Mission & Vision",
      "about.mission_title":"Notre mission",
      "about.mission_body":"Livrer des projets de la plus haute qualité, dans les délais et le budget prévus, tout en assurant la sécurité de nos équipes et la confiance de nos clients.",
      "about.vision_title":"Notre vision",
      "about.vision_body":"Devenir le groupe de construction le plus fiable d'Algérie, reconnu pour l'intégrité avec laquelle nous menons chaque projet.",
      "about.values_eyebrow":"Ce qui nous définit",
      "about.values_heading":"Nos valeurs fondamentales",
      "about.val_integrity_title":"Intégrité",
      "about.val_integrity_body":"Transparence totale sur chaque projet, sans surprise ni raccourci.",
      "about.val_excellence_title":"Excellence",
      "about.val_excellence_body":"Les normes les plus exigeantes, du choix des matériaux à la précision d'exécution.",
      "about.val_teamwork_title":"Esprit d'équipe",
      "about.val_teamwork_body":"Chaque membre de nos équipes avance comme un seul homme.",
      "about.val_client_title":"Satisfaction client",
      "about.val_client_body":"Leur vision guide notre travail, leur satisfaction définit notre réussite.",
      "about.val_reliability_title":"Fiabilité",
      "about.val_reliability_body":"Chaque délai est un engagement tenu.",
      "about.val_safety_title":"Sécurité avant tout",
      "about.val_safety_body":"Protocoles stricts, chaque chantier, chaque jour, sans exception.",
      "about.stat_years":"Années d'expérience",
      "about.stat_projects":"Projets réalisés",
      "about.stat_engineers":"Ingénieurs experts",
      "about.stat_awards":"Récompenses",
      "about.certs_eyebrow":"Reconnaissance",
      "about.certs_heading":"Certifications & Récompenses",
      "about.certs_subtitle":"Notre travail a été reconnu par les principaux organismes du secteur.",
      "about.cert_iso_title":"ISO 9001",
      "about.cert_iso_sub":"Certifié Système de management de la qualité",
      "about.cert_ohsas_title":"OHSAS 18001",
      "about.cert_ohsas_sub":"Norme santé et sécurité au travail",
      "about.cert_award_title":"Meilleur entrepreneur",
      "about.cert_award_sub":"Algeria Construction Awards 2022",
      "about.cert_license_title":"Agréé & assuré",
      "about.cert_license_sub":"Ministère de la Construction — Algérie",
      "about.cta_heading":"Prêt à démarrer votre <span class=\"text-gold\">prochain projet ?</span>",
      "about.cta_sub":"Parlons de ce que vous construisez. Notre équipe est prête à donner vie à votre vision.",
      "about.cta_btn_quote":"Demander un devis gratuit →",
      "about.cta_btn_work":"Voir nos réalisations",
      "services.title":"Services — EURL ETB Achouri Toufik",
      "services.breadcrumb_home":"Accueil",
      "services.breadcrumb_current":"Services",
      "services.hero_eyebrow":"Notre expertise",
      "services.hero_headline":"Des services de <span class=\"text-gold\">construction</span> complets",
      "services.hero_sub":"Des maisons résidentielles aux grandes installations industrielles, nous proposons des solutions sur mesure, avec précision et intégrité.",
      "services.grid_eyebrow":"Ce que nous proposons",
      "services.grid_headline":"Conçus pour toutes les <span class=\"text-gold\">échelles</span>",
      "services.card_residential_desc":"Maisons individuelles sur mesure, complexes résidentiels multi-logements et immeubles d'appartements, réalisés avec des matériaux haut de gamme et des normes architecturales modernes.",
      "services.card_commercial_desc":"Complexes de bureaux, centres commerciaux et espaces à usage mixte, conçus pour l'efficacité opérationnelle et la durabilité à long terme.",
      "services.card_industrial_desc":"Entrepôts, unités de production et plateformes logistiques, conçus pour des opérations intensives et une durabilité à long terme.",
      "services.card_renovation_desc":"Renforcements structurels, réaménagements intérieurs et rénovations complètes de bâtiments existants, redonnant vie aux infrastructures anciennes grâce à des finitions modernes.",
      "services.card_pm_desc":"Coordination complète du projet, de l'approvisionnement jusqu'à la livraison finale. Nous gérons les délais, les sous-traitants, les matériaux et le contrôle qualité à chaque étape.",
      "services.card_arch_desc":"Plans architecturaux détaillés, conception initiale et documentation technique, garantissant la conformité de chaque construction aux normes nationales et internationales.",
      "services.card_learn_more":"En savoir plus",
      "services.process_eyebrow":"Notre méthode de travail",
      "services.process_heading":"Notre processus de construction",
      "services.process_step1_title":"Évaluation du site",
      "services.process_step1_body":"Évaluation détaillée sur site, analyse du sol et étude de faisabilité pour définir avec précision la portée et le calendrier du projet.",
      "services.process_step2_title":"Planification & Conception",
      "services.process_step2_body":"Plans architecturaux, calculs structurels et sélection des matériaux, adaptés à vos besoins et à votre budget.",
      "services.process_step3_title":"Construction",
      "services.process_step3_body":"Mobilisation de notre équipe certifiée et de nos équipements, avec suivi quotidien et contrôle qualité rigoureux.",
      "services.process_step4_title":"Remise & Accompagnement",
      "services.process_step4_body":"Inspection finale, remise de la documentation, et accompagnement continu pour garantir une performance durable.",
      "services.cta_heading":"Prêt à démarrer votre prochain projet ?",
      "services.cta_sub":"Notre équipe est prête à livrer — du plan jusqu'à l'inspection finale. Contactez-nous dès aujourd'hui pour une consultation et un devis gratuits.",
      "services.cta_btn_quote":"Demander un devis gratuit →",
      "services.cta_btn_projects":"Voir nos projets"
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
      "footer.rights":"\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.",
      "about.title":"من نحن — EURL ETB عاشوري توفيق",
      "about.breadcrumb_home":"الرئيسية",
      "about.breadcrumb_current":"من نحن",
      "about.hero_eyebrow":"من نحن",
      "about.hero_headline":"أساسنا الثقة.<br><span class=\"text-gold\">شعارنا التميّز.</span>",
      "about.hero_sub":"منذ أكثر من 15 عامًا، تنجز مؤسسة عاشوري توفيق مشاريع بناء تصمد أمام الزمن، من المساكن السكنية إلى المنشآت الصناعية الكبرى عبر الجزائر.",
      "about.story_eyebrow":"قصتنا",
      "about.story_headline":"15 عامًا في بناء<br><span class=\"text-gold\">البنية التحتية</span> الجزائرية",
      "about.story_lead":"تأسست مؤسستنا سنة 2009 على يد توفيق عاشوري، كشركة مقاولات صغيرة تحمل رسالة واضحة: الجودة والسلامة ورضا العملاء أولًا. ومع مرور السنوات، تطورنا لنصبح مجموعة بناء متكاملة تحظى بثقة العملاء والمؤسسات العمومية عبر الجزائر.",
      "about.story_alt_site":"موقع بناء",
      "about.story_alt_plan":"مخطط هندسي",
      "about.timeline_2009_label":"2009 — التأسيس",
      "about.timeline_2009_text":"تأسست مؤسسة عاشوري توفيق في البليدة، مع التركيز على البناء السكني.",
      "about.timeline_2013_label":"2013 — التوسع",
      "about.timeline_2013_text":"توسعنا نحو المشاريع التجارية والصناعية، ونما فريقنا ليضم أكثر من 30 مهندسًا وتقنيًا.",
      "about.timeline_2018_label":"2018 — الاعتماد",
      "about.timeline_2018_text":"حصلنا على شهادة الأيزو 9001، وأطلقنا قسم الآليات الثقيلة.",
      "about.timeline_2024_label":"2024 — اليوم",
      "about.timeline_2024_text":"أكثر من 240 مشروعًا منجزًا، وأكثر من 50 مهندسًا خبيرًا، وسمعة راسخة في الالتزام بالمواعيد.",
      "about.mission_eyebrow":"ما يحفزنا",
      "about.mission_heading":"الرسالة والرؤية",
      "about.mission_title":"رسالتنا",
      "about.mission_body":"إنجاز مشاريع بأعلى معايير الجودة، في الوقت المحدد وضمن الميزانية، مع الحفاظ على سلامة عمالنا وثقة عملائنا.",
      "about.vision_title":"رؤيتنا",
      "about.vision_body":"أن نصبح أكثر مجموعة بناء موثوقة في الجزائر، لا لحجم مشاريعنا فحسب، بل للنزاهة التي ننفذ بها كل مشروع.",
      "about.values_eyebrow":"ما نؤمن به",
      "about.values_heading":"قيمنا الأساسية",
      "about.val_integrity_title":"النزاهة",
      "about.val_integrity_body":"شفافية كاملة، بلا مفاجآت وبلا اختصارات.",
      "about.val_excellence_title":"التميّز",
      "about.val_excellence_body":"أعلى المعايير، من اختيار المواد إلى دقة التنفيذ.",
      "about.val_teamwork_title":"روح الفريق",
      "about.val_teamwork_body":"كل فرد في فريقنا يتحرك ككتلة واحدة.",
      "about.val_client_title":"التركيز على العميل",
      "about.val_client_body":"رؤيتهم توجه عملنا، ورضاهم يحدد نجاحنا.",
      "about.val_reliability_title":"الموثوقية",
      "about.val_reliability_body":"المواعيد التزام، وننفذ بانضباط.",
      "about.val_safety_title":"السلامة أولًا",
      "about.val_safety_body":"بروتوكولات صارمة، كل موقع، كل يوم، بلا استثناء.",
      "about.stat_years":"سنوات من الخبرة",
      "about.stat_projects":"مشروعًا منجزًا",
      "about.stat_engineers":"مهندسًا خبيرًا",
      "about.stat_awards":"جائزة",
      "about.certs_eyebrow":"الاعتراف والتميز",
      "about.certs_heading":"الشهادات والجوائز",
      "about.certs_subtitle":"حازت أعمالنا على تقدير أبرز الهيئات في القطاع — شهادة على التزامنا الراسخ بالجودة والسلامة.",
      "about.cert_iso_title":"ISO 9001",
      "about.cert_iso_sub":"معتمدة في نظام إدارة الجودة",
      "about.cert_ohsas_title":"OHSAS 18001",
      "about.cert_ohsas_sub":"معيار الصحة والسلامة المهنية",
      "about.cert_award_title":"أفضل مقاول",
      "about.cert_award_sub":"جوائز البناء الجزائرية 2022",
      "about.cert_license_title":"مرخصة ومؤمّنة",
      "about.cert_license_sub":"وزارة السكن والعمران والمدينة — الجزائر",
      "about.cta_heading":"هل أنت مستعد لبدء <span class=\"text-gold\">مشروعك القادم؟</span>",
      "about.cta_sub":"لنتحدث عمّا تخطط لبنائه. فريقنا جاهز لتحويل رؤيتك إلى واقع بدقة وخبرة.",
      "about.cta_btn_quote":"اطلب عرض سعر مجاني ←",
      "about.cta_btn_work":"شاهد أعمالنا",
      "services.title":"الخدمات — EURL ETB عاشوري توفيق",
      "services.breadcrumb_home":"الرئيسية",
      "services.breadcrumb_current":"الخدمات",
      "services.hero_eyebrow":"خبرتنا",
      "services.hero_headline":"خدمات <span class=\"text-gold\">بناء</span> شاملة",
      "services.hero_sub":"من المساكن إلى المنشآت الصناعية الكبرى، نقدم حلولًا مخصصة بدقة ونزاهة.",
      "services.grid_eyebrow":"ما نقدمه",
      "services.grid_headline":"مصمّمة لكل <span class=\"text-gold\">الأحجام</span>",
      "services.card_residential_desc":"منازل عائلية مصممة حسب الطلب، مجمعات سكنية متعددة الوحدات، وعمارات سكنية، منجزة بمواد عالية الجودة ووفق أحدث معايير التصميم المعماري.",
      "services.card_commercial_desc":"مجمعات مكتبية، مراكز تجارية، ومنشآت متعددة الاستخدامات، مصممة لضمان الكفاءة التشغيلية والمتانة على المدى الطويل.",
      "services.card_industrial_desc":"مستودعات، منشآت إنتاجية، ومراكز لوجستية، مصممة لتحمل العمليات الثقيلة وضمان متانة طويلة الأمد.",
      "services.card_renovation_desc":"تدعيمات إنشائية، إعادة تهيئة داخلية، وترميم شامل للمباني القائمة، لإعادة الحياة للبنية التحتية القديمة بلمسات عصرية.",
      "services.card_pm_desc":"تنسيق شامل للمشروع من التوريد إلى التسليم النهائي. ندير الآجال والمقاولين الفرعيين والمواد ومراقبة الجودة في كل مرحلة.",
      "services.card_arch_desc":"مخططات معمارية مفصلة، تصميم مبدئي، ووثائق تقنية، لضمان مطابقة كل مشروع للمعايير الهندسية الوطنية والدولية.",
      "services.card_learn_more":"اعرف المزيد",
      "services.process_eyebrow":"كيف نعمل",
      "services.process_heading":"عملية البناء لدينا",
      "services.process_step1_title":"تقييم الموقع",
      "services.process_step1_body":"تقييم ميداني دقيق، تحليل للتربة، ودراسة جدوى لتحديد نطاق المشروع والجدول الزمني بدقة.",
      "services.process_step2_title":"التخطيط والتصميم",
      "services.process_step2_body":"مخططات هندسية، حسابات إنشائية، واختيار المواد بما يتوافق مع متطلباتكم وميزانيتكم.",
      "services.process_step3_title":"التنفيذ",
      "services.process_step3_body":"تعبئة فريقنا المعتمد وآلياتنا، مع تقارير تقدم يومية ورقابة صارمة على الجودة.",
      "services.process_step4_title":"التسليم والمتابعة",
      "services.process_step4_body":"فحص نهائي، تسليم الوثائق، ودعم صيانة مستمر لضمان أداء طويل الأمد.",
      "services.cta_heading":"هل أنت مستعد لبدء مشروعك القادم؟",
      "services.cta_sub":"فريقنا جاهز للتنفيذ — من المخطط إلى الفحص النهائي. تواصلوا معنا اليوم للحصول على استشارة وعرض سعر مجانيين.",
      "services.cta_btn_quote":"اطلب عرض سعر مجاني ←",
      "services.cta_btn_projects":"شاهد مشاريعنا"
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
      if (Object.prototype.hasOwnProperty.call(t, key)) { if (el.tagName === "TITLE") document.title = t[key]; else el.textContent = t[key]; }
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      if (Object.prototype.hasOwnProperty.call(t, key)) el.setAttribute("alt", t[key]);
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
