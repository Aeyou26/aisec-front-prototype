import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    icon?: string | VNode // The icon show in the side menu
    title?: string // The locale name show in side menu and breadcrumb
    order?: number // Sort routing menu items. If set key, the higher the value, the more forward it is
    href?: string // if menuType is 'iframe', the href will be used as the iframe src
    permissions?: string[] // 权限信息
  }
}
