<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { homePageConfig } from '../../config/siteContent'

const router = useRouter()

const props = defineProps({
  title: {
    type: String,
    default: 'maoJun',
  },
  subtitle: {
    type: String,
    default: '',
  },
  buttonLabel: {
    type: String,
    default: 'about',
  },
  minHeight: {
    type: String,
    default: '100svh',
  },
  sensitivity: {
    type: Number,
    default: -1,
  },
  easingFactor: {
    type: Number,
    default: 0.05,
  },
})

const imageItems = homePageConfig.parallaxFloatingGallery.images

const sectionRef = ref(null)
const elements = ref([])
const mouse = { x: 0, y: 0 }
let frameId = 0
let cleanupMouse = null
let hasAnimatedIn = false

const sectionStyle = computed(() => ({ minHeight: props.minHeight }))

const handleButtonClick = () => {
  router.push(homePageConfig.parallaxFloatingGallery.route)
}

const setElementRef = (el, index) => {
  if (el) {
    elements.value[index] = el
  }
}

const animate = () => {
  const sensitivity = props.sensitivity / 20

  elements.value.forEach((el, index) => {
    if (!el) return

    const depth = Number(imageItems[index]?.depth || 1)
    const strength = depth * sensitivity
    const targetX = mouse.x * strength
    const targetY = mouse.y * strength

    const currentX = Number(el.dataset.x || 0)
    const currentY = Number(el.dataset.y || 0)
    const nextX = currentX + (targetX - currentX) * props.easingFactor
    const nextY = currentY + (targetY - currentY) * props.easingFactor

    el.dataset.x = String(nextX)
    el.dataset.y = String(nextY)
    el.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`
  })

  frameId = window.requestAnimationFrame(animate)
}

const updatePointer = (clientX, clientY) => {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  mouse.x = clientX - rect.left - rect.width / 2
  mouse.y = clientY - rect.top - rect.height / 2
}

const revealImages = () => {
  if (hasAnimatedIn) return
  hasAnimatedIn = true

  elements.value.forEach((el, index) => {
    if (!el) return
    const delay = index * 90
    window.setTimeout(() => {
      el.classList.add('is-visible')
    }, delay)
  })
}

onMounted(() => {
  const handleMouseMove = (event) => updatePointer(event.clientX, event.clientY)
  const handleTouchMove = (event) => {
    const touch = event.touches[0]
    if (!touch) return
    updatePointer(touch.clientX, touch.clientY)
  }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('touchmove', handleTouchMove, { passive: true })
  cleanupMouse = () => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('touchmove', handleTouchMove)
  }

  revealImages()
  frameId = window.requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  if (frameId) {
    window.cancelAnimationFrame(frameId)
  }
  cleanupMouse?.()
})
</script>

<template>
  <section ref="sectionRef" class="parallax-floating-section" :style="sectionStyle">
    <div class="parallax-floating-center">
      <p class="parallax-floating-title">{{ title }}</p>
      <p v-if="subtitle" class="parallax-floating-subtitle">{{ subtitle }}</p>
      <button type="button" class="parallax-floating-button" @click="handleButtonClick">{{ buttonLabel }}</button>
    </div>

    <div class="parallax-floating-layer" aria-hidden="true">
      <figure
        v-for="(item, index) in imageItems"
        :key="`${item.title}-${index}`"
        :ref="(el) => setElementRef(el, index)"
        class="floating-card"
        :style="{
          top: item.top,
          left: item.left,
          width: item.width,
          height: item.height,
        }"
      >
        <img :src="item.url" :alt="item.title" loading="lazy" />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.parallax-floating-section {
  position: relative;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000000;
  isolation: isolate;
}

.parallax-floating-section::before {
  content: none;
  display: none;
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(180deg, rgb(255 255 255 / 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.05) 1px, transparent 1px);
  background-size: 22px 22px, 22px 22px;
  opacity: 0.72;
  pointer-events: none;
}

.parallax-floating-center {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}

.parallax-floating-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3.2rem, 8vw, 7rem);
  font-style: italic;
  line-height: 0.9;
  color: #ffffff;
  letter-spacing: -0.04em;
  text-shadow: none;
}

.parallax-floating-subtitle {
  font-size: clamp(0.82rem, 1.6vw, 1rem);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.66);
}

.parallax-floating-button {
  border: none;
  border-radius: 999px;
  min-width: 7rem;
  padding: 0.7rem 1.1rem;
  background: #ffffff;
  color: #050505;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.28s ease;
  box-shadow: none;
}

.parallax-floating-button:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: none;
}

.parallax-floating-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

.floating-card {
  position: absolute;
  margin: 0;
  opacity: 0;
  transform: translate3d(0, 24px, 0) scale(0.96);
  transition:
    opacity 0.55s ease,
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    filter 0.25s ease;
  will-change: transform;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 18px 42px rgb(0 0 0 / 0.28);
}

.floating-card.is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
}

.floating-card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.25s ease, filter 0.25s ease;
  filter: saturate(0.98) contrast(1.02);
}

.floating-card:hover {
  z-index: 4;
  box-shadow: 0 26px 54px rgb(0 0 0 / 0.38);
}

.floating-card:hover img {
  transform: scale(1.05);
}

@media (max-width: 1000px) {
  .parallax-floating-center {
    gap: 0.85rem;
    padding: 1.5rem;
  }

  .parallax-floating-title {
    font-size: clamp(2.8rem, 12vw, 4.8rem);
  }

  .parallax-floating-button {
    padding: 0.65rem 1rem;
    min-width: 6.5rem;
    font-size: 0.72rem;
  }

  .floating-card:nth-child(4),
  .floating-card:nth-child(5) {
    left: auto !important;
    right: 4%;
  }
}
</style>
