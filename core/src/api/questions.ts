import { Router, Response } from 'express'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { ObjectId } from 'mongodb'
import { APIError, withCatch } from './utils'
import { AuthRequest, requiresAuth } from '../middlewares'
import { SUPPORTED_DRIVERS } from './connections'

const INITIAL_QUERY = {
  [SUPPORTED_DRIVERS.mongodb]: (user: any) => `/**
 * Hi ${user.firstName || ''}! Happy to see you here.
 * This is the Mongo DB shell. Basically it's a fully functional JavaScript VM,
 * from where you can access to the mongodb client.
 * 
 * Here is an example:
 * 
 * const results = await db.collection('YOUR_COLLECTION_NAME').find().toArray
 * return results
 * 
 * The code above will retuan all documents from collection YOUR_COLLECTION_NAME
 * 
 * Note that you can fully use the power of JavaScript in here!
 * 
 * const data = []
 * for (let i = 0; i < 1000; i++) {
 *   data.push({ index: i, value: Math.random() * i })
 * }
 * 
 * return data
 * 
 * Have fun!
 */`,
  [SUPPORTED_DRIVERS.postgresql]: (user: any) => `-- Hi ${user.firstName ||
    ''}! Happy to see you here.
-- This is the PostgresQL shell.
-- You can write raw SQL here, like this:

SELECT now()

-- Please, never end you query with ";" symbol! It will throw an error :)
-- Have fun!`,
} as any

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

const handleListQuestions = async (req: AuthRequest, res: Response) => {
  const core = (await ConnectionsFactory.get()) as MongoConnection
  const questions = await core.client.collection('Questions').find({
    $or: [
      {
        owner_id: req.user._id,
        private: true,
      },
      {
        private: false,
      },
    ],
  })
  const questionsAsArr = await questions.toArray()
  return res.send(questionsAsArr)
}

const handleGetQuestion = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = (await ConnectionsFactory.get()) as MongoConnection
  const question = await core.client
    .collection('Questions')
    .findOne({ _id: id })

  if (!question) {
    throw new APIError('Question not found', 404)
  }

  if (question.private && !question.owner_id.equals(req.user._id)) {
    throw new APIError('You do not have access to this question', 401)
  }
  return res.send(question)
}

const handleCreateQuestion = async (req: AuthRequest, res: Response) => {
  const body = req.body as BIDataQuestion
  try {
    validateQuestionData(body)
  } catch (e) {
    return res.status(e.status).send(e)
  }

  const core = ConnectionsFactory.get() as MongoConnection

  let connection
  try {
    connection = await core.client
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
    query: INITIAL_QUERY[connection.driver](req.user),
    ...body,
    connection_id: new ObjectId(body.connection_id),
    creator_id: req.user._id,
    owner_id: req.user._id,
  })
  return res.send({
    _id: questionDocument.insertedId,
    ...body,
  })
}

const handleUpdateQuestion = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const body = req.body as BIDataQuestion & { _id: string }
  delete body._id

  if (body.connection_id) {
    body.connection_id = new ObjectId(body.connection_id)
  }

  const core = ConnectionsFactory.get() as MongoConnection

  const existingQuestion = await core.client
    .collection('Questions')
    .findOne({ _id: id })
  if (!existingQuestion) {
    throw new APIError('No question found', 404)
  }
  if (!existingQuestion.owner_id.equals(req.user._id)) {
    throw new APIError('Do not have rights to edit the dashboard', 401)
  }

  const updatedQuestion = await core.client
    .collection('Questions')
    .findOneAndUpdate({ _id: id }, { $set: body }, { returnOriginal: false })

  return res.send(updatedQuestion.value)
}

const handleDeleteQuestion = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection

  const existingQuestion = await core.client
    .collection('Questions')
    .findOne({ _id: id })
  if (!existingQuestion) {
    throw new APIError('No question found', 404)
  }
  if (!existingQuestion.owner_id.equals(req.user._id)) {
    throw new APIError('Do not have rights to edit the dashboard', 401)
  }

  await core.client.collection('Questions').deleteOne({ _id: id })
  return res.status(200).send()
}

const handleGetLastExecution = async (req: AuthRequest, res: Response) => {
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

QuestionsAPI.get('/', requiresAuth(), withCatch(handleListQuestions))
QuestionsAPI.get('/:id', requiresAuth(), withCatch(handleGetQuestion))
QuestionsAPI.get(
  '/:id/executions/last',
  requiresAuth(),
  withCatch(handleGetLastExecution)
)
QuestionsAPI.post('/', requiresAuth(), withCatch(handleCreateQuestion))
QuestionsAPI.put('/:id', requiresAuth(), withCatch(handleUpdateQuestion))
QuestionsAPI.delete('/:id', requiresAuth(), withCatch(handleDeleteQuestion))

export default QuestionsAPI
