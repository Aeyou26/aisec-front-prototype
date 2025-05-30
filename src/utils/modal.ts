import { Modal } from '@arco-design/web-vue'

export const confirmModal = (title: string, content: string, width = 400) => {
  return new Promise<boolean>((resolve) => {
    Modal.warning({
      title: title || '提示',
      content: content || '确认删除？',
      simple: false,
      width: `${width}px`,
      bodyStyle: { minHeight: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
      hideCancel: false,
      titleAlign: 'start',
      okButtonProps: { type: 'primary', size: 'small' },
      cancelButtonProps: { type: 'outline', size: 'small' },
      onOk: () => {
        resolve(true)
      }
    })
  })
}
export default {}
