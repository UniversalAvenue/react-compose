'use strict';

jest.autoMockOff();

var compileStylers = require('../index').compileStylers;
var compilePropers = require('../index').compilePropers;

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