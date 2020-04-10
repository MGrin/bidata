import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares'

export class APIError {
  public message: string
  public status: number
  constructor(message: string, status: number = 500) {
    this.status = status
    this.message = message
  }
}

export const withCatch = (
  handler: (req: AuthRequest, res: Response, next?: NextFunction) => Promise<any>
) => (req: AuthRequest, res: Response, next?: NextFunction) =>
    handler(req, res, next).catch(e => {
      const apiError = new APIError(e.message, e.status)
      return res.status(apiError.status).send(apiError)
    })
