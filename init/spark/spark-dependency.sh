#!/bin/bash
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
spark_dir="$(dirname "${BASH_SOURCE-$0}")"
spark_dir="$(
  cd "${spark_dir}" >/dev/null
  pwd
)"
. "${spark_dir}/../common/common.sh"

# Prepare download packages
if [[ ! -d "${spark_dir}/packages" ]]; then
  mkdir -p "${spark_dir}/packages"
fi

GRAVITINO_SPARK_CONNECTOR_RUNTIME_JAR="https://repo1.maven.org/maven2/org/apache/gravitino/gravitino-spark-connector-runtime-3.4_2.12/0.9.1/gravitino-spark-connector-runtime-3.4_2.12-0.9.1.jar"
GRAVITINO_SPARK_CONNECTOR_RUNTIME_MD5="${GRAVITINO_SPARK_CONNECTOR_RUNTIME_JAR}.md5"
download_and_verify "${GRAVITINO_SPARK_CONNECTOR_RUNTIME_JAR}" "${GRAVITINO_SPARK_CONNECTOR_RUNTIME_MD5}" "${spark_dir}"

MYSQL_CONNECTOR_JAVA_JAR="https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.27/mysql-connector-java-8.0.27.jar"
MYSQL_CONNECTOR_JAVA_MD5="${MYSQL_CONNECTOR_JAVA_JAR}.md5"
download_and_verify "${MYSQL_CONNECTOR_JAVA_JAR}" "${MYSQL_CONNECTOR_JAVA_MD5}" "${spark_dir}"

KYUUBI_SPARK_AUTHZ_SHADED_JAR="https://repo1.maven.org/maven2/org/apache/kyuubi/kyuubi-spark-authz-shaded_2.12/1.9.2/kyuubi-spark-authz-shaded_2.12-1.9.2.jar"
KYUUBI_SPARK_AUTHZ_SHADED_MD5="${KYUUBI_SPARK_AUTHZ_SHADED_JAR}.md5"
download_and_verify "${KYUUBI_SPARK_AUTHZ_SHADED_JAR}" "${KYUUBI_SPARK_AUTHZ_SHADED_MD5}" "${spark_dir}"

ICEBERG_SPARK_RUNTIME_JAR="https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-spark-runtime-3.4_2.12/1.5.2/iceberg-spark-runtime-3.4_2.12-1.5.2.jar"
ICEBERG_SPARK_RUNTIME_MD5="${ICEBERG_SPARK_RUNTIME_JAR}.md5"
download_and_verify "${ICEBERG_SPARK_RUNTIME_JAR}" "${ICEBERG_SPARK_RUNTIME_MD5}" "${spark_dir}"

PAIMON_SPARK_CONNECTOR_JAR="https://repo1.maven.org/maven2/org/apache/paimon/paimon-spark-3.4/0.8.2/paimon-spark-3.4-0.8.2.jar"
PAIMON_SPARK_CONNECTOR_MD5="${PAIMON_SPARK_CONNECTOR_JAR}.md5"
download_and_verify "${PAIMON_SPARK_CONNECTOR_JAR}" "${PAIMON_SPARK_CONNECTOR_MD5}" "${spark_dir}"

PAIMON_CORE_JAR="https://repo1.maven.org/maven2/org/apache/paimon/paimon-core/0.8.2/paimon-core-0.8.2.jar"
PAIMON_CORE_MD5="${PAIMON_CORE_JAR}.md5"
download_and_verify "${PAIMON_CORE_JAR}" "${PAIMON_CORE_MD5}" "${spark_dir}"

HUDI_SPARK_BUNDLE_JAR="https://repo1.maven.org/maven2/org/apache/hudi/hudi-spark3.4-bundle_2.12/1.0.2/hudi-spark3.4-bundle_2.12-1.0.2.jar"
HUDI_SPARK_BUNDLE_MD5="${HUDI_SPARK_BUNDLE_JAR}.md5"
download_and_verify "${HUDI_SPARK_BUNDLE_JAR}" "${HUDI_SPARK_BUNDLE_MD5}" "${spark_dir}"

FILE="${spark_dir}/packages/openlineage-spark_2.12-1.31.0-datastrato-1.jar"
URL="https://raw.githubusercontent.com/datastrato/gravitino-openlineage-plugins/main/spark-plugin/1.31.0-datastrato-1/openlineage-spark_2.12-1.31.0-datastrato-1.jar"

if [ ! -f "$FILE" ]; then
  echo "Downloading openlineage-spark_2.12-1.31.0-datastrato-1.jar to $FILE ..."
  curl -L "$URL" -o "$FILE"
else
  echo "$FILE already exists. Skipping download."
fi