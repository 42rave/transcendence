FROM node:20.5.1

WORKDIR /app

COPY . .

RUN npm install

RUN npx prisma generate

CMD ["npm", "run", "start:migrate:dev"]

