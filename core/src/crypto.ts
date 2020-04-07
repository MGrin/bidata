import NodeRSA from 'node-rsa'
import * as dotenv from 'dotenv'
dotenv.config()
const PRIVATE_RSA_KEY_BASE64: string = process.env.PRIVATE_RSA_KEY as string
const PUBLIC_RSA_KEY_BASE64: string = process.env.PUBLIC_RSA_KEY as string

const key = new NodeRSA()

key.importKey(
  Buffer.from(PUBLIC_RSA_KEY_BASE64, 'base64').toString('utf-8'),
  'public'
)
key.importKey(
  Buffer.from(PRIVATE_RSA_KEY_BASE64, 'base64').toString('utf-8'),
  'private'
)

export const encrypt = (data: string) => key.encrypt(data, 'base64')
export const decrypt = (data: string) => key.decrypt(data).toString('utf-8')
