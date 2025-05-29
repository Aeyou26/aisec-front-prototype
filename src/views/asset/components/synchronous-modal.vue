<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/user/asset/createSyncConf', formData), {
  initialForm: { addr: '', type: '', key: '', cycle: 1 }
})
onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  request.Get('/sys/getConf', { params: { key: 'sync_asset_conf_key' } }).then((res: any) => {
    if (res.data) {
      updateForm(res.data)
    }
  })
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
  <a-modal v-model:visible="visible" title="同步资产" title-align="start" :width="680" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="类型" field="type" :rules="[{ required: true, message: '请选择类型' }]">
        <a-select v-model="form.type" placeholder="请选择类型">
          <a-option value="app"> 应用系统 </a-option>
          <a-option value="server"> 服务器 </a-option>
          <a-option value="database"> 数据库 </a-option>
          <a-option value="terminal"> 终端设备 </a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="地址" field="addr" :rules="[{ required: true, message: '请输入地址' }]">
        <a-input v-model="form.addr" placeholder="请输入地址" />
      </a-form-item>
      <a-form-item label="密钥" field="key" :rules="[{ required: true, message: '请输入密钥' }]">
        <a-input v-model="form.key" placeholder="请输入密钥" />
      </a-form-item>
      <a-form-item label="周期" field="cycle" :rules="[{ required: true, message: '请选择周期' }]">
        <a-select v-model="form.cycle" placeholder="请选择周期">
          <a-option :value="1"> 1小时 </a-option>
        </a-select>
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
