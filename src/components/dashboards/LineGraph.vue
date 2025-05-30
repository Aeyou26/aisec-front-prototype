<template>
  <div class="line-graph">
    <div class="graph-header">
      <div class="graph-title">资产漏洞分布</div>
      <div class="graph-value">TOP5总漏洞数: {{ totalVulnerabilities }}</div>
    </div>
    <div class="chart-container">
      <VChart v-if="chartData.length > 0" :option="chartOption" :autoresize="true" style="width: 100%; height: 100%" />
      <div v-else class="flex justify-center items-center h-full">
        <a-empty description="暂无数据" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import request from '@/request'
import { computed, ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

// 定义数据结构接口
interface VulnTypeData {
  name: string
  value: number
}

// 使用ref定义响应式数据
const chartData = ref<VulnTypeData[]>([])

// 计算总漏洞数
const totalVulnerabilities = computed(() => {
  return chartData.value.reduce((sum, item) => sum + item.value, 0)
})

// 图表配置
const chartOption = computed(() => {
  if (chartData.value.length === 0) {
    return {}
  }

  // 计算最大值用于坐标轴设置
  const allValues = chartData.value.map((item) => item.value)
  const maxValue = Math.max(...allValues, 10)
  const maxlen = Math.pow(10, String(Math.ceil(maxValue)).length - 2)
  const max = maxValue >= 5 ? Math.ceil(maxValue / (5 * maxlen)) * maxlen * 5 : 5

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      borderColor: 'rgba(0,0,0,.1)',
      backgroundColor: 'rgba(255,255,255,.9)',
      textStyle: {
        color: '#999999'
      },
      borderWidth: 1,
      padding: 8,
      confine: true,
      enterable: true,
      formatter: function (params: Array<any>) {
        // 获取当前数据点索引
        const index = params[0].dataIndex
        // 获取完整类型名称
        const fullName = chartData.value[index].name

        // 每8个字符添加一个换行
        let formattedName = ''
        for (let i = 0; i < fullName.length; i++) {
          formattedName += fullName[i]
          if ((i + 1) % 8 === 0 && i < fullName.length - 1) {
            formattedName += '<br/>'
          }
        }

        // 生成自定义tooltip内容
        return `<div style="font-weight:bold;margin-bottom:8px;color:#999999;line-height:1.4;">${formattedName}</div>
                <div style="display:flex;align-items:center;margin:3px 0;">
                  <span style="display:inline-block;width:10px;height:10px;background:${params[0].color};border-radius:50%;margin-right:5px;"></span>
                  <span style="color:#999999">漏洞数: ${params[0].value}</span>
                </div>`
      }
    },
    textStyle: {
      color: '#999999'
    },
    grid: {
      containLabel: true,
      left: '3%',
      top: '20px',
      bottom: '15px',
      right: '5%'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.map((item) => {
        // 处理类型名称显示
        const name = item.name
        if (name.length > 3) {
          // 超过三个字符的名称，截取前三个字符并添加省略号
          return name.substring(0, 3) + '...'
        }
        // 不超过三个字符的名称，正常显示
        return name
      }),
      axisLine: {
        show: true,
        lineStyle: {
          color: '#e0e6f1'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#999999',
        fontStyle: 'normal',
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
        color: '#999999',
        fontStyle: 'normal'
      },
      max: max
    },
    series: [
      {
        name: '漏洞数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: chartData.value.map((item) => item.value),
        lineStyle: {
          width: 3,
          color: '#4299e1'
        },
        itemStyle: {
          color: '#4299e1',
          borderWidth: 2,
          borderColor: '#ffffff'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(66, 153, 225, 0.3)' },
              { offset: 1, color: 'rgba(66, 153, 225, 0.05)' }
            ]
          }
        }
      }
    ]
  }
})

// 获取数据
const getData = () => {
  request.Get('/user/asset/vuln/top5').then((res: any) => {
    if (res && res.data) {
      chartData.value = res.data
    }
  })
}

onMounted(() => {
  getData()
})
</script>

<style scoped lang="less">
.line-graph {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.graph-title {
  font-size: 12px;
  color: #999;
  font-weight: bold;
}

.graph-value {
  font-size: 12px;
  font-weight: bold;
  color: #4299e1;
}

.chart-container {
  flex-grow: 1;
  position: relative;
  width: 100%;
  height: calc(100% - 30px);
}
</style>
