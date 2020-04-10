import * as React from 'react'
import { userContext, User } from '../hooks'
import { useClient, useMutation } from 'react-fetching-library'
import { fetchUserForToken, loginWithGoogleAction } from '../service'
import { NOOP } from '../utils'

declare const gapi: any

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID

let GAPI_AVAILABLE: boolean
gapi.load('auth2', {
  callback: () => {
    try {
      gapi.auth2
        .init({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: 'redirect',
        })
        .then(() => {
          GAPI_AVAILABLE = true
        })
    } catch (e) {
      GAPI_AVAILABLE = false
      console.error(e)
    }
  },
  onerror: (e: any) => {
    GAPI_AVAILABLE = false
    console.error(e)
  },
})

const initGoogleApiEffect = (onResult: (result: boolean) => void) => () => {
  if (GAPI_AVAILABLE !== undefined) {
    onResult(GAPI_AVAILABLE)
  } else {
    setTimeout(initGoogleApiEffect(onResult), 10)
  }
}

export default ({ children }: { children: any }) => {
  const [GAPIInited, setGAPIInited] = React.useState(false)
  const [token, setToken] = React.useState<string | undefined>(
    localStorage.getItem('token') || undefined
  )
  const [user, setUser] = React.useState<User>()
  const [loading, setLoading] = React.useState(true)

  const { query } = useClient()
  const {
    loading: loadingGoogle,
    error: errorGoogle,
    payload: payloadGoogle,
    mutate: loginWithGoogle,
  } = useMutation(loginWithGoogleAction)

  React.useEffect(initGoogleApiEffect(setGAPIInited), [])
  React.useEffect(() => {
    if (GAPIInited && !token) {
      const authInstance = gapi.auth2.getAuthInstance()
      if (authInstance.isSignedIn.get()) {
        const googleProfile = authInstance.currentUser.get().getBasicProfile()
        const profile = {
          email: googleProfile.getEmail(),
          firstName: googleProfile.getName(),
          lastName: googleProfile.getFamilyName(),
          picture: googleProfile.getImageUrl(),
        }
        loginWithGoogle(profile).then(({ error, payload }) => {
          if (!error) {
            setToken(payload.token)
          }
        })
      }
    }
  }, [GAPIInited, loginWithGoogle, token])

  React.useEffect(() => {
    if (!token) {
      setUser(undefined)
      setLoading(false)
      localStorage.removeItem('token')
    } else {
      setLoading(true)
      query(fetchUserForToken(token)).then(({ error, payload }) => {
        if (error) {
          console.error(payload)
          setToken(undefined)
          setUser(undefined)
          setLoading(false)
        } else {
          setUser(payload)
          setLoading(false)
          localStorage.setItem('token', token)
        }
      })
    }
  }, [token, query])

  if (loading) {
    return <h1>Loading user</h1>
  }

  const login = (provider: string) => {
    if (provider === 'google') {
      const authInstance = gapi.auth2.getAuthInstance()
      if (authInstance) {
        authInstance.signIn()
      }
    }
  }

  const logout = () => {
    const authInstance = gapi.auth2.getAuthInstance()
    if (authInstance) {
      authInstance.signOut()
    }

    setToken(undefined)
  }

  return (
    <userContext.Provider
      value={{
        user,
        setToken,
        setUser,
        login: GAPIInited ? login : NOOP,
        logout: GAPIInited ? logout : NOOP,
      }}
    >
      {children}
    </userContext.Provider>
  )
}
