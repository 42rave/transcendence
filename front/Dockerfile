FROM node:20.5.1

WORKDIR /app

COPY . .

RUN npm install

ENTRYPOINT [ "./entrypoint.sh" ]

CMD ["npm", "run", "dev"]