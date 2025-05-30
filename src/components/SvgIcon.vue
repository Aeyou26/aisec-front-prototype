<template>
  <svg aria-hidden="true" :class="cls" :stroke="stroke" :stroke-opacity="strokeOpacity" :stroke-width="strokeWidth" :fill-opacity="fillOpacity" :style="innerStyle">
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script lang="ts" setup name="SvgIcon">
import { computed, CSSProperties } from 'vue'
import { getPrefixCls } from '@arco-design/web-vue/es/_utils/global-config'

const props = defineProps({
  prefix: {
    type: String,
    default: 'icon'
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#333'
  },
  size: {
    type: [Number, String],
    default: 24
  },
  // 描边的厚度
  strokeWidth: {
    type: [Number, String],
    default: 0
  },
  // 描边的颜色
  stroke: {
    type: String,
    default: '#333'
  },
  // 描边的透明度
  strokeOpacity: {
    type: [Number, String],
    default: 1
  },
  // 填充透明度
  fillOpacity: {
    type: [Number, String],
    default: 1
  },
  rotate: {
    type: Number,
    default: 0
  },
  spin: Boolean
})
const innerStyle = computed(() => {
  const styles: CSSProperties = {}
  if (props.size) {
    styles.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size
  }
  styles.color = props.color
  styles.fill = props.color
  if (props.rotate) {
    styles.transform = `rotate(${props.rotate}deg)`
  }
  return styles
})
const prefixCls = getPrefixCls('icon')
const cls = computed(() => [
  prefixCls,
  {
    [`${prefixCls}-loading`]: props.spin
  },
  props.name
])
const symbolId = computed(() => `#${prefixCls}-${props.name}`)
</script>
