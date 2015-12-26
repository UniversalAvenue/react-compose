'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

jest.autoMockOff();

var React = require('react');
var TestUtils = require('react-addons-test-utils');

var compose = require('../index').default;

var Wrapper = (function (_React$Component) {
  _inherits(Wrapper, _React$Component);

  function Wrapper() {
    _classCallCheck(this, Wrapper);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Wrapper).apply(this, arguments));
  }

  _createClass(Wrapper, [{
    key: 'render',
    value: function render() {
      return React.createElement('div', this.props);
    }
  }]);

  return Wrapper;
})(React.Component);

var renderInto = function renderInto(Component) {
  return TestUtils.renderIntoDocument(React.createElement(
    Wrapper,
    null,
    React.createElement(Component, null)
  ));
};

var findTag = function findTag(comp, tag) {
  return TestUtils.findRenderedDOMComponentWithTag(comp, tag);
};
describe('Compose', function () {
  it('should produce a simple p tag', function () {
    var Component = compose({ background: 'blue' })('p');
    var comp = renderInto(Component);
    var p = findTag(comp, 'p');
    expect(p.props.styles[0].background).toEqual('blue');
  });
});