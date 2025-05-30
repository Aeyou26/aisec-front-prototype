<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/tool/use', formData), {
  initialForm: { hid: '7', params: '', toolName: '' }
})
const options = [{ label: 'nmap', value: 'nmap', info: 'nmap 是一款网络扫描工具，可以扫描目标主机的开放端口、服务等信息。' }]
onSuccess((res) => {
  const { data } = res
  console.log(data)
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  if (initData.value) {
    const { params, toolName } = initData.value
    updateForm({ params, toolName })
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
    title="信息收集"
    unmount-on-close
    title-align="start"
    :width="600"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="收集目标" field="params" :rules="[{ required: true, message: '请输入收集目标' }]">
        <a-input v-model="form.params" placeholder="请输入收集目标" />
      </a-form-item>
      <a-form-item label="收集工具" field="toolName" :rules="[{ required: true, message: '请选择收集工具' }]">
        <a-select v-model="form.toolName" :options="options" allow-clear placeholder="请选择" />
      </a-form-item>
      <!-- 显示选中工具的说明信息。 -->
      <a-alert>{{ options.find((item) => item.value === form.toolName)?.info || '请选择工具' }}</a-alert>
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
