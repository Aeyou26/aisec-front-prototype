const fs = require('fs').promises
const path = require('path')

async function replaceUnpkgPathInJs() {
  try {
    const distAssetsDir = path.join(__dirname, 'dist', 'assets')
    const files = await fs.readdir(distAssetsDir)

    // 查找以 VortexBackground 开头的 JS 文件
    const targetFiles = files.filter((file) => file.startsWith('VortexBackground') && file.endsWith('.js'))

    if (targetFiles.length === 0) {
      console.log('未找到匹配的文件')
      return
    }

    console.log(`找到 ${targetFiles.length} 个匹配文件:`, targetFiles)
    // 逐个处理匹配的文件
    for (const file of targetFiles) {
      const filePath = path.join(distAssetsDir, file)
      const content = await fs.readFile(filePath, 'utf8')

      // 替换目标字符串
      const newContent = content.replace(/https:\/\/unpkg\.com\/@splinetool/g, '/@splinetool')

      // 如果内容有变化，则写入文件
      if (newContent !== content) {
        await fs.writeFile(filePath, newContent, 'utf8')
        console.log(`已替换文件: ${file}`)
      } else {
        console.log(`文件 ${file} 中未找到匹配内容`)
      }
    }

    console.log('全部替换完成')
  } catch (error) {
    console.error('处理文件时出错:', error)
  }
}

// 执行替换操作
replaceUnpkgPathInJs()
