<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import SaveModel from './components/save-model.vue'
import http from '@/request'
import { templateType } from '@/utils/dict'
import { Message } from '@arco-design/web-vue'

interface SearchFormProps {
  templateName?: string
  templateType?: string
  status?: string
  startTime?: string
  endTime?: string
  date?: string[]
}
const initSearchForm: SearchFormProps = {
  templateName: void 0,
  templateType: void 0,
  status: void 0,
  startTime: void 0,
  endTime: void 0,
  date: ['', '']
}
const saveModelRef = ref<any>(null)
const formData = reactive({ ...initSearchForm })

// 模板类型选项
const templateTypeOptions = ref([{ label: '全部', value: '' }, ...templateType])

// 状态选项
const statusOptions = ref([
  { label: '全部', value: '', color: '' },
  { label: '启用', value: 1, color: '#52B56F' },
  { label: '禁用', value: 0, color: '#DE1E1E' }
])

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/report/template/page', params),
  formData
)

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

function handleAdd() {
  // 新增模板
  saveModelRef.value.openModal()
}

function handleEdit(record: any) {
  saveModelRef.value.openModal(record)
}

function handleDelete(record: any) {
  http.Delete(`/report/template/${record.id}`).then(() => {
    Message.success('删除成功')
    loadData()
  })
}

onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page>
    <SaveModel ref="saveModelRef" @upload="loadData(true)" />
    <template #action>
      <a-button type="primary" @click="handleAdd()">新增</a-button>
    </template>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>模板名称</span>
          <a-input v-model.trim="formData.templateName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>模板类型</span>
          <a-select v-model="formData.templateType" :options="templateTypeOptions" allow-clear placeholder="请选择" />
        </div>
        <div class="search-item">
          <span>状态</span>
          <a-select v-model="formData.status" :options="statusOptions" allow-clear placeholder="请选择" />
        </div>
        <div class="search-item">
          <span>创建时间</span>
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
        <a-table-column title="模板名称" data-index="templateName" ellipsis tooltip />
        <a-table-column title="模板类型" data-index="typeId" ellipsis tooltip></a-table-column>
        <a-table-column title="创建时间" data-index="createTime" ellipsis tooltip />
        <a-table-column title="模板说明" data-index="description" ellipsis tooltip />
        <a-table-column title="状态" data-index="isEnable" ellipsis tooltip :width="100">
          <template #cell="{ record }">
            <div
              class="flex items-center w-56 justify-center rounded-4 border border-solid border-1 text-10"
              :style="{
                color: statusOptions.find((item) => item.value === record.isEnable)?.color,
                borderColor: statusOptions.find((item) => item.value === record.isEnable)?.color
              }"
            >
              {{ statusOptions.find((item) => item.value === record.isEnable)?.label }}
            </div>
          </template>
        </a-table-column>
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="140">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="handleEdit(record)">编辑</a-link>
              <a-popconfirm content="确定要删除该模板吗？" @ok="handleDelete(record)">
                <a-link status="danger">删除</a-link>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
