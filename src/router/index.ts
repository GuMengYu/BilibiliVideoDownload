// types
import type { App } from 'vue'
import type { RouteLocation, RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

import FourOhFour from '@/pages/errors/FourOhFour.vue'
import Home from '@/pages/HomeView.vue'
import Main from '@/pages/Main.vue'
import Download from '@/pages/DownloadView.vue'
import Setting from '@/pages/setting/Setting.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/download',
    name: 'download',
    component: Download
  },
  {
    path: '/setting',
    name: 'setting',
    component: Setting
  }
]

export function useRouter (app: App) {
  const router = createRouter({
    history: createWebHashHistory(),
    scrollBehavior: (to, from, savedPosition) => savedPosition || ({ x: 0, y: 0 } as any),
    routes: [
      {
        path: '/',
        name: 'Main',
        component: Main,
        children: routes,
        redirect: { path: '/home' }
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'FourOhFour',
        component: FourOhFour
      }
    ]
  })
  // router.beforeEach(({ meta }, from, next) => {
  //   next()
  //   // const logged = store.getters['settings/logged'];
  //   // if (meta.needLogin && !logged) {
  //   //   store.commit('app/showLogin', true);
  //   // } else {

  //   // }
  // })
  // router.afterEach((to, from, failed) => {
  //   console.log(failed)
  // })
  app.use(router)
  return router
}
