import { Request, Response, NextFunction } from 'express'
import request from 'request'
import MongoConnection from './connections/mongo'
import { ObjectId } from 'mongodb'
import { withCatch, APIError } from './api/utils'

export type AuthRequest = Request & { user?: any }

export const auth = (host: string) => (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('x-auth')
  if (!token) {
    return next()
  }

  request(
    `http://${host}/tokens/user?token=${token}`,
    (error, response, body) => {
      if (body) {
        const user = JSON.parse(body)
        req.user = {
          ...user,
          _id: new ObjectId(user._id),
        }
      }
      return next()
    }
  )
}

export const requiresAuth = (roles: string[] = []) =>
  withCatch(async (req: AuthRequest, res: Response, next?: NextFunction) => {
    if (!req.user) {
      throw new APIError('Not authorized', 401)
    }

    return next && next()
  })

export const analytics = (db: MongoConnection) => {
  db.checkConectivity()
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    db.client.collection('HTTPRequests').insertOne({
      user_id: req.user ? req.user._id : null,
      created: new Date(),
      headers: req.headers,
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
    })

    return next()
  }
}
