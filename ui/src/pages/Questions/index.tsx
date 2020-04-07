import * as React from 'react'
import {
  Container,
  Box,
  Table,
  TableCell,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableBody,
} from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { QuestionLastRun } from '../../components'
import { useQuestions } from '../../hooks'

export default () => {
  const history = useHistory()
  const { loading, error, questions } = useQuestions()

  return (
    <Container>
      {loading && <h1>Loading</h1>}
      {error && <h1>Error</h1>}
      {questions && (
        <Box m={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Connection</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {questions.map((question: any) => (
                  <TableRow
                    key={question._id}
                    hover
                    classes={{ hover: 'clickable' }}
                    onClick={() => history.push(`/questions/${question._id}`)}
                  >
                    <TableCell>{question.name}</TableCell>
                    <TableCell>
                      {question.connection && question.connection.name}
                    </TableCell>
                    <TableCell align="center">
                      <QuestionLastRun question={question} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  )
}
