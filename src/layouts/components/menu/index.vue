<template>
  <a-menu
    v-model:selected-keys="selectedKeys"
    v-model:open-keys="openKeys"
    accordion
    :collapsed="collapsed"
    :auto-open-selected="true"
    :level-indent="40"
    :class="{
      'collapsed-menu': collapsed
    }"
    :style="{
      paddingTop: '4px',
      '--menu-item-mx': !collapsed ? '14px' : ''
    }"
    @collapse="handleCollapsed"
  >
    <div ref="menuRef">
      <a-menu-item v-if="collapsed" @click="handleCollapsed">
        <template #icon>
          <SvgIcon name="menu-collapsed" class="icon-color !text-24" />
        </template>
        展开
      </a-menu-item>
      <a-menu-item v-if="!isSystem" @click="handleNewSession">
        <template #icon>
          <SvgIcon name="menu-new-chat" class="icon-color !text-24" />
        </template>
        新建会话
      </a-menu-item>
      <template v-for="route in menus as MenuProps[]" :key="route.key">
        <a-menu-item v-if="!route.children || !route.children.length" :key="route.key" @click="goto(route)">
          <template #icon>
            <SvgIcon v-if="route.icon" :name="route.icon" class="icon-color !text-24" />
          </template>
          {{ route.label }}
        </a-menu-item>
        <a-sub-menu v-if="route.children && route.children.length" :key="route.key">
          <template #icon>
            <SvgIcon v-if="route.icon" :name="route.icon" class="icon-color !text-24" />
          </template>
          <template #title>
            {{ route.label || '' }}
          </template>
          <template #expand-icon-down>
            <icon-caret-down :size="10" />
          </template>
          <a-menu-item v-for="_route in route.children || []" :key="_route.key" @click="goto(_route)">
            {{ _route.label || '' }}
          </a-menu-item>
        </a-sub-menu>
      </template>
      <div v-if="!isSystem" class="h-1 bg-#99999933 mb-4 mx-24" :class="{ 'mx-4': collapsed, 'w-[calc(100%-48px)]': !collapsed }" />
      <a-menu-item v-if="collapsed && !isSystem" @click="handleMenuHover()">
        <!-- @mouseenter="handleMenuHover()" -->
        <template #icon>
          <SvgIcon name="menu-chat" class="icon-color !text-24" />
        </template>
        近期对话
      </a-menu-item>
    </div>
    <a-collapse v-if="!collapsed && !isSystem" :default-active-key="['1']" expand-icon-position="right" :bordered="false">
      <a-collapse-item key="1" :style="customStyle" @click="router.push('/chat')">
        <template #header>
          <div class="flex gap-8 text-14 text-#3333333">
            <SvgIcon name="menu-chat" />
            <div>近期对话</div>
          </div>
        </template>
        <div class="suspension-box-scroll flex flex-col gap-20 pr-6" :style="{ height: `${suspensionBoxHeight}px` }" @scroll="handleScroll">
          <div ref="contentRef" class="flex flex-col h-full">
            <div class="flex-1 gap-10 flex flex-col">
              <div v-for="(item, index) in chatHistoryList" :key="index" class="flex flex-col gap-10 cursor-pointer" @click="handleListItemClick(item)">
                <!-- 时间标签 -->
                <template v-if="item.isTimeLabel">
                  <div class="text-14 text-#999999 text-left font-medium">{{ item.name }}</div>
                </template>
                <!-- 普通列表项 -->
                <template v-else>
                  <div
                    class="text-14 text-#666666 leading-20 content-box flex items-center justify-between"
                    :class="item.id === chatStore.sessionId && router.currentRoute.value.name === 'chat' ? '!text-#2e66c7 py-4 pl-8 rounded-4 bg-#e8eff9' : 'ml-8 my-4'"
                    @mouseenter="item.showActions = true"
                    @mouseleave="item.showActions = false"
                  >
                    <div class="truncate max-w-160">{{ item.content }}</div>
                    <a-dropdown trigger="hover" position="br" :popup-max-height="400">
                      <icon-more-vertical v-if="item.showActions" />
                      <template #content>
                        <a-doption @click="editChatTitleRef?.openModal(item)">
                          <a-space>
                            <icon-edit />
                            <span>编辑</span>
                          </a-space>
                        </a-doption>
                        <a-doption @click="handleDelete(item.id)">
                          <a-space>
                            <icon-delete class="text-#FF4D4F" />
                            <span class="text-#FF4D4F">删除</span>
                          </a-space>
                        </a-doption>
                      </template>
                    </a-dropdown>
                  </div>
                </template>
              </div>
            </div>
            <div v-if="!loading && !hasMore && chatHistoryList.length > 0 && hasScrollbar" class="text-center py-10 text-12 text-#999999 mt-auto">没有更多了</div>
          </div>
        </div>
      </a-collapse-item>
    </a-collapse>
  </a-menu>
  <div v-if="!collapsed" class="absolute top-[-36px] right-16 flex cursor-pointer items-center justify-center">
    <SvgIcon name="collapsed" class="transition-transform duration-300" size="24" :class="{ '-rotate-180': collapsed }" @click="handleCollapsed" />
  </div>
  <EditChatTitle ref="editChatTitleRef" />
</template>

<script setup lang="ts">
import { _routes } from '@/router'
import { useAppStore } from '@/store'
import { listenerRouteChange } from '@/utils/route-listener'
import { generatorMenu } from '@/utils/route-util'
import { MenuProps } from 'menus'
import { useRouter } from 'vue-router'
import { confirmModal } from '@/utils/modal'
import EditChatTitle from './edit-chat-title.vue'
import request from '@/request'
import { Message } from '@arco-design/web-vue'

const editChatTitleRef = ref<InstanceType<typeof EditChatTitle> | null>(null)
const appStore = useAppStore()
const userStore = useUserStore()
const { userId } = storeToRefs(userStore)
const chatStore = useChatStore()
// 是否配置页面
const isSystem = computed(() => {
  return userStore.permissionList?.includes('system') || userStore.permissionList?.includes('admin') || userStore.permissionList?.includes('superAdmin')
})
const menus = computed(() => {
  const m = generatorMenu(_routes, userStore.permissionList || [])
  const find = m.find((item) => item.name === 'admin')
  let newM: any[] = m.filter((item) => item.name !== 'admin')
  if (find) {
    newM = [...newM, ...(find.children || [])]
  }
  return newM
})
function handleCollapsed() {
  appStore.updateSettings({ menuCollapse: !appStore.menuCollapse })
}
const collapsed = computed(() => appStore.menuCollapse)
const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])
const customStyle = {
  borderRadius: '6px',
  marginLeft: 'var(--menu-item-mx)',
  border: 'none',
  overflow: 'hidden'
}
// 监听会话标题的修改
watch(
  chatStore.chatSessionTitle,
  () => {
    // 查找id
    const index = chatHistoryList.value.findIndex((item) => item.id === chatStore.chatSessionTitle.id)
    if (index !== -1) {
      chatHistoryList.value[index].content = chatStore.chatSessionTitle.name
    } else {
      getChatList()
    }
  },
  { deep: true }
)

const router = useRouter()
const goto = (item: MenuProps) => {
  router.push({ name: item.name })
}
const handleNewSession = () => {
  chatStore.updateChatData({ sessionId: '', lastNewSessionTime: Date.now(), currentInfo: { ...chatStore.currentInfo, abilityId: '' } })
  router.push({ name: 'chat' })
}
const handleMenuHover = () => {
  router.push('/chat')
  // chatStore.updateChatData({ showHistoryRecord: true })
}
// 处理滚动加载
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const { scrollHeight, scrollTop, clientHeight } = target

  // 距离底部20px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 20 && hasMore.value && !loading.value) {
    page.value.current++
    getChatList(true)
  }
}

const handleListItemClick = (item: any) => {
  if (item.id === 'today' || item.id === 'recent' || item.id === 'ten_days_ago') {
    return
  }
  chatStore.updateChatData({
    currentMessageId: '',
    showHandleRobot: false,
    currentInfo: {
      ...chatStore.currentInfo,
      abilityId: ''
    }
  })
  router.push('/chat')
  // 如果点击的是菜单，且没有sessionId 则设置sessionId为menuClick 用以设置新会话导致的不获取聊天记录
  if (!chatStore.sessionId) {
    chatStore.updateChatData({
      sessionId: 'menuClick'
    })
  }
  setTimeout(() => {
    chatStore.updateChatData({
      sessionId: item.id
    })
  }, 100)
}
const handleDelete = async (id: any) => {
  // 删除消息 弹出确认框
  await confirmModal('删除确认', '确认是否删除此会话？')
  request
    .Delete(`/user/chat/session/${id}`)
    .then(() => {
      chatHistoryList.value = chatHistoryList.value.filter((item) => item.id !== id)
      Message.success('删除成功')
      // 如果删除的是当前会话，则新建一个会话
      if (chatStore.sessionId === id) {
        handleNewSession()
      }
    })
    .catch(() => {
      Message.error('删除失败')
    })
}
const page = ref({
  current: 1,
  pageSize: 20,
  total: 0
})
const chatHistoryList = ref<any[]>([])
const loading = ref(false)
const hasMore = computed(() => {
  return page.value.total > chatHistoryList.value.filter((item) => !item.isTimeLabel).length
})
// 获取聊天列表记录
const getChatList = (isLoadMore = false) => {
  if (!isLoadMore) {
    page.value.current = 1
    page.value.pageSize = 20
    page.value.total = 0
    chatHistoryList.value = []
  }
  if (loading.value) {
    return
  }
  loading.value = true

  request
    .Post<any>('/user/chat/sessions', {
      robotId: chatStore.currentInfo?.id,
      userId: userId?.value,
      ...page.value
    })
    .then((res) => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const threeDaysAgo = today - 3 * 24 * 60 * 60 * 1000
      const tenDaysAgo = today - 10 * 24 * 60 * 60 * 1000

      const formattedList: any[] = []
      let hasToday = isLoadMore ? chatHistoryList.value.some((item) => item.id === 'today') : false
      let hasRecent = isLoadMore ? chatHistoryList.value.some((item) => item.id === 'recent') : false
      let hasTenDaysAgo = isLoadMore ? chatHistoryList.value.some((item) => item.id === 'ten_days_ago') : false

      res?.data?.forEach((item: any) => {
        const itemDate = new Date(item.createTime).getTime()

        // 添加时间标签
        if (itemDate >= today && !hasToday) {
          formattedList.push({
            id: 'today',
            name: '今天',
            icon: '',
            content: '',
            time: item.createTime,
            isTimeLabel: true
          })
          hasToday = true
        } else if (itemDate >= threeDaysAgo && itemDate < today && !hasRecent) {
          formattedList.push({
            id: 'recent',
            name: '近3天',
            icon: '',
            content: '',
            time: item.createTime,
            isTimeLabel: true
          })
          hasRecent = true
        } else if (itemDate < threeDaysAgo && !hasTenDaysAgo) {
          formattedList.push({
            id: 'ten_days_ago',
            name: '十天前',
            icon: '',
            content: '',
            time: item.createTime,
            isTimeLabel: true
          })
          hasTenDaysAgo = true
        }

        // 添加聊天记录
        formattedList.push({
          id: item.id,
          name: '',
          icon: '',
          content: item.sessionName,
          time: item.createTime,
          showActions: false
        })
      })

      page.value.total = res.total
      chatHistoryList.value = isLoadMore ? [...chatHistoryList.value, ...formattedList] : formattedList
    })
    .finally(() => {
      loading.value = false
    })
}

listenerRouteChange((newRoute) => {
  const matched = newRoute.matched.filter((x) => x.name).map((x) => x.path)
  selectedKeys.value = matched
  openKeys.value = matched
}, true)

const menuRef = ref<HTMLElement | null>(null)
const hasScrollbar = ref(false)
const contentRef = ref<HTMLElement | null>(null)
const suspensionBoxHeight = ref(360)

// 添加ResizeObserver来监控菜单元素尺寸变化
let resizeObserver: ResizeObserver | null = null

// 计算菜单高度并设置suspensionBoxHeight
const calculateBoxHeight = () => {
  if (!menuRef.value) {
    return
  }
  // 获取菜单上半部分的高度
  const menuRefHeight = menuRef.value.offsetHeight
  // 窗口高度 - 菜单高度 - 底部预留空间
  const adjustedHeight = window.innerHeight - menuRefHeight - 120
  // 设置一个合理的最小高度
  suspensionBoxHeight.value = Math.max(200, adjustedHeight)
}

const checkScrollbar = () => {
  if (contentRef.value) {
    const { scrollHeight, clientHeight } = contentRef.value
    hasScrollbar.value = scrollHeight > clientHeight
  }
}

// 简单的防抖函数
function debounce(fn: Function, delay: number) {
  let timer: number | null = null
  return function () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      fn()
    }, delay)
  }
}

// 用防抖处理窗口大小变化事件
const handleResize = debounce(() => {
  calculateBoxHeight()
  checkScrollbar()
}, 200)

onMounted(() => {
  getChatList()

  calculateBoxHeight()

  // 设置ResizeObserver监听菜单元素尺寸变化
  resizeObserver = new ResizeObserver(() => {
    calculateBoxHeight()
  })

  if (menuRef.value) {
    resizeObserver.observe(menuRef.value)

    // 监听整个菜单容器
    const menuContainer = menuRef.value.closest('.arco-menu')
    if (menuContainer) {
      resizeObserver.observe(menuContainer)
    }
  }

  window.addEventListener('resize', handleResize)

  nextTick(() => {
    checkScrollbar()
  })
})

// 监听openKeys变化，可能会引起菜单高度变化
watch(openKeys, () => {
  nextTick(() => {
    calculateBoxHeight()
  })
})
watch(chatHistoryList, () => {
  nextTick(() => {
    checkScrollbar()
  })
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.collapsed-menu {
  width: 56px !important;

  :deep(.arco-menu-inner) {
    .arco-menu-item {
      display: flex;
      padding: 12px 0 !important;
      flex-direction: column;
    }
  }
}

:deep(.arco-collapse-item) {
  .arco-collapse-item-header-right {
    padding-right: 0 !important;
    padding-left: 20px;
    border: none !important;
    margin-right: var(--menu-item-mx);
  }

  .arco-collapse-item-icon-right {
    right: 6px !important;
  }

  .arco-collapse-item-content {
    background-color: transparent !important;
    padding-right: 0 !important;
    padding-left: 40px !important;
  }
}

.suspension-box-scroll {
  overflow-y: auto;
  width: 100%;
}

:deep(.arco-menu-inner) {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .arco-menu-item {
    justify-content: center;
    text-align: center;
    padding-left: 20px;
    margin: 0 var(--menu-item-mx);
    overflow: hidden;
    height: 52px;

    .arco-menu-title {
      text-align: left;
    }

    .arco-menu-icon {
      margin-right: 8px;
    }

    &.arco-menu-selected {
      border-radius: 10px;
      background: #f1f5fa;
      color: #2e66c7 !important;

      .arco-menu-icon {
        .icon-color {
          color: #2e66c7 !important;
        }
      }
    }
  }

  .arco-menu-inline {
    justify-content: center;
    text-align: center;
    margin: 0 var(--menu-item-mx);
    overflow: hidden;

    .arco-menu-inline-header {
      height: 52px;
      padding-left: 20px;

      &:hover {
        background: rgb(46 102 199 / 6%);
        border-radius: 10px;
      }

      .arco-menu-icon {
        margin-right: 8px;
      }
    }

    .arco-menu-item {
      padding-left: 38px;
      display: flex;
      align-items: center;
      justify-content: start;

      .arco-menu-indent-list {
        display: none;
      }

      .arco-menu-item-inner {
        text-align: left !important;
      }

      &.arco-menu-selected {
        border-radius: 10px;
        background: #f1f5fa;
        color: #2e66c7 !important;

        .arco-menu-icon {
          .icon-color {
            color: #2e66c7 !important;
          }
        }
      }
    }
  }
}
</style>
