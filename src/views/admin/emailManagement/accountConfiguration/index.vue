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

function jump(arg?: any) {

}

// 重新解析
function analysis(arg?: any) {
  console.log('重新解析', arg)
  request
    .Put(`/logFile/reprocess/${arg.id}`)
    .then((res: any) => {
      if (res && res.code === 1) {
        Message.success('操作成功')
        setTimeout(() => {
          loadData()
        }, 1500)
      } else {
        Message.error('操作失败，请稍后重试')
      }
    })
    .catch(() => {
      Message.error('操作失败，请稍后重试')
    })
}
</script>

<template>
  <AddModal ref="AddModalRef" />
  <Page>
    <template #action>
      <a-button type="primary" class="ml-14" @click="AddModalRef?.openModal()"> 新增 </a-button>
    </template>
    <template #top>
      
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>邮箱</span>
          <a-input v-model.trim="formData.fileName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>用户名</span>
          <a-input v-model.trim="formData.fileName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <div class="pl-30">SMTP服务器域名</div>
          <a-input v-model.trim="formData.fileName" allow-clear placeholder="请输入" />
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
        <a-table-column title="邮箱" data-index="number" ellipsis tooltip :width="180" />
        <a-table-column title="用户名" data-index="name" ellipsis tooltip :width="180" />
        <a-table-column title="密码" data-index="type" ellipsis tooltip :width="180" />
        <a-table-column title="SMTP服务器域名" data-index="status" ellipsis tooltip :width="180" />
        <a-table-column title="SMTP服务器端口" data-index="注释" ellipsis tooltip :width="180" />
        <a-table-column title="是否开启SSL" data-index="account" ellipsis tooltip :width="180" />
        <a-table-column title="是否开启STARTTLS" data-index="secretKey" ellipsis tooltip :width="160" />
        <a-table-column title="创建时间" data-index="cerateTime" ellipsis tooltip :width="160" />
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="150">
          <template #cell="{ record }">
            <a-space>
              <a-link status="normal" @click="jump(record)">修改</a-link>
              <a-link status="danger" @click="deleteReport(record.id)">删除</a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
