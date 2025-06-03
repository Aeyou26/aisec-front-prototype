<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

const { form, send, loading, updateForm, onSuccess, reset } = useForm((formData) => request.Post('/robot/createOrUpdate', formData), {
  initialForm: {
    id: '',
    name: '',
    avatar: '',
    logo: '',
    useScene: '',
    prolog: '',
    abiltyList: [],
    sortNo: 0,
    status: 1
  }
})
onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})
const agentList = ref<any[]>([])
const options = [
  { label: 'sj', value: 'sj' },
  { label: 'aq', value: 'aq' },
  { label: 'zc', value: 'zc' },
  { label: 'hg', value: 'hg' },
  { label: 'jqr', value: 'jqr' },
  { label: 'jqg', value: 'jqg' },
  { label: 'yw', value: 'yw' }
]
// 获取所有未使用的能力
const getAbilityList = () => {
  request.Get<any>('/ability/all').then((res) => {
    const list = initData.value?.abilityList || []
    agentList.value = [...list, ...res.data]
  })
}

function onBeforeOpen() {
  if (initData.value) {
    const { id, name, avatar, logo, useScene, prolog, abilityList, sortNo, status } = initData.value
    const list = abilityList?.map((item: any) => item.id) || []
    getAbilityList()
    updateForm({ id, name, avatar, logo, useScene, prolog, abiltyList: list, sortNo, status })
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
  <a-modal v-model:visible="visible" title="编辑" title-align="start" :width="680" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="数字人名称" field="name" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model="form.name" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="形象" field="avatar" :rules="[{ required: true, message: '请选择' }]">
        <a-radio-group v-model="form.avatar" :options="options">
          <template #label="{ data }">
            <SvgIcon :name="`robot-${data.value}`" size="40" />
          </template>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="头部logo" field="logo" :rules="[{ required: true, message: '请选择' }]">
        <a-radio-group v-model="form.logo" :options="options">
          <template #label="{ data }">
            <SvgIcon :name="`header-${data.value}`" size="72" />
          </template>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="描述" field="useScene" :rules="[{ required: true, message: '请输入' }]">
        <a-textarea
          v-model="form.useScene"
          :auto-size="{
            minRows: 2,
            maxRows: 5
          }"
          placeholder="请输入"
        />
      </a-form-item>
      <a-form-item label="开场白" field="prolog" :rules="[{ required: true, message: '请输入' }]">
        <a-input v-model="form.prolog" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="能力列表" field="abilityList">
        <a-select v-model="form.abiltyList" multiple placeholder="请选择">
          <a-option v-for="item in agentList" :key="item.id" :value="item.id">{{ item.name }}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="排序" field="sortNo">
        <a-input-number v-model="form.sortNo" :min="0" :max="999" placeholder="请输入" />
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
