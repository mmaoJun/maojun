<script setup>
import { computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { X } from '@lucide/vue'

const MotionDiv = motion.div

const props = defineProps({
  /** Icon component/element to display */
  icon: { type: [Object, String], default: null },
  /** Card title */
  title: { type: String, required: true },
  /** Card description text */
  description: { type: String, required: true },
  /** Action button text */
  buttonText: { type: String, required: true },
  /** Controls card visibility */
  isVisible: { type: Boolean, default: false },
  /** Whether to show the dismiss X button */
  showDismiss: { type: Boolean, default: false },
})

const emit = defineEmits(['button-click', 'dismiss'])

function onButtonClick() {
  emit('button-click')
}

function onDismiss() {
  emit('dismiss')
}

// ---- Animation variants ----

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}
</script>

<template>
  <AnimatePresence>
    <MotionDiv
      v-if="props.isVisible"
      class="alert-card"
      :variants="cardVariants"
      initial="hidden"
      animate="visible"
      exit="exit"
      role="alert"
      aria-live="assertive"
    >
      <!-- Dismiss button -->
      <MotionDiv
        v-if="props.showDismiss"
        :variants="itemVariants"
        class="alert-card__dismiss"
      >
        <button
          class="alert-card__dismiss-btn"
          aria-label="Dismiss"
          @click="onDismiss"
        >
          <X :size="14" />
        </button>
      </MotionDiv>

      <!-- Icon with pulse animation -->
      <MotionDiv
        v-if="props.icon"
        :variants="itemVariants"
        class="alert-card__icon-wrap"
      >
        <MotionDiv
          class="alert-card__icon-inner"
          :animate="{ scale: [1, 1.1, 1] }"
          :transition="{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }"
        >
          <component :is="props.icon" :size="24" class="alert-card__icon" />
        </MotionDiv>
      </MotionDiv>

      <!-- Title -->
      <MotionDiv :variants="itemVariants">
        <h3 class="alert-card__title">{{ props.title }}</h3>
      </MotionDiv>

      <!-- Description -->
      <MotionDiv :variants="itemVariants">
        <p class="alert-card__desc">{{ props.description }}</p>
      </MotionDiv>

      <!-- Action Button -->
      <MotionDiv :variants="itemVariants" class="alert-card__action">
        <button class="alert-card__btn" @click="onButtonClick">
          {{ props.buttonText }}
        </button>
      </MotionDiv>
    </MotionDiv>
  </AnimatePresence>
</template>

<style scoped>
/* ================================================================
   AlertCard — Destructive-style alert with spring entrance
   Converted from React (Framer Motion) → Vue 3 (motion-v)
   ================================================================ */

.alert-card {
  position: relative;
  width: 100%;
  max-width: 18rem;
  overflow: hidden;
  border-radius: 0.75rem;
  padding: 1.1rem;
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.25);

  /* Green theme — homepage accent #c1fd62 */
  background: #c1fd62;
  color: #1a2e05;
}

/* ---- Dismiss Button ---- */
.alert-card__dismiss {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.alert-card__dismiss-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease;
}

.alert-card__dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ---- Icon ---- */
.alert-card__icon-wrap {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.alert-card__icon-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-card__icon {
  color: inherit;
}

/* ---- Title ---- */
.alert-card__title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.2;
}

/* ---- Description ---- */
.alert-card__desc {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  line-height: 1.5;
  opacity: 0.8;
  max-width: 80%;
}

/* ---- Action Button ---- */
.alert-card__action {
  margin-top: 1rem;
}

.alert-card__btn {
  width: 100%;
  padding: 0.6rem 1.1rem;
  border-radius: 9999px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;

  /* "bg-primary-foreground text-primary" equivalent */
  background: #fff;
  color: #4d7c0f;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.alert-card__btn:hover {
  opacity: 0.9;
}

.alert-card__btn:active {
  transform: scale(0.95);
}
</style>
