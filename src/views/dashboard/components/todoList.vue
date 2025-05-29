<template>
  <div class="bg-#ffffff rounded-14 shadow-[0_8px_40px_0 #00266914] box-border flex flex-col h-full">
    <div class="px-24 py-12 flex flex-col gap-18 h-full">
      <div class="text-#333333 text-18 font-bold flex items-center gap-10">
        <div class="h-20 w-4 bg-#2e66c7 rounded-14"></div>
        <a-tabs v-model:active-key="currentTab" @change="getList()">
          <a-tab-pane v-for="item in tabsList" :key="item.value" :title="item.label"></a-tab-pane>
        </a-tabs>
      </div>
      <div class="flex-1 flex flex-col overflow-y-auto gap-y-24">
        <template v-if="list.length > 0">
          <div v-for="(item, index) in list" :key="index" class="pr-8 flex flex-col gap-y-12">
            <div class="flex items-center">
              <SvgIcon name="dashboard-todo" class="cursor-pointer mr-10" color="#2E66C7" />
              <div class="flex justify-between items-center">
                <div class="color-#333333 text-14 flex-1 truncate">
                  <span class="font-medium color-#2468f2">{{ item.createTime }}</span>
                  <span class="ml-10 truncate">{{ item.msg }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex-1 flex items-center justify-center">
            <Empty description="暂无数据" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import http from '@/request'

interface NoticeItem {
  id: string
  msg: string
  type: string
  createTime: string
}
const list = ref<NoticeItem[]>([])
const tabsList = [
  { label: '漏洞监测', value: '漏洞管理' },
  { label: '资产监测', value: '资产管理' }
]
const currentTab = ref('漏洞管理')
const getList = () => {
  const params = {
    type: currentTab.value,
    limit: 20
  }
  http.Get<any>('/notice/list', { params }).then((res) => {
    list.value = res.data || []
  })
}

onMounted(() => {
  getList()
})
</script>

<style lang="less" scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.arco-tabs) {
  .arco-tabs-tab {
    font-size: 18px !important;
    padding: 0 !important;
  }

  .arco-tabs-content {
    display: none !important;
  }
}
</style>
