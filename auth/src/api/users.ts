import { Router, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import ConnectionsFactory from '../connections'
import MongoConnection from '../connections/mongo'
import { withCatch, APIError } from './utils'
import { SUPPORTED_STRATEGIES, createToken } from './tokens'
import { generateSalt, hash } from '../crypto'

export type BIDataUser = {
  email: string
  firstName: string
  lastName: string
  picture?: string
}
export const createUser = async (
  provider: SUPPORTED_STRATEGIES,
  data: BIDataUser,
  providerData: any
) => {
  const core = ConnectionsFactory.get() as MongoConnection
  let user = await core.client
    .collection('Users')
    .findOne({ email: data.email })

  if (user) {
    user = await core.client
      .collection('Users')
      .findOneAndUpdate(
        { _id: user._id },
        { $set: { [`providers.${provider}`]: providerData } },
        { returnOriginal: false }
      )
    user = user.value
  } else {
    const userDocument = await core.client.collection('Users').insertOne({
      ...data,
      providers: {
        [provider]: providerData,
      },
    })
    user = await core.client
      .collection('Users')
      .findOne({ _id: userDocument.insertedId })
  }

  return user
}

const UsersAPI = Router()

// const handleCreateUser = async (req: Request, res: Response) => {
//   const data = {
//     email: req.body.email,
//     firstName: req.body.firstName,
//     lastName: req.body.lastName,
//   } as BIDataUser

//   if (!data.email || !data.firstName || !data.lastName) {
//     throw new APIError('Provide all required information', 400)
//   }
//   const core = ConnectionsFactory.get() as MongoConnection
//   const existingUser = await core.client
//     .collection('Users')
//     .findOne({ email: data.email })
//   if (existingUser) {
//     throw new APIError('User with provided email already registered', 400)
//   }

//   const user = await createUser(SUPPORTED_STRATEGIES.password, data, data)
//   const salt = generateSalt()
//   const hashedPassword = hash(req.body.password, salt)

//   await core.client.collection('Credentials').insertOne({
//     user_id: user._id,
//     email: data.email,
//     password: hashedPassword,
//     salt: salt,
//     strategy: SUPPORTED_STRATEGIES.password,
//   })

//   const token = await createToken(user._id, SUPPORTED_STRATEGIES.password)
//   return res.send({ token })
// }

const handleGetUserById = async (req: Request, res: Response) => {
  const id = new ObjectId(req.params.id)
  const core = ConnectionsFactory.get() as MongoConnection
  const user = await core.client.collection('Users').findOne({ _id: id })

  return res.send(user)
}

UsersAPI.get('/:id', withCatch(handleGetUserById))
// UsersAPI.post('/', withCatch(handleCreateUser))
export default UsersAPI
