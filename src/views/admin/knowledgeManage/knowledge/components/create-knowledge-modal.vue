<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

// 定义 props
const props = defineProps({
  title: {
    type: String, // 参数类型
    required: false, // 是否必传
    default: '创建知识库' // 默认值（如果未传参）
  }
})

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/knowledge/create', formData), {
  initialForm: { knowledgeName: '', description: '' }
})

onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})

function onBeforeOpen() {
  if (initData.value) {
    const { knowledgeName, description } = initData.value
    updateForm({ knowledgeName, description })
  }
}

function onClose() {
  formRef.value?.resetFields()
  reset()
  closeModal()
}

async function onSubmit() {
  const result = await formRef.value?.validate()
  if (!result) {
    if (!form.value.knowledgeName.trim()) {
      Message.error('知识库名称不允许为空')
      return
    }
    if (!form.value.description.trim()) {
      Message.error('知识库描述不允许为空')
      return
    }
  }
  !result && send()
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" :title="title" title-align="start" :width="680" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="名称" field="knowledgeName" :rules="[{ required: true, message: '请输入知识库名称' }]" :validate-trigger="['change', 'input']">
        <a-input v-model="form.knowledgeName" placeholder="请输入知识库名称" />
      </a-form-item>
      <a-form-item label="描述" field="description" :rules="[{ required: true, message: '请输入知识库描述' }]" :validate-trigger="['change', 'input']">
        <a-textarea v-model="form.description" placeholder="请输入知识库描述" auto-size />
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
