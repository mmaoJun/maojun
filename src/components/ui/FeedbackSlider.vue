<script setup>
import { ref, computed, watch } from 'vue'
import { motion } from 'motion-v'

const MotionDiv = motion.div
const MotionH3 = motion.h3
const MotionSpan = motion.span
const MotionSvg = motion.svg
const MotionPath = motion.path

const props = defineProps({
  config: {
    type: Object,
    default: null,
  },
})

const themeColors = [
  { bg: '#fc7359', accent: '#790b02' },  // 0: bad (red)
  { bg: '#dfa342', accent: '#482103' },  // 1: neutral (yellow)
  { bg: '#9fbe59', accent: '#0b2b03' },  // 2: good (green)
]

const defaultStates = [
  { noteText: 'BAD', label: 'Bad' },
  { noteText: 'NOT BAD', label: 'Not Bad' },
  { noteText: 'GOOD', label: 'Good' },
]

function resolveState(s, i) {
  const colors = themeColors[i] || themeColors[0]
  return { ...s, bgColor: colors.bg, accentColor: colors.accent }
}

const states = computed(() => {
  if (props.config?.states?.length === 3) return props.config.states.map((s, i) => resolveState(s, i))
  return defaultStates.map((s, i) => resolveState(s, i))
})

const title = computed(() => props.config?.title || 'How are you feeling today?')
const defaultIndex = computed(() => {
  const idx = props.config?.defaultIndex
  if (typeof idx === 'number' && idx >= 0 && idx <= 2) return idx
  return 0
})

const eyeShapes = [
  { eyeWidth: 56, eyeHeight: 56, eyeBorderRadius: '100%' },
  { eyeWidth: 100, eyeHeight: 20, eyeBorderRadius: '36px' },
  { eyeWidth: 120, eyeHeight: 120, eyeBorderRadius: '100%' },
]

function darken(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount)
  const b = Math.max(0, (num & 0x0000ff) - amount)
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const animationStates = computed(() =>
  states.value.map((s, i) => {
    const eye = eyeShapes[i]
    return {
      bgColor: s.bgColor,
      indicatorColor: s.accentColor,
      pathColor: s.bgColor,
      smileColor: s.accentColor,
      titleColor: s.accentColor,
      trackColor: darken(s.bgColor, 32),
      eyeWidth: eye.eyeWidth,
      eyeHeight: eye.eyeHeight,
      eyeBorderRadius: eye.eyeBorderRadius,
      eyeBg: s.accentColor,
      smileRotate: i === 2 ? 0 : 180,
      indicatorRotate: i === 2 ? 0 : 180,
      noteText: s.noteText,
      noteColor: darken(s.bgColor, 48),
      noteX: `${-i * 100}%`,
      indicatorLeft: `${i * 50}%`,
    }
  })
)

const selectedIndex = ref(defaultIndex.value)
watch(defaultIndex, (val) => { selectedIndex.value = val })
const currentAnim = computed(() => animationStates.value[selectedIndex.value])
const transition = { type: 'spring', stiffness: 300, damping: 30 }

const labels = computed(() => states.value.map(s => s.label))
</script>

<template>
  <MotionDiv
    class="fs-root"
    :animate="{ backgroundColor: currentAnim.bgColor }"
    :transition="transition"
  >
    <div class="fs-inner">
      <MotionH3
        class="fs-title"
        :animate="{ color: currentAnim.titleColor }"
        :transition="transition"
      >
        {{ title }}
      </MotionH3>

      <div class="fs-face">
        <div class="fs-eyes">
          <MotionDiv
            :animate="{
              width: currentAnim.eyeWidth,
              height: currentAnim.eyeHeight,
              borderRadius: currentAnim.eyeBorderRadius,
              backgroundColor: currentAnim.eyeBg,
            }"
            :transition="transition"
          />
          <MotionDiv
            :animate="{
              width: currentAnim.eyeWidth,
              height: currentAnim.eyeHeight,
              borderRadius: currentAnim.eyeBorderRadius,
              backgroundColor: currentAnim.eyeBg,
            }"
            :transition="transition"
          />
        </div>
        <MotionDiv
          class="fs-smile-wrap"
          :animate="{ rotate: currentAnim.smileRotate }"
          :transition="transition"
        >
          <MotionSvg
            width="100%"
            height="100%"
            viewBox="0 0 100 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <MotionPath
              d="M10 30 Q50 70 90 30"
              :animate="{ stroke: currentAnim.smileColor }"
              :transition="transition"
              stroke-width="12"
              stroke-linecap="round"
            />
          </MotionSvg>
        </MotionDiv>
      </div>

      <div class="fs-note-track">
        <MotionDiv
          class="fs-note-slider"
          :animate="{ x: currentAnim.noteX }"
          :transition="transition"
        >
          <div
            v-for="(state, i) in animationStates"
            :key="i"
            class="fs-note-cell"
          >
            <h1 :style="{ color: state.noteColor }">{{ state.noteText }}</h1>
          </div>
        </MotionDiv>
      </div>

      <div class="fs-control">
        <div class="fs-track">
          <MotionDiv
            class="fs-track-line"
            :animate="{ backgroundColor: currentAnim.trackColor }"
            :transition="transition"
          />
          <button
            v-for="(state, i) in animationStates"
            :key="i"
            class="fs-dot"
            :style="{
              left: state.indicatorLeft,
              backgroundColor: currentAnim.trackColor,
            }"
            @click="selectedIndex = i"
          />
          <MotionDiv
            class="fs-indicator"
            :animate="{
              left: currentAnim.indicatorLeft,
              backgroundColor: currentAnim.indicatorColor,
            }"
            :transition="transition"
          >
            <MotionDiv
              class="fs-indicator-inner"
              :animate="{ rotate: currentAnim.indicatorRotate }"
              :transition="transition"
            >
              <MotionSvg
                width="100%"
                height="100%"
                viewBox="0 0 100 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <MotionPath
                  d="M10 30 Q50 70 90 30"
                  :animate="{ stroke: currentAnim.pathColor }"
                  :transition="transition"
                  stroke-width="12"
                  stroke-linecap="round"
                />
              </MotionSvg>
            </MotionDiv>
          </MotionDiv>
        </div>
        <div class="fs-labels">
          <MotionSpan
            v-for="(text, i) in labels"
            :key="text"
            class="fs-label"
            :animate="{
              color: currentAnim.titleColor,
              opacity: selectedIndex === i ? 1 : 0.6,
            }"
            :transition="transition"
          >
            {{ text }}
          </MotionSpan>
        </div>
      </div>
    </div>
  </MotionDiv>
</template>

<style scoped>
.fs-root {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 100svh;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.fs-inner {
  display: flex;
  height: 100%;
  width: 400px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.fs-title {
  margin-bottom: 2.5rem;
  width: 18rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

.fs-face {
  display: flex;
  height: 176px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.fs-eyes {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.fs-smile-wrap {
  display: flex;
  height: 3.5rem;
  width: 3.5rem;
  align-items: center;
  justify-content: center;
}

.fs-note-track {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  padding-bottom: 3.5rem;
  padding-top: 1.75rem;
}

.fs-note-slider {
  display: flex;
  width: 100%;
  flex-shrink: 0;
}

.fs-note-cell {
  display: flex;
  width: 100%;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.fs-note-cell h1 {
  font-size: 4.5rem;
  font-weight: 900;
  line-height: 1;
}

.fs-control {
  width: 100%;
}

.fs-track {
  position: relative;
  width: 100%;
  height: 2.5rem;
}

.fs-dot {
  position: absolute;
  z-index: 2;
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  top: 50%;
  transform: translate(-50%, -50%);
}

.fs-track-line {
  position: absolute;
  top: 50%;
  height: 0.25rem;
  width: 100%;
  transform: translateY(-50%);
}

.fs-indicator {
  position: absolute;
  z-index: 3;
  top: 50%;
  border-radius: 50%;
  padding: 0.5rem;
  /* translate(-50%, -50%) stays in CSS — motion only animates left + backgroundColor,
     neither of which touches transform, so no conflict */
  transform: translate(-50%, -50%);
}

.fs-indicator-inner {
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  /* rotate is animated by motion-v on this inner element,
     so its transform: rotate(...) won't interfere with the parent's translate */
}

.fs-labels {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.5rem;
}

.fs-label {
  width: 100%;
  text-align: center;
  font-weight: 500;
}
</style>
