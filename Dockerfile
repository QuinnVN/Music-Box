FROM node:20.11.0

WORKDIR /

COPY package.json .
COPY yarn.lock .

RUN yarn install --immutable --immutable-cache --check-cache

COPY . .

VOLUME [ "/data" ]

CMD [ "yarn", "start" ]
