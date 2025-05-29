<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import { useRouter } from 'vue-router'
import request from '@/request'
import http from '@/request'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'
import LogUploadModal from './components/log-upload-modal.vue'
import { formatSize } from '@/utils/tools'

const router = useRouter()
const LogUploadModalRef = ref<InstanceType<typeof LogUploadModal>>()

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
  { label: '待解析', value: 0 },
  { label: '解析中', value: 1 },
  { label: '解析成功', value: 2 },
  { label: '解析失败', value: 3 }
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
      return '待解析'
    case 1:
      return '解析中'
    case 2:
      return '解析完成'
    case 3:
      return '解析失败'
    default:
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

function jump(arg?: any) {
  router.push('logParsing')
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
  <Page>
    <template #action>
      <a-button type="primary" class="mr-14" @click="LogUploadModalRef?.openModal()"> 上传 </a-button>
      <!-- <a-button type="outline" class="mr-14" @click="jump()"> 查看 </a-button> -->
    </template>
    <template #top>
      <SearchForm @query="loadData(true)" @reset="resetForm">
        <div class="search-item">
          <span>文件名称</span>
          <a-input v-model.trim="formData.fileName" allow-clear placeholder="请输入" />
        </div>
        <div class="search-item">
          <span>状态</span>
          <a-select v-model="formData.status" allow-clear placeholder="请选择">
            <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
          </a-select>
        </div>
        <!-- <div class="search-item">
          <span>上传时间</span>
          <a-date-picker
            v-model="formData.createTime"
            show-time
            :time-picker-props="{ defaultValue: '00:00:00' }"
            format="YYYY-MM-DD HH:mm:ss"
            allow-clear
            placeholder="请选择开始时间"
          />
        </div> -->
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
        <a-table-column title="序号" :width="70" align="center">
          <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
        </a-table-column>
        <a-table-column title="文件名称" data-index="fileName" ellipsis tooltip :width="400" />
        <a-table-column title="上传时间" data-index="uploadTime" ellipsis tooltip :width="250" />
        <a-table-column title="大小" data-index="fileSize" ellipsis tooltip :width="200">
          <template #cell="{ record }">
            {{ formatSize(record.fileSize) }}
          </template>
        </a-table-column>
        <a-table-column title="状态" data-index="handlingStatus" ellipsis tooltip :width="150">
          <template #cell="{ record: { handlingStatus, handlingMsg } }">
            <a-tooltip v-if="handlingStatus === 3" :content="handlingMsg" position="bottom">
              <div class="w-60 text-12 border border-solid rounded-4 px-4 py-2 flex items-center justify-center" :class="getStatusClass(handlingStatus)">
                {{ getStatusText(handlingStatus) }}
              </div>
            </a-tooltip>
            <div
              v-if="handlingStatus !== 3 && (handlingStatus || handlingStatus === 0)"
              class="w-60 text-12 border border-solid rounded-4 px-4 py-2 flex items-center justify-center"
              :class="getStatusClass(handlingStatus)"
            >
              {{ getStatusText(handlingStatus) }}
            </div>
          </template>
        </a-table-column>
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="150">
          <template #cell="{ record }">
            <a-space>
              <!-- <a-link @click="jump(record)">查看</a-link> -->
              <a-link status="danger" @click="deleteReport(record.id)">删除</a-link>
              <a-link v-if="record.handlingStatus === 0 || record.handlingStatus === 3" @click="analysis(record)">解析</a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
  <LogUploadModal ref="LogUploadModalRef" @upload="loadData(true)" />
</template>
