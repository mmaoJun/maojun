<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import RandomLetterSwap from '../ui/RandomLetterSwap.vue'
import BlogView from './BlogView.vue'
import StudyExperience from './studyExperience.vue'

// Register GSAP plugins
gsap.registerPlugin(CustomEase)

const containerRef = ref(null)
const isMenuOpen = ref(false)
const activeView = ref(sessionStorage.getItem('design-active-view') || 'blog')
let ctx = null
let menuCtx = null

function switchView(view) {
  activeView.value = view
  sessionStorage.setItem('design-active-view', view)
  closeMenu()
}

// Create custom easing (fallback to power2.out if CustomEase unavailable)
try {
  if (!gsap.parseEase('main')) {
    CustomEase.create('main', '0.65, 0.01, 0.05, 0.99')
    gsap.defaults({ ease: 'main', duration: 0.7 })
  }
} catch (e) {
  console.warn('CustomEase failed to load, falling back to default.', e)
  gsap.defaults({ ease: 'power2.out', duration: 0.7 })
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

onMounted(() => {
  if (!containerRef.value) return

  ctx = gsap.context(() => {
    // Arrow line animation (safe check — may not exist)
    const arrowLine = document.querySelector('.arrow-line')
    if (arrowLine) {
      const pathLength = arrowLine.getTotalLength()
      gsap.set(arrowLine, { strokeDasharray: pathLength, strokeDashoffset: pathLength })
      const arrowTl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 })
      arrowTl
        .to(arrowLine, { strokeDashoffset: 0, duration: 1, ease: 'power2.out' })
        .to({}, { duration: 1.2 })
        .to(arrowLine, { strokeDashoffset: -pathLength, duration: 0.6, ease: 'power2.in' })
        .set(arrowLine, { strokeDashoffset: pathLength })
    }
  }, containerRef.value)
})

// Menu open/close animation
watch(isMenuOpen, (open) => {
  if (!containerRef.value) return

  // Kill any running menu animation
  if (menuCtx) {
    menuCtx.revert()
    menuCtx = null
  }

  menuCtx = gsap.context(() => {
    const navWrap = containerRef.value.querySelector('.nav-overlay-wrapper')
    const menu = containerRef.value.querySelector('.menu-content')
    const overlay = containerRef.value.querySelector('.overlay')
    const bgPanels = containerRef.value.querySelectorAll('.backdrop-layer')
    const menuLinks = containerRef.value.querySelectorAll('.nav-link')
    const menuButton = containerRef.value.querySelector('.nav-close-btn')
    const menuButtonTexts = menuButton?.querySelectorAll('p')
    const menuButtonIcon = menuButton?.querySelector('.menu-button-icon')

    const tl = gsap.timeline()

    if (open) {
      // OPEN
      if (navWrap) navWrap.setAttribute('data-nav', 'open')

      tl.set(navWrap, { display: 'block' })
        .set(menu, { xPercent: 0 }, '<')
        .set(menuLinks, { autoAlpha: 0 })
        .fromTo(menuButtonTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 })
        .fromTo(menuButtonIcon, { rotate: 0 }, { rotate: 315 }, '<')
        .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, '<')
        .fromTo(bgPanels, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, '<')
        .fromTo(menuLinks, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, autoAlpha: 1, stagger: 0.05 }, '<+=0.75')
    } else {
      // CLOSE
      if (navWrap) navWrap.setAttribute('data-nav', 'closed')

      tl.to(overlay, { autoAlpha: 0 })
        .to(menu, { xPercent: 120 }, '<')
        .to(menuButtonTexts, { yPercent: 0 }, '<')
        .to(menuButtonIcon, { rotate: 0 }, '<')
        .set(menuLinks, { clearProps: 'all' })
        .set(navWrap, { display: 'none' })
    }
  }, containerRef.value)
})

// Escape key handler
function handleEsc(e) {
  if (e.key === 'Escape' && isMenuOpen.value) {
    isMenuOpen.value = false
  }
}

watch(isMenuOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', handleEsc)
  } else {
    window.removeEventListener('keydown', handleEsc)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEsc)
  if (menuCtx) { menuCtx.revert(); menuCtx = null }
  if (ctx) { ctx.revert(); ctx = null }
})
</script>

<template>
  <div ref="containerRef" class="kinetic-nav-container">
    <!-- ===== Content Views (switched by menu) ===== -->
    <BlogView v-if="activeView === 'blog'" />
    <StudyExperience v-else-if="activeView === 'study'" />

    <!-- ===== Header ===== -->
    <div class="site-header-wrapper">
      <header class="header">
        <div class="container is--full">
          <nav class="nav-row">
            <div class="nav-row__right">
              <!-- Menu / Close button -->
              <button
                role="button"
                class="nav-close-btn"
                @click="toggleMenu"
              >
                <div class="menu-button-text">
                  <p class="p-large">Menu</p>
                  <p class="p-large">Close</p>
                </div>
                <div class="icon-wrap">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    viewBox="0 0 16 16"
                    fill="none"
                    class="menu-button-icon"
                  >
                    <path d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z" fill="currentColor" />
                    <path d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z" fill="currentColor" />
                    <path d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z" fill="currentColor" />
                    <path d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z" fill="currentColor" />
                    <path d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z" fill="currentColor" />
                    <path d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z" fill="currentColor" />
                  </svg>
                </div>
              </button>
            </div>
          </nav>
        </div>
      </header>
    </div>

    <!-- ===== Fullscreen Menu ===== -->
    <section class="fullscreen-menu-container">
      <div data-nav="closed" class="nav-overlay-wrapper">
        <!-- Clickable overlay backdrop -->
        <div class="overlay" @click="closeMenu"></div>

        <nav class="menu-content">
          <!-- Animated backdrop layers -->
          <div class="menu-bg">
            <div class="backdrop-layer first"></div>
            <div class="backdrop-layer second"></div>
            <div class="backdrop-layer"></div>

          </div>

          <!-- Menu links -->
          <div class="menu-content-wrapper">
            <ul class="menu-list">
              <li class="menu-list-item">
                <router-link to="/" class="nav-link" @click="closeMenu">
                  <RandomLetterSwap label="HOME" class="nav-link-text" />
                  <div class="nav-link-hover-bg"></div>
                </router-link>
              </li>
              <li class="menu-list-item">
                <router-link to="/login" class="nav-link" @click="closeMenu">
                  <RandomLetterSwap label="SETTING" class="nav-link-text" />
                  <div class="nav-link-hover-bg"></div>
                </router-link>
              </li>
              <li class="menu-list-item">
                <router-link to="/about" class="nav-link" @click="closeMenu">
                  <RandomLetterSwap label="CONTACT ME" class="nav-link-text" />
                  <div class="nav-link-hover-bg"></div>
                </router-link>
              </li>
              <li class="menu-list-item">
                <a href="#" class="nav-link" @click.prevent="switchView('blog')">
                  <RandomLetterSwap label="BLOG" class="nav-link-text" />
                  <div class="nav-link-hover-bg"></div>
                </a>
              </li>
              <li class="menu-list-item">
                <a href="#" class="nav-link" @click.prevent="switchView('study')">
                  <RandomLetterSwap label="STUDY EXPERIENCE" class="nav-link-text" />
                  <div class="nav-link-hover-bg"></div>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ================================================================
   Font Face
   ================================================================ */
@font-face {
  font-family: 'PP Neue Corp Tight';
  src: url('https://cdn.prod.website-files.com/673af51dea86ab95d124c3ee/673b0f5784f7060c0ac05534_PPNeueCorp-TightUltrabold.otf') format('opentype');
  font-weight: 900;
  font-style: normal;
}

/* ================================================================
   CSS Custom Properties
   ================================================================ */
.kinetic-nav-container {
  --color-primary: #6366f1;
  --color-dark: #131313;
  --color-neutral-100: #131313;
  --color-neutral-200: #333333;
  --color-neutral-300: #555555;
  --color-neutral-800: #262626;
  --size-container: 1400px;
  --container-padding: 2em;
  --section-padding: 4em;
  --gap: 1.5em;
  --cubic-default: cubic-bezier(0.65, 0.05, 0, 1);
  --font-size-nav-link: 90px;

  position: relative;
  width: 100%;
  min-height: 100svh;
  font-family: 'Manrope', 'Inter', sans-serif;
  color: #131313;
}

/* ================================================================
   Header
   ================================================================ */
.site-header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header {
  position: relative;
  width: 100%;
  padding: 1.25rem 0;
}

.container.is--full {
  width: 100%;
  max-width: var(--size-container);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* Right side of nav — pushed to top-right corner */
.nav-row__right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: fixed;
  top: clamp(1rem, 4vh, 2rem);
  right: clamp(1rem, 3vw, 2.5rem);
  z-index: 1010;
}

/* Menu / Close button — clean, no border/bg */
.nav-close-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  pointer-events: auto;
  padding: 0;
  color: var(--color-neutral-100);
  transition: color 0.3s ease;
}

.nav-close-btn:hover .icon-wrap {
  transform: rotate(90deg);
}

.menu-button-text {
  position: relative;
  overflow: hidden;
  height: 36px;  /* 30px * 1.2 line-height, masks Menu↔Close swap */
  line-height: 1.2;
}

.menu-button-text p {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
  line-height: 1.2;
}

.icon-wrap {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.35s cubic-bezier(0.65, 0.05, 0, 1);
}

.menu-button-icon {
  width: 100%;
  height: 100%;
  color: currentColor;
}

/* ================================================================
   Fullscreen Menu Container
   ================================================================ */
.fullscreen-menu-container {
  position: fixed;
  inset: 0;
  z-index: 999;
  pointer-events: none;
}

/* ================================================================
   Navigation Overlay Wrapper
   ================================================================ */
.nav-overlay-wrapper {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 998;
}

.nav-overlay-wrapper[data-nav='open'] {
  display: block;
}

/* ================================================================
   Overlay (clickable backdrop)
   ================================================================ */
.overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: auto;
  visibility: hidden;
  opacity: 0;
}

/* ================================================================
   Menu Content (30% width panel, slides in from right)
   ================================================================ */
.menu-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 30%;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  padding-top: 10vh;
  pointer-events: auto;
}

/* ================================================================
   Menu Background Panels (30% width, stacked on right)
   ================================================================ */
.menu-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
}

.backdrop-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: #c1fd62;
  border-radius: 24px 0 0 24px;
}

.backdrop-layer.first {
  z-index: 1;
  background: #b1ebfd;
}

.backdrop-layer.second {
  z-index: 2;
  background: #ececec;
}

/* ================================================================
   Menu Content Wrapper
   ================================================================ */
.menu-content-wrapper {
  position: relative;
  z-index: 4;
  width: 100%;
  max-width: var(--size-container);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

/* ================================================================
   Menu List
   ================================================================ */
.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ================================================================
   Menu List Items
   ================================================================ */
.menu-list-item {
  position: relative;
}

/* ================================================================
   Navigation Links
   ================================================================ */
.nav-link {
  position: relative;
  display: block;
  text-decoration: none;
  color: var(--color-neutral-100);
  padding: 0;
}

.nav-overlay-wrapper[data-nav='closed'] .nav-link-text,
.nav-overlay-wrapper:not([data-nav='open']) .nav-link-text {
  opacity: 0;
  visibility: hidden;
}

.nav-link {
  font-family: 'PP Neue Corp Tight', 'Manrope', sans-serif;
  font-size: var(--font-size-nav-link);
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.02em;
  color: #000;
}

.nav-link-text {
  position: relative;
  z-index: 1;
  margin: 0;
}

.nav-link:hover :deep(.rls-primary),
.nav-link:hover :deep(.rls-secondary) {
  color: #fff;
}

/* Hover background reveal strip */
.nav-link-hover-bg {
  position: absolute;
  inset: -0.1em -2rem -0.1em -2rem;
  z-index: 0;
  background: #262626;
  transform: scaleY(0);
  transform-origin: bottom center;
  transition: transform 0.45s var(--cubic-default);
}

.nav-link:hover .nav-link-hover-bg {
  transform: scaleY(1);
  transform-origin: bottom center;
}


/* ================================================================
   Responsive
   ================================================================ */
@media (max-width: 768px) {
  .kinetic-nav-container {
    --font-size-nav-link: 32px;
    --container-padding: 1.25em;
  }

  .menu-list {
    gap: 0.35rem;
  }

  .menu-content {
    width: 65%;
    padding-top: 8vh;
  }

  .nav-row__right {
    gap: 0.75rem;
    top: 0.75rem;
    right: 0.75rem;
  }

  .nav-close-btn {
    gap: 0.5rem;
  }

  .menu-button-text {
    height: 26px;  /* 22px * 1.2 */
  }

  .menu-button-text p {
    font-size: 22px;
  }

  .icon-wrap {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .kinetic-nav-container {
    --font-size-nav-link: 26px;
    --container-padding: 1em;
  }

}
</style>
