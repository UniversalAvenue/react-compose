import _ from 'lodash';

/**
 * aggregates a set of stylers into a constant part + a dynamic part
 **/

const mergeObjArr = (arr) => {
  return _.assign.apply(_, [ {}, ...arr ]);
};

export const compileStylers = (...stylers) => {
  const flattened = _.compact(_.flattenDeep(stylers));
  const constantStyles = _.takeWhile(flattened, st => !_.isFunction(st));
  const dynamic = _.slice(flattened, constantStyles.length, flattened.length);
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
  const propers = _.take(args, args.length - 1);
  const groupedPropers = _.groupBy(propers, p => _.isFunction(p));
  return {
    constant: mergeObjArr(groupedPropers.false),
    dynamic: groupedPropers.true,
    Component,
  };
};
