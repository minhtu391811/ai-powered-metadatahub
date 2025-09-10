#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"metalake_demo",
    "comment":"comment",
    "properties":{}
  }' http://gravitino:8090/api/metalakes)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "Metalake metalake_demo create failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_hive)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Hive catalog for experience Gravitino service
  response=$(curl -X POST -H  "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_hive",
    "type":"RELATIONAL",
    "provider":"hive",
    "comment":"comment",
    "properties":{
      "metastore.uris":"thrift://'${HIVE_HOST_IP}':9083"
    }
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "catalog_hive create failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_postgres)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Postgresql catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_postgres",
    "type":"RELATIONAL",
    "provider":"jdbc-postgresql",
    "comment":"comment",
    "properties":{
      "jdbc-url":"jdbc:postgresql://postgresql/db",
      "jdbc-user":"postgres",
      "jdbc-password":"postgres",
      "jdbc-database":"db",
      "jdbc-driver": "org.postgresql.Driver"
    } 
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "catalog_postgres create failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_mysql)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Mysql catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_mysql",
    "type":"RELATIONAL",
    "provider":"jdbc-mysql",
    "comment":"comment",
    "properties":{
      "jdbc-url":"jdbc:mysql://'${MYSQL_HOST_IP}':3306",
      "jdbc-user":"mysql",
      "jdbc-password":"mysql",
      "jdbc-driver":"com.mysql.cj.jdbc.Driver"
    } 
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "catalog_mysql"; then
    true # Placeholder, do nothing
  else
    echo "Catalog catalog_mysql create failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_iceberg)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Iceberg catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_iceberg",
    "type":"RELATIONAL",
    "provider":"lakehouse-iceberg",
    "comment":"comment",
    "properties":{
      "uri":"jdbc:mysql://'${MYSQL_HOST_IP}':3306/db",
      "catalog-backend":"jdbc",
      "warehouse":"hdfs://'${HIVE_HOST_IP}':9000/user/iceberg/warehouse/",
      "jdbc-user":"mysql",
      "jdbc-password":"mysql",
      "jdbc-driver":"com.mysql.cj.jdbc.Driver"
    } 
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "create catalog_iceberg failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_paimon)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Paimon catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_paimon",
    "type":"RELATIONAL",
    "provider":"lakehouse-paimon",
    "comment":"comment",
    "properties":{
      "catalog-backend":"filesystem",
      "warehouse":"hdfs://'${HIVE_HOST_IP}':9000/user/paimon/warehouse/",
      "catalog-backend-name":"paimon"
    }
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "create catalog_paimon failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_kafka)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Hudi catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_kafka",
    "type":"MESSAGING",
    "provider":"kafka",
    "comment":"comment",
    "properties":{
      "bootstrap.servers": "kafka:9092"
    }
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "create catalog_kafka failed"
    exit 1
  fi
fi

# #!/bin/bash
# set -e

# OAUTH_URL="http://127.0.0.1:8177/oauth2/token"
# CLIENT_ID="test"
# CLIENT_SECRET="test"
# GRAVITINO_URL="http://localhost:8090"
# METALAKE_NAME="metalake_demo"

# TOKEN=$(curl -s -X POST "$OAUTH_URL" \
#   -H "Content-Type: application/x-www-form-urlencoded" \
#   -d "grant_type=client_credentials" \
#   -d "client_id=$CLIENT_ID" \
#   -d "client_secret=$CLIENT_SECRET" \
#   | jq -r '.access_token')

# if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
#   echo "Failed to get token from OAUTH"
#   exit 1
# fi

# echo "Got access token"

# ensure_metalake() {
#   response=$(curl -s -H "Authorization: Bearer $TOKEN" "$GRAVITINO_URL/api/metalakes/$METALAKE_NAME")
#   if echo "$response" | grep -q "\"code\":0"; then
#     echo "Metalake $METALAKE_NAME already exists"
#   else
#     response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
#       -H "Accept: application/vnd.gravitino.v1+json" \
#       -H "Content-Type: application/json" \
#       -d "{
#         \"name\":\"$METALAKE_NAME\",
#         \"comment\":\"comment\",
#         \"properties\":{}
#       }" "$GRAVITINO_URL/api/metalakes")
#     if echo "$response" | grep -q "\"code\":0"; then
#       echo "Metalake $METALAKE_NAME created successfully"
#     else
#       echo "Metalake $METALAKE_NAME create failed"
#       echo "$response"
#       exit 1
#     fi
#   fi
# }

# ensure_catalog() {
#   local catalog_name=$1
#   local payload=$2
#   response=$(curl -s -H "Authorization: Bearer $TOKEN" "$GRAVITINO_URL/api/metalakes/$METALAKE_NAME/catalogs/$catalog_name")
#   if echo "$response" | grep -q "\"code\":0"; then
#     echo "Catalog $catalog_name already exists"
#   else
#     response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" \
#       -H "Accept: application/vnd.gravitino.v1+json" \
#       -H "Content-Type: application/json" \
#       -d "$payload" \
#       "$GRAVITINO_URL/api/metalakes/$METALAKE_NAME/catalogs")
#     if echo "$response" | grep -q "\"code\":0"; then
#       echo "Catalog $catalog_name created successfully"
#     else
#       echo "Catalog $catalog_name create failed"
#       echo "$response"
#       exit 1
#     fi
#   fi
# }

# ensure_metalake

# ensure_catalog "catalog_hive" '{
#   "name":"catalog_hive",
#   "type":"RELATIONAL",
#   "provider":"hive",
#   "comment":"comment",
#   "properties":{"metastore.uris":"thrift://'"${HIVE_HOST_IP}"':9083"}
# }'

# ensure_catalog "catalog_postgres" '{
#   "name":"catalog_postgres",
#   "type":"RELATIONAL",
#   "provider":"jdbc-postgresql",
#   "comment":"comment",
#   "properties":{
#     "jdbc-url":"jdbc:postgresql://postgresql/db",
#     "jdbc-user":"postgres",
#     "jdbc-password":"postgres",
#     "jdbc-database":"db",
#     "jdbc-driver":"org.postgresql.Driver"
#   }
# }'

# ensure_catalog "catalog_mysql" '{
#   "name":"catalog_mysql",
#   "type":"RELATIONAL",
#   "provider":"jdbc-mysql",
#   "comment":"comment",
#   "properties":{
#     "jdbc-url":"jdbc:mysql://'"${MYSQL_HOST_IP}"':3306",
#     "jdbc-user":"mysql",
#     "jdbc-password":"mysql",
#     "jdbc-driver":"com.mysql.cj.jdbc.Driver"
#   }
# }'

# ensure_catalog "catalog_iceberg" '{
#   "name":"catalog_iceberg",
#   "type":"RELATIONAL",
#   "provider":"lakehouse-iceberg",
#   "comment":"comment",
#   "properties":{
#     "uri":"jdbc:mysql://'"${MYSQL_HOST_IP}"':3306/db",
#     "catalog-backend":"jdbc",
#     "warehouse":"hdfs://'"${HIVE_HOST_IP}"':9000/user/iceberg/warehouse/",
#     "jdbc-user":"mysql",
#     "jdbc-password":"mysql",
#     "jdbc-driver":"com.mysql.cj.jdbc.Driver"
#   }
# }'

# ensure_catalog "catalog_paimon" '{
#   "name":"catalog_paimon",
#   "type":"RELATIONAL",
#   "provider":"lakehouse-paimon",
#   "comment":"comment",
#   "properties":{
#     "catalog-backend":"filesystem",
#     "warehouse":"hdfs://'"${HIVE_HOST_IP}"':9000/user/paimon/warehouse/",
#     "catalog-backend-name":"paimon"
#   }
# }'

# ensure_catalog "catalog_kafka" '{
#   "name":"catalog_kafka",
#   "type":"MESSAGING",
#   "provider":"kafka",
#   "comment":"comment",
#   "properties":{"bootstrap.servers":"kafka:9092"}
# }'