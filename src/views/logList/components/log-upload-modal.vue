<script lang="ts" setup>
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'

const { visible, openModal, closeModal } = useModalVisible<any>()
const emit = defineEmits(['upload'])
const { token } = storeToRefs(useUserStore())

const source = ref('') //来源
const fileList = ref<any[]>([])

function onBeforeOpen() {
  source.value = ''
  fileList.value = []
}

function onClose() {
  emit('upload')
  closeModal()
}

function onSuccess() {
  Message.success('上传成功')
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="日志上传" title-align="start" :width="640" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <!-- <a-form-item field="section" label="来源" :rules="[{ match: /section one/, message: 'must select one' }]">
      <a-select v-model="source" allow-clear placeholder="请选择">
        <a-option v-for="item in options" :key="item.value" :value="item.value"> {{ item.label }} </a-option>
      </a-select>
    </a-form-item> -->

    <div class="w-584">
      <a-upload
        v-model:file-list="fileList"
        action="/api/logFile/upload"
        :headers="{ Authorization: token }"
        accept=".xls,.xlsx" 
        :show-file-list="true"
        :show-retry-button="false"
        :show-remove-button="false"
        @success="onSuccess"
      >
        <template #upload-button>
          <div class="upload-contain w-584">
            <a-form-item field="section" label="文件" class="cursor-pointer">
              <a-input placeholder="请选择" readonly style="cursor: pointer">
                <template #suffix>
                  <icon-right />
                </template>
              </a-input>
            </a-form-item>
            <div class="color-#999999 text-12 pl-50">格式为xls、xlsx</div>
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
  margin-left: 40px;
}

.upload-contain {
  :deep(.arco-form-item) {
    margin-bottom: 14px;
  }
}
</style>
