import _ from 'lodash';
import getDisplayName from './getDisplayName';

function setDisplayName(Component) {
  this.displayName = `composed(${getDisplayName(Component)})`;
  return this;
}

function mergeObj(name) {
  return function merger(Component, fns) {
    this[name] = {
      ...Component[name],
      ...fns
        .filter(fn => _.isFunction(fn))
        .reduce((sum, fn) =>
          (fn[name] ?
            Object.assign(sum, fn[name]) :
            sum),
          {}),
    };
    return this;
  };
}

function preservePartial(Component, fns) {
  this.composed = {
    Component,
    fns,
  };
  return this;
}

const mods = [
  setDisplayName,
  mergeObj('propTypes'),
  mergeObj('contextTypes'),
  mergeObj('defaultProps'),
  preservePartial,
];

export function reactRenderer(Component, props) {
  // eslint-disable-next-line global-require
  const React = require('react');
  return <Component {...props} />;
}

export function compose(...fns) {
  return (Component, renderer = reactRenderer) => {
    if (Component.composed) {
      const partial = Component.composed;
      return compose.apply(null, [...fns, ...partial.fns])(partial.Component, renderer);
    }

    const extensions = mods.reduce((comp, fn) =>
      fn.apply(comp, [Component, fns]),
      {});

    function composed(props, context) {
      const pass = fns.reduce((sum, fn) => fn(sum, context), props);
      return renderer(Component, pass);
    }

    Object.assign(composed, extensions);

    return composed;
  };
}
