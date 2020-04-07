export const NOOP = (...args: any) => {}

const DEFAULT_PORT = {
  mongodb: 27017,
  postgresql: 5432,
} as any

export const formatHosts = (metadata: any) =>
  metadata.hosts
    .map((h: any) => `${h.host}:${h.port || DEFAULT_PORT[metadata.scheme]}`)
    .join(', ')

export const constructDSN = (metadata: any) => {
  let dsn = `${metadata.scheme}://`
  if (metadata.username) {
    dsn += metadata.username
  }
  if (metadata.password) {
    dsn += `:********`
  }
  if (metadata.username) {
    dsn += '@'
  }
  dsn += formatHosts(metadata)
  dsn += `/${metadata.endpoint}`
  return dsn
}

export const isScalar = (data: any) => {
  if (data.length > 1 || data.length === 0) {
    return false
  }

  const datum = data[0]
  if (Array.isArray(datum) && datum.length === 1) {
    return true
  }
  if (typeof datum !== 'object') {
    return true
  }
  if (Object.keys(datum).length === 1) {
    return true
  }

  return false
}
