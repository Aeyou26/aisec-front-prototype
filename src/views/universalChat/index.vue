<template>
  <div v-if="loading" class="w-full h-full flex justify-center items-center">
    <a-spin :loading="loading" dot tip="加载中..."> </a-spin>
  </div>
  <div v-else class="w-full h-full flex">
    <!-- 添加一个全屏遮罩层 提示没有权限或者应用已经暂停服务 需要透明度 -->
    <div v-if="isShowMask" class="absolute top-0 left-0 w-full h-full bg-blue bg-opacity-50 flex items-center justify-center">
      <div class="flex flex-col items-center gap-24">
        <SvgIcon name="empty" :size="120" />
        <div class="text-white text-24">您未获取访问权限</div>
        <div class="text-white text-24">或应用已经暂停服务</div>
        <a-alert v-if="universalChatStore.errorMsg" type="error">{{ universalChatStore.errorMsg }}</a-alert>
        <a-link v-if="universalChatStore.baseInfo.controlType === 3" @click="goLogin">前往登录</a-link>
        <a-link v-if="universalChatStore.baseInfo.controlType === 2" @click="reload">重新加载</a-link>
      </div>
    </div>
    <template v-else>
      <!-- pc端菜单栏,移动端隐藏 -->
      <div v-if="!isMobile" class="h-full w-248 hidden flex flex-col">
        <div class="h-54 px-20 box-border w-full flex items-center gap-12">
          <img v-if="universalChatStore.baseInfo.logo" :src="`/api/sys/download?fileName=${universalChatStore.baseInfo.logo}`" class="w-28 h-28" />
          <div class="color-#3177C7 font-600 text-18">{{ universalChatStore.baseInfo.name }}</div>
        </div>
        <ChatHistory />
      </div>
      <div v-if="showPage" class="bg flex-1 chat-container">
        <div class="chat-content">
          <!-- 聊天窗口 -->
          <div class="h-100% pb-24 w-100%">
            <ChatWindow ref="chatWindowRef" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import ChatWindow from './components/chat-window.vue'
import request from '@/request'
import ChatHistory from './components/chat-history.vue'
import { useUniversalChatStore } from '@/store'
import { generateUniqueId } from '@/utils/generateId'

const universalChatStore = useUniversalChatStore()
const isShowMask = computed(() => !universalChatStore.baseInfo.isActive)
const chatWindowRef = ref<InstanceType<typeof ChatWindow> | null>(null)

const route = useRoute()
const router = useRouter()
const showPage = ref(false)
const loading = ref(true)
const code = ref<string>('')
const state = computed(() => universalChatStore.wxState)

const goLogin = () => {
  router.push({ name: 'Login', query: { redirect: `${window.location.pathname}${window.location.search}` } })
}
const reload = () => {
  location.reload()
}
// 获取企业微信回调回来的地址栏code
function getQueryVariable(variable: string) {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1])
    }
  }
  return null
}
const qyWeChat = () => {
  code.value = getQueryVariable('code') || ''
  if (!code.value) {
    // 没有code，跳转到企业微信授权页面
    request.Get<any>('/wx/cp/authorize').then((res) => {
      const authUrl = res?.data
      const urlParams = new URLSearchParams(authUrl.split('?')[1])
      universalChatStore.updateChatData({
        wxState: urlParams.get('state') || ''
      })
      window.location.replace(authUrl)
    })
    return
  }
  universalChatStore.updateChatData({
    wxState: getQueryVariable('state') || ''
  })
  // 有code，调用后端接口换取用户信息
  request
    .Get<any>(`/wx/cp/callback?code=${code.value}&state=${state.value}`)
    .then((res) => {
      if (res?.data) {
        // 存储企业微信用户信息 同时设置用户id
        universalChatStore.updateChatData({
          wxUserInfo: res.data,
          userId: res.data?.userId || universalChatStore.userId
        })
      } else {
        universalChatStore.updateChatData({
          baseInfo: { ...universalChatStore.baseInfo, isActive: false },
          errorMsg: res.msg || '获取企业微信用户信息失败'
        })
      }
    })
    .catch((err) => {
      universalChatStore.updateChatData({
        baseInfo: { ...universalChatStore.baseInfo, isActive: false },
        errorMsg: err?.message || '获取企业微信用户信息失败'
      })
    })
    .finally(() => {
      loading.value = false
    })
}
onMounted(() => {
  // 如果没有用户id 则生成用户id
  if (!universalChatStore.userId) {
    universalChatStore.updateChatData({
      userId: generateUniqueId()
    })
  }
  // 路径上没有key则将本地的添加到路径上
  if (!route.query.key && universalChatStore.visitKey) {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        key: universalChatStore.visitKey
      }
    })
  }
  if (route.query.key || universalChatStore.visitKey) {
    if (universalChatStore.visitKey !== route.query.key) {
      universalChatStore.updateChatData({
        sessionId: ''
      })
    }
    if (route.query.key) {
      universalChatStore.updateChatData({
        visitKey: route.query.key as string
      })
    }
    // 通过key查询数字人信息
    request
      .Get<any>(`/digital/human/info?key=${route.query.key || universalChatStore.visitKey}`)
      .then((res: any) => {
        if (res.data) {
          universalChatStore.updateChatData({
            baseInfo: {
              ...res.data,
              guideProblemList: res.data?.guideProblemList || [],
              knowledgeEntities: res.data?.knowledgeEntities || []
            }
          })
          if (res.data?.name) {
            document.title = res.data.name
          }
          if (isShowMask.value) {
            loading.value = false
            return
          }
          // 判断controlType是否为2 如果是2则跳转企业微信登录 （1:不控制，2：企业用户 3：系统用户）
          if (res.data.controlType === 2) {
            qyWeChat()
          } else {
            loading.value = false
          }
        }
      })
      .finally(() => {
        showPage.value = true
      })
  } else {
    // 对接使用 先直接显示
    showPage.value = true
  }
  window.addEventListener('resize', checkIfMobile) // 添加窗口大小变化的监听
})

const isMobile = ref(window.innerWidth <= 768) // 判断是否为移动端
const checkIfMobile = () => {
  isMobile.value = window.innerWidth <= 768 // 根据窗口宽度判断
}

onUnmounted(() => {
  window.removeEventListener('resize', checkIfMobile) // 移除监听
})

provide('isMobile', isMobile)
</script>

<style scoped lang="less">
.chat-container {
  width: 100%;
  height: 100%;

  .chat-content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
}

.bg {
  width: 100%;
  height: calc(100%);
  background: url('@/assets/images/chat-bg.png') no-repeat center center;
  border-radius: 24px 0 0;
  background-size: cover;
  overflow: auto;
}
</style>
