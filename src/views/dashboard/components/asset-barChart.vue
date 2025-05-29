<template>
  <div class="bg-#ffffff rounded-14 shadow-[0_8px_40px_0 #00266914] box-border">
    <div class="px-22 py-22 flex flex-col gap-16 h-full">
      <div class="text-#333333 text-18 font-bold">标题</div>
      <div ref="chartContainer" class="flex-1">
        <VChart :option="chartOption" :autoresize="true" style="width: 100%; height: 100%" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import request from '@/request'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const chartContainer = ref<HTMLElement | null>(null)

// 数据
const chartData = ref<(string | number)[]>([])

// 图表配置
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['文字', '文字', '文字', '文字', '文字', '文字', '文字', '文字', '文字'],
    interval: 200
    //   axisLabel: {
    //     interval: (index: any, value: any) => {
    //       return ['0:00', '2:00', '4:00', '6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'].includes(value)
    //     },
    //     color: '#333333'
    //   }
  },
  yAxis: {
    type: 'value',
    splitNumber: 5,
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        color: '#e0e6f1'
      }
    },
    axisLabel: {
      color: '#333333'
    }
  },
  grid: {
    top: 20,
    left: 40,
    right: 30,
    bottom: 30
  },
  series: [
    {
      data: chartData.value,
      type: 'bar',
      barWidth: 12,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: '#268AFF'
            },
            {
              offset: 1,
              color: '#2276fc66'
            }
          ]
        },
        borderRadius: [4, 4, 0, 0]
      }
    }
  ]
}))

// 获取数据
const getData = () => {
  request
    .Get('/large/screen/getData', {
      params: {
        count: 7,
        dataType: 3
      }
    })
    .then((res: any) => {
      if (res && res.data) {
        const temp2 = ['4', '8', '14', '16', '12', '18', '7', '9', '12', '16', '9', '19', '23', '10', '8', '10', '30', '25', '23', '10', '8', '18', '16', '24', '19']
        chartData.value = temp2
      }
    })
}

onMounted(() => {
  // 获取数据
  getData()
})
</script>
