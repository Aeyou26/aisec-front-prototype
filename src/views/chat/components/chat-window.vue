<template>
  <div
    class="w-full h-full flex flex-col items-center relative chat-window-container"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="flex items-center justify-center h-48 gap-12 text-18 text-#333333 font-500">
      <div
        v-if="!isEditTitle"
        class="truncate max-w-300 cursor-pointer hover:text-#2E66C7 hover:border-1 hover:border-solid hover:border-#2E66C7 rounded-6 px-10 py-4"
        @click="activeEditTitle"
      >
        {{ chatTitle }}
      </div>
      <a-input
        v-if="isEditTitle"
        ref="inputEditTitle"
        v-model="chatTitle"
        class="!w-340"
        :max-length="30"
        show-word-limit
        @blur="changeTitle('', true)"
        @keydown.enter="changeTitle()"
      />
    </div>
    <div class="w-full h-[calc(100%-48px)] flex flex-col items-center justify-center">
      <!-- 消息列表区域 -->
      <message-list
        ref="messageListRef"
        :list="list"
        :chat-loading="chatLoading"
        :current-message-id="currentMessageId"
        :robot-info="robotInfo"
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
        :current-bot-info="currentBotInfo"
        :robot-id="params.robotId"
        :session-id="params.sessionId"
        :is-agent="isAgent"
        :agent-info="agentInfo"
        @send="sendMessage"
        @tool="handleTool"
        @voice="voiceClick"
        @close-file="handleCloseFile"
        @add-file="handleAddFile"
        @voice-transcription="handleVoiceTranscription"
      />
    </div>
    <upload-file-modal ref="uploadFileModalRef" @upload-file="handleUploadFile" />
  </div>
</template>

<script setup lang="ts">
import request from '@/request'
import uploadFileModal from './upload-file-modal.vue'
import useChatLoad from './useChatLoad'
import { renderMarkdown, renderMermaid, extractMarkFileInfo } from '@/utils/md-convert-html'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'
import MessageList from './message-list.vue'
import ChatInput from './chat-input.vue'

const chatStore = useChatStore()
const chatLoading = computed(() => chatStore.showHandleRobot)
const currentMessageId = computed(() => chatStore.currentMessageId)

const isAgent = computed(() => Boolean(chatStore.currentInfo.abilityId))
const agentInfo = computed(() => {
  const find = chatStore.currentInfo.abilityList?.find((item) => item.id === String(chatStore.currentInfo.abilityId))
  return find
})
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
  markFileInfo?: any
  files?: any[]
  noticeInfo?: any
}

interface Tool {
  id: string
  type: string
  tip: string
}

// 消息容器的引用
const messageContainer = ref<HTMLElement>()
const chatTitle = ref('新会话')
const isEditTitle = ref(false)
const disableSendMessage = ref(false)
const inputEditTitle = ref<HTMLInputElement>()
const uploadFileModalRef = ref<InstanceType<typeof uploadFileModal>>()
const chatFileList = ref<any[]>([])
const userStore = useUserStore()
const { userId, robotList, realName } = storeToRefs(userStore)
const isNewSession = ref(true)
const robotInfo = computed(() => chatStore.currentInfo)
// 快捷选项
const quickOptions = ref<string[]>([])
const currentBotInfo = computed(() => {
  return robotList?.value?.find((item) => item.id === String(robotInfo.value.robotId)) || {}
})

const welcomeMessage = computed(() => {
  if (isAgent.value) {
    return agentInfo?.value?.prolog?.replace('{realName}', realName?.value || '') || currentBotInfo?.value?.prolog?.replace('{realName}', realName?.value || '')
  }
  return currentBotInfo?.value?.prolog?.replace('{realName}', realName?.value || '')
})

const params = reactive<any>({
  robotId: robotInfo.value.robotId,
  sessionId: '',
  userId: userId?.value
})
const lastSuggestionsId = ref('')
const {
  list,
  noStreamMessage,
  load,
  sendMessage: sendMessageFun,
  updateList,
  connect,
  close,
  reset: resetMessageList
} = useChatLoad(
  (p: any) => request.Post('/user/chat/records', p),
  params,
  () => {
    if (!chatStore.currentMessageId) {
      renderMermaid()
      const lastMessage = list.value[list.value.length - 1]
      if (lastMessage.messageId && lastSuggestionsId.value !== lastMessage.messageId) {
        lastSuggestionsId.value = lastMessage.messageId
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
  sugLoading.value = true
  quickOptions.value = []
  nextTick(() => {
    scrollToBottom()
  })
  request
    .Get<any>(`/user/chat/sug/${id}`)
    .then((res) => {
      // 存在建议 且 当前没有正在回答的消息
      if (res.data && !chatStore.currentMessageId && !chatLoading.value) {
        quickOptions.value = res.data
      }
    })
    .finally(() => {
      sugLoading.value = false
    })
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
    } else if (list.value.length > 0 && chatStore.currentInfo.abilityId) {
      const find = list.value.find((item) => item.isTip)
      if (find) {
        find.content = agentInfo?.value?.prolog || welcomeMessage.value
        find.contentHtml = agentInfo?.value?.prolog || welcomeMessage.value
      }
    }
  },
  { deep: true, immediate: true }
)
const handleUploadFile = (files: any[]) => {
  chatFileList.value = [...chatFileList.value, ...files]
}

// 处理添加文件
const handleAddFile = (file: any) => {
  console.log('添加文件：', file)
  chatFileList.value = [...chatFileList.value, file]
}

const handleCloseFile = (file: any) => {
  request
    .Delete('/common/delete', {
      bucket: 'aisec-file',
      fileName: file.name
    })
    .send(true)
  // 无论后台是否删除成功 都删除文件列表中的文件
  chatFileList.value = chatFileList.value.filter((item) => item.uid !== file.uid)
}

// 输入框内容
const inputMessage = ref('')
const originalTitle = ref('') // 添加一个变量存储原始标题

// 监听会话标题的修改
watch(
  chatStore.chatSessionTitle,
  () => {
    if (chatStore.chatSessionTitle.id === params.sessionId) {
      chatTitle.value = chatStore.chatSessionTitle.name
    }
  },
  { deep: true }
)
// 修改标题
const changeTitle = (title?: string, isBlur?: boolean) => {
  if (!chatTitle.value) {
    Message.warning('会话名称不能为空')
    if (isBlur) {
      chatTitle.value = originalTitle.value // 恢复原始标题值
      isEditTitle.value = false
    }
    return
  }
  if (title) {
    chatTitle.value = title
  }
  isEditTitle.value = false
  // 如果没有改变 则不调用接口
  if (originalTitle.value === chatTitle.value) {
    return
  }
  // 调用接口修改标题
  request
    .Post<any>('/user/chat/createOrUpdate', {
      id: params.sessionId,
      sessionName: chatTitle.value,
      robotId: robotInfo.value.robotId
    })
    .then(() => {
      emit('updateChatHistoryList')
      chatStore.updateChatData({ chatSessionTitle: { id: params.sessionId, name: chatTitle.value, updateTime: new Date().getTime() } })
    })
}

// 激活编辑标题
const activeEditTitle = () => {
  originalTitle.value = chatTitle.value // 保存原始标题
  isEditTitle.value = true
  nextTick(() => {
    inputEditTitle.value?.focus()
  })
}

// 处理快捷选项点击
const handleQuickOption = (option: string) => {
  inputMessage.value = option
  sendMessage()
}

// 语音输入
const voiceClick = () => {
  if (!chatStore.sessionId) {
    createSession({ robotId: params.robotId, sessionName: '语音输入' })
  }
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
    case 'link':
      break
    default:
      break
  }
}

const delChatItem = (message: any) => {
  const lastMessage = list.value[list.value.length - 1]
  // 如果删除最后一条消息 则清空快捷选项
  if (lastMessage.messageId === message.messageId && quickOptions.value.length) {
    quickOptions.value = []
  }
  request.Delete(`/user/chat/record/${message.messageId || message.id}`).send()
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
    case 3:
      // 停止回答
      request
        .Put(`/user/chat/stop?chatRecordId=${message.messageId || message.id}`)
        .send()
        .finally(() => {
          chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
        })
      break
    case 4:
      if (message?.markFileInfo?.reportName) {
        request.Get('/user/check/token').then(() => {
          location.href = `/api/common/download/aisec-file/${message?.markFileInfo?.reportName}`
        })
      } else {
        // 下载文件 将message.content中的文本转换为文件下载md格式
        a.href = url
        a.download = `message-${message.id}.md`
        a.click()
      }
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
const typeWriter = (text: string, onComplete?: (id?: number) => void, id = '', append = false) => {
  disableSendMessage.value = true
  // 提取去除mark_file_info信息
  const { text: filteredText, markFileInfo, noticeInfo } = extractMarkFileInfo(text)
  text = filteredText

  // 找到现有消息
  const idFind = list.value.find((item) => item.id === id)
  // 消息ID，如果是新消息则自动生成，否则使用传入的ID
  const messageId = id || `new-${list.value.length + 1}`

  // 创建新的消息对象
  const aiResponse: ChatMessage = {
    id: messageId,
    role: 'assistant',
    content: '',
    contentHtml: '',
    markFileInfo: markFileInfo || null,
    noticeInfo: noticeInfo || null
  }

  // 如果是追加模式，设置初始内容
  if (idFind && append && typeof idFind.content === 'string') {
    aiResponse.content = idFind.content + '\n'
  }

  if (idFind && append && typeof idFind.contentHtml === 'string') {
    // 在HTML内容中添加换行（使用<br>标签）
    aiResponse.contentHtml = idFind.contentHtml + '<br>'
  }

  if (!idFind) {
    // 如果是新消息，添加到列表
    updateList([...list.value, aiResponse])
  } else if (append) {
    // 如果是追加模式，更新现有消息
    Object.assign(idFind, aiResponse)
  }

  // 确定打字机效果的起始内容
  let currentIndex = 0
  let baseContent = ''
  if (idFind && append && typeof idFind.content === 'string') {
    // 如果是追加模式，在原有内容后添加换行符
    baseContent = idFind.content + '\n'
  }
  const timer = setInterval(() => {
    if (currentIndex < text.length) {
      // 创建新的消息对象以触发响应式更新
      const newContent = baseContent + text.slice(0, currentIndex + 1)
      const newMessage = {
        ...aiResponse,
        content: newContent,
        contentHtml: renderMarkdown(newContent)
      }

      // 重新查找消息，确保引用最新状态
      const find = list.value.find((item) => item.id === messageId)
      if (find) {
        Object.assign(find, newMessage)
      } else {
        console.error('未找到消息:', messageId)
      }
      currentIndex++
    } else {
      clearInterval(timer)
      // 打字机效果完成后渲染图表
      renderMermaid()
      console.log('打字机完成, ID:', messageId, '内容:', baseContent + text)

      const resultId = typeof messageId === 'string' && /^\d+$/.test(messageId) ? parseInt(messageId) : typeof messageId === 'number' ? messageId : -1

      onComplete?.(resultId)
    }
  }, 30)
}

// 存储等待追加的消息队列
const pendingMessages = ref<{ messageId: string; content: string; askList?: string[] }[]>([])
// 正在处理消息的ID
const processingMessageId = ref<string | null>(null)

// 处理队列中的下一条消息
const processNextMessage = () => {
  if (pendingMessages.value.length > 0 && !processingMessageId.value) {
    const nextMessage = pendingMessages.value.shift()
    if (nextMessage) {
      processingMessageId.value = nextMessage.messageId

      // 检查消息列表中是否已存在相同ID的消息，用于决定是否以追加模式处理
      const isAppend = !!list.value.find((item) => item.id === nextMessage.messageId)

      typeWriter(
        nextMessage.content,
        () => {
          // 打字机效果完成
          // 提取mark_file_info信息
          const { markFileInfo, noticeInfo } = extractMarkFileInfo(nextMessage.content)
          // 更新消息内容 - 使用messageId查找
          const find = list.value.find((item) => item.id === nextMessage.messageId)
          if (find) {
            find.markFileInfo = markFileInfo
            find.noticeInfo = noticeInfo
          } else {
            console.log('未找到要更新的消息:', nextMessage.messageId)
          }
          quickOptions.value = (nextMessage.askList as string[]) || []
          nextTick(() => {
            scrollToBottom()
          })

          // 处理完成，设置为null并处理下一条
          processingMessageId.value = null
          disableSendMessage.value = false

          // 检查队列中是否还有消息
          console.log('队列中剩余消息数:', pendingMessages.value.length)

          // 处理队列中的下一条消息
          processNextMessage()
        },
        nextMessage.messageId,
        isAppend
      )
    }
  }
}

// 监听非流式消息 后续需要处理id等信息做交互
watch(
  () => noStreamMessage.value,
  (newVal) => {
    if (newVal.content && newVal.messageId) {
      console.log('收到新消息:', newVal.messageId, '内容:', newVal.content.substring(0, 30))

      // 将消息添加到队列
      pendingMessages.value.push({
        messageId: newVal.messageId as string,
        content: newVal.content,
        askList: newVal.askList as string[]
      })

      // 如果没有正在处理的消息，则开始处理队列
      // 无论新消息和之前的消息是否相隔很长时间，只要messageId相同，都会正确处理
      if (!processingMessageId.value) {
        processNextMessage()
      } else {
        console.log('已有消息正在处理，新消息进入队列:', newVal.messageId)
      }
    }
  },
  { deep: true }
)

// 测试非流式消息
// const testNoStreamMessage = () => {
//   noStreamMessage.value = {
//     content: '1111111',
//     messageId: '1234567890'
//   }
//   setTimeout(() => {
//     noStreamMessage.value = {
//       content: '<notice_info>{"id":1,"noticeName":"dddddddd"}</notice_info>',
//       messageId: '1234567890'
//     }
//   }, 100)
// }
// setTimeout(() => {
//   testNoStreamMessage()
// }, 5000)

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
  if (chatTitle.value === '新会话' && !chatStore.sessionId) {
    const newTitle = inputMessage.value.slice(0, 10) + (inputMessage.value.length > 10 ? '...' : '')
    await createSession({
      robotId: robotInfo.value.robotId,
      sessionName: newTitle
    })
  }

  quickOptions.value = []
  chatStore.updateChatData({ showHandleRobot: true })
  // const f = chatFileList.value?.filter((item) => item.type === 'file')
  const files = chatFileList.value?.map((item) => item.name)
  // 清空上传文件列表
  chatFileList.value = []

  const newMessage: ChatMessage = {
    id: list.value.length + 1,
    role: 'user',
    content: inputMessage.value,
    contentHtml: renderMarkdown(inputMessage.value),
    files: files
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
    sessionId: params.sessionId,
    robotId: robotInfo.value.robotId,
    abilityId: robotInfo.value.abilityId,
    files: files
  })

  inputMessage.value = ''
}

// 创建新会话
const createSession = async (p: any) => {
  // 重置消息窗口
  resetMessageWindow()
  await request.Post<any>('/user/chat/createOrUpdate', { ...p, prolog: welcomeMessage.value }).then((res) => {
    chatTitle.value = p.sessionName
    // 存储会话信息
    chatStore.updateChatData({
      sessionId: res.data.sessionId
    })
    params.sessionId = res.data.sessionId
    // 触发菜单更新列表
    chatStore.updateChatData({ chatSessionTitle: { id: params.sessionId, name: chatTitle.value, updateTime: new Date().getTime() } })
  })
}

const resetMessageWindow = () => {
  resetMessageList()
  isNewSession.value = true
  chatTitle.value = '新会话'
  disableSendMessage.value = false
  chatStore.updateChatData({
    sessionId: '',
    showHandleRobot: false
  })
}

// 监听会话id 如果更新会话则获取聊天记录 同时获取标题
watch(
  () => chatStore.sessionId,
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
    if (!chatStore.sessionId) {
      return
    }
    params.sessionId = chatStore.sessionId

    load(true).then((res) => {
      renderMermaid()
      if (res?.sessionName) {
        chatTitle.value = res.sessionName
      }
    })
  }
)

// 处理建议点击
const handleSuggestionClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('suggestion-item')) {
    const suggestion = target.dataset.suggestion
    if (suggestion) {
      inputMessage.value = suggestion
      sendMessage()
    }
  }
}

const historyChat = (item: any) => {
  list.value = []
  isNewSession.value = false
  chatTitle.value = item.content
  params.sessionId = item.id
  params.robotId = Number(robotInfo.value.robotId)
  chatStore.updateChatData({
    sessionId: item.id,
    showHandleRobot: false
  })
}

// 处理语音转文字
const handleVoiceTranscription = (text: string) => {
  inputMessage.value = text
  // sendMessage()
}
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
  load()
    .then((res) => {
      renderMermaid()
      if (res?.sessionName) {
        chatTitle.value = res.sessionName
      }
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

// 添加拖放相关的响应式变量
const isDragging = ref(false)

// 处理拖动进入
const handleDragOver = (e: DragEvent) => {
  if (disableSendMessage.value || chatLoading.value || currentMessageId.value) {
    // 显示不能上传的标志
    e.dataTransfer!.dropEffect = 'none'
    return
  }

  // 设置可以放置的标志
  e.dataTransfer!.dropEffect = 'copy'

  // 如果没有文件，不显示拖拽提示
  if (!e.dataTransfer?.items?.length) {
    return
  }

  // 检查是否有文件类型的数据
  let hasFiles = false
  for (let i = 0; i < e.dataTransfer.items.length; i++) {
    if (e.dataTransfer.items[i].kind === 'file') {
      hasFiles = true
      break
    }
  }

  if (hasFiles) {
    isDragging.value = true
  }
}

// 处理拖动离开
const handleDragLeave = (e: DragEvent) => {
  // 只在鼠标离开容器时隐藏提示，而不是离开内部元素
  if (e.currentTarget === e.target) {
    isDragging.value = false
  }
}

// 处理文件放置
const handleDrop = (e: DragEvent) => {
  isDragging.value = false

  if (disableSendMessage.value || chatLoading.value || currentMessageId.value) {
    Message.warning('请等待上一次消息完成，请稍后...')
    return
  }

  if (!e.dataTransfer?.files?.length) {
    return
  }

  if (e.dataTransfer.files.length > 1) {
    Message.warning('一次只支持拖动上传一个文件')
    return
  }

  // 只处理第一个文件
  const file = e.dataTransfer.files[0]
  uploadFile(file)
}

// 上传文件的方法，参考chat-input.vue中的uploadPastedFile方法
const uploadFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    Message.error(`文件 ${file.name} 大小超过10MB限制`)
    return
  }

  // 取消类型限制，允许所有类型文件上传

  // 创建表单数据
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', 'aisec-file')

  // 显示上传中提示
  const loadingInstance = Message.loading({
    content: `上传中: ${file.name}`,
    duration: 0
  })

  // 调用上传接口
  request
    .Post('/common/upload/aisec-file', formData)
    .then((res: any) => {
      if (res.code === 1) {
        // 上传成功后，将文件添加到聊天文件列表
        const fileInfo = {
          uid: Math.random().toString(36).substring(2, 15),
          name: res.data,
          file,
          type: file.type.startsWith('image/') ? 'img' : 'file'
        }
        handleAddFile(fileInfo)
        Message.success(`文件 ${file.name} 上传成功`)
      } else {
        Message.error(`文件 ${file.name} 上传失败: ${res.msg || '未知错误'}`)
      }
    })
    .catch(() => {
      Message.error(`文件 ${file.name} 上传失败`)
    })
    .finally(() => {
      loadingInstance.close()
    })
}

onMounted(async () => {
  // 首次加载时滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  // 如果存在sessionId，则更新会话
  if (chatStore.sessionId) {
    params.sessionId = chatStore.sessionId
    params.robotId = Number(robotInfo.value.robotId)
    load(true).then((res) => {
      renderMermaid()
      if (res?.sessionName) {
        chatTitle.value = res.sessionName
      }
    })
  }
  connect()
  // 清空加载状态
  chatStore.updateChatData({
    showHandleRobot: false
  })
})

onUnmounted(() => {
  close()
  // 移除事件监听
  messageContainer.value?.removeEventListener('click', handleSuggestionClick)
})

defineExpose({
  createSession,
  changeTitle,
  historyChat,
  resetMessageWindow
})
</script>

<style scoped>
.chat-window-container {
  position: relative;
}

/* 确保拖放覆盖层不阻止用户与内容的交互，只在实际拖放时显示 */
.chat-window-container .absolute {
  pointer-events: none;
}

/* 确保拖放覆盖层内的元素可以点击 */
.chat-window-container .absolute .bg-white {
  pointer-events: auto;
}
</style>
