'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.autoMockOff();

var _ = require('lodash');

var _require = require('enzyme'),
    shallow = _require.shallow;

var optimize = require('../index').optimize;
var applyFunctor = require('../index').applyFunctor;
var compose = require('../index').compose;
var styles = require('../index').styles;
var children = require('../index').children;
var classNames = require('../index').classNames;
var mapProp = require('../index').mapProp;

describe('optimize', function () {
  it('should merge propers', function () {
    var res = optimize({
      propA: 'alpha'
    }, {
      propB: 2
    }, function () {
      return { width: 400 };
    }, function () {
      return { width: 400 };
    });
    expect(res.constant).toEqual({
      propA: 'alpha',
      propB: 2
    });
    expect(res.dynamic.length).toEqual(2);
  });
  it('should merge propers ignore constants after dynamics', function () {
    var res = optimize({
      propA: 'alpha'
    }, function () {
      return { width: 400 };
    }, { propB: 2 }, function () {
      return { width: 400 };
    });
    expect(res.constant).toEqual({
      propA: 'alpha'
    });
    expect(res.dynamic.length).toEqual(3);
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
      0: 'alpha',
      1: 'beta',
      2: 'ceta'
    });
  });
});

var PropTypes = require('prop-types');

var React = require('react');

describe('Compose', function () {
  var mapPropToKeyFunctor = function mapPropToKeyFunctor(propKey, key) {
    return function (props) {
      return _defineProperty({}, key, props[propKey]);
    };
  };
  it('should produce a valid component', function () {
    var Compo = compose({ background: 'blue' }, { children: 'boo' })('p');
    var wrapper = shallow(React.createElement(Compo, null));
    var para = wrapper.find('p');
    expect(para.node.props.background).toEqual('blue');
  });

  it('should pass fed props into style functors', function () {
    var Compo = compose({ background: 'blue', strength: '400px' }, mapPropToKeyFunctor('strength', 'fontSize'))('p');
    var wrapper = shallow(React.createElement(Compo, { style: { color: 'white' } }));
    var para = wrapper.find('p').node;
    expect(para.props.background).toEqual('blue');
    expect(para.props.style.color).toEqual('white');
    expect(para.props.fontSize).toEqual('400px');
  });
});

describe('Styles', function () {
  var pToK = function pToK(propKey, key) {
    return function (props) {
      return _defineProperty({}, key, props[propKey]);
    };
  };
  it('should produce a valid component', function () {
    var Compo = compose(styles({ background: 'blue' }, { color: 'white' }))('p');
    var para = shallow(React.createElement(Compo, null)).find('p').node;
    expect(para.props.style.background).toEqual('blue');
    expect(para.props.style.color).toEqual('white');
  });
  it('should produce a valid component with two separate styles', function () {
    var Compo = compose(styles({ background: 'blue' }), styles({ color: 'white' }))('p');
    var para = shallow(React.createElement(Compo, null)).find('p').node;
    expect(para.props.style.background).toEqual('blue');
    expect(para.props.style.color).toEqual('white');
  });
  it('should produce a valid component with two dynamic stylers', function () {
    var Compo = compose({ strength: '5px', weight: 'normal' }, styles(pToK('strength', 'fontSize'), pToK('weight', 'fontWeight')))('p');
    var para = shallow(React.createElement(Compo, null)).find('p').node;
    expect(para.props.style.fontSize).toEqual('5px');
    expect(para.props.style.fontWeight).toEqual('normal');
  });
  it('should produce a valid component with composite dynamic stylers', function () {
    var fontStyle = {
      fontSize: '5px',
      fontWeight: 'normal'
    };
    var colorStyle = {
      color: 'blue',
      backgroundColor: 'white'
    };
    var compositeStyle = function compositeStyle() {
      return [fontStyle, colorStyle];
    };
    var Compo = compose(styles(compositeStyle))('p');
    var para = shallow(React.createElement(Compo, null)).find('p').node;
    expect(para.props.style.fontSize).toEqual('5px');
    expect(para.props.style.fontWeight).toEqual('normal');
  });
  it('should produce a valid component with composite multilayer dynamic stylers', function () {
    var fontStyle = pToK('strength', 'fontSize');
    var colorStyle = {
      color: 'blue',
      backgroundColor: 'white'
    };
    var compositeStyle = function compositeStyle() {
      return [fontStyle, colorStyle];
    };
    var Compo = compose({ strength: '5px' }, styles(compositeStyle))('p');
    var para = shallow(React.createElement(Compo, null)).find('p').node;
    expect(para.props.style.fontSize).toEqual('5px');
  });
});

describe('Children', function () {
  it('should produce a valid component', function () {
    var Alpha = function Alpha(props) {
      return React.createElement(
        'span',
        null,
        'The cat is ' + props.feeling
      );
    };
    Alpha.propTypes = {
      feeling: PropTypes.string.isRequired
    };
    var Compo = compose({ feeling: 'angry' }, children(Alpha))('p');
    var para = shallow(React.createElement(Compo, null)).childAt(0).shallow().node;
    expect(para.props.children).toEqual('The cat is angry');
  });
});

describe('classNames', function () {
  it('should produce a correct className', function () {
    var result = classNames('btn', 'btn-pressed')({});
    expect(result.className).toEqual('btn btn-pressed');
  });
  it('should handle classNames propers', function () {
    var result = classNames('btn', function (_ref4) {
      var pressed = _ref4.pressed;
      return pressed && 'btn-pressed';
    })({
      pressed: true
    });
    expect(result.className).toEqual('btn btn-pressed');
  });
  it('should handle falsy classNames propers', function () {
    var result = classNames('btn', function (_ref5) {
      var pressed = _ref5.pressed;
      return pressed && 'btn-pressed';
    })({
      pressed: false
    });
    expect(result.className).toEqual('btn');
  });
  it('should append with input classNames', function () {
    var result = classNames('btn', function (_ref6) {
      var pressed = _ref6.pressed;
      return pressed && 'btn-pressed';
    })({
      pressed: false,
      className: 'alpha'
    });
    expect(result.className).toEqual('btn alpha');
  });
});

describe('Nesting', function () {
  it('should optimize nested compose calls', function () {
    var Root = function Root(props) {
      return React.createElement(
        'p',
        props,
        'root'
      );
    };
    var Level1 = compose({ background: 'red' })(Root);
    var Level2 = compose({ color: 'blue' })(Level1);
    var wrapper = shallow(React.createElement(Level2, null));
    var para = wrapper.shallow().find('p').node;
    expect(para.props.background).toEqual('red');
    expect(para.props.color).toEqual('blue');
  });
  fit('should optimize nested compose calls and dynamics should be correct', function () {
    var Root = function Root(props) {
      return React.createElement(
        'p',
        props,
        'root'
      );
    };
    var Level1 = compose({ background: 'red' }, function () {
      return { color: 'red' };
    })(Root);
    var Level2 = compose({ color: 'blue' }, function (_ref7) {
      var background = _ref7.background;
      return {
        background: background === 'red' ? 'blue' : 'brown'
      };
    })(Level1);
    var wrapper = shallow(React.createElement(Level2, null));
    var para = wrapper.shallow().find('p').node;
    expect(para.props.background).toEqual('red');
    expect(para.props.color).toEqual('red');
  });
  it('should produce a great display name', function () {
    function Root() {
      return React.createElement(
        'p',
        null,
        'Names'
      );
    }
    var Level1 = compose({ background: 'red' })(Root);
    var Level2 = compose({ color: 'blue' })(Level1);
    expect(Level2.displayName).toEqual('composed(Root)');
  });
});

describe('mapProp', function () {
  it('should transform input value', function () {
    function Root(props) {
      return React.createElement('p', props);
    }
    var Comped = compose(mapProp('x', function (x) {
      return x * 2;
    }))(Root);
    var p = shallow(React.createElement(Comped, { x: 5 })).node;
    expect(p.props.x).toEqual(10);
  });
});

describe('composing', function () {
  it('chains properly', function () {
    var f0 = {
      a: 7
    };
    function f1() {
      return { b: 5 };
    }
    function f2(_ref8) {
      var a = _ref8.a,
          b = _ref8.b;

      return { c: a + b };
    }
    var Comped = compose(f0, f1, f2)('p');
    var p = shallow(React.createElement(Comped, null)).node;
    expect(p.props.c).toEqual(12);
  });
  it('chains properly while nesting', function () {
    var f0 = {
      a: 7
    };
    function f1() {
      return { b: 5 };
    }
    function f2(_ref9) {
      var a = _ref9.a,
          b = _ref9.b;

      return { c: a + b };
    }
    function f3() {
      return { d: 5 };
    }
    var C1 = compose(f2)('p');
    var Comped = compose(f0, f1, f3)(C1);
    var p = shallow(React.createElement(Comped, null)).node;
    expect(p.props.c).toEqual(12);
  });
  it('chains properly while deeply nesting', function () {
    var f0 = {
      a: 7
    };
    function f1() {
      return { b: 5 };
    }
    function f2(_ref10) {
      var a = _ref10.a,
          b = _ref10.b;

      return { c: a + b };
    }
    function f3(_ref11) {
      var c = _ref11.c;

      return { d: c + 2 };
    }
    var C0 = compose(f3)('p');
    var C1 = compose(f2)(C0);
    var Comped = compose(f0, f1)(C1);
    var p = shallow(React.createElement(Comped, null)).node;
    expect(p.props.d).toEqual(14);
  });
});