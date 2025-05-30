<template>
  <a-layout>
    <a-layout-header>
      <LayoutNavbar />
    </a-layout-header>
    <a-layout style="height: calc(100% - 48px)">
      <LayoutSider />
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import LayoutSider from './components/sider/index.vue'
import LayoutNavbar from './components/navbar/index.vue'
import http from '@/request'

const userStore = useUserStore()
const getChatModel = () => {
  http.Get('/model/select').then((res: any) => {
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
  getChatModel()
})
</script>

<style scoped lang="less">
.layout-content {
  width: 100%;
  height: calc(100vh - 48px);
  background: url('@/assets/images/chat-bg.png') no-repeat center center;
  border-radius: 24px 0 0;
  background-size: cover;
  overflow: auto;
}
</style>
