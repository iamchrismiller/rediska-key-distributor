/*global require, module*/

//node
var util = require('util');

//local
var KeyDistributorException = require('./exceptions/KeyDistributorException'),
 crc = require('./util/crc'),
 ksort = require('./util/ksort');


/**
 * Redis Key Distributor
 * @notes Port Of PHP Rediska Key Distributor
 * @constructor
 */
function KeyDistributor(options) {
  "use strict";

  this.options = options;

  this._backends = {};
  this._backendsCount = 0;

  this._hashring = [];

  this._replicas = 256;
  this._slicesCount = 0;
  this._slicesHalf = 0;
  this._slicesDiv = 0;

  this._cache = {};
  this._cacheCount = 0;
  this._cacheMax = 256;

  //Rediska_Connection::DEFAULT_WEIGHT
  this._defaultWeight = 1;
  this._hashRingIsInitialized = false;

  //bootstrap servers
  this._addServers(this.options.servers || []);
}

/**
 * Add Array of Servers to local instance
 * @param servers
 * @private
 */
KeyDistributor.prototype._addServers = function(servers) {
  if (typeof servers   !== 'undefined' && util.isArray(servers) && servers.length) {
    var self = this;
    servers.forEach(function(server) {
      if (server.host && server.port) {
        self.addConnection(server);
      } else {
        console.log("Bad Server Format : ", JSON.stringify(server));
      }
    });
  }
};

/**
 * Add A Connection To The Backend Connections
 * @param server
 * @param weight
 * @returns {KeyDistributor}
 */
KeyDistributor.prototype.addConnection = function (server, weight) {
  var instanceKey = server.host + ":" + server.port;
  //Does Connection String Exists Already?
  if (this._backends.hasOwnProperty(instanceKey)) {
    throw new KeyDistributorException("Error: Connection " + instanceKey + " already exists.");
  }
  //Add ConnectionString With Weight To Backends
  this._backends[instanceKey] = weight ? weight : this._defaultWeight;
  //Increment Backend Count
  this._backendsCount++;
  //Flag initialized
  this._hashRingIsInitialized = false;
  return this;
};


/**
 * Remove A Connection From The Backend Connections
 * @param connectionString
 * @returns {KeyDistributor}
 */
KeyDistributor.prototype.removeConnection = function (server) {
  var instanceKey = server.host + ":" + server.port;
  //Get Index Of ConnectionString
  var connection = this._backends[instanceKey];
  //Check If Connection Exists in Backend Hashring
  if (!connection) {
    throw new KeyDistributorException("Error: Connection" + instanceKey + " does not exist.");
  }
  //Remove from Backend Array
  delete this._backends[instanceKey];
  //Decrement Backend Count
  this._backendsCount--;
  //Flag Not Initialized
  this._hashRingIsInitialized = false;
  return this;
};


/**
 * Get The Connection Via KeyName
 * @param name
 */
KeyDistributor.prototype.getConnectionByKeyName = function (name) {
  //Get The First Connection To Name
  var connections = this.getConnectionsByKeyName(name,1);
  //Error If No Connections
  if (!connections.length) {
    throw new KeyDistributorException("Error: No Connections Exist");
  }
  return connections[0];
};


/**
 * Get Connections Via KeyName
 * @param name
 * @param count
 * @returns {*}
 */
KeyDistributor.prototype.getConnectionsByKeyName = function(name, count) {
  //Return The Only Backend
  if (this._backendsCount === 1) {
    return Object.keys(this._backends);
  }

  if (!this._hashRingIsInitialized) {
    this._initializeHashring();
    this._hashRingIsInitialized = true;
  }

  // If the key has already been mapped, return the cached entry.
  if (this._cacheMax > 0 && (typeof this._cache[name] !== 'undefined')) {
    return this._cache[name];
  }

  //If Requesting
  if (count >= this._backendsCount) {
    return Object.keys(this._backends);
  }

  var result = [];

  //Cyclic redundancy check'd name
  var crc32String = crc.crc32(name);
  //Slice of hashring
  var slice = Math.floor(crc32String / this._slicesDiv) + this._slicesHalf;

  // This counter prevents going through more than 1 loop.
  var looped = false,
   finished = false;

  while(!finished) {

    //Loop through the Hashring
    for (var position in this._hashring[slice]) {
      //backend for the current position
      var backend = this._hashring[slice][position];

      // If we have a usable backend, add to the return array.
      if (position >= crc32String) {
        // No more checks are necessary.
        if (count === 1) {
          result = [backend];
          //break out of while
          finished = true;
          //break out of for
          break;
        } else if (result.indexOf(backend) === -1) {
          result.push(backend);
          if (result.length >= count) {
            //break out of while
            finished = true;
            break;
          }
        }
        result = [backend];
        break;
      }
    }

    if (finished) break;
    // Continue to the next slice.

    slice++;
    // If at the end of the hashring.
    if (slice >= this._slicesCount) {
      // If already looped once, something is wrong.
      if (looped) break;
      // Otherwise, loop back to the beginning.
      crc32String = -2147483648;
      slice = 0;
      looped = true;
    }
  }

  // Cache the result for quick retrieval in the future.
  if (this._cacheMax > 0) {
    // Add to internal cache.
    this._cache[name] = result;
    this._cacheCount++;
    // If the cache is getting too big, clear it.
    if (this._cacheCount > this._cacheMax) {
      this._cleanCache();
    }
  }

  return result;
};


/**
 * Initialize Hash Ring
 * @private
 */
KeyDistributor.prototype._initializeHashring = function() {

  if (Object.keys(this._backends).length < 2) {
    this._hashring = [];
    this._slicesCount = 0;
    this._slicesHalf = 0;
    this._slicesDiv = 0;
  } else {
    //32 slices per backend
    this._slicesCount = (this._replicas * this._backendsCount) / 8;
    this._slicesHalf = this._slicesCount / 2;
    //Max Integer Bound (2147483648) / slicesHalf
    this._slicesDiv = (Math.pow(2, 31)  / this._slicesHalf);

    //Fill a hashring array with Int 0 with length of _slicesCount
    this._hashring = Array.apply(null, new Array(this._slicesCount)).map(Number.prototype.valueOf,0);
    //Calculate The Average Weight
    var average = (this._sumOfBackendWeights() / this._backendsCount).toFixed(2);

    for (var backend in this._backends) {
      //Get The Adjusted Weight
      var weight = ((this._backends[backend] / average) * this._replicas).toFixed(0);
      //Create (weight.length) Replicas
      for(var i =0;i<weight;i++) {
        //cyclic redundancy check backend + current replica
        var position = crc.crc32(backend + ':' + i);
        var slice = ~~(position / this._slicesDiv) + this._slicesHalf;
        if (!this._hashring[slice]) {
          this._hashring[slice] = {};
        }
        this._hashring[slice][position] = backend;
      }
    }

    //Sort Each Slice Of the Hashring
    for(var j=0; j<this._slicesCount; j++) {
      this._hashring[j] = ksort(this._hashring[j],'SORT_NUMERIC');
    }
  }
  this._cleanCache();
};

/**
 * Calculate Backend Weights
 * @returns {number}
 * @private
 */
KeyDistributor.prototype._sumOfBackendWeights = function() {
  var sum = 0, obj = this._backends;
  for( var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      sum += parseFloat( obj[prop] );
    }
  }
  return sum;
};

/**
 * Clean the session cache
 * @private
 */
KeyDistributor.prototype._cleanCache = function() {
  this._cache = [];
  this._cacheCount = 0;
};

module.exports = KeyDistributor;