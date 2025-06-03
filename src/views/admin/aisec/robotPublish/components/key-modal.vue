<script lang="ts" setup>
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import { copyText } from '@/utils/tools'
import request from '@/request'
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'
import { confirmModal } from '@/utils/modal'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post(`/digital/human/apikey/page/${initData.value?.id}`, { ...params }),
  {}
)

function onBeforeOpen() {
  if (initData.value) {
    loadData(true)
  }
}

function addKey() {
  request.Get(`/digital/human/apikey/create/${initData.value?.id}`).then(() => {
    Message.success('新增成功')
    loadData(true)
  })
}

function changeStatus(record: any) {
  request.Put(`/digital/human/apikey/update/status/${record.id}`).then(() => {
    Message.success('修改成功')
    loadData()
  })
}

async function deleteKey(record: any) {
  await confirmModal('删除确认', '您确定要删除API Key吗？')
  request.Delete(`/digital/human/apikey/delete/${record.id}`).then(() => {
    Message.success('删除成功')
    loadData()
  })
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
    title="API Key"
    title-align="start"
    unmount-on-close
    :width="800"
    :footer="false"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-button type="primary" class="mb-24" @click="addKey"> 新增 </a-button>
    <div class="h-500">
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
          <a-table-column title="授权key" data-index="apiKey" ellipsis tooltip />
          <a-table-column title="状态" data-index="status" ellipsis tooltip :width="100">
            <template #cell="{ record }">
              <a-switch v-model="record.status" :checked-value="1" :unchecked-value="2" @change="changeStatus(record)" />
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" ellipsis tooltip :width="180" />
          <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="100">
            <template #cell="{ record }">
              <a-link @click="deleteKey(record)">删除</a-link>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<style lang="less" scoped></style>
