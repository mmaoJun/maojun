<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'
import { aboutPageConfig } from '../config/siteContent'

gsap.registerPlugin(CustomEase, SplitText)
CustomEase.create('hop', '0.85, 0, 0.15, 1')

const pageRoot = ref(null)
const counterValue = ref(0)
const prefersReducedMotion = ref(false)
const isMobile = ref(false)
let splitInstance = null
let counterTl = null
let revealTl = null
let motionMediaQuery = null
let handleMotionChange = null
let resizeHandler = null

const updateViewportFlags = () => {
  isMobile.value = window.innerWidth < 900
}

const cleanupAnimations = () => {
  counterTl?.kill()
  revealTl?.kill()
  counterTl = null
  revealTl = null
}

const applyStaticState = () => {
  if (!pageRoot.value) return

  const images = pageRoot.value.querySelectorAll('.img')
  const heroImages = pageRoot.value.querySelector('.hero-images')
  const overlay = pageRoot.value.querySelector('.hero-overlay')

  gsap.set(images, {
    clearProps: 'all',
    opacity: 1,
    y: 0,
    scale: 1,
    clipPath: 'none',
  })
  gsap.set(heroImages, { clearProps: 'all', gap: isMobile.value ? '2.5vw' : '1vw' })
  gsap.set(overlay, { clearProps: 'all', clipPath: 'none', opacity: prefersReducedMotion.value ? 0 : 1 })
  if (splitInstance?.words) {
    gsap.set(splitInstance.words, { y: 0, clearProps: 'transform' })
  }
  counterValue.value = aboutPageConfig.counterEnd
}

const runAnimations = () => {
  if (!pageRoot.value) return

  cleanupAnimations()

  if (prefersReducedMotion.value) {
    applyStaticState()
    return
  }

  const counter = { value: 0 }
  const imageRevealDuration = isMobile.value ? 0.65 : 1
  const overlayDuration = isMobile.value ? 0.72 : 1
  const stagger = isMobile.value ? 0.03 : 0.05

  counterValue.value = 0

  counterTl = gsap.timeline({ delay: 0.25 })
  revealTl = gsap.timeline({ delay: 0.25 })

  counterTl.to(counter, {
    value: aboutPageConfig.counterEnd,
    duration: isMobile.value ? 2.6 : 5,
    ease: 'power2.out',
    onUpdate: () => {
      counterValue.value = Math.floor(counter.value)
    },
  })

  revealTl
    .to('.img', {
      y: 0,
      opacity: 1,
      stagger,
      duration: imageRevealDuration,
      ease: 'hop',
    })
    .to('.hero-images', {
      gap: isMobile.value ? '2vw' : '0.75vw',
      duration: imageRevealDuration,
      delay: isMobile.value ? 0.2 : 0.5,
      ease: 'hop',
    })
    .to(
      '.img',
      {
        scale: 1,
        duration: imageRevealDuration,
        ease: 'hop',
      },
      '<',
    )

  if (!isMobile.value) {
    revealTl
      .to('.img:not(.hero-img)', {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.9,
        stagger: 0.08,
        ease: 'hop',
      })
      .to('.hero-img', {
        scale: 2,
        duration: 0.9,
        ease: 'hop',
      }, '<0.08')
      .to('.hero-overlay', {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: overlayDuration,
        ease: 'hop',
      })
  } else {
    revealTl
      .to('.hero-img', {
        scale: 1.18,
        duration: 0.7,
        ease: 'hop',
      })
      .to('.hero-overlay', {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
      }, '<0.15')
  }

  if (splitInstance?.words?.length) {
    revealTl.to(
      splitInstance.words,
      {
        y: '0',
        duration: isMobile.value ? 0.55 : 0.75,
        stagger: isMobile.value ? 0.06 : 0.1,
        ease: 'power3.out',
      },
      '-=0.35',
    )
  }
}

onMounted(async () => {
  await nextTick()

  if (!pageRoot.value) return

  const title = pageRoot.value.querySelector('.hero-header h1')
  if (!title) return

  splitInstance = SplitText.create(title, {
    type: 'words',
    mask: 'words',
    wordsClass: 'word',
  })

  motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  handleMotionChange = () => {
    prefersReducedMotion.value = motionMediaQuery.matches
    runAnimations()
  }
  motionMediaQuery.addEventListener('change', handleMotionChange)

  resizeHandler = () => {
    const previous = isMobile.value
    updateViewportFlags()
    if (previous !== isMobile.value) {
      runAnimations()
    }
  }

  updateViewportFlags()
  prefersReducedMotion.value = motionMediaQuery.matches
  window.addEventListener('resize', resizeHandler, { passive: true })
  runAnimations()
})

onBeforeUnmount(() => {
  cleanupAnimations()
  splitInstance?.revert()
  motionMediaQuery?.removeEventListener?.('change', handleMotionChange)
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})
</script>

<template>
  <section ref="pageRoot" class="hero" :class="{ 'hero--reduced': prefersReducedMotion, 'hero--mobile': isMobile }">
      <div class="hero-overlay">
        <div class="counter">
          <h1>{{ counterValue }}%</h1>
        </div>
      </div>

      <div class="hero-images">
        <div v-for="(image, index) in aboutPageConfig.images" :key="image" class="img" :class="{ 'hero-img': index === 2 }">
          <img :src="image" alt="" loading="lazy" decoding="async" />
        </div>
      </div>

      <div class="hero-header">
        <h1>{{ aboutPageConfig.heroTitle }}</h1>
      </div>
  </section>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

:root {
  --light: #5e5b06;
  --dark: #0f0f0f;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(a),
:deep(p) {
  text-decoration: none;
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.25;
  color: #000;
}

.hero {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  font-family: "DM Sans", sans-serif;
  background: #ffffff;
}

.hero-overlay {
  position: absolute;
  width: 100%;
  height: 100svh;
  background-color: #0f0f0f;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path, opacity;
  z-index: 0;
}

.hero-overlay .counter {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  color: #fff;
}

.hero-overlay .counter h1 {
  font-size: 4rem;
  font-weight: 500;
}

.hero-images {
  position: absolute;
  top: 47%;
  transform: translateY(-50%);
  width: 100%;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
  gap: 10vw;
  will-change: gap;
}

.hero-images .img {
  width: 10vw;
  aspect-ratio: 5/7;
  transform: translateY(50%) scale(0.5);
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  opacity: 0;
  will-change: opacity, transform, clip-path;
}

.hero-header {
  position: absolute;
  bottom: 0.6rem;
  width: 100%;
  z-index: -1;
}

.hero-header h1 {
  text-transform: uppercase;
  text-align: center;
  font-size: 15vw;
  font-weight: 500;
  line-height: 0.85;
  color: #000;
}

:deep(.word) {
  transform: translateY(100%);
  will-change: transform;
}

.hero--reduced .hero-overlay {
  clip-path: none;
  opacity: 0;
}

.hero--reduced .hero-images .img {
  clip-path: none;
  transform: none;
  opacity: 1;
}

.hero--mobile .hero-images .img {
  will-change: transform, opacity;
}

@media (max-width: 1000px) {
  .hero-overlay .counter {
    right: 1rem;
    bottom: 1rem;
  }

  .hero-images {
    padding: 0 0.5rem;
    gap: 2.5vw;
  }

  .hero-images .img {
    width: 20vw;
  }
}
</style>
