if [ "$SERVICE" = "hiveserver2" ]; then
  export HADOOP_CLIENT_OPTS="$HADOOP_CLIENT_OPTS -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port=9005 -Dcom.sun.management.jmxremote.local.only=false -Dcom.sun.management.jmxremote.authenticate=false -javaagent:/opt/java_metrics/jmx_prometheus_javaagent-0.20.0.jar=9008:/opt/java_metrics/config.yml -Dcom.sun.management.jmxremote.ssl=false"
fi
if [ "$SERVICE" = "metastore" ]; then
  export HADOOP_OPTS="$HADOOP_OPTS -Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.port=9025 -Dcom.sun.management.jmxremote.local.only=false -Dcom.sun.management.jmxremote.authenticate=false -javaagent:/opt/java_metrics/jmx_prometheus_javaagent-0.20.0.jar=9028:/opt/java_metrics/config.yml -Dcom.sun.management.jmxremote.ssl=false  $HEAP_OPTS"
fi