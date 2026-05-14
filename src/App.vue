<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { aboutPageConfig, homePageConfig, siteFooter, siteNavLinks } from './config/siteContent'

const route = useRoute()
const router = useRouter()
const isHomePage = computed(() => route.path === '/')
const homeConfig = homePageConfig
const aboutConfig = aboutPageConfig
const navLinks = siteNavLinks
const footerInfo = siteFooter

const heroImage = homeConfig.heroImage
const burningImage = homeConfig.burningImage
const cardsImage = homeConfig.cardsImage
const [cardBack1, cardBack2, cardBack3] = homeConfig.cardBackImages
const hitokoto = ref('')
const heroQuoteChars = computed(() => Array.from(hitokoto.value || ''))
const fromWho = ref('')
const hitokoto1 = ref('')
const fromWho1 = ref('')
const hitokoto2 = ref('')
const homeRoot = ref(null)
const showLoader = ref(true)
const loaderDone = ref(false)
const loaderHeroBlast = ref(null)
const loaderImages = homeConfig.loader.images
const loaderSeed = [
  loaderImages[0], loaderImages[1], loaderImages[2],
  loaderImages[3], heroImage,      loaderImages[4],
  loaderImages[5], loaderImages[6], loaderImages[7],
]
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
const scrollPositions = new Map()
const cleanups = []

const getHitokoto = async () => {
  try {
    const res = await axios.get('https://v1.hitokoto.cn', {
      params: { c: 'h' },
    })
    hitokoto.value = res.data.hitokoto
    fromWho.value = res.data.from || ''
  } catch (error) {
    hitokoto1.value = '请求失败，请重试'
    fromWho1.value = ''
    console.error('请求出错：', error)
  }
}
const getHitokoto1 = async () => {
  try {
    const res = await axios.get('https://v1.hitokoto.cn', {
      params: { c: 'i' },
    })
    hitokoto1.value = res.data.hitokoto
    fromWho1.value = res.data.from || ''
  } catch (error) {
    hitokoto1.value = '请求失败，请重试'
    fromWho1.value = ''
    console.error('请求出错：', error)
  }
}
const getHitokoto2 = async () => {
  try {
    const res = await axios.get('https://v1.hitokoto.cn', {
      params: { c: 'a' ,max_length: 10},
    })
    hitokoto2.value = res.data.from
    
  } catch (error) {
    hitokoto2.value = '请求失败，请重试'
    console.error('请求出错：', error)
  }
}
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

const animateHeroCopyChars = async () => {
  await nextTick()
  const chars = gsap.utils.toArray('.hero-copy .char')
  if (!chars.length) return

  gsap.killTweensOf(chars)
  gsap.set(chars, { opacity: 0, y: 10 })
  gsap.to(chars, {
    opacity: 1,
    y: 0,
    duration: 0.52,
    ease: 'power2.out',
    stagger: 0.04,
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
  const heroMediaImg = document.querySelector('.hero-media img')

  if (!overlay || !cells.length || !centerCell || !heroFrame || !heroMediaImg) {
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
        img.src = heroImage
      } else {
        img.src = nextImg()
      }
    })
  }

  const setCenterToHero = () => {
    const centerImg = centerCell.querySelector('img')
    if (centerImg) centerImg.src = heroImage
  }

  const getHeroTransitionRect = () => {
    const frameRect = heroFrame.getBoundingClientRect()
    if (window.innerWidth > 1000) return frameRect

    const naturalW = heroMediaImg.naturalWidth
    const naturalH = heroMediaImg.naturalHeight
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
        swapTimer = window.setInterval(() => randomizeTiles(false), 90)
      }, '>-0.02')
      .to(leftTextNodes, {
        color: '#f2f2f2',
        duration: 0.38,
        stagger: 0.03,
      }, '<')
      .to(rightTextNodes, {
        color: '#f2f2f2',
        duration: 0.38,
        stagger: 0.03,
      }, '<')
      .to(cells, {
        filter: 'brightness(1)',
        duration: 0.34,
        stagger: (idx) => Math.floor(idx / 3) * 0.055 + (idx % 3) * 0.018,
      }, '<')
      .to('.loader-logo', {
        opacity: 0,
        y: -4,
        duration: 0.26,
        ease: 'power1.out',
      }, '<0.08')
      .to({}, { duration: 1.08 })
      .to(leftRows, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.62,
        ease: 'power2.inOut',
        stagger: 0.045,
      })
      .to(rightRows, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        duration: 0.62,
        ease: 'power2.inOut',
        stagger: 0.045,
      }, '<')
      .to(leftTextNodes, {
        filter: 'blur(1.2px)',
        color: '#8a8a8a',
        duration: 0.44,
        stagger: 0.03,
      }, '<0.02')
      .to(rightTextNodes, {
        filter: 'blur(1.2px)',
        color: '#8a8a8a',
        duration: 0.44,
        stagger: 0.03,
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
        duration: 0.46,
        ease: 'power2.inOut',
        stagger: 0,
      }, '>')
      .to(nonCenterCells, {
        opacity: 0,
        duration: 0.22,
      }, '<0.2')
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
      .to('.loader-grid', { opacity: 0, duration: 0.18 }, '<')
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
        duration: 1.35,
        ease: 'power3.inOut',
      }, '<')
      .to('.site-loader', { opacity: 0, duration: 0.28 }, '>-0.12')
      .to('.hero-nav', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '<0.02')
      .to('.page-jumpers', { y: 0, opacity: 1, duration: 0.56, ease: 'power2.out' }, '<0.06')
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
    router.push('/')
    return
  }
  if (!navEl) return
  gsap.to(navEl, {
    width: navInitialWidth || navEl.getBoundingClientRect().width,
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

const restoreHomeScrollPosition = () => {
  const savedY = scrollPositions.get('/')
  if (typeof savedY !== 'number') return

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
    })
  })
}

const navigateWithNavTransition = (path) => {
  if (route.path === path) return
  scrollPositions.set(route.path, window.scrollY || 0)
  if (navEl) {
    navPinnedWidth = navEl.getBoundingClientRect().width
    gsap.set(navEl, { width: navPinnedWidth })
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
  const frame = homeRoot.value?.querySelector('.hero-frame')
  const heroImg = homeRoot.value?.querySelector('.hero-media img')
  const heroCopy = homeRoot.value?.querySelector('.hero-copy')
  if (!nav || !frame || !heroImg || !heroCopy) return

  const mm = gsap.matchMedia()

  mm.add('(min-width: 768px)', () => {
    const initialNavWidth = nav.getBoundingClientRect().width
    const tl = gsap.timeline({
      scrollTrigger: { trigger: homeRoot.value?.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: 1.1 },
    })

    tl.to(frame, { scale: 0.74, '--hero-dark': 0.36, ease: 'none' }, 0)
      .to(heroImg, { scale: 1, ease: 'none' }, 0)
      .to(heroCopy, { y: -28, opacity: 0.15, ease: 'none' }, 0)

    const navTrigger = ScrollTrigger.create({
      trigger: homeRoot.value?.querySelector('.intro'),
      start: 'top 52%',
      end: 'top 52%',
      onEnter: () => gsap.to(nav, { width: '760px', duration: 0.82, ease: 'power1.inOut', overwrite: true }),
      onLeaveBack: () => gsap.to(nav, { width: initialNavWidth, duration: 0.75, ease: 'power1.inOut', overwrite: true }),
    })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
      navTrigger.kill()
    }
  })

  mm.add('(max-width: 767px)', () => {
    const initialNavWidth = nav.getBoundingClientRect().width
    const tl = gsap.timeline({
      scrollTrigger: { trigger: homeRoot.value?.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: 1 },
    })

    tl.to(frame, { scale: 0.82, '--hero-dark': 0.28, ease: 'none' }, 0)
      .to(heroImg, { scale: 1, ease: 'none' }, 0)

    const navTrigger = ScrollTrigger.create({
      trigger: homeRoot.value?.querySelector('.intro'),
      start: 'top 58%',
      end: 'top 58%',
      onEnter: () => gsap.to(nav, { width: '72vw', duration: 0.78, ease: 'power1.inOut', overwrite: true }),
      onLeaveBack: () => gsap.to(nav, { width: initialNavWidth, duration: 0.7, ease: 'power1.inOut', overwrite: true }),
    })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
      navTrigger.kill()
    }
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

const activateHome = async () => {
  if (homeActive || !loaderDone.value) return
  await nextTick()
  if (!homeRoot.value) return
  getHitokoto()
  getHitokoto1()
  getHitokoto2()
  initSmoothScroll()
  navEl = document.querySelector('.hero-nav')
  navInitialWidth = navEl?.getBoundingClientRect().width || 0
  initHeroScroll()
  initCardScroll()
  homeActive = true
  if (pendingRestorePath === '/') {
    restoreHomeScrollPosition()
    pendingRestorePath = null
  }
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
  navEl = document.querySelector('.hero-nav')
  navInitialWidth = navEl?.getBoundingClientRect().width || 0

  const loaderPlayed = sessionStorage.getItem('site-loader-played') === '1'
  if (!loaderPlayed) {
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

watch(() => hitokoto.value, () => {
  if (!isHomePage.value || showLoader.value) return
  animateHeroCopyChars()
})

watch(() => route.path, (newPath, oldPath) => {
  if (!navEl) return
  if (oldPath) scrollPositions.set(oldPath, window.scrollY || 0)

  if (newPath === '/' && oldPath !== '/') {
    navPinnedWidth = null
    pendingRestorePath = '/'
    gsap.to(navEl, {
      width: navInitialWidth,
      duration: 0.45,
      ease: 'power1.out',
      overwrite: true,
    })
    return
  }
  if (newPath !== '/' && oldPath === '/') {
    const lockedWidth = navPinnedWidth || navEl.getBoundingClientRect().width
    gsap.set(navEl, { width: lockedWidth })
  }
  pendingRestorePath = null
  requestAnimationFrame(() => restoreScrollPosition(newPath))
})

watch(isHomePage, async (isHome) => {
  if (isHome) {
    await activateHome()
    animateHeroCopyChars()
  } else {
    deactivateHome()
  }
})

onBeforeUnmount(() => {
  deactivateHome()
})
</script>

<template>
  <div v-if="showLoader" class="site-loader">
    <div class="loader-columns loader-side loader-left">
      <div class="loader-head loader-row"><p>{{ homeConfig.loader.sideHeading }}</p></div>
      <div class="loader-row" v-for="(track, idx) in loaderLeftTracks" :key="`left-${idx}`"><p>{{ track }}</p></div>
    </div>

    <div class="loader-center-wrap">
      <div class="loader-logo" aria-hidden="true">
        <h1 class="loader-logo-line" v-for="(line, idx) in homeConfig.loader.title" :key="`loader-title-${idx}`">{{ line }}</h1>
      </div>
      <div class="loader-grid">
        <div
          class="loader-cell"
          v-for="(src, idx) in loaderSeed"
          :key="`loader-${idx}`"
          :data-loader-idx="idx"
          :class="{ 'is-center': idx === 4 }"
        >
          <img :src="src" alt="loader tile" />
        </div>
      </div>
    </div>

    <div class="loader-columns loader-side loader-right">
      <div class="loader-head loader-row"><p>{{ homeConfig.loader.sideHeading }}</p></div>
      <div class="loader-row" v-for="(track, idx) in loaderRightTracks" :key="`right-${idx}`"><p>{{ track }}</p></div>
    </div>

    <div ref="loaderHeroBlast" class="loader-hero-blast">
      <img :src="heroImage" alt="loader hero" />
    </div>
  </div>

  <header v-show="!showLoader" class="hero-nav">
    <a class="hero-logo" href="/" @click="handleGoHome">{{ homeConfig.brand }}</a>
    <nav class="hero-links">
      <a v-for="link in navLinks" :key="link.href" :href="link.href" @click.prevent="navigateWithNavTransition(link.href)">{{ link.label }}</a>
    </nav>
    <button class="hero-cta" @click="navigateWithNavTransition('/about')">{{ homeConfig.aboutLabel }}</button>
  </header>

  <main v-if="isHomePage" ref="homeRoot">
    <section class="hero">
    <div class="hero-inner">
      <div class="hero-frame">
        <div class="hero-media"><img :src="heroImage" alt="hero" /></div>
        <div class="hero-copy">
          <h1>
            <span v-for="(char, idx) in heroQuoteChars" :key="`hero-char-${idx}`" class="char">{{ char === ' ' ? '\u00A0' : char }}</span>
          </h1>
          <p>——{{ fromWho }}</p>
        </div>
        <span class="hero-tip">{{ homeConfig.heroTip }}</span>
      </div>
    </div>
  </section>

  <section class="intro">
    <img class="intro-poster" :src="burningImage" alt="Burning" />
    <p class="intro-text">
      <template v-for="(line, idx) in homeConfig.introLines" :key="`intro-line-${idx}`">
        {{ line }}<br v-if="idx < homeConfig.introLines.length - 1" />
      </template>
    </p>
    <p class="intro-sub">
      <template v-for="(line, idx) in homeConfig.introSubLines" :key="`intro-sub-${idx}`">
        {{ line }}<br v-if="idx < homeConfig.introSubLines.length - 1" />
      </template>
    </p>
  </section>

  <section class="sticky">
    <div class="sticky-header"><h1>{{ hitokoto2 }}</h1></div>
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

  <section class="outro">
    <h1>{{ hitokoto1 }}</h1>
    <p>——{{ fromWho1 }}</p>
  </section>
  <footer class="site-footer">
    <a :href="footerInfo.icpHref" target="_blank" rel="noopener noreferrer">{{ footerInfo.icpLabel }}</a>
    <span class="footer-separator">|</span>
    <a :href="footerInfo.publicSecurityHref" target="_blank" rel="noopener noreferrer">{{ footerInfo.publicSecurityLabel }}</a>
  </footer>
  </main>
  <RouterView v-else />
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap");
.site-loader{position:fixed;inset:0;background:#000;display:grid;grid-template-columns:minmax(180px,1fr) minmax(340px,520px) minmax(180px,1fr);align-items:center;gap:clamp(1rem,4vw,2.6rem);padding:clamp(1rem,3vw,2rem);z-index:12000;opacity:1;pointer-events:auto;overflow:hidden}
.loader-center-wrap{position:relative;display:grid;place-items:center}
.loader-logo{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.22em;z-index:4;pointer-events:none}
.loader-logo h1{font-family:'STXingkai','Arial Black',sans-serif;font-size:clamp(1.5rem,3.4vw,2.75rem);font-weight:700;line-height:.93;padding: 0 0.1em;letter-spacing:.03em;color:#2e2e2e;-webkit-text-fill-color:transparent;background-clip:text;background-image:linear-gradient(0deg,#2f2f2f,#2f2f2f 52%,#f2f2f2 0);background-size:100% 210%;background-position:0% 100%;text-transform:uppercase}
.loader-logo .loader-logo-line:first-child{transform:none}
.loader-logo .loader-logo-line:last-child{transform:none}
.loader-grid{width:min(78vw,520px);aspect-ratio:1;display:grid;grid-template-columns:repeat(3,1fr);gap:.7rem;z-index:2}
.loader-cell{position:relative;overflow:hidden;border-radius:0;background:#111}
.loader-cell img{width:100%;height:100%;object-fit:cover;display:block}
.loader-cell.is-center{z-index:3}
.loader-columns{display:flex;flex-direction:column;gap:.24rem;min-width:0}
.loader-row{display:grid;grid-template-columns:1fr;column-gap:0;align-items:center}
.loader-left .loader-row p{padding-left:.55rem}
.loader-right .loader-row{grid-template-columns:1fr}
.loader-row p{font-family:'Manrope',sans-serif;font-size:.9rem;letter-spacing:.04em;line-height:1.45;color:#6a6a6a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.loader-head p{color:#f1f1f1;font-weight:700;font-size:.84rem;letter-spacing:.08em}
.loader-hero-blast{position:fixed;left:0;top:0;display:none;overflow:hidden;z-index:12500;transform-origin:center center;background:#000}
.loader-hero-blast img{width:100%;height:100%;object-fit:cover}

:global(:root){--bg:#000;--fg:#f5f5f5;--nav-bg:rgb(0 0 0 / 62%);--nav-border:rgb(255 255 255 / 22%);--card-1:#b2b2b2;--card-2:#ce2017;--card-3:#2f2f2f}
:global(*){margin:0;padding:0;box-sizing:border-box}
:global(html),:global(body),:global(#app){background:var(--bg);color:var(--fg);font-family:'Manrope',sans-serif;-webkit-user-select:none;user-select:none}
:global(img){-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
img{width:100%;height:100%;object-fit:cover}
section{position:relative;width:100%;padding:2rem;background:var(--bg);color:var(--fg)}
.site-footer{padding:1.4rem 2rem 2.2rem;text-align:center;font-size:.82rem;letter-spacing:.04em;color:rgb(255 255 255 / 48%);background:#000;display:flex;justify-content:center;align-items:center;gap:0.8rem;flex-wrap:wrap}
.site-footer a{color:inherit;text-decoration:none;transition:color .2s ease}
.site-footer a:hover{color:rgb(255 255 255 / 85%)}
.footer-separator{opacity:0.3}
h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.25rem,5vw,4.2rem);font-weight:500;line-height:1}
p{font-size:2rem;font-weight:500;line-height:1}

.hero-nav{position:fixed;left:50%;top:clamp(.9rem,4.8vh,2.8rem);transform:translateX(-50%);width:min(1625px,calc(100% - 2.7rem));min-height:3.5rem;border:1px solid rgb(255 255 255 / 10%);border-radius:16px;background-color:rgb(28 32 40 / 58%);background-image:linear-gradient(180deg,rgb(255 255 255 / 10%),rgb(255 255 255 / 3%));backdrop-filter:blur(22px) saturate(180%);-webkit-backdrop-filter:blur(22px) saturate(180%);box-shadow:0 10px 30px rgb(0 0 0 / 22%),inset 0 1px 0 rgb(255 255 255 / 10%),inset 0 -1px 0 rgb(255 255 255 / 3%);display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.45rem .6rem .45rem 1rem;z-index:9999;will-change:transform,width}
@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))){
.hero-nav{background-color:rgb(32 36 44 / 86%);background-image:linear-gradient(180deg,rgb(255 255 255 / 8%),rgb(255 255 255 / 2%));box-shadow:0 12px 32px rgb(0 0 0 / 26%),inset 0 1px 0 rgb(255 255 255 / 8%)}
}
.hero-logo{font-family:'STXingkai',sans-serif;font-size:2.3rem;font-weight:700;letter-spacing:.01em;color:rgb(255 255 255 / 92%);text-decoration:none}
.hero-links{display:flex;gap:1.4rem}
.hero-links a,.hero-links :deep(a){display:inline-flex;align-items:center;justify-content:center;color:rgb(255 255 255 / 84%);text-decoration:none;font-size:.9rem;transition:opacity .25s ease,transform .25s ease}
.hero-links a:hover,.hero-links :deep(a:hover){opacity:.65;transform:translateY(-1px)}
.hero-cta{border:0;border-radius:12px;background:#d7d7d7;color:#111;font-weight:700;font-size:.84rem;padding:.68rem 1.3rem;cursor:pointer;transition:background-color .22s ease}
.hero-cta:hover{background:#ececec}

.hero{height:200svh;padding:0;z-index:1}
.hero-inner{position:sticky;top:0;height:100svh;display:flex;align-items:center;justify-content:center}
.hero-frame{position:relative;width:min(1725px,calc(100% - 2.9rem));height:min(94svh,1060px);border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgb(0 0 0 / 40%);transform-origin:50% 50%;--hero-dark:0;will-change:transform}
.hero-frame::before{content:'';position:absolute;inset:-35%;pointer-events:none;z-index:1;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px 180px;mix-blend-mode:soft-light;opacity:.16;filter:contrast(135%) brightness(108%);animation:filmGrainMove 1.2s steps(4,end) infinite,filmGrainFlicker 2.4s ease-in-out infinite alternate}
.hero-frame::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;background:linear-gradient(to bottom,rgb(0 0 0 / calc(var(--hero-dark) * .45)) 0%,rgb(0 0 0 / var(--hero-dark)) 100%),radial-gradient(circle at 52% 40%,rgb(255 255 255 / 3%) 0%,rgb(0 0 0 / calc(22% + var(--hero-dark) * 62%)) 92%)}
.hero-media,.hero-copy,.hero-tip{position:absolute}.hero-media{inset:0;z-index:0}.hero-media img{transform:scale(1);transform-origin:50% 50%;will-change:transform}
.hero-copy{left:50%;top:51%;transform:translate(-50%,-50%);text-align:center;width:min(760px,90%);text-shadow:0 8px 32px rgb(0 0 0 / 35%);z-index:3}
.hero-copy .char{display:inline-block;will-change:transform,opacity}
.hero-copy h1{font-size:clamp(1.9rem,5.2vw,3.55rem);color:rgb(245 245 245 / 98%)}
.hero-copy p{margin-top:.5rem;font-family:'Cormorant Garamond',serif;font-size:clamp(1.05rem,2vw,1.45rem);color:rgb(255 255 255 / 84%)}
.hero-tip{left:50%;bottom:2.4rem;transform:translateX(-50%);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:rgb(255 255 255 / 70%);z-index:3}

@keyframes filmGrainMove{0%{transform:translate3d(0,0,0)}15%{transform:translate3d(-1.2%,-.8%,0)}30%{transform:translate3d(.9%,.7%,0)}45%{transform:translate3d(-.8%,1.1%,0)}60%{transform:translate3d(1.1%,-.6%,0)}75%{transform:translate3d(-.7%,-1%,0)}90%{transform:translate3d(.8%,.6%,0)}100%{transform:translate3d(0,0,0)}}
@keyframes filmGrainFlicker{0%{opacity:.12}50%{opacity:.18}100%{opacity:.16}}

.intro,.outro{min-height:100svh;text-align:center;align-content:center;z-index:4;background-color:#000;background-image:radial-gradient(circle at 1px 1px,rgb(255 255 255 / 8%) 1px,transparent 0);background-size:18px 18px}
.site-footer{padding:1.4rem 2rem 2.2rem;text-align:center;font-size:.82rem;letter-spacing:.04em;color:rgb(255 255 255 / 48%);background:#000;display:flex;justify-content:center;align-items:center;gap:0.8rem;flex-wrap:wrap}
.site-footer a{color:inherit;text-decoration:none;transition:color .2s ease}
.site-footer a:hover{color:rgb(255 255 255 / 85%)}
.footer-separator{opacity:0.3}
.intro{min-height:100svh;margin-top:-100svh;padding:2rem 2rem 4.2rem;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}
.intro h1,.outro h1{width:min(900px,92%);margin:0 auto;color:rgb(255 255 255 / 90%)}
.intro-poster{width:min(560px,88vw);height:auto;display:block;margin:0 auto 1.6rem;border-radius:10px;opacity:.95}
.intro-text{width:min(980px,94%);margin:0 auto;font-family:'Cormorant Garamond',serif;font-size:clamp(1.28rem,2.25vw,2rem);line-height:1.2;color:rgb(255 255 255 / 88%)}
.intro-sub{margin-top:1.9rem;font-family:'Manrope',sans-serif;font-size:clamp(.82rem,1.1vw,.96rem);line-height:1.45;letter-spacing:.04em;color:rgb(255 255 255 / 70%)}

.sticky{min-height:100svh;display:flex;justify-content:center;align-items:center}
.sticky-header{position:absolute;top:20%;left:50%;transform:translate(-50%,-50%)}
.sticky-header h1{text-align:center;will-change:transform,opacity;transform:translateY(40px);opacity:0}
.card-container{position:relative;width:75%;display:flex;perspective:1000px;transform:translateY(40px);will-change:width}
.card{position:relative;flex:1;aspect-ratio:5/7;transform-style:preserve-3d;transform-origin:top;transform:translateZ(0)}
.card + .card{margin-left:-3px}
#card-1{border-radius:20px 0 0 20px}#card-3{border-radius:0 20px 20px 0}
.card-front,.card-back{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:inherit;overflow:hidden}
.card-front{background-size:calc(300% + 14px) auto;background-repeat:no-repeat;background-position:center;transform:translateZ(.1px)}
.card-front-1{background-position:calc(0% - 12px) 50%}
.card-front-2{background-position:50% 50%}
.card-front-3{background-position:calc(100% + 11px) 50%}
.card-back{display:flex;justify-content:center;align-items:center;text-align:center;transform:rotateY(180deg);padding:2rem}
.card-back-image{padding:0}
.card-back-image img{width:100%;height:100%;object-fit:fill;display:block}
#card-1 .card-back:not(.card-back-image){background:var(--card-1);color:#fff}#card-2 .card-back:not(.card-back-image){background:var(--card-2);color:#fff}#card-3 .card-back:not(.card-back-image){background:var(--card-3);color:#fff}

@media (max-width:1000px){
.site-loader{grid-template-columns:1fr;padding:1rem}
.loader-side{display:none}
.loader-grid{width:min(82vw,420px);gap:.5rem}
.loader-logo h1{font-size:clamp(1.15rem,6.2vw,1.8rem)}
.hero-nav{width:calc(100% - 1rem);padding:.45rem .5rem;min-height:3.35rem;gap:.45rem}
.hero-logo{font-size:1.18rem;flex:0 0 auto}
.hero-links{display:flex;flex:1 1 auto;justify-content:center;gap:.6rem;min-width:0}
.hero-links a,.hero-links :deep(a){width:auto;height:auto;padding:0;border-radius:0;display:inline-flex;place-items:unset;background:transparent;border:none;font-size:.68rem;letter-spacing:.01em;white-space:nowrap}
.hero-links a:hover,.hero-links :deep(a:hover){opacity:.72;transform:none;background:transparent}
.hero-cta{flex:0 0 auto;font-size:.64rem;padding:.5rem .7rem;border-radius:10px}
.hero-frame{width:100vw;height:100svh;border-radius:0;box-shadow:none;background:#000}
.hero-media{display:flex;align-items:center;justify-content:center;background:#000}
.hero-media img{width:100%;height:100%;object-fit:contain;object-position:center center;transform:scale(1)}
.hero-copy{width:min(92%,560px)}
.hero-copy h1{font-size:clamp(1.8rem,8.2vw,2.6rem)}
.hero-copy p{font-size:clamp(.92rem,3.6vw,1.15rem)}
.hero-tip{bottom:1.55rem}
.intro{margin-top:-100svh;padding:1.2rem 1.2rem 2.6rem;justify-content:flex-end}
.intro-poster{width:min(420px,88vw);margin-bottom:1rem}
.intro-text{font-size:clamp(1.1rem,4.6vw,1.62rem)}
.intro-sub{font-size:clamp(.76rem,2.8vw,.9rem);margin-top:1.5rem}
.intro h1,.outro h1{width:100%}
.sticky{min-height:100svh;padding:0;display:flex;align-items:center;justify-content:center}
.sticky-header{position:absolute;top:20%;left:50%;transform:translate(-50%,-50%);z-index:4}
.sticky-header h1{opacity:0;transform:translateY(40px);will-change:transform,opacity}
.card-container{position:relative;width:90%;margin:0 auto;display:flex;gap:0;perspective:1000px;transform:translateY(40px);will-change:width}
.card{position:relative;flex:1;aspect-ratio:5/7;max-width:none;width:auto;margin:0;transform-style:preserve-3d;transform-origin:top;transform:translateZ(0);border-radius:0}
.card + .card{margin-left:-2px}
#card-1{border-radius:20px 0 0 20px}#card-3{border-radius:0 20px 20px 0}
#card-1,#card-2,#card-3,.card-back{transform-style:preserve-3d}
}
:global(input),:global(textarea){-webkit-user-select:text;user-select:text}
</style>
