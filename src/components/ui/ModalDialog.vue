<script setup>
import { watch, ref, onBeforeUnmount, nextTick } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  date: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const overlayRef = ref(null)
const panelRef = ref(null)
const bodyRef = ref(null)

let ctx = null

function close() {
  emit('close')
}

function onOverlayClick(e) {
  if (e.target === overlayRef.value) close()
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.visible) close()
}

watch(() => props.visible, (show) => {
  if (show) {
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})

watch(() => props.visible, async (show) => {
  await nextTick()
  if (ctx) ctx.revert()
  if (!show) return
  ctx = gsap.context(() => {
    // Overlay fade in
    gsap.fromTo(overlayRef.value, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
    // Panel slide up + fade
    gsap.fromTo(panelRef.value,
      { y: 32, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out', delay: 0.05 }
    )
  })
})

onBeforeUnmount(() => {
  if (ctx) ctx.revert()
})

// Toggle body scroll lock
watch(() => props.visible, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="overlayRef"
      class="modal-overlay"
      @click="onOverlayClick"
    >
      <div ref="panelRef" class="modal-panel">
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <span v-if="date" class="modal-header-date">{{ date }}</span>
          <button class="modal-close-btn" @click="close" aria-label="关闭">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <!-- Body -->
        <div ref="bodyRef" class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 1.5rem;
}

.modal-panel {
  position: relative;
  width: 100%;
  max-width: 36rem;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid #eee;
  background: #fafafa;
  flex-shrink: 0;
}

.modal-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.35rem;
  font-weight: 700;
  font-style: italic;
  color: #131313;
  margin: 0;
  flex-shrink: 0;
}

.modal-header-date {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 0.9rem;
  color: #aaa;
  margin-left: auto;
  white-space: nowrap;
  flex-shrink: 0;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: #eee;
  color: #131313;
}

.modal-body {
  padding: 1.75rem;
  overflow-y: auto;
  flex: 1;
}

@media (max-width: 640px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal-panel {
    max-width: 100%;
    max-height: 85vh;
    border-radius: 1.25rem 1.25rem 0 0;
  }
}
</style>
