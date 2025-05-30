<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import { useUniversalChatStore } from '@/store'
import request from '@/request'

const props = defineProps({
  local: {
    type: Boolean,
    default: false
  }
})
const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const chatStore = useChatStore()
const robotId = computed(() => chatStore.currentInfo.robotId)
const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/user/chat/createOrUpdate', formData), {
  initialForm: {
    id: '',
    sessionName: '',
    robotId: ''
  }
})
onSuccess(() => {
  chatStore.updateChatData({ chatSessionTitle: { id: form.value.id, name: form.value.sessionName, updateTime: new Date().getTime() } })
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  if (initData.value && !props.local) {
    const { content, id } = initData.value
    updateForm({ sessionName: content, id, robotId: robotId.value.toString() })
  }
}

function onClose() {
  formRef.value?.resetFields()
  reset()
  closeModal()
}
const universalChatStore = useUniversalChatStore()
async function onSubmit() {
  const result = await formRef.value?.validate()
  if (props.local) {
    // 从universalChatStore.chatHistoryList 中找到对应的会话，并更新会话名称
    const index = universalChatStore.keyChatHistoryList[universalChatStore.visitKey].findIndex((item) => item.id === initData.value.id)
    if (index !== -1) {
      universalChatStore.keyChatHistoryList[universalChatStore.visitKey][index].name = form.value.sessionName
    }
    onClose()
    return
  }
  !result && send()
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="编辑会话名称" title-align="start" :width="480" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" :model="form" layout="vertical" auto-label-width>
      <a-form-item label="会话名称" field="sessionName" :rules="[{ required: true, message: '请输入会话名称' }]">
        <a-input v-model="form.sessionName" :max-length="30" show-word-limit placeholder="请输入会话名称" />
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
