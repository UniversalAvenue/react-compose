import _ from 'lodash';

import { composeComponent, exposeContextTypes } from './config';

/**
 * aggregates a set of functions/objects into a constant part + a dynamic part
 **/

const mergeObjArr = (arr) => {
  return _.assign.apply(_, [ {}, ...arr ]);
};

export const compilePropers = (...propers) => {
  const flattened = _.compact(_.flattenDeep(propers));
  const constantStyles = _.takeWhile(flattened, st => !_.isFunction(st)) || [];
  const dynamic = _.slice(flattened, constantStyles.length, flattened.length) || [];
  const constant = mergeObjArr(constantStyles);
  return {
    constant,
    dynamic,
  };
};

const flatMap = (arr, fn) => {
  if (_.isArray(arr)) {
    return _.flattenDeep(_.map(arr, fn));
  }
  return fn(arr);
};

export const applyFunctor = (functor, ...args) => {
  const reapply = f => applyFunctor.apply(null, [ f, ...args ]);
  if (_.isArray(functor)) {
    return flatMap(functor, reapply);
  }
  if (_.isFunction(functor)) {
    return reapply(functor.apply(null, args));
  }
  return functor;
};

export const compose = (...propers) => Component => {
  const ps = compilePropers.apply(null, propers);

  const ComposedComponent = (props, context) => {
    const base = { ...props, ...ps.constant };
    const _props = mergeObjArr([ base, ...applyFunctor(ps.dynamic, base, context) ]);
    return composeComponent(Component, _props);
  };
  ComposedComponent.contextTypes = exposeContextTypes();
  return ComposedComponent;
};
