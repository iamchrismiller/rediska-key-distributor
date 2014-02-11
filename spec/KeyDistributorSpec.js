/*global module, require */
"use strict";

var KeyDistributor = require('./../lib/KeyDistributor');

module.exports = {

  setUp : function (callback) {

    this.defaultServer = {
      host : '127.0.0.1',
      port : 6379
    };

    this.keyDistributor = new KeyDistributor({
        servers : [this.defaultServer]
      }
    );
    callback();
  },

  tearDown : function (callback) {
    this.keyDistributor = null;
    callback();
  },

  testAddConnection : function (test) {
    var options = this.defaultServer;
    options.port = 6380;
    var addResult = this.keyDistributor.addConnection(options, 1);
    test.equal(this.keyDistributor, addResult);
    test.done();
  },

  testAddDuplicateConnection : function (test) {
    test.throws(
      function () {
        this.keyDistributor.addConnection(this.defaultServer, 1);
      }.bind(this),
      Error,
      "Error: Connection" + JSON.stringify(this.defaultServer) + " already exists."
    );
    test.done();
  },

  testRemoveConnection : function (test) {
    var removed = this.keyDistributor.removeConnection(this.defaultServer);
    test.equal(this.keyDistributor, removed);
    test.throws(
      function () {
        this.keyDistributor.getConnectionByKeyName('test');

      }.bind(this),
      Error,
      "Error: Connection" + this.defaultServer + " does not exist."
    );
    test.done();
  },

  testRemoveUnknownConnection : function (test) {
    test.throws(
      function () {
        this.keyDistributor.removeConnection(this.defaultServer);
        this.keyDistributor.removeConnection(this.defaultServer);
      }.bind(this),
      Error,
      "Error: Connection" + this.defaultServer + "does not exist."
    );
    test.done();
  },

  testGetConnectionByKeyName : function (test) {
    var connections = {};

    var options = this.defaultServer;
    options.port = 6380;
    this.keyDistributor.addConnection(options, 1);

    options.port = 6381;
    this.keyDistributor.addConnection(options, 1);

    options.port = 6382;
    this.keyDistributor.addConnection(options, 1);

    for (var i = 0; i < 5; i++) {
      connections[i] = this.keyDistributor.getConnectionByKeyName("key_" + i);
    }

    var j = 0;
    for (var connection in connections) {
      var conn = this.keyDistributor.getConnectionByKeyName("key_" + j);
      test.equal(connections[connection], conn);
      j++;
    }
    test.done();
  }
};