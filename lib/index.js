'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.children = exports.styles = exports.compose = exports.applyFunctor = exports.optimize = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * aggregates a set of functions/objects into a constant part + a dynamic part
 **/

var mergeObjArr = function mergeObjArr(arr) {
  var base = _lodash2.default.assign.apply(_lodash2.default, [{}].concat(_toConsumableArray(arr)));
  var styles = _lodash2.default.flatten(_lodash2.default.compact(_lodash2.default.map(arr, 'styles')));
  if (styles.length > 1) {
    base.styles = styles;
  }
  return base;
};

var optimize = exports.optimize = function optimize() {
  for (var _len = arguments.length, propers = Array(_len), _key = 0; _key < _len; _key++) {
    propers[_key] = arguments[_key];
  }

  var flattened = _lodash2.default.compact(_lodash2.default.flattenDeep(propers));
  var constantStyles = _lodash2.default.takeWhile(flattened, function (st) {
    return !_lodash2.default.isFunction(st);
  }) || [];
  var dynamic = _lodash2.default.slice(flattened, constantStyles.length, flattened.length) || [];
  var constant = mergeObjArr(constantStyles);
  return {
    constant: constant,
    dynamic: dynamic
  };
};

var flatMap = function flatMap(arr, fn) {
  if (_lodash2.default.isArray(arr)) {
    return _lodash2.default.flattenDeep(_lodash2.default.map(arr, fn));
  }
  return fn(arr);
};

var applyFunctor = exports.applyFunctor = function applyFunctor(functor) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  var reapply = function reapply(f) {
    return applyFunctor.apply(null, [f].concat(args));
  };
  if (_lodash2.default.isArray(functor)) {
    return flatMap(functor, reapply);
  }
  if (_lodash2.default.isFunction(functor)) {
    return reapply(functor.apply(null, args));
  }
  return functor;
};

var compose = exports.compose = function compose() {
  for (var _len3 = arguments.length, propers = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    propers[_key3] = arguments[_key3];
  }

  var ps = optimize(propers);

  return function (Component) {
    var ComposedComponent = function ComposedComponent(props, context) {
      var base = _extends({}, props, ps.constant);
      var _props = mergeObjArr([base].concat(_toConsumableArray(applyFunctor(ps.dynamic, base, context))));
      return (0, _config.composeComponent)(Component, _props);
    };
    ComposedComponent.contextTypes = (0, _config.exposeContextTypes)();
    return ComposedComponent;
  };
};

var styles = exports.styles = function styles() {
  for (var _len4 = arguments.length, stylers = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    stylers[_key4] = arguments[_key4];
  }

  var _optimize = optimize(stylers);

  var constant = _optimize.constant;
  var dynamic = _optimize.dynamic;

  // If all constants, return a constant proper

  if (dynamic.length === 0) {
    return {
      styles: constant
    };
  }

  return function (props, context) {
    var upstream = props.styles || [];
    var base = [].concat(_toConsumableArray(upstream), [constant]);
    var applied = applyFunctor(dynamic, _extends({}, props, { styles: base }), context);
    var _styles = [].concat(_toConsumableArray(base), _toConsumableArray(applied));
    return {
      styles: _styles
    };
  };
};

var children = exports.children = function children() {
  for (var _len5 = arguments.length, childers = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    childers[_key5] = arguments[_key5];
  }

  return function (props) {
    return {
      children: _lodash2.default.map(childers, (0, _config.renderChild)(props))
    };
  };
};