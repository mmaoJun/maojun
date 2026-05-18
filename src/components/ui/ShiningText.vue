<script setup>
defineProps({
  text: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span class="shining-text">{{ text }}</span>
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
  animation: shineSweep 2s linear infinite;
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
