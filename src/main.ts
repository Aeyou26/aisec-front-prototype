import pinia from '@/store'
import '@/assets/style/global.less'
import 'virtual:svg-icons-register'
import 'virtual:uno.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import directives from './directives'
import { overrideMessage } from '@/utils/message'

// 覆盖全局Message对象，实现在显示消息前先清除之前的消息
overrideMessage()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(directives)

app.mount('#app')
