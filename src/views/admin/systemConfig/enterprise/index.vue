<template>
  <Page :table="false">
    <div class="w-100% h-100% flex pt-28 pl-28">
      <div class="flex flex-col gap-40">
        <div class="text-18 text-#333333 font-bold flex gap-10 items-center">
          <div class="w-8 h-24 bg-#2f73e7"></div>
          企业信息配置
        </div>
        <a-form ref="formRef" :model="form" auto-label-width label-align="left">
          <a-form-item label="企业名称" field="name" :rules="[{ required: true, message: '请输入企业名称' }]">
            <a-input v-model="form.name" placeholder="请输入企业名称" style="width: 300px" />
          </a-form-item>
          <a-form-item label="企业图标" field="icon">
            <a-upload action="/api/common/upload/information-file" :data="data" :headers="{ Authorization: token }" :show-file-list="false" @success="onUploadSuccess">
              <template #upload-button>
                <div class="arco-upload-list-item">
                  <div v-if="form.icon" class="arco-upload-list-picture custom-upload-avatar">
                    <img :src="`/api/sys/download?fileName=${form.icon}`" />
                    <div class="arco-upload-list-picture-mask">
                      <a-space>
                        <IconEdit />
                        <IconDelete @click.stop="form.icon = ''" />
                      </a-space>
                    </div>
                  </div>
                  <div v-else class="arco-upload-picture-card">
                    <div class="arco-upload-picture-card-text">
                      <IconPlus />
                      <div style="margin-top: 10px; font-weight: 600">上传</div>
                    </div>
                  </div>
                </div>
              </template>
            </a-upload>
          </a-form-item>
          <a-form-item label="企业logo" field="logo">
            <a-upload action="/api/common/upload/information-file" :headers="{ Authorization: token }" :data="data" :show-file-list="false" @success="onUploadSuccess2">
              <template #upload-button>
                <div class="arco-upload-list-item">
                  <div v-if="form.logo" class="arco-upload-list-picture custom-upload-avatar !w-auto !min-w-80 !max-w-240">
                    <img :src="`/api/sys/download?fileName=${form.logo}`" class="w-100% h-100%" />
                    <div class="arco-upload-list-picture-mask">
                      <a-space>
                        <IconEdit />
                        <IconDelete @click.stop="form.logo = ''" />
                      </a-space>
                    </div>
                  </div>
                  <div v-else class="arco-upload-picture-card !min-w-200 !max-w-240">
                    <div class="arco-upload-picture-card-text">
                      <IconPlus />
                      <div style="margin-top: 10px; font-weight: 600">上传</div>
                    </div>
                  </div>
                </div>
              </template>
            </a-upload>
          </a-form-item>
          <a-button type="primary" :loading="loading" @click="submit"> 确定 </a-button>
        </a-form>
      </div>
    </div>
  </Page>
</template>

<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import request from '@/request'
import { removeEmptyAttr } from '@/utils/tools'

const formRef = ref<FormInstance>()
const data = {
  bucket: 'information-file'
}
const userStore = useUserStore()
const { token } = storeToRefs(useUserStore())

const { form, send, loading, updateForm, onSuccess } = useForm((formData) => request.Post('/sys/createInformationConf', removeEmptyAttr(formData)), {
  initialForm: { id: void 0, name: '', icon: '', logo: '' }
})

const icon = ref<any>({})
const logo = ref<any>({})

function onUploadSuccess(data: any) {
  if (data.response.code === 1) {
    icon.value = {
      url: data.response.data,
      status: 'success'
    }
    updateForm({
      icon: data.response.data
    })
  }
  setTimeout(() => {
    formRef.value?.validate()
  }, 1000)
}

function onUploadSuccess2(data: any) {
  if (data.response.code === 1) {
    logo.value = {
      url: data.response.data,
      status: 'success'
    }
    updateForm({
      logo: data.response.data
    })
  }
  setTimeout(() => {
    formRef.value?.validate()
  }, 1000)
}

function submit() {
  formRef.value?.validate().then(() => {
    send()
  })
}

onSuccess(() => {
  Message.success('操作成功')
  userStore.setEnterpriseInfo(form.value)
})

onMounted(() => {
  request.Get('/sys/getConf', { params: { key: 'information_conf_key' } }).then((res: any) => {
    if (res && res.data) {
      updateForm(res.data)
    }
  })
})
</script>

<style lang="less" scoped></style>
