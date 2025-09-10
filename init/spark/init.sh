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

mkdir -p /opt/spark/conf
cp /tmp/spark/spark-defaults.conf /opt/spark/conf
cp /tmp/spark/spark-env.sh /opt/spark/conf

cp /tmp/spark/packages/iceberg-spark-runtime-3.4_2.12-1.5.2.jar /opt/spark/jars/iceberg-spark-runtime-3.4_2.12-1.5.2.jar
cp /tmp/spark/packages/paimon-spark-3.4-0.8.2.jar /opt/spark/jars/paimon-spark-3.4-0.8.2.jar
cp /tmp/spark/packages/paimon-core-0.8.2.jar /opt/spark/jars/paimon-core-0.8.2.jar
cp /tmp/spark/packages/${SPARK_CONNECTOR_JAR} /opt/spark/jars/${SPARK_CONNECTOR_JAR}
cp /tmp/spark/packages/postgresql-42.2.7.jar /opt/spark/jars/postgresql-42.2.7.jar
cp /tmp/spark/packages/mysql-connector-java-8.0.27.jar /opt/spark/jars/mysql-connector-java-8.0.27.jar
cp /tmp/spark/packages/kyuubi-spark-authz-shaded_2.12-1.9.2.jar /opt/spark/jars/kyuubi-spark-authz-shaded_2.12-1.9.2.jar
/tmp/commom/init_metalake_catalog.sh

export SPARK_HOME=/opt/spark
$SPARK_HOME/sbin/start-master.sh --host 0.0.0.0 --port 7077 --webui-port 8080

tail -f /dev/null