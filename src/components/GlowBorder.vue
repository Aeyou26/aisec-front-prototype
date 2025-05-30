<template>
  <div
    class="relative"
    :class="$props.class"
    :style="{
      borderRadius: `${borderRadius}px`,
      padding: `${borderWidth}px`
    }"
  >
    <div
      class="absolute inset-0 z-0 overflow-hidden"
      :style="{
        borderRadius: `${borderRadius}px`
      }"
    >
      <div
        class="absolute -inset-[100%] animate-spin-slow z-0"
        :style="{
          background: colors.length > 1 ? `conic-gradient(from 0deg, ${colors.join(', ')})` : colors[0],
          animationDuration: `${duration}s`
        }"
      ></div>
    </div>
    <div
      class="relative w-full h-full z-10 overflow-hidden"
      :style="{
        borderRadius: `${borderRadius - borderWidth}px`,
        background: '#000'
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    duration?: number
    color?: string | string[]
    borderRadius?: number
    borderWidth?: number
    class?: string
  }>(),
  {
    duration: 10,
    color: '#FFF',
    borderRadius: 10,
    borderWidth: 2,
    class: ''
  }
)

// 确保颜色总是数组格式
const colors = computed(() => {
  if (Array.isArray(props.color)) {
    return props.color
  }
  return [props.color]
})
</script>

<style scoped>
.animate-spin-slow {
  animation-name: spin;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
