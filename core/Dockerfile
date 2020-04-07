FROM node:latest as base

ARG environment=${ENV:-local}

ENV environment=${environment}
ENV TIME_ZONE=Europe/London

WORKDIR /usr/src/app

COPY package.json .
RUN yarn install

ADD . /usr/src/app 
RUN yarn build 

FROM base as build
WORKDIR /usr/src/app
CMD [ "yarn", "start" ]