<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import useIcon from '@/hooks/useIcon'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()
const { token } = storeToRefs(useUserStore())
const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const isUploading = ref(false)
const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/user/report/create', formData), {
  initialForm: { target: '', tool: '' }
})
onSuccess((res) => {
  const { data } = res
  console.log(data)
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  if (initData.value) {
    const { target, tool } = initData.value
    updateForm({ target, tool })
  }
}

function onExceedLimit() {
  Message.error('最多只能上传1个文件')
}

function onSuccess_(data: any) {
  console.log(data)
}

function onError() {
  isUploading.value = false
  Message.error('上传失败')
}

function onChange(file: any) {
  console.log(file)
  isUploading.value = true
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

function onDownload() {
  console.log('下载脚本')
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal
    v-model:visible="visible"
    title="流量分析"
    unmount-on-close
    title-align="start"
    :width="600"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="流量数据包" field="file">
        <a-upload
          action="/api/code/audit/upload"
          :headers="{ Authorization: token }"
          class="w-full"
          :show-file-list="false"
          :disabled="isUploading"
          @exceed-limit="onExceedLimit"
          @change="onChange"
          @success="onSuccess_"
          @error="onError"
        >
          <template #upload-button>
            <div class="flex items-center justify-between w-full px-16 py-8 border-1 border-solid border-#99999933 rounded-6 text-#999999">
              <div class="flex items-center gap-4">
                <icon-sync v-if="isUploading" spin color="#2e66c7" size="16" />
                <span>请上传</span>
              </div>
              <component :is="useIcon('right-arrow', { width: 8, height: 12 })" />
            </div>
          </template>
        </a-upload>
      </a-form-item>
      <a-alert>上传抓包工具获取的数据包。分析记录会保存在工具操作列表里面。</a-alert>
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
