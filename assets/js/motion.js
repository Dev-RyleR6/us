/**
 * Our Story — Motion Engine
 * ─────────────────────────────────────────────────────────
 * Powers:
 *   01. Lenis  — smooth, heavy, cinematic scroll inertia
 *   02. GSAP   — clip-path & fade reveals tied to ScrollTrigger
 *   03. Film Grain — tiled 24fps canvas overlay (GPU-friendly)
 *
 * Load order in index.html:
 *   Lenis CDN → GSAP CDN → ScrollTrigger CDN → this file
 * ─────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // 01. LENIS — Smooth Scroll
  // ─────────────────────────────────────────────────────────

  let lenis;

  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('[motion.js] Lenis not loaded. Smooth scroll skipped.');
      return;
    }

    lenis = new Lenis({
      duration: 2.0,   // heavier inertia — feels cinematic
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.75,  // slightly slower wheel sensitivity
      touchMultiplier: 1.5,
      infinite: false,
    });

    // ── Integrate Lenis into GSAP's ticker (required for ScrollTrigger sync) ──
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback RAF loop
      (function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      })(0);
    }

    // ── Sync ScrollTrigger with Lenis (correct modern pattern) ──
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    // ── Feed Lenis scroll position into main.js header logic ──
    lenis.on('scroll', ({ scroll }) => {
      const header = document.getElementById('site-header');
      if (!header) return;
      if (scroll > 80) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    });

    // Expose globally (paused by modals, lightboxes, etc.)
    window.lenis = lenis;
  }


  // ─────────────────────────────────────────────────────────
  // 02. GSAP REVEALS
  // ─────────────────────────────────────────────────────────

  function initGSAPReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[motion.js] GSAP / ScrollTrigger not loaded. Reveals skipped.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Default ScrollTrigger config ──
    const ST = {
      start: 'top 88%',
      toggleActions: 'play none none none',
    };

    // ─────────────────────────────────────────────────────
    // A. HERO — override CSS animations with GSAP
    // ─────────────────────────────────────────────────────

    // Hero eyebrow — clip wipe from left
    gsap.fromTo('.hero__eyebrow',
      { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
      { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.2, delay: 0.3, ease: 'power4.out' }
    );

    // Hero title lines — clip wipe from bottom (each word)
    gsap.utils.toArray('.hero__title-line span').forEach((span, i) => {
      gsap.fromTo(span,
        { clipPath: 'inset(100% 0% 0% 0%)', y: '60%' },
        { clipPath: 'inset(0% 0% 0% 0%)', y: '0%', duration: 1.5, delay: 0.5 + i * 0.2, ease: 'power4.out' }
      );
    });

    // Hero meta — slow fade in
    gsap.fromTo('.hero__meta',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 1.4, delay: 1.3, ease: 'power3.out' }
    );

    // Scroll indicator
    gsap.fromTo('.hero__scroll',
      { opacity: 0 },
      { opacity: 1, duration: 1.6, delay: 2.2, ease: 'power2.out' }
    );

    // Header entry
    gsap.fromTo('#site-header',
      { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.1, ease: 'power3.out' }
    );

    // ─────────────────────────────────────────────────────
    // B. SECTION HEADER — "Featured" intro text
    // ─────────────────────────────────────────────────────
    document.querySelectorAll('.section-label').forEach((el) => {
      gsap.fromTo(el,
        { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
        {
          clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
          scrollTrigger: { trigger: el, ...ST },
          duration: 1.1,
          ease: 'power4.out',
        }
      );
    });

    gsap.utils.toArray('#featured .t-headline').forEach((el) => {
      gsap.fromTo(el,
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1,
          scrollTrigger: { trigger: el, ...ST },
          duration: 1.4, ease: 'power3.out',
        }
      );
    });

    // ─────────────────────────────────────────────────────
    // C. CHAPTER ELEMENTS — called after chapters are in DOM
    // ─────────────────────────────────────────────────────
    function revealChapters() {
      // Guard: chapters must exist
      const chapterEls = document.querySelectorAll('.chapter');
      if (!chapterEls.length) return;

      // ── Roman numeral — clip from bottom ──
      document.querySelectorAll('.chapter__numeral').forEach((el) => {
        gsap.fromTo(el,
          { clipPath: 'inset(0% 0% 100% 0%)', y: 50, opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1,
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
            duration: 1.6, ease: 'power4.out',
          }
        );
      });

      // ── Month label + rule — slide in from left ──
      document.querySelectorAll('.chapter__meta').forEach((el) => {
        gsap.fromTo(el,
          { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
            duration: 1.0, ease: 'power3.out', delay: 0.1,
          }
        );
      });

      // ── Description text — fade + slide ──
      document.querySelectorAll('.chapter__description').forEach((el) => {
        gsap.fromTo(el,
          { y: 28, opacity: 0 },
          {
            y: 0, opacity: 1,
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
            duration: 1.3, ease: 'power3.out',
          }
        );
      });

      // ── Song buttons ──
      document.querySelectorAll('.chapter__song-btn').forEach((el) => {
        gsap.fromTo(el,
          { y: 14, opacity: 0 },
          {
            y: 0, opacity: 1,
            scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
            duration: 0.9, ease: 'power2.out',
          }
        );
      });

      // ── Image wraps — clip-path wipe, alternating direction ──
      document.querySelectorAll('.chapter__img-wrap').forEach((el, i) => {
        const fromClip = i % 2 === 0
          ? 'inset(0% 0% 100% 0%)' // bottom-up wipe
          : 'inset(0% 0% 0% 100%)'; // left-to-right wipe

        gsap.fromTo(el,
          { clipPath: fromClip, scale: 1.06, filter: 'brightness(0.4)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)', scale: 1, filter: 'brightness(0.92)',
            scrollTrigger: {
              trigger: el, start: 'top 90%', toggleActions: 'play none none none',
            },
            duration: 1.7, ease: 'power4.out',
          }
        );
      });

      // ── Cinematic full-bleed image ──
      document.querySelectorAll('.chapter__cinematic-img').forEach((el) => {
        gsap.fromTo(el,
          { clipPath: 'inset(6% 0% 6% 0%)', scale: 1.04, opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)', scale: 1, opacity: 1,
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
            duration: 1.8, ease: 'power4.out',
          }
        );
      });

      // ── Cinematic aside images ──
      document.querySelectorAll('.chapter__cinematic-aside').forEach((el) => {
        gsap.fromTo(el,
          { y: 48, opacity: 0, scale: 0.96 },
          {
            y: 0, opacity: 1, scale: 1,
            scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
            duration: 1.4, ease: 'power3.out', delay: 0.3,
          }
        );
      });

      // ── Asymmetric hero image ──
      document.querySelectorAll('.chapter__asym-hero').forEach((el) => {
        gsap.fromTo(el,
          { clipPath: 'inset(8% 0% 0% 0%)', opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
            duration: 1.8, ease: 'power4.out',
          }
        );
      });

      // ── Dividers ──
      document.querySelectorAll('.chapter-divider').forEach((el) => {
        gsap.fromTo(el.querySelectorAll('.chapter-divider__line'),
          { scaleX: 0 },
          {
            scaleX: 1,
            scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
            duration: 1.2, ease: 'power3.out', stagger: 0.1, transformOrigin: 'left center',
          }
        );
        const glyph = el.querySelector('.chapter-divider__glyph');
        if (glyph) {
          gsap.fromTo(glyph,
            { opacity: 0, scale: 0 },
            {
              opacity: 1, scale: 1,
              scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' },
              duration: 0.6, ease: 'back.out(2)', delay: 0.4,
            }
          );
        }
      });
    }

    // ─────────────────────────────────────────────────────
    // D. HERO IMAGE PARALLAX
    // ─────────────────────────────────────────────────────
    gsap.to('.hero__bg', {
      scrollTrigger: {
        trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.8,
      },
      y: '20%', scale: 1.1, ease: 'none',
    });

    // ─────────────────────────────────────────────────────
    // E. CHAPTER IMAGE PARALLAX — subtle Y drift
    // ─────────────────────────────────────────────────────
    document.querySelectorAll('.chapter__cinematic-img img').forEach((img) => {
      gsap.fromTo(img,
        { yPercent: -5 },
        {
          yPercent: 5, ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.chapter__cinematic-img'),
            start: 'top bottom', end: 'bottom top', scrub: 1.2,
          },
        }
      );
    });

    document.querySelectorAll('.chapter__asym-hero img').forEach((img) => {
      gsap.fromTo(img,
        { yPercent: -4 },
        {
          yPercent: 4, ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.chapter__asym-hero'),
            start: 'top bottom', end: 'bottom top', scrub: 1,
          },
        }
      );
    });

    // ─────────────────────────────────────────────────────
    // Refresh + run chapter reveals
    // ─────────────────────────────────────────────────────
    ScrollTrigger.refresh();
    revealChapters();

    // Also expose so chapters.js can call after dynamic render
    window.revealChapters = revealChapters;
  }


  // ─────────────────────────────────────────────────────────
  // 03. FILM GRAIN — Tiled 24fps Canvas
  //
  // Strategy: draw noise on a tiny 128×128 offscreen canvas,
  // then tile-blit it to cover the full screen. This replaces
  // ~8M pixel writes/frame with a single GPU drawImage call.
  // Capped at 24fps so it feels like actual film grain.
  // ─────────────────────────────────────────────────────────

  function initFilmGrain() {
    const canvas = document.getElementById('film-grain-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });

    // ── Offscreen tile ──
    const TILE = 128; // tile dimension
    const offscreen = document.createElement('canvas');
    offscreen.width = TILE;
    offscreen.height = TILE;
    const offCtx = offscreen.getContext('2d');

    // ── Settings ──
    const TARGET_FPS = 24;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    let lastFrameTime = 0;
    let rafId;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawTile() {
      const imageData = offCtx.createImageData(TILE, TILE);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const lum = (Math.random() * 255) | 0;
        data[i] = lum;
        data[i + 1] = lum;
        data[i + 2] = lum;
        // Very low alpha — grain should be barely-there texture
        data[i + 3] = (Math.random() * 28 + 4) | 0;
      }
      offCtx.putImageData(imageData, 0, 0);
    }

    function drawGrain(timestamp) {
      rafId = requestAnimationFrame(drawGrain);

      // Throttle to 24fps
      if (timestamp - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = timestamp;

      // Draw new tile noise
      drawTile();

      // Tile the offscreen canvas across the full viewport
      const W = canvas.width;
      const H = canvas.height;
      const cols = Math.ceil(W / TILE);
      const rows = Math.ceil(H / TILE);

      ctx.clearRect(0, 0, W, H);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.drawImage(offscreen, c * TILE, r * TILE);
        }
      }
    }

    resizeCanvas();
    rafId = requestAnimationFrame(drawGrain);

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 200);
    }, { passive: true });

    // Expose control for external pause/resume
    window.filmGrain = {
      pause: () => cancelAnimationFrame(rafId),
      resume: () => { rafId = requestAnimationFrame(drawGrain); },
    };
  }


  // ─────────────────────────────────────────────────────────
  // INIT — wait for DOM ready
  // ─────────────────────────────────────────────────────────

  function init() {
    // 1. Smooth scroll first (must be before GSAP ticker)
    initLenis();

    // 2. GSAP reveals — wait two RAF ticks for chapters.js to render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initGSAPReveals();
      });
    });

    // 3. Film grain (independent of scroll)
    initFilmGrain();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
