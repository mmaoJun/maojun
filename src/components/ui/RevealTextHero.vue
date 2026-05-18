<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'maoJun',
  },
  subtext: {
    type: String,
    default: '',
  },
  textColor: {
    type: String,
    default: '#ffffff',
  },
  overlayColor: {
    type: String,
    default: '#ef4444',
  },
  fontSize: {
    type: String,
    default: 'clamp(3rem, 9vw, 8rem)',
  },
  letterDelay: {
    type: Number,
    default: 0.08,
  },
  overlayDelay: {
    type: Number,
    default: 0.05,
  },
  overlayDuration: {
    type: Number,
    default: 0.4,
  },
  springDuration: {
    type: Number,
    default: 600,
  },
  letterImages: {
    type: Array,
    default: () => [
      '/home/word/1.jpg',
      '/home/word/2.jpg',
      '/home/word/3.jpg',
      '/home/word/4.jpg',
      '/home/word/5.jpg',
      '/home/word/6.jpg',
      '/home/word/7.jpg',
      '/home/word/8.jpg',
      '/home/word/9.jpg',
      '/home/word/10.jpg',
  
    ],
  },
})

const hoveredIndex = ref(null)
const showOverlay = ref(false)
const chars = computed(() => Array.from(props.text || ''))
let overlayTimer = 0

const startOverlayTimer = () => {
  window.clearTimeout(overlayTimer)
  const lastLetterDelay = Math.max(chars.value.length - 1, 0) * props.letterDelay
  const totalDelay = (lastLetterDelay * 1000) + props.springDuration
  overlayTimer = window.setTimeout(() => {
    showOverlay.value = true
  }, totalDelay)
}

watch(() => props.text, () => {
  showOverlay.value = false
  startOverlayTimer()
})

onMounted(() => {
  startOverlayTimer()
})

onBeforeUnmount(() => {
  window.clearTimeout(overlayTimer)
})
</script>

<template>
  <div class="reveal-text-wrap">
    <div class="reveal-text" :style="{ '--rt-font-size': fontSize, '--rt-text-color': textColor, '--rt-overlay-color': overlayColor }">
      <span
        v-for="(char, index) in chars"
        :key="`${char}-${index}`"
        class="reveal-letter"
        :class="{ 'is-space': char === ' ' }"
        :style="{ '--letter-delay': `${index * letterDelay}s`, '--overlay-delay': `${index * overlayDelay}s` }"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <span class="reveal-letter__ghost" :style="{ opacity: hoveredIndex === index ? 0 : 1 }">
          {{ char === ' ' ? '\u00A0' : char }}
        </span>
        <span
          class="reveal-letter__image"
          :style="{
            opacity: hoveredIndex === index ? 1 : 0,
            backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
            backgroundPosition: hoveredIndex === index ? '10% center' : '0% center',
          }"
        >
          {{ char === ' ' ? '\u00A0' : char }}
        </span>
        <span v-if="showOverlay" class="reveal-letter__overlay">
          {{ char === ' ' ? '\u00A0' : char }}
        </span>
      </span>
    </div>
    <p v-if="subtext" class="reveal-subtext">{{ subtext }}</p>
  </div>
</template>

<style scoped>
.reveal-text-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
}

.reveal-text {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  line-height: 0.88;
  user-select: none;
}

.reveal-letter {
  position: relative;
  display: inline-block;
  font-size: var(--rt-font-size);
  font-weight: 900;
  letter-spacing: -0.06em;
  cursor: pointer;
  overflow: hidden;
  transform: scale(0);
  opacity: 0;
  animation: revealPop 0.9s var(--letter-delay) cubic-bezier(0.175, 0.885, 0.32, 1.3) forwards;
}

.reveal-letter.is-space {
  width: 0.28em;
}

.reveal-letter__ghost,
.reveal-letter__image,
.reveal-letter__overlay {
  display: block;
  transition: opacity 0.12s ease, background-position 3s ease-in-out;
}

.reveal-letter__ghost {
  position: relative;
  color: var(--rt-text-color);
  text-shadow: none;
}

.reveal-letter__image {
  position: absolute;
  inset: 0;
  color: transparent;
  background-size: cover;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
}

.reveal-letter__overlay {
  position: absolute;
  inset: 0;
  color: var(--rt-overlay-color);
  pointer-events: none;
  opacity: 0;
  text-shadow: none;
  animation: overlaySweep var(--overlay-duration, 0.4s) var(--overlay-delay) ease-in-out forwards;
}

.reveal-subtext {
  margin: 0;
  font-size: clamp(0.85rem, 1.4vw, 1rem);
  color: rgb(255 255 255 / 0.8);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.reveal-text {
  --overlay-duration: 0.4s;
}

@keyframes revealPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.14);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes overlaySweep {
  0% {
    opacity: 0;
    transform: translateX(-6%);
  }
  12% {
    opacity: 1;
  }
  72% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(6%);
  }
}

@media (max-width: 1000px) {
  .reveal-text-wrap {
    gap: 0.8rem;
  }

  .reveal-subtext {
    font-size: 0.74rem;
    letter-spacing: 0.06em;
  }
}
</style>
