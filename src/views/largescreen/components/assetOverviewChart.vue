<template>
  <div class="chart-main">
    <div class="chart-title">资产概况</div>
    <div class="relative w-400 px-10 py-10 box-border w-400 h-260">
      <!-- <div class="z-index-999 absolute top-20 left-40 color-white text-16">设备总数：{{ assetSituationData.total }}</div> -->
      <!-- <div id="assetSituation" class="chart-item w-400 h-250"></div> -->
      <!-- <div class="w-full absolute flex bottom-20 color-white text-16">
        <div class="flex-1 flex justify-center">在线：{{ assetSituationData.online }}</div>
        <div class="flex-1 flex justify-center">离线：{{ assetSituationData.offline }}</div>
      </div> -->
      <StatusMonitor />
      <!-- 四个边框角 -->
      <edging />
    </div>
  </div>
</template>

<script lang="ts" setup>
import echarts from '@/utils/echarts'
import 'echarts-liquidfill'
import request from '@/request'
import edging from './edging.vue'
import StatusMonitor from '@/components/dashboards/StatusMonitor.vue'

const assetSituationData = ref({
  total: 0,
  online: 0,
  offline: 0
})

//资产概况
const assetSituationDom = ref<HTMLElement | null>(null)
let assetSituationChart: any = null

onMounted(() => {
  // assetOverview()
})

// const value = 0.02    //水球图必须要小数
// const value1 = 0.98   //水球图必须要小数
const value = '0'
const value1 = '0'

const option = {
  // backgroundColor: '#0F224C',
  title: [
    {
      // text: '本年收缴率',
      x: '22%',
      y: '70%',
      textStyle: {
        fontSize: 14,
        fontWeight: '100',
        color: '#5dc3ea',
        lineHeight: 16,
        textAlign: 'center'
      }
    },
    {
      // text: '本月收缴率',
      x: '73%',
      y: '70%',
      textStyle: {
        fontSize: 14,
        fontWeight: '100',
        color: '#5dc3ea',
        lineHeight: 16,
        textAlign: 'center'
      }
    }
  ],
  series: [
    {
      type: 'liquidFill',
      radius: '47%',
      center: ['25%', '50%'],
      color: [
        {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: '#446bf5'
            },
            {
              offset: 1,
              color: '#2ca3e2'
            }
          ],
          globalCoord: false
        }
      ],
      data: [value, value], // data个数代表波浪数
      backgroundStyle: {
        borderWidth: 1,
        color: 'RGBA(51, 66, 127, 0.7)'
      },
      label: {
        normal: {
          textStyle: {
            fontSize: 28,
            color: '#fff'
          }
        }
      },
      outline: {
        // show: false
        borderDistance: 0,
        itemStyle: {
          borderWidth: 2,
          borderColor: '#112165'
        }
      }
    },

    {
      //第二个球的填充
      type: 'liquidFill',
      radius: '47%',
      center: ['75%', '50%'],
      color: [
        {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: '#2aa1e3'
            },
            {
              offset: 1,
              color: '#08bbc9'
            }
          ],
          globalCoord: false
        }
      ],
      data: [value1, value1], // data个数代表波浪数
      backgroundStyle: {
        borderWidth: 1,
        color: 'RGBA(51, 66, 127, 0.7)'
      },
      label: {
        normal: {
          textStyle: {
            fontSize: 28,
            color: '#fff'
          }
        }
      },
      outline: {
        // show: false
        borderDistance: 0,
        itemStyle: {
          borderWidth: 2,
          borderColor: '#112165'
        }
      }
    }
  ]
}

// 资产概况
const assetOverview = () => {
  request.Get('/user/asset/overview').then((res: any) => {
    if (res && res.data) {
      const data = res.data
      let value1 = '0'
      let value2 = '0'
      if (!data.assets) {
        data.assets = 0
        data.online = 0
      } else {
        if (!data.online) {
          data.online = 0
        }
        value1 = (data.online / data.assets).toFixed(3)
        value2 = ((data.assets - data.online) / data.assets).toFixed(3)
        if (Number(value1) > 0 && Number(value1) < 0.01) {
          value1 = '0.01'
          value2 = '0.99'
        }
      }
      option.series[0].data = [value1, value1]
      option.series[1].data = [value2, value2]
      assetSituationData.value.total = data.assets
      assetSituationData.value.online = data.online
      assetSituationData.value.offline = data.assets - data.online
    }
    const dom = assetSituationDom.value
    if (dom) {
      if (assetSituationChart) {
        assetSituationChart.dispose()
      }
      assetSituationChart = echarts.init(dom, null, { renderer: 'svg' })
      assetSituationChart.setOption(option)
    } else {
      assetSituationDom.value = document.getElementById('assetSituation') as HTMLElement
      assetSituationChart = echarts.init(assetSituationDom.value, null, { renderer: 'svg' })
      assetSituationChart.setOption(option)
    }
  })
}
</script>

<style scoped lang="less">
@import './asideChart.less';
</style>
