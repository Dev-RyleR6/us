import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 820px)').matches;

    const lenis = new Lenis({
      duration: isMobile ? 1.4 : 2.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: isMobile ? 2.2 : 1.6,
      infinite: false,
    });

    lenisRef.current = lenis;
    (window as unknown as { lenis: Lenis }).lenis = lenis;

    // Connect Lenis to GSAP ticker
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Sync ScrollTrigger with Lenis scroll events
    lenis.on('scroll', ScrollTrigger.update);

    // Header scroll appearance
    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      const header = document.getElementById('site-header');
      if (header) {
        header.classList.toggle('is-scrolled', scroll > 80);
      }
    });

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      (window as unknown as { lenis?: unknown }).lenis = undefined;
    };
  }, []);

  return lenisRef;
}
