export var scope = 'scope="Test Scope"';

export var tests = [
    {
      query: "collectd_cpu_percent",
      expected: "collectd_cpu_percent{"+ scope + "}"
    },
    {
      query: "collectd_cpu_percent{application=\"eui\"}",
      expected: "collectd_cpu_percent{" + scope + ",application=\"eui\"}"
    },
    {
      query: "count(collectd_cpu_percent)",
      expected: "count(collectd_cpu_percent{" + scope + "})"
    },
    {
      query: "count(collectd_cpu_percent) by(application)",
      expected: "count(collectd_cpu_percent{" + scope + "}) by(application)"
    },
    {
      query: "count by(application) (collectd_cpu_percent)",
      expected: "count by(application)(collectd_cpu_percent{" + scope + "})"
    },
    {
      query: "{__name__=\"collectd_cpu_percent\"}",
      expected: "{" + scope + ",__name__=\"collectd_cpu_percent\"}"
    },
    {
      query: "sum(count_over_time({__name__=~\"collectd.+\"}[1h])) by(application)",
      expected: "sum(count_over_time({" + scope + ",__name__=~\"collectd.+\"}[1h])) by(application)"
    },
    {
      query: "sum(changes(asg_instances{state=\"InService\"}[5d])) BY (application, stack, environment, host)",
      expected: "sum(changes(asg_instances{" + scope + ",state=\"InService\"}[5d])) BY (application, stack, environment, host)"
    },
    {
      query: "idelta(temp_process_cpu[2m]) / 60 / 10000",
      expected: "idelta(temp_process_cpu{" + scope + "}[2m]) / 60 / 10000"
    },
    {
      query: "(max(up) BY (host) * 2) + IGNORING(application, stack, environment) GROUP_RIGHT() max(ec2_instance_state) BY (host, " +
      "application, stack, environment)",
      expected: "(max(up{" + scope + "}) BY (host) * 2) + IGNORING(application, stack, environment) GROUP_RIGHT() max(ec2_instance_state{" +
      scope + "}) BY (host, application, stack, environment)"
    },
    {
      query: "idelta({__name__=~\"collectd_interface_if_dropped_rx_total|collectd_interface_if_dropped_tx_total|" +
      "collectd_interface_if_errors_rx_total|collectd_interface_if_errors_tx_total\"}[2m])",
      expected: "idelta({" + scope + ",__name__=~\"collectd_interface_if_dropped_rx_total|collectd_interface_if_dropped_tx_total|" +
      "collectd_interface_if_errors_rx_total|collectd_interface_if_errors_tx_total\"}[2m])"
    },
    {
      query: "count(((asg_change_history == 0) or min(asg_instances{state=\"InService-1\"} == 0) BY (application, stack, environment, " +
      "host)) and sum(asg_instances{state=\"InService-2\"}) BY (application, stack, environment, host)) BY (application, stack, " +
      "environment) / count(asg_instances{state=\"InService-3\"}) BY (application, stack, environment)",
      expected: "count(((asg_change_history{" + scope + "} == 0) or min(asg_instances{" + scope + ",state=\"InService-1\"} == 0) BY (" +
      "application, stack, environment, host)) and sum(asg_instances{" + scope + ",state=\"InService-2\"}) BY (application, stack, " +
      "environment, host)) BY (application, stack, environment) / count(asg_instances{" + scope + ",state=\"InService-3\"}) BY (" +
      "application, stack, environment)"
    },
    {
      query: "sum(max(ec2_instance_state * 0) BY (host) or max(up * 0) BY (host)) BY (host)",
      expected: "sum(max(ec2_instance_state {" + scope + "}* 0) BY (host) or max(up {" + scope + "}* 0) BY (host)) BY (host)"
    },
    {
      query: "ec2_agt_mon + ON(host, account, az, instance) GROUP_RIGHT() max(collectd_cpu_percent * 0) BY (host, application, stack, " +
      "environment, account, az, instance)",
      expected: "ec2_agt_mon{" + scope + "} + ON(host, account, az, instance) GROUP_RIGHT() max(collectd_cpu_percent {" + scope +
      "}* 0) BY (host, application, stack, environment, account, az, instance)"
    },
    {
      query: "collectd_cpu_percent == collectd_cpu_percent{application=\"eui\"}",
      expected: "collectd_cpu_percent{" + scope + "} == collectd_cpu_percent{" + scope + ",application=\"eui\"}"
    },
    {
      query: "collectd_cpu_percent + collectd_cpu_percent{application=\"eui\"}",
      expected: "collectd_cpu_percent{" + scope + "} + collectd_cpu_percent{" + scope + ",application=\"eui\"}"
    },
    {
      query: "collectd_cpu_percent and collectd_cpu_percent{application=\"eui\"}",
      expected: "collectd_cpu_percent{" + scope + "} and collectd_cpu_percent{" + scope + ",application=\"eui\"}"
    },
    {
      query: "collectd_cpu_percent unless collectd_cpu_percent{application=\"eui\"}",
      expected: "collectd_cpu_percent{" + scope + "} unless collectd_cpu_percent{" + scope + ",application=\"eui\"}"
    },
    {
      query: "collectd_cpu_percent == bool collectd_cpu_percent{application=\"eui\"}",
      expected: "collectd_cpu_percent{" + scope + "} == bool collectd_cpu_percent{" + scope + ",application=\"eui\"}"
    },
    {
      query: "collectd_cpu_percent + collectd_cpu_percent",
      expected: "collectd_cpu_percent{" + scope + "} + collectd_cpu_percent{" + scope + "}"
    },
    {
      query: "collectd_cpu_percent offset 5d",
      expected: "collectd_cpu_percent{" + scope + "} offset 5d"
    },
    {
      query: "count_over_time(collectd_cpu_percent[5m] offset 5d)",
      expected: "count_over_time(collectd_cpu_percent{" + scope + "}[5m] offset 5d)"
    },
    {
      query: "collectd_cpu_percent + collectd_cpu_percent offset 5m",
      expected: "collectd_cpu_percent{" + scope + "} + collectd_cpu_percent{" + scope + "} offset 5m"
    },
    {
      query: "quantile(90/100, elb_health{application=\"CloudSec\",environment=~\"^Production.*\",stack=~\".*\"})",
      expected: "quantile(90/100, elb_health{" + scope + ",application=\"CloudSec\",environment=~\"^Production.*\",stack=~\".*\"})"
    },
    {
        query: "quantile(0.9, elb_health{application=\"CloudSec\",environment=~\"^Production.*\",stack=~\".*\"})",
        expected: "quantile(0.9, elb_health{" + scope + ",application=\"CloudSec\",environment=~\"^Production.*\",stack=~\".*\"})"
      },
      {
        query: "collectd_cpu_percent_sys + collectd_cpu_percent_user",
        expected: "collectd_cpu_percent_sys{" + scope + "} + collectd_cpu_percent_user{" + scope + "}"
      },
      {
        query: "collectd_process_count == 10",
        expected: "collectd_process_count{" + scope + "} == 10"
      },
      {
        query: "collectd_cpu_idle or collectd_cpu_user",
        expected: "collectd_cpu_idle{" + scope + "} or collectd_cpu_user{" + scope + "}"
      },
    ];

export var literals = [
    [
      {
        query: "collectd_cpu_percent{instance=\"dev-ucm-pro-w2c-a\"}",
        expected: "collectd_cpu_percent{"+ scope + ",instance=\"dev-ucm-pro-w2c-a\"}"
      },
      {
        query: "collectd_cpu_percent{instance=\"dev-ucm-pro-w2c-b\"}",
        expected: "collectd_cpu_percent{"+ scope + ",instance=\"dev-ucm-pro-w2c-b\"}"
      },
      {
        query: "collectd_cpu_percent{instance=\"dev-ucm-pro-w2c-c\"}",
        expected: "collectd_cpu_percent{"+ scope + ",instance=\"dev-ucm-pro-w2c-c\"}"
      },
    ],
    [
      {
        query: "count(collectd_cpu_percent{instance=\"dev-ucm-pro-w2c-a\"})",
        expected: "count(collectd_cpu_percent{"+ scope + ",instance=\"dev-ucm-pro-w2c-a\"})"
      },
      {
        query: "count(collectd_cpu_percent{instance=\"dev-ucm-pro-w2c-b\"})",
        expected: "count(collectd_cpu_percent{"+ scope + ",instance=\"dev-ucm-pro-w2c-b\"})"
      },
    ],
  ];

