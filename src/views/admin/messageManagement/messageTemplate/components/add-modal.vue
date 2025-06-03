<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/knowledge/update', formData), {
  initialForm: { type: '', word: '' }
})

const options = ref<any[]>([])

const options2 = ref<any[]>([
  { label: '通用', value: 0 },
  { label: '反动', value: 1 },
  { label: '色情', value: 2 },
  { label: '毒品', value: 3 },
  { label: '赌博', value: 3 }
])

const options3 = ref<any[]>([
  { label: '开启', value: 0 },
  { label: '关闭', value: 1 }
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
  <a-modal v-model:visible="visible" title="新增" title-align="start" :width="800" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" :model="form" auto-label-width>
      <a-form-item label="短信渠道" field="type" :rules="[{ required: true, message: '请选择类型' }]" hide-asterisk>
        <a-select v-model="form.type" placeholder="请选择" :allow-search="false">
          <a-option v-for="(item, index) in options" :key="index" :value="item.value"> {{ item.label }} </a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="短信类型" field="type" :rules="[{ required: true, message: '请选择类型' }]" hide-asterisk>
        <a-select v-model="form.type" placeholder="请选择" :allow-search="false">
          <a-option v-for="(item, index) in options2" :key="index" :value="item.value"> {{ item.label }} </a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="模版编号" field="knowledgeName" :rules="[{ required: true, message: '请输入短信签名' }]" :validate-trigger="['change', 'input']" hide-asterisk>
        <a-input v-model="form.word" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="模版名称" field="knowledgeName" :rules="[{ required: true, message: '请输入短信签名' }]" :validate-trigger="['change', 'input']" hide-asterisk>
        <a-input v-model="form.word" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="模版内容" field="description" :rules="[{ required: true, message: '请输入敏感词' }]" :validate-trigger="['change', 'input']" hide-asterisk>
        <a-textarea
          v-model="form.word"
          placeholder="请输入模板内容"
          :auto-size="{
            minRows: 6,
            maxRows: 6
          }"
        />
      </a-form-item>
      <a-form-item label="开启状态" field="type" :rules="[{ required: true, message: '请选择类型' }]" hide-asterisk>
        <a-select v-model="form.type" placeholder="请选择" :allow-search="false">
          <a-option v-for="(item, index) in options3" :key="index" :value="item.value"> {{ item.label }} </a-option>
        </a-select>
      </a-form-item>
      <a-form-item
        label="短信API模板编号"
        field="knowledgeName"
        :rules="[{ required: true, message: '请输入短信签名' }]"
        :validate-trigger="['change', 'input']"
        hide-asterisk
      >
        <a-input v-model="form.word" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="备注" field="knowledgeName" :rules="[{ required: true, message: '请输入短信签名' }]" :validate-trigger="['change', 'input']" hide-asterisk>
        <a-input v-model="form.word" placeholder="请输入" />
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

<style lang="less" scoped></style>
