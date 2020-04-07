import * as React from 'react'
import { Box } from '@material-ui/core'
import { AutoSizer } from 'react-virtualized'
import { PieChart, Tooltip, Pie, PolarGrid } from 'recharts'
import { ResultProps } from '.'

const STROKE_SIZE = 40
const SPACE_SIZE = 10

export default React.memo(({
  data,
  settings
}: ResultProps) => {
  const nameKey = settings['chart.pie'].xAxis
  const dataKeys = settings['chart.pie'].yAxis
  const colors = settings['chart.pie'].colors

  const typedData = data.map((datum: any) => {
    const typedDatum = {
      [nameKey]: datum[nameKey]
    }
    for (const dataKey of dataKeys) {
      typedDatum[dataKey] = parseFloat(datum[dataKey])
    }
    
    return typedDatum
  })
  
  return (
    <Box pr={3} width="calc(100% - 16)" height="calc(100% - 50px)">
      <AutoSizer>
        {({ width, height }) => (
          <PieChart
            width={width}
            height={height}
          >
            <PolarGrid strokeDasharray="5 5" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }}/>
            {dataKeys.map((dataKey: string, idx: number) => (
              <Pie
                key={dataKey}
                data={typedData}
                nameKey={nameKey}
                dataKey={dataKey}
                cx="50%" cy="50%"
                innerRadius={20 + idx * STROKE_SIZE + idx * SPACE_SIZE}
                outerRadius={20 + (idx + 1) * STROKE_SIZE + idx * SPACE_SIZE}
                fill={colors[dataKey]}
              />
            ))}
          </PieChart>
        )}
      </AutoSizer>
    </Box>
  )
})