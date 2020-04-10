import * as React from 'react'
import {
  Container,
  Typography,
  Button,
  Box,
  TableContainer,
  TableRow,
  Table,
  TableBody,
  TableCell,
  TableHead,
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AddIcon from '@material-ui/icons/Add'
import ConnectionForm from './ConnectionForm'
import ConnectionRow from './ConnectionRow'
import { useConnections } from '../../hooks'

export default () => {
  const { loading, error, connections, query } = useConnections()
  const [editingConnection, setEditingConnection] = React.useState()
  const [submitting, setSubmitting] = React.useState(false)
  const [isConnectionFormOpen, setConnectionFormOpen] = React.useState(false)

  const editConnection = (connection: any) => {
    setEditingConnection(connection)
    setConnectionFormOpen(true)
  }
  const closeConnectionForm = () => {
    if (!submitting) {
      setEditingConnection(undefined)
      setConnectionFormOpen(false)
    }
  }

  return (
    <Container>
      {loading && <h1>Loading</h1>}
      {error && <h1>Error</h1>}
      {connections && (
        <Box m={1}>
          {connections.length > 0 && (
            <Typography variant="h6">Connections:</Typography>
          )}
          <Box mb={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Driver</TableCell>
                    <TableCell />
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Hosts</TableCell>
                    <TableCell>Database</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {connections.map((connection: any) => (
                    <ConnectionRow
                      key={connection._id}
                      connection={connection}
                      onEdit={() => editConnection(connection)}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setConnectionFormOpen(true)}
          >
            Add connection
          </Button>
        </Box>
      )}
      <ConnectionForm
        open={isConnectionFormOpen}
        connection={editingConnection}
        onClose={closeConnectionForm}
        onSuccess={() => {
          query()
          closeConnectionForm()
        }}
        setSubmitting={setSubmitting}
      />
    </Container>
  )
}
