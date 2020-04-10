import * as React from 'react'
import { useQuestions } from '../../hooks'
import { Container, Box, Paper, Typography, Link, Divider } from '@material-ui/core'

const Tutorial = () => {
  return (
    <Paper>
      <Box m={1}>
        <Typography variant="h3">Welcome to BIData</Typography>
        <Divider />
        <Box m={2} />
        <Typography variant="body2">
          <strong>Note!</strong> It's still an early alpha stage. Please report all found bugs{' '}
          <Link target="_blank" href="https://github.com/MGrin/bidata/issues">here</Link>
          {' '}🙏
        </Typography>
        <Box m={2} />
        <Typography variant="h6">Connections</Typography>
        <Typography variant="body2">
          To start you can <Link href="/admin/connections">create a connection</Link> to your database.
          If you don't want to use your own DB, you can explore publicly available ones
        </Typography>
        <Divider />
        <Box m={2} />
        <Typography variant="h6">Questions</Typography>
        <Typography variant="body2">
          After configuring your own connections (or not, if you are ok using publicly available ones),
          you can create a new quesdtion to the data.<br />
          To do so, click in the button on the right upper corner and select Question.
        </Typography>
        <Divider />
        <Box m={2} />
        <Typography variant="h6">Dashboards</Typography>
        <Typography variant="body2">
          Your questions can be assambled in dashboards. <br />
          To create a dashboard, click on the same button in the up right corner and click on Dashboard
        </Typography>
        <Divider />
        <Box m={2} p={2} />
      </Box>
    </Paper >
  )
}
export default () => {
  const { loading, error, questions } = useQuestions()

  return (
    <Container>
      {loading && <h1>Loading</h1>}
      {error && <h1>Error</h1>}
      {questions && (
        <Box m={1}>
          <Tutorial />
        </Box>
      )}
    </Container>
  )
}
