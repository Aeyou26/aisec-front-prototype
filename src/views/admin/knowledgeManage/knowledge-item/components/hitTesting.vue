<template>
  <div class="content-box">
    <div class="color-#999999 text-12">针对用户提问调试段落匹配情况，保障回答效果。</div>
    <div class="flex-1 flex flex-col justify-center items-center">
      <SvgIcon name="document-empty" :size="150" class="mb-20" />
      <div class="text-14 color-#999999">命中的段落显示在这里</div>
    </div>
  </div>
  <div class="send-box">
    <textarea
      v-model="inputMessage"
      class="w-full h-30 px-16 text-16 whitespace-pre-wrap resize-none outline-none border-none bg-#ffffff rounded-20 whitespace-pre-wrap overflow-y-auto leading-28"
      :placeholder="'在此输入内容，Enter发送，Shift+Enter换行'"
      @keydown="handleKeyDown"
    >
    </textarea>
    <a-button type="outline" class="mr-20">参数设置</a-button>
    <SvgIcon name="document-send" :size="32" class="mr-20" />
  </div>
</template>

<script lang="ts" setup>
const inputMessage = ref('')

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    console.log('enter')
  }
}
</script>

<style lang="less" scoped>
.content-box {
  display: flex;
  flex-direction: column;
  margin: 20px;
  padding: 20px 48px;
  height: 700px;
  border-radius: 14px;
  opacity: 1;
  background: #fff;
  box-shadow: 0 8px 40px 0 #00266914;
}

.send-box {
  display: flex;
  align-items: center;
  margin: 20px;
  height: 60px;
  border-radius: 8px;
  opacity: 1;
  background: #fff;
  box-shadow: 0 8px 40px 0 #00266914;
}
</style>
