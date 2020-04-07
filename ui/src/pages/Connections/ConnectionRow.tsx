import * as React from 'react'
import {
  TableRow,
  TableCell,
  Typography,
  Button,
  CircularProgress,
} from '@material-ui/core'
import EditIcon from '@material-ui/icons/Edit'
import { useQuery } from 'react-fetching-library'
import ErrorIcon from '@material-ui/icons/ErrorOutline'
import DoneIcon from '@material-ui/icons/Done'
import { formatHosts } from '../../utils'
import { fetchConnectivityAction } from '../../service'

type Props = {
  connection: any
  onEdit: () => void
}

export default React.memo(({ connection, onEdit }: Props) => {
  const { loading, error, query } = useQuery(
    fetchConnectivityAction(connection)
  )
  const connected = !loading && !error

  React.useEffect(() => {
    query()
  }, [connection, query])
  return (
    <TableRow hover>
      <TableCell align="center">
        {loading && <CircularProgress size={16} />}
        {error && <ErrorIcon color="error" />}
        {connected && <DoneIcon color="primary" />}
      </TableCell>
      <TableCell>
        <Typography variant="overline">{connection.name}</Typography>
      </TableCell>
      <TableCell>{connection.metadata.username || ''}</TableCell>
      <TableCell>{formatHosts(connection.metadata)}</TableCell>
      <TableCell>{connection.metadata.endpoint}</TableCell>
      <TableCell>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          Edit
        </Button>
      </TableCell>
    </TableRow>
  )
})
