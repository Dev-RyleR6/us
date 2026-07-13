/**
 * Our Story — Main JavaScript
 * ─────────────────────────────────────────
 * 01. Cinematic Loader (date reveal → dismiss)
 * 02. Live Heartbeat Counter (DDD:HH:MM:SS in status bar)
 * 03. Header scroll state
 * 04. Smooth anchor nav
 * 05. Custom cursor
 * 06. Intersection Observer reveal fallback
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────────────────
  // CONFIG
  // Change this to your actual start date.
  // Month is 0-indexed: 0 = January, 5 = June, etc.
  // ─────────────────────────────────────────────────────────
  const START_DATE = new Date(2026, 5, 14); // June 14, 2026


  // ─────────────────────────────────────────────────────────
  // 01. CINEMATIC LOADER
  // Shows today's date in the center of a black screen,
  // then fades out and reveals the current monthsary chapter.
  // ─────────────────────────────────────────────────────────
  const loader = document.getElementById('loader');
  const loaderDateEl = document.getElementById('loader-date');

  // Write today's date in editorial format
  if (loaderDateEl) {
    const now = new Date();
    const months = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December',
    ];
    loaderDateEl.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }



  /**
   * Dismiss the loader and jump to the current monthsary slide.
   * Called after the loader's display duration.
   */
  function dismissLoader() {
    if (!loader) return;

    loader.classList.add('is-hidden');

    // Remove from DOM after CSS transition completes
    loader.addEventListener('transitionend', () => {
      loader.style.display = 'none';
    }, { once: true });
  }

  // Show loader for 2.4s then fade out
  setTimeout(dismissLoader, 2400);


  // ─────────────────────────────────────────────────────────
  // 02. LIVE HEARTBEAT COUNTER — Status Bar
  // Format: DDD:HH:MM:SS  (e.g. "547:14:23:05")
  // Ticks every second.
  // ─────────────────────────────────────────────────────────
  const timecodeEl = document.getElementById('timecode-display');
  const heroCountdownEl = document.getElementById('hero-countdown');

  function pad(n, digits = 2) {
    return String(Math.floor(n)).padStart(digits, '0');
  }

  function formatHeroCountdown(days, hours, mins, secs) {
    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (mins > 0) parts.push(`${mins} minute${mins !== 1 ? 's' : ''}`);
    if (secs > 0 && parts.length === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
    return parts.join(', ');
  }

  function updateTimecode() {
    if (!timecodeEl && !heroCountdownEl) return;

    const now = new Date();
    const diffMs = now - START_DATE;

    if (diffMs < 0) {
      if (timecodeEl) timecodeEl.textContent = '000:00:00:00';
      if (heroCountdownEl) heroCountdownEl.textContent = '0 days';
      return;
    }

    const totalSecs = Math.floor(diffMs / 1000);
    const days  = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins  = Math.floor((totalSecs % 3600) / 60);
    const secs  = totalSecs % 60;

    if (timecodeEl) {
      timecodeEl.textContent = `${pad(days, 3)}:${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }

    if (heroCountdownEl) {
      heroCountdownEl.textContent = formatHeroCountdown(days, hours, mins, secs);
    }
  }

  updateTimecode();
  setInterval(updateTimecode, 1000);


  // ─────────────────────────────────────────────────────────
  // 03. HEADER SCROLL STATE
  // Lenis in motion.js owns scroll; this is the fallback.
  // ─────────────────────────────────────────────────────────
  const header = document.getElementById('site-header');

  function applyHeaderScroll(scrollY) {
    if (!header) return;
    if (scrollY > 80) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', () => {
    if (window.lenis) return; // Lenis owns scroll events
    applyHeaderScroll(window.scrollY);
  }, { passive: true });

  window.applyHeaderScroll = applyHeaderScroll;


  // ─────────────────────────────────────────────────────────
  // 04. SMOOTH ANCHOR NAV
  // ─────────────────────────────────────────────────────────
  function getScrollOffset() {
    const header = document.getElementById('site-header');
    return header ? header.getBoundingClientRect().height : 64;
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
      if (window.lenis) {
        window.lenis.scrollTo(top, { duration: 1.8 });
      } else {
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ─────────────────────────────────────────────────────────
  // 05. CUSTOM CURSOR
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

    document.querySelectorAll('a, button, [data-cursor-expand]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-expanded'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-expanded'));
    });
  }


  // ─────────────────────────────────────────────────────────
  // 06. INTERSECTION OBSERVER — CSS reveal fallback
  // GSAP in motion.js is the primary reveal driver.
  // This fallback fires for browsers without GSAP / non-chapter elements.
  // ─────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    window.reinitRevealObserver = function () {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
        revealObserver.observe(el);
      });
    };
  }

});
