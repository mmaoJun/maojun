export const siteFooter = {
  icpLabel: '黔ICP备2026005154号-1',
  icpHref: 'https://beian.miit.gov.cn/',
  publicSecurityLabel: '贵公网安备 52042202000085号',
  publicSecurityHref: 'https://beian.mps.gov.cn/#/query/webSearch?code=52042202000085',
}

export const siteNavLinks = [
  { label: 'Movies', href: '/movies' },
  { label: 'Musics', href: '/musics' },
  { label: 'Pictures', href: '/pictures' },
  { label: 'Slow', href: '/slow' },
]

export const homePageConfig = {
  brand: 'maoJun',
  aboutLabel: 'about',
  heroImage: '/home/red.webp',
  burningImage: '/burning.webp',
  cardsImage: '/art_01-01.jpg',
  cardBackImages: ['/card1.jpeg', '/card2.jpeg', '/card3.jpeg'],
  heroTip: 'Scroll to Explore',
  introLines: [
    '要怎么做才能年纪轻轻就过上那种生活',
    '悠闲地到处旅行',
    '开着保时捷',
    '在豪宅里煮意面',
    '了不起的盖茨比啊',
  ],
  introSubLines: ['燃烧', 'Burning', '-2018-'],
  loader: {
    title: ['MAO', 'JUN'],
    sideHeading: 'PLAYLIST',
    images: [
      '/media-musics/p1218345200.webp',
      '/media-musics/s26262544.jpg',
      '/media-musics/s2702527.jpg',
      '/media-musics/s28297901.jpg',
      '/media-musics/s28361360.jpg',
      '/media-musics/s28794309.jpg',
      '/media-musics/s29465458.jpg',
      '/media-musics/s33559919.jpg',
      '/media-musics/s33569302.jpg',
      '/media-musics/s33892007.jpg',
      '/media-musics/s34371161.jpg',
      '/media-musics/s4016142.jpg',
      '/media-musics/s4514100.jpg',
    ],
    tracks: [
      '귀요미송 - Hari',
      'Skyfall - Damiano / 敏雅',
      '나란 놈은 답은 너다 - Leessang / 河琳',
      "Tom's Diner - Suzanne Vega / DNA",
      'EVERYTHING - 黑裙子',
      '아무노래 - Zico',
      '헤어지지 못하는 여자, 떠나가지 못하는 남자 - Leessang / 郑仁',
      'Call You Tonight - Whitney Houston',
      'Missing You - G-DRAGON / 金润雅',
      '바람이나 좀 쐐 - Gary / MIWOO',
      'Ghiblian Magic - Idst',
      '经济舱 - KEY.L 刘聪 / KAFE_HU 咖啡胡',
      'Afterthought - Joji / BENEE',
      '阿司匹林 - 王以太',
      'HEARTBREAK ANNIVERSARY - GIVÉON',
      '精卫 - 30 年前，50 年后',
      '男孩 - 梁博',
      '日落大道 - 梁博',
      'death bed - Powfu / beabadoobee',
      'Coffee - beabadoobee',
      '七月上 - Jam',
      'Luv(sic.) Part 3 (feat. Shing02) - Nujabes / Shing02',
      'Runaway - Kanye West / Pusha T',
      "We Don't Talk Anymore - Charlie Puth / Selena Gomez",
      'Luv (sic) pt2 - Nujabes',
      'Lightning Moment feat.fox capture plan - DJ Okawari / fox capture plan',
      "pure imagination - Rook1e / J'san",
      'Come Around Me - Justin Bieber',
      'Body - Loud Luxury / Brando',
      'Cruel Summer - Taylor Swift',
      '1분 1초 - Epik High / Taru',
      'Begging You (Guide Ver.) - 2Lson / 孝彬',
      '잘 알지도 못하면서 - 金艺林',
      'Black - G-DRAGON / JENNIE',
      'Mr. "Broken Heart" - 松下優也',
      '絆 - miu-clips',
      '真夜中のドア～stay with me (シングル ver.) - 松原みき',
    ],
  },
}

export const moviesPageConfig = {
  introTitle: 'Enter the Frame',
  outroTitle: 'Loop Complete',
  glassTheme: {
    titleColor: '#ffffff',
    metaColor: 'rgb(255 255 255 / 88%)',
    glow: 'rgb(255 255 255 / 20%)',
  },
  movies: [
    { file: 'p2497136132.jpg', title: '声之形', meta: '日本 · 2016', quote: '活着，本身就已经很了不起了。' },
    { file: 'p2520095279.jpg', title: '燃烧', meta: '韩国 · 2018', quote: '有些人就像从未存在过一样消失。' },
    { file: 'p2868462052.jpg', title: '花束般的恋爱', meta: '日本 · 2021', quote: '喜欢是会枯萎的，但记忆不会。'},
    { file: 'p2888332880.jpg', title: '余生那些年', meta: '日本 · 2022', quote: '就算明天见不到你，今天也要好好喜欢你。' }
  ],
}

export const musicsPageConfig = {
  heroTitle: 'Somewhere between structure and disorder new forms quietly start to emerge',
  sectionTitle: 'New forms begin here',
  pictureFiles: [
    'p1218345200.webp',
    's26262544.jpg',
    's2702527.jpg',
    's28297901.jpg',
    's28361360.jpg',
    's28794309.jpg',
    's29465458.jpg',
    's33559919.jpg',
    's33569302.jpg',
    's33892007.jpg',
    's34371161.jpg',
    's4016142.jpg',
    's4514100.jpg',
  ],
}

export const picturesPageConfig = {
  introText: ['Built to flow with your story,', 'not fight it'],
  titleLines: ['Cool', 'Testimonial', 'Section'],
  ctaLabel: 'Explore All',
  cards: [
    {
      rotateClass: 'rotate--10',
      video: 'https://videos.pexels.com/video-files/34646475/14684507_720_1280_60fps.mp4',
      review: '"My skin literally started glowing after a week."\nI usually avoid flavoured drinks, but this one surprised me. Smooth texture, no weird aftertaste, and it actually feels premium.',
    },
    {
      rotateClass: 'rotate-4',
      video: 'https://videos.pexels.com/video-files/31282751/13358727_720_1280_25fps.mp4',
      review: '"My focus has been off the charts since I switched to this."\nI\'m usually skeptical about morning supplements, but the energy is so clean. No midday crash, mixes perfectly with oat milk, and honestly tastes like a barista made it.',
    },
    {
      rotateClass: 'rotate--4',
      video: 'https://videos.pexels.com/video-files/34646475/14684507_720_1280_60fps.mp4',
      review: '"I\'ve never felt more energized in the morning."\nThis supplement has completely changed my routine. The taste is amazing, and I love how it gives me sustained energy without the jitters.',
    },
    {
      rotateClass: 'rotate-4',
      video: 'https://videos.pexels.com/video-files/31282792/13358692_720_1280_25fps.mp4',
      review: '"My skin literally started glowing after a week."\nI usually avoid flavoured drinks, but this one surprised me. Smooth texture, no weird aftertaste, and it actually feels premium.',
    },
    {
      rotateClass: 'rotate--10',
      video: 'https://videos.pexels.com/video-files/34646475/14684507_720_1280_60fps.mp4',
      review: '"I\'ve never felt more energized in the morning."\nThis supplement has completely changed my routine. The taste is amazing, and I love how it gives me sustained energy without the jitters.',
    },
    {
      rotateClass: 'rotate-4',
      video: 'https://videos.pexels.com/video-files/31282751/13358727_720_1280_25fps.mp4',
      review: '"Consistency matters, and this finally feels like a premium habit."\nThe texture is smooth, the flavour feels elevated, and the whole ritual has become something I genuinely look forward to.',
    },
    {
      rotateClass: 'rotate--3',
      video: 'https://videos.pexels.com/video-files/31282792/13358692_720_1280_25fps.mp4',
      review: '"It looks good, feels premium, and actually keeps me coming back."\nFrom the packaging to the taste, everything feels polished. It fits perfectly into my morning workflow.',
    },
  ],
}

export const aboutPageConfig = {
  brand: 'Elara Vandenberg',
  navItems: ['Runway', 'Lookbook', 'Campaigns', 'Biography'],
  overlayWords: ['Structure', 'Designed Identity', 'Welcome'],
  images: [
    '/media-musics/p1218345200.webp',
    '/media-musics/s26262544.jpg',
    '/media-musics/s2702527.jpg',
    '/media-musics/s28297901.jpg',
    '/media-musics/s28361360.jpg',
  ],
  heroTitle: 'Elara Vandenberg',
}
