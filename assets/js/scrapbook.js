/* Modal story player and original-page reader. All motion is local and silent. */
(() => {
  'use strict';
  const chapter = window.relationshipChapters.find(item => item.layout === 'editorial-scrapbook');
  const dialog = document.getElementById('scrapbook-modal');
  if (!chapter || !dialog) return;
  // Use gallery language in the interface while preserving the original chapter data.
  // NOTE: el.textContent = ... destroys child elements — walk text nodes instead.
  function renameText(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      node.textContent = node.textContent
        .replace(/Scrapbook/gi, 'Memory Gallery')
        .replace(/Open scrapbook/gi, 'Open gallery');
    }
  }
  document.querySelectorAll('#scrapbook-title, [data-open-scrapbook], .scrapbook-cta').forEach(renameText);
  const $ = selector => dialog.querySelector(selector);
  const page = $('#scrapbook-page'), canvas = $('#showcase-canvas'), stage = $('.scrapbook-stage');
  const viewport = $('#scrapbook-viewport'), counter = $('#scrapbook-counter'), caption = $('#scrapbook-caption');
  const strip = $('#scrapbook-thumbnails'), progress = $('#story-progress'), time = $('#story-time');
  const previous = $('[data-scrapbook-prev]'), next = $('[data-scrapbook-next]');
  const play = $('#showcase-play'), restart = $('#showcase-restart'), read = $('#story-read');
  const back = $('#showcase-return'), zoom = $('#scrapbook-zoom'), status = $('#showcase-status'), error = $('#scrapbook-error');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const { config, timeline, locate, draw } = window.ScrapbookShowcase;
  const cache = new Map();
  let presetId = 'highlights', scenes = timeline(presetId), mode = 'story';
  let images = {}, assetsPreset = '', elapsed = 0, playing = false, loading = false, failed = false;
  let pageIndex = 0, pageRequest = 0, storyRequest = 0, frame = 0, lastTime = 0, lastPaint = -1;
  let animation, opener, savedScroll = 0, oldOverflow, resumeLenis = false, zoomed = false, touchStart;
  let segments = [], stageVisible = true;
  const pad = n => String(n).padStart(2, '0');
  const formatTime = seconds => `${Math.floor(seconds / 60)}:${pad(Math.floor(seconds % 60))}`;
  function loadImage(src) {
    if (!cache.has(src)) cache.set(src, new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = async () => { try { await image.decode(); resolve(image); } catch (e) { reject(e); } };
      image.onerror = () => reject(new Error('Image unavailable'));
      image.src = src;
    }).catch(e => { cache.delete(src); throw e; }));
    return cache.get(src);
  }
  function setZoom(value) {
    zoomed = value;
    stage.classList.toggle('is-zoomed', value);
    zoom.setAttribute('aria-pressed', String(value)); zoom.textContent = value ? 'Fit page' : 'Zoom 2×';
    viewport.tabIndex = value ? 0 : -1;
    viewport.scrollLeft = value ? viewport.clientWidth / 2 : 0;
    viewport.scrollTop = value ? viewport.clientHeight / 2 : 0;
  }
  function setMode(value) {
    mode = value; dialog.dataset.mode = value; setZoom(false);
    const story = mode === 'story';
    canvas.hidden = !story; viewport.hidden = story;
    progress.hidden = !story; time.hidden = !story; strip.hidden = story; caption.hidden = true;
    play.hidden = restart.hidden = read.hidden = !story;
    back.hidden = zoom.hidden = story;
    stage.classList.toggle('is-showcase', story);
    previous.setAttribute('aria-label', story ? 'Previous scene' : 'Previous page');
    next.setAttribute('aria-label', story ? 'Next scene' : 'Next page');
    error.hidden = true; stage.removeAttribute('aria-busy');
  }
  function syncPlay() {
    play.disabled = loading;
    play.textContent = loading ? 'Loading…' : failed ? 'Retry story' : playing ? 'Pause story' : elapsed ? 'Resume story ♡' : 'Play story ♡';
    play.setAttribute('aria-pressed', String(playing));
  }
  function pause(message = '') {
    playing = false; cancelAnimationFrame(frame); syncPlay();
    if (message) status.textContent = message;
  }
  function renderStory() {
    const state = locate(scenes, elapsed / 1000);
    draw(canvas.getContext('2d'), images, scenes, elapsed / 1000, reduced.matches);
    const label = `PAGE ${pad(state.scene.page)} / 11`;
    if (counter.textContent !== label) counter.textContent = label;
    canvas.setAttribute('aria-label', state.scene.label);
    time.textContent = `${formatTime(state.time)} / ${formatTime(state.duration)}`;
    segments.forEach((button, i) => {
      const amount = i < state.index ? 1 : i === state.index ? state.progress : 0;
      button.style.setProperty('--scene-progress', amount);
      button.setAttribute('aria-current', i === state.index ? 'step' : 'false');
    });
    previous.disabled = state.index === 0; next.disabled = state.index === scenes.length - 1;
    read.textContent = 'Read This Page';
  }
  function tick(now) {
    if (!playing || mode !== 'story' || !dialog.open || document.hidden || !stageVisible) return;
    elapsed = (elapsed + now - lastTime) % (scenes[scenes.length - 1].end * 1000); lastTime = now;
    const paintKey = reduced.matches ? Math.floor(elapsed / 1000) : Math.floor(elapsed / (1000 / 30));
    if (paintKey !== lastPaint) { renderStory(); lastPaint = paintKey; }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (loading || document.hidden || !stageVisible || mode !== 'story') return;
    cancelAnimationFrame(frame); playing = true; lastTime = performance.now(); lastPaint = -1;
    status.textContent = ''; syncPlay(); frame = requestAnimationFrame(tick);
  }
  async function prepareStory(autoplay = false) {
    const token = ++storyRequest, requestedPreset = presetId;
    pause(); loading = true; failed = false; status.textContent = 'Gathering our memories…';
    stage.setAttribute('aria-busy', 'true'); syncPlay();
    try {
      const loaded = await Promise.all(config.presets[requestedPreset].pages.map(async number => [number, await loadImage(chapter.pageImages[number - 1])]));
      if (token !== storyRequest || !dialog.open || mode !== 'story') return;
      images = Object.fromEntries(loaded); assetsPreset = requestedPreset;
      loading = false; status.textContent = ''; stage.removeAttribute('aria-busy'); renderStory(); syncPlay();
      if (elapsed === 0) { stopFlourish(); flourish(); }
      if (autoplay) resume();
    } catch {
      if (token !== storyRequest || !dialog.open || mode !== 'story') return;
      loading = false; failed = true; stage.removeAttribute('aria-busy'); syncPlay();
      status.textContent = 'One gallery image could not load. Retry the gallery or open the original PDF.';
    }
  }
  function buildProgress() {
    progress.replaceChildren();
    segments = scenes.map((scene, i) => {
      const button = document.createElement('button'); button.type = 'button';
      button.setAttribute('aria-label', `Go to ${scene.kind === 'page' ? `page ${scene.page}` : scene.kind}`);
      button.title = scene.kind === 'page' ? `Page ${scene.page}` : scene.label;
      const bar = document.createElement('span'); bar.setAttribute('aria-hidden', 'true'); button.append(bar);
      button.addEventListener('click', () => seek(i)); progress.append(button); return button;
    });
  }
  function updateDownload() {
    const preset = config.presets[presetId], info = window.ScrapbookExports?.[presetId];
    const link = $('#showcase-download'); link.href = preset.gifUrl;
    link.download = presetId === 'all' ? 'Loveys-All-Pages.gif' : 'Loveys-Highlights.gif';
    link.textContent = `Download ${preset.label} GIF ↓${info ? ` · ${(info.bytes / 1e6).toFixed(1)} MB` : ''}`;
  }
  function choosePreset(id) {
    ++pageRequest; ++storyRequest; animation?.cancel(); pause();
    presetId = id; scenes = timeline(id); elapsed = 0; lastPaint = -1; loading = false; failed = false;
    setMode('story'); buildProgress();
    dialog.querySelectorAll('[data-story-preset]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.storyPreset === id)));
    images = {}; assetsPreset = ''; updateDownload(); renderStory(); prepareStory();
  }
  function seek(index) {
    if (mode !== 'story') return;
    pause(); elapsed = scenes[Math.max(0, Math.min(scenes.length - 1, index))].start * 1000;
    renderStory(); syncPlay();
  }
  const thumbnails = chapter.pageImages.map((src, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-label', `Go to page ${i + 1}`);
    const image = new Image(); image.src = src.replace('page-', 'thumb-'); image.alt = ''; image.loading = 'lazy';
    button.append(image); button.addEventListener('click', () => showPage(i)); strip.append(button); return button;
  });
  async function showPage(target) {
    const direction = target >= pageIndex ? 1 : -1;
    pageIndex = Math.max(0, Math.min(chapter.pageImages.length - 1, target));
    const selected = pageIndex, token = ++pageRequest;
    ++storyRequest; loading = false; pause(); setMode('reader'); animation?.cancel();
    status.textContent = ''; error.hidden = true; page.hidden = true; zoom.disabled = true;
    stage.setAttribute('aria-busy', 'true');
    counter.textContent = `PAGE ${pad(selected + 1)} / 11`;
    caption.textContent = '';
    previous.disabled = selected === 0; next.disabled = selected === chapter.pageImages.length - 1;
    thumbnails.forEach((el, i) => el.setAttribute('aria-current', i === selected ? 'page' : 'false'));
    strip.scrollLeft = thumbnails[selected].offsetLeft - strip.offsetLeft - (strip.clientWidth - thumbnails[selected].clientWidth) / 2;
    try {
      const image = await loadImage(chapter.pageImages[selected]);
      if (token !== pageRequest || !dialog.open || mode !== 'reader') return;
      page.src = image.src; page.alt = `Lovey’s third monthsary scrapbook, page ${selected + 1}`; page.hidden = false;
      zoom.disabled = false; stage.removeAttribute('aria-busy');
      if (!reduced.matches && !document.hidden && stageVisible) animation = page.animate([
        { opacity: 0.35, transform: `translateX(${direction * 12}px) rotate(${direction * 0.8}deg)` },
        { opacity: 1, transform: 'translateX(0) rotate(0)' },
      ], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' });
      if (chapter.pageImages[selected + 1]) loadImage(chapter.pageImages[selected + 1]).catch(() => {});
    } catch {
      if (token !== pageRequest || !dialog.open || mode !== 'reader') return;
      error.hidden = false; stage.removeAttribute('aria-busy');
    }
  }
  function backToStory() {
    ++pageRequest; animation?.cancel(); pause(); setMode('story'); status.textContent = ''; renderStory();
    if (assetsPreset !== presetId) prepareStory();
    play.focus({ preventScroll: true });
  }
  function navigate(direction) {
    if (mode === 'reader') showPage(pageIndex + direction);
    else seek(locate(scenes, elapsed / 1000).index + direction);
  }
  play.addEventListener('click', () => { if (failed) prepareStory(true); else playing ? pause() : resume(); });
  restart.addEventListener('click', () => { elapsed = 0; lastTime = performance.now(); lastPaint = -1; renderStory(); syncPlay(); });
  read.addEventListener('click', () => { const current = locate(scenes, elapsed / 1000); showPage((current.scene.page || 1) - 1); back.focus(); });
  back.addEventListener('click', backToStory);
  zoom.addEventListener('click', () => { animation?.cancel(); setZoom(!zoomed); if (zoomed) viewport.focus(); });
  previous.addEventListener('click', () => navigate(-1)); next.addEventListener('click', () => navigate(1));
  dialog.querySelectorAll('[data-story-preset]').forEach(el => el.addEventListener('click', () => choosePreset(el.dataset.storyPreset)));
  function stopFlourish() { dialog.querySelectorAll('[data-entry]').forEach(el => el.getAnimations().forEach(a => a.cancel())); }
  function flourish() {
    if (reduced.matches || document.hidden) return;
    [stage, $('.scrapbook-navigation')].forEach((el,i) => {
      el.dataset.entry = '';
      el.animate([{opacity:0,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:550,delay:i*90,easing:'ease-out'});
    });
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-open-scrapbook]');
    if (trigger && !dialog.open) {
      opener = trigger; savedScroll = window.scrollY; oldOverflow = document.documentElement.style.overflow;
      resumeLenis = !!window.lenis && !window.lenis.isStopped; window.lenis?.stop();
      document.documentElement.style.overflow = 'hidden'; document.body.classList.add('reader-open');
      dialog.showModal(); stageVisible = true; choosePreset(presetId);
    }
    const archive = event.target.closest('[data-archive-chapter]');
    if (archive && window.jumpToChapter) { event.preventDefault(); window.jumpToChapter(Number(archive.dataset.archiveChapter)); }
  });
  // Keyboard activation for div[role="button"] triggers (Enter / Space)
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const trigger = event.target.closest('[data-open-scrapbook]');
    if (trigger && trigger.tagName !== 'BUTTON') { event.preventDefault(); trigger.click(); }
  });
  $('[data-scrapbook-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    ++pageRequest; ++storyRequest; loading = false; pause(); animation?.cancel(); stopFlourish(); setZoom(false);
    stage.removeAttribute('aria-busy'); document.body.classList.remove('reader-open');
    document.documentElement.style.overflow = oldOverflow;
    window.scrollTo({ top: savedScroll, behavior: 'instant' }); if (resumeLenis) window.lenis?.start();
    opener?.focus({ preventScroll: true });
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (zoomed && event.target === viewport) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); navigate(event.key === 'ArrowRight' ? 1 : -1); }
  });
  stage.addEventListener('touchstart', event => {
    touchStart = !zoomed && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touchStart || zoomed) return;
    const dx = event.changedTouches[0].clientX - touchStart.x, dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(dx < 0 ? 1 : -1);
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && mode === 'story' && !loading) { if (failed) prepareStory(true); else playing ? pause() : resume(); }
    touchStart = null;
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { touchStart = null; });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('motion-paused', document.hidden);
    if (document.hidden) { pause(mode === 'story' && playing ? 'Paused while you were away.' : ''); animation?.cancel(); stopFlourish(); }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) { animation?.cancel(); stopFlourish(); }
    lastPaint = -1; if (dialog.open && mode === 'story') renderStory();
  });
  new IntersectionObserver(entries => {
    stageVisible = entries[0].isIntersecting;
    if (!stageVisible) { pause(); animation?.cancel(); stopFlourish(); }
  }, { threshold: 0.1 }).observe(stage);
  const observeMotion = () => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('is-in-view', entry.isIntersecting);
      if (entry.isIntersecting) entry.target.classList.add('has-entered');
    }), { threshold: 0.15 });
    document.querySelectorAll('.slide--placeholder, .slide--scrapbook, .milestone-card').forEach(el => { el.classList.add('romantic-reveal'); observer.observe(el); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeMotion); else observeMotion();
  $('#scrapbook-download').href = chapter.pdfUrl;
})();
