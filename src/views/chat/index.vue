<template>
  <div class="chat-container">
    <div class="chat-content">
      <!-- 聊天窗口 -->
      <div class="h-100% pb-24 w-100% min-w-960">
        <ChatWindow ref="chatWindowRef" :robot-info="robotInfo" />
      </div>
      <!-- 右侧悬浮内容 -->
      <div v-if="rightMenuList.length" class="chat-right flex flex-col items-center overflow-hidden">
        <div class="px-18 pt-28 pb-20 bg-#2E66C7">
          <component :is="useIcon('chat-logo-w', { height: 18, width: 32, color: '#fff' })" class="cursor-pointer" @click="handleClick()" />
        </div>
        <div class="w-full py-20 px-10 flex flex-col items-center gap-20">
          <template v-for="(item, index) in rightMenuList" :key="index">
            <a-tooltip
              position="left"
              background-color="#FFFFFF"
              :content-style="{ color: '#333333', fontSize: '14px', fontWeight: '500', boxShadow: '0 8px 24px 0 #00266914', padding: '12px 20px', borderRadius: '10px' }"
            >
              <template #content>
                <div>
                  <div class="text-12 text-center max-w-170 text-left leading-20 cursor-pointer">{{ item.useScene }}</div>
                </div>
              </template>
              <div
                class="text-14 text-center leading-20 cursor-pointer break-all select-none"
                :class="item.id === robotInfo.abilityId ? 'text-#2E66C7' : 'text-#3D3D3D'"
                @click="handleRightMenuClick(item)"
              >
                {{ item.name }}
              </div>
            </a-tooltip>
            <div v-if="index !== rightMenuList.length - 1" class="h-1 bg-#99999980 w-full"></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatWindow from './components/chat-window.vue'
import useIcon from '@/hooks/useIcon'

const router = useRouter()
const chatStore = useChatStore()
const chatWindowRef = ref<InstanceType<typeof ChatWindow> | null>(null)
const robotInfo = computed(() => chatStore.currentInfo)

const rightMenuList = computed(() => robotInfo.value.abilityList || [])

const handleRightMenuClick = (item: any) => {
  // 清空当前能力 新建会话
  // chatStore.updateChatData({ lastNewSessionTime: Date.now(), currentInfo: { ...chatStore.currentInfo, abilityId: '' } })
  chatStore.updateChatData({
    currentInfo: {
      ...robotInfo.value,
      abilityId: item.id
    }
  })
}

const handleClick = () => {
  // router.push('/home')
  // 清空当前能力
  chatStore.updateChatData({
    currentInfo: {
      ...robotInfo.value,
      abilityId: ''
    }
  })
}

onMounted(() => {
  // 如果机器人id为空，则跳转到首页 仅会在用户点击浏览器回退时触发
  if (!robotInfo.value.robotId) {
    router.push('/home')
  }
})
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

    .right-triangle {
      border-top: 16px solid transparent;
      border-bottom: 16px solid transparent;
      border-left: 16px solid #f7fafd;
      position: absolute;
      right: -34px;
      top: 2px;
    }

    .chat-left {
      position: absolute;
      top: 50%;
      left: 28px;
      transform: translateY(-50%);
      width: 68px;
      height: 450px;
      border-radius: 14px;
      opacity: 1;
      background: #fbfbfd;
      box-shadow: 10px 0 20px 0 #06255a14;
    }

    .suspension-box {
      position: absolute;
      top: 50%;
      left: 18px;
      transform: translateY(-50%);
      z-index: 9999;
      width: 250px;
      border-radius: 14px;
      opacity: 1;
      background: #fbfbfd;
      box-shadow: 10px 0 20px 0 #06255a14;
      min-height: 400px;

      .content-box {
        text-align: left !important;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .suspension-box-scroll {
      height: 500px;
      overflow-y: auto;
      width: 100%;
      text-align: center;
    }

    .chat-right {
      position: absolute;
      right: 28px;
      top: 50%;
      transform: translateY(-50%);
      width: 58px;
      border-radius: 14px;
      opacity: 1;
      background: #fbfbfd;
      box-shadow: 10px 0 20px 0 #06255a14;
    }
  }
}
</style>
