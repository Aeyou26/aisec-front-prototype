<template>
  <div class="bg-#ffffff rounded-14 shadow-[0_8px_40px_0 #00266914] box-border">
    <div class="px-24 py-24 flex flex-col h-full">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-10">
          <div class="w-4 h-20 bg-#2e66c7 rounded-14"></div>
          <div class="text-#333333 text-18 font-bold">各类型资产威胁程度</div>
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
import { BarChart, LineChart, PictorialBarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import request from '@/request'

use([CanvasRenderer, BarChart, LineChart, PictorialBarChart, GridComponent, TooltipComponent, LegendComponent])

const chartContainer = ref<HTMLElement | null>(null)

// 测试数据
interface AssetThreatItem {
  name: string
  high: number
  medium: number
  low: number
  safe: number
}

// 数据
const chartData = ref<AssetThreatItem[]>([])

// 接口数据映射
function mapApiData(data: any[]): AssetThreatItem[] {
  return data.map((item) => ({
    name: item.aat,
    high: item.hvuln,
    medium: item.mvuln,
    low: item.lvuln,
    safe: item.safeCount
  }))
}

// 图表配置
const chartOption = computed(() => {
  if (chartData.value.length === 0) {
    return {}
  }

  // 获取资产类型名称和风险级别
  const assetNames = chartData.value.map((item) => item.name)
  const riskLevels = ['高危', '中危', '低危', '安全']
  const riskKeys = ['high', 'medium', 'low', 'safe']

  // 计算最大值用于坐标轴设置
  const allValues: number[] = []
  chartData.value.forEach((item) => {
    riskKeys.forEach((key) => {
      allValues.push(item[key as keyof AssetThreatItem] as number)
    })
  })

  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 10
  const maxlen = Math.pow(10, String(Math.ceil(maxValue)).length - 2)
  const max = maxValue >= 5 ? Math.ceil(maxValue / (10 * maxlen)) * maxlen * 10 : 5

  // 准备系列数据
  const series: any[] = []

  // 为每个风险级别创建一个系列
  riskLevels.forEach((level, index) => {
    const key = riskKeys[index]
    const levelData = chartData.value.map((item) => item[key as keyof AssetThreatItem])

    // 确定颜色
    let color
    switch (level) {
      case '高危':
        color = {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#FF4D4F' },
            { offset: 1, color: '#ff7875' }
          ]
        }
        break
      case '中危':
        color = {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#FAAD14' },
            { offset: 1, color: '#FFD591' }
          ]
        }
        break
      case '低危':
        color = {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#1890FF' },
            { offset: 1, color: '#69C0FF' }
          ]
        }
        break
      case '安全':
        color = {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#52C41A' },
            { offset: 1, color: '#95DE64' }
          ]
        }
        break
      default:
        color = {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#909399' },
            { offset: 1, color: '#C0C4CC' }
          ]
        }
        break
    }

    series.push({
      name: level,
      type: 'bar',
      barMaxWidth: '14%',
      barWidth: '12%',
      barGap: '10%',
      data: levelData,
      itemStyle: {
        color: color,
        borderRadius: [4, 4, 0, 0]
      }
    })
  })

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      borderColor: 'rgba(0,0,0,.1)',
      backgroundColor: 'rgba(255,255,255,.9)',
      textStyle: {
        color: '#333333'
      },
      borderWidth: 1,
      padding: 5
    },
    textStyle: {
      color: '#333333'
    },
    legend: {
      data: riskLevels,
      top: 10,
      textStyle: {
        color: '#333333',
        fontSize: 12
      }
    },
    grid: {
      containLabel: true,
      left: '0',
      top: '34',
      bottom: '0',
      right: '0'
    },
    xAxis: {
      type: 'category',
      data: assetNames,
      axisLine: {
        show: false,
        lineStyle: {
          color: '#999999'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#333333',
        fontStyle: 'normal',
        formatter: (value: string) => {
          if (value.length > 5) {
            return value.substring(0, 5) + '...'
          }
          return value
        },
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#e0e6f1'
        }
      },
      axisLine: {
        show: false,
        lineStyle: {
          color: '#999999'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#333333',
        fontStyle: 'normal'
      },
      max: max
    },
    series: series
  }
})

// 初始化数据
onMounted(() => {
  request.Get('/user/asset/type/threat').then((res: any) => {
    if (res && res.data) {
      chartData.value = mapApiData(res.data || [])
    }
  })
})
</script>
