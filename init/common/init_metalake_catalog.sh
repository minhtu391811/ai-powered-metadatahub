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
  # Create metalake for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"metalake_demo",
    "comment":"metalake for demo",
    "properties":{}
  }' http://gravitino:8090/api/metalakes)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "Metalake metalake_demo create failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_model)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create metalake for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"metalake_model",
    "comment":"metalake for ml models",
    "properties":{}
  }' http://gravitino:8090/api/metalakes)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "Metalake metalake_model create failed"
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
    "comment":"catalog for hive metastore",
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
    "comment":"catalog for postgresql",
    "properties":{
      "jdbc-url":"jdbc:postgresql://postgresql/db",
      "jdbc-user":"postgres",
      "jdbc-password":"password",
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
    "comment":"catalog for mysql",
    "properties":{
      "jdbc-url":"jdbc:mysql://'${MYSQL_HOST_IP}':3306",
      "jdbc-user":"mysql",
      "jdbc-password":"password",
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
    "comment":"catalog for iceberg lakehouse",
    "properties":{
      "uri":"jdbc:mysql://'${MYSQL_HOST_IP}':3306/db",
      "catalog-backend":"jdbc",
      "warehouse":"hdfs://'${HIVE_HOST_IP}':9000/user/iceberg/warehouse/",
      "jdbc-user":"mysql",
      "jdbc-password":"password",
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
    "comment":"catalog for paimon lakehouse",
    "properties":{
      "catalog-backend":"filesystem",
      "warehouse":"hdfs://'${HIVE_HOST_IP}':9000/user/hive/warehouse/"
    }
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "create catalog_paimon failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_hudi)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Hudi catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_hudi",
    "type":"RELATIONAL",
    "provider":"lakehouse-hudi",
    "comment":"catalog for hudi lakehouse",
    "properties":{
      "uri":"thrift://'${HIVE_HOST_IP}':9083",
      "catalog-backend":"hms"
    } 
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "create catalog_hudi failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_kafka)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Kafka catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_kafka",
    "type":"MESSAGING",
    "provider":"kafka",
    "comment":"catalog for kafka",
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

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_iceberg_s3)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Minio Iceberg catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_iceberg_s3",
    "type":"RELATIONAL",
    "provider":"lakehouse-iceberg",
    "comment":"catalog for iceberg lakehouse with s3",
    "properties":{
      "uri":"jdbc:mysql://'${MYSQL_HOST_IP}':3306/db",
      "catalog-backend":"jdbc",
      "warehouse":"s3://iceberg-lakehouse/",
      "jdbc-user":"mysql",
      "jdbc-password":"password",
      "jdbc-driver":"com.mysql.cj.jdbc.Driver",
      "io-impl":"org.apache.iceberg.aws.s3.S3FileIO",
      "s3-access-key-id":"minioadmin",
      "s3-secret-access-key":"minioadmin",
      "s3-endpoint":"http://minio:9000",
      "s3-region":"us-east-1",
      "s3-path-style-access":"true"
    } 
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "create catalog_iceberg_s3 failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_demo/catalogs/catalog_paimon_s3)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Minio Paimon catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_paimon_s3",
    "type":"RELATIONAL",
    "provider":"lakehouse-paimon",
    "comment":"catalog for paimon lakehouse with s3",
    "properties":{
      "catalog-backend":"filesystem",
      "warehouse":"s3://paimon-lakehouse/",
      "catalog-backend-name":"paimon",
      "s3-access-key-id":"minioadmin",
      "s3-secret-access-key":"minioadmin",
      "s3-endpoint":"http://minio:9000",
      "gravitino.bypass.s3.path.style.access":"true",
      "flink.bypass.s3.access-key":"minioadmin",
      "flink.bypass.s3.secret-key":"minioadmin",
      "flink.bypass.s3.endpoint":"http://minio:9000",
      "flink.bypass.s3.path.style.access":"true"
    }
  }' http://gravitino:8090/api/metalakes/metalake_demo/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "create catalog_paimon failed"
    exit 1
  fi
fi

response=$(curl http://gravitino:8090/api/metalakes/metalake_model/catalogs/catalog_model)
if echo "$response" | grep -q "\"code\":0"; then
  true
else
  # Create Model catalog for experience Gravitino service
  response=$(curl -X POST -H "Accept: application/vnd.gravitino.v1+json" \
  -H "Content-Type: application/json" -d '{
    "name":"catalog_model",
    "type":"MODEL",
    "comment":"catalog for ml models",
    "properties":{
      "framework": "tensorflow",
      "algorithm": "dense_nn",
      "task_type": "classification",
      "dataset": "mnist_subset"
    }
  }' http://gravitino:8090/api/metalakes/metalake_model/catalogs)
  if echo "$response" | grep -q "\"code\":0"; then
    true # Placeholder, do nothing
  else
    echo "create catalog_model failed"
    exit 1
  fi
fi