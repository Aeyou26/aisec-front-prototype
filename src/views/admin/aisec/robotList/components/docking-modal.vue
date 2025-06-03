<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/assets/synchronous', formData), {
  initialForm: { id: '', address: '', type: '', key: '', cycle: '' }
})
onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  if (initData.value) {
    const { id, address, type, key, cycle } = initData.value
    updateForm({ id, address, type, key, cycle })
  }
}

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
  <a-modal v-model:visible="visible" title="对接" title-align="start" :width="680" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <div>网站接入</div>
      <a-form-item label="将以下iframe嵌入您的网站处于所需位置" field="address" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model="form.address" placeholder="请输入" />
      </a-form-item>
      <div>后台接入</div>
      <a-form-item label="接口文档" field="address" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model="form.address" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="数字人id" field="key" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model="form.key" placeholder="请输入" />
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
