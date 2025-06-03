<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import request from '@/request'
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import { renderAsync } from 'docx-preview'

const props = defineProps<{
  reportData?: any
}>()

const data = ref<string>('')
const loading = ref<boolean>(false)
const fileUrl = ref<string>('')
const pdfViewer = ref<HTMLElement | null>(null)
const docxViewer = ref<HTMLElement | null>(null)
const mdPreviewRef = ref<HTMLElement | null>(null)
const isFullscreen = ref<boolean>(false)

// PDF渲染函数
async function renderPdf(url: string, container: HTMLElement) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js'
  const pdfDoc = await pdfjsLib.getDocument(url).promise
  const numPages = pdfDoc.numPages

  container.innerHTML = ''
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const scale = 1.5
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width

    if (context) {
      const renderContext = {
        canvasContext: context,
        viewport
      }
      await page.render(renderContext).promise
      container.appendChild(canvas)
    }
  }
}

// 计算当前文件类型
const fileType = computed(() => {
  if (!props.reportData || !props.reportData.reportName) {
    return 'markdown'
  }
  const fileName = props.reportData.reportName.toLowerCase()
  if (fileName.endsWith('.pdf')) {
    return 'pdf'
  }
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return 'docx'
  }
  return 'markdown'
})

// 简化的数据加载
const loadData = async () => {
  if (props.reportData && fileType.value === 'markdown') {
    loading.value = true
    try {
      const res = await request.Get<any>(`/user/report/${props.reportData.id}`)
      if (res.data) {
        data.value = res.data
      }
    } catch (error) {
      console.error('加载报告数据失败:', error)
      data.value = '加载失败'
    } finally {
      loading.value = false
    }
  }
}

// 监听props变化
watch(() => props.reportData, loadData, { immediate: true })

function onClose() {
  data.value = ''
  fileUrl.value = ''
  if (docxViewer.value) {
    docxViewer.value.innerHTML = ''
  }
  if (pdfViewer.value) {
    pdfViewer.value.innerHTML = ''
  }
}

defineExpose({
  loadData
})
</script>

<template>
  <div>
    <!-- 简化的预览界面 -->
    <div class="preview-container">
      <div v-if="fileType === 'markdown'" class="markdown-preview">
        <MdPreview 
          :model-value="data" 
          :theme="'light'"
          preview-theme="default"
          code-theme="atom"
        />
      </div>
      
      <!-- 其他文件类型显示简化消息 -->
      <div v-else class="file-preview-placeholder">
        <div class="placeholder-content">
          <h3>文件预览（原型模式）</h3>
          <p>文件类型：{{ fileType }}</p>
          <p>在原型版本中，仅支持Markdown预览</p>
          <pre v-if="data" class="file-content">{{ data }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.preview-container {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  min-height: 400px;
}

.markdown-preview {
  width: 100%;
}

.file-preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #f8f9fa;
  border-radius: 8px;
}

.placeholder-content {
  text-align: center;
  padding: 32px;
}

.placeholder-content h3 {
  color: #666;
  margin-bottom: 16px;
}

.placeholder-content p {
  color: #999;
  margin-bottom: 8px;
}

.file-content {
  max-height: 300px;
  overflow-y: auto;
  text-align: left;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  margin-top: 16px;
}

.markdown-content {
  min-height: 500px;
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

.docx-preview {
  :deep(.docx-wrapper) {
    background-color: transparent;
  }
}
</style>
