(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.scour = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../utilities/map":16}],2:[function(require,module,exports){
"use strict";

/**
 * Internal: decorates a function by inverting its result.
 */

module.exports = function negate(fn) {
  return function () {
    return !fn.apply(this, arguments);
  };
};

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
/*
 * Sift 2.x
 *
 * Copryright 2015, Craig Condon
 * Licensed under MIT
 *
 * Filter JavaScript objects with mongodb queries
 */

(function() {

  'use strict';

  /**
   */

  function isFunction(value) {
    return typeof value === 'function';
  }

  /**
   */

  function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  }

  /**
   */

  function comparable(value) {
    if (value instanceof Date) {
      return value.getTime();
    } else if (value instanceof Array) {
      return value.map(comparable);
    } else {
      return value;
    }
  }

  /**
   */

  function or(validator) {
    return function(a, b) {
      if (!isArray(b) || !b.length) return validator(a, b);
      for (var i = 0, n = b.length; i < n; i++) if (validator(a, b[i])) return true;
      return false;
    }
  }

  /**
   */

  function and(validator) {
    return function(a, b) {
      if (!isArray(b) || !b.length) return validator(a, b);
      for (var i = 0, n = b.length; i < n; i++) if (!validator(a, b[i])) return false;
      return true;
    };
  }

  function validate(validator, b) {
    return validator.v(validator.a, b);
  }


  var operator = {

    /**
     */

    $eq: or(function(a, b) {
      return a(b);
    }),

    /**
     */

    $ne: and(function(a, b) {
      return !a(b);
    }),

    /**
     */

    $or: function(a, b) {
      for (var i = 0, n = a.length; i < n; i++) if (validate(a[i], b)) return true;
      return false;
    },

    /**
     */

    $gt: or(function(a, b) {
      return typeof comparable(b) === typeof a && comparable(b) > a;
    }),

    /**
     */

    $gte: or(function(a, b) {
      return typeof comparable(b) === typeof a && comparable(b) >= a;
    }),

    /**
     */

    $lt: or(function(a, b) {
      return typeof comparable(b) === typeof a && comparable(b) < a;
    }),

    /**
     */

    $lte: or(function(a, b) {
      return typeof comparable(b) === typeof a && comparable(b) <= a;
    }),

    /**
     */

    $mod: or(function(a, b) {
      return b % a[0] == a[1];
    }),

    /**
     */

    $in: function(a, b) {

      if (b instanceof Array) {
        for (var i = b.length; i--;) {
          if (~a.indexOf(comparable(b[i]))) return true;
        }
      } else {
        return !!~a.indexOf(comparable(b));
      }

      return false;
    },

    /**
     */

    $nin: function(a, b) {
      return !operator.$in(a, b);
    },

    /**
     */

    $not: function(a, b) {
      return !validate(a, b);
    },

    /**
     */

    $type: function(a, b) {
      return b != void 0 ? b instanceof a || b.constructor == a : false;
     },

    /**
     */

    $all: function(a, b) {
      if (!b) b = [];
      for (var i = a.length; i--;) {
        if (!~comparable(b).indexOf(a[i])) return false;
      }
      return true;
    },

    /**
     */

    $size: function(a, b) {
      return b ? a === b.length : false;
    },

    /**
     */

    $nor: function(a, b) {
      // todo - this suffice? return !operator.$in(a)
      for (var i = 0, n = a.length; i < n; i++) if (validate(a[i], b)) return false;
      return true;
    },

    /**
     */

    $and: function(a, b) {
      for (var i = 0, n = a.length; i < n; i++) if (!validate(a[i], b)) return false;
      return true;
    },

    /**
     */

    $regex: or(function(a, b) {
      return typeof b === 'string' && a.test(b);
    }),

    /**
     */

    $where: function(a, b) {
      return a.call(b, b);
    },

    /**
     */

    $elemMatch: function(a, b) {
      if (isArray(b)) return !!~search(b, a);
      return validate(a, b);
    },

    /**
     */

    $exists: function(a, b) {
      return (b != void 0) === a;
    }
  };

  /**
   */

  var prepare = {

    /**
     */

    $eq: function(a) {

      if (a instanceof RegExp) {
        return function(b) {
          return typeof b === 'string' && a.test(b);
        };
      } else if (a instanceof Function) {
        return a;
      } else if (isArray(a) && !a.length) {
        // Special case of a == []
        return function(b) {
          return (isArray(b) && !b.length);
        };
      } else if (a === null){
        return function(b){
          //will match both null and undefined
          return b == null;
        }
      }

      return function(b) {
        return a === comparable(b);
      };
    },

    /**
     */

    $ne: function(a) {
      return prepare.$eq(a);
    },

    /**
     */

    $and: function(a) {
      return a.map(parse);
    },

    /**
     */

    $or: function(a) {
      return a.map(parse);
    },

    /**
     */

    $nor: function(a) {
      return a.map(parse);
    },

    /**
     */

    $not: function(a) {
      return parse(a);
    },

    /**
     */

    $regex: function(a, query) {
      return new RegExp(a, query.$options);
    },

    /**
     */

    $where: function(a) {
      return typeof a === 'string' ? new Function('obj', 'return ' + a) : a;
    },

    /**
     */

    $elemMatch: function(a) {
      return parse(a);
    },

    /**
     */

    $exists: function(a) {
      return !!a;
    }
  };

  /**
   */

  function search(array, validator) {

    for (var i = 0; i < array.length; i++) {
      if (validate(validator, array[i])) {
        return i;
      }
    }

    return -1;
  }

  /**
   */

  function createValidator(a, validate) {
    return { a: a, v: validate };
  }

  /**
   */

  function nestedValidator(a, b) {
    var values  = [];
    findValues(b, a.k, 0, values);

    if (values.length === 1) {
      return validate(a.nv, values[0]);
    }

    return !!~search(values, a.nv);
  }

  /**
   */

  function findValues(current, keypath, index, values) {

    if (index === keypath.length || current == void 0) {
      values.push(current);
      return;
    }

    if (isArray(current)) {
      for (var i = 0, n = current.length; i < n; i++) {
        findValues(current[i], keypath, index, values);
      }
    } else {
      findValues(current[keypath[index]], keypath, index + 1, values);
    }
  }

  /**
   */

  function createNestedValidator(keypath, a) {
    return { a: { k: keypath, nv: a }, v: nestedValidator };
  }

  /**
   * flatten the query
   */

  function parse(query) {
    query = comparable(query);

    if (!query || (query.constructor.toString() !== 'Object' &&
        query.constructor.toString().replace(/\n/g,'').replace(/ /g, '') !== 'functionObject(){[nativecode]}')) { // cross browser support
      query = { $eq: query };
    }

    var validators = [];

    for (var key in query) {
      var a = query[key];

      if (key === '$options') continue;

      if (operator[key]) {
        if (prepare[key]) a = prepare[key](a, query);
        validators.push(createValidator(comparable(a), operator[key]));
      } else {
        if (key.charCodeAt(0) === 36) {
          throw new Error('Unknown operation ' + key);
        }
        validators.push(createNestedValidator(key.split('.'), parse(a)));
      }
    }

    return validators.length === 1 ? validators[0] : createValidator(validators, operator.$and);
  }

  /**
   */

  function createRootValidator(query, getter) {
    var validator = parse(query);
    if (getter) {
      validator = {
        a: validator,
        v: function(a, b) {
          return validate(a, getter(b));
        }
      };
    }
    return validator;
  }

  /**
   */

  function sift(query, array, getter) {

    if (isFunction(array)) {
      getter = array;
      array  = void 0;
    }

    var validator = createRootValidator(query, getter);

    function filter(b) {
      return validate(validator, b);
    }

    if (array) {
      if (Array.isArray(array)) {
        return array.filter(filter);
      } else {
        return objectFilter(array, filter);
      }
    }

    return filter;
  }

  /**
   */

  sift.use = function(plugin) {
    if (isFunction(plugin)) return plugin(sift);
    for (var key in plugin) {
      if (key.charCodeAt(0) === 36) operator[key] = plugin[key];
    }
  };

  /**
   */

  sift.indexOf = function(query, array, getter) {
    return search(array, createRootValidator(query, getter));
  };

  /**
   */

  sift.keyOf = function(query, object, getter) {
    var validator = createRootValidator(query, getter);

    for (var key in object) {
      if (!object.hasOwnProperty(key)) continue;
      if (validate(validator, object[key])) {
        return key;
      }
    }
  };

  /**
   */

  function objectFilter(object, filter) {
    var result = {};

    for (var key in object) {
      if (!object.hasOwnProperty(key)) continue;
      var value = object[key];
      if (filter(value)) result[key] = value;
    }

    return result;
  }

  /* istanbul ignore next */
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = sift;
  }

  if (typeof window !== 'undefined') {
    window.sift = sift;
  }
})();

},{}],6:[function(require,module,exports){
/* eslint-disable new-cap */
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var sift = require('sift');
var assign = require('object-assign');
var buildExtensions = require('./lib/build_extensions');
var normalizeKeypath = require('./lib/normalize_keypath');
var utils = require('./utilities');
var negate = require('./lib/negate');

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
    return this.replace(result);
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
    if (!this.value) return this.replace([]);
    if (typeof conditions === 'function') {
      return this.filterByFunction(conditions);
    }
    return this.replace(sift(conditions, this.value));
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

    return this.replace(result);
  },

  /**
   * Inverse of [filter()] -- see `filter()` documentation for details.
   */

  reject: function reject(conditions) {
    if (!this.value) return this.replace([]);
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
    var key = sift.keyOf(conditions, this.value);
    if (typeof key === 'undefined') return;
    return this._get(this.value[key], [key]);
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
   */

  sortBy: function sortBy(condition) {
    if (!this.value) return this.replace([]);
    var values;

    if (typeof condition === 'string') {
      var key = condition;
      condition = function (item) {
        return item[key];
      };
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

    var sorted = values.sort(function (left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return a.index - b.index;
    });

    if (Array.isArray(this.value)) {
      return this.replace(sorted.map(function (res) {
        return res.value;
      }));
    } else {
      return this.replace(utils.indexedMap(sorted, function (res) {
        return [res.key, res.value];
      }));
    }
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
    return this.replace(result, { root: null });
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
    return this.replace(result, { root: null });
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

    return this.replace(result, { root: false });
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
      return this.replace(this.value, { extensions: extensions, root: null });
    } else {
      // Spawn a new `root` with the extensions applied
      return this.root.replace(this.root.value, { extensions: extensions, root: null }).replace(this.value, { keypath: this.keypath });
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
    return this.replace(result, {
      keypath: this.keypath.concat(keypath)
    });
  },

  /**
   * Internal: Returns a clone with the `value` replaced. The new instance will
   * retain the same properties, so things like [use()] extensions are carried
   * over. You may pass additional `options`.
   *
   *     db = scour(data)
   *     db = db.replace(newData)
   *
   * I don't think this will be useful outside internal use.
   */

  replace: function replace(value, options) {
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

},{"./lib/build_extensions":1,"./lib/negate":2,"./lib/normalize_keypath":3,"./utilities":14,"object-assign":4,"sift":5}],7:[function(require,module,exports){
'use strict';

module.exports = function clone(object) {
  var assign = require('object-assign');
  return Array.isArray(object) ? [].slice.call(object) : assign({}, object);
};

},{"object-assign":4}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

  for (var i = 0, len = keypath.length; i < len; i++) {
    if (i === 0) {
      parents[i] = object;
    } else {
      parents[i] = parents[i - 1][keypath[i - 1]];
      if (!parents[i] || _typeof(parents[i]) !== 'object') {
        return object;
      }
    }
  }

  for (var i = keypath.length - 1; i >= 0; i--) {
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

},{"./clone":7,"./clone_without":8}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./get":13,"./set":18,"object-assign":4}],12:[function(require,module,exports){
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

},{"./each":10}],13:[function(require,module,exports){
'use strict';

module.exports = function get(object, keypath) {
  var result = object;

  for (var i = 0, len = keypath.length; i < len; i++) {
    result = result[keypath[i]];
    if (!result) return;
  }

  return result;
};

},{}],14:[function(require,module,exports){
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

},{"./del":9,"./each":10,"./extend_in":11,"./filter":12,"./get":13,"./indexed_map":15,"./map":16,"./map_object":17,"./set":18}],15:[function(require,module,exports){
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

},{"./each":10}],16:[function(require,module,exports){
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

},{"./each":10}],17:[function(require,module,exports){
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

},{"./each":10}],18:[function(require,module,exports){
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

  for (var i = 0, len = keypath.length; i < len; i++) {
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

  for (var i = keypath.length; i >= 0; i--) {
    if (!parents[i]) {
      results[i] = value;
    } else {
      results[i] = clone(parents[i]);
      results[i][keypath[i]] = results[i + 1];
    }
  }

  return results[0];
};

},{"./clone":7}]},{},[6])(6)
});