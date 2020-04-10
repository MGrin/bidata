import * as React from 'react'
import { NOOP } from '../utils'

export type User = {
  _id?: string
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
  login: (provider: string) => void
  logout: () => void
}

export const userContext = React.createContext<UserContext>({
  login: NOOP,
  logout: NOOP,
})

export const useUser = () => {
  return React.useContext(userContext)
}