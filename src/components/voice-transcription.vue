<template>
  <!-- 录音控制 -->
  <component :is="useIcon(showIcon, { size })" class="cursor-pointer" @click="handleRecording" />
  <!-- <button :disabled="!audioBlob" @click="uploadAudio">上传录音文件</button> -->
</template>

<script setup>
import request from '@/request'
import useIcon from '@/hooks/useIcon'
import { Message } from '@arco-design/web-vue'
import RecordRTC from 'recordrtc'

const props = defineProps({
  size: {
    type: [String, Number],
    default: 24
  },
  robotId: {
    type: [String, Number],
    required: true
  },
  sessionId: {
    type: String,
    required: true
  }
})
// 定义事件
const emit = defineEmits(['startRecording', 'stopRecording', 'onTranscriptionComplete'])
const isRecording = ref(false)
const resultText = ref('')
const chatStore = useChatStore()
const chatLoading = computed(() => chatStore.showHandleRobot)
const currentMessageId = computed(() => chatStore.currentMessageId)
let recorder = null
let stream = null

const showIcon = computed(() => {
  return isRecording.value ? 'stop' : 'voice'
})

// 添加录音开始时间记录
let recordStartTime = 0

// 检查录音限制
const checkRecordingLimits = (blob) => {
  const currentTime = Date.now()
  const recordingDuration = currentTime - recordStartTime
  const fileSizeMB = blob.size / (1024 * 1024)

  // 如果录音时长超过60秒或文件大小接近2MB，自动停止录音
  if (recordingDuration >= 60000 || fileSizeMB >= 1.9) {
    stopRecording()
    if (recordingDuration >= 60000) {
      Message.warning('录音已达到60秒限制')
    } else {
      Message.warning('录音文件即将达到大小限制')
    }
  }
}

// 初始化录音
const initRecorder = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1, // 单声道
        sampleRate: 16000, // 16kHz采样率
        sampleSize: 16, // 16bits位深
        echoCancellation: true,
        noiseSuppression: true
      }
    })

    recorder = new RecordRTC(stream, {
      type: 'audio',
      mimeType: 'audio/wav', // 或 'audio/pcm'
      recorderType: RecordRTC.StereoAudioRecorder,
      numberOfAudioChannels: 1, // 单声道
      desiredSampRate: 16000, // 16kHz采样率
      bufferSize: 4096,
      timeSlice: 1000, // 每秒检查一次
      ondataavailable: (blob) => {
        checkRecordingLimits(blob)
      }
    })

    return true
  } catch (error) {
    Message.error('初始化录音失败，请检查麦克风权限')
    return false
  }
}

// 处理录音
const handleRecording = async () => {
  if (chatLoading.value || currentMessageId.value) {
    Message.warning('请等待上一次消息完成，请稍后...')
    return
  }
  if (isRecording.value) {
    stopRecording()
    return
  }

  // 每次录音都重新初始化
  const initialized = await initRecorder()
  if (!initialized) {
    return
  }

  try {
    recordStartTime = Date.now() // 记录开始时间
    recorder.startRecording()
    isRecording.value = true
    Message.success('开始录音')
  } catch (error) {
    Message.error('开始录音失败，请重试')
  }
}

// 停止录音
const stopRecording = () => {
  if (!recorder || !isRecording.value) {
    return
  }

  recorder.stopRecording(async () => {
    const blob = recorder.getBlob()
    isRecording.value = false
    recordStartTime = 0 // 重置开始时间

    // 清理当前录音器和媒体流
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
    recorder.destroy()
    recorder = null

    Message.success('录音完成')
    await uploadAudio(blob)
  })
}

// 上传音频文件
const uploadAudio = async (blob) => {
  const formData = new FormData()
  // 测试下载录音文件到本地
  // const url = URL.createObjectURL(blob)
  // const a = document.createElement('a')
  // a.href = url
  // a.download = 'recording.wav'
  // a.click()
  // console.log(blob)
  // 测试上传本地文件
  // const b = new Blob([sentenceDemo], { type: 'audio/wav' })

  formData.append('file', blob, `recording_${Date.now()}.wav`)
  formData.append('robotId', props.robotId)
  formData.append('sessionId', props.sessionId)

  try {
    emit('startRecording')
    request
      .Post('/user/chat/asr', formData)
      .then((res) => {
        resultText.value = res.data
        Message.success('语音转换成功')
        emit('onTranscriptionComplete', resultText.value)
      })
      .finally(() => {
        emit('stopRecording')
      })
  } catch (error) {
    Message.error('语音转换失败')
    emit('stopRecording')
  }
}

// 组件销毁时清理资源
onUnmounted(() => {
  if (recorder) {
    recorder.stopRecording(() => {
      recorder.destroy()
      recorder = null
    })
  }
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
})
</script>

<style scoped></style>
