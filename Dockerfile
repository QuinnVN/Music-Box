FROM node:18.13.0

WORKDIR /

COPY package*.json .

RUN npm ci

COPY . .

EXPOSE 2334

CMD [ "npm", "run", "start" ]
