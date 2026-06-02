<script setup>
import { ref } from 'vue'

defineProps({
  toggleIcon: {
    type: Object,
    default: null
  },
  closeIcon: {
    type: Object,
    default: null
  },
  items: {
    type: Array,
    default: () => []
    // { icon: Component, label: String, to?: String, href?: String, onClick?: Function }
  }
})

defineEmits(['item-click', 'toggle'])

const isExpanded = ref(false)

function handleToggle() {
  isExpanded.value = !isExpanded.value
}

function handleItemClick(item, index) {
  isExpanded.value = false
}
</script>

<template>
  <div class="fluid-menu" :data-expanded="isExpanded">
    <div class="fluid-menu__container">
      <!-- Toggle button — always visible -->
      <div
        class="fluid-menu__toggle"
        @click="handleToggle"
        role="button"
        :aria-expanded="isExpanded"
        aria-haspopup="true"
      >
        <div class="fluid-menu__icon fluid-menu__icon--menu">
          <slot name="toggle-open">
            <component :is="toggleIcon" v-if="toggleIcon" :size="24" :stroke-width="1.5" />
          </slot>
        </div>
        <div class="fluid-menu__icon fluid-menu__icon--close">
          <slot name="toggle-close">
            <component :is="closeIcon" v-if="closeIcon" :size="24" :stroke-width="1.5" />
          </slot>
        </div>
      </div>

      <!-- Expandable items -->
      <div
        v-for="(item, index) in items"
        :key="index"
        class="fluid-menu__item"
        :style="{
          transform: `translateY(${isExpanded ? (index + 1) * 48 : 0}px)`,
          opacity: isExpanded ? 1 : 0,
          zIndex: 40 - index,
          transition: `transform ${isExpanded ? '300ms' : '300ms'} cubic-bezier(0.4, 0, 0.2, 1),
                       opacity ${isExpanded ? '300ms' : '350ms'}`,
        }"
      >
        <component
          :is="item.to ? 'router-link' : (item.href ? 'a' : 'button')"
          v-bind="item.to ? { to: item.to } : item.href ? { href: item.href } : {}"
          class="fluid-menu__item-inner"
          :class="{ 'fluid-menu__item-inner--disabled': item.disabled }"
          :disabled="item.disabled"
          :aria-disabled="item.disabled"
          @click="item.onClick ? item.onClick() : handleItemClick(item, index)"
        >
          <span class="fluid-menu__item-icon">
            <component :is="item.icon" v-if="item.icon" :size="24" :stroke-width="1.5" />
          </span>
          <span v-if="item.label" class="fluid-menu__item-label">{{ item.label }}</span>
        </component>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fluid-menu {
  position: relative;
  width: 64px;
}

.fluid-menu__container {
  position: relative;
}

/* Toggle button */
.fluid-menu__toggle {
  position: relative;
  width: 48px;
  height: 48px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  will-change: transform;
}

/* Icon swap animation */
.fluid-menu__icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fluid-menu__icon--menu {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.fluid-menu[data-expanded="true"] .fluid-menu__icon--menu {
  opacity: 0;
  transform: scale(0) rotate(180deg);
}

.fluid-menu__icon--close {
  opacity: 0;
  transform: scale(0) rotate(-180deg);
}

.fluid-menu[data-expanded="true"] .fluid-menu__icon--close {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* Expandable items */
.fluid-menu__item {
  position: absolute;
  top: 0;
  left: 0;
  width: 48px;
  height: 48px;
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  pointer-events: auto;
}

.fluid-menu__item-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  position: relative;
}

.fluid-menu__item-inner--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.fluid-menu__item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  transition: all 0.2s ease;
}

.fluid-menu__item:hover .fluid-menu__item-icon {
  transform: scale(1.08);
}

.fluid-menu__item:hover .fluid-menu__item-icon :deep(svg) {
  stroke-width: 2.5;
}

.fluid-menu__item-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.4rem;
  white-space: nowrap;
}

/* Desktop: expand item width to show label on hover */
@media (min-width: 769px) {
  .fluid-menu__item {
    transition: width 0.25s ease;
  }

  .fluid-menu__item:hover {
    width: auto;
    min-width: 48px;
    border-radius: 24px;
    padding: 0 16px 0 7px;
  }

  .fluid-menu__item-label {
    display: none;
  }

  .fluid-menu__item:hover .fluid-menu__item-label {
    display: inline;
  }
}
</style>
