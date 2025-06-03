<script lang="ts" setup>
import { usePaginationFront } from '@/hooks/usePaginationAlova'
import SaveModal from './components/save-modal.vue'
import http from '@/request'
import { confirmModal } from '@/utils/modal'

interface SearchFormProps {
  name?: string
}
const initSearchForm: SearchFormProps = {
  name: void 0
}
const formData = reactive({ ...initSearchForm })
const userStore = useUserStore()

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationFront(
  (params: any) => http.Get('/model/select', params),
  formData,
  (data) => data.data
)
watch(taleData, (newVal) => {
  userStore.setChatModelList(newVal)
  // 查找当前模型的配置
  const model = userStore.chatModelList.find((item: any) => item.id === userStore.chatModel.id)
  // 如果列表中没有模型，则设置默认第一个模型
  if (userStore.chatModelList.length > 0 && !model) {
    userStore.setChatModel(userStore.chatModelList[0])
  }
  // 如果已经配置了 更新模型信息
  if (model) {
    userStore.setChatModel(model)
  }
})
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

const saveModalRef = ref<InstanceType<typeof SaveModal>>()

const deleteModel = async (id: any) => {
  await confirmModal('提示', '确定删除该模型吗？')
  http.Delete(`/model/delete/${id}`).then(() => {
    loadData()
  })
}
onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page title="模型配置">
    <SaveModal ref="saveModalRef" @upload="resetForm" />
    <template #action>
      <a-button type="primary" @click="saveModalRef?.openModal()"> 新增 </a-button>
    </template>
    <template #top></template>
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
        <a-table-column title="模型名称" data-index="model_name" :width="240" ellipsis tooltip />
        <a-table-column title="类型" data-index="function_name" :width="180" ellipsis tooltip />
        <a-table-column title="地址" data-index="url" ellipsis tooltip></a-table-column>
        <a-table-column title="API Key" data-index="key" ellipsis tooltip />
        <a-table-column title="最大输入长度" data-index="max_len_input" ellipsis tooltip />
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="120">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="saveModalRef?.openModal(record)"> 编辑 </a-link>
              <a-link @click="deleteModel(record.id)"> 删除 </a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
