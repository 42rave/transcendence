#!/bin/sh 

npm install

npx prisma generate

exec $@