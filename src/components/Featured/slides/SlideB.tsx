import React from 'react';
import type { Chapter } from '../../../data/chapters';

interface SlideProps {
  chapter: Chapter;
  index: number;
}

export const SlideB: React.FC<SlideProps> = ({ chapter, index }) => {
  return (
    <article
      className="chapter slide slide--type-b"
      data-chapter={chapter.chapterNumber}
      data-song={chapter.songUrl || ''}
      data-index={index}
      aria-label={`Chapter ${chapter.chapterNumber}: ${chapter.momentTitle}`}
    >
      <div className="slide__img-wrap slide__img--hero">
        <img
          src={chapter.images[0]}
          alt={`${chapter.momentTitle} — primary photo`}
          loading="lazy"
          draggable={false}
        />
      </div>

      <span className="slide__numeral slide__numeral--ghost" aria-hidden="true">
        {chapter.chapterNumber}
      </span>

      <div className="slide__content slide__content--right-center">
        <div className="slide__meta">
          <span className="slide__rule" />
          <span className="slide__month">{chapter.momentDate}</span>
        </div>
        <p className="slide__description">{chapter.description}</p>
      </div>

      <div className="slide__divider-v" aria-hidden="true" />
    </article>
  );
};

