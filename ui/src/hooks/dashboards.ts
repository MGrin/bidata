import * as React from 'react'

import { useQuery } from 'react-fetching-library'
import { fetchDashboardsAction, fetchDashboardAction } from '../service'

export const useDashboards = () => {
  const { payload, ...useQueryReturn } = useQuery(fetchDashboardsAction)

  return {
    ...useQueryReturn,
    dashboards:
      useQueryReturn.loading || useQueryReturn.error
        ? undefined
        : payload || [],
  }
}

export const useDashboard = (dashboardId: string) => {
  const { loading, error, payload: dashboard } = useQuery(fetchDashboardAction(dashboardId))

  return {
    loading,
    error,
    dashboard,
  }
}