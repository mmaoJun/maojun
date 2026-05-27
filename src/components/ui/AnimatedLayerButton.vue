<script setup>
defineOptions({ inheritAttrs: false })
</script>

<template>
  <button
    class="animated-layer-btn"
    v-bind="$attrs"
  >
    <svg
      class="animated-layer-btn__svg"
      viewBox="0 0 1095.66 1095.63"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path fill="#242021" d="M1298,749.62c.4,300.41-243,548-548.1,547.9C446.23,1297.4,201.92,1051.2,202.29,749c.37-301.52,244.49-547.41,548.34-547.12C1055.43,202.18,1298.25,449.6,1298,749.62Z" transform="translate(-202.29 -201.89)"/>
      <path fill="#22c55e" d="M1285.89,749.79c-.25,297.07-241.24,535.86-536.12,535.66-296.34-.21-537-241.72-535.29-539,1.68-293.16,240.83-534.18,539.15-532.37C1046.8,215.84,1285.62,453.88,1285.89,749.79Z" transform="translate(-202.29 -201.89)"/>
      <path fill="#fefefe" d="M1195.29,749.56c.54,244.73-198.67,446.2-446.87,445.33C503.27,1194,304,994.53,304.93,748c.91-244.52,199.12-443.08,444.39-443.49C997.43,304,1195.74,505.59,1195.29,749.56Z" transform="translate(-202.29 -201.89)"/>
      <path fill="#16a34a" d="M1097.23,749.87c.22,190.31-154.42,347.43-348,346.92-192-.5-346.48-156.44-346.17-347.7C403.33,558,558.18,402,751.08,402.55,944.62,403.09,1097.69,560.56,1097.23,749.87Z" transform="translate(-202.29 -201.89)"/>
      <path fill="var(--ab-primary, #ffffff)" d="M1006.72,744.28c2.81,143.23-110.17,257.35-247.42,261.9C613.15,1011,498.22,895.93,493.71,758.88,488.93,613.71,603,498,740.69,493.28,886.73,488.24,1004,603.87,1006.72,744.28Z" transform="translate(-202.29 -201.89)"/>
      <!-- Heart silhouette -->
      <path fill="var(--ab-primary-foreground, #000000)" d="M750 1020 C750 1020, 500 820, 500 650 C500 540, 590 480, 660 510 C700 525, 730 560, 750 600 C770 560, 800 525, 840 510 C910 480, 1000 540, 1000 650 C1000 820, 750 1020, 750 1020 Z" transform="translate(-202.29 -201.89)" />
    </svg>
    <span class="animated-layer-btn__text">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.animated-layer-btn {
  --ab-primary: #ffffff;
  --ab-primary-foreground: #000000;

  position: relative;
  display: flex;
  height: 50px;
  width: 180px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  background: var(--ab-primary);
  transition: transform 0.3s ease-in-out;
}

.animated-layer-btn:hover {
  transform: translateY(3px);
}

.animated-layer-btn:focus-visible {
  outline: 2px solid var(--ab-primary-foreground);
  outline-offset: 2px;
}

.animated-layer-btn:disabled {
  pointer-events: none;
  opacity: 0.5;
}

.animated-layer-btn__svg {
  position: absolute;
  height: auto;
  width: 60px;
  left: -30px;
  transition: left 0.3s ease-in-out, width 0.3s ease-in-out;
  animation: spin-slow 5s linear infinite;
}

.animated-layer-btn:hover .animated-layer-btn__svg {
  left: 0;
  width: 100%;
}

.animated-layer-btn__text {
  z-index: 10;
  font-weight: 600;
  font-size: 1.1em;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ab-primary-foreground);
  transition: color 0.3s;
}

.animated-layer-btn:hover .animated-layer-btn__text {
  color: transparent;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
