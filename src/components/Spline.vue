<template>
  <canvas ref="containerRef" style="width: 100%; height: 100%"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
// @ts-ignore
import { Application } from '@splinetool/runtime'

const props = defineProps({
  scene: {
    type: String,
    required: true
  },
  onLoad: {
    type: Function,
    default: undefined
  },
  renderOnDemand: {
    type: Boolean,
    default: true
  },
  style: {
    type: Object,
    default: () => ({})
  }
})

const containerRef = ref<HTMLCanvasElement | null>(null)
const splineApp = ref<any | null>(null)

const emit = defineEmits([
  'error',
  'spline-mouse-down',
  'spline-mouse-up',
  'spline-mouse-hover',
  'spline-key-down',
  'spline-key-up',
  'spline-start',
  'spline-look-at',
  'spline-follow',
  'spline-scroll'
])

const initSpline = async () => {
  if (!containerRef.value) {
    return
  }

  try {
    // 清除之前的实例
    if (splineApp.value) {
      splineApp.value.dispose()
      splineApp.value = null
    }

    // 创建新实例
    const app = new Application(containerRef.value, {
      renderOnDemand: props.renderOnDemand
    })

    // 加载场景
    await app.load(props.scene)

    // 绑定事件
    app.addEventListener('mouseDown', (e: any) => emit('spline-mouse-down', e))
    app.addEventListener('mouseUp', (e: any) => emit('spline-mouse-up', e))
    app.addEventListener('mouseHover', (e: any) => emit('spline-mouse-hover', e))
    app.addEventListener('keyDown', (e: any) => emit('spline-key-down', e))
    app.addEventListener('keyUp', (e: any) => emit('spline-key-up', e))
    app.addEventListener('start', (e: any) => emit('spline-start', e))
    app.addEventListener('lookAt', (e: any) => emit('spline-look-at', e))
    app.addEventListener('follow', (e: any) => emit('spline-follow', e))
    app.addEventListener('scroll', (e: any) => emit('spline-scroll', e))

    splineApp.value = app

    // 调用onLoad回调
    if (props.onLoad) {
      props.onLoad(app)
    }
  } catch (error) {
    console.error('Failed to load Spline scene:', error)
    emit('error', error)
  }
}

// 当场景变更时重新加载
watch(
  () => props.scene,
  () => {
    initSpline()
  }
)

onMounted(() => {
  initSpline()
})

onUnmounted(() => {
  if (splineApp.value) {
    splineApp.value.dispose()
    splineApp.value = null
  }
})
</script>
