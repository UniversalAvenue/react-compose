'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.reactRenderer = reactRenderer;
exports.compose = compose;

var _getDisplayName = require('./getDisplayName');

var _getDisplayName2 = _interopRequireDefault(_getDisplayName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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