<template>
  <!-- <div class="bg-white ml-20 mr-20 mt-20 p-20 rounded-[14px]">
        <a-tabs v-model:active-key="activeKey">
            <a-tab-pane :key="1" title="文档">
            </a-tab-pane>
            <a-tab-pane :key="2" title="问题">
            </a-tab-pane>
            <a-tab-pane :key="3" title="命中测试">
            </a-tab-pane>
            <a-tab-pane :key="4" title="设置">
            </a-tab-pane>
        </a-tabs>
    </div> -->

  <div class="h-full">
    <Document />
    <!-- <Document v-if="activeKey == 1" />
        <Question v-if="activeKey == 2" />
        <hitTesting v-if="activeKey == 3" />
        <Setup v-if="activeKey == 4" /> -->
  </div>
</template>

<script lang="ts" setup>
import Document from './components/document.vue'
// import Question from './components/question.vue';
// import hitTesting from './components/hitTesting.vue';
// import Setup from './components/setup.vue';
const activeKey = ref(1)
</script>

<style lang="less" scoped>
:deep(.arco-tabs-content) {
  display: none !important;
}
</style>
