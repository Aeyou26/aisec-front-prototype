<template>
  <div class="w-full h-full p-24 flex flex-col gap-24">
    <!-- 第一行卡片 -->
    <div class="w-full h-260 flex gap-24">
      <AssetTypeChart class="flex-1" />
      <LoopholeFixed class="flex-1" />
      <SupplierLoophole class="flex-1" />
    </div>
    <!-- 第二行卡片 -->
    <div class="w-full h-300 flex gap-24">
      <VulnSource class="flex-1" />
      <AssetThreat class="flex-1" />
    </div>
    <!-- 第三行卡片 -->
    <div class="flex-1 flex gap-24 min-h-0">
      <div class="flex-1 flex gap-24">
        <Property class="flex-1" title="资产监测中..." :list="assetStatList" text-color="#2e66c7">
          <template #icon>
            <div class="icon-wrapper-small">
              <div class="ripple-container-small">
                <div class="ripple-small"></div>
                <div class="ripple-small"></div>
                <div class="ripple-small"></div>
              </div>
              <img src="@/assets/images/safe-header.png" class="w-100 h-100 cursor-pointer icon-position" />
            </div>
          </template>
        </Property>

        <Property class="flex-1" title="风险监测中..." :list="riskStatList" text-color="#DB5757">
          <template #icon>
            <img src="@/assets/images/safe-header2.png" class="w-110 h-110 cursor-pointer rotate-animation" />
          </template>
        </Property>
      </div>
      <TodoList class="flex-1" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Property from '@/views/dashboard/components/property.vue'
import LoopholeFixed from '@/views/dashboard/components/loophole-fixed.vue'
import SupplierLoophole from '@/views/dashboard/components/supplier-loophole.vue'
import VulnSource from '@/views/dashboard/components/vuln-source.vue'
import AssetThreat from '@/views/dashboard/components/asset-threat.vue'
import AssetTypeChart from '@/views/dashboard/components/asset-type.vue'
import TodoList from '@/views/dashboard/components/todoList.vue'
import Monitor from '@/views/dashboard/components/monitor.vue'
import request from '@/request'

interface AssetStat {
  assets: number
  online: number
  risk: number
  fixed: number
  tdAlert: number
  tdHandle: number
  untreated: number
  vuln: number
  riskAssets: string[]
}
type AssetStatKey = Exclude<keyof AssetStat, 'riskAssets'>
interface InfoItem {
  title: string
  value: number
  color: string
  list?: string[]
  key: AssetStatKey
}

const assetStatList = ref<InfoItem[]>([
  { title: '资产统计', value: 0, key: 'assets', color: '#2e66c7' },
  { title: '风险资产', value: 0, key: 'risk', color: '#DB5757', list: [] }
])

const riskStatList = ref<InfoItem[]>([
  { title: '漏洞总数', value: 0, key: 'vuln', color: '#457ad9' },
  { title: '已修复漏洞数', value: 0, key: 'fixed', color: '#91cc75' }
])

const getData = () => {
  request.Get<{ data: AssetStat }>('/user/asset/overview').then((res) => {
    if (res && res.data) {
      assetStatList.value.forEach((item) => {
        const val = res.data[item.key]
        if (typeof val === 'number') {
          item.value = val
        }
        if (item.key === 'risk') {
          item.list = res.data?.riskAssets || []
        }
      })
      riskStatList.value.forEach((item) => {
        const val = res.data[item.key]
        if (typeof val === 'number') {
          item.value = val
        }
      })
    }
  })
}

onMounted(() => {
  getData()
})
</script>

<style lang="less" scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.rotate-animation {
  animation: rotate 2s linear infinite;
}

.icon-wrapper {
  position: relative;
  width: 98px;
  height: 98px;
}

.icon-wrapper-small {
  position: relative;
  width: 100px;
  height: 100px;
}

.icon-position {
  position: relative;
  z-index: 2;
}

.ripple-container {
  position: absolute;
  top: 46%;
  left: 48%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.ripple-container-small {
  position: absolute;
  top: 46%;
  left: 48%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgb(46 102 199 / 20%);
  background-color: rgb(46 102 199 / 20%);
  animation: ripple 2s linear infinite;

  &:nth-child(2) {
    animation-delay: 0.6s;
  }

  &:nth-child(3) {
    animation-delay: 1.2s;
  }
}

.ripple-small {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgb(46 102 199 / 20%);
  background-color: rgb(46 102 199 / 20%);
  animation: ripple 2s linear infinite;

  &:nth-child(2) {
    animation-delay: 0.6s;
  }

  &:nth-child(3) {
    animation-delay: 1.2s;
  }
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }

  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>
