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

flink_dir="$(dirname "${BASH_SOURCE-$0}")"
flink_dir="$(
  cd "${flink_dir}" >/dev/null
  pwd
)"
. "${flink_dir}/../common/common.sh"

# Prepare download packages
if [[ ! -d "${flink_dir}/packages" ]]; then
  mkdir -p "${flink_dir}/packages"
fi

GRAVITINO_FLINK_CONNECTOR_RUNTIME_JAR="https://repo1.maven.org/maven2/org/apache/gravitino/gravitino-flink-connector-runtime-1.18_2.12/1.0.0/gravitino-flink-connector-runtime-1.18_2.12-1.0.0.jar"
GRAVITINO_FLINK_CONNECTOR_RUNTIME_MD5="${GRAVITINO_FLINK_CONNECTOR_RUNTIME_JAR}.md5"
download_and_verify "${GRAVITINO_FLINK_CONNECTOR_RUNTIME_JAR}" "${GRAVITINO_FLINK_CONNECTOR_RUNTIME_MD5}" "${flink_dir}"

FLINK_SHADED_HADOOP_UBER_JAR="https://repo1.maven.org/maven2/org/apache/flink/flink-shaded-hadoop-2-uber/2.7.5-10.0/flink-shaded-hadoop-2-uber-2.7.5-10.0.jar"
FLINK_SHADED_HADOOP_UBER_MD5="${FLINK_SHADED_HADOOP_UBER_JAR}.md5"
download_and_verify "${FLINK_SHADED_HADOOP_UBER_JAR}" "${FLINK_SHADED_HADOOP_UBER_MD5}" "${flink_dir}"

FLINK_SQL_CONNECTOR_HIVE_JAR="https://repo1.maven.org/maven2/org/apache/flink/flink-sql-connector-hive-2.3.9_2.12/1.18.1/flink-sql-connector-hive-2.3.9_2.12-1.18.1.jar"
FLINK_SQL_CONNECTOR_HIVE_MD5="${FLINK_SQL_CONNECTOR_HIVE_JAR}.md5"
download_and_verify "${FLINK_SQL_CONNECTOR_HIVE_JAR}" "${FLINK_SQL_CONNECTOR_HIVE_MD5}" "${flink_dir}"

FLINK_S3_FS_PRESTO_JAR="https://repo1.maven.org/maven2/org/apache/flink/flink-s3-fs-presto/1.18.1/flink-s3-fs-presto-1.18.1.jar"
FLINK_S3_FS_PRESTO_MD5="${FLINK_S3_FS_PRESTO_JAR}.md5"
download_and_verify "${FLINK_S3_FS_PRESTO_JAR}" "${FLINK_S3_FS_PRESTO_MD5}" "${flink_dir}"

FLINK_CONNECTOR_JDBC_JAR="https://repo1.maven.org/maven2/org/apache/flink/flink-connector-jdbc/3.2.0-1.18/flink-connector-jdbc-3.2.0-1.18.jar"
FLINK_CONNECTOR_JDBC_MD5="${FLINK_CONNECTOR_JDBC_JAR}.md5"
download_and_verify "${FLINK_CONNECTOR_JDBC_JAR}" "${FLINK_CONNECTOR_JDBC_MD5}" "${flink_dir}"

MYSQL_CONNECTOR_JAVA_JAR="https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.27/mysql-connector-java-8.0.27.jar"
MYSQL_CONNECTOR_JAVA_MD5="${MYSQL_CONNECTOR_JAVA_JAR}.md5"
download_and_verify "${MYSQL_CONNECTOR_JAVA_JAR}" "${MYSQL_CONNECTOR_JAVA_MD5}" "${flink_dir}"

ICEBERG_FLINK_RUNTIME_JAR="https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-flink-runtime/0.12.1/iceberg-flink-runtime-0.12.1.jar"
ICEBERG_FLINK_RUNTIME_MD5="${ICEBERG_FLINK_RUNTIME_JAR}.md5"
download_and_verify "${ICEBERG_FLINK_RUNTIME_JAR}" "${ICEBERG_FLINK_RUNTIME_MD5}" "${flink_dir}"

ICEBERG_AWS_BUNDLE_JAR="https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-aws-bundle/1.8.1/iceberg-aws-bundle-1.8.1.jar"
ICEBERG_AWS_BUNDLE_MD5="${ICEBERG_AWS_BUNDLE_JAR}.md5"
download_and_verify "${ICEBERG_AWS_BUNDLE_JAR}" "${ICEBERG_AWS_BUNDLE_MD5}" "${flink_dir}"

PAIMON_FLINK_CONNECTOR_JAR="https://repo.maven.apache.org/maven2/org/apache/paimon/paimon-flink-1.18/0.8.2/paimon-flink-1.18-0.8.2.jar"
PAIMON_FLINK_CONNECTOR_MD5="${PAIMON_FLINK_CONNECTOR_JAR}.md5"
download_and_verify "${PAIMON_FLINK_CONNECTOR_JAR}" "${PAIMON_FLINK_CONNECTOR_MD5}" "${flink_dir}"

PAIMON_BUNDLE_JAR="https://repo1.maven.org/maven2/org/apache/paimon/paimon-bundle/0.8.2/paimon-bundle-0.8.2.jar"
PAIMON_BUNDLE_MD5="${PAIMON_BUNDLE_JAR}.md5"
download_and_verify "${PAIMON_BUNDLE_JAR}" "${PAIMON_BUNDLE_MD5}" "${flink_dir}"

PAIMON_S3_JAR="https://repo1.maven.org/maven2/org/apache/paimon/paimon-s3/0.8.2/paimon-s3-0.8.2.jar"
PAIMON_S3_MD5="${PAIMON_S3_JAR}.md5"
download_and_verify "${PAIMON_S3_JAR}" "${PAIMON_S3_MD5}" "${flink_dir}"
 
AWS_JAVA_SDK_BUNDLE_JAR="https://repo1.maven.org/maven2/software/amazon/awssdk/bundle/2.33.0/bundle-2.33.0.jar"
AWS_JAVA_SDK_BUNDLE_MD5="${AWS_JAVA_SDK_BUNDLE_JAR}.md5"
download_and_verify "${AWS_JAVA_SDK_BUNDLE_JAR}" "${AWS_JAVA_SDK_BUNDLE_MD5}" "${flink_dir}"


