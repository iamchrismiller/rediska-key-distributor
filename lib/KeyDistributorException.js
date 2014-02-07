/*global*/

/**
 * Custom KeyDistributor Exception
 * @param message
 * @constructor
 */
function KeyDistributorException(message) {
  this.name = 'KeyDistributorException';
  this.message = message;
}

//Inherit From Error Prototype
KeyDistributorException.prototype = Object.create( Error.prototype );
module.exports = KeyDistributorException;