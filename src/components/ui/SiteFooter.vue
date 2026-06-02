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
        <a href="/about" class="site-footer-v2__brand" :aria-label="brandName">
          <img class="site-footer-v2__logo" src="/maojun.jpg" alt="logo" />
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
              <svg v-if="link.icon === 'GitHub'" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span v-else>{{ link.icon }}</span>
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
  padding: 0.75rem 0 0.5rem;
  background: #c0fc61;
  border-top: none;
}

.site-footer-v2__inner {
  padding: 0 2rem;
}

.site-footer-v2__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.site-footer-v2__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #1a1a1a;
}

.site-footer-v2__logo {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: none;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.08);
  object-fit: cover;
}

.site-footer-v2__brand-name {
  font-size: 1.05rem;
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
  gap: 0.5rem;
}

.site-footer-v2__social-link {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  text-decoration: none;
  color: #1a1a1a;
  background: rgb(0 0 0 / 0.06);
  border: none;
  transition: transform 0.25s ease, background-color 0.25s ease;
}

.site-footer-v2__social-link:hover {
  transform: translateY(-2px);
  background: rgb(0 0 0 / 0.1);
}

.site-footer-v2__social-link span {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.site-footer-v2__bottom {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: none;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 0.5rem 1rem;
}

.site-footer-v2__copyright {
  grid-row: 1 / span 2;
  color: rgb(0 0 0 / 0.62);
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
  color: #1a1a1a;
}

.site-footer-v2__nav--legal a {
  color: rgb(0 0 0 / 0.55);
}

.site-footer-v2__nav a:hover {
  color: #000;
  text-decoration: underline;
  text-underline-offset: 0.25rem;
}

@media (max-width: 900px) {
  .site-footer-v2 {
    padding: 1.25rem 0 0.75rem;
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
