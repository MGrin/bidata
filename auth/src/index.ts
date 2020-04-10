import * as dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { ObjectId } from 'mongodb'
import ConnectionsFactory from './connections'
import MongoConnection from './connections/mongo'
import { encrypt } from './crypto'

dotenv.config()

const PORT: number = parseInt(process.env.PORT as string, 10)
const MONGO_URL: string = process.env.MONGO_URL as string

const main = async () => {
  const coreConnection = ConnectionsFactory.createConnection({
    _id: new ObjectId(),
    name: 'bidata_core',
    driver: 'mongodb',
    params: {
      dsn: encrypt(MONGO_URL),
    },
    metadata: {},
  }) as MongoConnection

  await coreConnection.checkConectivity()
  await ConnectionsFactory.loadConnections(coreConnection)

  const app = express()
  app.use(helmet())
  app.use(cors())
  app.use(express.json())

  app.listen(PORT, () =>
    console.warn(`BIData Auth service started at port ${PORT}`)
  )
}

main().catch(err => {
  console.error(err)
})
