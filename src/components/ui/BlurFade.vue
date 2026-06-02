<script setup>
import { computed } from 'vue'
import { motion, AnimatePresence, useInView, useDomRef } from 'motion-v'

const MotionDiv = motion.div

const props = defineProps({
  /**
   * Delay before the animation starts, in seconds.
   * Stagger multiple BlurFade elements by passing increasing values (e.g. 0.25, 0.5, 0.75).
   */
  delay: { type: Number, default: 0 },
  /** Duration of the transition, in seconds. */
  duration: { type: Number, default: 0.4 },
  /** Vertical offset in pixels — the element slides up from below. */
  yOffset: { type: Number, default: 6 },
  /** Amount of blur applied in the hidden state (any CSS filter blur value). */
  blur: { type: String, default: '6px' },
  /** When true, the animation only fires once the element scrolls into view. */
  inView: { type: Boolean, default: false },
  /** IntersectionObserver rootMargin — adjust when the "in view" trigger fires. */
  inViewMargin: { type: String, default: '-50px' },
})

const elRef = useDomRef()
const inViewResult = useInView(elRef, { once: true, margin: props.inViewMargin })
const isInView = computed(() => !props.inView || inViewResult.value)

const variants = {
  hidden: { y: props.yOffset, opacity: 0, filter: `blur(${props.blur})` },
  visible: { y: -props.yOffset, opacity: 1, filter: 'blur(0px)' },
}
</script>

<template>
  <AnimatePresence>
    <MotionDiv
      ref="elRef"
      initial="hidden"
      :animate="isInView ? 'visible' : 'hidden'"
      exit="hidden"
      :variants="variants"
      :transition="{
        delay: 0.04 + props.delay,
        duration: props.duration,
        ease: 'easeOut',
      }"
    >
      <slot />
    </MotionDiv>
  </AnimatePresence>
</template>
