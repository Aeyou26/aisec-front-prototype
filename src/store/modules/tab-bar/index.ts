import { TabBarState, TagProps, filterRoute, formatTag, DirectionType, ActionType } from './types'
import type { RouteLocationNormalized } from 'vue-router'
import { defineStore } from 'pinia'

const useAppStore = defineStore('tabBar', {
  state: (): TabBarState => ({
    tagList: [
      {
        title: '首页',
        name: 'home',
        fullPath: '/home'
      }
    ]
  }),
  persist: true,
  getters: {
    getTabList(): TagProps[] {
      return this.tagList
    }
  },
  actions: {
    updateTabList(route: RouteLocationNormalized) {
      const ignore = ['notFound', 'root', 'login', '403', '404', '500']
      const whiteRoute = filterRoute(route, ignore, 'name')
      if (whiteRoute.length !== 0) {
        this.tagList.push(formatTag(route))
      }
    },
    deleteIgnore(fullPath: string, ignore: number[] = []) {
      const index = this.tagList.findIndex((item) => item.fullPath === fullPath)
      if (index !== -1) {
        ignore.push(index)
      }
      this.tagList = ignore.map((x) => this.tagList[x])
    },

    deleteTag(fullPath: string, direction?: DirectionType) {
      const index = this.tagList.findIndex((item) => item.fullPath === fullPath)
      if (index !== -1) {
        if (direction === ActionType.current) {
          this.tagList.splice(index, 1)
        } else if (direction === ActionType.left) {
          this.tagList.splice(0, index)
        } else if (direction === ActionType.right) {
          this.tagList.splice(index + 1, this.tagList.length - 1)
        } else if (direction === ActionType.others) {
          const current = this.tagList[index]
          this.tagList = [current]
        } else if (direction === ActionType.all) {
          this.$reset()
        } else {
          this.tagList.splice(index, 1)
        }
      }
    }
  }
})

export default useAppStore
