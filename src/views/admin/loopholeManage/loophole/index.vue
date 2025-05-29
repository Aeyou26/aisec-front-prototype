<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'

interface SearchFormProps {
  keywords?: string
}
const initSearchForm: SearchFormProps = {
  keywords: void 0
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/user/loophole/database/page', params),
  formData
)
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
      <div></div>
    </template>
    <template #top>
      <div class="flex items-center gap-20">
        <a-input v-model:model-value="formData.keywords" class="!w-340" allow-clear placeholder="请输入">
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
        <a-table-column title="漏洞编号" data-index="vulnNo" ellipsis tooltip :width="120" align="center"></a-table-column>
        <a-table-column title="漏洞名称" data-index="vulnName" ellipsis tooltip />
        <a-table-column title="漏洞类型" data-index="vulnTypeName" ellipsis tooltip :width="120" />
        <a-table-column title="漏洞等级" data-index="vulnLevelName" ellipsis tooltip :width="100"></a-table-column>
        <a-table-column title="属性" data-index="attribute" ellipsis tooltip :width="100" />
        <a-table-column title="更新时间" data-index="updateTime" ellipsis tooltip :width="180" />
        <a-table-column title="相似度" data-index="similarity" ellipsis tooltip :width="100" />
      </template>
    </a-table>
  </Page>
</template>
