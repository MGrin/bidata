import * as dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import ConnectionsAPI, { SUPPORTED_DRIVERS } from './api/connections'
import QuestionsAPI from './api/questions'
import ExecutionsAPI from './api/executions'
import ResultsAPI from './api/results'
import DashboardsAPI from './api/dashboards'
import UIAPI from './api/ui'

import ConnectionsFactory from './connections'
import MongoConnection from './connections/mongo'
import { encrypt } from './crypto'
import { ObjectId } from 'mongodb'

dotenv.config()

const API_PORT: number = parseInt(process.env.API_PORT as string, 10)
const MONGO_URL: string = process.env.MONGO_URL as string

const main = async () => {
  const coreConnection = ConnectionsFactory.createConnection({
    _id: new ObjectId(),
    name: 'bidata_core',
    driver: SUPPORTED_DRIVERS.mongodb,
    params: {
      dsn: encrypt(MONGO_URL),
    },
    metadata: {}
  }) as MongoConnection

  await coreConnection.checkConectivity()
  await ConnectionsFactory.loadConnections(coreConnection)
  const app = express()
  app.use(helmet())
  app.use(cors())
  app.use(express.json())

  app.use('/connections', ConnectionsAPI)
  app.use('/questions', QuestionsAPI)
  app.use('/executions', ExecutionsAPI)
  app.use('/results', ResultsAPI)
  app.use('/dashboards', DashboardsAPI)

  app.use('/ui', UIAPI)
  app.listen(API_PORT, () =>
    console.log(`BIData Core service started at port ${API_PORT}`)
  )
}

main().catch(err => {
  console.error(err)
})
