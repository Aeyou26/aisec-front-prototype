import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import svgLoader from 'vite-svg-loader'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import MetaLayouts from 'vite-plugin-vue-meta-layouts'
import Icons from 'unplugin-icons/vite'
import { vitePluginForArco } from '@arco-plugins/vite-vue'
import { AutoImport, SvgIcon, TreeShake, ArcoStyleImportPlugin } from './plugins'
import Layouts from 'vite-plugin-vue-layouts'
import removeConsole from 'vite-plugin-remove-console'

export default defineConfig(({ mode }) => {
  // 加载 envDir 中的 .env 文件。默认情况下只有前缀为 VITE_ 会被加载，除非更改了 prefixes 配置。
  const env = loadEnv(mode, process.cwd())
  return {
    base: env.VITE_BASE_PATH,
    server: {
      port: 4011,
      proxy: {
        '/api': {
          // target: 'http://10.11.40.123:7999', // 欧桂成
          target: 'https://10.11.17.156:1443', // 测试环境
          // target: 'https://10.11.43.126', // 测试环境
          // target: 'http://10.11.40.244:7999', //唐得洪
          changeOrigin: true,
          secure: false,
          ws: true
          // rewrite: (path) => path.replace(/^\/api/, '') // 去掉请求路径前缀 /api
        }
      }
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, 'src')
        }
      ],
      extensions: ['.ts', '.js']
    },
    plugins: [
      vue({
        script: {}
      }),
      Icons({
        compiler: 'vue3',
        autoInstall: true,
        customCollections: {
          custom: FileSystemIconLoader('./src/assets/icons', (svg) => svg.replace(/fill="[^"]*"/g, 'fill="currentColor"'))
        }
      }),
      UnoCSS(),
      vueSetupExtend(),
      svgLoader({
        defaultImport: 'url',
        svgoConfig: {
          multipass: true
        }
      }),
      Layouts(),
      SvgIcon(),
      ArcoStyleImportPlugin(),
      AutoImport(),
      TreeShake(),
      MetaLayouts({
        importMode: 'async'
      }),
      vitePluginForArco(),
      removeConsole()
    ]
  }
})
