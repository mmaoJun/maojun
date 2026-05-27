<script setup>
import { ref, computed } from 'vue'
import { motion } from 'motion-v'

const MotionDiv = motion.div
const MotionH3 = motion.h3
const MotionSpan = motion.span
const MotionSvg = motion.svg
const MotionPath = motion.path

const animationStates = [
  {
    bgColor: '#fc7359',
    indicatorColor: '#790b02',
    pathColor: '#fc7359',
    smileColor: '#790b02',
    titleColor: '#790b02',
    trackColor: '#fc5b3e',
    eyeWidth: 56,
    eyeHeight: 56,
    eyeBorderRadius: '100%',
    eyeBg: '#790b02',
    smileRotate: 180,
    indicatorRotate: 180,
    noteText: 'BAD',
    noteColor: '#e33719',
    noteX: '0%',
    indicatorLeft: '0%',
  },
  {
    bgColor: '#dfa342',
    indicatorColor: '#482103',
    pathColor: '#dfa342',
    smileColor: '#482103',
    titleColor: '#482103',
    trackColor: '#b07615',
    eyeWidth: 100,
    eyeHeight: 20,
    eyeBorderRadius: '36px',
    eyeBg: '#482103',
    smileRotate: 180,
    indicatorRotate: 180,
    noteText: 'NOT BAD',
    noteColor: '#b37716',
    noteX: '-100%',
    indicatorLeft: '50%',
  },
  {
    bgColor: '#9fbe59',
    indicatorColor: '#0b2b03',
    pathColor: '#9fbe59',
    smileColor: '#0b2b03',
    titleColor: '#0b2b03',
    trackColor: '#698b1b',
    eyeWidth: 120,
    eyeHeight: 120,
    eyeBorderRadius: '100%',
    eyeBg: '#0b2b03',
    smileRotate: 0,
    indicatorRotate: 0,
    noteText: 'GOOD',
    noteColor: '#6e901d',
    noteX: '-200%',
    indicatorLeft: '100%',
  },
]

const selectedIndex = ref(0)
const currentAnim = computed(() => animationStates[selectedIndex.value])
const transition = { type: 'spring', stiffness: 300, damping: 30 }
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
        How are you feeling today?
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
            v-for="(text, i) in ['Bad', 'Not Bad', 'Good']"
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
