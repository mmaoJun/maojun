<script setup>
import { ref, onMounted } from 'vue'
import { clearAuth } from '../../utils/auth'

const currentPath = ref('/')

const links = [
  { label: '首页', href: '/home-editor' },
  { label: 'Movies', href: '/movies-editor' },
  { label: 'Pictures', href: '/pictures-editor' },
  { label: 'About', href: '/about-editor' },
  { label: 'Musics', href: '/musics-editor' },
  { label: '图片管理', href: '/manage-images' },
]

onMounted(() => {
  currentPath.value = window.location.pathname
})

const go = (href) => { window.location.href = href }
const goHome = () => { window.location.href = '/' }
const logout = () => { clearAuth(); window.location.href = '/login' }
</script>

<template>
  <nav class="admin-navbar">
    <div class="admin-navbar__inner">
      <ul class="admin-navbar__list">
        <li class="admin-navbar__item">
          <a class="admin-nav-link admin-nav-link--home" @click="goHome">
            <span class="admin-nav-link__text">← 回到网站</span>
            <span class="admin-nav-link__border" />
            <span class="admin-nav-link__bg" />
          </a>
        </li>
        <li v-for="link in links" :key="link.href" class="admin-navbar__item">
          <a
            class="admin-nav-link"
            :class="{ 'admin-nav-link--active': currentPath === link.href }"
            @click="go(link.href)"
          >
            <span class="admin-nav-link__text">{{ link.label }}</span>
            <span class="admin-nav-link__border" />
            <span class="admin-nav-link__bg" />
          </a>
        </li>
        <li class="admin-navbar__item">
          <a class="admin-nav-link admin-nav-link--logout" @click="logout">
            <span class="admin-nav-link__text">退出</span>
            <span class="admin-nav-link__border" />
            <span class="admin-nav-link__bg" />
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.admin-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: #fafafa;
  border-bottom: 1px solid rgb(0 0 0 / 6%);
}

.admin-navbar__inner {
  max-width: 100%;
  margin: 0 auto;
  padding: 0.6rem 1.5rem;
}

.admin-navbar__list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.admin-navbar__item {
  list-style: none;
}

.admin-nav-link {
  position: relative;
  display: inline-block;
  cursor: pointer;
  text-decoration: none;
}

.admin-nav-link__text {
  position: relative;
  z-index: 10;
  display: block;
  text-transform: uppercase;
  color: #262626;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.82rem;
  padding: 0.5rem 0.85rem;
  transition: color 0.3s ease;
}

.admin-nav-link:hover .admin-nav-link__text,
.admin-nav-link--active .admin-nav-link__text {
  color: #fff;
}

.admin-nav-link__border {
  position: absolute;
  inset: 0;
  border-top: 2px solid #262626;
  border-bottom: 2px solid #262626;
  transform: scaleY(2);
  opacity: 0;
  transition: all 0.3s ease;
  transform-origin: center;
}

.admin-nav-link:hover .admin-nav-link__border,
.admin-nav-link--active .admin-nav-link__border {
  transform: scaleY(1);
  opacity: 1;
}

.admin-nav-link__bg {
  position: absolute;
  top: 2px;
  left: 0;
  width: 100%;
  height: 100%;
  background: #262626;
  transform: scaleY(0);
  opacity: 0;
  transition: all 0.3s ease;
  transform-origin: top;
}

.admin-nav-link:hover .admin-nav-link__bg,
.admin-nav-link--active .admin-nav-link__bg {
  transform: scaleY(1);
  opacity: 1;
}

/* Home */
.admin-nav-link--home .admin-nav-link__text {
  color: #2563eb;
}

.admin-nav-link--home .admin-nav-link__border {
  border-color: #2563eb;
}

.admin-nav-link--home .admin-nav-link__bg {
  background: #2563eb;
}

.admin-nav-link--home:hover .admin-nav-link__text {
  color: #fff;
}

/* Logout */
.admin-nav-link--logout .admin-nav-link__text {
  color: #ef4444;
}

.admin-nav-link--logout .admin-nav-link__border {
  border-color: #ef4444;
}

.admin-nav-link--logout .admin-nav-link__bg {
  background: #ef4444;
}

.admin-nav-link--logout:hover .admin-nav-link__text {
  color: #fff;
}

@media (max-width: 900px) {
  .admin-navbar__list {
    gap: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .admin-nav-link__text {
    padding: 0.45rem 0.6rem;
    font-size: 0.74rem;
    white-space: nowrap;
  }
}
</style>
