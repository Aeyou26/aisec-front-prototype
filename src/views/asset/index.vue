<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import SynchronousModal from './components/synchronous-modal.vue'
import http from '@/request'

interface SearchFormProps {
  keywords?: string
  assetsName?: string
  assetsType?: string
  assetsIp?: string
  dbList?: string
  language?: string
  middlewareList?: string
  servicePorts?: string
  vendorLike?: string
  vendorPrincipal?: string
  vendorPrincipalPhone?: string
  area?: string
  aegisDeptPrincipal?: string
  assetsLevel?: string
  status?: string
}
const initSearchForm: SearchFormProps = {
  keywords: void 0,
  assetsName: void 0,
  assetsType: '',
  assetsIp: void 0,
  dbList: void 0,
  language: void 0,
  middlewareList: void 0,
  servicePorts: void 0,
  vendorLike: void 0,
  vendorPrincipal: void 0,
  vendorPrincipalPhone: void 0,
  area: void 0,
  aegisDeptPrincipal: void 0,
  assetsLevel: void 0,
  status: void 0
}
const formData = reactive({ ...initSearchForm })

// 资产类型选项
const assetsTypeOptions = ref([
  { label: '应用系统', value: '应用系统' },
  { label: '服务器', value: '服务器' },
  { label: '网络设备', value: '网络设备' },
  { label: '安全设备', value: '安全设备' },
  { label: '终端设备', value: '终端设备' },
  { label: 'APP资产', value: 'APP资产' }
])

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/user/asset/page', params), formData)

const queryData = () => {
  loadData(true)
}
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  queryData()
}
const synchronousModalRef = ref<InstanceType<typeof SynchronousModal>>()
const list = ref([
  {
    name: '资产总数',
    value: 0,
    icon: 'asset-total',
    color: '#2E66C7',
    bg: 'linear-gradient(180deg, #f3f5fe 0%, #ffffff 100%)'
  },
  {
    name: '应用系统',
    value: 0,
    icon: 'app-system',
    color: '#2EB8C7',
    bg: 'linear-gradient(180deg, #ecfbfc 0%, #ffffff 100%)'
  },
  {
    name: '服务器',
    value: 0,
    icon: 'terminals-num',
    color: '#F0BD56',
    bg: 'linear-gradient(180deg, #fcfaf3 0%, #ffffff 100%)'
  }
])
const getStatisticsData = () => {
  http.Post('/user/asset/stat').then((res: any) => {
    list.value[0].value = res.data.total
    list.value[1].value = res.data.application
    list.value[2].value = res.data.server
  })
}
onMounted(() => {
  queryData()
  getStatisticsData()
})
</script>

<template>
  <PageTop v-if="list.length > 0" :list="list"></PageTop>
  <Page :show-top="list.length > 0">
    <SynchronousModal ref="synchronousModalRef" />
    <template #action>
      <div class="flex items-center gap-20">
        <a-button type="primary" @click="synchronousModalRef?.openModal()"> 同步资产 </a-button>
      </div>
    </template>
    <template #top>
      <SearchForm auto-collapse @query="queryData" @reset="resetForm">
        <div class="search-item">
          <span>资产类别</span>
          <a-select v-model="formData.assetsType" :options="assetsTypeOptions" allow-clear placeholder="请选择" @change="loadData(true)" />
        </div>
        <div class="search-item">
          <span>资产名称</span>
          <a-input v-model.trim="formData.assetsName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>域名/IP</span>
          <a-input v-model.trim="formData.assetsIp" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>数据库</span>
          <a-input v-model.trim="formData.dbList" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>编程语言</span>
          <a-input v-model.trim="formData.language" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>中间件</span>
          <a-input v-model.trim="formData.middlewareList" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>开放端口</span>
          <a-input v-model.trim="formData.servicePorts" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>开发单位</span>
          <a-input v-model.trim="formData.vendorLike" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>单位负责人</span>
          <a-input v-model.trim="formData.vendorPrincipal" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>联系方式</span>
          <a-input v-model.trim="formData.vendorPrincipalPhone" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>物理位置</span>
          <a-input v-model.trim="formData.area" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>责任人</span>
          <a-input v-model.trim="formData.aegisDeptPrincipal" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>重要程度</span>
          <a-input v-model.trim="formData.assetsLevel" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>状态</span>
          <a-input v-model.trim="formData.status" allow-clear placeholder="请输入" />
        </div>
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
        <template v-if="!formData.assetsType || formData.assetsType === '应用系统'">
          <a-table-column title="数据库及版本" data-index="dbList" ellipsis tooltip :width="140"></a-table-column>
          <a-table-column title="编程语言" data-index="language" ellipsis tooltip :width="100" />
          <a-table-column title="中间件及版本" data-index="middlewareList" ellipsis tooltip :width="160"></a-table-column>
          <a-table-column title="开放端口" data-index="servicePorts" ellipsis tooltip :width="100"></a-table-column>
        </template>
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
  </Page>
</template>

<style lang="less" scoped>
:deep(.arco-tabs-content) {
  height: 0;
  padding-top: 10px;
}
</style>
