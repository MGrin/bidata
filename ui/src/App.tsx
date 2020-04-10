import * as React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { createClient, ClientContextProvider } from 'react-fetching-library'
import { requestHostInterceptor } from './service'
import {
  Home,
  Admin,
  Connections,
  Questions,
  Question,
  Dashboards,
  Dashboard,
  Landing,
} from './pages'
import { Header, ProtectedRoute, UserProvider } from './components'

const client = createClient({
  requestInterceptors: [requestHostInterceptor],
})

export default () => (
  <ClientContextProvider client={client}>
    <Router>
      <UserProvider>
        <Header />
        <Switch>
          <ProtectedRoute path="/home" component={Home} />
          <ProtectedRoute path="/dashboards/:dashboard_id" component={Dashboard} />
          <ProtectedRoute path="/dashboards" component={Dashboards} />
          <ProtectedRoute path="/questions/:question_id" component={Question} />
          <ProtectedRoute path="/questions" component={Questions} />
          <ProtectedRoute path="/admin/connections" component={Connections} />
          <ProtectedRoute path="/admin" component={Admin} />
          <Route path="/" component={Landing} />
        </Switch>
      </UserProvider>
    </Router>
  </ClientContextProvider>
)
