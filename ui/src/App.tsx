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
} from './pages'
import { Header } from './components'

const client = createClient({
  requestInterceptors: [requestHostInterceptor],
})

export default () => (
  <ClientContextProvider client={client}>
    <Router>
      <Header />
      <Switch>
        <Route path="/dashboards/:dashboard_id" component={Dashboard} />
        <Route path="/dashboards" component={Dashboards} />
        <Route path="/questions/:question_id" component={Question} />
        <Route path="/questions" component={Questions} />
        <Route path="/admin/connections" component={Connections} />
        <Route path="/admin" component={Admin} />
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  </ClientContextProvider>
)
