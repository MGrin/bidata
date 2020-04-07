import * as React from 'react'
import { useQuery } from 'react-fetching-library'
import { fetchLastQuestionExecutionAction } from '../service'
import { CircularProgress, Tooltip } from '@material-ui/core'
import SuccessIcon from '@material-ui/icons/CheckCircleOutline'
import ErrorIcon from '@material-ui/icons/ErrorOutline'
import RunningIcon from '@material-ui/icons/HourglassEmpty'
// @ts-ignore
import ReactTimeAgo from 'react-time-ago'

const getExecutionIcon = (execution: any) => {
  switch (execution.state) {
    case 'DONE':
      return <SuccessIcon color="primary" />
    case 'ERROR':
      return <ErrorIcon color="error" />
    default:
      return <RunningIcon />
  }
}

type Props = {
  question: any
}

export default React.memo(({ question }: Props) => {
  const { loading, error, payload: execution } = useQuery(
    fetchLastQuestionExecutionAction(question._id)
  )
  if (loading) {
    return <CircularProgress size={14} />
  }

  if (error) {
    console.log(execution)
    return null
  }

  if (execution) {
    return (
      <Tooltip
        title={<ReactTimeAgo date={new Date(execution.created)} locale="en" />}
        placement="right"
        arrow
      >
        {getExecutionIcon(execution)}
      </Tooltip>
    )
  }

  return null
})
