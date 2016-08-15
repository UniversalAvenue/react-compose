'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

jest.autoMockOff();

var _require = require('enzyme');

var shallow = _require.shallow;

var React = require('react');
var sinon = require('sinon');

var compose = require('../index-v2').compose;

describe('Compose', function () {
  beforeEach(function () {
    sinon.stub(console, 'error', function (warning) {
      throw new Error(warning);
    });
  });

  afterEach(function () {
    console.error.restore();
  });

  function adjustBackground(_ref) {
    var myColor = _ref.myColor;

    var props = _objectWithoutProperties(_ref, ['myColor']);

    return _extends({}, props, {
      style: {
        backgroundColor: myColor
      }
    });
  }

  adjustBackground.propTypes = {
    myColor: React.PropTypes.string.isRequired
  };

  function setupEvents(_ref2) {
    var isHovering = _ref2.isHovering;
    var isActive = _ref2.isActive;

    var props = _objectWithoutProperties(_ref2, ['isHovering', 'isActive']);

    var myColor = 'green';
    if (isHovering && isActive) {
      myColor = 'red';
    } else if (isHovering) {
      myColor = 'blue';
    } else if (isActive) {
      myColor = 'yellow';
    }
    return _extends({}, props, {
      myColor: myColor
    });
  }

  setupEvents.propTypes = {
    isActive: React.PropTypes.bool,
    isHovering: React.PropTypes.bool
  };

  function pio(props) {
    var MyComponent = compose(setupEvents, adjustBackground)('p');
    var wrapper = shallow(React.createElement(MyComponent, props));
    var para = wrapper.find('p');
    return para.node.props;
  }

  it('should throw on missing prop', function () {
    var MyComponent = compose(adjustBackground)('p');
    expect(function () {
      return shallow(React.createElement(MyComponent, null));
    }).toThrow();
  });
  it('should not pass on interim prop', function () {
    var props = pio({ isActive: true, isHovering: true });
    expect(props.isActive).not.toBeDefined();
    expect(props.isHovering).not.toBeDefined();
    expect(props.style.backgroundColor).toEqual('red');
    props = pio({ isActive: false, isHovering: true });
    expect(props.style.backgroundColor).toEqual('blue');
  });
  it('should optimize nested compose calls', function () {
    var calls = 0;
    function renderer(Component, props) {
      calls++;
      return React.createElement(Component, props);
    }
    var Super = compose(adjustBackground)('p', renderer);
    var MyComponent = compose(setupEvents)(Super, renderer);
    var wrapper = shallow(React.createElement(MyComponent, { isActive: true }));
    var para = wrapper.find('p');
    var props = para.node.props;
    expect(props.isActive).not.toBeDefined();
    expect(props.style.backgroundColor).toEqual('yellow');
    expect(calls).toEqual(1);
  });
  it('should handle nested defaultProps calls', function () {
    function p1(props) {
      return props;
    }
    p1.defaultProps = {
      className: 'name'
    };
    function p2(props) {
      return props;
    }
    p2.defaultProps = {
      children: 'label'
    };
    var Super = compose(p1)('p');
    var MyComponent = compose(p2)(Super);
    var wrapper = shallow(React.createElement(MyComponent, null));
    var para = wrapper.find('p');
    var props = para.node.props;
    expect(props.className).toEqual('name');
    expect(props.children).toEqual('label');
  });
});