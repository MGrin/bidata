const PRIVATE_RSA_KEY = process.env.PRIVATE_RSA_KEY
const PUBLIC_RSA_KEY = process.env.PRIVATE_RSA_KEY
const BIDATA_MONGO_CORE_URL = process.env.BIDATA_MONGO_CORE_URL
const BIDATA_MONGO_ANALYTICS_URL = process.env.BIDATA_MONGO_ANALYTICS_URL
const BIDATA_MONGO_AUTH_URL = process.env.BIDATA_MONGO_AUTH_URL

module.exports = {
  apps : [{
    name: 'BIData-core',
    script: 'core/dist/index.js',
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '600M',
    env: {
        NODE_ENV: 'production',
        ENV: 'production',
        PORT: 9000,
        HOST: 'localhost:9000',
        MONGO_URL: BIDATA_MONGO_CORE_URL,
        ANALYTICS_MONGO_URL: BIDATA_MONGO_ANALYTICS_URL,
        AUTH_HOST: 'localhost:9001',
        PUBLIC_RSA_KEY: PUBLIC_RSA_KEY,
        PRIVATE_RSA_KEY: PRIVATE_RSA_KEY
    },
  }, {
    name: 'BIData-auth',
    script: 'auth/dist/index.js',
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '600M',
    env: {
        NODE_ENV: 'production',
        ENV: 'production',
        PORT: 9001,
        HOST: 'localhost:9001',
        MONGO_URL: BIDATA_MONGO_AUTH_URL,
        PUBLIC_RSA_KEY: PUBLIC_RSA_KEY,
        PRIVATE_RSA_KEY: PRIVATE_RSA_KEY
    },
  }],
};