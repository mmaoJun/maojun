<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ModalDialog from '@/components/ui/ModalDialog.vue'

gsap.registerPlugin(ScrollTrigger)

const SECTION_HEIGHT = 1500
const IMAGE_LOAD_TIMEOUT = 8000 // fallback if images fail to load

const centerRef = ref(null)
const parallaxRefs = ref([])
const scheduleRef = ref(null)

const scheduleItems = [
  {
    title: '完成博客页面设计',
    date: '2026-06-02',
    description: '基于 Smooth Scroll Hero 模式重构了 BlogView 页面，集成了 GSAP ScrollTrigger 驱动的视差图片动画、中心图片 clip-path 揭示效果，以及日程列表的入场动画。整体采用 Playfair Display 衬线字体搭配 Manrope 无衬线字体，营造优雅的阅读氛围。',
    tags: ['设计', 'GSAP', '前端'],
  },
  {
    title: '修复导航动画 Bug',
    date: '2026-06-02',
    description: '排查并修复了 FluidMenu 组件在路由切换时动画状态残留的问题。通过 onBeforeUnmount 生命周期钩子正确清理了 GSAP context，确保离开页面时所有 tweens 和 ScrollTrigger 实例被 kill，防止内存泄漏和动画冲突。',
    tags: ['Bug修复', 'GSAP', '导航'],
  },
  {
    title: '优化视差滚动效果',
    date: '2026-06-01',
    description: '对 DesignView 和 BlogView 中的视差元素进行了性能优化：添加了 will-change 属性提示浏览器提前合成、使用 transform3d 启用 GPU 加速、通过 matchMedia 在移动端降级视差强度，确保低性能设备也有流畅体验。',
    tags: ['性能', '视差', '优化'],
  },
  {
    title: '更新菜单交互逻辑',
    date: '2026-06-01',
    description: '重新设计了 FluidMenu 的交互状态机，解决了快速 hover 切换时的动画抖动问题。新增了菜单项的进入/离开延迟逻辑，使用 gsap.timeline 编排多阶段过渡动画，让整体交互更加顺滑自然。',
    tags: ['交互', '菜单', 'GSAP'],
  },
  {
    title: '重构 DesignView 页面',
    date: '2026-05-30',
    description: '将 DesignView 页面从分散的组件重构为统一的 Kinetic Nav 架构。引入了可复用的 UI 组件体系（RevealTextHero、LayeredText、MarqueeCards 等），建立了清晰的数据流和动画生命周期管理模式。',
    tags: ['重构', '架构', '组件化'],
  },
  {
    title: '添加 RandomLetterSwap 组件',
    date: '2026-05-30',
    description: '开发了一个创意文字效果组件，通过 GSAP 驱动的逐帧动画实现字母随机交换效果。支持自定义交换速度、字符集和触发时机，可应用于标题、按钮等多种场景，为页面增添动态趣味性。',
    tags: ['GSAP', '文字动画', '组件'],
  },
  {
    title: '项目初始化与配置',
    date: '2026-05-28',
    description: '搭建 myWebsite 全栈项目脚手架：前端采用 Vue 3 + Vite 8 + Vue Router 5，后端采用 Spring Boot 3.3.5 + MyBatis-Plus。配置了 JWT 无状态认证、Aliyun OSS 对象存储、以及基于发布订阅模式的路由转场动画系统。',
    tags: ['初始化', '全栈', '配置'],
  },
]

const showModal = ref(false)
const selectedItem = ref(null)

function openDetail(item) {
  selectedItem.value = item
  showModal.value = true
}

function closeDetail() {
  showModal.value = false
}

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

/**
 * Preload all hero images into browser cache so the DOM <img> elements
 * decode quickly. Then wait for DOM images to actually finish layout.
 */
function preloadImages() {
  const sources = [
    '/blogPicture/home.jpg',
    ...parallaxImages.map((img) => img.src),
  ]

  let loaded = 0
  const total = sources.length

  return new Promise((resolve) => {
    const fallback = setTimeout(() => {
      console.warn('[BlogView] Image preload timed out, proceeding with', loaded, 'of', total, 'loaded')
      resolve()
    }, IMAGE_LOAD_TIMEOUT)

    sources.forEach((src) => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loaded++
        if (loaded >= total) {
          clearTimeout(fallback)
          resolve()
        }
      }
      img.src = src
    })
  })
}

/** Wait for every parallax DOM <img> to finish decoding + layout */
function waitForDomImages() {
  const els = parallaxRefs.value.filter(Boolean)
  if (els.length === 0) return Promise.resolve()

  let done = 0
  const total = els.length

  return new Promise((resolve) => {
    const fallback = setTimeout(() => resolve(), 3000)
    els.forEach((el) => {
      if (el.complete) {
        done++
        if (done >= total) { clearTimeout(fallback); resolve() }
        return
      }
      el.addEventListener('load', () => {
        done++
        if (done >= total) { clearTimeout(fallback); resolve() }
      }, { once: true })
      el.addEventListener('error', () => {
        done++
        if (done >= total) { clearTimeout(fallback); resolve() }
      }, { once: true })
    })
  })
}

onMounted(async () => {
  await nextTick()

  // 1. Preload images into browser cache
  await preloadImages()

  // 2. Wait for DOM <img> elements to complete decoding + paint
  await waitForDomImages()

  // 3. Yield to the browser so layout settles
  await new Promise(r => requestAnimationFrame(r))

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
          backgroundImage: `url(/blogPicture/home.jpg)`,
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
        role="button"
        tabindex="0"
        @click="openDetail(item)"
        @keydown.enter="openDetail(item)"
        @keydown.space.prevent="openDetail(item)"
      >
        <div class="schedule-item-left">
          <p class="schedule-item-title">{{ item.title }}</p>
          <div class="schedule-item-tags" v-if="item.tags">
            <span v-for="tag in item.tags" :key="tag" class="schedule-tag">{{ tag }}</span>
          </div>
        </div>
        <p class="schedule-item-date">{{ item.date }}</p>
      </div>
    </section>

    <!-- ===== Detail Modal ===== -->
    <ModalDialog
      :visible="showModal"
      :title="selectedItem?.title || ''"
      :date="selectedItem?.date || ''"
      @close="closeDetail"
    >
      <template v-if="selectedItem">
        <p class="modal-description">{{ selectedItem.description }}</p>
        <div class="modal-tags" v-if="selectedItem.tags">
          <span v-for="tag in selectedItem.tags" :key="tag" class="modal-tag">{{ tag }}</span>
        </div>
        <button class="modal-action-btn" @click="closeDetail">关闭</button>
      </template>
    </ModalDialog>
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
  cursor: pointer;
  transition: border-color 0.3s, transform 0.3s;
  user-select: none;
}

.schedule-item:hover {
  border-bottom-color: #bbb;
  transform: translateX(4px);
}

.schedule-item:focus-visible {
  outline: 2px solid #131313;
  outline-offset: 4px;
  border-radius: 2px;
}

.schedule-item-left {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.schedule-item-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #131313;
  margin: 0;
  transition: color 0.3s;
}

.schedule-item:hover .schedule-item-title {
  color: #555;
}

.schedule-item-date {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1rem;
  color: #999;
  margin: 0;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Tags inside schedule card */
.schedule-item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.schedule-tag {
  font-family: 'Manrope', 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #777;
  background: #f3f3f3;
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
}

/* ===== Modal Content ===== */
.modal-description {
  font-family: 'Manrope', 'Inter', sans-serif;
  font-size: 0.95rem;
  line-height: 1.75;
  color: #444;
  margin: 0 0 1.25rem;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.modal-tag {
  font-family: 'Manrope', 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #555;
  background: #f3f3f3;
  border: 1px solid #e8e8e8;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
}

.modal-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Manrope', 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: #131313;
  border: none;
  border-radius: 0.6rem;
  padding: 0.65rem 1.5rem;
  cursor: pointer;
  transition: background 0.25s, transform 0.2s;
}

.modal-action-btn:hover {
  background: #333;
}

.modal-action-btn:active {
  transform: scale(0.97);
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

  .schedule-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0 0.5rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .schedule-item:hover {
    transform: translateX(2px);
  }

  .schedule-item-title {
    font-size: 1.2rem;
  }
}
</style>
