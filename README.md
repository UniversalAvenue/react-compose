# react-compose

**React-compose** allows you to encapsulate component logic into smaller,
reusable functions, which in turn can be combined back into component. The
fundamental idea is that React components has a way of becoming bloated with,
often repeated, logic. This lib provides you with a set of tools to avoid that.

The encapsulated pieces will be easily testable, either because they are
constant or since their functionality has a more narrow scope than a
corresponding component would have. 

The other aspect of **react-compose** is based upon the fact that whenever you
create a React component, you also create an api for it as well. It is
essential, for any large scale project that this api is well formed and consistent
across the application. Most components should also be extendable too, which is
why, significant care is needed to make sure that each component doesn't break
these rules.

Let's show a simple example of extendablity:

    const ButtonComponent = props => {
      const {
        onClick,
        label,
      } = props;
      return <button onClick={onClick}>{label}</button>;
    };

Now if a developer would like to manipulate the style of `ButtonComponent` from
the outside, it would have to be changed accordingly:

    const ButtonComponent = props => {
      const {
        onClick,
        style,
        label,
      } = props;
      return <button onClick={onClick} style={style}>{label}</button>;
    };

On the other hand, if all props should be passed down to the `button` element,
the following is much more useful:

    const ButtonComponent = props => {
      const {
        label,
      } = props;
      return <button {...props}>{label}</button>;
    };

With **react-compose**, the above would be written as:

    const labelToChildren = ({ label }) => ({ children: label });

    const ButtonComponent = compose(labelToChildren)('button');

Leaving much less room for breaking the rules of extendability and resuability.
The CustomComponent should essentially work as you would expect that the basic
html elements does, `ButtonComponent` ~ `button`, beyond of course the added
behavior. 

As an extra bonus, it is also more straight forward to test the encapsulated
behavior rather than the component as a whole.

    describe('labelToChildren', () => {
      it('should pass whatever input label as children', () => {
        expect(labelToChildren({ label: 'string' }).children).toEqual('string');
      });
    });

Finally, the heart of **react-compose**, is finding those elementary patterns
that are present in your application. In this case, we can create a nice higher
order function for the `labelToChildren` logic.

    const mixProp = (from, to) => props => ({ [to]: props[from] });
    const labelToChildren = mixProp('label', 'children');

## API

Example api usage:

    import { compose } from 'react-compose';

    const constantProper = {
      age: 15,
    };

    const dynamicProper = props => {
      return {
        children: `The cat is ${props.age} years old`,
      };
    };

    const Cat = compose(constantProper, dynamicProper)('p');

    // => <p>The cat is 15 years old</p>;

Specialized style composing

    import { compose, styles } from 'react-compose';
    
    const constantStyle = {
      background: 'red',
    };
    const dynamicStyle = ({ isActive }) => (!isActive && {
      display: 'none',
    });
    
    const Component = compose(styles(constantStyle, dynamicStyle))('p');
    
    return (props) => {
      return <Component isActive={false}>Some text</Component>;
    };

Stacking custom components

    import { compose } from 'react-compose';

    const Cat = props => {
      return <p>The cat is {props.age} years old</p>;
    };

    const injectAge = {
      age: 5,
    };

    const Composed = compose(injectAge)(Cat);

    // => <p>The cat is 5 years old</p>


Composing complex children values

    import { compose, children } from 'react-compose';

    const AgeInfo = props => {
      return <p>Age: {props.age} years</p>;
    };

    const LengthInfo = props => {
      return <p>Length: {props.length} cm</p>;
    };

    const HeightInfo = props => {
      return <p>Height: {props.height} cm</p>;
    };

    const Info = compose(children(AgeInfo, LengthInfo, HeightInfo))('div');

    const dogData = {
      age: 5,
      length: 250,
      height: 150,
    };

    const DogInfo = compose(dogData)(Info);

    // => <div>
    //      <p>Age: 5</p>
    //      <p>Length: 250</p>
    //      <p>Height: 150</p>
    //    </div>

Composing classNames, using the awesome [https://github.com/JedWatson/classnames](classnames) lib

    import { compose, classNames } from 'react-compose';

    const btnClassNames = classNames('btn',
      ({ pressed }) => pressed && 'btn-pressed',
      ({ hover }) => hover && 'btn-hover');
     
    const Button = compose(btnClassNames)('button');

    // pressed: true => <button className="btn btn-pressed" />
    // pressed: false, hover: true => <button className="btn btn-hover" />
