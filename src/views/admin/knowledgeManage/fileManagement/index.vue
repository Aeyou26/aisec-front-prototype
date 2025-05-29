<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import UploadModal from './components/upload-modal.vue'
import LinkKnowledge from './components/link-knowledge.vue'
import renameModal from './components/rename-modal.vue'
import http from '@/request'
import request from '@/request'
import { formatSize } from '@/utils/tools'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'

const UploadModalRef = ref<InstanceType<typeof UploadModal>>()
const LinkKnowledgeRef = ref<InstanceType<typeof LinkKnowledge>>()
const renameModalRef = ref<InstanceType<typeof renameModal>>()

interface SearchFormProps {
  keywords?: string
}
const initSearchForm: SearchFormProps = {
  keywords: ''
}
const formData = reactive({ ...initSearchForm })

const fileId = ref('')
const knowledgeName = ref('')

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/knowledge/file/page', params),
  formData
)

function resetForm() {
  Object.assign(formData, { keywords: '' })
  loadData(true)
}

onMounted(() => {
  loadData(true)
})

function linkKnowledge(arg: any) {
  fileId.value = arg.id
  knowledgeName.value = arg.knowledgeName
  LinkKnowledgeRef.value?.openModal()
}

async function deleteFile(arg: any) {
  if (!arg.id) {
    Message.error('删除失败')
    return
  }
  await confirmModal('删除确认', '您确定要删除文件吗？')
  request
    .Delete(`/knowledge/file/delete?id=${arg.id}`)
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

const downloadReport = (fileName: string) => {
  request.Get('/user/check/token').then(() => {
    location.href = `/api/knowledge/file/download/?fileId=${fileName}`
  })
}
</script>

<template>
  <UploadModal ref="UploadModalRef" @upload="resetForm" />
  <LinkKnowledge :id="fileId" ref="LinkKnowledgeRef" :knowledge="knowledgeName" @upload="loadData()" />
  <renameModal ref="renameModalRef" />

  <Page>
    <template #action>
      <div class="flex align-center">
        <a-button type="primary" class="mr-20" @click="UploadModalRef?.openModal()"> 上传文件 </a-button>
      </div>
    </template>
    <template #top>
      <div class="flex items-center gap-20">
        <a-input v-model:model-value="formData.keywords" class="!w-340" allow-clear placeholder="请输入要查找的内容">
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
        <a-table-column title="名称" data-index="fileName" ellipsis tooltip :width="400">
          <template #cell="{ record }">
            <!-- 文件 -->
            <div v-if="record.fileName.length > 30">
              <a-tooltip :content="record.fileName" position="bottom">
                <div class="overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"><SvgIcon name="file-file" size="14" class="mr-7" />{{ record.fileName }}</div>
              </a-tooltip>
            </div>
            <div v-else class="cursor-pointer"><SvgIcon name="file-file" size="14" class="mr-7" />{{ record.fileName }}</div>
          </template>
        </a-table-column>
        <a-table-column title="上传日期" data-index="createTime" ellipsis tooltip />
        <a-table-column title="大小" data-index="fileSize" ellipsis tooltip>
          <template #cell="{ record }">
            {{ formatSize(record.fileSize) }}
          </template>
        </a-table-column>
        <a-table-column title="知识库" data-index="knowledgeName" ellipsis tooltip />
        <a-table-column title="操作" data-index="operate" ellipsis tooltip :width="250">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="linkKnowledge(record)">链接知识库</a-link>
              <!-- <a-link @click="renameModalRef?.openModal()">重命名</a-link> -->
              <a-link @click="downloadReport(record.id)">下载</a-link>
              <a-link status="danger" @click="deleteFile(record)">删除</a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
