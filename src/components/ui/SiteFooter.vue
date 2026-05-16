<script setup>
defineProps({
  brandName: {
    type: String,
    required: true,
  },
  logoText: {
    type: String,
    default: 'M',
  },
  socialLinks: {
    type: Array,
    default: () => [],
  },
  mainLinks: {
    type: Array,
    default: () => [],
  },
  legalLinks: {
    type: Array,
    default: () => [],
  },
  copyright: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <footer class="site-footer-v2">
    <div class="site-footer-v2__inner">
      <div class="site-footer-v2__top">
        <a href="/" class="site-footer-v2__brand" :aria-label="brandName">
          <span class="site-footer-v2__logo">{{ logoText }}</span>
          <span class="site-footer-v2__brand-name">{{ brandName }}</span>
        </a>

        <ul class="site-footer-v2__socials">
          <li v-for="link in socialLinks" :key="link.label">
            <a
              class="site-footer-v2__social-link"
              :href="link.href"
              :aria-label="link.label"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener noreferrer' : undefined"
            >
              <span>{{ link.icon }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="site-footer-v2__bottom">
        <div class="site-footer-v2__copyright">
          <div>{{ copyright.text }}</div>
          <div v-if="copyright.license">{{ copyright.license }}</div>
        </div>

        <nav class="site-footer-v2__nav site-footer-v2__nav--main">
          <ul>
            <li v-for="link in mainLinks" :key="link.label">
              <a :href="link.href">{{ link.label }}</a>
            </li>
          </ul>
        </nav>

        <div class="site-footer-v2__nav site-footer-v2__nav--legal">
          <ul>
            <li v-for="link in legalLinks" :key="link.label">
              <a
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer-v2 {
  padding: 4rem 0 2rem;
  background:
    linear-gradient(180deg, #000 0%, #070707 100%),
    radial-gradient(circle at top, rgb(255 255 255 / 0.05), transparent 35%);
  border-top: 1px solid rgb(255 255 255 / 0.08);
}

.site-footer-v2__inner {
  padding: 0 2rem;
}

.site-footer-v2__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.site-footer-v2__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #fff;
}

.site-footer-v2__logo {
  width: 2.75rem;
  height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.08);
  border: 1px solid rgb(255 255 255 / 0.14);
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.22);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.site-footer-v2__brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.site-footer-v2__socials,
.site-footer-v2__nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.site-footer-v2__socials {
  display: flex;
  gap: 0.75rem;
}

.site-footer-v2__social-link {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  text-decoration: none;
  color: #f5f5f5;
  background: rgb(255 255 255 / 0.06);
  border: 1px solid rgb(255 255 255 / 0.12);
  transition: transform 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
}

.site-footer-v2__social-link:hover {
  transform: translateY(-2px);
  background: rgb(255 255 255 / 0.12);
  border-color: rgb(255 255 255 / 0.2);
}

.site-footer-v2__social-link span {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.site-footer-v2__bottom {
  margin-top: 1.75rem;
  padding-top: 1.75rem;
  border-top: 1px solid rgb(255 255 255 / 0.1);
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 1rem 2rem;
}

.site-footer-v2__copyright {
  grid-row: 1 / span 2;
  color: rgb(255 255 255 / 0.58);
  font-size: 0.9rem;
  line-height: 1.7;
  white-space: nowrap;
}

.site-footer-v2__nav ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem 1rem;
}

.site-footer-v2__nav a {
  text-decoration: none;
  font-size: 0.92rem;
  transition: color 0.2s ease, text-decoration-color 0.2s ease;
}

.site-footer-v2__nav--main a {
  color: rgb(255 255 255 / 0.9);
}

.site-footer-v2__nav--legal a {
  color: rgb(255 255 255 / 0.56);
}

.site-footer-v2__nav a:hover {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 0.25rem;
}

@media (max-width: 900px) {
  .site-footer-v2 {
    padding: 3rem 0 1.75rem;
  }

  .site-footer-v2__inner {
    padding: 0 1rem;
  }

  .site-footer-v2__top,
  .site-footer-v2__bottom {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .site-footer-v2__copyright {
    grid-row: auto;
    white-space: normal;
  }

  .site-footer-v2__nav ul {
    justify-content: flex-start;
  }
}
</style>
