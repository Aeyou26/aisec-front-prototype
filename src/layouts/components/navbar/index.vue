<template>
  <div class="h-48 pr-40 flex justify-between items-center">
    <div class="flex items-center justify-center pl-38" :class="{ '!pl-12': collapsed }">
      <div v-if="showHeaderInfo" class="flex items-center gap-x-10 cursor-pointer" @click="handleClick">
        <img v-if="bigLogo && !collapsed" :src="bigLogo" alt="logo" class="max-w-168 max-h-38" />
        <component :is="useIcon(headerLogo, { width: 96, height: 28 })" v-if="!bigLogo && !collapsed" />
        <img v-if="smallLogo && collapsed" :src="smallLogo" alt="logo" class="w-26 h-26" />
        <img v-if="!smallLogo && collapsed" src="@/assets/images/avatar-logo.png" alt="logo" class="w-26" />
      </div>
    </div>
    <div class="flex justify-end items-center gap-x-18">
      <a-trigger trigger="click" :unmount-on-close="false">
        <a-tooltip
          :content="notice || '暂无通知'"
          position="bottom"
          background-color="#FFFFFF"
          :content-style="{ color: '#333333', fontSize: '14px', fontWeight: '500', boxShadow: '0 8px 24px 0 #00266914', padding: '12px 20px', borderRadius: '10px' }"
        >
          <div v-if="showHeaderInfo" class="flex items-center gap-x-10 cursor-pointer">
            <component :is="useIcon('notice', { size: 16 })" />
            <div v-if="notice" class="max-w-280 truncate text-14 text-#333333">{{ notice }}</div>
          </div>
        </a-tooltip>
        <template #content>
          <a-list class="bg-white">
            <template #header>通知列表</template>
            <a-list-item v-for="item in riskList" :key="item.id">
              <div class="flex items-center justify-between gap-x-10">
                <div class="flex items-center gap-x-10">
                  <component :is="useIcon('notice', { size: 16 })" />
                  <div class="max-w-280 truncate text-14 text-#333333">{{ item.msg }}</div>
                </div>
                <div class="text-12 text-#999999">{{ item.createTime }}</div>
              </div>
            </a-list-item>
          </a-list>
        </template>
      </a-trigger>
      <!-- 快捷工具 -->
      <QuickTools />

      <a-dropdown trigger="click" position="br" :popup-max-height="400">
        <div class="flex items-center gap-x-10 cursor-pointer">
          <div class="w-28 h-28 rounded-full overflow-hidden">
            <SvgIcon name="user-icon" size="28" />
          </div>
          <div class="text-14 text-#303544">{{ realName }}</div>
          <component :is="useIcon('down-arrow', { width: 12, height: 8 })" />
        </div>
        <template #content>
          <a-doption @click="jump('/home')">
            <a-space>
              <SvgIcon name="chat-bot" size="18" />
              <span>AI中心</span>
            </a-space>
          </a-doption>
          <a-doption @click="jump('/largescreen')">
            <a-space>
              <SvgIcon name="chat-screen" size="18" />
              <span>智能大屏</span>
            </a-space>
          </a-doption>
          <a-doption v-if="['888', '999'].includes(userId || '') || isDev" @click="goAdmin">
            <a-space>
              <SvgIcon name="sys-setting" size="18" />
              <span>系统设置</span>
            </a-space>
          </a-doption>
          <a-doption @click="logout()">
            <a-space>
              <SvgIcon name="logout" size="18" />
              <span>退出登录</span>
            </a-space>
          </a-doption>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import QuickTools from '../quickTools/index.vue'
import useIcon from '@/hooks/useIcon'
import useUser from '@/hooks/user'
import http from '@/request'

interface NoticeItem {
  id: string
  msg: string
  type: string
  createTime: string
}

const userStore = useUserStore()
const appStore = useAppStore()
const chatStore = useChatStore()
const collapsed = computed(() => appStore.menuCollapse)
const { realName, userId, enterpriseInfo } = storeToRefs(userStore)
const route = useRoute()
const showHeaderInfo = computed(() => {
  return route.path !== '/home'
})
const bigLogo = computed(() => {
  if (enterpriseInfo?.value?.logo) {
    return `/api/sys/download?fileName=${enterpriseInfo.value.logo}`
  }
  return ''
})
const smallLogo = computed(() => {
  if (enterpriseInfo?.value?.icon) {
    return `/api/sys/download?fileName=${enterpriseInfo.value.icon}`
  }
  return ''
})
const headerLogo = computed(() => {
  if (route.fullPath.includes('/admin')) {
    return 'cnns-logo'
  }
  if (chatStore.currentInfo.logo) {
    return `header-${chatStore.currentInfo.logo}`
  }
  return 'cnns-logo'
})

const riskList = ref<NoticeItem[]>([])
// 随机从riskList中取一条
const notice = ref('')
const noticeInterval = ref<any>()
const getListInterval = ref<any>() // 新增getList定时器引用

const startNoticeInterval = () => {
  noticeInterval.value = setInterval(() => {
    notice.value = riskList.value[Math.floor(Math.random() * riskList.value.length)].msg
  }, 15 * 1000)
}
const getList = () => {
  const params = {
    day: 7,
    limit: 10
  }
  http.Get<any>('/notice/list', { params }).then((res) => {
    if (res?.data?.length > 0) {
      // 过滤msg为空的数据
      riskList.value = res.data?.filter((item: any) => item.msg)
      notice.value = riskList.value[0].msg
      startNoticeInterval()
    }
  })
}

const { logout } = useUser()
const router = useRouter()

const handleClick = () => {
  router.push('/home')
}
const isDev = import.meta.env.VITE_APP_ENV === 'development'
const goAdmin = () => {
  if (isDev) {
    userStore.setPermissionList(['superAdmin'])
    router.push('/admin/aisec/robotList')
    return
  }
  // 888 超级管理员   999 管理员
  if (userId?.value === '888') {
    userStore.setPermissionList(['superAdmin'])
    router.push('/admin/aisec/robotList')
  } else if (userId?.value === '999') {
    userStore.setPermissionList(['admin'])
    router.push('/admin/knowledgeManage/knowledge')
  }
}

const jump = (path: string) => {
  router.push(path)
}

onMounted(() => {
  getList()
  // 每5分钟调用一次getList
  getListInterval.value = setInterval(
    () => {
      getList()
    },
    5 * 60 * 1000
  )
})

onUnmounted(() => {
  clearInterval(noticeInterval.value)
  clearInterval(getListInterval.value) // 清除getList定时器
})
</script>
