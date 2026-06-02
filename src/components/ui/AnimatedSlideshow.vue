<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { homePageConfig } from '../../config/siteContent'
import VerticalCutReveal from './VerticalCutReveal.vue'

const props = defineProps({
  eyebrow: { type: String, default: homePageConfig.animatedSlideshow.eyebrow },
  slides: { type: Array, default: () => homePageConfig.animatedSlideshow.slides },
})

const activeSlide = ref(0)
const revealRefs = {}

function setActiveSlide(index) {
  if (activeSlide.value === index) return
  // Reset the previously-active slide
  const prevId = props.slides[activeSlide.value]?.id
  if (prevId && revealRefs[prevId]) {
    revealRefs[prevId].reset()
  }
  activeSlide.value = index
  // Start the newly-active slide
  const newId = props.slides[index]?.id
  if (newId && revealRefs[newId]) {
    revealRefs[newId].startAnimation()
  }
}

onMounted(async () => {
  await nextTick()
  // Kick off the default active slide on first render
  const defaultId = props.slides[activeSlide.value]?.id
  if (defaultId && revealRefs[defaultId]) {
    revealRefs[defaultId].startAnimation()
  }
})
</script>

<template>
  <section class="animated-slideshow-section">
    <div class="animated-slideshow-shell">
      <p class="animated-slideshow-eyebrow">
        <VerticalCutReveal
          :text="props.eyebrow"
          splitBy="characters"
          :staggerDuration="0.03"
          staggerFrom="first"
          :transition="{ type: 'spring', stiffness: 200, damping: 21 }"
        />
      </p>

      <div class="animated-slideshow-layout">
        <div class="animated-slideshow-list">
          <button
            v-for="(slide, slideIndex) in slides"
            :key="slide.id"
            type="button"
            class="animated-slideshow-trigger"
            :class="{ 'is-active': activeSlide === slideIndex }"
            @mouseenter="setActiveSlide(slideIndex)"
            @focus="setActiveSlide(slideIndex)"
          >
            <VerticalCutReveal
              :ref="(el) => { if (el) revealRefs[slide.id] = el }"
              :text="slide.title"
              splitBy="characters"
              :staggerDuration="0.025"
              staggerFrom="first"
              :autoStart="false"
              :transition="{ type: 'spring', stiffness: 200, damping: 21 }"
            />
          </button>
        </div>

        <div class="animated-slideshow-image-wrap">
          <img
            v-for="(slide, slideIndex) in slides"
            :key="`${slide.id}-image`"
            :src="slide.imageUrl"
            :alt="slide.title"
            class="animated-slideshow-image"
            :class="{ 'is-active': activeSlide === slideIndex }"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animated-slideshow-section {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 2rem 1.5rem;
  background: #c0fc61;
  color: #3d3929;
}

.animated-slideshow-shell {
  width: min(100%, 1280px);
}

.animated-slideshow-eyebrow {
  margin: 0 0 1.5rem;
  color: #c96442;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: capitalize;
}

.animated-slideshow-layout {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-evenly;
  gap: 1.5rem 3rem;
}

.animated-slideshow-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.animated-slideshow-trigger {
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
  font-size: clamp(2.2rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.06em;
  text-transform: uppercase;
  color: inherit;
}

.animated-slideshow-image-wrap {
  position: relative;
  width: min(100%, 480px);
  height: min(80svh, 40rem);
  display: grid;
  overflow: hidden;
}

.animated-slideshow-image {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
  transition: clip-path 0.8s cubic-bezier(0.33, 1, 0.68, 1);
}

.animated-slideshow-image.is-active {
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
}

@media (max-width: 900px) {
  .animated-slideshow-section {
    min-height: auto;
    padding: 4rem 1.25rem;
  }

  .animated-slideshow-layout {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .animated-slideshow-image-wrap {
    width: 100%;
    height: min(68svh, 28rem);
  }
}
</style>
