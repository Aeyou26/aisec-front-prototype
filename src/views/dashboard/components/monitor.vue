<template>
  <div class="bg-#ffffffff rounded-14 box-border pl-40 py-28 flex flex-col h-full min-h-200">
    <div class="text-#333333 text-18 mb-24 font-bold flex items-center gap-8">
      <div class="h-full w-4 bg-#2e66c7 rounded-14"></div>
      资产监测
    </div>
    <div class="flex-1 flex flex-col overflow-y-auto gap-y-24">
      <template v-if="list.length > 0">
        <div v-for="(item, index) in list" :key="index" class="pr-28 flex flex-col gap-y-12">
          <div class="flex items-center">
            <SvgIcon name="dashboard-record" class="cursor-pointer mr-10" color="#2E66C7" />
            <div class="color-#333333 text-14">
              <span class="font-medium color-#2468f2">{{ item.createTime }}</span>
              <span class="ml-10 truncate">{{ item.msg }}</span>
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

const getList = () => {
  const params = {
    type: '资产管理',
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

<style lang="less" scoped></style>
