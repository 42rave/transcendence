#!/bin/sh

export ${NODE_ENV:=production}

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

if [ $NODE_ENV = "production" ]; then
  echo -e ${GREEN}"RUNNING NGINX (PRODUCTION MODE)"${NC}
  exec /docker-entrypoint.sh nginx -g 'daemon off;'
else
  echo -e ${YELLOW}"[WARNING]: ${RED}RUNNING NGINX IN DEVELOPMENT MODE, NGINX WILL NOT START."${NC}
  exit 0
fi
