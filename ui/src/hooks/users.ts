import * as React from 'react'

export type User = {
  email: string
  firstName: string
  lastName: string
  picture?: string
  roles?: string[]
}

type UserContext = {
  user?: User,
  setToken?: (token?: string) => void
  setUser?: (user?: User) => void
  login?: (provider: string) => void
}

export const userContext = React.createContext<UserContext>({})

export const useUser = () => {
  return React.useContext(userContext)
}