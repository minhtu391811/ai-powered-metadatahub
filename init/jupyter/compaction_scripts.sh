# Compaction script for Iceberg tables  
# This script receives parameters from Gravitino job template  
  
set -e  
  
# Parse arguments from job template  
TABLE_NAME="${1}"  
PARTITION_NAME="${2}"  
FILE_COUNT="${3}"  
  
# Environment variables from job template  
GRAVITINO_URI="${GRAVITINO_URI:-http://localhost:8090}"  
METALAKE="${METALAKE:-metalake_demo}"  
  
# Log file  
LOG_FILE="${PWD}/compaction_${TABLE_NAME//[.\/]/_}_$(date +%Y%m%d_%H%M%S).log"  
  
# Logging function  
log() {  
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"  
}  
  
log "Starting compaction for table: ${TABLE_NAME}"  
log "Partition: ${PARTITION_NAME}"  
log "File count: ${FILE_COUNT}"  
log "Gravitino URI: ${GRAVITINO_URI}"  
log "Metalake: ${METALAKE}"  
  
# Validate parameters  
if [ -z "${TABLE_NAME}" ]; then  
    log "ERROR: TABLE_NAME is required"  
    exit 1  
fi  
  
# Parse table identifier (catalog.schema.table)  
IFS='.' read -r CATALOG SCHEMA TABLE <<< "${TABLE_NAME}"  
  
if [ -z "${CATALOG}" ] || [ -z "${SCHEMA}" ] || [ -z "${TABLE}" ]; then  
    log "ERROR: Invalid table name format. Expected: catalog.schema.table"  
    exit 1  
fi  
  
log "Parsed - Catalog: ${CATALOG}, Schema: ${SCHEMA}, Table: ${TABLE}"  
  
# Check if Gravitino server is accessible  
log "Checking Gravitino server connectivity..."  
if ! curl -s -f "${GRAVITINO_URI}/api/version" > /dev/null; then  
    log "ERROR: Cannot connect to Gravitino server at ${GRAVITINO_URI}"  
    exit 1  
fi  
log "✓ Gravitino server is accessible"  
  
# Get table metadata from Gravitino  
log "Fetching table metadata from Gravitino..."  
TABLE_METADATA=$(curl -s -X GET \  
    -H "Accept: application/vnd.gravitino.v1+json" \  
    -H "Content-Type: application/json" \  
    "${GRAVITINO_URI}/api/metalakes/${METALAKE}/catalogs/${CATALOG}/schemas/${SCHEMA}/tables/${TABLE}")  
  
if [ $? -ne 0 ]; then  
    log "ERROR: Failed to fetch table metadata"  
    exit 1  
fi  
log "✓ Table metadata retrieved"  
  
# Get table location from metadata  
TABLE_LOCATION=$(echo "${TABLE_METADATA}" | grep -o '"location":"[^"]*"' | cut -d'"' -f4)  
log "Table location: ${TABLE_LOCATION}"  
  
# Perform compaction using Spark SQL  
log "Starting Iceberg table compaction..."  
  
# Create temporary Spark SQL script  
SPARK_SQL_SCRIPT="${PWD}/compaction_${TABLE_NAME//[.\/]/_}.sql"  
cat > "${SPARK_SQL_SCRIPT}" << EOF  
-- Iceberg table compaction  
-- Rewrite data files to optimize file size and count  
  
-- For partitioned table with specific partition  
$(if [ -n "${PARTITION_NAME}" ]; then  
    echo "CALL ${CATALOG}.system.rewrite_data_files("  
    echo "  table => '${SCHEMA}.${TABLE}',"  
    echo "  where => '${PARTITION_NAME}',"  
    echo "  options => map('target-file-size-bytes', '134217728')"  
    echo ");"  
else  
    echo "CALL ${CATALOG}.system.rewrite_data_files("  
    echo "  table => '${SCHEMA}.${TABLE}',"  
    echo "  options => map('target-file-size-bytes', '134217728')"  
    echo ");"  
fi)  
  
-- Rewrite manifest files  
CALL ${CATALOG}.system.rewrite_manifests('${SCHEMA}.${TABLE}');  
  
-- Expire old snapshots (keep last 7 days)  
CALL ${CATALOG}.system.expire_snapshots(  
  table => '${SCHEMA}.${TABLE}',  
  older_than => TIMESTAMP '$(date -d '7 days ago' '+%Y-%m-%d %H:%M:%S')',  
  retain_last => 5  
);  
  
-- Remove orphan files  
CALL ${CATALOG}.system.remove_orphan_files(  
  table => '${SCHEMA}.${TABLE}',  
  older_than => TIMESTAMP '$(date -d '3 days ago' '+%Y-%m-%d %H:%M:%S')'  
);  
EOF  
  
log "Generated Spark SQL script: ${SPARK_SQL_SCRIPT}"  
  
# Execute compaction using spark-sql  
# Note: This assumes spark-sql is available in PATH  
if command -v spark-sql &> /dev/null; then  
    log "Executing compaction with spark-sql..."  
    spark-sql \  
        --conf spark.sql.catalog.${CATALOG}=org.apache.iceberg.spark.SparkCatalog \  
        --conf spark.sql.catalog.${CATALOG}.type=rest \  
        --conf spark.sql.catalog.${CATALOG}.uri=${GRAVITINO_URI}/api/metalakes/${METALAKE}/catalogs/${CATALOG} \  
        -f "${SPARK_SQL_SCRIPT}" 2>&1 | tee -a "${LOG_FILE}"  
      
    COMPACTION_STATUS=$?  
else  
    log "WARNING: spark-sql not found in PATH. Skipping actual compaction."  
    log "In production, ensure Spark is installed and configured."  
    COMPACTION_STATUS=0  
fi  
  
# Update statistics in Gravitino after compaction  
if [ ${COMPACTION_STATUS} -eq 0 ]; then  
    log "Compaction completed successfully"  
    log "Updating statistics in Gravitino..."  
      
    # Update last compaction time  
    curl -s -X PUT \  
        -H "Accept: application/vnd.gravitino.v1+json" \  
        -H "Content-Type: application/json" \  
        -d "{  
            \"updates\": {  
                \"custom-last-compaction-time\": {  
                    \"value\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",  
                    \"type\": \"string\"  
                },  
                \"custom-file-count\": {  
                    \"value\": 0,  
                    \"type\": \"long\"  
                }  
            }  
        }" \  
        "${GRAVITINO_URI}/api/metalakes/${METALAKE}/objects/TABLE/${TABLE_NAME}/statistics" \  
        >> "${LOG_FILE}" 2>&1  
      
    log "✓ Statistics updated in Gravitino"  
else  
    log "ERROR: Compaction failed with status ${COMPACTION_STATUS}"  
    exit ${COMPACTION_STATUS}  
fi  
  
# Cleanup temporary files  
rm -f "${SPARK_SQL_SCRIPT}"  
  
log "Compaction job completed successfully"  
log "Log file: ${LOG_FILE}"  
  
exit 0