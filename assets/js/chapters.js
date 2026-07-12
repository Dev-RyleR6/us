/**
 * Our Story — Chapter Renderer
 * ─────────────────────────────────────────
 * Reads `relationshipChapters` and dynamically builds each
 * magazine-spread chapter into #featured-chapters.
 *
 * Layout builders:
 *   buildEditorialLeft()       → image left, text + 2 images right
 *   buildEditorialRight()      → text left, image right
 *   buildEditorialCinematic()  → full-bleed, text overlay
 *   buildEditorialTriptych()   → 3 staggered images, caption below
 *   buildEditorialAsymmetric() → hero + offset small + floating text
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // LAYOUT BUILDERS
  // Each returns a DOM element (the chapter article)
  // ─────────────────────────────────────────────────────────

  /**
   * Shared chapter wrapper
   */
  function createChapterWrapper(chapter, extraClass = '') {
    const article = document.createElement('article');
    article.className = `chapter ${chapter.layout} ${extraClass}`.trim();
    article.setAttribute('data-chapter', chapter.chapterNumber);
    article.setAttribute('aria-label', `Chapter ${chapter.chapterNumber}: ${chapter.monthName}`);
    return article;
  }

  /**
   * Chapter header — roman numeral + month name
   */
  function buildChapterHeader(chapter) {
    return `
      <header class="chapter__header">
        <div class="chapter__numeral t-display--italic">${chapter.chapterNumber}</div>
        <div class="chapter__meta">
          <span class="rule--accent"></span>
          <span class="t-subheading chapter__month">${chapter.monthName}</span>
        </div>
      </header>
    `;
  }

  /**
   * Chapter description block
   */
  function buildDescription(chapter) {
    return `
      <div class="chapter__text reveal">
        <p class="chapter__description">${chapter.description}</p>
        ${chapter.songUrl ? buildSongButton(chapter) : ''}
      </div>
    `;
  }

  /**
   * Audio/song hint button
   */
  function buildSongButton(chapter) {
    return `
      <button
        class="chapter__song-btn"
        data-song="${chapter.songUrl}"
        aria-label="Play the song for ${chapter.monthName}"
      >
        <svg class="chapter__song-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        <span class="t-caption">Play the song of this month</span>
      </button>
    `;
  }

  /**
   * Image element builder
   */
  function buildImg(src, alt, cls = '') {
    return `<div class="chapter__img-wrap ${cls} reveal">
      <img src="${src}" alt="${alt}" loading="lazy" />
    </div>`;
  }

  // ─────────────────────────────────────────────────────────
  // LAYOUT A: editorial-left
  // Primary tall image on the left, header + text + 2 smaller images on the right
  // ─────────────────────────────────────────────────────────
  function buildEditorialLeft(chapter) {
    const el = createChapterWrapper(chapter);
    el.innerHTML = `
      <div class="chapter__grid chapter__grid--left">

        <div class="chapter__col-primary">
          ${buildImg(chapter.images[0], `${chapter.monthName} — primary photo`, 'chapter__img--primary')}
        </div>

        <div class="chapter__col-secondary">
          ${buildChapterHeader(chapter)}
          ${buildDescription(chapter)}
          <div class="chapter__img-pair">
            ${buildImg(chapter.images[1], `${chapter.monthName} — second photo`, 'chapter__img--sm')}
            ${buildImg(chapter.images[2], `${chapter.monthName} — third photo`, 'chapter__img--sm chapter__img--offset')}
          </div>
        </div>

      </div>
    `;
    return el;
  }

  // ─────────────────────────────────────────────────────────
  // LAYOUT B: editorial-right
  // Mirrored — header + text + 2 images left, tall image right
  // ─────────────────────────────────────────────────────────
  function buildEditorialRight(chapter) {
    const el = createChapterWrapper(chapter);
    el.innerHTML = `
      <div class="chapter__grid chapter__grid--right">

        <div class="chapter__col-secondary">
          ${buildChapterHeader(chapter)}
          ${buildDescription(chapter)}
          <div class="chapter__img-pair">
            ${buildImg(chapter.images[1], `${chapter.monthName} — second photo`, 'chapter__img--sm chapter__img--offset')}
            ${buildImg(chapter.images[2], `${chapter.monthName} — third photo`, 'chapter__img--sm')}
          </div>
        </div>

        <div class="chapter__col-primary">
          ${buildImg(chapter.images[0], `${chapter.monthName} — primary photo`, 'chapter__img--primary')}
        </div>

      </div>
    `;
    return el;
  }

  // ─────────────────────────────────────────────────────────
  // LAYOUT C: editorial-cinematic
  // Full-bleed image, text overlay at bottom-left
  // ─────────────────────────────────────────────────────────
  function buildEditorialCinematic(chapter) {
    const el = createChapterWrapper(chapter);
    el.innerHTML = `
      <div class="chapter__cinematic">

        <div class="chapter__cinematic-img reveal">
          <img src="${chapter.images[0]}" alt="${chapter.monthName} — cinematic photo" loading="lazy" />
          <div class="chapter__cinematic-overlay" aria-hidden="true"></div>
        </div>

        <div class="chapter__cinematic-content">
          ${buildChapterHeader(chapter)}
          ${buildDescription(chapter)}
        </div>

        <div class="chapter__cinematic-aside">
          ${buildImg(chapter.images[1], `${chapter.monthName} — second photo`, 'chapter__img--aside')}
        </div>

      </div>
    `;
    return el;
  }

  // ─────────────────────────────────────────────────────────
  // LAYOUT D: editorial-triptych
  // Three staggered images of varying heights, caption block below
  // ─────────────────────────────────────────────────────────
  function buildEditorialTriptych(chapter) {
    const el = createChapterWrapper(chapter);
    el.innerHTML = `
      <div class="chapter__triptych">

        <div class="chapter__triptych-header reveal">
          ${buildChapterHeader(chapter)}
        </div>

        <div class="chapter__triptych-images">
          ${buildImg(chapter.images[0], `${chapter.monthName} — first photo`,  'chapter__img--t1')}
          ${buildImg(chapter.images[1], `${chapter.monthName} — second photo`, 'chapter__img--t2')}
          ${buildImg(chapter.images[2], `${chapter.monthName} — third photo`,  'chapter__img--t3')}
        </div>

        <div class="chapter__triptych-caption reveal">
          ${buildDescription(chapter)}
        </div>

      </div>
    `;
    return el;
  }

  // ─────────────────────────────────────────────────────────
  // LAYOUT E: editorial-asymmetric
  // Large hero image bleeds from edge, small offset image, text floats center-right
  // ─────────────────────────────────────────────────────────
  function buildEditorialAsymmetric(chapter) {
    const el = createChapterWrapper(chapter);
    el.innerHTML = `
      <div class="chapter__asymmetric">

        <div class="chapter__asym-hero reveal">
          <img src="${chapter.images[0]}" alt="${chapter.monthName} — hero photo" loading="lazy" />
        </div>

        <div class="chapter__asym-text">
          ${buildChapterHeader(chapter)}
          ${buildDescription(chapter)}
        </div>

        <div class="chapter__asym-small reveal reveal--delay-2">
          <img src="${chapter.images[1]}" alt="${chapter.monthName} — second photo" loading="lazy" />
        </div>

      </div>
    `;
    return el;
  }

  // ─────────────────────────────────────────────────────────
  // DISPATCHER
  // Maps layout name → builder function
  // ─────────────────────────────────────────────────────────
  const layoutBuilders = {
    'editorial-left':       buildEditorialLeft,
    'editorial-right':      buildEditorialRight,
    'editorial-cinematic':  buildEditorialCinematic,
    'editorial-triptych':   buildEditorialTriptych,
    'editorial-asymmetric': buildEditorialAsymmetric,
  };

  // ─────────────────────────────────────────────────────────
  // AUDIO PLAYER (minimal, inline)
  // ─────────────────────────────────────────────────────────
  let activeAudio = null;
  let activeBtn   = null;

  function initSongButtons() {
    document.querySelectorAll('.chapter__song-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const src = btn.dataset.song;

        // If this song is already playing, pause it
        if (activeAudio && activeBtn === btn) {
          activeAudio.pause();
          activeAudio = null;
          activeBtn   = null;
          btn.classList.remove('is-playing');
          return;
        }

        // Pause any currently playing audio
        if (activeAudio) {
          activeAudio.pause();
          activeBtn.classList.remove('is-playing');
        }

        // Attempt to play — gracefully fails if file doesn't exist yet
        const audio = new Audio(src);
        audio.volume = 0.7;

        audio.play().catch(() => {
          // File placeholder — show a soft message instead of error
          const label = btn.querySelector('.t-caption');
          if (label) {
            const original = label.textContent;
            label.textContent = 'No audio file yet — add one to assets/audio/';
            setTimeout(() => { label.textContent = original; }, 3000);
          }
          return;
        });

        audio.addEventListener('ended', () => {
          btn.classList.remove('is-playing');
          activeAudio = null;
          activeBtn   = null;
        });

        activeAudio = audio;
        activeBtn   = btn;
        btn.classList.add('is-playing');
      });
    });
  }

  // ─────────────────────────────────────────────────────────
  // DIVIDER BETWEEN CHAPTERS
  // ─────────────────────────────────────────────────────────
  function buildDivider() {
    const div = document.createElement('div');
    div.className = 'chapter-divider';
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = `<span class="chapter-divider__line"></span>
                     <span class="chapter-divider__glyph">✦</span>
                     <span class="chapter-divider__line"></span>`;
    return div;
  }

  // ─────────────────────────────────────────────────────────
  // MAIN RENDER FUNCTION
  // ─────────────────────────────────────────────────────────
  function renderChapters() {
    const target = document.getElementById('featured-chapters');
    if (!target) {
      console.warn('[chapters.js] #featured-chapters not found in DOM.');
      return;
    }

    if (!window.relationshipChapters || !window.relationshipChapters.length) {
      console.warn('[chapters.js] relationshipChapters data not found.');
      return;
    }

    const fragment = document.createDocumentFragment();

    window.relationshipChapters.forEach((chapter, index) => {
      const builder = layoutBuilders[chapter.layout];

      if (!builder) {
        console.warn(`[chapters.js] Unknown layout "${chapter.layout}" for chapter ${chapter.chapterNumber}`);
        return;
      }

      const el = builder(chapter);

      // Stagger reveal delay based on position (capped at 4 classes)
      const delayClass = `reveal--delay-${Math.min((index % 3) + 1, 4)}`;
      el.classList.add('reveal', delayClass);

      fragment.appendChild(el);

      // Add a divider between chapters (not after the last one)
      if (index < window.relationshipChapters.length - 1) {
        fragment.appendChild(buildDivider());
      }
    });

    target.appendChild(fragment);

    // Re-initialize intersection observer for newly added .reveal elements
    if (window.reinitRevealObserver) {
      window.reinitRevealObserver();
    }

    // Wire up audio buttons
    initSongButtons();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderChapters);
  } else {
    renderChapters();
  }

})();
