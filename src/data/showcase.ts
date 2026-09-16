export interface ShowcasePreset {
  label: string;
  pages: number[];
  secondsPerPage: number;
  gifUrl: string;
}

export interface ShowcaseScene {
  kind: 'page';
  page: number;
  label: string;
  transition: string;
  duration: number;
  start: number;
  end: number;
}

export interface LocateResult {
  index: number;
  time: number;
  scene: ShowcaseScene;
  duration: number;
  progress: number;
}

export const showcaseConfig = {
  size: 640,
  fps: 12,
  transition: 0.6,
  colors: {
    background: '#11100f',
    red: '#a73538',
    paper: '#eee9df',
  },
  presets: {
    highlights: {
      label: 'Highlights',
      pages: [1, 3, 8, 10, 11],
      secondsPerPage: 4,
      gifUrl: 'assets/exports/loveys-mini-showcase.gif',
    },
    all: {
      label: 'All Pages',
      pages: Array.from({ length: 11 }, (_, i) => i + 1),
      secondsPerPage: 6,
      gifUrl: 'assets/exports/loveys-full-story.gif',
    },
  } as Record<string, ShowcasePreset>,
  transitions: [
    'stack',
    'dissolve',
    'photo',
    'photo',
    'dissolve',
    'stack',
    'photo',
    'stack',
    'stack',
    'dissolve',
    'dissolve',
  ],
};

export function createTimeline(presetId: string): ShowcaseScene[] {
  const preset = showcaseConfig.presets[presetId];
  if (!preset) throw new Error('Unknown preset: ' + presetId);
  return preset.pages.map((page, i) => ({
    kind: 'page' as const,
    page,
    label: `Page ${page}`,
    transition: showcaseConfig.transitions[page - 1] || 'dissolve',
    duration: preset.secondsPerPage,
    start: i * preset.secondsPerPage,
    end: (i + 1) * preset.secondsPerPage,
  }));
}

export function locateScene(scenes: ShowcaseScene[], seconds: number): LocateResult {
  const duration = scenes[scenes.length - 1].end;
  const time = ((seconds % duration) + duration) % duration;
  const index = scenes.findIndex((s) => time < s.end);
  const scene = scenes[index >= 0 ? index : 0];
  return {
    index: Math.max(0, index),
    time,
    scene,
    duration,
    progress: (time - scene.start) / scene.duration,
  };
}

export function drawShowcaseFrame(
  ctx: CanvasRenderingContext2D,
  images: Record<number, HTMLImageElement>,
  scenes: ShowcaseScene[],
  seconds: number,
  reducedMotion = false
): LocateResult {
  const state = locateScene(scenes, seconds);
  const raw = reducedMotion
    ? 0
    : Math.max(0, (state.time - state.scene.end + showcaseConfig.transition) / showcaseConfig.transition);
  const blend = 1 - Math.pow(1 - raw, 3);

  ctx.save();
  ctx.fillStyle = showcaseConfig.colors.background;
  ctx.fillRect(0, 0, 640, 640);

  const paint = (scene: ShowcaseScene, alpha: number, incoming: boolean, amount: number) => {
    if (!images[scene.page]) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(320, 320);
    if (!reducedMotion && amount) {
      if (scene.transition === 'stack') {
        ctx.translate((incoming ? 12 : -8) * amount, 0);
      }
      if (scene.transition === 'photo') {
        ctx.translate(0, (incoming ? 12 : -6) * amount);
        ctx.rotate(((incoming ? 1 : -0.5) * Math.PI) / 180 * amount);
      }
    }
    ctx.drawImage(images[scene.page], -302, -302, 604, 604);
    ctx.restore();
  };

  paint(state.scene, 1 - blend, false, blend);
  if (blend > 0) {
    paint(scenes[(state.index + 1) % scenes.length], blend, true, 1 - blend);
  }
  ctx.restore();
  return state;
}
