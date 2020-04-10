import MongoConnection from './mongo'
import AbstractConnection from './AConnection'

export default class ConnectionsFactory {
  private static connections: {
    [name: string]: AbstractConnection<any>
  } = {}
  constructor() {}

  public static createConnection(connection: any) {
    ConnectionsFactory.connections[connection.name] = new MongoConnection(
      connection.params
    )

    return ConnectionsFactory.connections[connection.name]
  }

  public static get(name?: string) {
    if (!name) {
      name = 'bidata_core'
    }

    if (!ConnectionsFactory.connections[name]) {
      throw new Error(`No connection found ${name}`)
    }

    return ConnectionsFactory.connections[name]
  }

  public static async loadConnections(core: MongoConnection) {
    const connections = await core.client.collection('Connections').find()
    const connectionsAsArr = await connections.toArray()

    for (const conn of connectionsAsArr) {
      try {
        ConnectionsFactory.createConnection(conn)
      } catch (e) {
        console.warn(e.message)
      }
    }
  }
}
