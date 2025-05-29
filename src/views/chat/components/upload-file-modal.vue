<template>
  <a-modal v-model:visible="visible" title="上传文件" title-align="start" :width="600" :mask-closable="false" @cancel="onClose(true)">
    <a-form ref="formRef" :model="form" layout="vertical" auto-label-width>
      <a-form-item label="选择文件" field="files" :limit="10" :rules="[{ required: true, message: '请选择文件' }]">
        <div class="flex flex-col gap-16">
          <a-upload
            v-model:file-list="form.files"
            action="/api/common/upload/aisec-file"
            :headers="{ Authorization: token }"
            :show-file-list="false"
            :data="data"
            @exceed-limit="onExceedLimit"
            @success="onSuccess"
          >
            <template #upload-button>
              <div class="flex items-center justify-between w-544 px-16 py-8 border-1 border-solid border-#99999933 rounded-6 text-#999999">
                <span>请选择</span>
                <component :is="useIcon('right-arrow', { width: 8, height: 12 })" />
              </div>
            </template>
          </a-upload>
          <a-space wrap>
            <a-tag v-for="tag of fileList" :key="tag.uid" closable @close="handleRemove(tag)">
              <template #icon>
                <icon-file />
              </template>
              {{ tag.name }}
            </a-tag>
          </a-space>
        </div>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="onClose(true)"> 取消 </a-button>
        <a-button type="primary" :loading="loading" @click="onSubmit()"> 确定 </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import useIcon from '@/hooks/useIcon'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()
const { token } = storeToRefs(useUserStore())

const emit = defineEmits(['uploadFile'])
const data = {
  bucket: 'aisec-file'
}
const formRef = ref<FormInstance>()
const form = ref<{
  files: any[]
}>({
  files: []
})
const fileList = ref<any[]>([])
const loading = ref(false)
const reset = () => {
  fileList.value = []
  form.value.files = []
}

const handleRemove = (tag: any) => {
  request
    .Delete('/common/delete', {
      bucket: 'aisec-file',
      fileName: tag.name
    })
    .send(true)
  // 无论后台是否删除，都删除列表
  fileList.value = fileList.value.filter((file: any) => file.uid !== tag.uid)
  form.value.files = fileList.value
}

function onExceedLimit() {
  Message.error('最多只能上传10个文件')
}

function onSuccess(data: any) {
  fileList.value.push({
    uid: Math.random().toString(36).substring(2, 15),
    type: 'file',
    name: data.response.data
  })
  form.value.files = fileList.value
}

function onClose(isReset = false) {
  // 如果关闭，则删除文件
  if (isReset) {
    fileList.value.forEach((file) => {
      request.Delete('/common/delete', {
        bucket: 'aisec-file',
        fileName: file.name
      })
    })
  }
  formRef.value?.resetFields()
  reset()
  closeModal()
}

function submit() {
  emit('uploadFile', fileList.value)
  Message.success('操作成功')
  onClose()
}

async function onSubmit() {
  const result = await formRef.value?.validate()
  !result && submit()
}

defineExpose({
  openModal
})
</script>

<style lang="less" scoped></style>
