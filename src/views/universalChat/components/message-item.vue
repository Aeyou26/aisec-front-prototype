<template>
  <!-- 用户消息 -->
  <div v-if="message.role !== 'assistant' && message.content" class="flex gap-12 justify-end items-end group">
    <div class="flex pb-14 gap-24 opacity-0 h-0 group-hover:opacity-100 group-hover:h-24 group-hover:mt-14">
      <component :is="useIcon('copy', { size: 24 })" class="cursor-pointer" @click="emit('copy', message.content)" />
    </div>
    <div class="max-w-75%">
      <div class="user-message text-14 leading-28 text-white whitespace-pre-wrap">
        <div v-safe-html="message.content" class="flex flex-col gap-12"></div>
        <!-- 用户发送文件列表 -->
        <div v-if="message.files?.length" class="flex flex-wrap gap-12 mt-12">
          <a-tooltip v-for="(file, index) of message.files" :key="index" :content="file">
            <a-tag color="blue">
              <template #icon>
                <icon-file />
              </template>
              <div class="max-w-60 truncate cursor-pointer">{{ file }}</div>
            </a-tag>
          </a-tooltip>
        </div>
      </div>
    </div>
  </div>
  <!-- AI消息 -->
  <div v-else-if="message.content || message.thinkContent" class="flex gap-20">
    <div class="w-40 h-40 bg-#ffffff rounded-full flex-shrink-0">
      <img v-if="baseInfo.logo" :src="`/api/sys/download?fileName=${baseInfo.logo}`" class="w-40 h-40" />
      <component :is="useIcon('chat-bot-sj', { size: 40 })" v-else />
    </div>
    <div class="max-w-70% min-w-50%">
      <div class="assistant-message text-14 leading-28 text-#333333">
        <!-- 思考过程模块 -->
        <div v-if="message.thinkContent" class="think-process mb-12">
          <div class="flex items-center gap-8 cursor-pointer w-max bg-#f5f5f5 mb-12 py-6 px-12 rounded-8 hover:bg-#e5e6eb" @click="emit('change-think', message)">
            <icon-loading v-if="currentMessageId === message.messageId" />
            <icon-down v-else-if="message.showThink" />
            <icon-right v-else />
            <span class="text-#666666">{{ currentMessageId === message.messageId ? '思考中...' : '思考过程' }}</span>
          </div>
          <div v-show="message.showThink" class="think-content border-0 border-l-2 border-solid border-#2e66c7 px-12 pb-12">
            <div v-safe-html="message.thinkContentHtml" class="markdown-content"></div>
          </div>
        </div>
        <MdPreview :model-value="message.content" class="markdown-content" />
        <!-- <div v-safe-html="message.contentHtml" class="markdown-content"></div> -->
        <div v-if="message?.isReport" class="flex justify-between mt-20">
          <a-alert type="info">
            <div class="flex justify-between w-full items-center">
              <span class="text-14 text-#666666">报告生成状态请前往报告管理查看</span>
              <a-link @click="goReport">前往</a-link>
            </div>
          </a-alert>
        </div>
        <div v-if="currentMessageId !== message.messageId && !message.isTip" class="flex justify-between mt-20">
          <div v-if="currentMessageId !== message.messageId && !message.isTip" class="flex gap-16">
            <a-tooltip content="复制">
              <component :is="useIcon('copy', { size: 18 })" class="cursor-pointer" @click="emit('copy', message.content)" />
            </a-tooltip>
            <a-tooltip content="点赞">
              <component :is="useIcon('green-like', { size: 18 })" class="cursor-pointer" @click="setLike(message.messageId, 1)" />
            </a-tooltip>
            <a-tooltip content="踩">
              <component :is="useIcon('red-dislike', { size: 18 })" class="cursor-pointer" @click="setLike(message.messageId, 2)" />
            </a-tooltip>
            <!-- <a-tooltip content="重新回答">
              <component
                :is="useIcon('refresh', { size: 18 })"
                v-if="isLastMessage && currentMessageId !== message.messageId"
                class="cursor-pointer"
                @click="emit('action', 2, message)"
              />
            </a-tooltip>
            <a-tooltip content="下载回答">
              <component :is="useIcon('down', { size: 18 })" class="cursor-pointer" @click="emit('action', 4, message)" />
            </a-tooltip>
            <a-tooltip content="删除">
              <component :is="useIcon('del', { size: 18 })" class="cursor-pointer" @click="emit('action', 5, message)" />
            </a-tooltip> -->
          </div>
          <!-- 重新渲染图表 -->
          <!-- <a-tooltip content="若图表渲染异常,请点击重新渲染图表">
            <component :is="useIcon('refresh-echart', { size: 24 })" v-if="message.content?.includes('mermaid')" class="cursor-pointer" @click="emit('render-mermaid')" />
          </a-tooltip> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useIcon from '@/hooks/useIcon'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import request from '@/request'
import { useUniversalChatStore } from '@/store'
import { Message as ArcoMessage } from '@arco-design/web-vue'

interface Message {
  id: number | string
  role: 'user' | 'assistant'
  content: string
  contentHtml: string
  thinkContent?: string
  thinkContentHtml?: string
  files?: string[]
  messageId?: string | number
  showThink?: boolean
  isTip?: boolean
  isReport?: boolean
}

const props = defineProps<{
  message: Message
  currentMessageId: string | number
  list: Message[]
}>()

const universalChatStore = useUniversalChatStore()
const baseInfo = computed(() => universalChatStore.baseInfo)

const router = useRouter()

const goReport = () => {
  router.push({
    path: '/report'
  })
}

const setLike = (messageId: any, likeStatus: number) => {
  request
    .Post('/app/chat/like', {
      messageId,
      likeStatus
    })
    .then(() => {
      ArcoMessage.success(likeStatus === 1 ? '点赞成功' : '踩成功')
    })
}

const emit = defineEmits<{
  (e: 'action', action: number, message: Message): void
  (e: 'copy', content: string): void
  (e: 'change-think', message: Message): void
  (e: 'render-mermaid'): void
}>()

// 检查是否是最后一条消息
const isLastMessage = computed(() => {
  return props.list?.length > 0 && props.message.messageId === props.list[props.list.length - 1].messageId
})
</script>

<style scoped lang="less">
.user-message {
  border-radius: 10px 0 10px 10px;
  background: linear-gradient(180deg, #2e66c7 0%, #4c7ed5 100%);
  box-shadow: 0 8px 40px 0 #00266914;
  padding: 6px 12px;
  word-break: break-all;

  :deep(a) {
    color: deepskyblue;
    text-decoration: underline;

    &:hover {
      color: #fff;
      text-decoration: none;
    }
  }
}

.assistant-message {
  border-radius: 0 10px 10px;
  background: #fff;
  box-shadow: 0 8px 40px 0 #00266914;
  padding: 14px 16px;
  word-break: break-all;

  .think-process {
    transition: all 0.3s;
  }

  .think-content {
    .markdown-content {
      :deep(p) {
        color: #8b8b8b;
      }
    }
  }

  .markdown-content {
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    font-size: 14px;
    line-height: 1.6;
    color: #374151;

    :deep(.mermaid) {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 12px;
      margin: 20px 0;
      text-align: center;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e5e7eb;

      svg {
        max-width: 100%;
        height: auto;
        margin: 0 auto;
      }
    }

    :deep(h1) {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #111827;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }

    :deep(h2) {
      font-size: 24px;
      font-weight: 600;
      margin: 12px 0;
      color: #111827;
    }

    :deep(h3) {
      font-size: 20px;
      font-weight: 600;
      margin: 20px 0 14px;
      color: #111827;
    }

    :deep(h4) {
      font-size: 18px;
      font-weight: 600;
      margin: 18px 0 12px;
      color: #111827;
    }

    :deep(p) {
      line-height: 1.8;
      color: #374151;
      font-size: 14px;
    }

    :deep(ul, ol) {
      padding-left: 28px;
      margin: 16px 0;
    }

    :deep(li) {
      position: relative;
      list-style: none;
      margin: 8px 0;
      padding-left: 20px;
      color: #374151;
      line-height: 1.8;

      &::before {
        position: absolute;
        left: 0;
        color: #2e66c7;
      }
    }

    :deep(ul > li::before) {
      content: '•';
      font-size: 16px;
      top: -1px;
    }

    :deep(ol) {
      padding-left: 4px;
      counter-reset: item;
    }

    :deep(ol > li::before) {
      content: counter(item) '.';
      counter-increment: item;
      font-size: 14px;
      top: 0;
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    :deep(th) {
      background: #f9fafb;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #111827;
      border-bottom: 1px solid #e5e7eb;
    }

    :deep(td) {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      color: #374151;
    }

    :deep(tr:last-child td) {
      border-bottom: none;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px 0;
    }

    :deep(pre) {
      background: #f1f6fe;
    }

    :deep(code) {
      font-family: 'JetBrains Mono', Consolas, Monaco, 'Andale Mono', monospace;
      font-size: 13px;
      padding: 2px 6px;
      border-radius: 4px;
      color: #2563eb;
      margin: 0 2px;
    }

    :deep(pre code) {
      background: none;
      color: #374151;
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
    }

    :deep(blockquote) {
      border-left: 4px solid #2e66c7;
      padding: 12px 16px;
      margin: 16px 0;
      background: #f9fafb;
      border-radius: 0 8px 8px 0;
      color: #4b5563;
      font-style: italic;
    }

    :deep(strong) {
      font-weight: 600;
      color: #111827;
    }

    :deep(a) {
      color: #2563eb;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;

      &:hover {
        border-bottom-color: #2563eb;
      }
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 24px 0;
    }

    :deep(.hljs) {
      color: #374151;
      padding: 0;
      border-radius: 4px;
    }
  }
}
</style>
