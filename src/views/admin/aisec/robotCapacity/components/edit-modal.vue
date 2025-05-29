<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const knowledgeList = ref<any[]>([])
const isBackup = ref(false)
const promptBackup = ref('')
const isShowPrompt = ref(true)

const { form, send, loading, updateForm, onSuccess, reset } = useForm(
  (formData) => {
    const params = { ...formData }
    if (formData.prompt === promptBackup.value) {
      params.prompt = ''
    }
    return request.Post('/ability/createOrUpdate', params)
  },
  {
    initialForm: { id: '', name: '', useScene: '', prolog: '', prompt: '', inputPrompt: '', knowledgeList: [] }
  }
)
onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})
const getKnowledgeList = () => {
  request.Get<any>('/knowledge/select').then((res) => {
    knowledgeList.value = res.data
  })
}
function onBeforeOpen() {
  getKnowledgeList()
  if (initData.value) {
    request.Get<any>(`/ability/${initData.value.id}`).then((res) => {
      if (res.data.prompt) {
        const {
          prompt: { is_backup, prompt }
        } = res.data
        isBackup.value = is_backup
        promptBackup.value = prompt
        updateForm({ prompt })
      } else {
        isShowPrompt.value = false
      }
    })
    const { id, name, useScene, prolog, inputPrompt, knowledgeList } = initData.value
    const list = knowledgeList?.map((item: any) => item.id) || []
    updateForm({ id, name, useScene, prolog, inputPrompt, knowledgeList: list })
  }
}
function resetPrompt() {
  request.Put<any>(`/ability/prompt/recover/${initData.value.id}`).then((res) => {
    if (res?.data?.prompt) {
      form.value.prompt = res.data.prompt
    }
  })
}
function onClose() {
  formRef.value?.resetFields()
  reset()
  isShowPrompt.value = true
  isBackup.value = false
  promptBackup.value = ''
  closeModal()
}

async function onSubmit() {
  const result = await formRef.value?.validate()
  !result && send()
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="编辑" title-align="start" :width="680" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="能力名称" field="name" :rules="[{ required: true, message: '请输入名称' }]">
        <a-input v-model="form.name" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item label="能力描述" field="useScene" :rules="[{ required: true, message: '请输入能力描述' }]">
        <a-textarea v-model="form.useScene" :auto-size="{ minRows: 2, maxRows: 5 }" placeholder="请输入能力描述" />
      </a-form-item>
      <a-form-item label="开场白" field="prolog">
        <a-textarea v-model="form.prolog" :auto-size="{ minRows: 2, maxRows: 5 }" placeholder="请输入开场白" />
      </a-form-item>
      <a-form-item label="输入框提示词（可选）" field="inputPrompt">
        <a-input v-model="form.inputPrompt" placeholder="请输入输入框提示词" />
      </a-form-item>
      <a-form-item label="关联知识库" field="knowledgeList">
        <a-select v-model="form.knowledgeList" :field-names="{ label: 'name', value: 'id' }" multiple placeholder="请选择知识库" :options="knowledgeList" />
      </a-form-item>
      <a-form-item v-if="isShowPrompt" label="AI提示词" field="prompt">
        <template #label>
          <div class="flex items-center w-full justify-between gap-16">
            AI提示词
            <a-tooltip content="点击重置按钮，将提示词恢复为初始状态">
              <a-link v-if="isBackup" class="!text-14" @click="resetPrompt">重置</a-link>
            </a-tooltip>
          </div>
        </template>
        <a-textarea v-model="form.prompt" :auto-size="{ minRows: 8, maxRows: 16 }" placeholder="请输入提示词" />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="onClose()"> 取消 </a-button>
        <a-button type="primary" :loading="loading" @click="onSubmit()"> 确定 </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style lang="less" scoped></style>
