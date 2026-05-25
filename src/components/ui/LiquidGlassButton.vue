<script setup>
defineProps({
  type: {
    type: String,
    default: 'button',
  },
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    class="liquid-glass-btn"
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
  font-size: 1.2rem;
  line-height: 1;
  color: #fff;
  cursor: pointer;
  background: transparent;
  overflow: hidden;
  transition: transform 0.3s ease;
  outline: none;
}

.liquid-glass-btn:hover {
  transform: scale(1.04);
}

.liquid-glass-btn:active {
  transform: scale(0.98);
}

.liquid-glass-btn__shadow {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  box-shadow: none;
  pointer-events: none;
}

.liquid-glass-btn__filter {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  overflow: hidden;
  background: transparent;
  border: 1px solid transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  pointer-events: none;
}

.liquid-glass-btn__label {
  position: relative;
  z-index: 1;
  pointer-events: none;
  font-weight: 700;
  color: #fff;
}
</style>
