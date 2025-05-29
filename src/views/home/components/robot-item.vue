<template>
  <div class="pt-150 relative cursor-pointer select-none" @mouseenter="isHover = true" @mouseleave="isHover = false" @click="handleClick()">
    <div class="absolute top-0 left-[50%] translate-x-[-50%] text-20 text-#333333 font-700 whitespace-nowrap">
      {{ item.name }}
    </div>
    <div class="absolute top-46 left-[50%] translate-x-[-50%] z-1 w-240 h-210 flex justify-center items-center" :class="{ 'robot-float': isHover }">
      <a-tooltip
        :content="item.useScene"
        position="bottom"
        background-color="#FFFFFF"
        :content-style="{ color: '#333333', fontSize: '14px', fontWeight: '500', boxShadow: '0 8px 24px 0 #00266914', padding: '12px 20px', borderRadius: '10px' }"
      >
        <component :is="useIcon(`robot-${item.avatar}`, item.id == '6' ? { height: 160, width: 140 } : { height: 210, width: 240 })" />
      </a-tooltip>
    </div>
    <div class="bg-#ffffff rounded-10 w-276 card-container">
      <div class="h-134 w-276 bg-#f3f6fc relative">
        <template v-for="(ability, index) in item.abilityList" :key="index">
          <div
            class="absolute flex items-center justify-center w-100 h-32 rounded-100 bg-#ffffff ability-tag"
            :class="[index < 2 ? 'ability-tag-left' : 'ability-tag-right', index % 2 === 0 ? 'top-12' : 'top-62', { show: isHover }]"
            @click.stop="handleClick(ability.id)"
          >
            {{ ability.name }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useIcon from '@/hooks/useIcon'
import { ref } from 'vue'

interface RobotObject {
  id: string
  name: string
  useScene: string
  prolog?: string
  config?: string
  avatar?: string
  img?: string
  abilityList?: AbilityList[]
}

interface AbilityList {
  id?: string
  createBy?: string
  updateBy?: string
  createTime?: string
  updateTime?: string
  name?: string
  agentId?: string
  status?: number
  icon?: string
  useScene?: string
  knowledgebaseId?: string
  knowledgebaseName?: string
}
const chatStore = useChatStore()
const userStore = useUserStore()
const show3D = computed(() => userStore.show3D)
const props = defineProps<{
  item: RobotObject
}>()
const router = useRouter()
const isHover = ref(false)
// abilityId
const handleClick = (id?: string) => {
  // 将机器人id设置为权限
  userStore.setPermissionList([props.item.id])
  chatStore.updateChatData({
    currentInfo: {
      ...props.item,
      // 因为原本没这些的时候使用了下面字段 所以需要兼容
      robotId: props.item.id,
      robotName: props.item.name,
      robotImg: props.item.avatar || '',
      abilityId: id || ''
    }
  })
  // 根据机器人id设置进入系统路径
  let path = '/chat'
  if (id) {
    router.push({ path })
    return
  }
  switch (props.item.id) {
    // case '2':
    //   path = '/security-overview'
    //   break
    case '3':
      path = '/'
      break
    case '5':
      // path = show3D.value ? '/robot' : '/chat'
      path = '/robot'
      break
    default:
      path = '/chat'
  }
  router.push({ path })
}
</script>

<style scoped lang="less">
.robot-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translate(-50%, 0);
  }

  50% {
    transform: translate(-50%, -15px);
  }

  100% {
    transform: translate(-50%, 0);
  }
}

.card-container {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 10px 10px 40px 0 #00266914;
}

.ability-tag {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 4px 10px 0 #00266914;
  font-size: 12px;
  color: #fff;
  opacity: 0;
  visibility: hidden;

  &-left {
    left: -56px;
    transform: translateX(-100%);
  }

  &-right {
    right: -56px;
    transform: translateX(100%);
  }

  &.show {
    opacity: 1;
    transform: translateX(0);
    visibility: visible;
  }

  &:nth-child(2n) {
    background: #52c9d6;
  }

  &:nth-child(2n-1) {
    background: #2e66c7;
  }

  &:hover {
    transform: scale(1.05) !important;
    box-shadow: 4px 4px 20px 0 rgb(24 144 255 / 15%);
  }
}
</style>
