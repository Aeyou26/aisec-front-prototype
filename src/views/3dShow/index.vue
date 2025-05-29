<template>
  <div class="show-container relative w-full h-full overflow-hidden">
    <!-- 添加返回首页按钮 -->
    <div class="absolute top-4 right-4 z-99 text-white p-12 cursor-pointer" @click="goHome">
      <icon-home color="white" size="20" />
    </div>
    <!-- 底层：Vortex 背景 -->
    <div class="absolute inset-0 z-0">
      <VortexBackground
        background-color="black"
        :range-y="800"
        :particle-count="150"
        :base-hue="120"
        class="flex size-full flex-col items-center justify-center px-2 py-4 md:px-10"
      />
    </div>

    <!-- 中层：Spline 3D 机器人 背景 -->
    <div class="absolute left-0 bottom-0 h-90% w-full z-10 opacity-85 spline-container">
      <ParentSize>
        <template #default="{ width, height }">
          <Spline
            :scene="sceneUrl"
            :style="{
              width: `${width}px`,
              height: `${height}px`,
              display: splineError ? 'none' : 'block'
            }"
            :render-on-demand="false"
            @error="handleSplineError"
            @spline-start="handleSplineStart"
            @spline-mouse-hover="handleSplineMouseHover"
            @spline-mouse-down="handleSplineMouseDown"
            @spline-mouse-up="handleSplineMouseUp"
          />
        </template>
      </ParentSize>
    </div>

    <!-- 中间顶部输入框 -->
    <div class="absolute top-28 left-1/2 transform -translate-x-1/2 z-30 w-34%">
      <a-spin :loading="voiceTranscriptionLoading" tip="识别中..." class="w-full">
        <a-input v-model="inputMessage" :placeholder="welcomeMessage" allow-clear @keydown.enter="sendMessage">
          <template #append>
            <div class="flex items-center gap-8 cursor-pointer">
              <a-tooltip content="语音输入">
                <VoiceTranscription
                  :size="20"
                  :robot-id="robotInfo.robotId"
                  :session-id="chatStore.sessionId"
                  @on-transcription-complete="handleVoiceTranscription"
                  @start-recording="voiceTranscriptionLoading = true"
                  @stop-recording="voiceTranscriptionLoading = false"
                  @click="voiceClick"
                />
              </a-tooltip>
              <a-tooltip content="发送">
                <icon-send color="blue" size="20" @click="sendMessage" />
              </a-tooltip>
            </div>
          </template>
        </a-input>
      </a-spin>
    </div>
    <!-- 中间底部回答区域 -->
    <div v-if="aiContent.content || aiContent.thinkContent || chatLoading" class="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-30 w-34%">
      <GlowBorder
        class="relative flex max-h-500 w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl"
        :color="['#A07CFE', '#FE8FB5', '#FFBE7B']"
      >
        <div ref="messageContainer" class="min-h-38 p-8 w-full max-h-340 overflow-y-auto custom-scrollbar">
          <div v-if="userContent" class="w-full mb-12 flex items-start justify-between">
            <span class="text-#666666">{{ realName }}: {{ userContent }}</span>
            <a-tooltip content="前往聊天记录页面查看更多聊天记录" placement="top">
              <icon-mind-mapping v-if="isAnswerEnd" color="blue" size="20" class="cursor-pointer" @click="goChatRecord" />
            </a-tooltip>
          </div>
          <div v-if="chatLoading" class="w-full h-38 flex items-center justify-center">
            <a-spin :loading="chatLoading" dot></a-spin>
          </div>
          <div v-if="aiContent?.thinkContent" class="think-process mb-12">
            <div class="flex items-center gap-4 cursor-pointer w-max bg-#cccccc mb-12 p-6 rounded-8 hover:bg-#e5e6eb" @click="handleThink">
              <icon-loading v-if="currentMessageId === aiContent.messageId" />
              <icon-down v-else-if="aiContent.showThink" />
              <icon-right v-else />
              <span class="text-#666666">{{ currentMessageId === aiContent.messageId ? '思考中...' : '思考过程' }}</span>
            </div>
            <div v-show="aiContent.showThink" class="think-content border-0 border-l-2 border-solid border-#2e66c7 px-12 pb-12">
              <div v-safe-html="aiContent.thinkContent" class="text-gray-500"></div>
            </div>
          </div>
          <MdPreview :model-value="aiContent?.content || ''" theme="dark" class="markdown-content" />
        </div>
      </GlowBorder>
    </div>

    <!-- 上层：仪表盘组件 -->
    <!-- 左侧仪表盘 -->
    <Dashboard3DCard
      title="资产监控"
      :rotation="0"
      :rotate-y="45"
      :position="{ left: '12%', top: '10%', right: 'auto' }"
      class="cursor-pointer"
      @click="router.push('/dashboard')"
    >
      <StatusMonitor />
    </Dashboard3DCard>
    <Dashboard3DCard
      title="漏洞Top5"
      :rotation="0"
      :rotate-y="45"
      :position="{ left: '5%', top: '53%', right: 'auto' }"
      class="cursor-pointer"
      @click="router.push('/dashboard')"
    >
      <LineGraph />
    </Dashboard3DCard>

    <!-- 右侧仪表盘 -->
    <Dashboard3DCard
      title="知识库"
      :rotation="0"
      :rotate-y="-45"
      :position="{ right: '12%', top: '10%', left: 'auto' }"
      :class="userId && ['888', '999'].includes(userId) ? 'cursor-pointer' : ''"
      @click="goKnowledge"
    >
      <CircleChart />
    </Dashboard3DCard>
    <Dashboard3DCard
      title="日志告警"
      :rotation="0"
      :rotate-y="-45"
      :position="{ right: '5%', top: '53%', left: 'auto' }"
      class="cursor-pointer"
      @click="router.push('/dashboard')"
    >
      <StatGrid />
    </Dashboard3DCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import request from '@/request'
import { useUserStore } from '@/store'
import { useRouter } from 'vue-router'
import ParentSize from '@/components/ParentSize.vue'
import Spline from '@/components/Spline.vue'
import VortexBackground from '@/components/VortexBackground.vue'
import Dashboard3DCard from '@/components/Dashboard3DCard.vue'
import CircleChart from '@/components/dashboards/CircleChart.vue'
import LineGraph from '@/components/dashboards/LineGraph.vue'
import StatGrid from '@/components/dashboards/StatGrid.vue'
import StatusMonitor from '@/components/dashboards/StatusMonitor.vue'
import GlowBorder from '@/components/GlowBorder.vue'
import { Message } from '@arco-design/web-vue'
import useChatLoad from '@/views/chat/components/useChatLoad'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

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
// 使用URL字符串，不要尝试导入二进制文件
const sceneUrl = '/scene.splinecode'
const router = useRouter()
const userStore = useUserStore()
const { userId, realName, robotList } = storeToRefs(userStore)
const chatStore = useChatStore()
const robotInfo = computed(() => chatStore.currentInfo)
const chatLoading = computed(() => chatStore.showHandleRobot)
const currentMessageId = computed(() => chatStore.currentMessageId)
const voiceTranscriptionLoading = ref(false)
const messageContainer = ref<any>(null)
// 是否回答完毕
const isAnswerEnd = ref(false)

const params = reactive<any>({
  robotId: robotInfo.value.robotId,
  sessionId: chatStore.sessionId,
  userId: userId?.value
})
const {
  list,
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
    if (!currentMessageId.value) {
      isAnswerEnd.value = true
    }
    nextTick(() => {
      scrollToBottom()
    })
  }
)
const welcomeMessage = computed(() => {
  return robotInfo?.value?.prolog?.replace('{realName}', realName?.value || '')
})
const scrollToBottom = () => {
  nextTick(() => {
    messageContainer.value?.scrollTo({
      top: messageContainer.value?.scrollHeight,
      behavior: 'smooth'
    })
  })
}
// 输入框内容
const inputMessage = ref('')
const aiContent = computed(() => {
  const lastMessage = list.value[list.value.length - 1]
  if (lastMessage?.role === 'assistant') {
    return lastMessage
  }
  return {
    content: '',
    thinkContent: '',
    thinkContentHtml: '',
    contentHtml: '',
    showThink: false
  }
})
const handleThink = () => {
  aiContent.value.showThink = !aiContent.value.showThink
}
const goKnowledge = () => {
  if (userId?.value && ['888', '999'].includes(userId.value)) {
    router.push('/admin/knowledgeManage/knowledge')
  }
}
const userContent = computed(() => {
  // 从list中取最后一条 如果role是user 则取content 如果不是则取倒数第二条是user的content 如果没有则返回空
  const lastMessage = list.value[list.value.length - 1]
  const beforeMessage = list.value[list.value.length - 2]
  if (lastMessage?.role === 'user') {
    return lastMessage.content
  } else if (beforeMessage?.role === 'user') {
    return beforeMessage.content
  }
  return ''
})
const goChatRecord = () => {
  router.push('/chat')
}
// 创建新会话
const createSession = async (p: any) => {
  await request.Post<any>('/user/chat/createOrUpdate', { ...p, prolog: welcomeMessage.value }).then((res) => {
    // 存储会话信息
    chatStore.updateChatData({
      sessionId: res.data.sessionId
    })
    params.sessionId = res.data.sessionId
  })
}
// 发送消息
const sendMessage = async () => {
  if (currentMessageId.value) {
    Message.warning('请等待上一次消息完成，请稍后...')
    return
  }
  // 如果输入框为空，则不发送消息
  if (!inputMessage.value.trim()) {
    return
  }
  // 如果是新会话且这是用户的第一条消息，则创建会话并更新标题
  if (!chatStore.sessionId) {
    const newTitle = inputMessage.value.slice(0, 10) + (inputMessage.value.length > 10 ? '...' : '')
    await createSession({
      robotId: robotInfo.value.robotId,
      sessionName: newTitle
    })
  }
  chatStore.updateChatData({ showHandleRobot: true })
  const newMessage: ChatMessage = {
    id: list.value.length + 1,
    role: 'user',
    content: inputMessage.value,
    contentHtml: inputMessage.value,
    files: []
  }

  updateList([...list.value, newMessage])

  // ws发送消息
  sendMessageFun({
    content: inputMessage.value,
    sessionId: chatStore.sessionId,
    robotId: robotInfo.value.robotId,
    abilityId: robotInfo.value.abilityId,
    files: []
  })

  inputMessage.value = ''
}
const voiceClick = () => {
  if (!chatStore.sessionId) {
    createSession({ robotId: params.robotId, sessionName: '语音输入' })
  }
}
const handleVoiceTranscription = (text: string) => {
  inputMessage.value = text
  sendMessage()
}

// 处理 Spline 加载错误
const splineError = ref(false)
const handleSplineError = (error: any) => {
  console.error('Spline 加载失败:', error)
  splineError.value = true
}

const handleSplineStart = () => {
  console.log('Spline 场景加载成功')
}
const goHome = () => {
  router.push('/home')
}
// 添加鼠标移动事件处理
const handleSplineMouseHover = (e: any) => {
  console.log('Spline 鼠标悬停事件:', e)
}

const handleSplineMouseDown = (e: any) => {
  console.log('Spline 鼠标按下事件:', e)
}

const handleSplineMouseUp = (e: any) => {
  console.log('Spline 鼠标抬起事件:', e)
}

onMounted(async () => {
  connect()
  // 清空加载状态
  chatStore.updateChatData({
    showHandleRobot: false,
    currentMessageId: ''
  })
  // 获取当前机器人不是网安机器人 则切换到网安机器人
  if (chatStore.currentInfo.id !== '5') {
    const findRobot = robotList?.value?.find((item: any) => item.id === '5')
    if (findRobot) {
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
  }
})

onUnmounted(() => {
  close()
})
</script>
<style lang="less" scoped>
.show-container {
  width: 100vw;
  height: 100vh;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.spline-container {
  pointer-events: auto;
}

.dashboard-container {
  transform-style: preserve-3d;
}

.cockpit-center-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, rgb(0 128 255 / 0%), rgb(0 128 255 / 10%), rgb(0 128 255 / 20%), rgb(0 128 255 / 10%), rgb(0 128 255 / 0%));
  pointer-events: none;
}

.cockpit-horizontal-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  transform: translateY(-50%);
  background: linear-gradient(to right, rgb(0 128 255 / 0%), rgb(0 128 255 / 10%), rgb(0 128 255 / 20%), rgb(0 128 255 / 10%), rgb(0 128 255 / 0%));
  pointer-events: none;
}

:deep(.arco-input-outer-size-medium) {
  border-radius: 18px !important;
  overflow: hidden !important;
  border: none !important;

  .arco-input-wrapper {
    border-radius: 0 !important;
    background-color: #161616 !important;
    border: none !important;
    color: #fff !important;
  }

  .arco-input-append {
    background-color: #16162c !important;
    border-left: none;
  }
}

.custom-scrollbar {
  scrollbar-width: thin !important;
  scrollbar-color: #4b5563 #000 !important;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #000 !important;
    border-radius: 4px !important;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #4b5563 !important;
    border-radius: 4px !important;
    border: 2px solid #000 !important;
  }
}

:deep(.arco-spin-mask) {
  background: #000 !important;

  .arco-spin-mask-icon {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;

    .arco-spin-tip {
      margin-top: 0 !important;
    }
  }
}
</style>
