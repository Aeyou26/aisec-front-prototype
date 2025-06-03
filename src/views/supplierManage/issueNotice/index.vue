<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'
import { copyText } from '@/utils/tools'

interface SearchFormProps {
  id?: string
  keywords?: string
  vendorLike?: string
  startTime?: string
  endTime?: string
  status?: string
  date?: string[]
}
const initSearchForm: SearchFormProps = {
  id: void 0,
  keywords: void 0,
  vendorLike: void 0,
  startTime: void 0,
  endTime: void 0,
  status: void 0,
  date: ['', '']
}
const formData = reactive({ ...initSearchForm })
const router = useRouter()
const route = useRoute()
const { pagination, taleData, loading, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/supplier/notice', params), formData)

function handleClick(status: number, id: string, vendor: string, contactList: string, phoneList: string) {
  // 将供应商列表存储到 sessionStorage 中
  sessionStorage.setItem('vendors', JSON.stringify([vendor]))
  sessionStorage.setItem('contactList', JSON.stringify(contactList))
  sessionStorage.setItem('phoneList', JSON.stringify(phoneList))
  router.push({
    path: '/supplierFeedback',
    query: {
      status,
      id
    }
  })
}

function goBack() {
  router.push('/supplierManage/supplier')
}
const feedbackUrl = (id: string) => {
  const baseUrl = window.location.origin
  return `${baseUrl}/supplierFeedback?id=${id}`
}
// 	状态0.待下发，1.待反馈，2.已反馈，3.完成
const statusMap: Record<string | number, string> = {
  0: '#E29000',
  1: '#DE1E1E',
  2: '#2E66C7',
  3: '#52B56F'
}

// 状态选项
const statusOptions = ref([
  { label: '全部', value: '' },
  { label: '待下发', value: '0' },
  { label: '待反馈', value: '1' },
  { label: '已反馈', value: '2' },
  { label: '完成', value: '3' }
])

// 状态样式计算属性
const getStatusStyle = (code: number | string | undefined) => {
  const color = statusMap[code || 0]
  return {
    color,
    borderColor: color
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

function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  if (route.query.vendor) {
    formData.vendorLike = (route.query.vendor as string) || ''
  }
  loadData(true)
}

onMounted(() => {
  if (route.query.vendor) {
    formData.vendorLike = (route.query.vendor as string) || ''
  }
  if (route.query.id) {
    formData.id = (route.query.id as string) || ''
  }
  loadData(true)
})
</script>

<template>
  <Page>
    <template #action>
      <a-button v-if="route?.query?.vendor" type="outline" @click="goBack"> 返回 </a-button>
    </template>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div v-if="!route?.query?.vendor" class="search-item">
          <span>供应商名称</span>
          <a-input v-model.trim="formData.vendorLike" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>下发时间</span>
          <a-range-picker
            v-model="formData.date"
            style="width: 100%"
            allow-clear
            format="YYYY-MM-DD"
            :placeholder="['开始日期', '结束日期']"
            @change="handleDateRangeChange"
          />
        </div>
        <div class="search-item">
          <span>状态</span>
          <a-select v-model="formData.status" :options="statusOptions" allow-clear placeholder="请选择" />
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
        <a-table-column title="供应商" data-index="vendor" :width="140" ellipsis tooltip />
        <a-table-column title="下发名称" data-index="noticeName" :width="180" ellipsis tooltip />
        <a-table-column title="下发时间" data-index="createTime" :width="180" ellipsis tooltip />
        <a-table-column title="最迟反馈时间" data-index="lastFeedbackTime" :width="180" ellipsis tooltip />
        <a-table-column title="状态" data-index="status" :width="80" ellipsis tooltip>
          <template #cell="{ record: { status } }">
            <div class="text-12 border border-solid rounded-4 px-4 py-2 flex items-center justify-center" :style="getStatusStyle(status?.code)">
              {{ status?.name || '未知' }}
            </div>
          </template>
        </a-table-column>
        <a-table-column title="漏洞数量" data-index="vulnNum" :width="100" ellipsis tooltip />
        <a-table-column title="反馈地址" data-index="id" align="center" :width="280">
          <template #cell="{ record: { id, status } }">
            <a-tooltip :content="feedbackUrl(id)">
              <a-link v-if="status.code === 1" class="max-w-270 truncate" @click="copyText(feedbackUrl(id))">
                <span class="max-w-270 truncate">{{ feedbackUrl(id) }}</span>
              </a-link>
            </a-tooltip>
            <span v-if="status.code !== 1">/</span>
          </template>
        </a-table-column>
        <a-table-column title="说明" data-index="description" :width="260" ellipsis tooltip />
        <a-table-column title="操作" data-index="opt" fixed="right" :width="80">
          <template #cell="{ record: { id, status, vendor, contactList, phoneList } }">
            <a-link v-if="status.code === 2" @click="handleClick(12, id, vendor, contactList, phoneList)"> 审核 </a-link>
            <a-link v-else-if="status.code === 3" @click="handleClick(13, id, vendor, contactList, phoneList)"> 查看 </a-link>
            <a-link v-else-if="status.code === 0" @click="handleClick(11, id, vendor, contactList, phoneList)"> 编辑 </a-link>
            <a-link v-else-if="status.code === 1" disabled> / </a-link>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
