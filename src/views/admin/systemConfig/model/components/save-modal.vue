<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const { form, send, loading, updateForm, onSuccess, reset } = useForm(
  (formData) => {
    if (initData.value) {
      return request.Put('/model/modify', formData)
    }
    return request.Post('/model/create', formData)
  },
  {
    initialForm: { id: '', modelName: '', functionName: '', maxLenInput: '', url: '', key: '' }
  }
)
const options = ref<any[]>([
  {
    label: 'Ollama',
    value: 'ollama_chat'
  },
  {
    label: 'LM Studio',
    value: 'lm_studio_chat'
  }
])
onSuccess((res: any) => {
  const { data } = res
  console.log(data)
  emit('upload')
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  if (initData.value) {
    const { id, model_name, function_name, max_len_input, url, key } = initData.value
    updateForm({ id, modelName: model_name, functionName: function_name, maxLenInput: max_len_input, url, key })
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
    :title="initData ? '编辑模型' : '新增模型'"
    unmount-on-close
    title-align="start"
    :width="680"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="模型名称" field="modelName" :rules="[{ required: true, message: '请输入模型名称' }]">
        <a-input v-model="form.modelName" placeholder="请输入模型名称" />
      </a-form-item>
      <a-form-item label="类型" field="functionName" :rules="[{ required: true, message: '请选择类型' }]">
        <a-select v-model="form.functionName" :options="options" placeholder="请选择类型"></a-select>
      </a-form-item>
      <a-form-item label="访问地址" field="url" :rules="[{ required: true, message: '请输入访问地址' }]">
        <a-input v-model="form.url" placeholder="请输入访问地址" />
      </a-form-item>
      <a-form-item label="API Key" field="key">
        <a-input v-model="form.key" placeholder="请输入密钥" />
      </a-form-item>
      <a-form-item label="最大输入长度" field="maxLenInput" :rules="[{ required: true, message: '请输入最大输入长度' }]">
        <a-input-number v-model="form.maxLenInput" :min="1" placeholder="请输入最大输入长度" />
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
