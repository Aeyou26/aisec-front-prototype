<script lang="ts" setup>
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()
const formData = reactive<any>({
  vendor: ''
})
const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => request.Post('/user/asset/page', params),
  formData
)
function onBeforeOpen() {
  if (initData.value) {
    formData.vendor = initData.value.vendor
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
      >
        <template #columns>
          <a-table-column title="序号" :width="80" align="center">
            <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
          </a-table-column>
          <a-table-column title="资产名称" data-index="assetsName" ellipsis tooltip :width="180" />
          <a-table-column title="资产类别" data-index="assetsType" ellipsis tooltip :width="120"> </a-table-column>
          <!-- <a-table-column title="应用描述" data-index="remark" ellipsis tooltip :width="200" /> -->
          <a-table-column title="域名" data-index="assetsIp" ellipsis tooltip :width="200"></a-table-column>
          <!-- <a-table-column title="操作系统" data-index="assetsOs" ellipsis tooltip :width="120" /> -->
          <a-table-column title="数据库及版本" data-index="dbList" ellipsis tooltip :width="140"></a-table-column>
          <a-table-column title="编程语言" data-index="language" ellipsis tooltip :width="100" />
          <a-table-column title="中间件及版本" data-index="middlewareList" ellipsis tooltip :width="160"></a-table-column>
          <a-table-column title="开放端口" data-index="servicePorts" ellipsis tooltip :width="100"></a-table-column>
          <a-table-column title="开发单位" data-index="vendor" ellipsis tooltip :width="140" />
          <a-table-column title="开发单位负责人" data-index="vendorPrincipal" ellipsis tooltip :width="160" />
          <a-table-column title="开发单位联系方式" data-index="vendorPrincipalPhone" ellipsis tooltip :width="160" />
          <a-table-column title="物理位置" data-index="area" ellipsis tooltip :width="180" />
          <a-table-column title="责任人" data-index="aegisDeptPrincipal" ellipsis tooltip :width="100" />
          <a-table-column title="资产重要程度" data-index="assetsLevel" ellipsis tooltip :width="140"></a-table-column>
          <a-table-column title="状态" data-index="status" ellipsis tooltip :width="100">
            <template #cell="{ record: { status } }">
              <div :class="status === '正常' ? 'text-green' : 'text-red'">
                <span>{{ status }}</span>
              </div>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<style lang="less" scoped></style>
