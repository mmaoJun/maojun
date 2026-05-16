<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'maoJun',
  },
  subtitle: {
    type: String,
    default: 'Burning · 2018',
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

const imageItems = [
  {
    url: '/home/red.webp',
    title: 'Home Red',
    author: 'maoJun',
    top: '8%',
    left: '11%',
    width: 'clamp(4rem, 7vw, 6rem)',
    height: 'clamp(4rem, 7vw, 6rem)',
    depth: 0.5,
  },
  {
    url: '/media-musics/p1218345200.webp',
    title: 'Music Cover 1',
    author: 'maoJun',
    top: '10%',
    left: '32%',
    width: 'clamp(5rem, 8vw, 7rem)',
    height: 'clamp(5rem, 8vw, 7rem)',
    depth: 1,
  },
  {
    url: '/media-musics/s2702527.jpg',
    title: 'Music Cover 2',
    author: 'maoJun',
    top: '2%',
    left: '53%',
    width: 'clamp(7rem, 11vw, 10rem)',
    height: 'clamp(10rem, 15vw, 13rem)',
    depth: 2,
  },
  {
    url: '/media-movies/p2520095279.jpg',
    title: 'Movie Still 1',
    author: 'maoJun',
    top: '0%',
    left: '83%',
    width: 'clamp(6rem, 9vw, 8rem)',
    height: 'clamp(6rem, 9vw, 8rem)',
    depth: 1,
  },
  {
    url: '/media-slow/p2561886540.webp',
    title: 'Movie Still 2',
    author: 'maoJun',
    top: '40%',
    left: '2%',
    width: 'clamp(7rem, 10vw, 9rem)',
    height: 'clamp(7rem, 10vw, 9rem)',
    depth: 1,
  },
  {
    url: '/burning.webp',
    title: 'Burning Poster',
    author: 'maoJun',
    top: '73%',
    left: '15%',
    width: 'clamp(9rem, 14vw, 13rem)',
    height: 'clamp(12rem, 18vw, 16rem)',
    depth: 4,
  },
  {
    url: '/card1.jpeg',
    title: 'Card Back 1',
    author: 'maoJun',
    top: '80%',
    left: '50%',
    width: 'clamp(6rem, 9vw, 8rem)',
    height: 'clamp(6rem, 9vw, 8rem)',
    depth: 1,
  },
  {
    url: '/media-musics/s33569302.jpg',
    title: 'Music Cover 3',
    author: 'maoJun',
    top: '70%',
    left: '77%',
    width: 'clamp(7rem, 10vw, 9rem)',
    height: 'clamp(9rem, 14vw, 12rem)',
    depth: 2,
  },
]

const sectionRef = ref(null)
const elements = ref([])
const mouse = { x: 0, y: 0 }
let frameId = 0
let cleanupMouse = null
let hasAnimatedIn = false

const sectionStyle = computed(() => ({ minHeight: props.minHeight }))

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
      <p class="parallax-floating-subtitle">{{ subtitle }}</p>
      <button type="button" class="parallax-floating-button">{{ buttonLabel }}</button>
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
  background:
    radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.08) 0%, transparent 32%),
    linear-gradient(180deg, #020202 0%, #000000 100%);
  isolation: isolate;
}

.parallax-floating-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 18%, rgb(255 255 255 / 0.06) 0, transparent 24%),
    radial-gradient(circle at 80% 76%, rgb(255 255 255 / 0.04) 0, transparent 22%),
    linear-gradient(180deg, rgb(255 255 255 / 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px);
  background-size: auto, auto, 22px 22px, 22px 22px;
  opacity: 0.75;
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
  text-shadow: 0 10px 30px rgb(0 0 0 / 0.35);
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
  transition: transform 0.28s ease, box-shadow 0.28s ease;
  box-shadow: 0 16px 40px rgb(255 255 255 / 0.18);
}

.parallax-floating-button:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 22px 48px rgb(255 255 255 / 0.24);
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
