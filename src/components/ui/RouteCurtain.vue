<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import gsap from 'gsap'
import { registerRouteCurtain } from './routeCurtainController'
import RippleLoader from './RippleLoader.vue'

// ── strip count responsive breakpoints ──
const DESKTOP_STRIP_COUNT = 16
const MOBILE_STRIP_COUNT = 12

// ── timing (seconds) — balanced between snappy & polished ──
const COVER_DURATION = 0.55
const COVER_STAGGER = 0.02
const LOADER_APPEAR_OFFSET = 0.35
const REVEAL_HOLD = 0.9 // pause so the loader animation registers
const REVEAL_DURATION = 0.38
const REVEAL_STAGGER = 0.015

const rootRef = ref(null)
const loaderWrapRef = ref(null)
const loaderRunKey = ref(0)
const stripRefs = shallowRef([])
const strips = ref([])
let currentTimeline = null
let currentStripCount = 0

// ── helpers ──
const getStripCount = () =>
  window.innerWidth <= 768 ? MOBILE_STRIP_COUNT : DESKTOP_STRIP_COUNT

const buildStrips = (count) =>
  Array.from({ length: count }, (_, i) => ({
    index: i,
    left: `${(100 / count) * i}%`,
    width: `calc(${100 / count}% + 2px)`,
  }))

const syncViewport = () => {
  const nextCount = getStripCount()
  if (nextCount === currentStripCount) return
  currentStripCount = nextCount
  strips.value = buildStrips(nextCount)
  // shallowRef — reassign after DOM flush so query works
  nextTick(() => {
    const all = rootRef.value?.querySelectorAll('.route-curtain__strip')
    if (all?.length) stripRefs.value = gsap.utils.toArray(all)
  })
}

// ── initialise / teardown states ──
const prepareLoaderHidden = () => {
  if (!loaderWrapRef.value) return
  gsap.set(loaderWrapRef.value, {
    autoAlpha: 0,
    xPercent: -50,
    yPercent: -46,
    scale: 0.94,
  })
}

const prepareClosedState = () => {
  if (!rootRef.value) return
  gsap.set(rootRef.value, { autoAlpha: 0, pointerEvents: 'none' })
  if (stripRefs.value.length) {
    gsap.set(stripRefs.value, {
      scaleX: 0,
      transformOrigin: 'left center',
    })
  }
  prepareLoaderHidden()
}

// ── public API: cover ──
const cover = async () => {
  await nextTick()
  if (!rootRef.value || !stripRefs.value.length) return

  currentTimeline?.kill()
  loaderRunKey.value += 1
  const stripsEl = stripRefs.value

  return new Promise((resolve) => {
    prepareLoaderHidden()
    gsap.set(rootRef.value, { autoAlpha: 1, pointerEvents: 'auto' })
    gsap.set(stripsEl, { scaleX: 0, transformOrigin: 'left center' })

    currentTimeline = gsap.timeline({ onComplete: resolve })

    // strips wipe in from left, short stagger for a crisp "shutter" feel
    currentTimeline.to(stripsEl, {
      scaleX: 1,
      duration: COVER_DURATION,
      stagger: COVER_STAGGER,
      ease: 'power3.inOut',
      overwrite: true,
    })

    // loader fades in slightly earlier so it's visible before strips finish
    currentTimeline.to(
      loaderWrapRef.value,
      {
        autoAlpha: 1,
        scale: 1,
        xPercent: -50,
        yPercent: -50,
        duration: 0.2,
        ease: 'power2.out',
      },
      LOADER_APPEAR_OFFSET,
    )
  })
}

// ── public API: reveal ──
const reveal = async () => {
  await nextTick()
  if (!rootRef.value || !stripRefs.value.length) return

  currentTimeline?.kill()
  const stripsEl = stripRefs.value

  return new Promise((resolve) => {
    gsap.set(rootRef.value, { autoAlpha: 1, pointerEvents: 'auto' })
    gsap.set(stripsEl, { scaleX: 1, transformOrigin: 'right center' })
    gsap.set(loaderWrapRef.value, {
      autoAlpha: 1,
      scale: 1,
      xPercent: -50,
      yPercent: -50,
    })

    currentTimeline = gsap.timeline({
      onComplete: () => {
        prepareClosedState()
        resolve()
      },
    })

    // brief hold — gives the user a beat to register the transition
    currentTimeline.to({}, { duration: REVEAL_HOLD })

    // loader fades out quickly
    currentTimeline.to(loaderWrapRef.value, {
      autoAlpha: 0,
      scale: 1.03,
      xPercent: -50,
      yPercent: -52,
      duration: 0.1,
      ease: 'power1.out',
    })

    // strips wipe out to right, overlapping with loader fade
    currentTimeline.to(
      stripsEl,
      {
        scaleX: 0,
        duration: REVEAL_DURATION,
        stagger: REVEAL_STAGGER,
        ease: 'power3.inOut',
        overwrite: true,
      },
      '<',
    )
  })
}

defineExpose({ cover, reveal })

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport, { passive: true })
  nextTick(prepareClosedState)
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
        :key="`s-${strip.index}`"
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
  background: #c9fe6e;
  transform: scaleX(0);
  transform-origin: left center;
  /* no will-change — GSAP sets it during animations, stale will-change wastes GPU memory */
}

.route-curtain__loader-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  pointer-events: none;
  opacity: 0;
}
</style>
