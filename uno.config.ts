import { defineConfig, presetUno, presetAttributify } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'

export default defineConfig({
  presets: [
    presetRemToPx({
      baseFontSize: 4
    }),
    presetUno(),
    presetAttributify()
  ],
  shortcuts: [
    { 'wh-full': 'w-full h-full' },
    { 'flex-center': 'flex justify-center items-center' },
    { 'flex-bc': 'flex justify-between items-center' },
    { 'cool-green': 'bg-green-500 text-black' }
  ],
  rules: [['login-bg', { 'background-image': `url('@/assets/images/login-bg.png')`, 'background-size': 'cover', 'background-position': 'center', 'background-repeat': 'no-repeat' }]]
})
