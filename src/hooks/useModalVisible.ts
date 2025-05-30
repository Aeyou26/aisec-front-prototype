export default function useModalVisible<T>() {
  const visible = ref(false)
  const initData = ref<T>()

  const openModal = (data?: T) => {
    visible.value = true
    initData.value = data
  }

  const closeModal = (callback?: () => void) => {
    visible.value = false
    callback && callback()
  }
  return {
    visible,
    initData,
    openModal,
    closeModal
  }
}
