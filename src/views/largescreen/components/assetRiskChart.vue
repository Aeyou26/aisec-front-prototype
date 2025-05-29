<template>
  <div class="chart-main">
    <div class="chart-title">资产风险</div>
    <div class="relative w-400">
      <div v-show="hasData" class="absolute top-20 left-40 color-white text-16">资产总数：{{ assetRiskData.total }}</div>
      <div v-show="hasData" id="assetRisk" class="chart-item w-400 h-250"></div>
      <div v-show="hasData" class="w-full absolute flex bottom-20 color-white text-16">
        <div class="flex-1 flex justify-center">安全资产：{{ assetRiskData.safe }}</div>
        <div class="flex-1 flex justify-center">风险资产：{{ assetRiskData.risk }}</div>
      </div>
      <div v-show="!hasData" class="w-400 h-250 flex justify-center items-center color-white">
        <Empty :is-echart="true"/>
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

// 资产风险数据
const assetRiskData = ref({
  total: 0,
  safe: 0,
  risk: 0
})

//资产风险
const assetRiskDom = ref<HTMLElement | null>(null)
let assetRiskChart: any

const hasData = ref(true)

onMounted(() => {
  assetRisk()
})

let pie1Data: any = '0%'
let pie2Data: any = '0%'
const option = {
  // tooltip: {
  //   trigger: 'item'
  // },
  // legend: {
  //   show: false
  // },
  grid: {
    left: 0,
    right: 0,
    bottom: 0,
    containLabel: true
  },
  series: [
    {
      type: 'pie',
      center: ['25%', '50%'],
      radius: ['36%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        // borderRadius: 4,
        // borderWidth: 2,
        borderColor: '#051B21'
      },
      label: {
        show: true,
        position: 'center',
        formatter: [
          // '{a|总资产}',
          `{b|${pie1Data}}`
        ].join('\n'),
        rich: {
          // a: {
          //   fontSize: 14,
          //   color: '#ffffff',
          //   padding: [0, 0, 5, 0]
          // },
          b: {
            fontSize: 24,
            color: '#ffffff',
            fontWeight: 'bold'
          }
        }
      },
      data: [
        {
          value: 0,
          name: '安全资产',
          itemStyle: {
            color: '#329DFF'
          }
        },
        {
          value: 0,
          name: '风险资产',
          itemStyle: {
            color: '#082A54'
          }
        }
      ]
    },
    {
      type: 'pie',
      center: ['75%', '50%'],
      radius: ['36%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        // borderRadius: 4,
        // borderWidth: 2,
        borderColor: '#051B21'
      },
      label: {
        show: true,
        position: 'center',
        formatter: [
          // '{a|占比}',
          `{b|${pie2Data}}`
        ].join('\n'),
        rich: {
          // a: {
          //   fontSize: 14,
          //   color: '#ffffff',
          //   padding: [0, 0, 5, 0]
          // },
          b: {
            fontSize: 24,
            // color: '#268AFF',
            color: '#ffffff',
            fontWeight: 'bold'
          }
        }
      },
      data: [
        {
          value: 0,
          name: '安全资产',
          itemStyle: {
            color: '#0AB7C9'
          }
        },
        {
          value: 0,
          name: '风险资产',
          itemStyle: {
            color: '#15435E'
          }
        }
      ]
    }
  ]
}

// 资产风险
const assetRisk = () => {
  request
    .Get('/user/asset/overview', {
      params: {
        // dataType: 2 //1资产概况，2资产风险
      }
    })
    .then((res: any) => {
      // console.log('资产风险', res)
      if (res && res.data) {
        hasData.value = true
        const data = res.data
        let safe = 0
        let risk = 0
        if (!data.assets) {
          data.assets = 0
          data.risk = 0
        } else {
          if (!data.risk) {
            data.risk = 0
          }
          safe = data.assets - data.risk
          risk = data.risk
        }
        pie1Data = data.assets ? Number((safe / data.assets).toFixed(2)) * 100 + '%' : '0%'
        pie2Data = data.assets ? Number((risk / data.assets).toFixed(2)) * 100 + '%' : '0%'
        option.series[0].label.formatter = [`{b|${pie1Data}}`].join('\n')
        option.series[1].label.formatter = [`{b|${pie2Data}}`].join('\n')
        option.series[0].data[0].value = safe
        option.series[0].data[1].value = risk
        option.series[1].data[0].value = risk
        option.series[1].data[1].value = safe

        assetRiskData.value.total = data.assets
        assetRiskData.value.safe = data.assets - data.risk
        assetRiskData.value.risk = data.risk
      }

      const dom = assetRiskDom.value
      if (dom) {
        if (assetRiskChart) {
          assetRiskChart.dispose()
        }
        assetRiskChart = echarts.init(dom, null, { renderer: 'svg' })
        assetRiskChart.setOption(option)
      } else {
        assetRiskDom.value = document.getElementById('assetRisk') as HTMLElement
        assetRiskChart = echarts.init(assetRiskDom.value, null, { renderer: 'svg' })
        assetRiskChart.setOption(option)
      }
    }).catch(() => {
      hasData.value = false
    })
}
</script>

<style scoped lang="less">
@import './asideChart.less';
</style>
