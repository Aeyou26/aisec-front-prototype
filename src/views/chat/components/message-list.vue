<template>
  <div ref="messageContainer" class="flex-1 px-14% overflow-y-auto pb-18 w-full">
    <div class="flex flex-col gap-28">
      <template v-for="message in showList" :key="`${message.id}-${message.role}`">
        <message-item
          :message="message"
          :current-message-id="currentMessageId"
          :robot-info="robotInfo"
          :list="showList"
          @action="handleAction"
          @copy="copyText"
          @change-think="changeThink"
          @render-mermaid="renderMermaid"
          @show-drawer="showDrawer"
        />
      </template>
      <div v-if="chatLoading" class="flex gap-20">
        <div class="w-40 h-40 bg-#ffffff rounded-full flex-shrink-0">
          <component :is="useIcon(`chat-bot-${robotInfo.robotImg}`, { size: 40 })" />
        </div>
        <div class="w-100">
          <a-spin :loading="true" dot>
            <div class="assistant-message !w-100 !h-48 text-14 leading-28 text-#333333"></div>
          </a-spin>
        </div>
      </div>
      <a-spin v-if="sugLoading" class="ml-60" />
      <!-- 快捷选项 -->
      <div v-if="quickOptions.length" class="flex gap-8 pl-60 mt-[-20px]">
        <div
          v-for="(option, index) in quickOptions"
          :key="index"
          style="box-shadow: 0 8px 40px 0 #00266914"
          class="bg-#ffffff text-[#333] w-max px-20 py-14 flex items-center gap-10 rounded-10 cursor-pointer hover:bg-[#E5E6EB]"
          @click="$emit('quick-option', option)"
        >
          {{ option }}
          <component :is="useIcon('right-arrow', { size: 16 })" class="cursor-pointer" />
        </div>
      </div>
    </div>

    <a-drawer width="50%" :visible="visible" :title="drawerObj.title" :footer="false" @cancel="closeDrawer">
      <MdPreview :model-value="drawerObj.content" class="markdown-content" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import useIcon from '@/hooks/useIcon'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { copyText } from '@/utils/tools'
import MessageItem from './message-item.vue'

const props = defineProps<{
  list: any[]
  chatLoading: boolean
  currentMessageId: string | number
  robotInfo: any
  quickOptions: string[]
  sugLoading: boolean
}>()
const showList = computed(() => {
  const list = [...props.list]
  if (list.length > 0) {
    if (!list[0].content) {
      list[1].isTip = true
    }
  }
  list[list.length - 1].isLast = true
  return list
})
const emit = defineEmits(['action', 'quick-option', 'load-more', 'render-mermaid'])

const visible = ref(false)
const drawerObj = reactive({
  title: '',
  content: ''
})

const closeDrawer = () => {
  visible.value = false
  drawerObj.content = ''
}

const showDrawer = (title: string, content: string) => {
  visible.value = true
  drawerObj.title = title
  drawerObj.content = content
}
const messageContainer = ref<HTMLElement>()
const allowAutoScroll = ref(true)

// 滚动到底部方法
const scrollToBottom = () => {
  if (messageContainer.value && allowAutoScroll.value) {
    nextTick(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight
      }
    })
  }
}

// 监听消息列表变化，自动滚动到底部
watch(
  [() => props.list, () => props.chatLoading],
  () => {
    if (allowAutoScroll.value) {
      scrollToBottom()
    }
  },
  { deep: true }
)

// 监听滚动事件
const handleScroll = () => {
  if (!messageContainer.value) {
    return
  }

  const { scrollTop, scrollHeight, clientHeight } = messageContainer.value
  // 如果不在底部，说明用户手动滚动了
  if (scrollHeight - scrollTop - clientHeight > 40) {
    allowAutoScroll.value = false
  }
  // 回到底部时
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    allowAutoScroll.value = true
  }
  // 滚动到顶部时加载更多历史消息
  if (scrollTop < 20) {
    // 记录当前内容高度
    const oldScrollHeight = messageContainer.value.scrollHeight
    emit('load-more', { oldScrollHeight, scrollTop })
  }
}

// 改变思考过程
const changeThink = (message: any) => {
  if (props.currentMessageId === message.id) {
    return
  }
  message.showThink = !message.showThink
}

// 处理操作按钮点击
const handleAction = (action: number, message: any) => {
  emit('action', action, message)
}

// 处理重新渲染图表
const renderMermaid = () => {
  emit('render-mermaid')
}

// 设置允许自动滚动状态
const setAllowAutoScroll = (value: boolean) => {
  allowAutoScroll.value = value
}

onMounted(() => {
  // 首次加载时滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  // 添加滚动事件监听
  messageContainer.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动事件监听
  messageContainer.value?.removeEventListener('scroll', handleScroll)
})

defineExpose({
  scrollToBottom,
  messageContainer,
  allowAutoScroll,
  setAllowAutoScroll
})
</script>
