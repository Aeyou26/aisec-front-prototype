<template>
  <div
    class="dashboard-card select-none"
    :style="{
      transform: `rotateY(${rotateY}deg) rotateZ(${rotation}deg)`,
      left: position.left,
      right: position.right,
      top: position.top
    }"
  >
    <div class="card-inner">
      <div class="card-header">
        <div class="card-title">{{ title }}</div>
        <div class="card-status"></div>
      </div>
      <div class="card-content">
        <slot></slot>
      </div>
      <div class="card-edge-highlight"></div>
      <div class="card-corner-bolts">
        <div class="bolt bolt-tl"></div>
        <div class="bolt bolt-tr"></div>
        <div class="bolt bolt-bl"></div>
        <div class="bolt bolt-br"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '仪表盘'
  },
  rotation: {
    type: Number,
    default: 0
  },
  rotateY: {
    type: Number,
    default: 0
  },
  position: {
    type: Object,
    default: () => ({
      left: 'auto',
      right: 'auto',
      top: '100px'
    })
  }
})
</script>

<style scoped lang="less">
.dashboard-card {
  position: absolute;
  width: 320px;
  height: 360px;
  perspective: 1000px;
  transition: all 0.5s ease-in-out;
  z-index: 30;
  transform-origin: center center;
  transform-style: preserve-3d;

  &:hover {
    transform: scale(1.05) rotateY(0deg) rotateZ(0deg) !important;
    z-index: 40;

    .card-inner {
      box-shadow:
        inset 5px 5px 15px rgb(0 0 0 / 70%),
        inset -5px -5px 15px rgb(50 50 80 / 30%),
        0 0 30px rgb(0 128 255 / 40%),
        0 0 50px rgb(0 0 0 / 50%);

      &::before {
        opacity: 1;
        background: linear-gradient(90deg, transparent, rgb(0 200 255 / 90%), transparent);
      }
    }

    .card-edge-highlight {
      opacity: 1;
    }

    .bolt {
      background: rgb(0 128 255 / 70%);
      box-shadow: 0 0 10px rgb(0 128 255 / 50%);
    }
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 24px;
    background: linear-gradient(145deg, #131328, #1f1f3a);
    box-shadow:
      inset 5px 5px 15px rgb(0 0 0 / 70%),
      inset -5px -5px 15px rgb(50 50 80 / 30%),
      0 0 20px rgb(0 128 255 / 20%),
      0 0 30px rgb(0 0 0 / 50%);
    padding: 16px;
    display: flex;
    flex-direction: column;
    color: #e0e0e0;
    overflow: hidden;
    transition: all 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgb(0 128 255 / 70%), transparent);
      transition: all 0.3s ease;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    border-bottom: 1px solid rgb(100 100 150 / 30%);
    padding-bottom: 8px;
  }

  .card-title {
    font-size: 18px;
    font-weight: bold;
    text-shadow: 0 0 5px rgb(0 128 255 / 70%);
  }

  .card-status {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgb(0 200 100 / 60%);
    box-shadow: 0 0 10px rgb(0 200 100 / 60%);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgb(0 255 150 / 90%);
    }
  }

  .card-content {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-edge-highlight {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgb(0 128 255 / 40%), transparent);
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  .card-corner-bolts {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .bolt {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(80 100 140 / 80%);
    box-shadow: 0 0 5px rgb(0 80 150 / 30%);
    transition: all 0.3s ease;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 4px;
      height: 1px;
      background: rgb(255 255 255 / 50%);
    }

    &.bolt-tl {
      top: 10px;
      left: 10px;
    }

    &.bolt-tr {
      top: 10px;
      right: 10px;
    }

    &.bolt-bl {
      bottom: 10px;
      left: 10px;
    }

    &.bolt-br {
      bottom: 10px;
      right: 10px;
    }
  }
}
</style>
