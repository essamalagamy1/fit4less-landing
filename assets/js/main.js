/* ==============================================
   Fit4Less – main.js
   Mobile Menu · Scroll Navbar · Animations
   FAQ Accordion · Back to Top
   ============================================== */

/* ---- Utilities ---- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===============================
   NAVBAR: scroll shadow
   =============================== */
const navbar = document.getElementById('navbar');
function handleNavScroll() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

/* ===============================
   MOBILE MENU toggle
   =============================== */
const menuBtn   = document.getElementById('menu-btn');
const closeBtn  = document.getElementById('menu-close');
const mobileMenu = document.getElementById('mobile-menu');

function openMenu() {
  if (navbar) navbar.classList.add('opacity-0', 'pointer-events-none');
  mobileMenu.classList.remove('hidden');
  // next frame so transition fires
  requestAnimationFrame(() => {
    mobileMenu.classList.add('visible');
  });
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu.classList.remove('visible');
  if (navbar) navbar.classList.remove('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    mobileMenu.classList.add('hidden');
  }, 250);
  document.body.style.overflow = '';
}

if (menuBtn)  menuBtn.addEventListener('click', openMenu);
if (closeBtn) closeBtn.addEventListener('click', closeMenu);

// close on nav link click
document.querySelectorAll('#mobile-menu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Auto close on window resize to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024 && mobileMenu && mobileMenu.classList.contains('visible')) {
    closeMenu();
  }
});

/* ===============================
   SMOOTH SCROLL for anchor links
   =============================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});

/* ===============================
   FAQ ACCORDION
   =============================== */
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-question');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
    // toggle current
    if (!isOpen) item.classList.add('open');
  });
});

/* ===============================
   BACK TO TOP
   =============================== */
const backBtn = document.getElementById('back-to-top');
function handleBackTop() {
  if (window.scrollY > 400) {
    backBtn.classList.add('visible');
  } else {
    backBtn.classList.remove('visible');
  }
}
window.addEventListener('scroll', handleBackTop, { passive: true });

/* ===============================
   SCROLL ANIMATIONS
   =============================== */
const motionLib = (typeof window.Motion !== 'undefined') ? window.Motion : (typeof window.motion !== 'undefined' ? window.motion : null);

if (!prefersReducedMotion && motionLib && motionLib.animate && motionLib.inView) {
  const { animate, inView } = motionLib;

  // Hero text – stagger on load
  const heroEls = document.querySelectorAll('[data-hero-animate]');
  heroEls.forEach((el, i) => {
    animate(el,
      { opacity: [0, 1], y: [28, 0] },
      { duration: 0.55, delay: 0.15 + i * 0.1, easing: [0.25, 0.46, 0.45, 0.94] }
    );
  });

  // Generic scroll reveal
  document.querySelectorAll('[data-animate]').forEach((el) => {
    const delay = parseFloat(el.dataset.delay || 0);
    inView(el, () => {
      animate(el,
        { opacity: [0, 1], y: [24, 0] },
        { duration: 0.5, delay, easing: [0.25, 0.46, 0.45, 0.94] }
      );
      return false;
    }, { margin: '-60px' });
  });

  // Stagger groups
  document.querySelectorAll('[data-stagger-parent]').forEach(parent => {
    const children = parent.querySelectorAll('[data-stagger-child]');
    const staggerDelay = parseFloat(parent.dataset.staggerDelay || 0.06);
    inView(parent, () => {
      children.forEach((child, i) => {
        animate(child,
          { opacity: [0, 1], y: [28, 0] },
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

} else if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  // Native IntersectionObserver Fallback
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('animated');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1)';
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-animate], [data-hero-animate], [data-stagger-child], [data-scale-in]').forEach((el, idx) => {
    el.style.transition = 'opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    if (el.hasAttribute('data-hero-animate')) {
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 100 + idx * 100);
    } else {
      observer.observe(el);
    }
  });

} else {
  // Reduced motion: show instantly
  document.querySelectorAll('[data-animate], [data-hero-animate], [data-stagger-child], [data-scale-in]').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

/* ===============================
   ACTIVE NAV LINK on scroll
   =============================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

function highlightNav() {
  const scrollY = window.scrollY + navbar.offsetHeight + 40;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    if (scrollY >= top && scrollY < bottom) {
      navLinks.forEach(link => {
        link.classList.toggle('text-green-600', link.dataset.section === section.id);
        link.classList.toggle('font-semibold', link.dataset.section === section.id);
      });
    }
  });
}
window.addEventListener('scroll', highlightNav, { passive: true });

