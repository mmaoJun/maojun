<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref(null)
let ctx = null

/**
 * 5 cards evenly distributed along the SVG path (viewBox 1278×2319).
 *   section top%  ≈ -10 + (svgY / 2319) * 73
 *   section left% ≈   5 + (svgX / 1278) * 90
 * Each card is centered on the path point via transform: translate(-50%, -50%).
 */
const milestones = [
  { id: 2, img: '/blogPicture/p2.jpg', top: '26%', left: '72%', label: 'THE JOURNEY BEGINS',     labelSide: 'left' },
  { id: 3, img: '/blogPicture/p3.jpg', top: '80%', left: '34%', label: 'DEEP DIVE INTO CODE',    labelSide: 'right' },
  { id: 4, img: '/blogPicture/p4.jpg', top: '45%', left: '16%', label: 'BUILDING THE FUTURE',    labelSide: 'right' },
  { id: 5, img: '/blogPicture/p1.jpg', top: '63%', left: '78%', label: 'INFINITE POSSIBILITIES', labelSide: 'left' },
]

onMounted(() => {
  if (!sectionRef.value) return

  ctx = gsap.context(() => {
    // ===== SVG Path draw-on-scroll =====
    const path = sectionRef.value.querySelector('.scroll-svg-path')
    if (path) {
      const pathLength = path.getTotalLength()
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength * 0.5,
      })
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })
    }

    // ===== Card + label reveal timeline =====
    const cards = sectionRef.value.querySelectorAll('.milestone-card')
    cards.forEach((card) => {
      const label = card.querySelector('.card-label')

      gsap.set(card, { opacity: 0, force3D: true })
      gsap.set(label, { scaleX: 0, opacity: 0, y: '-50%', force3D: true })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'center center+=5%',
          toggleActions: 'play none none reverse',
        },
      })

      tl.to(card, { opacity: 1, duration: 0.35, ease: 'power2.out' })
        .to(label, { scaleX: 1, opacity: 1, y: '-50%', duration: 0.5, ease: 'back.out(2.5)' }, '-=0.15')
    })
  }, sectionRef.value)
})

onBeforeUnmount(() => {
  if (ctx) { ctx.revert(); ctx = null }
})
</script>

<template>
  <div class="study-experience-page">
    <section ref="sectionRef" class="scroll-section">

      <!-- ===== Hero Title ===== -->
      <div class="hero-area">
        <h1 class="hero-title">
          MY STUDY <br /> EXPERIENCE
        </h1>
        <p class="hero-sub">Scroll down to trace the journey</p>

        <!-- SVG Path -->
        <svg
          width="1278"
          height="2319"
          viewBox="0 0 1278 2319"
          fill="none"
          overflow="visible"
          xmlns="http://www.w3.org/2000/svg"
          class="scroll-svg"
        >
          <path
            class="scroll-svg-path"
            d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
            stroke="#C2F84F"
            stroke-width="20"
            fill="none"
          />
        </svg>
      </div>

      <!-- ===== Image Cards centered on the path ===== -->
      <div
        v-for="m in milestones"
        :key="m.id"
        class="milestone-card"
        :class="`label-${m.labelSide}`"
        :style="{ top: m.top, left: m.left }"
      >
        <span class="card-label" :class="`pop-${m.labelSide}`">{{ m.label }}</span>
        <img :src="m.img" class="card-img" loading="lazy" />
      </div>

      <!-- ===== Bottom Brand ===== -->
      <div class="bottom-section">
        <h1 class="bottom-brand">MMAOJUN.COM</h1>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ================================================================
   Page Wrapper
   ================================================================ */
.study-experience-page {
  background: #FAFDEE;
}

/* ================================================================
   Scroll Section
   ================================================================ */
.scroll-section {
  position: relative;
  height: 330vh;
  width: 100%;
  overflow: hidden;
  background: #FAFDEE;
  color: #1F3A4B;
  font-family: 'Plus Jakarta Sans', 'Manrope', 'Inter', sans-serif;
}

/* ================================================================
   Hero Area
   ================================================================ */
.hero-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: clamp(6rem, 12vh, 10rem);
  text-align: center;
  z-index: 1;
}

.hero-title {
  position: relative;
  z-index: 10;
  font-family: 'Plus Jakarta Sans', 'Manrope', sans-serif;
  font-size: clamp(4rem, 10vw, 10rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.9;
  margin: 0;
  color: #1F3A4B;
  text-transform: uppercase;
}

.hero-sub {
  position: relative;
  z-index: 10;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 500;
  color: #1F3A4B;
  margin-top: 1.25rem;
}

/* ================================================================
   SVG Path
   ================================================================ */
.scroll-svg {
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
  width: 90vw;
  max-width: 1400px;
  height: auto;
  pointer-events: none;
}

.scroll-svg-path {
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ================================================================
   Image Cards — centered on path via translate(-50%, -50%)
   ================================================================ */
.milestone-card {
  position: absolute;
  z-index: 5;
  transform: translate(-50%, -50%);
  pointer-events: auto;
}

/* label on the left, image on the right */
.milestone-card.label-left .card-label {
  right: 100%;
}

/* label on the right, image on the left */
.milestone-card.label-right .card-label {
  left: 100%;
}

.card-img {
  width: 520px;
  max-width: 50vw;
  height: auto;
  display: block;
  box-shadow:
    0 8px 32px rgba(31, 58, 75, 0.14),
    0 2px 8px rgba(31, 58, 75, 0.06);
  transition: box-shadow 0.35s ease;
}

.milestone-card:hover .card-img {
  box-shadow:
    0 16px 48px rgba(31, 58, 75, 0.22),
    0 4px 12px rgba(31, 58, 75, 0.1);
}

/* ================================================================
   Card Label — pops outward from the card edge
   ================================================================ */
.card-label {
  position: absolute;
  top: 50%;
  width: 520px;
  max-width: 50vw;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', 'Manrope', sans-serif;
  font-size: clamp(2.2rem, 5.5vw, 3.8rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #1F3A4B;
  background: none;
  padding: 20px;
  text-align: center;
  pointer-events: none;
  line-height: 1.2;
}

/* pop-right: expands from left edge → goes right */
.card-label.pop-right {
  transform-origin: left center;
}

/* pop-left: expands from right edge → goes left */
.card-label.pop-left {
  transform-origin: right center;
}

/* ================================================================
   Bottom Brand
   ================================================================ */
.bottom-section {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #1F3A4B;
  color: #FAFDEE;
  border-radius: 2rem 2rem 0 0;
  padding: 2.5rem 1rem;
  font-family: 'Plus Jakarta Sans', 'Manrope', sans-serif;
  z-index: 2;
}

.bottom-brand {
  font-size: clamp(2.5rem, 12vw, 14vw);
  font-weight: 700;
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-align: center;
  margin: 0;
  color: #FAFDEE;
  white-space: nowrap;
  overflow: hidden;
}

/* ================================================================
   Responsive — Tablet
   ================================================================ */
@media (max-width: 768px) {
  .scroll-section {
    height: 280vh;
  }

  .scroll-svg {
    width: 95vw;
  }

  .card-img {
    width: 340px;
    max-width: 55vw;
  }

  .card-label {
    width: 340px;
    max-width: 55vw;
    font-size: clamp(1.6rem, 4vw, 2.6rem);
    padding: 14px;
  }

  .bottom-section {
    border-radius: 1.5rem 1.5rem 0 0;
    padding: 2rem 0.75rem;
  }
}

/* ================================================================
   Responsive — Phone
   ================================================================ */
@media (max-width: 480px) {
  .scroll-section {
    height: 230vh;
  }

  .scroll-svg {
    width: 100vw;
  }

  .hero-area {
    padding-top: clamp(4rem, 8vh, 6rem);
  }

  .card-img {
    width: 260px;
    max-width: 60vw;
  }

  .card-label {
    width: 260px;
    max-width: 60vw;
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    padding: 10px;
  }
}
</style>
