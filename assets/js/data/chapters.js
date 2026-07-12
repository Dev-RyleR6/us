/**
 * Our Story — Relationship Chapters Data
 * ─────────────────────────────────────────
 * Each object represents one month of the relationship.
 * Replace placeholder image URLs with real photos.
 * Replace songUrl paths with actual audio files.
 *
 * Layout variants (controls the magazine spread style):
 *   'editorial-left'       — Tall primary image left, secondary content right
 *   'editorial-right'      — Content left, tall primary image right
 *   'editorial-cinematic'  — Full-bleed image, text overlay at bottom
 *   'editorial-triptych'   — Three staggered images, text beneath
 *   'editorial-asymmetric' — Large hero + offset small + floating text
 */

const relationshipChapters = [
  {
    chapterNumber: 'I',
    monthName: 'January 2023',
    layout: 'editorial-cinematic',
    images: [
      'https://picsum.photos/seed/chapter1a/1600/900',
      'https://picsum.photos/seed/chapter1b/800/1000',
      'https://picsum.photos/seed/chapter1c/700/700',
    ],
    songUrl: 'assets/audio/chapter-01.mp3',
    description: 'The world was cold and still, and then there was you — a warmth I hadn\'t planned for, arriving quietly like the first light through a curtained window.',
  },

  {
    chapterNumber: 'II',
    monthName: 'February 2023',
    layout: 'editorial-left',
    images: [
      'https://picsum.photos/seed/chapter2a/900/1200',
      'https://picsum.photos/seed/chapter2b/600/600',
      'https://picsum.photos/seed/chapter2c/600/400',
    ],
    songUrl: 'assets/audio/chapter-02.mp3',
    description: 'Every February after will carry the ghost of this one. The coffee. The silence. The way you looked at me like I was already home.',
  },

  {
    chapterNumber: 'III',
    monthName: 'March 2023',
    layout: 'editorial-right',
    images: [
      'https://picsum.photos/seed/chapter3a/900/1200',
      'https://picsum.photos/seed/chapter3b/700/500',
      'https://picsum.photos/seed/chapter3c/700/500',
    ],
    songUrl: 'assets/audio/chapter-03.mp3',
    description: 'Things that began in March: our first real argument. Our first real apology. The understanding that staying is its own kind of bravery.',
  },

  {
    chapterNumber: 'IV',
    monthName: 'April 2023',
    layout: 'editorial-triptych',
    images: [
      'https://picsum.photos/seed/chapter4a/700/900',
      'https://picsum.photos/seed/chapter4b/700/1100',
      'https://picsum.photos/seed/chapter4c/700/800',
    ],
    songUrl: 'assets/audio/chapter-04.mp3',
    description: 'Fourteen frames in a camera roll. Forty laughs in an afternoon. One feeling I couldn\'t name yet, though I knew it was something I\'d carry for a long time.',
  },

  {
    chapterNumber: 'V',
    monthName: 'May 2023',
    layout: 'editorial-asymmetric',
    images: [
      'https://picsum.photos/seed/chapter5a/1200/800',
      'https://picsum.photos/seed/chapter5b/500/700',
      'https://picsum.photos/seed/chapter5c/600/400',
    ],
    songUrl: 'assets/audio/chapter-05.mp3',
    description: 'We drove without a destination. You played songs I hadn\'t heard. I memorized your profile against the window — golden hour, golden hour, golden hour.',
  },

  {
    chapterNumber: 'VI',
    monthName: 'June 2023',
    layout: 'editorial-left',
    images: [
      'https://picsum.photos/seed/chapter6a/900/1300',
      'https://picsum.photos/seed/chapter6b/600/500',
      'https://picsum.photos/seed/chapter6c/600/450',
    ],
    songUrl: 'assets/audio/chapter-06.mp3',
    description: 'The city felt borrowed. Like we were visitors from some quieter future, moving through it in slow motion, tasting everything twice.',
  },

  {
    chapterNumber: 'VII',
    monthName: 'July 2023',
    layout: 'editorial-cinematic',
    images: [
      'https://picsum.photos/seed/chapter7a/1600/900',
      'https://picsum.photos/seed/chapter7b/700/900',
      'https://picsum.photos/seed/chapter7c/600/600',
    ],
    songUrl: 'assets/audio/chapter-07.mp3',
    description: 'Heat like a held breath. Nights that refused to end. I think this was when I stopped wondering about you and started simply knowing.',
  },

  {
    chapterNumber: 'VIII',
    monthName: 'August 2023',
    layout: 'editorial-triptych',
    images: [
      'https://picsum.photos/seed/chapter8a/600/900',
      'https://picsum.photos/seed/chapter8b/600/700',
      'https://picsum.photos/seed/chapter8c/600/950',
    ],
    songUrl: 'assets/audio/chapter-08.mp3',
    description: 'We were soft with each other this month. Careful and deliberate. The way you handle something you\'ve decided to keep.',
  },

  {
    chapterNumber: 'IX',
    monthName: 'September 2023',
    layout: 'editorial-right',
    images: [
      'https://picsum.photos/seed/chapter9a/850/1200',
      'https://picsum.photos/seed/chapter9b/650/500',
      'https://picsum.photos/seed/chapter9c/650/450',
    ],
    songUrl: 'assets/audio/chapter-09.mp3',
    description: 'Autumn came and made everything look like a painting we hadn\'t finished. We decided to stay inside it anyway — unfinished, unfazed.',
  },

  {
    chapterNumber: 'X',
    monthName: 'October 2023',
    layout: 'editorial-asymmetric',
    images: [
      'https://picsum.photos/seed/chapter10a/1100/750',
      'https://picsum.photos/seed/chapter10b/500/650',
      'https://picsum.photos/seed/chapter10c/550/380',
    ],
    songUrl: 'assets/audio/chapter-10.mp3',
    description: 'This is the month I knew. Not suspected, not hoped — knew. The way you know a place is yours before you\'ve unpacked.',
  },

  {
    chapterNumber: 'XI',
    monthName: 'November 2023',
    layout: 'editorial-left',
    images: [
      'https://picsum.photos/seed/chapter11a/900/1250',
      'https://picsum.photos/seed/chapter11b/580/520',
      'https://picsum.photos/seed/chapter11c/580/420',
    ],
    songUrl: 'assets/audio/chapter-11.mp3',
    description: 'We cooked the same meal three times. Watched the same film twice. I would do all of it again — infinitely, gratefully, without hesitation.',
  },

  {
    chapterNumber: 'XII',
    monthName: 'December 2023',
    layout: 'editorial-cinematic',
    images: [
      'https://picsum.photos/seed/chapter12a/1600/900',
      'https://picsum.photos/seed/chapter12b/700/900',
      'https://picsum.photos/seed/chapter12c/700/600',
    ],
    songUrl: 'assets/audio/chapter-12.mp3',
    description: 'One year. One long, luminous sentence written by two people who hadn\'t planned to meet — and now cannot imagine having missed each other.',
  },
];

// Export for module environments, or expose globally for vanilla HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { relationshipChapters };
}

// Global exposure for vanilla HTML/script tag usage
if (typeof window !== 'undefined') {
  window.relationshipChapters = relationshipChapters;
}

