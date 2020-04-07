import { Action } from 'react-fetching-library'

export const API = process.env.REACT_APP_API_HOST

export const requestHostInterceptor = () => async (action: Action) => {
  return {
    ...action,
    endpoint: `${API}${action.endpoint}`,
  }
}

export const fetchConnectionsAction: Action = {
  method: 'GET',
  endpoint: '/connections',
}

export const fetchConnectivityAction: (connection: any) => Action = ({
  _id,
}) => ({
  method: 'GET',
  endpoint: `/ui/connections/${_id}/connectivity`,
})

export const fetchDriversAction: Action = {
  method: 'GET',
  endpoint: '/ui/connections/drivers',
}

export type ConectionFormData = {
  name: string
  driver: string
  dsn: string
  id?: string
}

export type QuestionFormData = {
  name?: string
  connection_id?: string
  query?: string
  visualSettings?: any
}

export const createConnectionAction: (data: ConectionFormData) => Action = ({
  name,
  driver,
  dsn,
}: ConectionFormData) => ({
  method: 'POST',
  endpoint: '/connections',
  body: {
    name,
    driver,
    params: {
      dsn,
    },
  },
})
export const updateConnectionAction: (data: ConectionFormData) => Action = ({
  name,
  driver,
  dsn,
  id,
}: ConectionFormData) => ({
  method: 'PUT',
  endpoint: `/connections/${id}`,
  body: {
    name,
    driver,
    params: {
      dsn,
    },
  },
})

export const createQuestionAction: (data: QuestionFormData) => Action = (
  data: QuestionFormData
) => ({
  method: 'POST',
  endpoint: '/questions',
  body: data,
})

export const fetchQuestionAction: (questionId: string) => Action = (
  questionId: string
) => ({
  method: 'GET',
  endpoint: `/questions/${questionId}`,
})

export const fetchConnectionAction: (connectionId: string) => Action = (
  connectionId: string
) => ({
  method: 'GET',
  endpoint: `/connections/${connectionId}`,
})

export const updateQuestionAction: (
  questionId: string
) => (data: QuestionFormData) => Action = (questionId) => (data) => ({
  method: 'PUT',
  endpoint: `/questions/${questionId}`,
  body: data,
})

type QuestionExecutionForm = {
  question_id: string
  connection_id: string
  query: string
  visualSettings?: any
}
export const createQuestionExecution: (
  data: QuestionExecutionForm
) => Action = (data) => ({
  method: 'POST',
  endpoint: `/executions`,
  body: data,
})

export const fetchResultAction: (resultId: string) => Action = (resultId) => ({
  method: 'GET',
  endpoint: `/results/${resultId}`,
})

export const fetchExecutionAction: (executionId: string) => Action = (
  executionId
) => ({
  method: 'GET',
  endpoint: `/executions/${executionId}`,
})

export const fetchQuestionsAction: Action = {
  method: 'GET',
  endpoint: '/questions',
}

export const fetchLastQuestionExecutionAction: (
  questionId: string
) => Action = (questionId: string) => ({
  method: 'GET',
  endpoint: `/questions/${questionId}/executions/last`,
})

type DashboardForm = {
  name: string
  updateFrequency?: number
  questions?: string[]
}
export const createDashboardAction: (data: DashboardForm) => Action = (
  data
) => ({
  method: 'POST',
  endpoint: '/dashboards',
  body: data,
})

export const fetchDashboardsAction: Action = {
  method: 'GET',
  endpoint: '/dashboards',
}

export const fetchDashboardAction: (dashboardId: string) => Action = (dashboardId) => ({
  method: 'GET',
  endpoint: `/dashboards/${dashboardId}`
})