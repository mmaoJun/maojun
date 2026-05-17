// 全站底部配置：控制 Footer 的品牌、社交链接、主导航、备案与版权信息。
export const siteFooter = {
  brandName: 'MAOJUN',
  logoText: 'M',
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com', icon: 'GitHub', external: true },

  ],
  mainLinks: [
    { label: 'Musics', href: '/musics' },
    { label: 'Pictures', href: '/pictures' },
    { label: 'Movies', href: '/movies' },
    { label: 'About', href: '/about' },
  ],
  // legalLinks: [
  //   { label: 'icp备案号', href: 'https://beian.miit.gov.cn/', external: true },
  //   { label: '网安备案号', href: 'https://beian.mps.gov.cn/#/query/webSearch?code=52042202000085', external: true },
  // ],
  copyright: {
    text: '© 2026 maoJun',
    license: 'All rights reserved',
  },
}

// 全站顶部导航基础配置：用于导航栏主链接。
export const siteNavLinks = [
  { label: 'Musics', href: '/musics' },
  { label: 'Pictures', href: '/pictures' },
  { label: 'Movies', href: '/movies' },
]

// 首页配置：集中管理首页 Hero、Loader、卡片、轮播文案、底部图片阵列等内容。
export const homePageConfig = {
  brand: 'maoJun',
  aboutLabel: 'About',
  // 首页主视觉视频资源。
  heroMedia: {
    video: '/home/14307427_1920_1080_60fps.mp4',
    loaderCenterImage: '/home/home.png',
    fallbackPoster: '/home/home.png',
  },

  cardsImage: '/home/part4/pexels-steve-23749488.jpg',
  cardBackImages: ['/home/part4/1.jpg', '/home/part4/2.jpg', '/home/part4/3.jpg'],
  heroTip: 'Scroll to Explore',

  // Loader 配置：控制开屏标题、左右轨道图片与播放列表文本。
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
  // 首页中部 AnimatedSlideshow 组件配置。
  animatedSlideshow: {
    eyebrow: '/ our services',
    slides: [
      { id: 'slide-1', title: 'DESIGN BY AI', imageUrl: '/home/part4/1.jpg' },
      { id: 'slide-2', title: 'Image materials', imageUrl: '/home/part4/2.jpg' },
      { id: 'slide-3', title: 'from pexels.com', imageUrl: '/home/part4/3.jpg' },
      { id: 'slide-4', title: 'UI design', imageUrl: '/home/part4/4.jpg' },
      { id: 'slide-5', title: 'from 21st.dev', imageUrl: '/home/part4/5.jpg' },
    ],
  },
  // 首页底部漂浮图片阵列配置：控制 about 区块的按钮跳转与图片位置、尺寸、景深。
  parallaxFloatingGallery: {
    route: '/about',
    images: [
      { url: '/home/part4/1.jpg', title: 'Home Red', author: 'maoJun', top: '8%', left: '11%', width: 'clamp(4rem, 7vw, 6rem)', height: 'clamp(4rem, 7vw, 6rem)', depth: 0.5 },
      { url: '/home/part4/2.jpg', title: 'Home Blue', author: 'maoJun', top: '10%', left: '32%', width: 'clamp(5rem, 8vw, 7rem)', height: 'clamp(5rem, 8vw, 7rem)', depth: 1 },
      { url: '/home/part4/3.jpg', title: 'Home Green', author: 'maoJun', top: '2%', left: '53%', width: 'clamp(7rem, 11vw, 10rem)', height: 'clamp(10rem, 15vw, 13rem)', depth: 2 },
      { url: '/home/part4/4.jpg', title: 'Home Yellow', author: 'maoJun', top: '0%', left: '83%', width: 'clamp(6rem, 9vw, 8rem)', height: 'clamp(6rem, 9vw, 8rem)', depth: 1 },
      { url: '/home/part4/5.jpg', title: 'Home Purple', author: 'maoJun', top: '40%', left: '2%', width: 'clamp(7rem, 10vw, 9rem)', height: 'clamp(7rem, 10vw, 9rem)', depth: 1 },
      { url: '/home/part4/6.jpg', title: 'Home Orange', author: 'maoJun', top: '73%', left: '15%', width: 'clamp(9rem, 14vw, 13rem)', height: 'clamp(12rem, 18vw, 16rem)', depth: 4 },
      { url: '/home/part4/7.jpg', title: 'Card Back 1', author: 'maoJun', top: '80%', left: '50%', width: 'clamp(6rem, 9vw, 8rem)', height: 'clamp(6rem, 9vw, 8rem)', depth: 1 },
      { url: '/home/part4/8.jpg', title: 'Music Cover 3', author: 'maoJun', top: '70%', left: '77%', width: 'clamp(7rem, 10vw, 9rem)', height: 'clamp(9rem, 14vw, 12rem)', depth: 2 },
    ],
  },
}

// Movies 页配置：用于电影卡片堆栈、顶部横向图片链、底部 StoryScroll 叙事区。
export const moviesPageConfig = {

  // 电影卡片堆栈通用主题色。
  glassTheme: {
    titleColor: '#ffffff',
    metaColor: 'rgb(255 255 255 / 88%)',
    glow: 'rgb(255 255 255 / 20%)',
  },
  // movie-cards.vue 使用的堆叠电影卡片内容。文件前缀/media-movies/ 
  movies: [
    { file: '11.jpg', title: '', meta: 'card 1', quote: 'Design By AI' },
    { file: '2.jpg', title: '', meta: 'card 2', quote: 'Design By AI' },
    { file: '7.jpg', title: '', meta: 'card 3', quote: 'Design By AI' },
    { file: '8.jpg', title: '', meta: 'card 4', quote: 'Design By AI' },
  ],
  // movies.vue 顶部横向图片链数据。
  sliderItems: [
    { title: '千と千尋', year: '2019', img: '/media-movies/1.jpg', url: 'https://movie.douban.com/subject/1291561/' },
    { title: '教父', year: '1972', img: '/media-movies/2.jpg', url: 'https://movie.douban.com/subject/1291841/' },
    { title: '燃烧 버닝', year: '2018', img: '/media-movies/3.jpg', url: 'https://movie.douban.com/subject/26842702/' },
    { title: '新世界', year: '2013', img: '/media-movies/4.jpg', url: 'https://movie.douban.com/subject/10437779/' },
    { title: '寄生虫', year: '2019', img: '/media-movies/5.jpg', url: 'https://movie.douban.com/subject/27010768/' },
    { title: '杀人回忆', year: '2003', img: '/media-movies/6.jpg', url: 'https://movie.douban.com/subject/1300299/' },
    { title: '花束般的恋爱', year: '2022', img: '/media-movies/7.jpg', url: 'https://movie.douban.com/subject/34874432/' },
    { title: '余生那些年', year: '2023', img: '/media-movies/8.jpg', url: 'https://movie.douban.com/subject/35418583/' },
    { title: '君の名は。', year: '2016', img: '/media-movies/9.jpg', url: 'https://movie.douban.com/subject/26683290/' },
    { title: '君の名は。', year: '2016', img: '/media-movies/10.jpg', url: 'https://movie.douban.com/subject/26683290/' },
    { title: '君の名は。', year: '2016', img: '/media-movies/11.jpg', url: 'https://movie.douban.com/subject/26683290/' },

  ],
  // StoryScroll 组件内容：每个 section 的标题、正文、颜色和多列说明都在这里控制。
  storyScroll: {
    ariaLabel: 'Presentation Flow Art',
    sections: [
      { id: 'story-1', label: 'Who we are', number: '01 — Who we are', bg: '#fd5200', color: '#ffffff', border: 'rgba(0, 0, 0, 1)', title: ['Create', 'Without', 'Limits'], body: 'We believe every artist deserves a platform that puts creativity first. No algorithms, no noise — just pure art and the people who make it.', align: 'left' },
      { id: 'story-2', label: 'The mission', number: '02 — The mission', bg: '#000000', color: '#ffffff', border: 'rgba(255, 255, 255, 0.6)', title: ['Art', 'First', 'Always'], body: 'A global community built for artists, by artists. We\'re rewriting the rules of how creative work gets seen, shared, and valued.', columnsTop: [{ title: 'Discovery', text: 'Human-curated collections that put real eyes on real art. No algorithms deciding your fate.' }, { title: 'Community', text: 'Find collaborators, mentors, and fellow creatives who push your work forward.' }, { title: 'Value', text: 'Fair pricing. Transparent commissions. Artists keep what they earn. Always.' }], columnsBottom: [{ title: 'Exhibitions', text: 'Virtual and physical showcases curated from our global network.' }, { title: 'Mentorship', text: 'Paired guidance from established artists who\'ve walked the path.' }, { title: 'Residencies', text: 'Access funded creative retreats around the world.' }], footer: 'Every feature we build starts with one question — does this serve the artist?', align: 'right' },
      { id: 'story-3', label: 'How it works', number: '03 — How it works', bg: '#F5F0E8', color: '#000000', border: 'rgba(0, 0, 0, 0.6)', title: ['Show', 'Up.', 'Stand', 'Out.'], body: 'Three steps. Zero complexity. Your creative career starts moving the moment you sign up.', columnsTop: [{ title: '01 — Upload', text: 'Drag, drop, done. Your portfolio goes live in seconds with full creative control.' }, { title: '02 — Connect', text: 'Match with collectors, galleries, and brands actively looking for your style.' }, { title: '03 — Grow', text: 'Track engagement, manage commissions, and scale your practice — all in one place.' }], columnsBottom: [{ title: '04 — Sell', text: 'Set your prices, manage editions, handle licensing. Built-in commerce tools.' }, { title: '05 — Collaborate', text: 'Find your people. Joint projects, split commissions, shared studios.' }, { title: '06 — Evolve', text: 'Your practice changes. Your platform should too. Flexible tools that adapt.' }], align: 'left' },
      { id: 'story-4', label: 'The vision', number: '04 — The vision', bg: '#1A3DE8', color: '#ffffff', border: 'rgba(255, 255, 255, 0.5)', title: ['Future', 'Of', 'Art'], body: 'We\'re not just building a platform. We\'re building a movement.', columnsTop: [{ title: '10K+', text: 'Artists from 80 countries already shaping the future with us.' }, { title: '$2M+', text: 'Paid directly to creators in our first year. Zero hidden fees.' }, { title: '100%', text: 'Artist-owned. Every decision we make starts with the creator.' }], footer: 'The art world has been broken for decades. Galleries take 50%. Algorithms bury talent. We\'re here to change that — permanently.', columnsBottom: [{ title: 'Open access', text: 'No invite codes. No waiting lists. If you make art, you belong here.' }, { title: 'Global reach', text: 'Your work seen in 120+ countries from day one.' }, { title: 'Artist-first economics', text: 'You keep 90% of every sale. The remaining 10% funds the platform and the mission.' }], align: 'left' },
      { id: 'story-5', label: 'Join us', number: '05 — Join us', bg: '#000000', color: '#ffffff', border: 'rgba(255, 255, 255, 0.5)', title: ['Ready', 'To', 'Begin?'], body: 'Take control of your creative journey. Join now and let\'s shape the future of the art world together.', align: 'left' },
    ],
  },
}

// Musics 页配置：当前主要控制主标题与螺旋图集资源。
export const musicsPageConfig = {
  heroTitle: 'Somewhere between structure and disorder new forms quietly start to emerge',
  sectionTitle: 'New forms begin here',
  // 螺旋画廊图片文件名列表，会自动拼成 /media-musics/ 路径。
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

// About 页配置：控制画廊资源。
export const picturesPageConfig = {
  // pictures.vue 里使用的图片资源。
  galleryImages: [
    '/home/part4/1.jpg',
    '/home/part4/2.jpg',
    '/home/part4/3.jpg',
    '/home/part4/4.jpg',
    '/home/part4/5.jpg',
    '/home/part4/6.jpg',
    '/home/part4/7.jpg',
    '/home/part4/8.jpg',
    '/home/part4/9.jpg',
    '/home/part4/pexels-steve-23749488.jpg',
  ],
}

// pictures 页配置：控制主标题、计数器终点值与首屏图片资源。
export const aboutPageConfig = {
  brand: 'Elara Vandenberg',
  navItems: ['Runway', 'Lookbook', 'Campaigns', 'Biography'],
  overlayWords: ['Structure', 'Designed Identity', 'Welcome'],
  // 开场计数器最终数字。
  counterEnd: 100,
  // 首屏图片序列，中间第 3 张会作为 hero-img 处理。
  images: [
    '/home/part4/1.jpg',
    '/home/part4/2.jpg',
    '/home/part4/3.jpg',
    '/home/part4/4.jpg',
    '/home/part4/5.jpg',
  ],
  heroTitle: 'Elara Vandenberg',
}
