<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'
import SearchForm from '@/components/SearchForm.vue'

interface SearchFormProps {
  operator?: string
  operationType?: string
  operationModule?: string
  startTime?: string
  endTime?: string
  date?: string[]
}
const initSearchForm: SearchFormProps = {
  operator: '',
  operationType: '',
  operationModule: '',
  startTime: '',
  endTime: '',
  date: ['', '']
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/operationLog/page', params),
  formData,
  (data: any) => data?.data,
  (data: any) => data?.total
)

// 操作结果状态
const resultStatus = [
  {
    text: '成功',
    color: '#099a74'
  },
  {
    text: '失败',
    color: '#F53F3F'
  }
]

// 操作类型选项
const operationTypeOptions = ref([
  { label: '全部', value: '' },
  { label: '登录', value: 'login' },
  { label: '新增', value: 'add' },
  { label: '修改', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '导出', value: 'export' },
  { label: '导入', value: 'import' }
])

// 操作模块选项
const operationModuleOptions = ref([
  { label: '全部', value: '' },
  { label: '资产管理', value: 'asset' },
  { label: '漏洞管理', value: 'loophole' },
  { label: '安全报告', value: 'report' },
  { label: '系统设置', value: 'system' }
])

// 处理日期范围变化
const handleDateRangeChange = (dates: any) => {
  if (dates && dates.length === 2) {
    // 开始日期加上 00:00:00
    formData.startTime = dates[0] ? dates[0].substring(0, 10) + ' 00:00:00' : undefined

    // 结束日期加上 23:59:59
    formData.endTime = dates[1] ? dates[1].substring(0, 10) + ' 23:59:59' : undefined
  } else {
    formData.startTime = undefined
    formData.endTime = undefined
  }
}

function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page>
    <template #action>
      <div class="flex items-center gap-12"></div>
    </template>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>操作人</span>
          <a-input v-model.trim="formData.operator" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>操作类型</span>
          <a-select v-model="formData.operationType" :options="operationTypeOptions" allow-clear placeholder="请选择" />
        </div>
        <div class="search-item">
          <span>操作模块</span>
          <a-select v-model="formData.operationModule" :options="operationModuleOptions" allow-clear placeholder="请选择" />
        </div>
        <div class="search-item">
          <span>操作时间</span>
          <a-range-picker
            v-model="formData.date"
            style="width: 100%"
            allow-clear
            format="YYYY-MM-DD"
            :placeholder="['开始日期', '结束日期']"
            @change="handleDateRangeChange"
          />
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
        <a-table-column title="操作人" data-index="operator" ellipsis tooltip></a-table-column>
        <a-table-column title="操作类型" data-index="operationType" ellipsis tooltip></a-table-column>
        <a-table-column title="操作内容" data-index="operationContent" ellipsis tooltip></a-table-column>
        <a-table-column title="操作模块" data-index="operationModule" ellipsis tooltip></a-table-column>
        <a-table-column title="操作IP" data-index="operationIp" ellipsis tooltip></a-table-column>
        <a-table-column title="操作时间" data-index="operationTime" :width="180" ellipsis tooltip></a-table-column>
        <a-table-column title="操作结果" data-index="operationResult" :width="100" ellipsis tooltip>
          <template #cell="{ record }">
            <a-tag :color="resultStatus[record.operationResult || 0].color">{{ resultStatus[record.operationResult || 0].text }}</a-tag>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
