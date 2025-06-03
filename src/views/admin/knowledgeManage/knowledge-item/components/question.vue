<script lang="ts" setup>
import usePaginationAlova from '@/hooks/usePaginationAlova'
import http from '@/request'

interface SearchFormProps {
  keywords?: string
}
const initSearchForm: SearchFormProps = {
  keywords: void 0
}
const formData = reactive({ ...initSearchForm })

const { pagination, loading, onPageChange, onPageSizeChange, loadData } = usePaginationAlova((params: any) => http.Post('/user/asset/page', params), formData)
function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}

const taleData = ref<any>([
  {
    name: '文件1',
    createTime: '2023-01-01 12:12:12',
    size: '1024Kb',
    type: 'file',
    knowledgeBase: '知识库1',
    id: 11
  },
  {
    name: '文件2',
    createTime: '2023-01-01 12:12:12',
    size: '1024Kb',
    type: 'folder',
    knowledgeBase: '知识库1',
    id: 1
  }
])

const tab = ref<any>([
  {
    name: '主文件夹',
    id: 0
  }
])

onMounted(() => {
  loadData(true)
})

const jumpFolder = (item: any) => {
  console.log(item)
  const data = {
    name: '文件夹1',
    id: 2
  }
  tab.value.push(data)
  taleData.value = [
    {
      name: '文件2级',
      createTime: '2023-01-01 12:12:12',
      size: '1024Kb',
      type: 'file',
      knowledgeBase: '知识库1',
      id: 11
    },
    {
      name: '文件2级2',
      createTime: '2023-01-01 12:12:12',
      size: '1024Kb',
      type: 'file',
      knowledgeBase: '知识库1',
      id: 1
    }
  ]
  console.log('tab', tab.value)
}

const jumpCatalogue = (index: any) => {
  console.log(index)
  tab.value.splice(index + 1, tab.value.length - 1)
  console.log('tab2222', tab.value)
  if (index === 0) {
    taleData.value = [
      {
        name: '文件1',
        createTime: '2023-01-01 12:12:12',
        size: '1024Kb',
        type: 'file',
        knowledgeBase: '知识库1',
        id: 11
      },
      {
        name: '文件夹1',
        createTime: '2023-01-01 12:12:12',
        size: '1024Kb',
        type: 'folder',
        knowledgeBase: '知识库1',
        id: 1
      }
    ]
  }
}
</script>

<template>
  <Page>
    <template #action>
      <div class="flex align-center">
        <a-button type="primary" class="mr-20"> 创建问题 </a-button>
        <a-button type="outline" status="danger" class="mr-20">批量删除</a-button>
        <div v-for="(item, index) in tab" :key="item.id" class="flex items-center">
          <div v-if="tab.length >= 2" :class="index == tab.length - 1 ? '' : 'color-blue'" @click="jumpCatalogue(index)">
            {{ index > 0 ? '/' + item.name : item.name }}
          </div>
        </div>
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
        <a-table-column title="问题" data-index="size" ellipsis tooltip />
        <a-table-column title="关联分段数" data-index="size" ellipsis tooltip />
        <a-table-column title="创建时间" data-index="createTime" ellipsis tooltip />
        <a-table-column title="更新时间" data-index="createTime" ellipsis tooltip />
        <a-table-column title="操作" data-index="robots" ellipsis tooltip :width="220">
          <template #cell>
            <a-space>
              <a-link>设置</a-link>
              <a-link>迁移</a-link>
              <a-link>导出</a-link>
              <a-link status="danger">删除</a-link>
            </a-space>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </Page>
</template>
