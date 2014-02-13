/*global module, require */
"use strict";

var RedisCluster = require('./../lib/RedisCluster');
var KeyDistributor = require('./../lib/KeyDistributor');

var redis = require("redis-mock");

module.exports = {

  testConstructWithoutServers : function (test) {
    test.throws(
      function () {
        new RedisCluster({
          redisFactory : redis,
          distributor  : KeyDistributor
        });
      },
      Error,
      'Must supply "redisFactory" option in options'
    );
    test.done();
  },

  testConstructWithoutRedisFactory : function (test) {
    test.throws(
      function () {
        new RedisCluster({
          servers     : [
            { host : '127.0.0.1', port : 6379, db : 0 }
          ],
          distributor : KeyDistributor
        });
      },
      Error,
      'Must supply "redisFactory" option in options'
    );
    test.done();
  },

  testConstructWithoutKeyDistributor : function (test) {
    test.throws(
      function () {
        new RedisCluster({
          servers      : [
            { host : '127.0.0.1', port : 6379, db : 0 }
          ],
          redisFactory : redis
        });
      },
      Error,
      'Must supply "distributor" option in options'
    );
    test.done();
  },

  testCommandSetup : function (test) {
    var redisCluster = new RedisCluster({
      servers      : [
        { host : '127.0.0.1', port : 6379, db : 0 }
      ],
      redisFactory : redis,
      distributor  : KeyDistributor
    });

    redisCluster.commands = {};
    test.equal(Object.keys(redisCluster.commands).length, 0);
    redisCluster._setupCommands();
    test.notEqual(redisCluster.commands, 146);
    test.done();
  },

  testGetNode : function (test) {
    var redisCluster = new RedisCluster({
      servers      : [
        { host : '127.0.0.1', port : 6379, db : 0 },
        { host : '127.0.0.1', port : 6380, db : 0 },
        { host : '127.0.0.1', port : 6381, db : 0 }
      ],
      redisFactory : redis,
      distributor  : KeyDistributor
    });

    test.equal(redisCluster._getNode('key:1'), '127.0.0.1:6381');
    test.equal(redisCluster._getNode('test:key:1'), '127.0.0.1:6379');
    test.equal(redisCluster._getNode('provider:key:12345'), '127.0.0.1:6380');
    test.equal(redisCluster._getNode('what:about:a:key:like:this'), '127.0.0.1:6380');
    test.equal(redisCluster._getNode('this:is:a:test:key'), '127.0.0.1:6379');
    test.equal(redisCluster._getNode('foo'), '127.0.0.1:6381');
    test.equal(redisCluster._getNode('bar'), '127.0.0.1:6380');
    test.equal(redisCluster._getNode('this.could.be.a.key.as.well'), '127.0.0.1:6379');
    test.done();
  },

  testCommandExecution : function (test) {

    var redisCluster = new RedisCluster({
      servers      : [
        { host : '127.0.0.1', port : 6379, db : 0 },
        { host : '127.0.0.1', port : 6380, db : 0 },
        { host : '127.0.0.1', port : 6381, db : 0 }
      ],
      redisFactory : redis,
      distributor  : KeyDistributor
    });

    var kv = {
      "string:1"                : "This is a test",
      "this:is:also:a:string:1" : "123"
    };

    for (var key in kv) {
      redisCluster.execute('set', key, kv[key]);
      test.expect(redisCluster.execute('get', key), kv[key]);
    }
    test.done();
  },


  testAccessNonShardableKey : function (test) {
    test.throws(
      function () {
        var redisCluster = new RedisCluster({
          servers      : [
            { host : '127.0.0.1', port : 6379, db : 0 }
          ],
          redisFactory : redis,
          distributor  : KeyDistributor
        });
        redisCluster.execute('foo', 'bar');
      },
      Error,
      'Command foo Not found'
    );
    test.done();
  }

};