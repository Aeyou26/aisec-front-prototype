<template>
  <div class="main-center-header">
    <div class="robot-item">
      <div class="robot-title">资产监测</div>
      <!-- 机器人主体 -->
      <div class="robot-body">
        <div class="robot">
          <img src="../image/screen-robot1.png" alt="" class="robot-img robot-float pl-0" />
        </div>
        <div class="base">
          <img src="../image/screen-base.png" alt="" class="base-img" />
        </div>

        <div class="text-box">
          <div class="text">
            <div class="flex-1 flex flex-col justify-center items-center">
              <div class="font-semibold mb-6 color-#41c9e9 text-24">{{ assetData.total }}</div>
              <div class="color-#ffffffe6 text-12">资产总数</div>
            </div>
            <div class="line-box2">
              <div class="line-center"></div>
            </div>
            <div class="flex-1 flex flex-col justify-center items-center">
              <div class="font-semibold mb-6 color-#41c9e9 text-24">{{ assetData.risk }}</div>
              <div class="color-#ffffffe6 text-12">资产风险</div>
            </div>
          </div>
        </div>

        <edging />
      </div>
    </div>
    <div class="robot-item">
      <div class="robot-title">安全分析</div>
      <!-- 机器人主体 -->
      <div class="robot-body">
        <div class="robot">
          <img src="../image/screen-robot2.png" alt="" class="robot-img robot-float "  style="width: 280px;"/>
        </div>
        <div class="base">
          <img src="../image/screen-base.png" alt="" class="base-img" />
        </div>

        <div class="text-box">
          <div class="text">
            <div class="flex-1 flex flex-col justify-center items-center">
              <div class="font-semibold mb-6 color-#f0ed67 text-24">{{ assetData.vuln }}</div>
              <div class="color-#ffffffe6 text-12">漏洞总数</div>
            </div>
            <div class="line-box2">
              <div class="line-center"></div>
            </div>
            <div class="flex-1 flex flex-col justify-center items-center">
              <div class="font-semibold mb-6 color-#f0ed67 text-24">{{ assetData.fixed }}</div>
              <div class="color-#ffffffe6 text-12">已修复漏洞数</div>
            </div>
          </div>
        </div>

        <edging />
      </div>
    </div>
    <div class="robot-item">
      <div class="robot-title">合规审计</div>
      <!-- 机器人主体 -->
      <div class="robot-body">
        <div class="robot">
          <img src="../image/screen-robot3.png" alt="" class="robot-img robot-float" style="width: 300px;"/>
        </div>
        <div class="base">
          <img src="../image/screen-base.png" alt="" class="base-img" />
        </div>

        <div class="text-box">
          <div class="text">
            <div class="flex-1 flex flex-col justify-center items-center">
              <div class="font-semibold mb-6 color-#41f0b7 text-24">{{ assetData.assess }}</div>
              <div class="color-#ffffffe6 text-12">评估总数</div>
            </div>
            <div class="line-box2">
              <div class="line-center"></div>
            </div>
            <div class="flex-1 flex flex-col justify-center items-center">
              <div class="font-semibold mb-6 color-#41f0b7 text-24">{{ assetData.runAssess }}</div>
              <div class="color-#ffffffe6 text-12">正在评估</div>
            </div>
          </div>
        </div>

        <edging />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import request from '@/request'
import edging from './edging.vue'

const assetData = ref({
  total:0,
  risk:0,
  vuln:0,
  fixed:0,
  assess:0,
  runAssess:0
}) 

onMounted(() => {
  getAssetsData()
})

function getAssetsData() {
  request.Get('/user/asset/overview').then((res: any) => {
    console.log('资产数据', res)
    if (res && res.data) {
      const resData = res.data
      assetData.value.total = resData.assets
      assetData.value.risk = resData.risk
      assetData.value.vuln = resData.vuln
      assetData.value.fixed = resData.fixed
      assetData.value.assess = resData.assess
      assetData.value.runAssess = resData.runAssess
    }
  })
}
</script>

<style lang="less" scoped>
.main-center-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  .robot-item {
    .robot-title {
      letter-spacing: 4px;
      width: 320px;
      height: 44px;
      margin-bottom: 9px;
      line-height: 44px;
      color: #fff;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      background: url('../image/screen-title3.png') no-repeat;
      background-size: 100% 100%;
    }

    .robot-body {
      position: relative;
      width: 320px;
      height: 485px;
      background: rgb(0 28 47 / 30%);

      .robot {
        padding-top: 30px;
        width: 100%;
        display: flex;
        justify-content: center;

        .robot-img {
          width: 250px;
          height: 260px;
        }
      }

      .base {
        width: 100%;
        height: 74px;
        display: flex;
        justify-content: center;
        overflow: hidden;
        margin-bottom: 10px;

        .base-img {
          width: 202px;
          height: 144px;
        }
      }

      .text-box {
        width: 100%;
        display: flex;
        justify-content: center;

        .text {
          box-sizing: border-box;
          display: flex;
          padding: 16px 0;
          width: 220px;
          height: 90px;
          border-radius: 4px;
          opacity: 1;
          background: linear-gradient(180deg, #2e66c766 0%, #2e66c733 100%);
        }

        .message-header {
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 18px;

          .message-icon {
            margin-right: 6px;
            margin-top: -4px;
            width: 13px;
            height: 16px;
          }
        }

        .message-icon2 {
          margin-right: 6px;
          margin-top: -4px;
          width: 13px;
          height: 16px;
        }

        .message-content {
          line-height: 18px;
          color: #fff;
          text-align: left;
          font-size: 12px;
          font-weight: 400;
        }
      }
    }
  }
}

.robot-float {
  animation: float 3.5s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0); // 初始位置
  }

  50% {
    transform: translateY(-10px); // 向上浮动10px
  }
}

.line-box2 {
  height: 100%;
  width: 2px;
  display: flex;
  justify-content: center;
  align-items: center;

  .line-center {
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #428ace00 0%, #1aa8d5 50%, #428ace00 100%);
  }
}
</style>
