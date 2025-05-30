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
  delay: 1000,

  // 是否打印mock接口请求信息
  mockRequestLogger: true
})

const instance = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  statesHook: VueHook,
  localCache: null,
  cacheLogger: false,
  errorLogger: false,
  // requestAdapter: GlobalFetch(),
  requestAdapter: mockAdapter,
  beforeRequest(method) {
    const { token } = storeToRefs(useUserStore())
    if (token.value) {
      method.config.headers.Authorization = token.value
    }
    // 供应商反馈的接口
    if (method.url?.includes('/supplier/feedback')) {
      const id = localStorage.getItem('issuanceRecordId')
      method.config.headers.id = id || ''
      method.config.headers.token = token.value || ''
    }
  },
  responded: {
    onSuccess: async (response: any, method) => {
      const userStore = useUserStore()
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
          let fileName = decodeURIComponent(disposition.split('filename=')[1])
          if (fileName === 'undefined') {
            fileName = decodeURI((disposition as any).match(/=(\S*)/)[1])
          }
          const res = await response.blob()
          const blob = new Blob([res])
          fileDownload(blob, fileName)
          return response
        }
        return true
      }
      const json = await response.json()
      if (json.code === 303) {
        // 未授权则跳转授权页面
        await router.push('/admin/systemConfig/accredit')
        throw new Error(json.msg)
      }
      if (json.code === 4002) {
        userStore.reset()
        const path = userStore.show3D ? '/login2' : '/login'
        await router.push(path)
        Message.error(json.msg)
        throw new Error(json.msg)
      } else if ((json.code !== undefined && json.code !== 1) || (json.err_no !== undefined && json.err_no !== 0)) {
        Message.error(json.msg)
        throw new Error(json.msg)
      }
      return json
    },
    onError: (err) => {
      Message.error(err.message)
    }
  }
})
export default instance
