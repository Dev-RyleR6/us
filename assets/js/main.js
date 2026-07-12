/**
 * Our Story — Main JavaScript
 * Handles: Header scroll state, Days Together counter, Intersection Observer reveals
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────────────────
  // 01. DAYS TOGETHER COUNTER
  // ─────────────────────────────────────────────────────────
  /**
   * Set your anniversary start date here (YYYY, MM-1, DD)
   * Note: Month is 0-indexed in JS (0 = January)
   */
  const START_DATE = new Date(2023, 0, 14); // January 14, 2023 — change this!

  function updateCounter() {
    const now = new Date();
    const diffMs = now - START_DATE;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const counterEl = document.getElementById('days-count');
    if (!counterEl) return;

    // Animate count up from 0 to actual value
    animateCount(counterEl, 0, diffDays, 1800);
  }

  function animateCount(el, start, end, duration) {
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * eased);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = end.toLocaleString();
      }
    }

    requestAnimationFrame(step);
  }

  updateCounter();


  // ─────────────────────────────────────────────────────────
  // 02. HEADER SCROLL BEHAVIOR
  // Primary driver: Lenis `on('scroll')` in motion.js.
  // Fallback below only activates when Lenis is unavailable.
  // ─────────────────────────────────────────────────────────
  const header = document.getElementById('site-header');

  function applyHeaderScroll(scrollY) {
    if (scrollY > 80) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  // Fallback for no-Lenis environments (Lenis overrides this via its own event)
  window.addEventListener('scroll', () => {
    // Skip if Lenis is active — it owns scroll state
    if (window.lenis) return;
    applyHeaderScroll(window.scrollY);
  }, { passive: true });

  // Also expose so motion.js can call during Lenis init if needed
  window.applyHeaderScroll = applyHeaderScroll;


  // ─────────────────────────────────────────────────────────
  // 03. INTERSECTION OBSERVER — Section Reveals
  // ─────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Unobserve after revealing (one-time animation)
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -80px 0px', // trigger slightly before element enters view
        threshold: 0.1,
      }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    // Expose for chapters.js to re-observe dynamically injected elements
    window.reinitRevealObserver = function () {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
        revealObserver.observe(el);
      });
    };
  }



  // ─────────────────────────────────────────────────────────
  // 04. SMOOTH ANCHOR NAV (for internal links)
  // ─────────────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      // Use Lenis scroll if available, else native smooth
      if (window.lenis) {
        window.lenis.scrollTo(top, { duration: 1.6 });
      } else {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ─────────────────────────────────────────────────────────
  // 05. CURSOR CUSTOM BLEND (subtle luxury touch)
  // ─────────────────────────────────────────────────────────
  const cursor = document.getElementById('custom-cursor');
  if (cursor) {
    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      curX += (mouseX - curX) * 0.08;
      curY += (mouseY - curY) * 0.08;
      cursor.style.transform = `translate(${curX - 6}px, ${curY - 6}px)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Expand cursor on hoverable elements
    const hoverables = document.querySelectorAll('a, button, [data-cursor-expand]');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-expanded'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-expanded'));
    });
  }

});
