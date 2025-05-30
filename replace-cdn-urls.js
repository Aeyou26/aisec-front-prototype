const fs = require('fs')
const path = require('path')
// 移除glob依赖
// const glob = require('glob')
const { buildCdnToLocalMap, extractRelativePath, findFiles } = require('./cdn-to-local')

// 替换HTML和JS文件中的CDN URL为本地路径
async function replaceCdnUrls() {
  const filePatterns = ['dist/**/*.html', 'dist/**/*.js']

  console.log('开始替换CDN链接为本地路径...')

  let totalModified = 0
  let totalFiles = 0

  filePatterns.forEach((pattern) => {
    // 使用自定义的findFiles函数代替glob.sync
    const files = findFiles(pattern)
    console.log(`找到${files.length}个文件匹配模式: ${pattern}`)
    totalFiles += files.length

    files.forEach((file) => {
      try {
        let content = fs.readFileSync(file, 'utf8')
        let modified = false

        // 1. 首先替换CDN根路径变量定义
        const cdnRootPatterns = [
          /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*["']https:\/\/unpkg\.com["']/g,
          /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*["']https:\/\/unpkg\.com["']/g,
          /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*["']https:\/\/unpkg\.com["']/g,
          /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*["']https:\/\/unpkg\.com["']/g
        ]

        const localBasePath = '/md-editor-v3'

        // 记录找到的CDN根变量名
        const cdnVarNames = []

        cdnRootPatterns.forEach((pattern) => {
          let match
          // 使用正则的exec方法循环查找所有匹配
          while ((match = pattern.exec(content)) !== null) {
            const varName = match[1]
            cdnVarNames.push(varName)

            // 替换为本地路径
            const oldContent = content
            content = content.replace(new RegExp(`${varName}\\s*=\\s*["']https://unpkg\\.com["']`, 'g'), `${varName} = "${localBasePath}"`)

            if (oldContent !== content) {
              console.log(`替换变量: ${file} -> ${varName} = "${localBasePath}"`)
              modified = true
            }
          }
        })

        // 2. 然后替换使用完整URL的地方
        const cdnToLocalMap = buildCdnToLocalMap()
        for (const [cdnUrl, localPath] of Object.entries(cdnToLocalMap)) {
          const relativePath = path.relative(path.dirname(file), localPath)
          // 确保路径分隔符统一为正斜杠（网页中使用）
          const webRelativePath = relativePath.replace(/\\/g, '/')

          // 使用转义的URL进行替换
          const escapedUrl = escapeRegExp(cdnUrl)
          const regex = new RegExp(escapedUrl, 'g')

          // 检查是否有替换发生
          if (content.match(regex)) {
            const oldContent = content
            content = content.replace(regex, webRelativePath)

            if (oldContent !== content) {
              console.log(`替换URL: ${file} -> ${cdnUrl}`)
              modified = true
            }
          }
        }

        // 3. 如果有变量定义被替换，记录变量使用情况
        if (cdnVarNames.length > 0) {
          let varUsageCount = 0
          cdnVarNames.forEach((varName) => {
            // 查找所有使用该变量的路径片段
            const varUsagePattern = new RegExp(`\\$\\{${varName}\\}(\\/[^\\s"'\\}]+)`, 'g')
            let match
            while ((match = varUsagePattern.exec(content)) !== null) {
              varUsageCount++
            }
          })

          if (varUsageCount > 0 && modified) {
            console.log(`检测到${varUsageCount}处变量引用路径，变量定义已替换`)
          }
        }

        // 只有在内容被修改时才写入文件
        if (modified) {
          fs.writeFileSync(file, content, 'utf8')
          totalModified++
        }
      } catch (error) {
        console.error(`处理文件出错 ${file}: ${error.message}`)
      }
    })
  })

  console.log(`替换完成！共处理${totalFiles}个文件，修改了${totalModified}个文件`)
}

// 用于转义正则表达式中的特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 主函数
async function main() {
  await replaceCdnUrls()
}

main().catch((error) => {
  console.error('替换CDN URL时出错:', error.message)
  process.exit(1)
})
