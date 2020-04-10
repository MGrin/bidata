import * as React from 'react'
import { TablePagination, Box, Paper } from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useResult, useQuestionSettings } from '../../hooks'
import Footer from './Footer'
import Result from './Result'
import { usePagination } from '../../hooks'
import { NOOP } from '../../utils'

type Props = {
  execution: any
  settings: any
  driver: string
  editable?: boolean
  requestVisualTypeChange?: (type: string, settings: any) => void
  openVisualSettingsForm?: () => void
  onResultUpdate?: (result: any) => void
}

export default React.memo(
  ({
    execution: initialExecution,
    settings: predefinedSettings,
    driver,
    editable,
    requestVisualTypeChange,
    openVisualSettingsForm,
    onResultUpdate,
  }: Props) => {
    const theme = useTheme()
    const isXS = useMediaQuery(theme.breakpoints.down('sm'))

    const { loading, error, result, execution, setExecution } = useResult(
      onResultUpdate || NOOP
    )

    const {
      page,
      rowsPerPage,
      rowsPerPageOptions,
      handleChangePage,
      handleChangeRowsPerPage,
    } = usePagination()

    React.useEffect(() => {
      if (
        initialExecution &&
        (!execution || initialExecution._id !== execution._id)
      ) {
        setExecution(initialExecution)
      }
    }, [initialExecution, setExecution, execution])

    const settings = useQuestionSettings(predefinedSettings, result)

    return (
      <>
        {loading && <span>Loading</span>}
        {error && <span>Error</span>}
        {result && (
          <Box p={1} height="100%">
            <Paper style={{ height: '100%' }}>
              <Result
                data={result.data}
                settings={settings}
                page={page}
                rowsPerPage={rowsPerPage}
              />
              <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component={({ children, ...props }) => (
                  <Footer
                    execution={execution}
                    settings={settings}
                    driver={driver}
                    editable={editable || false}
                    requestVisualTypeChange={requestVisualTypeChange || NOOP}
                    openVisualSettingsForm={openVisualSettingsForm || NOOP}
                    {...props}
                  >
                    {children}
                  </Footer>
                )}
                count={result.data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                labelRowsPerPage={isXS ? null : undefined}
                labelDisplayedRows={isXS ? ({ page }) => (page + 1) : undefined}
              />
            </Paper>
          </Box>
        )}
      </>
    )
  }
)
