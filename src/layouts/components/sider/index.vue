<template>
  <a-layout-sider
    v-show="!hideMenu"
    class="layout-sider relative"
    breakpoint="xl"
    :collapsed="isCollapsed"
    :collapsible="true"
    :class="{ '!w-56': isCollapsed }"
    style="box-shadow: none; width: 248px"
    :hide-trigger="true"
  >
    <div class="h-full">
      <Menu />
    </div>
  </a-layout-sider>
</template>

<script lang="ts" setup name="LayoutSider">
import { useAppStore } from '@/store'
import Menu from '../menu/index.vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const appStore = useAppStore()
const { hideMenu } = storeToRefs(appStore)

const isCollapsed = computed(() => appStore.menuCollapse)
</script>

<style lang="less" scoped>
.nx-layout-toggle-bar {
  position: absolute;
  top: calc(50% - 36px);
  right: -32px;
  z-index: 100;
  width: 32px;
  height: 72px;

  &__top,
  &__bottom {
    position: absolute;
    left: 14px;
    width: 4px;
    height: 38px;
    background-color: rgb(191 191 191 / 100%);
    border-radius: 2px;
    transition:
      background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &__bottom {
    position: absolute;
    top: 34px;
  }

  &:hover {
    cursor: pointer;

    .nx-layout-toggle-bar__top {
      transform: rotate(-12deg) scale(1.15) translateY(-2px);
    }

    .nx-layout-toggle-bar__bottom {
      transform: rotate(12deg) scale(1.15) translateY(2px);
    }
  }

  &--collapsed:hover {
    .nx-layout-toggle-bar__top {
      transform: rotate(12deg) scale(1.15) translateY(-2px);
    }

    .nx-layout-toggle-bar__bottom {
      transform: rotate(-12deg) scale(1.15) translateY(2px);
    }
  }
}
</style>
