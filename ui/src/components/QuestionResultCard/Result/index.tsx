import * as React from 'react'

import TableResult from './TableResult'
import ScalarResult from './ScalarResult'
import LineChartResult from './LineChartResult'
import BarChartResult from './BarChartResult'
import PieChartResult from './PieChartResult'
import BubbleChartResult from './BubbleChartResult'

type MinimalResultProps = {
  data: any,
  settings: any,
}
export type ResultProps = MinimalResultProps & any

export default React.memo(({
  data,
  settings,
  ...tableProps
}: ResultProps) => {
  switch (settings.type) {
    case 'scalar': {
      return (
        <ScalarResult
          data={data}
          settings={settings}
        />
      )
    }

    case 'chart.line': {
       return (
        <LineChartResult
          data={data}
          settings={settings}
        />
      )
    }
  
    case 'chart.bar': {
      return (
        <BarChartResult
          data={data}
          settings={settings}
        />
      )
    }
  
    case 'chart.pie': {
      return (
        <PieChartResult
          data={data}
          settings={settings}
        />
      )
    }
  
    case 'chart.bubble': {
      return (
        <BubbleChartResult
          data={data}
          settings={settings}
        />
      )
    }

    default: {
      return (
        <TableResult
          data={data}
          settings={settings}
          {...tableProps}
        />
      )
    }
  
  }
})