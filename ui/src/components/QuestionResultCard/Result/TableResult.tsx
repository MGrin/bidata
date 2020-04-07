import * as React from 'react'
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'
import Value from '../Value'
import { ResultProps } from '.'

export type TableResultsProps = {
  page: number,
  rowsPerPage: number,
}

type Props = TableResultsProps & ResultProps

export default React.memo(({
  data,
  settings,
  page,
  rowsPerPage,
}: Props) => (
  <TableContainer className="scrollable" style={{ height: 'calc(100% - 50px)' }}>
    <Table stickyHeader>
      {settings.type === 'columns' && (
        <TableHead>
          <TableRow>
            {settings.columns.map((column: string) => (
              <TableCell key={column}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
      )}
      <TableBody>
        {data
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row: any, idx: number) => (
            <TableRow key={`row_${idx}`} hover>
              {settings.type === 'columns' && settings.columns && (
                <>
                  {settings.columns.map((column: string) => (
                    <TableCell key={`row_${idx}_column_${column}`} style={{ minWidth: 200 }}>
                      <Value>{row[column]}</Value>
                    </TableCell>
                  ))}
                </>
              )}
              {settings.type === 'documents' && (
                <TableCell>
                  <Value collapsed={1} named>{row}</Value>
                </TableCell>
              )}
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  </TableContainer>
))