import NProgress from 'nprogress' // progress bar
import type { LocationQueryRaw, Router } from 'vue-router'

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    const userStore = useUserStore()
    const chatStore = useChatStore()
    const { isLogin, userId, robotList, permissionList } = storeToRefs(userStore)
    // 用户拥有的机器人id
    const robotIds = robotList?.value?.map((item) => item.id)
    if (isLogin.value) {
      // 如果去的路由包含admin，则判断是否是管理员
      if (to.name?.toString().includes('admin')) {
        const isDev = import.meta.env.VITE_APP_ENV === 'development'
        // 如果去的路由包含admin，则判断是否是管理员账号
        if (['888', '999'].includes(userId?.value || '') || isDev) {
          const permission = userId?.value === '888' || isDev ? 'superAdmin' : 'admin'
          userStore.setPermissionList([permission])
          if (permissionList?.value?.some((item) => to.meta?.permissions?.includes(item))) {
            next()
          } else {
            next({
              name: 'noPower'
            })
          }
        } else {
          next({
            name: 'noPower'
          })
        }
      } else if (to.meta?.permissions?.length) {
        // 如果去的路由在当前权限列表中，则直接放行
        if (permissionList?.value?.some((item) => to.meta?.permissions?.includes(item))) {
          // 如果当前权限列表中不是当前机器人 则切换到当前机器人
          if (!to.meta?.permissions?.includes(chatStore.currentInfo.id || '')) {
            const permission = to.meta?.permissions?.[0]
            const findRobot = robotList?.value?.find((item) => item.id === permission)
            chatStore.updateChatData({
              currentInfo: {
                ...findRobot,
                // 因为原本没这些的时候使用了下面字段 所以需要兼容
                robotId: findRobot?.id,
                robotName: findRobot?.name,
                robotImg: findRobot?.avatar || '',
                abilityId: ''
              }
            })
            next()
          }
          next()
        } else if (robotIds?.some((id) => to.meta?.permissions?.includes(id))) {
          // 如果去的路由包含在用户拥有的机器人id中 则设置权限 更新菜单
          const permission = to.meta?.permissions?.[0]
          if (permission) {
            userStore.setPermissionList([permission])
            const findRobot = robotList?.value?.find((item) => item.id === permission)
            chatStore.updateChatData({
              currentInfo: {
                ...findRobot,
                // 因为原本没这些的时候使用了下面字段 所以需要兼容
                robotId: findRobot?.id,
                robotName: findRobot?.name,
                robotImg: findRobot?.avatar || '',
                abilityId: ''
              }
            })
          }
          next()
        } else {
          next({
            name: 'noPower'
          })
        }
      } else if (to.name !== 'login') {
        next()
      } else {
        next({
          name: 'home'
        })
      }
      NProgress.done()
    } else {
      // 需要放行的页面
      const AllowRelease = ['Login', 'Login2', 'SupplierFeedback', 'UniversalChat']
      if (AllowRelease.includes(to.name as string)) {
        next()
        NProgress.done()
        return
      }
      const name = userStore.show3D ? 'Login2' : 'Login'
      next({
        name,
        query: { redirect: to.fullPath, ...to.query } as LocationQueryRaw
      })
      NProgress.done()
    }
  })
}
