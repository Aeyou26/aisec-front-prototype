<template>
  <div class="pl-24 h-full">
    <div class="h-60 flex items-center text-16px gap-4 cursor-pointer" @click="handleNewSession">
      <SvgIcon name="menu-new-chat" class="icon-color !text-28px" />
      新建会话
    </div>
    <div class="line"></div>
    <div class="flex items-center text-16px gap-4 mb-20">
      <SvgIcon name="menu-chat" class="icon-color !text-24" />
      近期对话
    </div>
    <div class="suspension-box-scroll flex flex-col gap-20 pl-24 pr-6" :style="{ height: `calc(100% - 140px)` }">
      <div ref="contentRef" class="flex flex-col h-full">
        <div class="gap-10 flex flex-col">
          <div v-for="item in chatHistoryList" :key="item.id" class="flex flex-col gap-10 cursor-pointer" @click="handleListItemClick(item)">
            <div
              class="text-14 text-#666666 leading-20 content-box flex items-center justify-between"
              :class="item.id === universalChatStore.sessionId ? '!text-#2e66c7 py-4 pl-8 rounded-4 bg-#e8eff9' : 'ml-8 my-4'"
              @mouseenter="item.showActions = true"
              @mouseleave="item.showActions = false"
            >
              <div class="truncate max-w-160">{{ item.name }}</div>
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
          </div>
        </div>
        <div class="text-center py-10 text-12 text-#999999 mt-20 ml-[-48px]">--- 仅显示近 20 条对话 ---</div>
      </div>
    </div>
  </div>
  <EditChatTitle ref="editChatTitleRef" local />
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { confirmModal } from '@/utils/modal'
import { Message } from '@arco-design/web-vue'
import EditChatTitle from '@/layouts/components/menu/edit-chat-title.vue'
import { useUniversalChatStore } from '@/store'

const universalChatStore = useUniversalChatStore()
const chatStore = useChatStore()
const router = useRouter()

const editChatTitleRef = ref<InstanceType<typeof EditChatTitle> | null>(null)

const chatHistoryList = computed(() => {
  return universalChatStore.keyChatHistoryList[universalChatStore.visitKey]?.slice(0, 20) || []
})
const handleNewSession = () => {
  chatStore.updateChatData({ lastNewSessionTime: Date.now(), currentInfo: { ...chatStore.currentInfo, abilityId: '' } })
  // router.push({ name: 'universalChat' })
}

const handleListItemClick = (item: any) => {
  chatStore.updateChatData({
    currentMessageId: '',
    showHandleRobot: false
  })
  // 如果点击的是菜单，且没有sessionId 则设置sessionId为menuClick 用以设置新会话导致的不获取聊天记录
  if (!universalChatStore.sessionId) {
    universalChatStore.updateChatData({
      sessionId: 'menuClick'
    })
  }
  setTimeout(() => {
    universalChatStore.updateChatData({
      sessionId: item.id
    })
  }, 100)
}

const handleDelete = async (id: any) => {
  // 删除消息 弹出确认框
  await confirmModal('删除确认', '确认是否删除此会话？', 300)
  // 删除会话
  universalChatStore.keyChatHistoryList[universalChatStore.visitKey] = universalChatStore.keyChatHistoryList[universalChatStore.visitKey].filter((item) => item.id !== id)
  // 如果删除的是当前会话，则新建一个会话
  if (universalChatStore.sessionId === id) {
    handleNewSession()
  }
}
</script>

<style scoped lang="less">
.line {
  width: 100%;
  border-bottom: 1px solid #9993;
  margin-bottom: 20px;
}

.suspension-box-scroll {
  overflow-y: auto;
  width: 100%;
}
</style>
