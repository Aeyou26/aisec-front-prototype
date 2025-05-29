<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import EditModal from './components/edit-modal.vue'
import AddModal from './components/add-modal.vue'
import OverviewModal from './components/overview-modal.vue'
import HitTestModel from './components/hit-test-model.vue'
import http from '@/request'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'

interface SearchFormProps {
  keywords?: string
  status?: number
  startTime?: string
  endTime?: string
  date?: string[]
}
const initSearchForm: SearchFormProps = {
  keywords: void 0,
  status: void 0,
  date: ['', ''],
  startTime: void 0,
  endTime: void 0
}
const formData = reactive({ ...initSearchForm })
const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/digital/human/page', params),
  formData
)
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
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

const statusOptions = ref<any[]>([
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
])

const editModalRef = ref<InstanceType<typeof EditModal>>()
const addModalRef = ref<InstanceType<typeof AddModal>>()
const overviewModalRef = ref<InstanceType<typeof OverviewModal>>()
const hitTestModalRef = ref<InstanceType<typeof HitTestModel>>()
const changeStatus = (params: any) => {
  const { id } = params
  http.Post(`/digital/human/update/status/${id}`).then(() => {
    Message.success('操作成功')
    loadData()
  })
}
const handleDelete = async (record: any) => {
  await confirmModal('删除确认', '您确定要删除数字人吗？')
  http.Delete(`/digital/human/delete?id=${record.id}`).then(() => {
    Message.success('删除成功')
    loadData()
  })
}

onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page>
    <EditModal ref="editModalRef" @upload="loadData()" />
    <AddModal ref="addModalRef" @upload="loadData(true)" />
    <HitTestModel ref="hitTestModalRef" />
    <OverviewModal ref="overviewModalRef" @refresh="loadData()" />
    <template #action>
      <a-button type="primary" @click="addModalRef?.openModal()"> 创建 </a-button>
    </template>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>数字人名称</span>
          <a-input v-model.trim="formData.keywords" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>状态</span>
          <a-select v-model="formData.status" allow-clear placeholder="请选择">
            <a-option v-for="item in statusOptions" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>修改时间</span>
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
        <a-table-column title="数字人名称" data-index="name" ellipsis tooltip :width="200" />
        <a-table-column title="形象" data-index="avatar" ellipsis tooltip :width="80">
          <template #cell="{ record: { logo } }">
            <img v-if="logo" :src="`/api/sys/download?fileName=${logo}`" class="w-40 h-40" />
          </template>
        </a-table-column>
        <a-table-column title="说明" data-index="description" ellipsis tooltip />
        <a-table-column title="状态" data-index="status" ellipsis tooltip :width="80">
          <template #cell="{ record }">
            <a-switch v-model="record.isActive" :checked-value="true" :unchecked-value="false" @change="changeStatus(record)" />
          </template>
        </a-table-column>
        <a-table-column title="修改时间" data-index="updateTime" ellipsis tooltip :width="180" />
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="160">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="editModalRef?.openModal(record)"> 编辑 </a-link>
              <a-link @click="overviewModalRef?.openModal(record)"> 概览 </a-link>
              <!-- <a-link @click="hitTestModalRef?.openModal(record)"> 命中测试 </a-link> -->
              <a-link @click="handleDelete(record)"> 删除 </a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
