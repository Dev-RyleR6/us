import React from 'react';
import type { Chapter } from '../../../data/chapters';

interface SlideScrapbookProps {
  chapter: Chapter;
  index: number;
  onOpenScrapbook: () => void;
}

export const SlideScrapbook: React.FC<SlideScrapbookProps> = ({
  chapter,
  index,
  onOpenScrapbook,
}) => {
  return (
    <article
      className="chapter slide slide--scrapbook"
      data-chapter={chapter.chapterNumber}
      data-song={chapter.songUrl || ''}
      data-index={index}
      aria-label={`Chapter ${chapter.chapterNumber}: ${chapter.momentTitle}`}
    >
      <div className="scrapbook-covers">
        {chapter.images[1] && (
          <img
            className="scrapbook-covers__last"
            src={chapter.images[1]}
            alt="The scrapbook’s closing love card"
            loading="lazy"
            width="1500"
            height="1500"
          />
        )}
        {chapter.images[0] && (
          <img
            className="scrapbook-covers__first"
            src={chapter.images[0]}
            alt="Lovey’s third monthsary scrapbook cover"
            loading="lazy"
            width="1500"
            height="1500"
          />
        )}
      </div>

      <div className="milestone-copy">
        <div className="slide__meta">
          <span className="slide__rule" />
          <span className="slide__month">{chapter.momentDate}</span>
        </div>
        <h2>{chapter.momentTitle}</h2>
        <p className="slide__description">{chapter.description}</p>

        <button
          type="button"
          className="scrapbook-cta"
          data-open-scrapbook
          onClick={onOpenScrapbook}
        >
          Open Lovey’s Memory Gallery <span>↗</span>
        </button>

        <span className="milestone-label">
          Volume III · {chapter.totalPages ?? 11} images · Made by lovey
        </span>
      </div>
    </article>
  );
};
