'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.reactRenderer = reactRenderer;
exports.compose = compose;
exports.flatReduce = flatReduce;
exports.extend = extend;
exports.styles = styles;

var _getDisplayName = require('./getDisplayName');

var _getDisplayName2 = _interopRequireDefault(_getDisplayName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function setDisplayName(Component) {
  this.displayName = 'composed(' + (0, _getDisplayName2.default)(Component) + ')';
  return this;
}

function mergeObj(name) {
  return function merger(Component, fns) {
    this[name] = _extends({}, Component[name], fns.filter(function (fn) {
      return (0, _isFunction3.default)(fn);
    }).reduce(function (sum, fn) {
      return fn[name] ? Object.assign(sum, fn[name]) : sum;
    }, {}));
    return this;
  };
}

function preservePartial(Component, fns) {
  this.composed = {
    Component: Component,
    fns: fns
  };
  return this;
}

var mods = [setDisplayName, mergeObj('propTypes'), mergeObj('contextTypes'), mergeObj('defaultProps'), preservePartial];

function reactRenderer(Component, props) {
  // eslint-disable-next-line global-require
  var React = require('react');
  return React.createElement(Component, props);
}

function compose() {
  for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function (Component) {
    var renderer = arguments.length <= 1 || arguments[1] === undefined ? reactRenderer : arguments[1];

    if (Component.composed) {
      var partial = Component.composed;
      return compose.apply(null, [].concat(fns, _toConsumableArray(partial.fns)))(partial.Component, renderer);
    }

    var extensions = mods.reduce(function (comp, fn) {
      return fn.apply(comp, [Component, fns]);
    }, {});

    function composed(props, context) {
      var pass = fns.reduce(function (sum, fn) {
        return fn(sum, context);
      }, props);
      return renderer(Component, pass);
    }

    Object.assign(composed, extensions);

    return composed;
  };
}

function flatReduce(fn) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  if ((0, _isFunction3.default)(fn)) {
    return flatReduce.apply(null, [fn.apply(null, args)].concat(args));
  } else if ((0, _isArray3.default)(fn)) {
    return fn.reduce(function (sum, foo) {
      return flatReduce.apply(null, [foo, sum].concat(_toConsumableArray(args.slice(1))));
    }, args[0]);
  }
  return fn;
}

/**
 * extend a named prop with a given prop map
 **/

function extend(name, fn) {
  var wrap = function wrap(props, context) {
    return _extends({}, props, _defineProperty({}, name, _extends({}, props[name] || {}, fn(props, context))));
  };
  Object.keys(fn).map(function (key) {
    return Object.assign(wrap, _defineProperty({}, key, fn[key]));
  });
  return wrap;
}

function styles() {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return extend('style', function () {
    for (var _len4 = arguments.length, seconds = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      seconds[_key4] = arguments[_key4];
    }

    return flatReduce.apply(null, [args].concat(seconds));
  });
}