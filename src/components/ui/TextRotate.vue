<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  texts: { type: Array, required: true },
  rotationInterval: { type: Number, default: 2000 },
  staggerDuration: { type: Number, default: 25 },
  staggerFrom: { type: String, default: 'first' },
  loop: { type: Boolean, default: true },
  auto: { type: Boolean, default: true },
})

const index = ref(0)
let timer = null

const characters = computed(() => {
  const text = props.texts[index.value] || ''
  return Array.from(text)
})

const getStaggerDelay = (i, total) => {
  switch (props.staggerFrom) {
    case 'last': return (total - 1 - i) * props.staggerDuration
    case 'center': return Math.abs(Math.floor(total / 2) - i) * props.staggerDuration
    case 'random': return Math.floor(Math.random() * total) * props.staggerDuration
    default: return i * props.staggerDuration
  }
}

const goNext = () => {
  const next = index.value >= props.texts.length - 1
    ? (props.loop ? 0 : index.value)
    : index.value + 1
  index.value = next
}

onMounted(() => {
  if (props.auto) {
    timer = setInterval(goNext, props.rotationInterval)
  }
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <span class="text-rotate" :key="index">
    <span
      v-for="(char, i) in characters"
      :key="i"
      class="text-rotate__char"
      :style="{ animationDelay: getStaggerDelay(i, characters.length) + 'ms' }"
    >{{ char === ' ' ? ' ' : char }}</span>
  </span>
</template>

<style scoped>
.text-rotate {
  display: inline-flex;
  white-space: pre;
}

.text-rotate__char {
  display: inline-block;
  animation: rotateIn 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}

@keyframes rotateIn {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
