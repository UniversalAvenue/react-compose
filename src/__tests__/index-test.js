jest.autoMockOff();

const { shallow } = require('enzyme');
const React = require('react');
const sinon = require('sinon');

const compose = require('../index-v2').compose;

describe('Compose', () => {
  beforeEach(() => {
    sinon.stub(console, 'error', (warning) => {
      throw new Error(warning);
    });
  });

  afterEach(() => {
    console.error.restore();
  });

  function adjustBackground({ myColor, ...props }) {
    return {
      ...props,
      style: {
        backgroundColor: myColor,
      },
    };
  }

  adjustBackground.propTypes = {
    myColor: React.PropTypes.string.isRequired,
  };

  function setupEvents({ isHovering, isActive, ...props }) {
    let myColor = 'green';
    if (isHovering && isActive) {
      myColor = 'red';
    } else if (isHovering) {
      myColor = 'blue';
    } else if (isActive) {
      myColor = 'yellow';
    }
    return {
      ...props,
      myColor,
    };
  }

  setupEvents.propTypes = {
    isActive: React.PropTypes.bool,
    isHovering: React.PropTypes.bool,
  };

  function pio(props) {
    const MyComponent = compose(setupEvents, adjustBackground)('p');
    const wrapper = shallow(<MyComponent {...props} />);
    const para = wrapper.find('p');
    return para.node.props;
  }

  it('should throw on missing prop', () => {
    const MyComponent = compose(adjustBackground)('p');
    expect(() => shallow(<MyComponent />)).toThrow();
  });
  it('should not pass on interim prop', () => {
    let props = pio({ isActive: true, isHovering: true });
    expect(props.isActive).not.toBeDefined();
    expect(props.isHovering).not.toBeDefined();
    expect(props.style.backgroundColor).toEqual('red');
    props = pio({ isActive: false, isHovering: true });
    expect(props.style.backgroundColor).toEqual('blue');
  });
  it('should optimize nested compose calls', () => {
    let calls = 0;
    function renderer(Component, props) {
      calls++;
      return <Component {...props} />;
    }
    const Super = compose(adjustBackground)('p', renderer);
    const MyComponent = compose(setupEvents)(Super, renderer);
    const wrapper = shallow(<MyComponent isActive />);
    const para = wrapper.find('p');
    const props = para.node.props;
    expect(props.isActive).not.toBeDefined();
    expect(props.style.backgroundColor).toEqual('yellow');
    expect(calls).toEqual(1);
  });
  it('should handle nested defaultProps calls', () => {
    function p1(props) { return props; }
    p1.defaultProps = {
      className: 'name',
    };
    function p2(props) { return props; }
    p2.defaultProps = {
      children: 'label',
    };
    const Super = compose(p1)('p');
    const MyComponent = compose(p2)(Super);
    const wrapper = shallow(<MyComponent />);
    const para = wrapper.find('p');
    const props = para.node.props;
    expect(props.className).toEqual('name');
    expect(props.children).toEqual('label');
  });
});

