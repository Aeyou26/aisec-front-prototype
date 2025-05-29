<script lang="ts" setup>
import { usePaginationFront } from '@/hooks/usePaginationAlova'
import request from '@/request'
import { TableRowSelection } from '@arco-design/web-vue'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const selectedKeys = ref<any[]>([])
const rowSelection = reactive<TableRowSelection>({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
})
const formData = reactive({
  vulnName: '',
  vendor: ''
})
const vendors = ref<any[]>([])
const vendorOptions = ref<any[]>([])
const { pagination, taleData, loading, onPageChange, onPageSizeChange, loadData } = usePaginationFront(() => request.Post('/supplier/vuln', vendors.value), {})

const showVulnList = computed(() => {
  // initData.value 是外层供应商已存在漏洞列表
  // 从taleData中过滤掉initData.value 同时过滤formData的数据
  return taleData.value.filter(
    (item: any) => !initData.value.some((v: any) => v.vulnId === item.vulnId) && item.vulnName.includes(formData.vulnName) && item.vendor.includes(formData.vendor)
  )
})

// 修正分页总数
const customPagination = computed(() => {
  return {
    ...pagination.value,
    total: showVulnList.value.length
  }
})

const emit = defineEmits(['submit'])
function onBeforeOpen() {
  const vList = sessionStorage.getItem('vendors')
  vendors.value = vList ? JSON.parse(vList) : []
  vendorOptions.value = vList ? JSON.parse(vList)?.map((item: any) => ({ label: item, value: item })) : []
  // 请求获取供应商全部漏洞
  loadData(true)
}

function onClose() {
  selectedKeys.value = []
  closeModal()
}

function onSubmit() {
  const selectedData = selectedKeys.value.map((item: any) => showVulnList.value.find((v: any) => v.id === item))
  emit('submit', selectedData)
  onClose()
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="新增漏洞" title-align="start" :width="1000" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <div class="flex justify-end mb-24">
      <div class="flex items-center gap-14">
        <span v-if="vendorOptions.length > 1" class="text-14 text-#333333">资产</span>
        <a-select v-if="vendorOptions.length > 1" v-model="formData.vendor" :options="vendorOptions" class="!w-180" allow-clear placeholder="请选择"></a-select>
        <span class="text-14 text-#333333">漏洞名称</span>
        <a-input v-model="formData.vulnName" class="!w-180" allow-clear placeholder="请输入"></a-input>
      </div>
    </div>
    <div class="h-480">
      <a-table
        v-model:selected-keys="selectedKeys"
        row-key="id"
        :scroll="{ x: '100%', y: '100%' }"
        :row-selection="rowSelection"
        :bordered="false"
        :data="showVulnList"
        :loading="loading"
        :pagination="customPagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #columns>
          <a-table-column title="漏洞ID" data-index="id" ellipsis tooltip :width="100" align="center" />
          <a-table-column title="漏洞名称" data-index="vulnName" ellipsis tooltip />
          <a-table-column title="关联资产" data-index="vendor" ellipsis tooltip />
        </template>
      </a-table>
    </div>
    <template #footer>
      <a-space>
        <a-button @click="onClose()"> 取消 </a-button>
        <a-button type="primary" @click="onSubmit()"> 确定 </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style lang="less" scoped></style>
