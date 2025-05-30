import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import useAppStore from './modules/app'
import useTabBarStore from './modules/tab-bar'
import useUserStore from './modules/user'
import useChatStore from './modules/chat'
import useUniversalChatStore from './modules/universal-chat'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export { useAppStore, useUserStore, useTabBarStore, useChatStore, useUniversalChatStore }
export default pinia
