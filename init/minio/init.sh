#!/bin/sh
set -e

# Config MinIO client
mc alias set localminio http://minio:9000 minioadmin minioadmin

# Create bucket if not exists
mc mb -p localminio/lakehouse-demo || echo "Bucket exists"

# Create warehouses if not exists
WAREHOUSES="iceberg-lakehouse paimon-lakehouse"

for w in $WAREHOUSES; do
  mc cp --recursive /dev/null localminio/lakehouse-demo/$w/ 2>/dev/null || mc mb localminio/lakehouse-demo/$w
done

echo "Buckets and warehouses created successfully"
