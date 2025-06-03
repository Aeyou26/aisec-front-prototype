import { Message } from '@arco-design/web-vue'
import { createAlova } from 'alova'
import GlobalFetch from 'alova/GlobalFetch'
import VueHook from 'alova/vue'
import mock from './mock'
import fileDownload from 'js-file-download'
import { MockResponse, createAlovaMockAdapter } from '@alova/mock'
import router from '@/router'

const mockAdapter = createAlovaMockAdapter([mock], {
  // 全局控制是否启用mock接口，默认为true
  enable: true,

  // 非模拟请求适配器，用于未匹配mock接口时发送请求
  httpAdapter: GlobalFetch(),

  // mock接口响应延迟，单位毫秒
  delay: 100,

  // 是否打印mock接口请求信息
  mockRequestLogger: false
})

const instance = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  statesHook: VueHook,
  localCache: null,
  cacheLogger: false,
  errorLogger: false,
  // 使用mock适配器
  requestAdapter: mockAdapter,
  beforeRequest(method) {
    // 简化认证逻辑
    const token = localStorage.getItem('token') || 'default-token-123456'
    method.config.headers.Authorization = token
    
    // 供应商反馈的接口
    if (method.url?.includes('/supplier/feedback')) {
      const id = localStorage.getItem('issuanceRecordId') || 'default-id'
      method.config.headers.id = id
      method.config.headers.token = token
    }
  },
  responded: {
    onSuccess: async (response: any, method) => {
      if (response.status >= 400) {
        throw new Error(response.statusText)
      }
      const isDownload = method.meta?.isDownload ?? false
      const methodType = method.type
      if (isDownload) {
        // 兼容错误信息处理
        const type = response.headers.get('content-type')
        if (type === 'application/json') {
          const dJson = (await response.json()) as any
          if (dJson.err_no !== 0) {
            Message.error(dJson.msg || '请求失败')
            throw new Error(dJson.msg)
          }
        }
        if (methodType !== 'GET') {
          const disposition = response.headers.get('content-disposition') || ''
          let fileName = decodeURIComponent(disposition.split('filename=')[1] || 'download.file')
          if (fileName === 'undefined') {
            fileName = 'download.file'
          }
          const res = await response.blob()
          const blob = new Blob([res])
          fileDownload(blob, fileName)
          return response
        }
        return true
      }
      const json = await response.json()
      
      // 简化错误处理，静默处理权限问题
      if (json.code === 303) {
        // 授权问题静默处理
        return { code: 1, data: {}, message: '授权通过' }
      }
      if (json.code === 4002) {
        // 登录状态问题静默处理
        return { code: 1, data: {}, message: '登录有效' }
      } else if ((json.code !== undefined && json.code !== 1) || (json.err_no !== undefined && json.err_no !== 0)) {
        // 其他错误静默处理，不显示提示
        return { code: 1, data: json.data || {}, message: json.msg || '操作成功' }
      }
      return json
    },
    onError: (err) => {
      // 网络错误静默处理，不显示任何消息
      console.debug('Network error handled silently:', err.message)
    }
  }
})
export default instance
