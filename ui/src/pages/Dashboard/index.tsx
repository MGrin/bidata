import * as React from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { Box, Link, Grid, Typography } from '@material-ui/core'
import { useDashboard, useQuestion } from '../../hooks'
import { QuestionResultCard } from '../../components'

type TileProps = {
  questionId: string
}

const Tile = ({ questionId }: TileProps) => {
  const history = useHistory()
  const { loading, error, question, execution, waiting, errorWaiting, run } = useQuestion(questionId)

  if (!question) return null

  return (
    <Box height={300}>
      <Link href={`/questions/${question._id}`}>
        <Box ml={1}>
          <Typography variant="h6">{question.name}</Typography>
        </Box>
      </Link>
      <QuestionResultCard
        execution={execution}
        settings={question.visualSettings}
        driver={question.connection.driver}
      />
    </Box>
  )
}

export default () => {
  const history = useHistory()
  const location = useLocation<{ title?: string }>()
  const match = useRouteMatch<{ dashboard_id: string }>()
  const { dashboard_id } = match.params

  const { loading, error, dashboard } = useDashboard(dashboard_id)

  if (dashboard && (!location.state || !location.state.title)) {
    history.replace(location.pathname, { title: dashboard.name })
  }

  return (
    <>
      {loading && <h1>Loading</h1>}
      {error && <h1>Error</h1>}
      {dashboard && (
        <Box width="100%">
          <Grid
            container
            direction="row"
            justify="space-evenly"
            align-items="center"
            wrap="wrap"
          >
            {dashboard.questions.map((questionId: string) => (
              <Box width="calc((100% - 64px)/2)" mb={6}>
                <Grid key={questionId} item>
                  <Tile questionId={questionId} />
                </Grid>
              </Box>
            ))}
            {dashboard.questions.map((questionId: string) => (
              <Box width="calc((100% - 64px)/2)">
                <Grid key={questionId} item>
                  <Tile questionId={questionId} />
                </Grid>
              </Box>
            ))}
          </Grid>
        </Box>

      )}
    </>
  )
}
