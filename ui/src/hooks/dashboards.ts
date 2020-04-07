import { useQuery } from 'react-fetching-library'
import { fetchDashboardsAction } from '../service'

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
