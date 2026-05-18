<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  text: {
    type: String,
    default: '',
  },
})

const prefersReducedMotion = ref(false)
let motionMediaQuery = null
let handleMotionChange = null

onMounted(() => {
  motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  handleMotionChange = () => {
    prefersReducedMotion.value = motionMediaQuery.matches
  }
  handleMotionChange()
  motionMediaQuery.addEventListener('change', handleMotionChange)
})

onBeforeUnmount(() => {
  motionMediaQuery?.removeEventListener?.('change', handleMotionChange)
})
</script>

<template>
  <span class="shining-text" :class="{ 'shining-text--static': prefersReducedMotion }">{{ text }}</span>
</template>

<style scoped>
.shining-text {
  display: inline-block;
  background-image: linear-gradient(110deg, #606060 35%, #ffffff 50%, #606060 75%, #606060);
  background-size: 200% 100%;
  background-position: 200% 0;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: shineSweep 2.8s linear infinite;
}

.shining-text--static {
  animation: none;
  background-position: 50% 0;
}

@keyframes shineSweep {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}
</style>
