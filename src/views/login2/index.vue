<template>
  <div class="login-container relative w-full h-full overflow-hidden">
    <!-- 底层：Vortex 背景 -->
    <div class="absolute inset-0 z-0">
      <VortexBackground
        background-color="black"
        :range-y="800"
        :particle-count="500"
        :base-hue="120"
        class="flex size-full flex-col items-center justify-center px-2 py-4 md:px-10"
      />
    </div>

    <!-- 中层：Spline 3D 背景 - 只占据左侧60% -->
    <div class="absolute inset-y-0 left-0 w-[60%] z-10 opacity-85 spline-container">
      <ParentSize>
        <template #default="{ width, height }">
          <Spline
            :scene="sceneUrl"
            :style="{
              width: `${width}px`,
              height: `${height}px`,
              display: splineError ? 'none' : 'block'
            }"
            :render-on-demand="false"
            @error="handleSplineError"
            @spline-start="handleSplineStart"
            @spline-mouse-hover="handleSplineMouseHover"
            @spline-mouse-down="handleSplineMouseDown"
            @spline-mouse-up="handleSplineMouseUp"
          />
        </template>
      </ParentSize>
    </div>

    <!-- 顶层：登录表单 -->
    <div class="absolute inset-0 z-20 flex justify-end items-center form-container">
      <div
        class="w-508 h-600 mr-[10%] px-48 py-34 bg-black bg-opacity-0 backdrop-blur-5 rounded-20 login-form relative overflow-hidden"
        style="box-shadow: 0 8px 40px 4px rgb(0 0 0 / 50%)"
      >
        <!-- 流星效果作为表单背景 -->
        <MeteorShower :count="20" />

        <a-form ref="loginFormRef" :model="loginForm" layout="vertical" class="relative z-10">
          <div class="mb-54">
            <img :src="logoUrl" alt="logo" class="!min-w-100 !min-h-40 !max-w-160 !max-h-80" />
          </div>
          <div class="pl-36">
            <div class="text-24 font-bold text-#e2e8f0 mb-8">欢迎使用网络安全智能体</div>
            <div class="text-16 text-#94a3b8 mb-60">请登录您的账号</div>
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
              <div class="flex items-center gap-10">
                <a-input v-model="loginForm.captcha" class="captcha-input" placeholder="请输入验证码">
                  <template #prefix>
                    <component :is="useIcon('verify', { size: 24 })" />
                  </template>
                </a-input>
                <img :src="captchaUrl" alt="验证码" class="cursor-pointer w-84 h-48" @click="refreshCaptcha" />
              </div>
            </a-form-item>
            <a-form-item class="mt-48">
              <a-button type="primary" class="!w-340 !h-48 rounded-8" :loading="loading" @click="handleLogin">登录</a-button>
            </a-form-item>
          </div>
        </a-form>
      </div>
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
import ParentSize from '@/components/ParentSize.vue'
import Spline from '@/components/Spline.vue'
import VortexBackground from '@/components/VortexBackground.vue'
import MeteorShower from '@/components/MeteorShower.vue'

// 使用URL字符串，不要尝试导入二进制文件
const sceneUrl = '/scene.splinecode'
const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const captchaUrl = ref('')
const key = ref('')
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
    router.push('/home')
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

// 处理 Spline 加载错误
const splineError = ref(false)
const handleSplineError = (error: any) => {
  console.error('Spline 加载失败:', error)
  splineError.value = true
}

const handleSplineStart = () => {
  console.log('Spline 场景加载成功')
}

// 添加鼠标移动事件处理
const handleSplineMouseHover = (e: any) => {
  console.log('Spline 鼠标悬停事件:', e)
}

const handleSplineMouseDown = (e: any) => {
  console.log('Spline 鼠标按下事件:', e)
}

const handleSplineMouseUp = (e: any) => {
  console.log('Spline 鼠标抬起事件:', e)
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
const getEnterpriseInfo = () => {
  request.Get<any>('/sys/information').then((res) => {
    userStore.setEnterpriseInfo(res.data)
  })
}
// 在 onMounted 中添加事件监听
onMounted(() => {
  refreshCaptcha()
  getPublicKey()
  getEnterpriseInfo()
  userStore.toggle3D(true)
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown)
})

// 在 onUnmounted 中移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
<style lang="less" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
}

.spline-container {
  pointer-events: auto;
}

.form-container {
  pointer-events: none;
}

.login-form {
  pointer-events: auto;
}

:deep(.arco-input-wrapper) {
  height: 48px !important;
  width: 340px;
  background-color: #334155 !important;
  border-radius: 8px !important;
  border-color: #475569 !important;

  &.captcha-input {
    width: 246px;
  }

  input {
    color: #f1f5f9 !important;

    &::placeholder {
      color: #94a3b8 !important;
    }
  }

  .arco-input-prefix {
    color: #94a3b8 !important;
  }
}

:deep(.arco-form-item-label-col) {
  display: none !important;
}

:deep(.arco-form-item-message) {
  color: #f87171 !important;
}
</style>
