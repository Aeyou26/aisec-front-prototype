import NProgress from 'nprogress' // progress bar
import type { LocationQueryRaw, Router } from 'vue-router'

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    const { isLogin } = storeToRefs(useUserStore())
    if (isLogin.value) {
      if (to.name !== 'login') {
        next()
      } else {
        next({
          name: 'home'
        })
      }
      NProgress.done()
    } else {
      if (to.name === 'Login') {
        next()
        NProgress.done()
        return
      }
      next({
        name: 'Login',
        query: { redirect: to.fullPath, ...to.query } as LocationQueryRaw
      })
      NProgress.done()
    }
  })
}
