<template>
  <div class="chart-main">
    <div class="chart-title">
      <!-- 报警概况 -->
      整体风险漏洞趋势
      <div class="chart-subtitle">(按月统计)</div>
    </div>
    <div class="relative w-400">
      <div v-show="hasData" id="overview2" class="chart-item w-400 h-250"></div>
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

const hasData = ref(true)

const option: any = {
  tooltip: {
    trigger: 'axis',
    // 是否限制在可视区域
    confine: true
    // 是否将浮层挂载到body上，否则会超出可视区域
    // appendToBody: true,
  },
  legend: {
    data: ['高危', '中危', '低危'],
    textStyle: {
      color: '#ffffffcc'
    }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
    interval: 200, // 设置坐标间隔为 50
    axisLabel: {
      interval: 0, // 设置坐标标签的间隔为 0，表示显示所有的标签
      color: '#ffffffcc' //设置x轴文字颜色
    }
  },
  yAxis: {
    type: 'value',
    // minInterval: 1, //设置成1保证坐标轴分割刻度显示成整数。
    splitNumber: 5,
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed', //设置y轴刻度为虚线
        color: '#d9e7ff1a'
      }
    },
    axisLabel: {
      color: '#ffffffcc' //设置x轴文字颜色
    }
  },
  grid: {
    top: 40,
    left: 40,
    right: 30,
    bottom: 30
  },
  series: [
    {
      name: '高危',
      data: [],
      type: 'line',
      smooth: false, // 设置为true，则折线图平滑
      symbol: 'circle', //小圆点改为实心，false为空心
      symbolSize: 8 //设置折线点大小
      // itemStyle: {
      //   color: '#1ED6FFFF',  //小圆点颜色
      // },
      // label: {
      //   show: true,
      //   position: 'top',
      //   formatter: '{c}',
      //   color: '#76A9FF'
      // },
      // areaStyle: {
      //   color: {
      //     type: 'linear',
      //     x: 0,
      //     y: 0,
      //     x2: 0,
      //     y2: 1,
      //     colorStops: [],
      //     global: false // 缺省为 false
      //   }
      // }
    },
    {
      name: '中危',
      data: [],
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 8
      // areaStyle: {
      //   color: {
      //     type: 'linear',
      //     x: 0,
      //     y: 0,
      //     x2: 0,
      //     y2: 1,
      //     colorStops: [
      //       { offset: 0, color: '#ff7f0e66' },
      //       { offset: 1, color: '#ff7f0e00' }
      //     ],
      //     global: false
      //   }
      // }
    },
    {
      name: '低危',
      data: [],
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 8
      // areaStyle: {
      //   color: {
      //     type: 'linear',
      //     x: 0,
      //     y: 0,
      //     x2: 0,
      //     y2: 1,
      //     colorStops: [
      //       { offset: 0, color: '#2ca02c66' },
      //       { offset: 1, color: '#2ca02c00' }
      //     ],
      //     global: false
      //   }
      // }
    }
  ]
}

// 报警概况
const overviewDom = ref<HTMLElement | null>(null)
let overviewChart: any

onMounted(() => {
  alarmOverview()
})

// 渲染报警概况图表
const alarmOverview = () => {
  // 设置面积颜色
  const colorStops = [
    {
      offset: 0,
      color: '#2276fc66' // 0% 处的颜色
    },
    {
      offset: 1,
      color: '#2276fc00' // 100% 处的颜色
    }
  ]
  // 设置折线颜色
  const lineStyle = {
    color: '#268AFF', // 例如，设置为红色
    width: 1
  }
  const itemStyle = {
    color: '#268AFFFF' //小圆点颜色
  }

  request
    .Get('/user/asset/vuln/threat', {
      params: {
        statType: 2
      }
    })
    .then((res: any) => {
      console.log('按月风险趋势', res)
      if (res && res.data && Object.keys(res.data).length > 0) {
        hasData.value = true

        const data = res.data

        // 初始化结果数组
        const months: string[] = []
        const highRisk: number[] = []
        const mediumRisk: number[] = []
        const lowRisk: number[] = []
        // 遍历数据对象
        for (const month in data) {
          months.push(month) // 添加月份
          const values = data[month] // 获取对应的值
          highRisk.push(values[0]) // 高危
          mediumRisk.push(values[1]) // 中危
          lowRisk.push(values[2]) // 低危
        }

        // 将结果赋值给 ECharts 的 option
        option.xAxis.data = months // 设置 x 轴数据
        option.series[0].data = highRisk // 第一条折线的数据
        option.series[1].data = mediumRisk // 第二条折线的数据
        option.series[2].data = lowRisk // 第三条折线的数据

        // option.series[0].areaStyle.color.colorStops = colorStops
        // option.series[0].lineStyle = lineStyle
        // option.series[0].itemStyle = itemStyle

        const dom = overviewDom.value
        if (dom) {
          if (overviewChart) {
            overviewChart.dispose()
          }
          overviewChart = echarts.init(dom, null, { renderer: 'svg' })
          overviewChart.setOption(option)
        } else {
          overviewDom.value = document.getElementById('overview2') as HTMLElement
          overviewChart = echarts.init(overviewDom.value, null, { renderer: 'svg' })
          overviewChart.setOption(option)
        }
      } else {
        hasData.value = false
      }
    }).catch(() => {
      hasData.value = false
    })
}

function getLastSevenDays() {
  const days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i - 1)
    const month = date.getMonth() + 1 // 月份从0开始，所以要加1
    const day = date.getDate()
    days.push(`${month}/${day}`)
  }
  return days
}

function getLastSevenMonths() {
  const months = []
  const today = new Date()

  for (let i = 0; i < 6; i++) {
    const date = new Date(today)
    date.setMonth(today.getMonth() - i) // 设置为当前月份减去 i
    const month = date.getMonth() + 1 // 月份从0开始，所以要加1
    const year = date.getFullYear() // 获取年份
    months.push(`${year}-${month < 10 ? '0' + month : month}`) // 格式化为 YYYY-MM
  }

  return months.reverse() // 反转数组以从最近的月份开始
}
</script>

<style scoped lang="less">
@import './asideChart.less';
</style>
