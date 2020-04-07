import * as React from 'react'
import { useQuery, useMutation } from 'react-fetching-library' 
import { Dialog, DialogProps, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, InputLabel, FormControl, Select, MenuItem, Typography, LinearProgress } from '@material-ui/core'
import { constructDSN, validate } from './utils'
import { fetchDriversAction, createConnectionAction, updateConnectionAction } from '../../service'

type Props = DialogProps & {
  connection?: any
  onSuccess: () => void
  setSubmitting: (submitting: boolean) => void
}

export default React.memo(({
  connection,
  open,
  onClose,
  setSubmitting,
  onSuccess,
}: Props) => {
  let loading = false

  const { loading: loadingDrivers, error: errorDrivers, payload: drivers } = useQuery(fetchDriversAction)
  const { loading: createLoading, mutate: createConnection } = useMutation(createConnectionAction)
  const { loading: updateLoading, mutate: updateConnection } = useMutation(updateConnectionAction)

  loading = loadingDrivers || createLoading || updateLoading

  const [name, setName] = React.useState('')
  const [driver, setDriver] = React.useState('')
  const [dsn, setDsn] = React.useState('')
  const [error, setError] = React.useState()

  React.useEffect(() => {
    if (connection) {
      setName(connection.name)
      setDriver(connection.driver)
      setDsn(constructDSN(connection.metadata))
    }
  }, [connection])

  const isValid = validate(name, driver, dsn)

  const clearForm = () => {
    setDriver('')
    setName('')
    setDsn('')
  }

  const submitConnection = async () => {
    setError(undefined)
    setSubmitting(true)
    const mutate = connection ? updateConnection : createConnection
    const { payload: mutationPayload, error: mutationError} = await mutate({ name, driver, dsn, id: connection ? connection._id : undefined })
    setSubmitting(false)
    if (mutationError) {
      return setError(mutationPayload)
    }
    clearForm()
    onSuccess()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Add new connection
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          To create new connection, please select the database type and provide the connection string:
        </DialogContentText>
        <FormControl fullWidth disabled={loading}>
          <InputLabel id="database-type-select-label">Database type</InputLabel>
          <Select
            labelId="database-type-select-label"
            id="database-type-select"
            value={driver}
            required
            disabled={loading || errorDrivers}
            error={errorDrivers}
            onChange={({ target: { value } }) => {
              setDriver(value as string)
              setDsn(`${value}://`)
            }}
          >
            {drivers && drivers.map((driver: string) => (
              <MenuItem key={driver} value={driver}>{driver}</MenuItem>
            ))}
          </Select>
          <TextField
            required
            label="Name"
            type="text"
            value={name}
            disabled={loading}
            onChange={({ target: { value } }) => setName(value)}
          />
          <TextField
            required
            label="Connection string"
            helperText="DSN format: scheme://[user:[password@]]host1[:port1][,host2:[port2],...[,hostN:[portN]]][[/]?options]"
            type="url"
            value={dsn}
            disabled={loading}
            onChange={({ target: { value } }) => setDsn(value)}
          />
          {error && (
            <Typography color="error" variant="caption">Error: {error.message}</Typography>
          )}
          {loading && <LinearProgress />}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={loading}
          onClick={(e) => {
            clearForm()
            if (onClose) {
              onClose(e, 'escapeKeyDown')
            }
          }}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          disabled={!isValid || loading}
          onClick={submitConnection}
          color="primary"
        >
          {connection ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
})