<script setup>
import { ref, watch } from 'vue'
import api from '../../utils/api'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  includeVideos: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'select'])

const imageList = ref([])
const videoList = ref([])
const loading = ref(false)

// Pagination
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalPages = ref(0)

const mode = ref('image')
const thumbFailed = ref(new Set())
const thumbLoaded = ref(new Set())

const getThumbUrl = (url) => {
  const sep = url.includes('?') ? '&' : '?'
  return url + sep + 'x-oss-process=image/resize,m_fill,w_96,h_96'
}

const getVideoThumbUrl = (url) => {
  const sep = url.includes('?') ? '&' : '?'
  return url + sep + 'x-oss-process=video/snapshot,t_1000,f_jpg'
}

const onVideoThumbLoad = (item) => {
  thumbLoaded.value = new Set([...thumbLoaded.value, item.id])
}

const onVideoThumbError = (e, item) => {
  e.target.style.display = 'none'
  thumbFailed.value = new Set([...thumbFailed.value, item.id])
}

const loadImages = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/images', {
      params: { page: page.value, size: pageSize.value }
    })
    if (data.data && data.data.records) {
      imageList.value = data.data.records
      total.value = data.data.total
      totalPages.value = Math.ceil(data.data.total / pageSize.value)
      if (page.value > totalPages.value && totalPages.value > 0) {
        page.value = totalPages.value
        return loadImages()
      }
    } else {
      imageList.value = data.data || []
      total.value = imageList.value.length
      totalPages.value = 1
    }
  } catch { /* no images */ }
  loading.value = false
}

const loadVideos = async () => {
  try {
    const { data } = await api.get('/videos')
    videoList.value = data.data || []
  } catch { /* ignore */ }
}

const goToPage = (p) => {
  page.value = p
  loadImages()
}

const select = (url) => {
  emit('select', url)
  close()
}

const close = () => {
  emit('update:modelValue', false)
}

const switchMode = (m) => {
  mode.value = m
  if (m === 'video' && !videoList.value.length) loadVideos()
  if (m === 'image') { page.value = 1; loadImages() }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    mode.value = 'image'
    page.value = 1
    loadImages()
    if (props.includeVideos) loadVideos()
  }
})

const formatSize = (size) => {
  if (!size && size !== 0) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}
</script>

<template>
  <div v-if="modelValue" class="picker-overlay" @click.self="close">
    <div class="picker-panel">
      <div class="picker-header">
        <div class="picker-header-left">
          <span>{{ mode === 'video' ? '选择视频' : '选择图片' }} ({{ mode === 'video' ? videoList.length : total }})</span>
          <template v-if="includeVideos">
            <button type="button" class="mode-switch" :class="{ active: mode === 'image' }" @click="switchMode('image')">图片</button>
            <button type="button" class="mode-switch" :class="{ active: mode === 'video' }" @click="switchMode('video')">视频</button>
          </template>
        </div>
        <div class="picker-header-center">
          <template v-if="mode === 'image' && totalPages > 1">
            <button type="button" class="picker-page-btn" :disabled="page <= 1" @click="goToPage(page - 1)">‹</button>
            <span class="picker-page-info">{{ page }}/{{ totalPages }}</span>
            <button type="button" class="picker-page-btn" :disabled="page >= totalPages" @click="goToPage(page + 1)">›</button>
          </template>
        </div>
        <button type="button" class="picker-close" @click="close">&times;</button>
      </div>

      <div class="picker-list">
        <!-- Image mode -->
        <template v-if="mode === 'image'">
          <div v-if="loading" class="picker-empty">加载中...</div>
          <div v-else-if="!imageList.length" class="picker-empty">暂无已上传图片</div>
          <template v-else>
            <table class="picker-table">
              <thead>
                <tr>
                  <th class="pick-col-preview">Preview</th>
                  <th class="pick-col-name">Description</th>
                  <th class="pick-col-type">Type</th>
                  <th class="pick-col-size">Size</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="img in imageList" :key="img.id" class="picker-row" @click="select(img.url)">
                  <td><img :src="getThumbUrl(img.url)" class="pick-thumb" loading="lazy" decoding="async" /></td>
                  <td class="pick-name">{{ img.description || '-' }}</td>
                  <td><span class="type-badge">{{ img.contentType?.split('/')[1]?.toUpperCase() || '-' }}</span></td>
                  <td class="pick-size">{{ formatSize(img.fileSize) }}</td>
                </tr>
              </tbody>
            </table>
          </template>
        </template>

        <!-- Video mode -->
        <template v-else>
          <div v-if="!videoList.length" class="picker-empty">暂无已上传视频</div>
          <table v-else class="picker-table">
            <thead>
              <tr>
                <th class="pick-col-preview">Preview</th>
                <th class="pick-col-name">Name</th>
                <th class="pick-col-type">Type</th>
                <th class="pick-col-size">Size</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in videoList" :key="v.id" class="picker-row" @click="select(v.url)">
                <td>
                  <img :src="getVideoThumbUrl(v.url)" class="pick-thumb" loading="lazy" decoding="async" @load="onVideoThumbLoad(v)" @error="onVideoThumbError($event, v)" />
                </td>
                <td class="pick-name">{{ v.fileName || '-' }}</td>
                <td><span class="type-badge">{{ v.contentType?.split('/')[1]?.toUpperCase() || '-' }}</span></td>
                <td class="pick-size">{{ formatSize(v.fileSize) }}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.picker-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgb(15 23 42 / 30%); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.picker-panel {
  width: min(90vw, 720px); max-height: 80vh;
  background: #fff; border-radius: 1rem;
  box-shadow: 0 12px 48px rgb(15 23 42 / 18%);
  display: flex; flex-direction: column; overflow: hidden;
}
.picker-header {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  padding: 1rem 1.25rem; border-bottom: 1px solid rgb(15 23 42 / 8%);
  font-size: 0.9rem; font-weight: 600; color: #0f172a;
}
.picker-header-left {
  display: flex; align-items: center; gap: 0.75rem;
}
.picker-header-center {
  display: flex; align-items: center; justify-content: center; gap: 2px;
}
.mode-switch {
  padding: 0.3rem 0.7rem; font-size: 0.75rem; border-radius: 0.4rem;
  border: 1px solid rgb(15 23 42 / 12%); background: transparent;
  color: #64748b; font-weight: 600; cursor: pointer; box-shadow: none;
}
.mode-switch.active {
  background: rgb(15 23 42 / 8%); color: #0f172a; border-color: rgb(15 23 42 / 20%);
}
.picker-close {
  padding: 0; width: 1.8rem; height: 1.8rem; border: none; border-radius: 50%;
  background: transparent; color: #94a3b8; font-size: 1.3rem; cursor: pointer;
  box-shadow: none; display: flex; align-items: center; justify-content: center;
  justify-self: end;
}
.picker-close:hover { color: #0f172a; background: rgb(241 245 249); transform: none; filter: none; }
.picker-list { padding: 0; max-height: 60vh; overflow-y: auto; will-change: transform; -webkit-overflow-scrolling: touch; }
.picker-overlay * { transition: none !important; }
.picker-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.picker-table thead { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
.picker-table th { padding: 0.5rem 0.75rem; text-align: left; font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; border-bottom: 1px solid rgb(15 23 42 / 8%); }
.picker-row { cursor: pointer; transition: background 0.1s; }
.picker-row:hover { background: rgb(59 130 246 / 5%); }
.picker-row td { padding: 0.45rem 0.75rem; border-bottom: 1px solid rgb(15 23 42 / 5%); }
.pick-col-preview { width: 44px; }
.pick-col-type { width: 70px; }
.pick-col-size { width: 80px; white-space: nowrap; color: #64748b; }
.pick-thumb { width: 32px; height: 32px; border-radius: 0.3rem; object-fit: cover; display: block; }
.pick-name { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #0f172a; font-weight: 500; }
.pick-size { font-size: 0.75rem; }
.picker-empty { text-align: center; padding: 2rem; color: #94a3b8; font-size: 0.85rem; }
.picker-page-btn {
  padding: 0; width: 1.5rem; height: 1.5rem; border-radius: 50%;
  border: 1px solid rgb(15 23 42 / 10%); background: rgb(248 250 252);
  color: #475569; font-size: 0.8rem; font-weight: 600; line-height: 1;
  cursor: pointer; box-shadow: none; display: inline-flex; align-items: center; justify-content: center;
}
.picker-page-btn:hover:not(:disabled) { background: rgb(15 23 42 / 6%); transform: none; filter: none; }
.picker-page-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; filter: none; }
.picker-page-info { font-size: 0.72rem; color: #64748b; font-weight: 500; margin: 0 0.25rem; min-width: 2.5em; text-align: center; }
</style>
