<template>
  <div class="flex items-center rounded-14 box-border bg-#ffffff p-14">
    <div class="flex-1 flex flex-col items-center justify-center">
      <slot name="icon" />
      <div class="color-#999999 text-12">{{ title }}</div>
    </div>
    <div class="h-60 w-1 bg-#99999933"></div>
    <div class="flex flex-col flex-1 items-center justify-between h-full">
      <template v-for="(item, index) in list" :key="item.title">
        <a-trigger v-if="item?.list && item.list.length > 0" position="right" auto-fit-position :unmount-on-close="false">
          <div class="flex-1 flex flex-col justify-center items-center gap-12 cursor-pointer">
            <p class="text-36" :style="{ color: item.color }">{{ formatNum(item.value || 0) }}</p>
            <p class="text-14 text-#666666">{{ item.title }}</p>
          </div>
          <template #content>
            <div class="bg-#ffffff rounded-14 p-14 flex flex-col gap-12 shadow-[0_0_10px_0_rgba(0,0,0,0.3)]">
              <div v-for="(x, i) in item.list?.slice(0, 4)" :key="i" class="flex items-center gap-12">
                <div class="w-10 h-10 rounded-14" :style="{ backgroundColor: item.color }"></div>
                <div class="text-14 text-#333">{{ x }}</div>
              </div>
              <div v-if="item.list?.length > 4" class="text-14 text-#666666 w-full text-center">...</div>
            </div>
          </template>
        </a-trigger>
        <div v-else class="flex-1 flex flex-col justify-center items-center gap-12">
          <p class="text-28" :style="{ color: item.color }">{{ formatNum(item.value || 0) }}</p>
          <p class="text-14 text-#666666">{{ item.title }}</p>
        </div>
        <div v-if="index !== list.length - 1" class="w-60 h-1 bg-#99999933"></div>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { formatNum } from '@/utils/tools'

interface PropType {
  title: string
  textColor: string
  list: InfoItem[]
}

withDefaults(defineProps<PropType>(), {
  title: '资产信息',
  textColor: '#2e66c7',
  list: () => []
})

interface AssetStat {
  assets: number
  online: number
  risk: number
  fixed: number
  tdAlert: number
  tdHandle: number
  untreated: number
  vuln: number
}

type AssetStatKey = keyof AssetStat

interface InfoItem {
  title: string
  value: number
  key: AssetStatKey
  list?: any[]
  color: string
}
</script>
