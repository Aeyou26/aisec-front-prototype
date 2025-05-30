declare module 'menus' {
  interface MenuProps {
    key: string
    name: RouteRecordName
    label: string
    icon: string
    children?: MenuProps[]
    permission?: string
  }
}
