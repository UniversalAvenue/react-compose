jest.autoMockOff();

const React = require('react');
const TestUtils = require('react-addons-test-utils');

const compose = require('../index').default;

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
  it('should produce a simple p tag', () => {
    const Component = compose({ background: 'blue' })('p');
    const comp = renderInto(Component);
    const p = findTag(comp, 'p');
    expect(p.props.styles[0].background).toEqual('blue');
  });
});
