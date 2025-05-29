<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'
import { Message } from '@arco-design/web-vue'
import { formatSize } from '@/utils/tools'

interface SearchFormProps {
  keywords?: string
}
const initSearchForm: SearchFormProps = {
  keywords: ''
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/reportFile/page', params),
  formData,
  (data: any) => data?.data?.rows,
  (data: any) => Number(data?.data?.total)
)

const onSuccess = (res: any) => {
  if (res.response.code === 1) {
    Message.success('上传成功')
    loadData(true)
  } else {
    Message.error('上传失败')
  }
}
const onError = (res: any) => {
  Message.error('上传失败')
}
function resetForm() {
  Object.assign(formData, { keywords: '' })
  loadData(true)
}
// 1:待处理，2：处理中，3处理完成
const optList = [
  {
    text: '待处理',
    color: '#37c1f0'
  },
  {
    text: '待处理',
    color: '#37c1f0'
  },
  {
    text: '处理中',
    color: '#f07300'
  },
  {
    text: '处理完成',
    color: '#099a74'
  }
]

// 获取状态对应的颜色和文字
const getStatusInfo = (status: number) => {
  if (status >= 0 && status <= 3) {
    return optList[status]
  }
  return {
    text: '未知',
    color: '#C9CDD4'
  }
}

onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page>
    <template #action>
      <div></div>
      <!-- <a-upload action="/api/reportFile/upload" :show-file-list="false" @success="onSuccess" @error="onError">
        <template #upload-button>
          <a-button type="primary"> 上传文件 </a-button>
        </template>
      </a-upload> -->
    </template>
    <template #top>
      <div class="flex items-center gap-20">
        <a-input v-model:model-value="formData.keywords" class="!w-340" allow-clear placeholder="请输入要查找的内容">
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <a-button type="outline" @click="loadData(true)"> 搜索 </a-button>
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
    >
      <template #columns>
        <a-table-column title="序号" :width="80" align="center">
          <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
        </a-table-column>
        <a-table-column title="名称" data-index="fileName" ellipsis tooltip>
          <template #cell="{ record }">
            <!-- 文件夹 -->
            <!-- <div v-if="record.type === 'folder'" @click="jumpFolder(record)">
              <SvgIcon name="file-folder" size="14" class="mr-7" />{{ record.name }}
            </div> -->
            <!-- 文件 -->
            <div><SvgIcon name="file-file" size="14" class="mr-7" />{{ record.fileName }}</div>
          </template>
        </a-table-column>
        <a-table-column title="上传日期" data-index="createTime" ellipsis tooltip />
        <a-table-column title="状态" data-index="status" ellipsis tooltip>
          <template #cell="{ record }">
            <a-tag :color="getStatusInfo(record.status || 0).color">{{ getStatusInfo(record.status || 0).text }}</a-tag>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
