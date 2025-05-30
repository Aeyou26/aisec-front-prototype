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
    setUserInfo(userInfo: UserState) {
      this.userId = userInfo.userId
      this.account = userInfo.account
      this.realName = userInfo.realName
      this.phone = userInfo.phone
      this.avatar = userInfo.avatar
      this.roleId = userInfo.roleId
      this.roleName = userInfo.roleName
      this.companyId = userInfo.companyId
      this.companyName = userInfo.companyName
      this.permissionList = userInfo.permissionList
    },
    setRobotList(robotList: any) {
      this.robotList = robotList
    },
    setPermissionList(permissionList: any) {
      this.permissionList = permissionList
    },

    // Logout
    async logout() {
      const res = await request
        .Get('/auth/logout')
        .send(true)
        .then((res: any) => {
          if (res && res.code === 1) {
            removeRouteListener()
            this.reset()
            return true
          }
          Message.error('登出失败')
          return false
        })
      return res
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
    }
  }
})

export default useUserStore
