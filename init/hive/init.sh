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

# remove command `tail -f /dev/null` in `/usr/local/sbin/start.sh`, so we can run subsequent commands
sed -i -E 's/tail -f \/dev\/null/ /g' /usr/local/sbin/start.sh

# Clean up old configurations
export HADOOP_OPTS=$(echo $HADOOP_OPTS | sed 's/-XX:MaxPermSize=[0-9]*m//g')
export HIVE_OPTS=$(echo $HIVE_OPTS | sed 's/-XX:MaxPermSize=[0-9]*m//g')

# Remove unnecessary cloud connectors from Hive
echo ">> Cleanup unnecessary cloud connectors GCS from Hive..."

CLOUD_PATTERNS="gcs google"

for pattern in $CLOUD_PATTERNS; do
  find /opt -type f -name "*${pattern}*.jar" -exec rm -f {} \;
done

echo ">> Remaining Hive libs after cleanup:"
ls -1 /opt | grep -E "gcs|google" || echo ">> Clean! No gcs connector jars left."

echo ">> Starting Hive init..."

cp -r /tmp/hive/java_metrics /opt/java_metrics
cp /tmp/hive/hive-env.sh /tmp/hive-conf
cp /tmp/hive/core-site.xml /tmp/hadoop-conf
cp /tmp/hive/hive-site.xml /tmp/hive-conf
cp /tmp/hive/hive-site-for-sql-base-auth.xml /tmp/hive-conf
cp /tmp/hive/start.sh /usr/local/sbin/start.sh
chmod +x /usr/local/sbin/start.sh

/bin/bash /usr/local/sbin/start.sh
hdfs dfs -mkdir -p /user/gravitino
hdfs dfs -mkdir -p /user/hive/warehouse
hdfs dfs -mkdir -p /user/iceberg/warehouse
hdfs dfs -mkdir -p /user/paimon/warehouse
useradd -g hdfs lisa
useradd -g hdfs manager
useradd -g hdfs anonymous
hdfs dfs -chmod 777 /user/gravitino
hdfs dfs -chmod 777 /user/hive/warehouse/
hdfs dfs -chmod 777 /user/iceberg/warehouse/
hdfs dfs -chmod 777 /user/paimon/warehouse/
tail -f /dev/null