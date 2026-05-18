<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { moviesPageConfig } from '../../config/siteContent'

gsap.registerPlugin(ScrollTrigger)

const rootRef = ref(null)
const sectionRefs = ref([])
const reducedMotion = ref(false)
const sections = moviesPageConfig.storyScroll.sections

const setSectionRef = (el, index) => {
  if (el) sectionRefs.value[index] = el
}

const childCount = () => sections.length

let triggers = []
let mediaQuery = null
const cleanupTriggers = () => {
  triggers.forEach((trigger) => trigger.kill())
  triggers = []
}

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const updateMotionPreference = () => {
    reducedMotion.value = mediaQuery.matches
  }
  updateMotionPreference()
  mediaQuery.addEventListener('change', updateMotionPreference)

  if (!rootRef.value || reducedMotion.value) return

  const sectionsEls = sectionRefs.value.filter(Boolean)
  if (!sectionsEls.length) return

  sectionsEls.forEach((section, i) => {
    gsap.set(section, { zIndex: i + 1 })

    const inner = section.querySelector('.flow-art-container')
    if (!inner) return

    if (i > 0) {
      gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' })
      const tween = gsap.to(inner, {
        rotation: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top 25%',
          scrub: true,
        },
      })
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
    }

    if (i < sectionsEls.length - 1) {
      triggers.push(
        ScrollTrigger.create({
          trigger: section,
          start: 'bottom bottom',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
        }),
      )
    }
  })

  ScrollTrigger.refresh()
})

onBeforeUnmount(() => {
  cleanupTriggers()
  mediaQuery?.removeEventListener?.('change', () => {})
})
</script>

<template>
  <main ref="rootRef" class="story-scroll-root" :aria-label="moviesPageConfig.storyScroll.ariaLabel">
    <section
      v-for="(section, index) in sections"
      :key="section.id"
      :ref="(el) => setSectionRef(el, index)"
      class="story-flow-section"
      :aria-label="section.label"
    >
      <div
        class="flow-art-container"
        :style="{ backgroundColor: section.bg, color: section.color, '--story-border': section.border }"
      >
        <p class="story-eyebrow">{{ section.number }}</p>
        <hr class="story-divider" />

        <div>
          <h2 class="story-title">
            <template v-for="(line, lineIndex) in section.title" :key="`${section.id}-${lineIndex}`">
              {{ line }}<br v-if="lineIndex < section.title.length - 1" />
            </template>
          </h2>
        </div>

        <hr class="story-divider" />

        <p class="story-body" :class="{ 'is-right': section.align === 'right' }">{{ section.body }}</p>

        <template v-if="section.columnsTop?.length">
          <hr class="story-divider" />
          <div class="story-grid">
            <div v-for="item in section.columnsTop" :key="`${section.id}-${item.title}`" class="story-grid-item">
              <p class="story-grid-title">{{ item.title }}</p>
              <p class="story-grid-text">{{ item.text }}</p>
            </div>
          </div>
        </template>

        <template v-if="section.footer">
          <hr class="story-divider" />
          <p class="story-body" :class="{ 'is-right': section.align === 'right' }">{{ section.footer }}</p>
        </template>

        <template v-if="section.columnsBottom?.length">
          <hr class="story-divider" />
          <div class="story-grid">
            <div v-for="item in section.columnsBottom" :key="`${section.id}-${item.title}-bottom`" class="story-grid-item">
              <p class="story-grid-title">{{ item.title }}</p>
              <p class="story-grid-text">{{ item.text }}</p>
            </div>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<style scoped>
.story-scroll-root {
  width: 100%;
  overflow-x: hidden;
}

.story-flow-section {
  position: relative;
  min-height: 100svh;
  width: 100%;
  overflow: hidden;
}

.flow-art-container {
  position: relative;
  display: flex;
  min-height: 100svh;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  padding: clamp(2rem, 8vw, 4vw) 4vw 4vw;
  transform-origin: bottom left;
  will-change: transform;
}

.story-eyebrow {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.story-divider {
  display: none;
}

.story-title {
  margin: 0;
  font-size: clamp(3.5rem, 12vw, 14rem);
  font-weight: 800;
  line-height: 0.85;
  letter-spacing: -0.06em;
  text-transform: uppercase;
}

.story-body {
  max-width: 50ch;
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 2rem);
  line-height: 1.6;
}

.story-body.is-right {
  margin-left: auto;
  text-align: right;
}

.story-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 3vw;
}

.story-grid-item {
  min-width: 180px;
  flex: 1;
}

.story-grid-title {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.story-grid-text {
  margin: 0;
  font-size: clamp(0.85rem, 1.3vw, 1.05rem);
  line-height: 1.7;
  opacity: 0.75;
}

@media (max-width: 900px) {
  .flow-art-container {
    gap: 1.25rem;
    padding: 2rem 1.25rem 1.5rem;
  }

  .story-title {
    font-size: clamp(3rem, 14vw, 6rem);
  }

  .story-grid {
    gap: 1.25rem;
  }
}
</style>
