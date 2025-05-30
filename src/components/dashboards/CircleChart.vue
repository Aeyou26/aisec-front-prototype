<template>
  <div v-if="displayedItems.length > 0" class="knowledge-list">
    <div class="knowledge-container">
      <div v-for="item in displayedItems" :key="item.id" class="knowledge-item">
        <div class="item-header">
          <div class="item-name">{{ item.knowledgeName }}</div>
        </div>
        <div class="item-description">{{ item.description }}</div>
        <div class="item-count">{{ item.docCount }} 篇</div>
      </div>
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-full">
    <a-empty description="暂无数据" />
  </div>
</template>

<script setup lang="ts">
import request from '@/request'
import { ref, onMounted } from 'vue'

const displayedItems = ref<any[]>([])

const getData = () => {
  request.Post('/knowledge/page', { limit: 6 }).then((res: any) => {
    displayedItems.value = res.data?.slice(0, 6) || []
  })
}

onMounted(() => {
  getData()
})
</script>

<style scoped lang="less">
.knowledge-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .knowledge-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 10px;
    overflow-y: auto;
    padding-top: 8px;
  }

  .knowledge-item {
    background: rgb(26 26 46 / 80%);
    border-radius: 8px;
    padding: 10px;
    border: 1px solid rgb(66 153 225 / 20%);
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      box-shadow: 0 0 10px rgb(66 153 225 / 30%);
      transform: translateY(-2px);
      border-color: rgb(66 153 225 / 50%);
    }

    .item-header {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
    }

    .item-name {
      font-weight: bold;
      color: #4299e1;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .item-count {
      position: absolute;
      bottom: 6px;
      right: 8px;
      font-size: 10px;
      color: rgb(160 174 192 / 80%);
    }

    .item-description {
      color: #a0aec0;
      font-size: 12px;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 14px;
    }
  }
}
</style>
