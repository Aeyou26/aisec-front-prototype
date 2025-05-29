<template>
  <a-config-provider>
    <template #empty="scope">
      <a-empty v-if="scope?.component === 'table'" in-config-provider>
        <template #image>
          <SvgIcon name="empty" size="150" />
        </template>
        <div class="text-16 text-#999999">暂无数据</div>
      </a-empty>
      <a-empty v-else in-config-provider>
        <template #image>
          <SvgIcon name="empty" size="80" />
        </template>
        <div class="text-16 text-#999999">暂无数据</div>
      </a-empty>
    </template>
    <router-view class="w-screen h-screen" />
  </a-config-provider>
</template>

<script lang="ts" setup>
const userStore = useUserStore()
const { enterpriseInfo } = storeToRefs(userStore)
// 设置网页图标和标题
const setWebInfo = () => {
  const favicon = document.getElementById('favicon') as HTMLLinkElement
  if (favicon && enterpriseInfo?.value?.logo) {
    favicon.href = `/api/sys/download?fileName=${enterpriseInfo.value.icon}`
  }
  // if (enterpriseInfo?.value?.name) {
  //   document.title = `网络安全智能体 - ${enterpriseInfo.value.name}`
  // }
}

onMounted(() => {
  setWebInfo()
})
</script>
