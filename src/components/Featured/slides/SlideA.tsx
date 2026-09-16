import React from 'react';
import type { Chapter } from '../../../data/chapters';

interface SlideProps {
  chapter: Chapter;
  index: number;
}

export const SlideA: React.FC<SlideProps> = ({ chapter, index }) => {
  return (
    <article
      className="chapter slide slide--type-a"
      data-chapter={chapter.chapterNumber}
      data-song={chapter.songUrl || ''}
      data-index={index}
      aria-label={`Chapter ${chapter.chapterNumber}: ${chapter.momentTitle}`}
    >
      <span className="slide__numeral" aria-hidden="true">
        {chapter.chapterNumber}
      </span>

      <div className="slide__img-wrap slide__img--primary">
        <img
          src={chapter.images[0]}
          alt={`${chapter.momentTitle} — primary photo`}
          loading="lazy"
          draggable={false}
        />
      </div>

      {chapter.images[1] && (
        <div className="slide__img-wrap slide__img--secondary">
          <img
            src={chapter.images[1]}
            alt={`${chapter.momentTitle} — second photo`}
            loading="lazy"
            draggable={false}
          />
        </div>
      )}

      <div className="slide__content slide__content--br">
        <div className="slide__meta">
          <span className="slide__rule" />
          <span className="slide__month">{chapter.momentDate}</span>
        </div>
        <p className="slide__description">{chapter.description}</p>
      </div>

      <div className="slide__border-bottom" aria-hidden="true" />
    </article>
  );
};

