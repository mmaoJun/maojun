<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../utils/api'
import AdminNavBar from './ui/AdminNavBar.vue'
import ImagePicker from './ui/ImagePicker.vue'

const saving = ref(false)
const loading = ref(true)
const feedback = ref('')
const feedbackType = ref('success')

const slides = reactive([
  { title: "Ethereal Glow", description: "A soft, radiant light that illuminates the soul.", media: "/media-movies/picture1.png" },
  { title: "Rose Mirage", description: "Lost in a desert of blooming dreams and endless horizons.", media: "/media-movies/picture2.png" },
  { title: "Velvet Mystique", description: "Wrapped in the deep, luxurious embrace of the night.", media: "/media-movies/picture3.png" },
  { title: "Golden Hour", description: "That fleeting moment when the world is dipped in gold.", media: "/media-movies/picture4.png" },
  { title: "Midnight Dreams", description: "Where reality fades and imagination takes flight.", media: "/media-movies/picture5.png" },
  { title: "Silver Light", description: "A cool, metallic shimmer reflecting the urban pulse.", media: "/media-movies/picture6.png" },
])

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
      const moviesData = data.data.find(item => item.sectionKey === 'movies/slides')
      if (moviesData) {
        try {
          const d = JSON.parse(moviesData.contentJson)
          if (d.slides) d.slides.forEach((s, i) => {
            if (i < 6) {
              if (s.title != null) slides[i].title = s.title
              if (s.description != null) slides[i].description = s.description
              if (s.media != null) slides[i].media = s.media
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
    const slidesData = slides.map(s => ({ title: s.title, description: s.description, media: s.media }))
    await api.put('/home-content', {
      sectionKey: 'movies/slides',
      contentJson: JSON.stringify({ slides: slidesData }),
    })
    showMessage('Movies 页保存成功')
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
          <span class="editor-label">6 Slides (Title + Description + Image)</span>
          <button type="button" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>

        <div class="editor-body">
          <fieldset v-for="(s, i) in slides" :key="i" class="card-fieldset slide-card">
            <legend>Slide {{ i + 1 }}</legend>
            <div class="slide-row">
              <div class="slide-image">
                <img :src="s.media" class="img-preview" />
                <button type="button" class="pick-btn" @click="openPickerFor(u => s.media = u)">选择</button>
              </div>
              <div class="slide-text">
                <label><span>Title</span><input v-model="s.title" /></label>
                <label><span>Description</span><input v-model="s.description" /></label>
              </div>
            </div>
          </fieldset>
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

.card-fieldset {
  width: 100%; max-width: 800px;
  border: 1px solid rgb(15 23 42 / 10%); border-radius: 0.85rem; padding: 1rem;
  display: grid; gap: 0.75rem; margin: 0 auto 1rem;
}
.card-fieldset legend { font-size: 0.8rem; font-weight: 600; color: #475569; padding: 0 0.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.slide-row { display: flex; gap: 1.5rem; align-items: flex-start; }
.slide-image { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.slide-image .img-preview { width: 18rem; height: 12rem; }
.slide-text { flex: 1; display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; }
.slide-text input { field-sizing: content; min-width: 12ch; max-width: 100%; }

label { display: grid; gap: 0.3rem; }
label span { font-size: 0.78rem; font-weight: 600; color: #64748b; }
input, textarea {
  width: 100%; padding: 0.65rem 0.85rem; border-radius: 0.65rem;
  border: 1px solid rgb(15 23 42 / 12%); background: rgb(248 250 252 / 90%);
  color: #0f172a; font-size: 0.85rem; outline: none; font-family: inherit;
  field-sizing: content;
}
input:focus, textarea:focus { border-color: rgb(59 130 246 / 50%); box-shadow: 0 0 0 3px rgb(59 130 246 / 8%); }

.img-field { display: flex; align-items: center; gap: 0.4rem; }
.img-field input { display: none; }
.img-preview {
  width: 5rem; height: 5rem; object-fit: cover; border-radius: 0.5rem;
  border: 1px solid rgb(15 23 42 / 8%); background: #f1f5f9; flex-shrink: 0;
  cursor: pointer;
}
.img-preview:hover { opacity: 0.8; }
.pick-btn {
  flex-shrink: 0;
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
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
  .slide-row { flex-direction: column; }
  .slide-image .img-preview { width: 5rem; height: 5rem; }
}
</style>
