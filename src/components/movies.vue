<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { moviesPageConfig } from '../config/siteContent'

gsap.registerPlugin(ScrollTrigger)

const pageRoot = ref(null)
const bgCanvas = ref(null)
const isMobileView = window.matchMedia('(max-width: 1000px)').matches
const pageConfig = moviesPageConfig
const randomCardPalette = ['#ff2d55', '#ff6a00', '#ffd60a', '#00c853', '#00b8ff', '#3a86ff', '#7b2cff', '#ff006e', '#06d6a0', '#ff3b30']
const randomizedCardColors = pageConfig.movies.map((_, idx) => randomCardPalette[(idx * 7 + 3) % randomCardPalette.length])

const movieCards = computed(() =>
  pageConfig.movies.map((item, idx) => ({
    src: `/media-movies/${item.file}`,
    title: item.title,
    meta: item.meta,
    quote: item.quote,
    bg: randomizedCardColors[idx],
    titleColor: pageConfig.glassTheme.titleColor,
    metaColor: pageConfig.glassTheme.metaColor,
    glow: pageConfig.glassTheme.glow,
  })),
)

let lenis = null
let tickerFn = null
let cardsTrigger = null
let bgCtx = null
let bgAnimationId = 0
let particleCleanup = null
const circleArr = []

class Circle {
  constructor(x, y, r) {
    this.x = x
    this.y = y
    this.r = r
    this.color = `rgb(${Math.floor(Math.random() * 80) + 175}, ${Math.floor(Math.random() * 120) + 80}, ${Math.floor(Math.random() * 90) + 20})`
    this.dx = Math.random() * 3.2 - 1.6
    this.dy = Math.random() * 3.2 - 1.6
    circleArr.push(this)
  }

  render() {
    if (!bgCtx) return
    bgCtx.beginPath()
    bgCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true)
    bgCtx.fillStyle = this.color
    bgCtx.fill()
  }

  update() {
    this.x += this.dx
    this.y += this.dy
    this.r -= 0.14

    if (this.r < 0) {
      const index = circleArr.indexOf(this)
      if (index >= 0) circleArr.splice(index, 1)
      return false
    }

    return true
  }
}

const initParticleBackground = () => {
  const canvas = bgCanvas.value
  const root = pageRoot.value
  if (!canvas || !root) return null

  bgCtx = canvas.getContext('2d')
  if (!bgCtx) return null

  const resizeCanvas = () => {
    canvas.width = root.clientWidth
    canvas.height = root.clientHeight
  }

  const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect()
    new Circle(event.clientX - rect.left, event.clientY - rect.top, 24)
  }

  const animateParticles = () => {
    bgAnimationId = requestAnimationFrame(animateParticles)
    bgCtx.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = circleArr.length - 1; i >= 0; i -= 1) {
      circleArr[i].update() && circleArr[i].render()
    }
  }

  resizeCanvas()
  root.addEventListener('pointermove', onPointerMove)
  window.addEventListener('resize', resizeCanvas)
  animateParticles()

  return () => {
    root.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('resize', resizeCanvas)
  }
}

onMounted(() => {
  particleCleanup = initParticleBackground()

  lenis = new Lenis({
    lerp: isMobileView ? 0.12 : 0.075,
    smoothWheel: true,
    wheelMultiplier: isMobileView ? 0.7 : 0.9,
    touchMultiplier: isMobileView ? 0.72 : 0.95,
  })
  lenis.on('scroll', ScrollTrigger.update)

  tickerFn = (time) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(tickerFn)
  gsap.ticker.lagSmoothing(0)

  const cards = pageRoot.value?.querySelectorAll('.sticky-cards .card') || []
  const totalCards = cards.length
  if (!totalCards) return

  const segmentSize = 0.5 / totalCards
  const cardYOffset = isMobileView ? 2.2 : 3.6
  const cardScaleStep = isMobileView ? 0.038 : 0.06
  const maxVisibleBehind = isMobileView ? 3 : 5
  const exitYPercent = isMobileView ? -185 : -250
  const exitRotation = isMobileView ? 16 : 35

  cards.forEach((card, i) => {
    gsap.set(card, {
      xPercent: -50,
      yPercent: -50 + i * cardYOffset,
      scale: 1 - i * cardScaleStep,
      zIndex: totalCards - i,
      autoAlpha: i <= maxVisibleBehind ? 1 : 0,
      force3D: true,
    })
  })

  cardsTrigger = ScrollTrigger.create({
    trigger: pageRoot.value?.querySelector('.sticky-cards'),
    start: 'top top',
    end: `+=${window.innerHeight * (isMobileView ? 1.8 : 2.8)}px`,
    pin: true,
    pinSpacing: true,
    scrub: isMobileView ? 0.28 : 0.48,
    onUpdate: (self) => {
      const cappedProgress = self.progress * (segmentSize * (totalCards - 1))
      const activeIndex = Math.min(Math.floor(cappedProgress / segmentSize), totalCards - 1)
      const segProgress = activeIndex === totalCards - 1
        ? 0
        : (cappedProgress - activeIndex * segmentSize) / segmentSize

      cards.forEach((card, i) => {
        if (i < activeIndex) {
          gsap.set(card, {
            yPercent: exitYPercent,
            rotationX: exitRotation,
            autoAlpha: 0,
          })
        } else if (i === activeIndex) {
          gsap.set(card, {
            yPercent: gsap.utils.interpolate(-50, -200, segProgress),
            rotationX: gsap.utils.interpolate(0, exitRotation, segProgress),
            scale: 1,
            autoAlpha: 1,
          })
        } else {
          const behindIndex = i - activeIndex
          const currentYOffset = (behindIndex - segProgress) * cardYOffset
          const currentScale = 1 - (behindIndex - segProgress) * cardScaleStep
          const isVisible = behindIndex <= maxVisibleBehind

          gsap.set(card, {
            yPercent: -50 + currentYOffset,
            rotationX: 0,
            scale: currentScale,
            autoAlpha: isVisible ? 1 : 0,
          })
        }
      })
    },
  })
})

onBeforeUnmount(() => {
  cardsTrigger?.kill()
  if (tickerFn) gsap.ticker.remove(tickerFn)
  lenis?.destroy()
  particleCleanup?.()
  cancelAnimationFrame(bgAnimationId)
  circleArr.length = 0
  bgCtx = null
})
</script>

<template>
  <main ref="pageRoot" class="movies-page">
    <canvas ref="bgCanvas" class="movies-bg-canvas"></canvas>

    <section class="sticky-cards">
      <div
        class="card"
        v-for="(item, idx) in movieCards"
        :key="item.src"
        :style="{ '--card-bg': item.bg, '--title-color': item.titleColor, '--meta-color': item.metaColor, '--card-glow': item.glow }"
      >
        <div class="poster-wrap">
          <img :src="item.src" :alt="item.title" />
        </div>
        <h1 class="movie-title">{{ item.title }}</h1>
        <p class="movie-quote">“{{ item.quote }}”</p>
        <p class="movie-meta">{{ item.meta }}</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap");
@import url("https://fonts.cdnfonts.com/css/druk-wide-bold");

.movies-page {
  position: relative;
  min-height: 100svh;
  background: #faf5e5;
  overflow: hidden;
}

.movies-page::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(90deg, #111 1px, transparent 1px);
  background-size: 50px 100%;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, rgb(235, 228, 228) 0%, rgba(226, 7, 7, 0) 70%);
  -webkit-mask-image: linear-gradient(to bottom, rgb(235, 225, 225) 0%, rgba(196, 18, 18, 0) 70%);
  z-index: 0;
}

.movies-bg-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 1;
  pointer-events: none;
}

.movies-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.movies-page img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.movies-page section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.movies-page .sticky-cards {
  background-color: transparent;
  perspective: 850px;
  z-index: 2;
}

.movies-page .sticky-cards .card {
  --card-side-gap: 2rem;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 65%;
  height: 66%;
  display: grid;
  place-items: center;
  padding: 1.6rem;
  border-radius: 1rem;
  color: #fff;
  transform-origin: center bottom;
  transform-style: preserve-3d;
  will-change: transform, opacity;
  contain: layout paint;
  overflow: hidden;
  background: color-mix(in srgb, var(--card-bg) 85%, white 15%);
  border: 1px solid rgb(255 255 255 / 34%);
  box-shadow: 0 22px 54px rgb(103 138 190 / 12%), 0 18px 48px rgb(0 0 0 / 12%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.movies-page .poster-wrap {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%) translateZ(20px);
  height: calc(100% - 3.2rem);
  aspect-ratio: 2 / 3;
  border-radius: 0.8rem;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 40%);
  box-shadow: 0 20px 40px rgb(0 0 0 / 16%);
}

.movies-page .movie-title {
  position: absolute;
  left: var(--card-side-gap);
  top: 1.55rem;
  z-index: 2;
  width: calc(100% - var(--card-side-gap) - (2rem + ((100% - 3.2rem) * 2 / 3)));
  display: block;
  text-align: center;
  margin: 0;
  color: var(--title-color);
  text-shadow: 0 7px 26px rgb(255 255 255 / 16%), 0 12px 36px rgb(86 120 177 / 14%);
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
  font-size: clamp(2.55rem, 5.2vw, 4.8rem);
  font-weight: 700;
  line-height: 0.92;
  text-transform: none;
}

.movies-page .movie-quote {
  position: absolute;
  left: var(--card-side-gap);
  top: 50%;
  z-index: 2;
  width: calc(100% - var(--card-side-gap) - (2rem + ((100% - 3.2rem) * 2 / 3)));
  display: block;
  text-align: center;
  transform: translateY(-50%);
  margin: 0;
  color: #1c2434;
  text-shadow: 0 4px 18px rgb(255 255 255 / 28%);
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
  font-size: clamp(1.2rem, 1.95vw, 1.7rem);
  line-height: 1.42;
  letter-spacing: 0.005em;
}

.movies-page .movie-meta {
  position: absolute;
  left: var(--card-side-gap);
  bottom: 1.6rem;
  z-index: 2;
  text-align: left;
  color: var(--meta-color);
  text-shadow: 0 4px 18px rgb(255 255 255 / 22%);
  font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
  font-size: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.95;
}

@media (max-width: 1000px) {
  .movies-page .sticky-cards {
    perspective: 620px;
  }

  .movies-page .bg-quote {
    max-width: 78vw;
    font-size: clamp(1.35rem, 6.4vw, 2.2rem) !important;
    opacity: 0.14 !important;
  }

  .movies-page .sticky-cards .card {
    --mobile-gap: 0.75rem;
    --card-side-gap: var(--mobile-gap);
    width: min(84vw, 360px);
    height: min(72svh, 620px);
    padding: var(--mobile-gap);
    border-radius: 0.9rem;
    display: grid;
    grid-template-rows: auto 1fr auto;
    align-items: center;
    justify-items: center;
    row-gap: var(--mobile-gap);
    box-shadow: 0 12px 28px rgb(0 0 0 / 14%);
  }

  .movies-page .poster-wrap {
    position: relative;
    left: auto;
    top: auto;
    right: auto;
    transform: none;
    width: min(62vw, 250px);
    height: auto;
    aspect-ratio: 2 / 3;
    border-radius: 0.68rem;
  }

  .movies-page .movie-title {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    width: 100%;
    text-align: center;
    font-size: clamp(1.42rem, 6.2vw, 2rem);
    line-height: 1;
    margin: 0;
  }

  .movies-page .movie-meta {
    position: relative;
    left: auto;
    bottom: auto;
    transform: none;
    width: 100%;
    text-align: center;
    font-size: 0.9rem;
    letter-spacing: 0.03em;
    margin: 0;
  }

  .movies-page .movie-quote {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    width: 100%;
    text-align: center;
    font-family: "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
    font-size: 1.12rem;
    line-height: 1.44;
    margin: 0;
  }
}
</style>
