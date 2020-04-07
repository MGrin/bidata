import { Client, Action } from "react-fetching-library";

export const API = process.env.REACT_APP_API_HOST

export const requestHostInterceptor = (client: Client) => async (action: Action) => {
  return {
      ...action,
      endpoint: `${API}${action.endpoint}`,
  };
};

export const fetchConnectionsAction: Action = {
  method: 'GET',
  endpoint: '/connections'
}

export const fetchConnectivityAction: (connection: any) => Action = ({ _id }) => ({
  method: 'GET',
  endpoint: `/ui/connections/${_id}/connectivity`
})

export const fetchDriversAction: Action = {
  method: 'GET',
  endpoint: '/ui/connections/drivers'
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

export const createConnectionAction: (data: ConectionFormData) => Action = ({ name, driver, dsn }: ConectionFormData) => ({
  method: 'POST',
  endpoint: '/connections',
  body: {
    name,
    driver,
    params: {
      dsn
    }
  }
})
export const updateConnectionAction: (data: ConectionFormData) => Action = ({ name, driver, dsn, id }: ConectionFormData) => ({
  method: 'PUT',
  endpoint: `/connections/${id}`,
  body: {
    name,
    driver,
    params: {
      dsn
    }
  }
})

export const createQuestionAction: (data: QuestionFormData) => Action = (data: QuestionFormData) => ({
  method: 'POST',
  endpoint: '/questions',
  body: data
})

export const fetchQuestionAction: (question_id: string) => Action = (question_id: string) => ({
  method: 'GET',
  endpoint: `/questions/${question_id}`
})

export const fetchConnectionAction: (connection_id: string) => Action = (connection_id: string) => ({
  method: 'GET',
  endpoint: `/connections/${connection_id}`
})

export const updateQuestionAction: (question_id: string) => (data: QuestionFormData) => Action = (question_id) => (data) => ({
  method: 'PUT',
  endpoint: `/questions/${question_id}`,
  body: data
})

type QuestionExecutionForm = {
  question_id: string
  connection_id: string
  query: string
  visualSettings?: any
}
export const createQuestionExecution: (data: QuestionExecutionForm) => Action = (data) => ({
  method: 'POST',
  endpoint: `/executions`,
  body: data
})

export const fetchResultAction: (result_id: string) => Action = (result_id) => ({
  method: 'GET',
  endpoint: `/results/${result_id}`
})

export const fetchExecutionAction: (execution_id: string) => Action = (execution_id) => ({
  method: 'GET',
  endpoint: `/executions/${execution_id}`
})

export const fetchQuestionsAction: Action = {
  method: 'GET',
  endpoint: '/questions'
}

export const fetchLastQuestionExecutionAction: (question_id: string) => Action = (question_id: string) => ({
  method: 'GET',
  endpoint: `/questions/${question_id}/executions/last`
})


type DashboardForm = {
  name: string
  updateFrequency?: number
  questions?: string[]
}
export const createDashboardAction: (data: DashboardForm) => Action = (data) => ({
  method: 'POST',
  endpoint: '/dashboards',
  body: data
})

export const fetchDashboardsAction: Action = {
  method: 'GET',
  endpoint: '/dashboards',
}