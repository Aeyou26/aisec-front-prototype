<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/user/report/create', formData), {
  initialForm: { robotId: '', typeId: '' }
})
const templateType = [
  { label: '日报', value: '1' },
  { label: '周报', value: '2' },
  { label: '月报', value: '3' },
  { label: '季报', value: '4' },
  { label: '年报', value: '5' }
]
onSuccess((res) => {
  const { data } = res
  console.log(data)
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  if (initData.value) {
    const { robotId } = initData.value
    updateForm({ robotId })
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
    title="资产报告"
    unmount-on-close
    title-align="start"
    :width="400"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="模板类型" field="typeId" :rules="[{ required: true, message: '请选择模板类型' }]">
        <a-select v-model="form.typeId" :options="templateType" allow-clear placeholder="请选择" />
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
