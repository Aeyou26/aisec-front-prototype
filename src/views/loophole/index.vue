<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import DetailModal from './components/detail-modal.vue'
import http from '@/request'
import { TableSortable } from '@arco-design/web-vue'

interface SearchFormProps {
  id?: number
  vulnName?: string
  vulnTypeName?: string
  vulnLevel?: string
  deptName?: string
  vulnCount?: number
  vulnStatus?: string
  issuedStatus?: string
  issueNo?: string
}
const initSearchForm: SearchFormProps = {
  id: void 0,
  vulnName: void 0,
  vulnTypeName: void 0,
  vulnLevel: void 0,
  deptName: void 0,
  vulnCount: void 0,
  vulnStatus: void 0,
  issuedStatus: void 0,
  issueNo: void 0
}
const sortable: TableSortable = { sortDirections: ['ascend', 'descend'], sorter: true }
const formData = reactive({ ...initSearchForm })
const detailModalRef = ref<any>(null)
const vulnStatusOptions = ['待修复', '已修复']
const issuedStatusOptions = ['未下发', '已下发', '已反馈', '逾期未反馈', '逾期反馈']
const vulnLevelOptions = ['高危', '中危', '低危']
const vulnTypeOptions = ref<any[]>([])

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/user/loophole/page', params),
  formData
)
function queryData() {
  loadData(true)
}
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  queryData()
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

function handleView(record: any) {
  detailModalRef.value.openModal(record)
}
function getVulnType() {
  http.Get('/user/loophole/type').then((res: any) => {
    vulnTypeOptions.value = res.data
  })
}
const list = ref([
  {
    name: '漏洞总数',
    value: 0,
    icon: 'loophole-total',
    color: '#E47171',
    bg: 'linear-gradient(180deg, #fcf3f3 0%, #ffffff 100%)'
  },
  {
    name: '已修复漏洞',
    value: 0,
    icon: 'loophole-fixed',
    color: '#2E66C7',
    bg: 'linear-gradient(180deg, #f3f5fe 0%, #ffffff 100%)'
  },
  {
    name: '待修复漏洞',
    value: 0,
    icon: 'loophole-unfixed',
    color: '#F0BD56',
    bg: 'linear-gradient(180deg, #fcfaf3 0%, #ffffff 100%)'
  }
])
// 获取统计数据
const getStatisticsData = () => {
  http.Post('/user/loophole/stat').then((res: any) => {
    // list.value = res.data
    list.value[0].value = res.data.total
    list.value[1].value = res.data.fixed
    list.value[2].value = res.data.noFixed
  })
}
onMounted(() => {
  getVulnType()
  queryData()
  getStatisticsData()
})
</script>

<template>
  <PageTop v-if="list.length > 0" :list="list"></PageTop>
  <Page :show-top="list.length > 0">
    <template #action>
      <div></div>
    </template>
    <template #top>
      <SearchForm auto-collapse @query="queryData" @reset="resetForm">
        <div class="search-item">
          <span>漏洞ID</span>
          <a-input-number v-model="formData.id" hide-button allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>漏洞名称</span>
          <a-input v-model.trim="formData.vulnName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>漏洞状态</span>
          <a-select v-model="formData.vulnStatus" allow-clear placeholder="请选择">
            <a-option v-for="item in vulnStatusOptions" :key="item" :value="item"> {{ item }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>漏洞等级</span>
          <a-select v-model="formData.vulnLevel" allow-clear placeholder="请选择">
            <a-option v-for="item in vulnLevelOptions" :key="item" :value="item"> {{ item }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>所属单位</span>
          <a-input v-model.trim="formData.deptName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>漏洞数量</span>
          <a-input-number v-model="formData.vulnCount" hide-button allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>漏洞类型</span>
          <a-select v-model="formData.vulnTypeName" allow-clear placeholder="请选择">
            <a-option v-for="item in vulnTypeOptions" :key="item" :value="item"> {{ item }} </a-option>
          </a-select>
        </div>
        <!-- <div class="search-item">
          <span>下发状态</span>
          <a-select v-model="formData.issuedStatus" allow-clear placeholder="请选择">
            <a-option v-for="item in issuedStatusOptions" :key="item" :value="item"> {{ item }} </a-option>
          </a-select>
        </div> -->
      </SearchForm>
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
        <a-table-column title="漏洞ID" data-index="id" ellipsis tooltip :width="100" align="center" />
        <a-table-column title="漏洞名称" data-index="vulnName" ellipsis tooltip :width="140" />
        <a-table-column title="漏洞类型" data-index="vulnTypeName" ellipsis tooltip :width="140" />
        <a-table-column title="资产名称" data-index="assetsName" ellipsis tooltip :width="140" />
        <a-table-column title="资产类型" data-index="assetsType" ellipsis tooltip :width="140" />
        <a-table-column title="漏洞等级" data-index="vulnLevel" ellipsis tooltip :width="100" />
        <a-table-column title="所属单位" data-index="deptName" ellipsis tooltip :width="160" />
        <a-table-column title="风险数量" data-index="vulnCount" align="center" ellipsis tooltip :width="110" :sortable="sortable" />
        <a-table-column title="漏洞状态" data-index="vulnStatus" ellipsis tooltip :width="100" />
        <!-- <a-table-column title="下发状态" data-index="issuedStatus" ellipsis tooltip :width="100" /> -->
        <a-table-column title="操作" data-index="opt" fixed="right" ellipsis tooltip :width="80">
          <template #cell="{ record }">
            <a-link @click="handleView(record)"> 查看 </a-link>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
  <DetailModal ref="detailModalRef" />
</template>
