import * as React from 'react'
import { Box } from '@material-ui/core'
import { AutoSizer } from 'react-virtualized'
import { LineChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Area } from 'recharts'
import { ResultProps } from '.'

export default ({
  data,
  settings
}: ResultProps) => {
  const ChartComponent = settings['chart.line'].asArea ? AreaChart : LineChart
  const CurveComponent = settings['chart.line'].asArea ? Area : Line
  
  return (
    <Box pr={3} width="calc(100% - 16)" height="calc(100% - 50px)">
      <AutoSizer>
        {({ width, height }) => (
          <ChartComponent
            width={width}
            height={height}
            data={data}
          >
            {settings['chart.line'].asArea && (
              <defs>
                {settings['chart.line'].yAxis.map((yAxis: string) => (
                  <linearGradient id={`color_${yAxis}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={settings['chart.line'].colors[yAxis]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={settings['chart.line'].colors[yAxis]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
            )}
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={settings['chart.line'].xAxis} />
            <YAxis />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {settings['chart.line'].yAxis.map((yAxis: string) => (
              // @ts-ignore
              <CurveComponent
                key={yAxis}
                type="monotone"
                dataKey={yAxis}
                stroke={settings['chart.line'].colors[yAxis]}
                fillOpacity={1}
                fill={`url(#color_${yAxis})`}
              />
            ))}
          </ChartComponent>
        )}
      </AutoSizer>
    </Box>
  )
}