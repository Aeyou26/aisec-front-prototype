<template>
  <div v-if="items.length > 0" class="status-monitor">
    <div class="monitor-header">
      <div class="monitor-title">资产总数：{{ totalAssets }}</div>
      <!-- <div class="monitor-badge" :class="statusClass">{{ online }}台设备在线</div> -->
    </div>
    <div class="monitor-body">
      <div v-for="(item, index) in items" :key="index" class="monitor-item" :class="{ active: item.active }">
        <div class="item-status">
          <div class="status-dot" :class="getStatusClass(item.status)"></div>
        </div>
        <div class="item-label">{{ item.label }}</div>
        <div class="item-value">{{ item.value }}</div>
      </div>
    </div>
    <div class="monitor-footer">
      <div class="update-time">更新于 {{ updateTime }}</div>
    </div>
  </div>
  <Empty v-else is-echart />
</template>

<script setup lang="ts">
import request from '@/request'
import { computed, ref, onMounted } from 'vue'

interface StatusItem {
  label: string
  value: string
  status: 'ok' | 'warning' | 'error' | 'inactive' | 'green' | 'blue' | 'purple' | 'teal' | 'cyan'
  active: boolean
}

interface ChartDataItem {
  id: null | number
  dataType: null | string
  name: string
  value: string
}

const online = ref(0)
const chartData = ref<ChartDataItem[]>([])
const items = ref<StatusItem[]>([])
const updateTime = ref<string>('--')
const totalAssets = ref(0)

const statusClass = computed(() => 'status-online')

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    ok: 'status-ok',
    warning: 'status-warning',
    error: 'status-error',
    inactive: 'status-inactive',
    green: 'status-green',
    blue: 'status-blue',
    purple: 'status-purple',
    teal: 'status-teal',
    cyan: 'status-cyan'
  }

  return classMap[status] || 'status-unknown'
}

// 格式化时间
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取数据
const getData = () => {
  request.Get('/user/asset/type/stat').then((res: any) => {
    if (res && res.data) {
      // 更新获取时间
      updateTime.value = formatDateTime(new Date())

      chartData.value = res.data.map((item: any) => ({
        id: item.id,
        dataType: item.dataType,
        name: item.name,
        value: item.value
      }))

      // 将 chartData 转换为 items 格式
      items.value = chartData.value.map((item, index) => {
        // 使用更多中性颜色，为每个项目分配不同状态
        const statusTypes: Array<'green' | 'blue' | 'purple' | 'teal' | 'cyan'> = ['green', 'blue', 'purple', 'teal', 'cyan']
        const status = statusTypes[index % statusTypes.length]

        return {
          label: item.name,
          value: item.value,
          status: status,
          active: true
        }
      })

      // 计算资产总数
      totalAssets.value = chartData.value.reduce((sum, item) => sum + (parseInt(item.value) || 0), 0)
    }
  })
  request.Get('/user/asset/overview').then((res: any) => {
    if (res && res.data) {
      online.value = res?.data?.online
    }
  })
}

onMounted(() => {
  // 获取数据
  getData()
})
</script>

<style scoped lang="less">
.status-monitor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgb(160 174 192 / 20%);
}

.monitor-title {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.monitor-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;

  &.status-online {
    background: rgb(56 178 172 / 20%);
    color: #4fd1c5;
  }

  &.status-offline {
    background: rgb(160 174 192 / 20%);
    color: #a0aec0;
  }

  &.status-warning {
    background: rgb(236 201 75 / 20%);
    color: #f6e05e;
  }

  &.status-error {
    background: rgb(229 62 62 / 20%);
    color: #fc8181;
  }

  &.status-maintenance {
    background: rgb(79 209 197 / 20%);
    color: #76e4da;
  }

  &.status-unknown {
    background: rgb(160 174 192 / 20%);
    color: #cbd5e0;
  }
}

.monitor-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  overflow-y: auto;
}

.monitor-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background: rgb(26 32 44 / 40%);
  transition: all 0.3s ease;

  &:hover {
    background: rgb(45 55 72 / 50%);
  }

  &.active {
    border-left: 2px solid #4299e1;
  }
}

.item-status {
  margin-right: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.status-ok,
  &.status-green {
    background: #38b2ac;
    box-shadow: 0 0 5px rgb(56 178 172 / 50%);
  }

  &.status-warning,
  &.status-blue {
    background: #4299e1;
    box-shadow: 0 0 5px rgb(66 153 225 / 50%);
  }

  &.status-error,
  &.status-purple {
    background: #805ad5;
    box-shadow: 0 0 5px rgb(128 90 213 / 50%);
  }

  &.status-inactive {
    background: #718096;
    box-shadow: 0 0 5px rgb(113 128 150 / 50%);
  }

  &.status-teal {
    background: #319795;
    box-shadow: 0 0 5px rgb(49 151 149 / 50%);
  }

  &.status-cyan {
    background: #0bc5ea;
    box-shadow: 0 0 5px rgb(11 197 234 / 50%);
  }
}

.item-label {
  font-size: 12px;
  color: #a0aec0;
  width: 300px;
}

.item-value {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
}

.monitor-footer {
  font-size: 10px;
  color: #718096;
  text-align: right;
}
</style>
