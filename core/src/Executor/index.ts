import { BIDataExecution, BIDataExecutionState } from "../api/executions";
import { BIDataQuestion } from "../api/questions";
import { BIDataConnection } from "../api/connections";
import ConnectionsFactory from "../connections";
import MongoConnection from "../connections/mongo";

export class Executor {
  constructor() { }

  public async run(
    question: BIDataQuestion,
    connection: BIDataConnection,
    setState: (update: Partial<BIDataExecution>,
    ) => void) {
    const conn = ConnectionsFactory.get(connection.name)

    setState({
      state: BIDataExecutionState.RUNNING,
    })

    try {
      const result = await conn.runQuery(question.query || '')
      const core = ConnectionsFactory.get() as MongoConnection
      const resultInsert = await core.client.collection('Results').insertOne(result)

      setState({
        state: BIDataExecutionState.DONE,
        results: resultInsert.insertedId,
      })
    } catch (e) {
      setState({
        state: BIDataExecutionState.ERROR,
        error: e.message,
      })
    }
  }
}

export default () => new Executor()