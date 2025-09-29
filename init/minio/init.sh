#!/bin/sh
set -e

# Config MinIO client
mc alias set localminio http://minio:9000 minioadmin minioadmin

# Create bucket if not exists
mc mb -p localminio/paimon-lakehouse || echo "Bucket exists"
mc mb -p localminio/iceberg-lakehouse || echo "Bucket exists"
mc mb -p localminio/ml-models || echo "Bucket exists"

# Create schema models
mc cp --recursive /dev/null localminio/ml-models/classification_models/ 2>/dev/null || mc mb localminio/ml-models/classification_models/

echo "Buckets created successfully"
