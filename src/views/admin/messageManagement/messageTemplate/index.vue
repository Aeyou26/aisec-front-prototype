<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import { useRouter } from 'vue-router'
import request from '@/request'
import http from '@/request'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'
import AddModal from './components/add-modal.vue'
import TestModal from './components/test-modal.vue'

const AddModalRef = ref<InstanceType<typeof AddModal>>()
const TestModalRef = ref<InstanceType<typeof TestModal>>()

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
  { label: '开启', value: 1 },
  { label: '关闭', value: 2 },
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
  <TestModal ref="TestModalRef" />
  <Page>
    <template #action>
      <a-button type="primary" class="ml-14" @click="AddModalRef?.openModal()"> 新增 </a-button>
    </template>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>短信签名</span>
          <a-input v-model.trim="formData.fileName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>启用状态</span>
          <a-select v-model="formData.status" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>创建时间</span>
          <a-date-picker
            v-model="formData.createTime"
            show-time
            :time-picker-props="{ defaultValue: '00:00:00' }"
            format="YYYY-MM-DD HH:mm:ss"
            allow-clear
            placeholder="请选择时间"
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
        <a-table-column title="模版编码" data-index="number" ellipsis tooltip :width="200" />
        <a-table-column title="模版名称" data-index="name" ellipsis tooltip :width="200" />
        <a-table-column title="模版内容" data-index="type" ellipsis tooltip :width="200" />
        <a-table-column title="短信类型" data-index="status" ellipsis tooltip :width="200" />
        <a-table-column title="状态" data-index="status" ellipsis tooltip :width="200" />
        <a-table-column title="备注" data-index="注释" ellipsis tooltip :width="200" />
        <a-table-column title="短信API的模板编号" data-index="account" ellipsis tooltip :width="200" />
        <a-table-column title="短信渠道" data-index="secretKey" ellipsis tooltip :width="200" />
        <a-table-column title="创建时间" data-index="cerateTime" ellipsis tooltip :width="200" />
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="200">
          <template #cell="{ record }">
            <a-space>
              <a-link status="normal">编辑</a-link>
              <a-link status="normal" @click="TestModalRef?.openModal(record)">测试</a-link>
              <a-link status="danger" @click="deleteReport(record.id)">删除</a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
