import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShowcaseCanvas } from './ShowcaseCanvas';
import { createTimeline, ShowcaseScene } from '../../data/showcase';

interface ScrapbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScrapbookModal: React.FC<ScrapbookModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [mode, setMode] = useState<'story' | 'reader'>('story');
  const [presetId, setPresetId] = useState<'highlights' | 'all'>('highlights');
  const [isPlaying, setIsPlaying] = useState(true);
  const [scenes, setScenes] = useState<ShowcaseScene[]>(() => createTimeline('highlights'));
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(20);

  // Reader state
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 0..10
  const [isZoomed, setIsZoomed] = useState(false);
  const totalPages = 11;

  // Sync timeline when preset changes
  useEffect(() => {
    const nextScenes = createTimeline(presetId);
    setScenes(nextScenes);
    setCurrentSceneIndex(0);
    setElapsedTime(0);
    setTotalDuration(nextScenes[nextScenes.length - 1].end);
  }, [presetId]);

  // Lenis pause / body overflow lock
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      const lenis = (window as unknown as { lenis?: { stop: () => void } }).lenis;
      lenis?.stop();
      document.body.classList.add('reader-open');
      document.documentElement.style.overflow = 'hidden';

      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      const lenis = (window as unknown as { lenis?: { start: () => void } }).lenis;
      lenis?.start();
      document.body.classList.remove('reader-open');
      document.documentElement.style.overflow = '';
      setIsPlaying(false);
      setIsZoomed(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        if (mode === 'story') {
          setCurrentSceneIndex((prev) => Math.max(0, prev - 1));
        } else {
          setCurrentPageIndex((prev) => Math.max(0, prev - 1));
        }
      } else if (e.key === 'ArrowRight') {
        if (mode === 'story') {
          setCurrentSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1));
        } else {
          setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, scenes.length, totalPages, handleClose]);

  const handleSceneUpdate = useCallback(
    (sceneIndex: number, elapsed: number, duration: number) => {
      setCurrentSceneIndex(sceneIndex);
      setElapsedTime(elapsed);
      setTotalDuration(duration);
    },
    []
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const currentScene = scenes[currentSceneIndex] || scenes[0];
  const activePageNum = mode === 'story' ? currentScene?.page : currentPageIndex + 1;
  const padPage = String(activePageNum).padStart(2, '0');
  const pageSrc = `assets/images/third/page-${padPage}.png`;

  return (
    <dialog
      ref={dialogRef}
      id="scrapbook-modal"
      className="scrapbook-modal memory-gallery-modal"
      aria-labelledby="scrapbook-title"
      data-mode={mode}
      data-lenis-prevent
      onClose={handleClose}
    >
      <div className="scrapbook-reader">
        {/* Header */}
        <header className="scrapbook-reader__header">
          <div>
            <span className="milestone-label">Made by lovey · September 14, 2026</span>
            <h2 id="scrapbook-title">Lovey’s Memory Gallery</h2>
          </div>
          <button
            type="button"
            data-scrapbook-close
            aria-label="Close scrapbook"
            onClick={handleClose}
          >
            Close ×
          </button>
        </header>

        {/* Story Presets (only in story mode) */}
        {mode === 'story' && (
          <div className="story-presets" role="group" aria-label="Choose story length">
            <button
              type="button"
              data-story-preset="highlights"
              aria-pressed={presetId === 'highlights'}
              onClick={() => setPresetId('highlights')}
            >
              Highlights <small>20 sec</small>
            </button>
            <button
              type="button"
              data-story-preset="all"
              aria-pressed={presetId === 'all'}
              onClick={() => setPresetId('all')}
            >
              All Pages <small>66 sec</small>
            </button>
          </div>
        )}

        {/* Story Progress Bars (only in story mode) */}
        {mode === 'story' && (
          <nav id="story-progress" className="story-progress" aria-label="Story scenes">
            {scenes.map((scene, i) => {
              const isCurrent = i === currentSceneIndex;
              const isPast = i < currentSceneIndex;
              let scaleX = 0;
              if (isPast) scaleX = 1;
              else if (isCurrent) {
                scaleX = Math.max(0, Math.min(1, (elapsedTime - scene.start) / scene.duration));
              }

              return (
                <button
                  key={i}
                  type="button"
                  aria-current={isCurrent ? 'step' : undefined}
                  onClick={() => {
                    setElapsedTime(scene.start);
                    setCurrentSceneIndex(i);
                  }}
                >
                  <span
                    style={
                      {
                        '--scene-progress': scaleX,
                        transform: `scaleX(${scaleX})`,
                      } as React.CSSProperties
                    }
                  />
                </button>
              );
            })}
          </nav>
        )}

        {/* Stage Container */}
        <div
          className={`scrapbook-stage ${mode === 'story' ? 'is-showcase' : ''} ${
            isZoomed ? 'is-zoomed' : ''
          }`}
        >
          {mode === 'story' ? (
            <ShowcaseCanvas
              presetId={presetId}
              isPlaying={isPlaying}
              onSceneChange={handleSceneUpdate}
            />
          ) : (
            <div id="scrapbook-viewport" aria-label="Original scrapbook page">
              <div className="scrapbook-sheet">
                <img
                  id="scrapbook-page"
                  src={pageSrc}
                  width={1500}
                  height={1500}
                  alt={`Page ${activePageNum}`}
                  draggable={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Story Meta */}
        <div className="story-meta">
          <p id="scrapbook-counter" role="status" aria-live="polite">
            {mode === 'story'
              ? `Scene ${currentSceneIndex + 1} of ${scenes.length}`
              : `Page ${currentPageIndex + 1} of ${totalPages}`}
          </p>
          {mode === 'story' && (
            <span id="story-time" aria-label="Elapsed story time">
              {formatTime(elapsedTime)} / {formatTime(totalDuration)}
            </span>
          )}
        </div>

        {/* Navigation Toolbar */}
        <div className="scrapbook-navigation">
          {mode === 'story' ? (
            <>
              <button
                type="button"
                data-scrapbook-prev
                aria-label="Previous scene"
                onClick={() => setCurrentSceneIndex((prev) => Math.max(0, prev - 1))}
              >
                ←
              </button>
              <button
                type="button"
                id="showcase-play"
                className="story-primary"
                onClick={() => setIsPlaying((prev) => !prev)}
              >
                {isPlaying ? 'Pause story' : 'Play story ♡'}
              </button>
              <button
                type="button"
                data-scrapbook-next
                aria-label="Next scene"
                onClick={() => setCurrentSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1))}
              >
                →
              </button>
              <button
                type="button"
                id="showcase-restart"
                aria-label="Restart story"
                onClick={() => {
                  setElapsedTime(0);
                  setCurrentSceneIndex(0);
                  setIsPlaying(true);
                }}
              >
                ↺
              </button>
              <button
                type="button"
                id="story-read"
                onClick={() => {
                  setMode('reader');
                  setIsPlaying(false);
                }}
              >
                Open reader
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                data-scrapbook-prev
                aria-label="Previous page"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              >
                ←
              </button>
              <button
                type="button"
                id="showcase-return"
                className="story-primary"
                onClick={() => {
                  setMode('story');
                  setIsPlaying(true);
                }}
              >
                Back to Story
              </button>
              <button
                type="button"
                data-scrapbook-next
                aria-label="Next page"
                disabled={currentPageIndex === totalPages - 1}
                onClick={() => setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
              >
                →
              </button>
              <button
                type="button"
                id="scrapbook-zoom"
                aria-pressed={isZoomed}
                onClick={() => setIsZoomed((prev) => !prev)}
              >
                {isZoomed ? 'Fit page' : 'Zoom 2×'}
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Filmstrip (only in reader mode) */}
        {mode === 'reader' && (
          <nav
            id="scrapbook-thumbnails"
            className="scrapbook-thumbnails"
            aria-label="Memory gallery images"
          >
            {Array.from({ length: totalPages }, (_, i) => {
              const pad = String(i + 1).padStart(2, '0');
              const thumbSrc = `assets/images/third/page-${pad}.png`;
              return (
                <button
                  key={i}
                  type="button"
                  aria-current={i === currentPageIndex ? 'page' : undefined}
                  onClick={() => setCurrentPageIndex(i)}
                >
                  <img src={thumbSrc} alt={`Thumbnail ${i + 1}`} loading="lazy" />
                </button>
              );
            })}
          </nav>
        )}

        {/* Downloads */}
        <div className="scrapbook-downloads">
          <a
            id="showcase-download"
            className="scrapbook-download"
            href="assets/exports/loveys-mini-showcase.gif"
            download="Loveys-Highlights.gif"
          >
            Download Highlights GIF ↓
          </a>
          <a
            id="scrapbook-download"
            className="scrapbook-download"
            href="assets/pdf/_3rd.pdf"
            download="Loveys-Third-Monthsary.pdf"
          >
            Original PDF ↓
          </a>
        </div>
      </div>
    </dialog>
  );
};
