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
  heroTitle: 'Elara Vandenberg',
  images: [
    '/home/part4/1.jpg',
    '/home/part4/2.jpg',
    '/home/part4/3.jpg',
    '/home/part4/4.jpg',
    '/home/part4/5.jpg',
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
      const item = data.data.find(i => i.sectionKey === 'pictures/content')
      if (item) {
        try {
          const d = JSON.parse(item.contentJson)
          if (d.heroTitle != null) form.heroTitle = d.heroTitle
          if (d.images) d.images.forEach((url, i) => {
            if (i < 5 && url != null) form.images[i] = url
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
      sectionKey: 'pictures/content',
      contentJson: JSON.stringify({
        heroTitle: form.heroTitle,
        images: form.images.slice(),
      }),
    })
    showMessage('Pictures 页保存成功')
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
          <span class="editor-label">Hero Title + 5 Images</span>
          <button type="button" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>

        <div class="editor-body">
          <fieldset class="card-fieldset hero-title-fieldset">
            <legend>Hero Title</legend>
            <label class="hero-title-label"><span>Title</span><input v-model="form.heroTitle" /></label>
          </fieldset>

          <fieldset class="card-fieldset images-fieldset">
            <legend>Images (5 photos)</legend>
            <div v-for="(img, i) in form.images" :key="i" class="img-row">
              <span class="img-label">#{{ i + 1 }}{{ i === 2 ? ' (hero)' : '' }}</span>
              <img :src="img" class="img-preview" />
              <button type="button" class="pick-btn" @click="openPickerFor(u => form.images[i] = u)">选择图片</button>
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
  border: 1px solid rgb(15 23 42 / 10%); border-radius: 0.85rem; padding: 1rem;
  display: grid; gap: 0.75rem; margin-bottom: 1rem;
}
.card-fieldset legend { font-size: 0.8rem; font-weight: 600; color: #475569; padding: 0 0.5rem; }

label { display: grid; gap: 0.3rem; }
label span { font-size: 0.78rem; font-weight: 600; color: #64748b; }

.hero-title-fieldset { display: inline-flex; justify-content: center; width: auto; }
.hero-title-label { display: flex; flex-direction: column; align-items: center; }
.hero-title-label input { width: auto; min-width: 20ch; max-width: 100%; field-sizing: content; text-align: center; }
input, textarea {
  width: 100%; padding: 0.65rem 0.85rem; border-radius: 0.65rem;
  border: 1px solid rgb(15 23 42 / 12%); background: rgb(248 250 252 / 90%);
  color: #0f172a; font-size: 0.85rem; outline: none; font-family: inherit;
  field-sizing: content;
}
input:focus, textarea:focus { border-color: rgb(59 130 246 / 50%); box-shadow: 0 0 0 3px rgb(59 130 246 / 8%); }

.images-fieldset { display: flex; flex-direction: row; gap: 1.5rem; justify-content: center; flex-wrap: nowrap; overflow-x: auto; padding: 0.5rem; }
.images-fieldset .img-row { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex-shrink: 0; }
.images-fieldset .img-label { font-size: 0.78rem; font-weight: 600; color: #64748b; width: auto; }
.images-fieldset .img-preview { width: 14rem; height: 20rem; }
.img-preview {
  width: 4rem; height: 4rem; object-fit: cover; border-radius: 0.5rem;
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
}
</style>
