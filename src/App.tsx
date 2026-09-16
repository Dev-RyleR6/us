import React, { useState, useCallback } from 'react';
import { useLenis } from './hooks/useLenis';
import { useAudioEngine } from './hooks/useAudioEngine';
import { FilmGrain } from './components/FilmGrain';
import { CustomCursor } from './components/CustomCursor';
import { Loader } from './components/Loader';
import { StatusBar } from './components/StatusBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedTrack } from './components/Featured/FeaturedTrack';
import { ArchiveSection } from './components/Archive/ArchiveSection';
import { SoundToggle } from './components/SoundToggle';
import { ScrapbookModal } from './components/ScrapbookModal/ScrapbookModal';

export const App: React.FC = () => {
  useLenis();
  const { isMuted, toggleMute, crossfadeTo } = useAudioEngine('assets/audio/chapter-01.mp3');
  const [isScrapbookOpen, setIsScrapbookOpen] = useState(false);

  const handleOpenScrapbook = useCallback(() => {
    setIsScrapbookOpen(true);
  }, []);

  const handleCloseScrapbook = useCallback(() => {
    setIsScrapbookOpen(false);
  }, []);

  const handleJumpToChapter = useCallback((index: number) => {
    const jump = (window as unknown as { jumpToChapter?: (i: number) => void }).jumpToChapter;
    if (jump) {
      jump(index);
    }
  }, []);

  return (
    <>
      {/* 24fps Film Grain overlay */}
      <FilmGrain />

      {/* Smooth custom cursor */}
      <CustomCursor />

      {/* Cinematic opening loader */}
      <Loader />

      {/* Status bar with live heartbeat counter */}
      <StatusBar />

      {/* Fixed site navigation */}
      <Header />

      {/* Main cinematic content */}
      <main id="main-content">
        {/* Full-bleed hero opening with counter */}
        <Hero />

        {/* Featured moments — pinned horizontal track */}
        <FeaturedTrack
          onOpenScrapbook={handleOpenScrapbook}
          onSongChange={crossfadeTo}
        />

        {/* The Monthsary Shelf archive */}
        <ArchiveSection
          onOpenScrapbook={handleOpenScrapbook}
          onJumpToChapter={handleJumpToChapter}
        />
      </main>

      {/* Ambient sound toggle */}
      <SoundToggle isMuted={isMuted} onToggle={toggleMute} />

      {/* Interactive 3rd monthsary zine reader & showcase dialog */}
      <ScrapbookModal isOpen={isScrapbookOpen} onClose={handleCloseScrapbook} />
    </>
  );
};

export default App;
