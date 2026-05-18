<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  duration: {
    type: Number,
    default: 500,
  },
  size: {
    type: Number,
    default: 32,
  },
  strokeWidth: {
    type: Number,
    default: 2.5,
  },
  stroke: {
    type: String,
    default: 'currentColor',
  },
  fill: {
    type: String,
    default: 'none',
  },
})

const svgStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  transitionDuration: `${props.duration}ms`,
}))

const pathStyle = computed(() => ({
  transitionDuration: `${props.duration}ms`,
}))
</script>

<template>
  <svg
    viewBox="0 0 32 32"
    stroke-linecap="round"
    stroke-linejoin="round"
    :stroke-width="strokeWidth"
    :stroke="stroke"
    :fill="fill"
    class="menu-toggle-icon"
    :class="{ 'menu-toggle-icon--open': open }"
    :style="svgStyle"
    aria-hidden="true"
  >
    <path
      class="menu-toggle-icon__curve"
      :class="{ 'menu-toggle-icon__curve--open': open }"
      :style="pathStyle"
      d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
    />
    <path d="M7 16 27 16" />
  </svg>
</template>

<style scoped>
.menu-toggle-icon {
  display: block;
  transition: transform 500ms ease-in-out;
}

.menu-toggle-icon--open {
  transform: rotate(-45deg);
}

.menu-toggle-icon__curve {
  transition: stroke-dasharray 500ms ease-in-out, stroke-dashoffset 500ms ease-in-out;
  stroke-dasharray: 12 63;
}

.menu-toggle-icon__curve--open {
  stroke-dasharray: 20 300;
  stroke-dashoffset: -32.42px;
}
</style>
