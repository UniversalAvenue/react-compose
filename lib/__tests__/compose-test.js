'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

jest.autoMockOff();

var _ = require('lodash');

var _require = require('enzyme');

var shallow = _require.shallow;


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
      '0': 'alpha',
      '1': 'beta',
      '2': 'ceta'
    });
  });
});

var React = require('react');
var TestUtils = require('react-addons-test-utils');

var Wrapper = function (_React$Component) {
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
}(React.Component);

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
    var doc = renderInto(Compo);
    var para = findTag(doc, 'p');
    expect(para.style.background).toEqual('blue');
    expect(para.style.color).toEqual('white');
  });
  it('should produce a valid component with two separate styles', function () {
    var Compo = compose(styles({ background: 'blue' }), styles({ color: 'white' }))('p');
    var doc = renderInto(Compo);
    var para = findTag(doc, 'p');
    expect(para.style.background).toEqual('blue');
    expect(para.style.color).toEqual('white');
  });
  it('should produce a valid component with two dynamic stylers', function () {
    var Compo = compose({ strength: '5px', weight: 'normal' }, styles(pToK('strength', 'fontSize'), pToK('weight', 'fontWeight')))('p');
    var doc = renderInto(Compo);
    var para = findTag(doc, 'p');
    expect(para.style.fontSize).toEqual('5px');
    expect(para.style.fontWeight).toEqual('normal');
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
    var doc = renderInto(Compo);
    var para = findTag(doc, 'p');
    expect(para.style.fontSize).toEqual('5px');
    expect(para.style.fontWeight).toEqual('normal');
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
    var doc = renderInto(Compo);
    var para = findTag(doc, 'p');
    expect(para.style.fontSize).toEqual('5px');
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
    var Compo = compose({ feeling: 'angry' }, children(Alpha))('p');
    var doc = renderInto(Compo);
    var para = findTag(doc, 'span');
    expect(para.innerHTML).toEqual('The cat is angry');
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
  it('should optimize nested compose calls and dynamics should be correct', function () {
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
        background: background == 'red' ? 'brown' : 'blue'
      };
    })(Level1);
    var wrapper = shallow(React.createElement(Level2, null));
    var para = wrapper.shallow().find('p').node;
    expect(para.props.background).toEqual('brown');
    expect(para.props.color).toEqual('blue');
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