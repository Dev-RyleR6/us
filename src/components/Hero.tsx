import React from 'react';
import { useHeartbeatTimer } from '../hooks/useHeartbeatTimer';

export const Hero: React.FC = () => {
  const { daysString, subString } = useHeartbeatTimer();

  return (
    <section id="hero" aria-label="Hero">
      <img
        src="assets/images/06-14-2026/IMG_8219.jpg"
        alt="A cinematic silhouette of two people in a vast, dimly lit space"
        className="hero__bg"
        loading="eager"
        fetchPriority="high"
      />

      <div className="hero__vignette" aria-hidden="true" />

      <div className="hero__content container">
        <div className="hero__eyebrow">
          <span className="rule--accent" />
          <span className="t-subheading">A Private Archive</span>
        </div>

        <div className="hero__title-block">
          <h1>
            <span className="hero__title-line t-display">
              <span>Just</span>
            </span>
            <span className="hero__title-line t-display--italic">
              <span>Us</span>
            </span>
          </h1>
        </div>

        <div className="hero__meta">
          <p className="t-caption">
            Been together for{' '}
            <span id="hero-countdown" className="t-display--hero-countdown">
              {daysString} ({subString})
            </span>
          </p>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span className="t-caption" style={{ writingMode: 'vertical-rl', letterSpacing: '0.2em' }}>
          Scroll
        </span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
};
