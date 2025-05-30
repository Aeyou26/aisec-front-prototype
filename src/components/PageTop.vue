<template>
  <div class="flex p-24 !pb-0 gap-40">
    <div v-for="(item, index) in list" :key="index" class="flex justify-between p-28 !pb-0 flex-1 rounded-16" :style="{ background: item.bg }">
      <div class="flex flex-col gap-16">
        <span class="text-18 font-600 text-#333333">{{ item.name }}</span>
        <div class="text-48 font-bold" :style="{ color: item.color }">{{ formatNum(item.value) }}</div>
      </div>
      <component :is="useIcon(item.icon, { width: 180, height: 120 })" />
    </div>
  </div>
</template>

<script setup lang="ts">
import useIcon from '@/hooks/useIcon'
import { formatNum } from '@/utils/tools'

defineProps({
  list: {
    type: Array as PropType<any[]>,
    default: () => []
  }
})
</script>
