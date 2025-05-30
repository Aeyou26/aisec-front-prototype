<template>
  <a-dropdown v-if="showTools" trigger="hover" position="bottom" :popup-max-height="400">
    <SvgIcon v-if="list.length" name="tools" size="24" class="cursor-pointer" />
    <template #content>
      <a-doption v-for="item in list" :key="item.id" @click="handleClick(item)">
        <div class="flex items-center gap-6">
          <template v-if="isAssessRobot">
            <img
              v-if="item.status === 1"
              src="@/assets/images/tool-run.png"
              size="18"
              class="rotating-icon w-18 h-18 rounded-full border-1 border-#3376ff border-solid"
            />
            <img v-else src="@/assets/images/tool-no-run.png" size="18" class="w-18 h-18 rounded-full border-1 border-#aeaeae border-solid" />
          </template>
          <img v-else src="@/assets/images/tool-status.png" size="18" />
          <span class="text-14 text-#333333">{{ item.name }}</span>
        </div>
      </a-doption>
    </template>
  </a-dropdown>
  <AddCodeModal ref="addCodeModalRef" />
  <ReportModal ref="reportModalRef" />
  <AssetMonitoring ref="assetMonitoringRef" />
  <RiskMonitoring ref="riskMonitoringRef" />
  <InformationGathering ref="informationGatheringRef" />
  <EquipmentAnalysis ref="equipmentAnalysisRef" />
  <FlowAnalysis ref="flowAnalysisRef" />
  <VulnerabilityScanning ref="vulnerabilityScanningRef" />
  <PhishingEmail ref="phishingEmailRef" />
  <LogAnalysis ref="logAnalysisRef" />
  <DataRecognition ref="dataRecognitionRef" />
  <ClassificationGrading ref="classificationGradingRef" />
  <AuditReport ref="auditReportRef" />
</template>

<script setup lang="ts">
import AddCodeModal from './components/add-code-modal.vue'
import ReportModal from './components/report-modal.vue'
import AssetMonitoring from './components/asset-monitoring.vue'
import RiskMonitoring from './components/risk-monitoring.vue'
import InformationGathering from './components/information-gathering.vue'
import EquipmentAnalysis from './components/equipment-analysis.vue'
import FlowAnalysis from './components/flow-analysis.vue'
import VulnerabilityScanning from './components/vulnerability-scanning.vue'
import PhishingEmail from './components/phishing-email.vue'
import LogAnalysis from './components/log-analysis.vue'
import DataRecognition from './components/data-recognition.vue'
import ClassificationGrading from './components/classification-grading.vue'
import AuditReport from './components/audit-report.vue'
import { sourceCodeAuditToolList, assetMonitorToolList, securityOperationToolList, securityAnalysisToolList, classificationToolList } from './dict'

const addCodeModalRef = ref<InstanceType<typeof AddCodeModal>>()
const reportModalRef = ref<InstanceType<typeof ReportModal>>()
const assetMonitoringRef = ref<InstanceType<typeof AssetMonitoring>>()
const riskMonitoringRef = ref<InstanceType<typeof RiskMonitoring>>()
const informationGatheringRef = ref<InstanceType<typeof InformationGathering>>()
const equipmentAnalysisRef = ref<InstanceType<typeof EquipmentAnalysis>>()
const flowAnalysisRef = ref<InstanceType<typeof FlowAnalysis>>()
const vulnerabilityScanningRef = ref<InstanceType<typeof VulnerabilityScanning>>()
const phishingEmailRef = ref<InstanceType<typeof PhishingEmail>>()
const logAnalysisRef = ref<InstanceType<typeof LogAnalysis>>()
const dataRecognitionRef = ref<InstanceType<typeof DataRecognition>>()
const classificationGradingRef = ref<InstanceType<typeof ClassificationGrading>>()
const auditReportRef = ref<InstanceType<typeof AuditReport>>()
const chatStore = useChatStore()
const robotInfo = computed(() => chatStore.currentInfo)
const route = useRoute()
const isAssessRobot = computed(() => robotInfo.value.robotId === '3')
const showTools = computed(() => {
  return route.path !== '/home' && !route.path.includes('/admin')
})
const list = computed(() => {
  let arr: any[] = []
  switch (robotInfo.value.robotId) {
    case '1':
      arr = sourceCodeAuditToolList
      break
    case '2':
      arr = securityAnalysisToolList
      break
    case '3':
      arr = assetMonitorToolList
      break
    case '4':
      arr = classificationToolList
      break
    case '7':
      arr = securityOperationToolList
      break
    default:
      break
  }
  return arr
})
const handleClick = (item: any) => {
  // 源码审计 打开 上传分析
  if ([1, 2, 3, 4].includes(item.id)) {
    addCodeModalRef.value?.openModal({ title: item.name, params: { robotId: robotInfo.value.robotId, abilityId: item.id } })
  }
  switch (item.id) {
    // 资产监控
    case 5:
      assetMonitoringRef.value?.openModal(item)
      break
    // 风险监控
    case 6:
      riskMonitoringRef.value?.openModal(item)
      break
    // 信息收集
    case 7:
      informationGatheringRef.value?.openModal()
      break
    // 设备分析
    case 8:
      equipmentAnalysisRef.value?.openModal()
      break
    // 流量分析
    case 9:
      flowAnalysisRef.value?.openModal()
      break
    // 漏洞扫描
    case 10:
      vulnerabilityScanningRef.value?.openModal()
      break
    // 资产报告
    case 11:
      reportModalRef.value?.openModal({ robotId: robotInfo.value.robotId })
      break
    // 钓鱼邮件
    case 12:
      phishingEmailRef.value?.openModal()
      break
    // 日志分析
    case 13:
      logAnalysisRef.value?.openModal()
      break
    // 数据识别
    case 14:
      dataRecognitionRef.value?.openModal()
      break
    // 分类分级
    case 15:
      classificationGradingRef.value?.openModal()
      break
    // 审计报告
    case 16:
      auditReportRef.value?.openModal()
      break
    default:
      break
  }
}
</script>

<style scoped>
.rotating-icon {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
