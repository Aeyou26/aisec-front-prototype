import { Message } from '@arco-design/web-vue'
import type { Ref } from 'vue'
import { renderMarkdown, filterSpecialTags, extractMarkFileInfo } from '@/utils/md-convert-html'
import { useChatStore } from '@/store'
import { useUserStore } from '@/store'
import { ref, reactive, onUnmounted } from 'vue'
import { useSSE } from '@alova/scene-vue'
import request from '@/request'
import { useRouter } from 'vue-router'

export interface MessageItem {
  id?: string | number
  role?: string
  content: string
  thinkContent?: string
  contentHtml?: string
  thinkContentHtml?: string
  sendUserId?: string
  messageId?: string
  contentType?: number
  sendNickName?: string
  createTime?: string
  companyId?: string
  btnStr?: string | null
  btnClick?: boolean | null
  new?: boolean // 是否为新消息
  operateType?: number
  askList?: string[]
  likeStatus?: number
  isTip?: boolean
  isReport?: boolean
  files?: any[]
  markFileInfo?: any
  showThink?: boolean // 是否显示思考过程
}

interface ChatLoadReturn {
  loading: Ref<boolean>
  list: Ref<MessageItem[]>
  noStreamMessage: Ref<MessageItem>
  reset: () => void
  load: (init?: any) => Promise<any>
  updateList: (data: any) => void
  sendMessage: (data: any) => void
  close: () => void
}

interface ResponseData {
  code: number
  data: any
  expandData: any
  msg: string
}

/**
 *
 * @param api 请求消息记录接口
 * @param params 请求参数
 * @param replyCallback 消息回复回调
 * @returns
 */
export default function useChatLoad(api: any, params = {}, replyCallback?: () => void): ChatLoadReturn {
  const chatStore = useChatStore()
  const universalChatStore = useUniversalChatStore()
  const firstLoad = ref(true) // 是否为首次加载
  const router = useRouter()

  // 将 params 转换为响应式对象
  const requestParams = ref(params)

  function method(params: any) {
    return request.Get(`/app/chat`, { params })
  }
  const { onMessage, onError, on, send, close } = useSSE(method, {
    // immediate: true, // 立即发送请求
    initialData: {}, // 始时 data 的数据
    interceptByGlobalResponded: false // 现在数据不会被响应拦截
  })
  // 对应 eventsource 的 message 事件
  onMessage((res: any) => {
    const { data } = res
    handlerReply(data)
  })
  onError(() => {
    chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
    close()
  })
  // 流式输出结束
  on('complete', () => {
    chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
    close()
  })
  on('auth', (res: any) => {
    const { data } = res
    chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
    try {
      const json = JSON.parse(data)
      if (json.code === 4001) {
        Message.warning(json.msg)
        router.push({ name: 'Login', query: { redirect: `${window.location.pathname}${window.location.search}` } })
      }
    } catch (error) {
      console.log('auth', error)
    }
  })
  on('err', (err) => {
    console.log('err', err)
    chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
    universalChatStore.updateChatData({
      baseInfo: { ...universalChatStore.baseInfo, isActive: false },
      errorMsg: err?.data || ''
    })
  })

  /**
   * ws回复消息处理
   * @param data
   */
  const handlerReply = (data: string) => {
    const replay = JSON.parse(data)
    if (replay.code === 1) {
      if (replay.data && (replay.data.operateType === 3 || replay.data.operateType === 1)) {
        if (replay.data?.sessionId && replay.data.sessionId !== universalChatStore.sessionId) {
          // 不是当前会话的不添加
          console.log('非当前会话replay.data', replay.data)
          return
        }
        console.log('replay.data', replay.data)
        // 类型3/1 服务器返回消息
        chatStore.updateChatData({ showHandleRobot: false })
        if (replay.data.content) {
          try {
            const json = JSON.parse(replay.data.content)
            // eslint-disable-next-line max-depth
            if (json.err_no === 500) {
              Message.error(json.msg || '服务器错误，请重试。')
              return
            }
          } catch (error) {
            // 非流式输出 前端处理打字机效果
            noStreamMessage.value = { ...replay.data, copyMessage: replay.data.content }
            chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
            replyCallback && replyCallback()
          }
        }
        if (replay.data.stream) {
          // 流式输出
          const json = JSON.parse(replay.data.content)
          const find = list.value.find((item) => item.id === `${replay.data.messageId}-assistant`)
          let content = ''
          let thinkContent = ''
          let contentHtml = ''
          let thinkContentHtml = ''
          // 判断json.data是否为boolean 回答结束
          if (typeof json.data === 'boolean') {
            // 更新当前消息id
            chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
            replyCallback && replyCallback()
            console.log('回答结束')
            return
          }

          // 更新当前消息id
          chatStore.updateChatData({ currentMessageId: replay.data.messageId })
          // 判断json.answer中是否有think
          if (json.data?.answer?.includes('think')) {
            const think = json.data.answer.split('</think>')
            thinkContent = filterSpecialTags(think[0])
            const extractedContent = think.length === 2 ? think[1] : ''

            // 提取mark_file_info信息
            const { text, markFileInfo } = extractMarkFileInfo(extractedContent)
            content = text
            contentHtml = renderMarkdown(content)
            thinkContentHtml = renderMarkdown(thinkContent)

            /* eslint-disable max-depth */
            // 只有当内容非空时才进行渲染
            if (content || thinkContent || markFileInfo) {
              if (find) {
                // 相同messageId的消息体为后端控制流式输出，同一个消息id，会多次返回
                Object.assign(find, {
                  content,
                  thinkContent,
                  contentHtml,
                  thinkContentHtml,
                  showThink: true, // 默认显示思考过程
                  isReport: json.data.answer.includes('</mark_file>'),
                  markFileInfo: markFileInfo || null
                })
              } else {
                list.value.push({
                  id: `${replay.data.messageId}-assistant`,
                  role: 'assistant',
                  content,
                  thinkContent,
                  contentHtml,
                  thinkContentHtml,
                  showThink: true, // 默认显示思考过程
                  messageId: replay.data.messageId,
                  markFileInfo: markFileInfo || null
                })
              }
              replyCallback && replyCallback()
            }
          } else if (json.data?.answer?.length > 10) {
            // 提取mark_file_info信息
            const { text, markFileInfo } = extractMarkFileInfo(json.data.answer)
            content = text
            contentHtml = renderMarkdown(content)

            // 只有当内容非空时才进行渲染
            if (content || markFileInfo) {
              if (find) {
                // 相同messageId的消息体为后端控制流式输出，同一个消息id，会多次返回
                Object.assign(find, {
                  content,
                  contentHtml,
                  showThink: false, // 默认不显示思考过程
                  isReport: json.data.answer.includes('</mark_file>'),
                  markFileInfo: markFileInfo || null
                })
              } else {
                list.value.push({
                  id: `${replay.data.messageId}-assistant`,
                  role: 'assistant',
                  content,
                  contentHtml,
                  showThink: false, // 默认不显示思考过程
                  messageId: replay.data.messageId,
                  markFileInfo: markFileInfo || null
                })
              }
              replyCallback && replyCallback()
            }
          }
        } else {
          // 非流式输出 前端处理打字机效果
          noStreamMessage.value = { ...replay.data, copyMessage: replay.data.content }
          chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
          replyCallback && replyCallback()
        }
      }
      if (replay.data && replay.data.operateType === 2) {
        // 类型2 机器人回复等待状态 显示机器人动画
        chatStore.updateChatData({ showHandleRobot: true })
      }
      if (replay.data && replay.data.operateType === 6) {
        // 6 为快捷问题列表
        // list.value.push({ ...replay.data })
        replyCallback && replyCallback()
      }
    } else if (replay.code === 4001) {
      console.log('replay.code', replay.code)
      // 未登录处理
      chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
      Message.warning(replay.msg)
      const path = useUserStore().show3D ? '/login2' : '/login'
      router.push({ path })
    } else {
      chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
      Message.warning(replay.msg)
    }
  }

  const loading = ref(false)
  const noMore = ref(false)
  const pageParams = reactive({
    current: 1,
    pageSize: 5
  })
  const list = ref<MessageItem[]>([])
  const noStreamMessage = ref<MessageItem>({ content: '' }) // 非流式消息
  const load = (init = false) => {
    firstLoad.value = false
    return new Promise<any>((resolve, reject) => {
      if (init) {
        pageParams.current = 1
        list.value = []
        noMore.value = false
        loading.value = false
      }
      if (loading.value || noMore.value || !universalChatStore.sessionId) {
        reject(false)
        return
      }
      loading.value = true
      const cloneParams = Object.assign({}, requestParams.value, pageParams)
      api(cloneParams)
        .then((response: any) => {
          const { code, data, expandData, msg } = response as ResponseData
          if (code === 1) {
            if (data.length < pageParams.pageSize) {
              noMore.value = true
            }
            if (pageParams.current === 1) {
              list.value = []
            }
            const l = data.map((item: any) => {
              let thinkContent = ''
              let content = ''
              let contentHtml = ''
              let thinkContentHtml = ''
              try {
                const json = JSON.parse(item.content)
                if (item.role === 'user') {
                  content = item.content
                  contentHtml = renderMarkdown(content)
                } else if (json?.answer?.includes('think')) {
                  const think = json.answer.split('</think>')
                  thinkContent = filterSpecialTags(think[0])
                  const extractedContent = think.length > 1 ? think[1] : json.answer

                  // 提取mark_file_info信息
                  const { text, markFileInfo } = extractMarkFileInfo(extractedContent)
                  content = text
                  contentHtml = renderMarkdown(content)
                  thinkContentHtml = renderMarkdown(thinkContent)

                  // 如果提取到了文件信息，添加到item中
                  if (markFileInfo) {
                    item.markFileInfo = markFileInfo
                  }
                } else {
                  // 提取mark_file_info信息
                  const { text, markFileInfo } = extractMarkFileInfo(json.answer)
                  content = text
                  contentHtml = renderMarkdown(content)

                  // 如果提取到了文件信息，添加到item中
                  if (markFileInfo) {
                    item.markFileInfo = markFileInfo
                  }
                }
              } catch (error) {
                // 提取mark_file_info信息
                const { text, markFileInfo } = extractMarkFileInfo(item.content)
                content = text
                contentHtml = renderMarkdown(content)

                // 如果提取到了文件信息，添加到item中
                if (markFileInfo) {
                  item.markFileInfo = markFileInfo
                }
              }
              return {
                ...item,
                files: item?.fileList?.filter((file: any) => file) || [],
                id: `${item.id}-${item.role}`,
                messageId: item.id,
                // content: item.content.replace(/<img src="([^"]+)"[^>]*>/g, '<img src="$1" style="max-width: 100%; height: auto;">'),
                content: content,
                thinkContent: thinkContent,
                contentHtml: contentHtml,
                thinkContentHtml: thinkContentHtml,
                showThink: false, // 默认不显示思考过程
                isReport: item?.content?.includes('</mark_file>')
              }
            })
            // 历史消息添加到前面
            list.value.unshift(...l.reverse())
            pageParams.current += 1
            loading.value = false
            resolve(expandData)
          } else {
            loading.value = false
            Message.error(msg)
            reject(false)
          }
        })
        .catch((error: any) => {
          loading.value = false
          Message.error('加载失败')
          universalChatStore.updateChatData({
            baseInfo: { ...universalChatStore.baseInfo, isActive: false },
            errorMsg: error?.message || '加载失败'
          })
          reject(error)
        })
    })
  }

  const updateList = (data: any) => {
    if (data) {
      list.value = data
    }
  }

  const reset = () => {
    pageParams.current = 1
    list.value = []
    noMore.value = false
  }

  const sendMessage = (data: any) => {
    // data ==> content  sessionId
    const params = {
      ...data,
      userId: universalChatStore.userId,
      robotId: universalChatStore.visitKey
    }
    console.log('sendMessage', params)
    send(params)
  }

  onUnmounted(() => {
    reset()
    firstLoad.value = true
  })

  return {
    loading,
    list,
    noStreamMessage,
    reset,
    load,
    updateList,
    sendMessage,
    close
  }
}
