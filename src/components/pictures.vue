<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { picturesPageConfig } from '../config/siteContent'

gsap.registerPlugin(ScrollTrigger)

const pageConfig = picturesPageConfig
const pageRoot = ref(null)
const cleanups = []

onMounted(() => {
  const root = pageRoot.value
  if (!root) return

  const cards = Array.from(root.querySelectorAll('.vd-card'))
  const pinBox = root.querySelector('.pin-box')
  const firstTitle = root.querySelector('.ft-anim')
  const secondTitle = root.querySelector('.st-anim')
  const thirdTitle = root.querySelector('.tt-anim')

  if (!cards.length || !pinBox) return

  const pinTrigger = ScrollTrigger.create({
    trigger: root.querySelector('.testimonials-section'),
    start: '10% top',
    end: '92% top',
    scrub: 1.1,
    pin: true,
    pinSpacing: false,
    onUpdate: (self) => {
      const enablePointer = self.progress >= 0.9
      gsap.set(cards, { pointerEvents: enablePointer ? 'auto' : 'none' })
    },
  })

  const introTl = gsap.timeline({
    scrollTrigger: {
      trigger: root.querySelector('.testimonials-section'),
      start: 'top bottom',
      end: '92% top',
      scrub: true,
      pinSpacing: false,
    },
  })

  const pinTl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
  pinTl.from(cards, {
    yPercent: 300,
    stagger: 0.3,
    ease: 'power1.inOut',
  })

  introTl
    .to(firstTitle, { xPercent: 100, yPercent: -100 })
    .to(secondTitle, { xPercent: 5, yPercent: -100 }, '<')
    .to(thirdTitle, { xPercent: -80, yPercent: -100 }, '<')

  const state = {
    idle: 'idle',
    hover: 'hover',
    active: 'active',
  }

  let activeCard = null

  const lockOthers = (except) => {
    cards.forEach((card) => {
      if (card !== except) {
        gsap.to(card, {
          opacity: 0.8,
          filter: 'blur(2px)',
          pointerEvents: 'none',
          duration: 0.25,
        })
      }
    })
  }

  const unlockOthers = () => {
    cards.forEach((card) => {
      gsap.to(card, {
        opacity: 1,
        filter: 'blur(0px)',
        pointerEvents: 'auto',
        duration: 0.25,
      })
    })
  }

  cards.forEach((card, index, arr) => {
    const video = card.querySelector('video')
    const review = card.querySelector('.review-layer')
    const closeBtn = card.querySelector('.close-review')

    let currentState = state.idle
    const width = card.offsetWidth
    const height = card.offsetHeight

    const hoverTl = gsap
      .timeline({ paused: true })
      .to(card, {
        x: index !== arr.length - 1 ? -width / 2.5 : width / 2.5,
        duration: 0.35,
        ease: 'power2.out',
      })
      .to(card, { x: 0, zIndex: 20, duration: 0.3, ease: 'power2.inOut' })

    const openTl = gsap
      .timeline({ paused: true })
      .set(card, { zIndex: 50 })
      .to(card, {
        x: 0,
        y: '-2vh',
        width: width * 1.3,
        height: height * 1.3,
        rotationY: 180,
        duration: 0.7,
        ease: 'power3.inOut',
      })
      .to(review, { opacity: 1, filter: 'blur(0px)', duration: 0.2 }, '-=0.2')

    const closeTl = gsap
      .timeline({ paused: true })
      .to(review, { opacity: 0, filter: 'blur(2px)', duration: 0.2 })
      .to(card, {
        x: 0,
        y: 0,
        width,
        height,
        rotationY: 0,
        duration: 0.6,
        ease: 'power3.inOut',
      })
      .add(() => {
        currentState = state.idle
        activeCard = null
        card.classList.remove('active')
        unlockOthers()
      })

    const onEnter = () => {
      if (currentState !== state.idle) return
      lockOthers(card)
      currentState = state.hover
      video?.play()
      hoverTl.restart()
      gsap.to(card, { scale: 1.05, duration: 0.3 })
    }

    const onLeave = () => {
      if (currentState !== state.hover) return
      currentState = state.idle
      unlockOthers()
      video?.pause()
      hoverTl.reverse()
      gsap.to(card, { scale: 1, duration: 0.3 })
    }

    const onClick = () => {
      if (currentState === state.active || activeCard) return
      lockOthers(card)
      currentState = state.active
      activeCard = card
      card.classList.add('active')
      hoverTl.kill()
      openTl.restart()
    }

    const onClose = (event) => {
      event.stopPropagation()
      if (currentState !== state.active) return
      closeTl.restart()
      hoverTl.reverse()
      video?.pause()
      window.setTimeout(() => {
        gsap.to(card, { scale: 1, zIndex: '' })
      }, 100)
    }

    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mouseleave', onLeave)
    card.addEventListener('click', onClick)
    closeBtn?.addEventListener('click', onClose)

    cleanups.push(() => {
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mouseleave', onLeave)
      card.removeEventListener('click', onClick)
      closeBtn?.removeEventListener('click', onClose)
      hoverTl.kill()
      openTl.kill()
      closeTl.kill()
    })
  })

  cleanups.push(() => {
    pinTrigger.kill()
    introTl.scrollTrigger?.kill()
    introTl.kill()
    pinTl.kill()
  })

  ScrollTrigger.refresh()
})

onBeforeUnmount(() => {
  cleanups.forEach((fn) => fn())
  cleanups.length = 0
})
</script>

<template>
  <main ref="pageRoot" class="pictures-page">
    <section class="scroll-section">
      <span v-for="(line, idx) in pageConfig.introText" :key="`intro-${idx}`">
        {{ line }}<br v-if="idx < pageConfig.introText.length - 1" />
      </span>
    </section>

    <section class="testimonials-section">
      <div class="testimonial-wrapper">
        <div class="all-title">
          <h1 class="first-title ft-anim">{{ pageConfig.titleLines[0] }}</h1>
          <h1 class="sec-title st-anim">{{ pageConfig.titleLines[1] }}</h1>
          <h1 class="third-title tt-anim">{{ pageConfig.titleLines[2] }}</h1>
        </div>

        <div class="pin-box">
          <article
            v-for="(card, idx) in pageConfig.cards"
            :key="`${card.video}-${idx}`"
            class="vd-card"
            :class="card.rotateClass"
          >
            <video :src="card.video" muted loop playsinline preload="metadata"></video>
            <div class="review-layer">
              <div class="review-content">
                <div class="stars">******</div>
                <p>{{ card.review }}</p>
                <button class="close-review">x</button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="explore-btn-wrap">
        <button class="explore-btn">{{ pageConfig.ctaLabel }}</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Boldonse&display=swap");

.pictures-page {
  background-color: #000;
  font-family: "Boldonse", system-ui;
  color: #ffffff;
  background-image:
    radial-gradient(circle at 20% 18%, rgb(255 255 255 / 0.06) 0, transparent 24%),
    radial-gradient(circle at 80% 76%, rgb(255 255 255 / 0.04) 0, transparent 22%),
    linear-gradient(180deg, rgb(255 255 255 / 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px),
    linear-gradient(180deg, #050505 0%, #0b0b0b 100%);
  background-size: auto, auto, 22px 22px, 22px 22px, 100% 100%;
  background-position: center, center, 0 0, 0 0, 0 0;
}

.pictures-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.scroll-section {
  height: 100svh;
  font-size: clamp(2rem, 4vw, 3rem);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-align: center;
  padding: 2rem;
}

.spacer-section {
  pointer-events: none;
}

.testimonials-section {
  position: relative;
  width: 100%;
  height: 110svh;
  overflow: hidden;
}

.testimonial-wrapper {
  width: 100%;
  height: 112svh;
  position: relative;
}

.all-title {
  position: absolute;
  width: 100%;
  height: 150svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5vw;
}

.all-title h1 {
  font-size: 12.5vw;
  line-height: 1.5;
  letter-spacing: -0.4vw;
  margin-left: 2vw;
  text-transform: uppercase;
  font-weight: normal;
}

.first-title,
.third-title {
  color: rgb(255 255 255 / 0.05);
  -webkit-text-stroke: 1px rgb(255 255 255 / 0.12);
}

.sec-title {
  color: rgb(255 255 255 / 0.92);
}

.pin-box {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  left: 0;
  top: 4rem;
  bottom: 0;
  width: 100%;
  right: 0;
  padding-inline-start: 13rem;
}

.vd-card {
  margin-inline-start: -11rem;
  width: 17.5rem;
  height: 30rem;
  overflow: hidden;
  border-radius: 2vw;
  border: 0.5vw solid #fff;
  transform-style: preserve-3d;
  position: relative;
  cursor: pointer;
  background-color: #fff;
}

.review-layer {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateY(180deg);
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  filter: blur(2px);
}

.review-content {
  color: white;
  text-align: center;
  max-width: 80%;
}

.review-content .stars {
  font-size: 1.4rem;
  color: gold;
}

.review-content p {
  white-space: pre-line;
  line-height: 1.45;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.95rem;
}

.vd-card.active {
  z-index: 50;
  cursor: unset;
}

.vd-card.active .review-layer {
  pointer-events: auto;
}

.vd-card video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.close-review {
  height: 40px;
  width: 40px;
  background-color: transparent;
  border: 2px solid #fff;
  margin-top: 1rem;
  color: #fff;
  border-radius: 50%;
  font-size: 20px;
  outline: none;
  cursor: pointer;
}

.rotate--10 {
  transform: rotate(-10deg);
}

.rotate--4 {
  transform: rotate(-4deg);
}

.rotate--3 {
  transform: rotate(-3deg);
}

.rotate-4 {
  transform: rotate(4deg);
}

.explore-btn-wrap {
  position: absolute;
  bottom: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.explore-btn {
  background: #f5f5f5;
  color: #111;
  padding: 1rem 3rem;
  border-radius: 999px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 700;
}

@media (max-width: 1000px) {
  .scroll-section {
    font-size: 1.5rem;
  }

  .testimonials-section,
  .testimonial-wrapper {
    height: 100svh;
  }

  .all-title {
    padding-top: 18vw;
  }

  .all-title h1 {
    font-size: 18vw;
    line-height: 1.15;
    letter-spacing: -0.12em;
  }

  .pin-box {
    gap: 1rem;
    top: 5.5rem;
    padding-inline-start: 7rem;
  }

  .vd-card {
    width: 11rem;
    height: 19rem;
    border-radius: 1.4rem;
    border-width: 4px;
    margin-inline-start: -7rem;
  }

  .review-content p {
    font-size: 0.78rem;
  }

  .explore-btn {
    padding: 0.85rem 2rem;
    font-size: 0.9rem;
  }
}
</style>
