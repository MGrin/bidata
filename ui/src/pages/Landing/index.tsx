import * as React from 'react'
import { useUser } from '../../hooks'
import { useHistory } from 'react-router-dom'

export default () => {
  const { user } = useUser()
  const history = useHistory()

  if (user) {
    history.push('/home')
    return null
  }

  return <h1>Landing</h1>
}
