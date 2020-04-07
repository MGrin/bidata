import { Router } from 'express'
import { SUPPORTED_DRIVERS } from './connections'
import { ObjectId } from 'mongodb'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { APIError, withCatch } from './utils'

const UIAPI = Router()

UIAPI.get('/connections/drivers', (req, res) => {
  res.send(Object.keys(SUPPORTED_DRIVERS))
})

UIAPI.get('/connections/:id/connectivity', withCatch(async (req, res) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection
  const connectionDesction = await core.client.collection('Connections').findOne({ _id: id })
  if (!connectionDesction) {
    throw new APIError('No connection found', 404)
  }

  const connection = ConnectionsFactory.get(connectionDesction.name)
  await connection.checkConectivity()
  return res.send()
}))

export default UIAPI