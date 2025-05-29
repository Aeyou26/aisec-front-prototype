<template>
  <div class="home-container">
    <Navbar />
    <div class="flex flex-col items-center h-[calc(100vh-48px)]">
      <div class="text-40 font-bold text-#333333 mb-20 tracking-8">智能体中心</div>
      <div class="text-14 text-#666666 pb-40">只需一个指令，唤醒你的智能助手</div>
      <a-spin
        :loading="loading"
        class="!flex !flex-wrap !items-center !justify-evenly !gap-y-100 !w-full px-[6%] pb-20 overflow-y-auto overflow-x-hidden !min-h-340 flex-1"
        dot
      >
        <div v-for="item in robotList" :key="item.id" class="flex items-center justify-center w-1/3 min-w340">
          <RobotItem :item="item" />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/layouts/components/navbar/index.vue'
import RobotItem from './components/robot-item.vue'
import request from '@/request'

interface RobotObject {
  id: string
  name: string
  useScene: string
  prolog?: string
  config?: string
  avatar?: string
  img?: string
  abilityList?: AbilityList[]
}

interface AbilityList {
  id?: string
  createBy?: string
  updateBy?: string
  createTime?: string
  updateTime?: string
  name?: string
  agentId?: string
  status?: number
  icon?: string
  useScene?: string
  knowledgebaseId?: string
  knowledgebaseName?: string
}

const userStore = useUserStore()
const chatStore = useChatStore()
const loading = ref(false)
const robotList = ref<RobotObject[]>([])

const getRobotList = async () => {
  loading.value = true
  request
    .Post<{ data: RobotObject[] }>('/user/robot/page')
    .then((res) => {
      robotList.value = res.data || []
      userStore.setRobotList(robotList.value)
      if (robotList.value.length && !chatStore?.currentInfo?.id) {
        // 默认设置第一个为当前机器人 防止用户通过路径跳转导致异常
        const findRobot = robotList.value[0]
        chatStore.updateChatData({
          currentInfo: {
            ...findRobot,
            // 因为原本没这些的时候使用了下面字段 所以需要兼容
            robotId: findRobot?.id,
            robotName: findRobot?.name,
            robotImg: findRobot?.avatar || '',
            abilityId: ''
          }
        })
      }
    })
    .finally(() => {
      loading.value = false
    })
}
const getChatModel = () => {
  request.Get('/model/select').then((res: any) => {
    if (res.data) {
      userStore.setChatModelList(res.data)
      // 查找当前模型的配置
      const model = userStore.chatModelList.find((item: any) => item.id === userStore.chatModel.id)
      // 如果列表中没有模型，则设置默认第一个模型
      if (userStore.chatModelList.length > 0 && !model) {
        userStore.setChatModel(userStore.chatModelList[0])
      }
      // 如果已经配置了 更新模型信息
      if (model) {
        userStore.setChatModel(model)
      }
    }
  })
}

onMounted(() => {
  // 防止直接进入网安机器人页面导致没获取模型列表
  getChatModel()
  // 获取机器人列表
  getRobotList()
  const current = JSON.stringify(chatStore.currentInfo)
  // 重置聊天状态
  chatStore.reset()
  chatStore.updateChatData({
    currentInfo: JSON.parse(current)
  })
})
</script>

<style scoped lang="less">
.home-container {
  width: 100%;
  height: 100%;
  background: url('@/assets/images/home-bg.png') no-repeat center center;
  background-size: cover;
}
</style>
