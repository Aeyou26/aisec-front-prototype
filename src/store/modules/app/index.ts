import { MenuProps } from 'menus'
import { defineStore } from 'pinia'
import { AppState } from './types'

const useAppStore = defineStore('app', {
  state: (): AppState => ({
    applicationName: '网络安全智能体',
    theme: 'light',
    colorWeek: false,
    navbar: true,
    hideMenu: false,
    menuCollapse: false,
    footer: false,
    footerContent: '',
    themeColor: '#165DFF',
    menuWidth: 200,
    globalSettings: false,
    device: 'desktop',
    tabBar: true,
    showNotice: false,
    showTheme: false,
    showSearch: false,
    showSetting: false,
    isLogin: false,
    menuList: []
  }),
  persist: true,
  getters: {
    appCurrentSetting(state: AppState): AppState {
      return { ...state }
    },
    appDevice(state: AppState) {
      return state.device
    },
    getMenuWidth(state: AppState) {
      return state.menuCollapse ? 48 : state.menuWidth
    }
  },

  actions: {
    // Update app settings
    updateSettings(partial: Partial<AppState>) {
      // @ts-ignore-next-line
      this.$patch(partial)
    },

    // Change theme color
    toggleTheme(dark: boolean) {
      if (dark) {
        this.theme = 'dark'
        document.body.setAttribute('arco-theme', 'dark')
      } else {
        this.theme = 'light'
        document.body.removeAttribute('arco-theme')
      }
    },
    toggleDevice(device: string) {
      this.device = device
    },
    toggleMenu(value: boolean) {
      this.hideMenu = value
    },
    toggleLoginStatus(status: boolean) {
      this.isLogin = status
    },
    updateMenus(menus: MenuProps[]) {
      this.menuList = menus
    }
  }
})

export default useAppStore
