import React, { useState, useEffect, useRef } from 'react';
import VerticalParallax from '../../../components/VerticalParallax';
import DeckCarousel from '../../../components/DeckCarousel';

interface ScrapbookModalProps { isOpen: boolean; onClose: () => void; }
const pages = Array.from({ length: 11 }, (_, i) => `assets/images/third/page-${String(i + 1).padStart(2, '0')}.png`);

export const ScrapbookModal: React.FC<ScrapbookModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'gallery' | 'deck'>('gallery');
  const [cardSize, setCardSize] = useState(0);
  const deckGalleryRef = useRef<HTMLDivElement>(null);

  const scrollDeck = (direction: -1 | 1) => {
    deckGalleryRef.current?.firstElementChild?.dispatchEvent(
      new CustomEvent('deck-step', { detail: direction })
    );
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.documentElement.style.overflow;
    const wasReaderOpen = document.body.classList.contains('reader-open');
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void; isStopped: boolean } }).lenis;
    const wasStopped = lenis?.isStopped;
    setMode('gallery');
    lenis?.stop();
    document.body.classList.add('reader-open');
    document.documentElement.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = previousOverflow;
      if (!wasReaderOpen) document.body.classList.remove('reader-open');
      if (!wasStopped) lenis?.start();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!isOpen || mode !== 'gallery' || !gallery) return;
    const measure = () => setCardSize(Math.max(1, Math.min(640, gallery.clientWidth - 32)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(gallery);
    return () => observer.disconnect();
  }, [isOpen, mode]);

  return (
    <dialog ref={dialogRef} id="scrapbook-modal" className="scrapbook-modal memory-gallery-modal"
      aria-labelledby="scrapbook-title" data-mode={mode} data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClose={() => { if (!dialogRef.current?.open && isOpen) onClose(); }}>
      <div className="scrapbook-reader">
        <header className="scrapbook-reader__header">
          <div>
            <span className="milestone-label">Made by lovey · September 14, 2026</span>
            <h2 id="scrapbook-title">Lovey’s Memory Gallery</h2>
          </div>
          <button type="button" data-scrapbook-close aria-label="Close scrapbook" onClick={onClose}>Close ×</button>
        </header>
        {mode === 'gallery' ? (
          <div ref={galleryRef} className="memory-gallery-stage" role="region" aria-label="Memory gallery" aria-describedby="gallery-instructions">
            {isOpen && cardSize > 0 && <VerticalParallax items={pages} loop={false} direction="vertical" cardWidth={cardSize} cardHeight={Math.min(560, cardSize)}
              alternate={false} labels={{ show: false }} background="#090908" />}
          </div>
        ) : (
          <div ref={deckGalleryRef} className="deck-gallery-stage" role="region" aria-label="Deck carousel"
            aria-describedby="deck-gallery-instructions" tabIndex={0}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
              event.preventDefault();
              scrollDeck(event.key === 'ArrowLeft' ? -1 : 1);
            }}>
            {isOpen && <DeckCarousel images={pages} count={pages.length} cardWidth={320} cardHeight={320} background="#090908" />}
          </div>
        )}
        {mode === 'gallery' ? <p id="gallery-instructions">Scroll or drag to explore</p> :
          <p id="deck-gallery-instructions">Scroll or swipe sideways to browse · Hover to turn the cards</p>}
        <div className="scrapbook-navigation">
          {mode === 'deck' && <button type="button" aria-label="Previous card" onClick={() => scrollDeck(-1)}>←</button>}
          <button key="mode" type="button" className="story-primary" onClick={() => setMode(mode === 'gallery' ? 'deck' : 'gallery')}>
            {mode === 'gallery' ? 'Open deck carousel' : 'Back to Gallery'}
          </button>
          {mode === 'deck' && <button type="button" aria-label="Next card" onClick={() => scrollDeck(1)}>→</button>}
        </div>
        <div className="scrapbook-downloads">
          <a id="showcase-download" className="scrapbook-download" href="assets/exports/loveys-mini-showcase.gif" download="Loveys-Highlights.gif">Download Highlights GIF ↓</a>
          <a id="scrapbook-download" className="scrapbook-download" href="assets/pdf/_3rd.pdf" download="Loveys-Third-Monthsary.pdf">Original PDF ↓</a>
        </div>
      </div>
    </dialog>
  );
};
