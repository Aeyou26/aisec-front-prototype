<template>
  <Page>
    <div class="w-100% h-100% flex justify-center pt-80">
      <div class="flex flex-col items-center">
        <a-form ref="formRef" :model="form" auto-label-width>
          <a-form-item label="知识库名称" field="address" :rules="[{ required: true, message: '请输入机器码' }]">
            <a-input v-model="form.name" placeholder="请输入机器码" style="width: 580px" />
          </a-form-item>
          <a-form-item label="知识库描述" field="address" :rules="[{ required: true, message: '请输入机器码' }]">
            <a-textarea v-model="form.describe" placeholder="Please enter something" auto-size style="width: 580px; background-color: white" />
          </a-form-item>
          <a-form-item label="知识库类型" field="address" :rules="[{ required: true, message: '请输入机器码' }]">
            <div class="type-box">
              <div class="flex items-center mb-20 text-14 color-#333333">
                <SvgIcon name="knowledge-ty" :size="16" class="mr-8" />
                通用型
              </div>
              <div class="text-12 color-#999999">可以通过上传文件或手动录入方式构建知识库</div>
            </div>
          </a-form-item>
          <a-form-item label="" field="address">
            <a-button type="primary">保存</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </Page>
</template>

<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const formRef = ref<FormInstance>()

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/assets/synchronous', formData), {
  initialForm: {
    id: '',
    name: 'CEV数据',
    file: 'fsad56sad6a6d5a65',
    type: '',
    key: '',
    cycle: '',
    describe:
      '这是一个包含多个CVE漏洞信息的文本，每一个CVE漏洞信息以######开头，每个典型的 CVE（Common Vulnerabilities and Exposures）记录 数据结构，用于描述一个安全漏洞的详细信息。以下是该数据结构的详细描述：1. 顶层结构containers: 包含漏洞的主要信息，分为多个部分：cna: 由 CNA（CVE Numbering Authority）提供的主要漏洞信息。adp: 由其他组织提供的附加信息。'
  }
})
</script>

<style lang="less" scoped>
.type-box {
  border-radius: 8px;
  border: 1px solid #9999994d;
  background: #fff;
  padding: 14px 20px;
}
</style>
