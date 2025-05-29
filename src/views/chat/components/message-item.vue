<template>
  <!-- 用户消息 -->
  <div v-if="message.role !== 'assistant' && message.content" class="flex gap-12 justify-end items-end group">
    <div class="flex pb-14 gap-24 opacity-0 h-0 group-hover:opacity-100 group-hover:h-24 group-hover:mt-14">
      <component :is="useIcon('copy', { size: 24 })" class="cursor-pointer" @click="emit('copy', message.content)" />
    </div>
    <div class="max-w-75%">
      <div class="user-message text-14 leading-28 text-white whitespace-pre-wrap">
        <div class="flex flex-col gap-12">{{ message.content }}</div>
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
  <div v-else-if="message.content || message.thinkContent || message?.markFileInfo || message?.noticeInfo || message?.status === null" class="flex gap-20">
    <div class="w-40 h-40 bg-#ffffff rounded-full flex-shrink-0">
      <component :is="useIcon(`chat-bot-${robotInfo.robotImg}`, { size: 40 })" />
    </div>
    <div class="max-w-70% min-w-50%">
      <div class="assistant-message text-14 leading-28 text-#333333 relative">
        <!-- 当内容还未响应时，显示loading -->
        <a-spin v-if="isContentLoading" loading dot> </a-spin>
        <!-- 当内容还在返回仅有知识库和数据库时，显示loading -->
        <a-spin v-if="messageLoading && currentMessageId === message.messageId" :loading="messageLoading" dot> </a-spin>
        <div v-if="message.knowledgeContent || message.agentContent" class="flex items-center gap-12 mb-12 text-12 absolute top-14 right-14">
          <!-- 知识库内容模块 -->
          <div
            v-if="message.knowledgeContent"
            class="flex items-center gap-2 cursor-pointer w-max mb-12 px-8 rounded-6 hover:bg-#e8eff9 mb-12 border-0 border-l-2 border-r-2 border-solid border-#2e66c7"
            @click="showDrawer('知识库内容', message.knowledgeContent)"
          >
            <span class="text-#666666 leading-18">知识库内容</span>
            <icon-right />
          </div>

          <!-- 数据库内容模块 -->

          <div
            v-if="message.agentContent"
            class="flex items-center gap-2 cursor-pointer w-max mb-12 px-8 rounded-6 hover:bg-#e8eff9 mb-12 border-0 border-l-2 border-r-2 border-solid border-#2e66c7"
            @click="showDrawer('数据库内容', message.agentContent)"
          >
            <span class="text-#666666 leading-18">数据库内容</span>
            <icon-right />
          </div>
        </div>

        <!-- 思考过程模块 -->
        <div v-if="message.thinkContent" class="think-process mb-12">
          <div class="flex items-center gap-8 cursor-pointer w-max bg-#f5f5f5 mb-12 py-6 px-12 rounded-8 hover:bg-#e5e6eb" @click="emit('change-think', message)">
            <icon-loading v-if="currentMessageId === message.messageId" />
            <icon-down v-else-if="message.showThink" />
            <icon-right v-else />
            <span class="text-#666666">{{ currentMessageId === message.messageId ? '思考中...' : '思考过程' }}</span>
          </div>
          <div v-show="message.showThink" class="think-content border-0 border-l-2 border-solid border-#2e66c7 px-12 pb-12">
            <MdPreview :model-value="message.thinkContent" class="markdown-content" />
          </div>
        </div>
        <MdPreview
          v-if="message?.markFileInfo?.reportName"
          :model-value="ellipsisContent(message.content)"
          class="markdown-content"
          :style="{
            marginTop: !message?.thinkContent && (message.knowledgeContent || message.agentContent) ? '24px' : '0'
          }"
        />
        <MdPreview
          v-else
          :model-value="message.content"
          class="markdown-content"
          :style="{
            marginTop: !message?.thinkContent && (message.knowledgeContent || message.agentContent) ? '24px' : '0'
          }"
        />
        <!-- <div v-safe-html="message.contentHtml" class="markdown-content"></div> -->
        <div v-if="message?.markFileInfo" class="flex justify-between mt-20">
          <a-alert type="info">
            <div v-if="message?.markFileInfo?.reportName" class="flex justify-between w-full items-center">
              <!-- {{ message?.markFileInfo }} -->
              <span class="text-14 text-#666666"
                >报告" <span class="text-#2e66c7">{{ message?.markFileInfo?.reportName }}</span> "已生成</span
              >
              <a-space size="small">
                <a-link @click="previewReport(message?.markFileInfo)">预览</a-link>
                <a-link @click="goReport(message?.markFileInfo?.id)">前往</a-link>
              </a-space>
            </div>
            <div v-else class="flex justify-between w-full items-center">
              <span class="text-14 text-#666666">报告生成状态请前往报告管理查看</span>
              <a-link @click="goReport()">前往</a-link>
            </div>
          </a-alert>
        </div>

        <!-- 通知信息展示 -->
        <div v-if="message?.noticeInfo" class="flex justify-between mt-20">
          <a-alert type="success">
            <div class="flex justify-between w-full items-center">
              <span class="text-14 text-#666666">
                完成下发，下发记录为" <span class="text-#2e66c7">{{ message?.noticeInfo?.noticeName }}</span> "
              </span>
              <a-space size="small">
                <a-link @click="goNotice(message?.noticeInfo?.id)">查看</a-link>
              </a-space>
            </div>
          </a-alert>
        </div>

        <div class="flex justify-between">
          <div v-if="currentMessageId !== message.messageId && !message.isTip && !isContentLoading" class="flex gap-24 mt-10">
            <a-tooltip content="复制">
              <component :is="useIcon('copy', { size: 24 })" class="cursor-pointer" @click="emit('copy', message.content)" />
            </a-tooltip>
            <a-tooltip content="重新回答">
              <component
                :is="useIcon('refresh', { size: 24 })"
                v-if="isLastMessage && currentMessageId !== message.messageId"
                class="cursor-pointer"
                @click="emit('action', 2, message)"
              />
            </a-tooltip>
            <a-tooltip content="下载回答">
              <component :is="useIcon('down', { size: 24 })" class="cursor-pointer" @click="emit('action', 4, message)" />
            </a-tooltip>
            <a-tooltip content="删除">
              <component :is="useIcon('del', { size: 24 })" class="cursor-pointer" @click="emit('action', 5, message)" />
            </a-tooltip>
          </div>
          <a-tooltip content="停止回答">
            <component
              :is="useIcon('stop', { size: 24 })"
              v-if="isLastMessage && currentMessageId === message.messageId"
              class="cursor-pointer mt-10"
              @click="emit('action', 3, message)"
            />
          </a-tooltip>
          <!-- 重新渲染图表 -->
          <!-- <a-tooltip content="若图表渲染异常,请点击重新渲染图表">
            <component :is="useIcon('refresh-echart', { size: 24 })" v-if="message.content?.includes('mermaid')" class="cursor-pointer" @click="emit('render-mermaid')" />
          </a-tooltip> -->
        </div>
      </div>
    </div>
    <FilePreview ref="filePreviewRef" />
  </div>
</template>

<script setup lang="ts">
import useIcon from '@/hooks/useIcon'
import FilePreview from '@/views/report/components/mdPreview.vue'
import { Message } from '@arco-design/web-vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

interface MessageItem {
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
  markFileInfo?: any
  isReport?: boolean
  noticeInfo?: any
  knowledgeContent?: string
  knowledgeContentHtml?: string
  agentContent?: string
  agentContentHtml?: string
  showKnowledge?: boolean
  showAgent?: boolean
  status?: number | null
  isLast?: boolean
}

interface RobotInfo {
  robotImg: string
  robotId: string | number
}

const props = defineProps<{
  message: MessageItem
  currentMessageId: string | number
  robotInfo: RobotInfo
  list: MessageItem[]
}>()

const router = useRouter()
const filePreviewRef = ref<any>(null)
const messageLoading = computed(() => {
  // 存在content或thinkContent时，不显示loading
  if (props.message.content.trim() || props.message.thinkContent?.trim()) {
    return false
  }
  return true
})
// status是null且无内容 则返回true 标识消息正在处理
const isContentLoading = computed(() => {
  const isContent = props.message?.content || props.message?.thinkContent || props.message?.knowledgeContent || props.message?.agentContent
  return props.message?.status === null && !isContent && props.message?.isLast
})
const showDrawer = (title: string, content: string) => {
  emit('show-drawer', title, content)
}

const ellipsisContent = (text: string, maxLength = 150) => {
  if (text.length > maxLength) {
    return (
      text.slice(0, maxLength) +
      ' ... <div class="text-14 mt-10 text-#666666">报告内容过长，请点击下方<span class="text-#2e66c7 font-bold"> 预览 </span>查看完整内容</div>'
    )
  }
  return text
}

const goReport = (id = '') => {
  router.push({
    path: '/report',
    query: {
      id
    }
  })
}

const goNotice = (id = '') => {
  // 跳转到下发通知页面
  router.push({
    path: '/supplierManage/issueNotice',
    query: {
      id
    }
  })
}

const previewReport = (record: any) => {
  const fileName = record.reportName.toLowerCase()
  const isMd = fileName.endsWith('.md')
  const isPdf = fileName.endsWith('.pdf')
  const isDocx = fileName.endsWith('.docx') || fileName.endsWith('.doc')

  // 支持预览md、pdf和docx文件
  if (isMd || isPdf || isDocx) {
    filePreviewRef.value.openModal(record)
  } else {
    Message.info('暂不支持预览, 请下载后查看')
  }
}

const emit = defineEmits<{
  (e: 'action', action: number, message: MessageItem): void
  (e: 'copy', content: string): void
  (e: 'change-think', message: MessageItem): void
  (e: 'render-mermaid'): void
  (e: 'show-drawer', title: string, content: string): void
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
