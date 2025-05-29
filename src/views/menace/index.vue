<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import DetailModal from './components/detail-modal.vue'
import http from '@/request'
import { TableSortable } from '@arco-design/web-vue'

interface SearchFormProps {
  keywords?: string
}
const initSearchForm: SearchFormProps = {
  keywords: void 0
}

const formData = reactive({ ...initSearchForm })
const exportLoading = ref(false)
const detailModalRef = ref<InstanceType<typeof DetailModal>>()
const sortable: TableSortable = { sortDirections: ['ascend', 'descend'], sorter: true }
const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/user/loophole/threat/page', params),
  formData
)
const exportData = () => {
  exportLoading.value = true
  const downloadHttp = http.Post('/user/loophole/threat/export', formData)
  downloadHttp.meta = {
    isDownload: true
  }
  downloadHttp.send().finally(() => {
    exportLoading.value = false
  })
}

function queryData() {
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
const list = ref([
  {
    name: '总高危数',
    value: 0,
    icon: 'high-risk-total',
    color: '#E47171',
    bg: 'linear-gradient(180deg, #fcf3f3 0%, #ffffff 100%)'
  },
  {
    name: '总中危数',
    value: 0,
    icon: 'medium-risk-total',
    color: '#2E66C7',
    bg: 'linear-gradient(180deg, #f3f5fe 0%, #ffffff 100%)'
  },
  {
    name: '总低危数',
    value: 0,
    icon: 'low-risk-total',
    color: '#2EB8C7',
    bg: 'linear-gradient(180deg, #ecfbfc 0%, #ffffff 100%)'
  }
])
const getStatisticsData = () => {
  http.Post('/user/loophole/threat/stat').then((res: any) => {
    list.value[0].value = res.data.hvuln
    list.value[1].value = res.data.mvuln
    list.value[2].value = res.data.lvuln
  })
}
const handleDetail = (record: any) => {
  detailModalRef.value?.openModal(record)
}
onMounted(() => {
  queryData()
  getStatisticsData()
})
</script>

<template>
  <DetailModal ref="detailModalRef" />
  <PageTop v-if="list.length > 0" :list="list"></PageTop>
  <Page :show-top="list.length > 0">
    <template #action>
      <a-button type="primary" :loading="exportLoading" @click="exportData"> 导出 </a-button>
    </template>
    <template #top>
      <div class="flex items-center gap-20">
        <a-input v-model:model-value="formData.keywords" class="!w-340" allow-clear placeholder="请输入">
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <a-button type="outline" @click="queryData"> 搜索 </a-button>
      </div>
    </template>
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
        <a-table-column title="IP地址" data-index="ip" ellipsis tooltip :width="140" />
        <a-table-column title="主机名" data-index="host" ellipsis tooltip />
        <a-table-column title="高危漏洞" data-index="hvuln" ellipsis tooltip :width="110" :sortable="sortable" />
        <a-table-column title="中危漏洞" data-index="mvuln" ellipsis tooltip :width="110" :sortable="sortable" />
        <a-table-column title="低危漏洞" data-index="lvuln" ellipsis tooltip :width="110" :sortable="sortable" />
        <a-table-column title="合计" data-index="total" ellipsis tooltip :width="100" :sortable="sortable">
          <template #cell="{ record }">
            <span>{{ record.hvuln + record.mvuln + record.lvuln }}</span>
          </template>
        </a-table-column>
        <a-table-column title="主机风险值" data-index="score" ellipsis tooltip :width="120">
          <template #cell="{ record }">
            <!-- <span>{{ calculateRiskScore(record.hvuln, record.mvuln, record.lvuln) }}</span> -->
            <span>{{ record.score.toFixed(2) }}</span>
          </template>
        </a-table-column>
        <a-table-column title="操作" :width="120" align="center">
          <template #cell="{ record }">
            <a-button type="text" @click="handleDetail(record)"> 详情 </a-button>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
