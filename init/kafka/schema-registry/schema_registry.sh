#!/bin/bash
set -e

echo "Waiting for Schema Registry to be ready..."
until curl -s http://schema-registry:8081/subjects > /dev/null; do
  sleep 2
done

echo "Schema Registry is ready. Registering schema..."

curl -s -X POST http://schema-registry:8081/subjects/user-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d @<(jq -n --arg schema "$(jq -c . /tmp/schema-registry/user-schema.json)" \
        '{schemaType:"JSON", schema:$schema}')

echo "Successfully registered schema for subject user-value"