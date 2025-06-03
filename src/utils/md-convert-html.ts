import MarkdownIt from 'markdown-it'
import mermaid from 'mermaid'
import 'highlight.js/styles/github.css'
import hljs from 'highlight.js/lib/core'
import sql from 'highlight.js/lib/languages/sql'
import php from 'highlight.js/lib/languages/php'

// 注册需要的语言
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('php', php)
const mermaidConfig = {
  xyChart: {
    showTitle: false,
    yAxis: {
      labelPadding: 20
    },
    xAxis: {
      labelPadding: 20
    }
  },
  themeVariables: {
    // 基础字体设置
    'font-size': '14px',

    // 主题基础颜色 - 更柔和的色调
    primaryColor: '#6B8FF9',
    primaryTextColor: '#333333',
    primaryBorderColor: '#8BA7FA',
    lineColor: '#6B8FF9',

    // 背景颜色 - 更淡雅
    mainBkg: '#F7F9FE',
    secondBkg: '#FFFFFF',
    tertiaryBkg: '#F0F5FF',

    // 文字颜色保持清晰度
    textColor: '#333333',
    tertiaryTextColor: '#666666',
    noteTextColor: '#333333',

    // 边框颜色 - 更柔和
    noteBkgColor: '#FAFBFC',
    noteBorderColor: '#E8EBF2',

    // 流程图颜色 - 柔和的蓝色
    nodeBkg: '#F7F9FE',
    nodeBorder: '#6B8FF9',
    clusterBkg: '#FAFBFC',
    clusterBorder: '#E8EBF2',

    // 时序图颜色 - 淡雅色调
    actorBkg: '#F7F9FE',
    actorBorder: '#6B8FF9',
    activationBkgColor: '#F0F5FF',

    // 甘特图颜色 - 柔和色调
    taskBkgColor: '#F7F9FE',
    taskBorderColor: '#6B8FF9',
    taskTextColor: '#333333',

    // 饼图颜色 - 移除边框，使用更柔和的纯色
    pie1: '#89A7FA', // 柔和的蓝色
    pie2: '#95D5B2', // 清新的绿色
    pie3: '#F9C74F', // 温暖的黄色
    pie4: '#B8C0FF', // 淡紫色
    pie5: '#98C1D9', // 灰蓝色
    pie6: '#F5CAC3', // 淡粉色
    pie7: '#A2D2FF', // 天蓝色

    // 移除饼图边框
    pieBorderWidth: '0',
    pieSectionBorderWidth: '0',
    pieSectionBorderColor: 'transparent',

    // 调整饼图其他样式
    pieOpacity: '1',
    pieStrokeWidth: '0',
    pieOuterStrokeWidth: '0',

    // 状态图颜色
    labelColor: '#333333',
    altBackground: '#FAFBFC',

    // 类图颜色 - 渐变色系
    classText: '#333333',
    fillType0: '#F7F9FE',
    fillType1: '#F0F5FF',
    fillType2: '#E6EEFF',
    fillType3: '#DCE7FF',
    fillType4: '#D2E0FF',
    fillType5: '#C8D9FF',

    // 边框圆角
    border2: '2px',
    cornerRadius: '8px',

    // XY图表样式 - 根据官方文档重新配置
    xyChart: {
      width: 900, // 图表宽度
      height: 600, // 图表高度
      backgroundColor: '#FFFFFF',
      titleColor: '#333333',
      xAxisLabelColor: '#666666',
      yAxisLabelColor: '#666666',
      xAxisLineColor: '#E8EBF2',
      yAxisLineColor: '#E8EBF2',
      xAxisTickColor: '#E8EBF2',
      yAxisTickColor: '#E8EBF2',
      xAxisTitleColor: '#333333',
      yAxisTitleColor: '#333333',
      plotColorPalette: '#89A7FA,#95D5B2,#F9C74F' // 柱状图颜色，用逗号分隔
    }
  }
}
// 初始化 mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  ...mermaidConfig
})

// markdown-it 配置
export const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  // breaks: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch (__) {
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

export const mermaidList = ref<string[]>([])
// 添加 mermaid 代码块渲染
md.renderer.rules.fence = (tokens: any[], idx: number) => {
  const token = tokens[idx]
  const code = token.content.trim()
  const lang = token.info

  if (lang === 'mermaid') {
    if (!code?.length) {
      return ''
    }
    const content = tokens[idx > 0 ? idx : 0] || {}
    // 使用前一条的长度增加复杂性做id结尾
    const i = content?.content?.length || 0
    const m = code[0]
    const n = `${idx}-${m}-${i}`
    if (!mermaidList.value.includes(n)) {
      mermaidList.value.push(n)
    }
    return `<div class="mermaid mermaid-${n}">${code}</div>`
  }

  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
      return `<pre class="hljs"><code class="language-${lang}">${highlighted}</code></pre>`
    } catch (__) {
      return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
    }
  }

  return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
}
// 处理建议高亮
const processMarkdownSuggestions = (text: string): string => {
  return text
  // 查找 ## 防护建议 或 ## 解决方案 后的列表项
  // return text.replace(/(## (?:防护建议|解决方案)\n)((?:\d+\. [^\n]+\n?)+)/g, (_, title, suggestions) => {
  //   // 将每个建议转换为可点击的元素
  //   const processedSuggestions = suggestions.replace(
  //     /(\d+)\. ([^\n]+)/g,
  //     '$1. <span class="suggestion-item cursor-pointer text-#2e66c7 hover:text-#4c7ed5" data-suggestion="$2">$2</span>'
  //   )
  //   return title + processedSuggestions
  // })
}

// 创建一个简单的缓存对象
const markdownCache = new Map<string, string>()

// 需要过滤的字符
const filterStrList = ['<think>', '</think>', '<mark_file_info>', '</mark_file_info>', '<notice_info>', '</notice_info>']

/**
 * 过滤字符串中的所有特殊标记
 * @param text 需要过滤的文本
 * @returns 过滤后的文本
 */
export const filterSpecialTags = (text: string): string => {
  if (!text) {
    return ''
  }
  let result = text

  // 处理其他标签
  filterStrList.forEach((tag) => {
    result = result.replace(new RegExp(tag, 'g'), '')
  })

  return result
}

/**
 * 提取字符串中的mark_file_info和notice_info内容
 * @param text 需要提取的文本
 * @returns 提取的结果对象 {text: 过滤后的文本, markFileInfo: 提取的JSON对象, noticeInfo: 提取的通知信息对象}
 */
export const extractMarkFileInfo = (text: string): { text: string; markFileInfo: any; noticeInfo: any } => {
  if (!text) {
    return { text: '', markFileInfo: null, noticeInfo: null }
  }

  let result = text
  let markFileInfo = null
  let noticeInfo = null

  // 提取<mark_file_info>...</mark_file_info>中的内容
  const markFileRegex = /<mark_file_info>([\s\S]*?)<\/mark_file_info>/g
  const markMatches = markFileRegex.exec(text)

  if (markMatches && markMatches[1]) {
    try {
      markFileInfo = JSON.parse(markMatches[1].trim())
      // 删除标记及其内容
      result = text.replace(markFileRegex, '')
    } catch (error) {
      console.error('解析mark_file_info内容失败:', error)
    }
  }

  // 提取<notice_info>...</notice_info>中的内容
  const noticeRegex = /<notice_info>([\s\S]*?)<\/notice_info>/g
  const noticeMatches = noticeRegex.exec(result)

  if (noticeMatches && noticeMatches[1]) {
    try {
      noticeInfo = JSON.parse(noticeMatches[1].trim())
      // 删除标记及其内容
      result = result.replace(noticeRegex, '')
    } catch (error) {
      console.error('解析notice_info内容失败:', error)
    }
  }

  // 处理其他标签
  filterStrList.forEach((tag) => {
    if (tag !== '<mark_file_info>' && tag !== '</mark_file_info>' && tag !== '<notice_info>' && tag !== '</notice_info>') {
      result = result.replace(new RegExp(tag, 'g'), '')
    }
  })

  return { text: result, markFileInfo, noticeInfo }
}

/**
 * 渲染 markdown
 * @param text 需要渲染的文本
 * @returns 渲染后的HTML
 */
export const renderMarkdown = (text: string): string => {
  if (!text) {
    return ''
  }

  // 如果缓存中已存在，直接返回缓存的结果
  if (markdownCache.has(text)) {
    return markdownCache.get(text) || ''
  }

  try {
    const processedText = processMarkdownSuggestions(text)
    const rendered = md.render(processedText || '')

    // 将结果存入缓存
    markdownCache.set(text, rendered)

    return rendered
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return text || ''
  }
}

// 渲染 mermaid 图表
export const renderMermaid = async () => {
  nextTick(async () => {
    // 清除所有已有的渲染
    document.querySelectorAll('.mermaid').forEach((node) => {
      if (node instanceof HTMLElement) {
        node.removeAttribute('data-processed')
        // 保存原始内容
        if (!node.getAttribute('data-original')) {
          node.setAttribute('data-original', node.textContent || '')
        }
      }
    })
    // 按顺序渲染每个图表
    for (const item of mermaidList.value) {
      // 即使重复概率不大 防止有重复的class 最好使用All去获取dom
      const nodes = document.querySelectorAll(`.mermaid-${item}`)
      nodes.forEach(async (node) => {
        if (node instanceof HTMLElement && !node.hasAttribute('data-processed')) {
          // console.log('准备渲染图表：', item, node)
          // 清除之前可能存在的内容
          node.innerHTML = node.textContent || ''
          // 等待 DOM 更新
          await nextTick()
          try {
            // 重置内容为原始内容
            const originalContent = node.getAttribute('data-original')
            if (originalContent) {
              node.innerHTML = originalContent
            }
            // 等待 DOM 更新
            await new Promise((resolve) => {
              requestAnimationFrame(() => {
                requestAnimationFrame(resolve)
              })
            })
            // 确保当前节点仍然存在于 DOM 中
            if (document.contains(node)) {
              await mermaid.run({
                nodes: [node],
                suppressErrors: true
              })
              node.setAttribute('data-processed', 'true')
            }
          } catch (error) {
            console.error(`Mermaid 图表 ${item} 渲染错误:`, error)
          }
        }
      })
    }
  })
}
