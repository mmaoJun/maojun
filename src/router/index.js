import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'

import Musics from '../components/musics.vue'
import Pictures from '../components/pictures.vue'
import About from '../components/about.vue'
import Movies from '../components/movies.vue'
import { coverRouteCurtain, revealRouteCurtain } from '../components/ui/routeCurtainController'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/musics', component: Musics },
    { path: '/pictures', component: Pictures },
    { path: '/about', component: About },
    { path: '/movies', component: Movies },
  ],
})

let isFirstNavigation = true

router.beforeEach(async (to, from, next) => {
  if (isFirstNavigation) {
    next()
    return
  }

  await coverRouteCurtain()
  next()
})

router.afterEach(async () => {
  await nextTick()
  if (isFirstNavigation) {
    isFirstNavigation = false
    return
  }
  await revealRouteCurtain()
})

export default router
