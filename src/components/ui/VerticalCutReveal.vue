<script setup>
import { ref, computed, onMounted } from 'vue'
import { motion } from 'motion-v'

const MotionSpan = motion.span

const props = defineProps({
  /** The text to animate. */
  text: { type: String, default: '' },
  /** When true, characters slide in from the top instead of the bottom. */
  reverse: { type: Boolean, default: false },
  /** Framer-motion transition options (spring, tween, etc.). */
  transition: {
    type: Object,
    default: () => ({ type: 'spring', stiffness: 190, damping: 22 }),
  },
  /** How to split the text: 'characters' | 'words' | 'lines' | custom delimiter string. */
  splitBy: { type: String, default: 'characters' },
  /** Delay between each element's animation, in seconds. */
  staggerDuration: { type: Number, default: 0.2 },
  /** Where the stagger sequence begins: 'first' | 'last' | 'center' | 'random' | number (index). */
  staggerFrom: { type: [String, Number], default: 'first' },
  /** Extra class(es) for the outer container <span>. */
  containerClassName: { type: String, default: '' },
  /** Extra class(es) for each word-level wrapper. */
  wordLevelClassName: { type: String, default: '' },
  /** Extra class(es) for each character/element wrapper. */
  elementLevelClassName: { type: String, default: '' },
  /** When true, animation starts automatically on mount. */
  autoStart: { type: Boolean, default: true },
})

const emit = defineEmits(['start', 'complete'])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Split a string into grapheme clusters (Unicode-safe, emoji-aware).
 * Falls back to Array.from() when Intl.Segmenter is unavailable.
 */
function splitIntoCharacters(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

// ---------------------------------------------------------------------------
// Derived state
// ---------------------------------------------------------------------------

const isAnimating = ref(false)

/**
 * The parsed elements array. When splitBy === 'characters' each entry is
 * { characters: string[], needsSpace: boolean }. Otherwise it's flat strings.
 */
const elements = computed(() => {
  if (props.splitBy === 'characters') {
    const words = props.text.split(' ')
    return words.map((word, i) => ({
      characters: splitIntoCharacters(word),
      needsSpace: i !== words.length - 1,
    }))
  }
  if (props.splitBy === 'words') return props.text.split(' ')
  if (props.splitBy === 'lines') return props.text.split('\n')
  return props.text.split(props.splitBy)
})

/** Total number of animatable units (characters or words/lines). */
const totalUnits = computed(() => {
  if (props.splitBy === 'characters') {
    return elements.value.reduce(
      (acc, word) => acc + word.characters.length + (word.needsSpace ? 1 : 0),
      0,
    )
  }
  return elements.value.length
})

/**
 * Calculate the stagger delay for the element at `index` based on
 * `staggerFrom` and `staggerDuration` props.
 */
function getStaggerDelay(index) {
  const total = totalUnits.value
  const from = props.staggerFrom
  if (from === 'first') return index * props.staggerDuration
  if (from === 'last') return (total - 1 - index) * props.staggerDuration
  if (from === 'center') {
    const center = Math.floor(total / 2)
    return Math.abs(center - index) * props.staggerDuration
  }
  if (from === 'random') {
    const randomIndex = Math.floor(Math.random() * total)
    return Math.abs(randomIndex - index) * props.staggerDuration
  }
  return Math.abs(Number(from) - index) * props.staggerDuration
}

/** Motion variants shared by every character/element. */
const variants = {
  hidden: { y: props.reverse ? '-100%' : '100%' },
  visible: (i) => ({
    y: 0,
    transition: {
      ...props.transition,
      delay: (props.transition.delay || 0) + getStaggerDelay(i),
    },
  }),
}

// ---------------------------------------------------------------------------
// Public API (exposed to parent via template ref)
// ---------------------------------------------------------------------------

function startAnimation() {
  isAnimating.value = true
  emit('start')
}

function reset() {
  isAnimating.value = false
}

defineExpose({ startAnimation, reset })

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

onMounted(() => {
  if (props.autoStart) {
    startAnimation()
  }
})

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

/**
 * Flatten the (possibly nested) elements array into a uniform list of
 * { char, isLast } objects so the template can iterate cleanly.
 */
const flatCharacters = computed(() => {
  if (props.splitBy === 'characters') {
    const chars = []
    elements.value.forEach((wordObj) => {
      wordObj.characters.forEach((c) => chars.push(c))
      if (wordObj.needsSpace) chars.push(' ')
    })
    return chars
  }
  // words / lines / custom-delimiter — each element is a single unit
  return elements.value
})

/** True when splitBy is NOT characters (used by the template). */
const isWordMode = computed(() => props.splitBy !== 'characters')
</script>

<template>
  <span
    class="vcr-container"
    :class="cn(containerClassName, isWordMode && 'vcr-container--cols')"
    aria-label=""
  >
    <!-- Screen-reader only text -->
    <span class="vcr-sr-only">{{ text }}</span>

    <template v-if="splitBy === 'characters'">
      <span
        v-for="(wordObj, wi) in elements"
        :key="wi"
        class="vcr-word"
        :class="wordLevelClassName"
        aria-hidden="true"
      >
        <span
          v-for="(char, ci) in wordObj.characters"
          :key="ci"
          class="vcr-char"
          :class="elementLevelClassName"
        >
          <MotionSpan
            :custom="
              elements.slice(0, wi).reduce((sum, w) => sum + w.characters.length, 0) + ci
            "
            initial="hidden"
            :animate="isAnimating ? 'visible' : 'hidden'"
            :variants="variants"
            class="vcr-motion"
            @animationComplete="
              wi === elements.length - 1 && ci === wordObj.characters.length - 1
                ? emit('complete')
                : undefined
            "
          >
            {{ char }}
          </MotionSpan>
        </span>
        <span v-if="wordObj.needsSpace"> </span>
      </span>
    </template>

    <template v-else>
      <span
        v-for="(word, wi) in elements"
        :key="wi"
        class="vcr-word"
        :class="wordLevelClassName"
        aria-hidden="true"
      >
        <span class="vcr-char" :class="elementLevelClassName">
          <MotionSpan
            :custom="wi"
            initial="hidden"
            :animate="isAnimating ? 'visible' : 'hidden'"
            :variants="variants"
            class="vcr-motion"
            @animationComplete="
              wi === elements.length - 1 ? emit('complete') : undefined
            "
          >
            {{ word }}
          </MotionSpan>
        </span>
        <!-- trailing space after each word/line -->
        <span v-if="wi !== elements.length - 1"> </span>
      </span>
    </template>
  </span>
</template>

<style scoped>
/* ---- container ---- */
.vcr-container {
  display: flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
}
.vcr-container--cols {
  flex-direction: column;
}

/* ---- screen-reader-only fallback ---- */
.vcr-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ---- word wrapper ---- */
.vcr-word {
  display: inline-flex;
  overflow: hidden;
}

/* ---- character / element wrapper ---- */
.vcr-char {
  position: relative;
  white-space: pre-wrap;
}

/* ---- animated span ---- */
.vcr-motion {
  display: inline-block;
}
</style>
