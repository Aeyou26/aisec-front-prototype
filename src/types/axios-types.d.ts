import 'axios'

declare module 'axios' {
  interface RS<T = any> {
    err_no: number
    msg: string
    data: T
    total?: number
  }
}
