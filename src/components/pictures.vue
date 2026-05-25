<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'
import { aboutPageConfig } from '../config/siteContent'

gsap.registerPlugin(CustomEase, SplitText)
CustomEase.create('hop', '0.85, 0, 0.15, 1')

const pageRoot = ref(null)
const counterValue = ref(0)
let splitInstance = null

const data = reactive({
  heroTitle: aboutPageConfig.heroTitle,
  counterEnd: aboutPageConfig.counterEnd,
  images: [...aboutPageConfig.images],
})

async function fetchContent() {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 3000)
  try {
    const res = await fetch('/api/home-content/public', { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return
    const json = await res.json()
    if (!json.data || !json.data.length) return
    const item = json.data.find(i => i.sectionKey === 'pictures/content')
    if (!item) return
    const d = JSON.parse(item.contentJson)
    if (d.heroTitle != null) data.heroTitle = d.heroTitle
    if (d.counterEnd != null) data.counterEnd = d.counterEnd
    if (d.images) d.images.forEach((url, i) => {
      if (i < 5 && url != null) data.images[i] = url
    })
  } catch { /* use defaults */ }
}

onMounted(async () => {
  await fetchContent()
  await nextTick()

  if (!pageRoot.value) return

  const title = pageRoot.value.querySelector('.hero-header h1')
  if (!title) return

  splitInstance = SplitText.create(title, {
    type: 'words',
    mask: 'words',
    wordsClass: 'word',
  })

  const counter = { value: 0 }

  const counterTl = gsap.timeline({ delay: 0.5 })
  const revealTl = gsap.timeline({ delay: 0.5 })

  counterTl.to(counter, {
    value: data.counterEnd,
    duration: 5,
    ease: 'power2.out',
    onUpdate: () => {
      counterValue.value = Math.floor(counter.value)
    },
  })

  revealTl
    .to('.img', {
      y: 0,
      opacity: 1,
      stagger: 0.05,
      duration: 1,
      ease: 'hop',
    })
    .to('.hero-images', {
      gap: '0.75vw',
      duration: 1,
      delay: 0.5,
      ease: 'hop',
    })
    .to(
      '.img',
      {
        scale: 1,
        duration: 1,
        ease: 'hop',
      },
      '<',
    )
    .to('.img:not(.hero-img)', {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      duration: 1,
      stagger: 0.1,
      ease: 'hop',
    })
    .to('.hero-img', {
      scale: 2,
      duration: 1,
      ease: 'hop',
    })
    .to('.hero-overlay', {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      duration: 1,
      ease: 'hop',
    })
    .to(
      splitInstance.words,
      {
        y: '0',
        duration: 0.75,
        stagger: 0.1,
        ease: 'power3.out',
      },
      '-=0.5',
    )
})

onBeforeUnmount(() => {
  splitInstance?.revert()
})
</script>

<template>
  <section ref="pageRoot" class="hero">
      <div class="hero-overlay">
        <div class="counter">
          <h1>{{ counterValue }}%</h1>
        </div>
      </div>

      <div class="hero-images">
        <div v-for="(image, index) in data.images" :key="image" class="img" :class="{ 'hero-img': index === 2 }">
          <img :src="image" alt="" />
        </div>
      </div>

      <div class="hero-header">
        <h1>{{ data.heroTitle }}</h1>
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
  will-change: clip-path;
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
