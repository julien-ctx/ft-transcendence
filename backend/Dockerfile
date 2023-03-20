FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

COPY entry.sh /

RUN chmod +x /entry.sh

EXPOSE 4545
CMD [ "/entry.sh" ]
