<template>
  <Page :table="false">
    <div class="flex px-20 py-30 gap-60">
      <div class="h-100% flex justify-center">
        <a-card :style="{ width: '420px', height: '300px' }" title="邮箱网关配置">
          <template #extra>
            <a-link @click="send">保存</a-link>
          </template>
          <div class="flex flex-col gap-40">
            <!-- <div class="text-18 text-#333333 font-bold flex gap-10 items-center">
              <div class="w-8 h-24 bg-#2f73e7"></div>
              通知配置
            </div> -->
            <a-form ref="formRef" :model="form" auto-label-width label-align="left">
              <a-form-item label="邮箱网关" field="gateway" :rules="[{ required: true, message: '请输入邮箱网关' }]" :validate-trigger="['change', 'input']">
                <a-input v-model="form.gateway" placeholder="请输入邮箱网关" style="width: 320px" />
              </a-form-item>
              <a-form-item label="邮箱账号" field="account" :rules="[{ required: true, message: '请输入邮箱账号' }]" :validate-trigger="['change', 'input']">
                <a-input v-model="form.account" placeholder="请输入邮箱账号" style="width: 320px" />
              </a-form-item>
              <a-form-item label="邮箱密码" field="password" :rules="[{ required: true, message: '请输入邮箱密码' }]" :validate-trigger="['change', 'input']">
                <a-input v-model="form.password" placeholder="请输入邮箱密码" style="width: 320px" />
              </a-form-item>
              <!-- <a-button type="primary" :loading="loading" @click="send"> 确定 </a-button> -->
            </a-form>
          </div>
        </a-card>
      </div>

      <div class="h-100% flex justify-center">
        <a-card :style="{ width: '420px', height: '300px' }" title=" 短信网关配置">
          <template #extra>
            <a-link @click="sendSms">保存</a-link>
          </template>
          <div class="flex flex-col gap-40">
            <!-- 短信网关配置 -->
            <!-- <div class="text-18 text-#333333 font-bold flex gap-10 items-center">
              <div class="w-8 h-24 bg-#2f73e7"></div>
              短信网关配置
            </div> -->
            <a-form ref="smsFormRef" :model="smsForm" auto-label-width label-align="left">
              <a-form-item label="类型" field="type" :rules="[{ required: true, message: '请选择类型' }]" :validate-trigger="['change', 'input']">
                <a-select v-model="smsForm.type" placeholder="请选择" :allow-search="false">
                  <a-option v-for="(item, index) in options" :key="index" :value="item.value"> {{ item.label }} </a-option>
                </a-select>
              </a-form-item>
              <a-form-item label="服务器地址" field="addr" :rules="[{ required: true, message: '请输入服务器地址' }]" :validate-trigger="['change', 'input']">
                <a-input v-model="smsForm.addr" placeholder="请输入服务器地址" style="width: 320px" />
              </a-form-item>
              <a-form-item label="授权Key" field="key" :rules="[{ required: true, message: '请输入授权Key' }]" :validate-trigger="['change', 'input']">
                <a-input v-model="smsForm.key" placeholder="请输入授权Key" style="width: 320px" />
              </a-form-item>
              <a-form-item label="授权Secret" field="secret" :rules="[{ required: true, message: '请输入授权Secret' }]" :validate-trigger="['change', 'input']">
                <a-input v-model="smsForm.secret" placeholder="请输入授权Secret" style="width: 320px" />
              </a-form-item>
              <!-- <a-button type="primary" :loading="smsLoading" @click="sendSms"> 保存 </a-button> -->
            </a-form>
          </div>
        </a-card>
      </div>
    </div>
  </Page>
</template>

<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import request from '@/request'

const formRef = ref<FormInstance>()
const smsFormRef = ref<FormInstance>()

// 邮箱配置
const { form, send, loading, updateForm, onSuccess } = useForm((formData) => request.Post('/sys/createEmailConf', formData), {
  initialForm: { id: '', gateway: '', account: '', password: '', configKey: '' }
})

onSuccess(() => {
  Message.success('保存成功')
})

// 短信配置
const {
  form: smsForm,
  send: sendSms,
  loading: smsLoading,
  updateForm: updateSmsForm,
  onSuccess: smsOnSuccess
} = useForm((formData) => request.Post('/sys/createSmsConf', formData), {
  initialForm: { id: '', type: '', addr: '', key: '', secret: '' }
})

const options = ref<any[]>([{ label: '阿里云', value: '1' }])

smsOnSuccess(() => {
  Message.success('保存成功')
})

onMounted(() => {
  // 获取邮箱配置
  request.Get('/sys/getConf', { params: { key: 'email_alert_conf_key' } }).then((res: any) => {
    if (res && res.data) {
      updateForm(res.data)
    }
  })

  // 获取短信配置
  request.Get('/sys/getConf', { params: { key: 'sms_conf_key' } }).then((res: any) => {
    if (res && res.data) {
      updateSmsForm(res.data)
      const matchedOption = options.value.find((option) => option.label === res.data.type)
      if (matchedOption) {
        updateSmsForm({ type: matchedOption.value })
      }
    }
  })
})
</script>

<style lang="less" scoped></style>
