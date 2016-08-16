jest.autoMockOff();

const { shallow } = require('enzyme');
const React = require('react');
const sinon = require('sinon');

const compose = require('../index-v2').compose;

describe('Composing contexts', () => {
  beforeEach(() => {
    sinon.stub(console, 'error', (warning) => {
      throw new Error(warning);
    });
  });

  afterEach(() => {
    console.error.restore();
  });

  function p1({ children }, { test }) {
    return {
      children: `${test} ${children} with context`,
    };
  }

  p1.contextTypes = {
    test: React.PropTypes.string.isRequired,
  };

  function p2() {
    return {
      children: 'works',
    };
  }

  it('should handle nested contexts prop', () => {
    const Super = compose(p1)('p');
    const MyComponent = compose(p2)(Super);
    const wrapper = shallow(<MyComponent />, {
      context: {
        test: 'react-compose',
      },
    });
    const para = wrapper.find('p');
    const props = para.node.props;
    expect(props.children).toEqual('react-compose works with context');
  });
});

