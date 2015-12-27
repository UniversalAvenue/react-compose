'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.autoMockOff();

var _ = require('lodash');

var compileStylers = require('../index').compileStylers;
var compilePropers = require('../index').compilePropers;
var applyFunctor = require('../index').applyFunctor;

/*

const React = require('react');
const TestUtils = require('react-addons-test-utils');

class Wrapper extends React.Component {
  render() {
    return <div {...this.props}/>;
  }
}

const renderInto = Component => {
  return TestUtils.renderIntoDocument(<Wrapper><Component /></Wrapper>);
};

const findTag = (comp, tag) => {
  return TestUtils.findRenderedDOMComponentWithTag(comp, tag);
};
*/
describe('compileStylers', function () {
  it('should merge stylers', function () {
    var res = compileStylers({
      background: 'blue'
    }, {
      color: 'red'
    }, function () {
      return { width: 400 };
    });
    expect(res.constant).toEqual({
      background: 'blue',
      color: 'red'
    });
    expect(res.dynamic.length).toEqual(1);
  });
});
describe('compilePropers', function () {
  it('should merge propers', function () {
    var res = compilePropers({
      propA: 'alpha'
    }, {
      propB: 2
    }, function () {
      return { width: 400 };
    }, function () {
      return { width: 400 };
    }, 'div');
    expect(res.constant).toEqual({
      propA: 'alpha',
      propB: 2
    });
    expect(res.dynamic.length).toEqual(2);
    expect(res.Component).toEqual('div');
  });
});

describe('Apply functor', function () {
  var functorCreator = function functorCreator(key, value) {
    return function () {
      return _defineProperty({}, key, value);
    };
  };
  var deepFunctorCreator = function deepFunctorCreator(values) {
    return function () {
      return _.map(values, function (value, idx) {
        return functorCreator(idx, value);
      });
    };
  };
  it('should apply each functor in order', function () {
    var functors = [functorCreator('a', 1), functorCreator('b', 3), functorCreator('b', 2)];
    var res = _.assign.apply(_, [{}].concat(_toConsumableArray(applyFunctor(functors))));
    expect(res).toEqual({
      a: 1,
      b: 2
    });
  });
  it('should apply deep functors', function () {
    var functors = [functorCreator('a', 1), deepFunctorCreator(['alpha', 'beta', 'ceta'])];
    var res = _.assign.apply(_, [{}].concat(_toConsumableArray(applyFunctor(functors))));
    expect(res).toEqual({
      a: 1,
      '0': 'alpha',
      '1': 'beta',
      '2': 'ceta'
    });
  });
});