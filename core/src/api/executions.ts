import { Router, Response } from 'express'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { APIError, withCatch } from './utils'
import { BIDataQuestion } from './questions'
import { BIDataConnection } from './connections'
import { ObjectId } from 'mongodb'
import getExecutor from '../Executor'
import { AuthRequest, requiresAuth } from '../middlewares'

export enum BIDataExecutionState {
  'CREATED' = 'CREATED',
  'RUNNING' = 'RUNNING',
  'CANCELED' = 'CANCELED',
  'DONE' = 'DONE',
  'ERROR' = 'ERROR',
}

export type BIDataExecution = {
  question_id: string
  connection_id: string
  query: string
  state?: BIDataExecutionState
  results?: ObjectId
  error?: string
  created?: Date
  updatd?: Date
}

const ExecutionsAPI = Router()

const handleGetExecution = async (req: AuthRequest, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection

  const execution = await core.client
    .collection('Executions')
    .findOne({ _id: id })
  if (!execution) {
    const apiError = new APIError('No execution found', 400)
    return res.status(apiError.status).send(apiError)
  }

  return res.send(execution)
}

const handleCreateExecution = async (req: AuthRequest, res: Response) => {
  const body = req.body as BIDataExecution
  const core = ConnectionsFactory.get() as MongoConnection

  const now = new Date()
  const executionInsert = await core.client.collection('Executions').insertOne({
    ...body,
    question_id: new ObjectId(body.question_id),
    connection_id: new ObjectId(body.connection_id),
    creator_id: req.user._id,
    state: BIDataExecutionState.CREATED,
    created: now,
    updated: now,
  })

  const execution = (await core.client
    .collection('Executions')
    .findOne({ _id: executionInsert.insertedId })) as BIDataExecution

  if (!execution) {
    const apiError = new APIError('Failed to execute the question', 500)
    await core.client.collection('Executions').updateOne(
      { _id: executionInsert.insertedId },
      {
        $set: {
          state: BIDataExecutionState.ERROR,
          error: apiError.message,
        },
      }
    )

    return res.status(apiError.status).send(apiError)
  }

  const question = (await core.client
    .collection('Questions')
    .findOne({ _id: new ObjectId(execution.question_id) })) as BIDataQuestion
  if (!question) {
    const apiError = new APIError('Question not found', 404)
    const update = {
      state: BIDataExecutionState.ERROR,
      error: apiError.message,
    }
    await core.client.collection('Executions').updateOne(
      { _id: executionInsert.insertedId },
      {
        $set: update,
      }
    )

    return res.send({
      ...execution,
      ...update,
    })
  }

  const connection = (await core.client
    .collection('Connections')
    .findOne({ _id: new ObjectId(question.connection_id) })) as BIDataConnection

  if (!connection) {
    const apiError = new APIError('Connection not found', 404)
    const update = {
      state: BIDataExecutionState.ERROR,
      error: apiError.message,
    }
    await core.client.collection('Executions').updateOne(
      { _id: executionInsert.insertedId },
      {
        $set: update,
      }
    )

    return res.send({
      ...execution,
      ...update,
    })
  }

  res.send(execution)
  const executor = getExecutor()
  const setState = async (update: Partial<BIDataExecution>) => {
    await core.client.collection('Executions').updateOne(
      { _id: executionInsert.insertedId },
      {
        $set: {
          ...update,
          updated: new Date(),
        },
      }
    )
  }

  try {
    await executor.run(question, connection, setState)
  } catch (e) {
    await setState({
      state: BIDataExecutionState.ERROR,
      error: e.message,
    })
  }
}

ExecutionsAPI.get('/:id', requiresAuth(), withCatch(handleGetExecution))
ExecutionsAPI.post('/', requiresAuth(), withCatch(handleCreateExecution))
export default ExecutionsAPI
