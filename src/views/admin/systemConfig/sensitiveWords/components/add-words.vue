<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'
import { removeEmptyAttr } from '@/utils/tools'
import { encryptPassword } from '@/utils/rsa'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

const { form, send, loading, updateForm, onSuccess, reset } = useForm(
  (formData) => {
    return request.Post(
      '/sensitive/words/create',
      removeEmptyAttr({
        ...formData
      })
    )
  },
  {
    initialForm: { type: '', name: '' }
  }
)
onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})

function onBeforeOpen() {
  if (initData.value) {
    const { type, name } = initData.value
    updateForm({ type, name })
  }
}

const options = ref<any[]>([
  { label: '通用', value: '通用' },
  { label: '反动', value: '反动' },
  { label: '色情', value: '色情' },
  { label: '毒品', value: '毒品' },
  { label: '赌博', value: '赌博' }
])

function onClose() {
  formRef.value?.resetFields()
  reset()
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
  <a-modal
    v-model:visible="visible"
    :title="initData ? '编辑敏感词' : '新增敏感词'"
    title-align="start"
    :width="480"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="类型" field="type" :rules="[{ required: true, message: '请选择类型' }]" :validate-trigger="['change', 'input']">
        <a-select v-model="form.type" placeholder="请选择类型">
          <a-option v-for="item in options" :key="item.id" :value="item.value">{{ item.label }}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="敏感词" field="name" :rules="[{ required: true, message: '请输入敏感词' }]" :validate-trigger="['change', 'input']">
        <a-textarea v-model="form.name" :auto-size="{ minRows: 1, maxRows: 6 }" placeholder="请输入敏感词" />
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
