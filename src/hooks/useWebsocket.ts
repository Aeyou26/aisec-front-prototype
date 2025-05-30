import { Message } from '@arco-design/web-vue'

const chatStore = useChatStore()
/**
 *
 * @param url
 * @param handlerMessage 接收到的信息处理方式
 * @returns
 */
export default function useWebsocket(url: string, handlerMessage: (data: string, manualDisConnect: boolean, firstConnect: boolean) => void) {
  console.log('url', url)
  const ws = ref<WebSocket | null>(null)
  let reconnectTimer: any = null
  const reconnectInterval = 3000 // 重连间隔时间，单位为毫秒
  const manualDisConnect = ref(false) // 是否为手动断开
  const firstConnect = ref(true)
  const connect = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        return
      }

      try {
        ws.value = new WebSocket(url)

        ws.value.onopen = () => {
          // 增加容错 连接成功后 清空当前消息id
          chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
          console.log('ws连接成功')
          resolve(true)
        }
        ws.value.onmessage = (event) => {
          // console.log('message---', event)
          handlerMessage(event.data, manualDisConnect.value, firstConnect.value)
          firstConnect.value = false
        }
        ws.value.onclose = (event) => {
          console.log('event-close', manualDisConnect.value, event)
          chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
          if (event?.reason?.includes('big')) {
            Message.error('消息过大，建议使用文件上传')
          }
          if (!manualDisConnect.value) {
            reconnect()
          }
        }
        ws.value.onerror = function (error) {
          console.error('WebSocket error occured: ', error)
          chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
        }
      } catch (err) {
        chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
        reject(err)
        console.log('ws连接失败', err)
      }
    })
  }

  const send = async (message: any) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      //   await connect()
      //   throw new Error('Not connected to the server')
    }
    console.log('send', message)
    ws.value?.send(JSON.stringify(message))
  }

  const close = () => {
    console.log('我要断开了')
    chatStore.updateChatData({ currentMessageId: '', showHandleRobot: false })
    manualDisConnect.value = true
    ws.value?.close()
  }

  const reconnect = () => {
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
      console.log('我要重新连接了')
      connect()
    }, reconnectInterval)
  }
  return {
    connect,
    send,
    close
  }
}
