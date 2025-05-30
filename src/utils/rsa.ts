import JSEncrypt from 'jsencrypt'

export function encryptPassword(password: string, publicKey: string): string {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey)
  return encrypt.encrypt(password) || ''
}
