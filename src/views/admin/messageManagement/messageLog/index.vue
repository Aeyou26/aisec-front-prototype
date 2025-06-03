<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import { useRouter } from 'vue-router'
import request from '@/request'
import http from '@/request'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'

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
  { label: '通用', value: 0 },
  { label: '反动', value: 1 },
  { label: '色情', value: 2 },
  { label: '毒品', value: 3 },
  { label: '赌博', value: 3 }
])

const getStatusClass = (status: number) => {
  switch (status) {
    case 0:
    case 1:
      return 'color-#2E66C7'
    case 2:
      return 'color-#52B56F'
    case 3:
      return 'color-#DE1E1E'
    default:
      return ''
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return ''
    case 1:
      return ''
    case 2:
      return ''
    case 3:
      return ''
    case 4:
      return ''
  }
}

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

function jump(arg?: any) {}

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
  <Page>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>手机号</span>
          <a-input v-model.trim="formData.fileName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>短信渠道</span>
          <a-select v-model="formData.status" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>模版编号</span>
          <a-input v-model.trim="formData.fileName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>发送状态</span>
          <a-select v-model="formData.status" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>发送时间</span>
          <a-date-picker
            v-model="formData.createTime"
            show-time
            :time-picker-props="{ defaultValue: '00:00:00' }"
            format="YYYY-MM-DD HH:mm:ss"
            allow-clear
            placeholder="请选择时间"
          />
        </div>
        <div class="search-item">
          <span>接收状态</span>
          <a-select v-model="formData.status" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <div class="search-item">
          <span>接收时间</span>
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
        <a-table-column title="编号" data-index="fileName" ellipsis tooltip :width="200" />
        <a-table-column title="创建时间" data-index="createTime" ellipsis tooltip :width="200" />
        <a-table-column title="手机号" data-index="phone" ellipsis tooltip :width="200" />
        <a-table-column title="短信内容" data-index="content" ellipsis tooltip :width="200" />
        <a-table-column title="发送状态" data-index="sendStatus" ellipsis tooltip :width="200" />
        <a-table-column title="接收状态" data-index="receiveStatus" ellipsis tooltip :width="200" />
        <a-table-column title="短信渠道" data-index="channel" ellipsis tooltip :width="200" />
        <a-table-column title="模板编号" data-index="number" ellipsis tooltip :width="200" />
        <a-table-column title="短信类型" data-index="handlingStatus" ellipsis tooltip :width="150">
          <template #cell="{ record: { handlingStatus } }">
            <div v-if="handlingStatus || handlingStatus === 0">
              {{ getStatusText(handlingStatus) }}
            </div>
          </template>
        </a-table-column>
        <a-table-column title="详情" data-index="number" ellipsis tooltip :width="200" />
      </template>
    </a-table>
  </Page>
</template>
