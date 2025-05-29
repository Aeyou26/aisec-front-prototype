<template>
  <div class="bg-#ffffff rounded-14 shadow-[0_8px_40px_0 #00266914] box-border">
    <div class="px-24 py-24 flex flex-col gap-18 h-full">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-10">
          <div class="w-4 h-20 bg-#2e66c7 rounded-14"></div>
          <div class="text-#333333 text-18 font-bold">资产漏洞修复情况</div>
        </div>
        <div>
          <a-select v-model="selectedDay" :options="dayOptions" style="width: 120px" @change="handleDayChange"> </a-select>
        </div>
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
import { BarChart, LineChart, PictorialBarChart, RadarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, PolarComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import request from '@/request'

use([CanvasRenderer, BarChart, LineChart, PictorialBarChart, RadarChart, GridComponent, TooltipComponent, LegendComponent, PolarComponent])

const chartContainer = ref<HTMLElement | null>(null)

// 日期选项
const dayOptions = [
  { label: '全部', value: 'all' },
  { label: '过去7天', value: '7' },
  { label: '过去30天', value: '30' },
  { label: '过去90天', value: '90' },
  { label: '过去半年', value: '180' }
]

// 选中的日期选项
const selectedDay = ref('all')

// 数据
const chartData = ref<any[]>([])
// 选择日期改变时的处理函数
const handleDayChange = (value: string) => {
  getData()
}

// 图表配置
const chartOption = computed(() => {
  if (chartData.value.length === 0) {
    return {}
  }
  // xAxis 为风险等级
  const xAxisData = chartData.value.map((item) => item.riskLevel)
  // series 为已修复、未修复
  const series = [
    {
      name: '已修复',
      type: 'bar',
      stack: 'total',
      barWidth: '60%',
      label: {
        show: true,
        formatter: (params: any) => params.value
      },
      itemStyle: { color: 'rgba(93,129,255,0.8)' },
      data: chartData.value.map((item) => item.fixed)
    },
    {
      name: '未修复',
      type: 'bar',
      stack: 'total',
      barWidth: '60%',
      label: {
        show: true,
        formatter: (params: any) => params.value
      },
      itemStyle: { color: 'rgba(235,91,81,0.8)' },
      data: chartData.value.map((item) => item.noFixed)
    }
  ]

  return {
    legend: {
      selectedMode: false
    },
    grid: {
      left: 60,
      right: 40,
      top: 20,
      bottom: 20
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: xAxisData
    },
    series,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    }
  }
})

// 获取数据
const getData = () => {
  const params = selectedDay.value === 'all' ? {} : { day: selectedDay.value }
  request.Get('/user/asset/vuln/fixed', { params }).then((res: any) => {
    if (res && res.data) {
      const riskLevels = ['高危', '中危', '低危']
      const dataMap: Record<string, { riskLevel: string; fixed: number; noFixed: number }> = {}
      res.data.forEach((item: any) => {
        dataMap[item.riskLevel] = item
      })
      const filledData = riskLevels.map((risk) => ({
        riskLevel: risk,
        fixed: dataMap[risk]?.fixed || 0,
        noFixed: dataMap[risk]?.noFixed || 0
      }))
      // 按风险级别排序: 高危 > 中危 > 低危
      const sortedData = [...filledData].sort((a, b) => {
        const riskOrder: Record<string, number> = { 高危: 1, 中危: 2, 低危: 3 }
        return riskOrder[a.riskLevel as keyof typeof riskOrder] - riskOrder[b.riskLevel as keyof typeof riskOrder]
      })
      chartData.value = sortedData || []
    }
  })
}

onMounted(() => {
  getData()
})
</script>
