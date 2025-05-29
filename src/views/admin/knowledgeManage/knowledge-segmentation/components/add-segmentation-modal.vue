<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message, Upload } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
const state = reactive({
  text: '',
  theme: 'atom'
})

const props = defineProps({
  fileId: {
    type: String, // 参数类型
    required: false, // 是否必传
    default: '' // 默认值（如果未传参）
  },
  knowledgeName: {
    type: String, // 参数类型
    required: false, // 是否必传
    default: '' // 默认值（如果未传参）
  }
})

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const loading = ref<boolean>(false)
const title = ref('')
const question = ref('')

const { updateForm, onSuccess, reset } = useForm((formData) => request.Post('', formData), {
  initialForm: { name: '', describe: '' }
})

onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})

function onBeforeOpen() {
  if (initData.value) {
    const { name, describe } = initData.value
    updateForm({ name, describe })
  }
}

function onClose() {
  formRef.value?.resetFields()
  reset()
  closeModal()
}

async function onSubmit() {
  if (!state.text.trim()) {
    Message.error('请输入分段内容')
    return
  }
  loading.value = true
  request
    .Post('/knowledge/file/create/document', {
      content: state.text,
      fileId: props.fileId,
      topic: props.knowledgeName
    })
    .then((res: any) => {
      if (res && res.code === 1) {
        Message.success('新增分段成功')
        closeModal()
        state.text = ''
        emit('upload')
      }
      loading.value = false
    })
    .catch((err) => {
      loading.value = false
    })
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="分段详情" title-align="start" :width="'1100px'" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <div class="min-h-400 flex">
      <div class="h-full min-h-400 content-box pr-20">
        <!-- <div class="pt-20 pb-20">分段标题</div>
        <a-input v-model="title" placeholder="请输入分段标题" class="mb-20" /> -->
        <div class="pb-20">分段内容</div>
        <MdEditor v-model="state.text" :toolbarsExclude="['image', 'github']" :code-theme="state.theme" :preview="false" />
      </div>
      <!-- <div class="flex-1 h-full min-h-400 ml-40">
        <div>关联问题</div>
        <a-select v-model="question" placeholder="请选择">
          <a-option v-for="item in agentList" :key="item.id" :value="item.id">{{ item.name }}</a-option>
          <a-option :value="1">问题1</a-option>
        </a-select>
      </div> -->
    </div>
    <template #footer>
      <a-space>
        <a-button @click="onClose()"> 取消 </a-button>
        <a-button type="primary" :loading="loading" @click="onSubmit()"> 确定 </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style lang="less" scoped>
.content-box {
  flex: 3;
}

/* 调整 MdEditor 功能按钮大小 */
:deep(svg.md-editor-icon) {
  width: 26px;
  height: 26px;
}
</style>
