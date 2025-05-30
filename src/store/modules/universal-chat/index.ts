import { defineStore } from 'pinia'
interface Info {
  id?: string
  controlType?: number
  name?: string
  logo?: string
  description?: string
  sortNo?: number
  isActive?: boolean
  roleDesc?: string
  prologue?: string
  guideProblemList?: string[]
  modelId?: string
  versionNo?: string
  status?: number
  knowledgeEntities?: any[]
}
interface UniversalChatStore {
  userId: string // 用户id
  visitKey: string // 访问key
  errorMsg: string // 错误信息
  // 基础信息
  baseInfo: Info
  sessionId: string // 会话id
  wxUserInfo: any // 企业微信用户信息
  wxState: string // 企业微信回调状态码
  keyChatHistoryList: {
    [key: string]: any[]
  } // 通过key查询的聊天历史记录
}
const useUniversalChatStore = defineStore('universalChat', {
  state: (): UniversalChatStore => ({
    userId: '',
    visitKey: '',
    errorMsg: '',
    baseInfo: {
      id: '',
      controlType: 1,
      isActive: true,
      description: '',
      logo: '',
      name: '',
      guideProblemList: [],
      modelId: '',
      versionNo: '',
      status: 0,
      knowledgeEntities: []
    },
    sessionId: '',
    keyChatHistoryList: {},
    wxUserInfo: {},
    wxState: ''
  }),
  getters: {},
  persist: true,
  actions: {
    updateChatData(data: Partial<UniversalChatStore>) {
      this.$patch(data)
    },
    reset() {
      this.$reset()
    }
  }
})

export default useUniversalChatStore
