FROM node:20.5.1 as build_and_migrate

WORKDIR /app

ARG PORT=3000
ARG JWT_SECRET="SUp3r_D3f4u1t_53cr3t"
ARG WEB_APP_URL="http://localhost"

COPY . .

RUN npm install
RUN npx prisma generate
RUN npm run build


FROM build_and_migrate as dev

ENV NODE_ENV=developement

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["npm", "run", "start:migrate:dev"]


FROM node:20.5.1 as prod

RUN mkdir -p /app/nod_modules

WORKDIR /app

COPY --from=build_and_migrate /app/dist /app/dist
COPY --from=build_and_migrate /app/package.json /app/package.json
COPY --from=build_and_migrate /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build_and_migrate /app/node_modules/prisma /app/node_modules/prisma
COPY --from=build_and_migrate /app/prisma /app/prisma

ENV NODE_ENV=production

RUN npm install --omit=dev

ENTRYPOINT [ "npm", "run", "start:migrate:prod" ]