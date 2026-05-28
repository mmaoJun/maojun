<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../utils/api'
import AdminNavBar from './ui/AdminNavBar.vue'
import ImagePicker from './ui/ImagePicker.vue'

const activeTab = ref('home/part1')
const saving = ref(false)
const loading = ref(true)
const feedback = ref('')
const feedbackType = ref('success')

const tabs = [
  { key: 'home/part1', label: 'Hero Video & Text' },
  { key: 'home/part2', label: '12-Image Collection' },
  { key: 'home/part3', label: 'Animated Slideshow' },
  { key: 'home/part4', label: 'Marquee Cards' },
  { key: 'home/part5', label: 'Three Card Flip' },
  { key: 'home/part6', label: 'Gallery & Footer' },
  { key: 'home/part8', label: 'Feedback Slider' },
]

// ---- Part 1 ----
const p1 = reactive({
  type: 'video',
  src: '/home/14307427_1920_1080_60fps.mp4',
  loaderCenterImage: '/home/home.png',
  revealText: 'DESIGN BY AI',
})

// ---- Part 2 ----
const p2Images = reactive(Array.from({ length: 12 }, (_, i) => ({ value: `/home/part1/${i + 1}.png` })))

// ---- Part 3 ----
const p3 = reactive({
  eyebrow: '/ our services',
  slides: [
    { id: 'slide-1', title: 'DESIGN BY AI', imageUrl: '/home/part4/1.jpg' },
    { id: 'slide-2', title: 'Image materials', imageUrl: '/home/part4/2.jpg' },
    { id: 'slide-3', title: 'from pexels.com', imageUrl: '/home/part4/3.jpg' },
    { id: 'slide-4', title: 'UI design', imageUrl: '/home/part4/4.jpg' },
    { id: 'slide-5', title: 'from 21st.dev', imageUrl: '/home/part4/5.jpg' },
  ],
})

// ---- Part 4 ----
const p4 = reactive({
  heading: 'Design By AI',
  description: 'The UI design is inspired by 21st.dev, and the image materials come from pexels.com.',
  cards: [
    { title: 'DESIGN BY AI', image: '/home/part4/1.jpg' },
    { title: 'DESIGN BY AI', image: '/home/part4/2.jpg' },
    { title: 'DESIGN BY AI', image: '/home/part4/3.jpg' },
    { title: 'DESIGN BY AI', image: '/home/part4/4.jpg' },
    { title: 'DESIGN BY AI', image: '/home/part4/5.jpg' },
    { title: 'DESIGN BY AI', image: '/home/part4/6.jpg' },
    { title: 'DESIGN BY AI', image: '/home/part4/7.jpg' },
    { title: 'DESIGN BY AI', image: '/home/part4/8.jpg' },
    { title: 'DESIGN BY AI', image: '/home/part4/9.jpg' },
  ],
})

// ---- Part 5 ----
const p5 = reactive({
  cardsImage: '/home/part4/pexels-steve-23749488.jpg',
  cardBackImages: ['/home/part4/1.jpg', '/home/part4/2.jpg', '/home/part4/3.jpg'],
  title: 'DESIGN BY AI',
})

// ---- Part 6 ----
const p6Gallery = reactive([
  { url: '/home/part4/1.jpg', title: 'Home Red', author: 'maoJun', top: '8%', left: '11%', width: 'clamp(4rem, 7vw, 6rem)', height: 'clamp(4rem, 7vw, 6rem)', depth: 0.5 },
  { url: '/home/part4/2.jpg', title: 'Home Blue', author: 'maoJun', top: '10%', left: '32%', width: 'clamp(5rem, 8vw, 7rem)', height: 'clamp(5rem, 8vw, 7rem)', depth: 1 },
  { url: '/home/part4/3.jpg', title: 'Home Green', author: 'maoJun', top: '2%', left: '53%', width: 'clamp(7rem, 11vw, 10rem)', height: 'clamp(10rem, 15vw, 13rem)', depth: 2 },
  { url: '/home/part4/4.jpg', title: 'Home Yellow', author: 'maoJun', top: '0%', left: '83%', width: 'clamp(6rem, 9vw, 8rem)', height: 'clamp(6rem, 9vw, 8rem)', depth: 1 },
  { url: '/home/part4/5.jpg', title: 'Home Purple', author: 'maoJun', top: '40%', left: '2%', width: 'clamp(7rem, 10vw, 9rem)', height: 'clamp(7rem, 10vw, 9rem)', depth: 1 },
  { url: '/home/part4/6.jpg', title: 'Home Orange', author: 'maoJun', top: '73%', left: '15%', width: 'clamp(9rem, 14vw, 13rem)', height: 'clamp(12rem, 18vw, 16rem)', depth: 4 },
  { url: '/home/part4/7.jpg', title: 'Card Back 1', author: 'maoJun', top: '80%', left: '50%', width: 'clamp(6rem, 9vw, 8rem)', height: 'clamp(6rem, 9vw, 8rem)', depth: 1 },
  { url: '/home/part4/8.jpg', title: 'Music Cover 3', author: 'maoJun', top: '70%', left: '77%', width: 'clamp(7rem, 10vw, 9rem)', height: 'clamp(9rem, 14vw, 12rem)', depth: 2 },
])
const p6 = reactive({
  galleryTitle: 'MAOJUN',
  buttonLabel: 'about',
  route: '/about',
  footer: {
    brandName: 'MAOJUN',
    logoText: 'M',
    socialLinks: [{ label: 'GitHub', href: 'https://github.com/mmaoJun', icon: 'GitHub', external: true }],
    mainLinks: [],
    legalLinks: [
      { label: '黔ICP备2026005154号', href: 'https://beian.miit.gov.cn/', external: true },
      { label: '贵公网安备 52042202000085号', href: 'https://beian.mps.gov.cn/#/query/webSearch?code=52042202000085', external: true },
    ],
    copyright: { text: '© 2026 maoJun', license: 'All rights reserved' },
  },
})

// ---- Part 8 ----
const p8 = reactive({
  title: 'How are you feeling today?',
  defaultIndex: 0,
  states: [
    { noteText: 'BAD', label: 'Bad' },
    { noteText: 'NOT BAD', label: 'Not Bad' },
    { noteText: 'GOOD', label: 'Good' },
  ],
})

const buildJson = (key) => {
  switch (key) {
    case 'home/part1':
      return JSON.stringify({ heroMedia: { type: p1.type, src: p1.src, loaderCenterImage: p1.loaderCenterImage }, revealText: p1.revealText })
    case 'home/part2':
      return JSON.stringify({ images: p2Images.map(i => i.value) })
    case 'home/part3':
      return JSON.stringify({ eyebrow: p3.eyebrow, slides: p3.slides })
    case 'home/part4':
      return JSON.stringify({ heading: p4.heading, description: p4.description, cards: p4.cards })
    case 'home/part5':
      return JSON.stringify({ cardsImage: p5.cardsImage, cardBackImages: p5.cardBackImages, title: p5.title })
    case 'home/part6':
      return JSON.stringify({ galleryTitle: p6.galleryTitle, buttonLabel: p6.buttonLabel, route: p6.route, images: [...p6Gallery], footer: p6.footer })
    case 'home/part8':
      return JSON.stringify({ title: p8.title, defaultIndex: p8.defaultIndex, states: p8.states.map(s => ({ ...s })) })
    default: return '{}'
  }
}

const parseInto = (key, json) => {
  try {
    const d = JSON.parse(json)
    switch (key) {
      case 'home/part1':
        if (d.heroMedia) {
          p1.type = d.heroMedia.type || (d.heroMedia.video ? 'video' : 'image')
          p1.src = d.heroMedia.src || d.heroMedia.video || p1.src
          p1.loaderCenterImage = d.heroMedia.loaderCenterImage || p1.loaderCenterImage
        }
        if (d.revealText) p1.revealText = d.revealText
        break
      case 'home/part2':
        if (d.images) d.images.forEach((v, i) => { if (i < 12) p2Images[i].value = v })
        break
      case 'home/part3':
        if (d.eyebrow) p3.eyebrow = d.eyebrow
        if (d.slides) p3.slides = d.slides
        break
      case 'home/part4':
        if (d.heading) p4.heading = d.heading
        if (d.description) p4.description = d.description
        if (d.cards) p4.cards = d.cards
        break
      case 'home/part5':
        if (d.cardsImage) p5.cardsImage = d.cardsImage
        if (d.cardBackImages) p5.cardBackImages = d.cardBackImages
        if (d.title) p5.title = d.title
        break
      case 'home/part6':
        if (d.galleryTitle) p6.galleryTitle = d.galleryTitle
        if (d.buttonLabel) p6.buttonLabel = d.buttonLabel
        if (d.route) p6.route = d.route
        if (d.images) { p6Gallery.length = 0; d.images.forEach(img => p6Gallery.push({ ...img })) }
        if (d.footer) Object.assign(p6.footer, d.footer)
        break
      case 'home/part8':
        if (d.title) p8.title = d.title
        if (typeof d.defaultIndex === 'number') p8.defaultIndex = d.defaultIndex
        if (d.states) p8.states = d.states
        break
    }
  } catch { /* keep defaults */ }
}

const _pickerSetter = ref(null)
const showPicker = ref(false)
const thumbFailed = ref(new Set())
const thumbLoaded = ref(new Set())

const getVideoThumbUrl = (url) => {
  const sep = url.includes('?') ? '&' : '?'
  return url + sep + 'x-oss-process=video/snapshot,t_1000,f_jpg'
}

const onThumbLoad = (id) => { thumbLoaded.value = new Set([...thumbLoaded.value, id]) }
const onThumbError = (id) => { thumbFailed.value = new Set([...thumbFailed.value, id]) }

const openPickerFor = (setter) => {
  _pickerSetter.value = setter
  showPicker.value = true
}

const onPickerSelect = (url) => {
  if (_pickerSetter.value) _pickerSetter.value(url)
}

const loadContent = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/home-content')
    if (data.data && data.data.length) {
      data.data.forEach((item) => { parseInto(item.sectionKey, item.contentJson) })
    }
  } catch { /* use defaults */ }
  loading.value = false
}

const save = async () => {
  saving.value = true
  try {
    await api.put('/home-content', { sectionKey: activeTab.value, contentJson: buildJson(activeTab.value) })
    showMessage(`${tabs.find(t => t.key === activeTab.value)?.label} 保存成功`)
  } catch (error) {
    showMessage(error.response?.data?.message || '保存失败', 'error')
  } finally {
    saving.value = false
  }
}

let feedbackTimer = null
const showMessage = (message, type = 'success') => {
  clearTimeout(feedbackTimer)
  feedback.value = message
  feedbackType.value = type
  feedbackTimer = setTimeout(() => { feedback.value = '' }, 3000)
}

onMounted(() => { loadContent() })
</script>

<template>
  <section class="admin-page">
    <AdminNavBar />

    <p v-if="feedback" class="page-feedback" :class="`page-feedback--${feedbackType}`">{{ feedback }}</p>

    <div class="editor-layout">
      <nav class="tab-nav">
        <button v-for="t in tabs" :key="t.key" class="tab-btn" :class="{ 'tab-btn--active': activeTab === t.key }" @click="activeTab = t.key">
          {{ t.label }}
        </button>
      </nav>

      <div class="editor-main">
        <div class="editor-toolbar">
          <span class="editor-label">{{ tabs.find(t => t.key === activeTab)?.label }}</span>
          <button type="button" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>

        <div class="editor-body">
          <!-- Part 1 -->
          <div v-show="activeTab === 'home/part1'" class="form-grid">
            <div class="hero-media-row">
              <label class="hero-media-label">
                <span>Media Type</span>
                <div class="type-toggle-group">
                  <button
                    v-for="opt in [{ v: 'video', label: 'Video' }, { v: 'image', label: 'Image' }, { v: 'gif', label: 'GIF' }]"
                    :key="opt.v"
                    type="button"
                    class="type-toggle-btn"
                    :class="{ 'type-toggle-btn--active': p1.type === opt.v }"
                    @click="p1.type = opt.v"
                  >{{ opt.label }}</button>
                </div>
              </label>
              <label class="hero-media-label"><span>Media URL</span><div class="img-field"><img v-if="p1.type === 'video' && !thumbFailed.has('p1media')" :src="getVideoThumbUrl(p1.src)" class="img-preview hero-media-preview" @load="onThumbLoad('p1media')" @error="onThumbError('p1media')" /><img v-else-if="p1.type !== 'video'" :src="p1.src" class="img-preview hero-media-preview" @error="onThumbError('p1media')" /><div v-else class="img-preview img-preview--fallback hero-media-preview"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg></div><input v-model="p1.src" /><button type="button" class="pick-btn" @click="openPickerFor(u => p1.src = u)">选择</button></div></label>
              <label class="hero-media-label"><span>Loader Center Image</span><div class="img-field"><img :src="p1.loaderCenterImage" class="img-preview hero-media-preview" /><input v-model="p1.loaderCenterImage" /><button type="button" class="pick-btn" @click="openPickerFor(u => p1.loaderCenterImage = u)">选择</button></div></label>
            </div>
            <label class="reveal-label"><span>Reveal Text</span><input v-model="p1.revealText" /></label>
          </div>

          <!-- Part 2 -->
          <div v-show="activeTab === 'home/part2'" class="form-grid part2-grid">
            <label v-for="(img, i) in p2Images" :key="i"><span>Image {{ i + 1 }} URL</span><div class="img-field"><img :src="img.value" class="img-preview" /><input v-model="img.value" /><button type="button" class="pick-btn" @click="openPickerFor(u => img.value = u)">选择</button></div></label>
          </div>

          <!-- Part 3 -->
          <div v-show="activeTab === 'home/part3'" class="form-grid">
            <label><span>Eyebrow Text</span><input v-model="p3.eyebrow" /></label>
            <div class="slides-row">
              <fieldset v-for="(s, i) in p3.slides" :key="i" class="card-fieldset slide-card">
                <legend>Slide {{ i + 1 }}</legend>
                <div class="slide-card-title">
                  <span>Title</span>
                  <input v-model="s.title" placeholder="Slide title" />
                </div>
                <div class="slide-card-img">
                  <img :src="s.imageUrl" class="img-preview" />
                  <button type="button" class="pick-btn" @click="openPickerFor(u => s.imageUrl = u)">选择</button>
                </div>
              </fieldset>
            </div>
          </div>

          <!-- Part 4 -->
          <div v-show="activeTab === 'home/part4'" class="form-grid">
            <label><span>Heading</span><input v-model="p4.heading" /></label>
            <label><span>Description</span><textarea v-model="p4.description" rows="3" /></label>
            <div class="marquee-cards-row">
              <fieldset v-for="(c, i) in p4.cards" :key="i" class="card-fieldset marquee-card">
                <legend>Card {{ i + 1 }}</legend>
                <div class="marquee-card-img">
                  <img :src="c.image" class="img-preview" />
                  <button type="button" class="pick-btn" @click="openPickerFor(u => c.image = u)">选择</button>
                </div>
                <label><span>Title</span><input v-model="c.title" /></label>
              </fieldset>
            </div>
          </div>

          <!-- Part 5 -->
          <div v-show="activeTab === 'home/part5'" class="form-grid">
            <label class="cards-image-label"><span>Cards Image</span><div class="cards-image-field"><img :src="p5.cardsImage" class="cards-image-preview" /><input v-model="p5.cardsImage" /><button type="button" class="pick-btn" @click="openPickerFor(u => p5.cardsImage = u)">选择</button></div></label>
            <div class="card-backs-row">
              <label v-for="(url, i) in p5.cardBackImages" :key="i"><span>Card Back {{ i + 1 }}</span><div class="img-field"><img :src="p5.cardBackImages[i]" class="img-preview" /><input v-model="p5.cardBackImages[i]" /><button type="button" class="pick-btn" @click="openPickerFor(u => p5.cardBackImages[i] = u)">选择</button></div></label>
            </div>
            <label class="p5-title-label"><span>Title</span><input v-model="p5.title" /></label>
          </div>

          <!-- Part 6 -->
          <div v-show="activeTab === 'home/part6'" class="form-grid">
            <div class="gallery-inputs-row">
              <label><span>Gallery Title</span><input v-model="p6.galleryTitle" /></label>
              <label><span>Button Label</span><input v-model="p6.buttonLabel" /></label>
              <label><span>Route</span><input v-model="p6.route" /></label>
            </div>
            <div class="gallery-images-grid">
              <div v-for="(img, i) in p6Gallery" :key="i" class="gallery-image-card">
                <span class="gallery-image-label">Image {{ i + 1 }}</span>
                <img :src="img.url" class="img-preview" />
                <button type="button" class="pick-btn" @click="openPickerFor(u => img.url = u)">选择</button>
              </div>
            </div>
          </div>

          <!-- Part 8: Feedback Slider -->
          <div v-show="activeTab === 'home/part8'" class="form-grid">
            <label><span>Title</span><input v-model="p8.title" /></label>
            <label>
              <span>Default State</span>
              <select v-model.number="p8.defaultIndex" class="theme-select">
                <option :value="0">State 1 — {{ p8.states[0].label }}</option>
                <option :value="1">State 2 — {{ p8.states[1].label }}</option>
                <option :value="2">State 3 — {{ p8.states[2].label }}</option>
              </select>
            </label>
            <div v-for="(state, i) in p8.states" :key="i" class="card-fieldset">
              <legend>State {{ i + 1 }} <span class="fs-theme-hint" :class="`fs-theme-hint--${['bad','neutral','good'][i]}`">{{ ['Red','Yellow','Green'][i] }}</span></legend>
              <div class="form-row">
                <label><span>Big Text</span><input v-model="state.noteText" /></label>
                <label><span>Label</span><input v-model="state.label" /></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ImagePicker v-model="showPicker" @select="onPickerSelect" :include-videos="true" />
  </section>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 0;
  background: #f8f9fb;
  color: #1e293b;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* ---- Buttons ---- */
button {
  padding: 0.6rem 1.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #334155;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}
button:hover { background: #f1f5f9; border-color: #cbd5e1; transform: none; filter: none; }
button:active { background: #e2e8f0; transform: none; filter: none; }
button:disabled { opacity: 0.5; cursor: wait; transform: none; filter: none; }

.page-feedback {
  position: fixed; top: 1.5rem; left: 50%; transform: translateX(-50%);
  margin: 0; padding: 0.6rem 1.4rem; border-radius: 999px;
  font-size: 0.8rem; font-weight: 600; z-index: 100; letter-spacing: 0.01em;
  background: #fff; border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.page-feedback--success { color: #059669; }
.page-feedback--error { color: #dc2626; }

/* ---- Layout ---- */
.editor-layout {
  width: 100%; max-width: 1200px; margin: 0 auto;
  display: flex; gap: 1.5rem; align-items: flex-start;
  padding: 1.5rem;
}

/* ---- Tab Nav ---- */
.tab-nav {
  display: flex; flex-direction: column; gap: 2px;
  flex-shrink: 0; width: 200px;
  background: #fff; border-radius: 12px; padding: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #e8ecf1;
}
.tab-btn {
  padding: 0.55rem 0.85rem; text-align: left; border: none; border-radius: 8px;
  background: transparent; color: #64748b; font-size: 0.78rem; font-weight: 500;
  cursor: pointer; box-shadow: none;
  transition: all 0.15s ease;
}
.tab-btn:hover { background: #f1f5f9; color: #1e293b; transform: none; filter: none; }
.tab-btn--active { background: #1e293b; color: #fff; font-weight: 600; }

/* ---- Editor Main ---- */
.editor-main {
  flex: 1; min-width: 0;
  background: #fff; border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  border: 1px solid #e8ecf1;
  overflow: hidden;
}
.editor-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.85rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}
.editor-label { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
.editor-body { padding: 1.75rem; overflow-y: auto; }

/* ---- Forms ---- */
.form-grid { display: grid; gap: 1rem; }
.form-grid label { display: grid; gap: 0.25rem; }
.form-grid label span { font-size: 0.75rem; font-weight: 600; color: #64748b; letter-spacing: 0.02em; }

.form-grid label input:not([type="color"]) {
  width: auto; min-width: 20ch; max-width: 100%; field-sizing: content; justify-self: start;
}
.form-grid .img-field input { width: 100%; min-width: 0; field-sizing: auto; }

input, textarea, select {
  width: 100%; padding: 0.6rem 0.8rem; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  color: #1e293b; font-size: 0.84rem; outline: none;
  font-family: inherit; field-sizing: content;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
input:focus, textarea:focus, select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
}
textarea { resize: vertical; }

.card-fieldset {
  border: 1px solid #e8ecf1; border-radius: 10px; padding: 1.1rem 1.25rem;
  display: grid; gap: 0.75rem; background: #fafbfc;
}
.card-fieldset legend { font-size: 0.78rem; font-weight: 700; color: #334155; padding: 0 0.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

/* ---- Hero / Image sections ---- */
.hero-media-row { display: flex; gap: 1.5rem; justify-content: center; }
.hero-media-label { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
.reveal-label { display: flex; flex-direction: column; align-items: center; justify-self: center; }
.reveal-label input { width: auto !important; min-width: 24ch; max-width: 100%; field-sizing: content; text-align: center; }
.hero-media-preview { width: 22rem; height: 13rem; }

.img-field { display: flex; align-items: center; gap: 0.4rem; }
.img-field input { display: none; }
.cards-image-field input { display: none; }
.slide-card-img input { display: none; }
.marquee-card-img input { display: none; }
.slide-card input[type]:not([type="text"]) { display: none; }
.img-preview {
  width: 10rem; height: 10rem; object-fit: cover; border-radius: 8px;
  border: 1px solid #e8ecf1; background: #f1f5f9; flex-shrink: 0; cursor: pointer;
}
.img-preview:hover { opacity: 0.85; }
.img-preview--fallback {
  display: flex; align-items: center; justify-content: center;
  background: #1e293b; cursor: default;
}
.img-preview--fallback svg { width: 22px; height: 22px; color: #fff; }
.img-preview--fallback:hover { opacity: 1; }

.part2-grid { grid-template-columns: repeat(4, 1fr); gap: 0.5rem 0; }
.part2-grid label { gap: 0.25rem; }

.slides-row { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; }
.slide-card { flex-shrink: 0; width: auto; min-width: 200px; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.slide-card .img-preview { width: 16rem; height: 20rem; }

.marquee-cards-row { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; flex-wrap: wrap; }
.marquee-card { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.marquee-card-img { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
.marquee-card .img-preview { width: 12rem; height: 16rem; }
.marquee-card input { width: auto !important; min-width: 14ch; max-width: 100%; field-sizing: content; text-align: center; }

.cards-image-label { display: flex; flex-direction: column; align-items: center; }
.cards-image-field { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.cards-image-preview { width: 24rem; height: 16rem; object-fit: cover; border-radius: 8px; border: 1px solid #e8ecf1; background: #f1f5f9; }
.card-backs-row { display: flex; gap: 0.75rem; justify-content: center; }
.card-backs-row .img-preview { width: 14rem; height: 18rem; }
.card-backs-row label { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }

.p5-title-label { display: flex; flex-direction: column; align-items: center; justify-self: center; }
.p5-title-label input { width: auto; min-width: 20ch; max-width: 100%; field-sizing: content; text-align: center; }

.gallery-inputs-row { display: flex; gap: 1rem; justify-content: center; }
.gallery-inputs-row label { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.gallery-inputs-row input { width: auto; min-width: 16ch; max-width: 100%; field-sizing: content; text-align: center; }

.gallery-images-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.gallery-image-card { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
.gallery-image-label { font-size: 0.75rem; font-weight: 600; color: #64748b; }
.gallery-image-card .img-preview { width: 12rem; height: 16rem; }
.slide-card-img { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
.slide-card-title { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; width: 100%; }
.slide-card-title span { font-size: 0.78rem; font-weight: 600; color: #64748b; }
.slide-card-title input { width: auto; min-width: 14ch; max-width: 100%; field-sizing: content; text-align: center; padding: 0.4rem 0.6rem; border: 1px solid #e2e8f0; border-radius: 6px; background: #f8fafc; color: #1e293b; font-size: 0.85rem; outline: none; }

/* ---- Type Toggle ---- */
.type-toggle-group {
  display: inline-flex; border-radius: 999px;
  background: #f1f5f9; padding: 3px; gap: 1px;
}
.type-toggle-btn {
  padding: 0.38rem 0.95rem; border: none; border-radius: 999px;
  background: transparent; backdrop-filter: none;
  color: #64748b; font-size: 0.76rem; font-weight: 600;
  cursor: pointer; box-shadow: none;
  transition: all 0.2s ease; transform: none; filter: none;
}
.type-toggle-btn:hover { background: rgba(255,255,255,0.6); color: #334155; }
.type-toggle-btn--active { background: #fff; color: #1e293b; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }

/* ---- Pick Button ---- */
.pick-btn {
  flex-shrink: 0; padding: 0.4rem 0.7rem; font-size: 0.72rem;
  border-radius: 6px; border: 1px solid #e2e8f0;
  background: #fff; color: #64748b; cursor: pointer; box-shadow: none;
  transition: all 0.15s ease;
}
.pick-btn:hover { background: #f1f5f9; border-color: #cbd5e1; transform: none; filter: none; }

/* ---- Feedback Slider Theme Hint ---- */
.fs-theme-hint {
  font-size: 0.68rem; font-weight: 500; padding: 0.15rem 0.55rem; border-radius: 999px;
  margin-left: 0.5rem;
}
.fs-theme-hint--bad { background: #fee2e2; color: #991b1b; }
.fs-theme-hint--neutral { background: #fef3c7; color: #92400e; }
.fs-theme-hint--good { background: #dcfce7; color: #166534; }

@media (max-width: 768px) {
  .admin-page { padding: 0; }
  .editor-layout { flex-direction: column; padding: 0.75rem; }
  .tab-nav { width: 100%; flex-direction: row; flex-wrap: wrap; }
}
</style>
