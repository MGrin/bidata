import * as React from 'react'
import { useClient } from 'react-fetching-library'
import { fetchExecutionAction, fetchResultAction } from '../service'

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
  type:
  | 'START_QUERY'
  | 'FINISH_QUERY_SUCCESSFULLY'
  | 'FINISH_QUERY_WITH_ERROR'
  | 'FINISH_QUERY_WITH_ERROR'
  | 'REPLACE_EXECUTION'
  payload?: any
}
type UseResultReducer = React.Reducer<UseResultState, UseResultAction>

const initResultState: (initialState: UseResultState) => UseResultState = (
  state
) => state
const initialState: UseResultState = {
  loading: false,
  error: false,
}

const refetchExecution = (
  query: any,
  executionId: string,
  setExecution: (execution: any) => void,
  dispatch: React.Dispatch<UseResultAction>
) =>
  query(fetchExecutionAction(executionId))
    .then(({ payload }: any) => {
      setExecution(payload)
    })
    .catch(() => {
      dispatch({ type: 'FINISH_QUERY_WITH_ERROR', payload: null })
    })

const resultReducer: UseResultReducer = (state, action) => {
  switch (action.type) {
    case 'START_QUERY':
      return {
        ...state,
        result: undefined,
        loading: true,
        error: false,
      }

    case 'FINISH_QUERY_SUCCESSFULLY':
      return {
        ...state,
        loading: false,
        error: false,
        result: action.payload,
      }

    case 'FINISH_QUERY_WITH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload || true,
        result: undefined,
      }

    case 'REPLACE_EXECUTION':
      return {
        ...state,
        execution: action.payload,
      }

    default:
      return state
  }
}

export const useResult = (onResultUpdate: (result: any) => void) => {
  const { query } = useClient()

  const [{ execution, result, loading, error }, dispatch] = React.useReducer<
    UseResultReducer,
    UseResultState
  >(resultReducer, initialState, initResultState)

  const setExecution = (newExecution: any) => {
    if (newExecution.state === 'CREATED' || newExecution.state === 'RUNNING') {
      dispatch({ type: 'START_QUERY' })
      setTimeout(
        () => refetchExecution(query, newExecution._id, setExecution, dispatch),
        FETCH_TIMEOUT
      )
      if (FETCH_TIMEOUT < EXECUTION_FETCH_TIMEOUT_MAX) {
        FETCH_TIMEOUT += EXECUTION_FETCH_TIMEOUT_INCREMENT
      }
    } else if (newExecution.state === 'DONE' && !error) {
      FETCH_TIMEOUT = EXECUTION_FETCH_TIMEOUT_INCREMENT
      query(fetchResultAction(newExecution.results))
        .then(({ payload }) => {
          dispatch({ type: 'FINISH_QUERY_SUCCESSFULLY', payload })
          onResultUpdate(payload)
        })
        .catch(() => {
          dispatch({ type: 'FINISH_QUERY_WITH_ERROR', payload: null })
        })
    } else if (newExecution.state === 'ERROR') {
      dispatch({ type: 'FINISH_QUERY_WITH_ERROR', payload: newExecution.error })
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
