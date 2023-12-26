FROM node:20.10.0

WORKDIR /

COPY package.json .
COPY yarn.lock .

RUN yarn install --immutable --immutable-cache --check-cache

COPY . .

VOLUME [ "/data" ]

EXPOSE 2334

CMD [ "yarn", "start" ]
