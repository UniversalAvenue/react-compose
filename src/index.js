import _ from 'lodash';

import { parseSuperProps, composeComponent, exposeContextTypes } from './config';

/**
 * aggregates a set of stylers into a constant part + a dynamic part
 **/

const mergeObjArr = (arr) => {
  return _.assign.apply(_, [ {}, ...arr ]);
};

export const compileStylers = (...stylers) => {
  const flattened = _.compact(_.flattenDeep(stylers));
  const constantStyles = _.takeWhile(flattened, st => !_.isFunction(st)) || [];
  const dynamic = _.slice(flattened, constantStyles.length, flattened.length) || [];
  const constant = mergeObjArr(constantStyles);
  return {
    constant,
    dynamic,
  };
};

/**
 * aggregates a set of propers into a constant part + a dynamic part + Component
 * The component is always the last argument into the function
 **/

export const compilePropers = (...args) => {
  const Component = _.last(args);
  const propers = _.take(args, args.length - 1) || [];
  const groupedPropers = _.groupBy(propers, p => _.isFunction(p));
  return {
    constant: mergeObjArr(groupedPropers.false || []),
    dynamic: groupedPropers.true || [],
    Component,
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

export const compose = (...stylers) => (...propers) => {
  const cs = compileStylers.apply(null, stylers);
  const ps = compilePropers.apply(null, propers);

  const ComposedComponent = (props, context) => {
    const {
      styles = [],
      superProps = {},
    } = parseSuperProps(props);
    const _props = mergeObjArr([ ps.constant, ...applyFunctor(ps.dynamic, superProps, context), ...superProps ]);
    const _styles = [ cs.constant, ...applyFunctor(cs.dynamic, _props, context), ...styles ];
    return composeComponent(ps.Component, _styles, _props);
  };
  ComposedComponent.contextTypes = exposeContextTypes();
  return ComposedComponent;
};
