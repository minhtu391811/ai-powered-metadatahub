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

jupyter_dir="$(dirname "${BASH_SOURCE-$0}")"
jupyter_dir="$(
  cd "${jupyter_dir}" >/dev/null
  pwd
)"
. "${jupyter_dir}/../common/common.sh"

flink_file="${jupyter_dir}/flink/flink-1.18.1-bin-scala_2.12.tgz"
if [ ! -f "$flink_file" ]; then
    mkdir -p "$(dirname "$flink_file")"
    curl -L https://archive.apache.org/dist/flink/flink-1.18.1/flink-1.18.1-bin-scala_2.12.tgz -o "$flink_file"
else
    echo "Flink file existed: $flink_file"
fi

spark_file="${jupyter_dir}/spark/spark-3.4.2-bin-hadoop3.tgz"
if [ ! -f "$spark_file" ]; then
    mkdir -p "$(dirname "$spark_file")"
    curl -L https://archive.apache.org/dist/spark/spark-3.4.2/spark-3.4.2-bin-hadoop3.tgz -o "$spark_file"
else
    echo "Spark file existed: $spark_file"
fi

mkdir -p "${jupyter_dir}/spark/packages"
mkdir -p "${jupyter_dir}/flink/packages"

rm -f "${jupyter_dir}/spark/packages/"*.jar
rm -f "${jupyter_dir}/flink/packages/"*.jar

find "${jupyter_dir}/../spark/packages/" -name "*.jar" | xargs -I {} ln {} "${jupyter_dir}/spark/packages/"
find "${jupyter_dir}/../flink/packages/" -name "*.jar" | xargs -I {} ln {} "${jupyter_dir}/flink/packages/"
