/**
 * Javascript KSort Port
 * @see Adopted From https://github.com/kvz/phpjs
 * @param input
 * @param options
 *  - sortFlag (string)
 *  - keyOrder (array)
 *  - returnOrder (bool) (default : false)
 * @returns {*}
 * @constructor
 */
function KSort(input, options) {

  var tmp_arr = {},
    keys = [],
    sorter,
    self = this,
    populateArr = {};

  this.options = options || {};

  switch (this.options.sortFlag) {
    case 'SORT_STRING':
      // compare items as strings
      sorter = function (a, b) {
        return self.strnatcmp(a, b);
      };
      break;
    case 'SORT_NUMERIC':
      // compare items numerically
      sorter = function (a, b) {
        return ((a + 0) - (b + 0));
      };
      break;
    default:
      sorter = function (a, b) {
        var aFloat = parseFloat(a),
          bFloat = parseFloat(b),
          aNumeric = aFloat + '' === a,
          bNumeric = bFloat + '' === b;
        if (aNumeric && bNumeric) {
          return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
        } else if (aNumeric && !bNumeric) {
          return 1;
        } else if (!aNumeric && bNumeric) {
          return -1;
        }
        return a > b ? 1 : a < b ? -1 : 0;
      };
      break;
  }

  if (options.keyOrder) {
    //Supplied key order already
    keys = options.keyOrder;
  } else {
    // Make a list of keys
    for (var k in input) {
      if (input.hasOwnProperty(k)) {
        keys.push(k);
      }
    }
  }

  //Apply sort
  keys.sort(sorter);

  //If order is all that's needed return keys
  if (this.options.returnOrder) return keys;

  // Rebuild array with sorted key names
  for (var i = 0; i < keys.length; i++) {
    var l = keys[i];
    tmp_arr[l] = input[l];
  }


  //Rebuild object
  for (var j in tmp_arr) {
    if (tmp_arr.hasOwnProperty(j)) {
      populateArr[j] = tmp_arr[j];
    }
  }

  //return key locations
  return populateArr;
}

module.exports = KSort;