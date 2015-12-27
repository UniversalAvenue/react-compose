jest.autoMockOff();

const _ = require('lodash');

const compileStylers = require('../index').compileStylers;
const compilePropers = require('../index').compilePropers;
const applyFunctor = require('../index').applyFunctor;
const compose = require('../index').compose;

describe('compileStylers', () => {
  it('should merge stylers', () => {
    const res = compileStylers({
      background: 'blue',
    }, {
      color: 'red',
    }, () => ({ width: 400 }));
    expect(res.constant).toEqual({
      background: 'blue',
      color: 'red',
    });
    expect(res.dynamic.length).toEqual(1);
  });
});
describe('compilePropers', () => {
  it('should merge propers', () => {
    const res = compilePropers({
      propA: 'alpha',
    }, {
      propB: 2,
    }, () => ({ width: 400 }),
    () => ({ width: 400 }),
    'div'
    );
    expect(res.constant).toEqual({
      propA: 'alpha',
      propB: 2,
    });
    expect(res.dynamic.length).toEqual(2);
    expect(res.Component).toEqual('div');
  });
});

describe('Apply functor', () => {
  const functorCreator = (key, value) => () => ({
    [key]: value,
  });
  const deepFunctorCreator = (values) => () => {
    return _.map(values, (value, idx) => functorCreator(idx, value));
  };
  it('should apply each functor in order', () => {
    const functors = [
      functorCreator('a', 1),
      functorCreator('b', 3),
      functorCreator('b', 2),
    ];
    const res = _.assign.apply(_, [ {}, ...applyFunctor(functors)]);
    expect(res).toEqual({
      a: 1,
      b: 2,
    });
  });
  it('should apply deep functors', () => {
    const functors = [
      functorCreator('a', 1),
      deepFunctorCreator([ 'alpha', 'beta', 'ceta' ]),
    ];
    const res = _.assign.apply(_, [ {}, ...applyFunctor(functors)]);
    expect(res).toEqual({
      a: 1,
      '0': 'alpha',
      '1': 'beta',
      '2': 'ceta',
    });
  });
});

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

describe('Compose', () => {
  const mapPropToStyleFunctor = (propKey, styleKey) => (props) => ({
    [styleKey]: props[propKey],
  });
  it('should produce a valid component', () => {
    const Compo = compose({ background: 'blue' })({ children: 'boo' }, 'p');
    const doc = renderInto(Compo);
    const para = findTag(doc, 'p');
    expect(para.style.background).toEqual('blue');
  });

  it('should pass fed props into style functors', () => {
    const Compo = compose({ background: 'blue' }, mapPropToStyleFunctor('strength', 'fontSize')
      )({ strength: '400px' }, 'p');
    const doc = renderInto(() => <Compo style={{ color: 'white' }} />);
    const para = findTag(doc, 'p');
    expect(para.style.background).toEqual('blue');
    expect(para.style.color).toEqual('whiter');
    expect(para.style.fontSize).toEqual('400px');
  });
});
