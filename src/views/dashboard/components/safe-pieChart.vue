<template>
  <div class="bg-#ffffff rounded-14 shadow-[0_8px_40px_0 #00266914] box-border">
    <div class="px-22 py-22 flex flex-col gap-16 h-full">
      <div class="text-#333333 text-18 font-bold">资产概览</div>
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
const data = ref<{ online: number; offline: number; risk: number; safe: number; assets: number }>({
  online: 0,
  offline: 0,
  risk: 0,
  safe: 0,
  assets: 0
})
// 计算百分比保留两位小数
const getPercent = (value: number, total: number) => {
  return `${((value / total) * 100).toFixed(2)}%`
}
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
        formatter: [`{b|${getPercent(data.value.online, data.value.assets)}}`, '{a|在线资产}'].join('\n'),
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
          value: data.value.online,
          name: '在线资产',
          itemStyle: {
            color: '#329DFF'
          }
        },
        {
          value: data.value.offline,
          name: '离线资产',
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
        formatter: [`{b|${getPercent(data.value.safe, data.value.assets)}}`, '{a|安全资产}'].join('\n'),
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
          value: data.value.safe,
          name: '安全资产',
          itemStyle: {
            color: '#0AB7C9'
          }
        },
        {
          value: data.value.risk,
          name: '风险资产',
          itemStyle: {
            color: '#F0F2F5'
          }
        }
      ]
    }
  ]
}))

interface AssetStat {
  assets: number
  online: number
  risk: number
  tdAlert: number
  tdHandle: number
  untreated: number
}

const getData = () => {
  request.Get<{ data: AssetStat }>('/user/asset/overview').then((res) => {
    if (res && res.data) {
      data.value.assets = res.data.assets
      data.value.online = res.data.online
      data.value.risk = res.data.risk
      data.value.safe = res.data.assets - res.data.risk
      data.value.offline = res.data.assets - res.data.online
    }
  })
}

onMounted(() => {
  getData()
})
</script>
