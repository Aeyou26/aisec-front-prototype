<template>
  <div v-if="displayItems.length > 0" class="security-event-scroll">
    <div ref="scrollContainer" class="scroll-container">
      <div v-for="(item, index) in displayItems" :key="index" class="event-item" :class="getEventLevelClass(item.level)">
        <span class="event-number">{{ item.num }}</span>
        <span class="event-text">{{ item.event }}</span>
        <span class="event-level" :class="getLevelTextClass(item.level)">{{ item.level }}</span>
      </div>
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-full">
    <a-empty description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import request from '@/request'
import { ref, onMounted, computed } from 'vue'

interface StatItem {
  icon: string
  label: string
  value: string | number
  alert?: boolean
}

const list = [
  {
    num: '00100',
    event: '检测到网络钓鱼攻击行为事件记录',
    level: '高',
    system: '入侵检测系统',
    deal: '已处理'
  },
  {
    num: '00101',
    event: '发现敏感数据通过未加密通道传输',
    level: '高',
    system: '数据加密',
    deal: '处理中'
  },
  {
    num: '00102',
    event: '检测到恶意软件传播活动事件记录',
    level: '高',
    system: '反病毒软件',
    deal: '已处理'
  },
  {
    num: '00103',
    event: '发现内部人员威胁行为事件记录',
    level: '高',
    system: '安全审计',
    deal: '已处理'
  },
  {
    num: '00104',
    event: '检测到恶意链接点击行为事件记录',
    level: '低',
    system: '网络过滤',
    deal: '已处理'
  },
  {
    num: '00105',
    event: '检测到木马病毒感染活动事件记',
    level: '高',
    system: '反病毒软件',
    deal: '已处理'
  },
  {
    num: '00106',
    event: '发现数据篡改行为事件问题记录',
    level: '高',
    system: '完整性检查',
    deal: '处理中'
  },
  {
    num: '00107',
    event: '发现恶意广告投放活动事件记录',
    level: '低',
    system: '广告拦截',
    deal: '待处理'
  },
  {
    num: '00108',
    event: '检测到密码破解尝试行为事件记录',
    level: '中',
    system: '强密码策略',
    deal: '处理中'
  },
  {
    num: '00109',
    event: '发现虚假网站仿冒行为事件记录',
    level: '高',
    system: '网站监控',
    deal: '已处理'
  },
  {
    num: '00110',
    event: '检测到数据备份失败行为事件记录',
    level: '中',
    system: '备份管理',
    deal: '已处理'
  },
  {
    num: '00111',
    event: '检测到恶意软件更新活动事件记录',
    level: '高',
    system: '安全更新',
    deal: '已处理'
  },
  {
    num: '00112',
    event: '发现信息泄露行为事件问题记录',
    level: '高',
    system: '数据保护',
    deal: '已处理'
  },
  {
    num: '00113',
    event: '检测到系统配置错误行为事件记录',
    level: '低',
    system: '配置审计',
    deal: '已处理'
  },
  {
    num: '00114',
    event: '发现网络流量异常现象事件记录',
    level: '中',
    system: '流量分析',
    deal: '处理中'
  },
  {
    num: '00115',
    event: '发现未授权访问行为事件问题记录',
    level: '高',
    system: '访问控制',
    deal: '已处理'
  }
]

function getLog() {
  request.Post('/syslog/page', { current: 1, pageSize: 6 }).then((res: any) => {
    if (res && res.code === 1 && res.data && res.data.length > 0) {
      const resData = res.data.map((item: any) => {
        return {
          num: item?.attackType,
          event: item?.logType,
          level: item?.level
        }
      })
      displayItems.value = resData
      // 设置定时器进行滚动
      setInterval(() => {
        // 移动第一个元素到数组末尾
        const firstItem = displayItems.value.shift()
        if (firstItem) {
          displayItems.value.push(firstItem)
        }
      }, 2000) // 每3秒滚动一次
    } else {
      displayItems.value = []
    }
  })
}

const displayItems = ref<typeof list>([])
const scrollContainer = ref<HTMLElement | null>(null)

// 显示6条数据
const visibleCount = 6

// 准备展示数据
onMounted(() => {
  getLog()
  // 初始化显示数据
  // displayItems.value = [...list.slice(0, visibleCount)]

  // // 设置定时器进行滚动
  // setInterval(() => {
  //   // 移动第一个元素到数组末尾
  //   const firstItem = displayItems.value.shift()
  //   if (firstItem) {
  //     displayItems.value.push(firstItem)
  //   }
  // }, 2000) // 每3秒滚动一次
})

// 根据安全级别获取样式类
const getEventLevelClass = (level: string) => {
  switch (level) {
    case '高':
      return 'level-high'
    case '中':
      return 'level-medium'
    case '低':
      return 'level-low'
    default:
      return ''
  }
}

// 获取级别文字的样式类
const getLevelTextClass = (level: string) => {
  switch (level) {
    case '高':
      return 'text-high'
    case '中':
      return 'text-medium'
    case '低':
      return 'text-low'
    default:
      return ''
  }
}
</script>

<style scoped lang="less">
.security-event-scroll {
  height: 300px;
  width: 100%;
  overflow: hidden;
}

.scroll-container {
  display: flex;
  flex-direction: column;
  transition: transform 0.5s ease;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 4px;
  background: rgb(26 32 44 / 40%);

  &.level-high {
    border-left: 3px solid #e53e3e;
  }

  &.level-medium {
    border-left: 3px solid #dd6b20;
  }

  &.level-low {
    border-left: 3px solid #38a169;
  }
}

.event-number {
  font-weight: 600;
  margin-right: 15px;
  min-width: 50px;
}

.event-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-level {
  margin-left: 15px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  text-align: center;
  min-width: 40px;

  &.text-high {
    background: rgb(229 62 62 / 20%);
    color: #fc8181;
  }

  &.text-medium {
    background: rgb(221 107 32 / 20%);
    color: #fbd38d;
  }

  &.text-low {
    background: rgb(56 161 105 / 20%);
    color: #68d391;
  }
}
</style>
