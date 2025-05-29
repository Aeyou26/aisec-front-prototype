<script lang="ts" setup>
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import dayjs from 'dayjs'
import { copyText } from '@/utils/tools'
import request from '@/request'
import usePaginationAlova from '@/hooks/usePaginationAlova'
import KeyModal from './key-modal.vue'
import http from '@/request'

const emit = defineEmits(['refresh'])
const { visible, initData, openModal, closeModal } = useModalVisible<any>()
const keyModalRef = ref<any>(null)
const key = ref('')
const url = computed(() => `${window.location.origin}/universalChat?key=${key.value}`)
const apiUrl = computed(() => `${window.location.origin}/doc/chat/`)
const ruleList = [
  { label: '免登录', value: 1 },
  { label: '企业微信用户', value: 2 },
  { label: '指定用户', value: 3 }
]
const ruleSelect = ref(1)
const status = ref(false)
const userAllList = ref<any[]>([])
const userList = ref<any[]>([])

// 表格数据和筛选
interface SearchFormProps {
  talker?: string
  ability?: string
  likeStatus?: string
  status?: string
  timeRange?: string
}

const initSearchForm: SearchFormProps = {
  talker: void 0,
  ability: void 0,
  likeStatus: void 0,
  timeRange: void 0,
  status: void 0
}

const formData = reactive({ ...initSearchForm })

// 筛选项选项
const talkerOptions = ref<any[]>([])
const abilityOptions = ref<any[]>([])
const likeStatusOptions = ref<any[]>([
  { label: '赞', value: 1 },
  { label: '踩', value: 2 }
])
const statusOptions = ref<any[]>([
  { label: '正常', value: 1 },
  { label: '异常', value: 0 }
])

const { pagination, loading, taleData, onPageChange, onPageSizeChange, loadData } = usePaginationAlova(
  (params: any) => http.Post(`/digital/human/chat/records`, { ...params, key: key.value }),
  formData
)

function resetForm() {
  Object.assign(formData, { ...initSearchForm })
  loadData(true)
}
const getUserList = () => {
  // 获取所有用户
  request.Post<any>('/user/page', { page: 1, pageSize: 10000 }).then((res) => {
    userAllList.value = res.data
  })
  // 获取数字人授权用户
  request.Get<any>(`/digital/human/user/${initData.value.id}`).then((res) => {
    userList.value = res.data
  })
}
const submitLoading = ref(false)
async function onSubmit() {
  submitLoading.value = true
  const params = {
    id: initData.value?.id,
    controlType: ruleSelect.value,
    visitKey: key.value
  }
  if (ruleSelect.value === 3) {
    if (userList.value.length > 0) {
      await request
        .Post('/digital/human/user/save', {
          id: initData.value?.id,
          userIds: userList.value
        })
        .send()
        .finally(() => {
          submitLoading.value = false
        })
    } else {
      submitLoading.value = false
      Message.warning('请选择用户')
      return
    }
  }
  if (ruleSelect.value !== initData.value?.controlType) {
    await request
      .Post('/digital/human/update/controlType', params)
      .send()
      .finally(() => {
        submitLoading.value = false
      })
  }
  submitLoading.value = false
  closeModal()
  emit('refresh')
}
const statisticsTimeRange = ref<any[]>([dayjs().subtract(1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')])
const statisticsFrom = reactive<{ startTime: string; endTime: string }>({
  startTime: dayjs().subtract(1, 'week').format('YYYY-MM-DD 00:00:00'),
  endTime: dayjs().format('YYYY-MM-DD 23:59:59')
})
const shortcuts = [
  {
    label: '近7天',
    value: () => {
      statisticsFrom.startTime = dayjs().subtract(1, 'week').format('YYYY-MM-DD 00:00:00')
      statisticsFrom.endTime = dayjs().format('YYYY-MM-DD 23:59:59')
      return [statisticsFrom.startTime, statisticsFrom.endTime]
    }
  },
  {
    label: '近一月',
    value: () => {
      statisticsFrom.startTime = dayjs().subtract(1, 'month').format('YYYY-MM-DD 00:00:00')
      statisticsFrom.endTime = dayjs().format('YYYY-MM-DD 23:59:59')
      return [statisticsFrom.startTime, statisticsFrom.endTime]
    }
  },
  {
    label: '近三个月',
    value: () => {
      statisticsFrom.startTime = dayjs().subtract(3, 'month').format('YYYY-MM-DD 00:00:00')
      statisticsFrom.endTime = dayjs().format('YYYY-MM-DD 23:59:59')
      return [statisticsFrom.startTime, statisticsFrom.endTime]
    }
  },
  {
    label: '近半年',
    value: () => {
      statisticsFrom.startTime = dayjs().subtract(6, 'month').format('YYYY-MM-DD 00:00:00')
      statisticsFrom.endTime = dayjs().format('YYYY-MM-DD 23:59:59')
      return [statisticsFrom.startTime, statisticsFrom.endTime]
    }
  },
  {
    label: '近一年',
    value: () => {
      statisticsFrom.startTime = dayjs().subtract(1, 'year').format('YYYY-MM-DD 00:00:00')
      statisticsFrom.endTime = dayjs().format('YYYY-MM-DD 23:59:59')
      return [statisticsFrom.startTime, statisticsFrom.endTime]
    }
  }
]
const disabledDate = (current: any) => {
  return current && current > dayjs().endOf('day')
}
const statisticsData = ref<any>({
  dsNum: 0,
  unum: 0,
  qnum: 0,
  snum: 0
})
const getStatisticsData = () => {
  http.Post<any>(`/digital/human/overview`, { ...statisticsFrom, key: key.value }).then((res) => {
    if (res && res.data) {
      statisticsData.value = res.data
    }
  })
}
const changeStatus = () => {
  http.Post(`/digital/human/update/status/${initData.value?.id}`).then(() => {
    Message.success('操作成功')
    emit('refresh')
  })
}

function onBeforeOpen() {
  if (initData.value) {
    // if (initData.value.controlType === 3) {
    getUserList()
    // }
    ruleSelect.value = initData.value?.controlType
    key.value = initData.value?.visitKey
    status.value = initData.value?.isActive
    loadData(true)
    getStatisticsData()
  }
}
function onClose() {
  ruleSelect.value = 1
  userList.value = []
  statisticsTimeRange.value = [dayjs().subtract(1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
  statisticsFrom.startTime = dayjs().subtract(1, 'week').format('YYYY-MM-DD 00:00:00')
  statisticsFrom.endTime = dayjs().format('YYYY-MM-DD 23:59:59')
  closeModal()
}
function openUrl(url: string) {
  window.open(url, '_blank')
}
defineExpose({
  openModal
})
</script>

<template>
  <a-modal v-model:visible="visible" title="数字人概览" title-align="start" :width="1360" :mask-closable="false" @before-open="onBeforeOpen" @cancel="onClose">
    <KeyModal ref="keyModalRef" />
    <div class="text-16 text-#333333">
      <div>对接信息</div>
      <a-divider />
      <div class="flex items-center gap-96 text-14 mb-48">
        <div class="flex flex-col gap-16">
          <div class="flex items-center gap-12">
            <div class="w-84">公开访问地址</div>
            <a-switch v-model="status" size="small" @change="changeStatus" />
            <a-link>{{ url }}</a-link>
            <SvgIcon name="copy" :size="16" class="cursor-pointer" @click="copyText(url)" />
            <!-- <SvgIcon name="refresh" :size="16" class="cursor-pointer" /> -->
            <a-button type="outline" size="small" @click="openUrl(url)">演示</a-button>
          </div>
          <!-- <div class="flex items-center gap-12">
            <div class="w-84">API访问凭证</div>
            <a-link>{{ apiUrl }}</a-link>
            <SvgIcon name="copy" :size="16" class="cursor-pointer" @click="copyText(url)" />
            <a-button type="outline" size="small" @click="keyModalRef?.openModal(initData)">API Key</a-button>
          </div> -->
        </div>
        <a-divider direction="vertical" class="!h-60" />
        <div class="flex flex-col gap-16 flex-1">
          <div class="flex items-center gap-12">
            <div class="w-64">权限控制</div>
            <a-select v-model="ruleSelect" :options="ruleList" class="flex-1" />
          </div>
          <div v-if="ruleSelect === 3" class="flex items-center gap-12">
            <div class="w-64">用户选择</div>
            <a-select
              v-model="userList"
              multiple
              :options="userAllList"
              :field-names="{ label: 'realName', value: 'id' }"
              allow-clear
              :max-tag-count="6"
              class="flex-1"
              placeholder="请选择"
            />
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between w-full">
        <div>监控统计</div>
        <div class="flex items-center gap-8">
          <div class="text-14 text-#999999">统计范围:</div>
          <a-range-picker
            v-model="statisticsTimeRange"
            format="YYYY-MM-DD"
            shortcuts-position="left"
            :shortcuts="shortcuts"
            :disabled-date="disabledDate"
            :allow-clear="false"
            style="width: 280px"
            @change="getStatisticsData"
          />
        </div>
      </div>
      <a-divider />
      <div class="flex gap-48 px-24">
        <div class="w-1/3 h-100 flex flex-col justify-between bg-#2e66c70f rounded-8 py-14 px-32">
          <div class="text-14">用户总数</div>
          <div class="flex justify-between items-center">
            <SvgIcon name="user-total" size="24" />
            <div class="text-28 font-bold text-#2E66C7">{{ statisticsData.unum }}</div>
          </div>
        </div>
        <div class="w-1/3 h-100 flex flex-col justify-between bg-#2e66c70f rounded-8 py-14 px-32">
          <div class="text-14">提问次数</div>
          <div class="flex justify-between items-center">
            <SvgIcon name="question" size="24" />
            <div class="text-28 font-bold text-#2E66C7">{{ statisticsData.qnum }}</div>
          </div>
        </div>
        <!-- <div class="w-1/4 h-100 flex flex-col justify-between bg-#52B56F0f rounded-8 py-14 px-32">
          <div class="text-14">Tokens 总数</div>
          <div class="flex justify-between items-center">
            <SvgIcon name="token-total" size="24" />
            <div class="text-28 font-bold text-#52B56F">{{ statisticsData.snum }}</div>
          </div>
        </div> -->
        <div class="w-1/3 h-100 flex flex-col justify-between bg-#52B56F0f rounded-8 py-14 px-32">
          <div class="text-14">用户满意度</div>
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-8">
              <SvgIcon name="green-like" size="24" />
              <div class="text-28 font-bold text-#52B56F">{{ statisticsData.snum }}</div>
            </div>
            <div class="flex items-center gap-8">
              <SvgIcon name="red-dislike" size="24" />
              <div class="text-28 font-bold text-#DE1E1E">{{ statisticsData.dsNum }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="h-400 mt-36">
        <div>对话记录</div>
        <a-divider />
        <div class="mb-16">
          <SearchForm @query="loadData(true)" @reset="resetForm">
            <!-- <div class="search-item">
              <span>对话人</span>
              <a-select v-model="formData.talker" allow-clear placeholder="请选择">
                <a-option v-for="item in talkerOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
              </a-select>
            </div> -->
            <!-- <div class="search-item">
              <span>触发能力</span>
              <a-select v-model="formData.ability" allow-clear placeholder="请选择">
                <a-option v-for="item in abilityOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
              </a-select>
            </div> -->
            <div class="search-item">
              <span>反馈状态</span>
              <a-select v-model="formData.likeStatus" allow-clear placeholder="请选择">
                <a-option v-for="item in likeStatusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
              </a-select>
            </div>
            <div class="search-item">
              <span>执行结果</span>
              <a-select v-model="formData.status" allow-clear placeholder="请选择">
                <a-option v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</a-option>
              </a-select>
            </div>
          </SearchForm>
        </div>
        <a-table
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
            <a-table-column title="对话人" data-index="user" ellipsis tooltip :width="120">
              <template #cell="{ record }">
                <div v-if="record.user">{{ record.user }}</div>
                <div v-else>/</div>
              </template>
            </a-table-column>
            <a-table-column title="对话时间" data-index="createTime" ellipsis tooltip :width="180" />
            <!-- <a-table-column title="触发能力" data-index="ability" ellipsis tooltip /> -->
            <a-table-column title="用户输入" data-index="question" ellipsis tooltip :width="240" />
            <a-table-column title="结果输出" data-index="answer" ellipsis tooltip />
            <a-table-column title="反馈状态" data-index="likeStatus" ellipsis tooltip :width="120">
              <template #cell="{ record }">
                <div v-if="record.likeStatus === 1" class="text-#52B56F">赞</div>
                <div v-else-if="record.likeStatus === 2" class="text-#DE1E1E">踩</div>
                <div v-else>/</div>
              </template>
            </a-table-column>
            <a-table-column title="执行结果" data-index="status" ellipsis tooltip :width="120">
              <template #cell="{ record }">
                <div v-if="record.status === 1" class="text-#52B56F">正常</div>
                <div v-else-if="record.status === 0" class="text-#DE1E1E">异常</div>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </div>
    <template #footer>
      <a-space>
        <a-button @click="onClose()"> 取消 </a-button>
        <a-button type="primary" :loading="submitLoading" @click="onSubmit()"> 确定 </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style lang="less" scoped></style>
