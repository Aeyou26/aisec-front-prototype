<script lang="ts" setup>
import { useForm } from '@alova/scene-vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import useModalVisible from '@/hooks/useModalVisible'
import request from '@/request'
import { ref, shallowRef, onBeforeUnmount, nextTick, computed } from 'vue'
import { templateType } from '@/utils/dict'
import { AiEditor } from 'aieditor'
import 'aieditor/dist/style.css'
import { removeEmptyAttr } from '@/utils/tools'

interface TagType {
  name: string
  key: string
  type: string
  description: string
}
const { visible, initData, openModal, closeModal } = useModalVisible<any>()

const formRef = ref<FormInstance>()
const emit = defineEmits(['upload'])
const searchValue = ref('')
const editLoading = ref(false)

// 编辑器实例
const editorRef = shallowRef<any>(null)
// 编辑器DOM容器引用
const editorContainerRef = ref<HTMLElement | null>(null)

const statusOptions = ref<any[]>([
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
])
const tagList = ref<TagType[]>([])

// 添加标签相关
const tagFormRef = ref<FormInstance>()
const tagFormVisible = ref(false)
const tagForm = ref({
  name: '',
  key: '',
  type: '文本',
  description: ''
})

// 编辑模式标识
const isEditMode = ref(false)
const editingTagIndex = ref(-1)

// type选项
const typeOptions = ref([
  { label: '文本标签', value: '文本' },
  { label: '数值标签', value: '数值' },
  { label: '表格标签', value: '表格' },
  { label: '图表标签', value: '图表' }
])

// 处理添加标签
function handleAddTag() {
  isEditMode.value = false
  tagForm.value = { name: '', key: '', type: '文本', description: '' }
  tagFormVisible.value = true
}

// 处理编辑标签
function handleEditTag(item: TagType, index: number, event?: MouseEvent) {
  if (event) {
    event.stopPropagation()
  }
  isEditMode.value = true
  editingTagIndex.value = index
  tagForm.value = { ...item }
  tagFormVisible.value = true
}

// 处理删除标签
function handleDeleteTag(index: number, event?: MouseEvent) {
  if (event) {
    event.stopPropagation()
  }
  tagList.value.splice(index, 1)
  Message.success('标签删除成功')
}

// 添加新标签
function addTag() {
  tagFormRef.value?.validate().then((errors: any) => {
    if (!errors) {
      if (isEditMode.value) {
        // 编辑模式：更新现有标签
        if (editingTagIndex.value >= 0) {
          // 检查key是否已存在（排除当前编辑的标签）
          const existingTag = tagList.value.find((tag, idx) => tag.key === tagForm.value.key && idx !== editingTagIndex.value)
          if (existingTag) {
            Message.error(`标签Key已存在于标签"${existingTag.name}"中`)
            return
          }

          tagList.value[editingTagIndex.value] = { ...tagForm.value }
          Message.success('标签编辑成功')
        }
      } else {
        // 添加模式：添加新标签
        // 检查key是否已存在（完全匹配）
        const existingTag = tagList.value.find((tag) => tag.key === tagForm.value.key)
        if (existingTag) {
          Message.error(`标签Key已存在于标签"${existingTag.name}"中`)
          return
        }

        // 添加新标签
        tagList.value.push({
          name: tagForm.value.name,
          key: tagForm.value.key,
          type: tagForm.value.type,
          description: tagForm.value.description
        })
        Message.success('标签添加成功')
      }

      // 重置表单并关闭弹窗
      tagForm.value = { name: '', key: '', type: '文本', description: '' }
      tagFormVisible.value = false
    }
  })
}

// 关闭标签表单
function closeTagForm() {
  tagForm.value = { name: '', key: '', type: '文本', description: '' }
  tagFormVisible.value = false
  isEditMode.value = false
  editingTagIndex.value = -1
}

// 初始化编辑器
function initEditor() {
  if (!editorContainerRef.value) {
    return
  }

  try {
    // 创建编辑器实例
    editorRef.value = new AiEditor({
      element: editorContainerRef.value,
      placeholder: '请输入模板内容...',
      content: '', // 初始化时先不设置内容，之后单独处理
      // 极简工具栏，只保留最基本的文本编辑功能
      toolbarKeys: [
        'undo', // 撤销：取消上一步操作
        'redo', // 重做：恢复已撤销的操作
        '|', // 分隔符：工具栏视觉分组
        'bold', // 粗体：使文字加粗显示
        'italic', // 斜体：使文字倾斜显示
        'strike', // 删除线：在文字上添加删除线
        'heading', // 标题级别：设置文字为标题
        '|', // 分隔符
        'todo', // 待办事项：创建任务列表
        'table', // 表格：创建和编辑表格
        'bullet-list', // 无序列表：创建项目符号列表
        'ordered-list', // 有序列表：创建带编号的列表
        'brush', // 格式刷：复制文本格式
        'eraser' // 清除格式：移除文本格式
      ],
      // 禁用所有其他功能
      toolbarExcludeKeys: [
        'ai', // AI功能：AI辅助写作功能
        'source-code', // 源代码编辑：查看HTML源码
        'emoji', // 表情符号：插入表情图标
        'image', // 图片上传：插入图片功能
        'video', // 视频上传：插入视频功能
        'quote', // 引用：创建引用块
        'code-block', // 代码块：插入格式化代码
        'attachment', // 附件上传：添加附件功能
        'fullscreen', // 全屏模式：编辑器全屏显示
        'code', // 行内代码：插入行内代码
        'subscript', // 下标：添加下标文本
        'superscript', // 上标：添加上标文本
        'font-family', // 字体：更改字体类型
        'font-size', // 字号：调整文字大小
        'line-height', // 行高：调整行间距
        'printer', // 打印：打印文档功能
        'link', // 链接：添加超链接
        'underline', // 下划线：为文字添加下划线
        'font-color', // 字体颜色：更改文字颜色
        'highlight', // 文本高亮：为文字添加背景色
        'align', // 对齐方式：文本左/中/右对齐
        'indent-decrease', // 减少缩进：减少文本缩进
        'indent-increase', // 增加缩进：增加文本缩进
        'hr' // 水平分隔线：插入水平线
      ],
      // 禁用浮动菜单
      textSelectionBubbleMenu: {
        enable: false // 禁用选中文本时弹出的浮动菜单
      },
      // 编辑器创建完成的回调
      onCreated: (editor) => {
        // 编辑器创建完成后，如果有初始内容则处理变量并设置内容
        if (initData.value && initData.value.id) {
          getDetail(initData.value.id)
        }

        // 手动监听编辑器容器的粘贴事件
        if (editorContainerRef.value) {
          editorContainerRef.value.addEventListener('paste', (e) => {
            // 不阻止默认粘贴行为，让编辑器自然处理粘贴
            // 延迟执行，确保默认粘贴行为已完成
            setTimeout(() => {
              if (editorRef.value && editorContainerRef.value) {
                // 保存滚动条位置信息
                const editorElement = editorContainerRef.value.querySelector('.aie-content')
                const scrollTop = editorElement ? editorElement.scrollTop : 0
                const scrollHeight = editorElement ? editorElement.scrollHeight : 0
                // 计算距离底部的距离
                const scrollBottom = scrollHeight - scrollTop
                // 获取当前编辑器的内容
                let currentContent = editorRef.value.getMarkdown()
                // 处理内容中的转义字符，使Markdown格式正确显示
                // 去除多余的转义字符 (\)
                currentContent = currentContent.replace(/\\([\\`*_{}[\]()#+\-.!|])/g, '$1')

                // 使用setMarkdownContent重新设置处理后的内容
                editorRef.value.setMarkdownContent(currentContent)

                // 延迟恢复滚动位置，等待内容渲染完成
                setTimeout(() => {
                  if (editorElement) {
                    // 新的内容可能改变了总高度，所以需要重新计算滚动位置
                    const newScrollHeight = editorElement.scrollHeight
                    // 保持与底部的相对距离
                    editorElement.scrollTop = newScrollHeight - scrollBottom
                  }
                }, 50)
              }
            }, 100) // 100ms延迟，等待默认粘贴完成
          })
        }
      }
    })
  } catch (error) {
    console.error('编辑器初始化失败:', error)
  }
}

function handleTagClick(item: any) {
  // 向编辑器插入变量标签
  if (editorRef.value) {
    // 判断是否存在
    const keyExists = form.value.keyJson.some((key: any) => key.key === item.key)
    if (!keyExists) {
      form.value.keyJson.push(item)
    }
    // 确保编辑器有焦点
    editorRef.value.focus()
    // 插入带特定颜色样式的变量标签，确保颜色与识别逻辑一致
    editorRef.value.insert(`<span> </span><span style="color: rgb(46, 102, 199);">${item.name}</span><span> </span>`)
  }
}

const { form, send, loading, updateForm, onSuccess, reset } = useForm<{
  id?: string
  templateName: string
  typeId: string
  description: string
  isEnable: string
  keyJson: TagType[]
}>(
  (formData) => {
    try {
      // 获取编辑器的HTML内容
      const htmlContent = editorRef.value ? editorRef.value.getHtml() : ''
      // 创建临时DOM元素来处理HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent

      // 查找所有带有特定颜色样式的span元素（根据颜色标识变量）
      // 这里假设变量span都有特定的颜色样式：rgb(46, 102, 199)
      const coloredSpans = tempDiv.querySelectorAll('span[style*="color: rgb(46, 102, 199)"]')

      // 临时备份编辑器当前内容
      const originalContent = htmlContent

      // 将找到的彩色span替换为对应的变量格式
      coloredSpans.forEach((span) => {
        const spanText = span.textContent || ''
        // 在tagList中查找匹配的变量
        const matchedTag = tagList.value.find((tag) => tag.name === spanText.trim())
        if (matchedTag) {
          // 替换为变量格式
          span.outerHTML = `{${matchedTag.key}}`
        }
      })

      // 获取处理后的HTML，其中变量已经是{{key}}格式
      const processedHtml = tempDiv.innerHTML
      // 处理Markdown内容
      let markdownContent = ''

      // 将处理后的HTML临时设置回编辑器
      if (editorRef.value) {
        // 设置处理后的内容到编辑器
        editorRef.value.setContent(processedHtml)

        // 获取Markdown格式，此时变量已经是{{key}}格式
        markdownContent = editorRef.value.getMarkdown()

        // 直接处理所有可能的转义情况
        // 首先提取所有 {xxx} 格式的变量
        const variableMatches = markdownContent.match(/\{([^{}]+)\}/g) || []
        variableMatches.forEach((match) => {
          // 移除花括号，获取可能包含转义字符的变量名
          const escapedKey = match.substring(1, match.length - 1)
          // 移除所有转义字符 (\)
          const unescapedKey = escapedKey.replace(/\\(.)/g, '$1')
          // 如果解转义后的key存在于标签列表中，则替换原始变量
          const keyExists = tagList.value.some((tag) => tag.key === unescapedKey)
          if (keyExists) {
            markdownContent = markdownContent.replace(match, `{${unescapedKey}}`)
          }
        })

        editorRef.value.setContent(originalContent)
      }

      // 提交带有变量的Markdown内容
      const params = { ...formData, content: markdownContent }
      return request.Post('/report/template/createOrUpdate', removeEmptyAttr(params))
    } catch (error) {
      console.error('处理内容时出错:', error)
      // 发生错误时仍然返回原始请求，确保类型正确
      const params = { ...formData, content: '' }
      return request.Post('/report/template/createOrUpdate', removeEmptyAttr(params))
    }
  },
  {
    initialForm: { id: '', templateName: '', typeId: '', description: '', isEnable: '', keyJson: [] }
  }
)
onSuccess(() => {
  emit('upload')
  Message.success('操作成功')
  onClose()
})

const getDetail = (id: string) => {
  editLoading.value = true
  request
    .Get<any>(`/report/template/${id}`)
    .then((res) => {
      if (res?.data) {
        const { templateName, typeId, description, isEnable, keyJson, content } = res.data
        updateForm({ id, templateName, typeId, description, isEnable, keyJson })
        tagList.value = keyJson
        nextTick(() => {
          // 编辑器创建完成后，如果有初始内容则处理变量并设置内容
          if (editorRef.value && content) {
            try {
              let displayContent = content
              // 将变量格式 {value} 转换为带样式的标签
              tagList.value.forEach((tag) => {
                const regex = new RegExp(`\\{${tag.key}\\}`, 'g')
                displayContent = displayContent.replace(regex, `<span> </span><span style="color: rgb(46, 102, 199);">${tag.name}</span><span> </span>`)
              })

              editorRef.value.setMarkdownContent(displayContent)
            } catch (error) {
              console.error('设置内容时出错:', error)
            }
          }
        })
      }
    })
    .finally(() => {
      editLoading.value = false
    })
}

// 当弹窗显示时初始化编辑器
function handleModalOpen() {
  // 确保DOM完全渲染后初始化编辑器
  setTimeout(() => {
    if (!editorRef.value) {
      initEditor()
    }
  }, 100)
}

function onBeforeOpen() {
  if (initData.value) {
    const { id } = initData.value
    nextTick(() => {
      // 编辑器创建完成后，如果有初始内容则处理变量并设置内容
      if (editorRef.value) {
        getDetail(id)
      }
    })
  }
}

function onClose() {
  formRef.value?.resetFields()
  if (editorRef.value) {
    editorRef.value.clear()
  }
  tagList.value = []
  searchValue.value = ''
  reset()
  closeModal()
}

const showTagList = computed(() => {
  if (!searchValue.value) {
    return tagList.value
  }
  return tagList.value.filter((item) => item.name.includes(searchValue.value))
})

async function onSubmit() {
  const result = await formRef.value?.validate()
  !result && send()
}

// 组件销毁时销毁编辑器
onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy()
    editorRef.value = null
  }
})

defineExpose({
  openModal
})
</script>

<template>
  <a-modal
    v-model:visible="visible"
    title="模版编辑"
    title-align="start"
    :width="1000"
    :mask-closable="false"
    @before-open="onBeforeOpen"
    @open="handleModalOpen"
    @cancel="onClose"
  >
    <a-spin :loading="editLoading" dot tip="加载中...">
      <div class="flex gap-20 h-full">
        <a-form ref="formRef" :model="form" auto-label-width class="flex-1 !w-740">
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="模板名称" field="templateName" :rules="[{ required: true, message: '请输入模板名称' }]">
                <a-input v-model="form.templateName" placeholder="请输入" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="模板类型" field="typeId" :rules="[{ required: true, message: '请选择模板类型' }]">
                <a-select v-model="form.typeId" :options="templateType" allow-clear placeholder="请选择" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="状态" field="isEnable" :rules="[{ required: true, message: '请选择状态' }]">
                <a-select v-model="form.isEnable" :options="statusOptions" allow-clear placeholder="请选择" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="模板说明" field="description" :rules="[{ required: true, message: '请输入模板说明' }]">
            <a-textarea v-model="form.description" :auto-size="{ minRows: 4, maxRows: 6 }" placeholder="请输入模板说明" />
          </a-form-item>
          <a-form-item label="模板内容" :rules="[{ required: true, message: '请输入模板内容' }]">
            <div ref="editorContainerRef" class="border border-solid border-[#C9CDD4] rounded w-full editor-container"></div>
          </a-form-item>
        </a-form>
        <div class="tag-box w-184 min-h-200 bg-#f3f6fc rounded-4 p-12 flex flex-col gap-12">
          <div class="text-16 flex justify-between items-center">
            <div>替换标签</div>
            <a-tooltip content="添加标签">
              <icon-plus-circle class="text-20 text-#2e66c7 cursor-pointer" @click="handleAddTag" />
            </a-tooltip>
          </div>
          <a-input v-model="searchValue" placeholder="搜索">
            <template #prefix>
              <icon-search />
            </template>
          </a-input>
          <div class="flex-1 overflow-auto max-h-400 overflow-y-auto">
            <div class="flex flex-wrap gap-14">
              <a-tooltip v-for="(item, index) in showTagList" :key="`${item.name}-${item.key}`" :content="item.description">
                <div class="flex items-center gap-8">
                  <a-tag
                    bordered
                    class="flex items-center cursor-pointer bg-transparent !border-#2e66c7 !text-#2e66c7 !rounded-4 select-none !bg-white pr-1 w-110 justify-center"
                    @click="handleTagClick(item)"
                  >
                    <span class="truncate">{{ item.name }}</span>
                  </a-tag>
                  <div class="flex gap-4">
                    <icon-edit class="text-14 mx-1 text-#2e66c7 hover:text-blue-700 cursor-pointer" @click.stop="(e: MouseEvent) => handleEditTag(item, index, e)" />
                    <a-popconfirm content="确定要删除该标签吗？" @ok="handleDeleteTag(index)">
                      <icon-delete class="text-14 ml-1 text-red-500 hover:text-red-700 cursor-pointer" />
                    </a-popconfirm>
                  </div>
                </div>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
    <template #footer>
      <a-space>
        <a-button @click="onClose()"> 取消 </a-button>
        <a-button type="primary" :loading="loading" @click="onSubmit()"> 确定 </a-button>
      </a-space>
    </template>
  </a-modal>

  <!-- 添加标签弹窗 -->
  <a-modal v-model:visible="tagFormVisible" :title="isEditMode ? '编辑标签' : '添加标签'" title-align="start" :width="500" :mask-closable="false" @cancel="closeTagForm">
    <a-form ref="tagFormRef" :model="tagForm" auto-label-width>
      <a-form-item label="标签名称" field="name" :rules="[{ required: true, message: '请输入标签名称' }]">
        <a-input v-model="tagForm.name" placeholder="请输入标签名称" />
      </a-form-item>
      <a-form-item label="标签Key" field="key" :rules="[{ required: true, message: '请输入标签Key' }]">
        <a-input v-model="tagForm.key" placeholder="请输入标签Key" />
      </a-form-item>
      <a-form-item label="标签类型" field="type" :rules="[{ required: true, message: '请选择标签类型' }]">
        <a-select v-model="tagForm.type" :options="typeOptions" placeholder="请选择标签类型" />
      </a-form-item>
      <a-form-item label="标签描述" field="description" :rules="[{ required: true, message: '请输入标签描述' }]">
        <a-textarea v-model="tagForm.description" :auto-size="{ minRows: 2, maxRows: 4 }" placeholder="请输入标签描述" />
      </a-form-item>
      <a-alert v-if="isEditMode" type="info">
        <div class="text-14 text-#666666 flex flex-col gap-4">
          <div>修改标签不会修改已经填入模版的变量，请谨慎修改</div>
          <div>如需修改，防止变量失效，请在模版中重新填写！</div>
        </div>
      </a-alert>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="closeTagForm"> 取消 </a-button>
        <a-button type="primary" @click="addTag"> 确定 </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style lang="less" scoped>
.editor-container {
  min-height: 400px;
  height: 400px;
}

.tag-box {
  :deep(.arco-input-wrapper) {
    padding-right: 6px;
    padding-left: 6px;
    margin-bottom: 24px;

    .arco-input-prefix {
      padding-right: 4px;
    }
  }
}
</style>
