'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectStyles = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var injectStyles = exports.injectStyles = function injectStyles(inputStyles) {
  return function (_ref, theme) {
    var _ref$styles = _ref.styles;
    var styles = _ref$styles === undefined ? [] : _ref$styles;

    var props = _objectWithoutProperties(_ref, ['styles']);

    var apply = function apply(foo) {
      return _lodash2.default.isFunction(foo) ? foo(props, theme) : foo;
    };
    var themers = _lodash2.default.flatten(_lodash2.default.map(inputStyles, apply));
    var _styles = _lodash2.default.flatten([_lodash2.default.map(themers, apply), styles]);
    return _extends({
      styles: _styles
    }, props);
  };
};

exports.default = function () {
  for (var _len = arguments.length, input = Array(_len), _key = 0; _key < _len; _key++) {
    input[_key] = arguments[_key];
  }

  return function (Component) {
    var StyledBase = function StyledBase(props, _ref2) {
      var theme = _ref2.theme;

      return _react2.default.createElement(Component, injectStyles(input)(props, theme));
    };
    StyledBase.contextTypes = {
      theme: _react.PropTypes.object
    };
    return StyledBase;
  };
};