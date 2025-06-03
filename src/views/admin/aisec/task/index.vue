<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'

interface SearchFormProps {
  taskName?: string
  runStatus?: string
  robotId?: string
}
const initSearchForm: SearchFormProps = {
  taskName: void 0,
  runStatus: void 0,
  robotId: void 0
}
const formData = reactive({ ...initSearchForm })
const robotOptions = ref<any[]>([])
// 0:执行失败 1:执行中 2:执行完成
const statusOptions = ref<any[]>([
  { label: '执行失败', value: 0 },
  { label: '执行中', value: 1 },
  { label: '执行完成', value: 2 }
])

const { pagination, taleData, loading, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/robot/run/page', params), formData)
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}
// 获取机器人列表
const getRobotList = () => {
  http.Get<any>('/robot/all').then((res) => {
    robotOptions.value = res.data
  })
}
onMounted(() => {
  loadData(true)
  getRobotList()
})
</script>

<template>
  <Page>
    <template #action>
      <!-- <a-button type="primary"> 同步资产 </a-button> -->
      <div></div>
    </template>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>数字人</span>
          <a-select v-model="formData.robotId" placeholder="请选择数字人">
            <a-option v-for="item in robotOptions" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>任务名称</span>
          <a-input v-model.trim="formData.taskName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>状态</span>
          <a-select v-model="formData.runStatus" allow-clear placeholder="请选择">
            <a-option v-for="item in statusOptions" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
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
        <a-table-column title="序号" :width="80" align="center">
          <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
        </a-table-column>
        <a-table-column title="任务名称" data-index="taskName" ellipsis tooltip />
        <a-table-column title="数字人" data-index="robotName" ellipsis tooltip />
        <a-table-column title="更新时间" data-index="updateTime" ellipsis tooltip />
        <a-table-column title="同步状态" data-index="openStatus" ellipsis tooltip>
          <template #cell="{ record: { openStatus } }">
            {{ openStatus === 1 ? '开启' : '关闭' }}
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="runStatus" ellipsis tooltip>
          <template #cell="{ record: { runStatus } }">
            {{ runStatus === 1 ? '执行中' : runStatus === 2 ? '执行完成' : '执行失败' }}
          </template>
        </a-table-column>
        <a-table-column title="结果" data-index="result" ellipsis tooltip />
      </template>
    </a-table>
  </Page>
</template>
