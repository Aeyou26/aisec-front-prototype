<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const { token } = storeToRefs(useUserStore())

const data = {
  bucket: 'information-file'
}

function onUploadSuccess(data: any) {
  if (data.response.code === 1) {
    updateForm({
      logo: data.response.data
    })
  }
  setTimeout(() => {
    formRef.value?.validate()
  }, 1000)
}

const { form, send, loading, updateForm, onSuccess, reset } = useForm(
  (formData) => {
    return initData.value?.id ? request.Post('/digital/human/update/base', formData) : request.Post('/digital/human/create/base', formData)
  },
  {
    initialForm: {
      id: '',
      name: '',
      logo: '',
      description: ''
    }
  }
)
onSuccess(() => {
  emit('upload', form.value)
  Message.success('操作成功')
  onClose()
})

function onBeforeOpen() {
  if (initData.value) {
    const { id, name, logo, description } = initData.value
    updateForm({ id, name, logo, description })
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
    :title="initData?.id ? '编辑数字人' : '创建数字人'"
    unmount-on-close
    title-align="start"
    :width="680"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="数字人名称" field="name" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model="form.name" :max-length="10" allow-clear show-word-limit placeholder="请输入" />
      </a-form-item>
      <a-row>
        <a-col :span="6">
          <a-form-item label="数字人形象及介绍" field="logo" :rules="[{ required: true, message: '请上传数字人形象' }]">
            <a-upload action="/api/common/upload/information-file" :data="data" :headers="{ Authorization: token }" :show-file-list="false" @success="onUploadSuccess">
              <template #upload-button>
                <div class="arco-upload-list-item">
                  <div v-if="form.logo" class="w-124 h-124 cursor-pointer">
                    <img :src="`/api/sys/download?fileName=${form.logo}`" class="w-124 h-124" />
                    <div class="flex flex-col items-center justify-center arco-upload-list-picture-mask">
                      <span class="text-12 text-#ffffff">重新上传</span>
                    </div>
                  </div>
                  <div v-else class="w-124 h-124 bg-#9999990f rounded-8 flex items-center justify-center border-1 border-solid border-#99999980">
                    <div class="arco-upload-picture-card-text">
                      <SvgIcon name="upload" :size="48" />
                      <div class="text-12 text-#999999">点击上传</div>
                    </div>
                  </div>
                </div>
              </template>
            </a-upload>
          </a-form-item>
        </a-col>
        <a-col :span="18">
          <a-form-item label="" field="description" :rules="[{ required: true, message: '请输入' }]">
            <template #label>
              <span class="text-14px !text-#999999"> 形象仅支持jpg、png、bmp格式的图片，大小不超过500kb </span>
            </template>
            <a-textarea
              v-model="form.description"
              class="mt-12"
              :auto-size="{
                minRows: 5,
                maxRows: 8
              }"
              placeholder="请输入相关数字人介绍"
            />
          </a-form-item>
        </a-col>
      </a-row>
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
