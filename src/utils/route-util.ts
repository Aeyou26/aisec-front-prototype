import { MenuProps } from 'menus'
import { RouteRecordRaw } from 'vue-router'

export function convertToTree(data: RouteRecordRaw[]) {
  const map: { [key: string]: RouteRecordRaw } = data.reduce((acc: { [key: string]: RouteRecordRaw }, item) => {
    const key: string = item.path
    acc[key] = item
    return acc
  }, {})
  return data.reduce((result: RouteRecordRaw[], item) => {
    const match = item.path.match(/(.+)\/[^\\/]+$/)
    if (match) {
      const parentPath = match[1]
      const parent = map[parentPath]

      if (parent) {
        parent.children = parent.children || []
        parent.children.push(item)
      }
    } else {
      result.push(item)
    }
    // 对路由进行排序
    sortRoutes(result)
    result.forEach((module: RouteRecordRaw) => {
      // 二级路由排序
      if (module?.children && module.children.length > 1) {
        sortRoutes(module.children)
        // 三级路由排序
        module?.children?.forEach((child: RouteRecordRaw) => {
          if (child.children && child.children.length > 1) {
            sortRoutes(child.children)
          }
        })
      }
    })
    return result
  }, [])
}

export function sortRoutes(children: RouteRecordRaw[]) {
  children.sort((a, b) => {
    if (a.meta && b.meta) {
      return (a.meta.order ?? 0) - (b.meta.order ?? 0)
    }
    return 0
  })
}

/**
 * 检查才路由的权限
 * @param permissionList 用户权限列表
 * @param requirePermissions 当前需要检查的权限列表
 * @returns
 */
export function checkPermissions(permissionList: string[], requirePermissions: string[]) {
  return (
    permissionList.includes('*') ||
    !requirePermissions.length ||
    requirePermissions.some((permission) => {
      return permissionList.includes(permission)
    })
  )
}
export function generatorMenu(routerMap: RouteRecordRaw[], permissionList: string[]): MenuProps[] {
  const permissionRoutes: MenuProps[] = recursion(routerMap)
  function recursion(routes: RouteRecordRaw[]): MenuProps[] {
    const menus: MenuProps[] = []
    routes.forEach((x) => {
      const _permissions: string[] = (x.meta?.permissions as string[]) || []
      const menu = {
        label: x.meta?.title,
        name: x.name,
        key: x.path,
        icon: x.meta?.icon
      } as MenuProps
      if (x.children) {
        menu.children = recursion(x.children)
      }
      if (checkPermissions(permissionList, _permissions) && !x.meta?.hiddenMenu) {
        menus.push(menu)
      }
    })
    return menus
  }

  return permissionRoutes.filter((x) => x !== null)
}

export function findFirstPermissionRoute(_routers: any, permission: any) {
  const cloneRouters = [..._routers]
  while (cloneRouters.length) {
    const firstElement = cloneRouters.shift()
    if (firstElement?.children) {
      cloneRouters.push(...firstElement.children)
    }
    if (firstElement?.meta?.permissions && permission.includes(firstElement?.meta?.permissions[0])) {
      if (!firstElement?.children) {
        return { name: firstElement.name }
      }
    }
  }
  return null
}
