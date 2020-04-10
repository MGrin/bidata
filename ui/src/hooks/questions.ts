import * as React from 'react'
import { useQuery, useMutation, useClient } from 'react-fetching-library'
import {
  fetchQuestionsAction,
  fetchQuestionAction,
  updateQuestionAction,
  createQuestionExecution,
  fetchConnectionAction,
  fetchLastQuestionExecutionAction,
} from '../service'
import { isScalar } from '../utils'
import { useConnections } from './connections'

export const useQuestions = () => {
  const {
    loading: loadingQuestions,
    error: errorQuestions,
    payload: questions,
    query,
  } = useQuery(fetchQuestionsAction)
  const {
    loading: loadingConnections,
    error: errorConnections,
    connections,
  } = useConnections('map')

  const loading = loadingQuestions || loadingConnections
  const error = errorQuestions || errorConnections

  let populatedQuestions
  if (questions && connections) {
    populatedQuestions = questions.map((question: any) => ({
      ...question,
      connection: connections[question.connection_id],
    }))
  }
  return {
    loading,
    error,
    questions: populatedQuestions,
    fetchQuestions: query,
  }
}

export const useQuestionSettings = (predefinedSettings: any, result: any) =>
  React.useMemo(() => {
    const settings: any = {
      ...predefinedSettings,
    }

    if (!result) {
      return settings
    }

    if (isScalar(result.data)) {
      settings.type = 'scalar'

      if (Array.isArray(result.data[0])) {
        settings.key = 0
      } else if (typeof result.data[0] !== 'object') {
        settings.key = null
      } else {
        settings.key = Object.keys(result.data[0])[0]
      }
    } else {
      settings.columns = result.columns
      const chartSettingsKeys = Object.keys(settings).filter((key: string) =>
        key.startsWith('chart')
      )
      for (const chartSettingKey of chartSettingsKeys) {
        for (const axis of ['xAxis', 'yAxis', 'zAxis']) {
          if (settings[chartSettingKey][axis]) {
            if (Array.isArray(settings[chartSettingKey][axis])) {
              settings[chartSettingKey][axis] = settings[chartSettingKey][
                axis
              ].filter(
                (column: string) => settings.columns.indexOf(column) !== -1
              )
            } else if (
              settings.columns.indexOf(settings[chartSettingKey][axis]) === -1
            ) {
              settings[chartSettingKey][axis] = ''
            }
          }
        }
      }
    }

    return settings
  }, [predefinedSettings, result])

export const useQuestion = (questionId: string) => {
  const {
    loading: loadingQuestion,
    error: errorQuestion,
    payload: question,
  } = useQuery(fetchQuestionAction(questionId))
  const {
    loading: loadingQuestionUpdate,
    error: errorQuestionUpdate,
    payload: updatedQuestion,
    mutate: updateQuestion,
  } = useMutation(updateQuestionAction(questionId))
  const {
    loading: loadingQuestionExecution,
    error: errorQuestionExecution,
    payload: questionExecution,
    mutate: runQuestion,
  } = useMutation(createQuestionExecution)

  const { query } = useClient()

  const [loading, setLoading] = React.useState<boolean>()
  const [error, setError] = React.useState<boolean>()
  const [connection, setConnection] = React.useState()
  const [lastExecution, setLastExecution] = React.useState()

  React.useEffect(() => {
    if (errorQuestion && question) {
      setLoading(false)
      setError(question)
      return
    }

    if (!error && question) {
      setLoading(true)
      query(fetchConnectionAction(question.connection_id))
        .then(
          ({ payload: connectionResponse }) =>
            new Promise<any>((resolve) => {
              query(fetchLastQuestionExecutionAction(question._id))
                .then(({ payload: executionResponse }) =>
                  resolve({ connectionResponse, executionResponse })
                )
                .catch(() => resolve({ connectionResponse }))
            })
        )
        .then(({ connectionResponse, executionResponse }) => {
          setConnection(connectionResponse)
          setLastExecution(executionResponse)
          setLoading(false)
        })
        .catch((e) => {
          setError(e)
        })
    }
  }, [question, errorQuestion, query])

  React.useEffect(() => {
    setLoading(loadingQuestion)
  }, [loadingQuestion])

  const save = (newQuery: string) =>
    updateQuestion({
      name: question.name,
      connection_id: question.connection_id,
      query: newQuery,
    })
  const run = async (newQuery: string) => {
    await save(newQuery)
    await runQuestion({
      question_id: question._id,
      connection_id: connection ? connection._id : undefined,
      query: newQuery,
    })
  }
  const updateSettings = (settings: any) =>
    updateQuestion({ visualSettings: settings })

  return {
    loading,
    error: error,
    question: (!error && question) ? (
      connection
        ? {
          ...(updatedQuestion || question),
          connection,
        }
        : undefined
    ) : undefined,
    execution: questionExecution || lastExecution,
    waiting: loadingQuestionUpdate || loadingQuestionExecution,
    errorWaiting: errorQuestionUpdate || errorQuestionExecution,
    save,
    run,
    updateSettings,
  }
}
