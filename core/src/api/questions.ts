import { Router, Response, Request } from 'express'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { ObjectId } from 'mongodb'
import { APIError, withCatch } from './utils'

export type BIDataQuestion = {
  name: string
  connection_id: ObjectId
  query: string
  visualSettings?: {
    type: 'columns' | 'documents'
    key?: string
  }
}

const QuestionsAPI = Router()

const validateQuestionData = (body: BIDataQuestion) => {
  if (!body.name) {
    throw new APIError('No question name provided', 400)
  }

  if (!body.connection_id) {
    throw new APIError('No connection provided', 400)
  }
}

const handleListQuestions = async (req: Request, res: Response) => {
  const core = (await ConnectionsFactory.get()) as MongoConnection
  const questions = await core.client.collection('Questions').find()
  const questionsAsArr = await questions.toArray()
  return res.send(questionsAsArr)
}

const handleGetQuestion = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = (await ConnectionsFactory.get()) as MongoConnection
  const question = await core.client
    .collection('Questions')
    .findOne({ _id: id })

  return res.send(question)
}

const handleCreateQuestion = async (req: Request, res: Response) => {
  const body = req.body as BIDataQuestion
  try {
    validateQuestionData(body)
  } catch (e) {
    return res.status(e.status).send(e)
  }

  const core = ConnectionsFactory.get() as MongoConnection

  try {
    const connection = await core.client
      .collection('Connections')
      .findOne({ _id: new ObjectId(body.connection_id) })
    if (!connection) {
      const apiError = new APIError('No connection found', 400)
      return res.status(apiError.status).send(apiError)
    }
  } catch (e) {
    const apiError = new APIError(e.message, 400)
    return res.status(apiError.status).send(apiError)
  }

  const questionDocument = await core.client.collection('Questions').insertOne({
    ...body,
    connection_id: new ObjectId(body.connection_id),
  })
  return res.send({
    _id: questionDocument.insertedId,
    ...body,
  })
}

const handleUpdateQuestion = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id)
  const body = req.body as BIDataQuestion & { _id: string }
  delete body._id

  if (body.connection_id) {
    body.connection_id = new ObjectId(body.connection_id)
  }

  const core = ConnectionsFactory.get() as MongoConnection

  const updatedQuestion = await core.client
    .collection('Questions')
    .findOneAndUpdate({ _id: id }, { $set: body }, { returnOriginal: false })

  return res.send(updatedQuestion.value)
}

const handleDeleteQuestion = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection

  await core.client.collection('Questions').deleteOne({ _id: id })
  return res.status(200).send()
}

const handleGetLastExecution = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection

  const execution = await core.client
    .collection('Executions')
    .find({
      question_id: id,
    })
    .sort({ updated: -1 })
    .limit(1)
    .toArray()

  if (execution && execution.length > 0) {
    return res.send(execution[0])
  }

  const apiError = new APIError('Execution not found', 404)
  return res.status(apiError.status).send(apiError)
}

QuestionsAPI.get('/', withCatch(handleListQuestions))
QuestionsAPI.get('/:id', withCatch(handleGetQuestion))
QuestionsAPI.get('/:id/executions/last', withCatch(handleGetLastExecution))
QuestionsAPI.post('/', withCatch(handleCreateQuestion))
QuestionsAPI.put('/:id', withCatch(handleUpdateQuestion))
QuestionsAPI.delete('/:id', withCatch(handleDeleteQuestion))

export default QuestionsAPI
