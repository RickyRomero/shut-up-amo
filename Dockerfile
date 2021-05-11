FROM node:14-alpine

LABEL "com.github.actions.name"="Shut Up AMO"
LABEL "com.github.actions.description"="Deploys Shut Up for Firefox"
LABEL "com.github.actions.color"="red"
LABEL "com.github.actions.icon"="package"

LABEL "repository"="https://github.com/RickyRomero/shut-up-amo"
LABEL "homepage"="https://github.com/RickyRomero/shut-up-amo"
LABEL "maintainer"="Ricky Romero <ricky.romero@gmail.com>"

ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
