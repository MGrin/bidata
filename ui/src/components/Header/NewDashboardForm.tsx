import * as React from 'react'
import { Box, Dialog, DialogProps, DialogTitle, DialogContent, FormControl, Typography, LinearProgress, DialogActions, Button, TextField, InputLabel, Select, Chip, Input, MenuItem, DialogContentText } from '@material-ui/core'
import { useMutation } from 'react-fetching-library'
import DashboardIcon from '@material-ui/icons/Dashboard';
import { createDashboardAction } from '../../service'
import { useQuestions } from '../../hooks'

type Props = DialogProps & {
  onSuccess: (dashboard: any) => void
}

const validate = (name: string) => {
  if (!name) {
    return false
  }

  return true
}

export default ({
  open,
  onClose,
  onSuccess,
}: Props) => {
  const { loading: loadingQuestions, questions: availableQuestions, fetchQuestions } = useQuestions()
  const { loading: loadingSubmission, mutate: createDashboard } = useMutation(createDashboardAction)
  const loading = loadingQuestions || loadingSubmission

  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [updateFrequency, setUpdateFrequency] = React.useState()
  const [questions, setQuestions] = React.useState<string[]>([])
  const [error, setError] = React.useState()

  React.useEffect(() => {
    if (open) {
      fetchQuestions()
    }
  }, [open, fetchQuestions])

  const isValid = validate(name)
  const clearForm = () => {
    setName('')
    setUpdateFrequency(undefined)
    setQuestions([])
    setError(undefined)
  }
  const submitDashboard = async () => {
    setError(undefined)
    const dashboardData = {
      name,
      description,
      updateFrequency,
      questions,
    }
    const { payload: mutationPayload, error: mutationError} = await createDashboard(dashboardData)
    if (mutationError) {
      return setError(mutationPayload)
    }
    clearForm()
    onSuccess(mutationPayload)
  }

  return (
    <Dialog open={open} onClose={(e, s) => {
      clearForm()
      if (onClose) {
        onClose(e, 'escapeKeyDown')
      }
    }}>
      <DialogTitle>
        <Box display="flex" flexDirection="row" alignItems="center">
          <DashboardIcon />
          <Box m={1} />
          Add new dashboard
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          To create new dashboard, please provide a name and a list of questions. Don't worry, you'll be able to change this list later
        </DialogContentText>
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
        <FormControl fullWidth disabled={loading}>
          <TextField
            required
            label="Description"
            type="text"
            multiline
            value={description}
            disabled={loading}
            onChange={({ target: { value } }) => setDescription(value)}
          />
        </FormControl>
        <FormControl fullWidth disabled={loading}>
          <InputLabel id="questions-selector-label">
            Questions
          </InputLabel>
          <Select
            labelId="questions-selector-label"
            id="questions-selector"
            multiple
            value={questions}
            onChange={({ target: { value }}) => setQuestions(value as string[])}
            input={<Input id="questions-selector-input" />}
            renderValue={selected => (
              (selected as string[]).map((questionId) => (
                <Chip
                  key={questionId}
                  label={availableQuestions.find(({ _id }: any) => _id === questionId).name}
                />
              ))
            )}
          >
            {availableQuestions && availableQuestions.map((question: any) => (
              <MenuItem key={question._id} value={question._id}>
                {question.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && (
          <Typography color="error" variant="caption">Error: {error && error.message}</Typography>
        )}
        {loading && <LinearProgress />}
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
          onClick={submitDashboard}
          color="primary"
        >
          Create dashboard
        </Button>
      </DialogActions>
    </Dialog>
  )
}
