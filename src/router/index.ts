import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:meta-layouts'
import { convertToTree } from '@/utils/route-util'
import createRouteGuard from './guard'

const modules = import.meta.glob<string>('../views/**/index.ts', { eager: true, import: 'default' })
const componentModules = import.meta.glob('../views/**/index.vue')
const components = Object.keys(componentModules).reduce((component: any, key: string) => {
  const path = key.match(/\/views(.*?)\/index\.vue/)![1] || '/'
  component[path] = componentModules[key]
  return component
}, {})
const routes: RouteRecordRaw[] = Object.entries(modules).map(([key, value]) => {
  const path = key.match(/\/views(.*?)\/index\.ts/)![1] || '/'
  const namePattern = key.match(/\/views\/(.*?)\/index\.ts/)
  const name = ((namePattern && namePattern[1]) || 'index').replace(/\//g, '-')
  return {
    path,
    name,
    meta: value,
    component: components[path] as any
  } as any
})
export const _routes = convertToTree(routes)

const rootRoutes = [
  {
    path: '/',
    name: 'index',
    redirect: '/dashboard'
  }
]

const notFoundRoute: RouteRecordRaw[] = [
  {
    path: '/:path(.*)*',
    name: 'notFountSon',
    component: () => import('@/views/exception/404.vue'),
    meta: {
      title: '404',
      hideInMenu: true,
      requiresAuth: false
    }
  },
  {
    path: '/403',
    name: 'noPower',
    component: () => import('@/views/exception/403.vue'),
    meta: {
      title: '403',
      hideInMenu: true,
      requiresAuth: false
    }
  }
]

const noMenuRoutes = [
  {
    path: '/universalChat',
    name: 'UniversalChat',
    component: () => import('@/views/universalChat/index.vue')
  },
  {
    path: '/largescreen',
    name: 'Largescreen',
    component: () => import('@/views/largescreen/index.vue')
  },
  {
    path: '/robot',
    name: 'Robot',
    component: () => import('@/views/3dShow/index.vue'),
    meta: {
      permissions: ['5'],
      requiresAuth: true
    }
  },
  {
    path: '/supplierFeedback',
    name: 'SupplierFeedback',
    component: () => import('@/views/supplierFeedback/index.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue')
  }
]

const staticRoute = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/login2',
    name: 'Login2',
    component: () => import('@/views/login2/index.vue')
  },
  ...setupLayouts(_routes)
]

// 排序并生成菜单存储
const router = createRouter({
  history: createWebHistory(),
  routes: [...staticRoute, ...noMenuRoutes, ...notFoundRoute, ...rootRoutes]
})

createRouteGuard(router)

export default router
