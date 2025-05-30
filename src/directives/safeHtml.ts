import type { Directive } from 'vue'
import DOMPurify from 'dompurify'

export const safeHtml: Directive = {
  beforeMount(el, binding) {
    el.innerHTML = DOMPurify.sanitize(binding.value)
  },
  updated(el, binding) {
    el.innerHTML = DOMPurify.sanitize(binding.value)
  }
}
