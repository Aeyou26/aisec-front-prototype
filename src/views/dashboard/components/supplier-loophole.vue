<template>
  <div class="bg-#ffffff rounded-14 shadow-[0_8px_40px_0 #00266914] box-border">
    <div class="px-24 py-24 flex flex-col gap-18 h-full">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-10">
          <div class="w-4 h-20 bg-#2e66c7 rounded-14"></div>
          <div class="text-#333333 text-18 font-bold">供应商待修复漏洞Top10</div>
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
import { BarChart, LineChart, PictorialBarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import request from '@/request'

use([CanvasRenderer, BarChart, LineChart, PictorialBarChart, GridComponent, TooltipComponent, LegendComponent])

const chartContainer = ref<HTMLElement | null>(null)

// 日期选项
const dayOptions = [
  { label: '全部', value: 'all' },
  { label: '高危', value: 'high' },
  { label: '中危', value: 'medium' },
  { label: '低危', value: 'low' }
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

  // 计算最大值用于坐标轴设置
  const allValues = chartData.value.map((item) => item.value)
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 10
  const maxlen = Math.pow(10, String(Math.ceil(maxValue)).length - 2)
  const max = maxValue >= 5 ? Math.ceil(maxValue / (10 * maxlen)) * maxlen * 10 : 5

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
    grid: {
      containLabel: true,
      left: '3%',
      top: '12px',
      bottom: '0',
      right: '5%'
    },
    xAxis: {
      type: 'category',
      data: chartData.value.map((item) => item.name),
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
          if (value.length > 4) {
            return value.substring(0, 4) + '...'
          }
          return value
        },
        interval: 0,
        rotate: 30
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
    series: [
      {
        name: selectedDay.value === 'all' ? '漏洞总数' : selectedDay.value === 'high' ? '高危漏洞' : selectedDay.value === 'medium' ? '中危漏洞' : '低危漏洞',
        type: 'bar',
        barMaxWidth: '40%',
        barWidth: '30%',
        data: chartData.value.map((item) => item.value),
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
                color: selectedDay.value === 'high' ? '#FF4D4F' : selectedDay.value === 'medium' ? '#FAAD14' : selectedDay.value === 'low' ? '#52C41A' : '#2e66c7'
              },
              {
                offset: 1,
                color: selectedDay.value === 'high' ? '#ff7875' : selectedDay.value === 'medium' ? '#FFD666' : selectedDay.value === 'low' ? '#95DE64' : '#76a3ff'
              }
            ]
          },
          borderRadius: [4, 4, 4, 4]
        }
      }
    ]
  }
})

// 获取数据
const getData = () => {
  // 在真实环境中调用API
  const params = selectedDay.value === 'all' ? {} : { vulnLevel: dayOptions.find((item) => item.value === selectedDay.value)?.label }
  request.Get('/user/asset/vendor/fixed', { params }).then((res: any) => {
    if (res && res.data) {
      chartData.value = res.data || []
    }
  })
}

onMounted(() => {
  getData()
})
</script>
