<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'
import { removeEmptyAttr } from '@/utils/tools'
import { encryptPassword } from '@/utils/rsa'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const userStore = useUserStore()
const { publicKey } = storeToRefs(userStore)

const { form, send, loading, updateForm, onSuccess, reset } = useForm(
  (formData) => {
    const encryptedPassword = encryptPassword(formData.password, publicKey.value)
    return request.Post(
      '/user/createOrUpdate',
      removeEmptyAttr({
        ...formData,
        password: encryptedPassword
      })
    )
  },
  {
    initialForm: { id: '', account: '', password: '', roleId: '', realName: '', phone: '', email: '' }
  }
)
onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})
function onBeforeOpen() {
  if (initData.value) {
    const { id, account, password, roleId, realName, phone, email } = initData.value
    updateForm({ id, account, password, roleId, realName, phone, email })
  }
  getRoleList()
}
const roleList = ref<any[]>([])
// 获取角色列表
const getRoleList = () => {
  request.Get<any>('/role/all').then((res) => {
    // .filter((item: any) => item.is_internal)
    roleList.value = res.data
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
  <a-modal
    v-model:visible="visible"
    :title="initData ? '编辑账号' : '新增账号'"
    title-align="start"
    :width="480"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-form ref="formRef" layout="vertical" :model="form" auto-label-width>
      <a-form-item label="账号" field="account" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model="form.account" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item label="密码" field="password" :rules="[{ required: !Boolean(initData), message: '请输入密码' }]">
        <a-input-password v-model="form.password" :placeholder="!Boolean(initData) ? '请输入密码' : '请输入密码, 留空则不修改'" />
      </a-form-item>
      <a-form-item label="角色" field="roleId" :rules="[{ required: true, message: '请选择角色' }]">
        <a-select v-model="form.roleId" placeholder="请选择角色">
          <a-option v-for="item in roleList" :key="item.id" :value="item.id">{{ item.name }}</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="昵称" field="realName" :rules="[{ required: true, message: '请输入昵称' }]">
        <a-input v-model="form.realName" placeholder="请输入昵称" />
      </a-form-item>
      <a-form-item label="电话" field="phone">
        <a-input v-model="form.phone" placeholder="请输入电话" />
      </a-form-item>
      <a-form-item label="邮箱" field="email">
        <a-input v-model="form.email" placeholder="请输入邮箱" />
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
