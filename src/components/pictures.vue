<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { picturesPageConfig } from '../config/siteContent'

const images = picturesPageConfig.galleryImages

const canvasHost = ref(null)
const webglSupported = ref(true)

const visibleCount = 12
const depthRange = 50
const speed = 1.2
const fadeIn = { start: 0.05, end: 0.25 }
const fadeOut = { start: 0.4, end: 0.43 }
const blurIn = { start: 0, end: 0.1 }
const blurOut = { start: 0.4, end: 0.43 }
const maxBlur = 8

let renderer = null
let scene = null
let camera = null
let clock = null
let raycaster = null
let frameId = 0
let scrollVelocity = 0
let autoPlay = true
let lastInteraction = Date.now()
let hoveredMesh = null
let planes = []
let textures = []
let disposers = []
const pointer = new THREE.Vector2(2, 2)

const positions = Array.from({ length: visibleCount }, (_, i) => {
  const ha = (i * 2.618) % (Math.PI * 2)
  const va = (i * 1.618 + Math.PI / 3) % (Math.PI * 2)
  return {
    x: (Math.sin(ha) * ((i % 3) * 1.2) * 8) / 3,
    y: (Math.cos(va) * (((i + 1) % 4) * 0.8) * 8) / 4,
  }
})

const isWebGLAvailable = () => {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

const createMaterial = () => new THREE.ShaderMaterial({
  transparent: true,
  side: THREE.DoubleSide,
  uniforms: {
    map: { value: null },
    opacity: { value: 1 },
    blurAmount: { value: 0 },
    scrollForce: { value: 0 },
    time: { value: 0 },
    isHovered: { value: 0 },
  },
  vertexShader: `
    uniform float scrollForce; uniform float time; uniform float isHovered; varying vec2 vUv;
    void main(){
      vUv=uv; vec3 pos=position;
      float c=length(pos.xy)*length(pos.xy)*scrollForce*0.3;
      float r1=sin(pos.x*2.0+scrollForce*3.0)*0.02;
      float r2=sin(pos.y*2.5+scrollForce*2.0)*0.015;
      float cloth=(r1+r2)*abs(scrollForce*0.3)*2.0; float wave=0.0;
      if(isHovered>0.5){ float d=smoothstep(-0.5,0.5,pos.x); wave=sin(pos.x*3.0+time*8.0)*0.1*d; wave+=sin(pos.x*5.0+time*12.0)*0.03*d; }
      pos.z-=(c+cloth+wave); gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D map; uniform float opacity; uniform float blurAmount; uniform float scrollForce; varying vec2 vUv;
    void main(){
      vec4 color=texture2D(map,vUv);
      if(blurAmount>0.0){
        vec2 s=1.0/vec2(textureSize(map,0)); vec4 b=vec4(0.0); float t=0.0;
        for(float x=-2.0;x<=2.0;x+=1.0){ for(float y=-2.0;y<=2.0;y+=1.0){ vec2 o=vec2(x,y)*s*blurAmount; float w=1.0/(1.0+length(vec2(x,y))); b+=texture2D(map,vUv+o)*w; t+=w; }}
        color=b/t;
      }
      color.rgb+=vec3(abs(scrollForce)*0.005); gl_FragColor=vec4(color.rgb,color.a*opacity);
    }
  `,
})

const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const mapRange = (n, a1, a2, b1, b2) => b1 + ((n - a1) / (a2 - a1)) * (b2 - b1)

const computeOpacity = (p) => {
  if (p < fadeIn.start) return 0
  if (p <= fadeIn.end) return clamp(mapRange(p, fadeIn.start, fadeIn.end, 0, 1), 0, 1)
  if (p < fadeOut.start) return 1
  if (p <= fadeOut.end) return clamp(mapRange(p, fadeOut.start, fadeOut.end, 1, 0), 0, 1)
  return 0
}

const computeBlur = (p) => {
  if (p < blurIn.start) return maxBlur
  if (p <= blurIn.end) return clamp(mapRange(p, blurIn.start, blurIn.end, maxBlur, 0), 0, maxBlur)
  if (p < blurOut.start) return 0
  if (p <= blurOut.end) return clamp(mapRange(p, blurOut.start, blurOut.end, 0, maxBlur), 0, maxBlur)
  return maxBlur
}

const onWheel = (e) => {
  e.preventDefault()
  scrollVelocity += e.deltaY * 0.01 * speed
  autoPlay = false
  lastInteraction = Date.now()
}

const onKeyDown = (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') scrollVelocity -= 2 * speed
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') scrollVelocity += 2 * speed
  if (['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) {
    autoPlay = false
    lastInteraction = Date.now()
  }
}

const onPointerMove = (e) => {
  if (!renderer?.domElement) return
  const r = renderer.domElement.getBoundingClientRect()
  pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1
}

const onTouchMove = (e) => {
  const t = e.touches[0]
  if (!t) return
  onPointerMove(t)
  scrollVelocity += (t.clientY % 10 - 5) * 0.003
  autoPlay = false
  lastInteraction = Date.now()
}

const onPointerLeave = () => { pointer.x = 2; pointer.y = 2 }

const updateSize = () => {
  if (!canvasHost.value || !renderer || !camera) return
  const w = canvasHost.value.clientWidth
  const h = canvasHost.value.clientHeight
  renderer.setSize(w, h)
  camera.aspect = w / Math.max(h, 1)
  camera.updateProjectionMatrix()
}

const updateHover = () => {
  if (!raycaster || !camera) return
  raycaster.setFromCamera(pointer, camera)
  const target = raycaster.intersectObjects(planes.map((p) => p.mesh), false)[0]?.object ?? null
  if (hoveredMesh === target) return
  hoveredMesh = target
  planes.forEach((p) => { p.material.uniforms.isHovered.value = p.mesh === target ? 1 : 0 })
}

const animate = () => {
  if (!renderer || !scene || !camera || !clock) return
  const delta = clock.getDelta()
  const time = clock.getElapsedTime()
  if (Date.now() - lastInteraction > 3000) autoPlay = true
  if (autoPlay) scrollVelocity += 0.3 * delta
  scrollVelocity *= 0.95
  updateHover()

  const half = depthRange / 2
  const advance = visibleCount % images.length || images.length

  planes.forEach((p, i) => {
    let nz = p.z + scrollVelocity * delta * 10
    let wf = 0
    let wb = 0
    if (nz >= depthRange) { wf = Math.floor(nz / depthRange); nz -= depthRange * wf }
    else if (nz < 0) { wb = Math.ceil(-nz / depthRange); nz += depthRange * wb }
    if (wf > 0) p.imageIndex = (p.imageIndex + wf * advance) % images.length
    if (wb > 0) p.imageIndex = ((p.imageIndex - wb * advance) % images.length + images.length) % images.length
    p.z = ((nz % depthRange) + depthRange) % depthRange
    p.mesh.position.set(positions[i].x, positions[i].y, p.z - half)
    const pos = p.z / depthRange
    p.material.uniforms.map.value = textures[p.imageIndex]
    p.material.uniforms.opacity.value = computeOpacity(pos)
    p.material.uniforms.blurAmount.value = computeBlur(pos)
    p.material.uniforms.time.value = time
    p.material.uniforms.scrollForce.value = scrollVelocity
  })

  renderer.render(scene, camera)
  frameId = requestAnimationFrame(animate)
}

const disposeAll = () => {
  cancelAnimationFrame(frameId)
  disposers.forEach((fn) => fn())
  disposers = []
  planes.forEach((p) => { scene?.remove(p.mesh); p.geometry.dispose(); p.material.dispose() })
  planes = []
  textures.forEach((t) => t.dispose())
  textures = []
  if (renderer) { renderer.dispose(); renderer.domElement.remove() }
  renderer = null; scene = null; camera = null; clock = null; raycaster = null; hoveredMesh = null
}

const init = async () => {
  webglSupported.value = isWebGLAvailable()
  if (!webglSupported.value || !canvasHost.value) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  canvasHost.value.appendChild(renderer.domElement)
  clock = new THREE.Clock()
  raycaster = new THREE.Raycaster()

  const loader = new THREE.TextureLoader()
  textures = await Promise.all(images.map((src) => new Promise((resolve) => {
    loader.load(src, (tex) => { tex.colorSpace = THREE.SRGBColorSpace; resolve(tex) })
  })))

  planes = Array.from({ length: visibleCount }, (_, i) => {
    const tex = textures[i % textures.length]
    const mat = createMaterial()
    mat.uniforms.map.value = tex
    const aspect = tex?.image ? tex.image.width / tex.image.height : 1
    const sx = aspect > 1 ? 2 * aspect : 2
    const sy = aspect > 1 ? 2 : 2 / Math.max(aspect, 0.001)
    const geo = new THREE.PlaneGeometry(sx, sy, 32, 32)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(positions[i].x, positions[i].y, ((depthRange / visibleCount) * i) % depthRange - depthRange / 2)
    scene.add(mesh)
    return { z: ((depthRange / visibleCount) * i) % depthRange, imageIndex: i % textures.length, mesh, material: mat, geometry: geo }
  })

  updateSize()
  const el = renderer.domElement
  el.addEventListener('wheel', onWheel, { passive: false })
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)
  el.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', updateSize)
  disposers.push(() => el.removeEventListener('wheel', onWheel))
  disposers.push(() => el.removeEventListener('pointermove', onPointerMove))
  disposers.push(() => el.removeEventListener('pointerleave', onPointerLeave))
  disposers.push(() => el.removeEventListener('touchmove', onTouchMove))
  disposers.push(() => window.removeEventListener('keydown', onKeyDown))
  disposers.push(() => window.removeEventListener('resize', updateSize))
  animate()
}

onMounted(init)
onBeforeUnmount(disposeAll)
</script>

<template>
  <main class="pictures-page">
    <div v-if="webglSupported" ref="canvasHost" class="gallery-canvas"></div>
    <div v-else class="fallback-gallery">
      <p class="fallback-title">WebGL not supported. Showing image list:</p>
      <div class="fallback-grid">
        <img v-for="(src, i) in images" :key="`${src}-${i}`" :src="src" :alt="`Image ${i + 1}`" />
      </div>
    </div>

    <div class="overlay overlay-center">
      <h1><span>MAO</span>JUN</h1>
    </div>

    <div class="overlay overlay-bottom">
      <p>Contact me</p>
      <p class="muted">382931184@qq.com</p>
    </div>
  </main>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500&family=IBM+Plex+Mono:wght@500&display=swap");
.pictures-page{position:relative;width:100%;height:100svh;overflow:hidden;background:#090909}
.gallery-canvas,.gallery-canvas :deep(canvas){width:100%;height:100%;display:block}
.overlay{position:fixed;left:0;right:0;pointer-events:none;z-index:5}
.overlay-center{inset:0;display:flex;align-items:center;justify-content:center;padding:1rem;text-align:center;mix-blend-mode:exclusion}
.overlay-center h1{margin:0;color:#fff;font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,8vw,7rem);letter-spacing:-.05em;line-height:.92;font-weight:700}.overlay-center span{font-style:italic;font-weight:500}
.overlay-bottom{bottom:2.25rem;text-align:center;padding:0 1rem;font-family:'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:.08em;color:rgb(255 255 255 /.88)}
.overlay-bottom p{margin:.28rem 0;font-size:.7rem}.overlay-bottom .muted{opacity:.58}
.fallback-gallery{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;padding:1.5rem;color:rgb(255 255 255 /.8)}
.fallback-title{margin:0;font-size:.95rem}.fallback-grid{width:min(100%,960px);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem;max-height:70svh;overflow-y:auto}.fallback-grid img{width:100%;height:12rem;object-fit:cover;border-radius:1rem;border:1px solid rgb(255 255 255 /.08)}
@media (min-width:768px){.fallback-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.overlay-bottom p{font-size:.72rem}}
</style>
