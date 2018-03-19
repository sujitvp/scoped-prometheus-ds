## Scope Enforced Prometheus Data Source For Grafana

This plugin is a Prometheus datasource that supports scope enforcement. This allows for different instances of the help you get started with writing a data source plugin for Grafana in TypeScript.

With a standard implementation of Prometheus and Prometheus datasource plugin, supporting a multi-org (or multi-tenant) structure in grafana becomes difficult. To support self-enablement for each org,
either each orgs data needs to be setup in separate Prometheus instances, or each org dashboard-development team has to 'remeber' the partitioning label value (which may not be relevant for them). In 
our use-case, we initially used onboarding scripts with templated dashboards to support this multi-tenant model - however this restricted the ability to allow each org to self-manage their own dashboards.
We realized that teams would write queries and alerts for data, but forget to add the scope as a query filter and this would result in more metrics becoming part of their dashboards and alerts; leading to 
unwanted load at best, and incorrect results generally.

This datasource plugin is developed to address this requirement. With this datasource plugin, it is possible to add a 'scope' at the datasource level as a filter string (e.g., tenant="tenant 1"). This scope
is injected into all queries passing through the datasource, thus effectively partitioning the data by the filter and restricting access to those metrics meeting the filter criteria. Thus in a multi-tenant
usecase, each org in Grafana will be added with an instance of this datasource containing the filter string that restricts the tenant label to the value relevant for that tenant. This removes the responsibility
of adding this scope filter from the tenant teams.


### CHANGELOG
#### v1.0.0

- First version.
