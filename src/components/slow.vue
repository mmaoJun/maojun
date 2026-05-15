<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const sliderData = [
  { title: '千と千尋', year: '2019', img: '/media-slow/p2181503417.webp', url: 'https://movie.douban.com/subject/1291561/' },
  { title: '教父', year: '1972', img: '/media-slow/p2205148825.webp', url: 'https://movie.douban.com/subject/1291841/' },
  { title: '燃烧 버닝', year: '2018', img: '/media-slow/p2542529344.webp', url: 'https://movie.douban.com/subject/26842702/' },
  { title: '新世界', year: '2013', img: '/media-slow/p2561886540.webp', url: 'https://movie.douban.com/subject/10437779/' },
  { title: '寄生虫', year: '2019', img: '/media-slow/p2565216182.webp', url: 'https://movie.douban.com/subject/27010768/' },
  { title: '杀人回忆', year: '2003', img: '/media-slow/p2576658975.webp', url: 'https://movie.douban.com/subject/1300299/' },
  { title: '花束般的恋爱', year: '2022', img: '/media-slow/p2674630000.webp', url: 'https://movie.douban.com/subject/34874432/' },
  { title: '余生那些年', year: '2023', img: '/media-slow/p2868242100.webp', url: 'https://movie.douban.com/subject/35418583/' },
  { title: '君の名は。', year: '2016', img: '/media-slow/p2906091728.webp', url: 'https://movie.douban.com/subject/26683290/' },
]

const rootRef = ref(null)
const trackRef = ref(null)

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
  SCROLL_SPEED: 1.75,
  LERP_FACTOR: 0.05,
  MAX_VELOCITY: 150,
  ENTRANCE_DURATION: 1200,
}

const totalSlideCount = sliderData.length

const state = {
  currentX: 0,
  targetX: 0,
  slideWidth: 390,
  slides: [],
  isDragging: false,
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
}

let rafId = 0
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

  const imageContainer = document.createElement('div')
  imageContainer.className = 'slide-image'

  const img = document.createElement('img')
  const slideDataIndex = index % totalSlideCount
  img.src = sliderData[slideDataIndex].img
  img.alt = sliderData[slideDataIndex].title

  const overlay = document.createElement('div')
  overlay.className = 'slide-overlay'

  const year = document.createElement('p')
  year.className = 'project-year'
  year.textContent = sliderData[slideDataIndex].year

  const centerTitle = document.createElement('p')
  centerTitle.className = 'project-title-center'
  centerTitle.textContent = sliderData[slideDataIndex].title

  const title = document.createElement('p')
  title.className = 'project-title'
  title.textContent = sliderData[slideDataIndex].title

  slide.addEventListener('click', (event) => {
    event.preventDefault()
    if (state.dragDistance < 10 && !state.hasActuallyDragged) {
      window.location.href = sliderData[slideDataIndex].url
    }
  })

  overlay.appendChild(title)
  slide.appendChild(year)
  slide.appendChild(centerTitle)
  imageContainer.appendChild(img)
  slide.appendChild(imageContainer)
  slide.appendChild(overlay)

  return slide
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

  const startOffset = -(totalSlideCount * state.slideWidth * 2)
  state.currentX = startOffset
  state.targetX = startOffset
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

  document.documentElement.style.setProperty('--slow-card-entrance-top-inset', `${topInset.toFixed(2)}%`)
}

function animate() {
  state.currentX += (state.targetX - state.currentX) * config.LERP_FACTOR
  updateEntranceAnimation()
  updateMovingState()
  updateSlidePositions()
  updateParallax()
  stepCursorRingFollow()
  rafId = requestAnimationFrame(animate)
}

function handleWheel(event) {
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return

  event.preventDefault()
  state.lastScrollTime = Date.now()

  const scrollDelta = event.deltaY * config.SCROLL_SPEED
  state.targetX -= Math.max(Math.min(scrollDelta, config.MAX_VELOCITY), -config.MAX_VELOCITY)
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
  window.setTimeout(() => {
    state.hasActuallyDragged = false
  }, 100)
}

function handleResize() {
  initializeSlides()
}

function initializeEventListeners() {
  const slider = rootRef.value?.querySelector('.slider')
  if (!slider) return

  slider.addEventListener('wheel', handleWheel, { passive: false })
  slider.addEventListener('touchstart', handleTouchStart)
  slider.addEventListener('touchmove', handleTouchMove)
  slider.addEventListener('touchend', handleTouchEnd)
  slider.addEventListener('mousedown', handleMouseDown)
  slider.addEventListener('mouseleave', handleMouseUp)
  slider.addEventListener('dragstart', (event) => event.preventDefault())

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('resize', handleResize)

  cleanups.push(() => {
    slider.removeEventListener('wheel', handleWheel)
    slider.removeEventListener('touchstart', handleTouchStart)
    slider.removeEventListener('touchmove', handleTouchMove)
    slider.removeEventListener('touchend', handleTouchEnd)
    slider.removeEventListener('mousedown', handleMouseDown)
    slider.removeEventListener('mouseleave', handleMouseUp)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('resize', handleResize)
  })
}

function initializeSlider() {
  initializeSlides()
  initializeEventListeners()
  state.entranceProgress = 0
  state.entranceStartAt = performance.now()
  document.documentElement.style.setProperty('--slow-card-entrance-top-inset', '90%')
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
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  cleanups.forEach((fn) => fn())
  document.documentElement.style.removeProperty('--slider-moving')
  document.documentElement.style.removeProperty('--slow-card-entrance-top-inset')
})
</script>

<template>
  <main ref="rootRef" class="slow-page">
    <div class="slider">
      <div ref="trackRef" class="slide-track"></div>
    </div>
    <div
      v-if="cursorRingEnabled"
      v-show="showCursorRing"
      class="slow-cursor-ring"
      :style="{ left: `${ringX}px`, top: `${ringY}px` }"
      aria-hidden="true"
    >
      <div
        class="slow-cursor-ring__disc"
        :class="{ 'slow-cursor-ring__disc--compact': ringOverSlide }"
      />
    </div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.slow-page {
  font-family: 'DM Mono', monospace;
  background-color: #0f0f0f;
  color: #fff;
  min-height: 100svh;
}

.slow-cursor-ring {
  position: fixed;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 10001;
  transform: translate(-50%, -50%);
  will-change: left, top;
}

.slow-cursor-ring__disc {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(254, 66, 73, 1);
  transform: scale(1);
  transform-origin: 50% 50%;
  transition: transform 0.52s cubic-bezier(0.22, 1.18, 0.36, 1);
  will-change: transform;
}

.slow-cursor-ring__disc--compact {
  transform: scale(0.2632);
  transition: transform 0.34s cubic-bezier(0.32, 0.72, 0.2, 1);
}

.slow-page :deep(a),
.slow-page :deep(p) {
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
  clip-path: inset(var(--slow-card-entrance-top-inset, 0%) 0 0 0);
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
  bottom: -1.75rem;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.8rem;
  pointer-events: none;
  z-index: 10;
}

.slider :deep(.slide:hover .slide-overlay) {
  opacity: 1;
}

.slider :deep(.project-year) {
  position: absolute;
  top: -1.75rem;
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

.slider :deep(.project-title) {
  font-weight: 500;
  font-size: 0.8rem;
  opacity: 0;
  transform: translate3d(0, 1.1rem, 0);
  transition: opacity 0.34s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.slider :deep(.slide:hover .project-title) {
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
  .slider :deep(.slide) {
    width: 210px;
    height: 300px;
    margin: 0 12px;
  }
}
</style>
