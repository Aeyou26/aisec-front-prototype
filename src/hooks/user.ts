import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@/store'
// import { assertRedirectRoute } from '@/utils/route-util'

export default function useUser() {
  const router = useRouter()
  const userStore = useUserStore()
  const logout = async (logoutTo?: string) => {
    const res: any = await userStore.logout()
    if (res) {
      // 清空用户信息，手动清空持久化缓存
      userStore.reset()
      Message.success('登出成功')
      const path = userStore.show3D ? '/login2' : '/login'
      router.push(path)
    }
  }
  return {
    logout
  }
}
