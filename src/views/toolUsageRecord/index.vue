<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import SearchForm from '@/components/SearchForm.vue'
import request from '@/request'
import http from '@/request'

interface SearchFormProps {
  name?: string
  callerId?: string
  digitalHumanId?: string
  status?: string
  startTime?: string
  endTime?: string
  date?: string[]
}
const chatStore = useChatStore()

const initSearchForm: SearchFormProps = {
  name: void 0,
  callerId: void 0,
  digitalHumanId: chatStore?.currentInfo?.robotId?.toString() || '',
  status: void 0,
  startTime: void 0,
  endTime: void 0,
  date: ['', '']
}
const formData = reactive({ ...initSearchForm })

// 状态选项 status	执行状态 '1待处理', '2 执行中', '3 成功', '4 失败', '5 已取消', '6 超时'
const statusOptions = ref([
  { label: '待处理', value: 1, color: '#2E66C7' },
  { label: '执行中', value: 2, color: '#2E66C7' },
  { label: '成功', value: 3, color: '#52B56F' },
  { label: '失败', value: 4, color: '#DE1E1E' },
  { label: '已取消', value: 5, color: '#DE1E1E' },
  { label: '超时', value: 6, color: '#DE1E1E' }
])

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/usage/record/page', params), formData)

const downloadReport = (fileName: string) => {
  request.Get('/user/check/token').then(() => {
    location.href = `/api/common/download/aisec-file/${fileName}`
  })
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
  loadData(true)
}

onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>工具名称</span>
          <a-input v-model.trim="formData.name" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>提交人</span>
          <a-input v-model.trim="formData.callerId" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>状态</span>
          <a-select v-model="formData.status" :options="statusOptions" placeholder="请选择" />
        </div>
        <div class="search-item">
          <span>提交时间</span>
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
        <a-table-column title="工具名称" data-index="name" ellipsis tooltip />
        <a-table-column title="提交时间" data-index="createTime" ellipsis tooltip />
        <a-table-column title="参数" data-index="parameters" ellipsis tooltip />
        <a-table-column title="提交人" data-index="callerId" ellipsis tooltip />
        <a-table-column title="结果" data-index="result" ellipsis tooltip :width="240">
          <template #cell="{ record }">
            <a-tooltip>
              <template #content>
                <div style="white-space: pre-wrap">{{ record.result }}</div>
              </template>
              <div class="!w-210 truncate">
                {{ record.result }}
              </div>
            </a-tooltip>
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="status" ellipsis tooltip :width="100">
          <template #cell="{ record }">
            <div
              class="flex items-center w-56 py-2 justify-center rounded-4 text-12 text-white"
              :style="{ backgroundColor: statusOptions.find((item) => item.value === record.status)?.color }"
            >
              {{ statusOptions.find((item) => item.value === record.status)?.label }}
            </div>
          </template>
        </a-table-column>
        <!-- <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="80">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="downloadReport(record.path)">下载</a-link>
              <a-link>查看详情</a-link>
            </a-space>
          </template>
        </a-table-column> -->
      </template>
    </a-table>
  </Page>
</template>
