'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

var _omitBy2 = require('lodash/omitBy');

var _omitBy3 = _interopRequireDefault(_omitBy2);

var _reduce2 = require('lodash/reduce');

var _reduce3 = _interopRequireDefault(_reduce2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = connect;
exports.applyMiddleware = applyMiddleware;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _getDisplayName = require('./getDisplayName');

var _getDisplayName2 = _interopRequireDefault(_getDisplayName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
  return _extends({}, parentProps, stateProps, dispatchProps);
};

function createDispatchProps(dispatchers, dispatch) {
  if ((0, _isFunction3.default)(dispatchers)) {
    return dispatchers(dispatch);
  }
  function dispatchHandler(fn) {
    var action = (0, _isString3.default)(fn) ? { type: fn } : fn;
    return function () {
      return dispatch(action);
    };
  }
  return (0, _reduce3.default)(dispatchers, function (sum, fn, key) {
    return Object.assign(sum, _defineProperty({}, key, dispatchHandler(fn)));
  }, {});
}

function wrapLifeCycle(fn) {
  if (!(0, _isFunction3.default)(fn)) {
    var action = (0, _isString3.default)(fn) ? { type: fn } : fn;
    return function wrappedStaticLifeCycleMethod() {
      this.dispatch(action);
    };
  }
  return fn;
}

function connect(reducer, dispatchers) {
  var lifeCycle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var merge = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultMergeProps;
  var middlewares = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

  return function (Component) {
    var Connected = function (_React$Component) {
      _inherits(Connected, _React$Component);

      function Connected(props) {
        _classCallCheck(this, Connected);

        var _this = _possibleConstructorReturn(this, (Connected.__proto__ || Object.getPrototypeOf(Connected)).call(this, props));

        _this.state = reducer(props, {});
        _this.dispatch = _this.dispatch.bind(_this);
        var middlewareAPI = {
          getState: function getState() {
            return _this.state;
          },
          dispatch: _this.dispatch
        };
        var chain = middlewares.map(function (middleware) {
          return middleware(middlewareAPI);
        });
        _this.dispatch = [].concat(_toConsumableArray(chain)).reduceRight(function (a, fn) {
          return fn(a);
        }, _this.dispatch);
        _this.dispatchProps = createDispatchProps(dispatchers, _this.dispatch);
        return _this;
      }

      _createClass(Connected, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
          var _this2 = this;

          this.setState((0, _omitBy3.default)(nextProps, function (val, key) {
            return val === _this2.state[key];
          }));
        }
      }, {
        key: 'getProps',
        value: function getProps() {
          return merge(this.state, this.dispatchProps, this.props);
        }
      }, {
        key: 'dispatch',
        value: function dispatch(action) {
          var nextState = reducer(this.state, action);
          if (nextState !== this.state) {
            this.setState(nextState);
          }
          return action;
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(Component, this.getProps());
        }
      }]);

      return Connected;
    }(_react2.default.Component);

    Connected.displayName = 'connect(' + (0, _getDisplayName2.default)(Component) + ')';
    (0, _each3.default)(lifeCycle, function (fn, key) {
      return Object.assign(Connected.prototype, _defineProperty({}, key, wrapLifeCycle(fn)));
    });
    return Connected;
  };
}

function applyMiddleware() {
  for (var _len = arguments.length, wares = Array(_len), _key = 0; _key < _len; _key++) {
    wares[_key] = arguments[_key];
  }

  return function () {
    return connect.apply(null, [arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1], (arguments.length <= 2 ? undefined : arguments[2]) || {}, (arguments.length <= 3 ? undefined : arguments[3]) || defaultMergeProps, wares]);
  };
}