<script lang="ts" setup>
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'

const { visible, initData, openModal, closeModal } = useModalVisible<any>()
const data = ref<any>({})
function onBeforeOpen() {
  if (initData) {
    data.value = initData.value
  }
}

function onClose() {
  closeModal()
}
defineExpose({
  openModal
})
</script>

<template>
  <a-modal
    v-model:visible="visible"
    title="漏洞详情"
    title-align="start"
    :width="800"
    :mask-closable="false"
    :footer="false"
    @before-open="onBeforeOpen"
    @cancel="onClose"
  >
    <a-descriptions :column="2" bordered size="large" class="pb-24">
      <a-descriptions-item label="漏洞名称">
        <span>{{ data?.vulnName || '-' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="漏洞类型">
        <span>{{ data?.vulnTypeName || '-' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="漏洞等级">
        <span>{{ data?.vulnLevel || '-' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="所属单位">
        <span>{{ data?.deptName || '-' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="漏洞来源">
        <span>{{ data?.sourceName || '-' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="漏洞描述">
        <span>{{ data?.vulnDesc || '-' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="产生原因">
        <span>{{ data?.cause || '-' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="修复建议">
        <span>{{ data?.repairSuggest || '-' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="影响位置">
        <span>{{ data?.vulnLocation || '-' }}</span>
      </a-descriptions-item>
    </a-descriptions>
  </a-modal>
</template>
