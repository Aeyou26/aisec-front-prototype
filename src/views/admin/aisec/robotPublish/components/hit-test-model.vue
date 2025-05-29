<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/digital/test', formData), {
  initialForm: {
    id: '',
    content: ''
  }
})
onSuccess(() => {
  Message.success('操作成功')
})

function onBeforeOpen() {
  if (initData.value) {
    const { id } = initData.value
    updateForm({ id })
  }
}

function onClose() {
  formRef.value?.resetFields()
  reset()
  closeModal()
}

async function onSubmit() {
  if (loading.value) {
    return
  }
  if (!form.value.content) {
    Message.error('请输入命中内容')
    return
  }
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
    title="命中测试"
    unmount-on-close
    title-align="start"
    :width="680"
    :mask-closable="false"
    :footer="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <div class="flex flex-col gap-16">
      <div class="w-full p-12 text-16 border-1 border-dashed border-#2f73e7 bg-#ffffff rounded-6 whitespace-pre-wrap max-h-400 overflow-y-auto">
        验证结果:
        <div class="text-14 text-#999999 pl-16 pt-12">知识块：嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻嘻</div>
      </div>
      <div class="w-full bg-#ffffff rounded-20 flex flex-col gap-6 pt-8" style="box-shadow: 0 8px 40px 0 #00266914">
        <textarea
          v-model="form.content"
          class="w-full h-52 px-16 text-16 resize-none outline-none border-none bg-#ffffff rounded-20 whitespace-pre-wrap overflow-y-auto leading-28"
          placeholder="请输入内容"
          @keyup.enter="onSubmit()"
        ></textarea>
        <div class="w-full flex justify-end items-center gap-12 px-16 pb-8">
          <div class="flex items-center gap-12">
            <a-button type="primary" shape="circle" class="text-white !rounded-full !w-24 !h-24" @click="onSubmit()">
              <icon-arrow-up size="18" />
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style lang="less" scoped></style>
