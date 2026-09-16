import React, { useEffect, useRef } from 'react';

export const FilmGrain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const TILE = 128;
    const off = document.createElement('canvas');
    off.width = TILE;
    off.height = TILE;
    const offCtx = off.getContext('2d');
    if (!offCtx) return;

    const TARGET_FPS = 24;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    let lastFrame = 0;
    let rafId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawTile() {
      if (!offCtx) return;
      const img = offCtx.createImageData(TILE, TILE);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = (Math.random() * 28 + 4) | 0;
      }
      offCtx.putImageData(img, 0, 0);
    }

    function draw(ts: number) {
      rafId = requestAnimationFrame(draw);
      if (ts - lastFrame < FRAME_INTERVAL) return;
      lastFrame = ts;
      drawTile();

      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      const cols = Math.ceil(W / TILE);
      const rows = Math.ceil(H / TILE);
      ctx.clearRect(0, 0, W, H);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.drawImage(off, c * TILE, r * TILE);
        }
      }
    }

    resize();
    rafId = requestAnimationFrame(draw);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas id="film-grain-canvas" ref={canvasRef} aria-hidden="true" />;
};
