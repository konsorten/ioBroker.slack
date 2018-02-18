FROM node:6

RUN mkdir -p /opt/iobroker/
WORKDIR /opt/iobroker/
RUN npm install iobroker --unsafe-perm && npm install iobroker.javascript

EXPOSE 8081 8082 8083 8084
RUN iobroker update && iobroker upgrade --self

RUN mkdir VOLUME /opt/ioBroker.slack
VOLUME /opt/ioBroker.slack/

ADD . /opt/iobroker/node_modules/iobroker.slack/

CMD  iobroker add admin && iobroker add javascript && iobroker start && iobroker start admin.0 && tail -f /dev/null