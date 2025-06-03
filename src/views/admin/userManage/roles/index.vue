<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import SaveModal from './components/save-modal.vue'
import http from '@/request'
import { confirmModal } from '@/utils/modal'
import { Message } from '@arco-design/web-vue'

interface SearchFormProps {
  name?: string
}
const initSearchForm: SearchFormProps = {
  name: void 0
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/role/page', params), formData)
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

const saveModalRef = ref<InstanceType<typeof SaveModal>>()
const handleDelete = async (record: any) => {
  await confirmModal('删除确认', '您确定要删除角色吗？')
  http.Delete(`/role?roleId=${record.id}`).then(() => {
    Message.success('删除成功')
    loadData()
  })
}
onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page title="角色管理">
    <SaveModal ref="saveModalRef" @upload="resetForm" />
    <template #action>
      <a-button type="primary" @click="saveModalRef?.openModal()"> 新增 </a-button>
    </template>
    <template #top>
      <!-- <div class="flex items-center gap-20">
        <a-input v-model:model-value="formData.name" class="!w-340" placeholder="请输入">
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <a-button type="primary" @click="loadData(true)"> 搜索 </a-button>
      </div> -->
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
        <a-table-column title="角色名称" data-index="name" ellipsis tooltip :width="260" />
        <a-table-column title="数字人" data-index="bot" ellipsis tooltip>
          <template #cell="{ record: { robotList } }">
            <a-space wrap>
              <a-tag v-for="item in robotList" :key="item" color="blue">{{ item.name }}</a-tag>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="140">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="saveModalRef?.openModal(record)"> 编辑 </a-link>
              <a-link @click="handleDelete(record)"> 删除 </a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
