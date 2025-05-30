<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/test', formData), {
  initialForm: { text: '' }
})
onSuccess((res) => {
  const { data } = res
  console.log(data)
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  if (initData.value) {
    const { text } = initData.value
    updateForm({ text })
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
  <a-modal
    v-model:visible="visible"
    title="分类分级"
    unmount-on-close
    title-align="start"
    :width="600"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-form ref="formRef" :model="form" auto-label-width>
      <a-form-item label="文本内容" field="text" :rules="[{ required: true, message: '请输入文本内容' }]">
        <a-textarea v-model="form.text" :auto-size="{ minRows: 4, maxRows: 10 }" placeholder="请输入文本内容" />
      </a-form-item>
      <a-alert>操作记录会记录在数据列表中</a-alert>
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
