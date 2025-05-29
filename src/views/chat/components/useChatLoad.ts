import { Message } from '@arco-design/web-vue'
import useWebsocket from '@/hooks/useWebsocket'
import type { Ref } from 'vue'
import { renderMarkdown, filterSpecialTags, extractMarkFileInfo } from '@/utils/md-convert-html'
import { useChatStore } from '@/store'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store'
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export interface MessageItem {
  id?: string | number
  role?: string
  content: string
  thinkContent?: string
  contentHtml?: string
  thinkContentHtml?: string
  knowledgeContent?: string
  agentContent?: string
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
  noticeInfo?: any
  status?: number | null
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
  connect: () => Promise<boolean>
  close: () => void
}

interface ResponseData {
  code: number
  data: any
  expandData: any
  msg: string
}

const getWebSocketUrl = () => {
  // 本地开发环境配置链接后端地址使用
  if (import.meta.env.VITE_API_WS_URL) {
    return `${import.meta.env.VITE_API_WS_URL}`
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host // 自动获取当前域名和端口
  // 本地开发环境配置链接后端地址使用
  return `${protocol}//${host}/api/websocket`
}

const processMessageContent = (content: string) => {
  let thinkContent = ''
  let knowledgeContent = ''
  let agentContent = ''
  let contentHtml = ''
  let thinkContentHtml = ''

  // 处理知识库内容
  if (content.includes('<KnowDatabase>')) {
    const know = content.split('</KnowDatabase>')
    knowledgeContent = know[0].replace('<KnowDatabase>', '').trim()
    content = know.length === 2 ? know[1] : ''
  }

  // 处理数据库内容
  if (content.includes('<AgentDatabase>')) {
    const agent = content.split('</AgentDatabase>')
    agentContent = agent[0].replace('<AgentDatabase>', '').trim()
    content = agent.length === 2 ? agent[1] : ''
  }

  // 处理思考过程
  if (content.includes('think')) {
    const think = content.split('</think>')
    thinkContent = filterSpecialTags(think[0])
    content = think.length === 2 ? think[1] : ''
    thinkContentHtml = renderMarkdown(thinkContent)
  }

  // 提取mark_file_info信息
  const { text, markFileInfo, noticeInfo } = extractMarkFileInfo(content)
  content = text
  contentHtml = renderMarkdown(content)

  return {
    content,
    thinkContent,
    knowledgeContent,
    agentContent,
    contentHtml,
    thinkContentHtml,
    markFileInfo,
    noticeInfo
  }
}

const handleStreamMessageData = (json: any, replay: any, find: any, list: Ref<MessageItem[]>, callback?: () => void) => {
  const processedContent = processMessageContent(json.data.answer)
  const messageData = {
    ...processedContent,
    showThink: true,
    isReport: json.data.answer.includes('</mark_file>')
  }

  if (find) {
    Object.assign(find, messageData)
  } else {
    list.value.push({
      id: `${replay.data.messageId}-assistant`,
      role: 'assistant',
      messageId: replay.data.messageId,
      ...messageData
    })
  }
  callback && callback()
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
  const firstLoad = ref(true) // 是否为首次加载
  const router = useRouter()

  // 将 params 转换为响应式对象
  const requestParams = ref(params)
  /**
   * ws回复消息处理
   * @param data
   * @param manualDisConnect 是否为手动断开连接
   * @param firstConnect 是否为第一次连接
   */
  const handlerReply = (data: string, manualDisConnect: boolean, firstConnect: boolean) => {
    const replay = JSON.parse(data)
    if (replay.code === 1) {
      if (!manualDisConnect && !firstConnect && !replay.data) {
        // 非手动断开且非初始化连接 重新加载历史消息
        console.log('in reconnect load data---------------')
        load(true).then(() => {
          replyCallback && replyCallback()
        })
      }
      if (replay.data) {
        if (replay.data?.sessionId && replay.data.sessionId !== chatStore.sessionId) {
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
          const find = list.value.find((item) => item.id === `${replay.data.messageId}-assistant`)
          const processedContent = processMessageContent(json.data.answer)

          if (
            processedContent.content ||
            processedContent.thinkContent ||
            processedContent.knowledgeContent ||
            processedContent.agentContent ||
            processedContent.markFileInfo ||
            processedContent.noticeInfo
          ) {
            handleStreamMessageData(json, replay, find, list, replyCallback)
          }
        } else {
          // 非流式输出 前端处理打字机效果
          noStreamMessage.value = { ...replay.data, copyMessage: replay.data.content }
          chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
          replyCallback && replyCallback()
        }
      }
      // if (replay.data && replay.data.operateType === 2) {
      //   // 类型2 机器人回复等待状态 显示机器人动画
      //   chatStore.updateChatData({ showHandleRobot: true })
      // }
      // if (replay.data && replay.data.operateType === 6) {
      //   // 6 为快捷问题列表
      //   // list.value.push({ ...replay.data })
      //   replyCallback && replyCallback()
      // }
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
  const { token, chatModel } = storeToRefs(useUserStore())
  const { connect, send, close } = useWebsocket(`${getWebSocketUrl()}?Authorization=${token.value}`, handlerReply)

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
      if (loading.value || noMore.value) {
        reject(false)
        return
      }
      // 如果sessionId为空，则返回false
      if (!chatStore.sessionId || chatStore.sessionId === 'menuClick') {
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
              let knowledgeContent = ''
              let agentContent = ''

              try {
                const json = JSON.parse(item.content)
                if (item.role === 'user') {
                  content = item.content
                  contentHtml = renderMarkdown(content)
                } else {
                  let answer = json?.answer || ''

                  // 处理知识库内容
                  if (answer.includes('<KnowDatabase>')) {
                    const know = answer.split('</KnowDatabase>')
                    knowledgeContent = know[0].replace('<KnowDatabase>', '').trim()
                    answer = know.length === 2 ? know[1] : ''
                  }

                  // 处理数据库内容
                  if (answer.includes('<AgentDatabase>')) {
                    const agent = answer.split('</AgentDatabase>')
                    agentContent = agent[0].replace('<AgentDatabase>', '').trim()
                    answer = agent.length === 2 ? agent[1] : ''
                  }

                  // 处理思考过程
                  if (answer.includes('think')) {
                    const think = answer.split('</think>')
                    thinkContent = filterSpecialTags(think[0])
                    answer = think.length === 2 ? think[1] : ''
                    thinkContentHtml = renderMarkdown(thinkContent)
                  }

                  // 提取mark_file_info信息
                  const { text, markFileInfo, noticeInfo } = extractMarkFileInfo(answer)
                  content = text
                  contentHtml = renderMarkdown(content)

                  // 如果提取到了文件信息，添加到item中
                  if (markFileInfo) {
                    item.markFileInfo = markFileInfo
                  }

                  // 如果提取到了通知信息，添加到item中
                  if (noticeInfo) {
                    item.noticeInfo = noticeInfo
                  }
                }
              } catch (error) {
                // 提取mark_file_info信息
                const { text, markFileInfo, noticeInfo } = extractMarkFileInfo(item.content)
                content = text
                contentHtml = renderMarkdown(content)

                // 如果提取到了文件信息，添加到item中
                if (markFileInfo) {
                  item.markFileInfo = markFileInfo
                }

                // 如果提取到了通知信息，添加到item中
                if (noticeInfo) {
                  item.noticeInfo = noticeInfo
                }
              }

              return {
                ...item,
                files: item?.fileList?.filter((file: any) => file) || [],
                id: `${item.id}-${item.role}`,
                messageId: item.id,
                content,
                thinkContent,
                knowledgeContent,
                agentContent,
                contentHtml,
                thinkContentHtml,
                showThink: (thinkContent && !content) || false,
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
        .catch((error: unknown) => {
          loading.value = false
          Message.error('加载失败')
          reject(error)
        })
    })
  }
  // 原本AI运维平台更新列表逻辑
  // const updateList = (messageId: string, data: any) => {
  //   const find = list.value.find((item) => item.messageId === messageId)
  //   if (find) {
  //     Object.assign(find, data)
  //   }
  // }

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
    const params = {
      ...data,
      functionName: chatModel.value?.function_name,
      maxLenInput: chatModel.value?.max_len_input,
      modelName: chatModel.value?.model_name,
      url: chatModel.value?.url,
      key: chatModel.value?.key
    }
    console.log('sendMessage', params)
    send(
      JSON.stringify(params, function (key, value) {
        if (typeof value === 'string') {
          return value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }
        return value
      })
    )
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
    connect,
    close
  }
}
