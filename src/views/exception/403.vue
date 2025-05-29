<template>
  <div class="content">
    <div class="background-animation"></div>
    <div class="error-container">
      <div class="error-content">
        <div class="error-code">403</div>
        <div class="error-message">抱歉，您没有权限访问此页面</div>
        <div class="error-desc">请确认您的访问权限或联系管理员</div>
        <div class="operation-row">
          <a-button key="back" type="primary" class="back-button" @click="backHome">
            <template #icon><icon-home /></template>
            返回首页
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router'
import { IconHome } from '@arco-design/web-vue/es/icon'

const backHome = () => router.replace({ path: '/home' })
</script>

<style scoped lang="less">
.content {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #e6f0ff;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e6f0ff 0%, #b3d1ff 25%, #80b3ff 50%, #4d94ff 75%, #165dff 100%);
  opacity: 0.9;
  animation: gradient-bg 15s ease infinite;
  background-size: 400% 400%;
}

.error-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgb(255 255 255 / 95%) 0%, rgb(230 240 255 / 90%) 50%, rgb(255 255 255 / 95%) 100%);
  backdrop-filter: blur(10px);
}

.error-content {
  text-align: center;
  padding: 60px;
  animation: fade-in 0.5s ease-in-out;
  background: linear-gradient(135deg, rgb(255 255 255 / 90%) 0%, rgb(230 240 255 / 70%) 50%, rgb(255 255 255 / 90%) 100%);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgb(22 93 255 / 15%);
}

.error-code {
  font-size: 160px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 24px;
  text-shadow: 0 0 20px rgb(22 93 255 / 30%);
  animation: bounce 2s infinite;
  background: linear-gradient(135deg, #165dff, #0e42d2);
  background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.error-message {
  font-size: 36px;
  color: #1d2129;
  margin-bottom: 16px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgb(0 0 0 / 10%);
}

.error-desc {
  font-size: 20px;
  color: #4d94ff;
  margin-bottom: 32px;
  text-shadow: 0 1px 2px rgb(0 0 0 / 5%);
}

.operation-row {
  margin-top: 24px;
}

.back-button {
  padding: 12px 32px;
  font-size: 18px;
  height: 48px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #165dff, #0e42d2);
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgb(22 93 255 / 40%);
    background: linear-gradient(135deg, #0e42d2, #165dff);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

@keyframes gradient-bg {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}
</style>
