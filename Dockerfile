FROM alpine
RUN apk add --update nodejs npm

WORKDIR /usr/src/app

COPY package*.json /usr/src/app

RUN npm install

COPY . /usr/src/app

EXPOSE 5000
CMD [ "node" , "index.js" ]