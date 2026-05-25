<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../utils/api'
import AdminNavBar from './ui/AdminNavBar.vue'
import ImagePicker from './ui/ImagePicker.vue'

const saving = ref(false)
const loading = ref(true)
const feedback = ref('')
const feedbackType = ref('success')

const defaultImages = [
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
]

const form = reactive({
  heroTitle: 'Somewhere between structure and disorder new forms quietly start to emerge',
  images: [...defaultImages],
})

const cardsForm = reactive({
  glassTheme: {
    titleColor: '#ffffff',
    metaColor: 'rgb(255 255 255 / 88%)',
  },
  movies: [
    { file: '/media-movies/11.jpg', title: '', meta: 'card 1', quote: 'Design By AI' },
    { file: '/media-movies/2.jpg', title: '', meta: 'card 2', quote: 'Design By AI' },
    { file: '/media-movies/7.jpg', title: '', meta: 'card 3', quote: 'Design By AI' },
    { file: '/media-movies/8.jpg', title: '', meta: 'card 4', quote: 'Design By AI' },
  ],
})

const _pickerSetter = ref(null)
const showPicker = ref(false)

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
      // Musics page content
      const musicsItem = data.data.find(i => i.sectionKey === 'musics/content')
      if (musicsItem) {
        try {
          const d = JSON.parse(musicsItem.contentJson)
          if (d.heroTitle != null) form.heroTitle = d.heroTitle
          if (d.images) d.images.forEach((url, i) => {
            if (i < form.images.length && url != null) form.images[i] = url
          })
        } catch { /* keep defaults */ }
      }
      // Movie cards content
      const cardsItem = data.data.find(i => i.sectionKey === 'musics/movie-cards')
      if (cardsItem) {
        try {
          const d = JSON.parse(cardsItem.contentJson)
          if (d.glassTheme) {
            if (d.glassTheme.titleColor != null) cardsForm.glassTheme.titleColor = d.glassTheme.titleColor
            if (d.glassTheme.metaColor != null) cardsForm.glassTheme.metaColor = d.glassTheme.metaColor
          }
          if (d.movies) d.movies.forEach((m, i) => {
            if (i < cardsForm.movies.length) {
              if (m.file != null) cardsForm.movies[i].file = m.file
              if (m.title != null) cardsForm.movies[i].title = m.title
              if (m.meta != null) cardsForm.movies[i].meta = m.meta
              if (m.quote != null) cardsForm.movies[i].quote = m.quote
            }
          })
        } catch { /* keep defaults */ }
      }
    }
  } catch { /* use defaults */ }
  loading.value = false
}

const save = async () => {
  saving.value = true
  try {
    await Promise.all([
      api.put('/home-content', {
        sectionKey: 'musics/content',
        contentJson: JSON.stringify({ heroTitle: form.heroTitle, images: form.images.slice() }),
      }),
      api.put('/home-content', {
        sectionKey: 'musics/movie-cards',
        contentJson: JSON.stringify({
          glassTheme: { ...cardsForm.glassTheme },
          movies: cardsForm.movies.map(m => ({ ...m })),
        }),
      }),
    ])
    showMessage('Musics 页保存成功')
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
      <div class="editor-main editor-main--full">
        <div class="editor-toolbar">
          <span class="editor-label">Hero + Spiral + Movie Cards</span>
          <button type="button" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>

        <div class="editor-body">
          <!-- Musics Page top row -->
          <div class="top-row">
            <fieldset class="card-fieldset hero-title-fieldset">
              <legend>Hero Title</legend>
              <label class="hero-title-label"><span>Title</span><input v-model="form.heroTitle" /></label>
            </fieldset>

            <fieldset class="card-fieldset glass-fieldset">
              <legend>Glass Theme Colors</legend>
              <div class="form-row glass-form-row">
                <label><span>Title Color</span><div class="color-field"><input type="color" v-model="cardsForm.glassTheme.titleColor" /><code>{{ cardsForm.glassTheme.titleColor }}</code></div></label>
                <label><span>Meta Color</span><div class="color-field"><input type="color" v-model="cardsForm.glassTheme.metaColor" /><code>{{ cardsForm.glassTheme.metaColor }}</code></div></label>
              </div>
            </fieldset>
          </div>

          <div class="bottom-row">
            <fieldset class="card-fieldset spiral-fieldset">
              <legend>Spiral Gallery Images ({{ form.images.length }} photos)</legend>
              <div class="img-grid">
                <div v-for="(img, i) in form.images" :key="i" class="img-row">
                  <span class="img-label">#{{ i + 1 }}</span>
                  <img :src="img" class="img-preview" @click="openPickerFor(u => form.images[i] = u)" />
                  <button type="button" class="pick-btn" @click="openPickerFor(u => form.images[i] = u)">选择</button>
                </div>
              </div>
            </fieldset>

            <!-- Movie Cards -->
            <fieldset class="card-fieldset movie-cards-fieldset">
              <legend>Movie Cards (4 cards)</legend>
              <div v-for="(card, i) in cardsForm.movies" :key="i" class="card-block">
                <h3 class="card-title">Card {{ i + 1 }}</h3>
                <div class="card-layout">
                  <div class="card-image">
                    <img :src="card.file" class="img-preview" @click="openPickerFor(u => card.file = u)" />
                    <button type="button" class="pick-btn" @click="openPickerFor(u => card.file = u)">选择</button>
                  </div>
                  <div class="card-text">
                    <label><span>Title</span><input v-model="card.title" /></label>
                    <label><span>Meta</span><input v-model="card.meta" /></label>
                    <label><span>Quote</span><input v-model="card.quote" /></label>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>

    <ImagePicker v-model="showPicker" @select="onPickerSelect" />
  </section>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 0;
  background: radial-gradient(circle at top left, rgba(148,163,184,0.1), transparent 28%), radial-gradient(circle at right, rgba(203,213,225,0.12), transparent 32%), #fcfcfb;
  color: #0f172a;
}

button {
  padding: 0.68rem 1.3rem;
  border: 1px solid rgb(15 23 42 / 12%);
  border-radius: 12px;
  background: rgb(241 245 249 / 80%);
  backdrop-filter: blur(14px) saturate(130%);
  color: rgb(15 23 42 / 92%);
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
  box-shadow: 0 2px 10px rgb(15 23 42 / 10%), inset 0 1px 0 rgb(255 255 255 / 90%);
  transition: transform 0.3s ease, filter 0.2s ease;
}
button:hover { transform: scale(1.04); filter: brightness(1.08); }
button:active { transform: scale(0.98); filter: brightness(0.95); }
button:disabled { opacity: 0.7; cursor: wait; transform: none; filter: none; }
.page-feedback {
  position: fixed; top: 1rem; left: 50%; transform: translateX(-50%);
  margin: 0; padding: 0.75rem 1.5rem; border-radius: 999px;
  font-size: 0.875rem; font-weight: 600; z-index: 100;
  background: rgb(255 255 255 / 92%); backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgb(15 23 42 / 10%);
}
.page-feedback--success { color: #16a34a; }
.page-feedback--error { color: #ef4444; }

.editor-layout { width: 100%; margin: 0 auto; display: flex; gap: 1.5rem; align-items: flex-start; }
.editor-main { flex: 1; min-width: 0; background: transparent; overflow: hidden; }
.editor-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1.25rem; border-bottom: 1px solid rgb(15 23 42 / 8%); background: rgb(248 250 252 / 80%);
}
.editor-label { font-size: 0.85rem; font-weight: 600; color: #0f172a; }
.editor-body { padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; align-items: center; }
.editor-body > .card-fieldset { width: 100%; align-self: stretch; }

.card-fieldset {
  border: 1px solid rgb(15 23 42 / 10%); border-radius: 0.85rem; padding: 1rem;
  display: grid; gap: 0.75rem; margin-bottom: 1rem;
}
.card-fieldset legend { font-size: 0.8rem; font-weight: 600; color: #475569; padding: 0 0.5rem; }

label { display: grid; gap: 0.3rem; }
label span { font-size: 0.78rem; font-weight: 600; color: #64748b; }

.hero-title-fieldset { display: inline-flex; justify-content: center; width: auto; }
.hero-title-label { display: flex; flex-direction: column; align-items: center; }
.hero-title-label input { width: auto; min-width: 30ch; max-width: 100%; field-sizing: content; text-align: center; }
input, textarea {
  width: 100%; padding: 0.65rem 0.85rem; border-radius: 0.65rem;
  border: 1px solid rgb(15 23 42 / 12%); background: rgb(248 250 252 / 90%);
  color: #0f172a; font-size: 0.85rem; outline: none; font-family: inherit;
  field-sizing: content;
}
input:focus, textarea:focus { border-color: rgb(59 130 246 / 50%); box-shadow: 0 0 0 3px rgb(59 130 246 / 8%); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.card-block {
  border: 1px solid rgb(15 23 42 / 6%); border-radius: 0.65rem;
  padding: 0.75rem; display: grid; gap: 0.5rem;
}
.card-title { font-size: 0.82rem; font-weight: 700; color: #334155; margin: 0; }
.movie-cards-fieldset { display: flex; flex-direction: column; align-items: center; }
.card-layout { display: flex; gap: 1.5rem; align-items: center; }
.card-image { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.card-image .img-preview { width: 28rem; height: 16rem; }
.card-text { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; }
.card-text label { align-items: flex-start; }
.card-text input { width: auto; min-width: 16ch; max-width: 100%; field-sizing: content; }

.color-field { display: flex; align-items: center; gap: 0.5rem; }
.color-field input[type="color"] {
  width: 2.4rem; height: 2.2rem; padding: 2px; border: 1px solid rgb(15 23 42 / 12%);
  border-radius: 0.4rem; cursor: pointer; background: #fff; flex-shrink: 0;
}
.color-field code { font-size: 0.72rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }

.img-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
.img-row { display: flex; align-items: center; gap: 0.5rem; }
.img-label { font-size: 0.75rem; font-weight: 600; color: #64748b; width: 42px; flex-shrink: 0; }
.img-preview {
  width: 5rem; height: 5rem; object-fit: cover; border-radius: 0.5rem;
  border: 1px solid rgb(15 23 42 / 8%); background: #f1f5f9; flex-shrink: 0;
  cursor: pointer;
}
.img-preview:hover { opacity: 0.8; }

.top-row { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
.bottom-row { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; align-items: stretch; }
.spiral-fieldset { display: inline-flex; flex-direction: column; align-items: center; width: auto; }
.glass-fieldset { display: inline-flex; flex-direction: column; align-items: center; width: auto; }
.glass-form-row { gap: 0.25rem; }
.spiral-fieldset .img-grid { grid-template-columns: repeat(3, max-content); gap: 0.5rem 0.4rem; justify-content: center; }
.spiral-fieldset .img-row { flex-direction: column; align-items: center; }
.spiral-fieldset .img-label { width: auto; }
.spiral-fieldset .img-preview { width: 14rem; height: 14rem; }
.pick-btn {
  flex-shrink: 0;
  padding: 0.4rem 0.6rem;
  font-size: 0.72rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(15 23 42 / 12%);
  background: rgb(241 245 249 / 80%);
  color: #475569;
  cursor: pointer;
  box-shadow: none;
  transition: background 0.15s;
}
.pick-btn:hover { background: rgb(226 232 240); transform: none; filter: none; }

@media (max-width: 768px) {
  .admin-page { padding: 1rem; }
  .editor-layout { flex-direction: column; }
  .form-row { grid-template-columns: 1fr; }
  .spiral-fieldset .img-grid { grid-template-columns: repeat(2, 1fr); }
  .card-layout { flex-direction: column; }
  .card-image .img-preview { width: 10rem; height: 7rem; }
}
</style>
