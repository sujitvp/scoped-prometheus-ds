
function testCycle() {
    console.time("Test Cycle: ");
    //console.log("-------------v----------------v-------------");
    for (var z = 0; z < queries.length; z++) {
      res = parseQuery(queries[z][0], z);
      //console.log(z + " => " + res);
      var pass = (queries[z][1] === res);
      document.write("<p style=\"color:" + (pass?"green":"red") + ";\">" + z + ". " + pass + " : " + queries[z][0] + " => " + res + "</p>");
    }
    //console.log("-------------^----------------^-------------");
    console.timeEnd("Test Cycle: ");
  }
  
  function perfTest() {
    console.time("Overall Test Timing");
    for (var i = 0; i < 100; i++) {
      testCycle();
    }
    console.timeEnd("Overall Test Timing");
  }
  
  //Processing Starts here:
  var queries = [
    [
      "collectd_cpu_percent",
      "collectd_cpu_percent{$SCOPE}"
    ],
    [
      "collectd_cpu_percent{application=\"eui\"}",
      "collectd_cpu_percent{$SCOPE,application=\"eui\"}"
    ],
    [
      "count(collectd_cpu_percent)",
      "count(collectd_cpu_percent{$SCOPE})"
    ],
    [
      "count(collectd_cpu_percent) by(application)",
      "count(collectd_cpu_percent{$SCOPE}) by(application)"
    ],
    [
      "count by(application) (collectd_cpu_percent)",
      "count by(application)(collectd_cpu_percent{$SCOPE})"
    ],
    [
      "{__name__=\"collectd_cpu_percent\"}",
      "{$SCOPE,__name__=\"collectd_cpu_percent\"}"
    ],
    [
      "sum(count_over_time({__name__=~\"collectd.+\"}[1h])) by(application)",
      "sum(count_over_time({$SCOPE,__name__=~\"collectd.+\"}[1h])) by(application)"
    ],
    [
      "sum(changes(asg_instances{state=\"InService\"}[5d])) BY (application, stack, environment, host)",
      "sum(changes(asg_instances{$SCOPE,state=\"InService\"}[5d])) BY (application, stack, environment, host)"
    ],
    [
      "idelta(temp_process_cpu[2m]) / 60 / 10000",
      "idelta(temp_process_cpu{$SCOPE}[2m]) / 60 / 10000"
    ],
    [
      "(max(up) BY (host) * 2) + IGNORING(application, stack, environment) GROUP_RIGHT() max(ec2_instance_state) BY (host, application, stack, environment)",
      "(max(up{$SCOPE}) BY (host) * 2) + IGNORING(application, stack, environment) GROUP_RIGHT() max(ec2_instance_state{$SCOPE}) BY (host, application, stack, environment)"
    ],
    [
      "idelta({__name__=~\"collectd_interface_if_dropped_rx_total|collectd_interface_if_dropped_tx_total|collectd_interface_if_errors_rx_total|collectd_interface_if_errors_tx_total\"}[2m])",
      "idelta({$SCOPE,__name__=~\"collectd_interface_if_dropped_rx_total|collectd_interface_if_dropped_tx_total|collectd_interface_if_errors_rx_total|collectd_interface_if_errors_tx_total\"}[2m])"
    ],
    [
      "count(((asg_change_history == 0) or min(asg_instances{state=\"InService\"} == 0) BY (application, stack, environment, host)) and sum(asg_instances{state=\"InService\"}) BY (application, stack, environment, host)) BY (application, stack, environment) / count(asg_instances{state=\"InService\"}) BY (application, stack, environment)",
      "count(((asg_change_history{$SCOPE} == 0) or min(asg_instances{$SCOPE,state=\"InService\"} == 0) BY (application, stack, environment, host)) and sum(asg_instances{$SCOPE,state=\"InService\"}) BY (application, stack, environment, host)) BY (application, stack, environment) / count(asg_instances{$SCOPE,state=\"InService\"}) BY (application, stack, environment)"
    ],
    [
      "sum(max(ec2_instance_state * 0) BY (host) or max(up * 0) BY (host)) BY (host)",
      "sum(max(ec2_instance_state {$SCOPE}* 0) BY (host) or max(up {$SCOPE}* 0) BY (host)) BY (host)"
    ],
    [
      "ec2_agt_mon + ON(host, account, az, instance) GROUP_RIGHT() max(collectd_cpu_percent * 0) BY (host, application, stack, environment, account, az, instance)",
      "ec2_agt_mon{$SCOPE} + ON(host, account, az, instance) GROUP_RIGHT() max(collectd_cpu_percent {$SCOPE}* 0) BY (host, application, stack, environment, account, az, instance)"
    ],
    [
      "collectd_cpu_percent == collectd_cpu_percent{application=\"eui\"}",
      "collectd_cpu_percent{$SCOPE} == collectd_cpu_percent{$SCOPE,application=\"eui\"}"
    ],
    [
      "collectd_cpu_percent + collectd_cpu_percent{application=\"eui\"}",
      "collectd_cpu_percent{$SCOPE} + collectd_cpu_percent{$SCOPE,application=\"eui\"}"
    ],
    [
      "collectd_cpu_percent and collectd_cpu_percent{application=\"eui\"}",
      "collectd_cpu_percent{$SCOPE} and collectd_cpu_percent{$SCOPE,application=\"eui\"}"
    ],
    [
      "collectd_cpu_percent unless collectd_cpu_percent{application=\"eui\"}",
      "collectd_cpu_percent{$SCOPE} unless collectd_cpu_percent{$SCOPE,application=\"eui\"}"
    ],
    [
      "collectd_cpu_percent == bool collectd_cpu_percent{application=\"eui\"}",
      "collectd_cpu_percent{$SCOPE} == bool collectd_cpu_percent{$SCOPE,application=\"eui\"}"
    ],
    [
      "collectd_cpu_percent + collectd_cpu_percent",
      "collectd_cpu_percent{$SCOPE} + collectd_cpu_percent{$SCOPE}"
    ],
    [
      "collectd_cpu_percent offset 5d",
      "collectd_cpu_percent{$SCOPE} offset 5d"
    ],
    [
      "count_over_time(collectd_cpu_percent[5m] offset 5d)",
      "count_over_time(collectd_cpu_percent{$SCOPE}[5m] offset 5d)"
    ],
    [
      "collectd_cpu_percent + collectd_cpu_percent offset 5m",
      "collectd_cpu_percent{$SCOPE} + collectd_cpu_percent{$SCOPE} offset 5m"
    ],
  ];
  
  
  testCycle();
  perfTest();
  ////console.log(JSON.stringify(pq));
  ////console.log(JSON.stringify(txttbl));
  