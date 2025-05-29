<template>
  <div class="w-100% min-w-870 h-160 flex items-center rounded-14 box-border">
    <div class="flex-1 flex items-center mr-28 bg-#ffffff h-full p-32 rounded-[14px]">
      <div class="flex-1 flex flex-col items-center justify-center">
        <div class="icon-wrapper">
          <div class="ripple-container">
            <div class="ripple"></div>
            <div class="ripple"></div>
            <div class="ripple"></div>
          </div>
          <SvgIcon name="safe-header" class="cursor-pointer icon-position" size="98" />
        </div>
        <div class="color-#999999 text-14">钓鱼邮件检测中...</div>
      </div>
      <div class="line"></div>
      <div class="flex-1 flex justify-center">
        <div class="w-150 flex flex-col items-center">
          <div class="color-#2E66C7 text-48 font-600 mb-28">21</div>
          <div class="color-#666666 text-18">钓鱼邮件数</div>
        </div>
      </div>
    </div>
    <div class="flex-1 flex items-center bg-#ffffff  h-full p-32 rounded-[14px]">
      <div class="flex-1 flex flex-col items-center justify-center">
        <SvgIcon name="safe-header2" class="cursor-pointer rotate-animation" size="98" :color="'red'" />
        <div class="color-#999999 text-14">安全日志分析中...</div>
      </div>
      <div class="line"></div>
      <div class="flex-1 flex justify-center">
        <div class="flex-1 flex justify-center">
          <div class="">
            <div class="color-#DB5757 text-48 font-600 mb-28">21</div>
            <div class="color-#666666 text-18">漏洞数</div>
          </div>
        </div>
        <div class="flex-1 flex justify-center">
          <div class="">
            <div class="color-#DB5757 text-48 font-600 mb-28">64</div>
            <div class="color-#666666 text-18">威胁数</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup></script>

<style lang="less" scoped>
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
</style>
