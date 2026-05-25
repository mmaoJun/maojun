<script setup>
import { computed, ref } from 'vue'
import { homePageConfig } from '../../config/siteContent'

const props = defineProps({
  eyebrow: { type: String, default: homePageConfig.animatedSlideshow.eyebrow },
  slides: { type: Array, default: () => homePageConfig.animatedSlideshow.slides },
})

const activeSlide = ref(0)

const slideChars = computed(() =>
  props.slides.map((slide) => Array.from(`${slide.title} `)),
)

const setActiveSlide = (index) => {
  activeSlide.value = index
}
</script>

<template>
  <section class="animated-slideshow-section">
    <div class="animated-slideshow-shell">
      <p class="animated-slideshow-eyebrow">{{ props.eyebrow }}</p>

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
            <span
              v-for="(char, charIndex) in slideChars[slideIndex]"
              :key="`${slide.id}-${charIndex}`"
              class="animated-slideshow-char"
              :style="{ '--char-delay': `${charIndex * 0.025}s` }"
            >
              <span
                class="animated-slideshow-char__base"
                :class="{ 'is-active': activeSlide === slideIndex }"
              >
                {{ char === ' ' ? '\u00A0' : char }}
              </span>
              <span
                class="animated-slideshow-char__hover"
                :class="{ 'is-active': activeSlide === slideIndex }"
              >
                {{ char === ' ' ? '\u00A0' : char }}
              </span>
            </span>
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
  background: #faf9f5;
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

.animated-slideshow-char {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.animated-slideshow-char__base,
.animated-slideshow-char__hover {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease;
  transition-delay: var(--char-delay);
}

.animated-slideshow-char__base {
  opacity: 0.2;
}

.animated-slideshow-char__base.is-active {
  transform: translateY(-110%);
}

.animated-slideshow-char__hover {
  position: absolute;
  inset: 0 auto auto 0;
  opacity: 1;
  transform: translateY(110%);
}

.animated-slideshow-char__hover.is-active {
  transform: translateY(0%);
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
