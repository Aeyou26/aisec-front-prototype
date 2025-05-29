<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import UploadModal from '@/views/admin/knowledgeManage/fileManagement/components/upload-modal.vue'
import http from '@/request'
import request from '@/request'
import { useRouter } from 'vue-router'
import { formatSize } from '@/utils/tools'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'
const router = useRouter()
const route = useRoute()
const knowledgeId = route.query.id
const knowledgeName = route.query.knowledgeName

const UploadModalRef = ref<InstanceType<typeof UploadModal>>()

interface SearchFormProps {
  keywords?: string
  knowledgeId: string | number // 知识库id
}
const initSearchForm: SearchFormProps = {
  keywords: '',
  knowledgeId: knowledgeId as string | number
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post('/knowledge/page/file', params),
  formData
)

function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

onMounted(() => {
  loadData(true)
})

const timer = ref<any>(null)

watch(
  taleData,
  (newValue) => {
    // 如果有处理中的数据则定时刷新
    const hasProcessing = newValue.some((item: { status: number }) => item.status === 1)
    if (hasProcessing) {
      // 启用定时器
      if (!timer.value) {
        timer.value = setInterval(() => {
          loadData()
        }, 60000)
      }
    } else if (!hasProcessing && timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  },
  { deep: true }
)

// 卸载定时器
onBeforeUnmount(() => {
  clearInterval(timer.value)
})

// 跳转分段
const jumpSegmentation = (data: any) => {
  if (data.status !== 2) {
    return
  }
  router.push({
    path: '/admin/knowledgeManage/knowledge-segmentation',
    query: {
      fieldId: data.id,
      knowledgeId: knowledgeId,
      knowledgeName: knowledgeName
    }
  })
}

// 向量化
function vectorize(arg: any) {
  request
    .Get('/knowledge/handle', { params: { id: arg.id } })
    .then((res: any) => {
      if (res && res.code === 1) {
        Message.success('操作成功')
        setTimeout(() => {
          loadData()
        }, 2000)
      } else {
        Message.error('操作失败，请稍后重试')
      }
    })
    .catch(() => {
      Message.error('操作失败，请稍后重试')
    })
}

async function deleteFile(arg: any) {
  if (!arg.id) {
    Message.error('删除失败')
    return
  }
  await confirmModal('删除确认', '您确定要删除文件吗？')
  request
    .Delete(`/knowledge/delete/file?id=${arg.id}`)
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

// 导出文件
const downloadReport = (fileName: string) => {
  request.Get('/user/check/token').then(() => {
    location.href = `/api/knowledge/download/?id=${fileName}`
  })
}
</script>

<template>
  <UploadModal ref="UploadModalRef" />
  <Page>
    <template #action>
      <icon-arrow-left size="20" class="cursor-pointer" @click="router.go(-1)" />
      <div class="flex align-center">
        <!-- <a-button type="primary" class="mr-20"  @click="UploadModalRef?.openModal()"> 上传文档 </a-button> -->
        <!-- <a-button type="outline" class="mr-20"> 迁移 </a-button> -->
        <!-- <a-button type="outline" class="mr-20"> 设置 </a-button> -->
        <!-- <a-button type="outline" status="danger" class="mr-20">删除</a-button> -->
        <!-- <div v-for="(item, index) in tab" :key="item.id" class="flex items-center">
          <div v-if="tab.length >= 2" :class="index == tab.length - 1 ? '' : 'color-blue'" @click="jumpCatalogue(index)">
            {{ index > 0 ? '/' + item.name : item.name }}
          </div>
        </div> -->
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
        <a-table-column title="文件名称" data-index="fileName" ellipsis tooltip :width="380">
          <template #cell="{ record }">
            <a-tooltip v-if="record.fileName.length > 30" :content="record.fileName" position="bottom">
              <div class="overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer" @click="jumpSegmentation(record)">
                <SvgIcon name="file-file" size="14" class="mr-7" />{{ record.fileName }}
              </div>
            </a-tooltip>
            <div v-else class="cursor-pointer" @click="jumpSegmentation(record)"><SvgIcon name="file-file" size="14" class="mr-7" />{{ record.fileName }}</div>
          </template>
        </a-table-column>
        <a-table-column title="大小" data-index="fileSize" ellipsis tooltip :width="130">
          <template #cell="{ record }">
            {{ formatSize(record.fileSize) }}
          </template>
        </a-table-column>
        <a-table-column title="分段" data-index="chunkCount" ellipsis tooltip :width="130" />
        <a-table-column title="文件状态" data-index="status" ellipsis tooltip :width="130">
          <template #cell="{ record }">
            <a-tag v-if="record.status === 0" color="#165dff">未开始</a-tag>
            <div v-if="record.status === 1" class="flex items-center">
              <a-tag color="#f07300" loading>处理中</a-tag>
              <!-- <a-spin /> -->
            </div>
            <a-tag v-if="record.status === 2" color="#099a74">已完成</a-tag>
            <a-tag v-if="record.status === 3" color="#f53f3f">失败</a-tag>
          </template>
        </a-table-column>
        <!-- <a-table-column title="启动状态" data-index="size" ellipsis tooltip :width="130">
          <template #cell="{ record }">
            <a-switch v-model="record.status" size="small" />
          </template>
        </a-table-column>
        <a-table-column title="命中处理方式" data-index="size" ellipsis tooltip :width="140">
          <template #cell>
            <div>模型优化</div>
          </template>
        </a-table-column> -->
        <a-table-column title="创建时间" data-index="createTime" ellipsis tooltip :width="180" />
        <a-table-column title="更新时间" data-index="createTime" ellipsis tooltip :width="180" />
        <a-table-column title="操作" data-index="robots" ellipsis tooltip :width="180">
          <template #cell="{ record }">
            <a-space>
              <!-- <a-link>设置</a-link> -->
              <!-- <a-link>迁移</a-link> -->
              <a-link @click="downloadReport(record.id)">导出</a-link>
              <a-link status="danger" @click="deleteFile(record)">删除</a-link>
              <a-link v-if="record.status !== 1 && record.status !== 2" @click="vectorize(record)">向量化</a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
