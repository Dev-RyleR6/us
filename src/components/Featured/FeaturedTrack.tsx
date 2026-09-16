import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { relationshipChapters } from '../../data/chapters';
import { SlideA } from './slides/SlideA';
import { SlideB } from './slides/SlideB';
import { SlideC } from './slides/SlideC';
import { SlideD } from './slides/SlideD';
import { SlidePlaceholder } from './slides/SlidePlaceholder';
import { SlideScrapbook } from './slides/SlideScrapbook';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedTrackProps {
  onOpenScrapbook: () => void;
  onSongChange: (url: string) => void;
}

export const FeaturedTrack: React.FC<FeaturedTrackProps> = ({
  onOpenScrapbook,
  onSongChange,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    // Desktop and Tablet (> 820px): Horizontal Pin
    mm.add('(min-width: 821px)', (ctx) => {
      const getWidth = () => Math.max(0, track.scrollWidth - section.clientWidth);

      const anim = gsap.to(track, {
        x: () => -getWidth(),
        ease: 'none',
      });

      let currentActiveIndex = -1;
      const slides = section.querySelectorAll<HTMLElement>('.chapter[data-index]');
      const total = slides.length;

      const horizontalST = ScrollTrigger.create({
        trigger: section,
        pin: true,
        scrub: 2.4,
        start: 'top top',
        end: () => `+=${getWidth()}`,
        invalidateOnRefresh: true,
        animation: anim,
        onUpdate: (self) => {
          if (progress) progress.style.transform = `scaleX(${self.progress})`;

          if (total > 0) {
            const idx = Math.min(Math.round(self.progress * (total - 1)), total - 1);
            if (idx !== currentActiveIndex) {
              currentActiveIndex = idx;
              const slide = slides[idx];
              if (slide) {
                const song = slide.getAttribute('data-song');
                if (song) onSongChange(song);
                slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
              }
            }
          }
        },
      });

      // Slide C Parallax
      section.querySelectorAll('.slide--type-c').forEach((slide) => {
        const fore = slide.querySelector('.slide__img--fore img');
        const back = slide.querySelector('.slide__img--back img');

        if (fore) {
          gsap.to(fore, {
            xPercent: -6,
            ease: 'none',
            scrollTrigger: {
              trigger: slide,
              containerAnimation: anim,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          });
        }

        if (back) {
          gsap.to(back, {
            xPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: slide,
              containerAnimation: anim,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          });
        }
      });

      // Slide reveals (clip-path and text reveal)
      section.querySelectorAll('.slide').forEach((slide) => {
        const imgs = slide.querySelectorAll<HTMLElement>('.slide__img-wrap');
        const content = slide.querySelector<HTMLElement>('.slide__content');
        const numeral = slide.querySelector<HTMLElement>('.slide__numeral');

        imgs.forEach((wrap, i) => {
          const fromClip = i % 2 === 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)';
          gsap.fromTo(
            wrap,
            { clipPath: fromClip, scale: 1.06 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              scale: 1,
              duration: 1.5,
              ease: 'power4.out',
              delay: i * 0.15,
              scrollTrigger: {
                trigger: slide,
                containerAnimation: anim,
                start: 'left 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        });

        if (numeral) {
          gsap.fromTo(
            numeral,
            { clipPath: 'inset(0% 0% 100% 0%)', y: 30, opacity: 0 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              y: 0,
              opacity: 1,
              duration: 1.4,
              ease: 'power4.out',
              scrollTrigger: {
                trigger: slide,
                containerAnimation: anim,
                start: 'left 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        if (content) {
          const para = content.querySelector('.slide__description');
          if (para && !para.querySelector('.word-mask')) {
            const raw = para.textContent || '';
            const words = raw.trim().split(/\s+/);
            para.innerHTML = words
              .map((w) => `<span class="word-mask"><span class="word">${w}</span></span>`)
              .join(' ');

            const wordEls = para.querySelectorAll('.word');
            gsap.fromTo(
              wordEls,
              { yPercent: 120, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.02,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: slide,
                  containerAnimation: anim,
                  start: 'left 80%',
                  toggleActions: 'play none none none',
                },
              }
            );
          }
        }
      });

      // Jump to chapter utility
      (window as unknown as { jumpToChapter: (index: number) => void }).jumpToChapter = (index: number) => {
        if (!slides.length || index < 0) return;
        const clamped = Math.min(index, total - 1);
        const progressVal = clamped / Math.max(total - 1, 1);
        const targetScroll = horizontalST.start + progressVal * (horizontalST.end - horizontalST.start);

        const lenis = (window as unknown as { lenis?: { scrollTo: (t: number, opts: unknown) => void } }).lenis;
        if (lenis) {
          lenis.scrollTo(targetScroll, { immediate: true });
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'auto' });
        }
      };

      ScrollTrigger.refresh();
    });

    // Mobile (<= 820px): Vertical stack
    mm.add('(max-width: 820px)', () => {
      const slides = section.querySelectorAll<HTMLElement>('.chapter[data-index]');
      let currentActiveIndex = -1;

      const observer = new IntersectionObserver(
        (entries) => {
          let best: IntersectionObserverEntry | null = null;
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
              best = entry;
            }
          });
          if (!best || (best as IntersectionObserverEntry).intersectionRatio < 0.3) return;

          const slide = (best as IntersectionObserverEntry).target as HTMLElement;
          const idx = parseInt(slide.getAttribute('data-index') || '0', 10);
          if (idx === currentActiveIndex) return;
          currentActiveIndex = idx;

          const song = slide.getAttribute('data-song');
          if (song) onSongChange(song);

          slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        },
        { threshold: [0.3, 0.5, 0.7], rootMargin: '-15% 0px -25% 0px' }
      );

      slides.forEach((s) => observer.observe(s));

      (window as unknown as { jumpToChapter: (index: number) => void }).jumpToChapter = (index: number) => {
        if (!slides.length || index < 0) return;
        const clamped = Math.min(index, slides.length - 1);
        const targetSlide = slides[clamped];
        if (!targetSlide) return;

        const headerOffset = 64;
        const top = targetSlide.getBoundingClientRect().top + window.scrollY - headerOffset;

        const lenis = (window as unknown as { lenis?: { scrollTo: (t: number, opts: unknown) => void } }).lenis;
        if (lenis) {
          lenis.scrollTo(top, { duration: 1.2 });
        } else {
          window.scrollTo({ top, behavior: 'smooth' });
        }
      };

      return () => {
        observer.disconnect();
      };
    });

    return () => {
      mm.revert();
    };
  }, [onOpenScrapbook, onSongChange]);

  return (
    <section id="featured" ref={sectionRef} aria-label="Featured moments">
      <div id="horizontal-track">
        <div id="featured-chapters" ref={trackRef} aria-label="Relationship chapters">
          {relationshipChapters.map((chapter, i) => {
            switch (chapter.layout) {
              case 'editorial-placeholder':
                return <SlidePlaceholder key={chapter.chapterNumber} chapter={chapter} index={i} />;
              case 'editorial-scrapbook':
                return (
                  <SlideScrapbook
                    key={chapter.chapterNumber}
                    chapter={chapter}
                    index={i}
                    onOpenScrapbook={onOpenScrapbook}
                  />
                );
              case 'editorial-cinematic':
              case 'slide-c':
                return <SlideC key={chapter.chapterNumber} chapter={chapter} index={i} />;
              case 'editorial-left':
              case 'editorial-triptych':
                return <SlideA key={chapter.chapterNumber} chapter={chapter} index={i} />;
              case 'editorial-right':
                return <SlideD key={chapter.chapterNumber} chapter={chapter} index={i} />;
              case 'editorial-asymmetric':
                return <SlideB key={chapter.chapterNumber} chapter={chapter} index={i} />;
              default:
                return <SlideA key={chapter.chapterNumber} chapter={chapter} index={i} />;
            }
          })}
        </div>
      </div>

      <div className="featured-progress" aria-hidden="true">
        <div className="featured-progress__bar" id="progress-bar" ref={progressRef} />
      </div>
    </section>
  );
};

