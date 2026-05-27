<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  lines: {
    type: Array,
    default: () => [
      { top: ' ', bottom: 'INFINITE' },
      { top: 'INFINITE', bottom: 'PROGRESS' },
      { top: 'PROGRESS', bottom: 'INNOVATION' },
      { top: 'INNOVATION', bottom: 'FUTURE' },
      { top: 'FUTURE', bottom: 'DREAMS' },
      { top: 'DREAMS', bottom: 'ACHIEVEMENT' },
      { top: 'ACHIEVEMENT', bottom: ' ' },
    ],
  },
  fontSize: { type: String, default: '72px' },
  fontSizeMd: { type: String, default: '36px' },
  lineHeight: { type: Number, default: 60 },
  lineHeightMd: { type: Number, default: 35 },
})

const containerRef = ref(null)
let timeline = null

const calculateTranslateX = (index) => {
  const baseOffset = 35
  const baseOffsetMd = 20
  const centerIndex = Math.floor(props.lines.length / 2)
  return {
    desktop: (index - centerIndex) * baseOffset,
    mobile: (index - centerIndex) * baseOffsetMd,
  }
}

const lineStyles = (index) => {
  const tx = calculateTranslateX(index)
  const isEven = index % 2 === 0
  return {
    '--lh': `${props.lineHeight}px`,
    '--lh-md': `${props.lineHeightMd}px`,
    '--tx': `${tx.desktop}px`,
    '--tx-md': `${tx.mobile}px`,
    '--skew': isEven ? 'skew(60deg, -30deg)' : 'skew(0deg, -30deg)',
    '--scale': isEven ? '0.66667' : '1.33333',
  }
}

const animateIn = () => {
  if (!containerRef.value) return
  const paragraphs = containerRef.value.querySelectorAll('p')
  if (!timeline) {
    timeline = gsap.timeline({ paused: true })
    timeline.to(paragraphs, {
      y: window.innerWidth >= 768 ? -60 : -35,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.08,
    })
  }
  timeline.restart()
}

const animateOut = () => {
  timeline?.reverse()
}

onBeforeUnmount(() => {
  timeline?.kill()
})
</script>

<template>
  <div
    ref="containerRef"
    class="layered-text"
    :style="{ '--fs': fontSize, '--fs-md': fontSizeMd }"
    @mouseenter="animateIn"
    @mouseleave="animateOut"
  >
    <ul class="layered-text__list">
      <li
        v-for="(line, index) in lines"
        :key="index"
        class="layered-text__item"
        :style="lineStyles(index)"
      >
        <p class="layered-text__p">{{ line.top }}</p>
        <p class="layered-text__p">{{ line.bottom }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.layered-text {
  margin: 0 auto;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fcfcfb;
  font-family: inherit;
  font-weight: 900;
  letter-spacing: -2px;
  text-transform: uppercase;
  color: #000;
  -webkit-font-smoothing: antialiased;
  cursor: pointer;
  font-size: var(--fs);
}

.layered-text__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.layered-text__item {
  overflow: hidden;
  position: relative;
  height: var(--lh);
  transform: translateX(var(--tx)) var(--skew) scaleY(var(--scale));
}

.layered-text__p {
  padding: 0 15px;
  vertical-align: top;
  white-space: nowrap;
  margin: 0;
  height: var(--lh);
  line-height: calc(var(--lh) - 5px);
}

@media (max-width: 767px) {
  .layered-text {
    font-size: var(--fs-md);
  }

  .layered-text__item {
    height: var(--lh-md);
    transform: translateX(var(--tx-md)) skew(0deg, 0deg) scaleY(1);
  }

  .layered-text__p {
    height: var(--lh-md);
    line-height: calc(var(--lh-md) - 5px);
  }
}
</style>
