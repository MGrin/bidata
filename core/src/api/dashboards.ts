import { Router, Response } from 'express'
import { ObjectId } from 'mongodb'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { APIError, withCatch } from './utils'
import { AuthRequest, requiresAuth } from '../middlewares'

export type BIDataDashboard = {
  name: string
  description?: string
  updateFrequency?: number
  questions?: ObjectId[]
  layoutSettings?: ObjectId[][]
}

const DashboardsAPI = Router()

const validateDashboardData = (dashboard: BIDataDashboard) => {
  if (!dashboard.name) {
    throw new APIError('No dashboard name provided', 400)
  }
}

const handleListDashboards = async (req: AuthRequest, res: Response) => {
  const core = (await ConnectionsFactory.get()) as MongoConnection
  const dashboards = await core.client.collection('Dashboards').find({
    $or: [{
      owner_id: req.user._id,
    }, {
      private: false
    }]
  })
  const dashboardsAsArr = await dashboards.toArray()
  return res.send(dashboardsAsArr)
}

const handleGetDashboard = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = (await ConnectionsFactory.get()) as MongoConnection
  const dashboard = await core.client
    .collection('Dashboards')
    .findOne({ _id: id })

  if (!dashboard) {
    throw new APIError('Dashboard not found', 404)
  }
  if (dashboard.private && !dashboard.owner_id.equals(req.user._id)) {
    throw new APIError('You do not have permissions to see this dashboard', 401)
  }
  return res.send(dashboard)
}

const handleCreateDashboard = async (req: AuthRequest, res: Response) => {
  const body = {
    ...req.body,
  } as BIDataDashboard

  if (body.questions) {
    body.questions = body.questions.map(
      (questionId: ObjectId) => new ObjectId(questionId)
    )
  }

  try {
    validateDashboardData(body)
  } catch (e) {
    return res.status(e.status).send(e)
  }

  const core = ConnectionsFactory.get() as MongoConnection
  const dashboardDocument = await core.client
    .collection('Dashboards')
    .insertOne({
      ...body,
      creator_id: req.user._id,
      owner_id: req.user._id,
      created: new Date(),
      private: true
    })

  return res.send({
    _id: dashboardDocument.insertedId,
    ...body,
  })
}

const handleUpdateDashboard = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const body = req.body as BIDataDashboard & { _id?: string }
  delete body._id

  try {
    validateDashboardData(body)
  } catch (e) {
    return res.status(e.status).send(e)
  }

  const core = ConnectionsFactory.get() as MongoConnection
  const existingDashboard = await core.client
    .collection('Dashboards')
    .findOne({ _id: id })
  if (!existingDashboard) {
    throw new APIError('No dashboard found', 404)
  }
  if (!existingDashboard.owner_id.equals(req.user._id)) {
    throw new APIError('Do not have rights to edit the dashboard', 401)
  }
  const updatedDashboard = await core.client
    .collection('Dashboards')
    .findOneAndUpdate({ _id: id }, {
      $set: {
        ...body,
        updated: new Date()
      }
    }, { returnOriginal: false })
  return res.send(updatedDashboard.value)
}

const handleDeleteDashboard = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection

  const existingDashboard = await core.client
    .collection('Dashboards')
    .findOne({ _id: id })
  if (!existingDashboard) {
    throw new APIError('No dashboard found', 404)
  }
  if (!existingDashboard.owner_id.equals(req.user._id)) {
    throw new APIError('Do not have rights to edit the dashboard', 401)
  }
  await core.client.collection('Dashboards').deleteOne({ _id: id })
  return res.status(200).send()
}

DashboardsAPI.get('/', requiresAuth(), withCatch(handleListDashboards))
DashboardsAPI.get('/:id', requiresAuth(), withCatch(handleGetDashboard))
DashboardsAPI.post('/', requiresAuth(), withCatch(handleCreateDashboard))
DashboardsAPI.put('/:id', requiresAuth(), withCatch(handleUpdateDashboard))
DashboardsAPI.delete('/:id', requiresAuth(), withCatch(handleDeleteDashboard))

export default DashboardsAPI
