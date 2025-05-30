const fs = require('fs')
const path = require('path')
const axios = require('axios')

const cdnList = [
  'https://unpkg.com/@splinetool/navmesh-wasm@1.9.85/build/navmesh.js',
  'https://unpkg.com/@splinetool/navmesh-wasm@1.9.85/build/navmesh.wasm',
  'https://unpkg.com/@splinetool/modelling-wasm@1.9.85/build/process.js',
  'https://unpkg.com/@splinetool/modelling-wasm@1.9.85/build/process.wasm',
  'https://unpkg.com/@splinetool/boolean-wasm@1.9.85/build/boolean.js',
  'https://unpkg.com/@splinetool/boolean-wasm@1.9.85/build/boolean.wasm',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/boolean.js',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/gaussian-splat-compression.js',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/howler.js',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/navmesh.js',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/opentype.js',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/physics.js',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/process.js',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/runtime.cjs',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/runtime.js',
  'https://unpkg.com/@splinetool/runtime@1.9.85/build/ui.js',
  'https://unpkg.com/@splinetool/ui-wasm@1.9.85/build/ui.wasm'
]

// 统一处理 app.unpkg.com 和 unpkg.com，并移除  目录层级
function getLocalPathFromCdn(url) {
  let pathname = ''
  if (url.startsWith('https://app.unpkg.com/')) {
    pathname = url.replace('https://app.unpkg.com/', '')
  } else if (url.startsWith('https://unpkg.com/')) {
    pathname = url.replace('https://unpkg.com/', '')
  } else {
    throw new Error('不支持的CDN地址: ' + url)
  }

  // 移除  目录层级
  if (pathname.includes('/files/')) {
    pathname = pathname.replace('/files/', '/')
  }

  return path.join('public', pathname)
}

async function download(url, localPath) {
  const dir = path.dirname(localPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (fs.existsSync(localPath)) {
    console.log('已存在，跳过：', localPath)
    return
  }
  console.log('下载：', url, '->', localPath)
  const res = await axios.get(url, { responseType: 'stream' })
  const writer = fs.createWriteStream(localPath)
  res.data.pipe(writer)
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
  console.log('下载完成：', localPath)
}

async function main() {
  for (const url of cdnList) {
    try {
      const localPath = getLocalPathFromCdn(url)
      await download(url, localPath)
    } catch (e) {
      console.error('下载失败:', url, e.message)
    }
  }
  console.log('所有CDN资源下载完成！')
}

main()
