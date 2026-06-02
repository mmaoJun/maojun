<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SECTION_HEIGHT = 1500

const centerRef = ref(null)
const parallaxRefs = ref([])
const scheduleRef = ref(null)

const scheduleItems = [
  { title: '完成博客页面设计', date: '2026-06-02' },
  { title: '修复导航动画 Bug', date: '2026-06-02' },
  { title: '优化视差滚动效果', date: '2026-06-01' },
  { title: '更新菜单交互逻辑', date: '2026-06-01' },
  { title: '重构 DesignView 页面', date: '2026-05-30' },
  { title: '添加 RandomLetterSwap 组件', date: '2026-05-30' },
  { title: '项目初始化与配置', date: '2026-05-28' },
]

const parallaxImages = [
  {
    src: '/blogPicture/p1.jpg',
    alt: 'Parallax image 1',
    start: -200,
    end: 200,
    class: 'w-1/3',
  },
  {
    src: '/blogPicture/p2.jpg',
    alt: 'Parallax image 2',
    start: 200,
    end: -250,
    class: 'mx-auto w-2/3',
  },
  {
    src: '/blogPicture/p3.jpg',
    alt: 'Parallax image 3',
    start: -200,
    end: 200,
    class: 'ml-auto w-1/3',
  },
  {
    src: '/blogPicture/p4.jpg',
    alt: 'Parallax image 4',
    start: 0,
    end: -500,
    class: 'ml-24 w-5/12',
  },
]

let ctx = null

function setParallaxRef(el, index) {
  if (el) parallaxRefs.value[index] = el
}

onMounted(async () => {
  await nextTick()

  ctx = gsap.context(() => {
    // ── Center Image Clip-path Reveal ──
    if (centerRef.value) {
      const clipObj = { val: 25 }
      const bsObj = { val: 170 }
      const opacityObj = { val: 1 }

      // Clip-path: 25% → 0%
      gsap.to(clipObj, {
        val: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: centerRef.value,
          start: 'top top',
          end: `+=${SECTION_HEIGHT}`,
          scrub: true,
        },
        onUpdate: () => {
          const v = clipObj.val
          centerRef.value.style.clipPath = `polygon(${v}% ${v}%, ${100 - v}% ${v}%, ${100 - v}% ${100 - v}%, ${v}% ${100 - v}%)`
        },
      })

      // Background size: 170% → 100%
      gsap.to(bsObj, {
        val: 100,
        ease: 'none',
        scrollTrigger: {
          trigger: centerRef.value,
          start: 'top top',
          end: `+=${SECTION_HEIGHT + 500}`,
          scrub: true,
        },
        onUpdate: () => {
          centerRef.value.style.backgroundSize = `${bsObj.val}%`
        },
      })

      // Opacity: fade out at end
      gsap.to(centerRef.value, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: centerRef.value,
          start: `+=${SECTION_HEIGHT}`,
          end: `+=${SECTION_HEIGHT + 500}`,
          scrub: true,
        },
      })
    }

    // ── Parallax Images ──
    parallaxRefs.value.forEach((el, i) => {
      if (!el) return
      const img = parallaxImages[i]

      // Translate Y parallax
      gsap.fromTo(el,
        { y: img.start },
        {
          y: img.end,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: `${img.start}px bottom`,
            end: `bottom ${-img.end}px`,
            scrub: true,
          },
        }
      )

      // Opacity + scale fade out — only in last 25% of travel
      gsap.fromTo(el,
        { opacity: 1, scale: 1 },
        {
          opacity: 0,
          scale: 0.85,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 5%',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
    })

    // ── Schedule Items Entrance ──
    if (scheduleRef.value) {
      const items = scheduleRef.value.querySelectorAll('.schedule-item')
      const heading = scheduleRef.value.querySelector('.schedule-heading')

      if (heading) {
        gsap.fromTo(heading,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: heading,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      items.forEach((item) => {
        gsap.fromTo(item,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    }
  })

  // Refresh ScrollTrigger after layout settles
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
})

onBeforeUnmount(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <div class="smooth-scroll-hero">
    <!-- ===== Hero ===== -->
    <div class="ssh-hero" :style="{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }">
      <!-- BLOG Label -->
      <h1 class="ssh-blog-label">BLOG</h1>

      <!-- Center Image -->
      <div
        ref="centerRef"
        class="ssh-center-image"
        :style="{
          backgroundImage: `url(/blogPicture/blog.png)`,
          clipPath: 'polygon(25% 25%, 75% 25%, 75% 75%, 25% 75%)',
        }"
      />

      <!-- Parallax Images -->
      <div class="ssh-parallax-wrap">
        <img
          v-for="(img, i) in parallaxImages"
          :key="i"
          :ref="(el) => setParallaxRef(el, i)"
          :src="img.src"
          :alt="img.alt"
          :class="img.class"
          class="ssh-parallax-img"
        />
      </div>

      <!-- Bottom fade gradient -->
      <div class="ssh-hero-fade" />
    </div>

    <!-- ===== Schedule ===== -->
    <section id="launch-schedule" ref="scheduleRef" class="ssh-schedule">
      <h2 class="schedule-heading">每日完成事项</h2>
      <div
        v-for="(item, i) in scheduleItems"
        :key="i"
        class="schedule-item"
      >
        <p class="schedule-item-title">{{ item.title }}</p>
        <p class="schedule-item-date">{{ item.date }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');

.smooth-scroll-hero {
  background: #fff;
  color: #131313;
  font-family: 'Manrope', 'Inter', sans-serif;
}

/* ===== Hero ===== */
.ssh-hero {
  position: relative;
  width: 100%;
}

.ssh-blog-label {
  position: absolute;
  top: 3rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: clamp(4rem, 10vw, 8rem);
  font-weight: 900;
  font-style: italic;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #fff;
  mix-blend-mode: difference;
  margin: 0;
  pointer-events: none;
}

.ssh-center-image {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 170%;
  will-change: clip-path, background-size, opacity;
}

.ssh-parallax-wrap {
  max-width: 64rem;
  margin: 0 auto;
  padding: 200px 1rem 0;
}

.ssh-parallax-img {
  display: block;
  margin-bottom: 1.5rem;
  will-change: transform, opacity;
}

.w-1\/3 { width: 33.333%; }
.w-2\/3 { width: 66.666%; }
.w-5\/12 { width: 41.666%; }
.mx-auto { margin-left: auto; margin-right: auto; }
.ml-auto { margin-left: auto; }
.ml-24 { margin-left: 6rem; }

/* Bottom fade */
.ssh-hero-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24rem;
  background: linear-gradient(to bottom, transparent, #fff);
  pointer-events: none;
}

/* ===== Schedule ===== */
.ssh-schedule {
  max-width: 64rem;
  margin: 0 auto;
  padding: 12rem 1rem;
}

.schedule-heading {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 3rem;
  font-weight: 900;
  font-style: italic;
  letter-spacing: 0.02em;
  color: #131313;
  margin: 0 0 5rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e5e5;
  padding: 0 0.75rem 2.25rem;
  margin-bottom: 2.25rem;
}

.schedule-item-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #131313;
  margin: 0;
}

.schedule-item-date {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1rem;
  color: #999;
  margin: 0;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .ssh-parallax-wrap {
    padding-top: 120px;
  }

  .ssh-parallax-img.w-1\/3,
  .ssh-parallax-img.w-2\/3,
  .ssh-parallax-img.w-5\/12 {
    width: 100%;
  }

  .ssh-parallax-img.mx-auto,
  .ssh-parallax-img.ml-auto {
    margin-left: 0;
  }

  .ssh-parallax-img.ml-24 {
    margin-left: 2rem;
  }

  .ssh-schedule {
    padding: 6rem 1rem;
  }

  .schedule-heading {
    font-size: 1.5rem;
    margin-bottom: 3rem;
  }
}
</style>
