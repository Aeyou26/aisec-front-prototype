<script lang="ts" setup>
import { Message, TableSortable } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()
const sortable: TableSortable = { sortDirections: ['ascend', 'descend'], sorter: true }
const formData = reactive<any>({
  assetsId: '',
  vulnStatus: '待修复'
})
const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => request.Post('/user/loophole/page', params),
  formData
)
function onAllSortChange(dataIndex: string, direction: string) {
  if (direction) {
    const orders = [{ column: dataIndex, asc: direction === 'ascend' }]
    Object.assign(formData, { orders })
  } else {
    Object.assign(formData, { orders: [] })
  }
  loadData(true)
}
function onBeforeOpen() {
  if (initData.value) {
    formData.assetsId = initData.value.assetsId
    loadData(true)
  }
}

function onClose() {
  closeModal()
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal
    v-model:visible="visible"
    title="服务系统数"
    title-align="start"
    :width="1000"
    :footer="false"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <div class="h-600">
      <a-table
        row-key="id"
        :scroll="{ x: '100%', y: '100%' }"
        :bordered="false"
        :data="taleData"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        @sorter-change="onAllSortChange"
      >
        <template #columns>
          <a-table-column title="序号" :width="80" align="center">
            <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
          </a-table-column>
          <a-table-column title="漏洞ID" data-index="id" ellipsis tooltip :width="100" align="center" />
          <a-table-column title="漏洞名称" data-index="vulnName" ellipsis tooltip :width="140" />
          <a-table-column title="漏洞类型" data-index="vulnTypeName" ellipsis tooltip :width="140" />
          <a-table-column title="资产名称" data-index="assetsName" ellipsis tooltip :width="140" />
          <a-table-column title="资产类型" data-index="assetsType" ellipsis tooltip :width="140" />
          <a-table-column title="漏洞等级" data-index="vulnLevel" ellipsis tooltip :width="100" />
          <a-table-column title="所属单位" data-index="deptName" ellipsis tooltip :width="100" />
          <a-table-column title="漏洞数量" data-index="vulnCount" align="center" ellipsis tooltip :width="110" :sortable="sortable" />
          <a-table-column title="漏洞状态" data-index="vulnStatus" ellipsis tooltip :width="100" />
          <a-table-column title="下发状态" data-index="issuedStatus" ellipsis tooltip :width="100" />
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<style lang="less" scoped></style>
