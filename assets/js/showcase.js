/* Original artwork showcase engine with creative transitions and short cinematic pacing.
 * Shared by the live React/canvas player and local GIF generator. */
(function(root) {
  'use strict';
  const config = {
    size: 640,
    fps: 12,
    transition: 0.35,
    colors: { background: '#11100f', red: '#a73538', paper: '#eee9df' },
    presets: {
      highlights: {
        label: 'Highlights',
        pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        secondsPerPage: 1.5,
        gifUrl: 'assets/exports/loveys-mini-showcase.gif',
      },
      all: {
        label: 'All Pages',
        pages: Array.from({ length: 11 }, (_, i) => i + 1),
        secondsPerPage: 2.0,
        gifUrl: 'assets/exports/loveys-full-story.gif',
      },
    },
    transitions: [
      'drop',    // 1 -> 2: polaroid drop with organic tilt
      'stack',   // 2 -> 3: top card slides away with angle
      'glide',   // 3 -> 4: smooth cinematic horizontal sweep
      'peel',    // 4 -> 5: page peel curl perspective
      'zoom',    // 5 -> 6: deep focus push
      'drop',    // 6 -> 7: organic card drop from top
      'stack',   // 7 -> 8: lateral card pull
      'float',   // 8 -> 9: gentle bottom-up float
      'glide',   // 9 -> 10: snappy cinematic sweep
      'zoom',    // 10 -> 11: warm zoom into final love card
      'peel',    // 11 -> 1: loop reset
    ],
  };

  function timeline(id) {
    const preset = config.presets[id] || config.presets.highlights;
    return preset.pages.map((page, i) => ({
      kind: 'page',
      page,
      label: `Page ${page}`,
      transition: config.transitions[(page - 1) % config.transitions.length],
      duration: preset.secondsPerPage,
      start: i * preset.secondsPerPage,
      end: (i + 1) * preset.secondsPerPage,
    }));
  }

  function locate(scenes, seconds) {
    const duration = scenes[scenes.length - 1].end;
    const time = ((seconds % duration) + duration) % duration;
    const index = scenes.findIndex(s => time < s.end);
    const safeIdx = Math.max(0, index >= 0 ? index : 0);
    const scene = scenes[safeIdx];
    return {
      index: safeIdx,
      time,
      scene,
      duration,
      progress: (time - scene.start) / scene.duration,
    };
  }

  function draw(ctx, images, scenes, seconds, reducedMotion = false) {
    const state = locate(scenes, seconds);
    const transDur = config.transition;
    const timeLeft = state.scene.end - state.time;
    const inTransition = !reducedMotion && timeLeft <= transDur;
    const frameDur = 1 / config.fps;
    const raw = inTransition ? Math.min(1, (transDur - timeLeft) / (transDur - frameDur * 0.8)) : 0;
    // Smooth power-out easing
    const blend = 1 - Math.pow(1 - raw, 3);

    ctx.save();
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, config.size, config.size);

    const drawCard = (scene, alpha, isIncoming, progress) => {
      const img = images[scene.page];
      if (!img) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(320, 320);

      let scale = 1;
      let rot = 0;
      let tx = 0;
      let ty = 0;

      if (!reducedMotion && progress > 0) {
        const type = scene.transition;
        if (type === 'drop') {
          if (isIncoming) {
            ty = -45 * (1 - progress);
            rot = (1 - progress) * -0.07;
            scale = 1.06 - 0.06 * progress;
          } else {
            ty = 18 * progress;
            scale = 1 - 0.04 * progress;
          }
        } else if (type === 'stack') {
          if (isIncoming) {
            scale = 0.93 + 0.07 * progress;
          } else {
            tx = 55 * progress;
            rot = 0.06 * progress;
          }
        } else if (type === 'glide') {
          if (isIncoming) {
            tx = 48 * (1 - progress);
            rot = -0.03 * (1 - progress);
          } else {
            tx = -48 * progress;
            rot = 0.03 * progress;
          }
        } else if (type === 'peel') {
          if (isIncoming) {
            scale = 0.94 + 0.06 * progress;
          } else {
            tx = -35 * progress;
            ty = -15 * progress;
            rot = -0.06 * progress;
          }
        } else if (type === 'float') {
          if (isIncoming) {
            ty = 35 * (1 - progress);
            rot = 0.04 * (1 - progress);
          } else {
            ty = -18 * progress;
            scale = 1 + 0.03 * progress;
          }
        } else if (type === 'zoom') {
          if (isIncoming) {
            scale = 0.88 + 0.12 * progress;
          } else {
            scale = 1 + 0.09 * progress;
          }
        }
      }

      ctx.translate(tx, ty);
      ctx.rotate(rot);
      ctx.scale(scale, scale);

      ctx.drawImage(img, -302, -302, 604, 604);
      ctx.restore();
    };

    // Draw outgoing (base) - smoothly fades to 0 as transition finishes
    drawCard(state.scene, inTransition ? 1 - blend : 1, false, blend);

    // Draw incoming (top layer)
    if (inTransition && blend > 0) {
      const nextIdx = (state.index + 1) % scenes.length;
      drawCard(scenes[nextIdx], blend, true, blend);
    }

    ctx.restore();
    return state;
  }

  root.ScrapbookShowcase = { config, timeline, locate, draw };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.ScrapbookShowcase;
})(typeof window === 'undefined' ? globalThis : window);

const { config, timeline, locate, draw } = globalThis.ScrapbookShowcase;
export { config, timeline, locate, draw };
export default globalThis.ScrapbookShowcase;
