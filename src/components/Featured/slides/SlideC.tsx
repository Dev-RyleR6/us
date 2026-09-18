import React from 'react';
import type { Chapter } from '../../../data/chapters';

interface SlideProps {
  chapter: Chapter;
  index: number;
}

export const SlideC: React.FC<SlideProps> = ({ chapter, index }) => {
  const hasThreeImages = chapter.images.length >= 3;
  const leftPolaroid = hasThreeImages ? chapter.images[1] : chapter.images[0];
  const rightPolaroid = hasThreeImages ? chapter.images[2] : (chapter.images.length > 1 ? chapter.images[1] : null);
  const backgroundImage = hasThreeImages ? chapter.images[0] : null;

  return (
    <article
      className="chapter slide slide--type-c"
      data-chapter={chapter.chapterNumber}
      data-song={chapter.songUrl || ''}
      data-index={index}
      aria-label={`Chapter ${chapter.chapterNumber}: ${chapter.momentTitle}`}
    >
      {backgroundImage && (
        <div className="slide__img-wrap slide__img--back">
          <img
            src={backgroundImage}
            alt={`${chapter.momentTitle} — background photo`}
            loading="lazy"
            draggable={false}
          />
        </div>
      )}

      <div className="slide__polaroids">
        {leftPolaroid && (
          <div className="slide__img-wrap slide__img--fore-left">
            <img
              src={leftPolaroid}
              alt={`${chapter.momentTitle} — left photo`}
              loading="lazy"
              draggable={false}
            />
          </div>
        )}

        {rightPolaroid && (
          <div className="slide__img-wrap slide__img--fore">
            <img
              src={rightPolaroid}
              alt={`${chapter.momentTitle} — right photo`}
              loading="lazy"
              draggable={false}
            />
          </div>
        )}
      </div>

      <div className="slide__content slide__content--center">
        <span className="slide__numeral slide__numeral--center" aria-hidden="true">
          {chapter.chapterNumber}
        </span>
        <div className="slide__meta">
          <span className="slide__rule" />
          <span className="slide__month">{chapter.momentDate}</span>
        </div>
        <p className="slide__description">{chapter.description}</p>
      </div>
    </article>
  );
};

