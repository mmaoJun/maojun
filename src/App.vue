<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { aboutPageConfig, homePageConfig, siteFooter, siteNavLinks } from './config/siteContent'
import { useHomeContent } from './composables/useHomeContent'
import { proxyUrl } from './utils/ossProxy'
import GlassFilter from './components/ui/GlassFilter.vue'
import LiquidGlassNav from './components/ui/LiquidGlassNav.vue'
import LiquidGlassButton from './components/ui/LiquidGlassButton.vue'
import ParallaxFloatingGallery from './components/ui/ParallaxFloatingGallery.vue'
import LayeredText from './components/ui/LayeredText.vue'
import SiteFooter from './components/ui/SiteFooter.vue'
import FeedbackSlider from './components/ui/FeedbackSlider.vue'
import SwapyDraggableCard from './components/ui/SwapyDraggableCard.vue'
import RevealTextHero from './components/ui/RevealTextHero.vue'
import ShiningText from './components/ui/ShiningText.vue'
import MarqueeCards from './components/ui/MarqueeCards.vue'
import AnimatedSlideshow from './components/ui/AnimatedSlideshow.vue'
import RouteCurtain from './components/ui/RouteCurtain.vue'
import MenuToggleIcon from './components/ui/MenuToggleIcon.vue'
import {
  setRouteCurtainEnabled,
  subscribeRouteContentVisible,
  subscribeRouteCurtainEnabled,
} from './components/ui/routeCurtainController'

const route = useRoute()
const router = useRouter()
const ROUTE_TRANSITION_STORAGE_KEY = 'route-transition-animation-enabled'
const enableRouteTransitionAnimation = true
const routeTransitionAnimationEnabled = ref(enableRouteTransitionAnimation)
const isHomePage = computed(() => route.path === '/')
const isAboutPage = computed(() => route.path === '/about')
const ADMIN_PATHS = ['/login', '/manage-images', '/home-editor', '/movies-editor', '/pictures-editor', '/about-editor', '/musics-editor']
const isAdminRoute = computed(() => ADMIN_PATHS.some(p => route.path.startsWith(p)))
const homeConfig = homePageConfig
const aboutConfig = aboutPageConfig
const navLinks = siteNavLinks
const footerInfo = computed(() => homeContent.footerData())

const homeContent = useHomeContent()

const heroMediaType = computed(() => homeContent.hero().heroMedia.type || 'video')
const heroSrc = computed(() => proxyUrl(homeContent.hero().heroMedia.src))
const heroLoaderCenterImage = computed(() => homeContent.hero().heroMedia.loaderCenterImage)
const heroFallbackPoster = computed(() => homeContent.hero().heroMedia.fallbackPoster)
const heroPoster = ref(heroFallbackPoster.value)
const heroFrameCacheKey = computed(() => heroMediaType.value === 'video' ? `hero-first-frame:${heroSrc.value}` : null)
const isHeroVideo = computed(() => heroMediaType.value === 'video')
const burningImage = homeConfig.burningImage
const cardsImage = computed(() => homeContent.cardFlip().cardsImage)
const collectionItems = computed(() => homeContent.collectionImages())

const cardBack1 = computed(() => homeContent.cardFlip().cardBackImages[0])
const cardBack2 = computed(() => homeContent.cardFlip().cardBackImages[1])
const cardBack3 = computed(() => homeContent.cardFlip().cardBackImages[2])
const hitokoto2 = ref('')
const routeContentVisible = ref(true)
const navReady = ref(false)
const homeRoot = ref(null)
const getInitialShowLoader = () => {
  try {
    const isAdminPath = ADMIN_PATHS.some(p => window.location.pathname.startsWith(p))
    if (isAdminPath) return false
    return sessionStorage.getItem('site-loader-played') !== '1'
  } catch {
    return true
  }
}

const showLoader = ref(getInitialShowLoader())
const loaderDone = ref(false)
const loaderHeroBlast = ref(null)
const loaderImages = homeConfig.loader.images
const loaderSeed = computed(() => [
  loaderImages[0], loaderImages[1], loaderImages[2],
  loaderImages[3], heroLoaderCenterImage.value, loaderImages[4],
  loaderImages[5], loaderImages[6], loaderImages[7],
])
const loaderTracks = homeConfig.loader.tracks
const loaderSplitIndex = Math.ceil(loaderTracks.length / 2)
const loaderLeftTracks = computed(() => loaderTracks.slice(0, loaderSplitIndex))
const loaderRightTracks = computed(() => loaderTracks.slice(loaderSplitIndex))
const loaderPerimeterOrder = [0, 2, 6, 8, 1, 3, 5, 7]
let lenis = null
let rafFn = null
let navEl = null
let navInitialWidth = 0
let navPinnedWidth = null
let homeActive = false
let pendingRestorePath = null
let pendingHomeNavTransition = null
let pendingHomeNavTargetY = null
const scrollPositions = new Map()
const cleanups = []
let unsubscribeRouteContentVisibility = null
let unsubscribeRouteCurtainEnabled = null

const getInitialRouteTransitionAnimationEnabled = () => {
  try {
    const saved = localStorage.getItem(ROUTE_TRANSITION_STORAGE_KEY)
    if (saved === 'true') return true
    if (saved === 'false') return false
  } catch {
    // ignore storage access errors
  }
  return enableRouteTransitionAnimation
}

const persistRouteTransitionAnimationEnabled = (enabled) => {
  try {
    localStorage.setItem(ROUTE_TRANSITION_STORAGE_KEY, String(enabled))
  } catch {
    // ignore storage access errors
  }
}

const toggleRouteTransitionAnimation = () => {
  setRouteCurtainEnabled(!routeTransitionAnimationEnabled.value)
}

const getDefaultNavWidthPx = () => {
  const rootFontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16
  if (window.innerWidth <= 1000) {
    return Math.max(window.innerWidth - rootFontSize, 0)
  }
  return Math.min(1625, Math.max(window.innerWidth - (2.7 * rootFontSize), 0))
}

const restoreNavDefaultWidth = () => {
  if (!navEl) return 0
  gsap.killTweensOf(navEl)
  gsap.set(navEl, { clearProps: 'width' })
  navInitialWidth = navEl.getBoundingClientRect().width || getDefaultNavWidthPx()
  return navInitialWidth
}

const getCompactNavWidth = () => (window.innerWidth >= 768 ? '760px' : '72vw')

const applyCompactNavWidth = () => {
  if (!navEl) return
  gsap.killTweensOf(navEl)
  gsap.set(navEl, { width: getCompactNavWidth() })
}

const shouldHomeNavBeCompactAtScrollY = (scrollY = 0) => {
  const intro = homeRoot.value?.querySelector('.mwg_effect000')
  if (!intro) return false

  const triggerRatio = window.innerWidth >= 768 ? 0.52 : 0.58
  const compactThreshold = intro.offsetTop - (window.innerHeight * triggerRatio)
  return scrollY > Math.max(compactThreshold, 0)
}

const syncHomeNavForTargetScroll = (scrollY = 0, animateLong = false) => {
  if (!navEl) return

  if (shouldHomeNavBeCompactAtScrollY(scrollY)) {
    applyCompactNavWidth()
    return
  }

  const defaultWidth = navInitialWidth || getDefaultNavWidthPx()
  if (animateLong) {
    gsap.fromTo(navEl, {
      width: getCompactNavWidth(),
    }, {
      width: defaultWidth,
      duration: 0.75,
      ease: 'power1.inOut',
      overwrite: true,
      onComplete: () => restoreNavDefaultWidth(),
    })
    return
  }

  restoreNavDefaultWidth()
}

const getCurrentHomeScrollY = () => {
  if (lenis && typeof lenis.scroll === 'number') return lenis.scroll
  return window.scrollY || 0
}

const getHitokoto2 = async () => {
  try {
    const res = await axios.get('https://v1.hitokoto.cn', {
      params: { c: 'a', max_length: 10 },
    })
    hitokoto2.value = res.data.from

  } catch (error) {
    hitokoto2.value = '请求失败，请重试'
    console.error('请求出错：', error)
  }
}

const getCachedHeroFrame = () => {
  try {
    return localStorage.getItem(heroFrameCacheKey.value)
  } catch {
    return null
  }
}

const setCachedHeroFrame = (frame) => {
  try {
    localStorage.setItem(heroFrameCacheKey.value, frame)
  } catch {
    // ignore storage quota / privacy mode failures
  }
}

const captureVideoFirstFrame = () => new Promise((resolve) => {
  const video = document.createElement('video')
  video.src = heroSrc.value
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.crossOrigin = 'anonymous'

  const cleanup = () => {
    video.pause()
    video.removeAttribute('src')
    video.load()
  }

  const fallback = () => {
    cleanup()
    resolve(heroFallbackPoster.value)
  }

  const drawFrame = () => {
    try {
      const width = video.videoWidth || 1920
      const height = video.videoHeight || 1080
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        fallback()
        return
      }
      ctx.drawImage(video, 0, 0, width, height)
      const frame = canvas.toDataURL('image/jpeg', 0.92)
      setCachedHeroFrame(frame)
      cleanup()
      resolve(frame)
    } catch {
      fallback()
    }
  }

  video.addEventListener('loadeddata', () => {
    if (video.readyState >= 2) {
      video.currentTime = 0
    }
  }, { once: true })

  video.addEventListener('seeked', drawFrame, { once: true })
  video.addEventListener('error', fallback, { once: true })
  window.setTimeout(fallback, 4000)
})
const initSmoothScroll = () => {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  rafFn = (t) => lenis?.raf(t * 1000)
  gsap.ticker.add(rafFn)
  gsap.ticker.lagSmoothing(0)
  cleanups.push(() => {
    if (rafFn) gsap.ticker.remove(rafFn)
    lenis?.destroy()
  })
}

const playSiteLoader = async () => {
  await nextTick()

  const overlay = document.querySelector('.site-loader')
  const logoLines = gsap.utils.toArray('.loader-logo-line')
  const sideRows = gsap.utils.toArray('.loader-side .loader-row')
  const leftRows = gsap.utils.toArray('.loader-left .loader-row')
  const rightRows = gsap.utils.toArray('.loader-right .loader-row')
  const leftTextNodes = gsap.utils.toArray('.loader-left .loader-row p')
  const rightTextNodes = gsap.utils.toArray('.loader-right .loader-row p')
  const cells = gsap.utils.toArray('.loader-cell')
  const centerCell = document.querySelector('.loader-cell.is-center')
  const nonCenterCells = cells.filter((el) => !el.classList.contains('is-center'))
  const heroFrame = document.querySelector('.hero-frame')
  const heroMediaEl = document.querySelector('.hero-media .hero-media-el')

  if (!overlay || !cells.length || !centerCell || !heroFrame || !heroMediaEl) {
    showLoader.value = false
    loaderDone.value = true
    return
  }

  let poolIdx = 0
  const nextImg = () => {
    const src = loaderImages[poolIdx % loaderImages.length]
    poolIdx += 1
    return src
  }

  const randomizeTiles = (keepCenter = true) => {
    cells.forEach((cell, idx) => {
      const img = cell.querySelector('img')
      if (!img) return
      if (idx === 4 && keepCenter) {
        img.src = heroLoaderCenterImage.value
      } else {
        img.src = nextImg()
      }
    })
  }

  const setCenterToHero = () => {
    const centerImg = centerCell.querySelector('img')
    if (centerImg) centerImg.src = heroLoaderCenterImage.value
  }

  const getHeroTransitionRect = () => {
    const frameRect = heroFrame.getBoundingClientRect()
    if (window.innerWidth > 1000) return frameRect

    const naturalW = heroMediaEl.videoWidth || heroMediaEl.naturalWidth || heroMediaEl.clientWidth
    const naturalH = heroMediaEl.videoHeight || heroMediaEl.naturalHeight || heroMediaEl.clientHeight
    if (!naturalW || !naturalH) return frameRect

    const frameRatio = frameRect.width / frameRect.height
    const imageRatio = naturalW / naturalH

    let width = frameRect.width
    let height = frameRect.height

    if (imageRatio > frameRatio) {
      height = frameRect.width / imageRatio
    } else {
      width = frameRect.height * imageRatio
    }

    const left = frameRect.left + (frameRect.width - width) / 2
    const top = frameRect.top + (frameRect.height - height) / 2

    return { left, top, width, height }
  }

  let swapTimer = 0

  gsap.set('.hero-nav', { opacity: 0 })
  gsap.set('.page-jumpers', { y: 20, opacity: 0 })
  gsap.set(cells, {
    opacity: 0,
    y: -26,
    filter: 'brightness(0.6)',
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  })
  gsap.set(leftRows, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' })
  gsap.set(rightRows, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' })
  gsap.set(leftTextNodes, { color: '#5f5f5f' })
  gsap.set(rightTextNodes, { color: '#5f5f5f' })

  await new Promise((resolve) => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        window.clearInterval(swapTimer)
        resolve()
      },
    })

    tl.to(logoLines[0], {
      backgroundPosition: '0% 0%',
      duration: 0.5,
      ease: 'none',
    })
      .to(logoLines[1], {
        backgroundPosition: '0% 0%',
        duration: 0.5,
        ease: 'none',
      }, '-=0.15')
      .to(leftRows, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 0.4,
        stagger: 0.04,
      }, '+=0.12')
      .to(rightRows, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 0.4,
        stagger: 0.04,
      }, '<')
      .to(cells, {
        opacity: 1,
        y: 0,
        filter: 'brightness(0.92)',
        duration: 0.5,
        stagger: (idx) => Math.floor(idx / 3) * 0.07 + (idx % 3) * 0.024,
      }, '<0.03')
      .add(() => {
        randomizeTiles(false)
        swapTimer = window.setInterval(() => randomizeTiles(false), 70)
      }, '>-0.02')
      .to(leftTextNodes, {
        color: '#f2f2f2',
        duration: 0.26,
        stagger: 0.02,
      }, '<')
      .to(rightTextNodes, {
        color: '#f2f2f2',
        duration: 0.26,
        stagger: 0.02,
      }, '<')
      .to(cells, {
        filter: 'brightness(1)',
        duration: 0.24,
        stagger: (idx) => Math.floor(idx / 3) * 0.04 + (idx % 3) * 0.012,
      }, '<')
      .to('.loader-logo', {
        opacity: 0,
        y: -4,
        duration: 0.2,
        ease: 'power1.out',
      }, '<0.06')
      .to({}, { duration: 0.25 })
      .to(leftRows, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.42,
        ease: 'power2.inOut',
        stagger: 0.03,
      })
      .to(rightRows, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.42,
        ease: 'power2.inOut',
        stagger: 0.03,
      }, '<')
      .to(leftTextNodes, {
        filter: 'blur(1.2px)',
        color: '#8a8a8a',
        duration: 0.3,
        stagger: 0.02,
      }, '<0.02')
      .to(rightTextNodes, {
        filter: 'blur(1.2px)',
        color: '#8a8a8a',
        duration: 0.3,
        stagger: 0.02,
      }, '<')
      .add(() => {
        window.clearInterval(swapTimer)
        setCenterToHero()
      }, '<0.02')
      .to(nonCenterCells, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 0,
      }, '<0.02')
      .to(nonCenterCells, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.32,
        ease: 'power2.inOut',
        stagger: 0,
      }, '>')
      .to(nonCenterCells, {
        opacity: 0,
        duration: 0.16,
      }, '<0.14')
      .add(() => {
        const rect = centerCell.getBoundingClientRect()
        if (!loaderHeroBlast.value) return

        const centerRadius = parseFloat(window.getComputedStyle(centerCell).borderTopLeftRadius) || 0

        gsap.set(loaderHeroBlast.value, {
          display: 'block',
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          opacity: 1,
          borderRadius: `${centerRadius}px`,
        })
      })
      .to('.loader-grid', { opacity: 0, duration: 0.12 }, '<')
      .to(loaderHeroBlast.value, {
        x: () => getHeroTransitionRect().left,
        y: () => getHeroTransitionRect().top,
        width: () => getHeroTransitionRect().width,
        height: () => getHeroTransitionRect().height,
        borderRadius: () => {
          const heroRadius = window.getComputedStyle(heroFrame).borderTopLeftRadius
          const targetRadius = window.innerWidth <= 1000 ? 0 : parseFloat(heroRadius) || 16
          return `${targetRadius}px`
        },
        opacity: 0,
        duration: 0.85,
        ease: 'power3.inOut',
      }, '<')
      .to('.site-loader', { opacity: 0, duration: 0.2 }, '>-0.08')
      .to('.hero-nav', { opacity: 1, duration: 0.35, ease: 'power2.out' }, '<0.02')
      .to('.page-jumpers', { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, '<0.04')
  })

  if (loaderHeroBlast.value) {
    gsap.set(loaderHeroBlast.value, { display: 'none', clearProps: 'all' })
  }

  showLoader.value = false
  loaderDone.value = true
}

const handleGoHome = (event) => {
  event.preventDefault()
  if (route.path !== '/') {
    scrollPositions.set(route.path, window.scrollY || 0)
    pendingRestorePath = '/'
    pendingHomeNavTransition = 'pending'
    pendingHomeNavTargetY = scrollPositions.get('/') ?? 0
    applyCompactNavWidth()
    router.push('/')
    return
  }
  if (!navEl) return
  gsap.to(navEl, {
    width: restoreNavDefaultWidth() || navEl.getBoundingClientRect().width,
    duration: 1.25,
    ease: 'power1.inOut',
    overwrite: true,
  })
  if (lenis) {
    lenis.scrollTo(0, { immediate: true })
    ScrollTrigger.update()
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }
}

const restoreScrollPosition = (path) => {
  const savedY = scrollPositions.get(path)
  if (typeof savedY !== 'number') return
  if (path === '/' && lenis) {
    lenis.scrollTo(savedY, { immediate: true })
    ScrollTrigger.update()
  } else {
    window.scrollTo({ top: savedY, left: 0, behavior: 'auto' })
  }
}

const restoreHomeScrollPosition = (onComplete) => {
  const savedY = scrollPositions.get('/')
  if (typeof savedY !== 'number') {
    if (typeof onComplete === 'function') onComplete()
    return
  }

  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    if (lenis) {
      lenis.scrollTo(savedY, { immediate: true })
      ScrollTrigger.update()
    } else {
      window.scrollTo({ top: savedY, left: 0, behavior: 'auto' })
    }

    requestAnimationFrame(() => {
      if (lenis) {
        lenis.scrollTo(savedY, { immediate: true })
        ScrollTrigger.update()
      }
      if (typeof onComplete === 'function') onComplete(savedY)
    })
  })
}

const navigateWithNavTransition = (path) => {
  if (route.path === path) return
  scrollPositions.set(route.path, window.scrollY || 0)
  if (navEl) {
    if (route.path === '/') {
      applyCompactNavWidth()
    } else {
      gsap.killTweensOf(navEl)
      gsap.set(navEl, { width: getCompactNavWidth() })
    }
  }
  router.push(path)
}

const getPageBottom = () => {
  const el = document.scrollingElement || document.documentElement
  return Math.max(el.scrollHeight - el.clientHeight, 0)
}

const smoothScrollWindowTo = (targetY) => {
  const startY = window.scrollY || 0
  const clampedTarget = Math.max(targetY, 0)
  const distance = Math.abs(clampedTarget - startY)
  if (distance < 2) return

  const state = { y: startY }
  gsap.to(state, {
    y: clampedTarget,
    duration: Math.min(1.45, Math.max(0.65, distance / 950)),
    ease: 'power3.inOut',
    onUpdate: () => window.scrollTo({ top: state.y, left: 0, behavior: 'auto' }),
  })
}

const scrollToTop = () => {
  if (route.path === '/' && lenis) {
    lenis.scrollTo(0, { immediate: true })
    ScrollTrigger.update()
    return
  }
  smoothScrollWindowTo(0)
}

const scrollToBottom = () => {
  const bottomY = getPageBottom()
  if (route.path === '/' && lenis) {
    lenis.scrollTo(bottomY, { immediate: true })
    ScrollTrigger.update()
    return
  }
  smoothScrollWindowTo(bottomY)
}

const initHeroScroll = () => {
  const nav = document.querySelector('.hero-nav')
  const hero = homeRoot.value?.querySelector('.hero')
  const intro = homeRoot.value?.querySelector('.mwg_effect000')
  const frame = homeRoot.value?.querySelector('.hero-frame')
  const heroVideoEl = homeRoot.value?.querySelector('.hero-media .hero-media-el')
  const heroCopy = homeRoot.value?.querySelector('.hero-copy')
  if (!nav || !hero || !intro || !frame || !heroVideoEl || !heroCopy) return

  const mm = gsap.matchMedia()

  const setupNavWidthTrigger = ({ breakpoint, start, compactWidth, scrub }) => {
    mm.add(breakpoint, () => {
      const initialNavWidth = navInitialWidth || getDefaultNavWidthPx()
      const tl = gsap.timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub },
      })

      tl.to(frame, { scale: window.innerWidth >= 768 ? 0.74 : 0.82, '--hero-dark': window.innerWidth >= 768 ? 0.36 : 0.28, ease: 'none' }, 0)
        .to(heroVideoEl, { scale: 1, ease: 'none' }, 0)

      if (window.innerWidth >= 768) {
        tl.to(heroCopy, { y: -28, opacity: 0.15, ease: 'none' }, 0)
      }

      const setNavWidthState = (isCompact, animate = true) => {
        const targetWidth = isCompact ? compactWidth : initialNavWidth
        const method = animate ? gsap.to : gsap.set
        method(nav, {
          width: targetWidth,
          duration: animate ? (isCompact ? 0.82 : 0.75) : 0,
          ease: animate ? 'power1.inOut' : 'none',
          overwrite: true,
        })
      }

      const syncNavWidthState = (animate = false) => {
        if (pendingRestorePath === '/') {
          setNavWidthState(true, false)
          return
        }

        const introTop = intro.getBoundingClientRect().top
        const startRatio = Number.parseFloat(start.split(' ')[1]) / 100
        const triggerLine = window.innerHeight * startRatio
        setNavWidthState(introTop <= triggerLine, animate)
      }

      const navTrigger = ScrollTrigger.create({
        trigger: intro,
        start,
        end: start,
        onEnter: () => setNavWidthState(true, true),
        onLeaveBack: () => setNavWidthState(false, true),
        onRefresh: () => syncNavWidthState(false),
      })

      requestAnimationFrame(() => syncNavWidthState(false))

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
        navTrigger.kill()
      }
    })
  }

  setupNavWidthTrigger({
    breakpoint: '(min-width: 768px)',
    start: 'top 52%',
    compactWidth: '760px',
    scrub: 1.1,
  })

  setupNavWidthTrigger({
    breakpoint: '(max-width: 767px)',
    start: 'top 58%',
    compactWidth: '72vw',
    scrub: 1,
  })

  cleanups.push(() => mm.revert())
}

const initCardScroll = () => {
  const cardContainer = homeRoot.value?.querySelector('.card-container')
  const stickyHeader = homeRoot.value?.querySelector('.sticky-header h1')
  if (!cardContainer || !stickyHeader) return

  const mm = gsap.matchMedia()
  mm.add('(max-width: 999px)', () => {
    let gapDone = false
    let flipDone = false
    const cards = homeRoot.value?.querySelectorAll('.card') || []
    const edgeCards = homeRoot.value?.querySelectorAll('#card-1, #card-3') || []
    const allCards = homeRoot.value?.querySelectorAll('#card-1, #card-2, #card-3') || []

    const trigger = ScrollTrigger.create({
      trigger: homeRoot.value?.querySelector('.sticky'),
      start: 'top top',
      end: `+=${window.innerHeight * 2.45}px`,
      scrub: 0.9,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        const p = self.progress

        if (p >= 0.08 && p <= 0.24) {
          const hp = gsap.utils.mapRange(0.08, 0.24, 0, 1, p)
          gsap.set(stickyHeader, {
            y: gsap.utils.mapRange(0, 1, 28, 0, hp),
            opacity: gsap.utils.mapRange(0, 1, 0, 1, hp),
          })
        } else if (p < 0.08) {
          gsap.set(stickyHeader, { y: 28, opacity: 0 })
        } else {
          gsap.set(stickyHeader, { y: 0, opacity: 1 })
        }

        if (p <= 0.28) {
          const w = gsap.utils.mapRange(0, 0.28, 94, 86, p)
          gsap.set(cardContainer, { width: `${w}%` })
        } else {
          gsap.set(cardContainer, { width: '86%' })
        }

        if (p >= 0.34 && !gapDone) {
          gsap.to(cardContainer, { gap: '12px', duration: 0.45, ease: 'power3.out' })
          gsap.to(allCards, { borderRadius: '18px', duration: 0.45, ease: 'power3.out' })
          gapDone = true
        } else if (p < 0.34 && gapDone) {
          gsap.to(cardContainer, { gap: '0px', duration: 0.45, ease: 'power3.out' })
          gsap.to(homeRoot.value?.querySelector('#card-1'), { borderRadius: '20px 0 0 20px', duration: 0.45, ease: 'power3.out' })
          gsap.to(homeRoot.value?.querySelector('#card-2'), { borderRadius: '0px', duration: 0.45, ease: 'power3.out' })
          gsap.to(homeRoot.value?.querySelector('#card-3'), { borderRadius: '0 20px 20px 0', duration: 0.45, ease: 'power3.out' })
          gapDone = false
        }

        if (p >= 0.66 && !flipDone) {
          gsap.to(cards, { rotationY: 180, duration: 0.72, ease: 'power3.inOut', stagger: 0.08 })
          gsap.to(edgeCards, { y: 16, rotationZ: (i) => [-10, 10][i], duration: 0.72, ease: 'power3.inOut' })
          flipDone = true
        } else if (p < 0.66 && flipDone) {
          gsap.to(cards, { rotationY: 0, duration: 0.72, ease: 'power3.inOut', stagger: -0.08 })
          gsap.to(edgeCards, { y: 0, rotationZ: 0, duration: 0.72, ease: 'power3.inOut' })
          flipDone = false
        }
      },
    })

    return () => trigger.kill()
  })

  mm.add('(min-width: 1000px)', () => {
    let gapDone = false
    let flipDone = false
    const cards = homeRoot.value?.querySelectorAll('.card') || []
    const edgeCards = homeRoot.value?.querySelectorAll('#card-1, #card-3') || []
    const allCards = homeRoot.value?.querySelectorAll('#card-1, #card-2, #card-3') || []
    const trigger = ScrollTrigger.create({
      trigger: homeRoot.value?.querySelector('.sticky'),
      start: 'top top',
      end: `+=${window.innerHeight * 3.2}px`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        const p = self.progress
        if (p >= 0.1 && p <= 0.25) {
          const hp = gsap.utils.mapRange(0.1, 0.25, 0, 1, p)
          gsap.set(stickyHeader, { y: gsap.utils.mapRange(0, 1, 40, 0, hp), opacity: gsap.utils.mapRange(0, 1, 0, 1, hp) })
        } else if (p < 0.1) {
          gsap.set(stickyHeader, { y: 40, opacity: 0 })
        } else {
          gsap.set(stickyHeader, { y: 0, opacity: 1 })
        }
        if (p <= 0.25) {
          const w = gsap.utils.mapRange(0, 0.25, 75, 60, p)
          gsap.set(cardContainer, { width: `${w}%` })
        } else gsap.set(cardContainer, { width: '60%' })

        if (p >= 0.35 && !gapDone) {
          gsap.to(cardContainer, { gap: '20px', duration: 0.5, ease: 'power3.out' })
          gsap.to(allCards, { borderRadius: '20px', duration: 0.5, ease: 'power3.out' })
          gapDone = true
        } else if (p < 0.35 && gapDone) {
          gsap.to(cardContainer, { gap: '0px', duration: 0.5, ease: 'power3.out' })
          gsap.to(homeRoot.value?.querySelector('#card-1'), { borderRadius: '20px 0 0 20px', duration: 0.5, ease: 'power3.out' })
          gsap.to(homeRoot.value?.querySelector('#card-2'), { borderRadius: '0px', duration: 0.5, ease: 'power3.out' })
          gsap.to(homeRoot.value?.querySelector('#card-3'), { borderRadius: '0 20px 20px 0', duration: 0.5, ease: 'power3.out' })
          gapDone = false
        }

        if (p >= 0.7 && !flipDone) {
          gsap.to(cards, { rotationY: 180, duration: 0.75, ease: 'power3.inOut', stagger: 0.1 })
          gsap.to(edgeCards, { y: 30, rotationZ: (i) => [-15, 15][i], duration: 0.75, ease: 'power3.inOut' })
          flipDone = true
        } else if (p < 0.7 && flipDone) {
          gsap.to(cards, { rotationY: 0, duration: 0.75, ease: 'power3.inOut', stagger: -0.1 })
          gsap.to(edgeCards, { y: 0, rotationZ: 0, duration: 0.75, ease: 'power3.inOut' })
          flipDone = false
        }
      },
    })
    return () => trigger.kill()
  })

  cleanups.push(() => mm.revert())
}

const initCollectionHover = () => {
  const root = homeRoot.value?.querySelector('.mwg_effect000')
  if (!root) return

  let oldX = 0
  let oldY = 0
  let deltaX = 0
  let deltaY = 0

  const handleMouseMove = (event) => {
    deltaX = event.clientX - oldX
    deltaY = event.clientY - oldY
    oldX = event.clientX
    oldY = event.clientY
  }

  root.addEventListener('mousemove', handleMouseMove)

  const mediaItems = Array.from(root.querySelectorAll('.media'))
  const mediaCleanups = mediaItems.map((el) => {
    const handleEnter = () => {
      const image = el.querySelector('img')
      if (!image) return

      gsap.killTweensOf(image)
      gsap.set(image, { x: 0, y: 0, rotate: 0 })

      const randomRotate = (Math.random() - 0.5) * 12
      const offsetX = gsap.utils.clamp(-72, 72, deltaX * 10)
      const offsetY = gsap.utils.clamp(-72, 72, deltaY * 10)

      gsap.timeline()
        .fromTo(image, {
          x: offsetX,
          y: offsetY,
          rotate: randomRotate,
        }, {
          x: 0,
          y: 0,
          rotate: 0,
          duration: 1.1,
          ease: 'expo.out',
          clearProps: 'x,y,rotate',
        })
    }

    el.addEventListener('mouseenter', handleEnter)
    return () => el.removeEventListener('mouseenter', handleEnter)
  })

  cleanups.push(() => {
    root.removeEventListener('mousemove', handleMouseMove)
    mediaCleanups.forEach((fn) => fn())
  })
}

const activateHome = async () => {
  if (homeActive || !loaderDone.value) return
  await nextTick()
  if (!homeRoot.value) return
  getHitokoto2()
  initSmoothScroll()
  navEl = document.querySelector('.hero-nav')
  navInitialWidth = getDefaultNavWidthPx()
  applyCompactNavWidth()

  initHeroScroll()
  initCardScroll()
  initCollectionHover()
  homeActive = true

  if (pendingRestorePath === '/') {
    const targetY = pendingHomeNavTargetY ?? scrollPositions.get('/') ?? 0
    restoreHomeScrollPosition((restoredY = targetY) => {
      const shouldCompact = shouldHomeNavBeCompactAtScrollY(restoredY)
      syncHomeNavForTargetScroll(restoredY, !shouldCompact)
      pendingRestorePath = null
      pendingHomeNavTransition = null
      pendingHomeNavTargetY = null
    })
    return
  }

  syncHomeNavForTargetScroll(getCurrentHomeScrollY(), false)
}

const deactivateHome = () => {
  if (!homeActive) return
  cleanups.forEach((fn) => fn())
  cleanups.length = 0
  ScrollTrigger.getAll().forEach((t) => t.kill())
  lenis = null
  rafFn = null
  homeActive = false
}

onMounted(async () => {
  gsap.registerPlugin(ScrollTrigger)
  setRouteCurtainEnabled(getInitialRouteTransitionAnimationEnabled())
  unsubscribeRouteCurtainEnabled = subscribeRouteCurtainEnabled((enabled) => {
    routeTransitionAnimationEnabled.value = enabled
    persistRouteTransitionAnimationEnabled(enabled)
  })
  unsubscribeRouteContentVisibility = subscribeRouteContentVisible((visible) => {
    routeContentVisible.value = visible
  })

  if (ADMIN_PATHS.some(p => window.location.pathname.startsWith(p))) {
    showLoader.value = false
    loaderDone.value = true
    sessionStorage.setItem('site-loader-played', '1')
    return
  }

  await homeContent.fetchContent()
  heroPoster.value = isHeroVideo.value
    ? (getCachedHeroFrame() || await captureVideoFirstFrame())
    : heroSrc.value
  navEl = document.querySelector('.hero-nav')
  navInitialWidth = getDefaultNavWidthPx()
  if (isHomePage.value) {
    syncHomeNavForTargetScroll(window.scrollY || 0, false)
  } else {
    applyCompactNavWidth()
  }
  navReady.value = true

  const loaderPlayed = sessionStorage.getItem('site-loader-played') === '1'
  if (!loaderPlayed && !ADMIN_PATHS.some(p => window.location.pathname.startsWith(p))) {
    await playSiteLoader()
    sessionStorage.setItem('site-loader-played', '1')
    if (route.path !== '/') {
      await router.replace('/')
    }
    await activateHome()
    return
  }

  showLoader.value = false
  loaderDone.value = true
  if (isHomePage.value) await activateHome()
})

watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/' && oldPath && oldPath !== '/') homeContent.fetchContent()
  if (!navEl) return
  if (oldPath) {
    const currentY = oldPath === '/' ? getCurrentHomeScrollY() : (window.scrollY || 0)
    scrollPositions.set(oldPath, currentY)
  }

  if (newPath === '/' && oldPath !== '/') {
    navPinnedWidth = null
    pendingRestorePath = '/'
    pendingHomeNavTransition = 'pending'
    pendingHomeNavTargetY = scrollPositions.get('/') ?? 0
    applyCompactNavWidth()
    return
  }

  if (newPath !== '/') {
    pendingHomeNavTransition = null
    pendingHomeNavTargetY = null
    applyCompactNavWidth()
  }

  pendingRestorePath = null
  requestAnimationFrame(() => restoreScrollPosition(newPath))
})

watch(isHomePage, async (isHome) => {
  if (isAdminRoute.value) {
    deactivateHome()
    showLoader.value = false
    loaderDone.value = true
    return
  }

  if (isHome) {
    await activateHome()
  } else {
    deactivateHome()
    applyCompactNavWidth()
  }
})

onBeforeUnmount(() => {
  deactivateHome()
  unsubscribeRouteContentVisibility?.()
  unsubscribeRouteCurtainEnabled?.()
})
</script>

<template>
  <RouterView v-if="isAdminRoute" />
  <template v-else>
    <RouteCurtain />
    <div :style="{ visibility: routeContentVisible ? 'visible' : 'hidden' }">
      <div v-if="showLoader" class="site-loader">
    <div class="loader-columns loader-side loader-left">
      <div class="loader-head loader-row">
        <p>{{ homeConfig.loader.sideHeading }}</p>
      </div>
      <div class="loader-row" v-for="(track, idx) in loaderLeftTracks" :key="`left-${idx}`">
        <p>{{ track }}</p>
      </div>
    </div>

    <div class="loader-center-wrap">
      <div class="loader-logo" aria-hidden="true">
        <h1 class="loader-logo-line" v-for="(line, idx) in homeConfig.loader.title" :key="`loader-title-${idx}`">{{ line
        }}</h1>
      </div>
      <div class="loader-grid">
        <div class="loader-cell" v-for="(src, idx) in loaderSeed" :key="`loader-${idx}`" :data-loader-idx="idx"
          :class="{ 'is-center': idx === 4 }">
          <img :src="src" alt="loader tile" />
        </div>
      </div>
    </div>

    <div class="loader-columns loader-side loader-right">
      <div class="loader-head loader-row">
        <p>{{ homeConfig.loader.sideHeading }}</p>
      </div>
      <div class="loader-row" v-for="(track, idx) in loaderRightTracks" :key="`right-${idx}`">
        <p>{{ track }}</p>
      </div>
    </div>

    <div ref="loaderHeroBlast" class="loader-hero-blast">
      <img :src="heroLoaderCenterImage" alt="loader hero" />
    </div>
  </div>

  <GlassFilter />
  <div v-show="!showLoader && navReady" class="hero-nav-wrap">
    <LiquidGlassNav>
      <a class="hero-logo" href="/" @click="handleGoHome">{{ homeConfig.brand }}</a>
      <nav class="hero-links">
        <a v-for="link in navLinks" :key="link.href" :href="link.href" class="nav-icon-link"
          @click.prevent="navigateWithNavTransition(link.href)" :title="link.label">
          <svg v-if="link.icon === 'music'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="3"/></svg>
          <svg v-else-if="link.icon === 'image'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><polyline points="12 2 12 22"/><polyline points="2 8.5 12 15.5 22 8.5"/></svg>
          <svg v-else-if="link.icon === 'film'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="15" y1="12" x2="22" y2="12"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
        </a>
      </nav>
      <a class="hero-settings" href="/login" @click.prevent="navigateWithNavTransition('/login')" title="Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </a>
    </LiquidGlassNav>

    <button
      v-if="isAboutPage"
      type="button"
      class="route-transition-toggle"
      :class="{ 'route-transition-toggle--off': !routeTransitionAnimationEnabled }"
      @click="toggleRouteTransitionAnimation"
      :aria-pressed="routeTransitionAnimationEnabled"
      :aria-label="routeTransitionAnimationEnabled ? 'Disable route transition animation' : 'Enable route transition animation'"
    >
      <MenuToggleIcon
        :open="!routeTransitionAnimationEnabled"
        :size="30"
        :duration="500"
        class="route-transition-toggle__icon"
      />
    </button>
  </div>

  <main v-if="isHomePage" ref="homeRoot">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-frame">
          <div class="hero-media">
            <video v-if="heroMediaType === 'video'" class="hero-media-el" :src="heroSrc" :poster="heroPoster" autoplay muted loop playsinline
              preload="metadata"></video>
            <img v-else class="hero-media-el" :src="heroSrc" alt="" />
          </div>
          <div class="hero-copy">
            <RevealTextHero :text="homeContent.hero().revealText" text-color="#f8fafc" overlay-color="#ef4444"
              font-size="clamp(3rem, 8vw, 7.8rem)" />
          </div>
          <span class="hero-tip">
            <ShiningText :text="homeContent.hero().heroTip" />
          </span>
        </div>
      </div>
    </section>

    <section class="mwg_effect000">
      <div class="medias">
        <div v-for="(src, idx) in collectionItems" :key="`collection-${idx}`" class="media">
          <img :src="src" :alt="`collection item ${idx + 1}`" />
        </div>
      </div>
    </section>

    <FeedbackSlider />

    <SwapyDraggableCard />

    <AnimatedSlideshow :eyebrow="homeContent.animatedSlideshow().eyebrow" :slides="homeContent.animatedSlideshow().slides" />

    <MarqueeCards :heading="homeContent.marqueeCards().heading" :description="homeContent.marqueeCards().description" :cards="homeContent.marqueeCards().cards" />

    <section class="sticky">
      <div class="sticky-header">
        <h1>{{ homeContent.cardFlip().title }}</h1>
      </div>
      <div class="card-container">
        <div class="card" id="card-1">
          <div class="card-front card-front-1" :style="{ backgroundImage: `url(${cardsImage})` }"></div>
          <div class="card-back card-back-image"><img :src="cardBack1" alt="card back 1" /></div>
        </div>
        <div class="card" id="card-2">
          <div class="card-front card-front-2" :style="{ backgroundImage: `url(${cardsImage})` }"></div>
          <div class="card-back card-back-image"><img :src="cardBack2" alt="card back 2" /></div>
        </div>
        <div class="card" id="card-3">
          <div class="card-front card-front-3" :style="{ backgroundImage: `url(${cardsImage})` }"></div>
          <div class="card-back card-back-image"><img :src="cardBack3" alt="card back 3" /></div>
        </div>
      </div>
    </section>

    <LayeredText />
    <ParallaxFloatingGallery :title="homeContent.parallaxGallery().galleryTitle" button-label="about" min-height="100svh" :images="homeContent.parallaxGallery().images" :gallery-route="homeContent.parallaxGallery().route" />
    <SiteFooter :brand-name="footerInfo.brandName" :logo-text="footerInfo.logoText"
      :social-links="footerInfo.socialLinks" :main-links="footerInfo.mainLinks" :legal-links="footerInfo.legalLinks"
      :copyright="footerInfo.copyright" />
  </main>
  <RouterView v-else />
    </div>
  </template>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap");

.hero-nav-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  pointer-events: none;
}

.hero-nav-wrap :deep(.liquid-glass-nav),
.hero-nav-wrap :deep(.hero-nav) {
  pointer-events: auto;
}

.route-transition-toggle {
  position: fixed;
  top: 47.6vh;
  left: 49.1%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3rem;
  min-height: 3rem;
  padding: 0.55rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  color: #22c55e;
  font: inherit;
  line-height: 1;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.24s ease, color 0.24s ease, opacity 0.24s ease;
}

.route-transition-toggle--off {
  color: #ef4444;
}

.route-transition-toggle:hover {
  opacity: 0.86;
}

.route-transition-toggle:active {
  transform: translateX(-50%) translateY(1px);
}

.route-transition-toggle__icon {
  color: currentColor;
  flex-shrink: 0;
}

@media (max-width: 1000px) {
  .route-transition-toggle {
    top: 13svh;
    left: 50%;
    right: auto;
    min-height: 2.7rem;
    padding: 0.45rem;
  }

  .route-transition-toggle:active {
    transform: translateX(-50%) translateY(1px);
  }
}

.site-loader {
  position: fixed;
  inset: 0;
  background: #000;
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(340px, 520px) minmax(180px, 1fr);
  align-items: center;
  gap: clamp(1rem, 4vw, 2.6rem);
  padding: clamp(1rem, 3vw, 2rem);
  z-index: 12000;
  opacity: 1;
  pointer-events: auto;
  overflow: hidden
}

.loader-center-wrap {
  position: relative;
  display: grid;
  place-items: center
}

.loader-logo {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .22em;
  z-index: 4;
  pointer-events: none
}

.loader-logo h1 {
  font-family: 'STXingkai', 'Arial Black', sans-serif;
  font-size: clamp(1.5rem, 3.4vw, 2.75rem);
  font-weight: 700;
  line-height: .93;
  padding: 0 0.1em;
  letter-spacing: .03em;
  color: #2e2e2e;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-image: linear-gradient(0deg, #2f2f2f, #2f2f2f 52%, #f2f2f2 0);
  background-size: 100% 210%;
  background-position: 0% 100%;
  text-transform: uppercase
}

.loader-logo .loader-logo-line:first-child {
  transform: none
}

.loader-logo .loader-logo-line:last-child {
  transform: none
}

.loader-grid {
  width: min(78vw, 520px);
  aspect-ratio: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .7rem;
  z-index: 2
}

.loader-cell {
  position: relative;
  overflow: hidden;
  border-radius: 0;
  background: #111;
  opacity: 0;
  transform: translateY(-26px);
  filter: brightness(0.6);
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)
}

.loader-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block
}

.loader-cell.is-center {
  z-index: 3
}

.loader-columns {
  display: flex;
  flex-direction: column;
  gap: .24rem;
  min-width: 0
}

.loader-row {
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 0;
  align-items: center
}

.loader-left .loader-row,
.loader-right .loader-row {
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)
}

.loader-left .loader-row p {
  padding-left: .55rem
}

.loader-right .loader-row {
  grid-template-columns: 1fr
}

.loader-row p {
  font-family: 'Manrope', sans-serif;
  font-size: .9rem;
  letter-spacing: .04em;
  line-height: 1.45;
  color: #5f5f5f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis
}

.loader-head p {
  color: #f1f1f1;
  font-weight: 700;
  font-size: .84rem;
  letter-spacing: .08em
}

.loader-hero-blast {
  position: fixed;
  left: 0;
  top: 0;
  display: none;
  overflow: hidden;
  z-index: 12500;
  transform-origin: center center;
  background: #000
}

.loader-hero-blast img {
  width: 100%;
  height: 100%;
  object-fit: cover
}

:global(:root) {
  --bg: #000;
  --fg: #f5f5f5;
  --nav-bg: rgb(0 0 0 / 62%);
  --nav-border: rgb(255 255 255 / 22%);
  --card-1: #b2b2b2;
  --card-2: #ce2017;
  --card-3: #2f2f2f
}

:global(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box
}

:global(html),
:global(body),
:global(#app) {
  background: var(--bg);
  color: var(--fg);
  font-family: 'Manrope', sans-serif;
  -webkit-user-select: none;
  user-select: none
}

:global(img) {
  -webkit-user-select: none;
  user-select: none;
  -webkit-user-drag: none
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover
}

section {
  position: relative;
  width: 100%;
  padding: 2rem;
  background: var(--bg);
  color: var(--fg)
}

h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.25rem, 5vw, 4.2rem);
  font-weight: 500;
  line-height: 1
}

p {
  font-size: 2rem;
  font-weight: 500;
  line-height: 1
}

.hero-logo {
  font-family: 'STXingkai', sans-serif;
  font-size: 2.7rem;
  font-weight: 700;
  letter-spacing: .01em;
  color: #888;
  text-decoration: none;
  transition: color 0.25s ease;
}

.hero-logo:hover {
  color: #fa5c2f;
}

.hero-links {
  display: flex;
  gap: 1.4rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.hero-links a,
.hero-links :deep(a) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #888;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 600;
}

.hero-links a:hover,
.hero-links :deep(a:hover) {
  animation: navBounce .4s ease;
}

.nav-icon-link {
  padding: 0.35rem;
  border-radius: 10px;
  transition: color 0.25s ease, opacity 0.2s ease;
}

.nav-icon-link:hover {
  color: #fa5c2f;
}

@keyframes navBounce {
  0%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
  50% { transform: translateY(0); }
  70% { transform: translateY(-3px); }
}

.hero-settings {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  color: #888;
  opacity: 1;
  transition: color 0.25s ease, opacity 0.2s, transform 0.2s;
}
.hero-settings:hover {
  color: #fa5c2f;
  transform: scale(1.1);
}

.hero {
  height: 200svh;
  padding: 0;
  z-index: 1
}

.hero-inner {
  position: sticky;
  top: 0;
  height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center
}

.hero-frame {
  position: relative;
  width: min(1725px, calc(100% - 2.9rem));
  height: min(94svh, 1060px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgb(0 0 0 / 40%);
  transform-origin: 50% 50%;
  --hero-dark: 0;
  will-change: transform
}

.hero-frame::before {
  content: '';
  position: absolute;
  inset: -35%;
  pointer-events: none;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  mix-blend-mode: soft-light;
  opacity: .16;
  filter: contrast(135%) brightness(108%);
  animation: filmGrainMove 1.2s steps(4, end) infinite, filmGrainFlicker 2.4s ease-in-out infinite alternate
}

.hero-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background: linear-gradient(to bottom, rgb(0 0 0 / calc(var(--hero-dark) * .45)) 0%, rgb(0 0 0 / var(--hero-dark)) 100%), radial-gradient(circle at 52% 40%, rgb(255 255 255 / 3%) 0%, rgb(0 0 0 / calc(22% + var(--hero-dark) * 62%)) 92%)
}

.hero-media,
.hero-copy,
.hero-tip {
  position: absolute
}

.hero-media {
  inset: 0;
  z-index: 0
}

.hero-media .hero-media-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transform-origin: 50% 50%;
  will-change: transform;
  display: block
}

.hero-copy {
  left: 50%;
  top: 51%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: min(960px, 94%);
  text-shadow: 0 8px 32px rgb(0 0 0 / 35%);
  z-index: 3
}

.hero-tip {
  left: 50%;
  bottom: 2.4rem;
  transform: translateX(-50%);
  font-size: .72rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 70%);
  z-index: 3
}

@keyframes filmGrainMove {
  0% {
    transform: translate3d(0, 0, 0)
  }

  15% {
    transform: translate3d(-1.2%, -.8%, 0)
  }

  30% {
    transform: translate3d(.9%, .7%, 0)
  }

  45% {
    transform: translate3d(-.8%, 1.1%, 0)
  }

  60% {
    transform: translate3d(1.1%, -.6%, 0)
  }

  75% {
    transform: translate3d(-.7%, -1%, 0)
  }

  90% {
    transform: translate3d(.8%, .6%, 0)
  }

  100% {
    transform: translate3d(0, 0, 0)
  }
}

@keyframes filmGrainFlicker {
  0% {
    opacity: .12
  }

  50% {
    opacity: .18
  }

  100% {
    opacity: .16
  }
}

.mwg_effect000 {
  min-height: 100svh;
  text-align: center;
  align-content: center;
  z-index: 4;
  background-color: #000;
  background-image: radial-gradient(circle at 1px 1px, rgb(255 255 255 / 8%) 1px, transparent 0);
  background-size: 18px 18px
}

.mwg_effect000 {
  min-height: 100svh;
  margin-top: -100svh;
  height: 100svh;
  overflow: hidden;
  position: relative;
  display: grid;
  place-items: center;
  padding: 0 2rem
}

.mwg_effect000 .medias {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1vw
}

.mwg_effect000 .media {
  display: grid;
  place-items: center
}

.mwg_effect000 .medias img {
  width: 11vw;
  height: 11vw;
  object-fit: cover;
  border-radius: 4%;
  display: block;
  pointer-events: none;
  will-change: transform;
  box-shadow: 0 14px 32px rgb(0 0 0 / 18%)
}

.sticky {
  min-height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center
}

.sticky-header {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.sticky-header h1 {
  text-align: center;
  will-change: transform, opacity;
  transform: translateY(40px);
  opacity: 0
}

.card-container {
  position: relative;
  width: 75%;
  display: flex;
  perspective: 1000px;
  transform: translateY(40px);
  will-change: width
}

.card {
  position: relative;
  flex: 1;
  aspect-ratio: 5/7;
  transform-style: preserve-3d;
  transform-origin: top;
  transform: translateZ(0)
}

.card+.card {
  margin-left: -3px
}

#card-1 {
  border-radius: 20px 0 0 20px
}

#card-3 {
  border-radius: 0 20px 20px 0
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: inherit;
  overflow: hidden
}

.card-front {
  background-size: calc(300% + 14px) auto;
  background-repeat: no-repeat;
  background-position: center;
  transform: translateZ(.1px)
}

.card-front-1 {
  background-position: calc(0% - 12px) 50%
}

.card-front-2 {
  background-position: 50% 50%
}

.card-front-3 {
  background-position: calc(100% + 11px) 50%
}

.card-back {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transform: rotateY(180deg);
  padding: 2rem
}

.card-back-image {
  padding: 0
}

.card-back-image img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block
}

#card-1 .card-back:not(.card-back-image) {
  background: var(--card-1);
  color: #fff
}

#card-2 .card-back:not(.card-back-image) {
  background: var(--card-2);
  color: #fff
}

#card-3 .card-back:not(.card-back-image) {
  background: var(--card-3);
  color: #fff
}

@media (max-width:1000px) {
  .site-loader {
    grid-template-columns: 1fr;
    padding: 1rem
  }

  .loader-side {
    display: none
  }

  .loader-grid {
    width: min(82vw, 420px);
    gap: .5rem
  }

  .loader-logo h1 {
    font-size: clamp(1.15rem, 6.2vw, 1.8rem)
  }

  .hero-logo {
    font-size: 1.18rem;
    flex: 0 0 auto
  }

  .hero-links {
    position: static;
    left: auto;
    transform: none;
    display: flex;
    flex: 1 1 auto;
    justify-content: center;
    gap: .6rem;
    min-width: 0
  }

  .hero-links a,
  .hero-links :deep(a) {
    width: auto;
    height: auto;
    padding: 0;
    border-radius: 0;
    display: inline-flex;
    place-items: unset;
    background: transparent;
    border: none;
    font-size: 1rem;
    letter-spacing: .01em;
    white-space: nowrap
  }

  .hero-links a:hover,
  .hero-links :deep(a:hover) {
    opacity: .72;
    transform: none;
    background: transparent
  }

  .hero-settings {
    width: 2rem;
    height: 2rem;
  }

  .hero-frame {
    width: 100vw;
    height: 100svh;
    border-radius: 0;
    box-shadow: none;
    background: #000
  }

  .hero-media {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000
  }

  .hero-media .hero-media-el {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center center;
    transform: scale(1)
  }

  .hero-copy {
    width: min(92%, 560px)
  }

  .hero-copy h1 {
    font-size: clamp(1.8rem, 8.2vw, 2.6rem)
  }

  .hero-copy p {
    font-size: clamp(.92rem, 3.6vw, 1.15rem)
  }

  .hero-tip {
    bottom: 1.55rem
  }

  .mwg_effect000 {
    margin-top: -100svh;
    padding: 0 1rem
  }

  .mwg_effect000 .medias {
    gap: 2vw
  }

  .mwg_effect000 .medias img {
    width: 18vw;
    height: 18vw
  }

  .outro h1 {
    width: 100%
  }

  .sticky {
    min-height: 100svh;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center
  }

  .sticky-header {
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 4
  }

  .sticky-header h1 {
    opacity: 0;
    transform: translateY(40px);
    will-change: transform, opacity
  }

  .card-container {
    position: relative;
    width: 90%;
    margin: 0 auto;
    display: flex;
    gap: 0;
    perspective: 1000px;
    transform: translateY(40px);
    will-change: width
  }

  .card {
    position: relative;
    flex: 1;
    aspect-ratio: 5/7;
    max-width: none;
    width: auto;
    margin: 0;
    transform-style: preserve-3d;
    transform-origin: top;
    transform: translateZ(0);
    border-radius: 0
  }

  .card+.card {
    margin-left: -2px
  }

  #card-1 {
    border-radius: 20px 0 0 20px
  }

  #card-3 {
    border-radius: 0 20px 20px 0
  }

  #card-1,
  #card-2,
  #card-3,
  .card-back {
    transform-style: preserve-3d
  }
}

:global(input),
:global(textarea) {
  -webkit-user-select: text;
  user-select: text
}
</style>
