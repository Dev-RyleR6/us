import React from 'react';
import type { Chapter } from '../../../data/chapters';

interface SlideProps {
  chapter: Chapter;
  index: number;
}

export const SlidePlaceholder: React.FC<SlideProps> = ({ chapter, index }) => {
  return (
    <article
      className="chapter slide slide--placeholder"
      data-chapter={chapter.chapterNumber}
      data-song={chapter.songUrl || ''}
      data-index={index}
      aria-label={`Chapter ${chapter.chapterNumber}: ${chapter.momentTitle}`}
    >
      <div className="reserved-page" aria-hidden="true">
        <span>II</span>
        <small>A story still unfolding</small>
      </div>

      <div className="milestone-copy">
        <div className="slide__meta">
          <span className="slide__rule" />
          <span className="slide__month">{chapter.momentDate}</span>
        </div>
        <h2>{chapter.momentTitle}</h2>
        <p className="slide__description">{chapter.description}</p>
        <span className="milestone-label">Reserved with love</span>
      </div>
    </article>
  );
};
