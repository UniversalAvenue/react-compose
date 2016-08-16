'use strict';

jest.autoMockOff();

var _require = require('enzyme');

var shallow = _require.shallow;

var React = require('react');
var sinon = require('sinon');

var compose = require('../index-v2').compose;

describe('Composing contexts', function () {
  beforeEach(function () {
    sinon.stub(console, 'error', function (warning) {
      throw new Error(warning);
    });
  });

  afterEach(function () {
    console.error.restore();
  });

  function p1(_ref, _ref2) {
    var children = _ref.children;
    var test = _ref2.test;

    return {
      children: test + ' ' + children + ' with context'
    };
  }

  p1.contextTypes = {
    test: React.PropTypes.string.isRequired
  };

  function p2() {
    return {
      children: 'works'
    };
  }

  it('should handle nested contexts prop', function () {
    var Super = compose(p1)('p');
    var MyComponent = compose(p2)(Super);
    var wrapper = shallow(React.createElement(MyComponent, null), {
      context: {
        test: 'react-compose'
      }
    });
    var para = wrapper.find('p');
    var props = para.node.props;
    expect(props.children).toEqual('react-compose works with context');
  });
});