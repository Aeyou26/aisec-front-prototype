<template>
  <div class="w-full h-full flex flex-col items-center relative">
    <div v-if="isMobile" class="h-54 px-20 box-border w-full flex items-center justify-between">
      <div class="color-#3177C7 font-600 text-18">{{ universalChatStore.baseInfo.name }}</div>
      <component :is="useIcon('universalChat-icon', { size: 20 })" @click="showHistory = true" />
    </div>
    <!-- 移动端历史记录 -->
    <a-drawer :width="280" :visible="showHistory" placement="left" :footer="false" :header="false" :closable="false" unmount-on-close @cancel="showHistory = false">
      <ChatHistory />
    </a-drawer>

    <div class="w-full h-100% flex flex-col items-center justify-center" :style="{ height: isMobile ? 'calc(100% - 54px)' : '100%' }">
      <!-- 消息列表区域 -->
      <message-list
        ref="messageListRef"
        :list="list"
        :chat-loading="chatLoading"
        :current-message-id="currentMessageId"
        :quick-options="quickOptions"
        :sug-loading="sugLoading"
        @action="handleAction"
        @quick-option="handleQuickOption"
        @load-more="handleLoadMore"
        @render-mermaid="renderMermaid"
      />
      <!-- 输入框区域 -->
      <chat-input
        v-model="inputMessage"
        :chat-file-list="chatFileList"
        :disable-send-message="disableSendMessage"
        :chat-loading="chatLoading"
        :current-message-id="currentMessageId"
        :session-id="params.sessionId"
        @send="sendMessage"
        @tool="handleTool"
        @close-file="handleCloseFile"
      />
    </div>
    <upload-file-modal ref="uploadFileModalRef" @upload-file="handleUploadFile" />
  </div>
</template>

<script setup lang="ts">
import request from '@/request'
import uploadFileModal from './upload-file-modal.vue'
import useChatLoad from './useChatLoad'
import { renderMarkdown, renderMermaid } from '@/utils/md-convert-html'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'
import MessageList from './message-list.vue'
import ChatInput from './chat-input.vue'
import useIcon from '@/hooks/useIcon'
import ChatHistory from './chat-history.vue'
import { generateUniqueId } from '@/utils/generateId'
import { useUniversalChatStore } from '@/store'

const chatStore = useChatStore()
const universalChatStore = useUniversalChatStore()
const chatLoading = computed(() => chatStore.showHandleRobot)
const currentMessageId = computed(() => chatStore.currentMessageId)

// 是否是移动端
const isMobile = inject('isMobile')

const showHistory = ref(false)

// 定义事件
const emit = defineEmits(['updateChatHistoryList'])

interface ChatMessage {
  id: number | string
  role: 'user' | 'assistant'
  content: string
  thinkContent?: string
  contentHtml: string
  thinkContentHtml?: string
  actions?: string[]
  files?: any[]
}

interface Tool {
  id: string
  type: string
  tip: string
}

// 消息容器的引用
const messageContainer = ref<HTMLElement>()
const disableSendMessage = ref(false)
const uploadFileModalRef = ref<InstanceType<typeof uploadFileModal>>()
const chatFileList = ref<any[]>([])
const isNewSession = ref(true)
// 快捷选项
const quickOptions = ref<string[]>([])

const welcomeMessage = computed(() => {
  return universalChatStore.baseInfo.prologue || '你好，有什么可以帮你？'
})

const params = reactive<any>({
  robotId: universalChatStore.visitKey,
  userId: universalChatStore.userId,
  sessionId: ''
})
const {
  list,
  noStreamMessage,
  load,
  sendMessage: sendMessageFun,
  updateList,
  close,
  reset: resetMessageList
} = useChatLoad(
  (p: any) => request.Post('/app/chat/records', p),
  params,
  () => {
    if (!chatStore.currentMessageId) {
      renderMermaid()
      const lastMessage = list.value[list.value.length - 1]
      if (lastMessage.messageId) {
        getSuggestions(lastMessage.messageId)
      }
    }
    nextTick(() => {
      scrollToBottom()
    })
  }
)
const sugLoading = ref(false)
// 获取建议
const getSuggestions = (id: string) => {
  // sugLoading.value = true
  // quickOptions.value = []
  // nextTick(() => {
  //   scrollToBottom()
  // })
  // request
  //   .Get<any>(`/user/chat/sug/${id}`)
  //   .then((res) => {
  //     // 存在建议 且 当前没有正在回答的消息
  //     if (res.data && !chatStore.currentMessageId) {
  //       quickOptions.value = res.data
  //     }
  //   })
  //   .finally(() => {
  //     sugLoading.value = false
  //   })
}

// 消息列表引用
const messageListRef = ref<InstanceType<typeof MessageList>>()

// 滚动到底部方法
const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollToBottom()
  }
}
// 监听消息列表变化，自动滚动到底部
watch(
  [() => list.value.length, quickOptions, () => chatStore.currentInfo.abilityId],
  () => {
    nextTick(() => {
      scrollToBottom()
    })
    if (list.value.length === 0) {
      updateList([
        {
          id: 1,
          role: 'assistant',
          content: welcomeMessage.value,
          contentHtml: welcomeMessage.value,
          isTip: true
        }
      ])
      quickOptions.value = universalChatStore.baseInfo.guideProblemList || []
    }
    // 如果只有一条消息且是欢迎消息，则设置快捷选项
    if (list.value.length === 1 && list.value[0].content === welcomeMessage.value) {
      quickOptions.value = universalChatStore.baseInfo.guideProblemList || []
    }
  },
  { deep: true, immediate: true }
)

const handleUploadFile = (files: any[]) => {
  chatFileList.value = [...chatFileList.value, ...files]
}

const handleCloseFile = (file: any) => {
  if (file.type === 'file') {
    request
      .Delete('/common/delete', {
        bucket: 'aisec-file',
        fileName: file.name
      })
      .then(() => {
        chatFileList.value = chatFileList.value.filter((item) => item.uid !== file.uid)
      })
  } else {
    chatFileList.value = chatFileList.value.filter((item) => item.uid !== file.uid)
  }
}

// 输入框内容
const inputMessage = ref('')

// 处理快捷选项点击
const handleQuickOption = (option: string) => {
  inputMessage.value = option
  sendMessage()
}

// 处理工具栏点击
const handleTool = (tool: Tool) => {
  if (disableSendMessage.value || chatLoading.value || currentMessageId.value) {
    Message.warning('请等待上一次消息完成，请稍后...')
    return
  }
  console.log('工具点击：', tool)
  const file = document.createElement('input')
  switch (tool.type) {
    case 'image':
      // 图片上传 直接弹出系统图片选择
      file.type = 'file'
      file.accept = 'image/*'
      file.onchange = (e) => {
        const file = (e.target as HTMLInputElement)?.files?.[0]
        if (file) {
          handleUploadFile([{ uid: Math.random().toString(36).substring(2, 15), name: file.name, file, type: 'img' }])
        }
      }
      file.click()
      break
    case 'folder':
      uploadFileModalRef.value?.openModal()
      break
    default:
      break
  }
}

const delChatItem = (message: any) => {
  request.Delete(`/user/chat/record/${message.messageId}`).send()
  // 目标元素的条件
  const targetIndex = list.value.findIndex((item) => item.id === message.id)
  if (targetIndex !== -1) {
    // 删除前一个元素（如果存在）
    if (targetIndex > 0) {
      list.value.splice(targetIndex - 1, 1)
      // 删了上一条 这条index也会前进 所以还是 -1
      list.value.splice(targetIndex - 1, 1)
    } else {
      // 删除当前元素
      list.value.splice(targetIndex, 1)
    }
  }
}

// 处理操作按钮点击
const handleAction = async (action: number, message: any) => {
  console.log('操作按钮点击：', action)
  const file = new File([message.content], `message-${message.id}.md`, { type: 'text/markdown' })
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  // 获取本次消息的上一条消息
  const targetIndex = list.value.findIndex((item) => item.id === message.id)
  let find = null
  if (targetIndex !== -1 && targetIndex > 0) {
    find = list.value[targetIndex - 1]
  }

  switch (action) {
    case 2:
      // 获取本次消息的用户提问赋值发送
      inputMessage.value = find?.content || ''
      sendMessage()
      // 删除当前的消息及上一条
      delChatItem(message)
      break
    case 4:
      // 下载文件 将message.content中的文本转换为文件下载md格式
      a.href = url
      a.download = `message-${message.id}.md`
      a.click()
      break
    case 5:
      // 删除消息 弹出确认框
      await confirmModal('删除确认', '确认是否删除此消息？')
      delChatItem(message)
      break
    default:
      break
  }
}

// 打字机效果实现
const typeWriter = (text: string, onComplete?: () => void) => {
  disableSendMessage.value = true
  const aiResponse: ChatMessage = {
    id: list.value.length + 1,
    role: 'assistant',
    content: '',
    contentHtml: ''
  }
  updateList([...list.value, aiResponse])

  let currentIndex = 0
  const timer = setInterval(() => {
    if (currentIndex < text.length) {
      // 创建新的消息对象以触发响应式更新
      const newMessage = {
        ...aiResponse,
        content: text.slice(0, currentIndex + 1),
        contentHtml: renderMarkdown(text.slice(0, currentIndex + 1))
      }
      const find = list.value.find((item) => item.id === aiResponse.id)
      if (find) {
        Object.assign(find, newMessage)
      }
      currentIndex++
    } else {
      clearInterval(timer)
      // 打字机效果完成后渲染图表
      renderMermaid()
      onComplete?.()
    }
  }, 30)
}

// 发送消息
const sendMessage = async () => {
  if (chatLoading.value || disableSendMessage.value || currentMessageId.value) {
    Message.warning('请等待上一次消息完成，请稍后...')
    return
  }
  // 如果输入框为空，则不发送消息
  if (!inputMessage.value.trim()) {
    return
  }
  // 如果是新会话且这是用户的第一条消息，则创建会话并更新标题
  if (!universalChatStore.sessionId) {
    const newTitle = inputMessage.value.slice(0, 10) + (inputMessage.value.length > 10 ? '...' : '')
    await createSession(newTitle)
  }
  // const f = chatFileList.value?.filter((item) => item.type === 'file')
  // const files = f?.map((item) => item.name)
  // 清空上传文件列表
  // chatFileList.value = []

  quickOptions.value = []
  chatStore.updateChatData({ showHandleRobot: true })

  const newMessage: ChatMessage = {
    id: list.value.length + 1,
    role: 'user',
    content: inputMessage.value,
    contentHtml: renderMarkdown(inputMessage.value)
    // files: files
  }

  updateList([...list.value, newMessage])

  // 仅在发送消息时设置允许自动滚动为true
  if (messageListRef.value) {
    messageListRef.value.setAllowAutoScroll(true)
    messageListRef.value.scrollToBottom()
  }

  // ws发送消息
  sendMessageFun({
    content: inputMessage.value,
    sessionId: params.sessionId
    // files: files
  })

  inputMessage.value = ''
}

// 监听非流式消息 后续需要处理id等信息做交互
watch(
  () => noStreamMessage.value,
  (newVal) => {
    if (newVal.content) {
      typeWriter(newVal.content, () => {
        console.log('noStreamMessage打字机效果完成')
        quickOptions.value = (newVal?.askList as string[]) || []
        nextTick(() => {
          scrollToBottom()
        })
        disableSendMessage.value = false
      })
    }
  },
  { deep: true }
)
// 创建新会话
const createSession = async (sessionName: any) => {
  // 重置消息窗口
  resetMessageWindow()
  // 前端创建会话id和名字 存储到store中
  const sessionId = generateUniqueId(24)
  const hList = [{ id: sessionId, name: sessionName, updateTime: new Date().getTime() }, ...(universalChatStore.keyChatHistoryList[universalChatStore.visitKey] || [])]
  console.log('hList', {
    ...universalChatStore.keyChatHistoryList,
    [universalChatStore.visitKey]: hList.slice(0, 20)
  })
  // 存储会话信息 更新历史记录
  universalChatStore.updateChatData({
    sessionId: sessionId,
    keyChatHistoryList: {
      ...universalChatStore.keyChatHistoryList,
      [universalChatStore.visitKey]: hList.slice(0, 20)
    }
  })
  params.sessionId = sessionId
  emit('updateChatHistoryList')
}

const resetMessageWindow = () => {
  resetMessageList()
  isNewSession.value = true
  disableSendMessage.value = false
  params.sessionId = ''
  universalChatStore.updateChatData({
    sessionId: ''
  })
  chatStore.updateChatData({
    showHandleRobot: false
  })
}

// 监听会话id 如果更新会话则获取聊天记录 同时获取标题
watch(
  () => universalChatStore.sessionId,
  (_, oldVal) => {
    // 如果当前是新会话，则不获取聊天记录 否则返回会丢失第一句话
    if (isNewSession.value && !oldVal) {
      isNewSession.value = false
      return
    }
    // 清空快捷选项
    quickOptions.value = []
    // 清空消息列表
    list.value = []
    if (!universalChatStore.sessionId) {
      return
    }
    params.sessionId = universalChatStore.sessionId
    quickOptions.value = []
    load(true).then(() => {
      quickOptions.value = []
    })
  }
)

watch(
  () => chatStore.lastNewSessionTime,
  (newVal) => {
    if (newVal) {
      resetMessageWindow()
    }
  }
)

// 处理加载更多
const handleLoadMore = ({ oldScrollHeight, scrollTop }: { oldScrollHeight: number; scrollTop: number }) => {
  quickOptions.value = []
  load()
    .then((res) => {
      // 在新消息加载后，计算新增的高度并调整滚动位置
      nextTick(() => {
        if (messageListRef.value) {
          const newScrollHeight = messageListRef.value.$el.scrollHeight
          const heightDiff = newScrollHeight - oldScrollHeight
          messageListRef.value.$el.scrollTop = heightDiff + scrollTop
        }
      })
    })
    .catch(() => {
      // 加载失败或没有更多数据时的处理
    })
}

onMounted(async () => {
  // 首次加载时滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  // 如果存在sessionId，则更新会话
  if (universalChatStore.sessionId) {
    params.sessionId = universalChatStore.sessionId
    quickOptions.value = []
    load(true).then(() => {
      quickOptions.value = []
    })
  }
  // 清空加载状态
  chatStore.updateChatData({
    showHandleRobot: false
  })
})

onUnmounted(() => {
  close()
})

defineExpose({
  createSession,
  resetMessageWindow
})
</script>
