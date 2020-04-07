import { Request, Response } from 'express'

export class APIError {
  public message: string
  public status: number
  constructor(message: string, status: number = 500) {
    this.status = status
    this.message = message
  }
}

export const withCatch = (
  handler: (req: Request, res: Response) => Promise<any>
) => (req: Request, res: Response) =>
  handler(req, res).catch(e => {
    const apiError = new APIError(e.message, e.status)
    return res.status(apiError.status).send(apiError)
  })
