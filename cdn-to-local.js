const axios = require('axios')
const fs = require('fs')
const path = require('path')

// 定义相关的 CDN 链接和配置
const cdnBase = 'https://unpkg.com'
const highlightUrl = `${cdnBase}/@highlightjs/cdn-assets@11.10.0/highlight.min.js`
const prettierUrl = {
  main: `${cdnBase}/prettier@3.3.3/standalone.js`,
  markdown: `${cdnBase}/prettier@3.3.3/plugins/markdown.js`
}
const cropperUrl = {
  css: `${cdnBase}/cropperjs@1.6.2/dist/cropper.min.css`,
  js: `${cdnBase}/cropperjs@1.6.2/dist/cropper.min.js`
}
const screenfullUrl = `${cdnBase}/screenfull@5.2.0/dist/screenfull.js`
const mermaidUrl = `${cdnBase}/mermaid@11.3.0/dist/mermaid.min.js`
const katexUrl = {
  js: `${cdnBase}/katex@0.16.11/dist/katex.min.js`,
  css: `${cdnBase}/katex@0.16.11/dist/katex.min.css`
}
const codeCss = {
  a11y: {
    light: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/a11y-light.min.css`,
    dark: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/a11y-dark.min.css`
  },
  atom: {
    light: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/atom-one-light.min.css`,
    dark: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/atom-one-dark.min.css`
  },
  github: {
    light: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/github.min.css`,
    dark: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/github-dark.min.css`
  },
  gradient: {
    light: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/gradient-light.min.css`,
    dark: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/gradient-dark.min.css`
  },
  kimbie: {
    light: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/kimbie-light.min.css`,
    dark: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/kimbie-dark.min.css`
  },
  paraiso: {
    light: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/paraiso-light.min.css`,
    dark: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/paraiso-dark.min.css`
  },
  qtcreator: {
    light: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/qtcreator-light.min.css`,
    dark: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/qtcreator-dark.min.css`
  },
  stackoverflow: {
    light: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/stackoverflow-light.min.css`,
    dark: `${cdnBase}/@highlightjs/cdn-assets@11.10.0/styles/stackoverflow-dark.min.css`
  }
}

const configOption = {
  editorExtensions: {
    highlight: {
      js: highlightUrl,
      css: codeCss
    },
    prettier: {
      standaloneJs: prettierUrl.main,
      parserMarkdownJs: prettierUrl.markdown
    },
    cropper: {
      ...cropperUrl
    },
    screenfull: {
      js: screenfullUrl
    },
    mermaid: {
      js: mermaidUrl,
      enableZoom: true
    },
    katex: {
      ...katexUrl
    }
  }
}

// 递归获取目录中的所有文件
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList)
    } else {
      fileList.push(filePath)
    }
  })

  return fileList
}

// 使用自定义的模式匹配函数代替glob
function findFiles(pattern) {
  // 简单模式匹配，只支持"dist/**/*.html"这样的简单模式
  const baseDir = pattern.split('/*')[0]
  const extension = pattern.split('*.')[1]

  if (!fs.existsSync(baseDir)) {
    return []
  }

  const allFiles = getAllFiles(baseDir)
  return allFiles.filter((file) => file.endsWith('.' + extension))
}

// 构建 CDN 链接和本地路径的映射
function buildCdnToLocalMap() {
  const cdnToLocalMap = {}
  Object.entries(configOption.editorExtensions).forEach(([key, value]) => {
    if (typeof value === 'object' && value.js) {
      // 保持CDN的路径结构
      const relativePath = extractRelativePath(value.js)
      cdnToLocalMap[value.js] = path.join('public', 'md-editor-v3', relativePath)
    }
    if (typeof value === 'object' && value.css) {
      if (typeof value.css === 'object') {
        // 处理深层嵌套对象，如 codeCss
        Object.entries(value.css).forEach(([cssKey, cssValue]) => {
          if (typeof cssValue === 'string') {
            const relativePath = extractRelativePath(cssValue)
            cdnToLocalMap[cssValue] = path.join('public', 'md-editor-v3', relativePath)
          } else if (typeof cssValue === 'object') {
            // 处理深层嵌套对象，如 codeCss.a11y.light
            Object.entries(cssValue).forEach(([subKey, cssUrl]) => {
              if (typeof cssUrl === 'string') {
                const relativePath = extractRelativePath(cssUrl)
                cdnToLocalMap[cssUrl] = path.join('public', 'md-editor-v3', relativePath)
              }
            })
          }
        })
      } else if (typeof value.css === 'string') {
        const relativePath = extractRelativePath(value.css)
        cdnToLocalMap[value.css] = path.join('public', 'md-editor-v3', relativePath)
      }
    }
  })
  return cdnToLocalMap
}

// 从CDN URL中提取相对路径
function extractRelativePath(url) {
  try {
    // 移除协议和域名部分
    const urlObj = new URL(url)
    // 返回路径部分，去掉开头的斜杠
    return urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname
  } catch (error) {
    console.error(`提取路径失败 ${url}: ${error.message}`)
    // 如果URL解析失败，退回到只使用文件名
    return path.basename(url)
  }
}

// 下载 CDN 资源到本地
async function downloadCdnResources() {
  const cdnToLocalMap = buildCdnToLocalMap()
  for (const [cdnUrl, localPath] of Object.entries(cdnToLocalMap)) {
    try {
      // 检查文件是否已存在
      if (fs.existsSync(localPath)) {
        console.log(`文件已存在，跳过下载: ${localPath}`)
        continue
      }

      const dir = path.dirname(localPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      console.log(`正在下载 ${cdnUrl} 到 ${localPath}...`)
      const response = await axios.get(cdnUrl, { responseType: 'stream' })
      const writer = fs.createWriteStream(localPath)
      response.data.pipe(writer)
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
      console.log(`下载成功: ${localPath}`)
    } catch (error) {
      console.error(`下载失败 ${cdnUrl}: ${error.message}`)
    }
  }
}

// 导出公共函数和配置，供替换脚本使用
module.exports = {
  buildCdnToLocalMap,
  extractRelativePath,
  configOption,
  findFiles // 导出自定义的文件查找函数
}

// 主函数
async function main() {
  await downloadCdnResources()
}

main().catch((error) => {
  console.error('发生错误:', error.message)
})
