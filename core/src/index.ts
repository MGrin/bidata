import * as dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { ObjectId } from 'mongodb'

import ConnectionsAPI, { SUPPORTED_DRIVERS } from './api/connections'
import QuestionsAPI from './api/questions'
import ExecutionsAPI from './api/executions'
import ResultsAPI from './api/results'
import DashboardsAPI from './api/dashboards'
import ConnectionsFactory from './connections'
import MongoConnection from './connections/mongo'
import { encrypt } from './crypto'
import { auth, analytics } from './middlewares'
dotenv.config()

const PORT: number = parseInt(process.env.PORT as string, 10)
const MONGO_URL: string = process.env.MONGO_URL as string
const ANALYTICS_MONGO_URL: string = process.env.ANALYTICS_MONGO_URL as string
const AUTH_HOST: string = process.env.AUTH_HOST as string

const main = async () => {
  const coreConnection = ConnectionsFactory.createConnection({
    _id: new ObjectId(),
    name: 'bidata_core',
    driver: SUPPORTED_DRIVERS.mongodb,
    params: {
      dsn: encrypt(MONGO_URL),
    },
    metadata: {},
    owner_id: new ObjectId(),
    creator_id: new ObjectId(),
    private: true
  }) as MongoConnection
  const analyticsConnection = new MongoConnection({
    dsn: encrypt(ANALYTICS_MONGO_URL),
  })

  await coreConnection.checkConectivity()
  await ConnectionsFactory.loadConnections(coreConnection)

  const app = express()
  app.use(helmet())
  app.use(cors())
  app.use(express.json())
  app.use(auth(AUTH_HOST))
  app.use(analytics(analyticsConnection))

  app.use('/connections', ConnectionsAPI)
  app.use('/questions', QuestionsAPI)
  app.use('/executions', ExecutionsAPI)
  app.use('/results', ResultsAPI)
  app.use('/dashboards', DashboardsAPI)

  app.listen(PORT, () =>
    console.warn(`BIData Core service started at port ${PORT}`)
  )
}

main().catch(err => {
  console.error(err)
})
