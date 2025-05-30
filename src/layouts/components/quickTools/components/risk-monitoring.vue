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
  initialForm: { status: 1 }
})
onSuccess((res) => {
  const { data } = res
  console.log(data)
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  if (initData.value) {
    const { status } = initData.value
    updateForm({ status })
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
    title="风险监测"
    unmount-on-close
    title-align="start"
    :width="600"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-form ref="formRef" :model="form" auto-label-width>
      <a-form-item label="监测开关" field="status" :rules="[{ required: true, message: '请选择状态' }]">
        <a-radio-group v-model="form.status">
          <a-radio :value="1">开启</a-radio>
          <a-radio :value="0">关闭</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-alert>数字人如果开启监测会根据最新的漏洞信息识别资产的安全情况进行预警。监测执行情况和结果在定时任务中可以查看。</a-alert>
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
