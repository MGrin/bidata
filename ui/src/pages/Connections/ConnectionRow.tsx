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
import { useUser } from '../../hooks'
import { formatHosts } from '../../utils'
import { fetchConnectivityAction } from '../../service'

type Props = {
  connection: any
  onEdit: () => void
}

const DriverIcon = ({ driver }: { driver: string }) => {
  switch (driver) {
    case 'mongodb': {
      return (
        <img
          alt="mongodb"
          src="https://store-images.s-microsoft.com/image/apps.6989.5a75739e-6663-45e9-b4c8-974dcbde28a9.96b28dd0-717a-4e5b-85f1-2727929049c5.55e5d6e3-bd01-4752-b1a5-b6c5450faa32"
          width="40px"
          height="40px"
        />
      )
    }

    case 'postgresql': {
      return (
        <img
          alt="postgresql"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/1080px-Postgresql_elephant.svg.png"
          width="30px"
          height="30px"
        />
      )
    }

    default: return null
  }
}
export default React.memo(({ connection, onEdit }: Props) => {
  const { loading, error, query } = useQuery(
    fetchConnectivityAction(connection)
  )
  const connected = !loading && !error

  const { user } = useUser()

  React.useEffect(() => {
    query()
  }, [connection, query])
  return (
    <TableRow hover>
      <TableCell align="center">
        <DriverIcon driver={connection.driver} />
      </TableCell>
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
        {user && user._id === connection.owner_id && (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
})
