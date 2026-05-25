<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '../utils/api'
import AdminNavBar from './ui/AdminNavBar.vue'
import ImagePicker from './ui/ImagePicker.vue'

const saving = ref(false)
const loading = ref(true)
const feedback = ref('')
const feedbackType = ref('success')

const form = reactive({
  title: 'MAOJUN',
  contactLabel: 'Contact me',
  contactEmail: '382931184@qq.com',
  galleryImages: [
    '/home/word/1.jpg',
    '/home/word/2.jpg',
    '/home/word/3.jpg',
    '/home/word/4.jpg',
    '/home/word/5.jpg',
    '/home/word/6.jpg',
    '/home/word/7.jpg',
    '/home/word/8.jpg',
    '/home/word/9.jpg',
    '/home/word/10.jpg',
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
      const item = data.data.find(i => i.sectionKey === 'about/content')
      if (item) {
        try {
          const d = JSON.parse(item.contentJson)
          if (d.title != null) form.title = d.title
          if (d.contactLabel != null) form.contactLabel = d.contactLabel
          if (d.contactEmail != null) form.contactEmail = d.contactEmail
          if (d.galleryImages) d.galleryImages.forEach((url, i) => {
            if (i < 10 && url != null) form.galleryImages[i] = url
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
    await api.put('/home-content', {
      sectionKey: 'about/content',
      contentJson: JSON.stringify({
        title: form.title,
        contactLabel: form.contactLabel,
        contactEmail: form.contactEmail,
        galleryImages: form.galleryImages.slice(),
      }),
    })
    showMessage('About 页保存成功')
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
          <span class="editor-label">Title + Contact + 10 Gallery Images</span>
          <button type="button" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>

        <div class="editor-body">
          <fieldset class="card-fieldset overlay-text-fieldset">
            <legend>Overlay Text</legend>
            <label class="overlay-label"><span>Title</span><input v-model="form.title" /></label>
            <label class="overlay-label"><span>Contact Label</span><input v-model="form.contactLabel" /></label>
            <label class="overlay-label"><span>Contact Email</span><input v-model="form.contactEmail" /></label>
          </fieldset>

          <fieldset class="card-fieldset gallery-fieldset">
            <legend>Gallery Images (10 photos)</legend>
            <div class="img-grid">
              <div v-for="(img, i) in form.galleryImages" :key="i" class="img-row">
                <span class="img-label">#{{ i + 1 }}</span>
                <img :src="img" class="img-preview" @click="openPickerFor(u => form.galleryImages[i] = u)" />
                <button type="button" class="pick-btn" @click="openPickerFor(u => form.galleryImages[i] = u)">选择</button>
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
.editor-body > .card-fieldset:not(.overlay-text-fieldset):not(.gallery-fieldset) { width: 100%; align-self: stretch; }

.card-fieldset {
  border: 1px solid rgb(15 23 42 / 10%); border-radius: 0.85rem; padding: 1rem;
  display: grid; gap: 0.75rem; margin-bottom: 1rem;
}
.card-fieldset legend { font-size: 0.8rem; font-weight: 600; color: #475569; padding: 0 0.5rem; }
.overlay-text-fieldset { display: inline-flex; flex-direction: column; align-items: center; gap: 0.75rem; width: auto; }
.gallery-fieldset { display: inline-flex; flex-direction: column; align-items: center; width: auto; }
.overlay-label { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
.overlay-label input { width: auto; min-width: 20ch; max-width: 100%; field-sizing: content; text-align: center; }

label { display: grid; gap: 0.3rem; }
label span { font-size: 0.78rem; font-weight: 600; color: #64748b; }
input {
  width: 100%; padding: 0.65rem 0.85rem; border-radius: 0.65rem;
  border: 1px solid rgb(15 23 42 / 12%); background: rgb(248 250 252 / 90%);
  color: #0f172a; font-size: 0.85rem; outline: none; font-family: inherit;
  field-sizing: content;
}
input:focus { border-color: rgb(59 130 246 / 50%); box-shadow: 0 0 0 3px rgb(59 130 246 / 8%); }

.img-grid { display: grid; grid-template-columns: repeat(5, max-content); gap: 0.5rem 0.15rem; justify-content: center; }
.img-row { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
.img-label { font-size: 0.75rem; font-weight: 600; color: #64748b; width: auto; }
.img-preview {
  width: 12rem; height: 18rem; object-fit: cover; border-radius: 0.5rem;
  border: 1px solid rgb(15 23 42 / 8%); background: #f1f5f9; flex-shrink: 0;
  cursor: pointer;
}
.img-preview:hover { opacity: 0.8; }
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
  .img-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
