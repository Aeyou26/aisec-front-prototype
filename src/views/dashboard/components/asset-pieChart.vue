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
import { PieChart } from 'echarts/charts' // 修改为PieChart
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import request from '@/request'

use([CanvasRenderer, PieChart, GridComponent, TooltipComponent])

// ... existing code ...

// 添加计算属性计算百分比
const pie1Data = computed(() => {
  const total = 114 + 86
  return `${Math.round((114 / total) * 100)}%`
})

const pie2Data = computed(() => {
  const total = 57 + 43
  return `${Math.round((57 / total) * 100)}%`
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      type: 'pie',
      center: ['25%', '50%'],
      radius: ['48%', '65%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'center',
        formatter: [`{b|${pie1Data.value}}`, '{a|文本标题}'].join('\n'),
        rich: {
          b: {
            fontSize: 24,
            color: '#2F73E7',
            fontWeight: 'bold',
            padding: [0, 0, 5, 0]
          },
          a: {
            fontSize: 14,
            color: '#666666',
            padding: [5, 0, 0, 0]
          }
        }
      },
      data: [
        {
          value: 114,
          name: '安全资产',
          itemStyle: {
            color: '#329DFF'
          }
        },
        {
          value: 86,
          name: '风险资产',
          itemStyle: {
            color: '#F0F2F5'
          }
        }
      ]
    },
    {
      type: 'pie',
      center: ['75%', '50%'],
      radius: ['48%', '65%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'center',
        formatter: [`{b|${pie2Data.value}}`, '{a|文本标题}'].join('\n'),
        rich: {
          b: {
            fontSize: 24,
            color: '#28AEBC',
            fontWeight: 'bold',
            padding: [0, 0, 5, 0]
          },
          a: {
            fontSize: 14,
            color: '#666666',
            padding: [5, 0, 0, 0]
          }
        }
      },
      data: [
        {
          value: 57,
          name: '安全资产',
          itemStyle: {
            color: '#0AB7C9'
          }
        },
        {
          value: 43,
          name: '风险资产',
          itemStyle: {
            color: '#F0F2F5'
          }
        }
      ]
    }
  ]
}))
</script>
