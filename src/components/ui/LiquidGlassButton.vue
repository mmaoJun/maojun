<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
defineProps({
  type: {
    type: String,
    default: 'button',
  },
})

defineEmits(['click'])

const prefersReducedMotion = ref(false)
let motionMediaQuery = null
let handleMotionChange = null

const buttonClass = computed(() => ({
  'liquid-glass-btn--reduced': prefersReducedMotion.value,
}))

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
  <button
    :type="type"
    class="liquid-glass-btn"
    :class="buttonClass"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <span class="liquid-glass-btn__shadow" aria-hidden="true" />
    <span class="liquid-glass-btn__filter" aria-hidden="true" />
    <span class="liquid-glass-btn__label">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.liquid-glass-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 0;
  border-radius: 12px;
  padding: 0.68rem 1.3rem;
  font-weight: 700;
  font-size: 0.84rem;
  line-height: 1;
  color: rgb(15 23 42 / 92%);
  cursor: pointer;
  background: transparent;
  overflow: hidden;
  transition: transform 0.22s ease, filter 0.18s ease;
  outline: none;
}

.liquid-glass-btn:hover {
  transform: scale(1.02);
  filter: brightness(1.05);
}

.liquid-glass-btn:active {
  transform: scale(0.98);
  filter: brightness(0.95);
}

.liquid-glass-btn__shadow {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  box-shadow:
    0 2px 10px rgb(15 23 42 / 14%),
    inset 0 1px 0 rgb(255 255 255 / 90%);
  pointer-events: none;
}

.liquid-glass-btn__filter {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  overflow: hidden;
  background: rgb(241 245 249 / 80%);
  border: 1px solid rgb(15 23 42 / 12%);
  backdrop-filter: url('#container-glass') blur(10px) saturate(122%);
  -webkit-backdrop-filter: url('#container-glass') blur(10px) saturate(122%);
  pointer-events: none;
}

.liquid-glass-btn--reduced,
.liquid-glass-btn--reduced:hover,
.liquid-glass-btn--reduced:active {
  transform: none;
  filter: none;
}

.liquid-glass-btn--reduced .liquid-glass-btn__filter {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: rgb(241 245 249 / 94%);
}

@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .liquid-glass-btn__filter {
    background: rgb(241 245 249 / 95%);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

.liquid-glass-btn__label {
  position: relative;
  z-index: 1;
  pointer-events: none;
  font-weight: 700;
  text-shadow: 0 1px 0 rgb(255 255 255 / 55%);
}
</style>
