<template>
  <div class="chart-main">
    <div class="chart-title">
      <!-- 机器人告警TOP5 -->
      新增漏洞类型TOP5
      <!-- <div class="chart-subtitle">(24h内)</div> -->
    </div>
    <div class="relative w-400">
      <div v-show="hasData" id="robotAlarm" class="chart-item w-400 h-250"></div>
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

// 机器人告警
const robotAlarmDom = ref<HTMLElement | null>(null)
let robotAlarmChart: any

const hasData = ref(true)

onMounted(() => {
  // 渲染机器人告警图表
  robotAlarm()
})

const option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    top: '20%',
    left: 30,
    right: 30,
    bottom: '12%'
  },
  xAxis: {
    type: 'category',
    data: ['运维机器人', '历刃机器人', '资讯机器人', '问答机器人', '蜜罐机器人'],
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
      interval: 0,
      formatter: (value: string) => {
        if (value.length > 4) {
          return value.substring(0, 4) + '...'
        }
        return value
      },
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
      data: [25, 76, 39, 52, 52],
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
              color: '#2DA3BEFF' // 渐变起始色
            },
            {
              offset: 1,
              color: '#268AFF00' // 渐变结束色
            }
          ]
        }
        // borderRadius: [4, 4, 0, 0]
      }
    },
    // 右侧面
    {
      data: [25, 76, 39, 52, 52],
      // type: 'pictorialBar',
      symbolSize: ['30%', 10],
      symbolOffset: [0, -5], // 向上偏移以便重叠
      symbolPosition: 'end',
      z: 12,
      itemStyle: {
        color: '#1ED6FF',
        opacity: 0.3
      }
    },
    {
      data: [25, 76, 39, 52, 52],
      // type: 'pictorialBar',
      symbolSize: ['30%', 10],
      symbolOffset: [15, 0], // 向右偏移
      symbolPosition: 'end',
      z: 12,
      itemStyle: {
        color: '#2276FC',
        opacity: 0.3
      }
    }
  ]
}

//渲染机器人告警图表
const robotAlarm = () => {
  request.Get('/vuln/type/top5').then((res: any) => {
    console.log('漏洞类型top5', res)
    if (res && res.data && res.data.length > 0) {
      hasData.value = true
      const data = res.data
      const temp = []
      const temp2 = []
      for (let i = 0; i < data.length; i++) {
        // if (data[i].name.length > 4) {
        //   data[i].name = data[i].name.substring(0, 4) + '...'
        // }
        temp.push(data[i].name)
        temp2.push(data[i].value)
      }
      option.xAxis.data = temp
      option.series[0].data = temp2
      // option.xAxis.data = ['web漏洞', '信息泄露', '系统漏洞', '中间件漏洞', '配置不当']
      // option.series[0].data = [92, 88, 76, 54, 43]

      const dom = robotAlarmDom.value
      if (dom) {
        if (robotAlarmChart) {
          robotAlarmChart.dispose()
        }
        robotAlarmChart = echarts.init(dom, null, { renderer: 'svg' })
        robotAlarmChart.setOption(option)
      } else {
        robotAlarmDom.value = document.getElementById('robotAlarm') as HTMLElement
        robotAlarmChart = echarts.init(robotAlarmDom.value, null, { renderer: 'svg' })
        robotAlarmChart.setOption(option)
      }
    } else {
      hasData.value = false
    }
  }).catch(() => {
    hasData.value = false
  })
}
</script>

<style scoped lang="less">
@import './asideChart.less';
</style>
