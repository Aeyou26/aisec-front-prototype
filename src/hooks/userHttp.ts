// import router from '@/router'
// import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, RS } from 'axios'
// import fileDownload from 'js-file-download'
// import qs from 'qs'
//
// const CONTENT_TYPE = 'Content-Type'
// const ContentTypeEnum: Record<string, string> = {
//   FORM_URLENCODED: 'application/x-www-form-urlencoded;charset=UTF-8',
//   APPLICATION_JSON: 'application/json;charset=UTF-8',
//   EXT_PLAIN: 'text/plain;charset=UTF-8'
// }
// class AxiosClient {
//   readonly axiosInstance: AxiosInstance
//
//   constructor(baseURL: string, timeout = 10) {
//     this.axiosInstance = axios.create({
//       baseURL,
//       timeout: timeout * 60 * 1000,
//       headers: {
//         'Content-Type': ContentTypeEnum.APPLICATION_JSON
//       }
//     })
//
//     // 请求拦截器配置
//     this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//       if (!config.headers[CONTENT_TYPE]) {
//         config.headers[CONTENT_TYPE] = ContentTypeEnum.APPLICATION_JSON
//       }
//       if (config.headers[CONTENT_TYPE] === ContentTypeEnum.FORM_URLENCODED) {
//         config.params = qs.stringify(config.data)
//       }
//       return config
//     }, this.handleErrorResponse)
//     // 响应拦截器配置
//     this.axiosInstance.interceptors.response.use(this.handleSuccessResponse, this.handleErrorResponse)
//   }
//
//   private handleSuccessResponse(response: AxiosResponse): AxiosResponse {
//     const { status, data, headers } = response
//     const { msg, err_no: code } = data
//     if (status === 200) {
//       if (!ContentTypeEnum.APPLICATION_JSON.includes(headers['content-type'])) {
//         const fileName = decodeURIComponent(headers['content-disposition'].split('filename=')[1])
//         fileDownload(data as unknown as Blob, fileName)
//       }
//       if ([401].includes(code)) {
//         useUserStore().toggleLoginStatus(false)
//         router.push({ name: 'Login' })
//       }
//       return response
//     }
//     throw new Error(msg || '请求异常，请稍后重试！')
//   }
//
//   private handleErrorResponse(error: any): Promise<never> {
//     if (error.response) {
//       const responseData: RS = error.response.data
//       throw new Error(responseData.msg || '请求异常，请稍后重试！')
//     }
//
//     throw new Error('网络异常，请稍后重试！')
//   }
//
//   public can() {
//     this.axiosInstance.abort()
//   }
//
//   public async get<T = any>(url: string, data?: Record<string, string>, config?: AxiosRequestConfig): Promise<RS<T>> {
//     const params = Object.assign(data || {}, {})
//     const response = await this.axiosInstance.get<RS<T>>(url, { ...config, params })
//     if ([0, 418].includes(response.data.err_no)) {
//       return response.data
//     }
//     throw new Error(response.data.msg)
//   }
//
//   public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<RS<T>> {
//     const response = await this.axiosInstance.post<RS<T>>(url, data, config)
//
//     if ([0, 418].includes(response.data.err_no)) {
//       return response.data
//     }
//     throw new Error(response.data.msg)
//   }
//
//   public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<RS<T>> {
//     const response = await this.axiosInstance.put<RS<T>>(url, data, config)
//     if ([0, 418].includes(response.data.err_no)) {
//       return response.data
//     }
//     throw new Error(response.data.msg)
//   }
//
//   public async patch<T>(url: string, data?: Record<string, string>, config?: AxiosRequestConfig): Promise<RS<T>> {
//     const response = await this.axiosInstance.patch<RS<T>>(url, data, config)
//     if ([0, 418].includes(response.data.err_no)) {
//       return response.data
//     }
//     throw new Error(response.data.msg)
//   }
//
//   public async delete<T>(url: string, data?: Record<string, string>, config?: AxiosRequestConfig): Promise<RS<T>> {
//     !config && (config = { data: {} })
//     data && (config.data = data)
//     const response = await this.axiosInstance.delete<RS<T>>(url, config)
//     if ([0, 418].includes(response.data.err_no)) {
//       return response.data
//     }
//     throw new Error(response.data.msg)
//   }
//
//   public async downloadG<T = any>(url: string, data?: Record<string, string>, config?: AxiosRequestConfig): Promise<RS<T>> {
//     const params = Object.assign(data || {}, {})
//     const response = await this.axiosInstance.get<RS<T>>(url, { ...config, params, responseType: 'blob' })
//     return response.data
//   }
//
//   public async downloadP<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<RS<T>> {
//     const response = await this.axiosInstance.post<RS<T>>(url, data, { ...config, responseType: 'blob' })
//     return response.data
//   }
// }
//
// export const useHttpClient = (baseURL: string) => {
//   const client = new AxiosClient(baseURL)
//   const data = ref()
//   const loading = ref(false)
//   const isMounted = ref(true)
//
//   onUnmounted(() => {
//     isMounted.value = false
//     // 取消所有未完成的请求
//   })
//   return { data, loading }
// }
export default {}
