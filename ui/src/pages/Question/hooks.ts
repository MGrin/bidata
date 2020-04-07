import * as React from 'react'
import { useQuery, useClient, useMutation } from 'react-fetching-library'
import { fetchQuestionAction, fetchConnectionAction, updateQuestionAction, createQuestionExecution, fetchLastQuestionExecutionAction } from '../../service'

export const useQuestion = (questionId: string) => {
  const { loading: loadingQuestion, error: errorQuestion, payload: question } = useQuery(fetchQuestionAction(questionId))
  const { loading: loadingQuestionUpdate, error: errorQuestionUpdate, payload: updatedQuestion, mutate: updateQuestion } = useMutation(updateQuestionAction(questionId))
  const { loading: loadingQuestionExecution, error: errorQuestionExecution, payload: questionExecution, mutate: runQuestion } = useMutation(createQuestionExecution)

  const { query } = useClient()

  const [loading, setLoading] = React.useState()
  const [error, setError] = React.useState()
  const [connection, setConnection] = React.useState()
  const [lastExecution, setLastExecution] = React.useState()

  React.useEffect(() => {
    if (question) {
      setLoading(true)
      query(fetchConnectionAction(question.connection_id))
        .then(({ payload: connectionResponse }) => new Promise<any>((resolve) => {
          query(fetchLastQuestionExecutionAction(question._id))
            .then(({ payload: executionResponse }) => resolve({ connectionResponse, executionResponse }))
            .catch(() => resolve({ connectionResponse }))
        }))
        .then(({ connectionResponse, executionResponse }) => {
          setConnection(connectionResponse)
          setLastExecution(executionResponse)
          setLoading(false)
        })
        .catch((e) => {
          setError(e)
        })
    }
  }, [question, query])

  React.useEffect(() => {
    setLoading(loadingQuestion)
  }, [loadingQuestion])

  const save = (query: string) => updateQuestion({ name: question.name, connection_id: question.connection_id, query })
  const run = async (query: string) => {
    await save(query)
    await runQuestion({
      question_id: question._id,
      connection_id: connection._id,
      query,
    })
  }
  const updateSettings = (settings: any) => updateQuestion({ visualSettings: settings })

  return {
    loading,
    error: error || errorQuestion || errorQuestionExecution,
    question: connection ? ({
      ...(updatedQuestion || question),
      connection,
    }) : undefined,
    execution: questionExecution || lastExecution,
    waiting: loadingQuestionUpdate || loadingQuestionExecution,
    errorWaiting: errorQuestionUpdate || errorQuestionExecution,
    save,
    run,
    updateSettings,
  }
}
