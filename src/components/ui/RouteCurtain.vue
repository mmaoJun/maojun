<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { registerRouteCurtain } from './routeCurtainController'

const STRIP_COUNT = 14
const strips = computed(() => Array.from({ length: STRIP_COUNT }, (_, index) => index))
const stripRefs = ref([])
const rootRef = ref(null)
let currentTimeline = null

const setStripRef = (el, index) => {
  if (el) stripRefs.value[index] = el
}

const resetToClosedState = () => {
  gsap.set(rootRef.value, { autoAlpha: 0, pointerEvents: 'none' })
  gsap.set(stripRefs.value, { scaleX: 0, transformOrigin: 'left center' })
}

const cover = async () => {
  await nextTick()
  if (!rootRef.value || !stripRefs.value.length) return

  currentTimeline?.kill()

  return new Promise((resolve) => {
    gsap.set(rootRef.value, { autoAlpha: 1, pointerEvents: 'auto' })
    gsap.set(stripRefs.value, { transformOrigin: 'left center' })

    currentTimeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => resolve(),
    })

    currentTimeline.to(stripRefs.value, {
      scaleX: 1,
      duration: 0.68,
      stagger: 0.045,
    })
  })
}

const reveal = async () => {
  await nextTick()
  if (!rootRef.value || !stripRefs.value.length) return

  currentTimeline?.kill()

  return new Promise((resolve) => {
    gsap.set(rootRef.value, { autoAlpha: 1, pointerEvents: 'auto' })
    gsap.set(stripRefs.value, { transformOrigin: 'right center' })

    currentTimeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        gsap.set(rootRef.value, { autoAlpha: 0, pointerEvents: 'none' })
        gsap.set(stripRefs.value, { scaleX: 0, transformOrigin: 'left center' })
        resolve()
      },
    })

    currentTimeline.to(stripRefs.value, {
      scaleX: 0,
      duration: 0.62,
      stagger: 0.045,
    })
  })
}

defineExpose({ cover, reveal })

onMounted(() => {
  resetToClosedState()
  registerRouteCurtain({ cover, reveal })
})
</script>

<template>
  <div ref="rootRef" class="route-curtain" aria-hidden="true">
    <div class="route-curtain__inner">
      <span
        v-for="index in strips"
        :key="`strip-${index}`"
        :ref="(el) => setStripRef(el, index)"
        class="route-curtain__strip"
      ></span>
    </div>
  </div>
</template>

<style scoped>
.route-curtain {
  position: fixed;
  inset: 0;
  z-index: 20000;
  pointer-events: none;
}

.route-curtain__inner {
  display: grid;
  grid-template-columns: repeat(14, minmax(0, 1fr));
  gap: 0;
  width: 100%;
  height: 100%;
  padding: 0;
}

.route-curtain__strip {
  display: block;
  width: 100%;
  height: 100%;
  background: #0b0b0b;
  transform: scaleX(0);
  transform-origin: left center;
  will-change: transform;
}

@media (max-width: 768px) {
  .route-curtain__inner {
    grid-template-columns: repeat(10, minmax(0, 1fr));
    gap: 0;
    padding: 0;
  }
}
</style>
