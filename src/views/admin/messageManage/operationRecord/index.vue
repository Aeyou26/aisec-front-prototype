<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import { useRouter } from 'vue-router'
import request from '@/request'
import http from '@/request'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'

const router = useRouter()

interface SearchFormProps {
  operator?: string
  ip?: string
  type?: string
  status?: string
  createTime?: string
  startTime?: string
  endTime?: string
  date?: string[]
}
const initSearchForm: SearchFormProps = {
  operator: void 0,
  ip: void 0,
  type: void 0,
  status: void 0,
  createTime: void 0,
  startTime: void 0,
  endTime: void 0,
  date: ['', '']
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/log/page', params), formData)

function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

const options = ref<any[]>([
  { label: '全部', value: '' },
  { label: '成功', value: 0 },
  { label: '失败', value: 1 }
])

const options2 = ref<any[]>([{ label: '全部', value: 0 }])

const getStatusClass = (status: number) => {
  switch (status) {
    case 0:
      return 'color-#52B56F'
    case 1:
      return 'color-#DE1E1E'
    default:
      return ''
  }
}

const getStatusText = (status: number) => {
  if (status === 0) {
    return '成功'
  }
  return '失败'
}

onMounted(() => {
  loadData(true)
})

function exportData() {
  const current = pagination.value.current ? pagination.value.current : 1
  const endTime = formData.endTime ? formData.endTime : ''
  const ip = formData.ip ? formData.ip : ''
  const operator = formData.operator ? formData.operator : ''
  const pageSize = pagination.value.pageSize ? pagination.value.pageSize : 20
  const startTime = formData.startTime ? formData.startTime : ''
  const status = formData.status ? formData.status : ''
  const type = formData.type ? formData.type : ''

  const downloadHttp = request.Post(`/log/export`, {
    params: {
      current,
      endTime,
      ip,
      operator,
      pageSize,
      startTime,
      status,
      type
    }
  })

  downloadHttp.meta = {
    isDownload: true
  }
  downloadHttp.send()
}

function validateTime() {
  if (formData.startTime && formData.endTime && formData.startTime > formData.endTime) {
    Message.error('开始时间不能大于结束时间')
    nextTick(() => {
      formData.startTime = '' // 清空开始时间
      formData.endTime = '' // 清空结束时间
    })
  }
}

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
</script>

<template>
  <Page>
    <template #action>
      <a-button type="primary" class="ml-14" @click="exportData"> 导出 </a-button>
    </template>
    <template #top>
      <SearchForm auto-collapse @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>操作账号</span>
          <a-input v-model.trim="formData.operator" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>操作ip</span>
          <a-input v-model.trim="formData.ip" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>功能模块</span>
          <a-input v-model.trim="formData.type" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>状态</span>
          <a-select v-model="formData.status" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
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
        <a-table-column title="序号" :width="60" align="center">
          <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
        </a-table-column>
        <a-table-column title="账号" data-index="operator" ellipsis tooltip :width="100" />
        <a-table-column title="操作ip" data-index="ip" ellipsis tooltip :width="120" />
        <a-table-column title="操作时间" data-index="createTime" ellipsis tooltip :width="150" />
        <a-table-column title="功能模块" data-index="type" ellipsis tooltip :width="200" />
        <a-table-column title="操作内容" data-index="action" ellipsis tooltip :width="250" />
        <a-table-column title="状态" data-index="status" ellipsis tooltip :width="80">
          <template #cell="{ record: { status } }">
            <div class="w-50 text-12 border border-solid rounded-4 px-4 py-2 flex items-center justify-center" :class="getStatusClass(status)">
              {{ getStatusText(status) }}
            </div>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
