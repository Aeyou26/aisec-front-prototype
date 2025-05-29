<template>
  <SegmentationDetailModal ref="SegmentationDetailModalRef" :file-id="fieldId" :knowledge-name="knowledgeName" @upload="resetForm" />
  <addSegmentationModal ref="addSegmentationModalRef" :file-id="fieldId" :knowledge-name="knowledgeName" @upload="resetForm" />
  <Page :table="false">
    <div class="h-full overflow-auto pr-30" @scroll="handleScroll">
      <div class="flex justify-between mb-30 line">
        <div class="flex items-center">
          <icon-arrow-left size="20" class="cursor-pointer" @click="router.go(-1)" />
          <div class="ml-10">{{ list?.[0]?.file_name }}</div>
        </div>
        <div>
          <!-- <a-button type="outline" class="mr-20">批量选择</a-button> -->
          <a-button type="primary" @click="addSegmentationModalRef?.openModal()">添加分段</a-button>
        </div>
      </div>
      <!-- <div class="flex justify-between mb-30">
        <div class="w-60 h-20"></div>
        <div class="flex items-center">
          <a-select :style="{ width: '90px' }" placeholder="Select" :trigger-props="{ autoFitPopupMinWidth: true }">
            <a-option>标题</a-option>
            <a-option>内容</a-option>
          </a-select>
          <a-input :style="{ width: '250px' }" placeholder="搜索" />
        </div>
      </div> -->
      <div v-if="list && list.length > 0" class="grid gap-30" :style="{ gridTemplateColumns: 'repeat(auto-fill, minmax(302px, 1fr))' }">
        <div v-for="(item, index) in list" :key="index" class="box box-border p-20 pl-24 pr-24 cursor-pointer" @click="SegmentationDetailModalRef?.openModal(item)">
          <div class="flex justify-between items-center mb-10">
            <!-- <span class="color-#333333 text-16">{{ item.file_name }}</span> -->
            <!-- <a-switch v-model="value" checked-value="yes" unchecked-value="no" @click.stop /> -->
          </div>
          <div class="h-120 color-#333333;text-12 mb-24 break-words overflow-hidden content-box" style="line-height: 24px">
            {{ item.content }}
          </div>
          <div class="flex justify-between items-center">
            <div class="w-10 h-10"></div>
            <!-- <div class="color-#333333 text-14">{{ item.num }}k个字符</div> -->
            <a-dropdown trigger="click" :popup-max-height="400">
              <icon-more class="cursor-pointer" size="20" @click.stop />
              <template #content>
                <!-- <a-doption>
                  <a-space>
                    <SvgIcon name="chat-bot" size="18" />
                    <span>迁移</span>
                  </a-space>
                </a-doption> -->
                <a-doption>
                  <a-space @click="deleteData(item)">
                    <!-- <SvgIcon name="chat-bot" size="18" /> -->
                    <span>删除</span>
                  </a-space>
                </a-doption>
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
      <div v-else>
        <Empty description="暂无数据" />
      </div>
    </div>
  </Page>
</template>

<script lang="ts" setup>
import SvgIcon from '@/components/SvgIcon.vue'
import SegmentationDetailModal from './components/segmentation-detail-modal.vue'
import addSegmentationModal from './components/add-segmentation-modal.vue'
import { Message } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'
import request from '@/request'
import { useRouter } from 'vue-router'
const router = useRouter()
const route = useRoute()
const knowledgeId = route.query.knowledgeId
const fieldId = route.query.fieldId as string
const knowledgeName = route.query.knowledgeName as string

const SegmentationDetailModalRef = ref<InstanceType<typeof SegmentationDetailModal>>()
const addSegmentationModalRef = ref<InstanceType<typeof addSegmentationModal>>()

const list = ref<any>([])

const page = ref({
  current: 1,
  pageSize: 20,
  total: 0
})
const loading = ref(false)
const hasMore = ref(true)
const canLoadMore = ref(true)

onMounted(() => {
  getKnowledgeList()
})

function getKnowledgeList() {
  if (loading.value) {
    return
  }
  loading.value = true
  request
    .Post('/knowledge/file/page/document', {
      current: page.value.current,
      fileId: fieldId,
      keywords: '',
      knowledgeId: knowledgeId,
      pageSize: page.value.pageSize
    })
    .then((res: any) => {
      if (res && res.code === 1) {
        if (res.data && res.data.data && res.data.data.length > 0) {
          const resData = res.data.data
          if (page.value.current === 1) {
            list.value = resData
          } else {
            list.value = [...list.value, ...resData]
          }
        } else {
          hasMore.value = false
          list.value = []
        }
        hasMore.value = list.value.length < res.data.total
      } else {
        hasMore.value = false
        list.value = []
      }
      loading.value = false
    })
    .catch(() => {
      list.value = []
      loading.value = false
    })
}

// 处理滚动加载
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const { scrollHeight, scrollTop, clientHeight } = target

  // 距离底部20px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 20 && hasMore.value && !loading.value && canLoadMore.value) {
    page.value.current++
    getKnowledgeList()
  }
}

function resetForm() {
  page.value.current = 1
  canLoadMore.value = false // 禁止触发滚动加载
  getKnowledgeList()
  setTimeout(() => {
    canLoadMore.value = true // 恢复触发滚动加载
  }, 1000) // 1秒后恢复
}

async function deleteData(arg: any) {
  await confirmModal('删除确认', '您确定要删除分段吗？')
  request
    .Delete(`knowledge/file/delete/document`, { id: arg.id, topic: knowledgeName, fileId: fieldId })
    .then((res: any) => {
      Message.success('删除成功')
      resetForm()
    })
    .catch(() => {
      Message.error('删除失败，请稍后重试')
    })
}
</script>

<style lang="less" scoped>
.line {
  padding-bottom: 20px;
  height: 80px;
  align-items: center;
  border-bottom: 1px solid #f5f6f7;
}

.box {
  box-sizing: border-box;
  border-radius: 14px;
  background: #f5f6f7;
  border: 1px solid transparent;
}

.box:hover {
  background: white; /* 鼠标悬停时背景变为白色 */
  border: 1px solid #dee0e3;
  box-shadow: 0px 2px 4px 0px rgba(31, 35, 41, 0.12);
}

.content-box {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 5;
  -webkit-line-clamp: 5;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
