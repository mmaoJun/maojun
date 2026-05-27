<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  text: { type: String, default: 'CREATIVE' },
  hoverText: { type: String, default: 'EXPLORE' },
})

const containerRef = ref(null)
const circleRef = ref(null)
const innerTextRef = ref(null)
const isHovered = ref(false)
const containerSize = ref({ width: 0, height: 0 })

const mousePos = { x: 0, y: 0 }
const currentPos = { x: 0, y: 0 }
let animId = null

const lerp = (start, end, factor) => start + (end - start) * factor

const animate = () => {
  currentPos.x = lerp(currentPos.x, mousePos.x, 0.15)
  currentPos.y = lerp(currentPos.y, mousePos.y, 0.15)
  if (circleRef.value) {
    circleRef.value.style.transform = `translate(${currentPos.x}px, ${currentPos.y}px) translate(-50%, -50%)`
  }
  if (innerTextRef.value) {
    innerTextRef.value.style.transform = `translate(${-currentPos.x}px, ${-currentPos.y}px)`
  }
  animId = requestAnimationFrame(animate)
}

const updateSize = () => {
  if (containerRef.value) {
    containerSize.value = {
      width: containerRef.value.offsetWidth,
      height: containerRef.value.offsetHeight,
    }
  }
}

const handleMouseMove = (e) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  mousePos.x = e.clientX - rect.left
  mousePos.y = e.clientY - rect.top
}

const handleMouseEnter = (e) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  mousePos.x = x
  mousePos.y = y
  currentPos.x = x
  currentPos.y = y
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}

const circleStyle = computed(() => ({
  width: isHovered.value ? '150px' : '0px',
  height: isHovered.value ? '150px' : '0px',
}))

const innerContainerStyle = computed(() => ({
  width: `${containerSize.value.width}px`,
  height: `${containerSize.value.height}px`,
}))

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
  animId = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
  if (animId) cancelAnimationFrame(animId)
})
</script>

<template>
  <div
    ref="containerRef"
    class="magnetic-text"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span class="magnetic-text__base">{{ text }}</span>

    <div
      ref="circleRef"
      class="magnetic-text__circle"
      :class="{ 'magnetic-text__circle--visible': isHovered }"
      :style="circleStyle"
    >
      <div
        ref="innerTextRef"
        class="magnetic-text__inner-container"
        :style="innerContainerStyle"
      >
        <span class="magnetic-text__hover">{{ hoverText }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.magnetic-text {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: none;
  user-select: none;
}

.magnetic-text__base {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3.2rem, 8vw, 7rem);
  font-style: italic;
  font-weight: 700;
  line-height: 0.9;
  color: #ffffff;
  letter-spacing: -0.04em;
}

.magnetic-text__circle {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  border-radius: 50%;
  background: #ffffff;
  overflow: hidden;
  transition: width 0.5s cubic-bezier(0.33, 1, 0.68, 1), height 0.5s cubic-bezier(0.33, 1, 0.68, 1);
  will-change: transform, width, height;
}

.magnetic-text__inner-container {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}

.magnetic-text__hover {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3.2rem, 8vw, 7rem);
  font-style: italic;
  font-weight: 700;
  line-height: 0.9;
  color: #000000;
  white-space: nowrap;
  letter-spacing: -0.04em;
}

@media (max-width: 1000px) {
  .magnetic-text__base,
  .magnetic-text__hover {
    font-size: clamp(2.8rem, 12vw, 4.8rem);
  }
}
</style>
