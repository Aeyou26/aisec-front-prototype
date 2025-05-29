import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { resolve } from 'path'
import type { PluginOption } from 'vite'

export default function SvgIcon(): PluginOption {
  return createSvgIconsPlugin({
    // 指定需要缓存的图标文件夹
    iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
    // 指定symbolId格式
    symbolId: 'arco-icon-[dir]-[name]'
  })
}
