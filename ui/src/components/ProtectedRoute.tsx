import * as React from 'react'
import { RouteProps, Route, Redirect } from 'react-router-dom'
import { useUser, User } from '../hooks'

const hasAtLeastOneRole = (user?: User, roles?: string[]) => {
  if (!user) return false
  if (!roles) return true
  if (!user.roles) return false

  const sortedUserRoles = user.roles.sort()
  const sortedRoles = user.roles.sort()

  for (let i = 0; i < Math.min(user.roles.length, roles.length); i++) {
    if (sortedUserRoles[i] === sortedRoles[i]) {
      return true
    }
  }

  return false
}

type SubComponentType = React.ComponentType<any>
type ProtectedRouteProps = {
  component: SubComponentType
  roles?: string[]
} & RouteProps

export default ({
  component,
  roles,
  ...props
}: ProtectedRouteProps) => {
  const { user } = useUser()
  const RouteComponent = component

  return (
    <Route
      {...props}
      exact
      render={routeProps =>
        hasAtLeastOneRole(user, roles) ? <RouteComponent {...routeProps} /> : <Redirect to="/" />
      }
    />
  )
}