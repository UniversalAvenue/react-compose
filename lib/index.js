'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compose = exports.applyFunctor = exports.compilePropers = exports.compileStylers = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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

var flatMap = function flatMap(arr, fn) {
  if (_lodash2.default.isArray(arr)) {
    return _lodash2.default.flattenDeep(_lodash2.default.map(arr, fn));
  }
  return fn(arr);
};

var applyFunctor = exports.applyFunctor = function applyFunctor(functor) {
  for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
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

var composeComponent = function composeComponent(SuperComponent, cs, ps) {
  return function (_ref, context) {
    var styles = _ref.styles;

    var superProps = _objectWithoutProperties(_ref, ['styles']);

    var _styles = [cs.constant].concat(_toConsumableArray(applyFunctor(cs.dynamic, superProps, context)), _toConsumableArray(styles));
    var _props = [ps.constant].concat(_toConsumableArray(applyFunctor(ps.dynamic, superProps, context)), _toConsumableArray(superProps));
    return _react2.default.createElement(SuperComponent, _extends({
      styles: _styles
    }, _props));
  };
};

var compose = exports.compose = function compose() {
  for (var _len4 = arguments.length, stylers = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    stylers[_key4] = arguments[_key4];
  }

  return function () {
    for (var _len5 = arguments.length, propers = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      propers[_key5] = arguments[_key5];
    }

    var cs = compileStylers(stylers);
    var ps = compilePropers(propers);

    return function (SuperComponent) {
      var ComposedComponent = composeComponent(SuperComponent, cs, ps);
      ComposedComponent.contextTypes = {
        theme: PropTypes.object
      };
      return ComposedComponent;
    };
  };
};