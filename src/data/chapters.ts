export type ChapterLayout =
  | 'editorial-left'
  | 'editorial-right'
  | 'editorial-cinematic'
  | 'editorial-triptych'
  | 'editorial-asymmetric'
  | 'slide-c'
  | 'editorial-placeholder'
  | 'editorial-scrapbook';

export interface Chapter {
  chapterNumber: string;
  momentTitle: string;
  momentDate: string;
  layout: ChapterLayout;
  images: string[];
  songUrl: string;
  description: string;
  isPlaceholder?: boolean;
  pdfUrl?: string;
  totalPages?: number;
  pageImages?: string[];
}

export const relationshipChapters: Chapter[] = [
  {
    chapterNumber: 'I',
    momentTitle: 'Officially Us',
    momentDate: '06/14/2026 - Officially Us',
    layout: 'editorial-cinematic',
    images: [
      'assets/images/06-14-2026/me.jpg',
      'assets/images/06-14-2026/bd2f6f6f-fde8-4faa-b580-de9ceefb03d5.jpg',
    ],
    songUrl: 'assets/audio/chapter-01.mp3',
    description: 'Finally I can legally call u mine haha. From just "nhiks" to "lovee" or pwede rpd "tralala", every name feels like a little piece of my heart saying your name.',
  },

  {
    chapterNumber: 'II',
    momentTitle: 'The Smartest Meme Buddy',
    momentDate: 'Golden Days of Dopes',
    layout: 'editorial-left',
    images: [
      'assets/images/06-14-2026/buddies.jpg',
      'assets/images/06-14-2026/buddies1.jpg',
    ],
    songUrl: '',
    description: 'Who would\'ve thought na magka-kita diay lol. Back in high school, meme buddies ra jud ta (chekret kras). You\'ve always been so smart and pretty, but the best part was you actually "know ball" when it comes to high level memes. Di lang ka basta makasabot, kabalo pa jud ka mohimo. Never forgot how we used to draw and put text on my printed textbook characters just to plot stupid memes haha.',
  },

  {
    chapterNumber: 'III',
    momentTitle: 'From Brainrot to Sunsets',
    momentDate: 'From Brainrot to Sunsets',
    layout: 'editorial-right',
    images: [
      'assets/images/06-14-2026/memes.jpg',
      'assets/images/06-14-2026/IMG_8219.jpg',
    ],
    songUrl: '',
    description: 'Even when life got busy, sige gihapon tag chat. Our convos is literally just a beautiful messspamming reels from the most unhinged/racist memes to random sunsets and pets. Halos tanan nalang jud esend nato haha. Plus keeping up our TikTok streaks everyday, matic na jud na sa routine.',
  },

  {
    chapterNumber: 'IV',
    momentTitle: 'We Ruined the Friendship... In the Best Way',
    momentDate: 'We Ruined the Friendship... In the Best Way',
    layout: 'editorial-triptych',
    images: [
      'assets/images/06-14-2026/hs.jpg',
      'assets/images/06-14-2026/86854235-97fb-4b27-b7eb-9dd77c6b2362.jpg',
    ],
    songUrl: '',
    description: 'They say "don\'t risk the friendship" pero ikaw mn gd grr(jokez), pero okay ra kay crush mn sd tka sauna pa haha. Honestly the best decision ever. From just bantering and kantsaway all the time, and now uyab na ta. You\'re still my best friend, tralala, but this time ako na palangga nimo. (chasey, pero sige rgd!)',
  },

  {
    chapterNumber: 'V',
    momentTitle: 'Studying Apart, Growing Together',
    momentDate: 'Every Day We\'re Apart',
    layout: 'editorial-asymmetric',
    images: [
      'assets/images/06-14-2026/missu.jpg',
      'assets/images/06-14-2026/missu.jpg',
    ],
    songUrl: '',
    description: 'It honestly sucks that we don\'t get to meet physically as often as we want because of our studies. LDR is heavy sometimes, but we can always pull through chats or calls. Worth it ra gihapon everything because I know you\'re working hard on your end too. Distance can\'t change how much I\'m into you, lovee.',
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
    description: 'Since layo ta ari sa earth, We still found a way para maapil gihapon ta sa space haha. Our names are submitted to NASA, so it\'s officially loaded onto the Nancy Grace Roman Space Telescope heading 1 million miles into deep space. Impas jd ang space telescope kay naay dala nga tralala didto sa universe haha... Happy 1st monthsary, lovee!',
  },
  {
    chapterNumber: 'VII',
    momentTitle: 'Volume II · In the Works',
    momentDate: '08/14/2026 — Second Monthsary',
    layout: 'editorial-placeholder',
    isPlaceholder: true,
    images: [],
    songUrl: '',
    description: 'Memories being curated. Room reserved for our 2nd monthsary story. A little space for everything we are still putting into words.',
  },
  {
    chapterNumber: 'VIII',
    momentTitle: "Lovey’s Scrapbook · Happy 3rd!",
    momentDate: '09/14/2026 — Our 3rd Monthsary',
    layout: 'editorial-scrapbook',
    images: ['assets/images/third/page-01.png', 'assets/images/third/page-11.png'],
    pdfUrl: 'assets/pdf/_3rd.pdf',
    totalPages: 11,
    pageImages: Array.from({ length: 11 }, (_, i) => `assets/images/third/page-${String(i + 1).padStart(2, '0')}.png`),
    songUrl: '',
    description: 'Our 3rd monthsary. An eleven-page scrapbook by lovey.',
  },
];

