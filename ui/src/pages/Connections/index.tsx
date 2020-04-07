import * as React from 'react'
import {
  Container,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
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
  const { loading, error, drivers, connections, query } = useConnections(
    'driver'
  )
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
      {drivers && (
        <Box m={1}>
          {drivers.length > 0 && (
            <Typography variant="h6">Connections:</Typography>
          )}
          <Box mb={1}>
            {drivers.map((driver: string) => (
              <ExpansionPanel key={driver}>
                <ExpansionPanelSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography variant="button">{driver}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell>Name</TableCell>
                          <TableCell>Username</TableCell>
                          <TableCell>Hosts</TableCell>
                          <TableCell>Database</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {connections[driver].map((connection: any) => (
                          <ConnectionRow
                            key={connection._id}
                            connection={connection}
                            onEdit={() => editConnection(connection)}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            ))}
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
