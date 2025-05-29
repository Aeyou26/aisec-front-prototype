<template>
  <div class="flex flex-col relative w-full px-14%">
    <!-- ['9', '11'].includes(String(chatStore?.currentInfo?.abilityId || '')) -->
    <div v-if="false" class="flex items-center gap-14 pt-20 text-#333333 text-14 font-500">
      <div>对现有资产进行识别:</div>
      <div class="w-[calc(100%-160px)] overflow-x-auto pb-4">
        <a-checkbox-group :default-value="[1]">
          <div class="flex">
            <template v-for="item in 13" :key="item">
              <a-checkbox :value="item">
                <template #checkbox="{ checked }">
                  <a-tooltip :content="`资产 ${item}`">
                    <div
                      class="p-6 flex justify-center items-center text-#2E66C7 rounded-10 bg-#ffffff cursor-pointer border-1 border-solid border-transparent max-w-120"
                      :class="{ '!border-#2E66C7': checked }"
                    >
                      <div class="max-w-full truncate">资产 {{ item }}</div>
                    </div>
                  </a-tooltip>
                </template>
              </a-checkbox>
            </template>
          </div>
        </a-checkbox-group>
      </div>
    </div>
    <!-- 上传文件列表 -->
    <div v-if="chatFileList.length" class="flex justify-start gap-16 pt-10 pb-4 mb-10 rounded-12 bg-#ffffff px-12 py-8 text-14 text-#2E66C7">
      <a-space align="start" class="overflow-x-auto pb-6">
        <a-tag v-for="tag of chatFileList" :key="tag.uid" color="blue" closable @close="handleCloseFile(tag)">
          <template #icon>
            <icon-link v-if="tag.type === 'link'" />
            <icon-file-image v-else-if="tag.type === 'img'" />
            <icon-file v-else />
          </template>
          <a-tooltip :content="tag.name">
            <div class="max-w-60 truncate cursor-pointer">{{ tag.name }}</div>
          </a-tooltip>
        </a-tag>
      </a-space>
    </div>
    <a-spin :loading="voiceTranscriptionLoading" tip="识别中...">
      <div class="w-full bg-#ffffff rounded-20 flex flex-col gap-6 pt-8" style="box-shadow: 0 8px 40px 0 #00266914">
        <textarea
          v-model="inputMessage"
          class="w-full h-52 px-16 text-16 whitespace-pre-wrap resize-none outline-none border-none bg-#ffffff rounded-20 whitespace-pre-wrap overflow-y-auto leading-28"
          :placeholder="isAgent ? agentInfo?.inputPrompt || '在此输入内容，Enter发送，Shift+Enter换行' : '在此输入内容，Enter发送，Shift+Enter换行'"
          @keydown="handleKeyDown"
          @paste="handlePaste"
        ></textarea>
        <div class="w-full flex justify-between items-center gap-12 px-16 pb-8">
          <div class="w-max">
            <a-dropdown @select="handleSelectModel" @popup-visible-change="handleDropdownVisibleChange">
              <div class="flex items-center gap-4 text-14 text-#2E66C7 cursor-pointer select-none">
                <span class="text-14 text-#666666">当前模型：</span>{{ getCurrentModelName }} <icon-up v-if="dropdownVisible" /> <icon-right v-else />
              </div>
              <template #content>
                <a-doption v-for="option in chatModeOptions" :key="option.id" :value="option.id">
                  {{ option.model_name }}
                </a-doption>
              </template>
            </a-dropdown>
          </div>
          <div class="flex items-center gap-12">
            <div v-for="(tool, index) in tools" :key="index" class="cursor-pointer w-24 h-24" @click="handleTool(tool)">
              <a-tooltip :content="tool.tip">
                <component :is="useIcon(tool.type, { size: 24 })" />
              </a-tooltip>
            </div>
            <div class="cursor-pointer w-24 h-24" @click="voiceClick">
              <a-tooltip content="语音输入">
                <VoiceTranscription
                  :robot-id="robotId"
                  :session-id="sessionId"
                  @on-transcription-complete="handleVoiceTranscription"
                  @start-recording="voiceTranscriptionLoading = true"
                  @stop-recording="voiceTranscriptionLoading = false"
                />
              </a-tooltip>
            </div>
            <a-button
              type="primary"
              shape="circle"
              :disabled="disableSendMessage || chatLoading || Boolean(currentMessageId)"
              class="text-white !rounded-full !w-24 !h-24"
              @click="sendMessage"
            >
              <icon-arrow-up size="18" />
            </a-button>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import useIcon from '@/hooks/useIcon'
import { ChatModelType } from '@/store/modules/user/types'
import request from '@/request'
interface Tool {
  id: string
  type: string
  tip: string
}

const props = defineProps<{
  chatFileList: any[]
  disableSendMessage: boolean
  chatLoading: boolean
  currentMessageId: string | number
  currentBotInfo: any
  robotId: string | number
  sessionId: string
}>()

const emit = defineEmits(['send', 'tool', 'voice', 'close-file', 'voice-transcription', 'update:modelValue', 'add-file'])
const chatStore = useChatStore()
const userStore = useUserStore()
const isAgent = computed(() => Boolean(chatStore.currentInfo.abilityId))
const agentInfo = computed(() => {
  const find = chatStore.currentInfo.abilityList?.find((item) => item.id === String(chatStore.currentInfo.abilityId))
  return find
})

const inputMessage = defineModel<string>({ default: '' })
const voiceTranscriptionLoading = ref(false)
const dropdownVisible = ref(false)
const chatModeOptions = computed(() => userStore.chatModelList)

// 获取当前选中的模型名称
const getCurrentModelName = computed(() => {
  return userStore.chatModel?.model_name || '选择模型'
})

// 处理模型选择
const handleSelectModel = (value: string | number | Record<string, any> | undefined) => {
  if (typeof value === 'number') {
    userStore.setChatModel(userStore.chatModelList?.find((option) => option.id === value) as ChatModelType)
  }
}

// 工具栏
const tools = ref<Tool[]>([
  // { id: 'image', type: 'image', tip: '图片' },
  { id: 'folder', type: 'folder', tip: '支持上传文件（最多10个，单个文件大小不超过10MB）' }
  // { id: 'link', type: 'link', tip: '链接' }
])

// 处理工具栏点击
const handleTool = (tool: Tool) => {
  if (props.disableSendMessage || props.chatLoading || props.currentMessageId) {
    Message.warning('请等待上一次消息完成，请稍后...')
    return
  }
  emit('tool', tool)
}

// 处理粘贴事件
const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) {
    return
  }

  let hasFile = false
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.kind === 'file') {
      hasFile = true
      const file = item.getAsFile()
      if (file) {
        e.preventDefault() // 阻止默认粘贴行为
        uploadPastedFile(file)
        break
      }
    }
  }
}

// 上传粘贴的文件
const uploadPastedFile = (file: File) => {
  if (props.disableSendMessage || props.chatLoading || props.currentMessageId) {
    Message.warning('请等待上一次消息完成，请稍后...')
    return
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    Message.error('文件大小不能超过10MB')
    return
  }

  // 创建表单数据
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', 'aisec-file')

  // 显示上传中提示
  const loadingInstance = Message.loading({
    content: '文件上传中...',
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
          type: file.type.startsWith('image/') ? 'img' : 'file'
        }
        emit('add-file', fileInfo)
        Message.success('文件上传成功')
      }
    })
    .catch(() => {
      Message.error('文件上传失败')
    })
    .finally(() => {
      loadingInstance.close()
    })
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  // 检查是否正在使用输入法
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.target instanceof HTMLElement) {
    // 如果当前焦点在输入框上，且不是在输入法编辑状态
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault()
      sendMessage()
    }
  }
}

// 发送消息
const sendMessage = () => {
  if (props.chatLoading || props.disableSendMessage || props.currentMessageId) {
    Message.warning('请等待上一次消息完成，请稍后...')
    return
  }
  // 如果输入框为空，则不发送消息
  if (!inputMessage.value.trim()) {
    return
  }
  emit('send', inputMessage.value)
}

// 语音输入
const voiceClick = () => {
  emit('voice')
}

// 处理文件关闭
const handleCloseFile = (file: any) => {
  emit('close-file', file)
}

// 处理语音转文字
const handleVoiceTranscription = (text: string) => {
  emit('voice-transcription', text)
}

// 处理下拉菜单展开状态变化
const handleDropdownVisibleChange = (visible: boolean) => {
  dropdownVisible.value = visible
}
</script>

<style scoped>
.dropdown-icon-rotate {
  transform: rotate(180deg);
  transition: transform 0.2s;
}
</style>
