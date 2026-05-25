import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'

import Musics from '../components/musics.vue'
import About from '../components/about.vue'
import Pictures from '../components/pictures.vue'
import Movies from '../components/movies.vue'
import AdminLogin from '../components/admin-login.vue'
import AdminImages from '../components/admin-images.vue'
import AdminHomeEditor from '../components/admin-home-editor.vue'
import AdminMoviesEditor from '../components/admin-movies-editor.vue'
import AdminPicturesEditor from '../components/admin-pictures-editor.vue'
import AdminAboutEditor from '../components/admin-about-editor.vue'
import AdminMusicsEditor from '../components/admin-musics-editor.vue'
import { isAuthenticated } from '../utils/auth'
import {
  coverRouteCurtain,
  emitRouteRevealStart,
  isRouteCurtainEnabled,
  revealRouteCurtain,
  setRouteContentVisible,
} from '../components/ui/routeCurtainController'

const routes = [
  { path: '/musics', component: Musics },
  { path: '/pictures', component: Pictures },
  { path: '/about', component: About },
  { path: '/movies', component: Movies },
  { path: '/login', component: AdminLogin, meta: { hideShell: true, public: true } },
  { path: '/manage-images', component: AdminImages, meta: { hideShell: true, requiresAuth: true } },
  { path: '/home-editor', component: AdminHomeEditor, meta: { hideShell: true, requiresAuth: true } },
  { path: '/movies-editor', component: AdminMoviesEditor, meta: { hideShell: true, requiresAuth: true } },
  { path: '/pictures-editor', component: AdminPicturesEditor, meta: { hideShell: true, requiresAuth: true } },
  { path: '/about-editor', component: AdminAboutEditor, meta: { hideShell: true, requiresAuth: true } },
  { path: '/musics-editor', component: AdminMusicsEditor, meta: { hideShell: true, requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

let isFirstNavigation = true

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
    return
  }

  if (to.path === '/login' && isAuthenticated()) {
    next('/manage-images')
    return
  }

  if (to.meta.hideShell || from.meta.hideShell) {
    setRouteContentVisible(true)
    next()
    return
  }

  if (isFirstNavigation) {
    next()
    return
  }

  if (!isRouteCurtainEnabled()) {
    setRouteContentVisible(true)
    next()
    return
  }

  await coverRouteCurtain()
  setRouteContentVisible(true)
  next()
})

router.afterEach(async (to, from) => {
  await nextTick()
  if (to.meta.hideShell || from.meta.hideShell) {
    isFirstNavigation = false
    return
  }

  if (isFirstNavigation) {
    isFirstNavigation = false
    return
  }

  setRouteContentVisible(true)

  if (!isRouteCurtainEnabled()) {
    return
  }

  emitRouteRevealStart()
  await revealRouteCurtain()
})

export default router
