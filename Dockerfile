FROM node:18.13.0

WORKDIR /

COPY package*.json .

RUN npm ci

COPY . .

CMD [ "npm", "run", "start" ]
