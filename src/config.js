import _ from 'lodash';
import React, { PropTypes } from 'react';

const plugin = {};
const functions = {};

const configurable = (key, defaultFn, argGetter = () => []) => {
  const apply = fn => (...args) => fn.apply(null, [...args, ...argGetter()]);
  plugin[key] = (fn) => {
    functions[key] = apply(fn);
  };
  functions[key] = apply(defaultFn);
  return (...args) => functions[key].apply(null, args);
};

const defaultContextTypes = () => ({});
export const exposeContextTypes = configurable('exposeContextTypes',
  defaultContextTypes,
  () => [PropTypes]);

const merge = arr => _.assign.apply(_, [{}, ...arr]);
const defaultComposeComponent = (Component, {
  styles = [],
  style = {},
  ...rest,
}) => {
  const mergedStyle = merge([style].concat(styles));
  return <Component style={mergedStyle} {...rest} />;
};
export const composeComponent = configurable('composeComponent', defaultComposeComponent);

const defaultRenderChild = props => (Child, index) =>
  <Child {...props} key={(Child.displayName || '') + index} />;

export const renderChild = configurable('renderChild', defaultRenderChild);

export {
  plugin,
};

