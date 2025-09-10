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

GRAVITINO_FLINK_CONNECTOR_RUNTIME_JAR="https://repo1.maven.org/maven2/org/apache/gravitino/gravitino-flink-connector-runtime-1.18_2.12/0.9.1/gravitino-flink-connector-runtime-1.18_2.12-0.9.1.jar"
GRAVITINO_FLINK_CONNECTOR_RUNTIME_MD5="${GRAVITINO_FLINK_CONNECTOR_RUNTIME_JAR}.md5"
download_and_verify "${GRAVITINO_FLINK_CONNECTOR_RUNTIME_JAR}" "${GRAVITINO_FLINK_CONNECTOR_RUNTIME_MD5}" "${flink_dir}"

FLINK_SHADED_HADOOP_JAR="https://repo1.maven.org/maven2/org/apache/flink/flink-shaded-hadoop-2-uber/2.7.5-7.0/flink-shaded-hadoop-2-uber-2.7.5-7.0.jar"
FLINK_SHADED_HADOOP_MD5="${FLINK_SHADED_HADOOP_JAR}.md5"
download_and_verify "${FLINK_SHADED_HADOOP_JAR}" "${FLINK_SHADED_HADOOP_MD5}" "${flink_dir}"

HADOOP_CLIENT_JAR="https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-client/2.7.3/hadoop-client-2.7.3.jar"
HADOOP_CLIENT_MD5="${HADOOP_CLIENT_JAR}.md5"
download_and_verify "${HADOOP_CLIENT_JAR}" "${HADOOP_CLIENT_MD5}" "${flink_dir}"

HADOOP_COMMON_JAR="https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-common/2.7.3/hadoop-common-2.7.3.jar"
HADOOP_COMMON_MD5="${HADOOP_COMMON_JAR}.md5"
download_and_verify "${HADOOP_COMMON_JAR}" "${HADOOP_COMMON_MD5}" "${flink_dir}"

HADOOP_HDFS_JAR="https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-hdfs/2.7.3/hadoop-hdfs-2.7.3.jar"
HADOOP_HDFS_MD5="${HADOOP_HDFS_JAR}.md5"
download_and_verify "${HADOOP_HDFS_JAR}" "${HADOOP_HDFS_MD5}" "${flink_dir}"

HADOOP_MAPREDUCE_CORE_JAR="https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-mapreduce-client-core/2.7.3/hadoop-mapreduce-client-core-2.7.3.jar"
HADOOP_MAPREDUCE_CORE_MD5="${HADOOP_MAPREDUCE_CORE_JAR}.md5"
download_and_verify "${HADOOP_MAPREDUCE_CORE_JAR}" "${HADOOP_MAPREDUCE_CORE_MD5}" "${flink_dir}"

HADOOP_AUTH_JAR="https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-auth/2.7.3/hadoop-auth-2.7.3.jar"
HADOOP_AUTH_MD5="${HADOOP_AUTH_JAR}.md5"
download_and_verify "${HADOOP_AUTH_JAR}" "${HADOOP_AUTH_MD5}" "${flink_dir}"

GUAVA_JAR="https://repo1.maven.org/maven2/com/google/guava/guava/14.0.1/guava-14.0.1.jar"
GUAVA_MD5="${GUAVA_JAR}.md5"
download_and_verify "${GUAVA_JAR}" "${GUAVA_MD5}" "${flink_dir}"

HIVE_COMMON_JAR="https://repo1.maven.org/maven2/org/apache/hive/hive-common/2.3.9/hive-common-2.3.9.jar"
HIVE_COMMON_MD5="${HIVE_COMMON_JAR}.md5"
download_and_verify "${HIVE_COMMON_JAR}" "${HIVE_COMMON_MD5}" "${flink_dir}"

HIVE_EXEC_JAR="https://repo1.maven.org/maven2/org/apache/hive/hive-exec/2.3.9/hive-exec-2.3.9.jar"
HIVE_EXEC_MD5="${HIVE_EXEC_JAR}.md5"
download_and_verify "${HIVE_EXEC_JAR}" "${HIVE_EXEC_MD5}" "${flink_dir}"

HIVE_METASTORE_JAR="https://repo1.maven.org/maven2/org/apache/hive/hive-metastore/2.3.9/hive-metastore-2.3.9.jar"
HIVE_METASTORE_MD5="${HIVE_METASTORE_JAR}.md5"
download_and_verify "${HIVE_METASTORE_JAR}" "${HIVE_METASTORE_MD5}" "${flink_dir}"

LIBTHRIFT_JAR="https://repo1.maven.org/maven2/org/apache/thrift/libthrift/0.22.0/libthrift-0.22.0.jar"
LIBTHRIFT_MD5="${LIBTHRIFT_JAR}.md5"
download_and_verify "${LIBTHRIFT_JAR}" "${LIBTHRIFT_MD5}" "${flink_dir}"

LIBFB303_JAR="https://repo1.maven.org/maven2/org/apache/thrift/libfb303/0.9.3/libfb303-0.9.3.jar"
LIBFB303_MD5="${LIBFB303_JAR}.md5"
download_and_verify "${LIBFB303_JAR}" "${LIBFB303_MD5}" "${flink_dir}"

FLINK_SQL_CONNECTOR_HIVE_JAR="https://repo1.maven.org/maven2/org/apache/flink/flink-sql-connector-hive-2.3.9_2.12/1.18.1/flink-sql-connector-hive-2.3.9_2.12-1.18.1.jar"
FLINK_SQL_CONNECTOR_HIVE_MD5="${FLINK_SQL_CONNECTOR_HIVE_JAR}.md5"
download_and_verify "${FLINK_SQL_CONNECTOR_HIVE_JAR}" "${FLINK_SQL_CONNECTOR_HIVE_MD5}" "${flink_dir}"

MYSQL_CONNECTOR_JAVA_JAR="https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.27/mysql-connector-java-8.0.27.jar"
MYSQL_CONNECTOR_JAVA_MD5="${MYSQL_CONNECTOR_JAVA_JAR}.md5"
download_and_verify "${MYSQL_CONNECTOR_JAVA_JAR}" "${MYSQL_CONNECTOR_JAVA_MD5}" "${flink_dir}"

FLINK_CONNECTOR_JDBC_JAR="https://repo1.maven.org/maven2/org/apache/flink/flink-connector-jdbc/3.2.0-1.18/flink-connector-jdbc-3.2.0-1.18.jar"
FLINK_CONNECTOR_JDBC_MD5="${FLINK_CONNECTOR_JDBC_JAR}.md5"
download_and_verify "${FLINK_CONNECTOR_JDBC_JAR}" "${FLINK_CONNECTOR_JDBC_MD5}" "${flink_dir}"

ICEBERG_FLINK_RUNTIME_JAR="https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-flink-runtime/0.12.1/iceberg-flink-runtime-0.12.1.jar"
ICEBERG_FLINK_RUNTIME_MD5="${ICEBERG_FLINK_RUNTIME_JAR}.md5"
download_and_verify "${ICEBERG_FLINK_RUNTIME_JAR}" "${ICEBERG_FLINK_RUNTIME_MD5}" "${flink_dir}"

PAIMON_FLINK_CONNECTOR_JAR="https://repo.maven.apache.org/maven2/org/apache/paimon/paimon-flink-1.18/0.8.2/paimon-flink-1.18-0.8.2.jar"
PAIMON_FLINK_CONNECTOR_MD5="${PAIMON_FLINK_CONNECTOR_JAR}.md5"
download_and_verify "${PAIMON_FLINK_CONNECTOR_JAR}" "${PAIMON_FLINK_CONNECTOR_MD5}" "${flink_dir}"

PAIMON_CORE_JAR="https://repo1.maven.org/maven2/org/apache/paimon/paimon-core/0.8.2/paimon-core-0.8.2.jar"
PAIMON_CORE_MD5="${PAIMON_CORE_JAR}.md5"
download_and_verify "${PAIMON_CORE_JAR}" "${PAIMON_CORE_MD5}" "${flink_dir}"

HTRACE_CORE_JAR="https://repo1.maven.org/maven2/org/apache/htrace/htrace-core/3.1.0-incubating/htrace-core-3.1.0-incubating.jar"
HTRACE_CORE_MD5="${HTRACE_CORE_JAR}.md5"
download_and_verify "${HTRACE_CORE_JAR}" "${HTRACE_CORE_MD5}" "${flink_dir}"

HTRACE_CORE4_JAR="https://repo1.maven.org/maven2/org/apache/htrace/htrace-core4/4.2.0-incubating/htrace-core4-4.2.0-incubating.jar"
HTRACE_CORE4_MD5="${HTRACE_CORE4_JAR}.md5"
download_and_verify "${HTRACE_CORE4_JAR}" "${HTRACE_CORE4_MD5}" "${flink_dir}"

COMMON_CONFIGURATION_JAR="https://repo1.maven.org/maven2/commons-configuration/commons-configuration/1.10/commons-configuration-1.10.jar"
COMMON_CONFIGURATION_MD5="${COMMON_CONFIGURATION_JAR}.md5"
download_and_verify "${COMMON_CONFIGURATION_JAR}" "${COMMON_CONFIGURATION_MD5}" "${flink_dir}"

COMMON_LANG_JAR="https://repo1.maven.org/maven2/commons-lang/commons-lang/2.6/commons-lang-2.6.jar"
COMMON_LANG_MD5="${COMMON_LANG_JAR}.md5"
download_and_verify "${COMMON_LANG_JAR}" "${COMMON_LANG_MD5}" "${flink_dir}"

COMMON_LOGGING_JAR="https://repo1.maven.org/maven2/commons-logging/commons-logging/1.2/commons-logging-1.2.jar"
COMMON_LOGGING_MD5="${COMMON_LOGGING_JAR}.md5"
download_and_verify "${COMMON_LOGGING_JAR}" "${COMMON_LOGGING_MD5}" "${flink_dir}"