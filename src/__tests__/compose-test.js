jest.autoMockOff();

const _ = require('lodash');
const { shallow } = require('enzyme');

const optimize = require('../index').optimize;
const applyFunctor = require('../index').applyFunctor;
const compose = require('../index').compose;
const styles = require('../index').styles;
const children = require('../index').children;
const classNames = require('../index').classNames;
const mapProp = require('../index').mapProp;

describe('optimize', () => {
  it('should merge propers', () => {
    const res = optimize({
      propA: 'alpha',
    }, {
      propB: 2,
    }, () => ({ width: 400 }),
    () => ({ width: 400 }),
    );
    expect(res.constant).toEqual({
      propA: 'alpha',
      propB: 2,
    });
    expect(res.dynamic.length).toEqual(2);
  });
  it('should merge propers ignore constants after dynamics', () => {
    const res = optimize({
      propA: 'alpha',
    }, () => ({ width: 400 }),
    { propB: 2 },
    () => ({ width: 400 }),
    );
    expect(res.constant).toEqual({
      propA: 'alpha',
    });
    expect(res.dynamic.length).toEqual(3);
  });
});

describe('Apply functor', () => {
  const functorCreator = (key, value) => () => ({
    [key]: value,
  });
  const deepFunctorCreator = values => () =>
    _.map(values, (value, idx) => functorCreator(idx, value));
  it('should apply each functor in order', () => {
    const functors = [
      functorCreator('a', 1),
      functorCreator('b', 3),
      functorCreator('b', 2),
    ];
    const res = _.assign.apply(_, [{}, ...applyFunctor(functors)]);
    expect(res).toEqual({
      a: 1,
      b: 2,
    });
  });
  it('should apply deep functors', () => {
    const functors = [
      functorCreator('a', 1),
      deepFunctorCreator(['alpha', 'beta', 'ceta']),
    ];
    const res = _.assign.apply(_, [{}, ...applyFunctor(functors)]);
    expect(res).toEqual({
      a: 1,
      0: 'alpha',
      1: 'beta',
      2: 'ceta',
    });
  });
});

const PropTypes = require('prop-types');

const React = require('react');

describe('Compose', () => {
  const mapPropToKeyFunctor = (propKey, key) => props => ({
    [key]: props[propKey],
  });
  it('should produce a valid component', () => {
    const Compo = compose({ background: 'blue' }, { children: 'boo' })('p');
    const wrapper = shallow(<Compo />);
    const para = wrapper.find('p');
    expect(para.node.props.background).toEqual('blue');
  });

  it('should pass fed props into style functors', () => {
    const Compo = compose({ background: 'blue', strength: '400px' },
      mapPropToKeyFunctor('strength', 'fontSize'))('p');
    const wrapper = shallow(<Compo style={{ color: 'white' }} />);
    const para = wrapper.find('p').node;
    expect(para.props.background).toEqual('blue');
    expect(para.props.style.color).toEqual('white');
    expect(para.props.fontSize).toEqual('400px');
  });
});

describe('Styles', () => {
  const pToK = (propKey, key) => props => ({
    [key]: props[propKey],
  });
  it('should produce a valid component', () => {
    const Compo = compose(styles({ background: 'blue' }, { color: 'white' }))('p');
    const para = shallow(<Compo />).find('p').node;
    expect(para.props.style.background).toEqual('blue');
    expect(para.props.style.color).toEqual('white');
  });
  it('should produce a valid component with two separate styles', () => {
    const Compo = compose(styles({ background: 'blue' }), styles({ color: 'white' }))('p');
    const para = shallow(<Compo />).find('p').node;
    expect(para.props.style.background).toEqual('blue');
    expect(para.props.style.color).toEqual('white');
  });
  it('should produce a valid component with two dynamic stylers', () => {
    const Compo = compose({ strength: '5px', weight: 'normal' },
      styles(pToK('strength', 'fontSize'), pToK('weight', 'fontWeight')),
    )('p');
    const para = shallow(<Compo />).find('p').node;
    expect(para.props.style.fontSize).toEqual('5px');
    expect(para.props.style.fontWeight).toEqual('normal');
  });
  it('should produce a valid component with composite dynamic stylers', () => {
    const fontStyle = {
      fontSize: '5px',
      fontWeight: 'normal',
    };
    const colorStyle = {
      color: 'blue',
      backgroundColor: 'white',
    };
    const compositeStyle = () => [fontStyle, colorStyle];
    const Compo = compose(
      styles(compositeStyle),
    )('p');
    const para = shallow(<Compo />).find('p').node;
    expect(para.props.style.fontSize).toEqual('5px');
    expect(para.props.style.fontWeight).toEqual('normal');
  });
  it('should produce a valid component with composite multilayer dynamic stylers', () => {
    const fontStyle = pToK('strength', 'fontSize');
    const colorStyle = {
      color: 'blue',
      backgroundColor: 'white',
    };
    const compositeStyle = () => [fontStyle, colorStyle];
    const Compo = compose({ strength: '5px' },
      styles(compositeStyle),
    )('p');
    const para = shallow(<Compo />).find('p').node;
    expect(para.props.style.fontSize).toEqual('5px');
  });
});

describe('Children', () => {
  it('should produce a valid component', () => {
    const Alpha = props => <span>{`The cat is ${props.feeling}`}</span>;
    Alpha.propTypes = {
      feeling: PropTypes.string.isRequired,
    };
    const Compo = compose({ feeling: 'angry' }, children(Alpha))('p');
    const para = shallow(<Compo />).childAt(0).shallow().node;
    expect(para.props.children).toEqual('The cat is angry');
  });
});

describe('classNames', () => {
  it('should produce a correct className', () => {
    const result = classNames('btn', 'btn-pressed')({});
    expect(result.className).toEqual('btn btn-pressed');
  });
  it('should handle classNames propers', () => {
    const result = classNames('btn', ({ pressed }) => pressed && 'btn-pressed')({
      pressed: true,
    });
    expect(result.className).toEqual('btn btn-pressed');
  });
  it('should handle falsy classNames propers', () => {
    const result = classNames('btn', ({ pressed }) => pressed && 'btn-pressed')({
      pressed: false,
    });
    expect(result.className).toEqual('btn');
  });
  it('should append with input classNames', () => {
    const result = classNames('btn', ({ pressed }) => pressed && 'btn-pressed')({
      pressed: false,
      className: 'alpha',
    });
    expect(result.className).toEqual('btn alpha');
  });
});

describe('Nesting', () => {
  it('should optimize nested compose calls', () => {
    const Root = props => <p {...props}>root</p>;
    const Level1 = compose({ background: 'red' })(Root);
    const Level2 = compose({ color: 'blue' })(Level1);
    const wrapper = shallow(<Level2 />);
    const para = wrapper.shallow().find('p').node;
    expect(para.props.background).toEqual('red');
    expect(para.props.color).toEqual('blue');
  });
  fit('should optimize nested compose calls and dynamics should be correct', () => {
    const Root = props => <p {...props}>root</p>;
    const Level1 = compose({ background: 'red' }, () => ({ color: 'red' }))(Root);
    const Level2 = compose({ color: 'blue' }, ({ background }) =>
      ({
        background: background === 'red' ? 'blue' : 'brown',
      }),
    )(Level1);
    const wrapper = shallow(<Level2 />);
    const para = wrapper.shallow().find('p').node;
    expect(para.props.background).toEqual('red');
    expect(para.props.color).toEqual('red');
  });
  it('should produce a great display name', () => {
    function Root() {
      return <p>Names</p>;
    }
    const Level1 = compose({ background: 'red' })(Root);
    const Level2 = compose({ color: 'blue' })(Level1);
    expect(Level2.displayName).toEqual('composed(Root)');
  });
});

describe('mapProp', () => {
  it('should transform input value', () => {
    function Root(props) {
      return <p {...props} />;
    }
    const Comped = compose(mapProp('x', x => x * 2))(Root);
    const p = shallow(<Comped x={5} />).node;
    expect(p.props.x).toEqual(10);
  });
});

describe('composing', () => {
  it('chains properly', () => {
    const f0 = {
      a: 7,
    };
    function f1() {
      return { b: 5 };
    }
    function f2({ a, b }) {
      return { c: a + b };
    }
    const Comped = compose(f0, f1, f2)('p');
    const p = shallow(<Comped />).node;
    expect(p.props.c).toEqual(12);
  });
  it('chains properly while nesting', () => {
    const f0 = {
      a: 7,
    };
    function f1() {
      return { b: 5 };
    }
    function f2({ a, b }) {
      return { c: a + b };
    }
    function f3() {
      return { d: 5 };
    }
    const C1 = compose(f2)('p');
    const Comped = compose(f0, f1, f3)(C1);
    const p = shallow(<Comped />).node;
    expect(p.props.c).toEqual(12);
  });
  it('chains properly while deeply nesting', () => {
    const f0 = {
      a: 7,
    };
    function f1() {
      return { b: 5 };
    }
    function f2({ a, b }) {
      return { c: a + b };
    }
    function f3({ c }) {
      return { d: c + 2 };
    }
    const C0 = compose(f3)('p');
    const C1 = compose(f2)(C0);
    const Comped = compose(f0, f1)(C1);
    const p = shallow(<Comped />).node;
    expect(p.props.d).toEqual(14);
  });
});
