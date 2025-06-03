<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps({
  fileId: {
    type: String,
    required: true,
    default: ''
  },
  knowledgeName: {
    type: String,
    required: true,
    default: ''
  }
})

const editFlag = ref<boolean>(false)
const loading = ref<boolean>(false)

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

// const question = ref('')

const { form, updateForm, reset } = useForm((formData) => request.Post('', formData), {
  initialForm: { name: '', content: '', id: '' }
})

function onBeforeOpen() {
  editFlag.value = false
  if (initData.value) {
    const { content, id, file_name } = initData.value
    updateForm({ content, id, name: file_name })
  }
}

function onClose() {
  formRef.value?.resetFields()
  reset()
  closeModal()
}

async function onSubmit() {
  if (!form.value.content.trim()) {
    Message.error('请输入分段内容')
    return
  }
  loading.value = true
  request
    .Post('/knowledge/file/update/document', {
      id: form.value.id,
      content: form.value.content,
      fileId: props.fileId,
      topic: props.knowledgeName
    })
    .then((res: any) => {
      if (res && res.code === 1) {
        Message.success('修改成功')
        closeModal()
        emit('upload')
      } else {
        Message.error('修改失败')
      }
    })
    .catch((err) => {
      Message.error('修改失败，请稍后重试')
    })
    .finally(() => {
      loading.value = false
    })
}

defineExpose({
  openModal
})

const state = reactive({
  text: '',
  theme: 'atom'
})
</script>

<template>
  <a-modal v-model:visible="visible" title="分段详情" title-align="start" :width="'1100px'" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <div class="min-h-400 flex">
      <div class="h-full min-h-400 content-box">
        <!-- <div class="pt-20 pb-20 font-600">分段标题</div>
        <div class="mb-20">{{ form.name }}</div> -->
        <div class="pb-20 font-600 flex items-center justify-between">
          <div>分段内容</div>
          <div v-if="!editFlag" class="color-blue cursor-pointer" @click="editFlag = true">修改</div>
        </div>
        <div v-if="!editFlag" style="white-space: pre-wrap">{{ form.content }}</div>
        <MdEditor v-else v-model="form.content" :toolbars-exclude="['image', 'github']" :code-theme="state.theme" :preview="false" />
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
      <a-space >
        <a-button v-if="editFlag" @click="editFlag = false"> 取消 </a-button>
        <a-button v-if="editFlag" type="primary" :loading="loading" @click="onSubmit()"> 确定 </a-button>
        <a-button v-if="!editFlag" @click="onClose"> 关闭 </a-button>
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
