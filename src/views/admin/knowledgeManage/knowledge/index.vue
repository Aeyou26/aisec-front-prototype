<template>
  <CreateKnowledgeModal ref="CreateKnowledgeModalRef" :title="title" @upload="resetForm" />
  <EditKnowleageModal :id="id" ref="EditKnowleageModalRef" title="编辑" :subscribe="subscribe" :name="name" @upload="resetForm" />
  <Page :table="false">
    <div class="h-full overflow-auto" @scroll="handleScroll">
      <div class="grid gap-40 px-30 overflow-auto" :style="{ gridTemplateColumns: 'repeat(auto-fill, minmax(302px, 1fr))' }">
        <div class="grid gap-40 h-160 cursor-pointer" :style="{ gridTemplateColumns: 'repeat(auto-fill, minmax(302px, 1fr))' }" @click="createKnowledge">
          <div class="box box-border p-20 pl-24 pr-24 flex justify-center items-center">
            <SvgIcon name="knowledge-create" size="28" class="mr-10" />
            <span class="text-16">创建知识库</span>
          </div>
        </div>

        <div v-for="(item, index) in list" :key="index" class="box h-160 box-border p-20 pl-24 pr-24 cursor-pointer" @click="jump(item)">
          <div class="flex justify-between items-center mb-20">
            <span class="color-#333333 text-16 font-600">{{ item.knowledgeName }}</span>
            <SvgIcon name="delete" size="14" class="cursor-pointer" @click.stop="deleteData(item)" />
          </div>
          <div class="color-#333333;text-12 mb-24 break-words max-h-60 line-clamp-2 overflow-hidden">
            {{ item.description }}
          </div>
          <div class="flex justify-between items-center">
            <div class="color-#333333 text-14">文档数{{ item.docCount ? item.docCount : 0 }}个</div>
            <a-button type="primary" @click.stop="edmit(item)">编辑</a-button>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<script lang="ts" setup>
import SvgIcon from '@/components/SvgIcon.vue'
import CreateKnowledgeModal from './components/create-knowledge-modal.vue'
import EditKnowleageModal from './components/edit-knowleage-modal.vue'
import { Message, Notification, Button, Space } from '@arco-design/web-vue'
import { confirmModal } from '@/utils/modal'
import request from '@/request'
import { useRouter } from 'vue-router'

const router = useRouter()

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const CreateKnowledgeModalRef = ref<InstanceType<typeof CreateKnowledgeModal>>()
const EditKnowleageModalRef = ref<InstanceType<typeof EditKnowleageModal>>()
const title = ref('创建知识库')
const page = ref({
  current: 1,
  pageSize: 40,
  total: 0
})
const loading = ref(false)
const hasMore = ref(true)

const list = ref<any>([])
const name = ref('')
const subscribe = ref('')
const id = ref('')

onMounted(() => {
  getKnowledgeList()
})

// 处理滚动加载
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const { scrollHeight, scrollTop, clientHeight } = target

  // 距离底部20px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 20 && hasMore.value && !loading.value) {
    page.value.current++
    getKnowledgeList()
  }
}

function getKnowledgeList() {
  if (!userInfo || !userInfo.value.userId) {
    return
  }
  if (loading.value) {
    return
  }
  loading.value = true

  request
    .Post('/knowledge/page', {
      current: page.value.current,
      keywords: '',
      pageSize: page.value.pageSize
      // userId: userInfo.value.userId
    })
    .then((res: any) => {
      if (res && res.code === 1) {
        if (res.data && res.data.length > 0) {
          if (page.value.current === 1) {
            list.value = res.data
          } else {
            list.value = [...list.value, ...res.data]
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

function createKnowledge() {
  title.value = '创建知识库'
  CreateKnowledgeModalRef?.value?.openModal()
}

function edmit(arg: any) {
  name.value = arg.knowledgeName
  subscribe.value = arg.description
  id.value = arg.id
  EditKnowleageModalRef?.value?.openModal()
}

function resetForm() {
  page.value.current = 1
  getKnowledgeList()
}

function jump(data: any) {
  router.push({
    path: '/admin/knowledgeManage/knowledge-item',
    query: {
      id: data.id,
      knowledgeName: data.knowledgeName
    }
  })
}

async function deleteData(arg: any) {
  if (!arg.id) {
    Message.error('删除失败')
    return
  }
  await confirmModal('删除确认', '您确定要删除吗？')
  request
    .Delete(`/knowledge/delete?id=${arg.id}`)
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
.box {
  border-radius: 14px;
  border: 1px solid #2e66c780;
  background: #60a9ff0f;
}
</style>
