<template>
  <div vertical class="flex flex-col w-full h-full overflow-hidden p-24 gap-40" :class="{ '!h-[calc(100%-172px)]': showTop }">
    <div class="w-full flex-1 flex flex-col gap-20 overflow-hidden px-28 py-20 rounded-20 bg-#fff shadow">
      <div
        v-if="$slots.top || $slots.action"
        class="w-full overflow-hidden flex items-start"
        :class="{ 'justify-between': $slots.action && $slots.top, 'justify-end': !$slots.action || !$slots.top }"
      >
        <slot name="action" />
        <slot name="top" />
      </div>
      <div class="w-full flex-1 overflow-hidden">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  showTop: {
    type: Boolean,
    default: false
  }
})
</script>
<style lang="less" scoped></style>
