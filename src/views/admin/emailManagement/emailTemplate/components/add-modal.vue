<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

const state = reactive({
  text: '',
  theme: 'atom'
})

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/knowledge/update', formData), {
  initialForm: { type: '', word: '' }
})

const options = ref<any[]>([
  { label: '通用', value: 0 },
  { label: '反动', value: 1 },
  { label: '色情', value: 2 },
  { label: '毒品', value: 3 },
  { label: '赌博', value: 3 }
])

onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})

function onBeforeOpen() {
  // if (initData.value) {
  //   const { type, word } = initData.value
  //   updateForm({ type, word })
  // }
}

function onClose() {
  formRef.value?.resetFields()
  reset()
  closeModal()
}

async function onSubmit() {
  const result = await formRef.value?.validate()
  if (!result) {
    // if (!form.value.type.trim()) {
    //   Message.error('知识库描述不允许为空')
    //   return
    // }
  }
  !result && send()
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="新增" title-align="start" :width="1000" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" :model="form" layout="vertical" auto-label-width>
      <div class="flex gap-40">
        <a-form-item
          label="模板名称"
          field="knowledgeName"
          :rules="[{ required: true, message: '请输入短信签名' }]"
          :validate-trigger="['change', 'input']"
          hide-asterisk
        >
          <a-input v-model="form.word" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="模板编号"
          field="knowledgeName"
          :rules="[{ required: true, message: '请输入短信签名' }]"
          :validate-trigger="['change', 'input']"
          hide-asterisk
        >
          <a-input v-model="form.word" placeholder="请输入" />
        </a-form-item>
      </div>
      <div class="flex gap-40">
        <a-form-item
          label="发送人名称"
          field="knowledgeName"
          :rules="[{ required: true, message: '请输入短信签名' }]"
          :validate-trigger="['change', 'input']"
          hide-asterisk
        >
          <a-input v-model="form.word" placeholder="请输入" />
        </a-form-item>
        <a-form-item label="账号" field="knowledgeName" :rules="[{ required: true, message: '请输入短信签名' }]" :validate-trigger="['change', 'input']" hide-asterisk>
          <a-input v-model="form.word" placeholder="请输入" />
        </a-form-item>
      </div>

      <a-form-item label="模板标题" field="knowledgeName" :rules="[{ required: true, message: '请输入短信签名' }]" :validate-trigger="['change', 'input']" hide-asterisk>
        <a-input v-model="form.word" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="模板内容" field="knowledgeName" :rules="[{ required: true, message: '请输入短信签名' }]" :validate-trigger="['change', 'input']" hide-asterisk>
        <MdEditor v-model="state.text" :toolbarsExclude="['image', 'github']" :code-theme="state.theme" :preview="false" />
      </a-form-item>
      <a-form-item label="备注" field="description" :rules="[{ required: true, message: '请输入敏感词' }]" :validate-trigger="['change', 'input']" hide-asterisk>
        <a-textarea
          v-model="form.word"
          placeholder="请输入敏感词，多个敏感词以，分隔"
          :auto-size="{
            minRows: 6,
            maxRows: 10
          }"
        />
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

<style lang="less" scoped>
/* 调整 MdEditor 功能按钮大小 */
:deep(svg.md-editor-icon) {
  width: 24px;
  height: 24px;
}
</style>
