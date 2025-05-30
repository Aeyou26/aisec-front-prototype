<template>
  <div class="flex items-center justify-center h-full">
    <a-empty>
      <template #image>
        <SvgIcon v-if="isEchart" name="empty-echart" :size="imgSize" />
        <SvgIcon v-else name="empty" :size="imgSize" />
      </template>
      <div v-if="showDescription" class="text-16 text-#999999 mt-16">{{ description }}</div>
    </a-empty>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    description?: string
    imgSize?: number
    showDescription?: boolean
    isEchart?: boolean
  }>(),
  {
    description: '暂无数据',
    imgSize: 80,
    showDescription: true,
    isEchart: false
  }
)
</script>
