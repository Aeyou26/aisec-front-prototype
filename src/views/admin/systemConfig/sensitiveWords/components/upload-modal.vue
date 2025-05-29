<script lang="ts" setup>
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, openModal, closeModal } = useModalVisible<any>()
const emit = defineEmits(['upload'])
const { token } = storeToRefs(useUserStore())

const fileList = ref<any[]>([])

function onBeforeOpen() {
  fileList.value = []
}

function onClose() {
  emit('upload')
  closeModal()
}

function onSuccess() {
  Message.success('上传成功')
}

function downloadTemplate() {
  request.Get('/user/check/token').then(() => {
    location.href = `/api/sensitive/words/download/template`
  })
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="导入" title-align="start" :width="640" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <div class="mb-20 flex justify-end text-16 color-#3178c6 cursor-pointer underline" @click="downloadTemplate">下载模版</div>

    <div class="w-584">
      <a-upload
        v-model:file-list="fileList"
        action="/api/sensitive/words/save"
        :headers="{ Authorization: token }"
        accept=".xls,.xlsx"
        :show-file-list="true"
        :show-retry-button="false"
        :show-remove-button="false"
        @success="onSuccess"
      >
        <template #upload-button>
          <div class="upload-contain w-584">
            <div class="flex items-center">
              <div class="w-100 text-14 color-#333333">敏感词文件</div>
              <a-input placeholder="请选择" readonly style="cursor: pointer">
                <template #suffix>
                  <icon-right />
                </template>
              </a-input>
            </div>
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

<style lang="less" scoped>
:deep(.arco-upload-list-item-content) {
  margin-left: 84px;
}

.upload-contain {
  :deep(.arco-form-item) {
    margin-bottom: 14px;
  }
}
</style>
