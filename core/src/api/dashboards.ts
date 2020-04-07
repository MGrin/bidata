import { Router, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { APIError, withCatch } from './utils'

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

const handleListDashboards = async (req: Request, res: Response) => {
  const core = await ConnectionsFactory.get() as MongoConnection
  const dashboards = await core.client.collection('Dashboards').find()
  const dashboardsAsArr = await dashboards.toArray()
  return res.send(dashboardsAsArr)
}

const handleGetDashboard = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = await ConnectionsFactory.get() as MongoConnection
  const dashboard = await core.client.collection('Dashboards').findOne({ _id: id })

  return res.send(dashboard)
}

const handleCreateDashboard = async (req: Request, res: Response) => {
  const body = {
    ...req.body,
  } as BIDataDashboard
  if (body.questions) {
    body.questions = body.questions.map((questionId: ObjectId) => new ObjectId(questionId))
  }

  try {
    validateDashboardData(body)
  } catch (e) {
    return res.status(e.status).send(e)
  }

  const core = ConnectionsFactory.get() as MongoConnection
  const dashboardDocument = await core.client.collection('Dashboards').insertOne(body)

  return res.send({
    _id: dashboardDocument.insertedId,
    ...body,
  })
}

const handleUpdateDashboard = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id)
  const body = req.body as BIDataDashboard & { _id?: string }
  delete body._id

  try {
    validateDashboardData(body)
  } catch (e) {
    return res.status(e.status).send(e)
  }

  const core = ConnectionsFactory.get() as MongoConnection
  const updatedDashboard = await core.client
    .collection('Dashboards')
    .findOneAndUpdate({ _id: id }, { $set: body }, { returnOriginal: false })
  return res.send(updatedDashboard.value)
}

const handleDeleteDashboard = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection

  await core.client.collection('Dashboards').deleteOne({ _id: id })
  return res.status(200).send()
}

DashboardsAPI.get('/', withCatch(handleListDashboards))
DashboardsAPI.get('/:id', withCatch(handleGetDashboard))
DashboardsAPI.post('/', withCatch(handleCreateDashboard))
DashboardsAPI.put('/:id', withCatch(handleUpdateDashboard))
DashboardsAPI.delete('/:id', withCatch(handleDeleteDashboard))

export default DashboardsAPI