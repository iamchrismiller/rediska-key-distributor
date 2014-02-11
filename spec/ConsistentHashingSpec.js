/*global module, require */
"use strict";

var KeyDistributor = require('./../lib/KeyDistributor');

module.exports = {


  setUp : function (callback) {
    this.defaultConnectionString = '127.0.0.1:6379';
    this.keyDistributor = new KeyDistributor();
    callback();
  },

  tearDown : function (callback) {
    this.keyDistributor = null;
    callback();
  },

  testAddConnection : function (test) {

    var addResult = this.keyDistributor.addConnection(this.defaultConnectionString);
    test.equal(this.keyDistributor, addResult);

    var connection = this.keyDistributor.getConnectionByKeyName('test');
    test.equal('127.0.0.1:6379', connection);

    test.done();
  },

  testAddDuplicateConnection : function (test) {
    this.keyDistributor.addConnection(this.defaultConnectionString);

    test.throws(
      function() {
        this.keyDistributor.addConnection(this.defaultConnectionString)
      }.bind(this),
      Error,
      "Error: Connection" + this.defaultConnectionString + " already exists."
    );

    test.done();
  },

  testRemoveConnection : function (test) {
    this.keyDistributor.addConnection(this.defaultConnectionString);
    var removed = this.keyDistributor.removeConnection(this.defaultConnectionString);
    test.equal(this.keyDistributor, removed);


    test.throws(
      function() {
        test.throws(this.keyDistributor.getConnectionByKeyName('test'));
      }.bind(this),
      Error,
      "Error: Connection" + this.defaultConnectionString + " does not exist."
    );

    test.done();
  },

  testRemoveUnknownConnection : function (test) {
    test.throws(
      function() {
        this.keyDistributor.removeConnection(this.defaultConnectionString);
      }.bind(this),
      Error,
      "Error: Connection" + this.defaultConnectionString + "does not exist."
    );

    test.done();
  },

  testGetConnectionByKeyName : function (test) {
    var connections = {};

    this.keyDistributor.addConnection(this.defaultConnectionString);
    this.keyDistributor.addConnection(this.defaultConnectionString.replace('79', '80'));
    this.keyDistributor.addConnection(this.defaultConnectionString.replace('79', '81'));
    this.keyDistributor.addConnection(this.defaultConnectionString.replace('79', '82'));

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
  },

  testMultipleGetConnectionByKeyName : function (test) {
    var connections = {};

    this.keyDistributor.addConnection(this.defaultConnectionString);
    this.keyDistributor.addConnection(this.defaultConnectionString.replace('79', '80'));
    this.keyDistributor.addConnection(this.defaultConnectionString.replace('79', '81'));
    this.keyDistributor.addConnection(this.defaultConnectionString.replace('79', '82'));

    console.log("\n\nSHOULD BE 127.0.0.1:6380");
    console.log("\n" + this.keyDistributor.getConnectionByKeyName("provider:12345:members") + "\n");

    test.done();
  }
};