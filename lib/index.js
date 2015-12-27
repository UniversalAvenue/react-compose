'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compilePropers = exports.compileStylers = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * aggregates a set of stylers into a constant part + a dynamic part
 **/

var mergeObjArr = function mergeObjArr(arr) {
  return _lodash2.default.assign.apply(_lodash2.default, [{}].concat(_toConsumableArray(arr)));
};

var compileStylers = exports.compileStylers = function compileStylers() {
  for (var _len = arguments.length, stylers = Array(_len), _key = 0; _key < _len; _key++) {
    stylers[_key] = arguments[_key];
  }

  var flattened = _lodash2.default.compact(_lodash2.default.flattenDeep(stylers));
  var constantStyles = _lodash2.default.takeWhile(flattened, function (st) {
    return !_lodash2.default.isFunction(st);
  });
  var dynamic = _lodash2.default.slice(flattened, constantStyles.length, flattened.length);
  var constant = mergeObjArr(constantStyles);
  return {
    constant: constant,
    dynamic: dynamic
  };
};

/**
 * aggregates a set of propers into a constant part + a dynamic part + Component
 * The component is always the last argument into the function
 **/

var compilePropers = exports.compilePropers = function compilePropers() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var Component = _lodash2.default.last(args);
  var propers = _lodash2.default.take(args, args.length - 1);
  var groupedPropers = _lodash2.default.groupBy(propers, function (p) {
    return _lodash2.default.isFunction(p);
  });
  return {
    constant: mergeObjArr(groupedPropers.false),
    dynamic: groupedPropers.true,
    Component: Component
  };
};