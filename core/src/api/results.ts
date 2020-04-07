import { Router, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { APIError, withCatch } from './utils'

const ResultsAPI = Router()
const handleGetResult = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection

  const result = await core.client.collection('Results').findOne({ _id: id })
  if (!result) {
    const apiError = new APIError('No result found', 400)
    return res.status(apiError.status).send(apiError)
  }

  return res.send(result)
}

ResultsAPI.get('/:id', withCatch(handleGetResult))
export default ResultsAPI