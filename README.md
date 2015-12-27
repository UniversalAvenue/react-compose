# react-compose
Compose React components with a functional api

Example api usage:

    import { compose } from 'react-compose';
    
    const constantStyle = {
      background: 'red',
    };
    const dynamicStyle = ({ isActive }) => (!isActive && {
      display: 'none',
    });
    
    const Component = compose(constantStyle, dynamicStyle)('p');
    
    return (props) => {
      return <Component isActive={false}>Some text</Component>;
    };
