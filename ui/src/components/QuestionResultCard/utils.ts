export const isScalar = (data: any) => {
  if (data.length > 1 || data.length === 0) {
    return false
  }

  const datum = data[0]
  if (Array.isArray(datum) && datum.length === 1) {
    return true
  }
  if (typeof(datum) !== 'object') {
    return true
  }
  if (Object.keys(datum).length === 1) {
    return true
  }

  return false
}
