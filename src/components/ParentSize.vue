<template>
  <div ref="container" style="position: relative; width: 100%; height: 100%">
    <slot v-if="ready" :height="height" :width="width"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide } from 'vue'

const props = defineProps({
  debounceTime: {
    type: Number,
    default: 300
  }
})

const container = ref<HTMLElement | null>(null)
const width = ref(0)
const height = ref(0)
const ready = ref(false)

let resizeObserver: ResizeObserver | null = null
let debounceTimeout: any = null

const updateDimensions = () => {
  if (container.value) {
    const rect = container.value.getBoundingClientRect()
    width.value = Math.floor(rect.width)
    height.value = Math.floor(rect.height)
    ready.value = true
  }
}

const debouncedUpdateDimensions = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  debounceTimeout = setTimeout(() => {
    updateDimensions()
  }, props.debounceTime)
}

onMounted(() => {
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(debouncedUpdateDimensions)
    if (container.value) {
      resizeObserver.observe(container.value)
    }
  } else {
    window.addEventListener('resize', debouncedUpdateDimensions)
  }
  // 初始化尺寸
  updateDimensions()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  } else {
    window.removeEventListener('resize', debouncedUpdateDimensions)
  }
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
})

// 提供尺寸给子组件
provide('parentSize', { width, height })
</script>
