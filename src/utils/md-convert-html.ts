import { ref } from 'vue'

// 简化的markdown渲染工具
export const mermaidList = ref<string[]>([])

// 简化的代码块渲染
export const renderer = {
  code(code: string, lang?: string) {
    if (lang === 'mermaid') {
      // 简化为文本显示，不渲染图表
      return `<div class="mermaid-placeholder"><pre><code>${code}</code></pre><p>图表预览（原型模式）</p></div>`
    }
    
    // 基础代码块
    return `<pre><code class="language-${lang || 'text'}">${code}</code></pre>`
  }
}

// 简化的markdown渲染
export const renderMarkdown = (content: string) => {
  // 基础的markdown处理
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 空的mermaid渲染函数（保持兼容性）
export const renderMermaid = async () => {
  console.log('Mermaid渲染已在原型模式中简化')
}

// 提取文件信息
export const extractMarkFileInfo = (content: string) => {
  const lines = content.split('\n')
  const fileInfo: { [key: string]: any } = {}
  
  lines.forEach(line => {
    if (line.includes('文件名：')) {
      fileInfo.filename = line.split('文件名：')[1]?.trim()
    }
    if (line.includes('文件大小：')) {
      fileInfo.size = line.split('文件大小：')[1]?.trim()
    }
  })
  
  return fileInfo
}
