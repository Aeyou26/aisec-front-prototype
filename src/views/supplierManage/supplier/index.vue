<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'
import serverModal from './components/server-modal.vue'
import { TableRowSelection, TableSortable } from '@arco-design/web-vue'

interface SearchFormProps {
  keywords?: string
  orders?: any[]
}
const initSearchForm: SearchFormProps = {
  keywords: void 0,
  orders: [
    {
      column: 'noFixed',
      asc: false
    }
  ]
}

const selectedKeys = ref<any[]>([])
const rowSelection = reactive<TableRowSelection>({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
})
const sortable: TableSortable = { sortDirections: ['ascend', 'descend'], sorter: true }
const serverModalRef = ref<any>()
const formData = reactive({ ...initSearchForm })
const router = useRouter()
const { pagination, taleData, loading, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/supplier/page', params), formData)
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}
function onAllSortChange(dataIndex: string, direction: string) {
  if (direction) {
    const orders = [{ column: dataIndex, asc: direction === 'ascend' }]
    Object.assign(formData, { orders })
  } else {
    Object.assign(formData, { orders: [] })
  }
  loadData(true)
}

function handleClick(status: number, record: any, isBatch = false) {
  const vendors = isBatch ? record : [record.vendor]
  // 将供应商列表存储到 sessionStorage 中
  sessionStorage.setItem('vendors', JSON.stringify(vendors))
  sessionStorage.setItem('contactList', JSON.stringify(record.contactList))
  sessionStorage.setItem('phoneList', JSON.stringify(record.phoneList))
  router.push({
    path: '/supplierFeedback',
    query: {
      status
    }
  })
}

function goDetail(vendor: string) {
  sessionStorage.setItem('vendors', JSON.stringify([vendor]))
  router.push(`/supplierManage/issueNotice?vendor=${vendor}`)
}

onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page>
    <serverModal ref="serverModalRef" />
    <template #action>
      <a-button type="primary" :disabled="selectedKeys.length === 0" @click="handleClick(11, selectedKeys, true)"> 批量下发 </a-button>
      <div></div>
    </template>
    <template #top>
      <div class="flex items-center gap-20">
        <a-input v-model:model-value="formData.keywords" class="!w-340" allow-clear placeholder="请输入供应商名称或对接人姓名">
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <a-button type="outline" @click="loadData(true)"> 搜索 </a-button>
      </div>
    </template>
    <a-table
      v-model:selected-keys="selectedKeys"
      :row-selection="rowSelection"
      row-key="vendor"
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
        <a-table-column title="记录ID" :width="80" align="center">
          <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
        </a-table-column>
        <a-table-column title="供应商名称" data-index="vendor" ellipsis tooltip />
        <a-table-column title="对接人" data-index="contactList" ellipsis tooltip />
        <a-table-column title="对接人电话" data-index="phoneList" ellipsis tooltip />
        <a-table-column title="对接人邮箱" data-index="emailList" ellipsis tooltip />
        <a-table-column title="服务系统数" data-index="service" align="center" :sortable="sortable" :width="180" ellipsis tooltip>
          <template #cell="{ record }">
            <a-link :disabled="record.service === 0" @click="serverModalRef?.openModal(record)">{{ record.service }}</a-link>
          </template>
        </a-table-column>
        <a-table-column title="下发通知数" data-index="notice" align="center" :sortable="sortable" :width="180" ellipsis tooltip>
          <template #cell="{ record: { notice, vendor } }">
            <a-link :disabled="notice === 0" @click="goDetail(vendor)">{{ notice }}</a-link>
          </template>
        </a-table-column>
        <a-table-column title="待修复" data-index="noFixed" ellipsis tooltip :width="120" :sortable="sortable" />
        <a-table-column title="操作" data-index="opt" fixed="right" :width="120">
          <template #cell="{ record }">
            <a-link :disabled="record.noFixed === 0" @click="handleClick(11, record)"> 下发通知 </a-link>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
