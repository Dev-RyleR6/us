/**
 * Our Story — Motion Engine (Depo Luxe Edition)
 * ─────────────────────────────────────────────────────────
 * 01. Lenis  — heavy cinematic vertical smooth scroll
 * 02. GSAP Horizontal Pin — #featured section scrolls chapters
 *     horizontally while the page scrolls vertically
 * 03. Clip-path image reveals — fire as each slide enters view
 * 04. Reveal-up text — words slide up from masked lines
 * 05. Slide-C parallax — two images at different x speeds
 * 06. Hero parallax + reveals
 * 07. Film grain canvas (24fps tiled)
 * 08. Jump-to-chapter utility (used by loader dismiss)
 * ─────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // 01. LENIS — Vertical Smooth Scroll
  // ─────────────────────────────────────────────────────────
  let lenis;
  let horizontalST = null; // the ScrollTrigger for the horizontal section

  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('[motion.js] Lenis not loaded.');
      return;
    }

    lenis = new Lenis({
      duration: 2.6,          // heavy, cinematic inertia
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.6,
      infinite: false,
    });

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    lenis.on('scroll', ({ scroll }) => {
      const h = document.getElementById('site-header');
      if (!h) return;
      h.classList.toggle('is-scrolled', scroll > 80);
    });

    window.lenis = lenis;
  }


  // ─────────────────────────────────────────────────────────
  // 02. GSAP HORIZONTAL PIN
  // The #featured section is pinned. GSAP translates
  // #featured-chapters along the X axis as the user scrolls.
  // ─────────────────────────────────────────────────────────
  let currentActiveIndex = -1;

  function initHorizontalScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const section  = document.getElementById('featured');
    const track    = document.getElementById('featured-chapters');
    const progress = document.getElementById('progress-bar');
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    // Total horizontal distance to travel
    const getWidth = () => track.scrollWidth - window.innerWidth;

    horizontalST = ScrollTrigger.create({
      trigger: section,
      pin: true,
      scrub: 2.4,
      start: 'top top',
      end: () => `+=${getWidth()}`,
      invalidateOnRefresh: true,
      animation: gsap.to(track, {
        x: () => -getWidth(),
        ease: 'none',
      }),
      onUpdate: (self) => {
        // Progress bar
        if (progress) progress.style.transform = `scaleX(${self.progress})`;

        // Audio: find which slide is centered in the viewport
        detectActiveSlide(self.progress);
      },
    });

    // Slide-C inner parallax — foreground moves faster than background
    document.querySelectorAll('.slide--type-c').forEach((slide) => {
      const fore = slide.querySelector('.slide__img--fore img');
      const back = slide.querySelector('.slide__img--back img');
      if (!fore || !back) return;

      // Both images scrub at different rates inside the horizontal scroll
      gsap.to(fore, {
        xPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: slide,
          containerAnimation: horizontalST?.animation,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      });

      gsap.to(back, {
        xPercent: 4,
        ease: 'none',
        scrollTrigger: {
          trigger: slide,
          containerAnimation: horizontalST?.animation,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      });
    });

    ScrollTrigger.refresh();
  }

  /**
   * Detect which slide is in the horizontal center of the viewport.
   * Fires audio crossfade when the active slide changes.
   */
  function detectActiveSlide(progress) {
    const slides = document.querySelectorAll('.chapter[data-index]');
    const total  = slides.length;
    if (!total) return;

    // Map progress (0→1) to slide index
    const idx = Math.min(Math.round(progress * (total - 1)), total - 1);
    if (idx === currentActiveIndex) return;
    currentActiveIndex = idx;

    const slide = slides[idx];
    if (!slide) return;

    const songUrl = slide.getAttribute('data-song');
    if (songUrl && window.audioEngine) {
      window.audioEngine.crossfadeTo(songUrl);
    }

    // Active state class for any CSS-driven effects
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
  }


  // ─────────────────────────────────────────────────────────
  // 03. CLIP-PATH IMAGE REVEALS
  // Each slide's image wrapper animates from hidden → visible
  // as the slide enters the pinned viewport.
  // ─────────────────────────────────────────────────────────
  function initSlideReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('.slide').forEach((slide) => {
      const imgs = slide.querySelectorAll('.slide__img-wrap');
      const content = slide.querySelector('.slide__content');
      const numeral = slide.querySelector('.slide__numeral');

      // --- Image clip-path reveals ---
      imgs.forEach((wrap, i) => {
        const fromClip = i % 2 === 0
          ? 'inset(100% 0% 0% 0%)'   // wipe up from bottom
          : 'inset(0% 0% 100% 0%)';  // wipe down from top

        gsap.fromTo(wrap,
          { clipPath: fromClip, scale: 1.06 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            duration: 1.5,
            ease: 'power4.out',
            delay: i * 0.15,
            scrollTrigger: {
              trigger: slide,
              containerAnimation: horizontalST?.animation,
              start: 'left 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // --- Numeral clip from bottom ---
      if (numeral) {
        gsap.fromTo(numeral,
          { clipPath: 'inset(0% 0% 100% 0%)', y: 30, opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: slide,
              containerAnimation: horizontalST?.animation,
              start: 'left 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // --- Content reveal-up ---
      if (content) {
        revealUp(content, slide);
      }
    });
  }

  /**
   * Reveal-up: wraps each word in a masking span so words
   * slide up from invisible lines (no SplitText plugin needed).
   */
  function revealUp(container, triggerEl) {
    // Split only the description paragraph's words
    const para = container.querySelector('.slide__description');
    if (!para) return;

    const raw = para.textContent;
    const words = raw.trim().split(/\s+/);

    para.innerHTML = words.map((w) =>
      `<span class="word-mask"><span class="word">${w}</span></span>`
    ).join(' ');

    const wordEls = para.querySelectorAll('.word');

    gsap.fromTo(wordEls,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.025,
        delay: 0.3,
        scrollTrigger: {
          trigger: triggerEl,
          containerAnimation: horizontalST?.animation,
          start: 'left 80%',
          toggleActions: 'play none none none',
        },
      }
    );

    // Meta line fade
    const meta = container.querySelector('.slide__meta');
    if (meta) {
      gsap.fromTo(meta,
        { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          delay: 0.1,
          scrollTrigger: {
            trigger: triggerEl,
            containerAnimation: horizontalST?.animation,
            start: 'left 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }
  }


  // ─────────────────────────────────────────────────────────
  // 04. HERO ANIMATIONS
  // ─────────────────────────────────────────────────────────
  function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    // Header entry
    gsap.fromTo('#site-header',
      { y: -16, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, delay: 0.1, ease: 'power3.out' }
    );

    // Hero eyebrow wipe
    gsap.fromTo('.hero__eyebrow',
      { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
      { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.2, delay: 0.4, ease: 'power4.out' }
    );

    // Title lines — clip from bottom
    gsap.utils.toArray('.hero__title-line span').forEach((span, i) => {
      gsap.fromTo(span,
        { clipPath: 'inset(100% 0% 0% 0%)', y: '60%' },
        { clipPath: 'inset(0% 0% 0% 0%)', y: '0%', duration: 1.5, delay: 0.5 + i * 0.2, ease: 'power4.out' }
      );
    });

    // Hero meta fade
    gsap.fromTo('.hero__meta',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 1.4, delay: 1.3, ease: 'power3.out' }
    );

    // Scroll indicator
    gsap.fromTo('.hero__scroll',
      { opacity: 0 },
      { opacity: 1, duration: 1.6, delay: 2.2, ease: 'power2.out' }
    );

    // Hero image parallax
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.to('.hero__bg', {
        scrollTrigger: {
          trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.8,
        },
        y: '20%', scale: 1.08, ease: 'none',
      });
    }
  }


  // ─────────────────────────────────────────────────────────
  // 05. JUMP TO CHAPTER UTILITY
  // Called by main.js after loader fades — scrolls to the
  // vertical position that puts the target slide in view.
  // ─────────────────────────────────────────────────────────
  window.jumpToChapter = function (index) {
    if (!lenis || !horizontalST) return;

    const slides = document.querySelectorAll('.chapter[data-index]');
    const total  = slides.length;
    if (!total || index < 0) return;

    const clampedIdx  = Math.min(index, total - 1);
    const progress    = clampedIdx / Math.max(total - 1, 1);

    // The GSAP ScrollTrigger maps its scroll range to [start → end]
    // We need the corresponding native scroll position.
    const st = horizontalST;
    if (!st) return;

    const targetScroll = st.start + progress * (st.end - st.start);

    lenis.scrollTo(targetScroll, { immediate: true, duration: 0 });
  };


  // ─────────────────────────────────────────────────────────
  // 06. FILM GRAIN — 24fps tiled canvas
  // ─────────────────────────────────────────────────────────
  function initFilmGrain() {
    const canvas = document.getElementById('film-grain-canvas');
    if (!canvas) return;

    const ctx  = canvas.getContext('2d', { alpha: true });
    const TILE = 128;
    const off  = document.createElement('canvas');
    off.width  = TILE;
    off.height = TILE;
    const offCtx = off.getContext('2d');

    const TARGET_FPS    = 24;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    let lastFrame = 0, rafId;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawTile() {
      const d = offCtx.createImageData(TILE, TILE).data;
      const img = offCtx.createImageData(TILE, TILE);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = (Math.random() * 28 + 4) | 0;
      }
      offCtx.putImageData(img, 0, 0);
    }

    function draw(ts) {
      rafId = requestAnimationFrame(draw);
      if (ts - lastFrame < FRAME_INTERVAL) return;
      lastFrame = ts;
      drawTile();
      const W = canvas.width, H = canvas.height;
      const cols = Math.ceil(W / TILE), rows = Math.ceil(H / TILE);
      ctx.clearRect(0, 0, W, H);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          ctx.drawImage(off, c * TILE, r * TILE);
    }

    resize();
    rafId = requestAnimationFrame(draw);

    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(resize, 200);
    }, { passive: true });

    window.filmGrain = {
      pause: () => cancelAnimationFrame(rafId),
      resume: () => { rafId = requestAnimationFrame(draw); },
    };
  }


  // ─────────────────────────────────────────────────────────
  // INIT SEQUENCE
  // chapters.js calls window.onChaptersRendered() after
  // building the DOM, which triggers the GSAP setup.
  // ─────────────────────────────────────────────────────────

  function afterChaptersRendered() {
    initHorizontalScroll();

    // Wait 2 RAF ticks for layout to settle before setting up reveals
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initSlideReveals();
        ScrollTrigger.refresh();
      });
    });
  }

  function init() {
    initLenis();
    initHeroAnimations();
    initFilmGrain();

    // If chapters already rendered (script order), run immediately
    if (document.querySelector('.chapter')) {
      afterChaptersRendered();
    } else {
      // Otherwise wait for chapters.js signal
      window.onChaptersRendered = afterChaptersRendered;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
