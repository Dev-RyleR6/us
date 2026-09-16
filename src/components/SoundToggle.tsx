import React, { useState, useEffect } from 'react';

interface SoundToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ isMuted, onToggle }) => {
  const [tipVisible, setTipVisible] = useState(false);

  const handleClick = () => {
    onToggle();
    setTipVisible(true);
  };

  useEffect(() => {
    if (!tipVisible) return;
    const timer = setTimeout(() => {
      setTipVisible(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, [tipVisible, isMuted]);

  return (
    <button
      id="sound-toggle"
      aria-label="Toggle ambient audio"
      aria-pressed={!isMuted}
      title="Toggle ambient music"
      className={isMuted ? 'is-muted' : ''}
      onClick={handleClick}
    >
      <span className="sound-bar sound-bar--1" aria-hidden="true" />
      <span className="sound-bar sound-bar--2" aria-hidden="true" />
      <span className="sound-bar sound-bar--3" aria-hidden="true" />
      <span className="sound-bar sound-bar--4" aria-hidden="true" />
      <span className="sound-bar sound-bar--5" aria-hidden="true" />
      <span className={`sound-toggle__tip ${tipVisible ? 'is-visible' : ''}`} aria-hidden="true">
        {isMuted ? 'Muted' : 'Ambient audio on'}
      </span>
    </button>
  );
};
