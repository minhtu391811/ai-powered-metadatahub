#!bin/bash
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

tar -xzf /tmp/gravitino/spark/spark-3.4.2-bin-hadoop3.tgz -C /home/jovyan/
mkdir -p /opt/conda/share/jupyter/kernels/spark-3.4.2
cp /tmp/gravitino/spark/spark-kernel.json /opt/conda/share/jupyter/kernels/spark-3.4.2/kernel.json

tar -xzf /tmp/gravitino/flink/flink-1.18.1-bin-scala_2.12.tgz -C /home/jovyan/
mkdir -p /opt/conda/share/jupyter/kernels/flink-1.18.1
cp /tmp/gravitino/flink/flink-kernel.json /opt/conda/share/jupyter/kernels/flink-1.18.1/kernel.json

cp /tmp/gravitino/spark/spark-defaults.conf /home/jovyan/spark-3.4.2-bin-hadoop3/conf/spark-defaults.conf
cp /tmp/gravitino/flink/flink-conf.yaml /home/jovyan/flink-1.18.1/conf/flink-conf.yaml

if [ -n "$(find /home/jovyan -maxdepth 1 -name "*.ipynb" -print -quit)" ]; then
    echo "Already have .ipynb files in the directory, skip copying"
else
    echo "No .ipynb files in the directory, copy the default .ipynb files"
    cp -r /tmp/gravitino/*.ipynb /home/jovyan
    if ["$RANGER_ENABLE"==true]; then
      cp -r /tmp/gravitino/authorization/*.ipynb /home/jovyan
    fi
fi

start-notebook.sh --NotebookApp.token=''