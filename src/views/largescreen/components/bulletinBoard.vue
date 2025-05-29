<template>
  <div class="main-center-bottom relative">
    <div ref="scroll_table" class="scroll-box" style="flex: 3; padding: 10px 0">
      <div v-if="scrollList.length > 0" class="scrolling-list-text">
        <div v-for="(item, index) in scrollList" :key="index" class="scroll-item-box">
          <div v-if="item.level == '高'" class="ball-hight"></div>
          <div v-if="item.level == '中'" class="ball-normal"></div>
          <div v-if="item.level == '低'" class="ball-low"></div>
          <div v-if="item.level !== '低' && item.level !== '中' && item.level !== '高'" class="ball-zc"></div>
          <div class="w-170 mr-10">{{ item.createTime }}</div>
          <div class="w-150 mr-10 flex-1 text-center" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis">{{ item.logType }}</div>
          <div class="w-150 mr-10 flex-1 text-center" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis">{{ item.attackType }}</div>
          <div class="w-80 flex justify-center text-center" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis">
            <div v-if="item.level == '高'" class="hight">{{ item.level }}</div>
            <div v-if="item.level == '中'" class="normal">{{ item.level }}</div>
            <div v-if="item.level == '低'" class="low">{{ item.level }}</div>
            <div
              v-if="item.level !== '低' && item.level !== '中' && item.level !== '高'"
              class="w-80"
              style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"
            >
              {{ item.level }}
            </div>
          </div>

          <!-- <div v-if="item.level == '高'" class="ball-hight"></div>
          <div v-if="item.level == '中'" class="ball-normal"></div>
          <div v-if="item.level == '低'" class="ball-low"></div>
          <div style="width: 80px">{{ item.num }}</div>
          <div style="flex: 1; margin-right: 30px">{{ item.event }}</div>
          <div style="width: 80px">
            <div v-if="item.level == '高'" class="hight">{{ item.level }}</div>
            <div v-if="item.level == '中'" class="normal">{{ item.level }}</div>
            <div v-if="item.level == '低'" class="low">{{ item.level }}</div>
          </div>
          <div style="width: 90px; margin-right: 30px">{{ item.system }}</div>
          <div style="width: 80px">
            <div v-if="item.deal === '待处理'" class="hight" style="width: 60px">{{ item.deal }}</div>
            <div v-if="item.deal === '处理中'" class="normal" style="width: 60px">{{ item.deal }}</div>
            <div v-if="item.deal === '已处理'" class="low" style="width: 60px">{{ item.deal }}</div>
          </div> -->
        </div>
        <!-- 占位 -->
        <div class="h-20"></div>
      </div>
      <div v-else class="flex-1 flex items-center justify-center">
        <!-- <div class="flex justify-center items-center w-400 h-250 color-white">暂无数据</div> -->
        <Empty :is-echart="true" class="w-400 h-250" />
      </div>
    </div>
    <div class="line-box">
      <div class="line-center"></div>
    </div>
    <div class="item-test">
      <img src="../image/screen-robot7.png" alt="" class="img" />
    </div>

    <edging />
  </div>
</template>

<script lang="ts" setup>
import request from '@/request'
import edging from './edging.vue'
import Empty from '@/components/Empty.vue'

const scrollList = ref<any>([])
scrollList.value = [
  // {
  //   num: '00100',
  //   event: '检测到网络钓鱼攻击行为事件记录',
  //   level: '高',
  //   system: '入侵检测系统',
  //   deal: '已处理'
  // },
  // {
  //   num: '00101',
  //   event: '发现敏感数据通过未加密通道传输',
  //   level: '高',
  //   system: '数据加密',
  //   deal: '处理中'
  // },
  // {
  //   num: '00102',
  //   event: '检测到恶意软件传播活动事件记录',
  //   level: '高',
  //   system: '反病毒软件',
  //   deal: '已处理'
  // },
  // {
  //   num: '00103',
  //   event: '发现内部人员威胁行为事件记录',
  //   level: '高',
  //   system: '安全审计',
  //   deal: '已处理'
  // },
  // {
  //   num: '00104',
  //   event: '检测到恶意链接点击行为事件记录',
  //   level: '低',
  //   system: '网络过滤',
  //   deal: '已处理'
  // },
  // {
  //   num: '00105',
  //   event: '检测到木马病毒感染活动事件记',
  //   level: '高',
  //   system: '反病毒软件',
  //   deal: '已处理'
  // },
  // {
  //   num: '00106',
  //   event: '发现数据篡改行为事件问题记录',
  //   level: '高',
  //   system: '完整性检查',
  //   deal: '处理中'
  // },
  // {
  //   num: '00107',
  //   event: '发现恶意广告投放活动事件记录',
  //   level: '低',
  //   system: '广告拦截',
  //   deal: '待处理'
  // },
  // {
  //   num: '00108',
  //   event: '检测到密码破解尝试行为事件记录',
  //   level: '中',
  //   system: '强密码策略',
  //   deal: '处理中'
  // },
  // {
  //   num: '00109',
  //   event: '发现虚假网站仿冒行为事件记录',
  //   level: '高',
  //   system: '网站监控',
  //   deal: '已处理'
  // },
  // {
  //   num: '00110',
  //   event: '检测到数据备份失败行为事件记录',
  //   level: '中',
  //   system: '备份管理',
  //   deal: '已处理'
  // },
  // {
  //   num: '00111',
  //   event: '检测到恶意软件更新活动事件记录',
  //   level: '高',
  //   system: '安全更新',
  //   deal: '已处理'
  // },
  // {
  //   num: '00112',
  //   event: '发现信息泄露行为事件问题记录',
  //   level: '高',
  //   system: '数据保护',
  //   deal: '已处理'
  // },
  // {
  //   num: '00113',
  //   event: '检测到系统配置错误行为事件记录',
  //   level: '低',
  //   system: '配置审计',
  //   deal: '已处理'
  // },
  // {
  //   num: '00114',
  //   event: '发现网络流量异常现象事件记录',
  //   level: '中',
  //   system: '流量分析',
  //   deal: '处理中'
  // },
  // {
  //   num: '00115',
  //   event: '发现未授权访问行为事件问题记录',
  //   level: '高',
  //   system: '访问控制',
  //   deal: '已处理'
  // }
]

onMounted(() => {
  getLog()
})

function getLog() {
  request.Post('/syslog/page', { current: 1, pageSize: 20 }).then((res: any) => {
    if (res && res.code === 1 && res.data && res.data.length > 0) {
      scrollList.value = res.data
    } else {
      scrollList.value = []
    }
    nextTick(() => {
      autoScroll()
    })
  })
}

// 设置自动滚动
let scrollTimer: any = ''
const scroll_table = ref<HTMLElement | null>(null)

const autoScroll = (stop?: boolean) => {
  let divData: any = null
  if (scroll_table.value) {
    //拿到表格中承载数据的div元素
    divData = scroll_table.value.querySelector('.scrolling-list-text') as HTMLElement
  }
  if (divData) {
    if (stop) {
      window.clearInterval(scrollTimer)
    } else {
      scrollTimer = window.setInterval(() => {
        //元素自增距离顶部1像素
        divData.scrollTop += 46
        // 判断元素是否滚动到底部
        if (divData.clientHeight + divData.scrollTop >= divData.scrollHeight) {
          //重置table的顶部距离
          divData.scrollTop = 0
        }
      }, 2000) //滚动速度
    }
  }
}
</script>

<style lang="less" scoped>
.main-center-bottom {
  position: relative;
  width: 100%;
  height: 388px;
  background: rgb(0 28 47 / 30%);
  display: flex;

  .item {
    height: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    .img {
      width: 213px;
      height: 324px;
    }

    .img2 {
      width: 200px;
      height: 160px;
    }
  }

  .line-box {
    height: 100%;
    width: 4px;
    display: flex;
    justify-content: center;
    align-items: center;

    .line-center {
      width: 4px;
      height: 200px;
      background: linear-gradient(to bottom, #428ace00 0%, #1aa8d5 50%, #428ace00 100%);
    }
  }

  .item-test {
    height: 100%;
    width: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .img {
      width: 213px;
      height: 324px;
    }

    .img2 {
      width: 200px;
      height: 160px;
    }
  }
}

.scroll-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-size: 16px;
  overflow: hidden;
  border: none;
  height: 390px;
  box-sizing: border-box;

  /* 确保列表框有高度 */
  .scroll-item-box {
    width: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 14px 20px;
    font-size: 14px;
    color: white;

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

    .ball-zc {
      margin-right: 30px;
      width: 16px;
      height: 16px;
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
    }

    .normal {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 30px;
      height: 18px;
      background-color: #f07300;
      border-radius: 4px;
    }

    .low {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 30px;
      height: 18px;
      background-color: #099a74;
      border-radius: 4px;
    }
  }

  .scrolling-list-text {
    width: 100%;
    box-sizing: border-box;
    height: 100%;
    border: none;
    overflow-y: scroll;
    scrollbar-width: none !important; //隐藏滚动条
    -ms-overflow-style: none !important; //隐藏滚动条

    ::-webkit-scrollbar {
      display: none !important; //隐藏滚动条
      width: 0 !important;
    }
  }
}
</style>
