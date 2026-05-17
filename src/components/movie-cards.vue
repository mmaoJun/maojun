<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { moviesPageConfig } from '../config/siteContent'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

gsap.registerPlugin(ScrollTrigger)

const pageRoot = ref(null)
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

onMounted(() => {
  if (!props.embedded) {
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
  }

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

  if (props.embedded) {
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }
})

onBeforeUnmount(() => {
  cardsTrigger?.kill()
  if (tickerFn) gsap.ticker.remove(tickerFn)
  lenis?.destroy()
})
</script>

<template>
  <main ref="pageRoot" class="movie-cards-page" :class="{ 'is-embedded': embedded }">
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

.movie-cards-page {
  position: relative;
  min-height: 100svh;
  background: #faf5e5;
  overflow: hidden;
}

.movie-cards-page.is-embedded {
  width: 100%;
}

.movie-cards-page::before {
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

.movie-cards-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.movie-cards-page img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.movie-cards-page section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.movie-cards-page .sticky-cards {
  background-color: transparent;
  perspective: 850px;
  z-index: 2;
}

.movie-cards-page .sticky-cards .card {
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
  background: var(--card-bg, #111111);
  box-shadow: 0 22px 80px rgb(0 0 0 / 0.22), inset 0 0 0 1px rgb(255 255 255 / 0.05);
}

.movie-cards-page .sticky-cards .poster-wrap {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
}

.movie-cards-page .sticky-cards .poster-wrap::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(0 0 0 / 0.04) 0%, rgb(0 0 0 / 0.2) 100%);
}

.movie-cards-page .sticky-cards .movie-title,
.movie-cards-page .sticky-cards .movie-quote,
.movie-cards-page .sticky-cards .movie-meta {
  position: relative;
  z-index: 1;
}

.movie-cards-page .sticky-cards .movie-title {
  width: min(100%, 14ch);
  margin-inline: auto;
  align-self: center;
  justify-self: center;
  text-align: center;
  font-family: "Druk Wide Bold", "Barlow Condensed", sans-serif;
  font-size: clamp(3rem, 7vw, 6.4rem);
  font-weight: 700;
  line-height: 0.88;
  letter-spacing: -0.06em;
  text-transform: uppercase;
  color: var(--title-color, #ffffff);
  text-shadow: 0 7px 26px rgb(255 255 255 / 16%), 0 12px 36px rgb(86 120 177 / 14%);
}

.movie-cards-page .sticky-cards .movie-quote {
  position: absolute;
  left: var(--card-side-gap);
  bottom: 2.65rem;
  width: min(32vw, 26rem);
  font-size: clamp(0.8rem, 1vw, 0.92rem);
  line-height: 1.65;
  color: var(--meta-color, rgb(255 255 255 / 0.88));
  letter-spacing: 0.04em;
}

.movie-cards-page .sticky-cards .movie-meta {
  position: absolute;
  right: var(--card-side-gap);
  bottom: 2.6rem;
  font-family: "DM Mono", monospace;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--meta-color, rgb(255 255 255 / 0.88));
}

@media (max-width: 1000px) {
  .movie-cards-page .sticky-cards .card {
    width: 100%;
    height: 100%;
    padding: 1.25rem;
    border-radius: 0;
  }

  .movie-cards-page .sticky-cards .movie-title {
    width: min(100%, 12ch);
    font-size: clamp(2.35rem, 12vw, 4rem);
    line-height: 0.9;
  }

  .movie-cards-page .sticky-cards .movie-quote {
    left: 1.25rem;
    right: 1.25rem;
    bottom: 5.25rem;
    width: auto;
    max-width: none;
    font-size: 0.76rem;
    line-height: 1.55;
  }

  .movie-cards-page .sticky-cards .movie-meta {
    left: 1.25rem;
    right: auto;
    bottom: 3rem;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
  }
}
</style>
