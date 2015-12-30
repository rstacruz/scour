(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.scour = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],2:[function(require,module,exports){
"use strict";

/**
 * Clones an object but misses a key.
 */

module.exports = function cloneWithoutKeys(object, keys) {
  var result = {};
  for (var k in object) {
    if (object.hasOwnProperty(k) && !keys[k]) {
      result[k] = object[k];
    }
  }
  return result;
};
},{}],3:[function(require,module,exports){
'use strict';

var normalizeKeypath = require('../utilities/normalize_keypath');
var get = require('../utilities/get');

var fallbacks = {};

fallbacks['$eq'] = binaryOperator(function (a, b) {
  return a === b;
});
fallbacks['$ne'] = binaryOperator(function (a, b) {
  return a !== b;
});
fallbacks['$lt'] = binaryOperator(function (a, b) {
  return a < b;
});
fallbacks['$gt'] = binaryOperator(function (a, b) {
  return a > b;
});
fallbacks['$lte'] = binaryOperator(function (a, b) {
  return a <= b;
});
fallbacks['$gte'] = binaryOperator(function (a, b) {
  return a >= b;
});
fallbacks['$mod'] = binaryOperator(function (a, b) {
  return a % b[0] === b[1];
});
fallbacks['$where'] = binaryOperator(function (a, b, key) {
  return b(a, key);
});
fallbacks['$size'] = binaryOperator(function (a, b, key) {
  return a.length === b;
});

function binaryOperator(fn) {
  return function (_ref) {
    var key = _ref.key;
    var value = _ref.value;

    key = normalizeKeypath(key);
    return function (item, _key) {
      return fn(get(item, key), value, _key);
    };
  };
}

fallbacks['$or'] = function (_ref2, build) {
  var key = _ref2.key;
  var value = _ref2.value;

  var fns = value.map(build);

  return function (item, key) {
    for (var i = 0, len = fns.length; i < len; i++) {
      if (fns[i](item, key)) return true;
    }
    return false;
  };
};

fallbacks['$and'] = function (_ref3, build) {
  var key = _ref3.key;
  var value = _ref3.value;

  var fns = value.map(build);

  return function (item, key) {
    for (var i = 0, len = fns.length; i < len; i++) {
      if (!fns[i](item, key)) return false;
    }
    return true;
  };
};

fallbacks['$in'] = function (_ref4, build) {
  var key = _ref4.key;
  var value = _ref4.value;

  return build({
    type: '$or',
    value: value.map(function (value) {
      return { type: '$eq', key: key, value: value };
    })
  });
};

fallbacks['$nor'] = function (_ref5, build) {
  var key = _ref5.key;
  var value = _ref5.value;

  var fns = value.map(build);

  return function (item, key) {
    for (var i = 0, len = fns.length; i < len; i++) {
      if (fns[i](item, key)) return false;
    }
    return true;
  };
};

fallbacks['$not'] = function (_ref6, build) {
  var key = _ref6.key;
  var value = _ref6.value;

  var fn = build(value);
  return function (item, _key) {
    return !fn(item, _key);
  };
};

fallbacks['$nin'] = function (_ref7, build) {
  var key = _ref7.key;
  var value = _ref7.value;

  return build({
    type: '$and',
    value: value.map(function (value) {
      return { type: '$ne', key: key, value: value };
    })
  });
};

fallbacks['$regex'] = function (_ref8) {
  var key = _ref8.key;
  var value = _ref8.value;

  key = normalizeKeypath(key);
  return function (item, _key) {
    return value.test(get(item, key));
  };
};

fallbacks['$exists'] = function (_ref9) {
  var key = _ref9.key;
  var value = _ref9.value;

  key = normalizeKeypath(key);
  if (value) return function (item, _key) {
    return get(item, key) != null;
  };else return function (item, _key) {
    return get(item, key) == null;
  };
};

module.exports = fallbacks;
},{"../utilities/get":10,"../utilities/normalize_keypath":11}],4:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var normalizeKeypath = require('../utilities/normalize_keypath');
var cloneWithoutKeys = require('./clone_without_keys');
var toAST = require('./to_ast');
var assign = require('object-assign');
var each = require('../utilities/each');
var stringify = require('./stringify');

var operands = require('./operands');
var indexers = require('./indexers');
var fallbacks = require('./fallbacks');

/**
 * Searcher : Searcher(data)
 * (Class) Creates a searcher object where you can search given data.
 *
 *     import Searcher from 'scour-search'
 *
 *     data = [ { symbol: 'AAPL' }, { symbol: 'MSFT' } ]
 *
 *     search = Searcher(data)
 *     search.filter({ symbol: 'AAPL' })
 *
 *     // Add indexing via .index()
 *     search = search.index('symbol')
 *     search.filter({ symbol: 'AAPL' })
 */

function Search(source, options) {
  if (!(this instanceof Search)) return new Search(source);
  if (!options) options = {};
  this.data = source;
  this.indices = options.indices || {};
}

Search.prototype = {
  /**
   * Creates an index for the field `field`. This allows searches against this
   * field to be faster.
   *
   * This function is mutative; it will modify the current Searcher instance.
   *
   *     data = [
   *       { name: 'John' }, { name: 'Paul' }
   *     ]
   *
   *     search = Searcher(data)
   *     search.filter({ name: 'John' }) // ...slow (no index)
   *
   *     search = Searcher(data).index('name')
   *     search.filter({ name: 'John' }) // ...fast
   */

  index: function index(field, type) {
    field = normalizeKeypath(field);
    var indexKey = '' + field.join('.') + ':' + (type || '$eq');

    var index = {};
    each(this.data, function (value, key) {
      indexers['$eq'](value, key, field, index, 1);
    });

    this.indices[indexKey] = index;
    return this;
  },
  dup: function dup(data, options) {
    return new Search(data, {
      indices: options.indices || this.indices
    });
  },

  /**
   * Given new `newData`, update the indices for `keys`. The parameter `keys`
   * can be an array, a number, or a string.
   *
   * The parameter `newData` *must* be different from `data`, but based off of
   * it. (scour-search is biased towards immutable workflows.)
   *
   *     data = [ { name: 'john' } ]
   *     search = Searcher(data).index('name')
   *
   *     // An addition at key `1`
   *     newData = [ { name: 'john' }, { name: 'ringo' } ]
   *     search = search.reindex(newData, 1)
   *
   *     // An deletion at key `1`
   *     newData = [ { name: 'john' } ]
   *     search = search.reindex(newData, 1)
   */

  reindex: function reindex(newData, keys) {
    var _this = this;

    if (!Array.isArray(keys)) keys = [keys];
    var indices = assign({}, this.indices);

    each(keys, function (key) {
      each(_this.indices, function (_, indexKey) {
        var parts = indexKey.split(':'); // TODO support :
        var field = normalizeKeypath(parts[0]);
        var type = parts[1];
        var item = newData[key];

        // Remove old ones
        if (_this.data[key]) {
          var index = {};
          indexers[type](_this.data[key], key, field, index);
          indices[indexKey] = cloneWithoutKeys(_this.indices[indexKey], index);
        }

        // Insert new ones
        if (item) indexers[type](item, key, field, indices[indexKey]);
      });
    });

    return this.dup(newData, { indices: indices });
  },

  /**
   * Internal: Returns keys matching a given value. Run it through
   * `Object.keys` later.
   *
   *     getKeys('name', 'John') // => { '4': 1, '5': 1 }
   */

  getKeys: function getKeys(field, value, type) {
    var key = '' + field + ':' + (type || '$eq');
    if (!this.indices[key]) return;

    var result = this.indices[key][stringify(value)];
    if (typeof result === 'undefined') return {};

    return result;
  },

  /**
   * Performs a query. Supports some MongoDB-style filters.
   *
   *     search = Searcher(data)
   *
   *     search.filter({ name: 'John' })
   *     search.filter({ name: { $eq: 'John' } })
   *     search.filter({ name: { $in: ['John', 'George'] } })
   */

  filter: function filter(condition) {
    var _this2 = this;

    var ast = toAST(condition);
    var keys = this.filterRaw(ast);
    if (!keys) return this.filterFallback(ast);
    keys = Object.keys(keys);

    if (Array.isArray(this.data)) {
      return keys.map(function (key) {
        return _this2.data[key];
      });
    } else {
      var result = {};
      keys.forEach(function (key) {
        result[key] = _this2.data[key];
      });
      return result;
    }
  },

  /**
   * Returns the index. If it's not found, returns `-1`. For arrays, it will
   * return a numeric index. For objects, it will return the key string of the
   * match.
   *
   *     search = Searcher([ { id: 'AAPL' }, { id: 'GOOG' } ])
   *     search.indexOf({ id: 'GOOG' })      // => 1
   *
   *     search = Searcher({ aapl: { name: 'Apple' } })
   *     search.indexOf({ name: 'Apple' })   // => 'aapl'
   */

  indexOf: function indexOf(condition) {
    var ast = toAST(condition);
    var keys = this.filterRaw(ast);

    if (!keys) return this.indexOfFallback(ast);

    var key = Object.keys(keys)[0];
    if (typeof key === 'undefined') return -1;
    return Array.isArray(this.data) ? +key : key;
  },

  /**
   * Internal: a version of indexOf() that uses fallbacks (slow).
   */

  indexOfFallback: function indexOfFallback(ast) {
    var fn = buildFallback(ast);
    var Break = {};
    var key;
    try {
      each(this.data, function (item, _key) {
        if (fn(item, _key)) {
          key = _key;throw Break;
        }
      });
    } catch (e) {
      if (e !== Break) throw e;
    }
    if (typeof key === 'undefined') return -1;
    return Array.isArray(this.data) ? +key : key;
  },

  /**
   * Internal: filters using fallbacks.
   */

  filterFallback: function filterFallback(ast) {
    var _this3 = this;

    var fn = buildFallback(ast);
    if (!fn) return;

    if (Array.isArray(this.data)) {
      var _ret = (function () {
        var result = [];
        each(_this3.data, function (item, key) {
          if (fn(item, key)) result.push(item);
        });
        return {
          v: result
        };
      })();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else {
      var _ret2 = (function () {
        var result = {};
        each(_this3.data, function (item, key) {
          if (fn(item, key)) result[key] = item;
        });
        return {
          v: result
        };
      })();

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    }
  },

  /**
   * Performs a query, and only returns keys.
   */

  filterKeys: function filterKeys(condition) {
    var ast = toAST(condition);
    var result = this.filterRaw(ast);
    if (result) return Object.keys(result);

    var fn = buildFallback(ast);
    if (!fn) return;

    result = [];
    each(this.data, function (item, key) {
      if (fn(item, key)) result.push('' + key);
    });
    return result;
  },
  filterRaw: function filterRaw(ast) {
    var result = filter(this, ast);
    if (typeof result !== 'undefined') return result;
  },
  filterRawFallback: function filterRawFallback(ast) {
    var results = {};
    var fn = buildFallback(ast);
    if (!fn) return;

    each(this.data, function (item, key) {
      if (fn(item, key)) results[key] = 1;
    });
    return results;
  }
};

Search.build = function (condition) {
  return buildFallback(toAST(condition));
};

/**
 * Internal: filters by a given condition (`{ type, key, value }`).
 */

function filter(idx, condition) {
  var type = condition.type;
  if (!type || !operands[type]) return;

  return operands[type](idx, condition, filter);
}

function buildFallback(condition) {
  var type = condition.type;
  if (!type || !fallbacks[type]) return;

  var fn = fallbacks[type](condition, buildFallback);
  return fn;
}

/*
 * Internal: Exports
 */

Search.toAST = toAST;
Search.operands = operands;
Search.indexers = indexers;
Search.fallbacks = fallbacks;

module.exports = Search;
},{"../utilities/each":9,"../utilities/normalize_keypath":11,"./clone_without_keys":2,"./fallbacks":3,"./indexers":5,"./operands":6,"./stringify":7,"./to_ast":8,"object-assign":1}],5:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var get = require('../utilities/get');
var indexers = {};

indexers['$eq'] = function (item, key, field, index) {
  var val = stringify(get(item, field));
  if (!index[val]) index[val] = {};
  index[val][key] = 1;
};

module.exports = indexers;
},{"../utilities/get":10,"./stringify":7}],6:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var cloneWithoutKeys = require('./clone_without_keys');
var assign = require('object-assign');
var each = require('../utilities/each');

/**
 * Internal: operands.
 *
 * Every operand is passed the `idx` (an `si` instance), a `condition`
 * (consisting of `{ type, key, value }`), and the `filter` function.
 *
 *     operands['$eq'] = function (idx, condition, filter) {
 *       var { key, value, type } = condition
 *
 *       // key   === 'name'
 *       // value === 'Homer'
 *       // type  === '$eq'
 *       // idx   === [si (data, indices)]
 *     }
 *
 * They're expected to return a result of keys in the same format
 * `si#getKeys()` returns.
 *
 *     { '23': 1, '45': 1, '70': 1 }
 */

var operands = {};

operands['$eq'] = function (idx, _ref) {
  var key = _ref.key;
  var value = _ref.value;

  return idx.getKeys(key, value);
};

operands['$ne'] = function (idx, _ref2, filter) {
  var key = _ref2.key;
  var value = _ref2.value;

  return filter(idx, {
    type: '$not',
    value: { type: '$eq', key: key, value: value }
  });
};

operands['$or'] = unary(function (idx, _ref3, filter) {
  var value = _ref3.value;

  var result = {};

  for (var i = 0, len = value.length; i < len; i++) {
    var subcon = value[i];
    var keys = filter(idx, subcon);
    if (!keys) return;
    assign(result, keys);
  }

  return result;
});

operands['$nor'] = unary(function (idx, _ref4, filter) {
  var value = _ref4.value;

  return filter(idx, {
    type: '$not',
    value: { type: '$or', value: value }
  });
});

operands['$and'] = unary(function (idx, _ref5, filter) {
  var value = _ref5.value;

  var result = {};

  var _loop = function _loop() {
    var subcon = value[i];
    var keys = filter(idx, subcon);
    if (!keys) return {
        v: undefined
      };
    if (i === 0) assign(result, keys);else {
      each(result, function (_, key) {
        if (!keys[key]) delete result[key];
      });
    }
  };

  for (var i = 0, len = value.length; i < len; i++) {
    var _ret = _loop();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  return result;
});

operands['$in'] = function (idx, _ref6, filter) {
  var key = _ref6.key;
  var value = _ref6.value;

  return filter(idx, {
    type: '$or',
    value: value.map(function (subvalue) {
      return { type: '$eq', key: key, value: subvalue };
    })
  });
};

operands['$not'] = unary(function (idx, _ref7, filter) {
  var value = _ref7.value;

  var subcon = value;
  var result = filter(idx, subcon);

  if (result) return cloneWithoutKeys(idx.data, result);
});

operands['$nin'] = function (idx, _ref8, filter) {
  var key = _ref8.key;
  var value = _ref8.value;

  return filter(idx, {
    type: '$not',
    value: { type: '$in', key: key, value: value }
  });
};

module.exports = operands;

function unary(fn) {
  fn.unary = true;
  return fn;
}
},{"../utilities/each":9,"./clone_without_keys":2,"object-assign":1}],7:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/**
 * Internal: stringify values for index keys. Used to prevent collisions with,
 * say, `'true'` and `true`.
 */

module.exports = function (object) {
  if (typeof object === 'string') return '_' + object;
  if ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object') return JSON.stringify(object);
  return '' + object;
};
module.exports = JSON.stringify;
},{}],8:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var operands = require('./operands');
var fallbacks = require('./fallbacks');

/*
 * Converts a MongoDB-style query to an AST (abstract syntax tree) that's
 * faster to search with.
 *
 *     toAST({ name: 'john' })
 *     { type: '$eq', key: 'name', value: 'john' }
 *
 *     toAST({ name: { $in: [ 'john', 'joe' ] })
 *     { type: '$or', value:
 *       [ { type: '$eq', key: 'name', value: 'john' },
 *         { type: '$eq', key: 'name', value: 'john' } ] }
 */

module.exports = function toAST(condition, prefix) {
  if ((typeof condition === 'undefined' ? 'undefined' : _typeof(condition)) !== 'object') {
    return { type: '$eq', key: prefix, value: condition };
  }
  if (Array.isArray(condition)) {
    return condition.map(function (condition) {
      return toAST(condition, prefix);
    });
  }

  var keys = Object.keys(condition);

  if (keys.length === 1) {
    var operand = operands[keys[0]] || fallbacks[keys[0]];
    var value = condition[keys[0]];

    if (operand && operand.unary) {
      return { type: keys[0], key: prefix, value: toAST(value, prefix) };
    } else if (operand) {
      return { type: keys[0], key: prefix, value: condition[keys[0]] };
    }
  }

  var conditions = keys.map(function (key) {
    return toAST(condition[key], prefix ? prefix + '.' + key : key);
  });

  return conditions.length === 1 ? conditions[0] : { type: '$and', value: conditions };
};
},{"./fallbacks":3,"./operands":6}],9:[function(require,module,exports){
/**
 * each : each(list, fn)
 * Iterates through `list` (an array or an object). This is useful when dealing
 * with NodeLists like `document.querySelectorAll`.
 */

function each (list, fn) {
  if (!list) return

  var i
  var len = list.length
  var idx

  if (typeof len === 'number') {
    if (each.native) return each.native.call(list, fn)
    for (i = 0; i < len; i++) fn(list[i], i, i)
  } else {
    idx = 0
    for (i in list) {
      if (list.hasOwnProperty(i)) fn(list[i], i, idx++)
    }
  }

  return list
}

each.native = Array.prototype.forEach

module.exports = each

},{}],10:[function(require,module,exports){
'use strict'

module.exports = function get (object, keypath) {
  let result = object

  for (let i = 0, len = keypath.length; i < len; i++) {
    result = result[keypath[i]]
    if (!result) return result
  }

  return result
}

},{}],11:[function(require,module,exports){
/**
 * Internal: normalizes a keypath, allowing dot syntax, and normalizing them
 * all to strings.
 *
 *     normalizeKeypath('user.12.name')  // => ['user', '12', 'name']
 *     normalizeKeypath(['user', 12])    // => ['user', 12]
 */

module.exports = function normalizeKeypath (keypath, isArguments) {
  if (!keypath) return []
  if (typeof keypath === 'string') {
    return keypath.split('.')
  } else if (isArguments && keypath.length === 1) {
    if (Array.isArray(keypath[0])) return keypath[0].map((k) => '' + k)
    if (typeof keypath[0] === 'number') return [ '' + keypath[0] ]
    return ('' + keypath[0]).split('.')
  } else {
    if (isArguments) keypath = Array.prototype.slice.call(keypath)
    return keypath.map((k) => '' + k)
  }
}

},{}],12:[function(require,module,exports){

/**
 * Module Dependencies
 */

var expr;
try {
  expr = require('props');
} catch(e) {
  expr = require('component-props');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  };
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  };
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {};
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key]);
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  };
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val, i, prop;
  for (i = 0; i < props.length; i++) {
    prop = props[i];
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";

    // mimic negative lookbehind to avoid problems with nested properties
    str = stripNested(prop, str, val);
  }

  return str;
}

/**
 * Mimic negative lookbehind to avoid problems with nested properties.
 *
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
 *
 * @param {String} prop
 * @param {String} str
 * @param {String} val
 * @return {String}
 * @api private
 */

function stripNested (prop, str, val) {
  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
    return $1 ? $0 : val;
  });
}

},{"component-props":13,"props":13}],13:[function(require,module,exports){
/**
 * Global Names
 */

var globals = /\b(Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

},{}],14:[function(require,module,exports){
'use strict';

var map = require('../utilities/map');

/**
 * Internal: builds extensions based on parameters passed onto `.use()`.
 *
 *     buildExtensions({ 'users.*': props })
 *     // => [ /^users\.[^.]+$/, props ]
 */

module.exports = function buildExtensions(keypath, extensions) {
  var prefix = keypath.length ? keypath.join('.') + '.' : '';
  return map(extensions, function (properties, keypath) {
    keypath = (prefix + keypath).replace(/\./g, '\\.').replace(/\*\*/g, '::all::').replace(/\*/g, '::any::').replace(/::all::/g, '.*').replace(/::any::/g, '[^\.]+');

    keypath = new RegExp('^' + keypath + '$');
    return [keypath, properties];
  });
};

},{"../utilities/map":26}],15:[function(require,module,exports){
"use strict";

/**
 * Internal: decorates a function by inverting its result.
 */

module.exports = function negate(fn) {
  return function () {
    return !fn.apply(this, arguments);
  };
};

},{}],16:[function(require,module,exports){
/* eslint-disable new-cap */
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var Search = require('scour-search');
var assign = require('object-assign');
var buildExtensions = require('./build_extensions');
var normalizeKeypath = require('../utilities/normalize_keypath');
var utils = require('../utilities');
var negate = require('./negate');
var sortValues = require('../utilities/sort_values');
var toFunction = require('to-function');

/**
 * scour : scour(object)
 * Returns a scour instance wrapping `object`.
 *
 *    scour(obj)
 *
 * It can be called on any Object or Array. (In fact, it can be called on
 * anything, but is only generally useful for Objects and Arrays.)
 *
 *     data = { menu: { visible: true, position: 'left' } }
 *     scour(data).get('menu.visible')
 *
 *     list = [ { id: 2 }, { id: 5 }, { id: 12 } ]
 *     scour(list).get('0.id')
 *
 * __Chaining__:
 * You can use it to start method chains. In fact, the intended use is to keep
 * your root [scour] object around, and chain from this.
 *
 *     db = scour({ menu: { visible: true, position: 'left' } })
 *
 *     // Elsewhere:
 *     menu = db.go('menu')
 *     menu.get('visible')
 *
 * __Properties__:
 * It the [root], [value] and [keypath] properties.
 *
 *    s = scour(obj)
 *    s.root             // => [scour object]
 *    s.value            // => raw data (that is, `obj`)
 *    s.keypath          // => string array
 *
 * __Accessing the value:__
 * You can access the raw data using [value].
 *
 *    db = scour(data)
 *    db.value               // => same as `data`
 *    db.go('users').value   // => same as `data.users`
 */

function scour(value, options) {
  if (!(this instanceof scour)) return new scour(value, options);
  this.value = value;

  this.root = options && options.root || this;
  this.keypath = options && options.keypath || [];
  this.extensions = options && options.extensions || [];

  // Apply any property extensions
  if (this.extensions.length) this.applyExtensions();
}

scour.prototype = {
  /**
   * Chaining methods:
   * (Section) These methods are used to traverse nested structures. All these
   * methods return [scour] instances, making them suitable for chaining.
   *
   * #### On null values
   * Note that `undefined`, `false` and `null` values are still [scour]-wrapped
   * when returned from [go()], [at()] and [find()].
   *
   *     list = [ { name: 'Homer' }, { name: 'Bart' } ]
   *
   *     scour(list).at(4)         // => [ scour undefined ]
   *     scour(list).at(4).value   // => undefined
   *
   * This is done so that you can chain methods safely even when something is null.
   * This behavior is consistent with what you'd expect with jQuery.
   *
   *     data = { users: { ... } }
   *     db = scour(data)
   *
   *     db.go('blogposts').map((post) => post.get('title'))
   *     // => []
   */

  /**
   * go : go(keypath...)
   * Navigates down to a given `keypath`. Always returns a [scour] instance.
   * Rules [on null values] apply.
   *
   *     data =
   *       { users:
   *         { 12: { name: 'steve', last: 'jobs' },
   *           23: { name: 'bill', last: 'gates' } } }
   *
   *     scour(data).go('users')                    // => [scour (users)]
   *     scour(data).go('users', '12')              // => [scour (name, last)]
   *     scour(data).go('users', '12').get('name')  // => 'steve'
   *
   * __Dot notation:__
   * Keypaths can be given in dot notation or as an array. These statements are
   * equivalent.
   *
   *     scour(data).go('users.12')
   *     scour(data).go('users', '12')
   *     scour(data).go(['users', '12'])
   *
   * __Non-objects:__
   * If you use it on a non-object or non-array value, it will still be
   * returned as a [scour] instance. This is not likely what you want; use
   * [get()] instead.
   *
   *     attr = scour(data).go('users', '12', 'name')
   *     attr           // => [scour object]
   *     attr.value     // => 'steve'
   *     attr.keypath   // => ['users', '12', 'name']
   */

  go: function go() {
    var keypath = normalizeKeypath(arguments, true);
    var result = this.get.apply(this, keypath);
    return this._get(result, keypath);
  },

  /**
   * Internal: gathers multiple keys; not used yet
   */

  gather: function gather(keypaths) {
    var _this = this;

    var result;
    if (Array.isArray(this.value)) {
      result = keypaths.map(function (key, val) {
        return _this.get(key);
      });
    } else {
      result = utils.indexedMap(keypaths, function (key) {
        return [key, _this.get(key)];
      });
    }
    return this.reset(result);
  },

  /**
   * Returns the item at `index`. This differs from `go` as this searches by
   * index, not by key. This returns a the raw value, unlike [getAt()]. Rules
   * [on null values] apply.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     scour(users).at(0)          // => [scour { name: 'steve' }]
   *     scour(users).get(12)        // => [scour { name: 'steve' }]
   */

  at: function at(index) {
    if (Array.isArray(this.value)) {
      return this._get(this.value[index], ['' + index]);
    }

    var key = this.keys()[index];
    return this._get(key && this.value[key], ['' + key]);
  },

  /**
   * Returns the item at `index`. This differs from `get` as this searches by
   * index, not by key. This returns a the raw value, unlike [at()].
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     scour(users).at(0)           // => [scour { name: 'steve' }]
   *     scour(users).getAt(0)        // => { name: 'steve' }
   */

  getAt: function getAt(index) {
    if (Array.isArray(this.value)) return this.value[index];
    var key = this.keys()[index];
    return key && this.value[key];
  },

  /**
   * Sifts through the values and returns a set that matches given
   * `conditions`. Supports simple objects, MongoDB-style
   * queries, and functions.
   *
   *     scour(data).filter({ name: 'Moe' })
   *     scour(data).filter({ name: { $in: ['Larry', 'Curly'] })
   *     scour(data).filter((item) => item.get('name') === 'Moe')
   *
   * __Filter by object:__
   * If you pass an object as a condition, `filter()` will check if that object
   * coincides with the objects in the collection.
   *
   *     scour(data).filter({ name: 'Moe' })
   *
   * __Filter by function:__
   * You may pass a function as a parameter. In this case, the `item` being
   * passed to the callback will be a [scour]-wrapped object. The result
   * will also be a [scour]-wrapped object, making it chainable.
   *
   *     scour(data)
   *       .filter((item, key) => +item.get('price') > 200)
   *       .sortBy('price')
   *       .first()
   *
   * __Advanced queries:__
   * MongoDB-style queries are supported as provided by [sift.js].  For
   * reference, see [MongoDB Query Operators][query-ops].
   *
   *     scour(products).filter({ price: { $gt: 200 })
   *     scour(articles).filter({ published_at: { $not: null }})
   *
   * __Arrays or objects:__
   * Both arrays and array-like objects are supported. In this example below,
   * an object will be used as the input.
   *
   *     devices =
   *       { 1: { id: 1, name: 'Phone', mobile: true },
   *         2: { id: 2, name: 'Tablet', mobile: true },
   *         3: { id: 3, name: 'Desktop', mobile: false } }
   *
   *     scour(devices).filter({ mobile: true }).len()
   *     // => 2
   *
   * Also see [scour.filter()] for the unwrapped version.
   *
   * [query-ops]: https://docs.mongodb.org/manual/reference/operator/query/
   */

  filter: function filter(conditions) {
    if (!this.value) return this.reset([]);
    if (typeof conditions === 'function') {
      return this.filterByFunction(conditions);
    }
    return this.reset(Search(this.value).filter(conditions));
  },
  filterByFunction: function filterByFunction(fn) {
    var isArray = Array.isArray(this.value);
    var result;

    if (isArray) {
      result = [];
      this.each(function (val, key) {
        return fn(val, key) && result.push(val.value);
      });
    } else {
      result = {};
      this.each(function (val, key) {
        if (fn(val, key)) result[key] = val.value;
      });
    }

    return this.reset(result);
  },

  /**
   * Inverse of [filter()] -- see `filter()` documentation for details.
   */

  reject: function reject(conditions) {
    if (!this.value) return this.reset([]);
    if (typeof conditions === 'function') {
      return this.filterByFunction(negate(conditions));
    } else {
      return this.filter({ $not: conditions });
    }
  },

  /**
   * Returns the first value that matches `conditions`.  Supports MongoDB-style
   * queries. For reference, see [MongoDB Query Operators][query-ops]. Also
   * see [filter()], as this is functionally-equivalent to the first result of
   * `filter()`. Rules [on null values] apply.
   *
   * [query-ops]: https://docs.mongodb.org/manual/reference/operator/query/
   *
   *     scour(data).find({ name: 'john' })
   *     scour(data).find({ name: { $in: ['moe', 'larry'] })
   */

  find: function find(conditions) {
    var value = this.value;
    var key = Search(value).indexOf(conditions);
    if (key === -1) return;
    return this._get(value[key], [key]);
  },

  /**
   * Returns the first result as a [scour]-wrapped object. This is equivalent
   * to [at(0)](#at).
   */

  first: function first() {
    return this.at(0);
  },

  /**
   * Returns the first result as a [scour]-wrapped object. This is equivalent
   * to `at(len() - 1)`: see [at()] and [len()].
   */

  last: function last() {
    var len = this.len();
    return this.at(len - 1);
  },

  /**
   * Sorts a collection. Returns a [scour]-wrapped object suitable for
   * chaining. Like other chainable methods, this works on arrays as well as
   * objects.
   *
   *     data =
   *       { 0: { name: 'Wilma' },
   *         1: { name: 'Barney' },
   *         2: { name: 'Fred' } }
   *
   *     scour(data).sortBy('name').value
   *     // { 1: { name: 'Barney' },
   *     //   2: { name: 'Fred' },
   *     //   0: { name: 'Wilma' } }
   *
   * __Conditions:__
   * The given condition can be a string or a function. When it's given as a
   * function, the `item` being passed is a [scour]-wrapped object, just like
   * in [forEach()] (et al). These two examples below are
   * functionally-equivalent.
   *
   *     scour(data).sortBy('name')
   *     scour(data).sortBy((item) => item.get('name'))
   *
   * You may also define nested keys in dot-notation:
   *
   *     scour(data).sortBy('user.name')
   */

  sortBy: function sortBy(condition) {
    if (!this.value) return this.reset([]);
    var values;

    if (typeof condition === 'string') {
      var key = condition;
      condition = toFunction(key);
      // don't use `this.map` or `this.each` so we skip `new scour()`
      values = utils.map(this.value, function (value, key, index) {
        return {
          key: key, value: value, criteria: condition(value, key), index: index
        };
      });
    } else {
      values = this.map(function (value, key, index) {
        return {
          key: key, value: value.value, criteria: condition(value, key), index: index
        };
      });
    }

    var sorted = sortValues(values, Array.isArray(this.value));
    return this.reset(sorted);
  },

  /**
   * Reading methods:
   * (Section) For retrieving data.
   */

  /**
   * get : get(keypath...)
   * Returns data in a given `keypath`.
   *
   *     data =
   *       { users:
   *         { 12: { name: 'steve' },
   *           23: { name: 'bill' } } }
   *
   *     scour(data).get('users')       // => same as data.users
   *     scour(data).go('users').value  // => same as data.users
   *
   * __Dot notation:__
   * Like [go()], the `keypath` can be given in dot notation.
   *
   *     scour(data).get('books.featured.name')
   *     scour(data).get('books', 'featured', 'name')
   */

  get: function get() {
    if (!this.value) return;
    var keypath = normalizeKeypath(arguments, true);
    return utils.get(this.value, keypath);
  },

  /**
   * Returns the length of the object or array. For objects, it returns the
   * number of keys.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     names = scour(users).len()  // => 2
   */

  len: function len() {
    if (!this.value) return 0;
    if (Array.isArray(this.value)) return this.value.length;
    return this.keys().length;
  },

  /**
   * Returns an array. If the the value is an object, it returns the values of
   * that object. If the value is an array, it returns it as is. Also aliased
   * as `values()`.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     names = scour(users).toArray()
   *     // => [ {name: 'steve'}, {name: 'bill'} ]
   */

  toArray: function toArray() {
    if (Array.isArray(this.value)) return this.value;
    return scour.map(this.value, function (val, key) {
      return val;
    });
  },
  values: function values() {
    return this.toArray();
  },

  /**
   * Returns keys. If the value is an array, this returns the array's indices.
   * Also see [toArray()] to retrieve the values instead.
   */

  keys: function keys() {
    if (!this.value) return [];
    return Object.keys(this.value);
  },

  /**
   * Writing methods:
   * (Section) These are methods for modifying an object/array tree immutably.
   * Note that all these functions are immutable--it will not modify existing
   * data, but rather spawn new objects with the modifications done on them.
   */

  /**
   * Sets values immutably. Returns a copy of the same object ([scour]-wrapped)
   * with the modifications applied.
   *
   *     data = { bob: { name: 'Bob' } }
   *     db = scour(data)
   *     db.set([ 'bob', 'name' ], 'Robert')
   *     // db.value == { bob: { name: 'Robert' } }
   *
   * __Immutability:__
   * This is an immutable function, and will return a new object. It won't
   * modify your original object.
   *
   *     profile = scour({ name: 'John' })
   *     profile2 = profile.set('email', 'john@gmail.com')
   *
   *     profile.value   // => { name: 'John' }
   *     profile2.value  // => { name: 'John', email: 'john@gmail.com' }
   *
   * __Using within a scope:__
   * Be aware that using all writing methods ([set()], [del()], [extend()]) on
   * scoped objects (ie, made with [go()]) will spawn a new [root] object. If
   * you're keeping a reference to the root object, you'll need to update it
   * accordingly.
   *
   *     db = scour(data)
   *     book = db.go('book')
   *     book.root === db       // correct so far
   *
   *     book = book.set('title', 'IQ84')
   *     book = book.del('sale_price')
   *     book.root !== db      // `root` has been updated
   *
   * __Dot notation:__
   * Like [go()] and [get()], the keypath can be given in dot notation or an
   * array.
   *
   *     scour(data).set('menu.left.visible', true)
   *     scour(data).set(['menu', 'left', 'visible'], true)
   */

  set: function set(keypath, value) {
    keypath = normalizeKeypath(keypath);

    if (this.root !== this) {
      return this.root.set(this.keypath.concat(keypath), value).go(this.keypath);
    }

    // use .valueOf() to denature any scour-wrapping or String() or whatnot
    var result = scour.set(this.value || {}, keypath, value.valueOf());
    return this.reset(result, { root: null });
  },

  /**
   * Deletes values immutably. Returns a copy of the same object
   * ([scour]-wrapped) with the modifications applied.
   *
   * Like [set()], the keypath can be given in dot notation or an
   * array.
   *
   *    scour(data).del('menu.left.visible')
   *    scour(data).del(['menu', 'left', 'visible'])
   *
   * See [set()] for more information on working with immutables.
   */

  del: function del(keypath) {
    if (!this.value) return this;
    keypath = normalizeKeypath(keypath);

    if (this.root !== this) {
      return this.root.del(this.keypath.concat(keypath)).go(this.keypath);
    }

    var result = scour.del(this.value, keypath);
    return this.reset(result, { root: null });
  },

  /**
   * extend : extend(objects...)
   * Extends the data with more values. Returns a [scour]-wrapped object. Only
   * supports objects; arrays and non-objects will return undefined. Just like
   * [Object.assign], you may pass multiple objects to the parameters.
   *
   *    data  = { a: 1, b: 2 }
   *    data2 = scour(data).extend({ c: 3 })
   *
   *    data2  // => [scour { a: 1, b: 2, c: 3 }]
   *    data2.value   // => { a: 1, b: 2, c: 3 }
   *
   * See [set()] for more information on working with immutables.
   */

  extend: function extend() {
    if (_typeof(this.value) !== 'object' || Array.isArray(this.value)) return;
    var result = {};
    assign(result, this.value);
    for (var i = 0, len = arguments.length; i < len; i++) {
      if (_typeof(arguments[i]) !== 'object') return;
      assign(result, arguments[i]);
    }

    if (this.root !== this) {
      return this.root.set(this.keypath, result).go(this.keypath);
    }

    return this.reset(result, { root: false });
  },

  /**
   * Utility methods:
   * (Section) For stuff.
   */

  /**
   * use : use(extensions)
   * Extends functionality for certain keypaths with custom methods.
   * See [Extensions example] for examples.
   *
   *     data =
   *       { users:
   *         { 12: { name: 'steve', surname: 'jobs' },
   *           23: { name: 'bill', surname: 'gates' } } }
   *
   *     extensions = {
   *       'users.*': {
   *         fullname () {
   *           return this.get('name') + ' ' + this.get('surname')
   *         }
   *       }
   *     }
   *
   *     scour(data)
   *       .use(extensions)
   *       .get('users', 12)
   *       .fullname()       // => 'bill gates'
   *
   * __Extensions format:__
   * The parameter `extension` is an object, with keys being keypath globs, and
   * values being properties to be extended.
   *
   *     .use({
   *       'books.*': { ... },
   *       'authors.*': { ... },
   *       'publishers.*': { ... }
   *      })
   *
   * __Extending root:__
   * To bind properties to the root method, use an empty string as the keypath.
   *
   *     .use({
   *       '': {
   *         users() { return this.go('users') },
   *         authors() { return this.go('authors') }
   *       }
   *     })
   *
   * __Keypath filtering:__
   * You can use glob-like `*` and `**` to match parts of a keypath. A `*` will
   * match any one segment, and `**` will match one or many segments. Here are
   * some examples:
   *
   * - `users.*` - will match `users.1`, but not `users.1.photos`
   * - `users.**` - will match `users.1.photos`
   * - `users.*.photos` - will match `users.1.photos`
   * - `**` will match anything
   *
   * __When using outside root:__
   * Any extensions in a scoped object (ie, made with [go()]) will be used relative
   * to it. For instance, if you define an extension to `admins.*` inside
   * `.go('users')`, it will affect `users.
   *
   *     data = { users: { john: { } }
   *     db = scour(data)
   *
   *     users = db.go('users')
   *       .use({ '*': { hasName () { return !!this.get('name') } })
   *
   *     users.go('john').hasName()      // works
   *
   * While this is supported, it is *not* recommended: these extensions will not
   * propagate back to the root, and any objects taken from the root will not
   * have those extensions applied to them.
   *
   *     users.go('john').hasName()              // works
   *     db.go('users.john').hasName()           // doesn't work
   */

  use: function use(spec) {
    var extensions = buildExtensions(this.keypath, spec);
    if (this.root === this) {
      return this.reset(this.value, { extensions: extensions, root: null });
    } else {
      // Spawn a new `root` with the extensions applied
      return this.root.reset(this.root.value, { extensions: extensions, root: null }).reset(this.value, { keypath: this.keypath });
    }
  },

  /**
   * Returns the value for serialization. This allows `JSON.stringify()` to
   * work with `scour`-wrapped objects. The name of this method is a bit
   * confusing, as it doesn't actually return a JSON string — but I'm afraid
   * that it's the way that the JavaScript API for [JSON.stringify] works.
   *
   * [JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON%28%29_behavior
   */

  toJSON: function toJSON() {
    return this.value;
  },
  valueOf: function valueOf() {
    return this.value;
  },
  toString: function toString() {
    return '[scour (' + this.keys().join(', ') + ')]';
  },

  /**
   * Iteration methods:
   * (Section) These methods are generally useful for collections. These
   * methods can work with either arrays or array-like objects, such as
   * below.
   *
   *     subjects =
   *       { 1: { id: 1, title: 'Math', level: 101 },
   *         2: { id: 2, title: 'Science', level: 103 },
   *         3: { id: 3, title: 'History', level: 102 } }
   *
   * __Values:__
   * For all these functions, The items passed onto the callbacks _is_ a
   * [scour]-wrapped object. Use `item.value` or `this` to access the raw
   * values.
   *
   *     scour(subjects).forEach((subject, key) => {
   *       console.log(subject.get('title'))
   *     })
   *
   * __Return values:__
   * For methods that return values (such as [map()], the returned results _is
   * not_ a [scour]-wrapped object, and isn't suitable for chaining.
   *
   *     scour(subjects).map((subject, key) => {
   *       return subject.get('title') + ' ' + subject.get('level')
   *     })
   *     // => [ 'Math 101', 'Science 103', 'History 102' ]
   */

  /**
   * forEach : forEach(function(item, key, index))
   * Loops through each item. Supports both arrays and objects.
   * The rules specified in [Iteration methods] apply.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     scour(users).each((user, key) => {
   *       console.log(user.get('name'))
   *     })
   *
   * The values passed onto the function are:
   *
   * - `item` - the value; always a scour object.
   * - `key` - the key.
   * - `index` - the index.
   */

  forEach: function forEach(fn) {
    var _this2 = this;

    var index = 0;
    scour.each(this.value, function (val, key) {
      fn.call(val, _this2._get(val, [key]), key, index++);
    });
    return this;
  },

  /**
   * Alias for [forEach](#foreach).
   */

  each: function each(fn) {
    return this.forEach(fn);
  },

  /**
   * map : map(function(item, key))
   * Loops through each item and returns an array based on the iterator's
   * return values. Supports both arrays and objects.
   * The rules specified in [Iteration methods] apply.
   *
   *     users =
   *       { 12: { name: 'Steve' },
   *         23: { name: 'Bill' } }
   *
   *     names = scour(users).map((user, key) => user.get('name'))
   *     // => [ 'Steve', 'Bill' ]
   */

  map: thisify(utils.map),

  /**
   * mapObject : mapObject(function(val, key))
   * Creates a new `Object` with with the results of calling a provided function
   * on every element in this array. Works like [Array#map], but also works on
   * objects as well as arrays, and it returns an object instead.
   * The rules specified in [Iteration methods] apply.
   *
   * See [scour.mapObject()] for details and the non-wrapped version.
   */

  mapObject: thisify(utils.mapObject),

  /**
   * indexedMap : indexedMap(function(val, key))
   * Creates a new `Object` with with the results of calling a provided function
   * returning the keys and values for the new object.
   * The rules specified in [Iteration methods] apply.
   *
   * See [scour.indexedMap()] for details and the non-wrapped version.
   */

  indexedMap: thisify(utils.indexedMap),

  /**
   * Internal: spawns an instance with a given data and keypath.
   */

  _get: function _get(result, keypath) {
    return this.reset(result, {
      keypath: this.keypath.concat(keypath)
    });
  },

  /**
   * Returns a clone with the `value` replaced. The new instance will
   * retain the same properties, so things like [use()] extensions are carried
   * over.
   *
   *     db = scour({ name: 'hello' })
   *     db.value  //=> { name: 'hello' }
   *
   *     db = db.reset({})
   *     db.value  // => {}
   *
   * This is useful for, say, using Scour with [Redux] and implementing an
   * action to reset the state back to empty.
   */

  reset: function reset(value, options) {
    var op = options || {};
    return new scour(value, {
      root: typeof op.root !== 'undefined' ? op.root : this.root,
      keypath: typeof op.keypath !== 'undefined' ? op.keypath : this.keypath,
      extensions: typeof op.extensions !== 'undefined' ? this.extensions.concat(op.extensions) : this.extensions
    });
  },

  /**
   * Internal: applies extensions
   */

  applyExtensions: function applyExtensions() {
    var _this3 = this;

    var path = this.keypath.join('.');

    this.extensions.forEach(function (extension) {
      // extension is [ RegExp, properties object ]
      if (extension[0].test(path)) assign(_this3, extension[1]);
    });
  }
};

/**
 * Attributes:
 * (Section) These attributes are available to [scour] instances.
 */

/**
 * value : value
 * The raw value being wrapped. You can use this to terminate a chained call.
 *
 *     users =
 *       [ { name: 'john', admin: true },
 *         { name: 'kyle', admin: false } ]
 *
 *     scour(users)
 *       .filter({ admin: true })
 *       .value
 *     // => [ { name: 'john', admin: true } ]
 */

/**
 * root : root
 * A reference to the root [scour] instance.
 * Everytime you traverse using [go()], a new [scour] object is spawned that's
 * scoped to a keypath.  Each of these [scour] objects have a `root` attribute
 * that's a reference to the top-level [scour] object.
 *
 *     db = scour(...)
 *
 *     photos = db.go('photos')
 *     photos.root    // => same as `db`
 *
 * This allows you to return to the root when needed.
 *
 *     db = scour(...)
 *     artist = db.go('artists', '9328')
 *     artist.root.go('albums').find({ artist_id: artist.get('id') })
 */

/**
 * keypath : keypath
 * An array of strings representing each step in how deep the current scope is
 * relative to the root. Each time you traverse using [go()], a new [scour]
 * object is spawned.
 *
 *     db = scour(...)
 *
 *     users = db.go('users')
 *     users.keypath            // => ['users']
 *
 *     admins = users.go('admins')
 *     admins.keypath           // => ['users', 'admins']
 *
 *     user = admins.go('23')
 *     user.keypath             // => ['users', 'admins', '23']
 */

// Export utilities
assign(scour, utils);

/**
 * Internal: decorates collection functions
 */

function thisify(fn) {
  return function () {
    return fn.bind(null, this.forEach.bind(this)).apply(this, arguments);
  };
}

module.exports = scour;

},{"../utilities":24,"../utilities/normalize_keypath":28,"../utilities/sort_values":31,"./build_extensions":14,"./negate":15,"object-assign":1,"scour-search":4,"to-function":12}],17:[function(require,module,exports){
'use strict';

module.exports = function clone(object) {
  var assign = require('object-assign');
  return Array.isArray(object) ? [].slice.call(object) : assign({}, object);
};

},{"object-assign":1}],18:[function(require,module,exports){
'use strict';

/**
 * Clones an object but misses a key.
 */

module.exports = function cloneWithout(object, key) {
  if (Array.isArray(object)) {
    return object.slice(0, +key).concat(object.slice(+key + 1));
  } else {
    var result = {};
    key = '' + key;
    for (var k in object) {
      if (object.hasOwnProperty(k) && key !== k) {
        result[k] = object[k];
      }
    }
    return result;
  }
};

},{}],19:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var clone = require('./clone');
var cloneWithout = require('./clone_without');

/**
 * Deletes a `keypath` from an `object` immutably.
 *
 *     data = { users: { bob: { name: 'robert' } } }
 *     result = del(data, ['users', 'bob', 'name'])
 *
 *     result = { users: { bob: {} } }
 */

module.exports = function del(object, keypath) {
  var results = {};
  var parents = {};
  var i, len;

  for (i = 0, len = keypath.length; i < len; i++) {
    if (i === 0) {
      parents[i] = object;
    } else {
      parents[i] = parents[i - 1][keypath[i - 1]];
      if (!parents[i] || _typeof(parents[i]) !== 'object') {
        return object;
      }
    }
  }

  for (i = keypath.length - 1; i >= 0; i--) {
    if (i === keypath.length - 1) {
      results[i] = cloneWithout(parents[i], keypath[i]);
      delete results[i][keypath[i]];
    } else {
      results[i] = clone(parents[i]);
      results[i][keypath[i]] = results[i + 1];
    }
  }

  return results[0];
};

},{"./clone":17,"./clone_without":18}],20:[function(require,module,exports){
'use strict';

/**
 * each : each(list, fn)
 * Iterates through `list` (an array or an object). This is useful when dealing
 * with NodeLists like `document.querySelectorAll`.
 */

function each(list, fn) {
  if (!list) return;

  var i;
  var len = list.length;
  var idx;

  if (typeof len === 'number') {
    if (each.native) return each.native.call(list, fn);
    for (i = 0; i < len; i++) {
      fn(list[i], i, i);
    }
  } else {
    idx = 0;
    for (i in list) {
      if (list.hasOwnProperty(i)) fn(list[i], i, idx++);
    }
  }

  return list;
}

each.native = Array.prototype.forEach;

module.exports = each;

},{}],21:[function(require,module,exports){
'use strict';

var get = require('./get');
var set = require('./set');
var assign = require('object-assign');

module.exports = function extendIn(source, keypath, extensions) {
  if (keypath.length === 0) return assign({}, source, extensions);

  var data = assign({}, get(source, keypath));

  for (var i = 2, len = arguments.length; i < len; i++) {
    assign(data, arguments[i]);
  }

  return set(source, keypath, data);
};

},{"./get":23,"./set":29,"object-assign":1}],22:[function(require,module,exports){
'use strict';

var forEach = require('./each');

module.exports = function filter(each, fn, _isArray) {
  var isArray = typeof _isArray !== 'undefined' ? _isArray : Array.isArray(each);
  var result;

  if (typeof each !== 'function') each = forEach.bind(this, each);

  if (isArray) {
    result = [];
    each(function (val, key) {
      if (fn.apply(this, arguments)) result.push(val);
    });
  } else {
    result = {};
    each(function (val, key) {
      if (fn.apply(this, arguments)) result[key] = val;
    });
  }

  return result;
};

},{"./each":20}],23:[function(require,module,exports){
'use strict';

module.exports = function get(object, keypath) {
  var result = object;

  for (var i = 0, len = keypath.length; i < len; i++) {
    result = result[keypath[i]];
    if (!result) return result;
  }

  return result;
};

},{}],24:[function(require,module,exports){
'use strict';

/**
 * Utility functions:
 * (Section) These are utilities that don't need a wrapped object.
 */

/**
 * scour.get : scour.get(object, keypath)
 * Gets a keypath from an object.
 *
 *     data = { users: { bob: { name: 'john' } } }
 *
 *     result = get(data, ['users', 'bob', 'name'])
 *     // => 'robert'
 *
 * This is also available as `require('scourjs/utilities/get')`.
 */

exports.get = require('./get');

/**
 * scour.set : scour.set(object, keypath, value)
 * Sets a `keypath` into an `object` immutably.
 *
 *     data = { users: { bob: { name: 'john' } } }
 *
 *     result = set(data, ['users', 'bob', 'name'], 'robert')
 *     // => { users: { bob: { name: 'robert' } } }
 *
 * This is also available as `require('scourjs/utilities/set')`.
 */

exports.set = require('./set');

/**
 * scour.del : scour.del(object, keypath)
 * Deletes a `keypath` from an `object` immutably.
 *
 *     data = { users: { bob: { name: 'robert' } } }
 *     result = del(data, ['users', 'bob', 'name'])
 *
 *     // => { users: { bob: {} } }
 *
 * This is also available as `require('scourjs/utilities/del')`.
 */

exports.del = require('./del');

/**
 * scour.extendIn : scour.extendIn(object, keypath, extensions...)
 * Extends a `keypath` from an `object` immutably.
 *
 *     data = { users: { bob: { name: 'robert' } } }
 *     result = extendIn(data, ['users', 'bob'], { email: 'bob@gmail.com' })
 *
 *     // => { users: { bob: { name: 'robert', email: 'bob@gmail.com' } } }
 *
 * This is also available as `require('scourjs/utilities/extend_in')`.
 */

exports.extendIn = require('./extend_in');

/**
 * scour.each : scour.each(iterable, fn)
 * Iterates through `iterable`, either an object or an array. This is an
 * implementation of [Array#forEach] that also works for objects. The callback
 * `fn` will be invoked with two parameters: `currentValue` and `key`, just
 * like `Array#forEach`.
 *
 * This is also available as `require('scourjs/utilities/each')`.
 *
 * [Array#forEach]: http://devdocs.io/javascript/global_objects/array/foreach
 */

exports.each = require('./each');

/**
 * scour.map : scour.map(iterable, fn)
 * Creates a new `Array` with with the results of calling a provided function
 * on every element in this array. Works like [Array#map], but also works on
 * objects as well as arrays.
 *
 * The callback `fn` will be invoked with two parameters: `currentValue` and
 * `key`, just like [Array#map].
 *
 * This is also available as `require('scourjs/utilities/map')`.
 *
 * [Array#map]: http://devdocs.io/javascript/global_objects/array/map
 */

exports.map = require('./map');

/**
 * scour.mapObject : scour.mapObject(iterable, fn)
 * Creates a new `Object` with with the results of calling a provided function
 * on every element in this array. Works like [Array#map], but also works on
 * objects as well as arrays, and it returns an object instead.
 *
 * The callback `fn` will be invoked with two parameters: `currentValue` and
 * `key`, just like [Array#map].
 *
 *     object = { a: 20, b: 30, c: 40 }
 *     result = scour.mapObject(object, (val, key) => {
 *       return '$' + val + '.00'
 *     })
 *
 *     // => { a: '$20.00', b: '$30.00', c: '$40.00' }
 *
 * This is also available as `require('scourjs/utilities/map_object')`.
 */

exports.mapObject = require('./map_object');

/**
 * scour.indexedMap : scour.indexedMap(iterable, fn)
 * Creates a new `Object` with with the results of calling a provided function
 * returning the keys and values for the new object.
 *
 * The callback `fn` will be invoked with two parameters: `currentValue` and
 * `key`, just like [Array#map].
 *
 * The callback `fn` should return an array with two elements: with `result[0]`
 * being the key, and `result[1]` being the value. These are what the new
 * object will be constructed with.
 *
 * The `iterable` parameter can be an object or an array. This works like
 * `Array#map`, but also works on objects as well as arrays.
 *
 *     list = ['Fred', 'Barney', 'Wilma']
 *
 *     object = scour.indexedMap(list, (val, key) => {
 *       var newkey = val.substr(0, 1)
 *       return [ newkey, val ]
 *     })
 *
 *     // => { f: 'Fred', b: 'Barney', w: 'Wilma' }
 *
 * This is also available as `require('scourjs/utilities/indexed_map')`.
 */

exports.indexedMap = require('./indexed_map');

/**
 * scour.filter : scour.filter(iterable, function(val, key), [isArray])
 * Creates a new Array or Object with all elements that pass the test
 * implemented by the provided function.
 *
 * Works like [Array#filter], but will return an object if an object is also passed.
 *
 * The optional `isArray` argument, when passed `true`, will always make this
 * return an `Array`. If `false`, it will always be an `Object`. Leave it
 * `undefined` for the default behavior.
 *
 * This is also available as `require('scourjs/utilities/filter')`.
 *
 * [Array#filter]: http://devdocs.io/javascript/global_objects/array/filter
 */

exports.filter = require('./filter');

/**
 * scour.sortBy : scour.sortBy(iterable, criteria)
 * Sorts by a given criteria.
 *
 *     list = [ { name: 'Fred' }, { name: 'Barney' }, { name: 'Wilma' } ]
 *     scour.sortBy(list, 'name')
 *
 * This is also available as `require('scourjs/utilities/sort_by')`.
 */

exports.sortBy = require('./sort_by');

},{"./del":19,"./each":20,"./extend_in":21,"./filter":22,"./get":23,"./indexed_map":25,"./map":26,"./map_object":27,"./set":29,"./sort_by":30}],25:[function(require,module,exports){
'use strict';

var forEach = require('./each');

module.exports = function indexedMap(each, fn) {
  /* istanbul ignore next */
  if (typeof each !== 'function') each = forEach.bind(this, each);
  var result = {};
  each(function () {
    var item = fn.apply(this, arguments);
    result[item[0]] = item[1];
  });
  return result;
};

},{"./each":20}],26:[function(require,module,exports){
'use strict';

var forEach = require('./each');

module.exports = function map(each, fn) {
  if (typeof each !== 'function') each = forEach.bind(this, each);
  var result = [];
  each(function () {
    result.push(fn.apply(this, arguments));
  });
  return result;
};

},{"./each":20}],27:[function(require,module,exports){
'use strict';

var forEach = require('./each');

module.exports = function mapObject(each, fn) {
  if (typeof each !== 'function') each = forEach.bind(this, each);
  var result = {};
  each(function (val, key) {
    result[key] = fn.apply(this, arguments);
  });
  return result;
};

},{"./each":20}],28:[function(require,module,exports){
'use strict';

/**
 * Internal: normalizes a keypath, allowing dot syntax, and normalizing them
 * all to strings.
 *
 *     normalizeKeypath('user.12.name')  // => ['user', '12', 'name']
 *     normalizeKeypath(['user', 12])    // => ['user', 12]
 */

module.exports = function normalizeKeypath(keypath, isArguments) {
  if (typeof keypath === 'string') {
    return keypath.split('.');
  } else if (isArguments && keypath.length === 1) {
    if (Array.isArray(keypath[0])) return keypath[0].map(function (k) {
      return '' + k;
    });
    if (typeof keypath[0] === 'number') return ['' + keypath[0]];
    return ('' + keypath[0]).split('.');
  } else {
    if (isArguments) keypath = Array.prototype.slice.call(keypath);
    return keypath.map(function (k) {
      return '' + k;
    });
  }
};

},{}],29:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var clone = require('./clone');

/**
 * Sets a `keypath` into an `object` immutably.
 *
 *     data = { users: { bob: { name: 'john' } } }
 *     result = set(data, ['users', 'bob', 'name'], 'robert')
 */

module.exports = function set(object, keypath, value) {
  var results = {};
  var parents = {};
  var i, len;

  for (i = 0, len = keypath.length; i < len; i++) {
    if (i === 0) {
      parents[i] = object;
    } else {
      parents[i] = parents[i - 1][keypath[i - 1]] || {};
      // handle cases when it isn't an object
      if (_typeof(parents[i]) !== 'object') {
        parents[i] = {};
      }
    }
  }

  for (i = keypath.length; i >= 0; i--) {
    if (!parents[i]) {
      results[i] = value;
    } else {
      results[i] = clone(parents[i]);
      results[i][keypath[i]] = results[i + 1];
    }
  }

  return results[0];
};

},{"./clone":17}],30:[function(require,module,exports){
'use strict';

var map = require('./map');
var forEach = require('./each');
var toFunction = require('to-function');
var sortValues = require('./sort_values');

module.exports = function sortBy(each, condition, isArray) {
  if (typeof isArray === 'undefined' && !Array.isArray(each)) isArray = false;
  if (typeof each !== 'function') each = forEach.bind(this, each);

  condition = toFunction(condition);

  var values = map(each, function (value, key, index) {
    return {
      key: key, value: value, criteria: condition(value, key), index: index
    };
  });

  return sortValues(values, isArray);
};

},{"./each":20,"./map":26,"./sort_values":31,"to-function":12}],31:[function(require,module,exports){
'use strict';

var indexedMap = require('../utilities/indexed_map');
var map = require('../utilities/map');

/*
 * Internal: Sorts a `{ key, value, criteria, index }` tuple array by
 * `criteria`. Returns the array of values if `isArray` is not `false`,
 * or an object indexed by `key` otherwise.
 */

module.exports = function sortValues(values, isArray) {
  var sorted = values.sort(function (left, right) {
    var a = left.criteria;
    var b = right.criteria;
    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }
    return a.index - b.index;
  });

  if (isArray === false) {
    return indexedMap(sorted, function (res) {
      return [res.key, res.value];
    });
  } else {
    return map(sorted, function (res) {
      return res.value;
    });
  }
};

},{"../utilities/indexed_map":25,"../utilities/map":26}]},{},[16])(16)
});