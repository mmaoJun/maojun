<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { musicsPageConfig } from '../config/siteContent'
import { vertexShader, fragmentShader } from './shaders.js'
import MovieCards from './movie-cards.vue'

const heroSection = ref(null)
const spiralCanvas = ref(null)
const pageConfig = musicsPageConfig

const pictureFiles = pageConfig.pictureFiles

const CONFIG = {
  totalImages: pictureFiles.length,
  tilesPerRevolution: 15,
  revolutions: 5,
  startRadius: 5,
  endRadius: 3.5,
  tileHeightRatio: 1.1,
  tileSegments: 24,
  spiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.0035,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
  parallaxStrength: 0.1,
  spiralLiftRatio: 0.06,
  spiralLiftOnScroll: 0.1,
}

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

const onMouseMove = (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2
}

const onResize = () => {
  if (!heroSection.value || !camera || !renderer) return
  isMobile = window.innerWidth < 1000
  camera.aspect = heroSection.value.clientWidth / heroSection.value.clientHeight
  camera.position.z = isMobile ? 15 : CONFIG.cameraZ
  camera.updateProjectionMatrix()
  renderer.setSize(heroSection.value.clientWidth, heroSection.value.clientHeight)
}

const animate = () => {
  rafId = requestAnimationFrame(animate)
  if (!camera || !renderer || !spiral) return

  const progress = Math.min(scrollY / (window.innerHeight * CONFIG.scrollMultiplier), 1)
  camera.position.y +=
    (-(progress * spiralHeight * CONFIG.cameraYMultiplier) - camera.position.y) *
    CONFIG.cameraSmoothing

  if (spiral) {
    spiral.position.y = baseSpiralY + progress * spiralHeight * CONFIG.spiralLiftOnScroll
  }

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

onMounted(() => {
  if (!heroSection.value) return

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

  const totalTiles = Math.floor(CONFIG.tilesPerRevolution * CONFIG.revolutions)
  const angleStep = (Math.PI * 2) / CONFIG.tilesPerRevolution

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    75,
    heroSection.value.clientWidth / heroSection.value.clientHeight,
    0.1,
    1000,
  )
  camera.position.z = CONFIG.cameraZ

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: spiralCanvas.value,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(heroSection.value.clientWidth, heroSection.value.clientHeight)

  const textureLoader = new THREE.TextureLoader()
  const textures = Array.from({ length: CONFIG.totalImages }, (_, i) =>
    textureLoader.load(`/media-musics/${pictureFiles[i]}`, (t) => {
      t.minFilter = THREE.LinearMipmapLinearFilter
      t.anisotropy = renderer.capabilities.getMaxAnisotropy()
    }),
  )

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
      },
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.y = centerY

    const tile = new THREE.Group()
    tile.rotation.y = i * angleStep
    tile.add(mesh)
    spiral.add(tile)
  }

  spiralHeight = Math.abs(tileEdgesY[totalTiles])
  baseSpiralY = spiralHeight * CONFIG.spiralLiftRatio
  if (spiral) spiral.position.y = baseSpiralY

  isMobile = window.innerWidth < 1000
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onResize)

  animate()
  requestAnimationFrame(() => ScrollTrigger.refresh())
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.clearTimeout(unlockSpinTimer)
  allowScrollSpin = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)

  if (heroSection.value && renderer?.domElement?.parentNode === heroSection.value) {
  }
  spiral?.traverse((obj) => {
    if (obj.isMesh) {
      obj.geometry?.dispose()
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
      else obj.material?.dispose()
    }
  })

  renderer?.dispose()
  lenis?.destroy()
})
</script>

<template>
  <main class="pictures-page">
    <section ref="heroSection" class="hero">
      <h1>{{ pageConfig.heroTitle }}</h1>
      <canvas ref="spiralCanvas" class="spiral-canvas"></canvas>
    </section>
    <MovieCards embedded />
  </main>
</template>

<style scoped>
@import url("https://fonts.cdnfonts.com/css/pp-neue-montreal");

.pictures-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.pictures-page {
  font-family: "PP Neue Montreal", sans-serif;
}

.pictures-page h1,
.pictures-page h3 {
  text-transform: uppercase;
  letter-spacing: -0.1rem;
  line-height: 0.8;
}

.pictures-page h1 {
  font-size: clamp(3.5rem, 10vw, 15rem);
}

.pictures-page h3 {
  font-size: clamp(2.5rem, 5vw, 7.5rem);
}

.pictures-page section {
  position: relative;
  width: 100%;
  padding: 2rem;
  color: #d2d2d2;
  overflow: hidden;
}

.pictures-page .hero {
  height: 150svh;
  background-color: #242424;
  text-align: justify;
  isolation: isolate;
}

.pictures-page .hero h1 {
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.pictures-page .spiral-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 6;
  pointer-events: none;
}

.pictures-page canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 6;
  pointer-events: none;
}

@media (max-width: 1000px) {
  .pictures-page .hero {
    height: 125svh;
  }
}
</style>
