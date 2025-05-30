<script lang="ts" setup>
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import useIcon from '@/hooks/useIcon'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()
const form = ref({
  file: ''
})

const { token } = storeToRefs(useUserStore())
const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const result = ref('')
const title = ref('')

const isUploading = ref(false)

const data = ref({
  robotId: '',
  abilityId: ''
})

function onBeforeOpen() {
  isUploading.value = false
  if (initData.value) {
    title.value = initData.value.title
    data.value = initData.value.params
  }
}

function onClose() {
  result.value = ''
  data.value = {
    robotId: '',
    abilityId: ''
  }
  isUploading.value = false
  closeModal()
}

function onExceedLimit() {
  Message.error('最多只能上传1个文件')
}

function onSuccess_(data: any) {
  isUploading.value = false
  result.value = data.response.data
}

function onError() {
  isUploading.value = false
  Message.error('上传失败')
}

function onChange(file: any) {
  console.log(file)
  isUploading.value = true
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal
    v-model:visible="visible"
    title-align="start"
    :width="680"
    :footer="false"
    unmount-on-close
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <template #title>
      <div class="flex items-center gap-4">
        <span>{{ title }}</span>
        <a-tooltip content="分析会在后台运行，执行记录在工具使用记录列表可以查看到记录。">
          <icon-info-circle size="18" class="cursor-pointer" />
        </a-tooltip>
      </div>
    </template>
    <div v-if="result" class="flex items-center justify-center h-120">
      <a-alert type="info">
        <template #icon>
          <icon-info-circle size="18" class="cursor-pointer" />
        </template>
        {{ result }}
      </a-alert>
    </div>
    <a-form v-else ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="源码文件" field="file">
        <div class="flex flex-col gap-16 w-full">
          <!-- v-model:file-list="fileList" -->
          <a-upload
            action="/api/code/audit/upload"
            :headers="{ Authorization: token }"
            :show-file-list="false"
            :data="data"
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
                  <span>请选择</span>
                </div>
                <component :is="useIcon('right-arrow', { width: 8, height: 12 })" />
              </div>
            </template>
          </a-upload>
          <span class="text-12 text-#999999"> 文件格式：java,js,vue,css,py,go,zip </span>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style lang="less" scoped></style>
