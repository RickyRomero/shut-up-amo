FROM node:14-alpine

LABEL "repository"="https://github.com/RickyRomero/shut-up-amo"
LABEL "homepage"="https://github.com/RickyRomero/shut-up-amo"
LABEL "maintainer"="Ricky Romero <ricky.romero@gmail.com>"

RUN yarn
RUN sudo mkdir -p /amo/build /amo/extension

ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
