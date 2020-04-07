import * as React from 'react'
import { useQuery } from 'react-fetching-library';
import { fetchConnectionsAction, fetchQuestionsAction, fetchDashboardsAction } from './service';

export const usePagination = () => {
  const rowsPerPageOptions = [10, 25, 50]
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, rowsPerPageOptions[0]));
    setPage(0);
  };

  return {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    handleChangePage,
    handleChangeRowsPerPage
  }
}

export const useQuestions = () => {
  const { loading: loadingQuestions, error: errorQuestions, payload: questions, query } = useQuery(fetchQuestionsAction)
  const { loading: loadingConnections, error: errorConnections, connections } = useConnections('map')

  const loading = loadingQuestions || loadingConnections
  const error = errorQuestions || errorConnections

  let populatedQuestions = undefined
  if (questions && connections) {
    populatedQuestions = questions.map((question: any) => ({
      ...question,
      connection: connections[question.connection_id]
    }))
  }
  return {
    loading,
    error: error,
    questions: populatedQuestions, 
    fetchQuestions: query,
  }
}

type ConnectionsShape = 'map' | 'driver'
type ConnectionsQueryResult = {
  error: boolean
  errorObject?: any
  connections?: any
  drivers?: any
  loading: boolean;
  query: () => Promise<any>
}
export const useConnections: (shape?: ConnectionsShape) => ConnectionsQueryResult = (shape) => {
  const { payload, ...useQueryReturn } = useQuery(fetchConnectionsAction)

  if (!payload) {
    return {
      ...useQueryReturn,
      connections: useQueryReturn.loading || useQueryReturn.error ? undefined : ([] as any)
    }
  }

  switch (shape) {
    case 'map': {
      return {
        ...useQueryReturn,
        connections: payload.reduce((acc: any, connection: any) => ({
          ...acc,
          [connection._id]: connection,
        }), {})
      }
    }

    case 'driver': {
      const drivers = payload
        .map((c: any) => c.driver)
        .filter((driver: string, index: number, self: any[]) => self.indexOf(driver) === index)
        .sort()
      
      const connections = drivers.reduce((acc: any, driver: string) => ({
        ...acc,
        [driver]: payload.filter((c: any) => c.driver === driver)
      }), {})

      return {
        ...useQueryReturn,
        connections,
        drivers
      }
    }

    default: {
      return {
        ...useQueryReturn,
        connections: payload,
      }
    }
  }
}

export const useDashboards = () => {
  const { payload, ...useQueryReturn } = useQuery(fetchDashboardsAction)

  return {
    ...useQueryReturn,
    dashboards: useQueryReturn.loading || useQueryReturn.error ? undefined : (payload || [])
  }
}