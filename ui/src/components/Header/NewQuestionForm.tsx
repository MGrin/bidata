import * as React from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  LinearProgress,
  DialogActions,
  Button,
  TextField,
} from '@material-ui/core'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import { useConnections } from '../../hooks'
import { createQuestionAction } from '../../service'
import { useMutation } from 'react-fetching-library'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: (question: any) => void
}

const validate = (connection: string, name: string) => {
  if (!connection) {
    return false
  }

  if (!name) {
    return false
  }

  return true
}

export default ({ open, onClose, onSuccess }: Props) => {
  const {
    loading: loadingConnections,
    error: errorConnections,
    connections,
    query: fetchConnections,
  } = useConnections()
  const { loading: loadingSubmission, mutate: createQuestion } = useMutation(
    createQuestionAction
  )
  const loading = loadingConnections || loadingSubmission

  const [connection, setConnection] = React.useState('')
  const [connectionDriver, setConnectionDriver] = React.useState('')
  const [name, setName] = React.useState('')
  const [error, setError] = React.useState()

  React.useEffect(() => {
    if (open) {
      fetchConnections()
    }
  }, [open, fetchConnections])
  const isValid = validate(connection, name)
  const clearForm = () => {
    setConnection('')
    setName('')
  }
  const submitQuestion = async () => {
    setError(undefined)
    const questionData = {
      name,
      connection_id: connection,
      visualSettings: {
        type: connectionDriver === 'mongodb' ? 'documents' : 'columns',
      },
    }
    const {
      payload: mutationPayload,
      error: mutationError,
    } = await createQuestion(questionData)
    if (mutationError) {
      return setError(mutationPayload)
    }
    clearForm()
    onSuccess(mutationPayload)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Box display="flex" flexDirection="row" alignItems="center">
          <QuestionAnswerIcon />
          <Box m={1} />
          Add new question
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          To create new questions, please select the connection:
        </DialogContentText>
        <FormControl fullWidth disabled={loading}>
          <InputLabel id="connection-select-label">Connection</InputLabel>
          <Select
            labelId="connection-select-label"
            id="connection-select"
            value={connection}
            required
            disabled={loading}
            error={errorConnections}
            onChange={({ target: { value } }) => {
              setConnection(value as string)
              setConnectionDriver(
                (connections as any[]).find((c) => c._id === value).driver
              )
            }}
          >
            {connections &&
              connections.map((c: any) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl fullWidth disabled={loading}>
          <TextField
            required
            label="Name"
            type="text"
            value={name}
            disabled={loading}
            onChange={({ target: { value } }) => setName(value)}
          />
        </FormControl>
        {error && (
          <Typography color="error" variant="caption">
            Error: {error && error.message}
          </Typography>
        )}
        {loading && <LinearProgress />}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={loading}
          onClick={(e) => {
            if (onClose) {
              onClose()
            }
          }}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          disabled={!isValid || loading}
          onClick={submitQuestion}
          color="primary"
        >
          Create question
        </Button>
      </DialogActions>
    </Dialog>
  )
}
