'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.children = exports.styles = exports.compose = exports.applyFunctor = exports.optimize = undefined;

var _reduce2 = require('lodash/reduce');

var _reduce3 = _interopRequireDefault(_reduce2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _slice2 = require('lodash/slice');

var _slice3 = _interopRequireDefault(_slice2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _takeWhile2 = require('lodash/takeWhile');

var _takeWhile3 = _interopRequireDefault(_takeWhile2);

var _flattenDeep2 = require('lodash/flattenDeep');

var _flattenDeep3 = _interopRequireDefault(_flattenDeep2);

var _map2 = require('lodash/map');

var _map3 = _interopRequireDefault(_map2);

var _compact2 = require('lodash/compact');

var _compact3 = _interopRequireDefault(_compact2);

var _flatten2 = require('lodash/flatten');

var _flatten3 = _interopRequireDefault(_flatten2);

var _assign2 = require('lodash/assign');

var _assign3 = _interopRequireDefault(_assign2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.classNames = classNames;
exports.mapProp = mapProp;

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _config = require('./config');

var _getDisplayName = require('./getDisplayName');

var _getDisplayName2 = _interopRequireDefault(_getDisplayName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * aggregates a set of functions/objects into a constant part + a dynamic part
 *
 *
 **/

var mergeObjArr = function mergeObjArr(arr) {
  var base = _assign3.default.apply(_assign3.default.apply.placeholder, [{}].concat(_toConsumableArray(arr)));
  var styles = (0, _flatten3.default)((0, _compact3.default)((0, _map3.default)(arr, 'styles')));
  if (styles.length > 1) {
    base.styles = styles;
  }
  return base;
};

var optimize = exports.optimize = function optimize() {
  for (var _len = arguments.length, propers = Array(_len), _key = 0; _key < _len; _key++) {
    propers[_key] = arguments[_key];
  }

  var flattened = (0, _compact3.default)((0, _flattenDeep3.default)(propers));
  var constantStyles = (0, _takeWhile3.default)(flattened, function (st) {
    return !(0, _isFunction3.default)(st);
  }) || [];
  var dynamic = (0, _slice3.default)(flattened, constantStyles.length, flattened.length) || [];
  var constant = mergeObjArr(constantStyles);
  return {
    constant: constant,
    dynamic: dynamic
  };
};

var flatMap = function flatMap(arr, fn) {
  if ((0, _isArray3.default)(arr)) {
    return (0, _flattenDeep3.default)((0, _map3.default)(arr, fn));
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
  if ((0, _isArray3.default)(functor)) {
    return flatMap(functor, reapply);
  }
  if ((0, _isFunction3.default)(functor)) {
    return reapply(functor.apply(undefined, args));
  }
  return functor;
};

function mergePropers(a, b) {
  return optimize([a.constant].concat(_toConsumableArray(a.dynamic), [b.constant], _toConsumableArray(b.dynamic)));
}

var compose = exports.compose = function compose() {
  for (var _len3 = arguments.length, propers = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    propers[_key3] = arguments[_key3];
  }

  var optimizedPropers = optimize(propers);

  function doCompose(Component, ps) {
    var ComposedComponent = function ComposedComponent(props, context) {
      var base = _extends({}, props, ps.constant);
      var finalProps = ps.dynamic.reduce(function (obj, fn) {
        return Object.assign({}, obj, applyFunctor(fn, obj, context));
      }, base);
      return (0, _config.composeComponent)(Component, finalProps);
    };
    ComposedComponent.contextTypes = (0, _config.exposeContextTypes)();
    ComposedComponent.displayName = 'composed(' + (0, _getDisplayName2.default)(Component) + ')';
    return ComposedComponent;
  }

  function mergeComposed(Component) {
    var Target = Component;
    var ps = optimizedPropers;
    if (Component && Component.composedBy) {
      var _Component$composedBy = Component.composedBy,
          composers = _Component$composedBy.composers,
          Parent = _Component$composedBy.Parent;

      ps = mergePropers(optimizedPropers, composers);
      Target = Parent;
    }
    var Result = doCompose(Target, ps);
    Result.composedBy = {
      composers: ps,
      Parent: Target
    };
    return Result;
  }

  return mergeComposed;
};

var styles = exports.styles = function styles() {
  for (var _len4 = arguments.length, stylers = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    stylers[_key4] = arguments[_key4];
  }

  var _optimize = optimize(stylers),
      constant = _optimize.constant,
      dynamic = _optimize.dynamic;

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
    var finalStyles = [].concat(_toConsumableArray(base), _toConsumableArray(applied));
    return {
      styles: finalStyles
    };
  };
};

var children = exports.children = function children() {
  for (var _len5 = arguments.length, childers = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    childers[_key5] = arguments[_key5];
  }

  return function (props) {
    return {
      children: (0, _map3.default)(childers, (0, _config.renderChild)(props))
    };
  };
};

function handleUpstreamClassName(name) {
  if (!name) {
    return {};
  }
  if ((0, _isString3.default)(name)) {
    return _defineProperty({}, name, true);
  }
  return name;
}

function arrayToClassNames(arr) {
  return (0, _reduce3.default)(arr, function (sum, item) {
    return (0, _isString3.default)(item) ? _extends({}, sum, _defineProperty({}, item, true)) : _extends({}, sum, item);
  }, {});
}

function classNames() {
  for (var _len6 = arguments.length, names = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    names[_key6] = arguments[_key6];
  }

  return function (props, context) {
    return {
      className: (0, _classnames2.default)(_extends({}, arrayToClassNames(applyFunctor(names, props, context)), handleUpstreamClassName(props.className)))
    };
  };
}

function mapProp(property, fn, defaultValue) {
  return function (props) {
    return _defineProperty({}, property, fn(props[property] || defaultValue));
  };
}