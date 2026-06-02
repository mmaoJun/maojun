<script setup>
import { ref, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  label: { type: String, required: true },
  reverse: { type: Boolean, default: true },
  staggerDuration: { type: Number, default: 0.025 },
})

const containerRef = ref(null)
const isAnimating = ref(false)
let ctx = null

function getShuffledIndices() {
  return Array.from({ length: props.label.length }, (_, i) => i)
    .sort(() => Math.random() - 0.5)
}

function hoverStart() {
  if (isAnimating.value || !containerRef.value) return
  isAnimating.value = true

  const shuffled = getShuffledIndices()
  const outDir = props.reverse ? '100%' : '-100%'
  const inDir = props.reverse ? '-100%' : '100%'

  ctx = gsap.context(() => {
    shuffled.forEach((idx, i) => {
      const primary = containerRef.value.querySelector(`.rls-primary-${idx}`)
      const secondary = containerRef.value.querySelector(`.rls-secondary-${idx}`)
      if (!primary || !secondary) return

      const delay = i * props.staggerDuration

      gsap.set(secondary, { y: inDir })

      gsap.to(primary, {
        y: outDir,
        duration: 0.7,
        ease: 'power3.inOut',
        delay,
      })

      gsap.to(secondary, {
        y: '0%',
        duration: 0.7,
        ease: 'power3.inOut',
        delay,
        onComplete: () => {
          gsap.set(secondary, { y: inDir })
          gsap.set(primary, { y: '0%' })
          if (i === shuffled.length - 1) {
            isAnimating.value = false
          }
        },
      })
    })
  }, containerRef.value)
}

onBeforeUnmount(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <span
    ref="containerRef"
    class="random-letter-swap"
    @mouseenter="hoverStart"
  >
    <span class="sr-only">{{ label }}</span>
    <span
      v-for="(letter, i) in label.split('')"
      :key="i"
      class="rls-letter-wrap"
    >
      <span :class="`rls-primary rls-primary-${i}`">{{ letter === ' ' ? ' ' : letter }}</span>
      <span :class="`rls-secondary rls-secondary-${i}`" aria-hidden="true">{{ letter === ' ' ? ' ' : letter }}</span>
    </span>
  </span>
</template>

<style scoped>
.random-letter-swap {
  display: inline-flex;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.rls-letter-wrap {
  position: relative;
  display: inline-block;
  overflow: hidden;
  white-space: pre;
}

.rls-primary {
  position: relative;
  display: inline-block;
}

.rls-secondary {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
}
</style>
