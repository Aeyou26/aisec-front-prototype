<template>
  <div class="topology-container">
    <div class="topology-placeholder">
      <h3>网络拓扑图（原型模式）</h3>
      <div class="topology-mock">
        <div class="node server">服务器</div>
        <div class="line"></div>
        <div class="node switch">交换机</div>
        <div class="line"></div>
        <div class="node firewall">防火墙</div>
        <div class="line"></div>
        <div class="node internet">互联网</div>
      </div>
      <p class="info">原型版本中使用简化的拓扑展示</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 简化的拓扑图组件，移除G6依赖

defineProps<{
  data?: any[]
}>()

// 模拟数据展示
console.log('拓扑图组件已简化，移除G6依赖')
</script>

<style scoped>
.topology-container {
  width: 100%;
  height: 400px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topology-placeholder {
  text-align: center;
  padding: 32px;
}

.topology-placeholder h3 {
  color: #666;
  margin-bottom: 24px;
}

.topology-mock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin: 24px 0;
}

.node {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
}

.server {
  background: #e3f2fd;
  color: #1976d2;
  border: 2px solid #1976d2;
}

.switch {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 2px solid #7b1fa2;
}

.firewall {
  background: #fff3e0;
  color: #f57c00;
  border: 2px solid #f57c00;
}

.internet {
  background: #e8f5e8;
  color: #388e3c;
  border: 2px solid #388e3c;
}

.line {
  width: 40px;
  height: 2px;
  background: #666;
  margin: 0 8px;
}

.info {
  color: #999;
  font-size: 12px;
  margin-top: 16px;
}
</style>
