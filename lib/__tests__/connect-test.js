'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

jest.autoMockOff();

var React = require('react');

var _require = require('enzyme'),
    mount = _require.mount;

var thunk = require('redux-thunk').default;

var connect = require('../connect').default;
var applyMiddleware = require('../connect').applyMiddleware;

describe('connect', function () {
  it('creates a valid component', function () {
    var reducer = jest.fn(function (state) {
      return state;
    });
    var Component = connect(reducer, { onClick: 'doClick' })('button');
    var wrapper = mount(React.createElement(Component, null));
    wrapper.find('button').simulate('click');
    expect(reducer.mock.calls[0][0]).toEqual({});
    expect(reducer.mock.calls[1][1].type).toEqual('doClick');
  });
  it('changes a prop as a result', function () {
    var Button = function Button(props) {
      return React.createElement('button', props);
    };
    var reducer = jest.fn(function (state, action) {
      if (action.type === 'doClick') {
        return _extends({}, state, {
          isToggled: !state.isToggled
        });
      }
      return state;
    });
    var Component = connect(reducer, { onClick: 'doClick' })(Button);
    var wrapper = mount(React.createElement(Component, null));
    var btn = wrapper.find('button');
    btn.simulate('click');
    expect(btn.prop('isToggled')).toEqual(true);
    btn.simulate('click');
    expect(btn.prop('isToggled')).toEqual(false);
    wrapper.setProps({ isToggled: true });
    expect(btn.prop('isToggled')).toEqual(true);
  });
  it('hides willReceiveProps behaviour', function () {
    var Button = function Button(props) {
      return React.createElement('button', props);
    };
    var reducer = jest.fn(function (state) {
      return state;
    });
    var Component = connect(reducer, {}, {
      componentWillReceiveProps: function componentWillReceiveProps() {}
    })(Button);
    var wrapper = mount(React.createElement(Component, { isToggled: true }));
    var btn = wrapper.find('button');
    expect(btn.prop('isToggled')).toEqual(true);
    wrapper.setProps({ isToggled: false });
    expect(btn.prop('isToggled')).toEqual(true);
  });
  it('update onDidMount', function () {
    var Button = function Button(props) {
      return React.createElement('button', props);
    };
    var reducer = jest.fn(function (state, action) {
      if (action.type === 'doClick') {
        return _extends({}, state, {
          isToggled: !state.isToggled
        });
      }
      return state;
    });
    var Component = connect(reducer, {}, {
      componentDidMount: function componentDidMount() {
        this.dispatch({
          type: 'doClick'
        });
      }
    })(Button);
    var wrapper = mount(React.createElement(Component, null));
    var btn = wrapper.find('button');
    expect(btn.prop('isToggled')).toEqual(true);
  });
  it('can handle short form life cycles', function () {
    var Button = function Button(props) {
      return React.createElement('button', props);
    };
    var reducer = jest.fn(function (state, action) {
      if (action.type === 'doClick') {
        return _extends({}, state, {
          isToggled: !state.isToggled
        });
      }
      return state;
    });
    var Component = connect(reducer, {}, {
      componentDidMount: 'doClick'
    })(Button);
    var wrapper = mount(React.createElement(Component, null));
    var btn = wrapper.find('button');
    expect(btn.prop('isToggled')).toEqual(true);
  });
  it('works with middleware like redux-thunk', function () {
    var Button = function Button(props) {
      return React.createElement('button', props);
    };
    var reducer = jest.fn(function (state, action) {
      if (action.type === 'doClick') {
        return _extends({}, state, {
          isToggled: !state.isToggled
        });
      }
      return state;
    });
    var ac = applyMiddleware(thunk);
    var Component = ac(reducer, function (dispatch) {
      return {
        onClick: function onClick() {
          dispatch(function (disp) {
            disp({ type: 'doClick' });
          });
        }
      };
    })(Button);
    var wrapper = mount(React.createElement(Component, null));
    var btn = wrapper.find('button');
    btn.simulate('click');
    expect(btn.prop('isToggled')).toEqual(true);
  });
});