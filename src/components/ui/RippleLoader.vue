<script setup>
const props = defineProps({
  runKey: {
    type: Number,
    default: 0,
  },
})

const cells = [
  { delay: '0ms' },
  { delay: '140ms' },
  { delay: '280ms' },
  { delay: '140ms' },
  { delay: '280ms' },
  { delay: '280ms' },
  { delay: '420ms' },
  { delay: '420ms' },
  { delay: '560ms' },
]
</script>

<template>
  <div class="ripple-loader" aria-hidden="true">
    <span
      v-for="(cell, index) in cells"
      :key="`ripple-cell-${props.runKey}-${index}`"
      class="ripple-loader__cell"
      :style="{
        '--cell-delay': cell.delay,
        '--cell-color': [
          '#00FF87',
          '#0CFD95',
          '#17FBA2',
          '#23F9B2',
          '#30F7C3',
          '#3DF5D4',
          '#45F4DE',
          '#53F1F0',
          '#60EFFF',
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
  animation: ripple 2.35s ease-in-out 1 both;
  animation-delay: var(--cell-delay);
}

@keyframes ripple {
  0% {
    background-color: transparent;
    transform: scale(0.92);
  }

  24% {
    background-color: transparent;
    transform: scale(0.92);
  }

  40% {
    background-color: var(--cell-color);
    transform: scale(1);
  }

  62% {
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
