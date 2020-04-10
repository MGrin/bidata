import { Router, Response, request } from 'express'
import { ObjectId } from 'mongodb'
import { ConnectionStringParser } from 'connection-string-parser'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { APIError, withCatch } from './utils'
import { encrypt } from '../crypto'
import { AuthRequest, requiresAuth } from '../middlewares'

export enum SUPPORTED_DRIVERS {
  'mongodb' = 'mongodb',
  'postgresql' = 'postgresql',
}
export type BIDataMongoConnectionParams = {
  dsn: string
}
export type BIDataPostgresConnectionParams = {
  dsn: string
}

export type BIDataConnectionParams =
  | BIDataMongoConnectionParams
  | BIDataPostgresConnectionParams
export type BIDataConnection = {
  _id: ObjectId
  owner_id: ObjectId,
  creator_id: ObjectId,
  private: boolean,
  name: string
  driver: SUPPORTED_DRIVERS
  params: BIDataConnectionParams
  metadata: any
}

const ConnectionsAPI = Router()

const validateConnectionData = (connection: BIDataConnection) => {
  if (!connection.name) {
    throw new APIError('No connection name provided', 400)
  }
  if (Object.keys(SUPPORTED_DRIVERS).indexOf(connection.driver) === -1) {
    throw new APIError(`Driver ${connection.driver} is not supported`, 400)
  }

  switch (connection.driver) {
    case SUPPORTED_DRIVERS.mongodb: {
      const params: BIDataMongoConnectionParams = connection.params as BIDataMongoConnectionParams
      if (!params.dsn) {
        throw new APIError(`No mongo DSN provided`, 400)
      }
      return
    }
    case SUPPORTED_DRIVERS.postgresql: {
      const params: BIDataPostgresConnectionParams = connection.params as BIDataPostgresConnectionParams

      if (!params.dsn) {
        throw new APIError(`No postgres DSN provided`, 400)
      }

      return
    }
  }
}

const handleListConnections = async (req: AuthRequest, res: Response) => {
  const core = (await ConnectionsFactory.get()) as MongoConnection
  const connections = await core.client.collection('Connections').find({
    $or: [{
      creator_id: req.user._id,
    }, {
      private: false,
    }]
  })
  const connectionsAsArr = await connections.toArray()
  return res.send(connectionsAsArr)
}

const handleGetConnection = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = (await ConnectionsFactory.get()) as MongoConnection
  const connection = await core.client
    .collection('Connections')
    .findOne({ _id: id })

  if (!connection) {
    throw new APIError('Connection not found', 404)
  }
  if (connection.private && !connection.owner_id.equals(req.user._id)) {
    throw new APIError('You do not have permissions to see this connection', 401)
  }
  return res.send(connection)
}

const handleCreateConnection = async (req: AuthRequest, res: Response) => {
  const body = {
    ...req.body,
  } as BIDataConnection

  const clearDSN = body.params.dsn
  const parser = new ConnectionStringParser({
    scheme: body.driver,
    hosts: [],
  })

  body.params.dsn = encrypt(clearDSN)
  try {
    body.metadata = parser.parse(clearDSN)
  } catch (e) {
    const apiError = new APIError(e.message, 400)
    return res.status(apiError.status).send(apiError)
  }
  if (body.metadata.password) {
    body.metadata.password = body.metadata.password
      .split()
      .map(() => '*')
      .join()
  }

  validateConnectionData(body)

  try {
    const connection = ConnectionsFactory.createConnection(body)
    await connection.checkConectivity()
  } catch (e) {
    const apiError = new APIError(e.message, 500)
    return res.status(apiError.status).send(apiError)
  }

  const core = ConnectionsFactory.get() as MongoConnection
  const existingConfig = await core.client
    .collection('Connections')
    .findOne({ name: body.name })
  if (existingConfig) {
    const apiError = new APIError(
      `Connection called "${body.name}" already exists`,
      400
    )
    return res.status(apiError.status).send(apiError)
  }

  const connectionDocument = await core.client
    .collection('Connections')
    .insertOne({
      ...body,
      creator_id: req.user._id,
      owner_id: req.user._id,
      created: new Date(),
      private: true,
    })
  return res.send({
    _id: connectionDocument.insertedId,
    ...body,
  })
}

const handleUpdateConnection = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const body = req.body as BIDataConnection & { _id?: string }
  delete body._id
  body.params.dsn = encrypt(body.params.dsn)

  try {
    validateConnectionData(body)
  } catch (e) {
    return res.status(e.status).send(e)
  }

  const connection = ConnectionsFactory.createConnection(body)
  await connection.checkConectivity()

  const core = ConnectionsFactory.get() as MongoConnection

  const existingConnection = await core.client
    .collection('Connections')
    .findOne({ _id: id })

  if (!existingConnection) {
    throw new APIError('Connection does not exists', 404)
  }

  if (!existingConnection.owner_id.equals(req.user._id)) {
    throw new APIError('Do not have rights to edit the connection', 401)
  }

  const updatedConnection = await core.client
    .collection('Connections')
    .findOneAndUpdate({ _id: id }, {
      $set: {
        ...body,
        updated: new Date(),
      }
    }, { returnOriginal: false })
  return res.send(updatedConnection.value)
}

const handleDeleteConnection = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection

  const existingConnection = await core.client
    .collection('Connections')
    .findOne({ _id: id })

  if (!existingConnection) {
    throw new APIError('Connection does not exists', 404)
  }

  if (!existingConnection.owner_id.equals(req.user._id)) {
    throw new APIError('Do not have rights to edit the connection', 401)
  }

  await core.client.collection('Connections').deleteOne({ _id: id })
  return res.status(200).send()
}

const handleGetDrivers = async (req: AuthRequest, res: Response) => {
  return res.send(Object.keys(SUPPORTED_DRIVERS))
}

const handleGetConnectionConnectivity = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection
  const connectionDesction = await core.client
    .collection('Connections')
    .findOne({ _id: id })
  if (!connectionDesction) {
    throw new APIError('No connection found', 404)
  }

  const connection = ConnectionsFactory.get(connectionDesction.name)
  await connection.checkConectivity()
  return res.send()
}

ConnectionsAPI.get('/', requiresAuth(), withCatch(handleListConnections))
ConnectionsAPI.get('/drivers', requiresAuth(), withCatch(handleGetDrivers))
ConnectionsAPI.get('/:id', requiresAuth(), withCatch(handleGetConnection))
ConnectionsAPI.get('/:id/connectivity', requiresAuth(), withCatch(handleGetConnectionConnectivity))
ConnectionsAPI.post('/', requiresAuth(), withCatch(handleCreateConnection))
ConnectionsAPI.put('/:id', requiresAuth(), withCatch(handleUpdateConnection))
ConnectionsAPI.delete('/:id', requiresAuth(), withCatch(handleDeleteConnection))
export default ConnectionsAPI
