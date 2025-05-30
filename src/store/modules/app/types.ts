import { MenuProps } from 'menus'

export interface AppState {
  theme: string
  colorWeek: boolean
  navbar: boolean
  hideMenu: boolean
  menuCollapse: boolean
  footer: boolean
  themeColor: string
  menuWidth: number
  globalSettings: boolean
  device: string
  tabBar: boolean
  isLogin: boolean
  menuList: MenuProps[]
  [key: string]: unknown
}
