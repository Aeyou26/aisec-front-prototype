import type { App } from 'vue'
import { safeHtml } from './safeHtml'

export default {
  install(app: App) {
    app.directive('safe-html', safeHtml)
  }
}
