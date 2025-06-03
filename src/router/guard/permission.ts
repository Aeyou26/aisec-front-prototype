import NProgress from 'nprogress' // progress bar
import type { LocationQueryRaw, Router } from 'vue-router'

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    
    // 原型模式：检查是否是原型模式
    const isPrototypeMode = localStorage.getItem('prototype-mode') === 'true'
    
    if (isPrototypeMode) {
      // 原型模式下，强制阻止跳转到登录页面
      if (to.name === 'Login' || to.name === 'Login2' || to.path.includes('/login')) {
        next({ name: 'Home' })
        NProgress.done()
        return
      }
      
      const userStore = useUserStore()
      const chatStore = useChatStore()
      
      // 确保用户始终处于登录状态
      if (!userStore.isLogin) {
        // 强制设置用户登录状态
        userStore.$patch((state) => {
          state.isLogin = true
          state.token = 'demo-token-123456'
          state.userId = 'demo-user'
          state.account = 'demo'
          state.realName = '演示用户'
          state.phone = '13800138000'
          state.roleId = 'admin'
          state.roleName = '管理员'
          state.companyId = 'demo-company'
          state.companyName = '演示公司'
          state.permissionList = ['1', '2', '3', '4', '5', '6', 'admin', 'superAdmin']
          state.robotList = [
            { id: '1', name: '安全助手', avatar: 'aq' },
            { id: '2', name: '漏洞分析师', avatar: 'hg' },
            { id: '3', name: '资产管家', avatar: 'zc' },
            { id: '4', name: '威胁猎手', avatar: 'jqg' },
            { id: '5', name: '报告专家', avatar: 'sj' },
            { id: '6', name: '合规顾问', avatar: 'yw' }
          ]
        })
        
        // 设置默认聊天机器人
        if (!chatStore.currentInfo?.id) {
          chatStore.updateChatData({
            currentInfo: {
              id: '1',
              name: '安全助手',
              avatar: 'aq',
              robotId: '1',
              robotName: '安全助手',
              robotImg: '',
              abilityId: ''
            }
          })
        }
      }
      
      // 原型模式下允许访问所有路由
      next()
      NProgress.done()
      return
    }
    
    // 非原型模式下的原始逻辑（保留以备后用）
    const userStore = useUserStore()
    const chatStore = useChatStore()
    
    // 自动设置默认用户状态
    if (!userStore.isLogin) {
      // 直接设置登录状态和用户信息
      userStore.$patch((state) => {
        state.isLogin = true
        state.token = 'demo-token-123456'
        state.userId = 'demo-user'
        state.account = 'demo'
        state.realName = '演示用户'
        state.phone = '13800138000'
        state.roleId = 'admin'
        state.roleName = '管理员'
        state.companyId = 'demo-company'
        state.companyName = '演示公司'
        state.permissionList = ['1', '2', '3', '4', '5', '6', 'admin', 'superAdmin']
        state.robotList = [
          { id: '1', name: '安全助手', avatar: 'aq' },
          { id: '2', name: '漏洞分析师', avatar: 'hg' },
          { id: '3', name: '资产管家', avatar: 'zc' },
          { id: '4', name: '威胁猎手', avatar: 'jqg' },
          { id: '5', name: '报告专家', avatar: 'sj' },
          { id: '6', name: '合规顾问', avatar: 'yw' }
        ]
      })
      
      // 设置默认聊天机器人
      chatStore.updateChatData({
        currentInfo: {
          id: '1',
          name: '安全助手',
          avatar: 'aq',
          robotId: '1',
          robotName: '安全助手',
          robotImg: '',
          abilityId: ''
        }
      })
      
      // 保存token到localStorage
      localStorage.setItem('token', 'demo-token-123456')
    }
    
    // 对于任何可能的登录相关路由，都重定向到首页
    if (to.name === 'Login' || to.name === 'Login2') {
      next({ name: 'Home' })
      NProgress.done()
      return
    }
    
    // 允许访问所有其他路由
    next()
    NProgress.done()
  })
}
