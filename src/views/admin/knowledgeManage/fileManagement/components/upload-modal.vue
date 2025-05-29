<script lang="ts" setup>
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'

const { token } = storeToRefs(useUserStore())
const { visible, openModal, closeModal } = useModalVisible<any>()
const emit = defineEmits(['upload'])
const fileList = ref<any[]>([])

function onBeforeOpen() {
  fileList.value = []
}

function onClose() {
  emit('upload')
  closeModal()
}

function onExceedLimit() {
  Message.error('最多只能上传10个文件')
}

function onSuccess() {
  Message.success('上传成功')
}

function onError() {
  Message.error('上传失败')
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="上传文件" title-align="start" :width="680" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <div class="w-full flex justify-center items-center">
      <a-upload
        v-model:file-list="fileList"
        action="/api/knowledge/file/upload"
        :headers="{Authorization:token}"
        :show-file-list="true"
        :show-remove-button="false"
        @exceed-limit="onExceedLimit"
        @success="onSuccess"
        @error="onError"
      >
        <template #upload-button>
          <div
            style="
              background-color: var(--color-fill-2);
              color: var(--color-text-1);
              border: 1px dashed var(--color-fill-4);
              height: 158px;
              width: 620px;
              line-height: 158px;
              text-align: center;
            "
          >
            <div>点击或拖拽文件到此处上传</div>
          </div>
        </template>
      </a-upload>
    </div>
    <template #footer>
      <a-space>
        <!-- <a-button @click="onClose()"> 取消 </a-button>
        <a-button type="primary" :loading="loading" @click="onSubmit()"> 确定 </a-button> -->
      </a-space>
    </template>
  </a-modal>
</template>

<style lang="less" scoped></style>
