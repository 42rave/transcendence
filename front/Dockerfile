FROM node:20.5.1 as build

WORKDIR /app

ARG API_URL="http://localhost/api"
ARG WS_BASE_URL="ws://localhost/"

RUN echo "API_URL=${API_URL}"
RUN echo "WS_BASE_URL=${WS_BASE_URL}"

COPY . .

RUN npm install
RUN npm run build


FROM build as dev

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["npm", "run", "dev"]


FROM node:20.5.1 as prod

WORKDIR /app

COPY --from=build /app/.output /app/.output
COPY --from=build /app/package.json /app/package.json

ENV NODE_ENV=production

ENTRYPOINT [ "node", ".output/server/index.mjs" ]