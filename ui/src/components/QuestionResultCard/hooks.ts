import * as React from 'react'
import { useClient } from 'react-fetching-library'
import { fetchExecutionAction, fetchResultAction } from '../../service'
import { isScalar } from './utils'

const EXECUTION_FETCH_TIMEOUT_INCREMENT = 100
const EXECUTION_FETCH_TIMEOUT_MAX = 3000
let FETCH_TIMEOUT = EXECUTION_FETCH_TIMEOUT_INCREMENT

type UseResultState = {
  execution?: any
  result?: any
  loading: boolean
  error: boolean
}
type UseResultAction = {
  type: 'START_QUERY'
      | 'FINISH_QUERY_SUCCESSFULLY'
      | 'FINISH_QUERY_WITH_ERROR'
      | 'FINISH_QUERY_WITH_ERROR'
      | 'REPLACE_EXECUTION'
  payload?: any
}
type UseResultReducer = React.Reducer<UseResultState, UseResultAction>

const initResultState: (initialState: UseResultState) => UseResultState = (state) => state
const initialState: UseResultState = {
  loading: false,
  error: false,
}

const refetchExecution = (
  query: any,
  executionId: string,
  setExecution: (execution: any) => void,
  dispatch: React.Dispatch<UseResultAction>
) => query(fetchExecutionAction(executionId))
  .then(({ payload }: any) => {
    setExecution(payload)
  })
  .catch(() => {
    dispatch({ type: 'FINISH_QUERY_WITH_ERROR', payload: null })
  })

const resultReducer: UseResultReducer = (state, action) => {
  switch (action.type) {
    case 'START_QUERY': return {
      ...state,
      result: undefined,
      loading: true,
      error: false,
    }

    case 'FINISH_QUERY_SUCCESSFULLY': return {
      ...state,
      loading: false,
      error: false,
      result: action.payload
    }

    case 'FINISH_QUERY_WITH_ERROR': return {
      ...state,
      loading: false,
      error: action.payload || true,
      result: undefined,
    }

    case 'REPLACE_EXECUTION': return {
      ...state,
      execution: action.payload
    }

    default: return state
  }
}

export const useResult = (onResultUpdate: (result: any) => void) => {
  const { query } = useClient()

  const [{
    execution,
    result,
    loading,
    error,
  }, dispatch] = React.useReducer<UseResultReducer, UseResultState>(resultReducer, initialState, initResultState)

  const setExecution = (newExecution: any) => {
    if (newExecution.state === 'CREATED' || newExecution.state === 'RUNNING') {
      dispatch({ type: 'START_QUERY' })
      setTimeout(() => refetchExecution(query, newExecution._id, setExecution, dispatch), FETCH_TIMEOUT)
      if (FETCH_TIMEOUT < EXECUTION_FETCH_TIMEOUT_MAX) {
        FETCH_TIMEOUT += EXECUTION_FETCH_TIMEOUT_INCREMENT
      }
    } else if (newExecution.state === 'DONE' && !error) {
      FETCH_TIMEOUT = EXECUTION_FETCH_TIMEOUT_INCREMENT
      query(fetchResultAction(newExecution.results))
        .then(({ payload: result }) => {
          dispatch({ type: 'FINISH_QUERY_SUCCESSFULLY', payload: result})
          onResultUpdate(result)
        })
        .catch(() => {
          dispatch({ type: 'FINISH_QUERY_WITH_ERROR', payload: null })
        })
    } else if (newExecution.state === 'ERROR') {
      dispatch({ type: 'FINISH_QUERY_WITH_ERROR', payload: newExecution.error})
    }

    if (newExecution && (!execution || execution._id !== newExecution._id)) {
      dispatch({ type: 'REPLACE_EXECUTION', payload: newExecution })
    }
  }

  return {
    loading,
    error,
    execution,
    result,
    setExecution,
  }
}


export const useQuestionSettings = (predefinedSettings: any, result: any) => React.useMemo(() => {
  const settings: any = {
    ...predefinedSettings
  }

  if (!result) {
    return settings
  }

  if (isScalar(result.data)) {
    settings.type = 'scalar'

    if (Array.isArray(result.data[0])) {
      settings.key = 0
    } else if (typeof(result.data[0]) !== 'object') {
      settings.key = null
    } else {
      settings.key = Object.keys(result.data[0])[0]
    }
  } else {
    settings.columns = result.columns
    const chartSettingsKeys = Object.keys(settings).filter((key: string) => key.startsWith('chart'))
    for (const chartSettingKey of chartSettingsKeys) {
      for (const axis of ['xAxis', 'yAxis', 'zAxis']) {
        if (settings[chartSettingKey][axis]) {
          if (Array.isArray(settings[chartSettingKey][axis])) {
            settings[chartSettingKey][axis] = settings[chartSettingKey][axis].filter(
              (column: string) => settings.columns.indexOf(column) !== -1
            )
          } else if (settings.columns.indexOf(settings[chartSettingKey][axis]) === -1) {
            settings[chartSettingKey][axis] = ''
          }
        }
      }
    }
  }

  return settings
}, [predefinedSettings, result])