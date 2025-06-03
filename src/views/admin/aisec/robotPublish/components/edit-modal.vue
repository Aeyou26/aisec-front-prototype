<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import AddModal from './add-modal.vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const addModalRef = ref<InstanceType<typeof AddModal>>()
const emit = defineEmits(['upload'])
const userStore = useUserStore()
const dataLoading = ref(false)
// 引导文本相关
const guideTextList = ref<{ id: number; text: string }[]>([])
// 知识库相关
const knowledgeBaseList = ref<{ id: number; name: string }[]>([])
const selectedKnowledgeBaseList = ref<{ id: number; name: string; description?: string }[]>([])
const { form, send, loading, updateForm, onSuccess, reset } = useForm(
  (formData) => {
    const params: any = { ...formData }
    params.guideProblemList = guideTextList.value?.map((item) => item.text)
    const kList = selectedKnowledgeBaseList.value.map((item) => ({ id: item.id, description: item.description, knowledgeName: item.name }))
    params.knowledgeEntities = kList
    return request.Post('/digital/human/save', params)
  },
  {
    initialForm: {
      id: '',
      guideProblemList: [],
      description: '',
      knowledgeEntities: [],
      logo: '',
      modelId: '',
      name: '',
      sortNo: 0,
      prologue: '',
      roleDesc: ''
    }
  }
)
const isPreview = ref(false)
const isPublish = ref(false)
onSuccess(() => {
  if (isPublish.value) {
    isPublish.value = false
    request.Get(`/digital/human/release/${form.value.id}`).then(() => {
      Message.success('发布成功')
      emit('upload')
      onClose()
    })
  } else {
    emit('upload')
    Message.success('操作成功')
    onClose()
  }
})
const modelList = computed(() => {
  return userStore.chatModelList
})

const newGuideText = ref('')
const isEditingGuideText = ref(false)
const currentEditId = ref<number | null>(null)
const showGuideTextInput = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// 显示添加输入框
function showAddGuideText() {
  showGuideTextInput.value = true
  isEditingGuideText.value = false
  newGuideText.value = ''
  currentEditId.value = null
  // 使用nextTick确保DOM已更新后再聚焦
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 添加引导文本
function addGuideText() {
  if (!newGuideText.value.trim()) {
    return
  }

  const maxId = guideTextList.value.length ? Math.max(...guideTextList.value.map((item) => item.id)) : 0
  const newItem = {
    id: maxId + 1,
    text: newGuideText.value
  }
  // 将新添加的条目插入到数组的最前面
  guideTextList.value.unshift(newItem)
  newGuideText.value = ''
  showGuideTextInput.value = false
}

// 开始编辑引导文本
function startEditGuideText(id: number) {
  const item = guideTextList.value.find((item) => item.id === id)
  if (item) {
    showGuideTextInput.value = true
    isEditingGuideText.value = true
    currentEditId.value = id
    newGuideText.value = item.text
    // 使用nextTick确保DOM已更新后再聚焦
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

// 保存编辑的引导文本
function saveEditGuideText() {
  if (!newGuideText.value.trim() || currentEditId.value === null) {
    return
  }

  const index = guideTextList.value.findIndex((item) => item.id === currentEditId.value)
  if (index !== -1) {
    guideTextList.value[index].text = newGuideText.value
    cancelEditGuideText()
  }
}

// 取消编辑引导文本
function cancelEditGuideText() {
  isEditingGuideText.value = false
  currentEditId.value = null
  newGuideText.value = ''
  showGuideTextInput.value = false
}

// 删除引导文本
function deleteGuideText(id: number) {
  // 检查是否正在编辑被删除的条目
  if (isEditingGuideText.value && currentEditId.value === id) {
    // 重置编辑状态
    isEditingGuideText.value = false
    currentEditId.value = null
    newGuideText.value = ''
    showGuideTextInput.value = false
  }
  guideTextList.value = guideTextList.value.filter((item) => item.id !== id)
}

const getKnowledgeList = () => {
  request.Get<any>('/knowledge/select').then((res) => {
    knowledgeBaseList.value = res.data.filter((item: any) => !selectedKnowledgeBaseList.value.some((selected) => selected.id === item.id))
  })
}
// 添加知识库
function handleSelect(value: any) {
  const selected = knowledgeBaseList.value.find((item) => item.name === value)
  if (selected) {
    selectedKnowledgeBaseList.value.push(selected)
    // 从下拉列表中移除已选择的知识库
    knowledgeBaseList.value = knowledgeBaseList.value.filter((item) => item.id !== selected.id)
  }
}

// 删除知识库
function deleteKnowledgeBase(id: number) {
  const removed = selectedKnowledgeBaseList.value.find((item) => item.id === id)
  if (removed) {
    // 将删除的知识库放回下拉列表
    knowledgeBaseList.value.push(removed)
    selectedKnowledgeBaseList.value = selectedKnowledgeBaseList.value.filter((item) => item.id !== id)
  }
}

function onBeforeOpen() {
  getKnowledgeList()
  if (initData.value) {
    dataLoading.value = true
    request
      .Get<any>(`/digital/human/info/${initData.value.id}`)
      .then((res) => {
        const { id, guideProblemList, description, knowledgeEntities, logo, modelId, name, sortNo, prologue, roleDesc } = res.data
        updateForm({
          id,
          guideProblemList: guideProblemList || [],
          description,
          knowledgeEntities: knowledgeEntities || [],
          logo,
          modelId,
          name,
          sortNo: sortNo || 0,
          prologue,
          roleDesc
        })
        // 初始化引导文本
        guideTextList.value = form.value.guideProblemList.map((item: any, index: number) => ({ id: index + 1, text: item }))
        // 初始化知识库
        selectedKnowledgeBaseList.value = form.value.knowledgeEntities.map((item: any) => ({ id: item.id, name: item.knowledgeName, description: item.description }))
        knowledgeBaseList.value = knowledgeBaseList.value.filter((item) => !selectedKnowledgeBaseList.value.some((selected) => selected.id === item.id))
      })
      .finally(() => {
        dataLoading.value = false
      })
  }
}

function onClose() {
  formRef.value?.resetFields()
  isPreview.value = false
  guideTextList.value = []
  selectedKnowledgeBaseList.value = []
  reset()
  closeModal()
}

async function onSave() {
  const result = await formRef.value?.validate()
  !result && send()
}
async function onSubmit() {
  isPublish.value = true
  // 先保存再发布
  onSave()
}

function handleLogoClick() {
  const { id, name, logo, description } = initData.value
  addModalRef.value?.openModal({
    id,
    name,
    logo,
    description
  })
}

function onUpload(data: any) {
  const { id, name, logo, description } = data
  initData.value = {
    ...initData.value,
    id,
    name,
    logo,
    description
  }
  updateForm({
    id,
    name,
    logo,
    description
  })
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="编辑" title-align="start" :width="1340" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <AddModal ref="addModalRef" @upload="onUpload" />
    <a-spin :loading="dataLoading" :tip="dataLoading ? '加载中...' : ''" class="h-full w-full">
      <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
        <div class="flex border-1 border-solid border-#2E66C7 rounded-14">
          <div class="w-476 m-20 mr-0 pr-20 overflow-y-auto max-h-62vh">
            <div class="flex justify-between items-center mb-12">
              <div class="flex items-center gap-12 cursor-pointer" @click="handleLogoClick">
                <img v-if="form.logo" :src="`/api/sys/download?fileName=${form.logo}`" class="w-24 h-24" />
                <span class="text-16 text-#2E66C7">{{ form.name }}</span>
              </div>
              <a-form-item label="" field="sortNo" class="!w-182 !mb-0">
                <div class="flex items-center gap-12">
                  <span class="text-14 text-#333333">数字人排序</span>
                  <div class="w-100">
                    <a-input-number v-model="form.sortNo" :min="0" :max="999" placeholder="请输入" />
                  </div>
                </div>
              </a-form-item>
            </div>
            <a-form-item label="模型配置" field="modelId" :rules="{ required: true, message: '请选择模型' }">
              <a-select v-model="form.modelId" placeholder="请选择">
                <a-option v-for="item in modelList" :key="item.id" :value="String(item.id)">{{ item.model_name }}</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="角色设定" field="roleDesc" :rules="{ required: true, message: '请输入角色设定' }">
              <template #label>
                <div class="flex items-center w-446 justify-between">
                  <span class="text-14 text-#333333">角色设定</span>
                  <!-- <SvgIcon name="ai-tip" :size="18" class="cursor-pointer" /> -->
                </div>
              </template>
              <div class="flex w-full flex-col gap-12">
                <a-textarea
                  v-model="form.roleDesc"
                  :auto-size="{
                    minRows: 4,
                    maxRows: 4
                  }"
                  :max-length="5000"
                  show-word-limit
                  placeholder="描述你想让数字人做什么，例如：你是一个经验丰富的网络安全专家，能够给用户提供高质量的安全处理方案。"
                />
                <!-- <div class="text-14 text-#999999 flex items-center gap-8">
                  <span>精选提示词</span>
                  <div v-for="item in 5" :key="item" class="border-1 border-solid border-#2E66C7 rounded-4 px-6 py-2 cursor-pointer text-12 text-#2E66C7">知识问答</div>
                </div> -->
              </div>
            </a-form-item>
            <a-form-item label="开场白" field="prologue" :rules="{ required: true, message: '请输入开场白' }">
              <template #label>
                <div class="flex items-center w-446 justify-between">
                  <span class="text-14 text-#333333">开场白</span>
                  <!-- <SvgIcon name="ai-tip" :size="18" class="cursor-pointer" /> -->
                </div>
              </template>
              <div class="flex w-full flex-col gap-12">
                <a-textarea
                  v-model="form.prologue"
                  :auto-size="{
                    minRows: 4,
                    maxRows: 4
                  }"
                  :max-length="200"
                  show-word-limit
                  placeholder="输入数字人初次对话时的欢迎语，帮助引导用户快速了解数字人角色和功能。"
                />
                <div class="text-14 text-#999999 flex flex-col items-center gap-8">
                  <div v-if="showGuideTextInput" class="flex w-full">
                    <a-input
                      ref="inputRef"
                      v-model="newGuideText"
                      placeholder="请输入引导文本"
                      allow-clear
                      class="flex-1"
                      @keyup.enter="isEditingGuideText ? saveEditGuideText() : addGuideText()"
                      @blur="isEditingGuideText ? saveEditGuideText() : newGuideText.trim() ? addGuideText() : void 0"
                    >
                      <template #append>
                        <a-space>
                          <a-link @click="isEditingGuideText ? saveEditGuideText() : addGuideText()">
                            {{ isEditingGuideText ? '保存' : '添加' }}
                          </a-link>
                          <a-link class="!text-#999999" @click="cancelEditGuideText"> 取消 </a-link>
                        </a-space>
                      </template>
                    </a-input>
                  </div>
                  <div
                    v-else-if="guideTextList.length < 5"
                    class="flex items-center justify-center w-full h-30 border-1 border-solid border-#2E66C780 rounded-4 cursor-pointer"
                    @click="showAddGuideText"
                  >
                    <a-space><icon-plus color="#2E66C7" /> 添加引导文本</a-space>
                  </div>
                  <div
                    v-for="item in guideTextList"
                    :key="item.id"
                    class="bg-#2e66c70f w-full h-30 rounded-4 px-14 py-6 cursor-pointer text-12 text-#2E66C7 flex justify-between"
                  >
                    <div class="truncate">
                      {{ item.text }}
                    </div>
                    <div class="flex items-center gap-8">
                      <icon-edit color="#2E66C7" @click="startEditGuideText(item.id)" />
                      <icon-delete color="#DE1E1E" @click="deleteGuideText(item.id)" />
                    </div>
                  </div>
                </div>
              </div>
            </a-form-item>
          </div>
          <div class="w-336 p-20 overflow-y-auto max-h-[calc(62vh+40px)] border-1 border-solid border-#2E66C7 border-t-0 border-b-0">
            <a-tabs default-active-key="1">
              <a-tab-pane key="1" title="知识库">
                <div class="flex flex-col gap-12">
                  <a-dropdown v-if="knowledgeBaseList.length" @select="handleSelect">
                    <div class="flex items-center justify-center w-full h-30 border-1 border-solid border-#2E66C780 rounded-4 cursor-pointer">
                      <icon-plus color="#2E66C7" />
                    </div>
                    <template #content>
                      <a-doption v-for="item in knowledgeBaseList" :key="item.id" :value="item.name">{{ item.name }}</a-doption>
                    </template>
                  </a-dropdown>
                  <div
                    v-for="item in selectedKnowledgeBaseList"
                    :key="item.id"
                    class="bg-#2e66c70f w-full h-30 rounded-4 px-14 py-6 cursor-pointer text-12 text-#2E66C7 flex justify-between"
                  >
                    <div class="truncate">{{ item.name }}</div>
                    <icon-delete color="#DE1E1E" @click="deleteKnowledgeBase(item.id)" />
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
          <div class="flex-1 p-20 overflow-y-auto max-h-[calc(62vh+40px)] bg-#f2f5fc rounded-14">
            <template v-if="!isPreview">
              <div class="flex flex-col gap-12 items-center">
                <div class="text-18 text-#333333 font-bold text-center">数字人预览</div>
                <SvgIcon name="robot-zc" :size="240" class="cursor-pointer mt-80" />
                <div class="text-18 text-#2E66C7 font-bold mt-20">配置中...</div>
                <div class="text-14 text-#999999">配置完成后，请点击下方按钮进行预览</div>
                <a-button type="primary" class="!h-48 !w-210 !bg-#2E66C7 mt-20" @click="isPreview = true"> 预览 </a-button>
              </div>
            </template>
            <div v-else class="relative h-full">
              <div class="flex flex-col gap-12">
                <div class="text-18 text-#333333 font-bold text-center">数字人预览</div>
                <div class="assistant-message">
                  {{
                    form.prologue ||
                    '您好！我是专业文本扩写专家，擅长将简短概要或内容拓展为详尽、生动且风格一致的完整文本。无论你需要学术、商业还是创意文本的扩写，我都能帮助你实现。请告诉我你需要扩写的原始文本和具体需求，我将竭诚为你服务。'
                  }}
                </div>
                <div v-if="guideTextList.length" class="flex flex-col gap-8">
                  <div
                    v-for="(option, index) in guideTextList"
                    :key="index"
                    style="box-shadow: 0 8px 40px 0 #00266914"
                    class="bg-#ffffff text-[#333] w-max px-12 py-8 flex items-center gap-10 rounded-10 cursor-pointer hover:bg-[#E5E6EB]"
                  >
                    {{ option.text }}
                    <SvgIcon name="right-arrow" :size="16" class="cursor-pointer" />
                  </div>
                </div>
              </div>
              <div class="w-full bg-#ffffff rounded-20 flex flex-col gap-6 pt-8 absolute bottom-0 left-0" style="box-shadow: 0 8px 40px 0 #00266914">
                <textarea
                  class="w-full h-52 px-16 text-16 resize-none outline-none border-none bg-#ffffff rounded-20 whitespace-pre-wrap overflow-y-auto leading-28"
                  disabled
                  placeholder="数字人对话样式预览，暂不可输入"
                ></textarea>
                <div class="w-full flex justify-end items-center gap-12 px-16 pb-8">
                  <div class="flex items-center gap-12">
                    <a-button type="primary" shape="circle" class="text-white !rounded-full !w-24 !h-24">
                      <icon-arrow-up size="18" />
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-form>
    </a-spin>
    <template #footer>
      <a-space>
        <a-button @click="onClose()"> 取消 </a-button>
        <a-button :loading="loading" @click="onSave()"> 保存 </a-button>
        <a-button type="primary" @click="onSubmit()"> 发布 </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style lang="less" scoped>
:deep(.arco-form-item-label) {
  display: flex;
  align-items: center;
}

.assistant-message {
  border-radius: 0 10px 10px;
  background: #fff;
  box-shadow: 0 8px 40px 0 #00266914;
  padding: 14px 16px;
  word-break: break-all;
}
</style>
