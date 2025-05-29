import { resolve } from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'

export default function autoImport() {
  return AutoImport({
    dts: 'src/types/auto-imports.d.ts',
    include: [
      /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      /\.vue$/,
      /\.vue\?vue/, // .vue
      /\.md$/ // .md
    ],
    dirs: [resolve(process.cwd(), './src/store'), resolve(process.cwd(), './src/api'), resolve(process.cwd(), './src/hooks'), resolve(process.cwd())],
    imports: ['vue', 'vue-router', 'pinia', { '@vueuse/core': ['useDark', 'useToggle', 'useIntervalFn', 'set'] }],
    resolvers: [ArcoResolver()]
  })
}
