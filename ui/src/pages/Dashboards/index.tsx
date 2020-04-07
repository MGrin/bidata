import * as React from 'react'
import { Container, Box, Table, TableCell, TableContainer, Paper, TableHead, TableRow, TableBody } from '@material-ui/core'
import { useHistory } from 'react-router-dom';
import { useDashboards } from '../../hooks'

export default () => {
  const history = useHistory()
  const { loading, error, dashboards } = useDashboards()

  return (
    <Container>
      {loading && <h1>Loading</h1>}
      {error && <h1>Error</h1>}
      {dashboards && (
        <Box m={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboards.map((dashboard: any) => (
                  <TableRow
                    key={dashboard._id}
                    hover
                    classes={{ hover: 'clickable' }}
                    onClick={() => history.push(`/dashboards/${dashboard._id}`)}
                  >
                    <TableCell>{dashboard.name}</TableCell>
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