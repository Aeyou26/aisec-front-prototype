<template>
  <div class="layout">
    <!-- 添加一个手机验证码模块 -->
    <a-modal
      v-model:visible="showPhoneVerification"
      title="手机验证"
      :width="480"
      :mask-closable="false"
      :unmount-on-close="false"
      :closable="false"
      modal-class="phone-verification-modal"
      :mask="false"
      @cancel="cancelPhoneVerification"
    >
      <a-form :model="phoneForm" layout="vertical">
        <div v-if="phoneForm.mobile" class="text-14 text-#333333 mb-24">手机号码: {{ phoneForm.mobile }}</div>
        <a-form-item field="captcha" label="图片验证码" :rules="[{ required: true, message: '请输入图片验证码' }]" :validate-trigger="['change', 'input']">
          <div class="w-full flex items-center gap-10">
            <a-input v-model="phoneForm.captcha" class="flex-1" placeholder="请输入图片验证码">
              <template #prefix>
                <SvgIcon name="verify" size="24" />
              </template>
            </a-input>
            <img :src="captchaUrl" alt="验证码" class="cursor-pointer w-84 h-34" @click="refreshCaptcha" />
          </div>
        </a-form-item>
        <a-form-item field="code" label="短信验证码" :rules="[{ required: true, message: '请输入短信验证码' }]">
          <a-input v-model="phoneForm.code" placeholder="请输入短信验证码" allow-clear>
            <template #suffix>
              <a-link :disabled="isSendingCode" @click="sendVerificationCode">
                {{ codeBtnText }}
              </a-link>
            </template>
          </a-input>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button type="primary" @click="verifyCode">确定</a-button>
        </a-space>
      </template>
    </a-modal>
    <template v-if="!showPhoneVerification">
      <AddLoophole ref="addLoopholeRef" @submit="onAddLoophole" />
      <!-- 反馈已提交 -->
      <div v-if="isFeedback" class="layout-content">
        <div class="flex items-center justify-center h-full">
          <div class="flex flex-col items-center gap-24">
            <SvgIcon name="feedback-success" size="150" />
            <div class="text-24 font-bold">反馈已提交</div>
            <div class="text-gray-500">您的反馈已成功提交，正在等待审核</div>
          </div>
        </div>
      </div>
      <!-- 反馈未提交 -->
      <div v-else class="layout-content">
        <div class="flex justify-end items-center">
          <div class="flex items-center gap-14">
            <div v-if="[0, 1].includes(pageStatus)" class="flex items-center gap-14">
              <span class="text-14 text-#333333 whitespace-nowrap">上传附件</span>
              <a-upload
                action="/api/supplier/feedback/file/upload"
                :headers="{ Authorization: token, id: issuanceRecordId, token: token }"
                :show-file-list="false"
                :limit-size="10 * 1024 * 1024"
                @before-upload="beforeUpload"
                @success="onSuccess"
                @error="onError"
              >
                <a-button type="outline"> <icon-upload /> 请选择</a-button>
              </a-upload>
            </div>
            <a-button v-if="[0, 1].includes(pageStatus)" type="primary" @click="feedback">{{ pageStatus === 1 ? '再次提交' : '提交' }}</a-button>
            <a-button v-if="pageStatus === 11" type="primary" @click="createOrUpdateIssuanceRecord(1)">下发</a-button>
            <a-button v-if="pageStatus === 11" type="outline" @click="createOrUpdateIssuanceRecord(0)">保存</a-button>
            <a-button v-if="pageStatus === 12" type="primary" @click="audit(3)">通过</a-button>
            <a-button v-if="pageStatus === 12" type="outline" status="danger" @click="audit(1)">驳回</a-button>
            <a-button v-if="![0, 1].includes(pageStatus)" type="outline" @click="goBack">返回</a-button>
          </div>
        </div>
        <a-descriptions bordered :column="3">
          <template v-if="pageStatus === 11">
            <a-descriptions-item label="通知标题" :span="2">
              <a-input v-model="formData.noticeName" class="no-border" :max-length="20" allow-clear show-word-limit placeholder="请输入"></a-input>
            </a-descriptions-item>
            <a-descriptions-item label="最迟反馈时间">
              <a-date-picker
                v-model="formData.lastFeedbackTime"
                :style="{ border: 'none', width: '100%' }"
                :disabled-date="disabledDate"
                :disabled-time="disabledTime"
                show-time
                :time-picker-props="{ defaultValue: '18:00:00' }"
                format="YYYY-MM-DD HH:mm:ss"
              />
            </a-descriptions-item>
            <a-descriptions-item v-if="vendors.length === 1" label="供应商名称"> {{ vendors[0] }} </a-descriptions-item>
            <a-descriptions-item v-if="vendors.length === 1" label="联系人"> {{ contactList }} </a-descriptions-item>
            <a-descriptions-item v-if="vendors.length === 1" label="联系电话"> {{ phoneList }} </a-descriptions-item>
          </template>
          <a-descriptions-item v-if="[0, 1, 12, 13].includes(pageStatus) && issuanceRecord.vendor" label="供应商名称"> {{ issuanceRecord.vendor }} </a-descriptions-item>
          <a-descriptions-item v-if="[0, 1, 12, 13].includes(pageStatus) && issuanceRecord.contactList" label="联系人">
            {{ issuanceRecord.contactList }}
          </a-descriptions-item>
          <a-descriptions-item v-if="[0, 1, 12, 13].includes(pageStatus) && issuanceRecord.phoneList" label="联系电话">
            {{ issuanceRecord.phoneList }}
          </a-descriptions-item>
          <a-descriptions-item v-if="[0, 1, 12, 13].includes(pageStatus)" label="通知标题"> {{ issuanceRecord.noticeName }} </a-descriptions-item>
          <a-descriptions-item v-if="[0, 1, 12, 13].includes(pageStatus)" label="附件">
            <a-space wrap :size="8">
              <a-tag
                v-for="item in issuanceRecord.fileList"
                :key="item.id"
                color="blue"
                :closable="[0, 1].includes(pageStatus)"
                class="cursor-pointer"
                @click="downloadFile(item.name)"
                @close="deleteFile(item.name)"
              >
                <a-tooltip :content="`点击下载: ${item.name}`">
                  <span class="truncate max-w-120">{{ item.name }}</span>
                </a-tooltip>
              </a-tag>
            </a-space>
          </a-descriptions-item>
          <a-descriptions-item v-if="[0, 1, 12, 13].includes(pageStatus)" label="下发时间"> {{ issuanceRecord.createTime }} </a-descriptions-item>
          <a-descriptions-item v-if="[0, 1, 12, 13].includes(pageStatus)" label="最迟反馈时间"> {{ issuanceRecord.lastFeedbackTime }} </a-descriptions-item>
          <a-descriptions-item v-if="[0, 1, 12, 13].includes(pageStatus) && issuanceRecord.auditTime" label="审核时间">
            {{ issuanceRecord.auditTime }}
          </a-descriptions-item>
          <a-descriptions-item v-if="[0, 1, 11, 12, 13].includes(pageStatus)" label="通知内容" :span="3">
            <a-textarea
              v-if="[11].includes(pageStatus)"
              v-model="formData.description"
              :auto-size="{
                minRows: 4,
                maxRows: 6
              }"
              placeholder="请输入通知内容"
            />
            <span v-else>{{ formData.description }}</span>
          </a-descriptions-item>
          <a-descriptions-item v-if="[0, 1, 12, 13].includes(pageStatus)" label="反馈说明" :span="3">
            <a-textarea
              v-if="[0, 1].includes(pageStatus)"
              v-model="formData.feedbackDesc"
              :auto-size="{
                minRows: 4,
                maxRows: 6
              }"
              placeholder="请输入反馈说明"
            />
            <span v-else>{{ formData.feedbackDesc }}</span>
          </a-descriptions-item>
          <a-descriptions-item v-if="[1, 12, 13].includes(pageStatus)" label="审核意见" :span="3">
            <a-textarea
              v-if="[12].includes(pageStatus)"
              v-model="formData.auditDesc"
              :auto-size="{
                minRows: 4,
                maxRows: 6
              }"
              placeholder="请输入审核意见"
            />
            <span v-else>{{ formData.auditDesc }}</span>
          </a-descriptions-item>
          <a-descriptions-item v-if="[11].includes(pageStatus)" label="通知配置" :span="3">
            <a-space>
              <a-radio-group v-model="formData.authMethod">
                <a-radio :value="1">短信</a-radio>
                <!-- <a-radio :value="2">邮件</a-radio> -->
              </a-radio-group>
              <a-input v-if="formData.authMethod === 1" v-model="formData.authAccount" placeholder="请输入手机号" :max-length="11" allow-clear show-word-limit />
              <a-input v-if="formData.authMethod === 2" v-model="formData.authAccount" placeholder="请输入邮箱" :max-length="50" allow-clear show-word-limit />
            </a-space>
          </a-descriptions-item>
        </a-descriptions>
        <div class="flex justify-between items-center">
          <div class="font-bold text-16">下发漏洞列表</div>
          <a-space>
            <a-button v-if="pageStatus === 11" status="danger" :disabled="selectedKeys.length === 0" type="outline" @click="deleteVuln">批量删除</a-button>
            <a-button v-if="pageStatus === 11" type="primary" class="!w-100" @click="addLoopholeRef.openModal(taleData)">新增漏洞</a-button>
          </a-space>
        </div>
        <div class="flex-1 h-full overflow-hidden min-h-300">
          <a-table
            v-model:selected-keys="selectedKeys"
            :row-selection="rowSelection"
            row-key="id"
            :scroll="{ x: '100%', y: '100%' }"
            :bordered="false"
            :data="taleData"
            :loading="loading"
            :pagination="pagination"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
          >
            <template #columns>
              <a-table-column title="序号" :width="80" align="center">
                <template #cell="{ rowIndex }"> {{ rowIndex + 1 + ((pagination.current || 1) - 1) * (pagination.pageSize || 10) }} </template>
              </a-table-column>
              <a-table-column title="漏洞名称" data-index="vulnName" :width="180" ellipsis tooltip />
              <a-table-column title="漏洞类型" data-index="vulnTypeName" :width="140" ellipsis tooltip />
              <a-table-column title="漏洞等级" data-index="vulnLevel" :width="140" ellipsis tooltip />
              <a-table-column title="详情" data-index="vulnDesc" ellipsis tooltip />
              <a-table-column v-if="[12, 13].includes(pageStatus)" title="状态" data-index="vulnStatus" ellipsis tooltip />
              <a-table-column v-if="[0, 1, 11].includes(pageStatus)" title="状态" data-index="opt" fixed="right" ellipsis tooltip :width="140">
                <template #title>
                  <a-space>
                    <span>{{ pageStatus !== 11 ? '状态' : '操作' }}</span>
                    <a-tooltip v-if="[0, 1].includes(pageStatus)" content="显示当前状态，修复后点击切换状态">
                      <icon-info-circle :size="16" />
                    </a-tooltip>
                  </a-space>
                </template>
                <template #cell="{ record }">
                  <a-link v-if="[11].includes(pageStatus)" class="!text-#DE1E1E" @click="deleteData(record.id)"> 删除 </a-link>
                  <a-link v-if="[0, 1].includes(pageStatus) && record.vulnStatus === '待修复'" class="!text-#DE1E1E" @click="handleVulnStatus(record, '已修复')">
                    待修复
                  </a-link>
                  <a-link v-if="[0, 1].includes(pageStatus) && record.vulnStatus !== '待修复'" class="!text-#2E66C7" @click="handleVulnStatus(record, '待修复')">
                    已修复
                  </a-link>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePaginationFront } from '@/hooks/usePaginationAlova'
import http from '@/request'
import AddLoophole from './components/add-loophole.vue'
import { confirmModal } from '@/utils/modal'
import { Message, TableRowSelection } from '@arco-design/web-vue'
import moment from 'moment'

const { token } = storeToRefs(useUserStore())
// 手机验证相关数据
const showPhoneVerification = ref(false)
const phoneForm = reactive({
  mobile: '',
  captcha: '',
  code: ''
})
const isSendingCode = ref(false)
const captchaUrl = ref('')
const countdown = ref(60)
const codeBtnText = computed(() => {
  return isSendingCode.value ? `${countdown.value}秒后重新获取` : '获取验证码'
})
const captchaTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const getPhone = () => {
  http.Get<any>('/supplier/feedback/getVerifyPhone', { params: { id: issuanceRecordId.value } }).then((res) => {
    phoneForm.mobile = res.data
  })
}
const refreshCaptcha = () => {
  phoneForm.captcha = ''
  http.Get<any>('/supplier/feedback/captcha', { params: { id: issuanceRecordId.value } }).then((res) => {
    // 返回base64图片
    captchaUrl.value = `data:image/png;base64,${res.data?.captcha}`
    // 重置定时器
    if (captchaTimer.value) {
      clearTimeout(captchaTimer.value)
    }
    // 设置新的定时器，3分钟后刷新验证码
    captchaTimer.value = setTimeout(
      () => {
        refreshCaptcha()
      },
      3 * 60 * 1000
    )
  })
}
// 关闭手机验证
const cancelPhoneVerification = () => {
  showPhoneVerification.value = false
}

// 发送验证码
const sendVerificationCode = () => {
  if (!phoneForm.captcha) {
    Message.error('请输入图片验证码')
    return
  }

  isSendingCode.value = true
  // 发送验证码请求
  http
    .Post('/supplier/feedback/sms', {
      id: issuanceRecordId.value,
      captcha: phoneForm.captcha
    })
    .then((res: any) => {
      if (res.code === 1) {
        Message.success('验证码发送成功')
        // 开始倒计时
        startCountdown()
      } else {
        Message.error(res.msg || '验证码发送失败')
        isSendingCode.value = false
      }
    })
    .catch(() => {
      Message.error('验证码发送失败')
      isSendingCode.value = false
    })
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      isSendingCode.value = false
    }
  }, 1000)
}

// 验证验证码
const verifyCode = () => {
  if (!phoneForm.code) {
    Message.error('请输入正确的验证码')
    return
  }

  // 验证验证码请求
  http
    .Post('/supplier/feedback/verify', {
      id: issuanceRecordId.value,
      code: phoneForm.code
    })
    .then((res: any) => {
      if (res.code === 1) {
        Message.success('验证成功')
        // 清除定时器
        if (captchaTimer.value) {
          clearTimeout(captchaTimer.value)
        }
        token.value = res.data.token
        // TODO: 验证成功后的逻辑
        // 11, 12, 13 需要权限的获取记录
        getSupplierVuln([11, 12, 13].includes(pageStatus.value))
        showPhoneVerification.value = false
      } else {
        Message.error(res.msg || '验证失败')
      }
    })
    .catch(() => {
      Message.error('验证失败')
    })
}

// 是否已经反馈
const isFeedback = ref(false)
// 下发记录
const issuanceRecord = reactive<any>({
  vendor: '', // 供应商名称
  noticeName: '', // 通知标题
  lastFeedbackTime: '', // 最迟反馈时间
  description: '', // 通知内容
  feedbackDesc: '', // 反馈说明
  auditDesc: '', // 审核意见
  createTime: '', // 下发时间
  auditTime: '', // 审核时间
  contactList: '', // 联系人
  phoneList: '', // 联系电话
  fileList: [] // 附件列表
})
const issuanceRecordId = ref('')
const selectedKeys = ref<any[]>([])
const rowSelection = reactive<TableRowSelection>({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
})
const vendors = ref<string[]>([])
const contactList = ref<string>('')
const phoneList = ref<string>('')
const router = useRouter()
const route = useRoute()
const addLoopholeRef = ref<any>()
const pageStatus = ref(0) // 前端页面判断显示内容 0: 反馈  1: 再次反馈   11: 下发  12: 审核 13: 查看
const formData = reactive({
  noticeName: '',
  lastFeedbackTime: '',
  description: '',
  feedbackDesc: '',
  auditDesc: '',
  authMethod: 1, // 通知配置
  authAccount: '' // 通知账号
})
const disabledDate = (current: any) => {
  return current && current < moment().startOf('day')
}
const disabledTime = (current: any) => {
  const now = moment()

  // 如果选择的是今天，禁用当前时间之前的时间
  if (current && moment(current).isSame(now, 'day')) {
    return {
      disabledHours: () => range(0, now.hour()),
      disabledMinutes: () => (current && moment(current).hour() === now.hour() ? range(0, now.minute()) : []),
      disabledSeconds: () => (current && moment(current).hour() === now.hour() && moment(current).minute() === now.minute() ? range(0, now.second()) : [])
    }
  }
  return {}
}

// 辅助函数用于生成范围数组
function range(start: number, end: number) {
  const result = []
  for (let i = start; i < end; i++) {
    result.push(i)
  }
  return result
}

interface TaleDataItem {
  id: string
}
const { pagination, data, taleData, loading, onPageChange, onPageSizeChange, loadData } = usePaginationFront(() => http.Post('/supplier/vuln', vendors.value), {})
async function deleteData(id: string) {
  await confirmModal('提示', '确定删除该漏洞吗？后续可从新增漏洞中添加恢复')
  // 从 data 中删除指定 id 的数据
  data.value.data = data.value.data.filter((item: TaleDataItem) => item.id !== id)
}
// 批量删除
const deleteVuln = async () => {
  await confirmModal('提示', '确定删除该漏洞吗？后续可从新增漏洞中添加恢复')
  // 从 data 中删除指定 id 的数据
  data.value.data = data.value.data.filter((item: TaleDataItem) => !selectedKeys.value.includes(item.id))
  selectedKeys.value = []
}
// 添加进漏洞列表
function onAddLoophole(selectedData: any[]) {
  // 添加到第一个
  data.value.data?.unshift(...selectedData)
  Message.success('添加成功')
}
// 用于提交的漏洞列表
const submitVulnList = computed(() => {
  return taleData.value.map((item: any) => {
    return {
      id: item.id,
      vulnId: item.vulnId,
      vendor: item.vendor,
      vulnStatus: item.vulnStatus
    }
  })
})
// 创建/修改下发记录
const createOrUpdateIssuanceRecord = (status: number) => {
  if (!formData.noticeName) {
    Message.error('请输入通知标题')
    return
  }
  if (!formData.description) {
    Message.error('请输入通知内容')
    return
  }
  if (!formData.lastFeedbackTime) {
    Message.error('请输入最迟反馈时间')
    return
  }
  if (formData.authMethod === 1 && !formData.authAccount) {
    Message.error('请输入通知账号')
    return
  }
  // 校验手机号
  if (formData.authMethod === 1 && !/^1[3-9]\d{9}$/.test(formData.authAccount)) {
    Message.error('请输入正确的手机号码')
    return
  }
  const url = issuanceRecordId.value ? '/supplier/notice/modify' : '/supplier/notice/create'
  const params: any = {
    description: formData.description,
    lastFeedbackTime: formData.lastFeedbackTime,
    noticeName: formData.noticeName,
    status,
    authMethod: formData.authMethod,
    authAccount: formData.authAccount,
    vulnList: submitVulnList.value
  }
  if (issuanceRecordId.value) {
    params.id = issuanceRecordId.value
    params.vulnList = submitVulnList.value.map((item: any) => item.vulnId)
  }
  http.Post(url, params).then((res: any) => {
    Message.success(res.msg || '操作成功')
    goBack()
  })
}
// 上传附件成功
const onSuccess = (res: any) => {
  if (res.response.code === 1) {
    Message.success('上传成功')
    issuanceRecord.fileList = [...issuanceRecord.fileList, { id: Math.random().toString(36).substring(2, 15), name: res.response.data }]
  } else {
    Message.error('上传失败')
  }
}
const onError = () => {
  Message.error('上传失败')
}

// 上传前检查文件大小
const beforeUpload = (file: File) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    Message.error('文件大小不能超过10MB')
    return false
  }
  return true
}

const downloadFile = (name: string) => {
  http
    .Get('/user/check/token')
    .send()
    .then(() => {
      location.href = `/api/supplier/feedback/file/download?fileName=${name}`
    })
}
// 删除附件
const deleteFile = (name: string) => {
  issuanceRecord.fileList = issuanceRecord.fileList.filter((item: any) => item.name !== name)
  http
    .Delete('/supplier/feedback/file/delete', {
      fileName: name
    })
    .send()
}
const handleVulnStatus = (record: any, status: string) => {
  record.vulnStatus = status
}
// 反馈
const feedback = () => {
  if (issuanceRecord.fileList.length === 0) {
    Message.error('请上传附件')
    return
  }
  if (!formData.feedbackDesc) {
    Message.error('请输入反馈说明')
    return
  }
  http
    .Post('/supplier/feedback', {
      attachment: issuanceRecord.fileList.map((item: any) => item.name),
      feedbackDesc: formData.feedbackDesc,
      id: issuanceRecordId.value,
      vulnList: submitVulnList.value
    })
    .then((res: any) => {
      Message.success(res.msg || '操作成功')
      isFeedback.value = true
    })
}
// 审核 通过：3 驳回：1
const audit = (status: number) => {
  if (!formData.auditDesc) {
    Message.error('请输入审核意见')
    return
  }
  http
    .Post('/supplier/audit', {
      auditDesc: formData.auditDesc,
      id: issuanceRecordId.value,
      status
    })
    .then((res: any) => {
      Message.success(res.msg || '操作成功')
      goBack()
    })
}
// 根据下发记录获取供应商漏洞
const getSupplierVuln = (permission = true) => {
  const url = permission ? '/supplier/getNotice' : '/supplier/feedback/getNotice'
  http
    .Get(url, {
      params: {
        id: issuanceRecordId.value
      }
    })
    .then((res: any) => {
      if (res.data) {
        showPhoneVerification.value = false
        // 更新issuanceRecord
        Object.assign(issuanceRecord, res.data)
        issuanceRecord.fileList = res.data.attachment.map((item: any) => {
          return {
            id: Math.random().toString(36).substring(2, 15),
            name: item
          }
        })
        // 如果存在审核意见，则设置为再次反馈
        if (res.data.auditDesc && pageStatus.value === 0) {
          pageStatus.value = 1
        }
        // 更新表单数据
        formData.noticeName = res.data.noticeName || ''
        formData.lastFeedbackTime = res.data.lastFeedbackTime || ''
        formData.description = res.data.description || ''
        formData.feedbackDesc = res.data.feedbackDesc || ''
        formData.auditDesc = res.data.auditDesc || ''
        formData.authMethod = res.data.authMethod || 1
        formData.authAccount = res.data.authAccount || ''

        // 如果有漏洞数据，更新到taleData
        if (res.data.vulnList && res.data.vulnList.length > 0) {
          data.value.data = res.data.vulnList.map((item: any) => {
            return {
              ...item,
              vendor: item.vendor || vendors.value[0]
            }
          })
        }
      } else {
        // 说明已经反馈 等待审核
        isFeedback.value = true
      }
    })
    .catch((err: any) => {
      showPhoneVerification.value = true
    })
}
const goBack = () => {
  router.back()
}

onMounted(async () => {
  pageStatus.value = Number(route.query.status || 0)
  try {
    const vList = sessionStorage.getItem('vendors')
    vendors.value = vList ? JSON.parse(vList) : []
  } catch (error) {
    vendors.value = []
  }
  try {
    const cList = sessionStorage.getItem('contactList')
    contactList.value = cList ? JSON.parse(cList) : ''
  } catch (error) {
    contactList.value = ''
  }
  try {
    const pList = sessionStorage.getItem('phoneList')
    phoneList.value = pList ? JSON.parse(pList) : ''
  } catch (error) {
    phoneList.value = ''
  }
  if (route.query.id) {
    issuanceRecordId.value = route.query.id as string
    localStorage.setItem('issuanceRecordId', issuanceRecordId.value)
    // 11, 12, 13 需要权限的获取记录
    getSupplierVuln([11, 12, 13].includes(pageStatus.value))
  } else {
    await loadData(true)
  }
  if ([0, 1].includes(pageStatus.value)) {
    getPhone()
    refreshCaptcha()
  }
})
onUnmounted(() => {
  if (captchaTimer.value) {
    clearInterval(captchaTimer.value)
  }
})
</script>
<style scoped lang="less">
.layout {
  padding: 24px;
  width: 100%;
  height: 100%;
  background: url('@/assets/images/chat-bg.png') no-repeat center center;
  background-size: cover;

  .layout-content {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 28px;
    border-radius: 14px;
    opacity: 1;
    background: #fff;
    box-shadow: 0 8px 40px 0 #00266914;
    display: flex;
    flex-direction: column;
    gap: 20px;

    :deep(.arco-descriptions-row) {
      .arco-descriptions-item-label,
      .arco-descriptions-item-value {
        color: #333 !important;
        font-size: 14px !important;
        padding: 10px 14px !important;
      }
    }

    :deep(.arco-link-disabled) {
      color: #999 !important;
    }

    :deep(.arco-textarea-wrapper) {
      border: none !important;

      .arco-textarea {
        border: none !important;
        padding: 0 !important;
      }
    }

    .no-border {
      border: none !important;
      padding: 0 !important;
    }

    :deep(.arco-picker-size-medium) {
      border: none !important;
      padding: 0 !important;

      .arco-picker-start-time {
        padding: 0 !important;
      }
    }
  }
}
</style>
