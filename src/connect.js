import React from 'react';
import _ from 'lodash';
import getDisplayName from './getDisplayName';

const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
  ...parentProps,
  ...stateProps,
  ...dispatchProps,
});

function createDispatchProps(dispatchers, dispatch) {
  if (_.isFunction(dispatchers)) {
    return dispatchers(dispatch);
  }
  function dispatchHandler(fn) {
    const action = _.isString(fn) ? { type: fn } : fn;
    return () => dispatch(action);
  }
  return _.reduce(dispatchers, (sum, fn, key) =>
    Object.assign(sum, {
      [key]: dispatchHandler(fn),
    }),
    {});
}

function wrapLifeCycle(fn) {
  if (!_.isFunction(fn)) {
    const action = _.isString(fn) ? { type: fn } : fn;
    return function wrappedStaticLifeCycleMethod() {
      this.dispatch(action);
    };
  }
  return fn;
}


export default function connect(reducer,
    dispatchers,
    lifeCycle = {},
    merge = defaultMergeProps,
    middlewares = []) {
  return Component => {
    class Connected extends React.Component {
      constructor(props) {
        super(props);
        this.state = reducer(props, {});
        this.dispatch = this.dispatch.bind(this);
        const middlewareAPI = {
          getState: () => this.state,
          dispatch: this.dispatch,
        };
        const chain = middlewares.map(middleware => middleware(middlewareAPI));
        this.dispatch = [...chain].reduceRight((a, fn) => fn(a), this.dispatch);
        this.dispatchProps = createDispatchProps(dispatchers, this.dispatch);
      }
      componentWillReceiveProps(nextProps) {
        this.setState(_.omitBy(nextProps, (val, key) =>
          val === this.state[key]));
      }
      getProps() {
        return merge(this.state, this.dispatchProps, this.props);
      }
      dispatch(action) {
        const nextState = reducer(this.state, action);
        if (nextState !== this.state) {
          this.setState(nextState);
        }
        return action;
      }
      render() {
        return <Component {...this.getProps()} />;
      }
    }
    Connected.displayName = `connect(${getDisplayName(Component)})`;
    _.each(lifeCycle, (fn, key) => Object.assign(Connected.prototype, {
      [key]: wrapLifeCycle(fn),
    }));
    return Connected;
  };
}

export function applyMiddleware(...wares) {
  return (...args) => connect.apply(null,
    [args[0], args[1], args[2] || {}, args[3] || defaultMergeProps, wares]);
}
