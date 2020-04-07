import * as React from 'react'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { Box } from '@material-ui/core'
import { QuestionResultCard } from '../../components'
import { useQuestion } from './hooks'
import Toolbar from './Toolbar'
import QueryEditor from './QueryEditor'
import VisualSettingsForm from './VisualSettingsForm'

export default () => {
  const history = useHistory()
  const location = useLocation<{ title?: string }>()
  const match = useRouteMatch< { question_id: string }>()
  const { question_id } = match.params

  const { loading, error, question, execution, waiting, save, run, updateSettings } = useQuestion(question_id)
  const [modified, setModified] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [settings, setSettings] = React.useState()
  const [visualType, setVisualType] = React.useState()
  const [isVisualSettingsFormOpen, setVisualSettingsFormOpen] = React.useState(false)

  React.useEffect(() => {
    if (question && !query) {
      setQuery(question.query)
    }
    if (question && !settings) {
      setSettings(question.visualSettings)
      setVisualType(question.visualSettings.type)
    }
    if (question && question.query === query) {
      setModified(false)
    }
  }, [question, query, settings])

  if (question && (!location.state || !location.state.title)) {
    history.replace(location.pathname, { title: question.name })
  }

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
    if (!modified) {
      setModified(true)
    }
  }

  const handleVisualTypeChange = (type: string, settings: any) => {
    setVisualType(type)
    setSettings(settings)
    setVisualSettingsFormOpen(true)
  }

  const updateQuestionSettings = async (updatedSettings: any) => {
    const newSettings = {
      ...updatedSettings
    }
    newSettings.type = visualType
    setSettings(newSettings)
    updateSettings(newSettings)
    setVisualSettingsFormOpen(false)
  }

  const saveQuery = () => save(query)
  const runQuery = () => run(query)

  return (
    <>
      {loading && <h1>Loading</h1>}
      {error && <h1>Error</h1>}
      {question && (
        <Box m={1}>
          <Toolbar
            title={question.name}
            subtitle={question.connection.name}
            modified={modified}
            waiting={waiting}
            runQuery={runQuery}
            saveQuery={saveQuery}
          />
          <Box mt={1} height="calc((100vh - 160px) * 1/3)">
            <QueryEditor
              query={query}
              driver={question.connection.driver}
              onChange={handleQueryChange}
            />
          </Box>
          {execution && (
            <Box mt={1} height="calc((100vh - 160px) * 2/3)">
              <QuestionResultCard
                execution={execution}
                driver={question.connection.driver}
                settings={settings}
                requestVisualTypeChange={handleVisualTypeChange}
                openVisualSettingsForm={() => {
                  setVisualType(settings.type)
                  setVisualSettingsFormOpen(true)
                }}
                editable
                onResultUpdate={(result: any) => setSettings({
                  ...settings,
                  columns: result.columns
                })}
              />
            </Box>
          )}
          <VisualSettingsForm
            open={isVisualSettingsFormOpen}
            onClose={() => setVisualSettingsFormOpen(false)}
            onSubmit={updateQuestionSettings}
            settings={settings}
            type={visualType}
          />
        </Box>
      )}
    </>
  )
}