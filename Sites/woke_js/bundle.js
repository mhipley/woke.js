(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var toArray = require('lodash.toarray')
var without = require('lodash.without')
var isNumber = require('lodash.isnumber')

// ===========================

/**
 * astralAwareSearch - searches for strings and returns the findings in an array
 *
 * @param  {String} whereToLook    string upon which to perform the search
 * @param  {String} whatToLookFor  string depicting what we are looking for
 * @return {Array}                 findings array, indexes of each first "letter" found
 */
function astralAwareSearch (whereToLook, whatToLookFor) {
  var foundIndexArray = []
  var arrWhereToLook = toArray(whereToLook)
  var arrWhatToLookFor = toArray(whatToLookFor)
  var found

  for (var i = 0; i < arrWhereToLook.length; i++) {
  // check if current source character matches the first char of what we're looking for
    if (arrWhereToLook[i] === arrWhatToLookFor[0]) {
      found = true
      // this means first character matches
      // match the rest:
      for (var i2 = 0; i2 < arrWhatToLookFor.length; i2++) {
        if (arrWhereToLook[i + i2] !== arrWhatToLookFor[i2]) {
          found = false
          break
        }
      }
      if (found) {
        foundIndexArray.push(i)
      }
    }
  }

  return foundIndexArray
}

// ===========================

/**
 * stringise - Turns null/undefined into ''. If array, turns each elem into String.
 * all other cases, runs through String()
 *
 * @param  {whatever} incoming     can be anything
 * @return {String/Array}          string or array of strings
 */
function stringise (incoming) {
  if ((incoming === undefined) || (incoming === null) || (typeof incoming === 'boolean')) {
    return ['']
  } else if (Array.isArray(incoming)) {
    incoming.forEach(function (elem, i) {
      if (elem === undefined || elem === null || typeof elem === 'boolean') {
        incoming[i] = ''
      } else {
        incoming[i] = String(incoming[i])
      }
    })
    // check if not incoming !== [''] already
    if ((incoming.length !== 1) && (incoming[0] !== '')) {
      incoming = without(incoming, '')
    }
  } else {
    var tempArr = []
    tempArr.push(String(incoming))
    incoming = tempArr
  }
  return incoming
}

//                      ____
//       bug hammer    |    |
//   O=================|    |
//     bugs into ham   |____|
//
//                     .=O=.

// ===========================
// M O D U L E . E X P O R T S
// ===========================

module.exports = function (source, options, replacement) {
  var o = options || {}

  // enforce the peace and order:
  source = stringise(source)
  o.leftOutsideNot = stringise(o.leftOutsideNot)
  o.leftOutside = stringise(o.leftOutside)
  o.leftMaybe = stringise(o.leftMaybe)
  o.searchFor = String(o.searchFor)
  o.rightMaybe = stringise(o.rightMaybe)
  o.rightOutside = stringise(o.rightOutside)
  o.rightOutsideNot = stringise(o.rightOutsideNot)
  replacement = stringise(replacement)

  var arrSource = toArray(source[0])
  var foundBeginningIndex
  var foundEndingIndex
  var matched
  var found
  var replacementRecipe = []
  var result = ''

  //  T H E   L O O P

  astralAwareSearch(source[0], o.searchFor).forEach(function (oneOfFoundIndexes) {
    // oneOfFoundIndexes is the index of starting index of found
    // the principle of replacement is after finding the searchFor string, the boundaries optionally expand. That's left/right Maybe's from the options object. When done, the outsides are checked, first positive (leftOutside, rightOutside), then negative (leftOutsideNot, rightOutsideNot).
    // that's the plan.
    //
    foundBeginningIndex = oneOfFoundIndexes
    foundEndingIndex = oneOfFoundIndexes + toArray(o.searchFor).length
    //
    // ===================== leftMaybe =====================
    // commence with maybe's
    // they're not hungry, i.e. the whole Maybe must be of the left of searchFor exactly
    //
    if (o.leftMaybe.length > 0) {
      o.leftMaybe.forEach(function (elem, i) {
        // iterate each of the maybe's in the array:
        matched = true
        toArray(elem).forEach(function (elem2, i2) {
          // iterate each character of particular Maybe:
          if (elem2 !== arrSource[oneOfFoundIndexes - toArray(elem).length + i2]) {
            matched = false
          }
        })
        if (matched && (oneOfFoundIndexes - toArray(elem).length) < foundBeginningIndex) {
          foundBeginningIndex = oneOfFoundIndexes - toArray(elem).length
        }
      })
    }
    // ===================== rightMaybe =====================
    if (o.rightMaybe.length > 0) {
      o.rightMaybe.forEach(function (elem, i) {
        // iterate each of the Maybe's in the array:
        matched = true
        toArray(elem).forEach(function (elem2, i2) {
          // iterate each character of particular Maybe:
          if (elem2 !== arrSource[oneOfFoundIndexes + toArray(o.searchFor).length + i2]) {
            matched = false
          }
        })
        if (matched && (oneOfFoundIndexes + toArray(o.searchFor).length + toArray(elem).length) > foundEndingIndex) {
          foundEndingIndex = oneOfFoundIndexes + toArray(o.searchFor).length + toArray(elem).length
        }
      })
    }
    // ===================== leftOutside =====================
    if (o.leftOutside[0] !== '') {
      found = false
      o.leftOutside.forEach(function (elem, i) {
        // iterate each of the outsides in the array:
        matched = true
        toArray(elem).forEach(function (elem2, i2) {
          // iterate each character of particular Outside:
          if (elem2 !== arrSource[foundBeginningIndex - toArray(elem).length + i2]) {
            matched = false
          }
        })
        if (matched) {
          found = true
        }
      })
      if (!found) {
        foundBeginningIndex = -1
        foundEndingIndex = -1
      }
    }
    // ===================== rightOutside =====================
    if (o.rightOutside[0] !== '') {
      found = false
      o.rightOutside.forEach(function (elem, i) {
        // iterate each of the outsides in the array:
        matched = true
        toArray(elem).forEach(function (elem2, i2) {
          // iterate each character of particular Outside:
          if (elem2 !== arrSource[foundEndingIndex + i2]) {
            matched = false
          }
        })
        if (matched) {
          found = true
        }
      })
      if (!found) {
        foundBeginningIndex = -1
        foundEndingIndex = -1
      }
    }
    // ===================== leftOutsideNot =====================
    if (o.leftOutsideNot[0] !== '') {
      found = false
      o.leftOutsideNot.forEach(function (elem, i) {
        // iterate each of the outsides in the array:
        matched = true
        toArray(elem).forEach(function (elem2, i2) {
          // iterate each character of particular Outside:
          if (elem2 !== arrSource[foundBeginningIndex - toArray(elem).length + i2]) {
            matched = false
          }
        })
        if (matched) {
          foundBeginningIndex = -1
          foundEndingIndex = -1
        }
      })
    }
    // ===================== rightOutsideNot =====================
    if (o.rightOutsideNot[0] !== '') {
      found = false
      o.rightOutsideNot.forEach(function (elem, i) {
        // iterate each of the outsides in the array:
        matched = true
        toArray(elem).forEach(function (elem2, i2) {
          // iterate each character of particular Outside:
          if (elem2 !== arrSource[foundEndingIndex + i2]) {
            matched = false
          }
        })
        if (matched) {
          foundBeginningIndex = -1
          foundEndingIndex = -1
        }
      })
    }
    // ===================== the rest =====================
    if (isNumber(foundBeginningIndex) && (foundBeginningIndex !== -1)) {
      replacementRecipe.push([foundBeginningIndex, foundEndingIndex])
    }
  })
  // =====
  // first we need to remove any overlaps in the recipe, cases like:
  // [ [0,10], [2,12] ] => [ [0,10], [10,12] ]
  if (replacementRecipe.length > 0) {
    replacementRecipe.forEach(function (elem, i) {
      // iterate through all replacement-recipe-array's elements:
      if ((replacementRecipe[i + 1] !== undefined) && (replacementRecipe[i][1] > replacementRecipe[i + 1][0])) {
        replacementRecipe[i + 1][0] = replacementRecipe[i][1]
      }
    })
    // iterate the recipe array again, cleaning up elements like [12,12]
    replacementRecipe.forEach(function (elem, i) {
      if (elem[0] === elem[1]) {
        replacementRecipe.splice(i, 1)
      }
    })
  } else {
    // there were no findings, so return source
    return source.join('')
  }
  //
  // iterate the recipe array and perform the replacement:
  // first, if replacements don't start with 0, attach this part onto result var:
  if ((replacementRecipe.length > 0) && (replacementRecipe[0][0] !== 0)) {
    result = result + arrSource.slice(0, replacementRecipe[0][0]).join('')
  }
  replacementRecipe.forEach(function (elem, i) {
    // first position is replacement string:
    result += replacement.join('')
    if (replacementRecipe[i + 1] !== undefined) {
      // if next element exists, add content between current and next finding
      result += arrSource.slice(replacementRecipe[i][1], replacementRecipe[i + 1][0]).join('')
    } else {
      // if this is the last element in the replacement recipe array, add remainder of the string after last replacement and the end:
      result += arrSource.slice(replacementRecipe[i][1]).join('')
    }
  })
  return result
}

},{"lodash.isnumber":2,"lodash.toarray":3,"lodash.without":4}],2:[function(require,module,exports){
/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
 * as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isNumber(3);
 * // => true
 *
 * _.isNumber(Number.MIN_VALUE);
 * // => true
 *
 * _.isNumber(Infinity);
 * // => true
 *
 * _.isNumber('3');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike(value) && objectToString.call(value) == numberTag);
}

module.exports = isNumber;

},{}],3:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
    rsComboSymbolsRange = '\\u20d0-\\u20f0',
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  return arrayMap(props, function(key) {
    return object[key];
  });
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `iterator` to an array.
 *
 * @private
 * @param {Object} iterator The iterator to convert.
 * @returns {Array} Returns the converted array.
 */
function iteratorToArray(iterator) {
  var data,
      result = [];

  while (!(data = iterator.next()).done) {
    result.push(data.value);
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    iteratorSymbol = Symbol ? Symbol.iterator : undefined,
    propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

/**
 * Converts `value` to an array.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Array} Returns the converted array.
 * @example
 *
 * _.toArray({ 'a': 1, 'b': 2 });
 * // => [1, 2]
 *
 * _.toArray('abc');
 * // => ['a', 'b', 'c']
 *
 * _.toArray(1);
 * // => []
 *
 * _.toArray(null);
 * // => []
 */
function toArray(value) {
  if (!value) {
    return [];
  }
  if (isArrayLike(value)) {
    return isString(value) ? stringToArray(value) : copyArray(value);
  }
  if (iteratorSymbol && value[iteratorSymbol]) {
    return iteratorToArray(value[iteratorSymbol]());
  }
  var tag = getTag(value),
      func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values);

  return func(value);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return object ? baseValues(object, keys(object)) : [];
}

module.exports = toArray;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array ? array.length : 0;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Checks if a cache value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of methods like `_.difference` without support
 * for excluding multiple arrays or iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Array} values The values to exclude.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new array of filtered values.
 */
function baseDifference(array, values, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      isCommon = true,
      length = array.length,
      result = [],
      valuesLength = values.length;

  if (!length) {
    return result;
  }
  if (iteratee) {
    values = arrayMap(values, baseUnary(iteratee));
  }
  if (comparator) {
    includes = arrayIncludesWith;
    isCommon = false;
  }
  else if (values.length >= LARGE_ARRAY_SIZE) {
    includes = cacheHas;
    isCommon = false;
    values = new SetCache(values);
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var valuesIndex = valuesLength;
      while (valuesIndex--) {
        if (values[valuesIndex] === computed) {
          continue outer;
        }
      }
      result.push(value);
    }
    else if (!includes(values, computed, comparator)) {
      result.push(value);
    }
  }
  return result;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates an array excluding all given values using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * **Note:** Unlike `_.pull`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {...*} [values] The values to exclude.
 * @returns {Array} Returns the new array of filtered values.
 * @see _.difference, _.xor
 * @example
 *
 * _.without([2, 1, 2, 3], 1, 2);
 * // => [3]
 */
var without = baseRest(function(array, values) {
  return isArrayLikeObject(array)
    ? baseDifference(array, values)
    : [];
});

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = without;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
module.exports={
  "Trump": [
      {
        "firstname": "Donald",
        "lastname": "Trump",
        "string": "who has been accused of assault by numerous women",
        "position": "after",
        "source": "http://nymag.com/thecut/2016/10/all-the-women-accusing-trump-of-rape-sexual-assault.html"
      },
      {
        "firstname": "Donald",
        "lastname": "Trump",
        "string": "failed steak salesman",
        "position": "before",
        "source": "http://blogs.wsj.com/washwire/2016/03/03/what-ever-happened-to-trump-shuttle-trump-steaks-trump-vodka/"
      },
      {
        "firstname": "Donald",
        "lastname": "Trump",
        "string": "unconvicted sexual assaulter",
        "position": "before",
        "source": "http://theconcourse.deadspin.com/so-many-more-women-have-accused-donald-trump-of-groping-1787729910"
      },
      {
        "firstname": "Donald",
        "lastname": "Trump",
        "string": "mocker of the disabled",
        "position": "before",
        "source": "http://www.nbcnews.com/politics/2016-election/trump-s-worst-offense-mocking-disabled-reporter-poll-finds-n627736"
      },
      {
        "firstname": "Donald",
        "lastname": "Trump",
        "string": "whose xenophobia only highlights his insecurities in the face of conflict",
        "position": "after",
        "source": "http://www.wsj.com/articles/donald-trump-keeps-up-attacks-on-judge-gonzalo-curiel-1464911442"
      },
      {
        "firstname": "Donald",
        "lastname": "Trump",
        "string": "unapologetic racist",
        "position": "before",
        "source": "http://www.nytimes.com/2016/09/17/us/politics/donald-trump-obama-birther.html"
      },
      {
        "firstname": "Donald",
        "lastname": "Trump",
        "string": "petulant child",
        "position": "before",
        "source": "http://www.businessinsider.com/donald-trump-shared-an-unflattering-picture-of-ted-cruzs-wife-2016-3"
      },
      {
        "firstname": "Donald",
        "lastname": "Trump",
        "string": "troll in chief",
        "position": "before",
        "source": "http://www.motherjones.com/politics/2016/11/trump-white-nationalists-hate-racism-power"
      }
    ],
    "Pence": [
      {
        "firstname": "Mike",
        "lastname": "Pence",
        "string": "the locally disgraced Indiana governor best known for trying to pass gay discrimination legislation RFRA",
        "position": "after",
        "source": "http://www.indystar.com/story/news/politics/2016/07/07/trumps-vp-10-things-know-indiana-gov-mike-pence/86746980/"
      },
      {
        "firstname": "Mike",
        "lastname": "Pence",
        "string": "supporter of legislation to require all women in Indiana who have abortions to pay for funerals for the fetuses",
        "position": "after",
        "source": "http://www.motherjones.com/politics/2016/07/trumps-vp-pick-passed-law-requiring-funerals-aborted-fetuses"
      },
      {
        "firstname": "Mike",
        "lastname": "Pence",
        "string": "philistine",
        "position": "after",
        "source": "http://www.cnn.com/2016/11/20/politics/mike-pence-hamilton-message-trump/"
      },
      {
        "firstname": "Mike",
        "lastname": "Pence",
        "string": "Mike #1",
        "position": "replace",
        "source": "http://www.independent.co.uk/news/world/americas/donald-trump-president-latest-cabinet-sessions-flynn-pompeo-racist-mike-a7426046.html"
      }
    ],
    "Bannon": [
      {
        "firstname": "Steve",
        "lastname": "Bannon",
        "string": "known anti-Semite and Seinfeld stakeholder",
        "position": "before",
        "source": "http://www.teenvogue.com/story/steve-bannon-donald-trump-chief-strategist"
      },
      {
        "firstname": "Steve",
        "lastname": "Bannon",
        "string": "KKK lapdog",
        "position": "before",
        "source": "http://www.esquire.com/news-politics/politics/news/a50654/why-steve-bannon-is-dangerous/"
      },
      {
        "firstname": "Steve",
        "lastname": "Bannon",
        "string": "anti-Asian bigot",
        "position": "before",
        "source": "http://sfist.com/2016/11/16/bannon_asian_ceos.php"
      },
      {
        "firstname": "Steve",
        "lastname": "Bannon",
        "string": "obvious misogynist",
        "position": "before",
        "source": "http://nymag.com/thecut/2016/11/what-steve-bannon-thinks-of-women-and-minority-groups.html"
      }
    ],
    "Priebus": [
      {
        "firstname": "Reince",
        "lastname": "Priebus",
        "string": "White Nationalist",
        "position": "before",
        "source": "http://www.teenvogue.com/story/donald-trump-reince-priebus"
      },
      {
        "firstname": "Reince",
        "lastname": "Priebus",
        "string": "racist apologist",
        "position": "before",
        "source": "http://www.motherjones.com/politics/2016/11/reince-priebus-steve-bannon-donald-trump-normalization"
      },
      {
        "firstname": "Reince",
        "lastname": "Priebus",
        "string": "Reince \"you'd be prettier if you smiled\" Priebus",
        "position": "replace",
        "source": "http://nymag.com/thecut/2016/09/reince-priebus-posts-sexist-tweet-about-hillary-clinton.html"
      }
    ],
    "Kushner": [
      {
        "firstname": "Jared",
        "lastname": "Kushner",
        "string": "Trump's echo chamber",
        "position": "before",
        "source": "http://www.nytimes.com/2016/11/20/us/politics/jared-kushner-donald-trump.html"
      },
      {
        "firstname": "Jared",
        "lastname": "Kushner",
        "string": "Trump's politically inexperienced secret operative",
        "position": "before",
        "source": "http://www.npr.org/2016/11/18/502539418/the-rise-of-jared-kushner-donald-trumps-son-in-law"
      }
    ],
    "Giuliani": [
      {
        "firstname": "Rudy",
        "lastname": "Giuliani",
        "string": "who landed in the Trump campaign early on while in a desperate, years long quest for relevance",
        "position": "after",
        "source": "http://www.newyorker.com/news/daily-comment/the-appalling-last-act-of-rudy-giuliani"
      },
      {
        "firstname": "Rudy",
        "lastname": "Giuliani",
        "string": "paid terrorist organization advocate",
        "position": "before",
        "source": "https://www.washingtonpost.com/news/josh-rogin/wp/2016/11/15/giuliani-was-paid-advocate-for-shady-iranian-dissident-group/?utm_term=.90221c240462"
      },
      {
        "firstname": "Rudy",
        "lastname": "Giuliani",
        "string": "philistine",
        "position": "before",
        "source": "https://news.artnet.com/exhibitions/top-10-controversial-art-projects-563213?utm_campaign=artnetnews&utm_source=072816daily&utm_medium=email&utm_term=artnet%20News%20Daily%20Newsletter%20USE"
      }
    ],
    "Conway": [
      {
        "firstname": "Kellyanne",
        "lastname": "Conway",
        "string": "dangerously irresponsible",
        "position": "before",
        "source": "http://www.thewrap.com/anderson-cooper-donald-trump-irresponsible-hillary-clinton-email-fbi/"
      },
      {
        "firstname": "Kellyanne",
        "lastname": "Conway",
        "string": "shameless political hack",
        "position": "before",
        "source": "http://www.newyorker.com/magazine/2016/10/17/kellyanne-conways-political-machinations"
      }
    ],
    "Gingrich": [
      {
        "firstname": "Newt",
        "lastname": "Gingrich",
        "string": "science flip-flopper",
        "position": "before",
        "source": "http://www.sciencemag.org/news/2016/11/newt-gingrich-major-trump-ally-has-complicated-love-affair-science"
      },
      {
        "firstname": "Newt",
        "lastname": "Gingrich",
        "string": "anti-Muslim",
        "position": "before",
        "source": "https://www.washingtonpost.com/news/morning-mix/wp/2016/07/15/after-nice-newt-gingrich-wants-to-test-every-american-muslim-and-deport-those-who-believe-in-sharia/"
      },
      {
        "firstname": "Newt",
        "lastname": "Gingrich",
        "string": "who's too sexist for Fox News",
        "position": "after",
        "source": "http://www.motherjones.com/media/2016/10/megyn-kelly-newt-gingrich-donald-trump-women-fascinated-by-sex"
      },
      {
        "firstname": "Newt",
        "lastname": "Gingrich",
        "string": "sexist toady",
        "position": "before",
        "source": "http://www.gq.com/story/gingrich-trump-limbaugh-sexist"
      }
    ],
    "Christie": [
      {
        "firstname": "Chris",
        "lastname": "Christie",
        "string": "Bridgegate orchestrator",
        "position": "before",
        "source": "https://www.washingtonpost.com/news/post-nation/wp/2016/11/04/chris-christie-allies-convicted-in-bridgegate-trial/?utm_term=.dd14f4dfae80"
      },
      {
        "firstname": "Chris",
        "lastname": "Christie",
        "string": "intolerably sexist",
        "position": "before",
        "source": "http://www.philly.com/philly/blogs/attytood/The-intolerable-sexism-of-Chris-Christie.html"
      },
      {
        "firstname": "Chris",
        "lastname": "Christie",
        "string": "who unsuccessfully hedged bets for and against the Trump campaign for personal gain",
        "position": "after",
        "source": "http://www.nytimes.com/2016/11/21/nyregion/grievances-and-grumblings-long-before-chris-christies-fall-in-donald-trumps-circle.html"
      }
    ],
    "Palin": [
      {
        "firstname": "Sarah",
        "lastname": "Palin",
        "string": "geographically ignorant",
        "position": "before",
        "source": "http://www.huffingtonpost.com/2008/11/05/palin-didnt-know-africa-i_n_141653.html"
      },
      {
        "firstname": "Sarah",
        "lastname": "Palin",
        "string": "unhinged Facebook ranting grandmother",
        "position": "before",
        "source": "http://www.salon.com/2016/06/20/6_worst_right_wing_moments_of_the_week_sarah_palins_bizarre_new_facebook_rant_partner/"
      },
      {
        "firstname": "Sarah",
        "lastname": "Palin",
        "string": "chronicallly ignorant and crass",
        "position": "after",
        "source": "https://www.theguardian.com/commentisfree/cifamerica/2011/jan/12/sarahpalin-arizona-shooting-blood-libel"
      },
      {
        "firstname": "Sarah",
        "lastname": "Palin",
        "string": "climate change denier",
        "position": "before",
        "source": "https://www.theguardian.com/us-news/2016/apr/15/sarah-palin-bill-nye-climate-change-hustle-film"
      },
      {
        "firstname": "Sarah",
        "lastname": "Palin",
        "string": "functionally illiterate",
        "position": "before",
        "source": "https://www.buzzfeed.com/kyleblaine/so-uh-heres-the-full-text-of-sarah-palins-bizarre-trump-spee?utm_term=.hbM1K1zJ6#.ub2ynyzZN"
      }
    ],
    "Bolton": [
      {
        "firstname": "John R.",
        "lastname": "Bolton",
        "string": "anti-Muslim witch hunt advocate",
        "position": "before",
        "source": "https://thinkprogress.org/romney-adviser-bolton-backs-bachmanns-anti-muslim-witch-hunt-3eb80fae97ca#.mijmqugpf"
      },
      {
        "firstname": "John R.",
        "lastname": "Bolton",
        "string": "post-truth pioneer",
        "position": "before",
        "source": "http://www.huffingtonpost.com/eric-alterman/think-again-john-bolton-a_b_1406186.html"
      }
    ],
    "Hensarling": [
      {
        "firstname": "Jeb",
        "lastname": "Hensarling",
        "string": "big bank shill",
        "position": "before",
        "source": "http://www.wsj.com/articles/gops-jeb-hensarling-takes-aim-at-dodd-frank-volcker-rule-1464977161"
      },
      {
        "firstname": "Jeb",
        "lastname": "Hensarling",
        "string": "who wants to deregulate Wall Street and leave the financial system \"dangerously exposed",
        "position": "after",
        "source": "https://www.bloomberg.com/view/articles/2016-11-16/the-man-who-would-kill-dodd-frank"
      }
    ],
    "Mnunchin": [
      {
        "firstname": "Steven",
        "lastname": "Mnuchin",
        "string": "whose OneWest Bank broke federal laws by discriminating against black and Latino borrowers",
        "position": "after",
        "source": "http://www.bloomberg.com/news/articles/2016-11-17/mnuchin-s-bank-accused-of-redlining-black-and-latino-home-buyers"
      },
      {
        "firstname": "Steven",
        "lastname": "Mnuchin",
        "string": "Steve “You put the ‘douche’ in fiduciary\" Mnuchin",
        "position": "replace",
        "source": "http://www.bloomberg.com/politics/articles/2016-08-31/steven-mnuchin-businessweek"
      },
      {
        "firstname": "Steven",
        "lastname": "Mnuchin",
        "string": "who founded OneWest Bank to profiteer off the 2008 housing crisis",
        "position": "after",
        "source": "http://www.bloomberg.com/politics/articles/2016-08-31/steven-mnuchin-businessweek"
      }
    ],
    "Brewer": [
      {
        "firstname": "Jan",
        "lastname": "Brewer",
        "string": "proto Donald Trump",
        "position": "before",
        "source": "http://www.nytimes.com/2016/02/11/upshot/before-donald-trump-there-was-jan-brewer.html"
      },
      {
        "firstname": "Jan",
        "lastname": "Brewer",
        "string": "demonizer of Arizona's Latino population",
        "position": "after",
        "source": "http://www.latina.com/lifestyle/news-politics/crazy-stuff-racists-say-special-jan-brewer-edition"
      },
      {
        "firstname": "Jan",
        "lastname": "Brewer",
        "string": "vaginal Grinch",
        "position": "before",
        "source": "http://jezebel.com/tag/jan-brewer"
      }
    ],
    "Carson": [
      {
        "firstname": "Ben",
        "lastname": "Carson",
        "string": "evolution denier",
        "position": "before",
        "source": "http://gawker.com/ben-carson-i-will-believe-in-evolution-when-they-show-1740908238"
      },
      {
        "firstname": "Ben",
        "lastname": "Carson",
        "string": "purveyor of vaccination fallacies",
        "position": "before",
        "source": "http://www.cnn.com/2015/09/18/politics/ben-carson-vaccine-criticism/"
      },
      {
        "firstname": "Ben",
        "lastname": "Carson",
        "string": "scapegoating misogynist",
        "position": "before",
        "source": "http://www.slate.com/blogs/xx_factor/2014/12/01/dr_ben_carson_blames_feminism_and_the_60s_for_police_shootings_of_unarmed.html"
      }
    ],
    "Huckabee": [
      {
        "firstname": "Mike",
        "lastname": "Huckabee",
        "string": "racist tweet-stormer",
        "position": "before",
        "source": "http://www.huffingtonpost.com/entry/mike-huckabee-racist-tweet_us_561dcc1de4b0c5a1ce61163b"
      },
      {
        "firstname": "Mike",
        "lastname": "Huckabee",
        "string": "NRA lapdog",
        "position": "before",
        "source": "http://www.nytimes.com/politics/first-draft/2015/04/10/mike-huckabee-goes-gun-shopping-at-n-r-a-conference/"
      },
      {
        "firstname": "Mike",
        "lastname": "Huckabee",
        "string": "Mike #2",
        "position": "replace",
        "source": "http://www.independent.co.uk/news/world/americas/donald-trump-president-latest-cabinet-sessions-flynn-pompeo-racist-mike-a7426046.html"
      }
    ],
    "Jindal": [
      {
        "firstname": "Bobby",
        "lastname": "Jindal",
        "string": "Piyush \"Bobby\" Jindal",
        "position": "replace",
        "source": "https://www.washingtonpost.com/politics/from-piyush-to-bobby-how-does-jindal-feel-about-his-familys-past/2015/06/22/7d45a3da-18ec-11e5-ab92-c75ae6ab94b5_story.html"
      },
      {
        "firstname": "Bobby",
        "lastname": "Jindal",
        "string": "notable shirker",
        "position": "before",
        "source": "http://www.salon.com/2015/07/01/bobby_jindal_has_no_shame_this_charlatan_belongs_nowhere_near_the_white_house/"
      },
      {
        "firstname": "Bobby",
        "lastname": "Jindal",
        "string": "Bobby \"Tanned. Rested. Ready\" Jindal",
        "position": "replace",
        "source": "http://timesofindia.indiatimes.com/nri/us-canada-news/Bobby-Jindal-does-push-ups-before-Republican-debate/articleshow/48371751.cms"
      }
    ],
    "Scott": [
      {
        "firstname": "Rick",
        "lastname": "Scott",
        "string": "publicly scolded for \"obscene disenfranchisement\" by a U.S. District Judge",
        "position": "after",
        "source": "http://www.dailykos.com/story/2016/10/17/1583523/-Judge-slams-Rick-Scott-s-Florida-for-obscene-disenfranchisement"
      },
      {
        "firstname": "Rick",
        "lastname": "Scott",
        "string": "the ultimate Medicare thief",
        "position": "after",
        "source": "http://www.politifact.com/florida/statements/2014/mar/03/florida-democratic-party/rick-scott-rick-scott-oversaw-largest-medicare-fra/"
      }
    ],
    "Arpaio": [
      {
        "firstname": "Joe",
        "lastname": "Arpaio",
        "string": "inmate abuser",
        "position": "before",
        "source": "http://newsexaminer.net/crime/tent-city-closing-this-december-after-22-years/"
      },
      {
        "firstname": "Joe",
        "lastname": "Arpaio",
        "string": "sheriff of Arizona's Tent City",
        "position": "after",
        "source": "http://newsexaminer.net/crime/tent-city-closing-this-december-after-22-years/"
      },
      {
        "firstname": "Joe",
        "lastname": "Arpaio",
        "string": "racist, anti-immigration extremist",
        "position": "before",
        "source": "https://www.democracynow.org/2016/10/12/will_racist_anti_immigrant_trump_supporter"
      },
      {
        "firstname": "Joe",
        "lastname": "Arpaio",
        "string": "the most expensive sheriff in America",
        "position": "after",
        "source": "http://www.theatlantic.com/national/archive/2014/01/the-most-expensive-sheriff-in-america-is-getting-more-expensive/282885/"
      }
    ],
    "Clark": [
      {
        "firstname": "David A.",
        "lastname": "Clark",
        "string": "incarceration advocate",
        "position": "before",
        "source": "http://www.ebony.com/news-views/david-clarke-marshall-project"
      },
      {
        "firstname": "David A.",
        "lastname": "Clark",
        "string": "right-wing shill",
        "position": "before",
        "source": "http://www.ebony.com/news-views/david-clarke-marshall-project"
      }
    ],
    "Ryan": [
      {
        "firstname": "Paul",
        "lastname": "Ryan",
        "string": "NRA lapdog and P90X affectionado",
        "position": "before",
        "source": "http://time.com/3445032/paul-ryan-all-pumped-up-for-his-closeup/"
      },
      {
        "firstname": "Paul",
        "lastname": "Ryan",
        "string": "NRA lapdog and P90X affectionado",
        "position": "before",
        "source": "https://twitter.com/NYDailyNews/status/745799614121541641?ref_src=twsrc%5Etfw"
      },
      {
        "firstname": "Paul",
        "lastname": "Ryan",
        "string": "racist-enabling coward",
        "position": "before",
        "source": "http://www.slate.com/articles/news_and_politics/politics/2016/07/paul_ryan_is_a_trump_supporting_racism_enabling_coward.html"
      }
    ],
    "Ebell": [
      {
        "firstname": "Myron",
        "lastname": "Ebell",
        "string": "who is not a scientist",
        "position": "after",
        "source": "https://www.washingtonpost.com/news/energy-environment/wp/2016/11/11/meet-the-man-trump-is-relying-on-to-unravel-obamas-environmental-legacy/?utm_term=.e0406c1daa56"
      },
      {
        "firstname": "Myron",
        "lastname": "Ebell",
        "string": "climate criminal",
        "position": "before",
        "source": "http://www.nytimes.com/2016/11/12/science/myron-ebell-trump-epa.html"
      },
      {
        "firstname": "Myron",
        "lastname": "Ebell",
        "string": "climate change denier",
        "position": "before",
        "source": "http://www.ibtimes.co.uk/donald-trump-myron-ebell-are-climate-deniers-dream-team-heres-why-1592338"
      }
    ],
    "Rhee": [
      {
        "firstname": "Michelle",
        "lastname": "Rhee",
        "string": "disgraced school-privatization activist",
        "position": "before",
        "source": "http://deadspin.com/kevin-johnson-apparently-out-of-the-running-to-be-marri-1789279296"
      },
      {
        "firstname": "Michelle",
        "lastname": "Rhee",
        "string": "Teach for America graduate",
        "position": "before",
        "source": "http://www.dailymail.co.uk/news/article-3939586/Woman-dubbed-Public-Enemy-No-1-teachers-unions-eyed-Trump-team-Education-Secretary.html"
      }
    ],
    "Gaffney": [
      {
        "firstname": "Frank",
        "lastname": "Gaffney",
        "string": "professional Islamophobe",
        "position": "before",
        "source": "http://www.slate.com/blogs/the_slatest/2016/11/16/frank_gaffney_anywhere_close_to_trump_is_bad_news.html"
      }
    ],
    "Sessions": [
      {
        "firstname": "Jeff",
        "lastname": "Sessions",
        "string": "Human Rights Campaign nightmare",
        "position": "before",
        "source": "http://www.bloomberg.com/politics/articles/2016-11-18/trump-said-to-pick-senator-jeff-sessions-for-attorney-general"
      },
      {
        "firstname": "Jeff",
        "lastname": "Sessions",
        "string": "Jeff \"too racist to be confirmed in 1986\" Sessions",
        "position": "replace",
        "source": "http://www.huffingtonpost.com/entry/trump-attorney-general-jeff-sessions-racist-remarks_us_582cd73ae4b099512f80c0c2?cn5id4ygk5rf9lik9"
      }
    ],
    "Flynn": [
      {
        "firstname": "Michael",
        "lastname": "Flynn",
        "string": "anti-Islamist",
        "position": "before",
        "source": "http://www.nytimes.com/2016/11/18/us/politics/michael-flynn-national-security-adviser-donald-trump.html?mtrref=t.co"
      },
      {
        "firstname": "Michael",
        "lastname": "Flynn",
        "string": "Mike #3",
        "position": "replace",
        "source": "http://www.independent.co.uk/news/world/americas/donald-trump-president-latest-cabinet-sessions-flynn-pompeo-racist-mike-a7426046.html"
      },
      {
        "firstname": "Michael",
        "lastname": "Flynn",
        "string": "Turkish government lobbyist",
        "position": "before",
        "source": "http://www.nytimes.com/2016/11/18/us/politics/michael-flynn-national-security-adviser-donald-trump.html?mtrref=t.co"
      }
    ],
    "Thiel": [
      {
        "firstname": "Peter",
        "lastname": "Thiel",
        "string": "successful threat to freedom of the press",
        "position": "after",
        "source": "http://www.theatlantic.com/technology/archive/2016/08/peter-thiels-self-serving-new-york-times-column/496133/"
      },
      {
        "firstname": "Peter",
        "lastname": "Thiel",
        "string": "anti-Asian bigot",
        "position": "before",
        "source": "https://news.vice.com/article/the-us-is-suing-peter-thiels-secretive-data-startup-for-discriminating-against-asians"
      },
      {
        "firstname": "Peter",
        "lastname": "Thiel",
        "string": "unabashed misogynist",
        "position": "before",
        "source": "http://www.huffingtonpost.com/entry/peter-thiel-women-democracy_us_5747079be4b03ede4413f6f5"
      },
      {
        "firstname": "Peter",
        "lastname": "Thiel",
        "string": "White Nationalist adjacent",
        "position": "before",
        "source": "https://www.splcenter.org/hatewatch/2016/06/09/paypal-co-founder-peter-thiel-address-white-nationalist-friendly-%E2%80%9Cproperty-and-freedom"
      }
    ],
    "Yiannopoulos": [
      {
        "firstname": "Milo",
        "lastname": "Yiannopoulos",
        "string": "who is actually racist enought to be banned by the notoriously lax Twitter",
        "position": "after",
        "source": "http://www.themarysue.com/milo-yiannopoulos-permanently-banned-from-twitter-after-racist-harassment-inflicted-on-leslie-jones/"
      },
      {
        "firstname": "Milo",
        "lastname": "Yiannopoulos",
        "string": "misogynist-in-denial",
        "position": "before",
        "source": "http://fusion.net/story/220646/the-terrifying-allure-of-gamergate-icon-milo-yiannopoulos/"
      }
    ],
    "Pompeo": [
      {
        "firstname": "Mike",
        "lastname": "Pompeo",
        "string": "Mike #4",
        "position": "replace",
        "source": "http://www.independent.co.uk/news/world/americas/donald-trump-president-latest-cabinet-sessions-flynn-pompeo-racist-mike-a7426046.html"
      },
      {
        "firstname": "Mike",
        "lastname": "Pompeo",
        "string": "waterboarding superfan",
        "position": "before",
        "source": "http://www.charlotteobserver.com/news/politics-government/article115734493.html"
      },
      {
        "firstname": "Mike",
        "lastname": "Pompeo",
        "string": "mass surveillance advocate",
        "position": "before",
        "source": "http://www.mcclatchydc.com/news/nation-world/national/national-security/article56869248.html"
      }
    ],
    "McCaul": [
      {
        "firstname": "Michael",
        "lastname": "McCaul",
        "string": "Mike #5",
        "position": "replace",
        "source": "http://www.independent.co.uk/news/world/americas/donald-trump-president-latest-cabinet-sessions-flynn-pompeo-racist-mike-a7426046.html"
      }
    ],
    "Rogers": [
      {
        "firstname": "Mike",
        "lastname": "Rogers",
        "string": "Mike #6",
        "position": "replace",
        "source": "http://www.independent.co.uk/news/world/americas/donald-trump-president-latest-cabinet-sessions-flynn-pompeo-racist-mike-a7426046.html"
      }
    ],
    "Korbach": [
      {
        "firstname": "Kris",
        "lastname": "Kobach",
        "string": "carelessly xenophobic",
        "position": "before",
        "source": "http://www.esquire.com/news-politics/news/a50890/kris-kobach-homeland-security-plan-photo/?src=socialflowTW"
      }
    ],
    "altright": [
      {
        "firstname": "Alt-right",
        "lastname": "",
        "string": "the racist cabal",
        "position": "replace",
        "source": "http://bit.ly/2ggGKP3"
      },
      {
        "firstname": "Alt-right",
        "lastname": "",
        "string": "neo-Nazi",
        "position": "replace",
        "source": "http://bit.ly/2glxeYw"
      }
    ],
    "nationalists": [
      {
        "firstname": "White Nationalists",
        "lastname": "",
        "string": "neo-Nazis",
        "position": "replace",
        "source": "http://bit.ly/2glxeYw"
      }
    ],
    "nationalist": [
      {
        "firstname": "White Nationalist",
        "lastname": "",
        "string": "neo-Nazi",
        "position": "replace",
        "source": "http://bit.ly/2glxeYw"
      }
    ],
    "economic": [
      {
        "firstname": "economic distress",
        "lastname": "",
        "string": "xenophobia",
        "position": "replace",
        "source": "https://benjaminstudebaker.com/2016/11/13/the-false-dichotomy-between-economics-and-racism/"
      },
      {
        "firstname": "economic distress",
        "lastname": "",
        "string": "xenophobia",
        "position": "replace",
        "source": "https://www.salon.com/2016/05/18/trumps_bigoted_base_keeping_minorities_down_is_the_no_1_issue_for_the_billionaires_backers_its_not_a_theory_its_a_fact/"
      }
    ],
    "coal": [
      {
        "firstname": "clean coal",
        "lastname": "",
        "string": "coal",
        "position": "replace",
        "source": "http://e360.yale.edu/feature/the_myth_of_clean_coal/2014/"
      }
    ],
    "vax": [
      {
        "firstname": "anti-vaxxers",
        "lastname": "",
        "string": "selfsh pharmacophobes",
        "position": "replace",
        "source": "http://observer.com/2015/02/spotted-pigs-selfish-anti-vaxxers-endanger-their-kids-and-yours/"
      }
    ],
    "news": [
      {
        "firstname": "fake news",
        "lastname": "",
        "string": "propaganda",
        "position": "replace",
        "source": "http://www.cjr.org/first_person/ben_smith_fake_news_buzzfeed_facebook.php"
      }
    ],
    "america": [
      {
        "firstname": "make America great again",
        "lastname": "",
        "string": "make Germany great again",
        "position": "replace",
        "source": "http://paleofuture.gizmodo.com/yes-adolf-hitler-really-said-he-would-make-germany-gre-1789261081"
      }
    ],
    "Price": [
      {
        "firstname": "Tom",
        "lastname": "Price",
        "string": "pro-life extremist",
        "position": "after",
        "source": "https://rewire.news/article/2016/11/21/trump-top-hhs-pick-thinks-theres-not-one-woman-who-cant-afford/"
      }
    ]}
},{}],6:[function(require,module,exports){

var er = require('easy-replace');

var elements = document.getElementsByTagName('*');

var dillweeds = require('./woke.json');

function replaceDillweed(dillweed) {
    var random = Math.floor(Math.random() * dillweeds[dillweed].length);
    if (dillweeds[dillweed][random].position == 'before') {
        var dillweedString = '<span><a href="' + dillweeds[dillweed][random].source + '" style="display:inline;" target="_blank">' + dillweeds[dillweed][random].string + '</a></span> ' + dillweeds[dillweed][random].lastname + ' ';
    }
    if (dillweeds[dillweed][random].position == 'after') {
        var dillweedString = dillweeds[dillweed][random].lastname + ', ' + '<span><a href="' + dillweeds[dillweed][random].source + '" style="display:inline;" target="_blank">' + dillweeds[dillweed][random].string + '</a></span>, ';
    }
    if (dillweeds[dillweed][random].position == 'replace') {
        var dillweedString = '<span><a href="' + dillweeds[dillweed][random].source + '" style="display:inline;" target="_blank">' + dillweeds[dillweed][random].string + '</a></span>';
    }
    return dillweedString;

};

function handleTextNode(textNode) {
    if(textNode.nodeName !== '#text') {
        return;
    }

    let origText = textNode.textContent;

    let newHtml=origText

    //HERE IS THE LOGIC FOR REPLACEMENT
        .replace(/Donald Trump /gi, replaceDillweed("Trump"))
        .replace(/Donald Trump, /gi, replaceDillweed("Trump"))
      
        .replace(/Mike Pence /gi, replaceDillweed("Pence"))
        .replace(/Mike Pence, /gi, replaceDillweed("Pence"))

        .replace(/Steve Bannon /gi, replaceDillweed("Bannon"))
        .replace(/Steve Bannon, /gi, replaceDillweed("Bannon"))
        .replace(/Stephen Bannon /gi, replaceDillweed("Bannon"))
        .replace(/Stephen Bannon, /gi, replaceDillweed("Bannon"))     

        .replace(/Jared Kushner /gi, replaceDillweed("Kushner"))
        .replace(/Jared Kushner, /gi, replaceDillweed("Kushner"))

        .replace(/Rudy Giuliani /gi, replaceDillweed("Giuliani"))
        .replace(/Rudy Giuliani, /gi, replaceDillweed("Giuliani"))

        .replace(/Newt Gingrich /gi, replaceDillweed("Gingrich"))
        .replace(/Newt Gingrich, /gi, replaceDillweed("Gingrich"))

        .replace(/Jeff Sessions /gi, replaceDillweed("Sessions"))
        .replace(/Jeff Sessions, /gi, replaceDillweed("Sessions")) 

        .replace(/Kellyanne Conway /gi, replaceDillweed("Conway"))
        .replace(/Kellyanne Conway, /gi, replaceDillweed("Conway"))

        .replace(/Chris Christie /gi, replaceDillweed("Christie"))
        .replace(/Chris Christie, /gi, replaceDillweed("Christie"))

        .replace(/Sarah Palin /gi, replaceDillweed("Palin"))
        .replace(/Sarah Palin, /gi, replaceDillweed("Palin"))

        .replace(/John R\. Bolton /gi, replaceDillweed("Bolton"))
        .replace(/John R\. Bolton, /gi, replaceDillweed("Bolton"))
        .replace(/John Bolton /gi, replaceDillweed("Bolton"))
        .replace(/John Bolton, /gi, replaceDillweed("Bolton")) 

        .replace(/Jeb Hensarling /gi, replaceDillweed("Hensarling"))
        .replace(/Jeb Hensarling, /gi, replaceDillweed("Hensarling"))

        .replace(/Steven Mnunchin /gi, replaceDillweed("Mnunchin"))
        .replace(/Steven Mnunchin, /gi, replaceDillweed("Mnunchin"))

        .replace(/Jan Brewer /gi, replaceDillweed("Brewer"))
        .replace(/Jan Brewer, /gi, replaceDillweed("Brewer"))

        .replace(/Ben Carson /gi, replaceDillweed("Carson"))
        .replace(/Ben Carson, /gi, replaceDillweed("Carson"))

        .replace(/Mike Huckabee /gi, replaceDillweed("Huckabee"))
        .replace(/Mike Huckabee, /gi, replaceDillweed("Huckabee"))  

        .replace(/Bobby Jindal /gi, replaceDillweed("Jindal"))
        .replace(/Bobby Jindal, /gi, replaceDillweed("Jindal"))   

        .replace(/Rick Scott /gi, replaceDillweed("Scott"))
        .replace(/Rick Scott, /gi, replaceDillweed("Scott"))

        .replace(/Joe Arpaio /gi, replaceDillweed("Arpaio"))
        .replace(/Joe Arpaio, /gi, replaceDillweed("Arpaio"))     

        .replace(/David A\. Clark /gi, replaceDillweed("Clark"))
        .replace(/David A\. Clark, /gi, replaceDillweed("Clark")) 
        .replace(/David Clark /gi, replaceDillweed("Clark"))
        .replace(/David Clark, /gi, replaceDillweed("Clark")) 

        .replace(/Paul Ryan /gi, replaceDillweed("Ryan"))
        .replace(/Paul Ryan, /gi, replaceDillweed("Ryan"))

        .replace(/Myron Ebell /gi, replaceDillweed("Ebell"))
        .replace(/Myron Ebell, /gi, replaceDillweed("Ebell"))    

        .replace(/Michelle Rhee /gi, replaceDillweed("Rhee"))
        .replace(/Michelle Rhee, /gi, replaceDillweed("Rhee"))  

        .replace(/Frank Gaffney /gi, replaceDillweed("Gaffney"))
        .replace(/Frank Gaffney, /gi, replaceDillweed("Gaffney"))     

        .replace(/Michael Flynn /gi, replaceDillweed("Flynn"))
        .replace(/Michael Flynn, /gi, replaceDillweed("Flynn"))    

        .replace(/Peter Thiel /gi, replaceDillweed("Thiel"))
        .replace(/Peter Thiel, /gi, replaceDillweed("Thiel"))    

        .replace(/Milo Yiannopoulos /gi, replaceDillweed("Yiannopoulos"))
        .replace(/Milo Yiannopoulos, /gi, replaceDillweed("Yiannopoulos"))                 

        .replace(/Mike Pompeo /gi, replaceDillweed("Pompeo"))
        .replace(/Mike Pompeo, /gi, replaceDillweed("Pompeo")) 

        .replace(/Michael McCaul /gi, replaceDillweed("McCaul"))
        .replace(/Michael McCaul, /gi, replaceDillweed("McCaul"))     

        .replace(/Mike Rogers /gi, replaceDillweed("Rogers"))
        .replace(/Mike Rogers, /gi, replaceDillweed("Rogers"))   

        .replace(/Kris Korbach /gi, replaceDillweed("Korbach"))
        .replace(/Kris Korbach, /gi, replaceDillweed("Korbach"))   

        .replace(/alt-right/gi, replaceDillweed("altright"))
        .replace(/Alt-right/gi, replaceDillweed("altright"))   

        .replace(/white nationalist/gi, replaceDillweed("nationalist"))
        .replace(/white nationalists/gi, replaceDillweed("nationalists")) 

        .replace(/clean coal/gi, replaceDillweed("coal"))
        
        .replace(/anti-vaxxers/gi, replaceDillweed("vax"))     

        .replace(/fake news/gi, replaceDillweed("news"))

        .replace(/make America great again/gi, replaceDillweed("america"))

        .replace(/Tom Price /gi, replaceDillweed("Price"))
        .replace(/Tom Price, /gi, replaceDillweed("Price"));                                              

    // let finalHtml= er(
    //   newHtml,
    //   {
    //     leftOutsideNot: 'Donald ',
    //     leftOutside: '',
    //     leftMaybe: '',
    //     searchFor: 'Trump',
    //     rightMaybe: '',
    //     rightOutside: '',
    //     rightOutsideNot: ''
    //   },
    //   replaceDillweed("Trump")
    // );

    if( newHtml !== origText) {
        let newSpan = document.createElement('span');
        newSpan.innerHTML = newHtml;
        textNode.parentNode.replaceChild(newSpan,textNode);
    }
}

function processDocument() {
    let treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT,{
        acceptNode: function(node) { 
            if(node.textContent.length === 0) {
                return NodeFilter.FILTER_SKIP; //Skip empty text nodes
            } //else
            return NodeFilter.FILTER_ACCEPT;
        }
    }, false );
    while(treeWalker.nextNode()) {
        handleTextNode(treeWalker.currentNode);
    }
}

var insertedNodes = [];
var observer = new WebKitMutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        for(var i = 0; i < mutation.addedNodes.length; i++)
            insertedNodes.push(mutation.addedNodes[i]);
    })
    console.log(insertedNodes);
});
observer.observe(document, {
    childList: true
});
console.log(insertedNodes);

window.onload = function() {
    processDocument();
    insertionQ('.stream-item').every(function(element){

        processDocument();
      });    

    // insertionQ('div').every(function(element){
    //     processDocument();
    //     console.log("updating");
    // });
  };

$(window).scroll(function () { processDocument(); });

},{"./woke.json":5,"easy-replace":1}]},{},[6]);
