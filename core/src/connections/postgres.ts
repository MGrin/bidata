import { Pool } from 'pg'
import AbstractConnection, { QueryResult } from './AConnection'
import { BIDataPostgresConnectionParams } from '../api/connections'

export default class PostgresConnection extends AbstractConnection<
  BIDataPostgresConnectionParams
> {
  private client: Pool | undefined
  constructor(params: BIDataPostgresConnectionParams) {
    super(params)
  }

  private async connect() {
    if (!this.client) {
      this.client = new Pool({
        connectionString: this.params.dsn,
      })
    }
  }

  public async runQuery(query: string): Promise<QueryResult> {
    await this.connect()

    const queryResult = await this.client!.query(`
    SELECT * FROM (
      ${query}
    ) as result LIMIT 1000
    `)

    return {
      count: queryResult.rowCount,
      data: queryResult.rows,
      columns: this.getColumns(queryResult.rows),
    }
  }

  public async checkConectivity(): Promise<boolean> {
    await this.connect()
    await this.client!.query('select * from information_schema.tables limit 10')
    return true
  }
}
