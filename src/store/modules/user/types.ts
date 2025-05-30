export interface ChatModelType {
  model_name: string
  function_name: string
  max_len_input: number | string
  id?: number
  url?: string
  key?: string
}

export interface UserState {
  isLogin: boolean
  token: string
  userId?: string
  account?: string
  realName?: string
  phone?: string
  avatar?: string
  roleId?: string
  roleName?: string
  companyId?: string
  companyName?: string
  publicKey: string
  permissionList?: any[]
  robotList?: any[]
  show3D?: boolean
  enterpriseInfo?: {
    name: string
    logo: string
    icon: string
  }
  chatModelList: ChatModelType[]
  chatModel: ChatModelType
}
