<template>
  <Page :table="false">
    <div class="w-100% h-100% flex justify-center items-start pt-40 px-20">
      <div class="accredit-container">
        <!-- 标题区域 -->
        <div class="header-section">
          <div class="title-wrapper">
            <div class="title-indicator"></div>
            <h2 class="title-text">软件许可</h2>
          </div>
          <p class="subtitle">管理系统授权信息和许可文件</p>
        </div>

        <!-- 表单卡片 -->
        <div class="form-card">
          <a-form ref="formRef" :model="form" layout="vertical" class="accredit-form">
            <div class="form-grid">
              <a-form-item label="授权对象" class="form-item">
                <div class="info-display">
                  <icon-user class="info-icon" />
                  <span class="info-text">{{ form.orgName || '-' }}</span>
                </div>
              </a-form-item>

              <a-form-item label="授权机器序列号" class="form-item">
                <div class="info-display">
                  <icon-computer class="info-icon" />
                  <span class="info-text serial-text">{{ form.hash || '-' }}</span>
                </div>
              </a-form-item>

              <a-form-item label="过期时间" class="form-item">
                <div class="info-display w-300">
                  <icon-clock-circle class="info-icon" />
                  <span class="w-max" :class="getTimeStatusClass">{{ form.endTime || '未授权' }} </span>
                  <span v-if="form.endTime && form.state" class="flex-1" :class="getTimeStatusClass">({{ form.state }})</span>
                </div>
              </a-form-item>

              <a-form-item label="授权文件" :rules="[{ required: true, message: '请选择授权文件' }]" class="form-item upload-item">
                <a-upload
                  ref="uploadRef"
                  action="/api/sys/license/upload"
                  :headers="{ Authorization: token }"
                  :file-list="fileList"
                  class="custom-upload"
                  :show-file-list="false"
                  :limit="1"
                  :auto-upload="false"
                  accept=".aisec"
                  @change="handleUploadChange"
                  @success="onUploadSuccess"
                >
                  <template #upload-button>
                    <div class="upload-area">
                      <icon-folder class="upload-icon" />
                      <div class="upload-text">
                        <div class="upload-title">点击上传授权文件</div>
                        <div class="upload-hint">仅支持 .aisec 格式</div>
                      </div>
                    </div>
                  </template>
                </a-upload>
                <div v-if="showFileName" class="upload-file-display">
                  <icon-file class="file-icon" />
                  <span class="file-name">{{ showFileName }}</span>
                  <icon-close class="delete-btn" @click="clearFile" />
                </div>
              </a-form-item>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <a-button type="primary" size="large" class="submit-btn" @click="handleSubmit">
                <template #icon>
                  <icon-check />
                </template>
                {{ form.endTime ? '更新授权' : '确认授权' }}
              </a-button>
              <a-button size="large" class="reset-btn" @click="clearFile">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
            </div>
          </a-form>
        </div>
      </div>
    </div>
  </Page>
</template>

<script lang="ts" setup>
import type { FileItem, FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import request from '@/request'

const { token } = storeToRefs(useUserStore())
const formRef = ref<FormInstance>()
const uploadRef = ref()
const fileList = ref<FileItem[]>([])
const showFileName = ref('')

const form = reactive({
  orgName: '',
  hash: '',
  endTime: '',
  state: ''
})

// 判断过期时间状态的计算属性
const getTimeStatusClass = computed(() => {
  if (!form.endTime) {
    return 'time-unauthorized' // 未授权状态
  }

  const currentTime = new Date()
  const endTime = new Date(form.endTime)

  if (currentTime > endTime) {
    return 'time-expired' // 已过期 - 红色
  }
  return 'time-valid' // 未过期 - 绿色
})

const handleUploadChange = (fileList: FileItem[], fileItem: FileItem) => {
  if (fileItem) {
    showFileName.value = fileItem.name
  }
}

const clearFile = () => {
  fileList.value = []
  showFileName.value = ''
}
const handleSubmit = (e: any) => {
  e.stopPropagation()
  uploadRef.value.submit(fileList.value.find((x: any) => x.status === 'init'))
}
const getInfo = async () => {
  request.Get('/sys/license').then((res: any) => {
    if (res.data) {
      Object.assign(form, res.data)
    }
  })
}

function onUploadSuccess(data: any) {
  if (data.response.code === 1) {
    Message.success('授权文件上传成功')
    getInfo()
  }
}
onMounted(() => {
  getInfo()
})
</script>

<style lang="less" scoped>
// 响应式设计
@media (width <= 768px) {
  .accredit-container {
    padding: 0 12px;
  }

  .form-card {
    padding: 18px 16px;
  }

  .action-buttons {
    flex-direction: column;

    .submit-btn,
    .reset-btn {
      width: 100%;
    }
  }
}

.accredit-container {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
  text-align: left;

  .title-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 6px;

    .title-indicator {
      width: 3px;
      height: 20px;
      background: linear-gradient(135deg, #2f73e7, #1890ff);
      border-radius: 2px;
    }

    .title-text {
      font-size: 20px;
      font-weight: 600;
      color: #1d2129;
      margin: 0;
    }
  }

  .subtitle {
    color: #86909c;
    font-size: 13px;
    margin: 0;
  }
}

.form-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 6%);
  border: 1px solid #f0f0f0;
}

.accredit-form {
  .form-grid {
    display: grid;
    gap: 18px;
    margin-bottom: 24px;
  }

  .form-item {
    :deep(.arco-form-item-label) {
      font-weight: 500;
      color: #1d2129;
      font-size: 13px;
      margin-bottom: 6px;
    }
  }

  .info-display {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: #f7f8fa;
    border-radius: 6px;
    border: 1px solid #e5e6eb;
    min-height: 40px;

    .info-icon {
      font-size: 18px;
      color: #86909c;
      flex-shrink: 0;
    }

    .info-text {
      color: #1d2129;
      font-size: 13px;
      flex: 1;
      word-break: break-all;

      &.serial-text {
        font-family: Consolas, Monaco, monospace;
        font-size: 11px;
        color: #4e5969;
      }
    }
  }

  // 时间状态样式
  .time-unauthorized {
    color: #86909c !important; // 灰色 - 未授权
    font-weight: 500;
  }

  .time-expired {
    color: #f53f3f !important; // 红色 - 已过期
    font-weight: 600;
  }

  .time-valid {
    color: #2b78eb !important; // 绿色 - 有效
    font-weight: 600;
  }

  .upload-item {
    :deep(.arco-upload) {
      width: 100%;
    }

    .custom-upload {
      width: 100%;
    }

    .upload-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px;
      border: 2px dashed #d9d9d9;
      border-radius: 6px;
      background: #fafafa;
      transition: all 0.3s ease;
      cursor: pointer;
      width: 100%;

      &:hover {
        border-color: #2f73e7;
        background: #f0f7ff;
      }

      .upload-icon {
        font-size: 24px;
        color: #86909c;
        flex-shrink: 0;
      }

      .upload-text {
        flex: 1;

        .upload-title {
          font-size: 13px;
          color: #1d2129;
          font-weight: 500;
          margin-bottom: 3px;
        }

        .upload-hint {
          font-size: 11px;
          color: #86909c;
        }
      }
    }
  }
}

.upload-file-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-top: 8px;
  background: #f0f7ff;
  border: 1px solid #bedaff;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: default;

  &:hover {
    background: #e6f4ff;
    border-color: #91caff;
  }

  .file-icon {
    font-size: 16px;
    color: #2f73e7;
    flex-shrink: 0;
  }

  .file-name {
    flex: 1;
    font-size: 13px;
    color: #1d2129;
    word-break: break-all;
    line-height: 1.4;
  }

  .delete-btn {
    font-size: 14px;
    color: #f53f3f;
    cursor: pointer;
    padding: 2px;
    border-radius: 50%;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background: #ffece8;
      color: #cb272d;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 18px;
  border-top: 1px solid #f0f0f0;

  .submit-btn {
    background: linear-gradient(135deg, #2f73e7, #1890ff);
    border: none;
    border-radius: 6px;
    padding: 0 24px;
    height: 36px;
    font-weight: 500;
    font-size: 13px;
    box-shadow: 0 2px 6px rgb(47 115 231 / 30%);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgb(47 115 231 / 40%);
    }
  }

  .reset-btn {
    border-radius: 6px;
    padding: 0 24px;
    height: 36px;
    font-weight: 500;
    font-size: 13px;
    border-color: #d9d9d9;
    color: #4e5969;

    &:hover {
      border-color: #2f73e7;
      color: #2f73e7;
    }
  }
}
</style>
