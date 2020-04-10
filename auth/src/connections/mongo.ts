import * as mongo from 'mongodb'
import vm from 'vm'
import AbstractConnection, { QueryResult } from './AConnection'

export default class MongoConnection extends AbstractConnection<any> {
  private _client: mongo.MongoClient | null = null
  // @ts-ignore
  public client: mongo.Db

  constructor(params: any) {
    super(params)
  }

  private async connect() {
    if (!this._client) {
      this._client = await mongo.MongoClient.connect(this.params.dsn, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        numberOfRetries: 1,
        connectTimeoutMS: 5000,
      })

      this.client = this._client.db()
    }
  }

  public async runQuery(query: string): Promise<QueryResult> {
    await this.connect()
    const scope = {
      db: this.client,
      ObjectId: mongo.ObjectId,
      setTimeout,
    }

    const parsingContext = vm.createContext(scope)
    const fn = vm.compileFunction(
      `
      const run = async () => {
        ${query}
      }

      return run()
    `,
      [],
      { parsingContext }
    )
    let fnResult = await fn()

    const result = {} as any
    if (fnResult instanceof Promise) {
      fnResult = await fnResult
    }

    if (fnResult instanceof mongo.Cursor) {
      result.count = await fnResult.count()
      result.data = await fnResult.toArray()
    } else if (Array.isArray(fnResult)) {
      result.count = fnResult.length
      result.data = fnResult
    } else if (fnResult === undefined) {
      throw new Error('Query did not return any result')
    } else {
      result.count = 1
      result.data = [fnResult]
    }

    result.columns = this.getColumns(result.data)
    return result
  }

  public async checkConectivity(): Promise<boolean> {
    await this.connect()
    if (!this._client || this._client.isConnected() || this.client) {
      return true
    }

    throw new Error('Could not connect')
  }
}
