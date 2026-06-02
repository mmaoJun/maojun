<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  heading: { type: String, default: 'Design By AI' },
  description: { type: String, default: 'The UI design is inspired by 21st.dev, and the image materials come from pexels.com.' },
  cards: { type: Array, default: () => [] },
})

const defaultCards = [
  { title: 'DESIGN BY AI', image: '/home/part4/1.jpg' },
  { title: 'DESIGN BY AI', image: '/home/part4/2.jpg' },
  { title: 'DESIGN BY AI', image: '/home/part4/3.jpg' },
  { title: 'DESIGN BY AI', image: '/home/part4/4.jpg' },
  { title: 'DESIGN BY AI', image: '/home/part4/5.jpg' },
  { title: 'DESIGN BY AI', image: '/home/part4/6.jpg' },
  { title: 'DESIGN BY AI', image: '/home/part4/7.jpg' },
  { title: 'DESIGN BY AI', image: '/home/part4/8.jpg' },
  { title: 'DESIGN BY AI', image: '/home/part4/9.jpg' },
]

const hovered = ref(false)
const effectiveCards = computed(() => props.cards.length ? props.cards : defaultCards)
const marqueeCards = computed(() => [...effectiveCards.value, ...effectiveCards.value])
const duration = computed(() => `${effectiveCards.value.length * 2500}ms`)
</script>

<template>
  <section class="marquee-cards-section">
    <div class="marquee-cards-heading">
      <h2>{{ props.heading }}</h2>
      <p>{{ props.description }}</p>
    </div>

    <div
      class="marquee-cards-shell"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <div class="marquee-cards-fade marquee-cards-fade--left" aria-hidden="true"></div>

      <div
        class="marquee-cards-track"
        :style="{
          animationDuration: duration,
          animationPlayState: hovered ? 'paused' : 'running',
        }"
      >
        <div class="marquee-cards-row">
          <article
            v-for="(card, index) in marqueeCards"
            :key="`${card.title}-${index}`"
            class="marquee-card"
          >
            <img :src="card.image" :alt="card.title" />
            <div class="marquee-card__overlay">
              <p>{{ card.title }}</p>
            </div>
          </article>
        </div>
      </div>

      <div class="marquee-cards-fade marquee-cards-fade--right" aria-hidden="true"></div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.marquee-cards-section {
  width: 100%;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(2rem, 4vh, 4rem);
  padding: 2rem 0;
  background: #fcfcfb;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
}

.marquee-cards-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: min(92%, 780px);
  margin: 0 auto;
  flex-shrink: 0;
}

.marquee-cards-heading h2 {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.2rem);
  font-weight: 600;
}

.marquee-cards-heading p {
  margin: 0.8rem 0 0;
  max-width: 40rem;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #64748b;
}

.marquee-cards-shell {
  position: relative;
  overflow: hidden;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
}

.marquee-cards-fade {
  position: absolute;
  top: 0;
  height: 100%;
  width: clamp(3rem, 8vw, 8rem);
  z-index: 2;
  pointer-events: none;
}

.marquee-cards-fade--left {
  left: 0;
  background: linear-gradient(to right, #fcfcfb 0%, rgb(252 252 251 / 0) 100%);
}

.marquee-cards-fade--right {
  right: 0;
  background: linear-gradient(to left, #fcfcfb 0%, rgb(252 252 251 / 0) 100%);
}

.marquee-cards-track {
  display: flex;
  width: max-content;
  animation: marqueeScroll linear infinite;
}

.marquee-cards-row {
  display: flex;
}

.marquee-card {
  position: relative;
  width: clamp(14rem, 18vw, 22rem);
  height: clamp(32rem, 60vh, 48rem);
  margin: 0 clamp(0.6rem, 1.2vw, 1.5rem);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.marquee-card:hover {
  transform: scale(0.9);
}

.marquee-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.marquee-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  backdrop-filter: blur(12px);
  background: rgb(0 0 0 / 0.2);
}

.marquee-card:hover .marquee-card__overlay {
  opacity: 1;
}

.marquee-card__overlay p {
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.5;
}

@keyframes marqueeScroll {
  0% {
    transform: translateX(0%);
  }

  100% {
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .marquee-cards-section {
    min-height: auto;
    padding: 4rem 0;
    gap: 2rem;
  }

  .marquee-cards-shell {
    flex: none;
  }

  .marquee-card {
    width: 12rem;
    height: 28rem;
    margin: 0 0.75rem;
  }

  .marquee-cards-fade {
    width: 3rem;
  }
}
</style>
