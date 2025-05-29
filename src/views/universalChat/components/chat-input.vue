<template>
  <div :class="isMobile ? 'px-3%' : 'px-14%'" class="flex flex-col relative w-full">
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
    <!-- 移动端输入框 -->
    <div v-if="isMobile" class="w-full flex items-center">
      <a-spin :loading="voiceTranscriptionLoading" tip="识别中..." class="flex-1">
        <div class="w-full bg-#ffffff rounded-20 flex gap-6 pt-8" style="box-shadow: 0 8px 40px 0 #00266914">
          <textarea
            v-model="inputMessage"
            class="flex-1 h-42 px-16 text-14 whitespace-pre-wrap resize-none outline-none border-none bg-#ffffff rounded-20 whitespace-pre-wrap overflow-y-auto leading-28"
            placeholder="在此输入内容"
            @keydown="handleKeyDown"
          ></textarea>
        </div>
      </a-spin>
      <a-button
        type="primary"
        shape="circle"
        :disabled="disableSendMessage || chatLoading || Boolean(currentMessageId)"
        class="text-white !rounded-full !w-30 !h-30 flex-shrink-0 mr-10 mt-4 ml-12"
        @click="sendMessage"
      >
        <icon-arrow-up size="34" />
      </a-button>
    </div>
    <!-- pc端输入框 -->
    <a-spin v-else :loading="voiceTranscriptionLoading" tip="识别中...">
      <div class="w-full bg-#ffffff rounded-20 flex flex-col gap-6 pt-8" style="box-shadow: 0 8px 40px 0 #00266914">
        <textarea
          v-model="inputMessage"
          class="w-full h-52 px-16 text-16 whitespace-pre-wrap resize-none outline-none border-none bg-#ffffff rounded-20 whitespace-pre-wrap overflow-y-auto leading-28"
          placeholder="在此输入内容，Enter发送，Shift+Enter换行"
          @keydown="handleKeyDown"
        ></textarea>
        <div class="w-full flex justify-end items-center gap-12 px-16 pb-8">
          <div class="flex items-center gap-12">
            <!-- <div v-for="(tool, index) in tools" :key="index" class="cursor-pointer w-24 h-24" @click="handleTool(tool)">
              <a-tooltip :content="tool.tip">
                <component :is="useIcon(tool.type, { size: 24 })" />
              </a-tooltip>
            </div> -->
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

// 是否是移动端
const isMobile = inject('isMobile')

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
}>()

const emit = defineEmits(['send', 'tool', 'close-file', 'update:modelValue', 'add-file'])

const inputMessage = defineModel<string>({ default: '' })
const voiceTranscriptionLoading = ref(false)

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

// 处理文件关闭
const handleCloseFile = (file: any) => {
  emit('close-file', file)
}
</script>
