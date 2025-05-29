<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'

interface SearchFormProps {
  keywords?: string
  logType?: string
  sourceIp?: string
  status?: string
  targetIp?: string
  startTime?: string
  endTime?: string
  date?: string[]
}
const initSearchForm: SearchFormProps = {
  keywords: void 0,
  logType: void 0,
  sourceIp: void 0,
  status: void 0,
  targetIp: void 0,
  startTime: '',
  endTime: '',
  date: ['', '']
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/syslog/page', params), formData)

function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

const options = ref<any[]>([
  { label: '行为日志', value: '行为日志' },
  { label: '告警信息', value: '告警信息' },
  { label: '态势感知日志', value: '态势感知日志' },
  { label: 'Web应用防护', value: 'Web应用防护' },
  { label: '漏洞攻击防护', value: '漏洞攻击防护' }
])

onMounted(() => {
  loadData(true)
})

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
</script>

<template>
  <Page>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>日志类型</span>
          <a-select v-model="formData.logType" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>源IP</span>
          <a-input v-model.trim="formData.sourceIp" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>目标IP</span>
          <a-input v-model.trim="formData.targetIp" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>操作时间</span>
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
        <a-table-column title="序号" :width="90" align="center">
          <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
        </a-table-column>
        <a-table-column title="日志类型" data-index="logType" ellipsis tooltip :width="180" />
        <a-table-column title="发生时间" data-index="createTime" ellipsis tooltip :width="180" />
        <a-table-column title="攻击类型" data-index="attackType" ellipsis tooltip :width="180" />
        <a-table-column title="源IP" data-index="sourceIp" ellipsis tooltip :width="180" />
        <a-table-column title="源端口" data-index="sourcePort" ellipsis tooltip :width="180" />
        <a-table-column title="目标" data-index="target" ellipsis tooltip :width="180" />
        <a-table-column title="目标IP" data-index="targetIp" ellipsis tooltip :width="180" />
        <a-table-column title="目标端口" data-index="targetPort" ellipsis tooltip :width="180" />
        <a-table-column title="威胁等级或告警等级" data-index="level" ellipsis tooltip :width="180" />
        <a-table-column title="数据来源" data-index="dataSource" ellipsis tooltip :width="180" />
        <!-- <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="200">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="jump(record)">详情</a-link>
            </a-space>
          </template>
        </a-table-column> -->
      </template>
    </a-table>
  </Page>
</template>
