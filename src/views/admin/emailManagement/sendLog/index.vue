<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import { useRouter } from 'vue-router'
import request from '@/request'
import http from '@/request'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'
import AddModal from './components/add-modal.vue'

const AddModalRef = ref<InstanceType<typeof AddModal>>()

const router = useRouter()

interface SearchFormProps {
  fileName?: string
  source?: string
  status?: string
  createTime?: string
}
const initSearchForm: SearchFormProps = {
  fileName: void 0,
  source: void 0,
  status: void 0,
  createTime: void 0
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/logFile/page', params), formData)

function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

const options = ref<any[]>([
  { label: '全部', value: 0 },
  { label: '成功', value: 1 },
  { label: '失败', value: 2 }
])

const deleteReport = async (id: number) => {
  await confirmModal('提示', '确定删除吗？')
  request
    .Delete(`/logFile/delete/${id}`)
    .then((res: any) => {
      Message.success('删除成功')
      if (taleData.value.length <= 1) {
        resetForm()
      } else {
        loadData()
      }
    })
    .catch(() => {
      Message.error('删除失败，请稍后重试')
    })
}

onMounted(() => {
  loadData(true)
})

</script>

<template>
  <AddModal ref="AddModalRef" />
  <Page>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>接收邮箱</span>
          <a-input v-model.trim="formData.fileName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>模版</span>
          <a-select v-model="formData.status" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>发送状态</span>
          <a-select v-model="formData.status" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
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
        <a-table-column title="编号" data-index="number" ellipsis tooltip :width="180" />
        <a-table-column title="发送时间" data-index="name" ellipsis tooltip :width="180" />
        <a-table-column title="接收邮箱" data-index="type" ellipsis tooltip :width="180" />
        <a-table-column title="发送账号" data-index="status" ellipsis tooltip :width="180" />
        <a-table-column title="邮件标题" data-index="注释" ellipsis tooltip :width="180" />
        <a-table-column title="邮件内容" data-index="account" ellipsis tooltip :width="180" />
        <a-table-column title="邮箱参数" data-index="secretKey" ellipsis tooltip :width="180" />
        <a-table-column title="发送状态" data-index="url" ellipsis tooltip :width="180" />
        <a-table-column title="模板编号" data-index="cerateTime" ellipsis tooltip :width="180" />
        <a-table-column title="模板名称" data-index="cerateTime" ellipsis tooltip :width="180" />
        <a-table-column title="发送结果" data-index="cerateTime" ellipsis tooltip :width="180" />
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="100">
          <template #cell="{ record }">
            <a-space>
              <a-link status="normal">详情</a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
