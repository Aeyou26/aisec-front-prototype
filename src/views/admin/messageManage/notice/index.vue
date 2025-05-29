<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'

interface SearchFormProps {
  keywords?: string
}
const initSearchForm: SearchFormProps = {
  keywords: ''
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/notice/page', params),
  formData,
  (data: any) => data?.data,
  (data: any) => data?.total
)

const testN = () => {
  // 漏洞管理 资产管理
  http
    .Post('/notice/create', {
      msg: '测试测试22222',
      type: '资产管理'
    })
    .then(() => {
      console.log('测试成功')
    })
}
onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page>
    <template #action>
      <div class="flex items-center gap-12">
        <!-- <a-button type="primary" @click="testN"> 测试 </a-button> -->
      </div>
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
        <a-table-column title="消息" data-index="msg" ellipsis tooltip></a-table-column>
        <a-table-column title="类型" data-index="type" ellipsis tooltip></a-table-column>
        <a-table-column title="创建时间" data-index="createTime" :width="180" ellipsis tooltip />
      </template>
    </a-table>
  </Page>
</template>
