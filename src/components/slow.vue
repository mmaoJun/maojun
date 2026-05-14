<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const sliderData = [
  {
    title: 'Echoes of Silence',
    img: '/media-slow/微信图片_20260308223702_20_1.jpg',
    url: '/movies',
  },
  {
    title: 'Floral Circuit',
    img: '/media-slow/微信图片_20260310101208_11_50.jpg',
    url: '/pictures',
  },
  {
    title: 'Synthetic Horizon',
    img: '/media-slow/微信图片_20260310101209_12_50.jpg',
    url: '/about',
  },
  {
    title: 'Silent Frame',
    img: '/media-slow/微信图片_20260310101211_14_50.jpg',
    url: '/slow',
  },
]

const rootRef = ref(null)
const trackRef = ref(null)

const config = {
  SCROLL_SPEED: 1.28,
  LERP_FACTOR: 0.042,
  MAX_VELOCITY: 110,
  TRACK_ROTATION: 12.5,
  TRACK_SLOPE_RATIO: 0.19,
  IMAGE_FOLLOW_FACTOR: 0.035,
  IMAGE_PARALLAX_RATIO: 0.18,
}

const totalSlideCount = sliderData.length

const state = {
  currentX: 0,
  targetX: 0,
  renderedX: 0,
  slideWidth: 390,
  sequenceWidth: 0,
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
    slide.style.width = '175px'
    slide.style.height = '250px'
  }

  const dataIndex = index % totalSlideCount
  const staggerCycle = state.isMobile ? [-26, 26] : [-34, 34]
  slide.style.setProperty('--stagger-offset', `${staggerCycle[dataIndex % staggerCycle.length]}px`)

  const imageContainer = document.createElement('div')
  imageContainer.className = 'slide-image'

  const img = document.createElement('img')
  img.src = sliderData[dataIndex].img
  img.alt = sliderData[dataIndex].title
  img.dataset.parallaxCurrent = '0'
  img.dataset.parallaxTarget = '0'

  const overlay = document.createElement('div')
  overlay.className = 'slide-overlay'

  const title = document.createElement('p')
  title.className = 'project-title'
  title.textContent = sliderData[dataIndex].title

  const arrow = document.createElement('div')
  arrow.className = 'project-arrow'
  arrow.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M7 17L17 7M17 7H7M17 7V17"/>
    </svg>
  `

  slide.addEventListener('click', (event) => {
    event.preventDefault()
    if (state.dragDistance < 10 && !state.hasActuallyDragged) {
      window.location.href = sliderData[dataIndex].url
    }
  })

  overlay.appendChild(title)
  overlay.appendChild(arrow)
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
  const firstSequenceNextSlide = state.slides[totalSlideCount]

  if (firstSlide) {
    state.slideWidth = firstSlide.getBoundingClientRect().width
    const slideStyles = window.getComputedStyle(firstSlide)
    state.slideWidth += Number.parseFloat(slideStyles.marginLeft || '0')
    state.slideWidth += Number.parseFloat(slideStyles.marginRight || '0')
  }

  state.sequenceWidth = firstSequenceNextSlide
    ? firstSequenceNextSlide.offsetLeft - firstSlide.offsetLeft
    : state.slideWidth * totalSlideCount

  const startOffset = -(state.sequenceWidth * 2)
  state.currentX = startOffset
  state.targetX = startOffset
  state.renderedX = startOffset
}

function wrapValue(value, min, max) {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

function updateSlidePositions() {
  const track = trackRef.value
  if (!track) return

  const sequenceWidth = state.sequenceWidth || state.slideWidth * totalSlideCount
  const minX = -sequenceWidth * 4
  const maxX = -sequenceWidth
  const angleRad = (config.TRACK_ROTATION * Math.PI) / 180

  state.renderedX = wrapValue(state.currentX, minX, maxX)

  const translateX = state.renderedX * Math.cos(angleRad)
  const translateY = state.renderedX * Math.sin(angleRad)
  track.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotate(${config.TRACK_ROTATION}deg)`
}

function updateParallax() {
  const viewportCenter = window.innerWidth / 2

  state.slides.forEach((slide) => {
    const img = slide.querySelector('img')
    if (!img) return

    const slideRect = slide.getBoundingClientRect()
    if (slideRect.right < -500 || slideRect.left > window.innerWidth + 500) return

    const imgRect = img.getBoundingClientRect()
    const slideCenter = slideRect.left + slideRect.width / 2
    const distanceFromCenter = slideCenter - viewportCenter
    const normalizedOffset = Math.max(-1, Math.min(1, distanceFromCenter / (viewportCenter + slideRect.width / 2)))
    const maxRevealOffset = Math.max(0, (imgRect.width - slideRect.width) / 2)
    const targetParallax = normalizedOffset * maxRevealOffset * config.IMAGE_PARALLAX_RATIO
    const currentParallax = Number.parseFloat(img.dataset.parallaxCurrent || '0')
    const nextParallax = currentParallax + (targetParallax - currentParallax) * config.IMAGE_FOLLOW_FACTOR

    img.dataset.parallaxTarget = String(targetParallax)
    img.dataset.parallaxCurrent = String(nextParallax)
    img.style.setProperty('--parallax-offset', `${nextParallax}px`)
  })
}

function updateMovingState() {
  state.velocity = Math.abs(state.renderedX - state.lastCurrentX)
  state.lastCurrentX = state.renderedX

  const isSlowEnough = state.velocity < 0.1
  const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200
  state.isMoving = state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough

  document.documentElement.style.setProperty('--slider-moving', state.isMoving ? '1' : '0')
}

function animate() {
  state.currentX += (state.targetX - state.currentX) * config.LERP_FACTOR
  updateMovingState()
  updateSlidePositions()
  updateParallax()
  rafId = requestAnimationFrame(animate)
}

function handleWheel(event) {
  event.preventDefault()
  state.lastScrollTime = Date.now()

  const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
  const scrollDelta = dominantDelta * config.SCROLL_SPEED
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
  animate()
}

onMounted(async () => {
  await nextTick()
  initializeSlider()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  cleanups.forEach((fn) => fn())
  document.documentElement.style.removeProperty('--slider-moving')
})
</script>

<template>
  <main ref="rootRef" class="slow-page">
    <div class="slider">
      <div ref="trackRef" class="slide-track"></div>
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
  background: rgba(20, 20, 20, 1);
  color: #f3f3f3;
  min-height: 100svh;
}

.slow-page :deep(a),
.slow-page :deep(p) {
  display: block;
  color: #f3f3f3;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.08em;
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
  left: 0;
  top: 170%;
  width: max-content;
  height: 50%;
  display: flex;
  align-items: center;
  transform-origin: center center;
  will-change: transform;
}

.slider :deep(.slide) {
  flex-shrink: 0;
  width: 448px;
  height: 672px;
  margin: 0 58px;
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transform: translateY(var(--stagger-offset, 0px));
}

.slider :deep(.slide::after) {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgb(255 255 255 / 0.1);
  pointer-events: none;
}

.slider :deep(.slide-image) {
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
  position: relative;
  background: rgb(255 255 255 / 0.03);
}

.slider :deep(.slide-image img) {
  position: absolute;
  top: 0;
  left: 50%;
  display: block;
  width: auto !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  object-fit: contain;
  will-change: transform;
  transform: translateX(calc(-50% + var(--parallax-offset, 0px))) scale(1);
  transform-origin: center center;
  user-select: none;
  filter: saturate(0.92) contrast(0.96) brightness(0.98);
}

.slider :deep(.slide-overlay) {
  position: absolute;
  bottom: -2.2rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.24s ease;
  opacity: 0;
}

.slider :deep(.slide:hover .slide-overlay) {
  opacity: calc(1 - var(--slider-moving, 1));
}

.slider :deep(.project-title) {
  font-weight: 500;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.slider :deep(.project-arrow) {
  width: 14px;
  height: 14px;
  opacity: 0.72;
}

.slider :deep(.project-arrow svg) {
  stroke: #f3f3f3;
  stroke-width: 1.8;
  fill: none;
}

@media (max-width: 1000px) {
  .slider :deep(.slide-track) {
    top: 84%;
  }

  .slider :deep(.slide) {
    width: 224px;
    height: 336px;
    margin: 0 28px;
  }

  .slider :deep(.slide-overlay) {
    bottom: -1.75rem;
  }
}
</style>
