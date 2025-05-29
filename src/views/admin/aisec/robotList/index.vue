<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import EditModal from './components/edit-modal.vue'
import DockingModal from './components/docking-modal.vue'
import http from '@/request'
import { Message } from '@arco-design/web-vue'

interface SearchFormProps {
  keywords?: string
}
const initSearchForm: SearchFormProps = {
  keywords: void 0
}
const formData = reactive({ ...initSearchForm })
const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/robot/page', params), formData)
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

const editModalRef = ref<InstanceType<typeof EditModal>>()
const dockingModalRef = ref<InstanceType<typeof DockingModal>>()

const changeStatus = (params: any) => {
  const { id, name, avatar, logo, useScene, prolog, abilityList, sort, status } = params
  const list = abilityList?.map((item: any) => item.id) || []
  http.Post('/robot/createOrUpdate', { id, name, avatar, logo, useScene, prolog, abiltyList: list, sort, status }).then(() => {
    Message.success('操作成功')
    loadData()
  })
}

onMounted(() => {
  loadData(true)
})
</script>

<template>
  <Page>
    <EditModal ref="editModalRef" @upload="loadData()" />
    <DockingModal ref="dockingModalRef" @upload="resetForm" />
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
        <a-table-column title="数字人名称" data-index="name" ellipsis tooltip :width="160" />
        <a-table-column title="形象" data-index="avatar" ellipsis tooltip :width="80">
          <template #cell="{ record: { avatar } }">
            <SvgIcon :name="`robot-${avatar}`" size="40" />
          </template>
        </a-table-column>
        <a-table-column title="使用场景" data-index="useScene" ellipsis tooltip />
        <a-table-column title="开场白" data-index="prolog" ellipsis tooltip />
        <a-table-column title="能力列表" data-index="abilityList" ellipsis tooltip :width="360">
          <template #cell="{ record: { abilityList } }">
            <a-space wrap>
              <a-tag v-for="ability in abilityList" :key="ability.id" color="blue">
                {{ ability.name }}
              </a-tag>
            </a-space>
          </template>
        </a-table-column>
        <a-table-column title="排序" data-index="sortNo" ellipsis tooltip :width="80" />
        <a-table-column title="状态" data-index="status" ellipsis tooltip :width="80">
          <template #cell="{ record }">
            <a-switch v-model="record.status" :checked-value="1" :unchecked-value="0" @change="changeStatus(record)" />
          </template>
        </a-table-column>
        <a-table-column title="操作" fixed="right" data-index="opt" ellipsis tooltip :width="80">
          <template #cell="{ record }">
            <a-space>
              <a-link @click="editModalRef?.openModal(record)"> 编辑 </a-link>
              <!-- <a-link disabled @click="dockingModalRef?.openModal(record)"> 对接 </a-link>
              <a-link disabled> 删除 </a-link> -->
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
