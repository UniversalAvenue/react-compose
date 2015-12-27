import _ from 'lodash';
import React, { PropTypes } from 'react';

const plugin = {};
const functions = {};

const configurable = (key, defaultFn, argGetter = () => []) => {
  const apply = fn => (...args) => fn.apply(null, [ ...args, ...argGetter() ]);
  plugin[key] = (fn) => functions[key] = apply(fn);
  functions[key] = apply(defaultFn);
  return (...args) => functions[key].apply(null, args);
};

const defaultContextTypes = () => ({});
export const exposeContextTypes = configurable('exposeContextTypes', defaultContextTypes, () => [ PropTypes ]);

const merge = arr => _.assign.apply(_, [ {}, ...arr ]);
const defaultComposeComponent = (Component, styles, props) => {
  return <Component style={merge(styles)} {...props}/>;
};
export const composeComponent = configurable('composeComponent', defaultComposeComponent);

const defaultParseSuperProps = ({ style, ...props }) => {
  return {
    styles: [ style ],
    props: props,
  };
};
export const parseSuperProps = configurable('parseSuperProps', defaultParseSuperProps);

export {
  plugin,
};

