import { PropType } from 'vue'
import { RouteLocation, RouteLocationNormalized } from 'vue-router'

export interface TagProps {
  title: string
  name: string
  fullPath: string
  query?: any
  icon?: any
}

export interface TabBarState {
  tagList: TagProps[]
}

export const BaseTabItemProps = {
  id: {
    type: Number,
    require: true,
    default: 0
  },
  data: {
    type: Object as PropType<TagProps>,
    require: true,
    default: {}
  }
}
// Ans
export declare type Simplify<T> = {
  [P in keyof T]: T[P]
}
/**
 * 摘取 T中某个属性变为可选
 * 例： interface User{
 * name: string
 * age: number
 * }
 * type UserOpt = Simplify<User,'age'>
 * 结果UserOpt = {name: string, age?: number}
 */
export declare type SetOptional<T, K extends keyof T> = Simplify<
  // Partial in 可有可⽆键值的那部分
  // Pick 必须有的键值的那部分
  Partial<Pick<T, K>> & Pick<T, Exclude<keyof T, K>>
>

export type MatcherRoute = SetOptional<Pick<RouteLocation, 'name' | 'path' | 'fullPath' | 'meta'>, 'fullPath'>

export function filterRoute<T extends MatcherRoute, K extends keyof T>(routerList: T | T[], ignore: string[], matchMode?: K): T[] {
  // 校验是否是Array类型，不是转换成Array类型
  const routes: T[] = Object.prototype.toString.call(routerList) === '[object Array]' ? (routerList as T[]) : [routerList as T]
  if (ignore.length === 0) {
    return routes
  }
  if (routes.length === 0) {
    return []
  }
  return routes.filter(({ [matchMode ?? 'fullPath']: matchValue, meta: { hideInMenu } }) => {
    return !ignore.includes(matchValue as string) && !hideInMenu
  })
}

export function formatTag(route: RouteLocationNormalized): TagProps {
  const { name, meta, fullPath, query } = route
  return {
    title: meta.title || '',
    name: String(name),
    fullPath,
    query
  }
}

// eslint-disable-next-line no-shadow
export enum ActionType {
  current = 'current',
  left = 'left',
  right = 'right',
  others = 'others',
  all = 'all'
}

export type DirectionType = keyof typeof ActionType

export default {}
