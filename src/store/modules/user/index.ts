import request from '@/request'
import { removeRouteListener } from '@/utils/route-listener'
import { Message } from '@arco-design/web-vue'
import { defineStore } from 'pinia'
import { UserState, ChatModelType } from './types'

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLogin: false,
    token: '',
    userId: '',
    account: '',
    realName: '',
    phone: '',
    avatar: '',
    roleId: '',
    roleName: '',
    companyId: '',
    companyName: '',
    publicKey: '',
    permissionList: [],
    robotList: [],
    show3D: false,
    enterpriseInfo: {
      name: '',
      logo: '',
      icon: ''
    },
    chatModelList: [],
    chatModel: {
      model_name: '',
      function_name: '',
      max_len_input: '',
      id: void 0,
      url: '',
      key: ''
    }
  }),
  persist: true,
  getters: {
    userInfo(state: UserState): UserState {
      return { ...state }
    }
  },

  actions: {
    toggleLoginStatus(status: boolean) {
      this.isLogin = status
    },
    toggle3D(status: boolean) {
      this.show3D = status
    },
    setEnterpriseInfo(enterpriseInfo: any) {
      this.enterpriseInfo = enterpriseInfo
    },
    setPublicKey(publicKey: string) {
      this.publicKey = publicKey
    },
    setChatModel(chatModel: ChatModelType) {
      this.chatModel = chatModel
    },
    setChatModelList(chatModelList: ChatModelType[]) {
      this.chatModelList = chatModelList
    },
    setUserInfo(userInfo: any) {
      this.userId = userInfo.userId || userInfo.id || this.userId
      this.account = userInfo.account || userInfo.name || this.account
      this.realName = userInfo.realName || userInfo.name || this.realName
      this.phone = userInfo.phone || this.phone
      this.avatar = userInfo.avatar || this.avatar
      this.roleId = userInfo.roleId || this.roleId
      this.roleName = userInfo.roleName || this.roleName
      this.companyId = userInfo.companyId || this.companyId
      this.companyName = userInfo.companyName || this.companyName
      this.permissionList = userInfo.permissionList || this.permissionList
      this.token = userInfo.token || this.token
      
      if (userInfo.token || userInfo.id) {
        this.isLogin = true
        if (userInfo.token) {
          localStorage.setItem('token', userInfo.token)
        }
      }
    },
    setRobotList(robotList: any) {
      this.robotList = robotList
    },
    setPermissionList(permissionList: any) {
      this.permissionList = permissionList
    },
    
    initDefaultUser() {
      if (!this.isLogin) {
        this.setUserInfo({
          id: 'demo-user',
          name: '演示用户',
          token: 'demo-token-123456',
          account: 'demo',
          realName: '演示用户',
          phone: '13800138000',
          roleId: 'admin',
          roleName: '管理员',
          companyId: 'demo-company',
          companyName: '演示公司'
        })
        
        this.setPermissionList(['1', '2', '3', '4', '5', '6', 'admin', 'superAdmin'])
        
        this.setRobotList([
          { id: '1', name: '安全助手', avatar: 'aq' },
          { id: '2', name: '漏洞分析师', avatar: 'hg' },
          { id: '3', name: '资产管家', avatar: 'zc' },
          { id: '4', name: '威胁猎手', avatar: 'jqg' },
          { id: '5', name: '报告专家', avatar: 'sj' },
          { id: '6', name: '合规顾问', avatar: 'yw' }
        ])
        
        this.setEnterpriseInfo({
          name: 'AI安全管理系统',
          logo: '',
          icon: ''
        })
      }
    },

    async logout() {
      try {
        const res = await request
          .Get('/auth/logout')
          .send(true)
          .then((res: any) => {
            if (res && res.code === 1) {
              removeRouteListener()
              this.reset()
              return true
            }
            removeRouteListener()
            this.reset()
            return true
          })
        return res
      } catch (error) {
        removeRouteListener()
        this.reset()
        return true
      }
    },
    reset() {
      this.isLogin = false
      this.token = ''
      this.userId = ''
      this.account = ''
      this.realName = ''
      this.phone = ''
      this.avatar = ''
      this.roleId = ''
      this.roleName = ''
      this.companyId = ''
      this.companyName = ''
      this.publicKey = ''
      this.permissionList = []
      this.robotList = []
      localStorage.removeItem('token')
    }
  }
})

export default useUserStore
