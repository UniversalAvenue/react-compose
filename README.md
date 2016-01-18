# react-compose
Compose React components with a functional api

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


