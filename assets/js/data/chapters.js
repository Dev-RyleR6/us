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
    momentTitle: 'Officially Us',
    momentDate: 'June 14, 2026',
    layout: 'editorial-cinematic',
    images: [
      'assets/images/06-14-2026/IMG_8219.jpg',
      'assets/images/06-14-2026/bd2f6f6f-fde8-4faa-b580-de9ceefb03d5.jpg',
    ],
    songUrl: 'assets/audio/chapter-01.mp3',
    description: 'Finally I can legally call u mine haha. From just "nhiks" to "lovee" or pwede rpd "tralala", every name feels like a little piece of my heart saying your name.',
  },

  {
    chapterNumber: 'II',
    momentTitle: 'The Smartest Meme Buddy',
    momentDate: 'High School Days',
    layout: 'editorial-left',
    images: [
      'assets/images/highschool/meme-days.jpg', // Replace with a throwback if you have one!
      'assets/images/06-14-2026/IMG_8219.jpg',
    ],
    songUrl: '',
    description: 'Who would\'ve thought na kita diay magkadayon lol. Back in high school, meme buddies ra jud ta. You\'ve always been so smart and pretty, but the best part was you actually "know ball" when it comes to high level memes. Di lang ka basta makasabot, kamao pa jud ka mohimo. Never forgot how we used to draw and put text on my printed textbook characters just to plot stupid memes haha.',
  },

  {
    chapterNumber: 'III',
    momentTitle: 'From Brainrot to Sunsets',
    momentDate: 'The Keeping-In-Touch Era',
    layout: 'editorial-right',
    images: [
      'assets/images/reels/random-spam.jpg', 
      'assets/images/06-14-2026/IMG_8219.jpg',
    ],
    songUrl: '',
    description: 'Even when life got busy, sige gihapon tag chat. Our inbox is literally just a beautiful mess—spamming reels from the most unhinged/racist memes to random sunsets and pets. Halos tanan nalang jud i-send natos usa\'t isa. Plus keeping up our TikTok streaks everyday, automatic na jud na sa routine.',
  },

  {
    chapterNumber: 'IV',
    momentTitle: 'We Ruined the Friendship... In the Best Way',
    momentDate: 'June 2026',
    layout: 'editorial-triptych',
    images: [
      'assets/images/06-14-2026/IMG_8219.jpg',
      'assets/images/06-14-2026/IMG_8219.jpg',
    ],
    songUrl: '',
    description: 'They say "don\'t risk the friendship" pero deadma, gubaon gihapon ang friendship kay ganahan man ko nimo haha. Honestly the best decision ever. From just bantering and kantsaway all the time, and now uyab na ta. You\'re still my best friend, tralala, but this time ako na gapangga nimo.',
  },

  {
    chapterNumber: 'V',
    momentTitle: 'Studying Apart, Growing Together',
    momentDate: 'Every Day We\'re Apart',
    layout: 'editorial-asymmetric',
    images: [
      'assets/images/ldr/facetime.jpg', 
      'assets/images/06-14-2026/IMG_8219.jpg',
    ],
    songUrl: '',
    description: 'It honestly sucks that we don\'t get to meet physically as often as we want because of our studies. LDR is heavy sometimes, but we always pull through via FaceTime dates. Worth it ra gihapon everything because I know you\'re working hard on your end too. Distance can\'t change how much I\'m into you, lovee.',
  },

  {
    chapterNumber: 'VI',
    momentTitle: 'Written in the Stars (Literally)',
    momentDate: 'Our 1st Monthsary',
    layout: 'slide-c',
    images: [
      'assets/images/06-14-2026/nhiki.jpg', 
      'assets/images/06-14-2026/ryle.jpg',
    ],
    songUrl: '',
    description: 'Since layo ta ari sa earth, I found a way para maapil gihapon ta sa space haha. I submitted our names to NASA, so it\'s officially loaded onto the Nancy Grace Roman Space Telescope heading 1 million miles into deep space. Impas gyud ang space telescope kay apil atong "tralala" sa universe haha. Happy 1st monthsary, lovee! To more months with you.',
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

