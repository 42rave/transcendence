#!/bin/sh 

export ${NODE_ENV:=production}
echo "Running frontend (NODE_ENV: $NODE_ENV)"

npm install 

exec $@