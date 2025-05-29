<template>
  <div :class="!isMobile ? 'login-bg bg-[#f7f9fc]' : 'mobile-login px-30'" class="flex justify-end items-center">
    <div :class="!isMobile ? 'h-600 w-508 mr-[10%] px-48 backdrop-blur-10' : 'h-540 w-full'" class="px-20 py-34 rounded-20 bg-#FFFFFF">
      <a-form ref="loginFormRef" :model="loginForm" layout="vertical">
        <div :class="!isMobile ? 'mb-54' : 'mb-36'">
          <img :src="logoUrl" alt="logo" class="!min-w-100 !min-h-40 !max-w-160 !max-h-80" />
        </div>
        <div :class="!isMobile ? 'px-36' : ''">
          <div :class="!isMobile ? 'text-24' : 'text-20'" class="font-bold text-#333333 mb-8">欢迎使用网络安全智能体</div>
          <div :class="!isMobile ? 'mb-60' : 'mb48'" class="text-16 text-#666666">请登录您的账号</div>
          <a-form-item field="account" :rules="[{ required: true, message: '请输入账号' }]" :validate-trigger="['change', 'input']">
            <a-input v-model="loginForm.account" placeholder="请输入账号">
              <template #prefix>
                <component :is="useIcon('bxs-user', { size: 24 })" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item field="password" :rules="[{ required: true, message: '请输入密码' }]" :validate-trigger="['change', 'input']">
            <a-input-password v-model="loginForm.password" placeholder="请输入密码">
              <template #prefix>
                <component :is="useIcon('mdi-password', { size: 24 })" />
              </template>
            </a-input-password>
          </a-form-item>
          <a-form-item field="captcha" :rules="[{ required: true, message: '请输入验证码' }]" :validate-trigger="['change', 'input']">
            <div class="w-full flex items-center gap-10">
              <a-input v-model="loginForm.captcha" class="flex-1" placeholder="请输入验证码">
                <template #prefix>
                  <component :is="useIcon('verify', { size: 24 })" />
                </template>
              </a-input>
              <img :src="captchaUrl" alt="验证码" class="cursor-pointer w-84 h-48" @click="refreshCaptcha" />
            </div>
          </a-form-item>
          <a-form-item class="mt-48">
            <a-button type="primary" class="!w-full !h-48 rounded-8" :loading="loading" @click="handleLogin">登录</a-button>
          </a-form-item>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import request from '@/request'
import useIcon from '@/hooks/useIcon'
import cnnsLogo from '@/assets/images/cnns-logo.png'
import { useForm } from '@alova/scene-vue'
import { useUserStore } from '@/store'
import { useRouter } from 'vue-router'
import { encryptPassword } from '@/utils/rsa'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loginFormRef = ref()
const captchaUrl = ref('')
const key = ref('')
const captchaTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const { token, isLogin, publicKey, enterpriseInfo } = storeToRefs(userStore)
const logoUrl = computed(() => {
  if (enterpriseInfo?.value?.logo) {
    return `/api/sys/download?fileName=${enterpriseInfo.value.logo}`
  }
  return cnnsLogo
})
const {
  form: loginForm,
  loading,
  send: submit,
  updateForm,
  onSuccess,
  onError
} = useForm<{
  account: string
  password: string
  captcha: string
  token: string
}>(
  (formData) => {
    const encryptedPassword = encryptPassword(formData.password, publicKey.value)
    return request.Post('/auth/user/login', {
      ...formData,
      password: encryptedPassword
    })
  },
  {
    resetAfterSubmiting: true,
    initialForm: {
      account: '',
      password: '',
      captcha: '',
      token: ''
    }
  }
)
onSuccess(({ data }) => {
  if (data.code === 1) {
    token.value = data.data.token
    isLogin.value = true
    userStore.setUserInfo(data.data)
    // 只处理universalChat的跳转
    if (route?.query?.redirect && (route.query.redirect as string).startsWith('/universalChat')) {
      router.push(route.query.redirect as string)
    } else {
      router.push('/home')
    }
  }
})
onError(() => {
  //登录失败刷新验证码
  refreshCaptcha()
})

const refreshCaptcha = () => {
  loginForm.value.captcha = ''
  request.Get<any>('/auth/captcha').then((res) => {
    // 返回base64图片
    captchaUrl.value = `data:image/png;base64,${res.data.captcha}`
    updateForm({
      token: res.data.token
    })

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
// 获取/api/auth/public 公钥
const getPublicKey = () => {
  request.Get<any>('/auth/public').then((res) => {
    key.value = res.data
    userStore.setPublicKey(res.data)
  })
}

async function handleLogin() {
  if (!(await loginFormRef.value?.validate())) {
    await submit()
  }
}

// 添加键盘事件处理函数
const handleKeyDown = (e: KeyboardEvent) => {
  // 检查是否正在使用输入法
  if (e.key === 'Enter' && !e.isComposing && e.target instanceof HTMLElement) {
    // 如果当前焦点在输入框上，且不是在输入法编辑状态，则触发登录
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      handleLogin()
    }
  }
}
// 设置网页图标
const setWebInfo = () => {
  const favicon = document.getElementById('favicon') as HTMLLinkElement
  if (favicon && enterpriseInfo?.value?.logo) {
    favicon.href = `/api/sys/download?fileName=${enterpriseInfo.value.icon}`
  }
}

const getEnterpriseInfo = () => {
  request.Get<any>('/sys/information').then((res) => {
    userStore.setEnterpriseInfo(res.data)
    setWebInfo()
  })
}
// 在 onMounted 中添加事件监听
onMounted(() => {
  refreshCaptcha()
  getPublicKey()
  getEnterpriseInfo()
  userStore.toggle3D(false)
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', checkIfMobile) // 添加窗口大小变化的监听
})

// 在 onUnmounted 中移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  // 清除验证码刷新定时器
  if (captchaTimer.value) {
    clearTimeout(captchaTimer.value)
  }

  window.removeEventListener('resize', checkIfMobile) // 移除监听
})

const isMobile = ref(window.innerWidth <= 768) // 判断是否为移动端
const checkIfMobile = () => {
  isMobile.value = window.innerWidth <= 768 // 根据窗口宽度判断
}
</script>

<style lang="less" scoped>
:deep(.arco-input-wrapper) {
  height: 48px !important;
  // width: 340px;
  background-color: #f5f5f5 !important;
  border-radius: 8px !important;

  &.captcha-input {
    width: 246px;
  }
}

:deep(.arco-form-item-label-col) {
  display: none !important;
}

.mobile-login {
  background-image: url('@/assets/images/mobile-login-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
