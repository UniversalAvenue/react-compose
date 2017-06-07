jest.autoMockOff();

const React = require('react');
const { mount } = require('enzyme');
const thunk = require('redux-thunk').default;

const connect = require('../connect').default;
const applyMiddleware = require('../connect').applyMiddleware;

describe('connect', () => {
  it('creates a valid component', () => {
    const reducer = jest.fn(state => state);
    const Component = connect(reducer, { onClick: 'doClick' })('button');
    const wrapper = mount(<Component />);
    wrapper.find('button').simulate('click');
    expect(reducer.mock.calls[0][0]).toEqual({});
    expect(reducer.mock.calls[1][1].type).toEqual('doClick');
  });
  it('changes a prop as a result', () => {
    const Button = props => <button {...props} />;
    const reducer = jest.fn((state, action) => {
      if (action.type === 'doClick') {
        return {
          ...state,
          isToggled: !state.isToggled,
        };
      }
      return state;
    });
    const Component = connect(reducer, { onClick: 'doClick' })(Button);
    const wrapper = mount(<Component />);
    const btn = wrapper.find('button');
    btn.simulate('click');
    expect(btn.prop('isToggled')).toEqual(true);
    btn.simulate('click');
    expect(btn.prop('isToggled')).toEqual(false);
    wrapper.setProps({ isToggled: true });
    expect(btn.prop('isToggled')).toEqual(true);
  });
  it('hides willReceiveProps behaviour', () => {
    const Button = props => <button {...props} />;
    const reducer = jest.fn(state => state);
    const Component = connect(reducer, {}, {
      componentWillReceiveProps() {},
    })(Button);
    const wrapper = mount(<Component isToggled />);
    const btn = wrapper.find('button');
    expect(btn.prop('isToggled')).toEqual(true);
    wrapper.setProps({ isToggled: false });
    expect(btn.prop('isToggled')).toEqual(true);
  });
  it('update onDidMount', () => {
    const Button = props => <button {...props} />;
    const reducer = jest.fn((state, action) => {
      if (action.type === 'doClick') {
        return {
          ...state,
          isToggled: !state.isToggled,
        };
      }
      return state;
    });
    const Component = connect(reducer, {}, {
      componentDidMount() {
        this.dispatch({
          type: 'doClick',
        });
      },
    })(Button);
    const wrapper = mount(<Component />);
    const btn = wrapper.find('button');
    expect(btn.prop('isToggled')).toEqual(true);
  });
  it('can handle short form life cycles', () => {
    const Button = props => <button {...props} />;
    const reducer = jest.fn((state, action) => {
      if (action.type === 'doClick') {
        return {
          ...state,
          isToggled: !state.isToggled,
        };
      }
      return state;
    });
    const Component = connect(reducer, {}, {
      componentDidMount: 'doClick',
    })(Button);
    const wrapper = mount(<Component />);
    const btn = wrapper.find('button');
    expect(btn.prop('isToggled')).toEqual(true);
  });
  it('works with middleware like redux-thunk', () => {
    const Button = props => <button {...props} />;
    const reducer = jest.fn((state, action) => {
      if (action.type === 'doClick') {
        return {
          ...state,
          isToggled: !state.isToggled,
        };
      }
      return state;
    });
    const ac = applyMiddleware(thunk);
    const Component = ac(reducer, dispatch => ({
      onClick: () => {
        dispatch((disp) => {
          disp({ type: 'doClick' });
        });
      },
    }))(Button);
    const wrapper = mount(<Component />);
    const btn = wrapper.find('button');
    btn.simulate('click');
    expect(btn.prop('isToggled')).toEqual(true);
  });
});
