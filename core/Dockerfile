FROM node:latest as base

ENV TIME_ZONE=Europe/London

WORKDIR /usr/src/app

COPY package.json .
RUN yarn install

ADD . /usr/src/app 
RUN yarn build 

FROM base as prod
WORKDIR /usr/src/app
CMD [ "yarn", "start" ]