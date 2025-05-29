<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, openModal, closeModal } = useModalVisible<any>()
const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])

const { form, loading, reset } = useForm((formData) => request.Post('/', formData), {
  initialForm: { id: '', name: '', type: '', monitoringStatus: false, tcpStatus: false, udpStatus: false, tcpPort: '', udpPort: '' }
})

function onBeforeOpen() {
  getData()
}

function getData() {
  request.Get('/syslog/config/info').then((res: any) => {
    if (res && res.code === 1) {
      if (res.data) {
        const data = res.data
        form.value.monitoringStatus = data.status === 1 ? true : false //1开启 2关闭
        form.value.id = data.id
        form.value.name = data.name
        form.value.type = data.type
        const syslogConfig = data.syslogConfigValueDTOS
        for (let i = 0; i < syslogConfig.length; i++) {
          const item = syslogConfig[i]
          const typeName = item.typeName
          if (typeName === 'UDP') {
            form.value.udpStatus = item.status === 1 ? true : false //1开启 2关闭
            form.value.udpPort = String(item.port)
          }
          if (typeName === 'TCP') {
            form.value.tcpStatus = item.status === 1 ? true : false //1开启 2关闭
            form.value.tcpPort = String(item.port)
          }
        }
      }
    }
  })
}

function onClose() {
  reset()
  closeModal()
}

async function onSubmit() {
  if (form.value.tcpStatus && !form.value.tcpPort) {
    Message.warning('输入TCP端口号')
    return
  }
  if (form.value.udpStatus && !form.value.udpPort) {
    Message.warning('输入UDP端口号')
    return
  }
  loading.value = true

  const data = {
    id: form.value.id,
    name: form.value.name,
    type: form.value.type,
    status: form.value.monitoringStatus ? 1 : 2,
    syslogConfigValueDTOS: [
      {
        port: Number(form.value.udpPort),
        status: form.value.udpStatus ? 1 : 2,
        typeName: 'UDP'
      },
      {
        port: Number(form.value.tcpPort),
        status: form.value.tcpStatus ? 1 : 2,
        typeName: 'TCP'
      }
    ]
  }
  console.log('请求参数', data)
  request
    .Post('/syslog/config/save', data)
    .then((res: any) => {
      if (res && res.code === 1) {
        Message.success('配置成功')
        emit('upload')
        closeModal()
      } else {
        Message.error('配置失败')
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function handlePortInput(value: string) {
  // 过滤非数字字符
  value = value.replace(/\D/g, '')

  // 如果为空，直接返回
  if (value === '') return ''

  // 转换为数字并限制范围
  const num = parseInt(value)
  if (num < 0) return '0'
  if (num > 99999) return '99999'

  return value
}

defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="监控配置" title-align="start" :width="680" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <a-form ref="formRef" :model="form" auto-label-width>
      <a-form-item field="switch" label="监控状态" :rules="[{ type: 'boolean' }]">
        <a-switch v-model="form.monitoringStatus" />
      </a-form-item>
      <div class="mb-20 text-14 color-#999999">syslog配置</div>
      <!-- TCP -->
      <div class="flex">
        <a-form-item style="width: 180px" field="switch" label="TCP" :rules="[{ type: 'boolean' }]">
          <a-switch v-model="form.tcpStatus" />
        </a-form-item>
        <a-form-item label="端口号" field="tcpPort" :validate-trigger="['change', 'input']" hide-asterisk>
          <a-input v-model="form.tcpPort" placeholder="请输入" @input="form.tcpPort = handlePortInput(form.tcpPort)" />
        </a-form-item>
      </div>
      <!-- UDP -->
      <div class="flex">
        <a-form-item style="width: 180px" field="switch" label="UDP" :rules="[{ type: 'boolean' }]">
          <a-switch v-model="form.udpStatus" />
        </a-form-item>
        <a-form-item label="端口号" field="udpPort" :validate-trigger="['change', 'input']" hide-asterisk>
          <a-input v-model="form.udpPort" placeholder="请输入" @input="form.udpPort = handlePortInput(form.udpPort)" />
        </a-form-item>
      </div>
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
