<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const props = defineProps({
  id: {
    type: String, // 参数类型
    required: false, // 是否必传
    default: '' // 默认值（如果未传参）
  },
  knowledge: {
    type: String, // 参数类型
    required: false, // 是否必传
    default: '' // 默认值（如果未传参）
  }
})

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const knowledgeList = ref<any>([])

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/knowledge/file/association', formData), {
  initialForm: { fileId: '', knowledgeIds: [] }
})

onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})

function onBeforeOpen() {
  form.value.fileId = props.id // 更新 id
  if (initData.value) {
    const { fileId, knowledgeIds } = initData.value
    updateForm({ fileId, knowledgeIds })
  }
  knowledgeList.value = []
  getList()
}

function getList() {
  request.Get('/knowledge/select').then((res: any) => {
    console.log('获取知识库列表', res)
    if (res && res.code === 1) {
      if (res.data && res.data.length > 0) {
        knowledgeList.value = res.data

        if (props.knowledge) {
          const targetNames = props.knowledge
          const resultIds = knowledgeList.value.filter((item: any) => targetNames.includes(item.name)).map((item: any) => item.id)
          form.value.knowledgeIds = resultIds
        }
      } else {
        knowledgeList.value = []
      }
    }
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
  <a-modal v-model:visible="visible" title="链接知识库" title-align="start" :width="600" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <div>
      <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
        <a-form-item label="" field="knowledgeIds" :rules="[{ required: true, message: '请选择知识库' }]" hide-asterisk>
          <a-select v-model="form.knowledgeIds" multiple placeholder="请选择" :allow-search="false">
            <a-option v-for="(item, index) in knowledgeList" :key="index" :value="item.id"> {{ item.name }} </a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <a-space>
        <a-button @click="onClose()"> 取消 </a-button>
        <a-button type="primary" :loading="loading" @click="onSubmit()"> 确定 </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style lang="less" scoped></style>
