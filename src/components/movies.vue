<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { subscribeRouteRevealStart } from './ui/routeCurtainController'
import StoryScroll from './ui/StoryScroll.vue'
import { moviesPageConfig } from '../config/siteContent'

const sliderData = moviesPageConfig.sliderItems

const rootRef = ref(null)
const trackRef = ref(null)
const activeSlideIndex = ref(0)

const totalMoviesLabel = computed(() => String(totalSlideCount).padStart(2, '0'))
const activeMovie = computed(() => sliderData[activeSlideIndex.value] ?? sliderData[0])
const activeMovieIndexLabel = computed(() => String(activeSlideIndex.value + 1).padStart(2, '0'))

/** 仅精细指针设备显示自定义圆球（不替代系统光标）；pointer 为光标，ring 为滞后追赶 */
const cursorRingEnabled = ref(false)
const showCursorRing = ref(false)
const ringOverSlide = ref(false)
const pointerX = ref(0)
const pointerY = ref(0)
const ringX = ref(0)
const ringY = ref(0)
let cursorRingNeedsSnap = true

const RING_FOLLOW = {
  /** 距离越远系数越大，便于追上快速移动 */
  K_MIN: 0.1,
  K_MAX: 0.42,
  DIST_SCALE: 0.0024,
  SNAP_EPS2: 0.25,
}

const config = {
  ENTRANCE_DURATION: 1200,
  ENTRY_DRIFT_SPEED: 0.2,
  ACTIVE_SLIDE_UPDATE_INTERVAL: 90,
  DRAG_LERP: 0.22,
  RELEASE_LERP: 0.12,
  HOVER_DECEL: 0.085,
  HOVER_ACCEL: 0.045,
}

const totalSlideCount = sliderData.length

const state = {
  currentX: 0,
  targetX: 0,
  slideWidth: 390,
  slides: [],
  isDragging: false,
  hoveredSlideCount: 0,
  startX: 0,
  lastX: 0,
  lastMouseX: 0,
  lastScrollTime: Date.now(),
  isMoving: false,
  velocity: 0,
  lastCurrentX: 0,
  dragDistance: 0,
  hasActuallyDragged: false,
  isMobile: false,
  entranceProgress: 0,
  entranceStartAt: 0,
  autoSpeed: 0,
  renderedSpeed: 0,
  lastFrameAt: 0,
  lastActiveSlideUpdateAt: 0,
}

let rafId = 0
let unsubscribeRevealStart = null
const cleanups = []

function checkMobile() {
  state.isMobile = window.innerWidth < 1000
}

function createSlideElement(index) {
  const slide = document.createElement('div')
  slide.className = 'slide'

  if (state.isMobile) {
    slide.style.width = '210px'
    slide.style.height = '300px'
  }

  slide.addEventListener('mouseenter', handleSlideMouseEnter)
  slide.addEventListener('mouseleave', handleSlideMouseLeave)

  const imageContainer = document.createElement('div')
  imageContainer.className = 'slide-image'

  const img = document.createElement('img')
  const slideDataIndex = index % totalSlideCount
  const slideData = sliderData[slideDataIndex]
  slide.dataset.movieIndex = String(slideDataIndex)
  img.src = slideData.img
  img.alt = slideData.title
  img.loading = 'lazy'
  img.decoding = 'async'

  const overlay = document.createElement('div')
  overlay.className = 'slide-overlay'

  const year = document.createElement('p')
  year.className = 'project-year'
  year.textContent = slideData.year

  const centerTitle = document.createElement('p')
  centerTitle.className = 'project-title-center'
  centerTitle.textContent = slideData.title

  const title = document.createElement('p')
  title.className = 'project-title'
  title.textContent = slideData.title

  const detail = document.createElement('p')
  detail.className = 'project-detail'
  detail.textContent = `${String(slideDataIndex + 1).padStart(2, '0')} / ${String(totalSlideCount).padStart(2, '0')}`

  slide.addEventListener('click', (event) => {
    event.preventDefault()
    if (state.dragDistance < 10 && !state.hasActuallyDragged) {
      window.open(slideData.url, '_blank', 'noopener,noreferrer')
    }
  })

  slide.appendChild(year)
  slide.appendChild(centerTitle)
  overlay.appendChild(title)
  overlay.appendChild(detail)
  imageContainer.appendChild(img)
  slide.appendChild(imageContainer)
  slide.appendChild(overlay)

  return slide
}

function resetEntrySlide() {
  const startOffset = -(totalSlideCount * state.slideWidth * 2)
  state.currentX = startOffset
  state.targetX = startOffset
  state.lastCurrentX = state.currentX
  state.entranceProgress = 0
  state.entranceStartAt = performance.now()
  state.lastFrameAt = state.entranceStartAt
  state.autoSpeed = config.ENTRY_DRIFT_SPEED
  state.renderedSpeed = config.ENTRY_DRIFT_SPEED
  document.documentElement.style.setProperty('--movies-card-entrance-top-inset', '90%')
}

function initializeSlides() {
  const track = trackRef.value
  if (!track) return

  track.innerHTML = ''
  state.slides = []

  checkMobile()

  const copies = 6
  const totalSlides = totalSlideCount * copies

  for (let i = 0; i < totalSlides; i += 1) {
    const slide = createSlideElement(i)
    track.appendChild(slide)
    state.slides.push(slide)
  }

  const firstSlide = state.slides[0]
  if (firstSlide) {
    const computedStyle = window.getComputedStyle(firstSlide)
    const marginLeft = Number.parseFloat(computedStyle.marginLeft) || 0
    const marginRight = Number.parseFloat(computedStyle.marginRight) || 0
    state.slideWidth = firstSlide.offsetWidth + marginLeft + marginRight
  }

  resetEntrySlide()
}

function updateSlidePositions() {
  const track = trackRef.value
  if (!track) return

  const sequenceWidth = state.slideWidth * totalSlideCount

  if (state.currentX > -sequenceWidth * 1) {
    state.currentX -= sequenceWidth
    state.targetX -= sequenceWidth
  } else if (state.currentX < -sequenceWidth * 4) {
    state.currentX += sequenceWidth
    state.targetX += sequenceWidth
  }

  track.style.transform = `translate3d(${state.currentX}px, 0, 0)`
}

function updateParallax() {
  const viewportCenter = window.innerWidth / 2
  const easedEntrance = 1 - (1 - state.entranceProgress) ** 3
  const imageScale = 7 - (4.82 * easedEntrance)

  state.slides.forEach((slide) => {
    const img = slide.querySelector('img')
    if (!img) return

    const slideRect = slide.getBoundingClientRect()
    if (slideRect.right < -500 || slideRect.left > window.innerWidth + 500) return

    const slideCenter = slideRect.left + slideRect.width / 2
    const distanceFromCenter = slideCenter - viewportCenter
    const parallaxOffset = distanceFromCenter * -0.25

    img.style.transform = `translateX(${parallaxOffset}px) scale(${imageScale})`
  })
}

function updateMovingState() {
  state.velocity = Math.abs(state.currentX - state.lastCurrentX)
  state.lastCurrentX = state.currentX

  const isSlowEnough = state.velocity < 0.1
  const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200
  state.isMoving = state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough

  document.documentElement.style.setProperty('--slider-moving', state.isMoving ? '1' : '0')
}

function updateEntranceAnimation() {
  if (state.entranceProgress >= 1) return

  const elapsed = performance.now() - state.entranceStartAt
  const rawProgress = Math.min(elapsed / config.ENTRANCE_DURATION, 1)
  state.entranceProgress = rawProgress

  const easedProgress = 1 - (1 - rawProgress) ** 3
  const topInset = 90 - (90 * easedProgress)

  document.documentElement.style.setProperty('--movies-card-entrance-top-inset', `${topInset.toFixed(2)}%`)
}

function updateActiveSlide(force = false) {
  if (!state.slides.length) return

  const now = performance.now()
  if (!force && now - state.lastActiveSlideUpdateAt < config.ACTIVE_SLIDE_UPDATE_INTERVAL) {
    return
  }

  state.lastActiveSlideUpdateAt = now

  const viewportCenter = window.innerWidth / 2
  let bestIndex = activeSlideIndex.value
  let minDistance = Number.POSITIVE_INFINITY

  state.slides.forEach((slide) => {
    const rect = slide.getBoundingClientRect()
    if (rect.right < 0 || rect.left > window.innerWidth) return

    const slideCenter = rect.left + rect.width / 2
    const distance = Math.abs(slideCenter - viewportCenter)

    if (distance < minDistance) {
      minDistance = distance
      bestIndex = Number.parseInt(slide.dataset.movieIndex || '0', 10)
    }
  })

  activeSlideIndex.value = Number.isNaN(bestIndex) ? 0 : bestIndex
}

function animate() {
  const now = performance.now()
  const deltaMs = state.lastFrameAt ? (now - state.lastFrameAt) : 16.67
  state.lastFrameAt = now

  updateEntranceAnimation()

  if (state.isDragging) {
    state.currentX += (state.targetX - state.currentX) * config.DRAG_LERP
  } else {
    state.autoSpeed = config.ENTRY_DRIFT_SPEED
    const targetSpeed = state.hoveredSlideCount > 0 ? 0 : state.autoSpeed
    const speedLerp = state.hoveredSlideCount > 0 ? config.HOVER_DECEL : config.HOVER_ACCEL
    state.renderedSpeed += (targetSpeed - state.renderedSpeed) * speedLerp
    state.currentX -= state.renderedSpeed * deltaMs
    state.targetX = state.currentX
  }

  updateMovingState()
  updateSlidePositions()
  updateActiveSlide()
  updateParallax()
  stepCursorRingFollow()
  rafId = requestAnimationFrame(animate)
}

function handleTouchStart(event) {
  state.isDragging = true
  state.startX = event.touches[0].clientX
  state.lastX = state.targetX
  state.dragDistance = 0
  state.hasActuallyDragged = false
  state.lastScrollTime = Date.now()
}

function handleTouchMove(event) {
  if (!state.isDragging) return

  const deltaX = (event.touches[0].clientX - state.startX) * 1.5
  state.targetX = state.lastX + deltaX
  state.dragDistance = Math.abs(deltaX)

  if (state.dragDistance > 5) {
    state.hasActuallyDragged = true
  }

  state.lastScrollTime = Date.now()
}

function handleTouchEnd() {
  state.isDragging = false
  window.setTimeout(() => {
    state.hasActuallyDragged = false
  }, 100)
}

function handleMouseDown(event) {
  event.preventDefault()
  state.isDragging = true
  state.startX = event.clientX
  state.lastMouseX = event.clientX
  state.lastX = state.targetX
  state.dragDistance = 0
  state.hasActuallyDragged = false
  state.lastScrollTime = Date.now()
}

function handleMouseMove(event) {
  if (!state.isDragging) return

  event.preventDefault()
  const deltaX = (event.clientX - state.lastMouseX) * 2
  state.targetX += deltaX
  state.lastMouseX = event.clientX
  state.dragDistance += Math.abs(deltaX)

  if (state.dragDistance > 5) {
    state.hasActuallyDragged = true
  }

  state.lastScrollTime = Date.now()
}

function handleMouseUp() {
  state.isDragging = false
  state.lastX = state.targetX
  window.setTimeout(() => {
    state.hasActuallyDragged = false
  }, 100)
}

function handleSlideMouseEnter() {
  state.hoveredSlideCount += 1
}

function handleSlideMouseLeave() {
  state.hoveredSlideCount = Math.max(0, state.hoveredSlideCount - 1)
}

function handleResize() {
  initializeSlides()
}

function initializeEventListeners() {
  const slider = rootRef.value?.querySelector('.slider')
  if (!slider) return

  slider.addEventListener('touchstart', handleTouchStart)
  slider.addEventListener('touchmove', handleTouchMove)
  slider.addEventListener('touchend', handleTouchEnd)
  slider.addEventListener('mousedown', handleMouseDown)
  slider.addEventListener('dragstart', (event) => event.preventDefault())

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('resize', handleResize)

  cleanups.push(() => {
    slider.removeEventListener('touchstart', handleTouchStart)
    slider.removeEventListener('touchmove', handleTouchMove)
    slider.removeEventListener('touchend', handleTouchEnd)
    slider.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('resize', handleResize)
  })
}

function initializeSlider() {
  initializeSlides()
  initializeEventListeners()
  resetEntrySlide()
  updateActiveSlide(true)
  animate()
}

function stepCursorRingFollow() {
  if (!cursorRingEnabled.value || !showCursorRing.value) return
  const tx = pointerX.value
  const ty = pointerY.value
  const dx = tx - ringX.value
  const dy = ty - ringY.value
  const distSq = dx * dx + dy * dy
  if (distSq < RING_FOLLOW.SNAP_EPS2) {
    ringX.value = tx
    ringY.value = ty
    return
  }
  const dist = Math.sqrt(distSq)
  const k = Math.min(
    RING_FOLLOW.K_MAX,
    RING_FOLLOW.K_MIN + dist * RING_FOLLOW.DIST_SCALE,
  )
  ringX.value += dx * k
  ringY.value += dy * k
}

function onWindowMouseMoveForRing(event) {
  pointerX.value = event.clientX
  pointerY.value = event.clientY
  if (cursorRingNeedsSnap) {
    ringX.value = event.clientX
    ringY.value = event.clientY
    cursorRingNeedsSnap = false
  }
  const el = event.target
  if (el && typeof el.closest === 'function') {
    const isOverSlide = Boolean(el.closest('.slide') && rootRef.value?.contains(el.closest('.slide')))
    const isOverNav = Boolean(el.closest('.hero-nav'))
    ringOverSlide.value = isOverSlide || isOverNav
  } else {
    ringOverSlide.value = false
  }
  showCursorRing.value = true
}

function hideCursorRing() {
  showCursorRing.value = false
  cursorRingNeedsSnap = true
}

function initCursorRing() {
  if (!window.matchMedia('(pointer: fine)').matches) {
    cursorRingEnabled.value = false
    return
  }
  cursorRingEnabled.value = true
  window.addEventListener('mousemove', onWindowMouseMoveForRing, { passive: true })
  window.addEventListener('blur', hideCursorRing)
  window.addEventListener('mouseout', onWindowMouseOutForRing, { passive: true })
  cleanups.push(() => {
    window.removeEventListener('mousemove', onWindowMouseMoveForRing)
    window.removeEventListener('blur', hideCursorRing)
    window.removeEventListener('mouseout', onWindowMouseOutForRing)
  })
}

function onWindowMouseOutForRing(event) {
  const rel = event.relatedTarget
  if (rel == null || (rel instanceof Node && !document.documentElement.contains(rel))) {
    hideCursorRing()
  }
}

onMounted(async () => {
  await nextTick()
  initializeSlider()
  initCursorRing()
  unsubscribeRevealStart = subscribeRouteRevealStart(() => {
    if (!rootRef.value?.isConnected) return
    resetEntrySlide()
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  unsubscribeRevealStart?.()
  cleanups.forEach((fn) => fn())
  document.documentElement.style.removeProperty('--slider-moving')
  document.documentElement.style.removeProperty('--movies-card-entrance-top-inset')
})
</script>

<template>
  <div class="movies-page-shell">
    <main ref="rootRef" class="movies-page">
      <div class="movies-active-panel" aria-live="polite">
        <p class="movies-active-panel__index">{{ activeMovieIndexLabel }} / {{ totalMoviesLabel }}</p>
        <div class="movies-active-panel__content">
          <p class="movies-active-panel__label">Now centered</p>
          <h2 class="movies-active-panel__title">{{ activeMovie?.title }}</h2>
          <p class="movies-active-panel__meta">{{ activeMovie?.year }}</p>
        </div>
      </div>

      <div class="movies-hero-tip" aria-hidden="true">
        <span>Drag</span>
        <span class="movies-hero-tip__divider"></span>
        <span>Hover</span>
        <span class="movies-hero-tip__divider"></span>
        <span>Open</span>
      </div>

      <div class="slider">
        <div ref="trackRef" class="slide-track"></div>
      </div>
      <div
        v-if="cursorRingEnabled"
        v-show="showCursorRing"
        class="movies-cursor-ring"
        :style="{ left: `${ringX}px`, top: `${ringY}px` }"
        aria-hidden="true"
      >
        <div
          class="movies-cursor-ring__disc"
          :class="{ 'movies-cursor-ring__disc--compact': ringOverSlide }"
        />
      </div>
    </main>

    <StoryScroll />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.movies-page-shell {
  background-color: #0f0f0f;
}

.movies-page {
  font-family: 'DM Mono', monospace;
  color: #fff;
  min-height: 100svh;
  background-color: #0f0f0f;
}

.movies-page > * {
  position: relative;
  z-index: 1;
}

.movies-active-panel {
  position: absolute;
  right: clamp(1rem, 4vw, 3.25rem);
  top: clamp(0.35rem, 1.4vw, 1rem);
  width: min(19rem, calc(100vw - 2rem));
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  backdrop-filter: none;
  box-shadow: none;
}

.movies-active-panel__index,
.movies-active-panel__label,
.movies-hero-tip {
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.movies-active-panel__index,
.movies-active-panel__label,
.movies-hero-tip {
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.movies-active-panel__index,
.movies-active-panel__label {
  font-size: 0.68rem;
  color: rgb(255 255 255 / 0.56);
}

.movies-active-panel__content {
  display: grid;
  gap: 0.4rem;
}

.movies-active-panel__title {
  font-size: clamp(1.4rem, 2.8vw, 2.3rem);
  line-height: 1;
  letter-spacing: -0.05em;
  margin-top: 0.35rem;
}

.movies-active-panel__meta {
  color: rgb(255 255 255 / 0.7);
  font-size: 0.88rem;
}

.movies-hero-tip {
  position: absolute;
  left: clamp(1rem, 4vw, 3.25rem);
  bottom: clamp(1rem, 4vw, 2.25rem);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: rgb(255 255 255 / 0.58);
  font-size: 0.68rem;
  pointer-events: none;
}

.movies-hero-tip__divider {
  width: 1.75rem;
  height: 1px;
  background: rgb(255 255 255 / 0.22);
}

.movies-cursor-ring {
  position: fixed;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 10001;
  transform: translate(-50%, -50%);
  will-change: left, top;
}

.movies-cursor-ring__disc {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(254, 66, 73, 1);
  transform: scale(1);
  transform-origin: 50% 50%;
  transition: transform 0.52s cubic-bezier(0.22, 1.18, 0.36, 1);
  will-change: transform;
}

.movies-cursor-ring__disc--compact {
  transform: scale(0.2632);
  transition: transform 0.34s cubic-bezier(0.32, 0.72, 0.2, 1);
}

.movies-page :deep(a),
.movies-page :deep(p) {
  display: block;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 500;
}

.slider {
  position: relative;
  width: 100vw;
  height: 100svh;
  overflow: hidden;
  user-select: none;
  cursor: grab;
}

.slider::before,
.slider::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: clamp(3rem, 8vw, 7rem);
  z-index: 2;
  pointer-events: none;
}

.slider::before {
  left: 0;
  background: linear-gradient(90deg, #0c0c0c 0%, transparent 100%);
}

.slider::after {
  right: 0;
  background: linear-gradient(270deg, #0c0c0c 0%, transparent 100%);
}

.slider:active {
  cursor: grabbing;
}

.slider :deep(.slide-track) {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
}

.slider :deep(.slide) {
  flex-shrink: 0;
  width: 430px;
  height: 620px;
  margin: 0 50px;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  overflow: visible;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.slider :deep(.slide-image) {
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: inset(var(--movies-card-entrance-top-inset, 0%) 0 0 0);
  will-change: clip-path;
}

.slider :deep(.slide-image img) {
  width: 100%;
  height: 45%;
  object-fit: cover;
  will-change: transform;
  object-position: center;
  transform: scale(2.25);
  user-select: none;
}

.slider :deep(.slide-overlay) {
  position: absolute;
  bottom: -2rem;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  pointer-events: none;
  z-index: 10;
}

.slider :deep(.project-year) {
  position: absolute;
  top: -1.9rem;
  right: 0;
  font-weight: 500;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-align: right;
  pointer-events: none;
  z-index: 11;
  opacity: 0;
  transform: translate3d(0, 1.1rem, 0);
  transition: opacity 0.34s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.slider :deep(.slide:hover .project-year) {
  opacity: calc(1 - var(--slider-moving, 1));
  transform: translate3d(0, 0, 0);
}

.slider :deep(.project-title-center) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) perspective(1400px) rotateX(-88deg) scale(0.96);
  transform-origin: 50% 0%;
  width: max-content;
  max-width: none;
  padding: 0 1rem;
  font-size: clamp(3.2rem, 7.2vw, 7rem);
  line-height: 0.86;
  letter-spacing: 0.08em;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9;
  opacity: 0;
  transition: opacity 0.38s ease, transform 1.18s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.slider :deep(.slide:hover .project-title-center) {
  opacity: calc(1 - var(--slider-moving, 1));
  transform: translate(-50%, -50%) perspective(1400px) rotateX(0deg) scale(1);
}

.slider :deep(.project-title),
.slider :deep(.project-detail) {
  opacity: 0;
  transform: translate3d(0, 1.1rem, 0);
  transition: opacity 0.34s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.slider :deep(.project-title) {
  font-weight: 500;
  font-size: 0.8rem;
}

.slider :deep(.project-detail) {
  color: rgb(255 255 255 / 0.58);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
}

.slider :deep(.slide:hover .project-title),
.slider :deep(.slide:hover .project-detail) {
  opacity: calc(1 - var(--slider-moving, 1));
  transform: translate3d(0, 0, 0);
}

.slider :deep(.project-arrow) {
  display: none;
}

.slider :deep(.project-arrow svg) {
  display: none;
}

@media (max-width: 1000px) {
  .movies-active-panel {
    left: auto;
    right: 1rem;
    top: 0.75rem;
    bottom: auto;
    width: min(13rem, calc(100vw - 2rem));
    padding: 0;
    border-radius: 0;
  }

  .movies-active-panel__title {
    font-size: 1.15rem;
  }

  .movies-active-panel__meta {
    font-size: 0.78rem;
  }

  .movies-hero-tip {
    display: none;
  }

  .slider :deep(.slide) {
    width: 210px;
    height: 300px;
    margin: 0 12px;
  }

  .slider :deep(.slide-overlay) {
    bottom: -1.55rem;
  }

  .slider :deep(.project-year) {
    top: -1.45rem;
    font-size: 0.68rem;
  }

  .slider :deep(.project-title-center) {
    font-size: clamp(1.8rem, 8vw, 3rem);
  }

  .slider :deep(.project-title) {
    font-size: 0.68rem;
  }

  .slider :deep(.project-detail) {
    font-size: 0.62rem;
  }
}
</style>
