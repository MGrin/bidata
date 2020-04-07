const DEFAULT_PORT = {
  'mongodb': 27017,
  'postgresql': 5432,
} as any

export const formatHosts = (metadata: any) => metadata
  .hosts
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

export const validate = (name: string, driver: string, dsn: string) => {
  if (!name) {
    return false
  }
  if (!driver) {
    return false
  }

  if (!dsn) {
    return false
  }

  return true
}