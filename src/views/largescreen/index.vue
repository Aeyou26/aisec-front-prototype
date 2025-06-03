<template>
  <div ref="mainBox" class="mian-box">
    <div ref="mainContain" class="main-contain">
      <div class="title">
        网络安全智能体
        <div class="home-button cursor-pointer" @click="jumpHome">
          <img src="./image/screen-icon3.png" alt="" class="home-icon" />
          <div>首页</div>
        </div>
      </div>

      <div class="flex h-984">
        <!-- 左侧 -->
        <div ref="mainLeft" class="main-left w-456">
          <!-- 资产概况 -->
          <AssetOverviewChart />
          <!-- 资产风险 -->
          <AssetRiskChart />
          <!-- 资产告警TOP5 -->
          <assetAlertChart />
        </div>

        <!-- 中间 -->
        <div ref="mainCenter" class="main-center">
          <!-- 三个数字人 -->
          <digitizedHuman />

          <!-- 底部滚动屏 -->
          <bulletinBoard />
        </div>

        <!-- 右侧 -->
        <div ref="mainRight" class="main-right w-456 pr-20">
          <!-- 风险告警 -->
          <riskAlertChart />

          <!-- 风险趋势 -->
          <riskTrendsChart />

          <!-- 近七日风险 -->
          <dayRiskChart />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import request from '@/request'
import AssetOverviewChart from './components/assetOverviewChart.vue'
import AssetRiskChart from './components/assetRiskChart.vue'
import assetAlertChart from './components/assetAlertChart.vue'
import riskAlertChart from './components/riskAlertChart.vue'
import riskTrendsChart from './components/riskTrendsChart.vue'
import dayRiskChart from './components/dayRiskChart.vue'
import digitizedHuman from './components/digitizedHuman.vue'
import bulletinBoard from './components/bulletinBoard.vue'

const router = useRouter()

const mainContain = ref<HTMLElement | null>(null)
const mainBox = ref<HTMLElement | null>(null)

onMounted(() => {
  // 初始化自适应  ----在刚显示的时候就开始适配一次
  handleScreenAuto()
  // 绑定自适应函数   ---防止浏览器栏变化后不再适配
  window.onresize = () => handleScreenAuto()
})

//适配屏幕
const handleScreenAuto = () => {
  const designDraftWidth = 1920 //设计稿的宽度
  const designDraftHeight = 1080 //设计稿的高度
  // 根据屏幕的变化适配的比例
  if (mainBox.value) {
    // 缩放比例
    const scale =
      mainBox.value.offsetWidth / mainBox.value.offsetHeight < designDraftWidth / designDraftHeight
        ? mainBox.value.offsetWidth / designDraftWidth
        : mainBox.value.offsetHeight / designDraftHeight
    if (mainContain.value) {
      mainContain.value.style.transform = `scale(${scale}) translate(-50%, -50%)`
    }
  }
}

const jumpHome = () => {
  router.push('/home')
}
</script>

<style scoped lang="less">
.mian-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #051b21;
  background: url('./image/screen-bg.png') no-repeat;
  background-size: 100% 100%;
  background-size: cover;
}

.main-contain {
  width: 1920px;
  height: 1080px;
  box-sizing: border-box;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  position: absolute;
  background: linear-gradient(270deg, #7c7c7c00 0%, #5b739d 35%, #2e66c7 69%, #d8d8d800 100%);
  background: url('./image/screen-bg.png') no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;

  .title {
    position: relative;
    height: 96px;
    line-height: 80px;
    color: #fff;
    text-align: center;
    font-size: 38px;
    font-weight: 600;
    background: url('./image/screen-title.png') no-repeat;
    background-size: 100% 90px;

    .home-button {
      width: 98px;
      height: 32px;
      position: absolute;
      top: 46px;
      right: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-size: 16px;
      background: url('./image/screen-icon2.png') no-repeat;
      background-size: 100% 100%;

      .home-icon {
        width: 16px;
        height: 16px;
        margin-right: 5px;
      }
    }
  }

  .main-left {
    padding-left: 24px;
    box-sizing: border-box;
  }

  .main-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .main-right {
    box-sizing: border-box;
    padding-left: 24px;
    height: 100%;
  }
}
</style>
