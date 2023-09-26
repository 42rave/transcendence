#!/bin/sh 

export ${NODE_ENV:=production}
echo "Running backend (NODE_ENV: $NODE_ENV)"

npm install

npx prisma generate

exec $@