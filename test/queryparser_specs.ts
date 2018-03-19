import { expect } from 'chai';
import 'mocha';
import ScopedPrometheusQueryParser from '../src/queryparser';
import * as suites from './qp_suites';

describe('ScopedPrometheusQueryParser', function () {
  var qp: ScopedPrometheusQueryParser;
  beforeEach(function () {
    qp = new ScopedPrometheusQueryParser();
  });

  describe('Testing Injection', function () {
    suites.tests.forEach(function (test) {
      it('correctly injects scope into query: ' + test.query, function () {
        var res = qp.injectScopeIntoQuery(test.query, suites.scope);
        expect(res).to.equal(test.expected);
      });
    });
  });

  describe('Testing Performance', function () {
    suites.tests.forEach(function (test) {
      it('should average less than 1 ms per injection', function () {
        var beg = new Date().getTime();
        var loops = 100;
        for (var i = 0; i < loops; i++) {
          qp.injectScopeIntoQuery(test.query, suites.scope);
        }
        var end = new Date().getTime();
        var res = (end - beg) / loops;
        expect(res,"Average elapsed time for " + loops + " cycles of query: " + test.query).to.be.below(1);
      });
    });
  });

  describe('Testing Caching Optimization', function () {
    for (var i = 0; i<suites.literals.length; i++){
      suites.literals[i].forEach(function(test){
        describe('When repeated injection for queries differing in constants', () => {
          it("when processing query:" + test.query, function () {
            var res = qp.injectScopeIntoQuery(test.query, suites.scope);
            expect(res, 'injection correctness check failed').to.equal(test.expected);
            expect(qp.getCache().length, "cache mismatch " + JSON.stringify(qp.getCache())).to.equal(1);
          });
        });
      });
    }
  });

});
