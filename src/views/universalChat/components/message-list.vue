<template>
  <div ref="messageContainer" :class="isMobile ? 'px-3%' : 'px-14%'" class="flex-1 overflow-y-auto pb-18 w-full">
    <div class="h-20"></div>
    <div class="flex flex-col gap-28">
      <template v-for="message in showList" :key="`${message.id}-${message.role}`">
        <message-item
          :message="message"
          :current-message-id="currentMessageId"
          :list="showList"
          @action="handleAction"
          @copy="copyText"
          @change-think="changeThink"
          @render-mermaid="renderMermaid"
        />
      </template>
      <div v-if="chatLoading" class="flex gap-20">
        <div class="w-40 h-40 bg-#ffffff rounded-full flex-shrink-0">
          <img v-if="baseInfo.logo" :src="`/api/sys/download?fileName=${baseInfo.logo}`" class="w-40 h-40" />
        </div>
        <div class="w-100">
          <a-spin :loading="true" dot>
            <div class="assistant-message !w-100 !h-48 text-14 leading-28 text-#333333"></div>
          </a-spin>
        </div>
      </div>
      <a-spin v-if="sugLoading" class="ml-60" />
      <!-- 快捷选项 -->
      <div v-if="quickOptions.length" class="flex flex-col gap-8 pl-60 mt-[-20px]">
        <div
          v-for="(option, index) in quickOptions"
          :key="index"
          style="box-shadow: 0 8px 40px 0 #00266914"
          class="bg-#ffffff text-[#333] w-max px-10 py-14 flex items-center gap-10 rounded-10 cursor-pointer hover:bg-[#E5E6EB]"
          @click="$emit('quick-option', option)"
        >
          <div class="max-w-200 truncate">
            {{ option }}
          </div>
          <component :is="useIcon('right-arrow', { size: 16 })" class="cursor-pointer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import useIcon from '@/hooks/useIcon'
import { copyText } from '@/utils/tools'
import MessageItem from './message-item.vue'
import { useUniversalChatStore } from '@/store'

const props = defineProps<{
  list: any[]
  chatLoading: boolean
  currentMessageId: string | number
  quickOptions: string[]
  sugLoading: boolean
}>()
const universalChatStore = useUniversalChatStore()
const baseInfo = computed(() => universalChatStore.baseInfo)
// 是否是移动端
const isMobile = inject('isMobile')

const showList = computed(() => {
  const list = [...props.list]
  if (list.length > 0 && list[1]) {
    if (!list[0].content) {
      list[1].isTip = true
    }
  }
  return list
})
const emit = defineEmits(['action', 'quick-option', 'load-more', 'render-mermaid'])

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
  if (scrollHeight - scrollTop - clientHeight > 100) {
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
