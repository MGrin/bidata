import NodeRSA from 'node-rsa'
import crypto from 'crypto'
import * as dotenv from 'dotenv'

dotenv.config()

let ENCRYPT = true
const key = new NodeRSA()

try {
  const PRIVATE_RSA_KEY_BASE64: string = process.env.PRIVATE_RSA_KEY as string
  const PUBLIC_RSA_KEY_BASE64: string = process.env.PUBLIC_RSA_KEY as string
  
  key.importKey(
    Buffer.from(PUBLIC_RSA_KEY_BASE64, 'base64').toString('utf-8'),
    'public'
  )
  key.importKey(
    Buffer.from(PRIVATE_RSA_KEY_BASE64, 'base64').toString('utf-8'),
    'private'
  ) 
} catch(e) {
  console.error('RUNNING IN AN UNECRYPTED MODE!!!')
  ENCRYPT = false
}

export const encrypt = (data: string) => ENCRYPT ? key.encrypt(data, 'base64') : data
export const decrypt = (data: string) => ENCRYPT ? key.decrypt(data).toString('utf-8') : data

export const generateSalt = () =>
  crypto
    .randomBytes(128)
    .toString('hex')
    .slice(0, 64)
export const hash = (str: string, salt: string) => {
  const hash = crypto.createHmac('sha512', salt)
  hash.update(str)
  return hash.digest('hex')
}
