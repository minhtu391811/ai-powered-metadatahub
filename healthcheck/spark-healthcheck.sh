#!/bin/bash

set -ex

max_attempts=3
attempt=0
success=false

while [ $attempt -lt $max_attempts ]; do
  response=$(curl -X GET -H "Content-Type: application/json" http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  
  if echo "$response" | grep -q "\"code\":0"; then
    success=true
    break
  else
    echo "Attempt $((attempt + 1)) failed..."
    sleep 1
  fi

  ((attempt++))
done

if [ "$success" = true ]; then
  exit 0
else
  exit 1
fi
