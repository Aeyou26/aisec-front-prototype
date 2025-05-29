<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import EditModal from './components/edit-modal.vue'
import http from '@/request'

interface SearchFormProps {
  keywords?: string
}
const initSearchForm: SearchFormProps = {
  keywords: void 0
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/ability/page', params), formData)
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}
const userStore = useUserStore()
const robotList = computed(() => userStore.robotList)

const editModalRef = ref<InstanceType<typeof EditModal>>()

onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page>
    <EditModal ref="editModalRef" @upload="loadData()" />
    <template #action>
      <div></div>
    </template>
    <template #top>
      <div class="flex items-center gap-20">
        <a-input v-model:model-value="formData.keywords" class="!w-340" allow-clear placeholder="请输入">
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <a-button type="primary" @click="loadData(true)"> 搜索 </a-button>
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
        <a-table-column title="能力名称" data-index="name" ellipsis tooltip />
        <a-table-column title="能力描述" data-index="useScene" ellipsis tooltip />
        <a-table-column title="开场白" data-index="prolog" ellipsis tooltip />
        <a-table-column title="输入框提示词" data-index="inputPrompt" ellipsis tooltip />
        <a-table-column title="数字人" data-index="robotName" ellipsis tooltip :width="150" />
        <a-table-column title="状态" data-index="status" ellipsis tooltip :width="80">
          <template #cell="{ record: { status } }">
            <div>
              <span :class="status === 1 ? 'text-green-500' : 'text-red-500'">{{ status === 1 ? '启用' : '禁用' }}</span>
            </div>
          </template>
        </a-table-column>
        <a-table-column title="关联知识库" data-index="knowledgeList" ellipsis tooltip :width="180">
          <template #cell="{ record: { knowledgeList } }">
            <template v-if="knowledgeList?.length">
              <span v-for="(item, index) in knowledgeList" :key="item.id">
                {{ item.knowledgeName }}
                <template v-if="index < knowledgeList.length - 1">、</template>
              </span>
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </a-table-column>
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="80">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="editModalRef?.openModal(record)"> 编辑 </a-link>
              <!-- <a-link disabled> 删除 </a-link> -->
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
