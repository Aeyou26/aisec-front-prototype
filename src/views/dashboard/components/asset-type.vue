<template>
  <div class="bg-#ffffff rounded-14 shadow-[0_8px_40px_0 #00266914] box-border">
    <div class="px-24 py-24 flex flex-col gap-18 h-full">
      <div class="flex items-center gap-10">
        <div class="w-4 h-20 bg-#2e66c7 rounded-14"></div>
        <div class="text-#333333 text-18 font-bold">资产类型</div>
      </div>
      <div ref="chartContainer" class="flex-1">
        <VChart :option="chartOption" :autoresize="true" style="width: 100%; height: 100%" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import request from '@/request'

use([CanvasRenderer, PieChart, GridComponent, TooltipComponent, LegendComponent])

const chartContainer = ref<HTMLElement | null>(null)

// 数据
const chartData = ref<any[]>([])

// 图表配置
const chartOption = computed(() => ({
  color: ['#91cc75', '#fac858', '#fc8452', '#5470c6', '#3ba272', '#73c0de', '#9a60b4', '#ee6666', '#ea7ccc'],
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: 24,
    top: 'center',
    textStyle: {
      color: '#333333'
    }
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '80%'],
      center: ['30%', '50%'],
      data: chartData.value,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c} ({d}%)'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))

// 获取数据
const getData = () => {
  request.Get('/user/asset/type/stat').then((res: any) => {
    if (res && res.data) {
      chartData.value = res.data.map((item: any) => ({
        value: item.value,
        name: item.name
      }))
    }
  })
}

onMounted(() => {
  // 获取数据
  getData()
})
</script>
