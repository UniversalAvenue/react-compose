import React, { PropTypes } from 'react';
import _ from 'lodash';

export const injectStyles = (inputStyles) => ({ styles = [], ...props }, theme) => {
  const apply = foo => _.isFunction(foo) ? foo(props, theme) : foo;
  const themers = _.flatten(_.map(inputStyles, apply));
  const _styles = _.flatten([ _.map(themers, apply), styles ]);
  return {
    styles: _styles,
    ...props,
  };
};

export default (...input) => Component => {
  const StyledBase = (props, { theme }) => {
    return <Component {...injectStyles(input)(props, theme)}/>;
  };
  StyledBase.contextTypes = {
    theme: PropTypes.object,
  };
  return StyledBase;
};
