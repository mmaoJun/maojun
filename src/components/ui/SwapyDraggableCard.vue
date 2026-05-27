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
  { id: '1', widget: 'projectViews' },
  { id: '2', widget: 'newUsers' },
  { id: '3', widget: 'designIndustry' },
  { id: '4', widget: 'team' },
  { id: '5', widget: 'logo' },
  { id: '6', widget: 'font' },
  { id: '7', widget: 'agency' },
  { id: '8', widget: 'userTrust' },
  { id: '9', widget: 'cardBalance' },
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
  // swapy manages DOM directly — don't update reactive state during drag
  console.log('Swap:', event.newSlotItemMap.asArray)
}

onMounted(async () => {
  await nextTick()
  if (containerRef.value) {
    swapyInstance = createSwapy(containerRef.value, config)
    swapyInstance.onSwap(onSwap)
  }
})

onBeforeUnmount(() => {
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
          <!-- Card widgets -->
          <template v-if="getItem(itemId)?.widget === 'projectViews'">
            <div class="card card-project-views">
              <div class="card-pv-row">
                <h2 class="card-pv-num">4.875</h2>
                <div class="card-pv-heart">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fef08a" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </div>
              </div>
              <p class="card-pv-label">Project Views</p>
              <p class="card-pv-sub">last year</p>
            </div>
          </template>

          <template v-else-if="getItem(itemId)?.widget === 'newUsers'">
            <div class="card card-new-users">
              <p class="card-nu-label">New Users</p>
              <h2 class="card-nu-num">57K</h2>
              <p class="card-nu-growth">+10%</p>
            </div>
          </template>

          <template v-else-if="getItem(itemId)?.widget === 'designIndustry'">
            <div class="card card-design">
              <p class="card-design-text">We Build Future of</p>
              <p class="card-design-text">Design Industry</p>
            </div>
          </template>

          <template v-else-if="getItem(itemId)?.widget === 'team'">
            <div class="card card-team">
              <div class="card-team-badge">Team of passionate designers and developers</div>
              <div>
                <p class="card-team-label">Daily New clients</p>
                <div class="card-team-row">
                  <span class="card-team-num">54</span>
                  <span class="card-team-pct">+40%</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="getItem(itemId)?.widget === 'logo'">
            <div class="card card-logo">
              <svg viewBox="0 0 100 100" class="card-logo-svg">
                <circle cx="33" cy="33" r="25" fill="rgb(27, 13, 221)" />
                <circle cx="67" cy="33" r="25" fill="rgb(9, 4, 255)" />
                <circle cx="50" cy="67" r="25" fill="rgb(1, 61, 226)" />
              </svg>
              <h2 class="card-logo-title">UI-Layouts</h2>
            </div>
          </template>

          <template v-else-if="getItem(itemId)?.widget === 'font'">
            <div class="card card-font">
              <h2 class="card-font-title">Font</h2>
              <p class="card-font-name">SK-Modernist</p>
              <div class="card-font-swatches">
                <div class="card-font-swatch sw-dark"></div>
                <div class="card-font-swatch sw-gray"></div>
                <div class="card-font-swatch sw-red"></div>
                <div class="card-font-swatch sw-pink"></div>
              </div>
            </div>
          </template>

          <template v-else-if="getItem(itemId)?.widget === 'agency'">
            <div class="card card-agency">
              <div class="card-agency-badge">
                <p>Smart Digital</p>
                <p>Agency For Your</p>
                <p>Business</p>
              </div>
              <div class="card-agency-blocks">
                <div class="card-agency-block purple"></div>
                <div class="card-agency-block yellow"></div>
              </div>
            </div>
          </template>

          <template v-else-if="getItem(itemId)?.widget === 'userTrust'">
            <div class="card card-trust">
              <h3 class="card-trust-title">Trusted By</h3>
              <p class="card-trust-count">500+ Users</p>
              <div class="card-trust-avatars">
                <div class="card-trust-avatar gray"></div>
                <div class="card-trust-avatar gray"></div>
                <div class="card-trust-avatar gray"></div>
                <div class="card-trust-avatar gray"></div>
                <div class="card-trust-avatar plus">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"/><path d="M12 5v14"/>
                  </svg>
                </div>
              </div>
              <p class="card-trust-sub">Don't Take Our Words For It...</p>
            </div>
          </template>

          <template v-else-if="getItem(itemId)?.widget === 'cardBalance'">
            <div class="card card-balance">
              <h3 class="card-balance-heading">Cards balance</h3>
              <h2 class="card-balance-amount">$ 12,457</h2>
              <div class="card-balance-info">
                <div class="card-balance-row">
                  <span>Card Holder</span>
                  <span>Expires</span>
                </div>
                <div class="card-balance-row bold">
                  <span>Robert Fox</span>
                  <span>07/22</span>
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;
  background: #fff;
}

.sc-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.5rem;
  padding: 1rem 0;
}

@media (min-width: 768px) {
  .sc-grid {
    gap: 1.5rem;
  }
}

.sc-slot {
  border-radius: 0.75rem;
  min-height: 16rem;
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
.sc-col-7 { grid-column: span 7; }
.sc-col-5 { grid-column: span 5; }
.sc-col-6 { grid-column: span 6; }

@media (min-width: 1024px) {
  .sc-lg-col-3 { grid-column: span 3; }
  .sc-lg-col-4 { grid-column: span 4; }
  .sc-lg-col-5 { grid-column: span 5; }
}

/* ===== Shared card styles ===== */
.card {
  border-radius: 0.75rem;
  height: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative;
}

/* ===== Project Views Card ===== */
.card-project-views {
  background: #059669;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.card-pv-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.card-pv-num {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  color: #fef08a;
  margin-bottom: 0.25rem;
}
.card-pv-heart {
  display: flex;
  align-items: center;
}
.card-pv-label {
  color: #fef08a;
  font-weight: 500;
}
.card-pv-sub {
  color: rgba(254, 240, 138, 0.8);
  font-size: 0.875rem;
}

/* ===== New Users Card ===== */
.card-new-users {
  background: #4b5563;
  justify-content: center;
}
.card-nu-label {
  color: #fef08a;
  font-weight: 500;
  margin-bottom: 0.25rem;
}
.card-nu-num {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  color: #fef08a;
  line-height: 1;
}
.card-nu-growth {
  color: #4ade80;
  font-weight: 500;
  margin-top: 0.5rem;
}

/* ===== Design Industry Card ===== */
.card-design {
  background: #059669;
  justify-content: space-between;
}
.card-design-text {
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 700;
  color: #fef08a;
}

/* ===== Team Card ===== */
.card-team {
  background: #bfdbfe;
  justify-content: space-between;
}
.card-team-badge {
  background: #93c5fd;
  color: #000;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  display: inline-block;
  max-width: fit-content;
  margin-bottom: 1rem;
}
.card-team-label {
  font-weight: 700;
  color: #1f2937;
}
.card-team-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}
.card-team-num {
  font-size: clamp(2.5rem, 5vw, 3.75rem);
  font-weight: 700;
  color: #111827;
}
.card-team-pct {
  color: #22c55e;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

/* ===== Logo Card ===== */
.card-logo {
  background: #fbcfe8;
  justify-content: center;
  align-items: center;
}
.card-logo-svg {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
}
.card-logo-title {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  font-weight: 700;
  color: #111827;
}

/* ===== Font Card ===== */
.card-font {
  background: #fef08a;
}
.card-font-title {
  font-size: clamp(1.5rem, 3vw, 1.875rem);
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}
.card-font-name {
  color: #374151;
  margin-bottom: 1.5rem;
}
.card-font-swatches {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
.card-font-swatch {
  width: 3rem;
  height: 3rem;
  border-radius: 0.375rem;
}
.sw-dark { background: #1f2937; }
.sw-gray { background: #9ca3af; }
.sw-red { background: #f87171; }
.sw-pink { background: #f9a8d4; }

/* ===== Agency Card ===== */
.card-agency {
  background: #c4b5fd;
  padding: 1rem;
}
.card-agency-badge {
  background: #111827;
  color: #fef08a;
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.card-agency-blocks {
  display: flex;
  gap: 0.5rem;
  height: 5rem;
}
.card-agency-block {
  flex: 1;
  border-radius: 0.75rem;
}
.card-agency-block.purple { background: #a78bfa; }
.card-agency-block.yellow { background: #fef08a; margin-left: 1rem; }

/* ===== User Trust Card ===== */
.card-trust {
  background: #2563eb;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #fff;
}
.card-trust-title {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.card-trust-count {
  font-size: clamp(1.5rem, 3vw, 1.875rem);
  font-weight: 700;
  margin-bottom: 1rem;
}
.card-trust-avatars {
  display: flex;
  margin-bottom: 1rem;
}
.card-trust-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  border: 2px solid #2563eb;
  margin-left: -0.5rem;
}
.card-trust-avatar:first-child {
  margin-left: 0;
}
.card-trust-avatar.gray {
  background: #e5e7eb;
}
.card-trust-avatar.plus {
  background: #eab308;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-trust-sub {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* ===== Card Balance Card ===== */
.card-balance {
  background: #fef08a;
}
.card-balance-heading {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: #171717;
}
.card-balance-amount {
  font-size: clamp(1.5rem, 3vw, 1.875rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #262626;
}
.card-balance-info {
  background: #000;
  color: #fff;
  border-radius: 0.5rem;
  padding: 1rem;
}
.card-balance-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}
.card-balance-row.bold {
  font-weight: 500;
}

/* ===== Responsive: collapse on mobile ===== */
@media (max-width: 767px) {
  .sc-col-7,
  .sc-col-5,
  .sc-col-6 {
    grid-column: span 12;
  }
  .sc-slot {
    min-height: 12rem;
  }
}

/* ===== Large screen font bump ===== */
@media (min-width: 1536px) {
  .sc-item {
    font-size: 1.125rem;
  }
  .card-pv-num { font-size: 3rem; }
  .card-nu-num { font-size: 3.75rem; }
}
</style>
