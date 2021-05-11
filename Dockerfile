FROM node:14-alpine

ENV NODE_ENV production
LABEL "repository"="https://github.com/RickyRomero/shut-up-amo"
LABEL "homepage"="https://github.com/RickyRomero/shut-up-amo"
LABEL "maintainer"="Ricky Romero <ricky.romero@gmail.com>"

COPY ./.yarnrc.yml ./
COPY ./.yarn ./
COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./src ./src

RUN yarn
RUN mkdir -p /amo/build

ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
