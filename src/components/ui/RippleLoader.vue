<script setup>
const props = defineProps({
  runKey: {
    type: Number,
    default: 0,
  },
})

// Stagger matched to the ~1.0 s route-curtain hold — cells ripple outward
const cells = [
  { delay: '0ms' },
  { delay: '100ms' },
  { delay: '200ms' },
  { delay: '100ms' },
  { delay: '200ms' },
  { delay: '200ms' },
  { delay: '300ms' },
  { delay: '300ms' },
  { delay: '400ms' },
]
</script>

<template>
  <div class="ripple-loader" aria-hidden="true">
    <span
      v-for="(cell, index) in cells"
      :key="`rc-${props.runKey}-${index}`"
      class="ripple-loader__cell"
      :style="{
        '--cell-delay': cell.delay,
        '--cell-color': [
          '#d4d4d4',
          '#dadada',
          '#e0e0e0',
          '#dadada',
          '#e5e5e5',
          '#e0e0e0',
          '#ececec',
          '#e0e0e0',
          '#f0f0f0',
        ][index],
      }"
    ></span>
  </div>
</template>

<style scoped>
.ripple-loader {
  --cell-size: 52px;
  --cell-spacing: 1px;
  --cells: 3;
  --total-size: calc(var(--cells) * (var(--cell-size) + 2 * var(--cell-spacing)));
  display: flex;
  flex-wrap: wrap;
  width: var(--total-size);
  height: var(--total-size);
}

.ripple-loader__cell {
  flex: 0 0 var(--cell-size);
  margin: var(--cell-spacing);
  background-color: transparent;
  box-sizing: border-box;
  border-radius: 4px;
  animation: ripple 1.4s ease-in-out 1 both;
  animation-delay: var(--cell-delay);
}

@keyframes ripple {
  0% {
    background-color: transparent;
    transform: scale(0.92);
  }

  20% {
    background-color: transparent;
    transform: scale(0.92);
  }

  42% {
    background-color: var(--cell-color);
    transform: scale(1);
  }

  65% {
    background-color: rgb(255 255 255 / 0.08);
    transform: scale(0.985);
  }

  100% {
    background-color: transparent;
    transform: scale(0.92);
  }
}

@media (max-width: 768px) {
  .ripple-loader {
    --cell-size: 40px;
  }
}
</style>
