import React, { useEffect, useRef, useState } from 'react';
import {
  ShowcaseScene,
  createTimeline,
  drawShowcaseFrame,
  locateScene,
} from '../../data/showcase';

interface ShowcaseCanvasProps {
  presetId: string;
  isPlaying: boolean;
  onSceneChange?: (sceneIndex: number, elapsed: number, totalDuration: number) => void;
  onLoaded?: () => void;
  reducedMotion?: boolean;
}

export const ShowcaseCanvas: React.FC<ShowcaseCanvasProps> = ({
  presetId,
  isPlaying,
  onSceneChange,
  onLoaded,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Record<number, HTMLImageElement>>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const scenesRef = useRef<ShowcaseScene[]>([]);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Preload pages for preset
  useEffect(() => {
    let active = true;
    const scenes = createTimeline(presetId);
    scenesRef.current = scenes;
    elapsedRef.current = 0;

    const uniquePages = Array.from(new Set(scenes.map((s) => s.page)));
    let loadedCount = 0;

    uniquePages.forEach((pageNum) => {
      if (imagesRef.current[pageNum]) {
        loadedCount++;
        if (loadedCount === uniquePages.length && active) {
          setImagesLoaded(true);
          onLoaded?.();
        }
        return;
      }

      const img = new Image();
      const padNum = String(pageNum).padStart(2, '0');
      img.src = `assets/images/third/page-${padNum}.png`;
      img.onload = () => {
        if (!active) return;
        imagesRef.current[pageNum] = img;
        loadedCount++;
        if (loadedCount === uniquePages.length) {
          setImagesLoaded(true);
          onLoaded?.();
        }
      };
      img.onerror = () => {
        if (!active) return;
        loadedCount++;
        if (loadedCount === uniquePages.length) {
          setImagesLoaded(true);
          onLoaded?.();
        }
      };
    });

    return () => {
      active = false;
    };
  }, [presetId, onLoaded]);

  // Render loop
  useEffect(() => {
    if (!imagesLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scenes = scenesRef.current;
    if (!scenes.length) return;
    const totalDuration = scenes[scenes.length - 1].end;

    const render = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        elapsedRef.current += delta;
        if (elapsedRef.current >= totalDuration) {
          elapsedRef.current = elapsedRef.current % totalDuration;
        }
      }

      const state = drawShowcaseFrame(
        ctx,
        imagesRef.current,
        scenes,
        elapsedRef.current,
        reducedMotion
      );

      onSceneChange?.(state.index, elapsedRef.current, totalDuration);

      rafIdRef.current = requestAnimationFrame(render);
    };

    rafIdRef.current = requestAnimationFrame(render);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [imagesLoaded, isPlaying, reducedMotion, onSceneChange]);

  return (
    <canvas
      id="showcase-canvas"
      ref={canvasRef}
      width={640}
      height={640}
      role="img"
      aria-label="Third monthsary story"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};
