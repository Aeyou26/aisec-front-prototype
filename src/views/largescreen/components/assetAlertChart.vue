<template>
  <div class="chart-main">
    <div class="chart-title">
      资产漏洞TOP5
      <!-- <div class="chart-subtitle">(24h内)</div> -->
    </div>
    <div class="relative w-400">
      <div v-show="hasData" id="assetAlert" class="chart-item w-400 h-250"></div>
      <div v-show="!hasData" class="flex justify-center items-center w-400 h-250 color-white">
        <Empty :is-echart="true" />
      </div>
      <edging />
    </div>
  </div>
</template>

<script lang="ts" setup>
import echarts from '@/utils/echarts'
import request from '@/request'
import edging from './edging.vue'
import Empty from '@/components/Empty.vue'
// 资产告警
const assetAlertDom = ref<HTMLElement | null>(null)
let assetAlertChart: any
const hasData = ref(true)

onMounted(() => {
  assetAlert()
})

const option = {
  tooltip: {
    // 是否限制在可视区域
    confine: true,
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    top: '20%',
    left: 20,
    right: 20,
    bottom: '12%'
  },
  xAxis: {
    type: 'category',
    data: [''],
    axisLine: {
      show: false,
      lineStyle: {
        color: '#ffffffcc'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#ffffffcc',
      formatter: (value: string) => {
        if (value.length > 4) {
          return value.substring(0, 4) + '...'
        }
        return value
      },
      interval: 0,
      rotate: 0,
      fontSize: 12
    }
  },
  yAxis: {
    show: false,
    type: 'value',
    splitLine: {
      show: false,
      lineStyle: {
        type: 'dashed',
        color: '#d9e7ff1a'
      }
    },
    axisLabel: {
      color: '#ffffffcc'
    }
  },
  series: [
    // 主体柱子
    {
      data: [],
      type: 'bar',
      barWidth: '20',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        color: '#FFFFFFFF'
      },
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
              color: '#2E66C7FF' // 渐变起始色
            },
            {
              offset: 1,
              color: '#268AFF00' // 渐变结束色
            }
          ]
        }
        // borderRadius: [4, 4, 0, 0]
      }
    }
  ]
}

// 资产告警
const assetAlert = () => {
  request
    .Get('/user/asset/vuln/top5')
    .then((res: any) => {
      if (res && res.code === 1 && res.data && res.data.length > 0) {
        hasData.value = true
        const data = res.data
        const tempX = []
        const tempY = []
        const num = data.length >= 5 ? 5 : data.length
        for (let i = 0; i < num; i++) {
          // if (data[i].name.length > 4) {
          //   data[i].name = data[i].name.substring(0, 4) + '...'
          // }
          tempX.push(data[i].name)
          tempY.push(data[i].value)
        }

        option.xAxis.data = tempX as any
        option.series[0].data = tempY as any

        const dom = assetAlertDom.value
        if (dom) {
          if (assetAlertChart) {
            assetAlertChart.dispose()
          }
          assetAlertChart = echarts.init(dom, null, { renderer: 'svg' })
          assetAlertChart.setOption(option)
        } else {
          assetAlertDom.value = document.getElementById('assetAlert') as HTMLElement
          assetAlertChart = echarts.init(assetAlertDom.value, null, { renderer: 'svg' })
          assetAlertChart.setOption(option)
        }
      } else {
        hasData.value = false
      }
    })
    .catch(() => {
      hasData.value = false
    })
}
</script>

<style scoped lang="less">
@import './asideChart.less';
</style>
