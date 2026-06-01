<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import * as THREE from 'three'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { musicsPageConfig } from '../config/siteContent'
import { vertexShader, fragmentShader } from './shaders.js'
import MovieCards from './movie-cards.vue'
import { proxyUrl } from '../utils/ossProxy'

const route = useRoute()
const heroSection = ref(null)
const spiralCanvas = ref(null)
const heroTitleEl = ref(null)
const isWebGLAvailable = ref(true)

const data = reactive({
  heroTitle: musicsPageConfig.heroTitle,
  images: musicsPageConfig.pictureFiles.map(f => `/media-musics/${f}`),
})

/* ---- shared API fetch (also used by movie-cards when embedded) ---- */
const sharedContent = reactive({ data: null })
let _fetchPromise = null

function ensureContent() {
  if (_fetchPromise) return _fetchPromise
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 3000)
  _fetchPromise = fetch('/api/home-content/public', { signal: ctrl.signal })
    .then(res => {
      clearTimeout(timer)
      if (!res.ok) return null
      return res.json()
    })
    .catch(() => null)
    .then(json => {
      sharedContent.data = json
      return json
    })
  return _fetchPromise
}

async function applyMusicsContent(json) {
  if (!json?.data?.length) return
  const item = json.data.find(i => i.sectionKey === 'musics/content')
  if (!item) return
  const d = JSON.parse(item.contentJson)
  if (d.heroTitle != null) data.heroTitle = d.heroTitle
  if (d.images) d.images.forEach((url, i) => {
    if (i < data.images.length && url != null) data.images[i] = url
  })
}

/* ---- WebGL support check ---- */
function checkWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/* ---- config (adjusted per device after mount) ---- */
const CONFIG = reactive({
  totalImages: data.images.length,
  tilesPerRevolution: 15,
  revolutions: 5,
  tileSegments: 24,
  startRadius: 5,
  endRadius: 3.5,
  tileHeightRatio: 1.1,
  spiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  pixelRatioCap: 2,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.0035,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
  parallaxStrength: 0.1,
  spiralLiftRatio: 0.06,
  spiralLiftOnScroll: 0.1,
})

let lenis = null
let scene = null
let camera = null
let renderer = null
let spiral = null
let cameraPositionUniform = null
let spinVelocity = 0
let scrollY = 0
let mouseX = 0
let mouseY = 0
let smoothX = 0
let smoothY = 0
let isMobile = false
let spiralHeight = 0
let baseSpiralY = 0
let rafId = 0
let allowScrollSpin = false
let unlockSpinTimer = 0
let tileData = []
let dropStartTime = 0
let isSceneReady = false
let _visible = true
const DROP_DURATION = 0.8
const DROP_STAGGER = 0.02

/* ---- placeholder texture for failed loads ---- */
let _placeholderTex = null

function getPlaceholderTexture() {
  if (_placeholderTex) return _placeholderTex
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  // checkerboard fallback
  const sz = size / 4
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#333' : '#1a1a1a'
      ctx.fillRect(x * sz, y * sz, sz, sz)
    }
  }
  _placeholderTex = new THREE.CanvasTexture(c)
  _placeholderTex.minFilter = THREE.LinearFilter
  return _placeholderTex
}

/* ---- mouse / resize ---- */
const onMouseMove = (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2
}

const onResize = () => {
  if (!heroSection.value || !camera || !renderer) return
  const w = heroSection.value.clientWidth
  const h = heroSection.value.clientHeight
  if (w <= 0 || h <= 0) return
  isMobile = window.innerWidth < 1000
  camera.aspect = w / h
  camera.position.z = isMobile ? (CONFIG.cameraZ + 4) : CONFIG.cameraZ
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

/* ---- visibility — pause loop when tab is hidden ---- */
const onVisibilityChange = () => {
  _visible = document.visibilityState !== 'hidden'
}

/* ---- render loop ---- */
const animate = () => {
  rafId = requestAnimationFrame(animate)

  if (!_visible || !isSceneReady || !camera || !renderer || !spiral) return

  const now = performance.now() / 1000

  // Tile drop + fade-in
  for (const td of tileData) {
    td.elapsed = now - dropStartTime - td.delay
    if (td.elapsed < 0) continue

    if (!td.landed && td.elapsed < DROP_DURATION) {
      const t = Math.min(td.elapsed / DROP_DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      td.mesh.position.y = td.targetY + 8 * (1 - eased)
      td.mesh.material.uniforms.uOpacity.value = Math.min(t * 2, 1)
    } else {
      td.landed = true
      td.mesh.position.y = td.targetY
      td.mesh.material.uniforms.uOpacity.value = 1
    }
  }

  const progress = Math.min(scrollY / (window.innerHeight * CONFIG.scrollMultiplier), 1)
  camera.position.y +=
    (-(progress * spiralHeight * CONFIG.cameraYMultiplier) - camera.position.y) *
    CONFIG.cameraSmoothing

  spiral.position.y = baseSpiralY + progress * spiralHeight * CONFIG.spiralLiftOnScroll

  if (!isMobile) {
    smoothX += (mouseX - smoothX) * 0.02
    smoothY += (mouseY - smoothY) * 0.02
    spiral.rotation.x = smoothY * CONFIG.parallaxStrength
    spiral.rotation.z = -smoothX * CONFIG.parallaxStrength * 0.3
  }

  if (cameraPositionUniform) cameraPositionUniform.value.copy(camera.position)

  spiral.rotation.y += CONFIG.baseRotationSpeed + spinVelocity
  spinVelocity *= CONFIG.rotationDecay

  renderer.render(scene, camera)
}

/* ---- title animation ---- */
function animateHeroTitle() {
  const el = heroTitleEl.value
  if (!el || !el.textContent) return

  const text = el.textContent
  el.innerHTML = ''
  const words = text.split(/(\s+)/)
  const wordSpans = []
  for (const word of words) {
    const span = document.createElement('span')
    span.style.display = 'inline-block'
    span.style.whiteSpace = 'pre'
    span.textContent = word
    el.appendChild(span)
    wordSpans.push(span)
  }

  requestAnimationFrame(() => {
    const lines = []
    let currentLine = []
    let lastTop = -1

    for (const span of wordSpans) {
      const top = span.offsetTop
      if (top !== lastTop && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = []
      }
      currentLine.push(span)
      lastTop = top
    }
    if (currentLine.length > 0) lines.push(currentLine)

    const allWrappers = []
    lines.forEach((lineSpans, i) => {
      const wrapper = document.createElement('div')
      wrapper.style.textAlign = i % 2 === 0 ? 'left' : 'right'
      wrapper.style.width = '100%'
      el.appendChild(wrapper)
      lineSpans.forEach(s => wrapper.appendChild(s))
      allWrappers.push(wrapper)
    })

    const allSpans = allWrappers.flatMap(w => Array.from(w.querySelectorAll('span')))

    gsap.fromTo(allSpans, {
      y: 60,
      opacity: 0,
      rotateX: -40,
    }, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 0.65,
      stagger: 0.03,
      ease: 'back.out(1.4)',
    })
  })
}

/* ---- Three.js scene setup ---- */
function buildScene() {
  if (!heroSection.value || !spiralCanvas.value) return

  const w = heroSection.value.clientWidth
  const h = heroSection.value.clientHeight
  if (w <= 0 || h <= 0) return

  const totalTiles = Math.floor(CONFIG.tilesPerRevolution * CONFIG.revolutions)
  const angleStep = (Math.PI * 2) / CONFIG.tilesPerRevolution

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
  camera.position.z = CONFIG.cameraZ

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: spiralCanvas.value,
  })
  const maxRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : CONFIG.pixelRatioCap
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxRatio))
  renderer.setSize(w, h)

  const textureLoader = new THREE.TextureLoader()
  textureLoader.crossOrigin = undefined // 必须 undefined — ImageLoader 只检查 !== undefined，'' 仍触发 CORS
  const textures = Array.from({ length: CONFIG.totalImages }, (_, i) => {
    const tex = textureLoader.load(
      proxyUrl(data.images[i]),
      (t) => {
        t.minFilter = THREE.LinearMipmapLinearFilter
        const maxAniso = renderer.capabilities.getMaxAnisotropy()
        t.anisotropy = Math.min(maxAniso, 4)
      },
      undefined, // onProgress
      () => {
        // onError — swap in placeholder so the spiral never has empty tiles
        textures[i] = getPlaceholderTexture()
      },
    )
    return tex
  })

  cameraPositionUniform = {
    value: new THREE.Vector3(0, 0, CONFIG.cameraZ),
  }

  const tileEdgesY = [0]
  for (let i = 0; i < totalTiles; i++) {
    const progress = i / totalTiles
    const radius = CONFIG.startRadius + (CONFIG.endRadius - CONFIG.startRadius) * progress
    const arcWidth = (2 * Math.PI * radius) / CONFIG.tilesPerRevolution
    const tileHeight = arcWidth * CONFIG.tileHeightRatio
    tileEdgesY.push(tileEdgesY[i] - (tileHeight + CONFIG.spiralGap) / CONFIG.tilesPerRevolution)
  }

  spiral = new THREE.Group()
  scene.add(spiral)

  tileData = []
  dropStartTime = performance.now() / 1000

  for (let i = 0; i < totalTiles; i++) {
    const progress = i / totalTiles
    const radius = CONFIG.startRadius + (CONFIG.endRadius - CONFIG.startRadius) * progress
    const arcWidth = (2 * Math.PI * radius) / CONFIG.tilesPerRevolution
    const tileHeight = arcWidth * CONFIG.tileHeightRatio
    const tileAngle = arcWidth / radius + CONFIG.tileOverlap

    const centerY = (tileEdgesY[i] + tileEdgesY[i + 1]) / 2
    const slope = tileEdgesY[i + 1] - tileEdgesY[i]

    const positions = []
    const uvCoords = []
    const indices = []
    const segments = CONFIG.tileSegments

    for (let row = 0; row <= 1; row++) {
      for (let col = 0; col <= segments; col++) {
        const angle = (col / segments - 0.5) * tileAngle
        positions.push(
          Math.sin(angle) * radius,
          (row - 0.5) * tileHeight + (col / segments - 0.5) * slope,
          Math.cos(angle) * radius,
        )
        uvCoords.push(col / segments, row)
      }
    }

    for (let col = 0; col < segments; col++) {
      const current = col
      const below = current + segments + 1
      indices.push(current, below, current + 1, below, below + 1, current + 1)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvCoords, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMap: { value: textures[i % CONFIG.totalImages] },
        uCameraPosition: cameraPositionUniform,
        uOpacity: { value: 0 },
      },
      side: THREE.DoubleSide,
      transparent: true,
    })

    const mesh = new THREE.Mesh(geometry, material)
    const targetY = centerY
    mesh.position.y = targetY + 8

    tileData.push({
      mesh,
      targetY,
      delay: (totalTiles - 1 - i) * DROP_STAGGER,
      elapsed: 0,
      landed: false,
    })

    const tile = new THREE.Group()
    tile.rotation.y = i * angleStep
    tile.add(mesh)
    spiral.add(tile)
  }

  spiralHeight = Math.abs(tileEdgesY[totalTiles])
  baseSpiralY = spiralHeight * CONFIG.spiralLiftRatio
  spiral.position.y = baseSpiralY

  isSceneReady = true
}

/* ---- lifecycle ---- */
onMounted(async () => {
  // WebGL check
  if (!checkWebGL()) {
    isWebGLAvailable.value = false
    return
  }

  // Single content fetch shared with embedded movie-cards
  const json = await ensureContent()
  await applyMusicsContent(json)
  CONFIG.totalImages = data.images.length

  await nextTick()
  animateHeroTitle()

  if (!heroSection.value) return

  // Mobile adjustments
  isMobile = window.innerWidth < 1000
  if (isMobile) {
    CONFIG.tilesPerRevolution = 10
    CONFIG.revolutions = 3
    CONFIG.tileSegments = 14
    CONFIG.cameraZ = 13
    CONFIG.cameraSmoothing = 0.1
    CONFIG.scrollRotationMultiplier = 0.002
    CONFIG.pixelRatioCap = 1.5
  }

  lenis = new Lenis({ autoRaf: true })
  allowScrollSpin = false
  unlockSpinTimer = window.setTimeout(() => {
    allowScrollSpin = true
  }, 520)

  lenis.on('scroll', (e) => {
    scrollY = window.pageYOffset || 0
    ScrollTrigger.update()

    if (!allowScrollSpin) {
      spinVelocity *= 0.82
      return
    }

    const rawVelocity = e?.velocity ?? 0
    const clampedVelocity = Math.max(-2.4, Math.min(2.4, rawVelocity))
    spinVelocity = clampedVelocity * CONFIG.scrollRotationMultiplier
  })

  buildScene()

  if (!isMobile) {
    window.addEventListener('mousemove', onMouseMove, { passive: true })
  }
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibilityChange)

  animate()
  requestAnimationFrame(() => ScrollTrigger.refresh())
})

watch(() => route.path, async (to) => {
  if (to === '/musics') {
    await nextTick()
    animateHeroTitle()
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.clearTimeout(unlockSpinTimer)
  allowScrollSpin = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibilityChange)

  spiral?.traverse((obj) => {
    if (obj.isMesh) {
      obj.geometry?.dispose()
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
      else obj.material?.dispose()
    }
  })

  tileData = []
  _placeholderTex?.dispose()
  _placeholderTex = null
  renderer?.dispose()
  lenis?.destroy()
  isSceneReady = false
})
</script>

<template>
  <main class="musics-page">
    <section ref="heroSection" class="hero">
      <h1 ref="heroTitleEl">{{ data.heroTitle }}</h1>
      <!-- WebGL fallback: show a message when WebGL is not available -->
      <div v-if="!isWebGLAvailable" class="webgl-fallback">
        <p>Your browser does not support WebGL.</p>
        <p>Please use a modern browser to view the 3D gallery.</p>
      </div>
      <canvas v-show="isWebGLAvailable" ref="spiralCanvas" class="spiral-canvas"></canvas>
    </section>
    <MovieCards embedded :preloadedJson="sharedContent.data" />
  </main>
</template>

<style scoped>
@import url("https://fonts.cdnfonts.com/css/pp-neue-montreal");

.musics-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.musics-page {
  font-family: "PP Neue Montreal", sans-serif;
}

.musics-page h1,
.musics-page h3 {
  text-transform: uppercase;
  letter-spacing: -0.1rem;
  line-height: 0.8;
}

.musics-page h1 {
  font-size: clamp(5rem, 12vw, 18rem);
}

.musics-page h3 {
  font-size: clamp(2.5rem, 5vw, 7.5rem);
}

.musics-page section {
  position: relative;
  width: 100%;
  padding: 2rem;
  color: #d2d2d2;
  overflow: hidden;
}

.musics-page .hero {
  height: 150svh;
  background-color: #242424;
  text-align: justify;
  isolation: isolate;
}

.musics-page .hero h1 {
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.musics-page .spiral-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 6;
  pointer-events: none;
}

.musics-page .webgl-fallback {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1rem;
  text-align: center;
  gap: 0.5rem;
}

@media (max-width: 1000px) {
  .musics-page .hero {
    height: 125svh;
  }
}
</style>
