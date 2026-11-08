/* ============================================================
   Fit4Less Landing Page – main.js
   - Bilingual i18n Engine (AR / EN) with RTL/LTR & Font switching
   - Motion.dev Animations (Hero entrance, inView reveal, Counters)
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

    // 5. Persist preference
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
    const next = currentLang === 'ar' ? 'en' : 'ar';
    setLanguage(next, true);
  }

  // Bind Buttons
  const desktopLangBtn = document.getElementById('lang-toggle-btn');
  if (desktopLangBtn) desktopLangBtn.addEventListener('click', toggleLanguage);

  const mobileNavLangBtn = document.getElementById('mobile-nav-lang-btn');
  if (mobileNavLangBtn) mobileNavLangBtn.addEventListener('click', toggleLanguage);

  // Initialize Language
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setLanguage(currentLang, false));
  } else {
    setLanguage(currentLang, false);
  }


  /* ============================================================
     2. NAVBAR: SCROLL SHADOW & ACTIVE LINK
     ============================================================ */
  const navbar = document.getElementById('navbar');
  function handleNavScroll() {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  function highlightNav() {
    if (!navbar) return;
    const scrollY = window.scrollY + navbar.offsetHeight + 40;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach((link) => {
          link.classList.toggle('text-primary-light', link.dataset.section === section.id);
          link.classList.toggle('font-bold', link.dataset.section === section.id);
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
    if (navbar) navbar.classList.add('opacity-0', 'pointer-events-none');
    mobileMenu.classList.remove('hidden');
    requestAnimationFrame(() => {
      mobileMenu.classList.add('visible');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('visible');
    if (navbar) navbar.classList.remove('opacity-0', 'pointer-events-none');
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
    if (window.innerWidth >= 1024 && mobileMenu && mobileMenu.classList.contains('visible')) {
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
     6. BACK TO TOP (Safe Null Check)
     ============================================================ */
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    }, { passive: true });
  }


  /* ============================================================
     7. ANIMATIONS (Motion.dev + Fallback)
     ============================================================ */
  function animateCounter(el, target, duration = 1500) {
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const startTime = performance.now();
    let frameId;

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      el.textContent = `${prefix}${current}${suffix}`;
      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    }
    frameId = requestAnimationFrame(update);
  }

  const motionLib = (typeof window.Motion !== 'undefined') ? window.Motion : (typeof window.motion !== 'undefined' ? window.motion : null);

  if (!prefersReducedMotion && motionLib && motionLib.animate && motionLib.inView) {
    const { animate, inView } = motionLib;

    // Hero elements entrance
    const heroEls = document.querySelectorAll('[data-hero-animate]');
    heroEls.forEach((el, i) => {
      animate(el,
        { opacity: [0, 1], y: [26, 0] },
        { duration: 0.55, delay: 0.12 + i * 0.08, easing: [0.25, 0.46, 0.45, 0.94] }
      );
    });

    // Generic scroll reveals
    document.querySelectorAll('[data-animate]').forEach((el) => {
      const delay = parseFloat(el.dataset.delay || 0);
      inView(el, () => {
        animate(el,
          { opacity: [0, 1], y: [22, 0] },
          { duration: 0.5, delay, easing: [0.25, 0.46, 0.45, 0.94] }
        );
        return false;
      }, { margin: '-50px' });
    });

    // Stagger parents
    document.querySelectorAll('[data-stagger-parent]').forEach((parent) => {
      const children = parent.querySelectorAll('[data-stagger-child]');
      const staggerDelay = parseFloat(parent.dataset.staggerDelay || 0.06);
      inView(parent, () => {
        children.forEach((child, i) => {
          animate(child,
            { opacity: [0, 1], y: [24, 0] },
            { duration: 0.45, delay: i * staggerDelay, easing: [0.25, 0.46, 0.45, 0.94] }
          );
        });
        return false;
      }, { margin: '-40px' });
    });

    // Scale-in for subscription cards
    document.querySelectorAll('[data-scale-in]').forEach((el, i) => {
      inView(el, () => {
        animate(el,
          { opacity: [0, 1], scale: [0.94, 1] },
          { duration: 0.45, delay: i * 0.1, easing: [0.34, 1.56, 0.64, 1] }
        );
        return false;
      }, { margin: '-40px' });
    });

    // Number Counters with inView
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-counter'));
      if (isNaN(target)) return;
      inView(el, () => {
        animateCounter(el, target, 1400);
        return false;
      }, { margin: '-30px' });
    });

  } else if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    // Native IntersectionObserver Fallback
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
    // Reduced motion
    document.querySelectorAll('[data-animate], [data-hero-animate], [data-stagger-child], [data-scale-in]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

})();
