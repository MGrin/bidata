import * as React from 'react'

export const usePagination = () => {
  const rowsPerPageOptions = [10, 25, 50]
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, rowsPerPageOptions[0]))
    setPage(0)
  }

  return {
    page,
    rowsPerPage,
    rowsPerPageOptions,
    handleChangePage,
    handleChangeRowsPerPage,
  }
}
