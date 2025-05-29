<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'
import { removeEmptyAttr } from '@/utils/tools'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const userStore = useUserStore()

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/role/createOrUpdate', removeEmptyAttr(formData)), {
  initialForm: { id: '', name: '', robotList: [] }
})
onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})
const robotList = ref<any[]>([])
function onBeforeOpen() {
  if (initData.value) {
    const { id, name, robotList } = initData.value
    const list = robotList.map((item: any) => item.id)
    updateForm({ id, name, robotList: list })
  }
  getRobotList()
}
// 获取机器人列表
const getRobotList = () => {
  request.Get<any>('/robot/all').then((res) => {
    robotList.value = res.data
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
  <a-modal v-model:visible="visible" title="新增角色" title-align="start" :width="480" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="角色名称" field="name" :rules="[{ required: true, message: '请输入角色名称' }]">
        <a-input v-model="form.name" placeholder="请输入角色名称" />
      </a-form-item>
      <a-form-item label="使用数字人" field="robotList" :rules="[{ required: true, message: '请选择数字人' }]">
        <a-select v-model="form.robotList" multiple placeholder="请选择数字人">
          <a-option v-for="item in robotList" :key="item.id" :value="item.id">{{ item.name }}</a-option>
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
