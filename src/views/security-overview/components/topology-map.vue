<template>
  <div class="w-full h-full box-border">
    <div class="w-full h-full rounded-20 overflow-hidden bg-white px-28 pb-28">
      <!-- 搜索栏 -->
      <!-- h-70 -->
      <div class="w-full h-20 flex justify-end items-center bg-white"></div>
      <!-- 关系图 -->
      <div class="relative w-full h-[calc(100%-10px)] bg-#f9fafd box-border rounded-10" style="border: 1px dashed #2e66c7">
        <div id="container" class="w-full h-full rounded-10 bg-#f9fafd;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import request from '@/request'
import { ExtensionCategory, Graph, Line, Quadratic, register } from '@antv/g6'
import header from '../image/header.png'
import switchboard from '../image/right-top2.png'
import column from '../image/left-bt1.png'
import internetBehavior from '../image/left6.png'
import wiredCore from '../image/right-top4.png'
import earth from '../image/left-bt2.png'
import search from '../image/left-bt5.png'
import phone from '../image/left-bt3.png'
import arrow from '../image/left5.png'
import left2 from '../image/left2.png'
import left4 from '../image/left-bt4.png'
import wirelessCore from '../image/right-top5.png'
import secure from '../image/left-bt8.png'
import people from '../image/left-bt9.png'
import file from '../image/right-second2.png'
import database from '../image/left-bt6.png'
import database2 from '../image/left1.png'

const icons = {
  header,
  switchboard,
  column,
  internetBehavior,
  wiredCore,
  earth,
  search,
  phone,
  arrow,
  left2,
  left4,
  wirelessCore,
  secure,
  people,
  file,
  database,
  database2
}
// 直线流动
class AntLine extends Line {
  onCreate() {
    const shape = this.shapeMap.key
    shape.animate([{ lineDashOffset: 20 }, { lineDashOffset: 0 }], {
      duration: 500,
      iterations: Infinity
    })
  }
}

// 曲线流动
class AndQuadratic extends Quadratic {
  onCreate() {
    const shape = this.shapeMap.key
    shape.animate([{ lineDashOffset: 20 }, { lineDashOffset: 0 }], {
      duration: 500,
      iterations: Infinity
    })
  }
}
register(ExtensionCategory.EDGE, 'ant-line', AntLine)
register(ExtensionCategory.EDGE, 'ant-quadratic', AndQuadratic)

let graph: Graph | null = null // 添加全局 graph 变量
const timer = null
onMounted(() => {
  // rendering() // 初始加载数据
  getAlarm()
})

function getAlarm() {
  request
    .Get(`/chart/alarm/query`)
    .then((res: any) => {
      console.log('请求告警', res)
      if (res && res.code === 1 && res.data && res.data.length > 0) {
        const data = res.data
        data.forEach((item: any) => {
          const assetId = item.assetId
          const alarmMsg = item.alarmMsg

          // 找到对应的节点并赋值
          const node = nodes.find((n) => n.id === assetId)
          if (node && alarmMsg) {
            node.badge = true
            node.description = alarmMsg // 将 alarmMsg 赋值给节点的 description
          }
        })
      }
      rendering()
    })
    .catch((err) => {
      rendering()
    })
}

const nodes = [
  {
    type: 'image',
    id: '1',
    name: 'Internet',
    labelPosition: 'top',
    style: { size: 50, x: 300, y: 50 },
    data: {
        icon: icons.header
    }
  },
  {
    type: 'image',
    id: '2',
    name: 'Internet',
    labelPosition: 'top',
    style: { x: 350, y: 50 },
    data: {
      icon: icons.header
    }
  },
  {
    type: 'image',
    id: '3',
    name: '出口交换机',
    labelPosition: 'right',
    style: { x: 330, y: 120 },
    data: {
      icon: icons.switchboard
    }
  },
  {
    type: 'image',
    id: '4',
    name: '360网神',
    labelPosition: 'top',
    style: { x: 270, y: 120 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '5',
    style: { x: 300, y: 180 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '6',
    labelPosition: 'right',
    name: 'AP',
    style: { x: 350, y: 180 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '7',
    labelPosition: 'left',
    name: '探针\nSTA100',
    style: { x: 250, y: 250 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '8',
    name: '',
    style: { x: 300, y: 250 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '9',
    labelPosition: 'right',
    name: 'WAP',
    style: { x: 350, y: 250 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '10',
    labelPosition: 'left',
    name: '交换机',
    style: { x: 250, y: 310 },
    data: {
      icon: icons.switchboard
    }
  },
  {
    type: 'image',
    id: '11',
    style: { x: 300, y: 310 },
    data: {
      icon: icons.internetBehavior
    }
  },
  {
    type: 'image',
    id: '12',
    labelPosition: 'right',
    name: '上网行为管理',
    style: { x: 350, y: 310 },
    data: {
      icon: icons.internetBehavior
    }
  },
  // 有线核心
  {
    type: 'image',
    id: '13',
    size: 48,
    labelPosition: 'left',
    labelFontSize: 16,
    name: '有线核心',
    style: { x: 270, y: 400 },
    data: {
      icon: icons.wiredCore
    }
  },
  {
    type: 'image',
    id: '14',
    size: 48,
    labelPosition: 'right',
    style: { x: 340, y: 400 },
    data: {
      icon: icons.wiredCore
    }
  },
  //左下角1
  {
    type: 'image',
    id: '15',
    labelPosition: 'right',
    style: { x: 70, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '16',
    labelPosition: 'right',
    style: { x: 70, y: 590 },
    data: {
      icon: icons.search
    }
  },
  {
    type: 'image',
    id: '17',
    style: { x: 40, y: 650 },
    data: {
      icon: icons.phone
    }
  },
  {
    type: 'image',
    id: '18',
    labelOffsetX: -30,
    name: '15F光网络\n万兆互联\n千兆下行',
    style: { x: 100, y: 650 },
    data: {
      icon: icons.phone
    }
  },
  //左下角2
  {
    type: 'image',
    id: '19',
    labelPosition: 'right',
    style: { x: 180, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '20',
    style: { x: 150, y: 650 },
    data: {
      icon: icons.arrow
    }
  },
  {
    type: 'image',
    id: '21',
    labelOffsetX: -30,
    name: '内网有线网络\n千兆互联\n百兆下行',
    style: { x: 200, y: 650 },
    data: {
      icon: icons.arrow
    }
  },
  // 左下角3
  {
    type: 'image',
    id: '22',
    style: { x: 290, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '23',
    style: { x: 340, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '24',
    style: { x: 270, y: 570 },
    data: {
      icon: icons.left4
    }
  },
  {
    type: 'image',
    id: '25',
    style: { x: 270, y: 610 },
    data: {
      icon: icons.search
    }
  },
  {
    type: 'image',
    id: '26',
    style: { x: 250, y: 650 },
    data: {
      icon: icons.phone
    }
  },
  {
    type: 'image',
    id: '27',
    labelOffsetX: -20,
    name: '3F离座光网络\n千兆互联\n千兆/千兆下行',
    style: { x: 290, y: 650 },
    data: {
      icon: icons.phone
    }
  },
  {
    type: 'image',
    id: '28',
    style: { x: 340, y: 650 },
    data: {
      icon: icons.arrow
    }
  },
  {
    type: 'image',
    id: '29',
    labelOffsetX: -20,
    name: '内网有线网络\n千兆互联\n千兆/百兆下行',
    style: { x: 380, y: 650 },
    data: {
      icon: icons.arrow
    }
  },
  // 左下角4
  {
    type: 'image',
    id: '30',
    style: { x: 420, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '31',
    style: { x: 470, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '32',
    style: { x: 420, y: 650 },
    data: {
      icon: icons.arrow
    }
  },
  {
    type: 'image',
    id: '33',
    labelOffsetX: -20,
    name: '内网有线网络\n千兆互联\n千兆/百兆下行',
    style: { x: 470, y: 650 },
    data: {
      icon: icons.arrow
    }
  },
  // 左下角5
  {
    type: 'image',
    id: '34',
    style: { x: 540, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '35',
    style: { x: 525, y: 650 },
    data: {
      icon: icons.arrow
    }
  },
  {
    type: 'image',
    id: '36',
    labelOffsetX: -20,
    name: '外网有线网络\n千兆互联\n百兆下行',
    style: { x: 570, y: 650 },
    data: {
      icon: icons.arrow
    }
  },
  // 左下角6
  {
    type: 'image',
    id: '37',
    style: { x: 670, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '38',
    name: '中心AP',
    labelFontSize: 9,
    style: { x: 620, y: 590 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '39',
    name: '拓展交换机',
    labelFontSize: 9,
    style: { x: 670, y: 590 },
    data: {
      icon: icons.switchboard
    }
  },
  {
    type: 'image',
    id: '40',
    name: 'POE交换机',
    labelFontSize: 9,
    style: { x: 720, y: 590 },
    data: {
      icon: icons.switchboard
    }
  },
  {
    type: 'image',
    id: '41',
    name: '敏分RU',
    labelOffsetX: 25,
    labelFontSize: 10,
    style: { x: 620, y: 650 },
    data: {
      icon:icons.left2
    }
  },
  {
    type: 'image',
    id: '42',
    style: { x: 670, y: 650 },
    data: {
      icon: icons.left2
    }
  },
  {
    type: 'image',
    id: '43',
    name: '放装AP',
    labelFontSize: 10,
    style: { x: 720, y: 650 },
    data: {
      icon: icons.column
    }
  },
  // 右下角1
  {
    type: 'image',
    id: '44',
    style: { x: 810, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '45',
    style: { x: 860, y: 530 },
    data: {
      icon: icons.earth
    }
  },
  {
    type: 'image',
    id: '46',
    name: '中心AP',
    labelFontSize: 9,
    style: { x: 780, y: 590 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '47',
    name: '拓展交换机',
    labelFontSize: 9,
    style: { x: 835, y: 590 },
    data: {
      icon: icons.switchboard
    }
  },
  {
    type: 'image',
    id: '48',
    name: 'POE交换机',
    labelFontSize: 9,
    style: { x: 890, y: 590 },
    data: {
      icon: icons.switchboard
    }
  },
  {
    type: 'image',
    id: '49',
    name: '敏分RU',
    labelOffsetX: 25,
    labelFontSize: 10,
    style: { x: 780, y: 650 },
    data: {
      icon: icons.left2
    }
  },
  {
    type: 'image',
    id: '50',
    style: { x: 835, y: 650 },
    data: {
      icon: icons.left2
    }
  },
  {
    type: 'image',
    id: '51',
    name: '放装AP',
    labelFontSize: 10,
    style: { x: 890, y: 650 },
    data: {
      icon: icons.column
    }
  },
  // 无线核心
  {
    type: 'image',
    id: '52',
    labelPosition: 'left',
    style: { x: 580, y: 400 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '53',
    labelPosition: 'right',
    labelFontSize: 16,
    name: '无线核心',
    style: { x: 640, y: 400 },
    data: {
      icon: icons.wirelessCore
    }
  },
  // 无线核心上侧
  {
    type: 'image',
    id: '54',
    labelPosition: 'right',
    name: '上网行为管理',
    style: { x: 610, y: 310 },
    data: {
      icon: icons.internetBehavior
    }
  },
  {
    type: 'image',
    id: '55',
    labelPosition: 'right',
    name: '防火墙',
    style: { x: 610, y: 240 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '56',
    labelPosition: 'top',
    name: 'Internet',
    style: { x: 610, y: 180 },
    data: {
      icon: icons.header
    }
  },
  {
    type: 'image',
    id: '57',
    labelPosition: 'top',
    name: 'Agile\nController\n认证',
    style: { x: 750, y: 260 },
    data: {
      icon: icons.secure
    }
  },
  {
    type: 'image',
    id: '58',
    labelPosition: 'top',
    name: 'Sight\n网管',
    style: { x: 800, y: 260 },
    data: {
      icon: icons.people
    }
  },
  {
    type: 'image',
    id: '59',
    labelPosition: 'top',
    style: { x: 775, y: 300 },
    data: {
      icon: icons.column
    }
  },
  // 区域环网
  {
    type: 'image',
    id: '60',
    labelPosition: 'right',
    name: '南山\n核心交换机',
    labelOffsetY: 15,
    style: { x: 650, y: 70 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '61',
    labelPosition: 'right',
    style: { x: 650, y: 105 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '62',
    labelPosition: 'left',
    name: '西丽\n核心交换机',
    labelOffsetY: 15,
    style: { x: 850, y: 70 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '63',
    labelPosition: 'right',
    style: { x: 850, y: 105 },
    data: {
      icon: icons.wirelessCore
    }
  },
  // 1号楼DC区域
  {
    type: 'image',
    id: '64',
    labelPosition: 'right',
    // combo: 'combo1',
    style: { x: 40, y: 70 },
    data: {
      icon: icons.file
    }
  },
  {
    type: 'image',
    id: '65',
    // combo: 'combo1',
    labelPosition: 'bottom',
    name: '计算资源池',
    labelFontSize: 10,
    style: { x: 40, y: 110 },
    data: {
      icon: icons.file
    }
  },
  {
    // combo: 'combo2',
    type: 'image',
    id: '66',
    labelPosition: 'right',
    style: { x: 90, y: 70 },
    data: {
      icon: icons.column
    }
  },
  {
    // combo: 'combo2',
    type: 'image',
    id: '67',
    labelPosition: 'bottom',
    name: '数据存储',
    labelFontSize: 10,
    style: { x: 90, y: 110 },
    data: {
      icon: icons.column
    }
  },
  {
    // combo: 'combo3',
    type: 'image',
    id: '68',
    labelPosition: 'bottom',
    name: '业务系统、数据库',
    labelOffsetX: 17,
    labelFontSize: 10,
    badge: false,
    style: { x: 140, y: 110 },
    description: '',
    data: {
      icon: icons.database2
    }
  },
  {
    // combo: 'combo3',
    type: 'image',
    id: '69',
    style: { x: 180, y: 110 },
    data: {
      icon: icons.database
    }
  },
  {
    type: 'image',
    id: '70',
    labelPosition: 'top',
    name: '业务接入交换机',
    labelFontSize: 9,
    labelOffsetX: 15,
    style: { x: 30, y: 200 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '71',
    style: { x: 60, y: 200 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '72',
    labelPosition: 'top',
    name: '业务接入交换机',
    labelFontSize: 9,
    labelOffsetX: 15,
    style: { x: 100, y: 200 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '73',
    labelPosition: 'right',
    style: { x: 130, y: 200 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '74',
    labelPosition: 'top',
    name: '业务接入交换机',
    labelFontSize: 9,
    labelOffsetX: 15,
    style: { x: 170, y: 200 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '75',
    labelPosition: 'right',
    style: { x: 200, y: 200 },
    data: {
      icon: icons.wirelessCore
    }
  },
  {
    type: 'image',
    id: '76',
    labelPosition: 'right',
    style: { x: 80, y: 250 },
    data: {
      icon: icons.column
    }
  },
  {
    type: 'image',
    id: '77',
    labelPosition: 'right',
    style: { x: 110, y: 240 },
    data: {
      icon: icons.column
    }
  },
  {
    id: 'line-1',
    size: 1,
    labelFontSize: 16,
    style: { x: 500, y: 0 },
    type: 'rect'
  },
  {
    id: 'line-2',
    size: 1,
    labelFontSize: 16,
    style: { x: 500, y: 825 },
    type: 'rect'
  },
  // 文字
  {
    id: 'text-1',
    size: 0,
    labelFontSize: 16,
    style: { x: 100, y: 20 },
    name: '1号楼 DC区域',
    type: 'rect'
  },
  {
    id: 'text-2',
    size: 0,
    labelFontSize: 16,
    style: { x: 750, y: 10 },
    name: '区域环网',
    type: 'rect'
  },
  {
    id: 'text-3',
    size: 0,
    labelFontSize: 16,
    style: { x: 120, y: 750 },
    name: '1号楼\nLAN',
    type: 'rect'
  },
  {
    id: 'text-4',
    size: 0,
    labelFontSize: 16,
    style: { x: 310, y: 750 },
    name: '科技大厦\nLAN',
    type: 'rect'
  },
  {
    id: 'text-5',
    size: 0,
    labelFontSize: 16,
    style: { x: 450, y: 750 },
    name: '水厂\nLAN',
    type: 'rect'
  },
  {
    id: 'text-6',
    size: 0,
    labelFontSize: 16,
    style: { x: 550, y: 750 },
    name: '1号楼\nFree-LAN',
    type: 'rect'
  },
  {
    id: 'text-7',
    size: 0,
    labelFontSize: 16,
    style: { x: 675, y: 750 },
    name: '1号楼\nWLAN',
    type: 'rect'
  },
  {
    id: 'text-8',
    size: 0,
    labelFontSize: 16,
    style: { x: 840, y: 750 },
    name: '科技大厦\nWLAN',
    type: 'rect'
  },
  {
    id: 'text-9',
    size: 0,
    labelFontSize: 10,
    style: { x: 680, y: 690 },
    name: 'WIFI 5/15F WIFI 6\n千兆联网/万兆互联',
    type: 'rect'
  },
  {
    id: 'text-10',
    size: 0,
    labelFontSize: 10,
    style: { x: 845, y: 690 },
    name: 'WIFI 5/15F WIFI 6\n千兆联网/万兆互联',
    type: 'rect'
  },
  {
    id: 'text-11',
    size: 0,
    labelFontSize: 16,
    style: { x: 520, y: 30 },
    name: '1\n号\n楼\n出\n口\n区\n域\n',
    type: 'rect'
  }
]

//曲线 quadratic
const edges = [
  { source: '3', target: '1', type: 'ant-line' },
  { source: '3', target: '2', type: 'ant-line' },
  { source: '3', target: '4', type: 'ant-line' },
  { source: '3', target: '5', type: 'ant-line' },
  { source: '3', target: '6', type: 'ant-line' },
  { source: '5', target: '8', type: 'ant-line' },
  { source: '6', target: '9', type: 'ant-line' },
  { source: '7', target: '10', type: 'ant-line' },
  { source: '8', target: '11', type: 'ant-line' },
  { source: '9', target: '12', type: 'ant-line' },
  { source: '10', target: '13', type: 'ant-line' },
  { source: '10', target: '14', type: 'ant-line' },
  { source: '11', target: '13', type: 'ant-line' },
  { source: '12', target: '14', type: 'ant-line' },
  { source: '13', target: '14', type: 'ant-line' },
  { source: '13', target: '15', type: 'ant-line' },
  { source: '14', target: '23', type: 'ant-line', stroke: 'red', lineDash: [5, 5] },
  { source: '14', target: '15', type: 'ant-line' },
  { source: '15', target: '16', type: 'ant-line' },
  { source: '16', target: '17', type: 'ant-line' },
  { source: '16', target: '18', type: 'ant-line' },
  { source: '14', target: '19', type: 'ant-line' },
  { source: '19', target: '20', type: 'ant-line' },
  { source: '19', target: '21', type: 'ant-line' },
  { source: '23', target: '22', type: 'ant-line' },
  { source: '22', target: '24', type: 'ant-line' },
  { source: '24', target: '25', type: 'ant-line' },
  { source: '25', target: '26', type: 'ant-line' },
  { source: '25', target: '27', type: 'ant-line' },
  { source: '22', target: '28', type: 'ant-line' },
  { source: '23', target: '29', type: 'ant-line' },
  { source: '13', target: '30', type: 'ant-line' },
  { source: '14', target: '31', type: 'ant-line' },
  { source: '30', target: '32', type: 'ant-line' },
  { source: '31', target: '33', type: 'ant-line' },
  { source: '34', target: '35', type: 'ant-line' },
  { source: '34', target: '36', type: 'ant-line' },
  { source: '37', target: '38', type: 'ant-line' },
  { source: '37', target: '40', type: 'ant-line' },
  { source: '38', target: '41', type: 'ant-line' },
  { source: '39', target: '42', type: 'ant-line' },
  { source: '40', target: '43', type: 'ant-line' },
  { source: '38', target: '39', type: 'ant-line' },
  { source: '44', target: '45', type: 'ant-line' },
  { source: '44', target: '46', type: 'ant-line' },
  { source: '46', target: '47', type: 'ant-line' },
  { source: '45', target: '48', type: 'ant-line' },
  { source: '46', target: '49', type: 'ant-line' },
  { source: '47', target: '50', type: 'ant-line' },
  { source: '48', target: '51', type: 'ant-line' },
  { source: '52', target: '34', type: 'ant-line' },
  { source: '52', target: '37', type: 'ant-line' },
  { source: '52', target: '53', type: 'ant-line' },
  { source: '54', target: '52', type: 'ant-line' },
  { source: '52', target: '44', type: 'ant-line' },
  { source: '53', target: '37', type: 'ant-line' },
  { source: '54', target: '53', type: 'ant-line' },
  { source: '53', target: '45', type: 'ant-line', stroke: 'red', lineDash: [5, 5] },
  { source: '55', target: '54', type: 'ant-line' },
  { source: '56', target: '55', type: 'ant-line' },
  { source: '59', target: '52', type: 'ant-line' },
  { source: '59', target: '53', type: 'ant-line' },
  { source: '60', target: '62', type: 'ant-quadratic', stroke: 'red' },
  { source: '63', target: '61', type: 'ant-quadratic', stroke: 'red' },
  { source: '60', target: '14', type: 'ant-quadratic', stroke: 'red', curveOffset: 40 },
  { source: '63', target: '14', type: 'ant-quadratic', stroke: 'red', curveOffset: 60 },
  { source: '13', target: '52', type: 'ant-quadratic', curveOffset: 100, lineWidth: 2 },
  { source: '14', target: '53', type: 'ant-quadratic', curveOffset: 100, lineWidth: 2 },
  { source: '76', target: '13', type: 'ant-line' },
  { source: '77', target: '14', type: 'ant-line' },
  { source: 'line-1', target: 'line-2', type: 'line', lineDash: [5, 5], stroke: 'rgb(153 153 153 / 50%)' }
]

function rendering() {
  if (graph) {
    graph.destroy()
  }

  const combos = [
    {
      id: 'combo1',
      combo: 'combo1',
      data: { label: 'Combo 1' },
      style: {
        height: 100,
        width: 100
      }
    },
    {
      id: 'combo2',
      combo: 'combo2',
      data: { label: 'Combo 2' },
      style: {
        height: 100,
        width: 100
      }
    },
    {
      id: 'combo3',
      combo: 'combo3',
      data: { label: 'Combo 3' },
      style: {
        height: 200,
        width: 200,
        size: 200
      }
    }
  ]

  const data = {
    nodes,
    edges
  }

  graph = new Graph({
    container: 'container',
    data,
    node: {
      // type: (datum: any): string => datum.type,
      style: {
        size: (d: any) => (d.size || d.size === 0 ? d.size : 40),
        labelText: (d: any) => (d.name ? d.name : ''),
        src: (d: any) => d.data.icon,
        haloStroke: '#227eff',
        // badgeFontSize: 8,
        badgePadding: [1, 4],
        port: true,
        ports: [{ key: 'center', placement: 'center', fill: '#7E92B5' }],
        // ports: (d: any) => (d.ports ? [{ key: 'top', placement: d.ports, fill: '#7E92B5' }] : []),
        labelFontSize: (d: any) => (d.labelFontSize ? d.labelFontSize : 11),
        labelOffsetX: (d: any) => (d.labelOffsetX ? d.labelOffsetX : 0), //文本相对x轴偏移
        labelOffsetY: (d: any) => (d.labelOffsetY ? d.labelOffsetY : 0), //文本相对Y轴偏移
        labelPlacement: (d: any) => (d.labelPosition ? d.labelPosition : 'bottom'), // 标签相对于节点主图形的位置

        badge: (d: any) => (d.badge ? true : false), // 是否显示徽标
        badges: [{ text: '!', placement: 'left-top' }],
        badgePalette: ['red'], // 徽标的背景色板
        offsetX: 10,
        badgeFontSize: 8 // 徽标字体大小
      }
    },
    edge: {
      type: (d: any) => (d.type ? d.type : 'line'),
      style: {
        // endArrow: true, // 启用结束箭头
        lineDash: [10, 10], //虚线断点间隔
        // lineDash: (d: any) => (d.lineDash ? d.lineDash : ''),
        // stroke: '#F6BD16'
        curveOffset: (d: any) => (d.curveOffset ? d.curveOffset : 70), //曲线弯曲程度
        stroke: (d: any) => (d.stroke ? d.stroke : '#F6BD16'), //连线颜色
        lineWidth: (d: any) => (d.lineWidth ? d.lineWidth : 1) //连线宽度
        // sourcePort: 'top', // 从节点1的顶部连接
        // targetPort: 'top' // 到节点3的顶部连接
      }
    },

    // combo: {
    //   type: 'rect',
    //   style: {
    //     // padding: 2,
    //     // labelText: (d:any) => d.data.label,
    //     labelPlacement: 'bottom',
    //     height:200,
    //     width:200,
    //     size: 200
    //   }
    // },

    // 径向布局
    // layout: {
    //   type: 'radial', // 布局类型，'radial' 表示放射状布局
    //   nodeSize: 32, // 节点的大小
    //   unitRadius: 200, // 单位半径，影响节点之间的距离
    //   linkDistance: 200, // 连线的距离，影响连接节点之间的间距
    //   preventOverlap: true, // 是否防止节点重叠
    //   maxPreventOverlapIteration: 300 // 最大防止重叠的迭代次数
    // },
    autoFit: {
      type: 'view', // 自适应类型：'view' 或 'center'
      options: {
        // 仅适用于 'view' 类型
        when: 'always', // 何时适配：'overflow'(仅当内容溢出时) 或 'always'(总是适配)
        direction: 'both' // 适配方向：'x'、'y' 或 'both'
      },
      animation: {
        // 自适应动画效果
        duration: 1000, // 动画持续时间(毫秒)
        easing: 'ease-in-out' // 动画缓动函数
      }
    },

    plugins: [
      {
        type: 'tooltip',
        getContent: (e: any, items: any) => {
          let result = ``
          if (items && items[0] && items[0].description) {
            items.forEach((item: any) => {
              result += `<p>${item.description}</p>`
            })
            return result
          }
          return ''
        }
      }
    ],
    behaviors: ['drag-canvas', 'zoom-canvas']
  })
  graph.render()
}

// 组件卸载时清理定时器和图表实例
onUnmounted(() => {
  if (graph) {
    graph.destroy()
  }
})
</script>

<style lang="less" scoped></style>
