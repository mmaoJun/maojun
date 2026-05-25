<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { registerRouteCurtain } from './routeCurtainController'
import RippleLoader from './RippleLoader.vue'

const DESKTOP_STRIP_COUNT = 14
const MOBILE_STRIP_COUNT = 10
const LOADER_REMAIN_MS_AFTER_COVER = 2.06
const stripRefs = ref([])
const rootRef = ref(null)
const loaderWrapRef = ref(null)
const loaderRunKey = ref(0)
let currentTimeline = null
let currentStripCount = 0

const buildStrips = (count) => Array.from({ length: count }, (_, index) => ({
  index,
  left: `${(100 / count) * index}%`,
  width: `calc(${100 / count}% + 2px)`,
}))

const getStripCount = () => (window.innerWidth <= 768 ? MOBILE_STRIP_COUNT : DESKTOP_STRIP_COUNT)
const strips = ref([])

const setStripRef = (el, index) => {
  if (el) stripRefs.value[index] = el
}

const syncViewport = () => {
  const nextCount = getStripCount()
  if (nextCount === currentStripCount) return
  currentStripCount = nextCount
  stripRefs.value = []
  strips.value = buildStrips(nextCount)
}

const prepareLoaderState = () => {
  if (!loaderWrapRef.value) return
  gsap.set(loaderWrapRef.value, {
    autoAlpha: 0,
    xPercent: -50,
    yPercent: -46,
    scale: 0.94,
    force3D: true,
  })
}

const prepareClosedState = () => {
  if (!rootRef.value || !stripRefs.value.length) return
  gsap.set(rootRef.value, { autoAlpha: 0, pointerEvents: 'none' })
  gsap.set(stripRefs.value, {
    scaleX: 0,
    xPercent: 0,
    rotation: 0.01,
    transformOrigin: 'left center',
    force3D: true,
  })
  prepareLoaderState()
}

const cover = async () => {
  await nextTick()
  if (!rootRef.value || !stripRefs.value.length) return

  currentTimeline?.kill()

  return new Promise((resolve) => {
    loaderRunKey.value += 1
    prepareLoaderState()
    gsap.set(rootRef.value, { autoAlpha: 1, pointerEvents: 'auto' })
    gsap.set(stripRefs.value, {
      scaleX: 0,
      xPercent: 0,
      transformOrigin: 'left center',
      force3D: true,
      rotation: 0.01,
    })

    currentTimeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: resolve,
    })

    currentTimeline.to(stripRefs.value, {
      scaleX: 1,
      duration: 0.64,
      stagger: 0.032,
      overwrite: true,
    })

    currentTimeline.to(loaderWrapRef.value, {
      autoAlpha: 1,
      scale: 1,
      xPercent: -50,
      yPercent: -50,
      duration: 0.22,
      ease: 'power2.out',
    }, 0.4)
  })
}

const reveal = async () => {
  await nextTick()
  if (!rootRef.value || !stripRefs.value.length) return

  currentTimeline?.kill()

  return new Promise((resolve) => {
    gsap.set(rootRef.value, { autoAlpha: 1, pointerEvents: 'auto' })
    gsap.set(stripRefs.value, {
      scaleX: 1,
      xPercent: 0,
      transformOrigin: 'right center',
      force3D: true,
      rotation: 0.01,
    })
    gsap.set(loaderWrapRef.value, {
      autoAlpha: 1,
      scale: 1,
      xPercent: -50,
      yPercent: -50,
      force3D: true,
    })

    currentTimeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        prepareClosedState()
        resolve()
      },
    })

    currentTimeline.to({}, {
      duration: LOADER_REMAIN_MS_AFTER_COVER,
    })

    currentTimeline.to(loaderWrapRef.value, {
      autoAlpha: 0,
      scale: 1.03,
      xPercent: -50,
      yPercent: -52,
      duration: 0.1,
      ease: 'power1.out',
    })

    currentTimeline.to(stripRefs.value, {
      scaleX: 0,
      duration: 0.4,
      stagger: 0.022,
      overwrite: true,
    }, '<')
  })
}

defineExpose({ cover, reveal })

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport, { passive: true })
  prepareClosedState()
  registerRouteCurtain({ cover, reveal })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport)
  currentTimeline?.kill()
})
</script>

<template>
  <div ref="rootRef" class="route-curtain" aria-hidden="true">
    <div class="route-curtain__inner">
      <span
        v-for="strip in strips"
        :key="`strip-${strip.index}`"
        :ref="(el) => setStripRef(el, strip.index)"
        class="route-curtain__strip"
        :style="{ left: strip.left, width: strip.width }"
      ></span>
    </div>

    <div ref="loaderWrapRef" class="route-curtain__loader-wrap">
      <RippleLoader :run-key="loaderRunKey" />
    </div>
  </div>
</template>

<style scoped>
.route-curtain {
  position: fixed;
  inset: 0;
  z-index: 20000;
  pointer-events: none;
  overflow: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);
  opacity: 0;
  visibility: hidden;
}

.route-curtain__inner {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.route-curtain__strip {
  position: absolute;
  top: -1px;
  bottom: -1px;
  display: block;
  background: #090909;
  transform: translateZ(0) scaleX(0);
  transform-origin: left center;
  will-change: transform;
  backface-visibility: hidden;
  contain: layout paint style;
}

.route-curtain__loader-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  pointer-events: none;
  opacity: 0;
  will-change: transform, opacity;
}
</style>
