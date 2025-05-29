<template>
  <div
    class="shadow-[0_4px_4px_0_#0000000d] rounded-8 border-1 border-solid border-#fff hover:drop-shadow-[0_8px_12px_rgba(255,255,255,1)] hover:bg-[#ffffff5e]"
    :style="{ background: 'linear-gradient(115deg, #dddcff33 3.35%, #d3edff33 100%), #ffffff4d' }"
  >
    <div class="flex-bc px-16 py-16 border-b-1 border-b-solid border-b-[#dfdfdf] font-600">
      <a-tooltip v-if="data.knowledgeName.length > 30" :content="data.knowledgeName">
        <div class="w-full truncate">{{ data.knowledgeName }}</div>
      </a-tooltip>
      <div v-else class="w-full truncate">{{ data.knowledgeName }}</div>
      <a-dropdown trigger="hover" @select="handleSelect">
        <div class="i-assets-icon-more !text-18 !text-#7265FF cursor-pointer" />
        <template #content>
          <a-doption value="edit" class="!p-0">
            <div class="flex-center w-88 gap-x-8 hover:bg-#D5EEFF mt-10">
              <div class="i-assets-icon-icon-edit"></div>
              编辑
            </div>
          </a-doption>
          <a-doption value="remove" class="!p-0">
            <div class="flex-center w-88 gap-x-8 hover:bg-#D5EEFF mb-10">
              <div class="i-assets-icon-icon-delete"></div>
              删除
            </div>
          </a-doption>
        </template>
      </a-dropdown>
    </div>
    <div class="px-16 py-8">
      <a-descriptions :data="detail" :column="1" :label-style="{ 'vertical-align': 'baseline' }" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import request from '@/request'
import { Message, Progress } from '@arco-design/web-vue'
import { IconRefresh } from '@arco-design/web-vue/es/icon'
// import { confirmModal } from '@/utils/modal'

const emits = defineEmits(['edit', 'update'])
const props = withDefaults(
  defineProps<{
    data: Record<string, any>
  }>(),
  {
    data: () => ({})
  }
)
const { data } = toRefs(props)
const delLoading = ref(false)
const visible = ref(false)
const statusText = {
  0: '排队中',
  1: '训练中',
  2: '已完成训练',
  3: '训练失败'
}
const statusColor = ['#0089F4', '#0089F4', '#01B4A2', '#F14959']
const statusLineColor = ['#D9D9D9', '#0089F4', '#01B4A2', '#F14959']
const detail = computed(() => {
  return [
    {
      label: '应用场景',
      value: data.value.applyScan
    },
    {
      label: '数据来源',
      value: data.value.dataSource
    },
    {
      label: '当前状态',
      value: () =>
        // h(Tag, {
        //   color: statusColor[data.value.status],
        //   innerHTML: statusText[data.value.status] || '-'
        // })
        h('div', { style: { lineHeight: 1 } }, [
          h('div', { class: 'flex items-center justify-between' }, [
            h('div', { style: { color: statusColor[data.value.status] }, innerHTML: statusText[data.value.status as keyof typeof statusText] || '-' }),
            h('div', { style: { color: statusColor[data.value.status], display: data.value.status === 3 ? 'none' : 'block' }, innerHTML: data.value.schedule || '0%' }),
            h(IconRefresh, {
              size: 16,
              style: {
                color: statusColor[data.value.status],
                display: data.value.status === 3 ? 'block' : 'none'
              },
              // 添加点击事件监听器
              onClick: () => {
                request.Post<any>('/knowledge/reTrain', { id: data.value.id }).then((res) => {
                  const { code, msg } = res
                  if (code === 1) {
                    emits('update')
                    Message.success(msg || '操作成功')
                  }
                })
              }
            })
          ]),
          h(Progress, {
            percent: convertPercentageToDecimal(data.value.schedule || '0%'),
            showText: false,
            strokeWidth: 2,
            color: statusLineColor[data.value.status],
            trackColor: '#D9D9D9'
          })
        ])
    },
    {
      label: '进度',
      value: data.value.schedule || '0%'
    },
    {
      label: '关联机器人',
      value: data.value.relateRobots || '-'
    },
    {
      label: '操作账号',
      value: data.value.updateBy ?? '-'
    },
    {
      label: '最近更新时间',
      value: data.value.updateTime
    }
  ]
})

function convertPercentageToDecimal(percentage: string): number {
  // 去除百分号并转换为数字
  const number = parseFloat(percentage.replace('%', ''))

  // 检查转换后的数字是否有效
  if (isNaN(number)) {
    return 0
  }

  // 将百分比转换为0-1之间的小数，并保留两位小数
  const decimal = (number / 100).toFixed(2)

  // 将字符串表示的小数转换回数字类型
  return parseFloat(decimal)
}

const handleSelect = () => {
  // if (v === 'remove') {
  //   if (data.value?.isDefault) {
  //     Message.error('默认知识库不可删除')
  //     return
  //   }
  //   await confirmModal('删除确认', '确认是否删除此知识库？')
  //   handleRemove()
  // } else if (v === 'edit') {
  //   emits('edit')
  // }
}
const handleRemove = async () => {
  delLoading.value = true
  await request.Delete<any>(`/knowledge/delete?id=${data.value.id}`).then((res) => {
    if (res.code === 1) {
      Message.success('操作成功')
      emits('update')
    } else {
      Message.error(res.msg || '操作失败')
    }
  })
  delLoading.value = false
}
</script>

<style lang="less" scoped>
:deep(.arco-btn-size-small) {
  padding: 0 10px;
}
</style>
