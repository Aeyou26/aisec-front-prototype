<template>
  <div class="bg-#ffffff rounded-14 shadow-[0_8px_40px_0 #00266914] box-border">
    <div class="px-24 py-24 flex flex-col gap-18 h-full">
      <div class="flex items-center gap-10">
        <div class="w-4 h-20 bg-#2e66c7 rounded-14"></div>
        <div class="text-#333333 text-18 font-bold">漏洞来源趋势</div>
      </div>
      <div ref="chartContainer" class="flex-1">
        <VChart v-if="chartData.length > 0" :option="chartOption" :autoresize="true" style="width: 100%; height: 100%" />
        <Empty v-else description="暂无数据" is-echart />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import request from '@/request'
import { ref, computed, onMounted } from 'vue'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const chartContainer = ref<HTMLElement | null>(null)

// 数据
const chartData = ref<Array<{ name: string; data: number[] }>>([])
const dateLabels = ref<string[]>([])

// 图表配置
const chartOption = computed(() => ({
  color: ['#5470c6', '#91cc75', '#fac858', '#fc8452', '#3ba272', '#73c0de', '#9a60b4', '#ee6666', '#ea7ccc'],
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      let result = `${params[0].axisValue}<br/>`
      params.forEach((item: any) => {
        result += `${item.marker}${item.seriesName}: ${item.value}<br/>`
      })
      return result
    }
  },
  legend: {
    data: chartData.value.map((item) => item.name),
    top: 0,
    textStyle: {
      color: '#333333'
    }
  },
  grid: {
    left: '20',
    right: '40',
    bottom: '0',
    top: '30',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: dateLabels.value,
    axisLine: {
      lineStyle: {
        color: '#999999'
      }
    },
    axisLabel: {
      color: '#666666'
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#666666'
    },
    splitLine: {
      lineStyle: {
        color: '#eeeeee'
      }
    }
  },
  series: chartData.value.map((item) => ({
    name: item.name,
    type: 'line',
    data: item.data,
    // smooth: true, // 是否平滑
    symbol: 'circle',
    symbolSize: 6,
    emphasis: {
      focus: 'series'
    }
  }))
}))

// 获取数据
const getData = () => {
  request.Get('/user/asset/vuln/source').then((res: any) => {
    if (res && res.data) {
      // 处理返回的数据
      chartData.value = res.data.series

      // 直接使用返回的时间轴数据，不做格式转换
      if (res.data.axis && res.data.axis.length > 0) {
        dateLabels.value = res.data.axis
      }
    }
  })
}

onMounted(() => {
  // 获取数据
  getData()
})
</script>
