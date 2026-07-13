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
  let horizontalST = null;
  let verticalIO = null;
  let slideTriggers = [];
  let currentActiveIndex = -1;

  const MOBILE_MQ = window.matchMedia('(max-width: 820px)');

  function isMobileLayout() {
    return MOBILE_MQ.matches;
  }

  function setLayoutMode() {
    document.body.classList.toggle('is-mobile-layout', isMobileLayout());
  }

  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('[motion.js] Lenis not loaded.');
      return;
    }

    lenis = new Lenis({
      duration: isMobileLayout() ? 1.4 : 2.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: isMobileLayout() ? 2.2 : 1.6,
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
  // 02a. MOBILE VERTICAL CHAPTERS
  // On phones, chapters stack vertically with standard scroll.
  // ─────────────────────────────────────────────────────────
  function initVerticalChapters() {
    const slides = document.querySelectorAll('.chapter[data-index]');
    if (!slides.length) return;

    if (verticalIO) verticalIO.disconnect();

    verticalIO = new IntersectionObserver(
      (entries) => {
        let best = null;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        });
        if (!best || best.intersectionRatio < 0.3) return;

        const slide = best.target;
        const idx = parseInt(slide.getAttribute('data-index'), 10);
        if (idx === currentActiveIndex) return;
        currentActiveIndex = idx;

        const songUrl = slide.getAttribute('data-song');
        if (songUrl && window.audioEngine) {
          window.audioEngine.crossfadeTo(songUrl);
        }

        slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      },
      { threshold: [0.3, 0.5, 0.7], rootMargin: '-15% 0px -25% 0px' }
    );

    slides.forEach((slide) => verticalIO.observe(slide));
  }


  // ─────────────────────────────────────────────────────────
  // 02b. TEARDOWN — reset featured motion on breakpoint change
  // ─────────────────────────────────────────────────────────
  function teardownFeaturedMotion() {
    if (horizontalST) {
      horizontalST.kill();
      horizontalST = null;
    }

    if (verticalIO) {
      verticalIO.disconnect();
      verticalIO = null;
    }

    slideTriggers.forEach((st) => st.kill());
    slideTriggers = [];
    currentActiveIndex = -1;

    if (typeof gsap !== 'undefined') {
      const track = document.getElementById('featured-chapters');
      if (track) gsap.set(track, { x: 0, clearProps: 'transform' });

      document.querySelectorAll(
        '.slide__img-wrap, .slide__numeral, .slide__meta, .slide__description .word'
      ).forEach((el) => {
        gsap.set(el, { clearProps: 'clipPath,opacity,transform,scale,y' });
      });
    }

    const progress = document.getElementById('progress-bar');
    if (progress) progress.style.transform = 'scaleX(0)';
  }


  // ─────────────────────────────────────────────────────────
  // 02c. GSAP HORIZONTAL PIN (tablet + desktop)
  // ─────────────────────────────────────────────────────────

  function getHeaderOffset() {
    const header = document.getElementById('site-header');
    return header ? header.getBoundingClientRect().height : 64;
  }

  function initHorizontalScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (isMobileLayout()) {
      initVerticalChapters();
      return;
    }

    const section  = document.getElementById('featured');
    const track    = document.getElementById('featured-chapters');
    const progress = document.getElementById('progress-bar');
    if (!section || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const getWidth = () => Math.max(0, track.scrollWidth - section.clientWidth);

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
        if (progress) progress.style.transform = `scaleX(${self.progress})`;
        detectActiveSlide(self.progress);
      },
    });

    slideTriggers.push(horizontalST);

    document.querySelectorAll('.slide--type-c').forEach((slide) => {
      const fore = slide.querySelector('.slide__img--fore img');
      const back = slide.querySelector('.slide__img--back img');
      if (!fore || !back) return;

      const foreST = gsap.to(fore, {
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

      const backST = gsap.to(back, {
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

      if (foreST.scrollTrigger) slideTriggers.push(foreST.scrollTrigger);
      if (backST.scrollTrigger) slideTriggers.push(backST.scrollTrigger);
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

    const horizontal = !isMobileLayout();

    document.querySelectorAll('.slide').forEach((slide) => {
      const imgs = slide.querySelectorAll('.slide__img-wrap');
      const content = slide.querySelector('.slide__content');
      const numeral = slide.querySelector('.slide__numeral');

      const triggerBase = horizontal
        ? {
            trigger: slide,
            containerAnimation: horizontalST?.animation,
            start: 'left 90%',
            toggleActions: 'play none none none',
          }
        : {
            trigger: slide,
            start: 'top 82%',
            toggleActions: 'play none none none',
          };

      const numeralTrigger = horizontal
        ? { ...triggerBase, start: 'left 85%' }
        : { ...triggerBase, start: 'top 78%' };

      const contentTrigger = horizontal
        ? { trigger: slide, containerAnimation: horizontalST?.animation, start: 'left 80%', toggleActions: 'play none none none' }
        : { trigger: slide, start: 'top 75%', toggleActions: 'play none none none' };

      imgs.forEach((wrap, i) => {
        const fromClip = i % 2 === 0
          ? 'inset(100% 0% 0% 0%)'
          : 'inset(0% 0% 100% 0%)';

        const tween = gsap.fromTo(wrap,
          { clipPath: fromClip, scale: 1.06 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            scale: 1,
            duration: 1.5,
            ease: 'power4.out',
            delay: i * 0.15,
            scrollTrigger: triggerBase,
          }
        );
        if (tween.scrollTrigger) slideTriggers.push(tween.scrollTrigger);
      });

      if (numeral) {
        const tween = gsap.fromTo(numeral,
          { clipPath: 'inset(0% 0% 100% 0%)', y: 30, opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: 'power4.out',
            scrollTrigger: numeralTrigger,
          }
        );
        if (tween.scrollTrigger) slideTriggers.push(tween.scrollTrigger);
      }

      if (content) {
        revealUp(content, slide, contentTrigger);
      }
    });
  }

  /**
   * Reveal-up: wraps each word in a masking span so words
   * slide up from invisible lines (no SplitText plugin needed).
   */
  function revealUp(container, triggerEl, scrollTriggerConfig) {
    const para = container.querySelector('.slide__description');
    if (!para) return;

    if (!para.querySelector('.word-mask')) {
      const raw = para.textContent;
      const words = raw.trim().split(/\s+/);

      para.innerHTML = words.map((w) =>
        `<span class="word-mask"><span class="word">${w}</span></span>`
      ).join(' ');
    }

    const wordEls = para.querySelectorAll('.word');

    const wordTween = gsap.fromTo(wordEls,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.025,
        delay: 0.3,
        scrollTrigger: scrollTriggerConfig,
      }
    );
    if (wordTween.scrollTrigger) slideTriggers.push(wordTween.scrollTrigger);

    const meta = container.querySelector('.slide__meta');
    if (meta) {
      const metaConfig = { ...scrollTriggerConfig };
      if (metaConfig.start && metaConfig.start.includes('80%')) {
        metaConfig.start = metaConfig.start.replace('80%', '85%');
      }

      const metaTween = gsap.fromTo(meta,
        { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: 1.0,
          ease: 'power3.out',
          delay: 0.1,
          scrollTrigger: metaConfig,
        }
      );
      if (metaTween.scrollTrigger) slideTriggers.push(metaTween.scrollTrigger);
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
    const slides = document.querySelectorAll('.chapter[data-index]');
    const total  = slides.length;
    if (!total || index < 0) return;

    const clampedIdx = Math.min(index, total - 1);
    const slide = slides[clampedIdx];
    if (!slide) return;

    if (isMobileLayout()) {
      const top = slide.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
      if (lenis) {
        lenis.scrollTo(top, { duration: 1.2 });
      } else {
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    if (!lenis || !horizontalST) return;

    const progress = clampedIdx / Math.max(total - 1, 1);
    const st = horizontalST;
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
    setLayoutMode();
    teardownFeaturedMotion();
    initHorizontalScroll();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initSlideReveals();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
    });
  }

  function handleBreakpointChange() {
    setLayoutMode();
    teardownFeaturedMotion();

    requestAnimationFrame(() => {
      initHorizontalScroll();
      requestAnimationFrame(() => {
        initSlideReveals();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
    });
  }

  let resizeTimer;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 200);
  }

  function init() {
    setLayoutMode();
    initLenis();
    initHeroAnimations();
    initFilmGrain();

    MOBILE_MQ.addEventListener('change', handleBreakpointChange);
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(handleBreakpointChange, 300);
    }, { passive: true });

    if (document.querySelector('.chapter')) {
      afterChaptersRendered();
    } else {
      window.onChaptersRendered = afterChaptersRendered;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
