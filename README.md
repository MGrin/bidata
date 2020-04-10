# BIData
Platform for **data discovery**. Best for startups, good for enterprises, interesting for researchers, **nice to people**.

## Currently under development, not ready for production use

# Development
You can easily start BIData locally. For a moment it's composed from 2 components, but this will change in the future

## Prerequisites
* make
* Docker
* docker-compose
* node.js
* yarn

## API
```bash
make install
make dev
```

This will bootstrap the backend core services with a list of usefull containers for local work:
* Core API, available at `localhost:9000`
* Auth API, available at `localhost:9001`
* MongoDB container as a database for BIData backend
* PostgreSQL container as a clean database to test BIData features against Posgres
* `mongo-express` container serving a frontend for MongoDB database. Accessible at port `27080`
* `dpage/pgadmin4` containere serving a frontend for Postgres database. Accessible at port `54080`, credentials `admin@bidata.local:password`

## Frontend
```bash
cd ui
yarn
mv .env.local .env
yarn start
```

This will start a frontend, based on `create-react-app`

For more information, please see packages' readme
