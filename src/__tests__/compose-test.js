jest.autoMockOff();

const _ = require('lodash');

const compilePropers = require('../index').compilePropers;
const applyFunctor = require('../index').applyFunctor;
const compose = require('../index').compose;

describe('compilePropers', () => {
  it('should merge propers', () => {
    const res = compilePropers({
      propA: 'alpha',
    }, {
      propB: 2,
    }, () => ({ width: 400 }),
    () => ({ width: 400 })
    );
    expect(res.constant).toEqual({
      propA: 'alpha',
      propB: 2,
    });
    expect(res.dynamic.length).toEqual(2);
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
  const mapPropToKeyFunctor = (propKey, key) => (props) => ({
    [key]: props[propKey],
  });
  it('should produce a valid component', () => {
    const Compo = compose({ background: 'blue' }, { children: 'boo' })('p');
    const doc = renderInto(Compo);
    const para = findTag(doc, 'p');
    expect(para.props.background).toEqual('blue');
  });

  it('should pass fed props into style functors', () => {
    const Compo = compose({ background: 'blue', strength: '400px' }, mapPropToKeyFunctor('strength', 'fontSize'))('p');
    const doc = renderInto(() => <Compo style={{ color: 'white' }} />);
    const para = findTag(doc, 'p');
    expect(para.props.background).toEqual('blue');
    expect(para.style.color).toEqual('white');
    expect(para.props.fontSize).toEqual('400px');
  });
});
