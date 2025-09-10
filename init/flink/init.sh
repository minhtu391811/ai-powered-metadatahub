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

set -e

chmod 1777 /tmp

cp /tmp/flink/flink-conf.yaml /opt/flink/conf/flink-conf.yaml

cp /tmp/flink/packages/gravitino-flink-connector-runtime-1.18_2.12-0.9.1.jar /opt/flink/lib/gravitino-flink-connector-runtime-1.18_2.12-0.9.1.jar
cp /tmp/flink/packages/flink-shaded-hadoop-2-uber-2.7.5-7.0.jar /opt/flink/lib/flink-shaded-hadoop-2-uber-2.7.5-7.0.jar
cp /tmp/flink/packages/guava-14.0.1.jar /opt/flink/lib/guava-14.0.1.jar
cp /tmp/flink/packages/hive-common-2.3.9.jar /opt/flink/lib/hive-common-2.3.9.jar
cp /tmp/flink/packages/hive-exec-2.3.9.jar /opt/flink/lib/hive-exec-2.3.9.jar
cp /tmp/flink/packages/hive-metastore-2.3.9.jar /opt/flink/lib/hive-metastore-2.3.9.jar
cp /tmp/flink/packages/libthrift-0.22.0.jar /opt/flink/lib/libthrift-0.22.0.jar
cp /tmp/flink/packages/libfb303-0.9.3.jar /opt/flink/lib/libfb303-0.9.3.jar
cp /tmp/flink/packages/flink-sql-connector-hive-2.3.9_2.12-1.18.1.jar /opt/flink/lib/flink-sql-connector-hive-2.3.9_2.12-1.18.1.jar
cp /tmp/flink/packages/flink-connector-jdbc-3.2.0-1.18.jar /opt/flink/lib/flink-connector-jdbc-3.2.0-1.18.jar
cp /tmp/flink/packages/mysql-connector-java-8.0.27.jar /opt/flink/lib/mysql-connector-java-8.0.27.jar
cp /tmp/flink/packages/iceberg-flink-runtime-0.12.1.jar /opt/flink/lib/iceberg-flink-runtime-0.12.1.jar
cp /tmp/flink/packages/paimon-flink-1.18-0.8.2.jar /opt/flink/lib/paimon-flink-1.18-0.8.2.jar
cp /tmp/flink/packages/paimon-core-0.8.2.jar /opt/flink/lib/paimon-core-0.8.2.jar
cp /tmp/flink/packages/htrace-core-3.1.0-incubating.jar /opt/flink/lib/htrace-core-3.1.0-incubating.jar
cp /tmp/flink/packages/htrace-core4-4.2.0-incubating.jar /opt/flink/lib/htrace-core4-4.2.0-incubating.jar
cp /tmp/flink/packages/commons-configuration-1.10.jar /opt/flink/lib/commons-configuration-1.10.jar
cp /tmp/flink/packages/commons-lang-2.6.jar /opt/flink/lib/commons-lang-2.6.jar
cp /tmp/flink/packages/commons-logging-1.2.jar /opt/flink/lib/commons-logging-1.2.jar

./bin/start-cluster.sh

tail -f /dev/null
