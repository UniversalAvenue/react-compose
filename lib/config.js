'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.plugin = exports.renderChild = exports.composeComponent = exports.exposeContextTypes = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var plugin = {};
var functions = {};

var configurable = function configurable(key, defaultFn) {
  var argGetter = arguments.length <= 2 || arguments[2] === undefined ? function () {
    return [];
  } : arguments[2];

  var apply = function apply(fn) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return fn.apply(null, [].concat(args, _toConsumableArray(argGetter())));
    };
  };
  plugin[key] = function (fn) {
    return functions[key] = apply(fn);
  };
  functions[key] = apply(defaultFn);
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return functions[key].apply(null, args);
  };
};

var defaultContextTypes = function defaultContextTypes() {
  return {};
};
var exposeContextTypes = exports.exposeContextTypes = configurable('exposeContextTypes', defaultContextTypes, function () {
  return [_react.PropTypes];
});

var merge = function merge(arr) {
  return _lodash2.default.assign.apply(_lodash2.default, [{}].concat(_toConsumableArray(arr)));
};
var defaultComposeComponent = function defaultComposeComponent(Component, props) {
  var _props$styles = props.styles;
  var styles = _props$styles === undefined ? [] : _props$styles;
  var _props$style = props.style;
  var style = _props$style === undefined ? {} : _props$style;

  var rest = _objectWithoutProperties(props, ['styles', 'style']);

  return _react2.default.createElement(Component, _extends({ style: merge([style].concat(styles)) }, rest));
};
var composeComponent = exports.composeComponent = configurable('composeComponent', defaultComposeComponent);

var defaultRenderChild = function defaultRenderChild(props) {
  return function (Child, index) {
    return _react2.default.createElement(Child, _extends({}, props, { key: (Child.displayName || '') + index }));
  };
};
var renderChild = exports.renderChild = configurable('renderChild', defaultRenderChild);

exports.plugin = plugin;