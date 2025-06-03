<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import AddWords from './components/add-words.vue'
import http from '@/request'
import { Message } from '@arco-design/web-vue'
import UploadModal from './components/upload-modal.vue'

interface SearchFormProps {
  keywords?: string
  type?: string
}

const initSearchForm: SearchFormProps = {
  keywords: void 0,
  type: void 0
}

const addWordsRef = ref<any>(null)
const uploadModalRef = ref<any>(null)
const formData = reactive({ ...initSearchForm })
const typeOptions = ref([
  { label: '通用', value: '通用' },
  { label: '反动', value: '反动' },
  { label: '色情', value: '色情' },
  { label: '毒品', value: '毒品' },
  { label: '赌博', value: '赌博' }
])

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/sensitive/words/page', params),
  formData
)

function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

function handleDelete(record: any) {
  http.Delete(`/sensitive/words/delete?id=${record.id}`).then(() => {
    Message.success('删除成功')
    loadData()
  })
}

function getType() {
  http.Get('/sensitive/words/type/select').then((res: any) => {
    typeOptions.value = res.data
    if (res.code === 1 && res.data && res.data.length > 0) {
      typeOptions.value = res.data.map((item: any) => ({
        label: item,
        value: item
      }))
    }
  })
}

onMounted(() => {
  loadData(true)
  getType()
})
</script>

<template>
  <Page>
    <AddWords ref="addWordsRef" @upload="loadData(true)" />
    <UploadModal ref="uploadModalRef" @upload="loadData(true)" />
    <template #action>
      <a-button type="primary" class="mr-20" @click="addWordsRef.openModal()">新增</a-button>
      <a-button type="outline" @click="uploadModalRef.openModal()">导入</a-button>
    </template>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>名称</span>
          <a-input v-model.trim="formData.keywords" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>类型</span>
          <a-select v-model="formData.type" :options="typeOptions" allow-clear placeholder="请选择" />
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
        <a-table-column title="序号" :width="90" align="center">
          <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
        </a-table-column>
        <a-table-column title="名称" data-index="name" ellipsis tooltip />
        <a-table-column title="类型" data-index="type" ellipsis tooltip />
        <a-table-column title="创建时间" data-index="createTime" ellipsis tooltip />
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="140">
          <template #cell="{ record }">
            <a-space>
              <a-popconfirm content="确定要删除该敏感词吗？" @ok="handleDelete(record)">
                <a-link status="danger">删除</a-link>
              </a-popconfirm>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
