/**
 * Our Story — Chapter Renderer (Depo Luxe Edition)
 * ─────────────────────────────────────────────────────────
 * Reads `relationshipChapters` and builds 3 alternating
 * full-viewport slide types into #featured-chapters.
 *
 * Slide Types (cycle A → B → C → A…):
 *   A — Image top-left, text block bottom-right
 *   B — Large image center-left, Roman numeral floating far-right
 *   C — Two overlapping images (parallax depth)
 *
 * Each slide: width:100vw, height:100vh, position:relative
 * GSAP in motion.js handles clip-path reveals + horizontal pin.
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // SHARED HELPERS
  // ─────────────────────────────────────────────────────────

  function createSlideWrapper(chapter, type) {
    const article = document.createElement('article');
    article.className = `chapter slide slide--${type}`;
    article.setAttribute('data-chapter', chapter.chapterNumber);
    article.setAttribute('data-song', chapter.songUrl || '');
    article.setAttribute('aria-label', `Chapter ${chapter.chapterNumber}: ${chapter.momentTitle}`);
    return article;
  }

  /** Bare <img> wrapped in an overflow:hidden reveal container */
  function imgWrap(src, alt, extraClass = '') {
    return `
      <div class="slide__img-wrap ${extraClass}">
        <img src="${src}" alt="${alt}" loading="lazy" draggable="false" />
      </div>`;
  }

  /** Tiny metadata line — rule + moment date */
  function metaLine(chapter) {
    return `
      <div class="slide__meta">
        <span class="slide__rule"></span>
        <span class="slide__month">${chapter.momentDate}</span>
      </div>`;
  }

  /** Description paragraph */
  function descPara(chapter) {
    return `<p class="slide__description">${chapter.description}</p>`;
  }


  // ─────────────────────────────────────────────────────────
  // SLIDE TYPE A
  // Image top-left (55% × 65%) — text block bottom-right
  // ─────────────────────────────────────────────────────────
  function buildSlideA(chapter) {
    const el = createSlideWrapper(chapter, 'type-a');
    el.innerHTML = `

      <!-- Roman numeral watermark -->
      <span class="slide__numeral" aria-hidden="true">${chapter.chapterNumber}</span>

      <!-- Primary image — top-left -->
      ${imgWrap(chapter.images[0], `${chapter.momentTitle} — primary photo`, 'slide__img--primary')}

      <!-- Second image — offset lower left -->
      ${chapter.images[1] ? imgWrap(chapter.images[1], `${chapter.momentTitle} — second photo`, 'slide__img--secondary') : ''}

      <!-- Text — bottom-right -->
      <div class="slide__content slide__content--br">
        ${metaLine(chapter)}
        ${descPara(chapter)}
      </div>

      <!-- Bottom border rule -->
      <div class="slide__border-bottom" aria-hidden="true"></div>
    `;
    return el;
  }


  // ─────────────────────────────────────────────────────────
  // SLIDE TYPE B
  // Large image center-left — Roman numeral floating far right
  // ─────────────────────────────────────────────────────────
  function buildSlideB(chapter) {
    const el = createSlideWrapper(chapter, 'type-b');
    el.innerHTML = `

      <!-- Large primary image — center-left column -->
      ${imgWrap(chapter.images[0], `${chapter.momentTitle} — primary photo`, 'slide__img--hero')}

      <!-- Ghost Roman numeral — far right -->
      <span class="slide__numeral slide__numeral--ghost" aria-hidden="true">${chapter.chapterNumber}</span>

      <!-- Text — centered in right column -->
      <div class="slide__content slide__content--right-center">
        ${metaLine(chapter)}
        ${descPara(chapter)}
      </div>

      <!-- Thin vertical divider line -->
      <div class="slide__divider-v" aria-hidden="true"></div>
    `;
    return el;
  }


  // ─────────────────────────────────────────────────────────
  // SLIDE TYPE C
  // Two overlapping images + centered text (parallax pair)
  // ─────────────────────────────────────────────────────────
  function buildSlideC(chapter) {
    const el = createSlideWrapper(chapter, 'type-c');
    const hasThreeImages = chapter.images.length >= 3;
    const leftPolaroid = hasThreeImages ? chapter.images[1] : chapter.images[0];
    const rightPolaroid = hasThreeImages ? chapter.images[2] : (chapter.images[1] || chapter.images[0]);
    const backgroundImage = hasThreeImages ? chapter.images[0] : null;

    el.innerHTML = `

      <!-- Background image (if available) -->
      ${backgroundImage ? imgWrap(
        backgroundImage,
        `${chapter.momentTitle} — background photo`,
        'slide__img--back'
      ) : ''}

      <!-- Polaroid pair -->
      <div class="slide__polaroids">
        ${leftPolaroid ? `
          <div class="slide__img-wrap slide__img--fore-left">
            <img src="${leftPolaroid}" alt="${chapter.momentTitle} — left photo" loading="lazy" draggable="false">
          </div>
        ` : ''}

        ${rightPolaroid ? `
          <div class="slide__img-wrap slide__img--fore">
            <img src="${rightPolaroid}" alt="${chapter.momentTitle} — right photo" loading="lazy" draggable="false">
          </div>
        ` : ''}
      </div>

      <!-- Centered text overlay -->
      <div class="slide__content slide__content--center">
        <span class="slide__numeral slide__numeral--center" aria-hidden="true">${chapter.chapterNumber}</span>
        ${metaLine(chapter)}
        ${descPara(chapter)}
      </div>
    `;
    return el;
  }


  // ─────────────────────────────────────────────────────────
  // SLIDE TYPE D
  // Content left, large image right
  // ─────────────────────────────────────────────────────────
  function buildSlideD(chapter) {
    const el = createSlideWrapper(chapter, 'type-d');
    el.innerHTML = `

      <!-- Large primary image — center-right column -->
      ${imgWrap(chapter.images[0], `${chapter.momentTitle} — primary photo`, 'slide__img--hero-right')}

      <!-- Ghost Roman numeral — far left -->
      <span class="slide__numeral slide__numeral--ghost-left" aria-hidden="true">${chapter.chapterNumber}</span>

      <!-- Text — centered in left column -->
      <div class="slide__content slide__content--left-center">
        ${metaLine(chapter)}
        ${descPara(chapter)}
      </div>

      <!-- Thin vertical divider line -->
      <div class="slide__divider-v-left" aria-hidden="true"></div>
    `;
    return el;
  }


  // ─────────────────────────────────────────────────────────
  // DISPATCHER
  // ─────────────────────────────────────────────────────────
  function buildPlaceholderSlide(chapter) {
    const el = createSlideWrapper(chapter, 'placeholder');
    el.innerHTML = `<div class="reserved-page" aria-hidden="true"><span>II</span><small>A story still unfolding</small></div>
      <div class="milestone-copy">${metaLine(chapter)}<h2>${chapter.momentTitle}</h2>${descPara(chapter)}<span class="milestone-label">Reserved with love</span></div>`;
    return el;
  }

  function buildScrapbookSlide(chapter) {
    const el = createSlideWrapper(chapter, 'scrapbook');
    el.innerHTML = `<div class="scrapbook-covers">
      <img class="scrapbook-covers__last" src="${chapter.images[1]}" alt="The scrapbook’s closing love card" loading="lazy" width="1500" height="1500">
      <img class="scrapbook-covers__first" src="${chapter.images[0]}" alt="Lovey’s third monthsary scrapbook cover" loading="lazy" width="1500" height="1500">
      </div><div class="milestone-copy">${metaLine(chapter)}<h2>${chapter.momentTitle}</h2>${descPara(chapter)}
      <button class="scrapbook-cta" data-open-scrapbook>Open Lovey’s Memory Gallery <span>↗</span></button><span class="milestone-label">Volume III · ${chapter.totalPages} images · Made by lovey</span></div>`;
    return el;
  }

  const layoutToBuilder = {
    'editorial-placeholder': buildPlaceholderSlide,
    'editorial-scrapbook': buildScrapbookSlide,
    'editorial-cinematic': buildSlideC,
    'slide-c': buildSlideC,
    'editorial-left': buildSlideA,
    'editorial-right': buildSlideD,
    'editorial-triptych': buildSlideA,
    'editorial-asymmetric': buildSlideB
  };
  const fallbackBuilders = [buildSlideA, buildSlideB, buildSlideC];


  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  function renderChapters() {
    const target = document.getElementById('featured-chapters');
    if (!target) {
      console.warn('[chapters.js] #featured-chapters not found.');
      return;
    }
    if (!window.relationshipChapters || !window.relationshipChapters.length) {
      console.warn('[chapters.js] relationshipChapters data not found.');
      return;
    }

    const frag = document.createDocumentFragment();

    window.relationshipChapters.forEach((chapter, i) => {
      const builder = layoutToBuilder[chapter.layout] || fallbackBuilders[i % 3];
      const el = builder(chapter);
      el.setAttribute('data-index', i);
      frag.appendChild(el);
    });

    target.appendChild(frag);

    // Re-init reveal observer for newly added elements
    if (window.reinitRevealObserver) {
      window.reinitRevealObserver();
    }

    // Signal motion.js that DOM is ready for GSAP setup
    if (typeof window.onChaptersRendered === 'function') {
      window.onChaptersRendered();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderChapters);
  } else {
    renderChapters();
  }

})();
