<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { createSwapy, utils } from 'swapy'

const containerRef = ref(null)
let swapyInstance = null

const config = {
  animation: 'dynamic',
  swapMode: 'hover',
  enabled: true,
  manualSwap: false,
  autoScrollOnDrag: true,
}

const initialItems = [
  { id: '1', widget: 'clock' },
  { id: '2', widget: 'techStack' },
  { id: '3', widget: 'brand' },
  { id: '4', widget: 'musicStats' },
  { id: '5', widget: 'movieStats' },
  { id: '6', widget: 'photoStats' },
  { id: '7', widget: 'github' },
  { id: '8', widget: 'quote' },
  { id: '9', widget: 'siteInfo' },
]

const slotItemMap = ref(utils.initSlotItemMap(initialItems, 'id'))

const slottedItems = computed(() =>
  utils.toSlottedItems(initialItems, 'id', slotItemMap.value)
)

function getItem(itemId) {
  return initialItems.find((i) => i.id === itemId)
}

const slotClasses = {
  '1': 'sc-col-7 sc-lg-col-4',
  '2': 'sc-col-5 sc-lg-col-3',
  '3': 'sc-col-5 sc-lg-col-5',
  '4': 'sc-col-7 sc-lg-col-5',
  '5': 'sc-col-6 sc-lg-col-4',
  '6': 'sc-col-6 sc-lg-col-3',
  '7': 'sc-col-5 sc-lg-col-4',
  '8': 'sc-col-7 sc-lg-col-4',
  '9': 'sc-col-12 sc-lg-col-4',
}

function onSwap(event) {
  console.log('Swap:', event.newSlotItemMap.asArray)
}

// ---- Live Clock ----
const now = ref(new Date())
let clockTimer = null

const timeString = computed(() =>
  now.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
)
const dateString = computed(() =>
  now.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
)

// ---- Random Quote ----
const quotes = [
  'Design is not just what it looks like and feels like. Design is how it works. — Steve Jobs',
  'Simplicity is the ultimate sophistication. — Leonardo da Vinci',
  'First, solve the problem. Then, write the code. — John Johnson',
  'Code is like humor. When you have to explain it, it\'s bad. — Cory House',
  'Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler',
  'The best way to predict the future is to create it. — Peter Drucker',
]
const quote = ref(quotes[Math.floor(Math.random() * quotes.length)])

onMounted(async () => {
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
  await nextTick()
  if (containerRef.value) {
    swapyInstance = createSwapy(containerRef.value, config)
    swapyInstance.onSwap(onSwap)
  }
})

onBeforeUnmount(() => {
  clearInterval(clockTimer)
  swapyInstance?.destroy()
})
</script>

<template>
  <div ref="containerRef" class="swapy-root">
    <div class="sc-grid">
      <div
        v-for="{ slotId, itemId } in slottedItems"
        :key="slotId"
        :data-swapy-slot="slotId"
        :class="['sc-slot', slotClasses[slotId] || '']"
      >
        <div
          :data-swapy-item="itemId"
          class="sc-item"
        >
          <!-- 1. Live Clock -->
          <template v-if="getItem(itemId)?.widget === 'clock'">
            <div class="card card-clock">
              <svg class="card-clock-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <h2 class="card-clock-time">{{ timeString }}</h2>
              <p class="card-clock-date">{{ dateString }}</p>
              <p class="card-clock-tz">Asia/Shanghai · CST</p>
            </div>
          </template>

          <!-- 2. Tech Stack -->
          <template v-else-if="getItem(itemId)?.widget === 'techStack'">
            <div class="card card-tech">
              <p class="card-tech-label">Tech Stack</p>
              <div class="card-tech-tags">
                <span class="tag tag-vue">Vue 3</span>
                <span class="tag tag-gsap">GSAP</span>
                <span class="tag tag-lenis">Lenis</span>
                <span class="tag tag-vite">Vite</span>
                <span class="tag tag-swapy">Swapy</span>
                <span class="tag tag-motion">Motion</span>
              </div>
            </div>
          </template>

          <!-- 3. Brand -->
          <template v-else-if="getItem(itemId)?.widget === 'brand'">
            <div class="card card-brand">
              <div class="card-brand-logo">M</div>
              <h2 class="card-brand-name">maoJun</h2>
              <p class="card-brand-desc">Personal Portfolio</p>
              <div class="card-brand-dot"></div>
            </div>
          </template>

          <!-- 4. Music Stats -->
          <template v-else-if="getItem(itemId)?.widget === 'musicStats'">
            <div class="card card-music">
              <p class="card-music-label">Music Collection</p>
              <h2 class="card-music-num">40+</h2>
              <p class="card-music-sub">Tracks in playlist</p>
              <div class="card-music-bar"><div class="card-music-fill"></div></div>
            </div>
          </template>

          <!-- 5. Movie Stats -->
          <template v-else-if="getItem(itemId)?.widget === 'movieStats'">
            <div class="card card-movie">
              <p class="card-movie-label">Movie Gallery</p>
              <div class="card-movie-row">
                <span class="card-movie-num">11</span>
                <span class="card-movie-unit">films</span>
              </div>
              <p class="card-movie-sub">Curated collection</p>
            </div>
          </template>

          <!-- 6. Photo Stats -->
          <template v-else-if="getItem(itemId)?.widget === 'photoStats'">
            <div class="card card-photo">
              <p class="card-photo-label">Photo Gallery</p>
              <h2 class="card-photo-num">10+</h2>
              <p class="card-photo-sub">Curated images</p>
            </div>
          </template>

          <!-- 7. GitHub -->
          <template v-else-if="getItem(itemId)?.widget === 'github'">
            <div class="card card-github">
              <svg class="card-github-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <h2 class="card-github-title">Open Source</h2>
              <p class="card-github-sub">github.com/mmaoJun</p>
            </div>
          </template>

          <!-- 8. Random Quote -->
          <template v-else-if="getItem(itemId)?.widget === 'quote'">
            <div class="card card-quote">
              <svg class="card-quote-mark" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
              </svg>
              <p class="card-quote-text">{{ quote }}</p>
            </div>
          </template>

          <!-- 9. Site Info -->
          <template v-else-if="getItem(itemId)?.widget === 'siteInfo'">
            <div class="card card-info">
              <h3 class="card-info-heading">Site Info</h3>
              <div class="card-info-list">
                <div class="card-info-item">
                  <span>Framework</span>
                  <span>Vue 3 + Vite</span>
                </div>
                <div class="card-info-item">
                  <span>Deploy</span>
                  <span>GitHub Pages</span>
                </div>
                <div class="card-info-item">
                  <span>Domain</span>
                  <span>maojun.site</span>
                </div>
                <div class="card-info-item">
                  <span>Location</span>
                  <span>GuiZhou, China</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.swapy-root {
  width: 100%;
  min-height: 100svh;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.sc-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.5rem;
  padding: 1rem 0;
  width: 100%;
  max-width: 960px;
}

@media (min-width: 768px) {
  .sc-grid { gap: 0.75rem; }
}

.sc-slot {
  border-radius: 0.75rem;
  min-height: 11rem;
  transition: background-color 0.2s;
}

.sc-slot[data-swapy-highlighted] {
  background-color: rgba(229, 229, 229, 0.4);
}

.sc-item {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.sc-item[data-swapy-dragging] {
  cursor: grabbing;
}

/* ===== Column spans ===== */
.sc-col-12 { grid-column: span 12; }
.sc-col-7  { grid-column: span 7; }
.sc-col-5  { grid-column: span 5; }
.sc-col-6  { grid-column: span 6; }

@media (min-width: 1024px) {
  .sc-lg-col-3 { grid-column: span 3; }
  .sc-lg-col-4 { grid-column: span 4; }
  .sc-lg-col-5 { grid-column: span 5; }
}

/* ===== Shared card ===== */
.card {
  border-radius: 0.75rem;
  height: 100%;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  position: relative;
}

/* ===== 1. Clock ===== */
.card-clock {
  background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #e0e7ff;
}
.card-clock-icon {
  color: #a5b4fc;
  margin-bottom: 0.5rem;
}
.card-clock-time {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.card-clock-date {
  color: #c7d2fe;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
.card-clock-tz {
  color: #a5b4fc;
  font-size: 0.7rem;
  margin-top: 0.35rem;
}

/* ===== 2. Tech Stack ===== */
.card-tech {
  background: #18181b;
  justify-content: center;
  gap: 0.75rem;
}
.card-tech-label {
  color: #a1a1aa;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.card-tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.tag {
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
}
.tag-vue   { background: #42b883; color: #fff; }
.tag-gsap  { background: #0ae448; color: #111; }
.tag-lenis { background: #818cf8; color: #fff; }
.tag-vite  { background: #fbbf24; color: #111; }
.tag-swapy { background: #f472b6; color: #fff; }
.tag-motion{ background: #a78bfa; color: #fff; }

/* ===== 3. Brand ===== */
.card-brand {
  background: linear-gradient(135deg, #ff6b35 0%, #f7c948 100%);
  justify-content: center;
  align-items: center;
  text-align: center;
}
.card-brand-logo {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #fff;
  color: #ff6b35;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'STXingkai', serif;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.card-brand-name {
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 700;
  color: #fff;
  font-family: 'STXingkai', serif;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.card-brand-desc {
  color: rgba(255,255,255,0.85);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
.card-brand-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  margin-top: 0.5rem;
  opacity: 0.7;
}

/* ===== 4. Music Stats ===== */
.card-music {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  justify-content: space-between;
}
.card-music-label {
  color: rgba(255,255,255,0.9);
  font-weight: 600;
  font-size: 0.85rem;
}
.card-music-num {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.card-music-sub {
  color: rgba(255,255,255,0.8);
  font-size: 0.8rem;
}
.card-music-bar {
  height: 6px;
  background: rgba(255,255,255,0.25);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
}
.card-music-fill {
  width: 70%;
  height: 100%;
  background: #fff;
  border-radius: 3px;
}

/* ===== 5. Movie Stats ===== */
.card-movie {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  justify-content: center;
}
.card-movie-label {
  color: rgba(255,255,255,0.85);
  font-weight: 500;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}
.card-movie-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.card-movie-num {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.card-movie-unit {
  color: rgba(255,255,255,0.7);
  font-weight: 600;
  font-size: 1rem;
}
.card-movie-sub {
  color: rgba(255,255,255,0.6);
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

/* ===== 6. Photo Stats ===== */
.card-photo {
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
  justify-content: center;
}
.card-photo-label {
  color: rgba(255,255,255,0.85);
  font-weight: 500;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}
.card-photo-num {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.card-photo-sub {
  color: rgba(255,255,255,0.7);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* ===== 7. GitHub ===== */
.card-github {
  background: #f0fdf4;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.card-github-icon {
  color: #16a34a;
  margin-bottom: 0.5rem;
}
.card-github-title {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: #15803d;
}
.card-github-sub {
  color: #16a34a;
  font-size: 0.75rem;
  margin-top: 0.35rem;
}

/* ===== 8. Quote ===== */
.card-quote {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  justify-content: center;
  padding: 1.25rem 1.5rem;
}
.card-quote-mark {
  margin-bottom: 0.5rem;
  color: #db2777;
}
.card-quote-text {
  font-size: 0.8rem;
  line-height: 1.6;
  color: #9d174d;
  font-style: italic;
}

/* ===== 9. Site Info ===== */
.card-info {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
}
.card-info-heading {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.85rem;
}
.card-info-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.card-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: #475569;
}
.card-info-item span:last-child {
  color: #0f172a;
  font-weight: 600;
}

/* ===== Responsive ===== */
@media (max-width: 767px) {
  .sc-col-7, .sc-col-5, .sc-col-6 {
    grid-column: span 12;
  }
  .sc-slot {
    min-height: 9rem;
  }
  .sc-grid {
    gap: 0.4rem;
  }
  .swapy-root {
    padding: 1rem 0.5rem;
  }
}

@media (min-width: 1536px) {
  .sc-item { font-size: 1.125rem; }
  .card-clock-time { font-size: 3rem; }
  .card-music-num { font-size: 4rem; }
}
</style>
