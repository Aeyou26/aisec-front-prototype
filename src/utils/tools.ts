import { Message } from '@arco-design/web-vue'

/**
 * 筛除空值属性
 * @param obj
 * @returns
 */
export function removeEmptyAttr(obj: any) {
  const newObj: any = {}
  const keys = Object.keys(obj)
  if (keys.length) {
    keys.forEach((key) => {
      if (obj[key] !== undefined && obj[key] !== null && (obj[key] || obj[key] === 0 || obj[key] === false)) {
        newObj[key] = obj[key]
      }
    })
    return newObj
  }
  return {}
}

/**
 * 复制文本到剪切板
 * @param value
 * @returns void
 */
export async function copyText(value: string) {
  // 兼容性
  if (!navigator.clipboard) {
    const textArea = document.createElement('textarea')
    textArea.value = value
    textArea.style.position = 'fixed'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      const successful = document.execCommand('copy')
      successful ? Message.success('复制成功') : Message.error('复制失败')
    } catch (err) {
      Message.error('复制失败')
    }
    document.body.removeChild(textArea)
    return
  }

  try {
    await navigator.clipboard.writeText(value)
    Message.success('复制成功')
  } catch (err) {
    Message.error('复制失败')
  }
}

/**
 * 复制url
 */
export function copyFn(val: string) {
  const copyInput = document.createElement('input')
  copyInput.setAttribute('value', val)
  document.body.appendChild(copyInput)
  copyInput.select()
  try {
    const copied = document.execCommand('copy')
    if (copied) {
      document.body.removeChild(copyInput)
      Message.success('复制成功')
    }
  } catch {
    Message.error('复制失败，请检查浏览器兼容')
  }
}

// 计算当前页面显示第几至第几条
export const getPageinationNum = (current: number, pageSize: number, total: number) => {
  const start = (current - 1) * pageSize + 1
  const end = current * pageSize > total ? total : current * pageSize
  return `${start} ~ ${end}`
}

/**
 * 格式化文件大小
 * @param bytes
 * @returns
 */
export function formatSize(bytes: number): string {
  // 定义单位
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  // 格式化大小的函数
  if (bytes === 0) {
    return '0 B'
  }
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  // 使用toFixed(2)来保留两位小数，并去除末尾多余的0（如果需要）
  const size = (bytes / 1024 ** i).toFixed(2).replace(/\.?0+$/, '')
  // 注意：如果size为整数且没有小数部分，上面的replace可能会去掉小数点，所以我们需要检查并重新添加
  return `${size.endsWith('.') ? size.slice(0, -1) : size} ${units[i]}`
}

/**
 * 格式化数字
 * @param value
 * @returns
 */
export function formatNum(value: number | string) {
  const num = Number(value) || 0
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}亿`
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num
}
