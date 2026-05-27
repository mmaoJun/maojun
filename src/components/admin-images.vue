<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../utils/api'
import { getUsername } from '../utils/auth'
import AdminNavBar from './ui/AdminNavBar.vue'
import { useFileUpload, formatBytes } from '../composables/useFileUpload'

const activeTab = ref('images')
const loading = ref(false)
const images = ref([])
const videos = ref([])
const videoUploading = ref(false)
const videoFile = ref(null)
const videoDesc = ref('')
const feedback = ref('')
const feedbackType = ref('success')
const username = computed(() => getUsername())

// Pagination
const imagePage = ref(1)
const imagePageSize = ref(20)
const imageTotal = ref(0)
const imageTotalPages = ref(0)

const MAX_SIZE = 10 * 1024 * 1024

const {
  files: uploadFiles,
  isDragging,
  errors,
  inputRef,
  removeFile,
  clearFiles,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileChange,
  openFileDialog,
} = useFileUpload({
  maxFiles: 10,
  maxSize: MAX_SIZE,
  accept: 'image/*',
  multiple: true,
})

const loadImages = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/images', {
      params: { page: imagePage.value, size: imagePageSize.value }
    })
    if (data.data && data.data.records) {
      images.value = data.data.records
      imageTotal.value = data.data.total
      imageTotalPages.value = Math.ceil(data.data.total / imagePageSize.value)
      if (imagePage.value > imageTotalPages.value && imageTotalPages.value > 0) {
        imagePage.value = imageTotalPages.value
        return loadImages()
      }
    } else {
      images.value = data.data || []
      imageTotal.value = images.value.length
      imageTotalPages.value = 1
    }
  } catch (error) {
    showMessage(error.response?.data?.message || '加载图片列表失败', 'error')
  } finally {
    loading.value = false
  }
}

const goToImagePage = (p) => {
  imagePage.value = p
  loadImages()
}

let feedbackTimer = null
const showMessage = (message, type = 'success') => {
  clearTimeout(feedbackTimer)
  feedback.value = message
  feedbackType.value = type
  feedbackTimer = setTimeout(() => {
    feedback.value = ''
  }, 3000)
}

const uploadingCount = ref(0)
const uploadProgress = ref({})
const descriptions = ref({})

const uploadAll = async () => {
  if (!uploadFiles.value.length) {
    showMessage('请先选择图片文件', 'error')
    return
  }

  const pending = uploadFiles.value.filter((f) => f.file instanceof File)
  if (!pending.length) {
    showMessage('没有需要上传的新文件', 'error')
    return
  }

  uploadingCount.value = pending.length
  let success = 0
  let failed = 0

  for (const item of pending) {
    const formData = new FormData()
    formData.append('file', item.file)
    uploadProgress.value[item.id] = 0

    const desc = descriptions.value[item.id] || ''
    const url = desc ? `/images/upload?description=${encodeURIComponent(desc)}` : '/images/upload'

    try {
      await api.post(url, formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            uploadProgress.value[item.id] = Math.round((e.loaded / e.total) * 100)
          }
        },
      })
      uploadProgress.value[item.id] = 100
      success++
    } catch (error) {
      uploadProgress.value[item.id] = -1
      failed++
    }
  }

  if (failed === 0) {
    showMessage(`全部 ${success} 个文件上传成功`)
  } else {
    showMessage(`${success} 个成功, ${failed} 个失败`, 'error')
  }

  clearFiles()
  descriptions.value = {}
  uploadProgress.value = {}
  uploadingCount.value = 0
  imagePage.value = 1
  await loadImages()
}

const uploading = computed(() => uploadingCount.value > 0)

const downloadImage = async (id, fileName) => {
  try {
    const { data } = await api.get(`/images/${id}/download`)
    const link = document.createElement('a')
    link.href = data.data
    link.download = fileName || 'image'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    showMessage(error.response?.data?.message || '下载链接生成失败', 'error')
  }
}

const editingDescId = ref(null)
const editingDescValue = ref('')

const startEditDesc = (item) => {
  editingDescId.value = item.id
  editingDescValue.value = item.description || ''
}

const saveDesc = async (id) => {
  try {
    await api.patch(`/images/${id}/description`, { description: editingDescValue.value })
    const item = images.value.find(i => i.id === id)
    if (item) item.description = editingDescValue.value
    editingDescId.value = null
    showMessage('描述已更新')
  } catch (error) {
    showMessage(error.response?.data?.message || '更新失败', 'error')
  }
}

const cancelEditDesc = () => {
  editingDescId.value = null
}

// Batch selection - images
const selectedImageIds = ref(new Set())
const batchDeleting = ref(false)

const isAllImageSelected = computed(() => {
  return images.value.length > 0 && images.value.every(item => selectedImageIds.value.has(item.id))
})

const toggleImageSelect = (id) => {
  const next = new Set(selectedImageIds.value)
  if (next.has(id)) { next.delete(id) } else { next.add(id) }
  selectedImageIds.value = next
}

const toggleSelectAllImages = () => {
  if (isAllImageSelected.value) {
    selectedImageIds.value = new Set()
  } else {
    selectedImageIds.value = new Set(images.value.map(item => item.id))
  }
}

const batchDeleteImages = async () => {
  const count = selectedImageIds.value.size
  if (!count) return
  if (!confirm(`确定要删除选中的 ${count} 张图片吗？此操作不可恢复。`)) return
  batchDeleting.value = true
  const ids = [...selectedImageIds.value]
  let success = 0
  let failed = 0
  for (const id of ids) {
    try {
      await api.delete(`/images/${id}`)
      success++
    } catch { failed++ }
  }
  batchDeleting.value = false
  selectedImageIds.value = new Set()
  if (failed === 0) {
    showMessage(`已成功删除 ${success} 张图片`)
  } else {
    showMessage(`${success} 张成功, ${failed} 张失败`, 'error')
  }
  await loadImages()
}

const deleteImage = async (id) => {
  if (!confirm('确定要删除这张图片吗？此操作不可恢复。')) return
  try {
    await api.delete(`/images/${id}`)
    showMessage('图片已删除')
    await loadImages()
  } catch (error) {
    showMessage(error.response?.data?.message || '删除失败', 'error')
  }
}

const formatSizeDisplay = (size) => {
  if (!size && size !== 0) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getContentTypeLabel = (contentType) => {
  if (!contentType) return '-'
  if (contentType.startsWith('image/')) {
    const sub = contentType.split('/')[1]
    return sub ? sub.toUpperCase() : 'Image'
  }
  if (contentType.startsWith('video/')) {
    const sub = contentType.split('/')[1]
    return sub ? sub.toUpperCase() : 'Video'
  }
  if (contentType.includes('pdf')) return 'PDF'
  if (contentType.includes('word') || contentType.includes('doc')) return 'Word'
  if (contentType.includes('excel') || contentType.includes('sheet')) return 'Excel'
  if (contentType.includes('zip') || contentType.includes('rar')) return 'Archive'
  return contentType
}

// --- Video ---
const loadVideos = async () => {
  try {
    const { data } = await api.get('/videos')
    videos.value = data.data || []
  } catch { /* ignore */ }
}

const videoInputRef = ref(null)
const videoDragging = ref(false)
const videoThumbFailed = ref(new Set())
const videoThumbLoaded = ref(new Set())

const getVideoThumbUrl = (url) => {
  const sep = url.includes('?') ? '&' : '?'
  return url + sep + 'x-oss-process=video/snapshot,t_1000,f_jpg'
}

const onVideoThumbLoad = (item) => {
  videoThumbLoaded.value = new Set([...videoThumbLoaded.value, item.id])
}

const onVideoThumbError = (e, item) => {
  e.target.style.display = 'none'
  videoThumbFailed.value = new Set([...videoThumbFailed.value, item.id])
}

const openVideoDialog = () => { videoInputRef.value?.click() }
const onVideoFileChange = (event) => { videoFile.value = event.target.files?.[0] || null }

const onVideoDragEnter = (e) => { e.preventDefault(); videoDragging.value = true }
const onVideoDragLeave = (e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget)) videoDragging.value = false }
const onVideoDragOver = (e) => { e.preventDefault() }
const onVideoDrop = (e) => {
  e.preventDefault()
  videoDragging.value = false
  if (e.dataTransfer.files?.length) videoFile.value = e.dataTransfer.files[0]
}

const uploadVideo = async () => {
  if (!videoFile.value) {
    showMessage('请先选择视频文件', 'error')
    return
  }
  videoUploading.value = true
  const formData = new FormData()
  formData.append('file', videoFile.value)
  const url = videoDesc.value ? `/videos/upload?description=${encodeURIComponent(videoDesc.value)}` : '/videos/upload'
  try {
    await api.post(url, formData)
    showMessage('视频上传成功')
    videoFile.value = null
    videoDesc.value = ''
    if (videoInputRef.value) videoInputRef.value.value = ''
    await loadVideos()
  } catch (error) {
    showMessage(error.response?.data?.message || '视频上传失败', 'error')
  } finally {
    videoUploading.value = false
  }
}

const deleteVideo = async (id) => {
  if (!confirm('确定要删除此视频吗？此操作不可恢复。')) return
  try {
    await api.delete(`/videos/${id}`)
    showMessage('视频已删除')
    await loadVideos()
  } catch (error) {
    showMessage(error.response?.data?.message || '删除失败', 'error')
  }
}

const downloadVideo = async (id, fileName) => {
  try {
    const { data } = await api.get(`/videos/${id}/download`)
    const link = document.createElement('a')
    link.href = data.data
    link.download = fileName || 'video'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    showMessage(error.response?.data?.message || '下载链接生成失败', 'error')
  }
}

const editingVideoDescId = ref(null)
const editingVideoDescValue = ref('')

const startEditVideoDesc = (item) => {
  editingVideoDescId.value = item.id
  editingVideoDescValue.value = item.description || ''
}

const saveVideoDesc = async (id) => {
  try {
    await api.patch(`/videos/${id}/description`, { description: editingVideoDescValue.value })
    const item = videos.value.find(v => v.id === id)
    if (item) item.description = editingVideoDescValue.value
    editingVideoDescId.value = null
    showMessage('描述已更新')
  } catch (error) {
    showMessage(error.response?.data?.message || '更新失败', 'error')
  }
}

const cancelEditVideoDesc = () => { editingVideoDescId.value = null }

// Batch selection - videos
const selectedVideoIds = ref(new Set())
const videoBatchDeleting = ref(false)

const isAllVideoSelected = computed(() => {
  return videos.value.length > 0 && videos.value.every(item => selectedVideoIds.value.has(item.id))
})

const toggleVideoSelect = (id) => {
  const next = new Set(selectedVideoIds.value)
  if (next.has(id)) { next.delete(id) } else { next.add(id) }
  selectedVideoIds.value = next
}

const toggleSelectAllVideos = () => {
  if (isAllVideoSelected.value) {
    selectedVideoIds.value = new Set()
  } else {
    selectedVideoIds.value = new Set(videos.value.map(item => item.id))
  }
}

const batchDeleteVideos = async () => {
  const count = selectedVideoIds.value.size
  if (!count) return
  if (!confirm(`确定要删除选中的 ${count} 个视频吗？此操作不可恢复。`)) return
  videoBatchDeleting.value = true
  const ids = [...selectedVideoIds.value]
  let success = 0
  let failed = 0
  for (const id of ids) {
    try {
      await api.delete(`/videos/${id}`)
      success++
    } catch { failed++ }
  }
  videoBatchDeleting.value = false
  selectedVideoIds.value = new Set()
  if (failed === 0) {
    showMessage(`已成功删除 ${success} 个视频`)
  } else {
    showMessage(`${success} 个成功, ${failed} 个失败`, 'error')
  }
  await loadVideos()
}

onMounted(() => { loadImages(); loadVideos() })
</script>

<template>
  <section class="admin-page">
    <AdminNavBar />
    <header class="admin-header">
      <div>
        <div class="tab-bar">
          <button type="button" class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'images' }" @click="activeTab = 'images'">Images</button>
          <button type="button" class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'videos' }" @click="activeTab = 'videos'">Videos</button>
        </div>
      </div>
      <p v-if="feedback" class="page-feedback" :class="`page-feedback--${feedbackType}`">{{ feedback }}</p>
    </header>

    <div v-show="activeTab === 'images'">
    <section class="panel upload-panel">
      <div>
        <h2>上传图片</h2>
        <p>支持拖拽或点击选择，单文件最大 {{ formatBytes(MAX_SIZE) }}，最多 10 个文件。</p>
      </div>

      <!-- Drop Zone -->
      <div
        class="drop-zone"
        :class="{ 'drop-zone--active': isDragging }"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @click="openFileDialog"
      >
        <input
          ref="inputRef"
          type="file"
          accept="image/*"
          multiple
          class="drop-zone__input"
          @change="handleFileChange"
        />
        <div class="drop-zone__content">
          <svg class="drop-zone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
          </svg>
          <p class="drop-zone__title">拖拽文件到此处，或<span class="drop-zone__link">点击浏览</span></p>
          <p class="drop-zone__hint">支持图片格式，单文件最大 {{ formatBytes(MAX_SIZE) }}</p>
        </div>
      </div>

      <!-- Preview Queue -->
      <div v-if="uploadFiles.length" class="upload-queue">
        <div class="upload-queue__header">
          <span>待上传 ({{ uploadFiles.length }})</span>
          <button type="button" class="clear-files-btn" @click="clearFiles" :disabled="uploading">清空</button>
        </div>
        <div class="upload-queue__list">
          <div
            v-for="item in uploadFiles"
            :key="item.id"
            class="upload-queue__item"
            :class="{
              'upload-queue__item--uploading': uploadProgress[item.id] > 0 && uploadProgress[item.id] < 100,
              'upload-queue__item--error': uploadProgress[item.id] === -1,
              'upload-queue__item--done': uploadProgress[item.id] === 100,
            }"
          >
            <img v-if="item.preview" :src="item.preview" class="upload-queue__thumb" />
            <div v-else class="upload-queue__thumb upload-queue__thumb--placeholder" />
            <div class="upload-queue__info">
              <p class="upload-queue__name">{{ item.file.name }}</p>
              <p class="upload-queue__size">{{ formatSizeDisplay(item.file.size) }}</p>
              <input v-if="!uploading" v-model="descriptions[item.id]" class="upload-queue__desc" placeholder="图片描述（选填）" />
            </div>
            <div class="upload-queue__progress">
              <template v-if="uploadProgress[item.id] === -1">
                <span class="upload-queue__status-text upload-queue__status-text--error">失败</span>
              </template>
              <template v-else-if="uploadProgress[item.id] === 100">
                <span class="upload-queue__status-text upload-queue__status-text--done">完成</span>
              </template>
              <template v-else-if="uploadProgress[item.id] > 0">
                <div class="upload-queue__bar">
                  <div class="upload-queue__bar-fill" :style="{ width: uploadProgress[item.id] + '%' }" />
                </div>
                <span class="upload-queue__pct">{{ uploadProgress[item.id] }}%</span>
              </template>
            </div>
            <button
              v-if="!uploading"
              type="button"
              class="upload-queue__remove"
              @click="removeFile(item.id)"
              title="移除"
            >
              &times;
            </button>
          </div>
        </div>
        <button type="button" class="upload-btn" @click="uploadAll" :disabled="uploading">
          {{ uploading ? `上传中 (${uploadingCount})...` : `上传 ${uploadFiles.length} 个文件` }}
        </button>
      </div>

      <!-- Errors -->
      <div v-if="errors.length" class="upload-errors">
        <p v-for="(err, i) in errors" :key="i">{{ err }}</p>
      </div>

    </section>

    <section class="panel list-panel list-panel--flush">
      <div v-if="loading" class="empty-state">正在加载图片列表...</div>
      <div v-else-if="!images.length" class="empty-state">暂无图片记录，先上传第一张图片吧。</div>
      <div v-else class="image-table-wrapper">
        <div v-if="selectedImageIds.size" class="batch-bar">
          <span class="batch-bar__info">已选 <strong>{{ selectedImageIds.size }}</strong> 张图片</span>
          <div class="batch-bar__actions">
            <button type="button" class="batch-bar__cancel-btn" @click="selectedImageIds = new Set()">取消选中</button>
            <button type="button" class="batch-bar__delete-btn" :disabled="batchDeleting" @click="batchDeleteImages">
              {{ batchDeleting ? '删除中...' : `删除选中` }}
            </button>
          </div>
        </div>
        <table class="image-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" :checked="isAllImageSelected" @change="toggleSelectAllImages" title="全选" /></th>
              <th class="col-index">#</th>
              <th class="col-preview">Preview</th>
              <th class="col-name">Name</th>
              <th class="col-type">Type</th>
              <th class="col-size">Size</th>
              <th class="col-date">Upload Date</th>
              <th class="col-desc">Description</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in images" :key="item.id" :class="{ 'row--selected': selectedImageIds.has(item.id) }">
              <td class="col-check"><input type="checkbox" :checked="selectedImageIds.has(item.id)" @change="toggleImageSelect(item.id)" /></td>
              <td class="col-index">{{ index + 1 }}</td>
              <td class="col-preview">
                <img :src="item.url" :alt="item.fileName || item.ossObjectKey" class="table-thumb" />
              </td>
              <td class="col-name">
                <span class="table-filename" :title="item.url">
                  {{ item.ossObjectKey }}
                </span>
              </td>
              <td class="col-type">
                <span class="type-badge">{{ getContentTypeLabel(item.contentType) }}</span>
              </td>
              <td class="col-size">{{ formatSizeDisplay(item.fileSize) }}</td>
              <td class="col-date">{{ formatTime(item.createdAt) }}</td>
              <td class="col-desc">
                <template v-if="editingDescId === item.id">
                  <div class="desc-edit-row">
                    <input v-model="editingDescValue" class="desc-edit-input" @keyup.enter="saveDesc(item.id)" @keyup.escape="cancelEditDesc" />
                    <button type="button" class="table-icon-btn" @click="saveDesc(item.id)" title="保存">&#10003;</button>
                    <button type="button" class="table-icon-btn" @click="cancelEditDesc" title="取消">&times;</button>
                  </div>
                </template>
                <template v-else>
                  {{ item.description || '-' }}
                </template>
              </td>
              <td class="col-actions">
                <button type="button" class="table-icon-btn" @click="startEditDesc(item)" title="编辑描述">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button type="button" class="table-icon-btn" @click="downloadImage(item.id, item.fileName)" title="下载">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                </button>
                <button type="button" class="table-icon-btn table-icon-btn--danger" @click="deleteImage(item.id)" title="删除">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="imageTotalPages > 1" class="pagination">
          <button type="button" class="page-btn" :disabled="imagePage <= 1" @click="goToImagePage(imagePage - 1)">上一页</button>
          <span class="page-info">{{ imagePage }} / {{ imageTotalPages }} (共 {{ imageTotal }} 张)</span>
          <button type="button" class="page-btn" :disabled="imagePage >= imageTotalPages" @click="goToImagePage(imagePage + 1)">下一页</button>
        </div>
      </div>
    </section>
    </div>

    <!-- Videos -->
    <div v-show="activeTab === 'videos'">
      <section class="panel upload-panel">
        <div>
          <h2>上传视频</h2>
          <p>选择视频文件上传到 OSS，视频将存放在 videos 文件夹。</p>
        </div>
        <div class="upload-row">
          <div class="drop-zone drop-zone--small" :class="{ 'drop-zone--active': videoDragging }" @click="openVideoDialog" @dragenter="onVideoDragEnter" @dragleave="onVideoDragLeave" @dragover="onVideoDragOver" @drop="onVideoDrop">
            <input ref="videoInputRef" type="file" accept="video/*" @change="onVideoFileChange" class="drop-zone__input" />
            <div class="drop-zone__content">
              <svg class="drop-zone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
              <p class="drop-zone__title" v-if="!videoFile">拖拽或<span class="drop-zone__link">点击选择</span>视频</p>
              <p class="drop-zone__title" v-else>{{ videoFile.name }}</p>
            </div>
          </div>
          <input v-model="videoDesc" class="desc-input" placeholder="视频描述（选填）" />
          <button type="button" @click="uploadVideo" :disabled="videoUploading || !videoFile">
            {{ videoUploading ? '上传中...' : '上传视频' }}
          </button>
        </div>
      </section>

      <section class="panel list-panel list-panel--flush">
        <div v-if="!videos.length" class="empty-state">暂无视频记录</div>
        <div v-else class="image-table-wrapper">
          <div v-if="selectedVideoIds.size" class="batch-bar">
            <span class="batch-bar__info">已选 <strong>{{ selectedVideoIds.size }}</strong> 个视频</span>
            <div class="batch-bar__actions">
              <button type="button" class="batch-bar__cancel-btn" @click="selectedVideoIds = new Set()">取消选中</button>
              <button type="button" class="batch-bar__delete-btn" :disabled="videoBatchDeleting" @click="batchDeleteVideos">
                {{ videoBatchDeleting ? '删除中...' : `删除选中` }}
              </button>
            </div>
          </div>
          <table class="image-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" :checked="isAllVideoSelected" @change="toggleSelectAllVideos" title="全选" /></th>
                <th class="col-index">#</th>
                <th class="col-preview">Preview</th>
                <th class="col-name">Name</th>
                <th class="col-type">Type</th>
                <th class="col-size">Size</th>
                <th class="col-date">Upload Date</th>
                <th class="col-desc">Description</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in videos" :key="item.id" :class="{ 'row--selected': selectedVideoIds.has(item.id) }">
                <td class="col-check"><input type="checkbox" :checked="selectedVideoIds.has(item.id)" @change="toggleVideoSelect(item.id)" /></td>
                <td class="col-index">{{ index + 1 }}</td>
                <td class="col-preview">
                  <img :src="getVideoThumbUrl(item.url)" class="table-thumb" @load="onVideoThumbLoad(item)" @error="onVideoThumbError($event, item)" />
                  <div class="video-thumb" v-if="!videoThumbLoaded.has(item.id)">
                    <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                  </div>
                </td>
                <td class="col-name"><span class="table-filename" :title="item.url">{{ item.fileName }}</span></td>
                <td class="col-type"><span class="type-badge">{{ getContentTypeLabel(item.contentType) }}</span></td>
                <td class="col-size">{{ formatSizeDisplay(item.fileSize) }}</td>
                <td class="col-date">{{ formatTime(item.createdAt) }}</td>
                <td class="col-desc">
                  <template v-if="editingVideoDescId === item.id">
                    <div class="desc-edit-row">
                      <input v-model="editingVideoDescValue" class="desc-edit-input" @keyup.enter="saveVideoDesc(item.id)" @keyup.escape="cancelEditVideoDesc" />
                      <button type="button" class="table-icon-btn" @click="saveVideoDesc(item.id)" title="保存">&#10003;</button>
                      <button type="button" class="table-icon-btn" @click="cancelEditVideoDesc" title="取消">&times;</button>
                    </div>
                  </template>
                  <template v-else>{{ item.description || '-' }}</template>
                </td>
                <td class="col-actions">
                  <button type="button" class="table-icon-btn" @click="startEditVideoDesc(item)" title="编辑描述">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button type="button" class="table-icon-btn" @click="downloadVideo(item.id, item.fileName)" title="下载">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                  </button>
                  <button type="button" class="table-icon-btn table-icon-btn--danger" @click="deleteVideo(item.id)" title="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(148, 163, 184, 0.1), transparent 28%),
    radial-gradient(circle at right, rgba(203, 213, 225, 0.12), transparent 32%),
    #fcfcfb;
  color: #0f172a;
}

.admin-header,
.panel {
  width: min(1200px, 100%);
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.tab-bar { display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.75rem; }
.tab-btn { padding: 0.65rem 1.5rem; font-size: 0.95rem; border-radius: 0.5rem; border: 1px solid rgb(15 23 42 / 10%); background: transparent; color: #64748b; font-weight: 600; cursor: pointer; box-shadow: none; }
.tab-btn:hover { background: rgb(241 245 249 / 60%); color: #0f172a; transform: none; filter: none; }
.tab-btn--active { background: rgb(255 255 255 / 90%); color: #0f172a; border-color: rgb(15 23 42 / 16%); }
.upload-row { display: flex; align-items: center; justify-content: center; gap: 0.6rem; flex-wrap: wrap; }
.desc-input { padding: 0.4rem 0.65rem; border-radius: 0.5rem; border: 1px solid rgb(15 23 42 / 12%); background: rgb(248 250 252 / 90%); color: #0f172a; font-size: 0.82rem; outline: none; width: 200px; flex-shrink: 0; }
.desc-input:focus { border-color: rgb(59 130 246 / 50%); }

h1, h2, h3 {
  margin: 0;
}

.admin-user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.panel {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgb(15 23 42 / 10%);
  background: rgb(255 255 255 / 78%);
  backdrop-filter: blur(18px);
  box-shadow: 0 2px 10px rgb(15 23 42 / 6%);
}

/* ---- Buttons ---- */
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
  box-shadow:
    0 2px 10px rgb(15 23 42 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 90%);
  transition: transform 0.3s ease, filter 0.2s ease;
}

button:hover {
  transform: scale(1.04);
  filter: brightness(1.08);
}

button:active {
  transform: scale(0.98);
  filter: brightness(0.95);
}

button:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
  filter: none;
}

.upload-btn {
  margin-top: 0.75rem;
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
}

.clear-files-btn {
  padding: 0.68rem 1.3rem;
  border: 1px solid rgb(239 68 68 / 30%);
  border-radius: 12px;
  background: transparent;
  color: #ef4444;
  font-weight: 700;
  font-size: 0.84rem;
  cursor: pointer;
  transition: background 0.2s;
}
.clear-files-btn:hover { background: rgb(239 68 68 / 8%); }
.clear-files-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ---- Drop Zone ---- */
.drop-zone {
  margin-top: 1rem;
  padding: 2.5rem 1.5rem;
  border: 2px dashed rgb(15 23 42 / 14%);
  border-radius: 1rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.drop-zone:hover {
  border-color: rgb(15 23 42 / 25%);
  background: rgb(15 23 42 / 2%);
}

.drop-zone--small { padding: 1rem; flex: 1; }
.drop-zone--active {
  border-color: rgb(59 130 246 / 60%);
  background: rgb(59 130 246 / 5%);
}

.drop-zone__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.drop-zone__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
}

.drop-zone__icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #64748b;
}

.drop-zone__title {
  margin: 0;
  font-size: 0.95rem;
  color: #334155;
}

.drop-zone__link {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.drop-zone__hint {
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

/* ---- Upload Queue ---- */
.upload-queue {
  margin-top: 1rem;
  border: 1px solid rgb(15 23 42 / 10%);
  border-radius: 0.85rem;
  overflow: hidden;
}

.upload-queue__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  background: rgb(248 250 252 / 80%);
  border-bottom: 1px solid rgb(15 23 42 / 8%);
}

.upload-queue__list {
  display: grid;
  gap: 0;
}

.upload-queue__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid rgb(15 23 42 / 6%);
  transition: background 0.2s ease;
}

.upload-queue__item:last-child {
  border-bottom: none;
}

.upload-queue__item--uploading {
  background: rgb(59 130 246 / 3%);
}

.upload-queue__item--error {
  background: rgb(239 68 68 / 4%);
}

.upload-queue__item--done {
  background: rgb(34 197 94 / 4%);
}

.upload-queue__thumb {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  object-fit: cover;
  flex-shrink: 0;
  background: #f1f5f9;
}

.upload-queue__thumb--placeholder {
  background: #e2e8f0;
}

.upload-queue__info {
  flex: 1;
  min-width: 0;
}

.upload-queue__name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-queue__size {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: #94a3b8;
}

.upload-queue__desc {
  margin: 0.35rem 0 0;
  padding: 0.35rem 0.5rem;
  width: 100%;
  font-size: 0.75rem;
  border-radius: 0.4rem;
  border: 1px solid rgb(15 23 42 / 10%);
  background: rgb(248 250 252);
  color: #334155;
  outline: none;
}
.upload-queue__desc:focus {
  border-color: rgb(59 130 246 / 50%);
}

.upload-queue__progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
  justify-content: flex-end;
}

.upload-queue__bar {
  width: 60px;
  height: 4px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.upload-queue__bar-fill {
  height: 100%;
  border-radius: 999px;
  background: #2563eb;
  transition: width 0.4s ease;
}

.upload-queue__pct {
  font-size: 0.75rem;
  color: #64748b;
  min-width: 2.5em;
  text-align: right;
}

.upload-queue__status-text {
  font-size: 0.78rem;
  font-weight: 600;
}

.upload-queue__status-text--done {
  color: #16a34a;
}

.upload-queue__status-text--error {
  color: #ef4444;
}

.upload-queue__remove {
  padding: 0;
  width: 1.6rem;
  height: 1.6rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #94a3b8;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.upload-queue__remove:hover {
  color: #ef4444;
  background: rgb(239 68 68 / 8%);
  transform: none;
  filter: none;
}

/* ---- Errors ---- */
.upload-errors {
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: rgb(239 68 68 / 6%);
  border: 1px solid rgb(239 68 68 / 15%);
}

.upload-errors p {
  margin: 0;
  font-size: 0.82rem;
  color: #ef4444;
  line-height: 1.6;
}

/* ---- Page Feedback ---- */
.page-feedback {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 100;
  background: rgb(255 255 255 / 92%);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgb(15 23 42 / 10%);
}

.page-feedback--success {
  color: #16a34a;
}

.page-feedback--error {
  color: #ef4444;
}

.panel-heading {
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
  justify-content: space-between; margin-bottom: 1rem;
}
.list-panel--flush {
  padding: 0;
}

/* ---- Empty State ---- */
.empty-state {
  padding: 3rem 0;
  color: #94a3b8;
  text-align: center;
  font-size: 0.9rem;
}

/* ---- Image Table ---- */
.image-table-wrapper {
  overflow-x: auto;
  border-radius: 1.5rem;
  overflow: hidden;
}

.image-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.image-table thead {
  background: rgb(248 250 252 / 80%);
  border-bottom: 1px solid rgb(15 23 42 / 10%);
}

.image-table th {
  padding: 0.5rem 1.75rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.image-table td {
  padding: 0.5rem 1.75rem;
  vertical-align: middle;
  border-bottom: 1px solid rgb(15 23 42 / 6%);
  color: #334155;
}

.image-table tbody tr:last-child td {
  border-bottom: none;
}

.image-table tbody tr:hover {
  background: rgb(248 250 252 / 50%);
}

.col-index {
  width: 40px;
  color: #94a3b8;
  text-align: center;
}

.col-preview {
  width: 56px;
}

.col-name {
  min-width: 120px;
}

.col-type {
  width: 80px;
}

.col-size {
  width: 90px;
  white-space: nowrap;
}

.col-date {
  width: 170px;
  white-space: nowrap;
}

.col-desc {
  max-width: 200px;
}

.col-actions {
  width: 120px;
  text-align: left;
  white-space: nowrap;
}

.col-check {
  width: 36px;
  text-align: center;
}

.col-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #2563eb;
}

.row--selected {
  background: rgb(59 130 246 / 4%);
}

/* ---- Batch Action Bar ---- */
.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.75rem;
  background: rgb(239 68 68 / 6%);
  border-bottom: 1px solid rgb(239 68 68 / 12%);
}

.batch-bar__info {
  font-size: 0.82rem;
  color: #dc2626;
}

.batch-bar__info strong {
  font-weight: 700;
}

.batch-bar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.batch-bar__cancel-btn {
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgb(15 23 42 / 15%);
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  box-shadow: none;
  transition: background 0.2s;
}

.batch-bar__cancel-btn:hover {
  background: rgb(15 23 42 / 6%);
  color: #0f172a;
  transform: none;
  filter: none;
}

.batch-bar__delete-btn {
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid rgb(239 68 68 / 30%);
  border-radius: 8px;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  box-shadow: none;
  transition: background 0.2s;
}

.batch-bar__delete-btn:hover {
  background: rgb(239 68 68 / 10%);
  transform: none;
  filter: none;
}

.batch-bar__delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.desc-edit-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.desc-edit-input {
  width: 140px;
  padding: 0.3rem 0.5rem;
  font-size: 0.8rem;
  border-radius: 0.35rem;
  border: 1px solid rgb(59 130 246 / 50%);
  background: #fff;
  color: #0f172a;
  outline: none;
}

.table-thumb {
  width: 40px;
  height: 40px;
  border-radius: 0.4rem;
  object-fit: cover;
  display: block;
  background: #f1f5f9;
  border: 1px solid rgb(15 23 42 / 6%);
}

.table-filename {
  display: block;
  word-break: break-all;
  font-weight: 500;
  color: #0f172a;
}

.type-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
  background: rgb(148 163 184 / 12%);
  white-space: nowrap;
}

.table-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  box-shadow: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.table-icon-btn svg {
  width: 1rem;
  height: 1rem;
}

.table-icon-btn:hover {
  color: #0f172a;
  transform: none;
  filter: none;
}

.table-icon-btn--danger:hover {
  color: #ef4444;
}

.col-preview { position: relative; }
.video-thumb {
  position: absolute; left: 0; top: 0;
  width: 40px; height: 40px; border-radius: 0.4rem;
  background: #0f172a; display: flex; align-items: center; justify-content: center;
  z-index: 0;
}
.video-thumb svg { width: 18px; height: 18px; color: #fff; }
.col-preview .table-thumb { position: relative; z-index: 1; }

@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .admin-header {
    flex-direction: column;
  }

  .upload-queue__item {
    flex-wrap: wrap;
  }

  .col-date,
  .col-size,
  .col-desc {
    display: none;
  }

  .image-table th,
  .image-table td {
    padding: 0.55rem 0.5rem;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgb(15 23 42 / 8%);
  background: rgb(248 250 252 / 50%);
}

.page-btn {
  padding: 0.5rem 1rem;
  font-size: 0.82rem;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 500;
}
</style>
