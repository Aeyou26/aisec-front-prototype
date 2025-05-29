import Components from 'unplugin-vue-components/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import IconResolver from 'unplugin-icons/resolver'

export default function treeShake() {
  return Components({
    dts: 'src/types/components.d.ts',
    extensions: ['vue', 'md'],
    include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    deep: false,
    resolvers: [
      ArcoResolver({
        sideEffect: true
      }),
      IconResolver({ componentPrefix: 'icon' })
    ]
  })
}
