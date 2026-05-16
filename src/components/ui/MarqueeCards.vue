<script setup>
import { computed, ref } from 'vue'

const hovered = ref(false)

const cards = [
  {
    title: 'DESIGN BY AI',
    image: '/home/part4/1.jpg',
  },
  
  {
    title: 'DESIGN BY AI',
    image: '/home/part4/2.jpg',
  },

  {
    title: 'DESIGN BY AI',
    image: '/home/part4/3.jpg',
  },
]

const marqueeCards = computed(() => [...cards, ...cards])
const duration = computed(() => `${cards.length * 2500}ms`)
</script>

<template>
  <section class="marquee-cards-section">
    <div class="marquee-cards-heading">
      <h2>Design By AI</h2>
      <p>
        Stay ahead of the curve with fresh content on code, design, startups,
        and everything in between.
      </p>
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
  padding: 5.5rem 0 10rem;
  background: #fff6de;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
}

.marquee-cards-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: min(92%, 780px);
  margin: 0 auto 2.5rem;
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
  width: min(100%, 1200px);
  margin: 0 auto;
}

.marquee-cards-fade {
  position: absolute;
  top: 0;
  height: 100%;
  width: 5rem;
  z-index: 2;
  pointer-events: none;
}

.marquee-cards-fade--left {
  left: 0;
  background: linear-gradient(to right, #fff 0%, rgb(255 255 255 / 0) 100%);
}

.marquee-cards-fade--right {
  right: 0;
  background: linear-gradient(to left, #fff 0%, rgb(255 255 255 / 0) 100%);
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
  width: 14rem;
  height: 20rem;
  margin: 0 1rem;
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
    padding: 4rem 0 1.5rem;
  }

  .marquee-card {
    width: 12rem;
    height: 17rem;
    margin: 0 0.75rem;
  }

  .marquee-cards-fade {
    width: 3rem;
  }
}
</style>
