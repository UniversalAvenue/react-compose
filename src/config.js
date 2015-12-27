import React from 'react';
import { PropTypes } from 'react';

const plugin = {};
const functions = {};

const configurable = (key, defaultFn, argGetter = () => []) => {
  const apply = fn => (...args) => fn.apply(null, [ ...args, ...argGetter() ]);
  plugin[key] = (fn) => functions[key] = apply(fn);
  functions[key] = apply(defaultFn);
};

const defaultContextTypes = () => ({});
configurable('exposeContextTypes', defaultContextTypes, () => [ PropTypes ]);
export const exposeContextTypes = functions.exposeContextTypes;

const merge = arr => _.assign.apply(_, [ {}, ...arr ]);
const defaultComposeComponent = (Component, styles, props) => {
  return <Component style={merge(styles)} {...merge(props)}/>;
};
configurable('composeComponent', defaultComposeComponent);
export const composeComponent = functions.composeComponent;

export {
  plugin,
};

