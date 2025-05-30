import { Message, MessageConfig } from '@arco-design/web-vue'
import type { MessageMethod } from '@arco-design/web-vue'

// 保存原始方法引用
const originalMethods = {
  success: Message.success,
  warning: Message.warning,
  error: Message.error,
  info: Message.info,
  loading: Message.loading,
  normal: Message.normal,
  clear: Message.clear
}

/**
 * 封装的消息方法，在显示新消息前先清除所有已有消息
 */
const message: MessageMethod = {
  success: (content: string | MessageConfig) => {
    originalMethods.clear()
    return originalMethods.success(content)
  },
  warning: (content: string | MessageConfig) => {
    originalMethods.clear()
    return originalMethods.warning(content)
  },
  error: (content: string | MessageConfig) => {
    originalMethods.clear()
    return originalMethods.error(content)
  },
  info: (content: string | MessageConfig) => {
    originalMethods.clear()
    return originalMethods.info(content)
  },
  loading: (content: string | MessageConfig) => {
    originalMethods.clear()
    return originalMethods.loading(content)
  },
  normal: (content: string | MessageConfig) => {
    originalMethods.clear()
    return originalMethods.normal(content)
  },
  clear: originalMethods.clear
}

/**
 * 覆盖原始Message方法以实现全局替换
 * 在main.ts中调用此方法即可全局替换Message
 */
export function overrideMessage(): void {
  // 覆盖所有消息方法
  Message.success = message.success
  Message.warning = message.warning
  Message.error = message.error
  Message.info = message.info
  Message.loading = message.loading
  Message.normal = message.normal
  // clear方法保持不变
}

export default message
