import CryptoJS from 'crypto-js'

/**
 * 结合时间戳和随机数
 * 原理：将当前时间戳与一个随机数相结合，再使用哈希算法生成唯一 ID。时间戳可以确保不同时间生成的 ID 具有差异，随机数可以增加 ID 的唯一性，即使在同一时间生成，也能通过随机数来区分。
 * @param position 返回id的长度 默认16位
 * @returns
 */
export function generateUniqueId(position = 16) {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const combinedString = `${timestamp}-${randomNumber}`
  const uniqueId = CryptoJS.SHA256(combinedString).toString(CryptoJS.enc.Hex).substring(0, position)
  return uniqueId
}
