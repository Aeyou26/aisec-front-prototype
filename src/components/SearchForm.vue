<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    autoCollapse?: boolean // 是否自动收起,
    isExport?: boolean // 是否自动收起,
    isWarning?: boolean // 是否显示导出警告
    isLoading?: boolean // 是否显示导出loading
    size?: 'default' | 'small' // 尺寸
  }>(),
  {
    autoCollapse: false,
    isExport: false,
    isWarning: false,
    isLoading: false,
    size: 'default'
  }
)
const emit = defineEmits(['query', 'reset', 'export'])
const { autoCollapse, size } = toRefs(props)

const isOpen = ref(false)

const container = ref<HTMLDivElement>()
function searchData() {
  emit('query')
}

onMounted(() => {
  nextTick(() => {
    const containerEl = container.value
    if (containerEl) {
      // 给所有input绑定回车事件
      const inputs = containerEl.querySelectorAll('.search-item input')
      inputs.forEach((input) => {
        input.addEventListener('keydown', (e: any) => {
          if (e.key === 'Enter') {
            searchData()
          }
        })
        input.addEventListener('mouseout', () => {
          const nextSibling = input.nextElementSibling
          if (nextSibling) {
            nextSibling.addEventListener('click', () => {
              searchData()
            })
          }
        })
      })
    }
  })
})
</script>

<template>
  <div
    class="search-form w-full flex justify-end gap-12 overflow-hidden"
    :class="{ 'h-37': autoCollapse && !isOpen, 'h-auto': !autoCollapse || isOpen, 'small-size': size === 'small' }"
  >
    <div class="flex flex-1 flex-wrap justify-end gap-12" :class="{ 'overflow-hidden': autoCollapse && !isOpen }">
      <!-- 直接放进默认插槽，示例 -->
      <!-- <div class="search-item">
            <span>xxx</span>
            <a-input />
          </div> -->
      <slot />
    </div>
    <div class="w-auto flex justify-end gap-12">
      <a-button v-if="autoCollapse" type="outline" @click="isOpen = !isOpen">
        {{ isOpen ? '收起' : '展开' }}
      </a-button>
      <slot name="action">
        <a-button type="primary" @click="emit('query')"> 搜索 </a-button>
        <a-button type="outline" @click="emit('reset')"> 重置 </a-button>
        <a-popconfirm position="right" content="最多支持一次导出1万条数据，确定是否导出查询列表前1万条数据？" @ok="emit('export')">
          <a-button v-if="isExport && isWarning" :loading="isLoading" type="primary"> 导出 </a-button>
        </a-popconfirm>
        <a-button v-if="isExport && !isWarning" :loading="isLoading" type="primary" @click="emit('export')"> 导出 </a-button>
      </slot>
    </div>
  </div>
</template>

<style lang="less">
.search-form {
  width: 100%;
  transition: all 0.1s;

  .search-body {
    margin-top: 24px;
  }

  .search-item {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    column-gap: 14px;
    font-size: 14px;
    color: #303544;

    > span {
      &:first-of-type {
        flex-shrink: 0;
        text-align: right;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.search-form {
  :deep(.arco-input-wrapper),
  :deep(.arco-select),
  :deep(.arco-select-view-single) {
    width: 180px !important;
  }

  :deep(.arco-picker-range) {
    width: 240px !important;
  }

  :deep(.arco-select-view) {
    width: 180px !important;

    .arco-select-view-inner {
      display: block !important;
      padding-top: 6px;
      padding-bottom: 6px;
    }
  }

  &.small-size {
    :deep(.arco-input-wrapper),
    :deep(.arco-select) {
      width: 150px !important;
    }
  }
}
</style>
<style lang="less">
.search-item > span:first-of-type {
  display: inline-block;
  width: 72px;
}
</style>
