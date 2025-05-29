<template>
  <div class="w-full h-full px-24 py-24 box-border">
    <div class="w-full h-full rounded-20 overflow-hidden bg-white px-28 pb-28">
      <!-- 搜索栏 -->
      <!-- h-70 -->
      <div class="w-full h-20 flex justify-end items-center bg-white">
        <!-- <div class="search-item">
          <span>IP</span>
          <a-input v-model.trim="formData.reportName" allow-clear placeholder="请输入" @input="handleInput" style="width: 180px" />
        </div>
        <div class="search-item">
          <span>攻击方式</span>
          <a-select v-model="formData.source" allow-clear placeholder="请选择" style="width: 180px">
            <a-option v-for="item in attackOptions" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>资产类型</span>
          <a-select v-model="formData.createType" allow-clear placeholder="请选择" style="width: 180px">
            <a-option v-for="item in assetOptions" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <a-button type="outline" @click="search" class="ml-30 mr-40"> 搜索 </a-button> -->
      </div>
      <!-- 关系图 -->
      <div class="relative w-full h-[calc(100%-10px)] bg-#f9fafd box-border rounded-10" style="border: 1px dashed #2e66c7">
        <div v-if="showFlag" class="absolute top-50% left-50%" style="transform: translate(-50%, -50%)">
          <a-spin v-if="showFlag" dot class="absolute top-50% left-50%" style="transform: translate(-50%, -50%)" />
        </div>
        <a-empty v-if="isEmpty" class="absolute top-50% left-50%" style="transform: translate(-50%, -50%)" />
        <div id="container" class="w-full h-full rounded-10 bg-#f9fafd;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import request from '@/request'
import { ExtensionCategory, Graph, Line, register } from '@antv/g6'

class AntLine extends Line {
  onCreate() {
    const shape = this.shapeMap.key
    shape.animate([{ lineDashOffset: 20 }, { lineDashOffset: 0 }], {
      duration: 500,
      iterations: Infinity
    })
  }
}
register(ExtensionCategory.EDGE, 'ant-line', AntLine)

const formData = ref({
  reportName: '',
  source: '',
  createType: ''
})
const showFlag = ref(true)
const isEmpty = ref(false)

const attackOptions = ref([
  { label: '自动创建', value: '1' },
  { label: '用户操作', value: '2' }
])

const assetOptions = ref([
  { label: '自动创建', value: '1' },
  { label: '用户操作', value: '2' }
])

let graph: Graph | null = null // 添加全局 graph 变量
const timer = null
onMounted(() => {
  getData() // 初始加载数据
  // // 设置定时器，每60秒执行一次
  // timer = setInterval(() => {
  //   getData()
  // }, 10000)
})

function search() {
  console.log('搜索')
}

const handleInput = (e: any) => {
  const value = e
  // 只允许数字和.符号
  const newValue = value.replace(/[^\d.]/g, '')
  if (value !== newValue) {
    formData.value.reportName = newValue
  }
}

function getData() {
  showFlag.value = true
  isEmpty.value = false
  request
    .Post('/metadata/chart/query', {})
    .then((res: any) => {
      if (res && res.code === 1 && res.data) {
        if (graph) {
          graph.destroy()
        }
        // console.log('日志关系数据', res)
        if (res.data.nodeInfoList && res.data.nodeInfoList.length > 0) {
          const nodeInfoList = res.data.nodeInfoList
          const nodeLineInfoList = res.data.nodeLineInfoList
          const nodes = nodeInfoList.map((item: any) => {
            const data: any = { label: item.name, type: 'rect', id: item.id, size: [100, 20], description: '' }
            if (item.attributesInfos && item.attributesInfos.length === 1) {
              const info = item.attributesInfos[0]
              if (info.attributesValue.indexOf('中国') === -1) {
                data.color = '#F08F56'
              }
              data.description = info.attributesValue
            } else {
              data.description = 'LAN'
            }
            return data
          })
          // 去重，避免重复的边
          const edgesSet = new Set()
          const edges = nodeLineInfoList
            .map((item: any) => {
              const edgeKey = `${item.sourceId}-${item.targetId}`
              if (!edgesSet.has(edgeKey)) {
                edgesSet.add(edgeKey)
                return { source: item.sourceId, target: item.targetId }
              }
              return null // 返回 null 以便后续过滤
            })
            .filter((edge: { source: string; target: string } | null) => edge !== null) // 显式指定类型
          // console.log('nodes', nodes)
          // console.log('edges', edges)

          const data = {
            nodes,
            edges
          }

          graph = new Graph({
            container: 'container',
            data,
            node: {
              type: 'rect',
              style: {
                radius: 5,
                labelText: (d: any) => d.label,
                labelPlacement: 'center',
                labelFill: '#fff',
                size: (d: any) => d.size,
                fill: (d: any) => d.color || '#1783FF' // 设置节点颜色
              }
            },
            edge: {
              type: 'ant-line',
              style: {
                endArrow: true, // 启用结束箭头
                lineDash: [10, 10],
                stroke: '#F6BD16'
              }
            },
            // 力导向布局
            // layout:
            //   type: 'd3-force',
            //   link: {
            //     distance: 10,
            //     strength: 2,
            //     maxLength: 30 // 设置连线的最长长度
            //   },
            //   center: {
            //     strength: 1.5
            //   },
            //   collide: {
            //     radius: 40
            //   }
            //   // 添加 forceLink 来设置最大长度
            //   // forceLink: {
            //   //   maxLength: 40 // 设置连线的最长长度
            //   // }
            // },

            // 力导向布局2
            // layout: {
            //   type: 'force',
            //   linkDistance: 50,
            //   clustering: true,
            //   nodeClusterBy: 'cluster',
            //   clusterNodeStrength: 70
            // },

            // 径向布局
            layout: {
              type: 'radial', // 布局类型，'radial' 表示放射状布局
              nodeSize: 32, // 节点的大小
              unitRadius: 200, // 单位半径，影响节点之间的距离
              linkDistance: 200, // 连线的距离，影响连接节点之间的间距
              preventOverlap: true, // 是否防止节点重叠
              maxPreventOverlapIteration: 300 // 最大防止重叠的迭代次数
            },
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
            behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element']
          })
          graph.render()
          showFlag.value = false
        }
      } else {
        isEmpty.value = true
      }
    })
    .catch((err) => {
      isEmpty.value = true
      showFlag.value = false
      console.log(err)
    })
}

// 组件卸载时清理定时器和图表实例
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  if (graph) {
    graph.destroy()
  }
})
</script>

<style lang="less" scoped>
.search-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  column-gap: 14px;
  font-size: 14px;
  color: #303544;

  > span {
    &:first-of-type {
      flex-shrink: 0;
      text-align: right;
    }
  }
}

.search-item > span:first-of-type {
  display: inline-block;
  width: 80px;
}
</style>
