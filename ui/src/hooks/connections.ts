import { useQuery } from 'react-fetching-library'
import { fetchConnectionsAction } from '../service'

type ConnectionsShape = 'map' | 'driver'
type ConnectionsQueryResult = {
  error: boolean
  errorObject?: any
  connections?: any
  drivers?: any
  loading: boolean
  query: () => Promise<any>
}
export const useConnections: (
  shape?: ConnectionsShape
) => ConnectionsQueryResult = (shape) => {
  const { payload, ...useQueryReturn } = useQuery(fetchConnectionsAction)

  if (!payload) {
    return {
      ...useQueryReturn,
      connections:
        useQueryReturn.loading || useQueryReturn.error
          ? undefined
          : ([] as any),
    }
  }

  switch (shape) {
    case 'map': {
      return {
        ...useQueryReturn,
        connections: payload.reduce(
          (acc: any, connection: any) => ({
            ...acc,
            [connection._id]: connection,
          }),
          {}
        ),
      }
    }

    case 'driver': {
      const drivers = payload
        .map((c: any) => c.driver)
        .filter(
          (driver: string, index: number, self: any[]) =>
            self.indexOf(driver) === index
        )
        .sort()

      const connections = drivers.reduce(
        (acc: any, driver: string) => ({
          ...acc,
          [driver]: payload.filter((c: any) => c.driver === driver),
        }),
        {}
      )

      return {
        ...useQueryReturn,
        connections,
        drivers,
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
