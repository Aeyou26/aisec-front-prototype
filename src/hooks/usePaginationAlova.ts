import type { PaginationProps } from '@arco-design/web-vue'
import { useRequest } from 'alova'
import { usePagination } from '@alova/scene-vue'
import { removeEmptyAttr } from '@/utils/tools'

// 分页查询数据
export default function usePaginationAlova(api: any, params: any, dataName = (data: any) => data.data, totalName = (data: any) => data.total) {
  const p = ref(removeEmptyAttr(params))
  const {
    send,
    // 加载状态
    loading,
    // 列表数据
    data: taleData,
    // 是否为最后一页
    // 下拉加载时可通过此参数判断是否还需要加载
    isLastPage,
    // 当前页码，改变此页码将自动触发请求
    page,
    // 每页数据条数
    pageSize,
    // 分页页数
    pageCount,
    // 总数据量
    total,
    // 预加载状态
    fetching,
    onSuccess,
    onError,
    // 预加载成功事件绑定函数
    onFetchSuccess,
    // 预加载错误事件绑定函数
    onFetchError,
    // 预加载完成事件绑定函数
    onFetchComplete,
    // 插入列表项
    insert,
    // 移除列表项
    remove,
    // 更新数据项
    replace,
    // 刷新指定页的数据 如果未传入页码则会刷新当前页 refresh(pageOrItemPage?: number | LD[number]): void;
    refresh,
    // 手动更新列表数据
    update,
    // 重置列表 它将清空全部缓存，并重新加载第一页。
    reload
  } = usePagination((page, pageSize) => api({ ...Object.assign(p.value || {}, { current: page, pageSize }) }), {
    immediate: false,
    // 请求前的初始数据（接口返回的数据格式）
    initialData: {
      total: 0,
      data: []
    },
    total: (response: any) => (response ? totalName(response) : 0),
    data: (response: any) => (response ? dataName(response) || [] : []),
    initialPage: 1, // 初始页码，默认为1
    initialPageSize: 20 // 初始每页数据条数，默认为20
  })
  const pagination = computed<PaginationProps>(() => ({
    size: 'mini',
    current: page.value,
    pageSize: pageSize.value,
    total: total.value,
    showPageSize: true,
    showTotal: true,
    showJumper: true
  }))

  const onPageChange = (v: number) => {
    page.value = v
  }

  const onPageSizeChange = (v: number) => {
    pageSize.value = v
  }
  const loadData = (v = false) => {
    const par = JSON.parse(JSON.stringify(params))
    delete par.date
    p.value = removeEmptyAttr(par)
    if (v && page.value !== 1) {
      page.value = 1
    }
    return send()
  }
  return {
    taleData,
    loading,
    pagination,
    isLastPage,
    pageCount,
    onPageChange,
    onPageSizeChange,
    loadData,
    fetching,
    // 预加载成功事件绑定函数
    onFetchSuccess,
    // 预加载错误事件绑定函数
    onFetchError,
    // 预加载完成事件绑定函数
    onFetchComplete,
    // 插入列表项
    insert,
    // 移除列表项
    remove,
    // 更新数据项
    replace,
    // 刷新指定页的数据
    refresh,
    // 手动更新列表数据
    update,
    // 重置列表 它将清空全部缓存，并重新加载第一页。
    reload,
    onSuccess,
    onError
  }
}

// 返回全量数据 arco组件自带处理分页
export function usePaginationFront(api: any, params: any, dataName = (data: any) => data.data, totalName = (data: any) => data?.total) {
  const p = ref(removeEmptyAttr(params))
  const {
    send,
    // 加载状态
    loading,
    // 列表数据
    data,
    onSuccess,
    onError
  }: { send: any; loading: boolean; data: any; onSuccess: any; onError: any } = useRequest(() => api({ ...Object.assign(p.value || {}, {}) }), {
    immediate: false,
    initialData: {
      total: 0,
      data: []
    },
    force: true
  })
  const taleData = computed(() => {
    if (!(data as any).value) {
      return []
    }
    return dataName(data.value)
  })
  const page = ref(1)
  const pageSize = ref(20)
  const pagination = computed<PaginationProps>(() => ({
    size: 'mini',
    current: page.value,
    pageSize: pageSize.value,
    total: taleData.value?.length,
    // total: totalName(data.value) ?? taleData.value?.length,
    showPageSize: true,
    showTotal: true,
    hideOnSinglePage: true,
    showJumper: true
  }))

  const onPageChange = (v: number) => {
    page.value = v
  }

  const onPageSizeChange = (v: number) => {
    pageSize.value = v
  }
  const loadData = (v = false) => {
    p.value = removeEmptyAttr(params)
    if (v && page.value !== 1) {
      page.value = 1
    }
    return send()
  }
  return { taleData, data, loading, pagination, onPageChange, onPageSizeChange, loadData, onSuccess, onError }
}
