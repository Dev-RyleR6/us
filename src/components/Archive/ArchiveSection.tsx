import React from 'react';

interface ArchiveSectionProps {
  onOpenScrapbook: () => void;
  onJumpToChapter: (index: number) => void;
}

export const ArchiveSection: React.FC<ArchiveSectionProps> = ({
  onOpenScrapbook,
  onJumpToChapter,
}) => {
  const handleRevisit = (e: React.MouseEvent<HTMLAnchorElement>, chapterIndex: number) => {
    e.preventDefault();
    onJumpToChapter(chapterIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenScrapbook();
    }
  };

  return (
    <section id="archive" aria-label="Archive">
      <div className="container">
        <div className="section-label reveal">
          <span className="rule--accent" />
          <span className="t-subheading">The Monthsary Shelf</span>
        </div>

        <div className="milestone-shelf">
          {/* Volume I */}
          <a
            className="milestone-card"
            href="#featured"
            data-archive-chapter="5"
            onClick={(e) => handleRevisit(e, 5)}
          >
            <span className="milestone-label">01 / June–July 2026</span>
            <h2>Our first month.</h2>
            <p>The beginning of everything.</p>
            <span className="milestone-card__action">Revisit Volume I ↗</span>
          </a>

          {/* Volume II — Reserved */}
          <article className="milestone-card milestone-card--reserved">
            <span className="milestone-label">02 / August 14, 2026</span>
            <h2>Room for us.</h2>
            <p>Volume II · In the Works</p>
            <span className="milestone-card__action">Memories being curated</span>
          </article>

          {/* Volume III — 3rd Monthsary Scrapbook */}
          <div
            className="milestone-card milestone-card--scrapbook"
            role="button"
            tabIndex={0}
            data-open-scrapbook
            aria-label="Open 3rd monthsary memory gallery"
            onClick={onOpenScrapbook}
            onKeyDown={handleKeyDown}
          >
            <span className="milestone-label">03 / September 14, 2026</span>
            <h2>From lovey, with love.</h2>
            <p>Our 3rd monthsary · Memory gallery</p>
            <span className="milestone-card__action">Open the gallery ↗</span>
          </div>
        </div>
      </div>
    </section>
  );
};

