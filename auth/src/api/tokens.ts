import { Router, Request, Response } from 'express'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { APIError, withCatch, isTokenValid } from './utils'
import { hash, generateSalt } from '../crypto'
import { createUser } from './users'
import { ObjectId } from 'mongodb'

export enum SUPPORTED_STRATEGIES {
  // password = 'password',
  google = 'google',
}

export const createToken = async (
  userId: ObjectId,
  strategy: SUPPORTED_STRATEGIES
) => {
  const core = ConnectionsFactory.get() as MongoConnection
  const token = generateSalt()
  await core.client.collection('Tokens').update(
    {
      user_id: userId,
    },
    {
      value: token,
      user_id: userId,
      created: new Date(),
      strategy: strategy,
    },
    { upsert: true }
  )

  return token
}

const TokensAPI = Router()

const hanleGetLoginStrategies = async (req: Request, res: Response) => {
  return res.send(Object.keys(SUPPORTED_STRATEGIES))
}

// const handleExchangePasswordForToken = async (req: Request, res: Response) => {
//   const { email, password } = req.body

//   const core = ConnectionsFactory.get() as MongoConnection
//   const credentials = await core.client.collection('Credentials').findOne({
//     strategy: SUPPORTED_STRATEGIES.password,
//     email,
//   })

//   if (!credentials) {
//     throw new APIError(
//       'You can not login using password, maybe try another way of logging in?',
//       404
//     )
//   }

//   const hashedPassword = hash(password, credentials.salt)
//   if (hashedPassword !== credentials.password) {
//     throw new APIError('Wrong password', 401)
//   }

//   const token = await createToken(
//     credentials.user_id,
//     SUPPORTED_STRATEGIES.password
//   )

//   return res.send({ token })
// }

const handleExchangeGoogleForToken = async (req: Request, res: Response) => {
  const data = req.body as any

  const user = await createUser(
    SUPPORTED_STRATEGIES.google,
    {
      email: data.email,
      firstName: data.name,
      lastName: data.family_name,
      picture: data.picture || undefined,
    },
    data
  )

  const token = await createToken(user._id, SUPPORTED_STRATEGIES.google)
  return res.send({ token })
}

const handleExchange = async (req: Request, res: Response) => {
  const strategy = req.params.strategy as SUPPORTED_STRATEGIES

  if (Object.keys(SUPPORTED_STRATEGIES).indexOf(strategy) === -1) {
    throw new APIError(`Strategy ${strategy} is not supported`, 400)
  }

  switch (strategy) {
    // case 'password': {
    //   return await handleExchangePasswordForToken(req, res)
    // }

    case 'google': {
      return await handleExchangeGoogleForToken(req, res)
    }
  }
}

const handleExchangeTokenForUser = async (req: Request, res: Response) => {
  const { token } = req.query

  const core = ConnectionsFactory.get() as MongoConnection

  const userTokenPair = await core.client
    .collection('Tokens')
    .findOne({ value: token })
  if (!userTokenPair) {
    throw new APIError('No user found', 404)
  }

  if (!isTokenValid(userTokenPair)) {
    throw new APIError('Token is invalid', 401)
  }

  const user = await core.client
    .collection('Users')
    .findOne({ _id: userTokenPair.user_id })
  if (!user) {
    throw new APIError('User not found', 401)
  }
  return res.send(user)
}

TokensAPI.get('/strategies', withCatch(hanleGetLoginStrategies))
TokensAPI.get('/user', withCatch(handleExchangeTokenForUser))
TokensAPI.post('/:strategy', withCatch(handleExchange))
export default TokensAPI
