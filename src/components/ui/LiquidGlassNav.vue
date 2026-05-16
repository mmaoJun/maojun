<template>
  <header class="hero-nav">
    <span class="hero-nav__shadow" aria-hidden="true" />
    <span class="hero-nav__filter" aria-hidden="true" />
    <div class="hero-nav__content">
      <slot />
    </div>
  </header>
</template>

<style scoped>
.hero-nav {
  position: fixed;
  left: 50%;
  top: clamp(0.9rem, 4.8vh, 2.8rem);
  transform: translateX(-50%);
  width: min(1625px, calc(100% - 2.7rem));
  min-height: 3.5rem;
  padding: 0.45rem 0.6rem 0.45rem 1rem;
  z-index: 9999;
  border: 0;
  border-radius: 16px;
  background: transparent;
  overflow: hidden;
  will-change: transform, width;
}

.hero-nav__shadow {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  box-shadow:
    0 4px 24px rgb(15 23 42 / 12%),
    0 1px 3px rgb(15 23 42 / 8%),
    inset 0 1px 0 rgb(255 255 255 / 85%),
    inset 0 -1px 0 rgb(15 23 42 / 6%);
  pointer-events: none;
}

.hero-nav__filter {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  overflow: hidden;
  background: rgb(248 250 252 / 72%);
  border: 1px solid rgb(15 23 42 / 10%);
  backdrop-filter: url('#container-glass') blur(20px) saturate(140%);
  -webkit-backdrop-filter: url('#container-glass') blur(20px) saturate(140%);
  pointer-events: none;
}

@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .hero-nav__filter {
    background: rgb(248 250 252 / 92%);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

.hero-nav__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  min-height: 2.6rem;
}

@media (max-width: 1000px) {
  .hero-nav {
    width: calc(100% - 1rem);
    padding: 0.45rem 0.5rem;
    min-height: 3.35rem;
    gap: 0.45rem;
  }

  .hero-nav__content {
    gap: 0.45rem;
  }
}
</style>
