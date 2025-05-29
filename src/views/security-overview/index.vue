<template>
  <ConfigurationModal ref="ConfigurationModalRef" @upload="update" />
  <div class="flex p-24 h-full w-full box-border overflow-x-auto">
    <div
      class="box-border w-1070 min-h-700 h-full flex flex-col justify-center items-center bg-white mr-28 box-border overflow-auto rounded-14 scrolling-list-text"
      style="flex-shrink: 0"
    >
      <TpoologyMay />
    </div>
    <div class="flex-1 h-full flex flex-col justify-between box-border">
      <!-- 安全日志 -->
      <div class="h-186 bg-white mb-28 rounded-14">
        <div class="flex-1 flex items-center bg-#ffffff h-full p-32 rounded-[14px]">
          <div v-if="configurationStatus === 1" class="relative flex-1 flex flex-col items-center justify-center" @click="ConfigurationModalRef?.openModal()">
            <img src="@/assets/images/safe-header2.png" class="w-100 h-100 rotate-animation cursor-pointer icon-position" />
            <!-- <SvgIcon name="safe-header2" class="cursor-pointer rotate-animation" size="98" :color="'red'" /> -->
            <img src="./image/log-switch.png" alt="" class="absolute left-50% right-50% cursor-pointer w-18 h-18" style="transform: translate(-50%, -50%)" />
            <div class="color-#999999 text-14">安全日志分析中...</div>
          </div>
          <div v-else class="flex-1 flex flex-col items-center justify-center" @click="ConfigurationModalRef?.openModal()">
            <img src="./image/log-status.png" alt="" class="cursor-pointer w-98 h-98" />
            <div class="color-#999999 text-14">未启动安全日志分析</div>
          </div>

          <div class="line"></div>
          <div class="flex-1 flex justify-center">
            <div class="">
              <div class="color-#DB5757 text-40 font-600 mb-28">26</div>
              <div class="color-#666666 text-16">日志总数</div>
            </div>
          </div>
          <div class="line"></div>
          <div class="flex-1 flex justify-center">
            <div class="">
              <div class="color-#DB5757 text-40 font-600 mb-28">64</div>
              <div class="color-#666666 text-16">告警数量</div>
            </div>
          </div>
        </div>
      </div>

      <div class="h-186 bg-white mb-28 rounded-14">
        <div class="flex-1 flex items-center bg-#ffffff h-full p-32 rounded-[14px]">
          <div class="flex-1 flex flex-col items-center justify-center">
            <div class="icon-wrapper">
              <div class="ripple-container">
                <div class="ripple"></div>
                <div class="ripple"></div>
                <div class="ripple"></div>
              </div>
              <!-- <SvgIcon name="safe-header" class="cursor-pointer icon-position" size="98" /> -->
              <img src="@/assets/images/safe-header.png" class="w-100 h-100 cursor-pointer icon-position" />
            </div>
            <div class="color-#999999 text-14">钓鱼邮件检测中...</div>
          </div>
          <div class="line"></div>
          <div class="flex-1 flex justify-center">
            <div class="flex flex-col justify-center items-center">
              <div class="color-#2E66C7 text-40 font-600 mb-28">0</div>
              <div class="color-#666666 text-16">检测邮件数</div>
            </div>
          </div>
          <div class="line"></div>
          <div class="flex-1 flex justify-center">
            <div class="flex flex-col justify-center items-center">
              <div class="color-#2E66C7 text-40 font-600 mb-28">0</div>
              <div class="color-#666666 text-16">钓鱼邮件数</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 风险告警 -->
      <div class="flex-1 min-h-270 bg-white rounded-14 overflow-auto">
        <div class="bg-#ffffffff rounded-14 box-border pl-20 py-28 flex flex-col h-full min-h-200">
          <div class="text-#333333 text-18 mb-30 font-bold pl-20">风险告警</div>
          <div v-if="scrollList.length > 0" class="flex flex-col overflow-y-auto gap-y-2">
            <div v-for="(item, index) in scrollList" :key="index" class="scroll-item-box">
              <div v-if="item.level == '高'" class="ball-hight"></div>
              <div v-if="item.level == '中'" class="ball-normal"></div>
              <div v-if="item.level == '低'" class="ball-low"></div>
              <div class="color-#317fc6 w-160">{{ item.createTime }}</div>
              <div class="min-w-120 flex-1 flex justify-center" style=" overflow: hidden; white-space: nowrap; text-overflow: ellipsis">{{ item.logType }}</div>
              <div class="min-w-80 flex-1 flex justify-center" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis">{{ item.attackType }}</div>
              <!-- <div class="flex mr-30" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; min-width: 100px; width: 210px">
                {{ item.event }}
              </div> -->
              <div style="width: 60px">
                <div v-if="item.level == '高'" class="hight">{{ item.level }}</div>
                <div v-if="item.level == '中'" class="normal">{{ item.level }}</div>
                <div v-if="item.level == '低'" class="low">{{ item.level }}</div>
              </div>
              <!-- <div style="width: 90px; margin-right: 30px">{{ item.system }}</div> -->
              <!-- <div style="width: 70px">
                <div v-if="item.deal === '待处理'" class="hight" style="width: 60px">{{ item.deal }}</div>
                <div v-if="item.deal === '处理中'" class="normal" style="width: 60px">{{ item.deal }}</div>
                <div v-if="item.deal === '已处理'" class="low" style="width: 60px">{{ item.deal }}</div>
              </div> -->
            </div>
          </div>
          <div v-else class="flex-1 flex items-center justify-center">
            <Empty description="暂无数据" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import request from '@/request'
import TpoologyMay from './components/topology-map.vue'
import ConfigurationModal from './components/configuration-modal.vue'
const ConfigurationModalRef = ref<InstanceType<typeof ConfigurationModal>>()

const configurationStatus = ref(2) //1开启 2未开启
const scrollList = ref<any>([])

onMounted(() => {
  getConfiguration()
  getLog()
})

function getConfiguration() {
  request.Get('/syslog/config/info').then((res: any) => {
    if (res && res.code === 1) {
      if (res.data) {
        const data = res.data
        if (data.status) {
          configurationStatus.value = data.status
        } else {
          configurationStatus.value = 2
        }
      }
    }
  })
}

function getLog() {
  request.Post('/syslog/page', { current: 1, pageSize: 10 }).then((res: any) => {
    if (res && res.code === 1 && res.data && res.data.length > 0) {
      scrollList.value = res.data
    } else {
      scrollList.value = []
    }
  })
}

function update() {
  getConfiguration()
}
</script>

<style lang="less" scoped>
.header-box {
  border-radius: 10px;
  border: 1px dashed #2e66c7;
  border-spacing: 10px 5px;
}

.left-box1 {
  width: 428px;
  height: 200px;
  border-radius: 10px;
  border: 1px dashed #2e66c7;
  background: #f9fafd;
}

.left-box2 {
  flex: 1;
  min-height: 253px;
  max-height: 273px;
  width: 428px;
  // height: 273px;
  border-radius: 10px;
  border: 1px dashed #2e66c7;
  background: #f9fafd;
}

.left-box3 {
  width: 428px;
  height: 210px;
  border-radius: 10px;
  opacity: 1;
  border: 1px dashed #2e66c7;
  background: #f9fafd;
}

.right-box1 {
  width: 428px;
  height: 280px;
  border-radius: 10px;
  opacity: 1;
  border: 1px dashed #2e66c7;
  background: #f9fafd;
}

.right-2 {
  width: 428px;
  height: 145px;
  border-radius: 10px;
  opacity: 1;
  border: 1px dashed #2e66c7;
  background: #f9fafd;
}

.right-3 {
  width: 428px;
  height: 258px;
  border-radius: 10px;
  opacity: 1;
  border: 1px dashed #2e66c7;
  background: #f9fafd;
}

.right-4 {
  width: 428px;
  height: 167px;
  border-radius: 10px;
  opacity: 1;
  border: 1px dashed #2e66c7;
  background: #f9fafd;
}

.line {
  width: 1px;
  height: 68px;
  border-right: 1px solid rgb(153 153 153 / 20%);
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.rotate-animation {
  animation: rotate 2s linear infinite;
}

.icon-wrapper {
  position: relative;
  width: 98px;
  height: 98px;
}

.icon-position {
  position: relative;
  z-index: 2;
}

.ripple-container {
  position: absolute;
  top: 46%;
  left: 48%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
}

.ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgb(46 102 199 / 20%);
  background-color: rgb(46 102 199 / 20%);
  animation: ripple 2s linear infinite;

  &:nth-child(2) {
    animation-delay: 0.6s;
  }

  &:nth-child(3) {
    animation-delay: 1.2s;
  }
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }

  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.row-line {
  width: 62px;
  height: 0;
  opacity: 1;
  border: 1px dashed #2e66c7cc;
}

.scrolling-list-text {
  scrollbar-width: none !important; //隐藏滚动条
  -ms-overflow-style: none !important; //隐藏滚动条

  ::-webkit-scrollbar {
    display: none !important; //隐藏滚动条
    width: 0 !important;
  }
}

/* 确保列表框有高度 */
.scroll-item-box {
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 14px 20px;
  font-size: 14px;
  color: #333333;

  .ball-hight {
    margin-right: 30px;
    width: 16px;
    height: 16px;
    background-color: #f62675;
    border-radius: 50%;
  }

  .ball-normal {
    margin-right: 30px;
    width: 16px;
    height: 16px;
    background-color: #f07300;
    border-radius: 50%;
  }

  .ball-low {
    margin-right: 30px;
    width: 16px;
    height: 16px;
    background-color: #099a74;
    border-radius: 50%;
  }

  .hight {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 18px;
    background-color: #f62675;
    border-radius: 4px;
    color: white;
  }

  .normal {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 18px;
    background-color: #f07300;
    border-radius: 4px;
    color: white;
  }

  .low {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 18px;
    background-color: #099a74;
    border-radius: 4px;
    color: white;
  }
}
</style>
