import { decrypt } from '../crypto'

export type QueryResult = {
  count: number
  data: any[]
  columns: string[]
}

export default abstract class AbstractConnection<ConnectionParamsType> {
  protected params: ConnectionParamsType
  protected DYNAMIC_COLUMNS_TRESHLOD = 200

  constructor(params: ConnectionParamsType) {
    this.params = {
      ...params,
    }
    // @ts-ignore
    this.params.dsn = decrypt(this.params.dsn)
  }

  public abstract async checkConectivity(): Promise<boolean>
  public abstract async runQuery(query: string): Promise<QueryResult>

  protected getColumns(data: any) {
    if (!data) {
      return []
    }
    const columnsMap: { [name: string]: number } = {}
    let order = 0

    if (data.length < this.DYNAMIC_COLUMNS_TRESHLOD) {
      for (const row of data) {
        const keys = Object.keys(row)
        for (const columnName of keys) {
          if (columnsMap[columnName] === undefined) {
            columnsMap[columnName] = order
            order += 1
          }
        }
      }
    } else {
      for (let i = 0; i < this.DYNAMIC_COLUMNS_TRESHLOD; i++) {
        const idx = Math.floor(Math.random() * (data.length - 1))
        const row = data[idx]
        const keys = Object.keys(row)
        for (const columnName of keys) {
          if (columnsMap[columnName] === undefined) {
            columnsMap[columnName] = order
            order += 1
          }
        }
      }
    }

    return Object.keys(columnsMap).sort((a, b) => columnsMap[a] - columnsMap[b])
  }
}
