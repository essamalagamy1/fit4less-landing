/* ============================================================
   Fit4Less Landing Page – main.js
   - Bilingual i18n Engine (AR / EN) with RTL/LTR & Font switching
   - Motion.dev Animations (Hero entrance, inView reveal, Counters)
   - Interactive Branch Explorer & Dynamic Map Pan
   - Mobile Menu & Navbar scroll states
   - Smooth anchor navigation & FAQ Accordion
   ============================================================ */

(function () {
  'use strict';

  /* ---- Utilities ---- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. BILINGUAL i18n ENGINE (AR / EN)
     ============================================================ */
  function getTranslationsDict() {
    if (typeof window !== 'undefined' && window.translations) return window.translations;
    if (typeof translations !== 'undefined') return translations;
    return null;
  }

  let currentLang = 'ar';
  try {
    const saved = localStorage.getItem('fit4less_lang');
    if (saved === 'ar' || saved === 'en') currentLang = saved;
  } catch (e) {
    /* localStorage disabled/restricted */
  }

  function getTranslation(obj, keyPath) {
    if (!obj || !keyPath) return null;
    return keyPath.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
  }

  function setLanguage(lang, persist = true) {
    const allDicts = getTranslationsDict();
    if (!allDicts || !allDicts[lang]) {
      console.warn(`[i18n] Translation dictionary not available for: ${lang}`);
      return;
    }

    currentLang = lang;
    const isAr = lang === 'ar';
    const dict = allDicts[lang];

    // 1. Set document direction, language, and typography
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';

    if (isAr) {
      document.body.style.fontFamily = 'var(--font-arabic)';
    } else {
      document.body.style.fontFamily = 'var(--font-latin)';
    }

    // 2. Meta title & description
    if (dict.meta) {
      if (dict.meta.title) document.title = dict.meta.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && dict.meta.description) {
        metaDesc.setAttribute('content', dict.meta.description);
      }
    }

    // 3. Update all [data-i18n] elements
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const text = getTranslation(dict, key);
      if (text !== null) {
        el.innerHTML = text;
      }
    });

    // 4. Update Language Toggle Button Labels
    const switchLabel = dict.nav ? dict.nav.langSwitch : (isAr ? 'English' : 'العربية');
    const desktopLangLabel = document.querySelector('#lang-toggle-btn .lang-label');
    if (desktopLangLabel) desktopLangLabel.textContent = switchLabel;

    const mobileNavLangLabel = document.querySelector('#mobile-nav-lang-btn .mobile-nav-lang-label');
    if (mobileNavLangLabel) mobileNavLangLabel.textContent = switchLabel;

    const ariaLabel = isAr ? 'Switch language to English' : 'التحويل للغة العربية';
    const desktopLangBtn = document.getElementById('lang-toggle-btn');
    if (desktopLangBtn) desktopLangBtn.setAttribute('aria-label', ariaLabel);
    const mobileNavLangBtn = document.getElementById('mobile-nav-lang-btn');
    if (mobileNavLangBtn) mobileNavLangBtn.setAttribute('aria-label', ariaLabel);

    // 5. Update Interactive Branch Explorer if rendered
    updateBranchDisplay(currentBranchIndex);

    // 6. Persist preference
    if (persist) {
      try {
        localStorage.setItem('fit4less_lang', lang);
      } catch (err) {
        /* storage unavailable */
      }
    }

    window.dispatchEvent(new CustomEvent('fit4less:langChange', { detail: { lang } }));
  }

  function toggleLanguage() {
    const targetLang = currentLang === 'ar' ? 'en' : 'ar';
    setLanguage(targetLang, true);
  }

  // Bind desktop & mobile toggle buttons
  const desktopToggleBtn = document.getElementById('lang-toggle-btn');
  if (desktopToggleBtn) {
    desktopToggleBtn.addEventListener('click', toggleLanguage);
  }
  const mobileToggleBtn = document.getElementById('mobile-nav-lang-btn');
  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', toggleLanguage);
  }

  // Initialize language on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setLanguage(currentLang, false));
  } else {
    setLanguage(currentLang, false);
  }


  /* ============================================================
     2. NAVBAR SCROLL & ACTIVE SECTION HIGHLIGHT
     ============================================================ */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  function highlightNav() {
    const scrollPos = window.scrollY + 120;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('text-primary-light');
            link.classList.remove('text-white/80');
          } else {
            link.classList.remove('text-primary-light');
            link.classList.add('text-white/80');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });


  /* ============================================================
     3. MOBILE MENU TOGGLE
     ============================================================ */
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');

  function openMenu() {
    if (!mobileMenu) return;
    document.body.classList.add('menu-open');
    if (navbar) {
      navbar.classList.add('opacity-0', 'pointer-events-none');
      navbar.style.display = 'none';
    }
    mobileMenu.classList.remove('hidden');
    requestAnimationFrame(() => {
      mobileMenu.classList.add('visible');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu) return;
    document.body.classList.remove('menu-open');
    mobileMenu.classList.remove('visible');
    if (navbar) {
      navbar.style.display = '';
      navbar.classList.remove('opacity-0', 'pointer-events-none');
    }
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
    }, 250);
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  document.querySelectorAll('#mobile-menu a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1280 && mobileMenu && mobileMenu.classList.contains('visible')) {
      closeMenu();
    }
  });


  /* ============================================================
     4. SMOOTH SCROLLING
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = (navbar ? navbar.offsetHeight : 70) + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });


  /* ============================================================
     5. FAQ ACCORDION
     ============================================================ */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((o) => o.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });


  /* ============================================================
     6. INTERACTIVE BRANCH EXPLORER & MAP
     ============================================================ */
  const branchesData = [
    {
      id: 'naseem',
      nameAr: 'فرع النسيم الشرقي',
      nameEn: 'Al-Naseem Al-Sharqi Branch',
      descAr: 'شارع حسان بن ثابت، بجوار وقت اللياقة',
      descEn: 'Hassan Bin Thabit St., Next to Fitness Time',
      lat: 24.7214,
      lng: 46.8322,
      phone: '0114516498',
      mapUrl: 'https://maps.google.com?q=فت+فور+لس+النسيم+الشرقي+الرياض',
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=46.8122%2C24.7014%2C46.8522%2C24.7414&layer=mapnik&marker=24.7214%2C46.8322'
    },
    {
      id: 'nadwa',
      nameAr: 'فرع حي الندوة',
      nameEn: 'Al-Nadwa District Branch',
      descAr: 'طريق خريص، بجوار وقت اللياقة',
      descEn: 'Khurais Road, Next to Fitness Time',
      lat: 24.7876,
      lng: 46.8831,
      phone: '0114516498',
      mapUrl: 'https://maps.google.com?q=فت+فور+لس+حي+الندوة+الرياض',
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=46.8631%2C24.7676%2C46.9031%2C24.8076&layer=mapnik&marker=24.7876%2C46.8831'
    },
    {
      id: 'hamra',
      nameAr: 'فرع الحمراء',
      nameEn: 'Al-Hamra Branch',
      descAr: 'شارع خالد بن الوليد، بجوار بيور جيم',
      descEn: 'Khalid Bin Al-Waleed St., Next to PureGym',
      lat: 24.7794,
      lng: 46.7562,
      phone: '0114516498',
      mapUrl: 'https://maps.google.com?q=فت+فور+لس+الحمراء+الرياض',
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=46.7362%2C24.7594%2C46.7762%2C24.7994&layer=mapnik&marker=24.7794%2C46.7562'
    },
    {
      id: 'qadisiyyah',
      nameAr: 'فرع القادسية',
      nameEn: 'Al-Qadisiyyah Branch',
      descAr: 'الطريق الدائري الشمالي، بجانب الصالة الاقتصادية',
      descEn: 'Northern Ring Road, Next to Economic Hall',
      lat: 24.8142,
      lng: 46.8123,
      phone: '0114516498',
      mapUrl: 'https://maps.google.com?q=فت+فور+لس+القادسية+الرياض',
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=46.7923%2C24.7942%2C46.8323%2C24.8342&layer=mapnik&marker=24.8142%2C46.8123'
    },
    {
      id: 'qurtubah',
      nameAr: 'فرع قرطبة',
      nameEn: 'Qurtubah Branch',
      descAr: 'طريق الثمامة، بالقرب من المجمعات الحيوية',
      descEn: 'Al-Thumamah Road, Near Vibrant Plazas',
      lat: 24.8135,
      lng: 46.7328,
      phone: '0114516498',
      mapUrl: 'https://maps.google.com?q=فت+فور+لس+قرطبة+الرياض',
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=46.7128%2C24.7935%2C46.7528%2C24.8335&layer=mapnik&marker=24.8135%2C46.7328'
    },
    {
      id: 'maseef',
      nameAr: 'فرع المصيف',
      nameEn: 'Al-Maseef Branch',
      descAr: 'طريق الدائري الشمالي الفرعي، مخرج 6',
      descEn: 'Northern Ring Branch Road, Exit 6',
      lat: 24.7661,
      lng: 46.6853,
      phone: '0114516498',
      mapUrl: 'https://share.google/neW6tM67Ts3KxFZBN',
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=46.6653%2C24.7461%2C46.7053%2C24.7861&layer=mapnik&marker=24.7661%2C46.6853'
    },
    {
      id: 'rayan',
      nameAr: 'فرع الريان',
      nameEn: 'Al-Rayan Branch',
      descAr: 'شارع الإمام الشافعي، حي الريان',
      descEn: 'Al-Imam Al-Shafi\'i St., Al-Rayan District',
      lat: 24.7153,
      lng: 46.7791,
      phone: '0114516498',
      mapUrl: 'https://maps.app.goo.gl/J1G3bMkA7Qv3gsLn6',
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=46.7591%2C24.6953%2C46.7991%2C24.7353&layer=mapnik&marker=24.7153%2C46.7791'
    }
  ];

  let currentBranchIndex = 0;

  function updateBranchDisplay(index) {
    if (index < 0 || index >= branchesData.length) index = 0;
    currentBranchIndex = index;
    const branch = branchesData[index];
    const isAr = currentLang === 'ar';

    // Highlight active pill
    document.querySelectorAll('.branch-pill').forEach((pill, i) => {
      if (i === index) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update details card elements (supports both index.html and branches.html)
    const nameEl = document.getElementById('active-branch-name') || document.getElementById('current-name');
    const descEl = document.getElementById('active-branch-desc') || document.getElementById('current-desc');
    const dirBtn = document.getElementById('active-branch-dir') || document.getElementById('current-directions');
    const callBtn = document.getElementById('active-branch-call') || document.getElementById('current-call');
    const mapIframe = document.getElementById('active-branch-map-iframe') || document.getElementById('branch-map-frame');

    if (nameEl) nameEl.textContent = isAr ? branch.nameAr : branch.nameEn;
    if (descEl) descEl.textContent = isAr ? branch.descAr : branch.descEn;
    if (dirBtn) dirBtn.setAttribute('href', branch.mapUrl);
    if (callBtn) callBtn.setAttribute('href', `tel:${branch.phone}`);
    if (mapIframe && mapIframe.src !== branch.embedUrl) {
      mapIframe.src = branch.embedUrl;
    }
  }

  // Bind branch pill clicks
  document.querySelectorAll('.branch-pill').forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      updateBranchDisplay(idx);
    });
  });

  // Initial trigger
  updateBranchDisplay(0);


  /* ============================================================
     7. ANIMATIONS (Motion.dev + Fallback)
     ============================================================ */
  function animateCounter(el, target, duration = 1500) {
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      el.textContent = `${prefix}${current}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    }
    requestAnimationFrame(update);
  }

  const motionLib = (typeof window.Motion !== 'undefined') ? window.Motion : (typeof window.motion !== 'undefined' ? window.motion : null);

  if (!prefersReducedMotion && motionLib && motionLib.animate && motionLib.inView) {
    const { animate, inView } = motionLib;

    // Hero entrance
    const heroEls = document.querySelectorAll('[data-hero-animate]');
    heroEls.forEach((el, i) => {
      animate(el,
        { opacity: [0, 1], y: [24, 0] },
        { duration: 0.55, delay: 0.1 + i * 0.08, easing: [0.25, 0.46, 0.45, 0.94] }
      );
    });

    // Generic reveals
    document.querySelectorAll('[data-animate]').forEach((el) => {
      const delay = parseFloat(el.dataset.delay || 0);
      inView(el, () => {
        animate(el,
          { opacity: [0, 1], y: [22, 0] },
          { duration: 0.5, delay, easing: [0.25, 0.46, 0.45, 0.94] }
        );
        return false;
      }, { margin: '-40px' });
    });

    // Stagger parents
    document.querySelectorAll('[data-stagger-parent]').forEach((parent) => {
      const children = parent.querySelectorAll('[data-stagger-child]');
      const staggerDelay = parseFloat(parent.dataset.staggerDelay || 0.06);
      inView(parent, () => {
        children.forEach((child, i) => {
          animate(child,
            { opacity: [0, 1], y: [22, 0] },
            { duration: 0.45, delay: i * staggerDelay, easing: [0.25, 0.46, 0.45, 0.94] }
          );
        });
        return false;
      }, { margin: '-30px' });
    });

    // Scale-in
    document.querySelectorAll('[data-scale-in]').forEach((el, i) => {
      inView(el, () => {
        animate(el,
          { opacity: [0, 1], scale: [0.94, 1] },
          { duration: 0.45, delay: i * 0.1, easing: [0.34, 1.56, 0.64, 1] }
        );
        return false;
      }, { margin: '-30px' });
    });

    // Number counters
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-counter'));
      if (isNaN(target)) return;
      inView(el, () => {
        animateCounter(el, target, 1400);
        return false;
      }, { margin: '-30px' });
    });

  } else if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0) scale(1)';

          if (el.hasAttribute('data-counter')) {
            const target = parseFloat(el.getAttribute('data-counter'));
            if (!isNaN(target)) animateCounter(el, target, 1400);
          }
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate], [data-hero-animate], [data-stagger-child], [data-scale-in], [data-counter]').forEach((el, idx) => {
      el.style.transition = 'opacity 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      if (el.hasAttribute('data-hero-animate')) {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 80 + idx * 80);
      } else {
        observer.observe(el);
      }
    });
  } else {
    document.querySelectorAll('[data-animate], [data-hero-animate], [data-stagger-child], [data-scale-in]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

})();
