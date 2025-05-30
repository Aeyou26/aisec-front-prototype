import { defineStore } from 'pinia'

interface Info {
  robotId: string | number
  robotName: string
  robotImg: string
  abilityId?: string | number
  id?: string
  name?: string
  useScene?: string
  prolog?: string
  config?: string
  avatar?: string
  logo?: string
  abilityList?: AbilityList[]
  img?: string
}

interface AbilityList {
  id?: string
  createBy?: string
  updateBy?: string
  createTime?: string
  updateTime?: string
  name?: string
  abilityKey?: string
  useScene?: string
  inputPrompt?: string
  prolog?: string
  abilityType?: number
  abilityParams?: string
  thirdPartyId?: string
  agentId?: string
  status?: number
  icon?: string
  knowledgebaseId?: string
  knowledgebaseName?: string
}
interface ChatState {
  lastNewSessionTime: number // 最后一次新会话时间
  showHistoryRecord: boolean // 是否显示历史记录
  collapsed: boolean
  sendMessage: Record<string, any> | null // 需要发送的消息
  showHandleRobot: boolean // 处理中
  currentMessageId: string // 当前消息id
  inOutput: boolean // 消息输出中
  sessionId: string // 会话id
  agentSessionId: string // 代理会话id
  currentInfo: Info
  chatSessionTitle: { id: string; name: string; updateTime: number }
}
const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    lastNewSessionTime: 0,
    showHistoryRecord: false,
    collapsed: false,
    sendMessage: null,
    showHandleRobot: false,
    currentMessageId: '',
    inOutput: false,
    sessionId: '',
    agentSessionId: '',
    currentInfo: {
      robotId: '',
      robotName: '',
      robotImg: '',
      abilityId: ''
    },
    chatSessionTitle: {
      id: '',
      name: '',
      updateTime: 0
    }
  }),
  getters: {},
  persist: true,
  actions: {
    updateChatData(data: Partial<ChatState>) {
      this.$patch(data)
    },
    reset() {
      this.$reset()
    }
  }
})

export default useChatStore
