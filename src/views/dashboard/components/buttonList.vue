<template>
  <div class="flex flex-wrap gap-28">
    <div
      v-for="(item, index) in abilityList"
      :key="item.id"
      class="w-[calc(50%-14px)] h-123 flex items-center justify-between card px-32 cursor-pointer"
      @click="handleClick(item)"
    >
      <div class="flex items-center gap-x-10">
        <component :is="useIcon(iconList[index], { size: 58 })" class="cursor-pointer" />
        <div class="font-600 color-#333333 text-18">{{ item.name }}</div>
      </div>
      <component :is="useIcon('dashboard-right', { size: 24 })" class="cursor-pointer" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import useIcon from '@/hooks/useIcon'

const chatStore = useChatStore()

const abilityList = computed(() => chatStore.currentInfo.abilityList || [])

const iconList = ref(['dashboard-zcsb', 'dashboard-zcbg', 'dashboard-fxjc', 'dashboard-dwbg'])
const router = useRouter()
const handleClick = (item: any) => {
  chatStore.updateChatData({
    currentInfo: { ...chatStore.currentInfo, abilityId: item.id || '' }
  })
  router.push('/chat')
}
</script>

<style lang="less" scoped>
.card {
  border-radius: 14px;
  background: linear-gradient(180deg, #eff5ff 0%, #fff 100%);
  box-shadow: 0 8px 40px 0 #00266914;
}
</style>
