<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import MdPreview from './components/mdPreview.vue'
import request from '@/request'
import http from '@/request'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'

interface SearchFormProps {
  id?: string
  robotId?: string
  reportName?: string
  createType?: string
  source?: string
  startTime?: string
  endTime?: string
  date?: string[]
}
const initSearchForm: SearchFormProps = {
  id: void 0,
  robotId: void 0,
  reportName: void 0,
  createType: void 0,
  source: void 0,
  date: ['', ''],
  startTime: void 0,
  endTime: void 0
}
const formData = reactive({ ...initSearchForm })
const chatStore = useChatStore()
const robotId = computed(() => chatStore.currentInfo?.robotId)
const mdPreviewRef = ref<any>(null)

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/user/report/page', params), formData)

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
  formData.robotId = robotId.value as string
  loadData(true)
}
const options = ref<any[]>([
  { label: '自动创建', value: '1' },
  { label: '用户操作', value: '2' }
])

const downloadReport = (fileName: string) => {
  request.Get('/user/check/token').then(() => {
    location.href = `/api/common/download/aisec-file/${fileName}`
  })
}

const downloadPdfOrWord = (id: number, format: string) => {
  request.Get('/user/check/token').then(() => {
    location.href = `/api/user/report/download?id=${id}&format=${format}`
  })
}

const deleteReport = async (id: number) => {
  await confirmModal('提示', '确定删除该报告吗？')
  request.Delete(`/user/report/${id}`).then(() => {
    loadData()
  })
}
const downloadZip = async (reportId: string) => {
  request.Get('/user/check/token').then(() => {
    location.href = `/api/code/audit/download/${reportId}`
  })
}

const previewReport = (record: any) => {
  const fileName = record.reportName.toLowerCase()
  const isMd = fileName.endsWith('.md')
  const isPdf = fileName.endsWith('.pdf')
  const isDocx = fileName.endsWith('.docx') || fileName.endsWith('.doc')

  // 支持预览md、pdf和docx文件
  if (isMd || isPdf || isDocx) {
    mdPreviewRef.value.openModal(record)
  } else {
    Message.info('暂不支持预览, 请下载后查看')
  }
}
const route = useRoute()
const id = computed(() => route.query?.id)
onMounted(() => {
  if (id.value) {
    formData.id = id.value as string
  }
  formData.robotId = robotId.value as string
  loadData(true)
})
</script>

<template>
  <Page>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>报告名称</span>
          <a-input v-model.trim="formData.reportName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>报告类型</span>
          <a-select v-model="formData.createType" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>生成时间</span>
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
        <a-table-column title="报告名称" data-index="reportName" ellipsis tooltip />
        <a-table-column title="类型" data-index="createType" ellipsis tooltip>
          <template #cell="{ record }">
            <a-tag :color="record.createType.toString() === '1' ? 'blue' : 'green'"> {{ record.createType.toString() === '1' ? '自动创建' : '用户操作' }} </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="来源" data-index="source" ellipsis tooltip />
        <a-table-column title="生成时间" data-index="createTime" ellipsis tooltip />
        <a-table-column title="状态" data-index="status" ellipsis tooltip>
          <template #cell="{ record }">
            <a-tag :color="record.status === 0 ? 'orange' : record.status === 1 ? 'green' : 'red'">
              {{ record.status === 0 ? '生成中' : record.status === 1 ? '生成完成' : '生成失败' }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="180">
          <template #cell="{ record }">
            <a-space>
              <a-link :disabled="record.status !== 1 || record?.path?.endsWith('.zip')" @click="previewReport(record)">预览</a-link>
              <a-link v-if="record?.path?.endsWith('.zip')" :disabled="record.status !== 1" @click="downloadZip(record.id)">下载</a-link>
              <a-dropdown v-else>
                <a-link :disabled="record.status !== 1">下载</a-link>
                <template #content>
                  <a-doption @click="downloadReport(record.path)">源文件</a-doption>
                  <a-doption @click="downloadPdfOrWord(record.id, 'pdf')">导出PDF</a-doption>
                  <a-doption @click="downloadPdfOrWord(record.id, 'docx')">导出Word</a-doption>
                </template>
              </a-dropdown>
              <a-link @click="deleteReport(record.id)">删除</a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
  <MdPreview ref="mdPreviewRef" />
</template>
