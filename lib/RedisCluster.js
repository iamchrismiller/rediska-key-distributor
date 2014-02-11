/*global require, module */

//local
var keys = require('./redisKeys');


function RedisCluster(options) {
  this.options = options || {};

  if (!options.servers) {
    throw new Error('Must supply "servers" option in options');
  }

  if (!options.redisFactory || typeof options.redisFactory !== 'object') {
    throw new Error('Must supply "redisFactory" option in options');
  }

  if (!this.options.distributor || typeof options.distributor !== 'function') {
    throw new Error('Must supply "distributor" option in options');
  }

  //Redis Factory
  this.redisFactory = this.options.redisFactory;
  //Key Distributor
  this.distributor = new this.options.distributor(this.options);
  this.clients = this._setupClients(this.options.servers);
  //Setup local command namespace this[COMMAND]
  this.commands = {};
  this._setupCommands();
}

RedisCluster.prototype._setupClients = function (servers) {
  var clients = {};
  var self = this;

  servers.forEach(function (server) {
    //Create Redis Client
    var client = self.redisFactory.createClient(server.host, server.port);
    //Catch Client Errors
    client.on('error', self._handleError.bind(self));
    //Client database support
    if (server.db) {
      client.select(server.db, function () {});
    }
    //Client auth support
    if (server.password) {
      client.auth(server.password);
    }
    clients[server.host + ":" + server.port] = client;
  });
  return clients;
};


RedisCluster.prototype._getNode = function (name) {
  return this.distributor.getConnectionByKeyName(name);
};

RedisCluster.prototype._handleError = function (err) {
  console.error(err);
}

RedisCluster.prototype._getClientViaNode = function (node) {
  if (!this.clients[node]) {
    throw new Error("Node Not Found in Client List", node);
  }
  return this.clients[node];
};


RedisCluster.prototype._setupCommands = function () {
  var self = this;
  //Setup client commands
  keys.shardable.forEach(function (command) {
    //Setup local client command namespace
    self['commands'][command] = function () {
      var params = Array.prototype.slice.call(arguments);
      //get node for Command
      var node = self._getNode(params[0]);
      //Client For Clustered Node
      var client = self._getClientViaNode(node);
      client[command].apply(client, params);
    };
  });

  //Setup non-shardable commands
  keys.unshardable.forEach(function (command) {
    self['commands'][command] = function () {
      throw new Error(command + ' is not shardable, must execute against instance');
    };
  });
};

RedisCluster.prototype.execute = function() {
  var args = Array.prototype.slice.call(arguments);
  var command = args.shift();
  if (this.commands[command]) {
    return this.commands[command].apply(this, args);
  } else {
    throw new Error("Command " + command + " Not found");
  }
};

RedisCluster.prototype.multi = function () {
  throw new Error("Method Not Implemented.");
};


module.exports = RedisCluster;