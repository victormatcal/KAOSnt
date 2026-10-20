/* KAOSnt — bundle local generado por tools/bundle.mjs. Incluye React (licencia MIT). */
(function(){"use strict";
var process={env:{NODE_ENV:"production"}};var defs={};var cache={};
function req(id){if(cache[id])return cache[id].exports;var m={exports:{}};cache[id]=m;defs[id][0].call(m.exports,m,m.exports,function(s){var d=defs[id][1][s];if(d===undefined)throw new Error("Módulo no encontrado: "+s);return req(d);});return m.exports;}
defs[0]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("react-dom/client");
const App_1 = require("./App");
const el = document.getElementById("root");
if (el)
    (0, client_1.createRoot)(el).render((0, jsx_runtime_1.jsx)(react_1.StrictMode, { children: (0, jsx_runtime_1.jsx)(App_1.App, {}) }));

},{"react/jsx-runtime":1,"react":2,"react-dom/client":3,"./App":6}]; // build/src/main.js
defs[1]=[function(module,exports,require){
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";
var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
function jsxProd(type, config, maybeKey) {
  var key = null;
  void 0 !== maybeKey && (key = "" + maybeKey);
  void 0 !== config.key && (key = "" + config.key);
  if ("key" in config) {
    maybeKey = {};
    for (var propName in config)
      "key" !== propName && (maybeKey[propName] = config[propName]);
  } else maybeKey = config;
  config = maybeKey.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: void 0 !== config ? config : null,
    props: maybeKey
  };
}
exports.Fragment = REACT_FRAGMENT_TYPE;
exports.jsx = jsxProd;
exports.jsxs = jsxProd;

},{}]; // ../../../../opt/oai-docgen/node_modules/react/cjs/react-jsx-runtime.production.js
defs[2]=[function(module,exports,require){
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";
var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
  REACT_PORTAL_TYPE = Symbol.for("react.portal"),
  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
  REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
  REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
  REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
  REACT_CONTEXT_TYPE = Symbol.for("react.context"),
  REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
  REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
  REACT_MEMO_TYPE = Symbol.for("react.memo"),
  REACT_LAZY_TYPE = Symbol.for("react.lazy"),
  REACT_ACTIVITY_TYPE = Symbol.for("react.activity"),
  MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
  if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
  maybeIterable =
    (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
    maybeIterable["@@iterator"];
  return "function" === typeof maybeIterable ? maybeIterable : null;
}
var ReactNoopUpdateQueue = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {}
  },
  assign = Object.assign,
  emptyObject = {};
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
Component.prototype.isReactComponent = {};
Component.prototype.setState = function (partialState, callback) {
  if (
    "object" !== typeof partialState &&
    "function" !== typeof partialState &&
    null != partialState
  )
    throw Error(
      "takes an object of state variables to update or a function which returns an object of state variables."
    );
  this.updater.enqueueSetState(this, partialState, callback, "setState");
};
Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
};
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
var pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = !0;
var isArrayImpl = Array.isArray;
function noop() {}
var ReactSharedInternals = { H: null, A: null, T: null, S: null },
  hasOwnProperty = Object.prototype.hasOwnProperty;
function ReactElement(type, key, props) {
  var refProp = props.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: void 0 !== refProp ? refProp : null,
    props: props
  };
}
function cloneAndReplaceKey(oldElement, newKey) {
  return ReactElement(oldElement.type, newKey, oldElement.props);
}
function isValidElement(object) {
  return (
    "object" === typeof object &&
    null !== object &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}
function escape(key) {
  var escaperLookup = { "=": "=0", ":": "=2" };
  return (
    "$" +
    key.replace(/[=:]/g, function (match) {
      return escaperLookup[match];
    })
  );
}
var userProvidedKeyEscapeRegex = /\/+/g;
function getElementKey(element, index) {
  return "object" === typeof element && null !== element && null != element.key
    ? escape("" + element.key)
    : index.toString(36);
}
function resolveThenable(thenable) {
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw thenable.reason;
    default:
      switch (
        ("string" === typeof thenable.status
          ? thenable.then(noop, noop)
          : ((thenable.status = "pending"),
            thenable.then(
              function (fulfilledValue) {
                "pending" === thenable.status &&
                  ((thenable.status = "fulfilled"),
                  (thenable.value = fulfilledValue));
              },
              function (error) {
                "pending" === thenable.status &&
                  ((thenable.status = "rejected"), (thenable.reason = error));
              }
            )),
        thenable.status)
      ) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
      }
  }
  throw thenable;
}
function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
  var type = typeof children;
  if ("undefined" === type || "boolean" === type) children = null;
  var invokeCallback = !1;
  if (null === children) invokeCallback = !0;
  else
    switch (type) {
      case "bigint":
      case "string":
      case "number":
        invokeCallback = !0;
        break;
      case "object":
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = !0;
            break;
          case REACT_LAZY_TYPE:
            return (
              (invokeCallback = children._init),
              mapIntoArray(
                invokeCallback(children._payload),
                array,
                escapedPrefix,
                nameSoFar,
                callback
              )
            );
        }
    }
  if (invokeCallback)
    return (
      (callback = callback(children)),
      (invokeCallback =
        "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar),
      isArrayImpl(callback)
        ? ((escapedPrefix = ""),
          null != invokeCallback &&
            (escapedPrefix =
              invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"),
          mapIntoArray(callback, array, escapedPrefix, "", function (c) {
            return c;
          }))
        : null != callback &&
          (isValidElement(callback) &&
            (callback = cloneAndReplaceKey(
              callback,
              escapedPrefix +
                (null == callback.key ||
                (children && children.key === callback.key)
                  ? ""
                  : ("" + callback.key).replace(
                      userProvidedKeyEscapeRegex,
                      "$&/"
                    ) + "/") +
                invokeCallback
            )),
          array.push(callback)),
      1
    );
  invokeCallback = 0;
  var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
  if (isArrayImpl(children))
    for (var i = 0; i < children.length; i++)
      (nameSoFar = children[i]),
        (type = nextNamePrefix + getElementKey(nameSoFar, i)),
        (invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        ));
  else if (((i = getIteratorFn(children)), "function" === typeof i))
    for (
      children = i.call(children), i = 0;
      !(nameSoFar = children.next()).done;

    )
      (nameSoFar = nameSoFar.value),
        (type = nextNamePrefix + getElementKey(nameSoFar, i++)),
        (invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        ));
  else if ("object" === type) {
    if ("function" === typeof children.then)
      return mapIntoArray(
        resolveThenable(children),
        array,
        escapedPrefix,
        nameSoFar,
        callback
      );
    array = String(children);
    throw Error(
      "Objects are not valid as a React child (found: " +
        ("[object Object]" === array
          ? "object with keys {" + Object.keys(children).join(", ") + "}"
          : array) +
        "). If you meant to render a collection of children, use an array instead."
    );
  }
  return invokeCallback;
}
function mapChildren(children, func, context) {
  if (null == children) return children;
  var result = [],
    count = 0;
  mapIntoArray(children, result, "", "", function (child) {
    return func.call(context, child, count++);
  });
  return result;
}
function lazyInitializer(payload) {
  if (-1 === payload._status) {
    var ctor = payload._result;
    ctor = ctor();
    ctor.then(
      function (moduleObject) {
        if (0 === payload._status || -1 === payload._status)
          (payload._status = 1), (payload._result = moduleObject);
      },
      function (error) {
        if (0 === payload._status || -1 === payload._status)
          (payload._status = 2), (payload._result = error);
      }
    );
    -1 === payload._status && ((payload._status = 0), (payload._result = ctor));
  }
  if (1 === payload._status) return payload._result.default;
  throw payload._result;
}
var reportGlobalError =
    "function" === typeof reportError
      ? reportError
      : function (error) {
          if (
            "object" === typeof window &&
            "function" === typeof window.ErrorEvent
          ) {
            var event = new window.ErrorEvent("error", {
              bubbles: !0,
              cancelable: !0,
              message:
                "object" === typeof error &&
                null !== error &&
                "string" === typeof error.message
                  ? String(error.message)
                  : String(error),
              error: error
            });
            if (!window.dispatchEvent(event)) return;
          } else if (
            "object" === typeof process &&
            "function" === typeof process.emit
          ) {
            process.emit("uncaughtException", error);
            return;
          }
          console.error(error);
        },
  Children = {
    map: mapChildren,
    forEach: function (children, forEachFunc, forEachContext) {
      mapChildren(
        children,
        function () {
          forEachFunc.apply(this, arguments);
        },
        forEachContext
      );
    },
    count: function (children) {
      var n = 0;
      mapChildren(children, function () {
        n++;
      });
      return n;
    },
    toArray: function (children) {
      return (
        mapChildren(children, function (child) {
          return child;
        }) || []
      );
    },
    only: function (children) {
      if (!isValidElement(children))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return children;
    }
  };
exports.Activity = REACT_ACTIVITY_TYPE;
exports.Children = Children;
exports.Component = Component;
exports.Fragment = REACT_FRAGMENT_TYPE;
exports.Profiler = REACT_PROFILER_TYPE;
exports.PureComponent = PureComponent;
exports.StrictMode = REACT_STRICT_MODE_TYPE;
exports.Suspense = REACT_SUSPENSE_TYPE;
exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE =
  ReactSharedInternals;
exports.__COMPILER_RUNTIME = {
  __proto__: null,
  c: function (size) {
    return ReactSharedInternals.H.useMemoCache(size);
  }
};
exports.cache = function (fn) {
  return function () {
    return fn.apply(null, arguments);
  };
};
exports.cacheSignal = function () {
  return null;
};
exports.cloneElement = function (element, config, children) {
  if (null === element || void 0 === element)
    throw Error(
      "The argument must be a React element, but you passed " + element + "."
    );
  var props = assign({}, element.props),
    key = element.key;
  if (null != config)
    for (propName in (void 0 !== config.key && (key = "" + config.key), config))
      !hasOwnProperty.call(config, propName) ||
        "key" === propName ||
        "__self" === propName ||
        "__source" === propName ||
        ("ref" === propName && void 0 === config.ref) ||
        (props[propName] = config[propName]);
  var propName = arguments.length - 2;
  if (1 === propName) props.children = children;
  else if (1 < propName) {
    for (var childArray = Array(propName), i = 0; i < propName; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  return ReactElement(element.type, key, props);
};
exports.createContext = function (defaultValue) {
  defaultValue = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    Provider: null,
    Consumer: null
  };
  defaultValue.Provider = defaultValue;
  defaultValue.Consumer = {
    $$typeof: REACT_CONSUMER_TYPE,
    _context: defaultValue
  };
  return defaultValue;
};
exports.createElement = function (type, config, children) {
  var propName,
    props = {},
    key = null;
  if (null != config)
    for (propName in (void 0 !== config.key && (key = "" + config.key), config))
      hasOwnProperty.call(config, propName) &&
        "key" !== propName &&
        "__self" !== propName &&
        "__source" !== propName &&
        (props[propName] = config[propName]);
  var childrenLength = arguments.length - 2;
  if (1 === childrenLength) props.children = children;
  else if (1 < childrenLength) {
    for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  if (type && type.defaultProps)
    for (propName in ((childrenLength = type.defaultProps), childrenLength))
      void 0 === props[propName] &&
        (props[propName] = childrenLength[propName]);
  return ReactElement(type, key, props);
};
exports.createRef = function () {
  return { current: null };
};
exports.forwardRef = function (render) {
  return { $$typeof: REACT_FORWARD_REF_TYPE, render: render };
};
exports.isValidElement = isValidElement;
exports.lazy = function (ctor) {
  return {
    $$typeof: REACT_LAZY_TYPE,
    _payload: { _status: -1, _result: ctor },
    _init: lazyInitializer
  };
};
exports.memo = function (type, compare) {
  return {
    $$typeof: REACT_MEMO_TYPE,
    type: type,
    compare: void 0 === compare ? null : compare
  };
};
exports.startTransition = function (scope) {
  var prevTransition = ReactSharedInternals.T,
    currentTransition = {};
  ReactSharedInternals.T = currentTransition;
  try {
    var returnValue = scope(),
      onStartTransitionFinish = ReactSharedInternals.S;
    null !== onStartTransitionFinish &&
      onStartTransitionFinish(currentTransition, returnValue);
    "object" === typeof returnValue &&
      null !== returnValue &&
      "function" === typeof returnValue.then &&
      returnValue.then(noop, reportGlobalError);
  } catch (error) {
    reportGlobalError(error);
  } finally {
    null !== prevTransition &&
      null !== currentTransition.types &&
      (prevTransition.types = currentTransition.types),
      (ReactSharedInternals.T = prevTransition);
  }
};
exports.unstable_useCacheRefresh = function () {
  return ReactSharedInternals.H.useCacheRefresh();
};
exports.use = function (usable) {
  return ReactSharedInternals.H.use(usable);
};
exports.useActionState = function (action, initialState, permalink) {
  return ReactSharedInternals.H.useActionState(action, initialState, permalink);
};
exports.useCallback = function (callback, deps) {
  return ReactSharedInternals.H.useCallback(callback, deps);
};
exports.useContext = function (Context) {
  return ReactSharedInternals.H.useContext(Context);
};
exports.useDebugValue = function () {};
exports.useDeferredValue = function (value, initialValue) {
  return ReactSharedInternals.H.useDeferredValue(value, initialValue);
};
exports.useEffect = function (create, deps) {
  return ReactSharedInternals.H.useEffect(create, deps);
};
exports.useEffectEvent = function (callback) {
  return ReactSharedInternals.H.useEffectEvent(callback);
};
exports.useId = function () {
  return ReactSharedInternals.H.useId();
};
exports.useImperativeHandle = function (ref, create, deps) {
  return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
};
exports.useInsertionEffect = function (create, deps) {
  return ReactSharedInternals.H.useInsertionEffect(create, deps);
};
exports.useLayoutEffect = function (create, deps) {
  return ReactSharedInternals.H.useLayoutEffect(create, deps);
};
exports.useMemo = function (create, deps) {
  return ReactSharedInternals.H.useMemo(create, deps);
};
exports.useOptimistic = function (passthrough, reducer) {
  return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
};
exports.useReducer = function (reducer, initialArg, init) {
  return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
};
exports.useRef = function (initialValue) {
  return ReactSharedInternals.H.useRef(initialValue);
};
exports.useState = function (initialState) {
  return ReactSharedInternals.H.useState(initialState);
};
exports.useSyncExternalStore = function (
  subscribe,
  getSnapshot,
  getServerSnapshot
) {
  return ReactSharedInternals.H.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
};
exports.useTransition = function () {
  return ReactSharedInternals.H.useTransition();
};
exports.version = "19.2.1";

},{}]; // ../../../../opt/oai-docgen/node_modules/react/cjs/react.production.js
defs[3]=[function(module,exports,require){
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*
 Modernizr 3.0.0pre (Custom Build) | MIT
*/
"use strict";
var Scheduler = require("scheduler"),
  React = require("react"),
  ReactDOM = require("react-dom");
function formatProdErrorMessage(code) {
  var url = "https://react.dev/errors/" + code;
  if (1 < arguments.length) {
    url += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var i = 2; i < arguments.length; i++)
      url += "&args[]=" + encodeURIComponent(arguments[i]);
  }
  return (
    "Minified React error #" +
    code +
    "; visit " +
    url +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
function isValidContainer(node) {
  return !(
    !node ||
    (1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType)
  );
}
function getNearestMountedFiber(fiber) {
  var node = fiber,
    nearestMounted = fiber;
  if (fiber.alternate) for (; node.return; ) node = node.return;
  else {
    fiber = node;
    do
      (node = fiber),
        0 !== (node.flags & 4098) && (nearestMounted = node.return),
        (fiber = node.return);
    while (fiber);
  }
  return 3 === node.tag ? nearestMounted : null;
}
function getSuspenseInstanceFromFiber(fiber) {
  if (13 === fiber.tag) {
    var suspenseState = fiber.memoizedState;
    null === suspenseState &&
      ((fiber = fiber.alternate),
      null !== fiber && (suspenseState = fiber.memoizedState));
    if (null !== suspenseState) return suspenseState.dehydrated;
  }
  return null;
}
function getActivityInstanceFromFiber(fiber) {
  if (31 === fiber.tag) {
    var activityState = fiber.memoizedState;
    null === activityState &&
      ((fiber = fiber.alternate),
      null !== fiber && (activityState = fiber.memoizedState));
    if (null !== activityState) return activityState.dehydrated;
  }
  return null;
}
function assertIsMounted(fiber) {
  if (getNearestMountedFiber(fiber) !== fiber)
    throw Error(formatProdErrorMessage(188));
}
function findCurrentFiberUsingSlowPath(fiber) {
  var alternate = fiber.alternate;
  if (!alternate) {
    alternate = getNearestMountedFiber(fiber);
    if (null === alternate) throw Error(formatProdErrorMessage(188));
    return alternate !== fiber ? null : fiber;
  }
  for (var a = fiber, b = alternate; ; ) {
    var parentA = a.return;
    if (null === parentA) break;
    var parentB = parentA.alternate;
    if (null === parentB) {
      b = parentA.return;
      if (null !== b) {
        a = b;
        continue;
      }
      break;
    }
    if (parentA.child === parentB.child) {
      for (parentB = parentA.child; parentB; ) {
        if (parentB === a) return assertIsMounted(parentA), fiber;
        if (parentB === b) return assertIsMounted(parentA), alternate;
        parentB = parentB.sibling;
      }
      throw Error(formatProdErrorMessage(188));
    }
    if (a.return !== b.return) (a = parentA), (b = parentB);
    else {
      for (var didFindChild = !1, child$0 = parentA.child; child$0; ) {
        if (child$0 === a) {
          didFindChild = !0;
          a = parentA;
          b = parentB;
          break;
        }
        if (child$0 === b) {
          didFindChild = !0;
          b = parentA;
          a = parentB;
          break;
        }
        child$0 = child$0.sibling;
      }
      if (!didFindChild) {
        for (child$0 = parentB.child; child$0; ) {
          if (child$0 === a) {
            didFindChild = !0;
            a = parentB;
            b = parentA;
            break;
          }
          if (child$0 === b) {
            didFindChild = !0;
            b = parentB;
            a = parentA;
            break;
          }
          child$0 = child$0.sibling;
        }
        if (!didFindChild) throw Error(formatProdErrorMessage(189));
      }
    }
    if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
  }
  if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
  return a.stateNode.current === a ? fiber : alternate;
}
function findCurrentHostFiberImpl(node) {
  var tag = node.tag;
  if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
  for (node = node.child; null !== node; ) {
    tag = findCurrentHostFiberImpl(node);
    if (null !== tag) return tag;
    node = node.sibling;
  }
  return null;
}
var assign = Object.assign,
  REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"),
  REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
  REACT_PORTAL_TYPE = Symbol.for("react.portal"),
  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
  REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
  REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
  REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
  REACT_CONTEXT_TYPE = Symbol.for("react.context"),
  REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
  REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
  REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
  REACT_MEMO_TYPE = Symbol.for("react.memo"),
  REACT_LAZY_TYPE = Symbol.for("react.lazy");
Symbol.for("react.scope");
var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
Symbol.for("react.legacy_hidden");
Symbol.for("react.tracing_marker");
var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
Symbol.for("react.view_transition");
var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
  if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
  maybeIterable =
    (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
    maybeIterable["@@iterator"];
  return "function" === typeof maybeIterable ? maybeIterable : null;
}
var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
function getComponentNameFromType(type) {
  if (null == type) return null;
  if ("function" === typeof type)
    return type.$$typeof === REACT_CLIENT_REFERENCE
      ? null
      : type.displayName || type.name || null;
  if ("string" === typeof type) return type;
  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return "Fragment";
    case REACT_PROFILER_TYPE:
      return "Profiler";
    case REACT_STRICT_MODE_TYPE:
      return "StrictMode";
    case REACT_SUSPENSE_TYPE:
      return "Suspense";
    case REACT_SUSPENSE_LIST_TYPE:
      return "SuspenseList";
    case REACT_ACTIVITY_TYPE:
      return "Activity";
  }
  if ("object" === typeof type)
    switch (type.$$typeof) {
      case REACT_PORTAL_TYPE:
        return "Portal";
      case REACT_CONTEXT_TYPE:
        return type.displayName || "Context";
      case REACT_CONSUMER_TYPE:
        return (type._context.displayName || "Context") + ".Consumer";
      case REACT_FORWARD_REF_TYPE:
        var innerType = type.render;
        type = type.displayName;
        type ||
          ((type = innerType.displayName || innerType.name || ""),
          (type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef"));
        return type;
      case REACT_MEMO_TYPE:
        return (
          (innerType = type.displayName || null),
          null !== innerType
            ? innerType
            : getComponentNameFromType(type.type) || "Memo"
        );
      case REACT_LAZY_TYPE:
        innerType = type._payload;
        type = type._init;
        try {
          return getComponentNameFromType(type(innerType));
        } catch (x) {}
    }
  return null;
}
var isArrayImpl = Array.isArray,
  ReactSharedInternals =
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  ReactDOMSharedInternals =
    ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  sharedNotPendingObject = {
    pending: !1,
    data: null,
    method: null,
    action: null
  },
  valueStack = [],
  index = -1;
function createCursor(defaultValue) {
  return { current: defaultValue };
}
function pop(cursor) {
  0 > index ||
    ((cursor.current = valueStack[index]), (valueStack[index] = null), index--);
}
function push(cursor, value) {
  index++;
  valueStack[index] = cursor.current;
  cursor.current = value;
}
var contextStackCursor = createCursor(null),
  contextFiberStackCursor = createCursor(null),
  rootInstanceStackCursor = createCursor(null),
  hostTransitionProviderCursor = createCursor(null);
function pushHostContainer(fiber, nextRootInstance) {
  push(rootInstanceStackCursor, nextRootInstance);
  push(contextFiberStackCursor, fiber);
  push(contextStackCursor, null);
  switch (nextRootInstance.nodeType) {
    case 9:
    case 11:
      fiber = (fiber = nextRootInstance.documentElement)
        ? (fiber = fiber.namespaceURI)
          ? getOwnHostContext(fiber)
          : 0
        : 0;
      break;
    default:
      if (
        ((fiber = nextRootInstance.tagName),
        (nextRootInstance = nextRootInstance.namespaceURI))
      )
        (nextRootInstance = getOwnHostContext(nextRootInstance)),
          (fiber = getChildHostContextProd(nextRootInstance, fiber));
      else
        switch (fiber) {
          case "svg":
            fiber = 1;
            break;
          case "math":
            fiber = 2;
            break;
          default:
            fiber = 0;
        }
  }
  pop(contextStackCursor);
  push(contextStackCursor, fiber);
}
function popHostContainer() {
  pop(contextStackCursor);
  pop(contextFiberStackCursor);
  pop(rootInstanceStackCursor);
}
function pushHostContext(fiber) {
  null !== fiber.memoizedState && push(hostTransitionProviderCursor, fiber);
  var context = contextStackCursor.current;
  var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
  context !== JSCompiler_inline_result &&
    (push(contextFiberStackCursor, fiber),
    push(contextStackCursor, JSCompiler_inline_result));
}
function popHostContext(fiber) {
  contextFiberStackCursor.current === fiber &&
    (pop(contextStackCursor), pop(contextFiberStackCursor));
  hostTransitionProviderCursor.current === fiber &&
    (pop(hostTransitionProviderCursor),
    (HostTransitionContext._currentValue = sharedNotPendingObject));
}
var prefix, suffix;
function describeBuiltInComponentFrame(name) {
  if (void 0 === prefix)
    try {
      throw Error();
    } catch (x) {
      var match = x.stack.trim().match(/\n( *(at )?)/);
      prefix = (match && match[1]) || "";
      suffix =
        -1 < x.stack.indexOf("\n    at")
          ? " (<anonymous>)"
          : -1 < x.stack.indexOf("@")
            ? "@unknown:0:0"
            : "";
    }
  return "\n" + prefix + name + suffix;
}
var reentry = !1;
function describeNativeComponentFrame(fn, construct) {
  if (!fn || reentry) return "";
  reentry = !0;
  var previousPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    var RunInRootFrame = {
      DetermineComponentFrameRoot: function () {
        try {
          if (construct) {
            var Fake = function () {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, "props", {
              set: function () {
                throw Error();
              }
            });
            if ("object" === typeof Reflect && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                var control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x$1) {
                control = x$1;
              }
              fn.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x$2) {
              control = x$2;
            }
            (Fake = fn()) &&
              "function" === typeof Fake.catch &&
              Fake.catch(function () {});
          }
        } catch (sample) {
          if (sample && control && "string" === typeof sample.stack)
            return [sample.stack, control.stack];
        }
        return [null, null];
      }
    };
    RunInRootFrame.DetermineComponentFrameRoot.displayName =
      "DetermineComponentFrameRoot";
    var namePropDescriptor = Object.getOwnPropertyDescriptor(
      RunInRootFrame.DetermineComponentFrameRoot,
      "name"
    );
    namePropDescriptor &&
      namePropDescriptor.configurable &&
      Object.defineProperty(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
    var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(),
      sampleStack = _RunInRootFrame$Deter[0],
      controlStack = _RunInRootFrame$Deter[1];
    if (sampleStack && controlStack) {
      var sampleLines = sampleStack.split("\n"),
        controlLines = controlStack.split("\n");
      for (
        namePropDescriptor = RunInRootFrame = 0;
        RunInRootFrame < sampleLines.length &&
        !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");

      )
        RunInRootFrame++;
      for (
        ;
        namePropDescriptor < controlLines.length &&
        !controlLines[namePropDescriptor].includes(
          "DetermineComponentFrameRoot"
        );

      )
        namePropDescriptor++;
      if (
        RunInRootFrame === sampleLines.length ||
        namePropDescriptor === controlLines.length
      )
        for (
          RunInRootFrame = sampleLines.length - 1,
            namePropDescriptor = controlLines.length - 1;
          1 <= RunInRootFrame &&
          0 <= namePropDescriptor &&
          sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];

        )
          namePropDescriptor--;
      for (
        ;
        1 <= RunInRootFrame && 0 <= namePropDescriptor;
        RunInRootFrame--, namePropDescriptor--
      )
        if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
          if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
            do
              if (
                (RunInRootFrame--,
                namePropDescriptor--,
                0 > namePropDescriptor ||
                  sampleLines[RunInRootFrame] !==
                    controlLines[namePropDescriptor])
              ) {
                var frame =
                  "\n" +
                  sampleLines[RunInRootFrame].replace(" at new ", " at ");
                fn.displayName &&
                  frame.includes("<anonymous>") &&
                  (frame = frame.replace("<anonymous>", fn.displayName));
                return frame;
              }
            while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
          }
          break;
        }
    }
  } finally {
    (reentry = !1), (Error.prepareStackTrace = previousPrepareStackTrace);
  }
  return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "")
    ? describeBuiltInComponentFrame(previousPrepareStackTrace)
    : "";
}
function describeFiber(fiber, childFiber) {
  switch (fiber.tag) {
    case 26:
    case 27:
    case 5:
      return describeBuiltInComponentFrame(fiber.type);
    case 16:
      return describeBuiltInComponentFrame("Lazy");
    case 13:
      return fiber.child !== childFiber && null !== childFiber
        ? describeBuiltInComponentFrame("Suspense Fallback")
        : describeBuiltInComponentFrame("Suspense");
    case 19:
      return describeBuiltInComponentFrame("SuspenseList");
    case 0:
    case 15:
      return describeNativeComponentFrame(fiber.type, !1);
    case 11:
      return describeNativeComponentFrame(fiber.type.render, !1);
    case 1:
      return describeNativeComponentFrame(fiber.type, !0);
    case 31:
      return describeBuiltInComponentFrame("Activity");
    default:
      return "";
  }
}
function getStackByFiberInDevAndProd(workInProgress) {
  try {
    var info = "",
      previous = null;
    do
      (info += describeFiber(workInProgress, previous)),
        (previous = workInProgress),
        (workInProgress = workInProgress.return);
    while (workInProgress);
    return info;
  } catch (x) {
    return "\nError generating stack: " + x.message + "\n" + x.stack;
  }
}
var hasOwnProperty = Object.prototype.hasOwnProperty,
  scheduleCallback$3 = Scheduler.unstable_scheduleCallback,
  cancelCallback$1 = Scheduler.unstable_cancelCallback,
  shouldYield = Scheduler.unstable_shouldYield,
  requestPaint = Scheduler.unstable_requestPaint,
  now = Scheduler.unstable_now,
  getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel,
  ImmediatePriority = Scheduler.unstable_ImmediatePriority,
  UserBlockingPriority = Scheduler.unstable_UserBlockingPriority,
  NormalPriority$1 = Scheduler.unstable_NormalPriority,
  LowPriority = Scheduler.unstable_LowPriority,
  IdlePriority = Scheduler.unstable_IdlePriority,
  log$1 = Scheduler.log,
  unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue,
  rendererID = null,
  injectedHook = null;
function setIsStrictModeForDevtools(newIsStrictMode) {
  "function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
  if (injectedHook && "function" === typeof injectedHook.setStrictMode)
    try {
      injectedHook.setStrictMode(rendererID, newIsStrictMode);
    } catch (err) {}
}
var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback,
  log = Math.log,
  LN2 = Math.LN2;
function clz32Fallback(x) {
  x >>>= 0;
  return 0 === x ? 32 : (31 - ((log(x) / LN2) | 0)) | 0;
}
var nextTransitionUpdateLane = 256,
  nextTransitionDeferredLane = 262144,
  nextRetryLane = 4194304;
function getHighestPriorityLanes(lanes) {
  var pendingSyncLanes = lanes & 42;
  if (0 !== pendingSyncLanes) return pendingSyncLanes;
  switch (lanes & -lanes) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
      return 64;
    case 128:
      return 128;
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
      return lanes & 261888;
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return lanes & 3932160;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return lanes & 62914560;
    case 67108864:
      return 67108864;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 0;
    default:
      return lanes;
  }
}
function getNextLanes(root, wipLanes, rootHasPendingCommit) {
  var pendingLanes = root.pendingLanes;
  if (0 === pendingLanes) return 0;
  var nextLanes = 0,
    suspendedLanes = root.suspendedLanes,
    pingedLanes = root.pingedLanes;
  root = root.warmLanes;
  var nonIdlePendingLanes = pendingLanes & 134217727;
  0 !== nonIdlePendingLanes
    ? ((pendingLanes = nonIdlePendingLanes & ~suspendedLanes),
      0 !== pendingLanes
        ? (nextLanes = getHighestPriorityLanes(pendingLanes))
        : ((pingedLanes &= nonIdlePendingLanes),
          0 !== pingedLanes
            ? (nextLanes = getHighestPriorityLanes(pingedLanes))
            : rootHasPendingCommit ||
              ((rootHasPendingCommit = nonIdlePendingLanes & ~root),
              0 !== rootHasPendingCommit &&
                (nextLanes = getHighestPriorityLanes(rootHasPendingCommit)))))
    : ((nonIdlePendingLanes = pendingLanes & ~suspendedLanes),
      0 !== nonIdlePendingLanes
        ? (nextLanes = getHighestPriorityLanes(nonIdlePendingLanes))
        : 0 !== pingedLanes
          ? (nextLanes = getHighestPriorityLanes(pingedLanes))
          : rootHasPendingCommit ||
            ((rootHasPendingCommit = pendingLanes & ~root),
            0 !== rootHasPendingCommit &&
              (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
  return 0 === nextLanes
    ? 0
    : 0 !== wipLanes &&
        wipLanes !== nextLanes &&
        0 === (wipLanes & suspendedLanes) &&
        ((suspendedLanes = nextLanes & -nextLanes),
        (rootHasPendingCommit = wipLanes & -wipLanes),
        suspendedLanes >= rootHasPendingCommit ||
          (32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)))
      ? wipLanes
      : nextLanes;
}
function checkIfRootIsPrerendering(root, renderLanes) {
  return (
    0 ===
    (root.pendingLanes &
      ~(root.suspendedLanes & ~root.pingedLanes) &
      renderLanes)
  );
}
function computeExpirationTime(lane, currentTime) {
  switch (lane) {
    case 1:
    case 2:
    case 4:
    case 8:
    case 64:
      return currentTime + 250;
    case 16:
    case 32:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return currentTime + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      return -1;
    case 67108864:
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function claimNextRetryLane() {
  var lane = nextRetryLane;
  nextRetryLane <<= 1;
  0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
  return lane;
}
function createLaneMap(initial) {
  for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
  return laneMap;
}
function markRootUpdated$1(root, updateLane) {
  root.pendingLanes |= updateLane;
  268435456 !== updateLane &&
    ((root.suspendedLanes = 0), (root.pingedLanes = 0), (root.warmLanes = 0));
}
function markRootFinished(
  root,
  finishedLanes,
  remainingLanes,
  spawnedLane,
  updatedLanes,
  suspendedRetryLanes
) {
  var previouslyPendingLanes = root.pendingLanes;
  root.pendingLanes = remainingLanes;
  root.suspendedLanes = 0;
  root.pingedLanes = 0;
  root.warmLanes = 0;
  root.expiredLanes &= remainingLanes;
  root.entangledLanes &= remainingLanes;
  root.errorRecoveryDisabledLanes &= remainingLanes;
  root.shellSuspendCounter = 0;
  var entanglements = root.entanglements,
    expirationTimes = root.expirationTimes,
    hiddenUpdates = root.hiddenUpdates;
  for (
    remainingLanes = previouslyPendingLanes & ~remainingLanes;
    0 < remainingLanes;

  ) {
    var index$7 = 31 - clz32(remainingLanes),
      lane = 1 << index$7;
    entanglements[index$7] = 0;
    expirationTimes[index$7] = -1;
    var hiddenUpdatesForLane = hiddenUpdates[index$7];
    if (null !== hiddenUpdatesForLane)
      for (
        hiddenUpdates[index$7] = null, index$7 = 0;
        index$7 < hiddenUpdatesForLane.length;
        index$7++
      ) {
        var update = hiddenUpdatesForLane[index$7];
        null !== update && (update.lane &= -536870913);
      }
    remainingLanes &= ~lane;
  }
  0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, 0);
  0 !== suspendedRetryLanes &&
    0 === updatedLanes &&
    0 !== root.tag &&
    (root.suspendedLanes |=
      suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
}
function markSpawnedDeferredLane(root, spawnedLane, entangledLanes) {
  root.pendingLanes |= spawnedLane;
  root.suspendedLanes &= ~spawnedLane;
  var spawnedLaneIndex = 31 - clz32(spawnedLane);
  root.entangledLanes |= spawnedLane;
  root.entanglements[spawnedLaneIndex] =
    root.entanglements[spawnedLaneIndex] |
    1073741824 |
    (entangledLanes & 261930);
}
function markRootEntangled(root, entangledLanes) {
  var rootEntangledLanes = (root.entangledLanes |= entangledLanes);
  for (root = root.entanglements; rootEntangledLanes; ) {
    var index$8 = 31 - clz32(rootEntangledLanes),
      lane = 1 << index$8;
    (lane & entangledLanes) | (root[index$8] & entangledLanes) &&
      (root[index$8] |= entangledLanes);
    rootEntangledLanes &= ~lane;
  }
}
function getBumpedLaneForHydration(root, renderLanes) {
  var renderLane = renderLanes & -renderLanes;
  renderLane =
    0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
  return 0 !== (renderLane & (root.suspendedLanes | renderLanes))
    ? 0
    : renderLane;
}
function getBumpedLaneForHydrationByLane(lane) {
  switch (lane) {
    case 2:
      lane = 1;
      break;
    case 8:
      lane = 4;
      break;
    case 32:
      lane = 16;
      break;
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
      lane = 128;
      break;
    case 268435456:
      lane = 134217728;
      break;
    default:
      lane = 0;
  }
  return lane;
}
function lanesToEventPriority(lanes) {
  lanes &= -lanes;
  return 2 < lanes
    ? 8 < lanes
      ? 0 !== (lanes & 134217727)
        ? 32
        : 268435456
      : 8
    : 2;
}
function resolveUpdatePriority() {
  var updatePriority = ReactDOMSharedInternals.p;
  if (0 !== updatePriority) return updatePriority;
  updatePriority = window.event;
  return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
}
function runWithPriority(priority, fn) {
  var previousPriority = ReactDOMSharedInternals.p;
  try {
    return (ReactDOMSharedInternals.p = priority), fn();
  } finally {
    ReactDOMSharedInternals.p = previousPriority;
  }
}
var randomKey = Math.random().toString(36).slice(2),
  internalInstanceKey = "__reactFiber$" + randomKey,
  internalPropsKey = "__reactProps$" + randomKey,
  internalContainerInstanceKey = "__reactContainer$" + randomKey,
  internalEventHandlersKey = "__reactEvents$" + randomKey,
  internalEventHandlerListenersKey = "__reactListeners$" + randomKey,
  internalEventHandlesSetKey = "__reactHandles$" + randomKey,
  internalRootNodeResourcesKey = "__reactResources$" + randomKey,
  internalHoistableMarker = "__reactMarker$" + randomKey;
function detachDeletedInstance(node) {
  delete node[internalInstanceKey];
  delete node[internalPropsKey];
  delete node[internalEventHandlersKey];
  delete node[internalEventHandlerListenersKey];
  delete node[internalEventHandlesSetKey];
}
function getClosestInstanceFromNode(targetNode) {
  var targetInst = targetNode[internalInstanceKey];
  if (targetInst) return targetInst;
  for (var parentNode = targetNode.parentNode; parentNode; ) {
    if (
      (targetInst =
        parentNode[internalContainerInstanceKey] ||
        parentNode[internalInstanceKey])
    ) {
      parentNode = targetInst.alternate;
      if (
        null !== targetInst.child ||
        (null !== parentNode && null !== parentNode.child)
      )
        for (
          targetNode = getParentHydrationBoundary(targetNode);
          null !== targetNode;

        ) {
          if ((parentNode = targetNode[internalInstanceKey])) return parentNode;
          targetNode = getParentHydrationBoundary(targetNode);
        }
      return targetInst;
    }
    targetNode = parentNode;
    parentNode = targetNode.parentNode;
  }
  return null;
}
function getInstanceFromNode(node) {
  if (
    (node = node[internalInstanceKey] || node[internalContainerInstanceKey])
  ) {
    var tag = node.tag;
    if (
      5 === tag ||
      6 === tag ||
      13 === tag ||
      31 === tag ||
      26 === tag ||
      27 === tag ||
      3 === tag
    )
      return node;
  }
  return null;
}
function getNodeFromInstance(inst) {
  var tag = inst.tag;
  if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
  throw Error(formatProdErrorMessage(33));
}
function getResourcesFromRoot(root) {
  var resources = root[internalRootNodeResourcesKey];
  resources ||
    (resources = root[internalRootNodeResourcesKey] =
      { hoistableStyles: new Map(), hoistableScripts: new Map() });
  return resources;
}
function markNodeAsHoistable(node) {
  node[internalHoistableMarker] = !0;
}
var allNativeEvents = new Set(),
  registrationNameDependencies = {};
function registerTwoPhaseEvent(registrationName, dependencies) {
  registerDirectEvent(registrationName, dependencies);
  registerDirectEvent(registrationName + "Capture", dependencies);
}
function registerDirectEvent(registrationName, dependencies) {
  registrationNameDependencies[registrationName] = dependencies;
  for (
    registrationName = 0;
    registrationName < dependencies.length;
    registrationName++
  )
    allNativeEvents.add(dependencies[registrationName]);
}
var VALID_ATTRIBUTE_NAME_REGEX = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ),
  illegalAttributeNameCache = {},
  validatedAttributeNameCache = {};
function isAttributeNameSafe(attributeName) {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
    return !0;
  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
    return (validatedAttributeNameCache[attributeName] = !0);
  illegalAttributeNameCache[attributeName] = !0;
  return !1;
}
function setValueForAttribute(node, name, value) {
  if (isAttributeNameSafe(name))
    if (null === value) node.removeAttribute(name);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
          node.removeAttribute(name);
          return;
        case "boolean":
          var prefix$10 = name.toLowerCase().slice(0, 5);
          if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
            node.removeAttribute(name);
            return;
          }
      }
      node.setAttribute(name, "" + value);
    }
}
function setValueForKnownAttribute(node, name, value) {
  if (null === value) node.removeAttribute(name);
  else {
    switch (typeof value) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        node.removeAttribute(name);
        return;
    }
    node.setAttribute(name, "" + value);
  }
}
function setValueForNamespacedAttribute(node, namespace, name, value) {
  if (null === value) node.removeAttribute(name);
  else {
    switch (typeof value) {
      case "undefined":
      case "function":
      case "symbol":
      case "boolean":
        node.removeAttribute(name);
        return;
    }
    node.setAttributeNS(namespace, name, "" + value);
  }
}
function getToStringValue(value) {
  switch (typeof value) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return value;
    case "object":
      return value;
    default:
      return "";
  }
}
function isCheckable(elem) {
  var type = elem.type;
  return (
    (elem = elem.nodeName) &&
    "input" === elem.toLowerCase() &&
    ("checkbox" === type || "radio" === type)
  );
}
function trackValueOnNode(node, valueField, currentValue) {
  var descriptor = Object.getOwnPropertyDescriptor(
    node.constructor.prototype,
    valueField
  );
  if (
    !node.hasOwnProperty(valueField) &&
    "undefined" !== typeof descriptor &&
    "function" === typeof descriptor.get &&
    "function" === typeof descriptor.set
  ) {
    var get = descriptor.get,
      set = descriptor.set;
    Object.defineProperty(node, valueField, {
      configurable: !0,
      get: function () {
        return get.call(this);
      },
      set: function (value) {
        currentValue = "" + value;
        set.call(this, value);
      }
    });
    Object.defineProperty(node, valueField, {
      enumerable: descriptor.enumerable
    });
    return {
      getValue: function () {
        return currentValue;
      },
      setValue: function (value) {
        currentValue = "" + value;
      },
      stopTracking: function () {
        node._valueTracker = null;
        delete node[valueField];
      }
    };
  }
}
function track(node) {
  if (!node._valueTracker) {
    var valueField = isCheckable(node) ? "checked" : "value";
    node._valueTracker = trackValueOnNode(
      node,
      valueField,
      "" + node[valueField]
    );
  }
}
function updateValueIfChanged(node) {
  if (!node) return !1;
  var tracker = node._valueTracker;
  if (!tracker) return !0;
  var lastValue = tracker.getValue();
  var value = "";
  node &&
    (value = isCheckable(node)
      ? node.checked
        ? "true"
        : "false"
      : node.value);
  node = value;
  return node !== lastValue ? (tracker.setValue(node), !0) : !1;
}
function getActiveElement(doc) {
  doc = doc || ("undefined" !== typeof document ? document : void 0);
  if ("undefined" === typeof doc) return null;
  try {
    return doc.activeElement || doc.body;
  } catch (e) {
    return doc.body;
  }
}
var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
  return value.replace(
    escapeSelectorAttributeValueInsideDoubleQuotesRegex,
    function (ch) {
      return "\\" + ch.charCodeAt(0).toString(16) + " ";
    }
  );
}
function updateInput(
  element,
  value,
  defaultValue,
  lastDefaultValue,
  checked,
  defaultChecked,
  type,
  name
) {
  element.name = "";
  null != type &&
  "function" !== typeof type &&
  "symbol" !== typeof type &&
  "boolean" !== typeof type
    ? (element.type = type)
    : element.removeAttribute("type");
  if (null != value)
    if ("number" === type) {
      if ((0 === value && "" === element.value) || element.value != value)
        element.value = "" + getToStringValue(value);
    } else
      element.value !== "" + getToStringValue(value) &&
        (element.value = "" + getToStringValue(value));
  else
    ("submit" !== type && "reset" !== type) || element.removeAttribute("value");
  null != value
    ? setDefaultValue(element, type, getToStringValue(value))
    : null != defaultValue
      ? setDefaultValue(element, type, getToStringValue(defaultValue))
      : null != lastDefaultValue && element.removeAttribute("value");
  null == checked &&
    null != defaultChecked &&
    (element.defaultChecked = !!defaultChecked);
  null != checked &&
    (element.checked =
      checked && "function" !== typeof checked && "symbol" !== typeof checked);
  null != name &&
  "function" !== typeof name &&
  "symbol" !== typeof name &&
  "boolean" !== typeof name
    ? (element.name = "" + getToStringValue(name))
    : element.removeAttribute("name");
}
function initInput(
  element,
  value,
  defaultValue,
  checked,
  defaultChecked,
  type,
  name,
  isHydrating
) {
  null != type &&
    "function" !== typeof type &&
    "symbol" !== typeof type &&
    "boolean" !== typeof type &&
    (element.type = type);
  if (null != value || null != defaultValue) {
    if (
      !(
        ("submit" !== type && "reset" !== type) ||
        (void 0 !== value && null !== value)
      )
    ) {
      track(element);
      return;
    }
    defaultValue =
      null != defaultValue ? "" + getToStringValue(defaultValue) : "";
    value = null != value ? "" + getToStringValue(value) : defaultValue;
    isHydrating || value === element.value || (element.value = value);
    element.defaultValue = value;
  }
  checked = null != checked ? checked : defaultChecked;
  checked =
    "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
  element.checked = isHydrating ? element.checked : !!checked;
  element.defaultChecked = !!checked;
  null != name &&
    "function" !== typeof name &&
    "symbol" !== typeof name &&
    "boolean" !== typeof name &&
    (element.name = name);
  track(element);
}
function setDefaultValue(node, type, value) {
  ("number" === type && getActiveElement(node.ownerDocument) === node) ||
    node.defaultValue === "" + value ||
    (node.defaultValue = "" + value);
}
function updateOptions(node, multiple, propValue, setDefaultSelected) {
  node = node.options;
  if (multiple) {
    multiple = {};
    for (var i = 0; i < propValue.length; i++)
      multiple["$" + propValue[i]] = !0;
    for (propValue = 0; propValue < node.length; propValue++)
      (i = multiple.hasOwnProperty("$" + node[propValue].value)),
        node[propValue].selected !== i && (node[propValue].selected = i),
        i && setDefaultSelected && (node[propValue].defaultSelected = !0);
  } else {
    propValue = "" + getToStringValue(propValue);
    multiple = null;
    for (i = 0; i < node.length; i++) {
      if (node[i].value === propValue) {
        node[i].selected = !0;
        setDefaultSelected && (node[i].defaultSelected = !0);
        return;
      }
      null !== multiple || node[i].disabled || (multiple = node[i]);
    }
    null !== multiple && (multiple.selected = !0);
  }
}
function updateTextarea(element, value, defaultValue) {
  if (
    null != value &&
    ((value = "" + getToStringValue(value)),
    value !== element.value && (element.value = value),
    null == defaultValue)
  ) {
    element.defaultValue !== value && (element.defaultValue = value);
    return;
  }
  element.defaultValue =
    null != defaultValue ? "" + getToStringValue(defaultValue) : "";
}
function initTextarea(element, value, defaultValue, children) {
  if (null == value) {
    if (null != children) {
      if (null != defaultValue) throw Error(formatProdErrorMessage(92));
      if (isArrayImpl(children)) {
        if (1 < children.length) throw Error(formatProdErrorMessage(93));
        children = children[0];
      }
      defaultValue = children;
    }
    null == defaultValue && (defaultValue = "");
    value = defaultValue;
  }
  defaultValue = getToStringValue(value);
  element.defaultValue = defaultValue;
  children = element.textContent;
  children === defaultValue &&
    "" !== children &&
    null !== children &&
    (element.value = children);
  track(element);
}
function setTextContent(node, text) {
  if (text) {
    var firstChild = node.firstChild;
    if (
      firstChild &&
      firstChild === node.lastChild &&
      3 === firstChild.nodeType
    ) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
}
var unitlessNumbers = new Set(
  "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
    " "
  )
);
function setValueForStyle(style, styleName, value) {
  var isCustomProperty = 0 === styleName.indexOf("--");
  null == value || "boolean" === typeof value || "" === value
    ? isCustomProperty
      ? style.setProperty(styleName, "")
      : "float" === styleName
        ? (style.cssFloat = "")
        : (style[styleName] = "")
    : isCustomProperty
      ? style.setProperty(styleName, value)
      : "number" !== typeof value ||
          0 === value ||
          unitlessNumbers.has(styleName)
        ? "float" === styleName
          ? (style.cssFloat = value)
          : (style[styleName] = ("" + value).trim())
        : (style[styleName] = value + "px");
}
function setValueForStyles(node, styles, prevStyles) {
  if (null != styles && "object" !== typeof styles)
    throw Error(formatProdErrorMessage(62));
  node = node.style;
  if (null != prevStyles) {
    for (var styleName in prevStyles)
      !prevStyles.hasOwnProperty(styleName) ||
        (null != styles && styles.hasOwnProperty(styleName)) ||
        (0 === styleName.indexOf("--")
          ? node.setProperty(styleName, "")
          : "float" === styleName
            ? (node.cssFloat = "")
            : (node[styleName] = ""));
    for (var styleName$16 in styles)
      (styleName = styles[styleName$16]),
        styles.hasOwnProperty(styleName$16) &&
          prevStyles[styleName$16] !== styleName &&
          setValueForStyle(node, styleName$16, styleName);
  } else
    for (var styleName$17 in styles)
      styles.hasOwnProperty(styleName$17) &&
        setValueForStyle(node, styleName$17, styles[styleName$17]);
}
function isCustomElement(tagName) {
  if (-1 === tagName.indexOf("-")) return !1;
  switch (tagName) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var aliases = new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]),
  isJavaScriptProtocol =
    /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
function sanitizeURL(url) {
  return isJavaScriptProtocol.test("" + url)
    ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
    : url;
}
function noop$1() {}
var currentReplayingEvent = null;
function getEventTarget(nativeEvent) {
  nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
  nativeEvent.correspondingUseElement &&
    (nativeEvent = nativeEvent.correspondingUseElement);
  return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
}
var restoreTarget = null,
  restoreQueue = null;
function restoreStateOfTarget(target) {
  var internalInstance = getInstanceFromNode(target);
  if (internalInstance && (target = internalInstance.stateNode)) {
    var props = target[internalPropsKey] || null;
    a: switch (((target = internalInstance.stateNode), internalInstance.type)) {
      case "input":
        updateInput(
          target,
          props.value,
          props.defaultValue,
          props.defaultValue,
          props.checked,
          props.defaultChecked,
          props.type,
          props.name
        );
        internalInstance = props.name;
        if ("radio" === props.type && null != internalInstance) {
          for (props = target; props.parentNode; ) props = props.parentNode;
          props = props.querySelectorAll(
            'input[name="' +
              escapeSelectorAttributeValueInsideDoubleQuotes(
                "" + internalInstance
              ) +
              '"][type="radio"]'
          );
          for (
            internalInstance = 0;
            internalInstance < props.length;
            internalInstance++
          ) {
            var otherNode = props[internalInstance];
            if (otherNode !== target && otherNode.form === target.form) {
              var otherProps = otherNode[internalPropsKey] || null;
              if (!otherProps) throw Error(formatProdErrorMessage(90));
              updateInput(
                otherNode,
                otherProps.value,
                otherProps.defaultValue,
                otherProps.defaultValue,
                otherProps.checked,
                otherProps.defaultChecked,
                otherProps.type,
                otherProps.name
              );
            }
          }
          for (
            internalInstance = 0;
            internalInstance < props.length;
            internalInstance++
          )
            (otherNode = props[internalInstance]),
              otherNode.form === target.form && updateValueIfChanged(otherNode);
        }
        break a;
      case "textarea":
        updateTextarea(target, props.value, props.defaultValue);
        break a;
      case "select":
        (internalInstance = props.value),
          null != internalInstance &&
            updateOptions(target, !!props.multiple, internalInstance, !1);
    }
  }
}
var isInsideEventHandler = !1;
function batchedUpdates$1(fn, a, b) {
  if (isInsideEventHandler) return fn(a, b);
  isInsideEventHandler = !0;
  try {
    var JSCompiler_inline_result = fn(a);
    return JSCompiler_inline_result;
  } finally {
    if (
      ((isInsideEventHandler = !1),
      null !== restoreTarget || null !== restoreQueue)
    )
      if (
        (flushSyncWork$1(),
        restoreTarget &&
          ((a = restoreTarget),
          (fn = restoreQueue),
          (restoreQueue = restoreTarget = null),
          restoreStateOfTarget(a),
          fn))
      )
        for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
  }
}
function getListener(inst, registrationName) {
  var stateNode = inst.stateNode;
  if (null === stateNode) return null;
  var props = stateNode[internalPropsKey] || null;
  if (null === props) return null;
  stateNode = props[registrationName];
  a: switch (registrationName) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (props = !props.disabled) ||
        ((inst = inst.type),
        (props = !(
          "button" === inst ||
          "input" === inst ||
          "select" === inst ||
          "textarea" === inst
        )));
      inst = !props;
      break a;
    default:
      inst = !1;
  }
  if (inst) return null;
  if (stateNode && "function" !== typeof stateNode)
    throw Error(
      formatProdErrorMessage(231, registrationName, typeof stateNode)
    );
  return stateNode;
}
var canUseDOM = !(
    "undefined" === typeof window ||
    "undefined" === typeof window.document ||
    "undefined" === typeof window.document.createElement
  ),
  passiveBrowserEventsSupported = !1;
if (canUseDOM)
  try {
    var options = {};
    Object.defineProperty(options, "passive", {
      get: function () {
        passiveBrowserEventsSupported = !0;
      }
    });
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (e) {
    passiveBrowserEventsSupported = !1;
  }
var root = null,
  startText = null,
  fallbackText = null;
function getData() {
  if (fallbackText) return fallbackText;
  var start,
    startValue = startText,
    startLength = startValue.length,
    end,
    endValue = "value" in root ? root.value : root.textContent,
    endLength = endValue.length;
  for (
    start = 0;
    start < startLength && startValue[start] === endValue[start];
    start++
  );
  var minEnd = startLength - start;
  for (
    end = 1;
    end <= minEnd &&
    startValue[startLength - end] === endValue[endLength - end];
    end++
  );
  return (fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0));
}
function getEventCharCode(nativeEvent) {
  var keyCode = nativeEvent.keyCode;
  "charCode" in nativeEvent
    ? ((nativeEvent = nativeEvent.charCode),
      0 === nativeEvent && 13 === keyCode && (nativeEvent = 13))
    : (nativeEvent = keyCode);
  10 === nativeEvent && (nativeEvent = 13);
  return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
}
function functionThatReturnsTrue() {
  return !0;
}
function functionThatReturnsFalse() {
  return !1;
}
function createSyntheticEvent(Interface) {
  function SyntheticBaseEvent(
    reactName,
    reactEventType,
    targetInst,
    nativeEvent,
    nativeEventTarget
  ) {
    this._reactName = reactName;
    this._targetInst = targetInst;
    this.type = reactEventType;
    this.nativeEvent = nativeEvent;
    this.target = nativeEventTarget;
    this.currentTarget = null;
    for (var propName in Interface)
      Interface.hasOwnProperty(propName) &&
        ((reactName = Interface[propName]),
        (this[propName] = reactName
          ? reactName(nativeEvent)
          : nativeEvent[propName]));
    this.isDefaultPrevented = (
      null != nativeEvent.defaultPrevented
        ? nativeEvent.defaultPrevented
        : !1 === nativeEvent.returnValue
    )
      ? functionThatReturnsTrue
      : functionThatReturnsFalse;
    this.isPropagationStopped = functionThatReturnsFalse;
    return this;
  }
  assign(SyntheticBaseEvent.prototype, {
    preventDefault: function () {
      this.defaultPrevented = !0;
      var event = this.nativeEvent;
      event &&
        (event.preventDefault
          ? event.preventDefault()
          : "unknown" !== typeof event.returnValue && (event.returnValue = !1),
        (this.isDefaultPrevented = functionThatReturnsTrue));
    },
    stopPropagation: function () {
      var event = this.nativeEvent;
      event &&
        (event.stopPropagation
          ? event.stopPropagation()
          : "unknown" !== typeof event.cancelBubble &&
            (event.cancelBubble = !0),
        (this.isPropagationStopped = functionThatReturnsTrue));
    },
    persist: function () {},
    isPersistent: functionThatReturnsTrue
  });
  return SyntheticBaseEvent;
}
var EventInterface = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (event) {
      return event.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  },
  SyntheticEvent = createSyntheticEvent(EventInterface),
  UIEventInterface = assign({}, EventInterface, { view: 0, detail: 0 }),
  SyntheticUIEvent = createSyntheticEvent(UIEventInterface),
  lastMovementX,
  lastMovementY,
  lastMouseEvent,
  MouseEventInterface = assign({}, UIEventInterface, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: getEventModifierState,
    button: 0,
    buttons: 0,
    relatedTarget: function (event) {
      return void 0 === event.relatedTarget
        ? event.fromElement === event.srcElement
          ? event.toElement
          : event.fromElement
        : event.relatedTarget;
    },
    movementX: function (event) {
      if ("movementX" in event) return event.movementX;
      event !== lastMouseEvent &&
        (lastMouseEvent && "mousemove" === event.type
          ? ((lastMovementX = event.screenX - lastMouseEvent.screenX),
            (lastMovementY = event.screenY - lastMouseEvent.screenY))
          : (lastMovementY = lastMovementX = 0),
        (lastMouseEvent = event));
      return lastMovementX;
    },
    movementY: function (event) {
      return "movementY" in event ? event.movementY : lastMovementY;
    }
  }),
  SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface),
  DragEventInterface = assign({}, MouseEventInterface, { dataTransfer: 0 }),
  SyntheticDragEvent = createSyntheticEvent(DragEventInterface),
  FocusEventInterface = assign({}, UIEventInterface, { relatedTarget: 0 }),
  SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface),
  AnimationEventInterface = assign({}, EventInterface, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }),
  SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface),
  ClipboardEventInterface = assign({}, EventInterface, {
    clipboardData: function (event) {
      return "clipboardData" in event
        ? event.clipboardData
        : window.clipboardData;
    }
  }),
  SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface),
  CompositionEventInterface = assign({}, EventInterface, { data: 0 }),
  SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface),
  normalizeKey = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  },
  translateToKey = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  },
  modifierKeyToProp = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
function modifierStateGetter(keyArg) {
  var nativeEvent = this.nativeEvent;
  return nativeEvent.getModifierState
    ? nativeEvent.getModifierState(keyArg)
    : (keyArg = modifierKeyToProp[keyArg])
      ? !!nativeEvent[keyArg]
      : !1;
}
function getEventModifierState() {
  return modifierStateGetter;
}
var KeyboardEventInterface = assign({}, UIEventInterface, {
    key: function (nativeEvent) {
      if (nativeEvent.key) {
        var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
        if ("Unidentified" !== key) return key;
      }
      return "keypress" === nativeEvent.type
        ? ((nativeEvent = getEventCharCode(nativeEvent)),
          13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent))
        : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type
          ? translateToKey[nativeEvent.keyCode] || "Unidentified"
          : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: getEventModifierState,
    charCode: function (event) {
      return "keypress" === event.type ? getEventCharCode(event) : 0;
    },
    keyCode: function (event) {
      return "keydown" === event.type || "keyup" === event.type
        ? event.keyCode
        : 0;
    },
    which: function (event) {
      return "keypress" === event.type
        ? getEventCharCode(event)
        : "keydown" === event.type || "keyup" === event.type
          ? event.keyCode
          : 0;
    }
  }),
  SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface),
  PointerEventInterface = assign({}, MouseEventInterface, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }),
  SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface),
  TouchEventInterface = assign({}, UIEventInterface, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: getEventModifierState
  }),
  SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface),
  TransitionEventInterface = assign({}, EventInterface, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }),
  SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface),
  WheelEventInterface = assign({}, MouseEventInterface, {
    deltaX: function (event) {
      return "deltaX" in event
        ? event.deltaX
        : "wheelDeltaX" in event
          ? -event.wheelDeltaX
          : 0;
    },
    deltaY: function (event) {
      return "deltaY" in event
        ? event.deltaY
        : "wheelDeltaY" in event
          ? -event.wheelDeltaY
          : "wheelDelta" in event
            ? -event.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }),
  SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface),
  ToggleEventInterface = assign({}, EventInterface, {
    newState: 0,
    oldState: 0
  }),
  SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface),
  END_KEYCODES = [9, 13, 27, 32],
  canUseCompositionEvent = canUseDOM && "CompositionEvent" in window,
  documentMode = null;
canUseDOM &&
  "documentMode" in document &&
  (documentMode = document.documentMode);
var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode,
  useFallbackCompositionData =
    canUseDOM &&
    (!canUseCompositionEvent ||
      (documentMode && 8 < documentMode && 11 >= documentMode)),
  SPACEBAR_CHAR = String.fromCharCode(32),
  hasSpaceKeypress = !1;
function isFallbackCompositionEnd(domEventName, nativeEvent) {
  switch (domEventName) {
    case "keyup":
      return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
    case "keydown":
      return 229 !== nativeEvent.keyCode;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function getDataFromCustomEvent(nativeEvent) {
  nativeEvent = nativeEvent.detail;
  return "object" === typeof nativeEvent && "data" in nativeEvent
    ? nativeEvent.data
    : null;
}
var isComposing = !1;
function getNativeBeforeInputChars(domEventName, nativeEvent) {
  switch (domEventName) {
    case "compositionend":
      return getDataFromCustomEvent(nativeEvent);
    case "keypress":
      if (32 !== nativeEvent.which) return null;
      hasSpaceKeypress = !0;
      return SPACEBAR_CHAR;
    case "textInput":
      return (
        (domEventName = nativeEvent.data),
        domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName
      );
    default:
      return null;
  }
}
function getFallbackBeforeInputChars(domEventName, nativeEvent) {
  if (isComposing)
    return "compositionend" === domEventName ||
      (!canUseCompositionEvent &&
        isFallbackCompositionEnd(domEventName, nativeEvent))
      ? ((domEventName = getData()),
        (fallbackText = startText = root = null),
        (isComposing = !1),
        domEventName)
      : null;
  switch (domEventName) {
    case "paste":
      return null;
    case "keypress":
      if (
        !(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) ||
        (nativeEvent.ctrlKey && nativeEvent.altKey)
      ) {
        if (nativeEvent.char && 1 < nativeEvent.char.length)
          return nativeEvent.char;
        if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
      }
      return null;
    case "compositionend":
      return useFallbackCompositionData && "ko" !== nativeEvent.locale
        ? null
        : nativeEvent.data;
    default:
      return null;
  }
}
var supportedInputTypes = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0
};
function isTextInputElement(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  return "input" === nodeName
    ? !!supportedInputTypes[elem.type]
    : "textarea" === nodeName
      ? !0
      : !1;
}
function createAndAccumulateChangeEvent(
  dispatchQueue,
  inst,
  nativeEvent,
  target
) {
  restoreTarget
    ? restoreQueue
      ? restoreQueue.push(target)
      : (restoreQueue = [target])
    : (restoreTarget = target);
  inst = accumulateTwoPhaseListeners(inst, "onChange");
  0 < inst.length &&
    ((nativeEvent = new SyntheticEvent(
      "onChange",
      "change",
      null,
      nativeEvent,
      target
    )),
    dispatchQueue.push({ event: nativeEvent, listeners: inst }));
}
var activeElement$1 = null,
  activeElementInst$1 = null;
function runEventInBatch(dispatchQueue) {
  processDispatchQueue(dispatchQueue, 0);
}
function getInstIfValueChanged(targetInst) {
  var targetNode = getNodeFromInstance(targetInst);
  if (updateValueIfChanged(targetNode)) return targetInst;
}
function getTargetInstForChangeEvent(domEventName, targetInst) {
  if ("change" === domEventName) return targetInst;
}
var isInputEventSupported = !1;
if (canUseDOM) {
  var JSCompiler_inline_result$jscomp$286;
  if (canUseDOM) {
    var isSupported$jscomp$inline_427 = "oninput" in document;
    if (!isSupported$jscomp$inline_427) {
      var element$jscomp$inline_428 = document.createElement("div");
      element$jscomp$inline_428.setAttribute("oninput", "return;");
      isSupported$jscomp$inline_427 =
        "function" === typeof element$jscomp$inline_428.oninput;
    }
    JSCompiler_inline_result$jscomp$286 = isSupported$jscomp$inline_427;
  } else JSCompiler_inline_result$jscomp$286 = !1;
  isInputEventSupported =
    JSCompiler_inline_result$jscomp$286 &&
    (!document.documentMode || 9 < document.documentMode);
}
function stopWatchingForValueChange() {
  activeElement$1 &&
    (activeElement$1.detachEvent("onpropertychange", handlePropertyChange),
    (activeElementInst$1 = activeElement$1 = null));
}
function handlePropertyChange(nativeEvent) {
  if (
    "value" === nativeEvent.propertyName &&
    getInstIfValueChanged(activeElementInst$1)
  ) {
    var dispatchQueue = [];
    createAndAccumulateChangeEvent(
      dispatchQueue,
      activeElementInst$1,
      nativeEvent,
      getEventTarget(nativeEvent)
    );
    batchedUpdates$1(runEventInBatch, dispatchQueue);
  }
}
function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
  "focusin" === domEventName
    ? (stopWatchingForValueChange(),
      (activeElement$1 = target),
      (activeElementInst$1 = targetInst),
      activeElement$1.attachEvent("onpropertychange", handlePropertyChange))
    : "focusout" === domEventName && stopWatchingForValueChange();
}
function getTargetInstForInputEventPolyfill(domEventName) {
  if (
    "selectionchange" === domEventName ||
    "keyup" === domEventName ||
    "keydown" === domEventName
  )
    return getInstIfValueChanged(activeElementInst$1);
}
function getTargetInstForClickEvent(domEventName, targetInst) {
  if ("click" === domEventName) return getInstIfValueChanged(targetInst);
}
function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
  if ("input" === domEventName || "change" === domEventName)
    return getInstIfValueChanged(targetInst);
}
function is(x, y) {
  return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
}
var objectIs = "function" === typeof Object.is ? Object.is : is;
function shallowEqual(objA, objB) {
  if (objectIs(objA, objB)) return !0;
  if (
    "object" !== typeof objA ||
    null === objA ||
    "object" !== typeof objB ||
    null === objB
  )
    return !1;
  var keysA = Object.keys(objA),
    keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return !1;
  for (keysB = 0; keysB < keysA.length; keysB++) {
    var currentKey = keysA[keysB];
    if (
      !hasOwnProperty.call(objB, currentKey) ||
      !objectIs(objA[currentKey], objB[currentKey])
    )
      return !1;
  }
  return !0;
}
function getLeafNode(node) {
  for (; node && node.firstChild; ) node = node.firstChild;
  return node;
}
function getNodeForCharacterOffset(root, offset) {
  var node = getLeafNode(root);
  root = 0;
  for (var nodeEnd; node; ) {
    if (3 === node.nodeType) {
      nodeEnd = root + node.textContent.length;
      if (root <= offset && nodeEnd >= offset)
        return { node: node, offset: offset - root };
      root = nodeEnd;
    }
    a: {
      for (; node; ) {
        if (node.nextSibling) {
          node = node.nextSibling;
          break a;
        }
        node = node.parentNode;
      }
      node = void 0;
    }
    node = getLeafNode(node);
  }
}
function containsNode(outerNode, innerNode) {
  return outerNode && innerNode
    ? outerNode === innerNode
      ? !0
      : outerNode && 3 === outerNode.nodeType
        ? !1
        : innerNode && 3 === innerNode.nodeType
          ? containsNode(outerNode, innerNode.parentNode)
          : "contains" in outerNode
            ? outerNode.contains(innerNode)
            : outerNode.compareDocumentPosition
              ? !!(outerNode.compareDocumentPosition(innerNode) & 16)
              : !1
    : !1;
}
function getActiveElementDeep(containerInfo) {
  containerInfo =
    null != containerInfo &&
    null != containerInfo.ownerDocument &&
    null != containerInfo.ownerDocument.defaultView
      ? containerInfo.ownerDocument.defaultView
      : window;
  for (
    var element = getActiveElement(containerInfo.document);
    element instanceof containerInfo.HTMLIFrameElement;

  ) {
    try {
      var JSCompiler_inline_result =
        "string" === typeof element.contentWindow.location.href;
    } catch (err) {
      JSCompiler_inline_result = !1;
    }
    if (JSCompiler_inline_result) containerInfo = element.contentWindow;
    else break;
    element = getActiveElement(containerInfo.document);
  }
  return element;
}
function hasSelectionCapabilities(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  return (
    nodeName &&
    (("input" === nodeName &&
      ("text" === elem.type ||
        "search" === elem.type ||
        "tel" === elem.type ||
        "url" === elem.type ||
        "password" === elem.type)) ||
      "textarea" === nodeName ||
      "true" === elem.contentEditable)
  );
}
var skipSelectionChangeEvent =
    canUseDOM && "documentMode" in document && 11 >= document.documentMode,
  activeElement = null,
  activeElementInst = null,
  lastSelection = null,
  mouseDown = !1;
function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
  var doc =
    nativeEventTarget.window === nativeEventTarget
      ? nativeEventTarget.document
      : 9 === nativeEventTarget.nodeType
        ? nativeEventTarget
        : nativeEventTarget.ownerDocument;
  mouseDown ||
    null == activeElement ||
    activeElement !== getActiveElement(doc) ||
    ((doc = activeElement),
    "selectionStart" in doc && hasSelectionCapabilities(doc)
      ? (doc = { start: doc.selectionStart, end: doc.selectionEnd })
      : ((doc = (
          (doc.ownerDocument && doc.ownerDocument.defaultView) ||
          window
        ).getSelection()),
        (doc = {
          anchorNode: doc.anchorNode,
          anchorOffset: doc.anchorOffset,
          focusNode: doc.focusNode,
          focusOffset: doc.focusOffset
        })),
    (lastSelection && shallowEqual(lastSelection, doc)) ||
      ((lastSelection = doc),
      (doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect")),
      0 < doc.length &&
        ((nativeEvent = new SyntheticEvent(
          "onSelect",
          "select",
          null,
          nativeEvent,
          nativeEventTarget
        )),
        dispatchQueue.push({ event: nativeEvent, listeners: doc }),
        (nativeEvent.target = activeElement))));
}
function makePrefixMap(styleProp, eventName) {
  var prefixes = {};
  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes["Webkit" + styleProp] = "webkit" + eventName;
  prefixes["Moz" + styleProp] = "moz" + eventName;
  return prefixes;
}
var vendorPrefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    animationiteration: makePrefixMap("Animation", "AnimationIteration"),
    animationstart: makePrefixMap("Animation", "AnimationStart"),
    transitionrun: makePrefixMap("Transition", "TransitionRun"),
    transitionstart: makePrefixMap("Transition", "TransitionStart"),
    transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
  },
  prefixedEventNames = {},
  style = {};
canUseDOM &&
  ((style = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete vendorPrefixes.animationend.animation,
    delete vendorPrefixes.animationiteration.animation,
    delete vendorPrefixes.animationstart.animation),
  "TransitionEvent" in window ||
    delete vendorPrefixes.transitionend.transition);
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
  if (!vendorPrefixes[eventName]) return eventName;
  var prefixMap = vendorPrefixes[eventName],
    styleProp;
  for (styleProp in prefixMap)
    if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
      return (prefixedEventNames[eventName] = prefixMap[styleProp]);
  return eventName;
}
var ANIMATION_END = getVendorPrefixedEventName("animationend"),
  ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration"),
  ANIMATION_START = getVendorPrefixedEventName("animationstart"),
  TRANSITION_RUN = getVendorPrefixedEventName("transitionrun"),
  TRANSITION_START = getVendorPrefixedEventName("transitionstart"),
  TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel"),
  TRANSITION_END = getVendorPrefixedEventName("transitionend"),
  topLevelEventsToReactNames = new Map(),
  simpleEventPluginEvents =
    "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " "
    );
simpleEventPluginEvents.push("scrollEnd");
function registerSimpleEvent(domEventName, reactName) {
  topLevelEventsToReactNames.set(domEventName, reactName);
  registerTwoPhaseEvent(reactName, [domEventName]);
}
var reportGlobalError =
    "function" === typeof reportError
      ? reportError
      : function (error) {
          if (
            "object" === typeof window &&
            "function" === typeof window.ErrorEvent
          ) {
            var event = new window.ErrorEvent("error", {
              bubbles: !0,
              cancelable: !0,
              message:
                "object" === typeof error &&
                null !== error &&
                "string" === typeof error.message
                  ? String(error.message)
                  : String(error),
              error: error
            });
            if (!window.dispatchEvent(event)) return;
          } else if (
            "object" === typeof process &&
            "function" === typeof process.emit
          ) {
            process.emit("uncaughtException", error);
            return;
          }
          console.error(error);
        },
  concurrentQueues = [],
  concurrentQueuesIndex = 0,
  concurrentlyUpdatedLanes = 0;
function finishQueueingConcurrentUpdates() {
  for (
    var endIndex = concurrentQueuesIndex,
      i = (concurrentlyUpdatedLanes = concurrentQueuesIndex = 0);
    i < endIndex;

  ) {
    var fiber = concurrentQueues[i];
    concurrentQueues[i++] = null;
    var queue = concurrentQueues[i];
    concurrentQueues[i++] = null;
    var update = concurrentQueues[i];
    concurrentQueues[i++] = null;
    var lane = concurrentQueues[i];
    concurrentQueues[i++] = null;
    if (null !== queue && null !== update) {
      var pending = queue.pending;
      null === pending
        ? (update.next = update)
        : ((update.next = pending.next), (pending.next = update));
      queue.pending = update;
    }
    0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
  }
}
function enqueueUpdate$1(fiber, queue, update, lane) {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
  concurrentQueues[concurrentQueuesIndex++] = lane;
  concurrentlyUpdatedLanes |= lane;
  fiber.lanes |= lane;
  fiber = fiber.alternate;
  null !== fiber && (fiber.lanes |= lane);
}
function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
  enqueueUpdate$1(fiber, queue, update, lane);
  return getRootForUpdatedFiber(fiber);
}
function enqueueConcurrentRenderForLane(fiber, lane) {
  enqueueUpdate$1(fiber, null, null, lane);
  return getRootForUpdatedFiber(fiber);
}
function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
  sourceFiber.lanes |= lane;
  var alternate = sourceFiber.alternate;
  null !== alternate && (alternate.lanes |= lane);
  for (var isHidden = !1, parent = sourceFiber.return; null !== parent; )
    (parent.childLanes |= lane),
      (alternate = parent.alternate),
      null !== alternate && (alternate.childLanes |= lane),
      22 === parent.tag &&
        ((sourceFiber = parent.stateNode),
        null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = !0)),
      (sourceFiber = parent),
      (parent = parent.return);
  return 3 === sourceFiber.tag
    ? ((parent = sourceFiber.stateNode),
      isHidden &&
        null !== update &&
        ((isHidden = 31 - clz32(lane)),
        (sourceFiber = parent.hiddenUpdates),
        (alternate = sourceFiber[isHidden]),
        null === alternate
          ? (sourceFiber[isHidden] = [update])
          : alternate.push(update),
        (update.lane = lane | 536870912)),
      parent)
    : null;
}
function getRootForUpdatedFiber(sourceFiber) {
  if (50 < nestedUpdateCount)
    throw (
      ((nestedUpdateCount = 0),
      (rootWithNestedUpdates = null),
      Error(formatProdErrorMessage(185)))
    );
  for (var parent = sourceFiber.return; null !== parent; )
    (sourceFiber = parent), (parent = sourceFiber.return);
  return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
}
var emptyContextObject = {};
function FiberNode(tag, pendingProps, key, mode) {
  this.tag = tag;
  this.key = key;
  this.sibling =
    this.child =
    this.return =
    this.stateNode =
    this.type =
    this.elementType =
      null;
  this.index = 0;
  this.refCleanup = this.ref = null;
  this.pendingProps = pendingProps;
  this.dependencies =
    this.memoizedState =
    this.updateQueue =
    this.memoizedProps =
      null;
  this.mode = mode;
  this.subtreeFlags = this.flags = 0;
  this.deletions = null;
  this.childLanes = this.lanes = 0;
  this.alternate = null;
}
function createFiberImplClass(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
}
function shouldConstruct(Component) {
  Component = Component.prototype;
  return !(!Component || !Component.isReactComponent);
}
function createWorkInProgress(current, pendingProps) {
  var workInProgress = current.alternate;
  null === workInProgress
    ? ((workInProgress = createFiberImplClass(
        current.tag,
        pendingProps,
        current.key,
        current.mode
      )),
      (workInProgress.elementType = current.elementType),
      (workInProgress.type = current.type),
      (workInProgress.stateNode = current.stateNode),
      (workInProgress.alternate = current),
      (current.alternate = workInProgress))
    : ((workInProgress.pendingProps = pendingProps),
      (workInProgress.type = current.type),
      (workInProgress.flags = 0),
      (workInProgress.subtreeFlags = 0),
      (workInProgress.deletions = null));
  workInProgress.flags = current.flags & 65011712;
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  pendingProps = current.dependencies;
  workInProgress.dependencies =
    null === pendingProps
      ? null
      : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;
  workInProgress.refCleanup = current.refCleanup;
  return workInProgress;
}
function resetWorkInProgress(workInProgress, renderLanes) {
  workInProgress.flags &= 65011714;
  var current = workInProgress.alternate;
  null === current
    ? ((workInProgress.childLanes = 0),
      (workInProgress.lanes = renderLanes),
      (workInProgress.child = null),
      (workInProgress.subtreeFlags = 0),
      (workInProgress.memoizedProps = null),
      (workInProgress.memoizedState = null),
      (workInProgress.updateQueue = null),
      (workInProgress.dependencies = null),
      (workInProgress.stateNode = null))
    : ((workInProgress.childLanes = current.childLanes),
      (workInProgress.lanes = current.lanes),
      (workInProgress.child = current.child),
      (workInProgress.subtreeFlags = 0),
      (workInProgress.deletions = null),
      (workInProgress.memoizedProps = current.memoizedProps),
      (workInProgress.memoizedState = current.memoizedState),
      (workInProgress.updateQueue = current.updateQueue),
      (workInProgress.type = current.type),
      (renderLanes = current.dependencies),
      (workInProgress.dependencies =
        null === renderLanes
          ? null
          : {
              lanes: renderLanes.lanes,
              firstContext: renderLanes.firstContext
            }));
  return workInProgress;
}
function createFiberFromTypeAndProps(
  type,
  key,
  pendingProps,
  owner,
  mode,
  lanes
) {
  var fiberTag = 0;
  owner = type;
  if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1);
  else if ("string" === typeof type)
    fiberTag = isHostHoistableType(
      type,
      pendingProps,
      contextStackCursor.current
    )
      ? 26
      : "html" === type || "head" === type || "body" === type
        ? 27
        : 5;
  else
    a: switch (type) {
      case REACT_ACTIVITY_TYPE:
        return (
          (type = createFiberImplClass(31, pendingProps, key, mode)),
          (type.elementType = REACT_ACTIVITY_TYPE),
          (type.lanes = lanes),
          type
        );
      case REACT_FRAGMENT_TYPE:
        return createFiberFromFragment(pendingProps.children, mode, lanes, key);
      case REACT_STRICT_MODE_TYPE:
        fiberTag = 8;
        mode |= 24;
        break;
      case REACT_PROFILER_TYPE:
        return (
          (type = createFiberImplClass(12, pendingProps, key, mode | 2)),
          (type.elementType = REACT_PROFILER_TYPE),
          (type.lanes = lanes),
          type
        );
      case REACT_SUSPENSE_TYPE:
        return (
          (type = createFiberImplClass(13, pendingProps, key, mode)),
          (type.elementType = REACT_SUSPENSE_TYPE),
          (type.lanes = lanes),
          type
        );
      case REACT_SUSPENSE_LIST_TYPE:
        return (
          (type = createFiberImplClass(19, pendingProps, key, mode)),
          (type.elementType = REACT_SUSPENSE_LIST_TYPE),
          (type.lanes = lanes),
          type
        );
      default:
        if ("object" === typeof type && null !== type)
          switch (type.$$typeof) {
            case REACT_CONTEXT_TYPE:
              fiberTag = 10;
              break a;
            case REACT_CONSUMER_TYPE:
              fiberTag = 9;
              break a;
            case REACT_FORWARD_REF_TYPE:
              fiberTag = 11;
              break a;
            case REACT_MEMO_TYPE:
              fiberTag = 14;
              break a;
            case REACT_LAZY_TYPE:
              fiberTag = 16;
              owner = null;
              break a;
          }
        fiberTag = 29;
        pendingProps = Error(
          formatProdErrorMessage(130, null === type ? "null" : typeof type, "")
        );
        owner = null;
    }
  key = createFiberImplClass(fiberTag, pendingProps, key, mode);
  key.elementType = type;
  key.type = owner;
  key.lanes = lanes;
  return key;
}
function createFiberFromFragment(elements, mode, lanes, key) {
  elements = createFiberImplClass(7, elements, key, mode);
  elements.lanes = lanes;
  return elements;
}
function createFiberFromText(content, mode, lanes) {
  content = createFiberImplClass(6, content, null, mode);
  content.lanes = lanes;
  return content;
}
function createFiberFromDehydratedFragment(dehydratedNode) {
  var fiber = createFiberImplClass(18, null, null, 0);
  fiber.stateNode = dehydratedNode;
  return fiber;
}
function createFiberFromPortal(portal, mode, lanes) {
  mode = createFiberImplClass(
    4,
    null !== portal.children ? portal.children : [],
    portal.key,
    mode
  );
  mode.lanes = lanes;
  mode.stateNode = {
    containerInfo: portal.containerInfo,
    pendingChildren: null,
    implementation: portal.implementation
  };
  return mode;
}
var CapturedStacks = new WeakMap();
function createCapturedValueAtFiber(value, source) {
  if ("object" === typeof value && null !== value) {
    var existing = CapturedStacks.get(value);
    if (void 0 !== existing) return existing;
    source = {
      value: value,
      source: source,
      stack: getStackByFiberInDevAndProd(source)
    };
    CapturedStacks.set(value, source);
    return source;
  }
  return {
    value: value,
    source: source,
    stack: getStackByFiberInDevAndProd(source)
  };
}
var forkStack = [],
  forkStackIndex = 0,
  treeForkProvider = null,
  treeForkCount = 0,
  idStack = [],
  idStackIndex = 0,
  treeContextProvider = null,
  treeContextId = 1,
  treeContextOverflow = "";
function pushTreeFork(workInProgress, totalChildren) {
  forkStack[forkStackIndex++] = treeForkCount;
  forkStack[forkStackIndex++] = treeForkProvider;
  treeForkProvider = workInProgress;
  treeForkCount = totalChildren;
}
function pushTreeId(workInProgress, totalChildren, index) {
  idStack[idStackIndex++] = treeContextId;
  idStack[idStackIndex++] = treeContextOverflow;
  idStack[idStackIndex++] = treeContextProvider;
  treeContextProvider = workInProgress;
  var baseIdWithLeadingBit = treeContextId;
  workInProgress = treeContextOverflow;
  var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
  baseIdWithLeadingBit &= ~(1 << baseLength);
  index += 1;
  var length = 32 - clz32(totalChildren) + baseLength;
  if (30 < length) {
    var numberOfOverflowBits = baseLength - (baseLength % 5);
    length = (
      baseIdWithLeadingBit &
      ((1 << numberOfOverflowBits) - 1)
    ).toString(32);
    baseIdWithLeadingBit >>= numberOfOverflowBits;
    baseLength -= numberOfOverflowBits;
    treeContextId =
      (1 << (32 - clz32(totalChildren) + baseLength)) |
      (index << baseLength) |
      baseIdWithLeadingBit;
    treeContextOverflow = length + workInProgress;
  } else
    (treeContextId =
      (1 << length) | (index << baseLength) | baseIdWithLeadingBit),
      (treeContextOverflow = workInProgress);
}
function pushMaterializedTreeId(workInProgress) {
  null !== workInProgress.return &&
    (pushTreeFork(workInProgress, 1), pushTreeId(workInProgress, 1, 0));
}
function popTreeContext(workInProgress) {
  for (; workInProgress === treeForkProvider; )
    (treeForkProvider = forkStack[--forkStackIndex]),
      (forkStack[forkStackIndex] = null),
      (treeForkCount = forkStack[--forkStackIndex]),
      (forkStack[forkStackIndex] = null);
  for (; workInProgress === treeContextProvider; )
    (treeContextProvider = idStack[--idStackIndex]),
      (idStack[idStackIndex] = null),
      (treeContextOverflow = idStack[--idStackIndex]),
      (idStack[idStackIndex] = null),
      (treeContextId = idStack[--idStackIndex]),
      (idStack[idStackIndex] = null);
}
function restoreSuspendedTreeContext(workInProgress, suspendedContext) {
  idStack[idStackIndex++] = treeContextId;
  idStack[idStackIndex++] = treeContextOverflow;
  idStack[idStackIndex++] = treeContextProvider;
  treeContextId = suspendedContext.id;
  treeContextOverflow = suspendedContext.overflow;
  treeContextProvider = workInProgress;
}
var hydrationParentFiber = null,
  nextHydratableInstance = null,
  isHydrating = !1,
  hydrationErrors = null,
  rootOrSingletonContext = !1,
  HydrationMismatchException = Error(formatProdErrorMessage(519));
function throwOnHydrationMismatch(fiber) {
  var error = Error(
    formatProdErrorMessage(
      418,
      1 < arguments.length && void 0 !== arguments[1] && arguments[1]
        ? "text"
        : "HTML",
      ""
    )
  );
  queueHydrationError(createCapturedValueAtFiber(error, fiber));
  throw HydrationMismatchException;
}
function prepareToHydrateHostInstance(fiber) {
  var instance = fiber.stateNode,
    type = fiber.type,
    props = fiber.memoizedProps;
  instance[internalInstanceKey] = fiber;
  instance[internalPropsKey] = props;
  switch (type) {
    case "dialog":
      listenToNonDelegatedEvent("cancel", instance);
      listenToNonDelegatedEvent("close", instance);
      break;
    case "iframe":
    case "object":
    case "embed":
      listenToNonDelegatedEvent("load", instance);
      break;
    case "video":
    case "audio":
      for (type = 0; type < mediaEventTypes.length; type++)
        listenToNonDelegatedEvent(mediaEventTypes[type], instance);
      break;
    case "source":
      listenToNonDelegatedEvent("error", instance);
      break;
    case "img":
    case "image":
    case "link":
      listenToNonDelegatedEvent("error", instance);
      listenToNonDelegatedEvent("load", instance);
      break;
    case "details":
      listenToNonDelegatedEvent("toggle", instance);
      break;
    case "input":
      listenToNonDelegatedEvent("invalid", instance);
      initInput(
        instance,
        props.value,
        props.defaultValue,
        props.checked,
        props.defaultChecked,
        props.type,
        props.name,
        !0
      );
      break;
    case "select":
      listenToNonDelegatedEvent("invalid", instance);
      break;
    case "textarea":
      listenToNonDelegatedEvent("invalid", instance),
        initTextarea(instance, props.value, props.defaultValue, props.children);
  }
  type = props.children;
  ("string" !== typeof type &&
    "number" !== typeof type &&
    "bigint" !== typeof type) ||
  instance.textContent === "" + type ||
  !0 === props.suppressHydrationWarning ||
  checkForUnmatchedText(instance.textContent, type)
    ? (null != props.popover &&
        (listenToNonDelegatedEvent("beforetoggle", instance),
        listenToNonDelegatedEvent("toggle", instance)),
      null != props.onScroll && listenToNonDelegatedEvent("scroll", instance),
      null != props.onScrollEnd &&
        listenToNonDelegatedEvent("scrollend", instance),
      null != props.onClick && (instance.onclick = noop$1),
      (instance = !0))
    : (instance = !1);
  instance || throwOnHydrationMismatch(fiber, !0);
}
function popToNextHostParent(fiber) {
  for (hydrationParentFiber = fiber.return; hydrationParentFiber; )
    switch (hydrationParentFiber.tag) {
      case 5:
      case 31:
      case 13:
        rootOrSingletonContext = !1;
        return;
      case 27:
      case 3:
        rootOrSingletonContext = !0;
        return;
      default:
        hydrationParentFiber = hydrationParentFiber.return;
    }
}
function popHydrationState(fiber) {
  if (fiber !== hydrationParentFiber) return !1;
  if (!isHydrating) return popToNextHostParent(fiber), (isHydrating = !0), !1;
  var tag = fiber.tag,
    JSCompiler_temp;
  if ((JSCompiler_temp = 3 !== tag && 27 !== tag)) {
    if ((JSCompiler_temp = 5 === tag))
      (JSCompiler_temp = fiber.type),
        (JSCompiler_temp =
          !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) ||
          shouldSetTextContent(fiber.type, fiber.memoizedProps));
    JSCompiler_temp = !JSCompiler_temp;
  }
  JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
  popToNextHostParent(fiber);
  if (13 === tag) {
    fiber = fiber.memoizedState;
    fiber = null !== fiber ? fiber.dehydrated : null;
    if (!fiber) throw Error(formatProdErrorMessage(317));
    nextHydratableInstance =
      getNextHydratableInstanceAfterHydrationBoundary(fiber);
  } else if (31 === tag) {
    fiber = fiber.memoizedState;
    fiber = null !== fiber ? fiber.dehydrated : null;
    if (!fiber) throw Error(formatProdErrorMessage(317));
    nextHydratableInstance =
      getNextHydratableInstanceAfterHydrationBoundary(fiber);
  } else
    27 === tag
      ? ((tag = nextHydratableInstance),
        isSingletonScope(fiber.type)
          ? ((fiber = previousHydratableOnEnteringScopedSingleton),
            (previousHydratableOnEnteringScopedSingleton = null),
            (nextHydratableInstance = fiber))
          : (nextHydratableInstance = tag))
      : (nextHydratableInstance = hydrationParentFiber
          ? getNextHydratable(fiber.stateNode.nextSibling)
          : null);
  return !0;
}
function resetHydrationState() {
  nextHydratableInstance = hydrationParentFiber = null;
  isHydrating = !1;
}
function upgradeHydrationErrorsToRecoverable() {
  var queuedErrors = hydrationErrors;
  null !== queuedErrors &&
    (null === workInProgressRootRecoverableErrors
      ? (workInProgressRootRecoverableErrors = queuedErrors)
      : workInProgressRootRecoverableErrors.push.apply(
          workInProgressRootRecoverableErrors,
          queuedErrors
        ),
    (hydrationErrors = null));
  return queuedErrors;
}
function queueHydrationError(error) {
  null === hydrationErrors
    ? (hydrationErrors = [error])
    : hydrationErrors.push(error);
}
var valueCursor = createCursor(null),
  currentlyRenderingFiber$1 = null,
  lastContextDependency = null;
function pushProvider(providerFiber, context, nextValue) {
  push(valueCursor, context._currentValue);
  context._currentValue = nextValue;
}
function popProvider(context) {
  context._currentValue = valueCursor.current;
  pop(valueCursor);
}
function scheduleContextWorkOnParentPath(parent, renderLanes, propagationRoot) {
  for (; null !== parent; ) {
    var alternate = parent.alternate;
    (parent.childLanes & renderLanes) !== renderLanes
      ? ((parent.childLanes |= renderLanes),
        null !== alternate && (alternate.childLanes |= renderLanes))
      : null !== alternate &&
        (alternate.childLanes & renderLanes) !== renderLanes &&
        (alternate.childLanes |= renderLanes);
    if (parent === propagationRoot) break;
    parent = parent.return;
  }
}
function propagateContextChanges(
  workInProgress,
  contexts,
  renderLanes,
  forcePropagateEntireTree
) {
  var fiber = workInProgress.child;
  null !== fiber && (fiber.return = workInProgress);
  for (; null !== fiber; ) {
    var list = fiber.dependencies;
    if (null !== list) {
      var nextFiber = fiber.child;
      list = list.firstContext;
      a: for (; null !== list; ) {
        var dependency = list;
        list = fiber;
        for (var i = 0; i < contexts.length; i++)
          if (dependency.context === contexts[i]) {
            list.lanes |= renderLanes;
            dependency = list.alternate;
            null !== dependency && (dependency.lanes |= renderLanes);
            scheduleContextWorkOnParentPath(
              list.return,
              renderLanes,
              workInProgress
            );
            forcePropagateEntireTree || (nextFiber = null);
            break a;
          }
        list = dependency.next;
      }
    } else if (18 === fiber.tag) {
      nextFiber = fiber.return;
      if (null === nextFiber) throw Error(formatProdErrorMessage(341));
      nextFiber.lanes |= renderLanes;
      list = nextFiber.alternate;
      null !== list && (list.lanes |= renderLanes);
      scheduleContextWorkOnParentPath(nextFiber, renderLanes, workInProgress);
      nextFiber = null;
    } else nextFiber = fiber.child;
    if (null !== nextFiber) nextFiber.return = fiber;
    else
      for (nextFiber = fiber; null !== nextFiber; ) {
        if (nextFiber === workInProgress) {
          nextFiber = null;
          break;
        }
        fiber = nextFiber.sibling;
        if (null !== fiber) {
          fiber.return = nextFiber.return;
          nextFiber = fiber;
          break;
        }
        nextFiber = nextFiber.return;
      }
    fiber = nextFiber;
  }
}
function propagateParentContextChanges(
  current,
  workInProgress,
  renderLanes,
  forcePropagateEntireTree
) {
  current = null;
  for (
    var parent = workInProgress, isInsidePropagationBailout = !1;
    null !== parent;

  ) {
    if (!isInsidePropagationBailout)
      if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = !0;
      else if (0 !== (parent.flags & 262144)) break;
    if (10 === parent.tag) {
      var currentParent = parent.alternate;
      if (null === currentParent) throw Error(formatProdErrorMessage(387));
      currentParent = currentParent.memoizedProps;
      if (null !== currentParent) {
        var context = parent.type;
        objectIs(parent.pendingProps.value, currentParent.value) ||
          (null !== current ? current.push(context) : (current = [context]));
      }
    } else if (parent === hostTransitionProviderCursor.current) {
      currentParent = parent.alternate;
      if (null === currentParent) throw Error(formatProdErrorMessage(387));
      currentParent.memoizedState.memoizedState !==
        parent.memoizedState.memoizedState &&
        (null !== current
          ? current.push(HostTransitionContext)
          : (current = [HostTransitionContext]));
    }
    parent = parent.return;
  }
  null !== current &&
    propagateContextChanges(
      workInProgress,
      current,
      renderLanes,
      forcePropagateEntireTree
    );
  workInProgress.flags |= 262144;
}
function checkIfContextChanged(currentDependencies) {
  for (
    currentDependencies = currentDependencies.firstContext;
    null !== currentDependencies;

  ) {
    if (
      !objectIs(
        currentDependencies.context._currentValue,
        currentDependencies.memoizedValue
      )
    )
      return !0;
    currentDependencies = currentDependencies.next;
  }
  return !1;
}
function prepareToReadContext(workInProgress) {
  currentlyRenderingFiber$1 = workInProgress;
  lastContextDependency = null;
  workInProgress = workInProgress.dependencies;
  null !== workInProgress && (workInProgress.firstContext = null);
}
function readContext(context) {
  return readContextForConsumer(currentlyRenderingFiber$1, context);
}
function readContextDuringReconciliation(consumer, context) {
  null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
  return readContextForConsumer(consumer, context);
}
function readContextForConsumer(consumer, context) {
  var value = context._currentValue;
  context = { context: context, memoizedValue: value, next: null };
  if (null === lastContextDependency) {
    if (null === consumer) throw Error(formatProdErrorMessage(308));
    lastContextDependency = context;
    consumer.dependencies = { lanes: 0, firstContext: context };
    consumer.flags |= 524288;
  } else lastContextDependency = lastContextDependency.next = context;
  return value;
}
var AbortControllerLocal =
    "undefined" !== typeof AbortController
      ? AbortController
      : function () {
          var listeners = [],
            signal = (this.signal = {
              aborted: !1,
              addEventListener: function (type, listener) {
                listeners.push(listener);
              }
            });
          this.abort = function () {
            signal.aborted = !0;
            listeners.forEach(function (listener) {
              return listener();
            });
          };
        },
  scheduleCallback$2 = Scheduler.unstable_scheduleCallback,
  NormalPriority = Scheduler.unstable_NormalPriority,
  CacheContext = {
    $$typeof: REACT_CONTEXT_TYPE,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
function createCache() {
  return {
    controller: new AbortControllerLocal(),
    data: new Map(),
    refCount: 0
  };
}
function releaseCache(cache) {
  cache.refCount--;
  0 === cache.refCount &&
    scheduleCallback$2(NormalPriority, function () {
      cache.controller.abort();
    });
}
var currentEntangledListeners = null,
  currentEntangledPendingCount = 0,
  currentEntangledLane = 0,
  currentEntangledActionThenable = null;
function entangleAsyncAction(transition, thenable) {
  if (null === currentEntangledListeners) {
    var entangledListeners = (currentEntangledListeners = []);
    currentEntangledPendingCount = 0;
    currentEntangledLane = requestTransitionLane();
    currentEntangledActionThenable = {
      status: "pending",
      value: void 0,
      then: function (resolve) {
        entangledListeners.push(resolve);
      }
    };
  }
  currentEntangledPendingCount++;
  thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
  return thenable;
}
function pingEngtangledActionScope() {
  if (
    0 === --currentEntangledPendingCount &&
    null !== currentEntangledListeners
  ) {
    null !== currentEntangledActionThenable &&
      (currentEntangledActionThenable.status = "fulfilled");
    var listeners = currentEntangledListeners;
    currentEntangledListeners = null;
    currentEntangledLane = 0;
    currentEntangledActionThenable = null;
    for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
  }
}
function chainThenableValue(thenable, result) {
  var listeners = [],
    thenableWithOverride = {
      status: "pending",
      value: null,
      reason: null,
      then: function (resolve) {
        listeners.push(resolve);
      }
    };
  thenable.then(
    function () {
      thenableWithOverride.status = "fulfilled";
      thenableWithOverride.value = result;
      for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
    },
    function (error) {
      thenableWithOverride.status = "rejected";
      thenableWithOverride.reason = error;
      for (error = 0; error < listeners.length; error++)
        (0, listeners[error])(void 0);
    }
  );
  return thenableWithOverride;
}
var prevOnStartTransitionFinish = ReactSharedInternals.S;
ReactSharedInternals.S = function (transition, returnValue) {
  globalMostRecentTransitionTime = now();
  "object" === typeof returnValue &&
    null !== returnValue &&
    "function" === typeof returnValue.then &&
    entangleAsyncAction(transition, returnValue);
  null !== prevOnStartTransitionFinish &&
    prevOnStartTransitionFinish(transition, returnValue);
};
var resumedCache = createCursor(null);
function peekCacheFromPool() {
  var cacheResumedFromPreviousRender = resumedCache.current;
  return null !== cacheResumedFromPreviousRender
    ? cacheResumedFromPreviousRender
    : workInProgressRoot.pooledCache;
}
function pushTransition(offscreenWorkInProgress, prevCachePool) {
  null === prevCachePool
    ? push(resumedCache, resumedCache.current)
    : push(resumedCache, prevCachePool.pool);
}
function getSuspendedCache() {
  var cacheFromPool = peekCacheFromPool();
  return null === cacheFromPool
    ? null
    : { parent: CacheContext._currentValue, pool: cacheFromPool };
}
var SuspenseException = Error(formatProdErrorMessage(460)),
  SuspenseyCommitException = Error(formatProdErrorMessage(474)),
  SuspenseActionException = Error(formatProdErrorMessage(542)),
  noopSuspenseyCommitThenable = { then: function () {} };
function isThenableResolved(thenable) {
  thenable = thenable.status;
  return "fulfilled" === thenable || "rejected" === thenable;
}
function trackUsedThenable(thenableState, thenable, index) {
  index = thenableState[index];
  void 0 === index
    ? thenableState.push(thenable)
    : index !== thenable && (thenable.then(noop$1, noop$1), (thenable = index));
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw (
        ((thenableState = thenable.reason),
        checkIfUseWrappedInAsyncCatch(thenableState),
        thenableState)
      );
    default:
      if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
      else {
        thenableState = workInProgressRoot;
        if (null !== thenableState && 100 < thenableState.shellSuspendCounter)
          throw Error(formatProdErrorMessage(482));
        thenableState = thenable;
        thenableState.status = "pending";
        thenableState.then(
          function (fulfilledValue) {
            if ("pending" === thenable.status) {
              var fulfilledThenable = thenable;
              fulfilledThenable.status = "fulfilled";
              fulfilledThenable.value = fulfilledValue;
            }
          },
          function (error) {
            if ("pending" === thenable.status) {
              var rejectedThenable = thenable;
              rejectedThenable.status = "rejected";
              rejectedThenable.reason = error;
            }
          }
        );
      }
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw (
            ((thenableState = thenable.reason),
            checkIfUseWrappedInAsyncCatch(thenableState),
            thenableState)
          );
      }
      suspendedThenable = thenable;
      throw SuspenseException;
  }
}
function resolveLazy(lazyType) {
  try {
    var init = lazyType._init;
    return init(lazyType._payload);
  } catch (x) {
    if (null !== x && "object" === typeof x && "function" === typeof x.then)
      throw ((suspendedThenable = x), SuspenseException);
    throw x;
  }
}
var suspendedThenable = null;
function getSuspendedThenable() {
  if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
  var thenable = suspendedThenable;
  suspendedThenable = null;
  return thenable;
}
function checkIfUseWrappedInAsyncCatch(rejectedReason) {
  if (
    rejectedReason === SuspenseException ||
    rejectedReason === SuspenseActionException
  )
    throw Error(formatProdErrorMessage(483));
}
var thenableState$1 = null,
  thenableIndexCounter$1 = 0;
function unwrapThenable(thenable) {
  var index = thenableIndexCounter$1;
  thenableIndexCounter$1 += 1;
  null === thenableState$1 && (thenableState$1 = []);
  return trackUsedThenable(thenableState$1, thenable, index);
}
function coerceRef(workInProgress, element) {
  element = element.props.ref;
  workInProgress.ref = void 0 !== element ? element : null;
}
function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
  if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
    throw Error(formatProdErrorMessage(525));
  returnFiber = Object.prototype.toString.call(newChild);
  throw Error(
    formatProdErrorMessage(
      31,
      "[object Object]" === returnFiber
        ? "object with keys {" + Object.keys(newChild).join(", ") + "}"
        : returnFiber
    )
  );
}
function createChildReconciler(shouldTrackSideEffects) {
  function deleteChild(returnFiber, childToDelete) {
    if (shouldTrackSideEffects) {
      var deletions = returnFiber.deletions;
      null === deletions
        ? ((returnFiber.deletions = [childToDelete]), (returnFiber.flags |= 16))
        : deletions.push(childToDelete);
    }
  }
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) return null;
    for (; null !== currentFirstChild; )
      deleteChild(returnFiber, currentFirstChild),
        (currentFirstChild = currentFirstChild.sibling);
    return null;
  }
  function mapRemainingChildren(currentFirstChild) {
    for (var existingChildren = new Map(); null !== currentFirstChild; )
      null !== currentFirstChild.key
        ? existingChildren.set(currentFirstChild.key, currentFirstChild)
        : existingChildren.set(currentFirstChild.index, currentFirstChild),
        (currentFirstChild = currentFirstChild.sibling);
    return existingChildren;
  }
  function useFiber(fiber, pendingProps) {
    fiber = createWorkInProgress(fiber, pendingProps);
    fiber.index = 0;
    fiber.sibling = null;
    return fiber;
  }
  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects)
      return (newFiber.flags |= 1048576), lastPlacedIndex;
    newIndex = newFiber.alternate;
    if (null !== newIndex)
      return (
        (newIndex = newIndex.index),
        newIndex < lastPlacedIndex
          ? ((newFiber.flags |= 67108866), lastPlacedIndex)
          : newIndex
      );
    newFiber.flags |= 67108866;
    return lastPlacedIndex;
  }
  function placeSingleChild(newFiber) {
    shouldTrackSideEffects &&
      null === newFiber.alternate &&
      (newFiber.flags |= 67108866);
    return newFiber;
  }
  function updateTextNode(returnFiber, current, textContent, lanes) {
    if (null === current || 6 !== current.tag)
      return (
        (current = createFiberFromText(textContent, returnFiber.mode, lanes)),
        (current.return = returnFiber),
        current
      );
    current = useFiber(current, textContent);
    current.return = returnFiber;
    return current;
  }
  function updateElement(returnFiber, current, element, lanes) {
    var elementType = element.type;
    if (elementType === REACT_FRAGMENT_TYPE)
      return updateFragment(
        returnFiber,
        current,
        element.props.children,
        lanes,
        element.key
      );
    if (
      null !== current &&
      (current.elementType === elementType ||
        ("object" === typeof elementType &&
          null !== elementType &&
          elementType.$$typeof === REACT_LAZY_TYPE &&
          resolveLazy(elementType) === current.type))
    )
      return (
        (current = useFiber(current, element.props)),
        coerceRef(current, element),
        (current.return = returnFiber),
        current
      );
    current = createFiberFromTypeAndProps(
      element.type,
      element.key,
      element.props,
      null,
      returnFiber.mode,
      lanes
    );
    coerceRef(current, element);
    current.return = returnFiber;
    return current;
  }
  function updatePortal(returnFiber, current, portal, lanes) {
    if (
      null === current ||
      4 !== current.tag ||
      current.stateNode.containerInfo !== portal.containerInfo ||
      current.stateNode.implementation !== portal.implementation
    )
      return (
        (current = createFiberFromPortal(portal, returnFiber.mode, lanes)),
        (current.return = returnFiber),
        current
      );
    current = useFiber(current, portal.children || []);
    current.return = returnFiber;
    return current;
  }
  function updateFragment(returnFiber, current, fragment, lanes, key) {
    if (null === current || 7 !== current.tag)
      return (
        (current = createFiberFromFragment(
          fragment,
          returnFiber.mode,
          lanes,
          key
        )),
        (current.return = returnFiber),
        current
      );
    current = useFiber(current, fragment);
    current.return = returnFiber;
    return current;
  }
  function createChild(returnFiber, newChild, lanes) {
    if (
      ("string" === typeof newChild && "" !== newChild) ||
      "number" === typeof newChild ||
      "bigint" === typeof newChild
    )
      return (
        (newChild = createFiberFromText(
          "" + newChild,
          returnFiber.mode,
          lanes
        )),
        (newChild.return = returnFiber),
        newChild
      );
    if ("object" === typeof newChild && null !== newChild) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return (
            (lanes = createFiberFromTypeAndProps(
              newChild.type,
              newChild.key,
              newChild.props,
              null,
              returnFiber.mode,
              lanes
            )),
            coerceRef(lanes, newChild),
            (lanes.return = returnFiber),
            lanes
          );
        case REACT_PORTAL_TYPE:
          return (
            (newChild = createFiberFromPortal(
              newChild,
              returnFiber.mode,
              lanes
            )),
            (newChild.return = returnFiber),
            newChild
          );
        case REACT_LAZY_TYPE:
          return (
            (newChild = resolveLazy(newChild)),
            createChild(returnFiber, newChild, lanes)
          );
      }
      if (isArrayImpl(newChild) || getIteratorFn(newChild))
        return (
          (newChild = createFiberFromFragment(
            newChild,
            returnFiber.mode,
            lanes,
            null
          )),
          (newChild.return = returnFiber),
          newChild
        );
      if ("function" === typeof newChild.then)
        return createChild(returnFiber, unwrapThenable(newChild), lanes);
      if (newChild.$$typeof === REACT_CONTEXT_TYPE)
        return createChild(
          returnFiber,
          readContextDuringReconciliation(returnFiber, newChild),
          lanes
        );
      throwOnInvalidObjectTypeImpl(returnFiber, newChild);
    }
    return null;
  }
  function updateSlot(returnFiber, oldFiber, newChild, lanes) {
    var key = null !== oldFiber ? oldFiber.key : null;
    if (
      ("string" === typeof newChild && "" !== newChild) ||
      "number" === typeof newChild ||
      "bigint" === typeof newChild
    )
      return null !== key
        ? null
        : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
    if ("object" === typeof newChild && null !== newChild) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return newChild.key === key
            ? updateElement(returnFiber, oldFiber, newChild, lanes)
            : null;
        case REACT_PORTAL_TYPE:
          return newChild.key === key
            ? updatePortal(returnFiber, oldFiber, newChild, lanes)
            : null;
        case REACT_LAZY_TYPE:
          return (
            (newChild = resolveLazy(newChild)),
            updateSlot(returnFiber, oldFiber, newChild, lanes)
          );
      }
      if (isArrayImpl(newChild) || getIteratorFn(newChild))
        return null !== key
          ? null
          : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
      if ("function" === typeof newChild.then)
        return updateSlot(
          returnFiber,
          oldFiber,
          unwrapThenable(newChild),
          lanes
        );
      if (newChild.$$typeof === REACT_CONTEXT_TYPE)
        return updateSlot(
          returnFiber,
          oldFiber,
          readContextDuringReconciliation(returnFiber, newChild),
          lanes
        );
      throwOnInvalidObjectTypeImpl(returnFiber, newChild);
    }
    return null;
  }
  function updateFromMap(
    existingChildren,
    returnFiber,
    newIdx,
    newChild,
    lanes
  ) {
    if (
      ("string" === typeof newChild && "" !== newChild) ||
      "number" === typeof newChild ||
      "bigint" === typeof newChild
    )
      return (
        (existingChildren = existingChildren.get(newIdx) || null),
        updateTextNode(returnFiber, existingChildren, "" + newChild, lanes)
      );
    if ("object" === typeof newChild && null !== newChild) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return (
            (existingChildren =
              existingChildren.get(
                null === newChild.key ? newIdx : newChild.key
              ) || null),
            updateElement(returnFiber, existingChildren, newChild, lanes)
          );
        case REACT_PORTAL_TYPE:
          return (
            (existingChildren =
              existingChildren.get(
                null === newChild.key ? newIdx : newChild.key
              ) || null),
            updatePortal(returnFiber, existingChildren, newChild, lanes)
          );
        case REACT_LAZY_TYPE:
          return (
            (newChild = resolveLazy(newChild)),
            updateFromMap(
              existingChildren,
              returnFiber,
              newIdx,
              newChild,
              lanes
            )
          );
      }
      if (isArrayImpl(newChild) || getIteratorFn(newChild))
        return (
          (existingChildren = existingChildren.get(newIdx) || null),
          updateFragment(returnFiber, existingChildren, newChild, lanes, null)
        );
      if ("function" === typeof newChild.then)
        return updateFromMap(
          existingChildren,
          returnFiber,
          newIdx,
          unwrapThenable(newChild),
          lanes
        );
      if (newChild.$$typeof === REACT_CONTEXT_TYPE)
        return updateFromMap(
          existingChildren,
          returnFiber,
          newIdx,
          readContextDuringReconciliation(returnFiber, newChild),
          lanes
        );
      throwOnInvalidObjectTypeImpl(returnFiber, newChild);
    }
    return null;
  }
  function reconcileChildrenArray(
    returnFiber,
    currentFirstChild,
    newChildren,
    lanes
  ) {
    for (
      var resultingFirstChild = null,
        previousNewFiber = null,
        oldFiber = currentFirstChild,
        newIdx = (currentFirstChild = 0),
        nextOldFiber = null;
      null !== oldFiber && newIdx < newChildren.length;
      newIdx++
    ) {
      oldFiber.index > newIdx
        ? ((nextOldFiber = oldFiber), (oldFiber = null))
        : (nextOldFiber = oldFiber.sibling);
      var newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        lanes
      );
      if (null === newFiber) {
        null === oldFiber && (oldFiber = nextOldFiber);
        break;
      }
      shouldTrackSideEffects &&
        oldFiber &&
        null === newFiber.alternate &&
        deleteChild(returnFiber, oldFiber);
      currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
      null === previousNewFiber
        ? (resultingFirstChild = newFiber)
        : (previousNewFiber.sibling = newFiber);
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    if (newIdx === newChildren.length)
      return (
        deleteRemainingChildren(returnFiber, oldFiber),
        isHydrating && pushTreeFork(returnFiber, newIdx),
        resultingFirstChild
      );
    if (null === oldFiber) {
      for (; newIdx < newChildren.length; newIdx++)
        (oldFiber = createChild(returnFiber, newChildren[newIdx], lanes)),
          null !== oldFiber &&
            ((currentFirstChild = placeChild(
              oldFiber,
              currentFirstChild,
              newIdx
            )),
            null === previousNewFiber
              ? (resultingFirstChild = oldFiber)
              : (previousNewFiber.sibling = oldFiber),
            (previousNewFiber = oldFiber));
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    for (
      oldFiber = mapRemainingChildren(oldFiber);
      newIdx < newChildren.length;
      newIdx++
    )
      (nextOldFiber = updateFromMap(
        oldFiber,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        lanes
      )),
        null !== nextOldFiber &&
          (shouldTrackSideEffects &&
            null !== nextOldFiber.alternate &&
            oldFiber.delete(
              null === nextOldFiber.key ? newIdx : nextOldFiber.key
            ),
          (currentFirstChild = placeChild(
            nextOldFiber,
            currentFirstChild,
            newIdx
          )),
          null === previousNewFiber
            ? (resultingFirstChild = nextOldFiber)
            : (previousNewFiber.sibling = nextOldFiber),
          (previousNewFiber = nextOldFiber));
    shouldTrackSideEffects &&
      oldFiber.forEach(function (child) {
        return deleteChild(returnFiber, child);
      });
    isHydrating && pushTreeFork(returnFiber, newIdx);
    return resultingFirstChild;
  }
  function reconcileChildrenIterator(
    returnFiber,
    currentFirstChild,
    newChildren,
    lanes
  ) {
    if (null == newChildren) throw Error(formatProdErrorMessage(151));
    for (
      var resultingFirstChild = null,
        previousNewFiber = null,
        oldFiber = currentFirstChild,
        newIdx = (currentFirstChild = 0),
        nextOldFiber = null,
        step = newChildren.next();
      null !== oldFiber && !step.done;
      newIdx++, step = newChildren.next()
    ) {
      oldFiber.index > newIdx
        ? ((nextOldFiber = oldFiber), (oldFiber = null))
        : (nextOldFiber = oldFiber.sibling);
      var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
      if (null === newFiber) {
        null === oldFiber && (oldFiber = nextOldFiber);
        break;
      }
      shouldTrackSideEffects &&
        oldFiber &&
        null === newFiber.alternate &&
        deleteChild(returnFiber, oldFiber);
      currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
      null === previousNewFiber
        ? (resultingFirstChild = newFiber)
        : (previousNewFiber.sibling = newFiber);
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }
    if (step.done)
      return (
        deleteRemainingChildren(returnFiber, oldFiber),
        isHydrating && pushTreeFork(returnFiber, newIdx),
        resultingFirstChild
      );
    if (null === oldFiber) {
      for (; !step.done; newIdx++, step = newChildren.next())
        (step = createChild(returnFiber, step.value, lanes)),
          null !== step &&
            ((currentFirstChild = placeChild(step, currentFirstChild, newIdx)),
            null === previousNewFiber
              ? (resultingFirstChild = step)
              : (previousNewFiber.sibling = step),
            (previousNewFiber = step));
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    for (
      oldFiber = mapRemainingChildren(oldFiber);
      !step.done;
      newIdx++, step = newChildren.next()
    )
      (step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes)),
        null !== step &&
          (shouldTrackSideEffects &&
            null !== step.alternate &&
            oldFiber.delete(null === step.key ? newIdx : step.key),
          (currentFirstChild = placeChild(step, currentFirstChild, newIdx)),
          null === previousNewFiber
            ? (resultingFirstChild = step)
            : (previousNewFiber.sibling = step),
          (previousNewFiber = step));
    shouldTrackSideEffects &&
      oldFiber.forEach(function (child) {
        return deleteChild(returnFiber, child);
      });
    isHydrating && pushTreeFork(returnFiber, newIdx);
    return resultingFirstChild;
  }
  function reconcileChildFibersImpl(
    returnFiber,
    currentFirstChild,
    newChild,
    lanes
  ) {
    "object" === typeof newChild &&
      null !== newChild &&
      newChild.type === REACT_FRAGMENT_TYPE &&
      null === newChild.key &&
      (newChild = newChild.props.children);
    if ("object" === typeof newChild && null !== newChild) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          a: {
            for (var key = newChild.key; null !== currentFirstChild; ) {
              if (currentFirstChild.key === key) {
                key = newChild.type;
                if (key === REACT_FRAGMENT_TYPE) {
                  if (7 === currentFirstChild.tag) {
                    deleteRemainingChildren(
                      returnFiber,
                      currentFirstChild.sibling
                    );
                    lanes = useFiber(
                      currentFirstChild,
                      newChild.props.children
                    );
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  }
                } else if (
                  currentFirstChild.elementType === key ||
                  ("object" === typeof key &&
                    null !== key &&
                    key.$$typeof === REACT_LAZY_TYPE &&
                    resolveLazy(key) === currentFirstChild.type)
                ) {
                  deleteRemainingChildren(
                    returnFiber,
                    currentFirstChild.sibling
                  );
                  lanes = useFiber(currentFirstChild, newChild.props);
                  coerceRef(lanes, newChild);
                  lanes.return = returnFiber;
                  returnFiber = lanes;
                  break a;
                }
                deleteRemainingChildren(returnFiber, currentFirstChild);
                break;
              } else deleteChild(returnFiber, currentFirstChild);
              currentFirstChild = currentFirstChild.sibling;
            }
            newChild.type === REACT_FRAGMENT_TYPE
              ? ((lanes = createFiberFromFragment(
                  newChild.props.children,
                  returnFiber.mode,
                  lanes,
                  newChild.key
                )),
                (lanes.return = returnFiber),
                (returnFiber = lanes))
              : ((lanes = createFiberFromTypeAndProps(
                  newChild.type,
                  newChild.key,
                  newChild.props,
                  null,
                  returnFiber.mode,
                  lanes
                )),
                coerceRef(lanes, newChild),
                (lanes.return = returnFiber),
                (returnFiber = lanes));
          }
          return placeSingleChild(returnFiber);
        case REACT_PORTAL_TYPE:
          a: {
            for (key = newChild.key; null !== currentFirstChild; ) {
              if (currentFirstChild.key === key)
                if (
                  4 === currentFirstChild.tag &&
                  currentFirstChild.stateNode.containerInfo ===
                    newChild.containerInfo &&
                  currentFirstChild.stateNode.implementation ===
                    newChild.implementation
                ) {
                  deleteRemainingChildren(
                    returnFiber,
                    currentFirstChild.sibling
                  );
                  lanes = useFiber(currentFirstChild, newChild.children || []);
                  lanes.return = returnFiber;
                  returnFiber = lanes;
                  break a;
                } else {
                  deleteRemainingChildren(returnFiber, currentFirstChild);
                  break;
                }
              else deleteChild(returnFiber, currentFirstChild);
              currentFirstChild = currentFirstChild.sibling;
            }
            lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
            lanes.return = returnFiber;
            returnFiber = lanes;
          }
          return placeSingleChild(returnFiber);
        case REACT_LAZY_TYPE:
          return (
            (newChild = resolveLazy(newChild)),
            reconcileChildFibersImpl(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            )
          );
      }
      if (isArrayImpl(newChild))
        return reconcileChildrenArray(
          returnFiber,
          currentFirstChild,
          newChild,
          lanes
        );
      if (getIteratorFn(newChild)) {
        key = getIteratorFn(newChild);
        if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
        newChild = key.call(newChild);
        return reconcileChildrenIterator(
          returnFiber,
          currentFirstChild,
          newChild,
          lanes
        );
      }
      if ("function" === typeof newChild.then)
        return reconcileChildFibersImpl(
          returnFiber,
          currentFirstChild,
          unwrapThenable(newChild),
          lanes
        );
      if (newChild.$$typeof === REACT_CONTEXT_TYPE)
        return reconcileChildFibersImpl(
          returnFiber,
          currentFirstChild,
          readContextDuringReconciliation(returnFiber, newChild),
          lanes
        );
      throwOnInvalidObjectTypeImpl(returnFiber, newChild);
    }
    return ("string" === typeof newChild && "" !== newChild) ||
      "number" === typeof newChild ||
      "bigint" === typeof newChild
      ? ((newChild = "" + newChild),
        null !== currentFirstChild && 6 === currentFirstChild.tag
          ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling),
            (lanes = useFiber(currentFirstChild, newChild)),
            (lanes.return = returnFiber),
            (returnFiber = lanes))
          : (deleteRemainingChildren(returnFiber, currentFirstChild),
            (lanes = createFiberFromText(newChild, returnFiber.mode, lanes)),
            (lanes.return = returnFiber),
            (returnFiber = lanes)),
        placeSingleChild(returnFiber))
      : deleteRemainingChildren(returnFiber, currentFirstChild);
  }
  return function (returnFiber, currentFirstChild, newChild, lanes) {
    try {
      thenableIndexCounter$1 = 0;
      var firstChildFiber = reconcileChildFibersImpl(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes
      );
      thenableState$1 = null;
      return firstChildFiber;
    } catch (x) {
      if (x === SuspenseException || x === SuspenseActionException) throw x;
      var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
      fiber.lanes = lanes;
      fiber.return = returnFiber;
      return fiber;
    } finally {
    }
  };
}
var reconcileChildFibers = createChildReconciler(!0),
  mountChildFibers = createChildReconciler(!1),
  hasForceUpdate = !1;
function initializeUpdateQueue(fiber) {
  fiber.updateQueue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, lanes: 0, hiddenCallbacks: null },
    callbacks: null
  };
}
function cloneUpdateQueue(current, workInProgress) {
  current = current.updateQueue;
  workInProgress.updateQueue === current &&
    (workInProgress.updateQueue = {
      baseState: current.baseState,
      firstBaseUpdate: current.firstBaseUpdate,
      lastBaseUpdate: current.lastBaseUpdate,
      shared: current.shared,
      callbacks: null
    });
}
function createUpdate(lane) {
  return { lane: lane, tag: 0, payload: null, callback: null, next: null };
}
function enqueueUpdate(fiber, update, lane) {
  var updateQueue = fiber.updateQueue;
  if (null === updateQueue) return null;
  updateQueue = updateQueue.shared;
  if (0 !== (executionContext & 2)) {
    var pending = updateQueue.pending;
    null === pending
      ? (update.next = update)
      : ((update.next = pending.next), (pending.next = update));
    updateQueue.pending = update;
    update = getRootForUpdatedFiber(fiber);
    markUpdateLaneFromFiberToRoot(fiber, null, lane);
    return update;
  }
  enqueueUpdate$1(fiber, updateQueue, update, lane);
  return getRootForUpdatedFiber(fiber);
}
function entangleTransitions(root, fiber, lane) {
  fiber = fiber.updateQueue;
  if (null !== fiber && ((fiber = fiber.shared), 0 !== (lane & 4194048))) {
    var queueLanes = fiber.lanes;
    queueLanes &= root.pendingLanes;
    lane |= queueLanes;
    fiber.lanes = lane;
    markRootEntangled(root, lane);
  }
}
function enqueueCapturedUpdate(workInProgress, capturedUpdate) {
  var queue = workInProgress.updateQueue,
    current = workInProgress.alternate;
  if (
    null !== current &&
    ((current = current.updateQueue), queue === current)
  ) {
    var newFirst = null,
      newLast = null;
    queue = queue.firstBaseUpdate;
    if (null !== queue) {
      do {
        var clone = {
          lane: queue.lane,
          tag: queue.tag,
          payload: queue.payload,
          callback: null,
          next: null
        };
        null === newLast
          ? (newFirst = newLast = clone)
          : (newLast = newLast.next = clone);
        queue = queue.next;
      } while (null !== queue);
      null === newLast
        ? (newFirst = newLast = capturedUpdate)
        : (newLast = newLast.next = capturedUpdate);
    } else newFirst = newLast = capturedUpdate;
    queue = {
      baseState: current.baseState,
      firstBaseUpdate: newFirst,
      lastBaseUpdate: newLast,
      shared: current.shared,
      callbacks: current.callbacks
    };
    workInProgress.updateQueue = queue;
    return;
  }
  workInProgress = queue.lastBaseUpdate;
  null === workInProgress
    ? (queue.firstBaseUpdate = capturedUpdate)
    : (workInProgress.next = capturedUpdate);
  queue.lastBaseUpdate = capturedUpdate;
}
var didReadFromEntangledAsyncAction = !1;
function suspendIfUpdateReadFromEntangledAsyncAction() {
  if (didReadFromEntangledAsyncAction) {
    var entangledActionThenable = currentEntangledActionThenable;
    if (null !== entangledActionThenable) throw entangledActionThenable;
  }
}
function processUpdateQueue(
  workInProgress$jscomp$0,
  props,
  instance$jscomp$0,
  renderLanes
) {
  didReadFromEntangledAsyncAction = !1;
  var queue = workInProgress$jscomp$0.updateQueue;
  hasForceUpdate = !1;
  var firstBaseUpdate = queue.firstBaseUpdate,
    lastBaseUpdate = queue.lastBaseUpdate,
    pendingQueue = queue.shared.pending;
  if (null !== pendingQueue) {
    queue.shared.pending = null;
    var lastPendingUpdate = pendingQueue,
      firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    null === lastBaseUpdate
      ? (firstBaseUpdate = firstPendingUpdate)
      : (lastBaseUpdate.next = firstPendingUpdate);
    lastBaseUpdate = lastPendingUpdate;
    var current = workInProgress$jscomp$0.alternate;
    null !== current &&
      ((current = current.updateQueue),
      (pendingQueue = current.lastBaseUpdate),
      pendingQueue !== lastBaseUpdate &&
        (null === pendingQueue
          ? (current.firstBaseUpdate = firstPendingUpdate)
          : (pendingQueue.next = firstPendingUpdate),
        (current.lastBaseUpdate = lastPendingUpdate)));
  }
  if (null !== firstBaseUpdate) {
    var newState = queue.baseState;
    lastBaseUpdate = 0;
    current = firstPendingUpdate = lastPendingUpdate = null;
    pendingQueue = firstBaseUpdate;
    do {
      var updateLane = pendingQueue.lane & -536870913,
        isHiddenUpdate = updateLane !== pendingQueue.lane;
      if (
        isHiddenUpdate
          ? (workInProgressRootRenderLanes & updateLane) === updateLane
          : (renderLanes & updateLane) === updateLane
      ) {
        0 !== updateLane &&
          updateLane === currentEntangledLane &&
          (didReadFromEntangledAsyncAction = !0);
        null !== current &&
          (current = current.next =
            {
              lane: 0,
              tag: pendingQueue.tag,
              payload: pendingQueue.payload,
              callback: null,
              next: null
            });
        a: {
          var workInProgress = workInProgress$jscomp$0,
            update = pendingQueue;
          updateLane = props;
          var instance = instance$jscomp$0;
          switch (update.tag) {
            case 1:
              workInProgress = update.payload;
              if ("function" === typeof workInProgress) {
                newState = workInProgress.call(instance, newState, updateLane);
                break a;
              }
              newState = workInProgress;
              break a;
            case 3:
              workInProgress.flags = (workInProgress.flags & -65537) | 128;
            case 0:
              workInProgress = update.payload;
              updateLane =
                "function" === typeof workInProgress
                  ? workInProgress.call(instance, newState, updateLane)
                  : workInProgress;
              if (null === updateLane || void 0 === updateLane) break a;
              newState = assign({}, newState, updateLane);
              break a;
            case 2:
              hasForceUpdate = !0;
          }
        }
        updateLane = pendingQueue.callback;
        null !== updateLane &&
          ((workInProgress$jscomp$0.flags |= 64),
          isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192),
          (isHiddenUpdate = queue.callbacks),
          null === isHiddenUpdate
            ? (queue.callbacks = [updateLane])
            : isHiddenUpdate.push(updateLane));
      } else
        (isHiddenUpdate = {
          lane: updateLane,
          tag: pendingQueue.tag,
          payload: pendingQueue.payload,
          callback: pendingQueue.callback,
          next: null
        }),
          null === current
            ? ((firstPendingUpdate = current = isHiddenUpdate),
              (lastPendingUpdate = newState))
            : (current = current.next = isHiddenUpdate),
          (lastBaseUpdate |= updateLane);
      pendingQueue = pendingQueue.next;
      if (null === pendingQueue)
        if (((pendingQueue = queue.shared.pending), null === pendingQueue))
          break;
        else
          (isHiddenUpdate = pendingQueue),
            (pendingQueue = isHiddenUpdate.next),
            (isHiddenUpdate.next = null),
            (queue.lastBaseUpdate = isHiddenUpdate),
            (queue.shared.pending = null);
    } while (1);
    null === current && (lastPendingUpdate = newState);
    queue.baseState = lastPendingUpdate;
    queue.firstBaseUpdate = firstPendingUpdate;
    queue.lastBaseUpdate = current;
    null === firstBaseUpdate && (queue.shared.lanes = 0);
    workInProgressRootSkippedLanes |= lastBaseUpdate;
    workInProgress$jscomp$0.lanes = lastBaseUpdate;
    workInProgress$jscomp$0.memoizedState = newState;
  }
}
function callCallback(callback, context) {
  if ("function" !== typeof callback)
    throw Error(formatProdErrorMessage(191, callback));
  callback.call(context);
}
function commitCallbacks(updateQueue, context) {
  var callbacks = updateQueue.callbacks;
  if (null !== callbacks)
    for (
      updateQueue.callbacks = null, updateQueue = 0;
      updateQueue < callbacks.length;
      updateQueue++
    )
      callCallback(callbacks[updateQueue], context);
}
var currentTreeHiddenStackCursor = createCursor(null),
  prevEntangledRenderLanesCursor = createCursor(0);
function pushHiddenContext(fiber, context) {
  fiber = entangledRenderLanes;
  push(prevEntangledRenderLanesCursor, fiber);
  push(currentTreeHiddenStackCursor, context);
  entangledRenderLanes = fiber | context.baseLanes;
}
function reuseHiddenContextOnStack() {
  push(prevEntangledRenderLanesCursor, entangledRenderLanes);
  push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
}
function popHiddenContext() {
  entangledRenderLanes = prevEntangledRenderLanesCursor.current;
  pop(currentTreeHiddenStackCursor);
  pop(prevEntangledRenderLanesCursor);
}
var suspenseHandlerStackCursor = createCursor(null),
  shellBoundary = null;
function pushPrimaryTreeSuspenseHandler(handler) {
  var current = handler.alternate;
  push(suspenseStackCursor, suspenseStackCursor.current & 1);
  push(suspenseHandlerStackCursor, handler);
  null === shellBoundary &&
    (null === current || null !== currentTreeHiddenStackCursor.current
      ? (shellBoundary = handler)
      : null !== current.memoizedState && (shellBoundary = handler));
}
function pushDehydratedActivitySuspenseHandler(fiber) {
  push(suspenseStackCursor, suspenseStackCursor.current);
  push(suspenseHandlerStackCursor, fiber);
  null === shellBoundary && (shellBoundary = fiber);
}
function pushOffscreenSuspenseHandler(fiber) {
  22 === fiber.tag
    ? (push(suspenseStackCursor, suspenseStackCursor.current),
      push(suspenseHandlerStackCursor, fiber),
      null === shellBoundary && (shellBoundary = fiber))
    : reuseSuspenseHandlerOnStack(fiber);
}
function reuseSuspenseHandlerOnStack() {
  push(suspenseStackCursor, suspenseStackCursor.current);
  push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
}
function popSuspenseHandler(fiber) {
  pop(suspenseHandlerStackCursor);
  shellBoundary === fiber && (shellBoundary = null);
  pop(suspenseStackCursor);
}
var suspenseStackCursor = createCursor(0);
function findFirstSuspended(row) {
  for (var node = row; null !== node; ) {
    if (13 === node.tag) {
      var state = node.memoizedState;
      if (
        null !== state &&
        ((state = state.dehydrated),
        null === state ||
          isSuspenseInstancePending(state) ||
          isSuspenseInstanceFallback(state))
      )
        return node;
    } else if (
      19 === node.tag &&
      ("forwards" === node.memoizedProps.revealOrder ||
        "backwards" === node.memoizedProps.revealOrder ||
        "unstable_legacy-backwards" === node.memoizedProps.revealOrder ||
        "together" === node.memoizedProps.revealOrder)
    ) {
      if (0 !== (node.flags & 128)) return node;
    } else if (null !== node.child) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === row) break;
    for (; null === node.sibling; ) {
      if (null === node.return || node.return === row) return null;
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
  return null;
}
var renderLanes = 0,
  currentlyRenderingFiber = null,
  currentHook = null,
  workInProgressHook = null,
  didScheduleRenderPhaseUpdate = !1,
  didScheduleRenderPhaseUpdateDuringThisPass = !1,
  shouldDoubleInvokeUserFnsInHooksDEV = !1,
  localIdCounter = 0,
  thenableIndexCounter = 0,
  thenableState = null,
  globalClientIdCounter = 0;
function throwInvalidHookError() {
  throw Error(formatProdErrorMessage(321));
}
function areHookInputsEqual(nextDeps, prevDeps) {
  if (null === prevDeps) return !1;
  for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
    if (!objectIs(nextDeps[i], prevDeps[i])) return !1;
  return !0;
}
function renderWithHooks(
  current,
  workInProgress,
  Component,
  props,
  secondArg,
  nextRenderLanes
) {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = 0;
  ReactSharedInternals.H =
    null === current || null === current.memoizedState
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate;
  shouldDoubleInvokeUserFnsInHooksDEV = !1;
  nextRenderLanes = Component(props, secondArg);
  shouldDoubleInvokeUserFnsInHooksDEV = !1;
  didScheduleRenderPhaseUpdateDuringThisPass &&
    (nextRenderLanes = renderWithHooksAgain(
      workInProgress,
      Component,
      props,
      secondArg
    ));
  finishRenderingHooks(current);
  return nextRenderLanes;
}
function finishRenderingHooks(current) {
  ReactSharedInternals.H = ContextOnlyDispatcher;
  var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
  renderLanes = 0;
  workInProgressHook = currentHook = currentlyRenderingFiber = null;
  didScheduleRenderPhaseUpdate = !1;
  thenableIndexCounter = 0;
  thenableState = null;
  if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
  null === current ||
    didReceiveUpdate ||
    ((current = current.dependencies),
    null !== current &&
      checkIfContextChanged(current) &&
      (didReceiveUpdate = !0));
}
function renderWithHooksAgain(workInProgress, Component, props, secondArg) {
  currentlyRenderingFiber = workInProgress;
  var numberOfReRenders = 0;
  do {
    didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
    thenableIndexCounter = 0;
    didScheduleRenderPhaseUpdateDuringThisPass = !1;
    if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
    numberOfReRenders += 1;
    workInProgressHook = currentHook = null;
    if (null != workInProgress.updateQueue) {
      var children = workInProgress.updateQueue;
      children.lastEffect = null;
      children.events = null;
      children.stores = null;
      null != children.memoCache && (children.memoCache.index = 0);
    }
    ReactSharedInternals.H = HooksDispatcherOnRerender;
    children = Component(props, secondArg);
  } while (didScheduleRenderPhaseUpdateDuringThisPass);
  return children;
}
function TransitionAwareHostComponent() {
  var dispatcher = ReactSharedInternals.H,
    maybeThenable = dispatcher.useState()[0];
  maybeThenable =
    "function" === typeof maybeThenable.then
      ? useThenable(maybeThenable)
      : maybeThenable;
  dispatcher = dispatcher.useState()[0];
  (null !== currentHook ? currentHook.memoizedState : null) !== dispatcher &&
    (currentlyRenderingFiber.flags |= 1024);
  return maybeThenable;
}
function checkDidRenderIdHook() {
  var didRenderIdHook = 0 !== localIdCounter;
  localIdCounter = 0;
  return didRenderIdHook;
}
function bailoutHooks(current, workInProgress, lanes) {
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.flags &= -2053;
  current.lanes &= ~lanes;
}
function resetHooksOnUnwind(workInProgress) {
  if (didScheduleRenderPhaseUpdate) {
    for (
      workInProgress = workInProgress.memoizedState;
      null !== workInProgress;

    ) {
      var queue = workInProgress.queue;
      null !== queue && (queue.pending = null);
      workInProgress = workInProgress.next;
    }
    didScheduleRenderPhaseUpdate = !1;
  }
  renderLanes = 0;
  workInProgressHook = currentHook = currentlyRenderingFiber = null;
  didScheduleRenderPhaseUpdateDuringThisPass = !1;
  thenableIndexCounter = localIdCounter = 0;
  thenableState = null;
}
function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  null === workInProgressHook
    ? (currentlyRenderingFiber.memoizedState = workInProgressHook = hook)
    : (workInProgressHook = workInProgressHook.next = hook);
  return workInProgressHook;
}
function updateWorkInProgressHook() {
  if (null === currentHook) {
    var nextCurrentHook = currentlyRenderingFiber.alternate;
    nextCurrentHook =
      null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
  } else nextCurrentHook = currentHook.next;
  var nextWorkInProgressHook =
    null === workInProgressHook
      ? currentlyRenderingFiber.memoizedState
      : workInProgressHook.next;
  if (null !== nextWorkInProgressHook)
    (workInProgressHook = nextWorkInProgressHook),
      (currentHook = nextCurrentHook);
  else {
    if (null === nextCurrentHook) {
      if (null === currentlyRenderingFiber.alternate)
        throw Error(formatProdErrorMessage(467));
      throw Error(formatProdErrorMessage(310));
    }
    currentHook = nextCurrentHook;
    nextCurrentHook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null
    };
    null === workInProgressHook
      ? (currentlyRenderingFiber.memoizedState = workInProgressHook =
          nextCurrentHook)
      : (workInProgressHook = workInProgressHook.next = nextCurrentHook);
  }
  return workInProgressHook;
}
function createFunctionComponentUpdateQueue() {
  return { lastEffect: null, events: null, stores: null, memoCache: null };
}
function useThenable(thenable) {
  var index = thenableIndexCounter;
  thenableIndexCounter += 1;
  null === thenableState && (thenableState = []);
  thenable = trackUsedThenable(thenableState, thenable, index);
  index = currentlyRenderingFiber;
  null ===
    (null === workInProgressHook
      ? index.memoizedState
      : workInProgressHook.next) &&
    ((index = index.alternate),
    (ReactSharedInternals.H =
      null === index || null === index.memoizedState
        ? HooksDispatcherOnMount
        : HooksDispatcherOnUpdate));
  return thenable;
}
function use(usable) {
  if (null !== usable && "object" === typeof usable) {
    if ("function" === typeof usable.then) return useThenable(usable);
    if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
  }
  throw Error(formatProdErrorMessage(438, String(usable)));
}
function useMemoCache(size) {
  var memoCache = null,
    updateQueue = currentlyRenderingFiber.updateQueue;
  null !== updateQueue && (memoCache = updateQueue.memoCache);
  if (null == memoCache) {
    var current = currentlyRenderingFiber.alternate;
    null !== current &&
      ((current = current.updateQueue),
      null !== current &&
        ((current = current.memoCache),
        null != current &&
          (memoCache = {
            data: current.data.map(function (array) {
              return array.slice();
            }),
            index: 0
          })));
  }
  null == memoCache && (memoCache = { data: [], index: 0 });
  null === updateQueue &&
    ((updateQueue = createFunctionComponentUpdateQueue()),
    (currentlyRenderingFiber.updateQueue = updateQueue));
  updateQueue.memoCache = memoCache;
  updateQueue = memoCache.data[memoCache.index];
  if (void 0 === updateQueue)
    for (
      updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0;
      current < size;
      current++
    )
      updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
  memoCache.index++;
  return updateQueue;
}
function basicStateReducer(state, action) {
  return "function" === typeof action ? action(state) : action;
}
function updateReducer(reducer) {
  var hook = updateWorkInProgressHook();
  return updateReducerImpl(hook, currentHook, reducer);
}
function updateReducerImpl(hook, current, reducer) {
  var queue = hook.queue;
  if (null === queue) throw Error(formatProdErrorMessage(311));
  queue.lastRenderedReducer = reducer;
  var baseQueue = hook.baseQueue,
    pendingQueue = queue.pending;
  if (null !== pendingQueue) {
    if (null !== baseQueue) {
      var baseFirst = baseQueue.next;
      baseQueue.next = pendingQueue.next;
      pendingQueue.next = baseFirst;
    }
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }
  pendingQueue = hook.baseState;
  if (null === baseQueue) hook.memoizedState = pendingQueue;
  else {
    current = baseQueue.next;
    var newBaseQueueFirst = (baseFirst = null),
      newBaseQueueLast = null,
      update = current,
      didReadFromEntangledAsyncAction$60 = !1;
    do {
      var updateLane = update.lane & -536870913;
      if (
        updateLane !== update.lane
          ? (workInProgressRootRenderLanes & updateLane) === updateLane
          : (renderLanes & updateLane) === updateLane
      ) {
        var revertLane = update.revertLane;
        if (0 === revertLane)
          null !== newBaseQueueLast &&
            (newBaseQueueLast = newBaseQueueLast.next =
              {
                lane: 0,
                revertLane: 0,
                gesture: null,
                action: update.action,
                hasEagerState: update.hasEagerState,
                eagerState: update.eagerState,
                next: null
              }),
            updateLane === currentEntangledLane &&
              (didReadFromEntangledAsyncAction$60 = !0);
        else if ((renderLanes & revertLane) === revertLane) {
          update = update.next;
          revertLane === currentEntangledLane &&
            (didReadFromEntangledAsyncAction$60 = !0);
          continue;
        } else
          (updateLane = {
            lane: 0,
            revertLane: update.revertLane,
            gesture: null,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null
          }),
            null === newBaseQueueLast
              ? ((newBaseQueueFirst = newBaseQueueLast = updateLane),
                (baseFirst = pendingQueue))
              : (newBaseQueueLast = newBaseQueueLast.next = updateLane),
            (currentlyRenderingFiber.lanes |= revertLane),
            (workInProgressRootSkippedLanes |= revertLane);
        updateLane = update.action;
        shouldDoubleInvokeUserFnsInHooksDEV &&
          reducer(pendingQueue, updateLane);
        pendingQueue = update.hasEagerState
          ? update.eagerState
          : reducer(pendingQueue, updateLane);
      } else
        (revertLane = {
          lane: updateLane,
          revertLane: update.revertLane,
          gesture: update.gesture,
          action: update.action,
          hasEagerState: update.hasEagerState,
          eagerState: update.eagerState,
          next: null
        }),
          null === newBaseQueueLast
            ? ((newBaseQueueFirst = newBaseQueueLast = revertLane),
              (baseFirst = pendingQueue))
            : (newBaseQueueLast = newBaseQueueLast.next = revertLane),
          (currentlyRenderingFiber.lanes |= updateLane),
          (workInProgressRootSkippedLanes |= updateLane);
      update = update.next;
    } while (null !== update && update !== current);
    null === newBaseQueueLast
      ? (baseFirst = pendingQueue)
      : (newBaseQueueLast.next = newBaseQueueFirst);
    if (
      !objectIs(pendingQueue, hook.memoizedState) &&
      ((didReceiveUpdate = !0),
      didReadFromEntangledAsyncAction$60 &&
        ((reducer = currentEntangledActionThenable), null !== reducer))
    )
      throw reducer;
    hook.memoizedState = pendingQueue;
    hook.baseState = baseFirst;
    hook.baseQueue = newBaseQueueLast;
    queue.lastRenderedState = pendingQueue;
  }
  null === baseQueue && (queue.lanes = 0);
  return [hook.memoizedState, queue.dispatch];
}
function rerenderReducer(reducer) {
  var hook = updateWorkInProgressHook(),
    queue = hook.queue;
  if (null === queue) throw Error(formatProdErrorMessage(311));
  queue.lastRenderedReducer = reducer;
  var dispatch = queue.dispatch,
    lastRenderPhaseUpdate = queue.pending,
    newState = hook.memoizedState;
  if (null !== lastRenderPhaseUpdate) {
    queue.pending = null;
    var update = (lastRenderPhaseUpdate = lastRenderPhaseUpdate.next);
    do (newState = reducer(newState, update.action)), (update = update.next);
    while (update !== lastRenderPhaseUpdate);
    objectIs(newState, hook.memoizedState) || (didReceiveUpdate = !0);
    hook.memoizedState = newState;
    null === hook.baseQueue && (hook.baseState = newState);
    queue.lastRenderedState = newState;
  }
  return [newState, dispatch];
}
function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  var fiber = currentlyRenderingFiber,
    hook = updateWorkInProgressHook(),
    isHydrating$jscomp$0 = isHydrating;
  if (isHydrating$jscomp$0) {
    if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
    getServerSnapshot = getServerSnapshot();
  } else getServerSnapshot = getSnapshot();
  var snapshotChanged = !objectIs(
    (currentHook || hook).memoizedState,
    getServerSnapshot
  );
  snapshotChanged &&
    ((hook.memoizedState = getServerSnapshot), (didReceiveUpdate = !0));
  hook = hook.queue;
  updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [
    subscribe
  ]);
  if (
    hook.getSnapshot !== getSnapshot ||
    snapshotChanged ||
    (null !== workInProgressHook && workInProgressHook.memoizedState.tag & 1)
  ) {
    fiber.flags |= 2048;
    pushSimpleEffect(
      9,
      { destroy: void 0 },
      updateStoreInstance.bind(
        null,
        fiber,
        hook,
        getServerSnapshot,
        getSnapshot
      ),
      null
    );
    if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
    isHydrating$jscomp$0 ||
      0 !== (renderLanes & 127) ||
      pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
  }
  return getServerSnapshot;
}
function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
  fiber.flags |= 16384;
  fiber = { getSnapshot: getSnapshot, value: renderedSnapshot };
  getSnapshot = currentlyRenderingFiber.updateQueue;
  null === getSnapshot
    ? ((getSnapshot = createFunctionComponentUpdateQueue()),
      (currentlyRenderingFiber.updateQueue = getSnapshot),
      (getSnapshot.stores = [fiber]))
    : ((renderedSnapshot = getSnapshot.stores),
      null === renderedSnapshot
        ? (getSnapshot.stores = [fiber])
        : renderedSnapshot.push(fiber));
}
function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
  inst.value = nextSnapshot;
  inst.getSnapshot = getSnapshot;
  checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
}
function subscribeToStore(fiber, inst, subscribe) {
  return subscribe(function () {
    checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
  });
}
function checkIfSnapshotChanged(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  inst = inst.value;
  try {
    var nextValue = latestGetSnapshot();
    return !objectIs(inst, nextValue);
  } catch (error) {
    return !0;
  }
}
function forceStoreRerender(fiber) {
  var root = enqueueConcurrentRenderForLane(fiber, 2);
  null !== root && scheduleUpdateOnFiber(root, fiber, 2);
}
function mountStateImpl(initialState) {
  var hook = mountWorkInProgressHook();
  if ("function" === typeof initialState) {
    var initialStateInitializer = initialState;
    initialState = initialStateInitializer();
    if (shouldDoubleInvokeUserFnsInHooksDEV) {
      setIsStrictModeForDevtools(!0);
      try {
        initialStateInitializer();
      } finally {
        setIsStrictModeForDevtools(!1);
      }
    }
  }
  hook.memoizedState = hook.baseState = initialState;
  hook.queue = {
    pending: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  return hook;
}
function updateOptimisticImpl(hook, current, passthrough, reducer) {
  hook.baseState = passthrough;
  return updateReducerImpl(
    hook,
    currentHook,
    "function" === typeof reducer ? reducer : basicStateReducer
  );
}
function dispatchActionState(
  fiber,
  actionQueue,
  setPendingState,
  setState,
  payload
) {
  if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
  fiber = actionQueue.action;
  if (null !== fiber) {
    var actionNode = {
      payload: payload,
      action: fiber,
      next: null,
      isTransition: !0,
      status: "pending",
      value: null,
      reason: null,
      listeners: [],
      then: function (listener) {
        actionNode.listeners.push(listener);
      }
    };
    null !== ReactSharedInternals.T
      ? setPendingState(!0)
      : (actionNode.isTransition = !1);
    setState(actionNode);
    setPendingState = actionQueue.pending;
    null === setPendingState
      ? ((actionNode.next = actionQueue.pending = actionNode),
        runActionStateAction(actionQueue, actionNode))
      : ((actionNode.next = setPendingState.next),
        (actionQueue.pending = setPendingState.next = actionNode));
  }
}
function runActionStateAction(actionQueue, node) {
  var action = node.action,
    payload = node.payload,
    prevState = actionQueue.state;
  if (node.isTransition) {
    var prevTransition = ReactSharedInternals.T,
      currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
      var returnValue = action(prevState, payload),
        onStartTransitionFinish = ReactSharedInternals.S;
      null !== onStartTransitionFinish &&
        onStartTransitionFinish(currentTransition, returnValue);
      handleActionReturnValue(actionQueue, node, returnValue);
    } catch (error) {
      onActionError(actionQueue, node, error);
    } finally {
      null !== prevTransition &&
        null !== currentTransition.types &&
        (prevTransition.types = currentTransition.types),
        (ReactSharedInternals.T = prevTransition);
    }
  } else
    try {
      (prevTransition = action(prevState, payload)),
        handleActionReturnValue(actionQueue, node, prevTransition);
    } catch (error$66) {
      onActionError(actionQueue, node, error$66);
    }
}
function handleActionReturnValue(actionQueue, node, returnValue) {
  null !== returnValue &&
  "object" === typeof returnValue &&
  "function" === typeof returnValue.then
    ? returnValue.then(
        function (nextState) {
          onActionSuccess(actionQueue, node, nextState);
        },
        function (error) {
          return onActionError(actionQueue, node, error);
        }
      )
    : onActionSuccess(actionQueue, node, returnValue);
}
function onActionSuccess(actionQueue, actionNode, nextState) {
  actionNode.status = "fulfilled";
  actionNode.value = nextState;
  notifyActionListeners(actionNode);
  actionQueue.state = nextState;
  actionNode = actionQueue.pending;
  null !== actionNode &&
    ((nextState = actionNode.next),
    nextState === actionNode
      ? (actionQueue.pending = null)
      : ((nextState = nextState.next),
        (actionNode.next = nextState),
        runActionStateAction(actionQueue, nextState)));
}
function onActionError(actionQueue, actionNode, error) {
  var last = actionQueue.pending;
  actionQueue.pending = null;
  if (null !== last) {
    last = last.next;
    do
      (actionNode.status = "rejected"),
        (actionNode.reason = error),
        notifyActionListeners(actionNode),
        (actionNode = actionNode.next);
    while (actionNode !== last);
  }
  actionQueue.action = null;
}
function notifyActionListeners(actionNode) {
  actionNode = actionNode.listeners;
  for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
}
function actionStateReducer(oldState, newState) {
  return newState;
}
function mountActionState(action, initialStateProp) {
  if (isHydrating) {
    var ssrFormState = workInProgressRoot.formState;
    if (null !== ssrFormState) {
      a: {
        var JSCompiler_inline_result = currentlyRenderingFiber;
        if (isHydrating) {
          if (nextHydratableInstance) {
            b: {
              var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
              for (
                var inRootOrSingleton = rootOrSingletonContext;
                8 !== JSCompiler_inline_result$jscomp$0.nodeType;

              ) {
                if (!inRootOrSingleton) {
                  JSCompiler_inline_result$jscomp$0 = null;
                  break b;
                }
                JSCompiler_inline_result$jscomp$0 = getNextHydratable(
                  JSCompiler_inline_result$jscomp$0.nextSibling
                );
                if (null === JSCompiler_inline_result$jscomp$0) {
                  JSCompiler_inline_result$jscomp$0 = null;
                  break b;
                }
              }
              inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
              JSCompiler_inline_result$jscomp$0 =
                "F!" === inRootOrSingleton || "F" === inRootOrSingleton
                  ? JSCompiler_inline_result$jscomp$0
                  : null;
            }
            if (JSCompiler_inline_result$jscomp$0) {
              nextHydratableInstance = getNextHydratable(
                JSCompiler_inline_result$jscomp$0.nextSibling
              );
              JSCompiler_inline_result =
                "F!" === JSCompiler_inline_result$jscomp$0.data;
              break a;
            }
          }
          throwOnHydrationMismatch(JSCompiler_inline_result);
        }
        JSCompiler_inline_result = !1;
      }
      JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
    }
  }
  ssrFormState = mountWorkInProgressHook();
  ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
  JSCompiler_inline_result = {
    pending: null,
    lanes: 0,
    dispatch: null,
    lastRenderedReducer: actionStateReducer,
    lastRenderedState: initialStateProp
  };
  ssrFormState.queue = JSCompiler_inline_result;
  ssrFormState = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    JSCompiler_inline_result
  );
  JSCompiler_inline_result.dispatch = ssrFormState;
  JSCompiler_inline_result = mountStateImpl(!1);
  inRootOrSingleton = dispatchOptimisticSetState.bind(
    null,
    currentlyRenderingFiber,
    !1,
    JSCompiler_inline_result.queue
  );
  JSCompiler_inline_result = mountWorkInProgressHook();
  JSCompiler_inline_result$jscomp$0 = {
    state: initialStateProp,
    dispatch: null,
    action: action,
    pending: null
  };
  JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
  ssrFormState = dispatchActionState.bind(
    null,
    currentlyRenderingFiber,
    JSCompiler_inline_result$jscomp$0,
    inRootOrSingleton,
    ssrFormState
  );
  JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
  JSCompiler_inline_result.memoizedState = action;
  return [initialStateProp, ssrFormState, !1];
}
function updateActionState(action) {
  var stateHook = updateWorkInProgressHook();
  return updateActionStateImpl(stateHook, currentHook, action);
}
function updateActionStateImpl(stateHook, currentStateHook, action) {
  currentStateHook = updateReducerImpl(
    stateHook,
    currentStateHook,
    actionStateReducer
  )[0];
  stateHook = updateReducer(basicStateReducer)[0];
  if (
    "object" === typeof currentStateHook &&
    null !== currentStateHook &&
    "function" === typeof currentStateHook.then
  )
    try {
      var state = useThenable(currentStateHook);
    } catch (x) {
      if (x === SuspenseException) throw SuspenseActionException;
      throw x;
    }
  else state = currentStateHook;
  currentStateHook = updateWorkInProgressHook();
  var actionQueue = currentStateHook.queue,
    dispatch = actionQueue.dispatch;
  action !== currentStateHook.memoizedState &&
    ((currentlyRenderingFiber.flags |= 2048),
    pushSimpleEffect(
      9,
      { destroy: void 0 },
      actionStateActionEffect.bind(null, actionQueue, action),
      null
    ));
  return [state, dispatch, stateHook];
}
function actionStateActionEffect(actionQueue, action) {
  actionQueue.action = action;
}
function rerenderActionState(action) {
  var stateHook = updateWorkInProgressHook(),
    currentStateHook = currentHook;
  if (null !== currentStateHook)
    return updateActionStateImpl(stateHook, currentStateHook, action);
  updateWorkInProgressHook();
  stateHook = stateHook.memoizedState;
  currentStateHook = updateWorkInProgressHook();
  var dispatch = currentStateHook.queue.dispatch;
  currentStateHook.memoizedState = action;
  return [stateHook, dispatch, !1];
}
function pushSimpleEffect(tag, inst, create, deps) {
  tag = { tag: tag, create: create, deps: deps, inst: inst, next: null };
  inst = currentlyRenderingFiber.updateQueue;
  null === inst &&
    ((inst = createFunctionComponentUpdateQueue()),
    (currentlyRenderingFiber.updateQueue = inst));
  create = inst.lastEffect;
  null === create
    ? (inst.lastEffect = tag.next = tag)
    : ((deps = create.next),
      (create.next = tag),
      (tag.next = deps),
      (inst.lastEffect = tag));
  return tag;
}
function updateRef() {
  return updateWorkInProgressHook().memoizedState;
}
function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  var hook = mountWorkInProgressHook();
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushSimpleEffect(
    1 | hookFlags,
    { destroy: void 0 },
    create,
    void 0 === deps ? null : deps
  );
}
function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  var hook = updateWorkInProgressHook();
  deps = void 0 === deps ? null : deps;
  var inst = hook.memoizedState.inst;
  null !== currentHook &&
  null !== deps &&
  areHookInputsEqual(deps, currentHook.memoizedState.deps)
    ? (hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps))
    : ((currentlyRenderingFiber.flags |= fiberFlags),
      (hook.memoizedState = pushSimpleEffect(
        1 | hookFlags,
        inst,
        create,
        deps
      )));
}
function mountEffect(create, deps) {
  mountEffectImpl(8390656, 8, create, deps);
}
function updateEffect(create, deps) {
  updateEffectImpl(2048, 8, create, deps);
}
function useEffectEventImpl(payload) {
  currentlyRenderingFiber.flags |= 4;
  var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
  if (null === componentUpdateQueue)
    (componentUpdateQueue = createFunctionComponentUpdateQueue()),
      (currentlyRenderingFiber.updateQueue = componentUpdateQueue),
      (componentUpdateQueue.events = [payload]);
  else {
    var events = componentUpdateQueue.events;
    null === events
      ? (componentUpdateQueue.events = [payload])
      : events.push(payload);
  }
}
function updateEvent(callback) {
  var ref = updateWorkInProgressHook().memoizedState;
  useEffectEventImpl({ ref: ref, nextImpl: callback });
  return function () {
    if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
    return ref.impl.apply(void 0, arguments);
  };
}
function updateInsertionEffect(create, deps) {
  return updateEffectImpl(4, 2, create, deps);
}
function updateLayoutEffect(create, deps) {
  return updateEffectImpl(4, 4, create, deps);
}
function imperativeHandleEffect(create, ref) {
  if ("function" === typeof ref) {
    create = create();
    var refCleanup = ref(create);
    return function () {
      "function" === typeof refCleanup ? refCleanup() : ref(null);
    };
  }
  if (null !== ref && void 0 !== ref)
    return (
      (create = create()),
      (ref.current = create),
      function () {
        ref.current = null;
      }
    );
}
function updateImperativeHandle(ref, create, deps) {
  deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
  updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
}
function mountDebugValue() {}
function updateCallback(callback, deps) {
  var hook = updateWorkInProgressHook();
  deps = void 0 === deps ? null : deps;
  var prevState = hook.memoizedState;
  if (null !== deps && areHookInputsEqual(deps, prevState[1]))
    return prevState[0];
  hook.memoizedState = [callback, deps];
  return callback;
}
function updateMemo(nextCreate, deps) {
  var hook = updateWorkInProgressHook();
  deps = void 0 === deps ? null : deps;
  var prevState = hook.memoizedState;
  if (null !== deps && areHookInputsEqual(deps, prevState[1]))
    return prevState[0];
  prevState = nextCreate();
  if (shouldDoubleInvokeUserFnsInHooksDEV) {
    setIsStrictModeForDevtools(!0);
    try {
      nextCreate();
    } finally {
      setIsStrictModeForDevtools(!1);
    }
  }
  hook.memoizedState = [prevState, deps];
  return prevState;
}
function mountDeferredValueImpl(hook, value, initialValue) {
  if (
    void 0 === initialValue ||
    (0 !== (renderLanes & 1073741824) &&
      0 === (workInProgressRootRenderLanes & 261930))
  )
    return (hook.memoizedState = value);
  hook.memoizedState = initialValue;
  hook = requestDeferredLane();
  currentlyRenderingFiber.lanes |= hook;
  workInProgressRootSkippedLanes |= hook;
  return initialValue;
}
function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
  if (objectIs(value, prevValue)) return value;
  if (null !== currentTreeHiddenStackCursor.current)
    return (
      (hook = mountDeferredValueImpl(hook, value, initialValue)),
      objectIs(hook, prevValue) || (didReceiveUpdate = !0),
      hook
    );
  if (
    0 === (renderLanes & 42) ||
    (0 !== (renderLanes & 1073741824) &&
      0 === (workInProgressRootRenderLanes & 261930))
  )
    return (didReceiveUpdate = !0), (hook.memoizedState = value);
  hook = requestDeferredLane();
  currentlyRenderingFiber.lanes |= hook;
  workInProgressRootSkippedLanes |= hook;
  return prevValue;
}
function startTransition(fiber, queue, pendingState, finishedState, callback) {
  var previousPriority = ReactDOMSharedInternals.p;
  ReactDOMSharedInternals.p =
    0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
  var prevTransition = ReactSharedInternals.T,
    currentTransition = {};
  ReactSharedInternals.T = currentTransition;
  dispatchOptimisticSetState(fiber, !1, queue, pendingState);
  try {
    var returnValue = callback(),
      onStartTransitionFinish = ReactSharedInternals.S;
    null !== onStartTransitionFinish &&
      onStartTransitionFinish(currentTransition, returnValue);
    if (
      null !== returnValue &&
      "object" === typeof returnValue &&
      "function" === typeof returnValue.then
    ) {
      var thenableForFinishedState = chainThenableValue(
        returnValue,
        finishedState
      );
      dispatchSetStateInternal(
        fiber,
        queue,
        thenableForFinishedState,
        requestUpdateLane(fiber)
      );
    } else
      dispatchSetStateInternal(
        fiber,
        queue,
        finishedState,
        requestUpdateLane(fiber)
      );
  } catch (error) {
    dispatchSetStateInternal(
      fiber,
      queue,
      { then: function () {}, status: "rejected", reason: error },
      requestUpdateLane()
    );
  } finally {
    (ReactDOMSharedInternals.p = previousPriority),
      null !== prevTransition &&
        null !== currentTransition.types &&
        (prevTransition.types = currentTransition.types),
      (ReactSharedInternals.T = prevTransition);
  }
}
function noop() {}
function startHostTransition(formFiber, pendingState, action, formData) {
  if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
  var queue = ensureFormComponentIsStateful(formFiber).queue;
  startTransition(
    formFiber,
    queue,
    pendingState,
    sharedNotPendingObject,
    null === action
      ? noop
      : function () {
          requestFormReset$1(formFiber);
          return action(formData);
        }
  );
}
function ensureFormComponentIsStateful(formFiber) {
  var existingStateHook = formFiber.memoizedState;
  if (null !== existingStateHook) return existingStateHook;
  existingStateHook = {
    memoizedState: sharedNotPendingObject,
    baseState: sharedNotPendingObject,
    baseQueue: null,
    queue: {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: sharedNotPendingObject
    },
    next: null
  };
  var initialResetState = {};
  existingStateHook.next = {
    memoizedState: initialResetState,
    baseState: initialResetState,
    baseQueue: null,
    queue: {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: initialResetState
    },
    next: null
  };
  formFiber.memoizedState = existingStateHook;
  formFiber = formFiber.alternate;
  null !== formFiber && (formFiber.memoizedState = existingStateHook);
  return existingStateHook;
}
function requestFormReset$1(formFiber) {
  var stateHook = ensureFormComponentIsStateful(formFiber);
  null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
  dispatchSetStateInternal(
    formFiber,
    stateHook.next.queue,
    {},
    requestUpdateLane()
  );
}
function useHostTransitionStatus() {
  return readContext(HostTransitionContext);
}
function updateId() {
  return updateWorkInProgressHook().memoizedState;
}
function updateRefresh() {
  return updateWorkInProgressHook().memoizedState;
}
function refreshCache(fiber) {
  for (var provider = fiber.return; null !== provider; ) {
    switch (provider.tag) {
      case 24:
      case 3:
        var lane = requestUpdateLane();
        fiber = createUpdate(lane);
        var root$69 = enqueueUpdate(provider, fiber, lane);
        null !== root$69 &&
          (scheduleUpdateOnFiber(root$69, provider, lane),
          entangleTransitions(root$69, provider, lane));
        provider = { cache: createCache() };
        fiber.payload = provider;
        return;
    }
    provider = provider.return;
  }
}
function dispatchReducerAction(fiber, queue, action) {
  var lane = requestUpdateLane();
  action = {
    lane: lane,
    revertLane: 0,
    gesture: null,
    action: action,
    hasEagerState: !1,
    eagerState: null,
    next: null
  };
  isRenderPhaseUpdate(fiber)
    ? enqueueRenderPhaseUpdate(queue, action)
    : ((action = enqueueConcurrentHookUpdate(fiber, queue, action, lane)),
      null !== action &&
        (scheduleUpdateOnFiber(action, fiber, lane),
        entangleTransitionUpdate(action, queue, lane)));
}
function dispatchSetState(fiber, queue, action) {
  var lane = requestUpdateLane();
  dispatchSetStateInternal(fiber, queue, action, lane);
}
function dispatchSetStateInternal(fiber, queue, action, lane) {
  var update = {
    lane: lane,
    revertLane: 0,
    gesture: null,
    action: action,
    hasEagerState: !1,
    eagerState: null,
    next: null
  };
  if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
  else {
    var alternate = fiber.alternate;
    if (
      0 === fiber.lanes &&
      (null === alternate || 0 === alternate.lanes) &&
      ((alternate = queue.lastRenderedReducer), null !== alternate)
    )
      try {
        var currentState = queue.lastRenderedState,
          eagerState = alternate(currentState, action);
        update.hasEagerState = !0;
        update.eagerState = eagerState;
        if (objectIs(eagerState, currentState))
          return (
            enqueueUpdate$1(fiber, queue, update, 0),
            null === workInProgressRoot && finishQueueingConcurrentUpdates(),
            !1
          );
      } catch (error) {
      } finally {
      }
    action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
    if (null !== action)
      return (
        scheduleUpdateOnFiber(action, fiber, lane),
        entangleTransitionUpdate(action, queue, lane),
        !0
      );
  }
  return !1;
}
function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
  action = {
    lane: 2,
    revertLane: requestTransitionLane(),
    gesture: null,
    action: action,
    hasEagerState: !1,
    eagerState: null,
    next: null
  };
  if (isRenderPhaseUpdate(fiber)) {
    if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
  } else
    (throwIfDuringRender = enqueueConcurrentHookUpdate(
      fiber,
      queue,
      action,
      2
    )),
      null !== throwIfDuringRender &&
        scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
}
function isRenderPhaseUpdate(fiber) {
  var alternate = fiber.alternate;
  return (
    fiber === currentlyRenderingFiber ||
    (null !== alternate && alternate === currentlyRenderingFiber)
  );
}
function enqueueRenderPhaseUpdate(queue, update) {
  didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate =
    !0;
  var pending = queue.pending;
  null === pending
    ? (update.next = update)
    : ((update.next = pending.next), (pending.next = update));
  queue.pending = update;
}
function entangleTransitionUpdate(root, queue, lane) {
  if (0 !== (lane & 4194048)) {
    var queueLanes = queue.lanes;
    queueLanes &= root.pendingLanes;
    lane |= queueLanes;
    queue.lanes = lane;
    markRootEntangled(root, lane);
  }
}
var ContextOnlyDispatcher = {
  readContext: readContext,
  use: use,
  useCallback: throwInvalidHookError,
  useContext: throwInvalidHookError,
  useEffect: throwInvalidHookError,
  useImperativeHandle: throwInvalidHookError,
  useLayoutEffect: throwInvalidHookError,
  useInsertionEffect: throwInvalidHookError,
  useMemo: throwInvalidHookError,
  useReducer: throwInvalidHookError,
  useRef: throwInvalidHookError,
  useState: throwInvalidHookError,
  useDebugValue: throwInvalidHookError,
  useDeferredValue: throwInvalidHookError,
  useTransition: throwInvalidHookError,
  useSyncExternalStore: throwInvalidHookError,
  useId: throwInvalidHookError,
  useHostTransitionStatus: throwInvalidHookError,
  useFormState: throwInvalidHookError,
  useActionState: throwInvalidHookError,
  useOptimistic: throwInvalidHookError,
  useMemoCache: throwInvalidHookError,
  useCacheRefresh: throwInvalidHookError
};
ContextOnlyDispatcher.useEffectEvent = throwInvalidHookError;
var HooksDispatcherOnMount = {
    readContext: readContext,
    use: use,
    useCallback: function (callback, deps) {
      mountWorkInProgressHook().memoizedState = [
        callback,
        void 0 === deps ? null : deps
      ];
      return callback;
    },
    useContext: readContext,
    useEffect: mountEffect,
    useImperativeHandle: function (ref, create, deps) {
      deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
      mountEffectImpl(
        4194308,
        4,
        imperativeHandleEffect.bind(null, create, ref),
        deps
      );
    },
    useLayoutEffect: function (create, deps) {
      return mountEffectImpl(4194308, 4, create, deps);
    },
    useInsertionEffect: function (create, deps) {
      mountEffectImpl(4, 2, create, deps);
    },
    useMemo: function (nextCreate, deps) {
      var hook = mountWorkInProgressHook();
      deps = void 0 === deps ? null : deps;
      var nextValue = nextCreate();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(!0);
        try {
          nextCreate();
        } finally {
          setIsStrictModeForDevtools(!1);
        }
      }
      hook.memoizedState = [nextValue, deps];
      return nextValue;
    },
    useReducer: function (reducer, initialArg, init) {
      var hook = mountWorkInProgressHook();
      if (void 0 !== init) {
        var initialState = init(initialArg);
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(!0);
          try {
            init(initialArg);
          } finally {
            setIsStrictModeForDevtools(!1);
          }
        }
      } else initialState = initialArg;
      hook.memoizedState = hook.baseState = initialState;
      reducer = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: reducer,
        lastRenderedState: initialState
      };
      hook.queue = reducer;
      reducer = reducer.dispatch = dispatchReducerAction.bind(
        null,
        currentlyRenderingFiber,
        reducer
      );
      return [hook.memoizedState, reducer];
    },
    useRef: function (initialValue) {
      var hook = mountWorkInProgressHook();
      initialValue = { current: initialValue };
      return (hook.memoizedState = initialValue);
    },
    useState: function (initialState) {
      initialState = mountStateImpl(initialState);
      var queue = initialState.queue,
        dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
      queue.dispatch = dispatch;
      return [initialState.memoizedState, dispatch];
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function (value, initialValue) {
      var hook = mountWorkInProgressHook();
      return mountDeferredValueImpl(hook, value, initialValue);
    },
    useTransition: function () {
      var stateHook = mountStateImpl(!1);
      stateHook = startTransition.bind(
        null,
        currentlyRenderingFiber,
        stateHook.queue,
        !0,
        !1
      );
      mountWorkInProgressHook().memoizedState = stateHook;
      return [!1, stateHook];
    },
    useSyncExternalStore: function (subscribe, getSnapshot, getServerSnapshot) {
      var fiber = currentlyRenderingFiber,
        hook = mountWorkInProgressHook();
      if (isHydrating) {
        if (void 0 === getServerSnapshot)
          throw Error(formatProdErrorMessage(407));
        getServerSnapshot = getServerSnapshot();
      } else {
        getServerSnapshot = getSnapshot();
        if (null === workInProgressRoot)
          throw Error(formatProdErrorMessage(349));
        0 !== (workInProgressRootRenderLanes & 127) ||
          pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
      }
      hook.memoizedState = getServerSnapshot;
      var inst = { value: getServerSnapshot, getSnapshot: getSnapshot };
      hook.queue = inst;
      mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
        subscribe
      ]);
      fiber.flags |= 2048;
      pushSimpleEffect(
        9,
        { destroy: void 0 },
        updateStoreInstance.bind(
          null,
          fiber,
          inst,
          getServerSnapshot,
          getSnapshot
        ),
        null
      );
      return getServerSnapshot;
    },
    useId: function () {
      var hook = mountWorkInProgressHook(),
        identifierPrefix = workInProgressRoot.identifierPrefix;
      if (isHydrating) {
        var JSCompiler_inline_result = treeContextOverflow;
        var idWithLeadingBit = treeContextId;
        JSCompiler_inline_result =
          (
            idWithLeadingBit & ~(1 << (32 - clz32(idWithLeadingBit) - 1))
          ).toString(32) + JSCompiler_inline_result;
        identifierPrefix =
          "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
        JSCompiler_inline_result = localIdCounter++;
        0 < JSCompiler_inline_result &&
          (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
        identifierPrefix += "_";
      } else
        (JSCompiler_inline_result = globalClientIdCounter++),
          (identifierPrefix =
            "_" +
            identifierPrefix +
            "r_" +
            JSCompiler_inline_result.toString(32) +
            "_");
      return (hook.memoizedState = identifierPrefix);
    },
    useHostTransitionStatus: useHostTransitionStatus,
    useFormState: mountActionState,
    useActionState: mountActionState,
    useOptimistic: function (passthrough) {
      var hook = mountWorkInProgressHook();
      hook.memoizedState = hook.baseState = passthrough;
      var queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      hook.queue = queue;
      hook = dispatchOptimisticSetState.bind(
        null,
        currentlyRenderingFiber,
        !0,
        queue
      );
      queue.dispatch = hook;
      return [passthrough, hook];
    },
    useMemoCache: useMemoCache,
    useCacheRefresh: function () {
      return (mountWorkInProgressHook().memoizedState = refreshCache.bind(
        null,
        currentlyRenderingFiber
      ));
    },
    useEffectEvent: function (callback) {
      var hook = mountWorkInProgressHook(),
        ref = { impl: callback };
      hook.memoizedState = ref;
      return function () {
        if (0 !== (executionContext & 2))
          throw Error(formatProdErrorMessage(440));
        return ref.impl.apply(void 0, arguments);
      };
    }
  },
  HooksDispatcherOnUpdate = {
    readContext: readContext,
    use: use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: updateReducer,
    useRef: updateRef,
    useState: function () {
      return updateReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function (value, initialValue) {
      var hook = updateWorkInProgressHook();
      return updateDeferredValueImpl(
        hook,
        currentHook.memoizedState,
        value,
        initialValue
      );
    },
    useTransition: function () {
      var booleanOrThenable = updateReducer(basicStateReducer)[0],
        start = updateWorkInProgressHook().memoizedState;
      return [
        "boolean" === typeof booleanOrThenable
          ? booleanOrThenable
          : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus: useHostTransitionStatus,
    useFormState: updateActionState,
    useActionState: updateActionState,
    useOptimistic: function (passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
    },
    useMemoCache: useMemoCache,
    useCacheRefresh: updateRefresh
  };
HooksDispatcherOnUpdate.useEffectEvent = updateEvent;
var HooksDispatcherOnRerender = {
  readContext: readContext,
  use: use,
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useInsertionEffect: updateInsertionEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: rerenderReducer,
  useRef: updateRef,
  useState: function () {
    return rerenderReducer(basicStateReducer);
  },
  useDebugValue: mountDebugValue,
  useDeferredValue: function (value, initialValue) {
    var hook = updateWorkInProgressHook();
    return null === currentHook
      ? mountDeferredValueImpl(hook, value, initialValue)
      : updateDeferredValueImpl(
          hook,
          currentHook.memoizedState,
          value,
          initialValue
        );
  },
  useTransition: function () {
    var booleanOrThenable = rerenderReducer(basicStateReducer)[0],
      start = updateWorkInProgressHook().memoizedState;
    return [
      "boolean" === typeof booleanOrThenable
        ? booleanOrThenable
        : useThenable(booleanOrThenable),
      start
    ];
  },
  useSyncExternalStore: updateSyncExternalStore,
  useId: updateId,
  useHostTransitionStatus: useHostTransitionStatus,
  useFormState: rerenderActionState,
  useActionState: rerenderActionState,
  useOptimistic: function (passthrough, reducer) {
    var hook = updateWorkInProgressHook();
    if (null !== currentHook)
      return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
    hook.baseState = passthrough;
    return [passthrough, hook.queue.dispatch];
  },
  useMemoCache: useMemoCache,
  useCacheRefresh: updateRefresh
};
HooksDispatcherOnRerender.useEffectEvent = updateEvent;
function applyDerivedStateFromProps(
  workInProgress,
  ctor,
  getDerivedStateFromProps,
  nextProps
) {
  ctor = workInProgress.memoizedState;
  getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
  getDerivedStateFromProps =
    null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps
      ? ctor
      : assign({}, ctor, getDerivedStateFromProps);
  workInProgress.memoizedState = getDerivedStateFromProps;
  0 === workInProgress.lanes &&
    (workInProgress.updateQueue.baseState = getDerivedStateFromProps);
}
var classComponentUpdater = {
  enqueueSetState: function (inst, payload, callback) {
    inst = inst._reactInternals;
    var lane = requestUpdateLane(),
      update = createUpdate(lane);
    update.payload = payload;
    void 0 !== callback && null !== callback && (update.callback = callback);
    payload = enqueueUpdate(inst, update, lane);
    null !== payload &&
      (scheduleUpdateOnFiber(payload, inst, lane),
      entangleTransitions(payload, inst, lane));
  },
  enqueueReplaceState: function (inst, payload, callback) {
    inst = inst._reactInternals;
    var lane = requestUpdateLane(),
      update = createUpdate(lane);
    update.tag = 1;
    update.payload = payload;
    void 0 !== callback && null !== callback && (update.callback = callback);
    payload = enqueueUpdate(inst, update, lane);
    null !== payload &&
      (scheduleUpdateOnFiber(payload, inst, lane),
      entangleTransitions(payload, inst, lane));
  },
  enqueueForceUpdate: function (inst, callback) {
    inst = inst._reactInternals;
    var lane = requestUpdateLane(),
      update = createUpdate(lane);
    update.tag = 2;
    void 0 !== callback && null !== callback && (update.callback = callback);
    callback = enqueueUpdate(inst, update, lane);
    null !== callback &&
      (scheduleUpdateOnFiber(callback, inst, lane),
      entangleTransitions(callback, inst, lane));
  }
};
function checkShouldComponentUpdate(
  workInProgress,
  ctor,
  oldProps,
  newProps,
  oldState,
  newState,
  nextContext
) {
  workInProgress = workInProgress.stateNode;
  return "function" === typeof workInProgress.shouldComponentUpdate
    ? workInProgress.shouldComponentUpdate(newProps, newState, nextContext)
    : ctor.prototype && ctor.prototype.isPureReactComponent
      ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
      : !0;
}
function callComponentWillReceiveProps(
  workInProgress,
  instance,
  newProps,
  nextContext
) {
  workInProgress = instance.state;
  "function" === typeof instance.componentWillReceiveProps &&
    instance.componentWillReceiveProps(newProps, nextContext);
  "function" === typeof instance.UNSAFE_componentWillReceiveProps &&
    instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
  instance.state !== workInProgress &&
    classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
}
function resolveClassComponentProps(Component, baseProps) {
  var newProps = baseProps;
  if ("ref" in baseProps) {
    newProps = {};
    for (var propName in baseProps)
      "ref" !== propName && (newProps[propName] = baseProps[propName]);
  }
  if ((Component = Component.defaultProps)) {
    newProps === baseProps && (newProps = assign({}, newProps));
    for (var propName$73 in Component)
      void 0 === newProps[propName$73] &&
        (newProps[propName$73] = Component[propName$73]);
  }
  return newProps;
}
function defaultOnUncaughtError(error) {
  reportGlobalError(error);
}
function defaultOnCaughtError(error) {
  console.error(error);
}
function defaultOnRecoverableError(error) {
  reportGlobalError(error);
}
function logUncaughtError(root, errorInfo) {
  try {
    var onUncaughtError = root.onUncaughtError;
    onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
  } catch (e$74) {
    setTimeout(function () {
      throw e$74;
    });
  }
}
function logCaughtError(root, boundary, errorInfo) {
  try {
    var onCaughtError = root.onCaughtError;
    onCaughtError(errorInfo.value, {
      componentStack: errorInfo.stack,
      errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
    });
  } catch (e$75) {
    setTimeout(function () {
      throw e$75;
    });
  }
}
function createRootErrorUpdate(root, errorInfo, lane) {
  lane = createUpdate(lane);
  lane.tag = 3;
  lane.payload = { element: null };
  lane.callback = function () {
    logUncaughtError(root, errorInfo);
  };
  return lane;
}
function createClassErrorUpdate(lane) {
  lane = createUpdate(lane);
  lane.tag = 3;
  return lane;
}
function initializeClassErrorUpdate(update, root, fiber, errorInfo) {
  var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
  if ("function" === typeof getDerivedStateFromError) {
    var error = errorInfo.value;
    update.payload = function () {
      return getDerivedStateFromError(error);
    };
    update.callback = function () {
      logCaughtError(root, fiber, errorInfo);
    };
  }
  var inst = fiber.stateNode;
  null !== inst &&
    "function" === typeof inst.componentDidCatch &&
    (update.callback = function () {
      logCaughtError(root, fiber, errorInfo);
      "function" !== typeof getDerivedStateFromError &&
        (null === legacyErrorBoundariesThatAlreadyFailed
          ? (legacyErrorBoundariesThatAlreadyFailed = new Set([this]))
          : legacyErrorBoundariesThatAlreadyFailed.add(this));
      var stack = errorInfo.stack;
      this.componentDidCatch(errorInfo.value, {
        componentStack: null !== stack ? stack : ""
      });
    });
}
function throwException(
  root,
  returnFiber,
  sourceFiber,
  value,
  rootRenderLanes
) {
  sourceFiber.flags |= 32768;
  if (
    null !== value &&
    "object" === typeof value &&
    "function" === typeof value.then
  ) {
    returnFiber = sourceFiber.alternate;
    null !== returnFiber &&
      propagateParentContextChanges(
        returnFiber,
        sourceFiber,
        rootRenderLanes,
        !0
      );
    sourceFiber = suspenseHandlerStackCursor.current;
    if (null !== sourceFiber) {
      switch (sourceFiber.tag) {
        case 31:
        case 13:
          return (
            null === shellBoundary
              ? renderDidSuspendDelayIfPossible()
              : null === sourceFiber.alternate &&
                0 === workInProgressRootExitStatus &&
                (workInProgressRootExitStatus = 3),
            (sourceFiber.flags &= -257),
            (sourceFiber.flags |= 65536),
            (sourceFiber.lanes = rootRenderLanes),
            value === noopSuspenseyCommitThenable
              ? (sourceFiber.flags |= 16384)
              : ((returnFiber = sourceFiber.updateQueue),
                null === returnFiber
                  ? (sourceFiber.updateQueue = new Set([value]))
                  : returnFiber.add(value),
                attachPingListener(root, value, rootRenderLanes)),
            !1
          );
        case 22:
          return (
            (sourceFiber.flags |= 65536),
            value === noopSuspenseyCommitThenable
              ? (sourceFiber.flags |= 16384)
              : ((returnFiber = sourceFiber.updateQueue),
                null === returnFiber
                  ? ((returnFiber = {
                      transitions: null,
                      markerInstances: null,
                      retryQueue: new Set([value])
                    }),
                    (sourceFiber.updateQueue = returnFiber))
                  : ((sourceFiber = returnFiber.retryQueue),
                    null === sourceFiber
                      ? (returnFiber.retryQueue = new Set([value]))
                      : sourceFiber.add(value)),
                attachPingListener(root, value, rootRenderLanes)),
            !1
          );
      }
      throw Error(formatProdErrorMessage(435, sourceFiber.tag));
    }
    attachPingListener(root, value, rootRenderLanes);
    renderDidSuspendDelayIfPossible();
    return !1;
  }
  if (isHydrating)
    return (
      (returnFiber = suspenseHandlerStackCursor.current),
      null !== returnFiber
        ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256),
          (returnFiber.flags |= 65536),
          (returnFiber.lanes = rootRenderLanes),
          value !== HydrationMismatchException &&
            ((root = Error(formatProdErrorMessage(422), { cause: value })),
            queueHydrationError(createCapturedValueAtFiber(root, sourceFiber))))
        : (value !== HydrationMismatchException &&
            ((returnFiber = Error(formatProdErrorMessage(423), {
              cause: value
            })),
            queueHydrationError(
              createCapturedValueAtFiber(returnFiber, sourceFiber)
            )),
          (root = root.current.alternate),
          (root.flags |= 65536),
          (rootRenderLanes &= -rootRenderLanes),
          (root.lanes |= rootRenderLanes),
          (value = createCapturedValueAtFiber(value, sourceFiber)),
          (rootRenderLanes = createRootErrorUpdate(
            root.stateNode,
            value,
            rootRenderLanes
          )),
          enqueueCapturedUpdate(root, rootRenderLanes),
          4 !== workInProgressRootExitStatus &&
            (workInProgressRootExitStatus = 2)),
      !1
    );
  var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
  wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
  null === workInProgressRootConcurrentErrors
    ? (workInProgressRootConcurrentErrors = [wrapperError])
    : workInProgressRootConcurrentErrors.push(wrapperError);
  4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
  if (null === returnFiber) return !0;
  value = createCapturedValueAtFiber(value, sourceFiber);
  sourceFiber = returnFiber;
  do {
    switch (sourceFiber.tag) {
      case 3:
        return (
          (sourceFiber.flags |= 65536),
          (root = rootRenderLanes & -rootRenderLanes),
          (sourceFiber.lanes |= root),
          (root = createRootErrorUpdate(sourceFiber.stateNode, value, root)),
          enqueueCapturedUpdate(sourceFiber, root),
          !1
        );
      case 1:
        if (
          ((returnFiber = sourceFiber.type),
          (wrapperError = sourceFiber.stateNode),
          0 === (sourceFiber.flags & 128) &&
            ("function" === typeof returnFiber.getDerivedStateFromError ||
              (null !== wrapperError &&
                "function" === typeof wrapperError.componentDidCatch &&
                (null === legacyErrorBoundariesThatAlreadyFailed ||
                  !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError)))))
        )
          return (
            (sourceFiber.flags |= 65536),
            (rootRenderLanes &= -rootRenderLanes),
            (sourceFiber.lanes |= rootRenderLanes),
            (rootRenderLanes = createClassErrorUpdate(rootRenderLanes)),
            initializeClassErrorUpdate(
              rootRenderLanes,
              root,
              sourceFiber,
              value
            ),
            enqueueCapturedUpdate(sourceFiber, rootRenderLanes),
            !1
          );
    }
    sourceFiber = sourceFiber.return;
  } while (null !== sourceFiber);
  return !1;
}
var SelectiveHydrationException = Error(formatProdErrorMessage(461)),
  didReceiveUpdate = !1;
function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
  workInProgress.child =
    null === current
      ? mountChildFibers(workInProgress, null, nextChildren, renderLanes)
      : reconcileChildFibers(
          workInProgress,
          current.child,
          nextChildren,
          renderLanes
        );
}
function updateForwardRef(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
) {
  Component = Component.render;
  var ref = workInProgress.ref;
  if ("ref" in nextProps) {
    var propsWithoutRef = {};
    for (var key in nextProps)
      "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
  } else propsWithoutRef = nextProps;
  prepareToReadContext(workInProgress);
  nextProps = renderWithHooks(
    current,
    workInProgress,
    Component,
    propsWithoutRef,
    ref,
    renderLanes
  );
  key = checkDidRenderIdHook();
  if (null !== current && !didReceiveUpdate)
    return (
      bailoutHooks(current, workInProgress, renderLanes),
      bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    );
  isHydrating && key && pushMaterializedTreeId(workInProgress);
  workInProgress.flags |= 1;
  reconcileChildren(current, workInProgress, nextProps, renderLanes);
  return workInProgress.child;
}
function updateMemoComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
) {
  if (null === current) {
    var type = Component.type;
    if (
      "function" === typeof type &&
      !shouldConstruct(type) &&
      void 0 === type.defaultProps &&
      null === Component.compare
    )
      return (
        (workInProgress.tag = 15),
        (workInProgress.type = type),
        updateSimpleMemoComponent(
          current,
          workInProgress,
          type,
          nextProps,
          renderLanes
        )
      );
    current = createFiberFromTypeAndProps(
      Component.type,
      null,
      nextProps,
      workInProgress,
      workInProgress.mode,
      renderLanes
    );
    current.ref = workInProgress.ref;
    current.return = workInProgress;
    return (workInProgress.child = current);
  }
  type = current.child;
  if (!checkScheduledUpdateOrContext(current, renderLanes)) {
    var prevProps = type.memoizedProps;
    Component = Component.compare;
    Component = null !== Component ? Component : shallowEqual;
    if (Component(prevProps, nextProps) && current.ref === workInProgress.ref)
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  workInProgress.flags |= 1;
  current = createWorkInProgress(type, nextProps);
  current.ref = workInProgress.ref;
  current.return = workInProgress;
  return (workInProgress.child = current);
}
function updateSimpleMemoComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
) {
  if (null !== current) {
    var prevProps = current.memoizedProps;
    if (
      shallowEqual(prevProps, nextProps) &&
      current.ref === workInProgress.ref
    )
      if (
        ((didReceiveUpdate = !1),
        (workInProgress.pendingProps = nextProps = prevProps),
        checkScheduledUpdateOrContext(current, renderLanes))
      )
        0 !== (current.flags & 131072) && (didReceiveUpdate = !0);
      else
        return (
          (workInProgress.lanes = current.lanes),
          bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
        );
  }
  return updateFunctionComponent(
    current,
    workInProgress,
    Component,
    nextProps,
    renderLanes
  );
}
function updateOffscreenComponent(
  current,
  workInProgress,
  renderLanes,
  nextProps
) {
  var nextChildren = nextProps.children,
    prevState = null !== current ? current.memoizedState : null;
  null === current &&
    null === workInProgress.stateNode &&
    (workInProgress.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    });
  if ("hidden" === nextProps.mode) {
    if (0 !== (workInProgress.flags & 128)) {
      prevState =
        null !== prevState ? prevState.baseLanes | renderLanes : renderLanes;
      if (null !== current) {
        nextProps = workInProgress.child = current.child;
        for (nextChildren = 0; null !== nextProps; )
          (nextChildren =
            nextChildren | nextProps.lanes | nextProps.childLanes),
            (nextProps = nextProps.sibling);
        nextProps = nextChildren & ~prevState;
      } else (nextProps = 0), (workInProgress.child = null);
      return deferHiddenOffscreenComponent(
        current,
        workInProgress,
        prevState,
        renderLanes,
        nextProps
      );
    }
    if (0 !== (renderLanes & 536870912))
      (workInProgress.memoizedState = { baseLanes: 0, cachePool: null }),
        null !== current &&
          pushTransition(
            workInProgress,
            null !== prevState ? prevState.cachePool : null
          ),
        null !== prevState
          ? pushHiddenContext(workInProgress, prevState)
          : reuseHiddenContextOnStack(),
        pushOffscreenSuspenseHandler(workInProgress);
    else
      return (
        (nextProps = workInProgress.lanes = 536870912),
        deferHiddenOffscreenComponent(
          current,
          workInProgress,
          null !== prevState ? prevState.baseLanes | renderLanes : renderLanes,
          renderLanes,
          nextProps
        )
      );
  } else
    null !== prevState
      ? (pushTransition(workInProgress, prevState.cachePool),
        pushHiddenContext(workInProgress, prevState),
        reuseSuspenseHandlerOnStack(workInProgress),
        (workInProgress.memoizedState = null))
      : (null !== current && pushTransition(workInProgress, null),
        reuseHiddenContextOnStack(),
        reuseSuspenseHandlerOnStack(workInProgress));
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
function bailoutOffscreenComponent(current, workInProgress) {
  (null !== current && 22 === current.tag) ||
    null !== workInProgress.stateNode ||
    (workInProgress.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    });
  return workInProgress.sibling;
}
function deferHiddenOffscreenComponent(
  current,
  workInProgress,
  nextBaseLanes,
  renderLanes,
  remainingChildLanes
) {
  var JSCompiler_inline_result = peekCacheFromPool();
  JSCompiler_inline_result =
    null === JSCompiler_inline_result
      ? null
      : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
  workInProgress.memoizedState = {
    baseLanes: nextBaseLanes,
    cachePool: JSCompiler_inline_result
  };
  null !== current && pushTransition(workInProgress, null);
  reuseHiddenContextOnStack();
  pushOffscreenSuspenseHandler(workInProgress);
  null !== current &&
    propagateParentContextChanges(current, workInProgress, renderLanes, !0);
  workInProgress.childLanes = remainingChildLanes;
  return null;
}
function mountActivityChildren(workInProgress, nextProps) {
  nextProps = mountWorkInProgressOffscreenFiber(
    { mode: nextProps.mode, children: nextProps.children },
    workInProgress.mode
  );
  nextProps.ref = workInProgress.ref;
  workInProgress.child = nextProps;
  nextProps.return = workInProgress;
  return nextProps;
}
function retryActivityComponentWithoutHydrating(
  current,
  workInProgress,
  renderLanes
) {
  reconcileChildFibers(workInProgress, current.child, null, renderLanes);
  current = mountActivityChildren(workInProgress, workInProgress.pendingProps);
  current.flags |= 2;
  popSuspenseHandler(workInProgress);
  workInProgress.memoizedState = null;
  return current;
}
function updateActivityComponent(current, workInProgress, renderLanes) {
  var nextProps = workInProgress.pendingProps,
    didSuspend = 0 !== (workInProgress.flags & 128);
  workInProgress.flags &= -129;
  if (null === current) {
    if (isHydrating) {
      if ("hidden" === nextProps.mode)
        return (
          (current = mountActivityChildren(workInProgress, nextProps)),
          (workInProgress.lanes = 536870912),
          bailoutOffscreenComponent(null, current)
        );
      pushDehydratedActivitySuspenseHandler(workInProgress);
      (current = nextHydratableInstance)
        ? ((current = canHydrateHydrationBoundary(
            current,
            rootOrSingletonContext
          )),
          (current = null !== current && "&" === current.data ? current : null),
          null !== current &&
            ((workInProgress.memoizedState = {
              dehydrated: current,
              treeContext:
                null !== treeContextProvider
                  ? { id: treeContextId, overflow: treeContextOverflow }
                  : null,
              retryLane: 536870912,
              hydrationErrors: null
            }),
            (renderLanes = createFiberFromDehydratedFragment(current)),
            (renderLanes.return = workInProgress),
            (workInProgress.child = renderLanes),
            (hydrationParentFiber = workInProgress),
            (nextHydratableInstance = null)))
        : (current = null);
      if (null === current) throw throwOnHydrationMismatch(workInProgress);
      workInProgress.lanes = 536870912;
      return null;
    }
    return mountActivityChildren(workInProgress, nextProps);
  }
  var prevState = current.memoizedState;
  if (null !== prevState) {
    var dehydrated = prevState.dehydrated;
    pushDehydratedActivitySuspenseHandler(workInProgress);
    if (didSuspend)
      if (workInProgress.flags & 256)
        (workInProgress.flags &= -257),
          (workInProgress = retryActivityComponentWithoutHydrating(
            current,
            workInProgress,
            renderLanes
          ));
      else if (null !== workInProgress.memoizedState)
        (workInProgress.child = current.child),
          (workInProgress.flags |= 128),
          (workInProgress = null);
      else throw Error(formatProdErrorMessage(558));
    else if (
      (didReceiveUpdate ||
        propagateParentContextChanges(current, workInProgress, renderLanes, !1),
      (didSuspend = 0 !== (renderLanes & current.childLanes)),
      didReceiveUpdate || didSuspend)
    ) {
      nextProps = workInProgressRoot;
      if (
        null !== nextProps &&
        ((dehydrated = getBumpedLaneForHydration(nextProps, renderLanes)),
        0 !== dehydrated && dehydrated !== prevState.retryLane)
      )
        throw (
          ((prevState.retryLane = dehydrated),
          enqueueConcurrentRenderForLane(current, dehydrated),
          scheduleUpdateOnFiber(nextProps, current, dehydrated),
          SelectiveHydrationException)
        );
      renderDidSuspendDelayIfPossible();
      workInProgress = retryActivityComponentWithoutHydrating(
        current,
        workInProgress,
        renderLanes
      );
    } else
      (current = prevState.treeContext),
        (nextHydratableInstance = getNextHydratable(dehydrated.nextSibling)),
        (hydrationParentFiber = workInProgress),
        (isHydrating = !0),
        (hydrationErrors = null),
        (rootOrSingletonContext = !1),
        null !== current &&
          restoreSuspendedTreeContext(workInProgress, current),
        (workInProgress = mountActivityChildren(workInProgress, nextProps)),
        (workInProgress.flags |= 4096);
    return workInProgress;
  }
  current = createWorkInProgress(current.child, {
    mode: nextProps.mode,
    children: nextProps.children
  });
  current.ref = workInProgress.ref;
  workInProgress.child = current;
  current.return = workInProgress;
  return current;
}
function markRef(current, workInProgress) {
  var ref = workInProgress.ref;
  if (null === ref)
    null !== current &&
      null !== current.ref &&
      (workInProgress.flags |= 4194816);
  else {
    if ("function" !== typeof ref && "object" !== typeof ref)
      throw Error(formatProdErrorMessage(284));
    if (null === current || current.ref !== ref)
      workInProgress.flags |= 4194816;
  }
}
function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
) {
  prepareToReadContext(workInProgress);
  Component = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
    void 0,
    renderLanes
  );
  nextProps = checkDidRenderIdHook();
  if (null !== current && !didReceiveUpdate)
    return (
      bailoutHooks(current, workInProgress, renderLanes),
      bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    );
  isHydrating && nextProps && pushMaterializedTreeId(workInProgress);
  workInProgress.flags |= 1;
  reconcileChildren(current, workInProgress, Component, renderLanes);
  return workInProgress.child;
}
function replayFunctionComponent(
  current,
  workInProgress,
  nextProps,
  Component,
  secondArg,
  renderLanes
) {
  prepareToReadContext(workInProgress);
  workInProgress.updateQueue = null;
  nextProps = renderWithHooksAgain(
    workInProgress,
    Component,
    nextProps,
    secondArg
  );
  finishRenderingHooks(current);
  Component = checkDidRenderIdHook();
  if (null !== current && !didReceiveUpdate)
    return (
      bailoutHooks(current, workInProgress, renderLanes),
      bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    );
  isHydrating && Component && pushMaterializedTreeId(workInProgress);
  workInProgress.flags |= 1;
  reconcileChildren(current, workInProgress, nextProps, renderLanes);
  return workInProgress.child;
}
function updateClassComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
) {
  prepareToReadContext(workInProgress);
  if (null === workInProgress.stateNode) {
    var context = emptyContextObject,
      contextType = Component.contextType;
    "object" === typeof contextType &&
      null !== contextType &&
      (context = readContext(contextType));
    context = new Component(nextProps, context);
    workInProgress.memoizedState =
      null !== context.state && void 0 !== context.state ? context.state : null;
    context.updater = classComponentUpdater;
    workInProgress.stateNode = context;
    context._reactInternals = workInProgress;
    context = workInProgress.stateNode;
    context.props = nextProps;
    context.state = workInProgress.memoizedState;
    context.refs = {};
    initializeUpdateQueue(workInProgress);
    contextType = Component.contextType;
    context.context =
      "object" === typeof contextType && null !== contextType
        ? readContext(contextType)
        : emptyContextObject;
    context.state = workInProgress.memoizedState;
    contextType = Component.getDerivedStateFromProps;
    "function" === typeof contextType &&
      (applyDerivedStateFromProps(
        workInProgress,
        Component,
        contextType,
        nextProps
      ),
      (context.state = workInProgress.memoizedState));
    "function" === typeof Component.getDerivedStateFromProps ||
      "function" === typeof context.getSnapshotBeforeUpdate ||
      ("function" !== typeof context.UNSAFE_componentWillMount &&
        "function" !== typeof context.componentWillMount) ||
      ((contextType = context.state),
      "function" === typeof context.componentWillMount &&
        context.componentWillMount(),
      "function" === typeof context.UNSAFE_componentWillMount &&
        context.UNSAFE_componentWillMount(),
      contextType !== context.state &&
        classComponentUpdater.enqueueReplaceState(context, context.state, null),
      processUpdateQueue(workInProgress, nextProps, context, renderLanes),
      suspendIfUpdateReadFromEntangledAsyncAction(),
      (context.state = workInProgress.memoizedState));
    "function" === typeof context.componentDidMount &&
      (workInProgress.flags |= 4194308);
    nextProps = !0;
  } else if (null === current) {
    context = workInProgress.stateNode;
    var unresolvedOldProps = workInProgress.memoizedProps,
      oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
    context.props = oldProps;
    var oldContext = context.context,
      contextType$jscomp$0 = Component.contextType;
    contextType = emptyContextObject;
    "object" === typeof contextType$jscomp$0 &&
      null !== contextType$jscomp$0 &&
      (contextType = readContext(contextType$jscomp$0));
    var getDerivedStateFromProps = Component.getDerivedStateFromProps;
    contextType$jscomp$0 =
      "function" === typeof getDerivedStateFromProps ||
      "function" === typeof context.getSnapshotBeforeUpdate;
    unresolvedOldProps = workInProgress.pendingProps !== unresolvedOldProps;
    contextType$jscomp$0 ||
      ("function" !== typeof context.UNSAFE_componentWillReceiveProps &&
        "function" !== typeof context.componentWillReceiveProps) ||
      ((unresolvedOldProps || oldContext !== contextType) &&
        callComponentWillReceiveProps(
          workInProgress,
          context,
          nextProps,
          contextType
        ));
    hasForceUpdate = !1;
    var oldState = workInProgress.memoizedState;
    context.state = oldState;
    processUpdateQueue(workInProgress, nextProps, context, renderLanes);
    suspendIfUpdateReadFromEntangledAsyncAction();
    oldContext = workInProgress.memoizedState;
    unresolvedOldProps || oldState !== oldContext || hasForceUpdate
      ? ("function" === typeof getDerivedStateFromProps &&
          (applyDerivedStateFromProps(
            workInProgress,
            Component,
            getDerivedStateFromProps,
            nextProps
          ),
          (oldContext = workInProgress.memoizedState)),
        (oldProps =
          hasForceUpdate ||
          checkShouldComponentUpdate(
            workInProgress,
            Component,
            oldProps,
            nextProps,
            oldState,
            oldContext,
            contextType
          ))
          ? (contextType$jscomp$0 ||
              ("function" !== typeof context.UNSAFE_componentWillMount &&
                "function" !== typeof context.componentWillMount) ||
              ("function" === typeof context.componentWillMount &&
                context.componentWillMount(),
              "function" === typeof context.UNSAFE_componentWillMount &&
                context.UNSAFE_componentWillMount()),
            "function" === typeof context.componentDidMount &&
              (workInProgress.flags |= 4194308))
          : ("function" === typeof context.componentDidMount &&
              (workInProgress.flags |= 4194308),
            (workInProgress.memoizedProps = nextProps),
            (workInProgress.memoizedState = oldContext)),
        (context.props = nextProps),
        (context.state = oldContext),
        (context.context = contextType),
        (nextProps = oldProps))
      : ("function" === typeof context.componentDidMount &&
          (workInProgress.flags |= 4194308),
        (nextProps = !1));
  } else {
    context = workInProgress.stateNode;
    cloneUpdateQueue(current, workInProgress);
    contextType = workInProgress.memoizedProps;
    contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
    context.props = contextType$jscomp$0;
    getDerivedStateFromProps = workInProgress.pendingProps;
    oldState = context.context;
    oldContext = Component.contextType;
    oldProps = emptyContextObject;
    "object" === typeof oldContext &&
      null !== oldContext &&
      (oldProps = readContext(oldContext));
    unresolvedOldProps = Component.getDerivedStateFromProps;
    (oldContext =
      "function" === typeof unresolvedOldProps ||
      "function" === typeof context.getSnapshotBeforeUpdate) ||
      ("function" !== typeof context.UNSAFE_componentWillReceiveProps &&
        "function" !== typeof context.componentWillReceiveProps) ||
      ((contextType !== getDerivedStateFromProps || oldState !== oldProps) &&
        callComponentWillReceiveProps(
          workInProgress,
          context,
          nextProps,
          oldProps
        ));
    hasForceUpdate = !1;
    oldState = workInProgress.memoizedState;
    context.state = oldState;
    processUpdateQueue(workInProgress, nextProps, context, renderLanes);
    suspendIfUpdateReadFromEntangledAsyncAction();
    var newState = workInProgress.memoizedState;
    contextType !== getDerivedStateFromProps ||
    oldState !== newState ||
    hasForceUpdate ||
    (null !== current &&
      null !== current.dependencies &&
      checkIfContextChanged(current.dependencies))
      ? ("function" === typeof unresolvedOldProps &&
          (applyDerivedStateFromProps(
            workInProgress,
            Component,
            unresolvedOldProps,
            nextProps
          ),
          (newState = workInProgress.memoizedState)),
        (contextType$jscomp$0 =
          hasForceUpdate ||
          checkShouldComponentUpdate(
            workInProgress,
            Component,
            contextType$jscomp$0,
            nextProps,
            oldState,
            newState,
            oldProps
          ) ||
          (null !== current &&
            null !== current.dependencies &&
            checkIfContextChanged(current.dependencies)))
          ? (oldContext ||
              ("function" !== typeof context.UNSAFE_componentWillUpdate &&
                "function" !== typeof context.componentWillUpdate) ||
              ("function" === typeof context.componentWillUpdate &&
                context.componentWillUpdate(nextProps, newState, oldProps),
              "function" === typeof context.UNSAFE_componentWillUpdate &&
                context.UNSAFE_componentWillUpdate(
                  nextProps,
                  newState,
                  oldProps
                )),
            "function" === typeof context.componentDidUpdate &&
              (workInProgress.flags |= 4),
            "function" === typeof context.getSnapshotBeforeUpdate &&
              (workInProgress.flags |= 1024))
          : ("function" !== typeof context.componentDidUpdate ||
              (contextType === current.memoizedProps &&
                oldState === current.memoizedState) ||
              (workInProgress.flags |= 4),
            "function" !== typeof context.getSnapshotBeforeUpdate ||
              (contextType === current.memoizedProps &&
                oldState === current.memoizedState) ||
              (workInProgress.flags |= 1024),
            (workInProgress.memoizedProps = nextProps),
            (workInProgress.memoizedState = newState)),
        (context.props = nextProps),
        (context.state = newState),
        (context.context = oldProps),
        (nextProps = contextType$jscomp$0))
      : ("function" !== typeof context.componentDidUpdate ||
          (contextType === current.memoizedProps &&
            oldState === current.memoizedState) ||
          (workInProgress.flags |= 4),
        "function" !== typeof context.getSnapshotBeforeUpdate ||
          (contextType === current.memoizedProps &&
            oldState === current.memoizedState) ||
          (workInProgress.flags |= 1024),
        (nextProps = !1));
  }
  context = nextProps;
  markRef(current, workInProgress);
  nextProps = 0 !== (workInProgress.flags & 128);
  context || nextProps
    ? ((context = workInProgress.stateNode),
      (Component =
        nextProps && "function" !== typeof Component.getDerivedStateFromError
          ? null
          : context.render()),
      (workInProgress.flags |= 1),
      null !== current && nextProps
        ? ((workInProgress.child = reconcileChildFibers(
            workInProgress,
            current.child,
            null,
            renderLanes
          )),
          (workInProgress.child = reconcileChildFibers(
            workInProgress,
            null,
            Component,
            renderLanes
          )))
        : reconcileChildren(current, workInProgress, Component, renderLanes),
      (workInProgress.memoizedState = context.state),
      (current = workInProgress.child))
    : (current = bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderLanes
      ));
  return current;
}
function mountHostRootWithoutHydrating(
  current,
  workInProgress,
  nextChildren,
  renderLanes
) {
  resetHydrationState();
  workInProgress.flags |= 256;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
var SUSPENDED_MARKER = {
  dehydrated: null,
  treeContext: null,
  retryLane: 0,
  hydrationErrors: null
};
function mountSuspenseOffscreenState(renderLanes) {
  return { baseLanes: renderLanes, cachePool: getSuspendedCache() };
}
function getRemainingWorkInPrimaryTree(
  current,
  primaryTreeDidDefer,
  renderLanes
) {
  current = null !== current ? current.childLanes & ~renderLanes : 0;
  primaryTreeDidDefer && (current |= workInProgressDeferredLane);
  return current;
}
function updateSuspenseComponent(current, workInProgress, renderLanes) {
  var nextProps = workInProgress.pendingProps,
    showFallback = !1,
    didSuspend = 0 !== (workInProgress.flags & 128),
    JSCompiler_temp;
  (JSCompiler_temp = didSuspend) ||
    (JSCompiler_temp =
      null !== current && null === current.memoizedState
        ? !1
        : 0 !== (suspenseStackCursor.current & 2));
  JSCompiler_temp && ((showFallback = !0), (workInProgress.flags &= -129));
  JSCompiler_temp = 0 !== (workInProgress.flags & 32);
  workInProgress.flags &= -33;
  if (null === current) {
    if (isHydrating) {
      showFallback
        ? pushPrimaryTreeSuspenseHandler(workInProgress)
        : reuseSuspenseHandlerOnStack(workInProgress);
      (current = nextHydratableInstance)
        ? ((current = canHydrateHydrationBoundary(
            current,
            rootOrSingletonContext
          )),
          (current = null !== current && "&" !== current.data ? current : null),
          null !== current &&
            ((workInProgress.memoizedState = {
              dehydrated: current,
              treeContext:
                null !== treeContextProvider
                  ? { id: treeContextId, overflow: treeContextOverflow }
                  : null,
              retryLane: 536870912,
              hydrationErrors: null
            }),
            (renderLanes = createFiberFromDehydratedFragment(current)),
            (renderLanes.return = workInProgress),
            (workInProgress.child = renderLanes),
            (hydrationParentFiber = workInProgress),
            (nextHydratableInstance = null)))
        : (current = null);
      if (null === current) throw throwOnHydrationMismatch(workInProgress);
      isSuspenseInstanceFallback(current)
        ? (workInProgress.lanes = 32)
        : (workInProgress.lanes = 536870912);
      return null;
    }
    var nextPrimaryChildren = nextProps.children;
    nextProps = nextProps.fallback;
    if (showFallback)
      return (
        reuseSuspenseHandlerOnStack(workInProgress),
        (showFallback = workInProgress.mode),
        (nextPrimaryChildren = mountWorkInProgressOffscreenFiber(
          { mode: "hidden", children: nextPrimaryChildren },
          showFallback
        )),
        (nextProps = createFiberFromFragment(
          nextProps,
          showFallback,
          renderLanes,
          null
        )),
        (nextPrimaryChildren.return = workInProgress),
        (nextProps.return = workInProgress),
        (nextPrimaryChildren.sibling = nextProps),
        (workInProgress.child = nextPrimaryChildren),
        (nextProps = workInProgress.child),
        (nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes)),
        (nextProps.childLanes = getRemainingWorkInPrimaryTree(
          current,
          JSCompiler_temp,
          renderLanes
        )),
        (workInProgress.memoizedState = SUSPENDED_MARKER),
        bailoutOffscreenComponent(null, nextProps)
      );
    pushPrimaryTreeSuspenseHandler(workInProgress);
    return mountSuspensePrimaryChildren(workInProgress, nextPrimaryChildren);
  }
  var prevState = current.memoizedState;
  if (
    null !== prevState &&
    ((nextPrimaryChildren = prevState.dehydrated), null !== nextPrimaryChildren)
  ) {
    if (didSuspend)
      workInProgress.flags & 256
        ? (pushPrimaryTreeSuspenseHandler(workInProgress),
          (workInProgress.flags &= -257),
          (workInProgress = retrySuspenseComponentWithoutHydrating(
            current,
            workInProgress,
            renderLanes
          )))
        : null !== workInProgress.memoizedState
          ? (reuseSuspenseHandlerOnStack(workInProgress),
            (workInProgress.child = current.child),
            (workInProgress.flags |= 128),
            (workInProgress = null))
          : (reuseSuspenseHandlerOnStack(workInProgress),
            (nextPrimaryChildren = nextProps.fallback),
            (showFallback = workInProgress.mode),
            (nextProps = mountWorkInProgressOffscreenFiber(
              { mode: "visible", children: nextProps.children },
              showFallback
            )),
            (nextPrimaryChildren = createFiberFromFragment(
              nextPrimaryChildren,
              showFallback,
              renderLanes,
              null
            )),
            (nextPrimaryChildren.flags |= 2),
            (nextProps.return = workInProgress),
            (nextPrimaryChildren.return = workInProgress),
            (nextProps.sibling = nextPrimaryChildren),
            (workInProgress.child = nextProps),
            reconcileChildFibers(
              workInProgress,
              current.child,
              null,
              renderLanes
            ),
            (nextProps = workInProgress.child),
            (nextProps.memoizedState =
              mountSuspenseOffscreenState(renderLanes)),
            (nextProps.childLanes = getRemainingWorkInPrimaryTree(
              current,
              JSCompiler_temp,
              renderLanes
            )),
            (workInProgress.memoizedState = SUSPENDED_MARKER),
            (workInProgress = bailoutOffscreenComponent(null, nextProps)));
    else if (
      (pushPrimaryTreeSuspenseHandler(workInProgress),
      isSuspenseInstanceFallback(nextPrimaryChildren))
    ) {
      JSCompiler_temp =
        nextPrimaryChildren.nextSibling &&
        nextPrimaryChildren.nextSibling.dataset;
      if (JSCompiler_temp) var digest = JSCompiler_temp.dgst;
      JSCompiler_temp = digest;
      nextProps = Error(formatProdErrorMessage(419));
      nextProps.stack = "";
      nextProps.digest = JSCompiler_temp;
      queueHydrationError({ value: nextProps, source: null, stack: null });
      workInProgress = retrySuspenseComponentWithoutHydrating(
        current,
        workInProgress,
        renderLanes
      );
    } else if (
      (didReceiveUpdate ||
        propagateParentContextChanges(current, workInProgress, renderLanes, !1),
      (JSCompiler_temp = 0 !== (renderLanes & current.childLanes)),
      didReceiveUpdate || JSCompiler_temp)
    ) {
      JSCompiler_temp = workInProgressRoot;
      if (
        null !== JSCompiler_temp &&
        ((nextProps = getBumpedLaneForHydration(JSCompiler_temp, renderLanes)),
        0 !== nextProps && nextProps !== prevState.retryLane)
      )
        throw (
          ((prevState.retryLane = nextProps),
          enqueueConcurrentRenderForLane(current, nextProps),
          scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps),
          SelectiveHydrationException)
        );
      isSuspenseInstancePending(nextPrimaryChildren) ||
        renderDidSuspendDelayIfPossible();
      workInProgress = retrySuspenseComponentWithoutHydrating(
        current,
        workInProgress,
        renderLanes
      );
    } else
      isSuspenseInstancePending(nextPrimaryChildren)
        ? ((workInProgress.flags |= 192),
          (workInProgress.child = current.child),
          (workInProgress = null))
        : ((current = prevState.treeContext),
          (nextHydratableInstance = getNextHydratable(
            nextPrimaryChildren.nextSibling
          )),
          (hydrationParentFiber = workInProgress),
          (isHydrating = !0),
          (hydrationErrors = null),
          (rootOrSingletonContext = !1),
          null !== current &&
            restoreSuspendedTreeContext(workInProgress, current),
          (workInProgress = mountSuspensePrimaryChildren(
            workInProgress,
            nextProps.children
          )),
          (workInProgress.flags |= 4096));
    return workInProgress;
  }
  if (showFallback)
    return (
      reuseSuspenseHandlerOnStack(workInProgress),
      (nextPrimaryChildren = nextProps.fallback),
      (showFallback = workInProgress.mode),
      (prevState = current.child),
      (digest = prevState.sibling),
      (nextProps = createWorkInProgress(prevState, {
        mode: "hidden",
        children: nextProps.children
      })),
      (nextProps.subtreeFlags = prevState.subtreeFlags & 65011712),
      null !== digest
        ? (nextPrimaryChildren = createWorkInProgress(
            digest,
            nextPrimaryChildren
          ))
        : ((nextPrimaryChildren = createFiberFromFragment(
            nextPrimaryChildren,
            showFallback,
            renderLanes,
            null
          )),
          (nextPrimaryChildren.flags |= 2)),
      (nextPrimaryChildren.return = workInProgress),
      (nextProps.return = workInProgress),
      (nextProps.sibling = nextPrimaryChildren),
      (workInProgress.child = nextProps),
      bailoutOffscreenComponent(null, nextProps),
      (nextProps = workInProgress.child),
      (nextPrimaryChildren = current.child.memoizedState),
      null === nextPrimaryChildren
        ? (nextPrimaryChildren = mountSuspenseOffscreenState(renderLanes))
        : ((showFallback = nextPrimaryChildren.cachePool),
          null !== showFallback
            ? ((prevState = CacheContext._currentValue),
              (showFallback =
                showFallback.parent !== prevState
                  ? { parent: prevState, pool: prevState }
                  : showFallback))
            : (showFallback = getSuspendedCache()),
          (nextPrimaryChildren = {
            baseLanes: nextPrimaryChildren.baseLanes | renderLanes,
            cachePool: showFallback
          })),
      (nextProps.memoizedState = nextPrimaryChildren),
      (nextProps.childLanes = getRemainingWorkInPrimaryTree(
        current,
        JSCompiler_temp,
        renderLanes
      )),
      (workInProgress.memoizedState = SUSPENDED_MARKER),
      bailoutOffscreenComponent(current.child, nextProps)
    );
  pushPrimaryTreeSuspenseHandler(workInProgress);
  renderLanes = current.child;
  current = renderLanes.sibling;
  renderLanes = createWorkInProgress(renderLanes, {
    mode: "visible",
    children: nextProps.children
  });
  renderLanes.return = workInProgress;
  renderLanes.sibling = null;
  null !== current &&
    ((JSCompiler_temp = workInProgress.deletions),
    null === JSCompiler_temp
      ? ((workInProgress.deletions = [current]), (workInProgress.flags |= 16))
      : JSCompiler_temp.push(current));
  workInProgress.child = renderLanes;
  workInProgress.memoizedState = null;
  return renderLanes;
}
function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
  primaryChildren = mountWorkInProgressOffscreenFiber(
    { mode: "visible", children: primaryChildren },
    workInProgress.mode
  );
  primaryChildren.return = workInProgress;
  return (workInProgress.child = primaryChildren);
}
function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
  offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
  offscreenProps.lanes = 0;
  return offscreenProps;
}
function retrySuspenseComponentWithoutHydrating(
  current,
  workInProgress,
  renderLanes
) {
  reconcileChildFibers(workInProgress, current.child, null, renderLanes);
  current = mountSuspensePrimaryChildren(
    workInProgress,
    workInProgress.pendingProps.children
  );
  current.flags |= 2;
  workInProgress.memoizedState = null;
  return current;
}
function scheduleSuspenseWorkOnFiber(fiber, renderLanes, propagationRoot) {
  fiber.lanes |= renderLanes;
  var alternate = fiber.alternate;
  null !== alternate && (alternate.lanes |= renderLanes);
  scheduleContextWorkOnParentPath(fiber.return, renderLanes, propagationRoot);
}
function initSuspenseListRenderState(
  workInProgress,
  isBackwards,
  tail,
  lastContentRow,
  tailMode,
  treeForkCount
) {
  var renderState = workInProgress.memoizedState;
  null === renderState
    ? (workInProgress.memoizedState = {
        isBackwards: isBackwards,
        rendering: null,
        renderingStartTime: 0,
        last: lastContentRow,
        tail: tail,
        tailMode: tailMode,
        treeForkCount: treeForkCount
      })
    : ((renderState.isBackwards = isBackwards),
      (renderState.rendering = null),
      (renderState.renderingStartTime = 0),
      (renderState.last = lastContentRow),
      (renderState.tail = tail),
      (renderState.tailMode = tailMode),
      (renderState.treeForkCount = treeForkCount));
}
function updateSuspenseListComponent(current, workInProgress, renderLanes) {
  var nextProps = workInProgress.pendingProps,
    revealOrder = nextProps.revealOrder,
    tailMode = nextProps.tail;
  nextProps = nextProps.children;
  var suspenseContext = suspenseStackCursor.current,
    shouldForceFallback = 0 !== (suspenseContext & 2);
  shouldForceFallback
    ? ((suspenseContext = (suspenseContext & 1) | 2),
      (workInProgress.flags |= 128))
    : (suspenseContext &= 1);
  push(suspenseStackCursor, suspenseContext);
  reconcileChildren(current, workInProgress, nextProps, renderLanes);
  nextProps = isHydrating ? treeForkCount : 0;
  if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128))
    a: for (current = workInProgress.child; null !== current; ) {
      if (13 === current.tag)
        null !== current.memoizedState &&
          scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
      else if (19 === current.tag)
        scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
      else if (null !== current.child) {
        current.child.return = current;
        current = current.child;
        continue;
      }
      if (current === workInProgress) break a;
      for (; null === current.sibling; ) {
        if (null === current.return || current.return === workInProgress)
          break a;
        current = current.return;
      }
      current.sibling.return = current.return;
      current = current.sibling;
    }
  switch (revealOrder) {
    case "forwards":
      renderLanes = workInProgress.child;
      for (revealOrder = null; null !== renderLanes; )
        (current = renderLanes.alternate),
          null !== current &&
            null === findFirstSuspended(current) &&
            (revealOrder = renderLanes),
          (renderLanes = renderLanes.sibling);
      renderLanes = revealOrder;
      null === renderLanes
        ? ((revealOrder = workInProgress.child), (workInProgress.child = null))
        : ((revealOrder = renderLanes.sibling), (renderLanes.sibling = null));
      initSuspenseListRenderState(
        workInProgress,
        !1,
        revealOrder,
        renderLanes,
        tailMode,
        nextProps
      );
      break;
    case "backwards":
    case "unstable_legacy-backwards":
      renderLanes = null;
      revealOrder = workInProgress.child;
      for (workInProgress.child = null; null !== revealOrder; ) {
        current = revealOrder.alternate;
        if (null !== current && null === findFirstSuspended(current)) {
          workInProgress.child = revealOrder;
          break;
        }
        current = revealOrder.sibling;
        revealOrder.sibling = renderLanes;
        renderLanes = revealOrder;
        revealOrder = current;
      }
      initSuspenseListRenderState(
        workInProgress,
        !0,
        renderLanes,
        null,
        tailMode,
        nextProps
      );
      break;
    case "together":
      initSuspenseListRenderState(
        workInProgress,
        !1,
        null,
        null,
        void 0,
        nextProps
      );
      break;
    default:
      workInProgress.memoizedState = null;
  }
  return workInProgress.child;
}
function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
  null !== current && (workInProgress.dependencies = current.dependencies);
  workInProgressRootSkippedLanes |= workInProgress.lanes;
  if (0 === (renderLanes & workInProgress.childLanes))
    if (null !== current) {
      if (
        (propagateParentContextChanges(
          current,
          workInProgress,
          renderLanes,
          !1
        ),
        0 === (renderLanes & workInProgress.childLanes))
      )
        return null;
    } else return null;
  if (null !== current && workInProgress.child !== current.child)
    throw Error(formatProdErrorMessage(153));
  if (null !== workInProgress.child) {
    current = workInProgress.child;
    renderLanes = createWorkInProgress(current, current.pendingProps);
    workInProgress.child = renderLanes;
    for (renderLanes.return = workInProgress; null !== current.sibling; )
      (current = current.sibling),
        (renderLanes = renderLanes.sibling =
          createWorkInProgress(current, current.pendingProps)),
        (renderLanes.return = workInProgress);
    renderLanes.sibling = null;
  }
  return workInProgress.child;
}
function checkScheduledUpdateOrContext(current, renderLanes) {
  if (0 !== (current.lanes & renderLanes)) return !0;
  current = current.dependencies;
  return null !== current && checkIfContextChanged(current) ? !0 : !1;
}
function attemptEarlyBailoutIfNoScheduledUpdate(
  current,
  workInProgress,
  renderLanes
) {
  switch (workInProgress.tag) {
    case 3:
      pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
      pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
      resetHydrationState();
      break;
    case 27:
    case 5:
      pushHostContext(workInProgress);
      break;
    case 4:
      pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
      break;
    case 10:
      pushProvider(
        workInProgress,
        workInProgress.type,
        workInProgress.memoizedProps.value
      );
      break;
    case 31:
      if (null !== workInProgress.memoizedState)
        return (
          (workInProgress.flags |= 128),
          pushDehydratedActivitySuspenseHandler(workInProgress),
          null
        );
      break;
    case 13:
      var state$102 = workInProgress.memoizedState;
      if (null !== state$102) {
        if (null !== state$102.dehydrated)
          return (
            pushPrimaryTreeSuspenseHandler(workInProgress),
            (workInProgress.flags |= 128),
            null
          );
        if (0 !== (renderLanes & workInProgress.child.childLanes))
          return updateSuspenseComponent(current, workInProgress, renderLanes);
        pushPrimaryTreeSuspenseHandler(workInProgress);
        current = bailoutOnAlreadyFinishedWork(
          current,
          workInProgress,
          renderLanes
        );
        return null !== current ? current.sibling : null;
      }
      pushPrimaryTreeSuspenseHandler(workInProgress);
      break;
    case 19:
      var didSuspendBefore = 0 !== (current.flags & 128);
      state$102 = 0 !== (renderLanes & workInProgress.childLanes);
      state$102 ||
        (propagateParentContextChanges(
          current,
          workInProgress,
          renderLanes,
          !1
        ),
        (state$102 = 0 !== (renderLanes & workInProgress.childLanes)));
      if (didSuspendBefore) {
        if (state$102)
          return updateSuspenseListComponent(
            current,
            workInProgress,
            renderLanes
          );
        workInProgress.flags |= 128;
      }
      didSuspendBefore = workInProgress.memoizedState;
      null !== didSuspendBefore &&
        ((didSuspendBefore.rendering = null),
        (didSuspendBefore.tail = null),
        (didSuspendBefore.lastEffect = null));
      push(suspenseStackCursor, suspenseStackCursor.current);
      if (state$102) break;
      else return null;
    case 22:
      return (
        (workInProgress.lanes = 0),
        updateOffscreenComponent(
          current,
          workInProgress,
          renderLanes,
          workInProgress.pendingProps
        )
      );
    case 24:
      pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
  }
  return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
}
function beginWork(current, workInProgress, renderLanes) {
  if (null !== current)
    if (current.memoizedProps !== workInProgress.pendingProps)
      didReceiveUpdate = !0;
    else {
      if (
        !checkScheduledUpdateOrContext(current, renderLanes) &&
        0 === (workInProgress.flags & 128)
      )
        return (
          (didReceiveUpdate = !1),
          attemptEarlyBailoutIfNoScheduledUpdate(
            current,
            workInProgress,
            renderLanes
          )
        );
      didReceiveUpdate = 0 !== (current.flags & 131072) ? !0 : !1;
    }
  else
    (didReceiveUpdate = !1),
      isHydrating &&
        0 !== (workInProgress.flags & 1048576) &&
        pushTreeId(workInProgress, treeForkCount, workInProgress.index);
  workInProgress.lanes = 0;
  switch (workInProgress.tag) {
    case 16:
      a: {
        var props = workInProgress.pendingProps;
        current = resolveLazy(workInProgress.elementType);
        workInProgress.type = current;
        if ("function" === typeof current)
          shouldConstruct(current)
            ? ((props = resolveClassComponentProps(current, props)),
              (workInProgress.tag = 1),
              (workInProgress = updateClassComponent(
                null,
                workInProgress,
                current,
                props,
                renderLanes
              )))
            : ((workInProgress.tag = 0),
              (workInProgress = updateFunctionComponent(
                null,
                workInProgress,
                current,
                props,
                renderLanes
              )));
        else {
          if (void 0 !== current && null !== current) {
            var $$typeof = current.$$typeof;
            if ($$typeof === REACT_FORWARD_REF_TYPE) {
              workInProgress.tag = 11;
              workInProgress = updateForwardRef(
                null,
                workInProgress,
                current,
                props,
                renderLanes
              );
              break a;
            } else if ($$typeof === REACT_MEMO_TYPE) {
              workInProgress.tag = 14;
              workInProgress = updateMemoComponent(
                null,
                workInProgress,
                current,
                props,
                renderLanes
              );
              break a;
            }
          }
          workInProgress = getComponentNameFromType(current) || current;
          throw Error(formatProdErrorMessage(306, workInProgress, ""));
        }
      }
      return workInProgress;
    case 0:
      return updateFunctionComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes
      );
    case 1:
      return (
        (props = workInProgress.type),
        ($$typeof = resolveClassComponentProps(
          props,
          workInProgress.pendingProps
        )),
        updateClassComponent(
          current,
          workInProgress,
          props,
          $$typeof,
          renderLanes
        )
      );
    case 3:
      a: {
        pushHostContainer(
          workInProgress,
          workInProgress.stateNode.containerInfo
        );
        if (null === current) throw Error(formatProdErrorMessage(387));
        props = workInProgress.pendingProps;
        var prevState = workInProgress.memoizedState;
        $$typeof = prevState.element;
        cloneUpdateQueue(current, workInProgress);
        processUpdateQueue(workInProgress, props, null, renderLanes);
        var nextState = workInProgress.memoizedState;
        props = nextState.cache;
        pushProvider(workInProgress, CacheContext, props);
        props !== prevState.cache &&
          propagateContextChanges(
            workInProgress,
            [CacheContext],
            renderLanes,
            !0
          );
        suspendIfUpdateReadFromEntangledAsyncAction();
        props = nextState.element;
        if (prevState.isDehydrated)
          if (
            ((prevState = {
              element: props,
              isDehydrated: !1,
              cache: nextState.cache
            }),
            (workInProgress.updateQueue.baseState = prevState),
            (workInProgress.memoizedState = prevState),
            workInProgress.flags & 256)
          ) {
            workInProgress = mountHostRootWithoutHydrating(
              current,
              workInProgress,
              props,
              renderLanes
            );
            break a;
          } else if (props !== $$typeof) {
            $$typeof = createCapturedValueAtFiber(
              Error(formatProdErrorMessage(424)),
              workInProgress
            );
            queueHydrationError($$typeof);
            workInProgress = mountHostRootWithoutHydrating(
              current,
              workInProgress,
              props,
              renderLanes
            );
            break a;
          } else {
            current = workInProgress.stateNode.containerInfo;
            switch (current.nodeType) {
              case 9:
                current = current.body;
                break;
              default:
                current =
                  "HTML" === current.nodeName
                    ? current.ownerDocument.body
                    : current;
            }
            nextHydratableInstance = getNextHydratable(current.firstChild);
            hydrationParentFiber = workInProgress;
            isHydrating = !0;
            hydrationErrors = null;
            rootOrSingletonContext = !0;
            renderLanes = mountChildFibers(
              workInProgress,
              null,
              props,
              renderLanes
            );
            for (workInProgress.child = renderLanes; renderLanes; )
              (renderLanes.flags = (renderLanes.flags & -3) | 4096),
                (renderLanes = renderLanes.sibling);
          }
        else {
          resetHydrationState();
          if (props === $$typeof) {
            workInProgress = bailoutOnAlreadyFinishedWork(
              current,
              workInProgress,
              renderLanes
            );
            break a;
          }
          reconcileChildren(current, workInProgress, props, renderLanes);
        }
        workInProgress = workInProgress.child;
      }
      return workInProgress;
    case 26:
      return (
        markRef(current, workInProgress),
        null === current
          ? (renderLanes = getResource(
              workInProgress.type,
              null,
              workInProgress.pendingProps,
              null
            ))
            ? (workInProgress.memoizedState = renderLanes)
            : isHydrating ||
              ((renderLanes = workInProgress.type),
              (current = workInProgress.pendingProps),
              (props = getOwnerDocumentFromRootContainer(
                rootInstanceStackCursor.current
              ).createElement(renderLanes)),
              (props[internalInstanceKey] = workInProgress),
              (props[internalPropsKey] = current),
              setInitialProperties(props, renderLanes, current),
              markNodeAsHoistable(props),
              (workInProgress.stateNode = props))
          : (workInProgress.memoizedState = getResource(
              workInProgress.type,
              current.memoizedProps,
              workInProgress.pendingProps,
              current.memoizedState
            )),
        null
      );
    case 27:
      return (
        pushHostContext(workInProgress),
        null === current &&
          isHydrating &&
          ((props = workInProgress.stateNode =
            resolveSingletonInstance(
              workInProgress.type,
              workInProgress.pendingProps,
              rootInstanceStackCursor.current
            )),
          (hydrationParentFiber = workInProgress),
          (rootOrSingletonContext = !0),
          ($$typeof = nextHydratableInstance),
          isSingletonScope(workInProgress.type)
            ? ((previousHydratableOnEnteringScopedSingleton = $$typeof),
              (nextHydratableInstance = getNextHydratable(props.firstChild)))
            : (nextHydratableInstance = $$typeof)),
        reconcileChildren(
          current,
          workInProgress,
          workInProgress.pendingProps.children,
          renderLanes
        ),
        markRef(current, workInProgress),
        null === current && (workInProgress.flags |= 4194304),
        workInProgress.child
      );
    case 5:
      if (null === current && isHydrating) {
        if (($$typeof = props = nextHydratableInstance))
          (props = canHydrateInstance(
            props,
            workInProgress.type,
            workInProgress.pendingProps,
            rootOrSingletonContext
          )),
            null !== props
              ? ((workInProgress.stateNode = props),
                (hydrationParentFiber = workInProgress),
                (nextHydratableInstance = getNextHydratable(props.firstChild)),
                (rootOrSingletonContext = !1),
                ($$typeof = !0))
              : ($$typeof = !1);
        $$typeof || throwOnHydrationMismatch(workInProgress);
      }
      pushHostContext(workInProgress);
      $$typeof = workInProgress.type;
      prevState = workInProgress.pendingProps;
      nextState = null !== current ? current.memoizedProps : null;
      props = prevState.children;
      shouldSetTextContent($$typeof, prevState)
        ? (props = null)
        : null !== nextState &&
          shouldSetTextContent($$typeof, nextState) &&
          (workInProgress.flags |= 32);
      null !== workInProgress.memoizedState &&
        (($$typeof = renderWithHooks(
          current,
          workInProgress,
          TransitionAwareHostComponent,
          null,
          null,
          renderLanes
        )),
        (HostTransitionContext._currentValue = $$typeof));
      markRef(current, workInProgress);
      reconcileChildren(current, workInProgress, props, renderLanes);
      return workInProgress.child;
    case 6:
      if (null === current && isHydrating) {
        if ((current = renderLanes = nextHydratableInstance))
          (renderLanes = canHydrateTextInstance(
            renderLanes,
            workInProgress.pendingProps,
            rootOrSingletonContext
          )),
            null !== renderLanes
              ? ((workInProgress.stateNode = renderLanes),
                (hydrationParentFiber = workInProgress),
                (nextHydratableInstance = null),
                (current = !0))
              : (current = !1);
        current || throwOnHydrationMismatch(workInProgress);
      }
      return null;
    case 13:
      return updateSuspenseComponent(current, workInProgress, renderLanes);
    case 4:
      return (
        pushHostContainer(
          workInProgress,
          workInProgress.stateNode.containerInfo
        ),
        (props = workInProgress.pendingProps),
        null === current
          ? (workInProgress.child = reconcileChildFibers(
              workInProgress,
              null,
              props,
              renderLanes
            ))
          : reconcileChildren(current, workInProgress, props, renderLanes),
        workInProgress.child
      );
    case 11:
      return updateForwardRef(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes
      );
    case 7:
      return (
        reconcileChildren(
          current,
          workInProgress,
          workInProgress.pendingProps,
          renderLanes
        ),
        workInProgress.child
      );
    case 8:
      return (
        reconcileChildren(
          current,
          workInProgress,
          workInProgress.pendingProps.children,
          renderLanes
        ),
        workInProgress.child
      );
    case 12:
      return (
        reconcileChildren(
          current,
          workInProgress,
          workInProgress.pendingProps.children,
          renderLanes
        ),
        workInProgress.child
      );
    case 10:
      return (
        (props = workInProgress.pendingProps),
        pushProvider(workInProgress, workInProgress.type, props.value),
        reconcileChildren(current, workInProgress, props.children, renderLanes),
        workInProgress.child
      );
    case 9:
      return (
        ($$typeof = workInProgress.type._context),
        (props = workInProgress.pendingProps.children),
        prepareToReadContext(workInProgress),
        ($$typeof = readContext($$typeof)),
        (props = props($$typeof)),
        (workInProgress.flags |= 1),
        reconcileChildren(current, workInProgress, props, renderLanes),
        workInProgress.child
      );
    case 14:
      return updateMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes
      );
    case 15:
      return updateSimpleMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes
      );
    case 19:
      return updateSuspenseListComponent(current, workInProgress, renderLanes);
    case 31:
      return updateActivityComponent(current, workInProgress, renderLanes);
    case 22:
      return updateOffscreenComponent(
        current,
        workInProgress,
        renderLanes,
        workInProgress.pendingProps
      );
    case 24:
      return (
        prepareToReadContext(workInProgress),
        (props = readContext(CacheContext)),
        null === current
          ? (($$typeof = peekCacheFromPool()),
            null === $$typeof &&
              (($$typeof = workInProgressRoot),
              (prevState = createCache()),
              ($$typeof.pooledCache = prevState),
              prevState.refCount++,
              null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes),
              ($$typeof = prevState)),
            (workInProgress.memoizedState = { parent: props, cache: $$typeof }),
            initializeUpdateQueue(workInProgress),
            pushProvider(workInProgress, CacheContext, $$typeof))
          : (0 !== (current.lanes & renderLanes) &&
              (cloneUpdateQueue(current, workInProgress),
              processUpdateQueue(workInProgress, null, null, renderLanes),
              suspendIfUpdateReadFromEntangledAsyncAction()),
            ($$typeof = current.memoizedState),
            (prevState = workInProgress.memoizedState),
            $$typeof.parent !== props
              ? (($$typeof = { parent: props, cache: props }),
                (workInProgress.memoizedState = $$typeof),
                0 === workInProgress.lanes &&
                  (workInProgress.memoizedState =
                    workInProgress.updateQueue.baseState =
                      $$typeof),
                pushProvider(workInProgress, CacheContext, props))
              : ((props = prevState.cache),
                pushProvider(workInProgress, CacheContext, props),
                props !== $$typeof.cache &&
                  propagateContextChanges(
                    workInProgress,
                    [CacheContext],
                    renderLanes,
                    !0
                  ))),
        reconcileChildren(
          current,
          workInProgress,
          workInProgress.pendingProps.children,
          renderLanes
        ),
        workInProgress.child
      );
    case 29:
      throw workInProgress.pendingProps;
  }
  throw Error(formatProdErrorMessage(156, workInProgress.tag));
}
function markUpdate(workInProgress) {
  workInProgress.flags |= 4;
}
function preloadInstanceAndSuspendIfNeeded(
  workInProgress,
  type,
  oldProps,
  newProps,
  renderLanes
) {
  if ((type = 0 !== (workInProgress.mode & 32))) type = !1;
  if (type) {
    if (
      ((workInProgress.flags |= 16777216),
      (renderLanes & 335544128) === renderLanes)
    )
      if (workInProgress.stateNode.complete) workInProgress.flags |= 8192;
      else if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
      else
        throw (
          ((suspendedThenable = noopSuspenseyCommitThenable),
          SuspenseyCommitException)
        );
  } else workInProgress.flags &= -16777217;
}
function preloadResourceAndSuspendIfNeeded(workInProgress, resource) {
  if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4))
    workInProgress.flags &= -16777217;
  else if (((workInProgress.flags |= 16777216), !preloadResource(resource)))
    if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
    else
      throw (
        ((suspendedThenable = noopSuspenseyCommitThenable),
        SuspenseyCommitException)
      );
}
function scheduleRetryEffect(workInProgress, retryQueue) {
  null !== retryQueue && (workInProgress.flags |= 4);
  workInProgress.flags & 16384 &&
    ((retryQueue =
      22 !== workInProgress.tag ? claimNextRetryLane() : 536870912),
    (workInProgress.lanes |= retryQueue),
    (workInProgressSuspendedRetryLanes |= retryQueue));
}
function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
  if (!isHydrating)
    switch (renderState.tailMode) {
      case "hidden":
        hasRenderedATailFallback = renderState.tail;
        for (var lastTailNode = null; null !== hasRenderedATailFallback; )
          null !== hasRenderedATailFallback.alternate &&
            (lastTailNode = hasRenderedATailFallback),
            (hasRenderedATailFallback = hasRenderedATailFallback.sibling);
        null === lastTailNode
          ? (renderState.tail = null)
          : (lastTailNode.sibling = null);
        break;
      case "collapsed":
        lastTailNode = renderState.tail;
        for (var lastTailNode$106 = null; null !== lastTailNode; )
          null !== lastTailNode.alternate && (lastTailNode$106 = lastTailNode),
            (lastTailNode = lastTailNode.sibling);
        null === lastTailNode$106
          ? hasRenderedATailFallback || null === renderState.tail
            ? (renderState.tail = null)
            : (renderState.tail.sibling = null)
          : (lastTailNode$106.sibling = null);
    }
}
function bubbleProperties(completedWork) {
  var didBailout =
      null !== completedWork.alternate &&
      completedWork.alternate.child === completedWork.child,
    newChildLanes = 0,
    subtreeFlags = 0;
  if (didBailout)
    for (var child$107 = completedWork.child; null !== child$107; )
      (newChildLanes |= child$107.lanes | child$107.childLanes),
        (subtreeFlags |= child$107.subtreeFlags & 65011712),
        (subtreeFlags |= child$107.flags & 65011712),
        (child$107.return = completedWork),
        (child$107 = child$107.sibling);
  else
    for (child$107 = completedWork.child; null !== child$107; )
      (newChildLanes |= child$107.lanes | child$107.childLanes),
        (subtreeFlags |= child$107.subtreeFlags),
        (subtreeFlags |= child$107.flags),
        (child$107.return = completedWork),
        (child$107 = child$107.sibling);
  completedWork.subtreeFlags |= subtreeFlags;
  completedWork.childLanes = newChildLanes;
  return didBailout;
}
function completeWork(current, workInProgress, renderLanes) {
  var newProps = workInProgress.pendingProps;
  popTreeContext(workInProgress);
  switch (workInProgress.tag) {
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return bubbleProperties(workInProgress), null;
    case 1:
      return bubbleProperties(workInProgress), null;
    case 3:
      renderLanes = workInProgress.stateNode;
      newProps = null;
      null !== current && (newProps = current.memoizedState.cache);
      workInProgress.memoizedState.cache !== newProps &&
        (workInProgress.flags |= 2048);
      popProvider(CacheContext);
      popHostContainer();
      renderLanes.pendingContext &&
        ((renderLanes.context = renderLanes.pendingContext),
        (renderLanes.pendingContext = null));
      if (null === current || null === current.child)
        popHydrationState(workInProgress)
          ? markUpdate(workInProgress)
          : null === current ||
            (current.memoizedState.isDehydrated &&
              0 === (workInProgress.flags & 256)) ||
            ((workInProgress.flags |= 1024),
            upgradeHydrationErrorsToRecoverable());
      bubbleProperties(workInProgress);
      return null;
    case 26:
      var type = workInProgress.type,
        nextResource = workInProgress.memoizedState;
      null === current
        ? (markUpdate(workInProgress),
          null !== nextResource
            ? (bubbleProperties(workInProgress),
              preloadResourceAndSuspendIfNeeded(workInProgress, nextResource))
            : (bubbleProperties(workInProgress),
              preloadInstanceAndSuspendIfNeeded(
                workInProgress,
                type,
                null,
                newProps,
                renderLanes
              )))
        : nextResource
          ? nextResource !== current.memoizedState
            ? (markUpdate(workInProgress),
              bubbleProperties(workInProgress),
              preloadResourceAndSuspendIfNeeded(workInProgress, nextResource))
            : (bubbleProperties(workInProgress),
              (workInProgress.flags &= -16777217))
          : ((current = current.memoizedProps),
            current !== newProps && markUpdate(workInProgress),
            bubbleProperties(workInProgress),
            preloadInstanceAndSuspendIfNeeded(
              workInProgress,
              type,
              current,
              newProps,
              renderLanes
            ));
      return null;
    case 27:
      popHostContext(workInProgress);
      renderLanes = rootInstanceStackCursor.current;
      type = workInProgress.type;
      if (null !== current && null != workInProgress.stateNode)
        current.memoizedProps !== newProps && markUpdate(workInProgress);
      else {
        if (!newProps) {
          if (null === workInProgress.stateNode)
            throw Error(formatProdErrorMessage(166));
          bubbleProperties(workInProgress);
          return null;
        }
        current = contextStackCursor.current;
        popHydrationState(workInProgress)
          ? prepareToHydrateHostInstance(workInProgress, current)
          : ((current = resolveSingletonInstance(type, newProps, renderLanes)),
            (workInProgress.stateNode = current),
            markUpdate(workInProgress));
      }
      bubbleProperties(workInProgress);
      return null;
    case 5:
      popHostContext(workInProgress);
      type = workInProgress.type;
      if (null !== current && null != workInProgress.stateNode)
        current.memoizedProps !== newProps && markUpdate(workInProgress);
      else {
        if (!newProps) {
          if (null === workInProgress.stateNode)
            throw Error(formatProdErrorMessage(166));
          bubbleProperties(workInProgress);
          return null;
        }
        nextResource = contextStackCursor.current;
        if (popHydrationState(workInProgress))
          prepareToHydrateHostInstance(workInProgress, nextResource);
        else {
          var ownerDocument = getOwnerDocumentFromRootContainer(
            rootInstanceStackCursor.current
          );
          switch (nextResource) {
            case 1:
              nextResource = ownerDocument.createElementNS(
                "http://www.w3.org/2000/svg",
                type
              );
              break;
            case 2:
              nextResource = ownerDocument.createElementNS(
                "http://www.w3.org/1998/Math/MathML",
                type
              );
              break;
            default:
              switch (type) {
                case "svg":
                  nextResource = ownerDocument.createElementNS(
                    "http://www.w3.org/2000/svg",
                    type
                  );
                  break;
                case "math":
                  nextResource = ownerDocument.createElementNS(
                    "http://www.w3.org/1998/Math/MathML",
                    type
                  );
                  break;
                case "script":
                  nextResource = ownerDocument.createElement("div");
                  nextResource.innerHTML = "<script>\x3c/script>";
                  nextResource = nextResource.removeChild(
                    nextResource.firstChild
                  );
                  break;
                case "select":
                  nextResource =
                    "string" === typeof newProps.is
                      ? ownerDocument.createElement("select", {
                          is: newProps.is
                        })
                      : ownerDocument.createElement("select");
                  newProps.multiple
                    ? (nextResource.multiple = !0)
                    : newProps.size && (nextResource.size = newProps.size);
                  break;
                default:
                  nextResource =
                    "string" === typeof newProps.is
                      ? ownerDocument.createElement(type, { is: newProps.is })
                      : ownerDocument.createElement(type);
              }
          }
          nextResource[internalInstanceKey] = workInProgress;
          nextResource[internalPropsKey] = newProps;
          a: for (
            ownerDocument = workInProgress.child;
            null !== ownerDocument;

          ) {
            if (5 === ownerDocument.tag || 6 === ownerDocument.tag)
              nextResource.appendChild(ownerDocument.stateNode);
            else if (
              4 !== ownerDocument.tag &&
              27 !== ownerDocument.tag &&
              null !== ownerDocument.child
            ) {
              ownerDocument.child.return = ownerDocument;
              ownerDocument = ownerDocument.child;
              continue;
            }
            if (ownerDocument === workInProgress) break a;
            for (; null === ownerDocument.sibling; ) {
              if (
                null === ownerDocument.return ||
                ownerDocument.return === workInProgress
              )
                break a;
              ownerDocument = ownerDocument.return;
            }
            ownerDocument.sibling.return = ownerDocument.return;
            ownerDocument = ownerDocument.sibling;
          }
          workInProgress.stateNode = nextResource;
          a: switch (
            (setInitialProperties(nextResource, type, newProps), type)
          ) {
            case "button":
            case "input":
            case "select":
            case "textarea":
              newProps = !!newProps.autoFocus;
              break a;
            case "img":
              newProps = !0;
              break a;
            default:
              newProps = !1;
          }
          newProps && markUpdate(workInProgress);
        }
      }
      bubbleProperties(workInProgress);
      preloadInstanceAndSuspendIfNeeded(
        workInProgress,
        workInProgress.type,
        null === current ? null : current.memoizedProps,
        workInProgress.pendingProps,
        renderLanes
      );
      return null;
    case 6:
      if (current && null != workInProgress.stateNode)
        current.memoizedProps !== newProps && markUpdate(workInProgress);
      else {
        if ("string" !== typeof newProps && null === workInProgress.stateNode)
          throw Error(formatProdErrorMessage(166));
        current = rootInstanceStackCursor.current;
        if (popHydrationState(workInProgress)) {
          current = workInProgress.stateNode;
          renderLanes = workInProgress.memoizedProps;
          newProps = null;
          type = hydrationParentFiber;
          if (null !== type)
            switch (type.tag) {
              case 27:
              case 5:
                newProps = type.memoizedProps;
            }
          current[internalInstanceKey] = workInProgress;
          current =
            current.nodeValue === renderLanes ||
            (null !== newProps && !0 === newProps.suppressHydrationWarning) ||
            checkForUnmatchedText(current.nodeValue, renderLanes)
              ? !0
              : !1;
          current || throwOnHydrationMismatch(workInProgress, !0);
        } else
          (current =
            getOwnerDocumentFromRootContainer(current).createTextNode(
              newProps
            )),
            (current[internalInstanceKey] = workInProgress),
            (workInProgress.stateNode = current);
      }
      bubbleProperties(workInProgress);
      return null;
    case 31:
      renderLanes = workInProgress.memoizedState;
      if (null === current || null !== current.memoizedState) {
        newProps = popHydrationState(workInProgress);
        if (null !== renderLanes) {
          if (null === current) {
            if (!newProps) throw Error(formatProdErrorMessage(318));
            current = workInProgress.memoizedState;
            current = null !== current ? current.dehydrated : null;
            if (!current) throw Error(formatProdErrorMessage(557));
            current[internalInstanceKey] = workInProgress;
          } else
            resetHydrationState(),
              0 === (workInProgress.flags & 128) &&
                (workInProgress.memoizedState = null),
              (workInProgress.flags |= 4);
          bubbleProperties(workInProgress);
          current = !1;
        } else
          (renderLanes = upgradeHydrationErrorsToRecoverable()),
            null !== current &&
              null !== current.memoizedState &&
              (current.memoizedState.hydrationErrors = renderLanes),
            (current = !0);
        if (!current) {
          if (workInProgress.flags & 256)
            return popSuspenseHandler(workInProgress), workInProgress;
          popSuspenseHandler(workInProgress);
          return null;
        }
        if (0 !== (workInProgress.flags & 128))
          throw Error(formatProdErrorMessage(558));
      }
      bubbleProperties(workInProgress);
      return null;
    case 13:
      newProps = workInProgress.memoizedState;
      if (
        null === current ||
        (null !== current.memoizedState &&
          null !== current.memoizedState.dehydrated)
      ) {
        type = popHydrationState(workInProgress);
        if (null !== newProps && null !== newProps.dehydrated) {
          if (null === current) {
            if (!type) throw Error(formatProdErrorMessage(318));
            type = workInProgress.memoizedState;
            type = null !== type ? type.dehydrated : null;
            if (!type) throw Error(formatProdErrorMessage(317));
            type[internalInstanceKey] = workInProgress;
          } else
            resetHydrationState(),
              0 === (workInProgress.flags & 128) &&
                (workInProgress.memoizedState = null),
              (workInProgress.flags |= 4);
          bubbleProperties(workInProgress);
          type = !1;
        } else
          (type = upgradeHydrationErrorsToRecoverable()),
            null !== current &&
              null !== current.memoizedState &&
              (current.memoizedState.hydrationErrors = type),
            (type = !0);
        if (!type) {
          if (workInProgress.flags & 256)
            return popSuspenseHandler(workInProgress), workInProgress;
          popSuspenseHandler(workInProgress);
          return null;
        }
      }
      popSuspenseHandler(workInProgress);
      if (0 !== (workInProgress.flags & 128))
        return (workInProgress.lanes = renderLanes), workInProgress;
      renderLanes = null !== newProps;
      current = null !== current && null !== current.memoizedState;
      renderLanes &&
        ((newProps = workInProgress.child),
        (type = null),
        null !== newProps.alternate &&
          null !== newProps.alternate.memoizedState &&
          null !== newProps.alternate.memoizedState.cachePool &&
          (type = newProps.alternate.memoizedState.cachePool.pool),
        (nextResource = null),
        null !== newProps.memoizedState &&
          null !== newProps.memoizedState.cachePool &&
          (nextResource = newProps.memoizedState.cachePool.pool),
        nextResource !== type && (newProps.flags |= 2048));
      renderLanes !== current &&
        renderLanes &&
        (workInProgress.child.flags |= 8192);
      scheduleRetryEffect(workInProgress, workInProgress.updateQueue);
      bubbleProperties(workInProgress);
      return null;
    case 4:
      return (
        popHostContainer(),
        null === current &&
          listenToAllSupportedEvents(workInProgress.stateNode.containerInfo),
        bubbleProperties(workInProgress),
        null
      );
    case 10:
      return (
        popProvider(workInProgress.type), bubbleProperties(workInProgress), null
      );
    case 19:
      pop(suspenseStackCursor);
      newProps = workInProgress.memoizedState;
      if (null === newProps) return bubbleProperties(workInProgress), null;
      type = 0 !== (workInProgress.flags & 128);
      nextResource = newProps.rendering;
      if (null === nextResource)
        if (type) cutOffTailIfNeeded(newProps, !1);
        else {
          if (
            0 !== workInProgressRootExitStatus ||
            (null !== current && 0 !== (current.flags & 128))
          )
            for (current = workInProgress.child; null !== current; ) {
              nextResource = findFirstSuspended(current);
              if (null !== nextResource) {
                workInProgress.flags |= 128;
                cutOffTailIfNeeded(newProps, !1);
                current = nextResource.updateQueue;
                workInProgress.updateQueue = current;
                scheduleRetryEffect(workInProgress, current);
                workInProgress.subtreeFlags = 0;
                current = renderLanes;
                for (renderLanes = workInProgress.child; null !== renderLanes; )
                  resetWorkInProgress(renderLanes, current),
                    (renderLanes = renderLanes.sibling);
                push(
                  suspenseStackCursor,
                  (suspenseStackCursor.current & 1) | 2
                );
                isHydrating &&
                  pushTreeFork(workInProgress, newProps.treeForkCount);
                return workInProgress.child;
              }
              current = current.sibling;
            }
          null !== newProps.tail &&
            now() > workInProgressRootRenderTargetTime &&
            ((workInProgress.flags |= 128),
            (type = !0),
            cutOffTailIfNeeded(newProps, !1),
            (workInProgress.lanes = 4194304));
        }
      else {
        if (!type)
          if (
            ((current = findFirstSuspended(nextResource)), null !== current)
          ) {
            if (
              ((workInProgress.flags |= 128),
              (type = !0),
              (current = current.updateQueue),
              (workInProgress.updateQueue = current),
              scheduleRetryEffect(workInProgress, current),
              cutOffTailIfNeeded(newProps, !0),
              null === newProps.tail &&
                "hidden" === newProps.tailMode &&
                !nextResource.alternate &&
                !isHydrating)
            )
              return bubbleProperties(workInProgress), null;
          } else
            2 * now() - newProps.renderingStartTime >
              workInProgressRootRenderTargetTime &&
              536870912 !== renderLanes &&
              ((workInProgress.flags |= 128),
              (type = !0),
              cutOffTailIfNeeded(newProps, !1),
              (workInProgress.lanes = 4194304));
        newProps.isBackwards
          ? ((nextResource.sibling = workInProgress.child),
            (workInProgress.child = nextResource))
          : ((current = newProps.last),
            null !== current
              ? (current.sibling = nextResource)
              : (workInProgress.child = nextResource),
            (newProps.last = nextResource));
      }
      if (null !== newProps.tail)
        return (
          (current = newProps.tail),
          (newProps.rendering = current),
          (newProps.tail = current.sibling),
          (newProps.renderingStartTime = now()),
          (current.sibling = null),
          (renderLanes = suspenseStackCursor.current),
          push(
            suspenseStackCursor,
            type ? (renderLanes & 1) | 2 : renderLanes & 1
          ),
          isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount),
          current
        );
      bubbleProperties(workInProgress);
      return null;
    case 22:
    case 23:
      return (
        popSuspenseHandler(workInProgress),
        popHiddenContext(),
        (newProps = null !== workInProgress.memoizedState),
        null !== current
          ? (null !== current.memoizedState) !== newProps &&
            (workInProgress.flags |= 8192)
          : newProps && (workInProgress.flags |= 8192),
        newProps
          ? 0 !== (renderLanes & 536870912) &&
            0 === (workInProgress.flags & 128) &&
            (bubbleProperties(workInProgress),
            workInProgress.subtreeFlags & 6 && (workInProgress.flags |= 8192))
          : bubbleProperties(workInProgress),
        (renderLanes = workInProgress.updateQueue),
        null !== renderLanes &&
          scheduleRetryEffect(workInProgress, renderLanes.retryQueue),
        (renderLanes = null),
        null !== current &&
          null !== current.memoizedState &&
          null !== current.memoizedState.cachePool &&
          (renderLanes = current.memoizedState.cachePool.pool),
        (newProps = null),
        null !== workInProgress.memoizedState &&
          null !== workInProgress.memoizedState.cachePool &&
          (newProps = workInProgress.memoizedState.cachePool.pool),
        newProps !== renderLanes && (workInProgress.flags |= 2048),
        null !== current && pop(resumedCache),
        null
      );
    case 24:
      return (
        (renderLanes = null),
        null !== current && (renderLanes = current.memoizedState.cache),
        workInProgress.memoizedState.cache !== renderLanes &&
          (workInProgress.flags |= 2048),
        popProvider(CacheContext),
        bubbleProperties(workInProgress),
        null
      );
    case 25:
      return null;
    case 30:
      return null;
  }
  throw Error(formatProdErrorMessage(156, workInProgress.tag));
}
function unwindWork(current, workInProgress) {
  popTreeContext(workInProgress);
  switch (workInProgress.tag) {
    case 1:
      return (
        (current = workInProgress.flags),
        current & 65536
          ? ((workInProgress.flags = (current & -65537) | 128), workInProgress)
          : null
      );
    case 3:
      return (
        popProvider(CacheContext),
        popHostContainer(),
        (current = workInProgress.flags),
        0 !== (current & 65536) && 0 === (current & 128)
          ? ((workInProgress.flags = (current & -65537) | 128), workInProgress)
          : null
      );
    case 26:
    case 27:
    case 5:
      return popHostContext(workInProgress), null;
    case 31:
      if (null !== workInProgress.memoizedState) {
        popSuspenseHandler(workInProgress);
        if (null === workInProgress.alternate)
          throw Error(formatProdErrorMessage(340));
        resetHydrationState();
      }
      current = workInProgress.flags;
      return current & 65536
        ? ((workInProgress.flags = (current & -65537) | 128), workInProgress)
        : null;
    case 13:
      popSuspenseHandler(workInProgress);
      current = workInProgress.memoizedState;
      if (null !== current && null !== current.dehydrated) {
        if (null === workInProgress.alternate)
          throw Error(formatProdErrorMessage(340));
        resetHydrationState();
      }
      current = workInProgress.flags;
      return current & 65536
        ? ((workInProgress.flags = (current & -65537) | 128), workInProgress)
        : null;
    case 19:
      return pop(suspenseStackCursor), null;
    case 4:
      return popHostContainer(), null;
    case 10:
      return popProvider(workInProgress.type), null;
    case 22:
    case 23:
      return (
        popSuspenseHandler(workInProgress),
        popHiddenContext(),
        null !== current && pop(resumedCache),
        (current = workInProgress.flags),
        current & 65536
          ? ((workInProgress.flags = (current & -65537) | 128), workInProgress)
          : null
      );
    case 24:
      return popProvider(CacheContext), null;
    case 25:
      return null;
    default:
      return null;
  }
}
function unwindInterruptedWork(current, interruptedWork) {
  popTreeContext(interruptedWork);
  switch (interruptedWork.tag) {
    case 3:
      popProvider(CacheContext);
      popHostContainer();
      break;
    case 26:
    case 27:
    case 5:
      popHostContext(interruptedWork);
      break;
    case 4:
      popHostContainer();
      break;
    case 31:
      null !== interruptedWork.memoizedState &&
        popSuspenseHandler(interruptedWork);
      break;
    case 13:
      popSuspenseHandler(interruptedWork);
      break;
    case 19:
      pop(suspenseStackCursor);
      break;
    case 10:
      popProvider(interruptedWork.type);
      break;
    case 22:
    case 23:
      popSuspenseHandler(interruptedWork);
      popHiddenContext();
      null !== current && pop(resumedCache);
      break;
    case 24:
      popProvider(CacheContext);
  }
}
function commitHookEffectListMount(flags, finishedWork) {
  try {
    var updateQueue = finishedWork.updateQueue,
      lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
    if (null !== lastEffect) {
      var firstEffect = lastEffect.next;
      updateQueue = firstEffect;
      do {
        if ((updateQueue.tag & flags) === flags) {
          lastEffect = void 0;
          var create = updateQueue.create,
            inst = updateQueue.inst;
          lastEffect = create();
          inst.destroy = lastEffect;
        }
        updateQueue = updateQueue.next;
      } while (updateQueue !== firstEffect);
    }
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitHookEffectListUnmount(
  flags,
  finishedWork,
  nearestMountedAncestor$jscomp$0
) {
  try {
    var updateQueue = finishedWork.updateQueue,
      lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
    if (null !== lastEffect) {
      var firstEffect = lastEffect.next;
      updateQueue = firstEffect;
      do {
        if ((updateQueue.tag & flags) === flags) {
          var inst = updateQueue.inst,
            destroy = inst.destroy;
          if (void 0 !== destroy) {
            inst.destroy = void 0;
            lastEffect = finishedWork;
            var nearestMountedAncestor = nearestMountedAncestor$jscomp$0,
              destroy_ = destroy;
            try {
              destroy_();
            } catch (error) {
              captureCommitPhaseError(
                lastEffect,
                nearestMountedAncestor,
                error
              );
            }
          }
        }
        updateQueue = updateQueue.next;
      } while (updateQueue !== firstEffect);
    }
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitClassCallbacks(finishedWork) {
  var updateQueue = finishedWork.updateQueue;
  if (null !== updateQueue) {
    var instance = finishedWork.stateNode;
    try {
      commitCallbacks(updateQueue, instance);
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
}
function safelyCallComponentWillUnmount(
  current,
  nearestMountedAncestor,
  instance
) {
  instance.props = resolveClassComponentProps(
    current.type,
    current.memoizedProps
  );
  instance.state = current.memoizedState;
  try {
    instance.componentWillUnmount();
  } catch (error) {
    captureCommitPhaseError(current, nearestMountedAncestor, error);
  }
}
function safelyAttachRef(current, nearestMountedAncestor) {
  try {
    var ref = current.ref;
    if (null !== ref) {
      switch (current.tag) {
        case 26:
        case 27:
        case 5:
          var instanceToUse = current.stateNode;
          break;
        case 30:
          instanceToUse = current.stateNode;
          break;
        default:
          instanceToUse = current.stateNode;
      }
      "function" === typeof ref
        ? (current.refCleanup = ref(instanceToUse))
        : (ref.current = instanceToUse);
    }
  } catch (error) {
    captureCommitPhaseError(current, nearestMountedAncestor, error);
  }
}
function safelyDetachRef(current, nearestMountedAncestor) {
  var ref = current.ref,
    refCleanup = current.refCleanup;
  if (null !== ref)
    if ("function" === typeof refCleanup)
      try {
        refCleanup();
      } catch (error) {
        captureCommitPhaseError(current, nearestMountedAncestor, error);
      } finally {
        (current.refCleanup = null),
          (current = current.alternate),
          null != current && (current.refCleanup = null);
      }
    else if ("function" === typeof ref)
      try {
        ref(null);
      } catch (error$140) {
        captureCommitPhaseError(current, nearestMountedAncestor, error$140);
      }
    else ref.current = null;
}
function commitHostMount(finishedWork) {
  var type = finishedWork.type,
    props = finishedWork.memoizedProps,
    instance = finishedWork.stateNode;
  try {
    a: switch (type) {
      case "button":
      case "input":
      case "select":
      case "textarea":
        props.autoFocus && instance.focus();
        break a;
      case "img":
        props.src
          ? (instance.src = props.src)
          : props.srcSet && (instance.srcset = props.srcSet);
    }
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function commitHostUpdate(finishedWork, newProps, oldProps) {
  try {
    var domElement = finishedWork.stateNode;
    updateProperties(domElement, finishedWork.type, oldProps, newProps);
    domElement[internalPropsKey] = newProps;
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
function isHostParent(fiber) {
  return (
    5 === fiber.tag ||
    3 === fiber.tag ||
    26 === fiber.tag ||
    (27 === fiber.tag && isSingletonScope(fiber.type)) ||
    4 === fiber.tag
  );
}
function getHostSibling(fiber) {
  a: for (;;) {
    for (; null === fiber.sibling; ) {
      if (null === fiber.return || isHostParent(fiber.return)) return null;
      fiber = fiber.return;
    }
    fiber.sibling.return = fiber.return;
    for (
      fiber = fiber.sibling;
      5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag;

    ) {
      if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
      if (fiber.flags & 2) continue a;
      if (null === fiber.child || 4 === fiber.tag) continue a;
      else (fiber.child.return = fiber), (fiber = fiber.child);
    }
    if (!(fiber.flags & 2)) return fiber.stateNode;
  }
}
function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  var tag = node.tag;
  if (5 === tag || 6 === tag)
    (node = node.stateNode),
      before
        ? (9 === parent.nodeType
            ? parent.body
            : "HTML" === parent.nodeName
              ? parent.ownerDocument.body
              : parent
          ).insertBefore(node, before)
        : ((before =
            9 === parent.nodeType
              ? parent.body
              : "HTML" === parent.nodeName
                ? parent.ownerDocument.body
                : parent),
          before.appendChild(node),
          (parent = parent._reactRootContainer),
          (null !== parent && void 0 !== parent) ||
            null !== before.onclick ||
            (before.onclick = noop$1));
  else if (
    4 !== tag &&
    (27 === tag &&
      isSingletonScope(node.type) &&
      ((parent = node.stateNode), (before = null)),
    (node = node.child),
    null !== node)
  )
    for (
      insertOrAppendPlacementNodeIntoContainer(node, before, parent),
        node = node.sibling;
      null !== node;

    )
      insertOrAppendPlacementNodeIntoContainer(node, before, parent),
        (node = node.sibling);
}
function insertOrAppendPlacementNode(node, before, parent) {
  var tag = node.tag;
  if (5 === tag || 6 === tag)
    (node = node.stateNode),
      before ? parent.insertBefore(node, before) : parent.appendChild(node);
  else if (
    4 !== tag &&
    (27 === tag && isSingletonScope(node.type) && (parent = node.stateNode),
    (node = node.child),
    null !== node)
  )
    for (
      insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
      null !== node;

    )
      insertOrAppendPlacementNode(node, before, parent), (node = node.sibling);
}
function commitHostSingletonAcquisition(finishedWork) {
  var singleton = finishedWork.stateNode,
    props = finishedWork.memoizedProps;
  try {
    for (
      var type = finishedWork.type, attributes = singleton.attributes;
      attributes.length;

    )
      singleton.removeAttributeNode(attributes[0]);
    setInitialProperties(singleton, type, props);
    singleton[internalInstanceKey] = finishedWork;
    singleton[internalPropsKey] = props;
  } catch (error) {
    captureCommitPhaseError(finishedWork, finishedWork.return, error);
  }
}
var offscreenSubtreeIsHidden = !1,
  offscreenSubtreeWasHidden = !1,
  needsFormReset = !1,
  PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set,
  nextEffect = null;
function commitBeforeMutationEffects(root, firstChild) {
  root = root.containerInfo;
  eventsEnabled = _enabled;
  root = getActiveElementDeep(root);
  if (hasSelectionCapabilities(root)) {
    if ("selectionStart" in root)
      var JSCompiler_temp = {
        start: root.selectionStart,
        end: root.selectionEnd
      };
    else
      a: {
        JSCompiler_temp =
          ((JSCompiler_temp = root.ownerDocument) &&
            JSCompiler_temp.defaultView) ||
          window;
        var selection =
          JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
        if (selection && 0 !== selection.rangeCount) {
          JSCompiler_temp = selection.anchorNode;
          var anchorOffset = selection.anchorOffset,
            focusNode = selection.focusNode;
          selection = selection.focusOffset;
          try {
            JSCompiler_temp.nodeType, focusNode.nodeType;
          } catch (e$20) {
            JSCompiler_temp = null;
            break a;
          }
          var length = 0,
            start = -1,
            end = -1,
            indexWithinAnchor = 0,
            indexWithinFocus = 0,
            node = root,
            parentNode = null;
          b: for (;;) {
            for (var next; ; ) {
              node !== JSCompiler_temp ||
                (0 !== anchorOffset && 3 !== node.nodeType) ||
                (start = length + anchorOffset);
              node !== focusNode ||
                (0 !== selection && 3 !== node.nodeType) ||
                (end = length + selection);
              3 === node.nodeType && (length += node.nodeValue.length);
              if (null === (next = node.firstChild)) break;
              parentNode = node;
              node = next;
            }
            for (;;) {
              if (node === root) break b;
              parentNode === JSCompiler_temp &&
                ++indexWithinAnchor === anchorOffset &&
                (start = length);
              parentNode === focusNode &&
                ++indexWithinFocus === selection &&
                (end = length);
              if (null !== (next = node.nextSibling)) break;
              node = parentNode;
              parentNode = node.parentNode;
            }
            node = next;
          }
          JSCompiler_temp =
            -1 === start || -1 === end ? null : { start: start, end: end };
        } else JSCompiler_temp = null;
      }
    JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
  } else JSCompiler_temp = null;
  selectionInformation = { focusedElem: root, selectionRange: JSCompiler_temp };
  _enabled = !1;
  for (nextEffect = firstChild; null !== nextEffect; )
    if (
      ((firstChild = nextEffect),
      (root = firstChild.child),
      0 !== (firstChild.subtreeFlags & 1028) && null !== root)
    )
      (root.return = firstChild), (nextEffect = root);
    else
      for (; null !== nextEffect; ) {
        firstChild = nextEffect;
        focusNode = firstChild.alternate;
        root = firstChild.flags;
        switch (firstChild.tag) {
          case 0:
            if (
              0 !== (root & 4) &&
              ((root = firstChild.updateQueue),
              (root = null !== root ? root.events : null),
              null !== root)
            )
              for (
                JSCompiler_temp = 0;
                JSCompiler_temp < root.length;
                JSCompiler_temp++
              )
                (anchorOffset = root[JSCompiler_temp]),
                  (anchorOffset.ref.impl = anchorOffset.nextImpl);
            break;
          case 11:
          case 15:
            break;
          case 1:
            if (0 !== (root & 1024) && null !== focusNode) {
              root = void 0;
              JSCompiler_temp = firstChild;
              anchorOffset = focusNode.memoizedProps;
              focusNode = focusNode.memoizedState;
              selection = JSCompiler_temp.stateNode;
              try {
                var resolvedPrevProps = resolveClassComponentProps(
                  JSCompiler_temp.type,
                  anchorOffset
                );
                root = selection.getSnapshotBeforeUpdate(
                  resolvedPrevProps,
                  focusNode
                );
                selection.__reactInternalSnapshotBeforeUpdate = root;
              } catch (error) {
                captureCommitPhaseError(
                  JSCompiler_temp,
                  JSCompiler_temp.return,
                  error
                );
              }
            }
            break;
          case 3:
            if (0 !== (root & 1024))
              if (
                ((root = firstChild.stateNode.containerInfo),
                (JSCompiler_temp = root.nodeType),
                9 === JSCompiler_temp)
              )
                clearContainerSparingly(root);
              else if (1 === JSCompiler_temp)
                switch (root.nodeName) {
                  case "HEAD":
                  case "HTML":
                  case "BODY":
                    clearContainerSparingly(root);
                    break;
                  default:
                    root.textContent = "";
                }
            break;
          case 5:
          case 26:
          case 27:
          case 6:
          case 4:
          case 17:
            break;
          default:
            if (0 !== (root & 1024)) throw Error(formatProdErrorMessage(163));
        }
        root = firstChild.sibling;
        if (null !== root) {
          root.return = firstChild.return;
          nextEffect = root;
          break;
        }
        nextEffect = firstChild.return;
      }
}
function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
  var flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 15:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      flags & 4 && commitHookEffectListMount(5, finishedWork);
      break;
    case 1:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      if (flags & 4)
        if (((finishedRoot = finishedWork.stateNode), null === current))
          try {
            finishedRoot.componentDidMount();
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        else {
          var prevProps = resolveClassComponentProps(
            finishedWork.type,
            current.memoizedProps
          );
          current = current.memoizedState;
          try {
            finishedRoot.componentDidUpdate(
              prevProps,
              current,
              finishedRoot.__reactInternalSnapshotBeforeUpdate
            );
          } catch (error$139) {
            captureCommitPhaseError(
              finishedWork,
              finishedWork.return,
              error$139
            );
          }
        }
      flags & 64 && commitClassCallbacks(finishedWork);
      flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
      break;
    case 3:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      if (
        flags & 64 &&
        ((finishedRoot = finishedWork.updateQueue), null !== finishedRoot)
      ) {
        current = null;
        if (null !== finishedWork.child)
          switch (finishedWork.child.tag) {
            case 27:
            case 5:
              current = finishedWork.child.stateNode;
              break;
            case 1:
              current = finishedWork.child.stateNode;
          }
        try {
          commitCallbacks(finishedRoot, current);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      break;
    case 27:
      null === current &&
        flags & 4 &&
        commitHostSingletonAcquisition(finishedWork);
    case 26:
    case 5:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      null === current && flags & 4 && commitHostMount(finishedWork);
      flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
      break;
    case 12:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      break;
    case 31:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
      break;
    case 13:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
      flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
      flags & 64 &&
        ((finishedRoot = finishedWork.memoizedState),
        null !== finishedRoot &&
          ((finishedRoot = finishedRoot.dehydrated),
          null !== finishedRoot &&
            ((finishedWork = retryDehydratedSuspenseBoundary.bind(
              null,
              finishedWork
            )),
            registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
      break;
    case 22:
      flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
      if (!flags) {
        current =
          (null !== current && null !== current.memoizedState) ||
          offscreenSubtreeWasHidden;
        prevProps = offscreenSubtreeIsHidden;
        var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = flags;
        (offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden
          ? recursivelyTraverseReappearLayoutEffects(
              finishedRoot,
              finishedWork,
              0 !== (finishedWork.subtreeFlags & 8772)
            )
          : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        offscreenSubtreeIsHidden = prevProps;
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
      }
      break;
    case 30:
      break;
    default:
      recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
  }
}
function detachFiberAfterEffects(fiber) {
  var alternate = fiber.alternate;
  null !== alternate &&
    ((fiber.alternate = null), detachFiberAfterEffects(alternate));
  fiber.child = null;
  fiber.deletions = null;
  fiber.sibling = null;
  5 === fiber.tag &&
    ((alternate = fiber.stateNode),
    null !== alternate && detachDeletedInstance(alternate));
  fiber.stateNode = null;
  fiber.return = null;
  fiber.dependencies = null;
  fiber.memoizedProps = null;
  fiber.memoizedState = null;
  fiber.pendingProps = null;
  fiber.stateNode = null;
  fiber.updateQueue = null;
}
var hostParent = null,
  hostParentIsContainer = !1;
function recursivelyTraverseDeletionEffects(
  finishedRoot,
  nearestMountedAncestor,
  parent
) {
  for (parent = parent.child; null !== parent; )
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent),
      (parent = parent.sibling);
}
function commitDeletionEffectsOnFiber(
  finishedRoot,
  nearestMountedAncestor,
  deletedFiber
) {
  if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount)
    try {
      injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
    } catch (err) {}
  switch (deletedFiber.tag) {
    case 26:
      offscreenSubtreeWasHidden ||
        safelyDetachRef(deletedFiber, nearestMountedAncestor);
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      deletedFiber.memoizedState
        ? deletedFiber.memoizedState.count--
        : deletedFiber.stateNode &&
          ((deletedFiber = deletedFiber.stateNode),
          deletedFiber.parentNode.removeChild(deletedFiber));
      break;
    case 27:
      offscreenSubtreeWasHidden ||
        safelyDetachRef(deletedFiber, nearestMountedAncestor);
      var prevHostParent = hostParent,
        prevHostParentIsContainer = hostParentIsContainer;
      isSingletonScope(deletedFiber.type) &&
        ((hostParent = deletedFiber.stateNode), (hostParentIsContainer = !1));
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      releaseSingletonInstance(deletedFiber.stateNode);
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      break;
    case 5:
      offscreenSubtreeWasHidden ||
        safelyDetachRef(deletedFiber, nearestMountedAncestor);
    case 6:
      prevHostParent = hostParent;
      prevHostParentIsContainer = hostParentIsContainer;
      hostParent = null;
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      if (null !== hostParent)
        if (hostParentIsContainer)
          try {
            (9 === hostParent.nodeType
              ? hostParent.body
              : "HTML" === hostParent.nodeName
                ? hostParent.ownerDocument.body
                : hostParent
            ).removeChild(deletedFiber.stateNode);
          } catch (error) {
            captureCommitPhaseError(
              deletedFiber,
              nearestMountedAncestor,
              error
            );
          }
        else
          try {
            hostParent.removeChild(deletedFiber.stateNode);
          } catch (error) {
            captureCommitPhaseError(
              deletedFiber,
              nearestMountedAncestor,
              error
            );
          }
      break;
    case 18:
      null !== hostParent &&
        (hostParentIsContainer
          ? ((finishedRoot = hostParent),
            clearHydrationBoundary(
              9 === finishedRoot.nodeType
                ? finishedRoot.body
                : "HTML" === finishedRoot.nodeName
                  ? finishedRoot.ownerDocument.body
                  : finishedRoot,
              deletedFiber.stateNode
            ),
            retryIfBlockedOn(finishedRoot))
          : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
      break;
    case 4:
      prevHostParent = hostParent;
      prevHostParentIsContainer = hostParentIsContainer;
      hostParent = deletedFiber.stateNode.containerInfo;
      hostParentIsContainer = !0;
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
      offscreenSubtreeWasHidden ||
        commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      break;
    case 1:
      offscreenSubtreeWasHidden ||
        (safelyDetachRef(deletedFiber, nearestMountedAncestor),
        (prevHostParent = deletedFiber.stateNode),
        "function" === typeof prevHostParent.componentWillUnmount &&
          safelyCallComponentWillUnmount(
            deletedFiber,
            nearestMountedAncestor,
            prevHostParent
          ));
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      break;
    case 21:
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      break;
    case 22:
      offscreenSubtreeWasHidden =
        (prevHostParent = offscreenSubtreeWasHidden) ||
        null !== deletedFiber.memoizedState;
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      offscreenSubtreeWasHidden = prevHostParent;
      break;
    default:
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
  }
}
function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
  if (
    null === finishedWork.memoizedState &&
    ((finishedRoot = finishedWork.alternate),
    null !== finishedRoot &&
      ((finishedRoot = finishedRoot.memoizedState), null !== finishedRoot))
  ) {
    finishedRoot = finishedRoot.dehydrated;
    try {
      retryIfBlockedOn(finishedRoot);
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
}
function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
  if (
    null === finishedWork.memoizedState &&
    ((finishedRoot = finishedWork.alternate),
    null !== finishedRoot &&
      ((finishedRoot = finishedRoot.memoizedState),
      null !== finishedRoot &&
        ((finishedRoot = finishedRoot.dehydrated), null !== finishedRoot)))
  )
    try {
      retryIfBlockedOn(finishedRoot);
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
}
function getRetryCache(finishedWork) {
  switch (finishedWork.tag) {
    case 31:
    case 13:
    case 19:
      var retryCache = finishedWork.stateNode;
      null === retryCache &&
        (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
      return retryCache;
    case 22:
      return (
        (finishedWork = finishedWork.stateNode),
        (retryCache = finishedWork._retryCache),
        null === retryCache &&
          (retryCache = finishedWork._retryCache = new PossiblyWeakSet()),
        retryCache
      );
    default:
      throw Error(formatProdErrorMessage(435, finishedWork.tag));
  }
}
function attachSuspenseRetryListeners(finishedWork, wakeables) {
  var retryCache = getRetryCache(finishedWork);
  wakeables.forEach(function (wakeable) {
    if (!retryCache.has(wakeable)) {
      retryCache.add(wakeable);
      var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
      wakeable.then(retry, retry);
    }
  });
}
function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
  var deletions = parentFiber.deletions;
  if (null !== deletions)
    for (var i = 0; i < deletions.length; i++) {
      var childToDelete = deletions[i],
        root = root$jscomp$0,
        returnFiber = parentFiber,
        parent = returnFiber;
      a: for (; null !== parent; ) {
        switch (parent.tag) {
          case 27:
            if (isSingletonScope(parent.type)) {
              hostParent = parent.stateNode;
              hostParentIsContainer = !1;
              break a;
            }
            break;
          case 5:
            hostParent = parent.stateNode;
            hostParentIsContainer = !1;
            break a;
          case 3:
          case 4:
            hostParent = parent.stateNode.containerInfo;
            hostParentIsContainer = !0;
            break a;
        }
        parent = parent.return;
      }
      if (null === hostParent) throw Error(formatProdErrorMessage(160));
      commitDeletionEffectsOnFiber(root, returnFiber, childToDelete);
      hostParent = null;
      hostParentIsContainer = !1;
      root = childToDelete.alternate;
      null !== root && (root.return = null);
      childToDelete.return = null;
    }
  if (parentFiber.subtreeFlags & 13886)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      commitMutationEffectsOnFiber(parentFiber, root$jscomp$0),
        (parentFiber = parentFiber.sibling);
}
var currentHoistableRoot = null;
function commitMutationEffectsOnFiber(finishedWork, root) {
  var current = finishedWork.alternate,
    flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 4 &&
        (commitHookEffectListUnmount(3, finishedWork, finishedWork.return),
        commitHookEffectListMount(3, finishedWork),
        commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
      break;
    case 1:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 &&
        (offscreenSubtreeWasHidden ||
          null === current ||
          safelyDetachRef(current, current.return));
      flags & 64 &&
        offscreenSubtreeIsHidden &&
        ((finishedWork = finishedWork.updateQueue),
        null !== finishedWork &&
          ((flags = finishedWork.callbacks),
          null !== flags &&
            ((current = finishedWork.shared.hiddenCallbacks),
            (finishedWork.shared.hiddenCallbacks =
              null === current ? flags : current.concat(flags)))));
      break;
    case 26:
      var hoistableRoot = currentHoistableRoot;
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 &&
        (offscreenSubtreeWasHidden ||
          null === current ||
          safelyDetachRef(current, current.return));
      if (flags & 4) {
        var currentResource = null !== current ? current.memoizedState : null;
        flags = finishedWork.memoizedState;
        if (null === current)
          if (null === flags)
            if (null === finishedWork.stateNode) {
              a: {
                flags = finishedWork.type;
                current = finishedWork.memoizedProps;
                hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
                b: switch (flags) {
                  case "title":
                    currentResource =
                      hoistableRoot.getElementsByTagName("title")[0];
                    if (
                      !currentResource ||
                      currentResource[internalHoistableMarker] ||
                      currentResource[internalInstanceKey] ||
                      "http://www.w3.org/2000/svg" ===
                        currentResource.namespaceURI ||
                      currentResource.hasAttribute("itemprop")
                    )
                      (currentResource = hoistableRoot.createElement(flags)),
                        hoistableRoot.head.insertBefore(
                          currentResource,
                          hoistableRoot.querySelector("head > title")
                        );
                    setInitialProperties(currentResource, flags, current);
                    currentResource[internalInstanceKey] = finishedWork;
                    markNodeAsHoistable(currentResource);
                    flags = currentResource;
                    break a;
                  case "link":
                    var maybeNodes = getHydratableHoistableCache(
                      "link",
                      "href",
                      hoistableRoot
                    ).get(flags + (current.href || ""));
                    if (maybeNodes)
                      for (var i = 0; i < maybeNodes.length; i++)
                        if (
                          ((currentResource = maybeNodes[i]),
                          currentResource.getAttribute("href") ===
                            (null == current.href || "" === current.href
                              ? null
                              : current.href) &&
                            currentResource.getAttribute("rel") ===
                              (null == current.rel ? null : current.rel) &&
                            currentResource.getAttribute("title") ===
                              (null == current.title ? null : current.title) &&
                            currentResource.getAttribute("crossorigin") ===
                              (null == current.crossOrigin
                                ? null
                                : current.crossOrigin))
                        ) {
                          maybeNodes.splice(i, 1);
                          break b;
                        }
                    currentResource = hoistableRoot.createElement(flags);
                    setInitialProperties(currentResource, flags, current);
                    hoistableRoot.head.appendChild(currentResource);
                    break;
                  case "meta":
                    if (
                      (maybeNodes = getHydratableHoistableCache(
                        "meta",
                        "content",
                        hoistableRoot
                      ).get(flags + (current.content || "")))
                    )
                      for (i = 0; i < maybeNodes.length; i++)
                        if (
                          ((currentResource = maybeNodes[i]),
                          currentResource.getAttribute("content") ===
                            (null == current.content
                              ? null
                              : "" + current.content) &&
                            currentResource.getAttribute("name") ===
                              (null == current.name ? null : current.name) &&
                            currentResource.getAttribute("property") ===
                              (null == current.property
                                ? null
                                : current.property) &&
                            currentResource.getAttribute("http-equiv") ===
                              (null == current.httpEquiv
                                ? null
                                : current.httpEquiv) &&
                            currentResource.getAttribute("charset") ===
                              (null == current.charSet
                                ? null
                                : current.charSet))
                        ) {
                          maybeNodes.splice(i, 1);
                          break b;
                        }
                    currentResource = hoistableRoot.createElement(flags);
                    setInitialProperties(currentResource, flags, current);
                    hoistableRoot.head.appendChild(currentResource);
                    break;
                  default:
                    throw Error(formatProdErrorMessage(468, flags));
                }
                currentResource[internalInstanceKey] = finishedWork;
                markNodeAsHoistable(currentResource);
                flags = currentResource;
              }
              finishedWork.stateNode = flags;
            } else
              mountHoistable(
                hoistableRoot,
                finishedWork.type,
                finishedWork.stateNode
              );
          else
            finishedWork.stateNode = acquireResource(
              hoistableRoot,
              flags,
              finishedWork.memoizedProps
            );
        else
          currentResource !== flags
            ? (null === currentResource
                ? null !== current.stateNode &&
                  ((current = current.stateNode),
                  current.parentNode.removeChild(current))
                : currentResource.count--,
              null === flags
                ? mountHoistable(
                    hoistableRoot,
                    finishedWork.type,
                    finishedWork.stateNode
                  )
                : acquireResource(
                    hoistableRoot,
                    flags,
                    finishedWork.memoizedProps
                  ))
            : null === flags &&
              null !== finishedWork.stateNode &&
              commitHostUpdate(
                finishedWork,
                finishedWork.memoizedProps,
                current.memoizedProps
              );
      }
      break;
    case 27:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 &&
        (offscreenSubtreeWasHidden ||
          null === current ||
          safelyDetachRef(current, current.return));
      null !== current &&
        flags & 4 &&
        commitHostUpdate(
          finishedWork,
          finishedWork.memoizedProps,
          current.memoizedProps
        );
      break;
    case 5:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 512 &&
        (offscreenSubtreeWasHidden ||
          null === current ||
          safelyDetachRef(current, current.return));
      if (finishedWork.flags & 32) {
        hoistableRoot = finishedWork.stateNode;
        try {
          setTextContent(hoistableRoot, "");
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      flags & 4 &&
        null != finishedWork.stateNode &&
        ((hoistableRoot = finishedWork.memoizedProps),
        commitHostUpdate(
          finishedWork,
          hoistableRoot,
          null !== current ? current.memoizedProps : hoistableRoot
        ));
      flags & 1024 && (needsFormReset = !0);
      break;
    case 6:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      if (flags & 4) {
        if (null === finishedWork.stateNode)
          throw Error(formatProdErrorMessage(162));
        flags = finishedWork.memoizedProps;
        current = finishedWork.stateNode;
        try {
          current.nodeValue = flags;
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      break;
    case 3:
      tagCaches = null;
      hoistableRoot = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(root.containerInfo);
      recursivelyTraverseMutationEffects(root, finishedWork);
      currentHoistableRoot = hoistableRoot;
      commitReconciliationEffects(finishedWork);
      if (flags & 4 && null !== current && current.memoizedState.isDehydrated)
        try {
          retryIfBlockedOn(root.containerInfo);
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      needsFormReset &&
        ((needsFormReset = !1), recursivelyResetForms(finishedWork));
      break;
    case 4:
      flags = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(
        finishedWork.stateNode.containerInfo
      );
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      currentHoistableRoot = flags;
      break;
    case 12:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      break;
    case 31:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 4 &&
        ((flags = finishedWork.updateQueue),
        null !== flags &&
          ((finishedWork.updateQueue = null),
          attachSuspenseRetryListeners(finishedWork, flags)));
      break;
    case 13:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      finishedWork.child.flags & 8192 &&
        (null !== finishedWork.memoizedState) !==
          (null !== current && null !== current.memoizedState) &&
        (globalMostRecentFallbackTime = now());
      flags & 4 &&
        ((flags = finishedWork.updateQueue),
        null !== flags &&
          ((finishedWork.updateQueue = null),
          attachSuspenseRetryListeners(finishedWork, flags)));
      break;
    case 22:
      hoistableRoot = null !== finishedWork.memoizedState;
      var wasHidden = null !== current && null !== current.memoizedState,
        prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden,
        prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
      offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
      offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
      recursivelyTraverseMutationEffects(root, finishedWork);
      offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
      offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
      commitReconciliationEffects(finishedWork);
      if (flags & 8192)
        a: for (
          root = finishedWork.stateNode,
            root._visibility = hoistableRoot
              ? root._visibility & -2
              : root._visibility | 1,
            hoistableRoot &&
              (null === current ||
                wasHidden ||
                offscreenSubtreeIsHidden ||
                offscreenSubtreeWasHidden ||
                recursivelyTraverseDisappearLayoutEffects(finishedWork)),
            current = null,
            root = finishedWork;
          ;

        ) {
          if (5 === root.tag || 26 === root.tag) {
            if (null === current) {
              wasHidden = current = root;
              try {
                if (((currentResource = wasHidden.stateNode), hoistableRoot))
                  (maybeNodes = currentResource.style),
                    "function" === typeof maybeNodes.setProperty
                      ? maybeNodes.setProperty("display", "none", "important")
                      : (maybeNodes.display = "none");
                else {
                  i = wasHidden.stateNode;
                  var styleProp = wasHidden.memoizedProps.style,
                    display =
                      void 0 !== styleProp &&
                      null !== styleProp &&
                      styleProp.hasOwnProperty("display")
                        ? styleProp.display
                        : null;
                  i.style.display =
                    null == display || "boolean" === typeof display
                      ? ""
                      : ("" + display).trim();
                }
              } catch (error) {
                captureCommitPhaseError(wasHidden, wasHidden.return, error);
              }
            }
          } else if (6 === root.tag) {
            if (null === current) {
              wasHidden = root;
              try {
                wasHidden.stateNode.nodeValue = hoistableRoot
                  ? ""
                  : wasHidden.memoizedProps;
              } catch (error) {
                captureCommitPhaseError(wasHidden, wasHidden.return, error);
              }
            }
          } else if (18 === root.tag) {
            if (null === current) {
              wasHidden = root;
              try {
                var instance = wasHidden.stateNode;
                hoistableRoot
                  ? hideOrUnhideDehydratedBoundary(instance, !0)
                  : hideOrUnhideDehydratedBoundary(wasHidden.stateNode, !1);
              } catch (error) {
                captureCommitPhaseError(wasHidden, wasHidden.return, error);
              }
            }
          } else if (
            ((22 !== root.tag && 23 !== root.tag) ||
              null === root.memoizedState ||
              root === finishedWork) &&
            null !== root.child
          ) {
            root.child.return = root;
            root = root.child;
            continue;
          }
          if (root === finishedWork) break a;
          for (; null === root.sibling; ) {
            if (null === root.return || root.return === finishedWork) break a;
            current === root && (current = null);
            root = root.return;
          }
          current === root && (current = null);
          root.sibling.return = root.return;
          root = root.sibling;
        }
      flags & 4 &&
        ((flags = finishedWork.updateQueue),
        null !== flags &&
          ((current = flags.retryQueue),
          null !== current &&
            ((flags.retryQueue = null),
            attachSuspenseRetryListeners(finishedWork, current))));
      break;
    case 19:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      flags & 4 &&
        ((flags = finishedWork.updateQueue),
        null !== flags &&
          ((finishedWork.updateQueue = null),
          attachSuspenseRetryListeners(finishedWork, flags)));
      break;
    case 30:
      break;
    case 21:
      break;
    default:
      recursivelyTraverseMutationEffects(root, finishedWork),
        commitReconciliationEffects(finishedWork);
  }
}
function commitReconciliationEffects(finishedWork) {
  var flags = finishedWork.flags;
  if (flags & 2) {
    try {
      for (
        var hostParentFiber, parentFiber = finishedWork.return;
        null !== parentFiber;

      ) {
        if (isHostParent(parentFiber)) {
          hostParentFiber = parentFiber;
          break;
        }
        parentFiber = parentFiber.return;
      }
      if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
      switch (hostParentFiber.tag) {
        case 27:
          var parent = hostParentFiber.stateNode,
            before = getHostSibling(finishedWork);
          insertOrAppendPlacementNode(finishedWork, before, parent);
          break;
        case 5:
          var parent$141 = hostParentFiber.stateNode;
          hostParentFiber.flags & 32 &&
            (setTextContent(parent$141, ""), (hostParentFiber.flags &= -33));
          var before$142 = getHostSibling(finishedWork);
          insertOrAppendPlacementNode(finishedWork, before$142, parent$141);
          break;
        case 3:
        case 4:
          var parent$143 = hostParentFiber.stateNode.containerInfo,
            before$144 = getHostSibling(finishedWork);
          insertOrAppendPlacementNodeIntoContainer(
            finishedWork,
            before$144,
            parent$143
          );
          break;
        default:
          throw Error(formatProdErrorMessage(161));
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
    finishedWork.flags &= -3;
  }
  flags & 4096 && (finishedWork.flags &= -4097);
}
function recursivelyResetForms(parentFiber) {
  if (parentFiber.subtreeFlags & 1024)
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var fiber = parentFiber;
      recursivelyResetForms(fiber);
      5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset();
      parentFiber = parentFiber.sibling;
    }
}
function recursivelyTraverseLayoutEffects(root, parentFiber) {
  if (parentFiber.subtreeFlags & 8772)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      commitLayoutEffectOnFiber(root, parentFiber.alternate, parentFiber),
        (parentFiber = parentFiber.sibling);
}
function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
  for (parentFiber = parentFiber.child; null !== parentFiber; ) {
    var finishedWork = parentFiber;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 1:
        safelyDetachRef(finishedWork, finishedWork.return);
        var instance = finishedWork.stateNode;
        "function" === typeof instance.componentWillUnmount &&
          safelyCallComponentWillUnmount(
            finishedWork,
            finishedWork.return,
            instance
          );
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 27:
        releaseSingletonInstance(finishedWork.stateNode);
      case 26:
      case 5:
        safelyDetachRef(finishedWork, finishedWork.return);
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 22:
        null === finishedWork.memoizedState &&
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      case 30:
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
        break;
      default:
        recursivelyTraverseDisappearLayoutEffects(finishedWork);
    }
    parentFiber = parentFiber.sibling;
  }
}
function recursivelyTraverseReappearLayoutEffects(
  finishedRoot$jscomp$0,
  parentFiber,
  includeWorkInProgressEffects
) {
  includeWorkInProgressEffects =
    includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 8772);
  for (parentFiber = parentFiber.child; null !== parentFiber; ) {
    var current = parentFiber.alternate,
      finishedRoot = finishedRoot$jscomp$0,
      finishedWork = parentFiber,
      flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        commitHookEffectListMount(4, finishedWork);
        break;
      case 1:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        current = finishedWork;
        finishedRoot = current.stateNode;
        if ("function" === typeof finishedRoot.componentDidMount)
          try {
            finishedRoot.componentDidMount();
          } catch (error) {
            captureCommitPhaseError(current, current.return, error);
          }
        current = finishedWork;
        finishedRoot = current.updateQueue;
        if (null !== finishedRoot) {
          var instance = current.stateNode;
          try {
            var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
            if (null !== hiddenCallbacks)
              for (
                finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0;
                finishedRoot < hiddenCallbacks.length;
                finishedRoot++
              )
                callCallback(hiddenCallbacks[finishedRoot], instance);
          } catch (error) {
            captureCommitPhaseError(current, current.return, error);
          }
        }
        includeWorkInProgressEffects &&
          flags & 64 &&
          commitClassCallbacks(finishedWork);
        safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 27:
        commitHostSingletonAcquisition(finishedWork);
      case 26:
      case 5:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        includeWorkInProgressEffects &&
          null === current &&
          flags & 4 &&
          commitHostMount(finishedWork);
        safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 12:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        break;
      case 31:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        includeWorkInProgressEffects &&
          flags & 4 &&
          commitActivityHydrationCallbacks(finishedRoot, finishedWork);
        break;
      case 13:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
        includeWorkInProgressEffects &&
          flags & 4 &&
          commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
        break;
      case 22:
        null === finishedWork.memoizedState &&
          recursivelyTraverseReappearLayoutEffects(
            finishedRoot,
            finishedWork,
            includeWorkInProgressEffects
          );
        safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 30:
        break;
      default:
        recursivelyTraverseReappearLayoutEffects(
          finishedRoot,
          finishedWork,
          includeWorkInProgressEffects
        );
    }
    parentFiber = parentFiber.sibling;
  }
}
function commitOffscreenPassiveMountEffects(current, finishedWork) {
  var previousCache = null;
  null !== current &&
    null !== current.memoizedState &&
    null !== current.memoizedState.cachePool &&
    (previousCache = current.memoizedState.cachePool.pool);
  current = null;
  null !== finishedWork.memoizedState &&
    null !== finishedWork.memoizedState.cachePool &&
    (current = finishedWork.memoizedState.cachePool.pool);
  current !== previousCache &&
    (null != current && current.refCount++,
    null != previousCache && releaseCache(previousCache));
}
function commitCachePassiveMountEffect(current, finishedWork) {
  current = null;
  null !== finishedWork.alternate &&
    (current = finishedWork.alternate.memoizedState.cache);
  finishedWork = finishedWork.memoizedState.cache;
  finishedWork !== current &&
    (finishedWork.refCount++, null != current && releaseCache(current));
}
function recursivelyTraversePassiveMountEffects(
  root,
  parentFiber,
  committedLanes,
  committedTransitions
) {
  if (parentFiber.subtreeFlags & 10256)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      commitPassiveMountOnFiber(
        root,
        parentFiber,
        committedLanes,
        committedTransitions
      ),
        (parentFiber = parentFiber.sibling);
}
function commitPassiveMountOnFiber(
  finishedRoot,
  finishedWork,
  committedLanes,
  committedTransitions
) {
  var flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 15:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      flags & 2048 && commitHookEffectListMount(9, finishedWork);
      break;
    case 1:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      break;
    case 3:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      flags & 2048 &&
        ((finishedRoot = null),
        null !== finishedWork.alternate &&
          (finishedRoot = finishedWork.alternate.memoizedState.cache),
        (finishedWork = finishedWork.memoizedState.cache),
        finishedWork !== finishedRoot &&
          (finishedWork.refCount++,
          null != finishedRoot && releaseCache(finishedRoot)));
      break;
    case 12:
      if (flags & 2048) {
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
        finishedRoot = finishedWork.stateNode;
        try {
          var _finishedWork$memoize2 = finishedWork.memoizedProps,
            id = _finishedWork$memoize2.id,
            onPostCommit = _finishedWork$memoize2.onPostCommit;
          "function" === typeof onPostCommit &&
            onPostCommit(
              id,
              null === finishedWork.alternate ? "mount" : "update",
              finishedRoot.passiveEffectDuration,
              -0
            );
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      } else
        recursivelyTraversePassiveMountEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions
        );
      break;
    case 31:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      break;
    case 13:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      break;
    case 23:
      break;
    case 22:
      _finishedWork$memoize2 = finishedWork.stateNode;
      id = finishedWork.alternate;
      null !== finishedWork.memoizedState
        ? _finishedWork$memoize2._visibility & 2
          ? recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            )
          : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork)
        : _finishedWork$memoize2._visibility & 2
          ? recursivelyTraversePassiveMountEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions
            )
          : ((_finishedWork$memoize2._visibility |= 2),
            recursivelyTraverseReconnectPassiveEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions,
              0 !== (finishedWork.subtreeFlags & 10256) || !1
            ));
      flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
      break;
    case 24:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      flags & 2048 &&
        commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
      break;
    default:
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
  }
}
function recursivelyTraverseReconnectPassiveEffects(
  finishedRoot$jscomp$0,
  parentFiber,
  committedLanes$jscomp$0,
  committedTransitions$jscomp$0,
  includeWorkInProgressEffects
) {
  includeWorkInProgressEffects =
    includeWorkInProgressEffects &&
    (0 !== (parentFiber.subtreeFlags & 10256) || !1);
  for (parentFiber = parentFiber.child; null !== parentFiber; ) {
    var finishedRoot = finishedRoot$jscomp$0,
      finishedWork = parentFiber,
      committedLanes = committedLanes$jscomp$0,
      committedTransitions = committedTransitions$jscomp$0,
      flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          includeWorkInProgressEffects
        );
        commitHookEffectListMount(8, finishedWork);
        break;
      case 23:
        break;
      case 22:
        var instance = finishedWork.stateNode;
        null !== finishedWork.memoizedState
          ? instance._visibility & 2
            ? recursivelyTraverseReconnectPassiveEffects(
                finishedRoot,
                finishedWork,
                committedLanes,
                committedTransitions,
                includeWorkInProgressEffects
              )
            : recursivelyTraverseAtomicPassiveEffects(
                finishedRoot,
                finishedWork
              )
          : ((instance._visibility |= 2),
            recursivelyTraverseReconnectPassiveEffects(
              finishedRoot,
              finishedWork,
              committedLanes,
              committedTransitions,
              includeWorkInProgressEffects
            ));
        includeWorkInProgressEffects &&
          flags & 2048 &&
          commitOffscreenPassiveMountEffects(
            finishedWork.alternate,
            finishedWork
          );
        break;
      case 24:
        recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          includeWorkInProgressEffects
        );
        includeWorkInProgressEffects &&
          flags & 2048 &&
          commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
        break;
      default:
        recursivelyTraverseReconnectPassiveEffects(
          finishedRoot,
          finishedWork,
          committedLanes,
          committedTransitions,
          includeWorkInProgressEffects
        );
    }
    parentFiber = parentFiber.sibling;
  }
}
function recursivelyTraverseAtomicPassiveEffects(
  finishedRoot$jscomp$0,
  parentFiber
) {
  if (parentFiber.subtreeFlags & 10256)
    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
      var finishedRoot = finishedRoot$jscomp$0,
        finishedWork = parentFiber,
        flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 22:
          recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
          flags & 2048 &&
            commitOffscreenPassiveMountEffects(
              finishedWork.alternate,
              finishedWork
            );
          break;
        case 24:
          recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
          flags & 2048 &&
            commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
          break;
        default:
          recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
      }
      parentFiber = parentFiber.sibling;
    }
}
var suspenseyCommitFlag = 8192;
function recursivelyAccumulateSuspenseyCommit(
  parentFiber,
  committedLanes,
  suspendedState
) {
  if (parentFiber.subtreeFlags & suspenseyCommitFlag)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      accumulateSuspenseyCommitOnFiber(
        parentFiber,
        committedLanes,
        suspendedState
      ),
        (parentFiber = parentFiber.sibling);
}
function accumulateSuspenseyCommitOnFiber(
  fiber,
  committedLanes,
  suspendedState
) {
  switch (fiber.tag) {
    case 26:
      recursivelyAccumulateSuspenseyCommit(
        fiber,
        committedLanes,
        suspendedState
      );
      fiber.flags & suspenseyCommitFlag &&
        null !== fiber.memoizedState &&
        suspendResource(
          suspendedState,
          currentHoistableRoot,
          fiber.memoizedState,
          fiber.memoizedProps
        );
      break;
    case 5:
      recursivelyAccumulateSuspenseyCommit(
        fiber,
        committedLanes,
        suspendedState
      );
      break;
    case 3:
    case 4:
      var previousHoistableRoot = currentHoistableRoot;
      currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
      recursivelyAccumulateSuspenseyCommit(
        fiber,
        committedLanes,
        suspendedState
      );
      currentHoistableRoot = previousHoistableRoot;
      break;
    case 22:
      null === fiber.memoizedState &&
        ((previousHoistableRoot = fiber.alternate),
        null !== previousHoistableRoot &&
        null !== previousHoistableRoot.memoizedState
          ? ((previousHoistableRoot = suspenseyCommitFlag),
            (suspenseyCommitFlag = 16777216),
            recursivelyAccumulateSuspenseyCommit(
              fiber,
              committedLanes,
              suspendedState
            ),
            (suspenseyCommitFlag = previousHoistableRoot))
          : recursivelyAccumulateSuspenseyCommit(
              fiber,
              committedLanes,
              suspendedState
            ));
      break;
    default:
      recursivelyAccumulateSuspenseyCommit(
        fiber,
        committedLanes,
        suspendedState
      );
  }
}
function detachAlternateSiblings(parentFiber) {
  var previousFiber = parentFiber.alternate;
  if (
    null !== previousFiber &&
    ((parentFiber = previousFiber.child), null !== parentFiber)
  ) {
    previousFiber.child = null;
    do
      (previousFiber = parentFiber.sibling),
        (parentFiber.sibling = null),
        (parentFiber = previousFiber);
    while (null !== parentFiber);
  }
}
function recursivelyTraversePassiveUnmountEffects(parentFiber) {
  var deletions = parentFiber.deletions;
  if (0 !== (parentFiber.flags & 16)) {
    if (null !== deletions)
      for (var i = 0; i < deletions.length; i++) {
        var childToDelete = deletions[i];
        nextEffect = childToDelete;
        commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
          childToDelete,
          parentFiber
        );
      }
    detachAlternateSiblings(parentFiber);
  }
  if (parentFiber.subtreeFlags & 10256)
    for (parentFiber = parentFiber.child; null !== parentFiber; )
      commitPassiveUnmountOnFiber(parentFiber),
        (parentFiber = parentFiber.sibling);
}
function commitPassiveUnmountOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case 0:
    case 11:
    case 15:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      finishedWork.flags & 2048 &&
        commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
      break;
    case 3:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    case 12:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    case 22:
      var instance = finishedWork.stateNode;
      null !== finishedWork.memoizedState &&
      instance._visibility & 2 &&
      (null === finishedWork.return || 13 !== finishedWork.return.tag)
        ? ((instance._visibility &= -3),
          recursivelyTraverseDisconnectPassiveEffects(finishedWork))
        : recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    default:
      recursivelyTraversePassiveUnmountEffects(finishedWork);
  }
}
function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
  var deletions = parentFiber.deletions;
  if (0 !== (parentFiber.flags & 16)) {
    if (null !== deletions)
      for (var i = 0; i < deletions.length; i++) {
        var childToDelete = deletions[i];
        nextEffect = childToDelete;
        commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
          childToDelete,
          parentFiber
        );
      }
    detachAlternateSiblings(parentFiber);
  }
  for (parentFiber = parentFiber.child; null !== parentFiber; ) {
    deletions = parentFiber;
    switch (deletions.tag) {
      case 0:
      case 11:
      case 15:
        commitHookEffectListUnmount(8, deletions, deletions.return);
        recursivelyTraverseDisconnectPassiveEffects(deletions);
        break;
      case 22:
        i = deletions.stateNode;
        i._visibility & 2 &&
          ((i._visibility &= -3),
          recursivelyTraverseDisconnectPassiveEffects(deletions));
        break;
      default:
        recursivelyTraverseDisconnectPassiveEffects(deletions);
    }
    parentFiber = parentFiber.sibling;
  }
}
function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
  deletedSubtreeRoot,
  nearestMountedAncestor
) {
  for (; null !== nextEffect; ) {
    var fiber = nextEffect;
    switch (fiber.tag) {
      case 0:
      case 11:
      case 15:
        commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
        break;
      case 23:
      case 22:
        if (
          null !== fiber.memoizedState &&
          null !== fiber.memoizedState.cachePool
        ) {
          var cache = fiber.memoizedState.cachePool.pool;
          null != cache && cache.refCount++;
        }
        break;
      case 24:
        releaseCache(fiber.memoizedState.cache);
    }
    cache = fiber.child;
    if (null !== cache) (cache.return = fiber), (nextEffect = cache);
    else
      a: for (fiber = deletedSubtreeRoot; null !== nextEffect; ) {
        cache = nextEffect;
        var sibling = cache.sibling,
          returnFiber = cache.return;
        detachFiberAfterEffects(cache);
        if (cache === fiber) {
          nextEffect = null;
          break a;
        }
        if (null !== sibling) {
          sibling.return = returnFiber;
          nextEffect = sibling;
          break a;
        }
        nextEffect = returnFiber;
      }
  }
}
var DefaultAsyncDispatcher = {
    getCacheForType: function (resourceType) {
      var cache = readContext(CacheContext),
        cacheForType = cache.data.get(resourceType);
      void 0 === cacheForType &&
        ((cacheForType = resourceType()),
        cache.data.set(resourceType, cacheForType));
      return cacheForType;
    },
    cacheSignal: function () {
      return readContext(CacheContext).controller.signal;
    }
  },
  PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map,
  executionContext = 0,
  workInProgressRoot = null,
  workInProgress = null,
  workInProgressRootRenderLanes = 0,
  workInProgressSuspendedReason = 0,
  workInProgressThrownValue = null,
  workInProgressRootDidSkipSuspendedSiblings = !1,
  workInProgressRootIsPrerendering = !1,
  workInProgressRootDidAttachPingListener = !1,
  entangledRenderLanes = 0,
  workInProgressRootExitStatus = 0,
  workInProgressRootSkippedLanes = 0,
  workInProgressRootInterleavedUpdatedLanes = 0,
  workInProgressRootPingedLanes = 0,
  workInProgressDeferredLane = 0,
  workInProgressSuspendedRetryLanes = 0,
  workInProgressRootConcurrentErrors = null,
  workInProgressRootRecoverableErrors = null,
  workInProgressRootDidIncludeRecursiveRenderUpdate = !1,
  globalMostRecentFallbackTime = 0,
  globalMostRecentTransitionTime = 0,
  workInProgressRootRenderTargetTime = Infinity,
  workInProgressTransitions = null,
  legacyErrorBoundariesThatAlreadyFailed = null,
  pendingEffectsStatus = 0,
  pendingEffectsRoot = null,
  pendingFinishedWork = null,
  pendingEffectsLanes = 0,
  pendingEffectsRemainingLanes = 0,
  pendingPassiveTransitions = null,
  pendingRecoverableErrors = null,
  nestedUpdateCount = 0,
  rootWithNestedUpdates = null;
function requestUpdateLane() {
  return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes
    ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes
    : null !== ReactSharedInternals.T
      ? requestTransitionLane()
      : resolveUpdatePriority();
}
function requestDeferredLane() {
  if (0 === workInProgressDeferredLane)
    if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
      var lane = nextTransitionDeferredLane;
      nextTransitionDeferredLane <<= 1;
      0 === (nextTransitionDeferredLane & 3932160) &&
        (nextTransitionDeferredLane = 262144);
      workInProgressDeferredLane = lane;
    } else workInProgressDeferredLane = 536870912;
  lane = suspenseHandlerStackCursor.current;
  null !== lane && (lane.flags |= 32);
  return workInProgressDeferredLane;
}
function scheduleUpdateOnFiber(root, fiber, lane) {
  if (
    (root === workInProgressRoot &&
      (2 === workInProgressSuspendedReason ||
        9 === workInProgressSuspendedReason)) ||
    null !== root.cancelPendingCommit
  )
    prepareFreshStack(root, 0),
      markRootSuspended(
        root,
        workInProgressRootRenderLanes,
        workInProgressDeferredLane,
        !1
      );
  markRootUpdated$1(root, lane);
  if (0 === (executionContext & 2) || root !== workInProgressRoot)
    root === workInProgressRoot &&
      (0 === (executionContext & 2) &&
        (workInProgressRootInterleavedUpdatedLanes |= lane),
      4 === workInProgressRootExitStatus &&
        markRootSuspended(
          root,
          workInProgressRootRenderLanes,
          workInProgressDeferredLane,
          !1
        )),
      ensureRootIsScheduled(root);
}
function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
  if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
  var shouldTimeSlice =
      (!forceSync &&
        0 === (lanes & 127) &&
        0 === (lanes & root$jscomp$0.expiredLanes)) ||
      checkIfRootIsPrerendering(root$jscomp$0, lanes),
    exitStatus = shouldTimeSlice
      ? renderRootConcurrent(root$jscomp$0, lanes)
      : renderRootSync(root$jscomp$0, lanes, !0),
    renderWasConcurrent = shouldTimeSlice;
  do {
    if (0 === exitStatus) {
      workInProgressRootIsPrerendering &&
        !shouldTimeSlice &&
        markRootSuspended(root$jscomp$0, lanes, 0, !1);
      break;
    } else {
      forceSync = root$jscomp$0.current.alternate;
      if (
        renderWasConcurrent &&
        !isRenderConsistentWithExternalStores(forceSync)
      ) {
        exitStatus = renderRootSync(root$jscomp$0, lanes, !1);
        renderWasConcurrent = !1;
        continue;
      }
      if (2 === exitStatus) {
        renderWasConcurrent = lanes;
        if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
          var JSCompiler_inline_result = 0;
        else
          (JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913),
            (JSCompiler_inline_result =
              0 !== JSCompiler_inline_result
                ? JSCompiler_inline_result
                : JSCompiler_inline_result & 536870912
                  ? 536870912
                  : 0);
        if (0 !== JSCompiler_inline_result) {
          lanes = JSCompiler_inline_result;
          a: {
            var root = root$jscomp$0;
            exitStatus = workInProgressRootConcurrentErrors;
            var wasRootDehydrated = root.current.memoizedState.isDehydrated;
            wasRootDehydrated &&
              (prepareFreshStack(root, JSCompiler_inline_result).flags |= 256);
            JSCompiler_inline_result = renderRootSync(
              root,
              JSCompiler_inline_result,
              !1
            );
            if (2 !== JSCompiler_inline_result) {
              if (
                workInProgressRootDidAttachPingListener &&
                !wasRootDehydrated
              ) {
                root.errorRecoveryDisabledLanes |= renderWasConcurrent;
                workInProgressRootInterleavedUpdatedLanes |=
                  renderWasConcurrent;
                exitStatus = 4;
                break a;
              }
              renderWasConcurrent = workInProgressRootRecoverableErrors;
              workInProgressRootRecoverableErrors = exitStatus;
              null !== renderWasConcurrent &&
                (null === workInProgressRootRecoverableErrors
                  ? (workInProgressRootRecoverableErrors = renderWasConcurrent)
                  : workInProgressRootRecoverableErrors.push.apply(
                      workInProgressRootRecoverableErrors,
                      renderWasConcurrent
                    ));
            }
            exitStatus = JSCompiler_inline_result;
          }
          renderWasConcurrent = !1;
          if (2 !== exitStatus) continue;
        }
      }
      if (1 === exitStatus) {
        prepareFreshStack(root$jscomp$0, 0);
        markRootSuspended(root$jscomp$0, lanes, 0, !0);
        break;
      }
      a: {
        shouldTimeSlice = root$jscomp$0;
        renderWasConcurrent = exitStatus;
        switch (renderWasConcurrent) {
          case 0:
          case 1:
            throw Error(formatProdErrorMessage(345));
          case 4:
            if ((lanes & 4194048) !== lanes) break;
          case 6:
            markRootSuspended(
              shouldTimeSlice,
              lanes,
              workInProgressDeferredLane,
              !workInProgressRootDidSkipSuspendedSiblings
            );
            break a;
          case 2:
            workInProgressRootRecoverableErrors = null;
            break;
          case 3:
          case 5:
            break;
          default:
            throw Error(formatProdErrorMessage(329));
        }
        if (
          (lanes & 62914560) === lanes &&
          ((exitStatus = globalMostRecentFallbackTime + 300 - now()),
          10 < exitStatus)
        ) {
          markRootSuspended(
            shouldTimeSlice,
            lanes,
            workInProgressDeferredLane,
            !workInProgressRootDidSkipSuspendedSiblings
          );
          if (0 !== getNextLanes(shouldTimeSlice, 0, !0)) break a;
          pendingEffectsLanes = lanes;
          shouldTimeSlice.timeoutHandle = scheduleTimeout(
            commitRootWhenReady.bind(
              null,
              shouldTimeSlice,
              forceSync,
              workInProgressRootRecoverableErrors,
              workInProgressTransitions,
              workInProgressRootDidIncludeRecursiveRenderUpdate,
              lanes,
              workInProgressDeferredLane,
              workInProgressRootInterleavedUpdatedLanes,
              workInProgressSuspendedRetryLanes,
              workInProgressRootDidSkipSuspendedSiblings,
              renderWasConcurrent,
              "Throttled",
              -0,
              0
            ),
            exitStatus
          );
          break a;
        }
        commitRootWhenReady(
          shouldTimeSlice,
          forceSync,
          workInProgressRootRecoverableErrors,
          workInProgressTransitions,
          workInProgressRootDidIncludeRecursiveRenderUpdate,
          lanes,
          workInProgressDeferredLane,
          workInProgressRootInterleavedUpdatedLanes,
          workInProgressSuspendedRetryLanes,
          workInProgressRootDidSkipSuspendedSiblings,
          renderWasConcurrent,
          null,
          -0,
          0
        );
      }
    }
    break;
  } while (1);
  ensureRootIsScheduled(root$jscomp$0);
}
function commitRootWhenReady(
  root,
  finishedWork,
  recoverableErrors,
  transitions,
  didIncludeRenderPhaseUpdate,
  lanes,
  spawnedLane,
  updatedLanes,
  suspendedRetryLanes,
  didSkipSuspendedSiblings,
  exitStatus,
  suspendedCommitReason,
  completedRenderStartTime,
  completedRenderEndTime
) {
  root.timeoutHandle = -1;
  suspendedCommitReason = finishedWork.subtreeFlags;
  if (
    suspendedCommitReason & 8192 ||
    16785408 === (suspendedCommitReason & 16785408)
  ) {
    suspendedCommitReason = {
      stylesheets: null,
      count: 0,
      imgCount: 0,
      imgBytes: 0,
      suspenseyImages: [],
      waitingForImages: !0,
      waitingForViewTransition: !1,
      unsuspend: noop$1
    };
    accumulateSuspenseyCommitOnFiber(
      finishedWork,
      lanes,
      suspendedCommitReason
    );
    var timeoutOffset =
      (lanes & 62914560) === lanes
        ? globalMostRecentFallbackTime - now()
        : (lanes & 4194048) === lanes
          ? globalMostRecentTransitionTime - now()
          : 0;
    timeoutOffset = waitForCommitToBeReady(
      suspendedCommitReason,
      timeoutOffset
    );
    if (null !== timeoutOffset) {
      pendingEffectsLanes = lanes;
      root.cancelPendingCommit = timeoutOffset(
        commitRoot.bind(
          null,
          root,
          finishedWork,
          lanes,
          recoverableErrors,
          transitions,
          didIncludeRenderPhaseUpdate,
          spawnedLane,
          updatedLanes,
          suspendedRetryLanes,
          exitStatus,
          suspendedCommitReason,
          null,
          completedRenderStartTime,
          completedRenderEndTime
        )
      );
      markRootSuspended(root, lanes, spawnedLane, !didSkipSuspendedSiblings);
      return;
    }
  }
  commitRoot(
    root,
    finishedWork,
    lanes,
    recoverableErrors,
    transitions,
    didIncludeRenderPhaseUpdate,
    spawnedLane,
    updatedLanes,
    suspendedRetryLanes
  );
}
function isRenderConsistentWithExternalStores(finishedWork) {
  for (var node = finishedWork; ; ) {
    var tag = node.tag;
    if (
      (0 === tag || 11 === tag || 15 === tag) &&
      node.flags & 16384 &&
      ((tag = node.updateQueue),
      null !== tag && ((tag = tag.stores), null !== tag))
    )
      for (var i = 0; i < tag.length; i++) {
        var check = tag[i],
          getSnapshot = check.getSnapshot;
        check = check.value;
        try {
          if (!objectIs(getSnapshot(), check)) return !1;
        } catch (error) {
          return !1;
        }
      }
    tag = node.child;
    if (node.subtreeFlags & 16384 && null !== tag)
      (tag.return = node), (node = tag);
    else {
      if (node === finishedWork) break;
      for (; null === node.sibling; ) {
        if (null === node.return || node.return === finishedWork) return !0;
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
  }
  return !0;
}
function markRootSuspended(
  root,
  suspendedLanes,
  spawnedLane,
  didAttemptEntireTree
) {
  suspendedLanes &= ~workInProgressRootPingedLanes;
  suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
  root.suspendedLanes |= suspendedLanes;
  root.pingedLanes &= ~suspendedLanes;
  didAttemptEntireTree && (root.warmLanes |= suspendedLanes);
  didAttemptEntireTree = root.expirationTimes;
  for (var lanes = suspendedLanes; 0 < lanes; ) {
    var index$6 = 31 - clz32(lanes),
      lane = 1 << index$6;
    didAttemptEntireTree[index$6] = -1;
    lanes &= ~lane;
  }
  0 !== spawnedLane &&
    markSpawnedDeferredLane(root, spawnedLane, suspendedLanes);
}
function flushSyncWork$1() {
  return 0 === (executionContext & 6)
    ? (flushSyncWorkAcrossRoots_impl(0, !1), !1)
    : !0;
}
function resetWorkInProgressStack() {
  if (null !== workInProgress) {
    if (0 === workInProgressSuspendedReason)
      var interruptedWork = workInProgress.return;
    else
      (interruptedWork = workInProgress),
        (lastContextDependency = currentlyRenderingFiber$1 = null),
        resetHooksOnUnwind(interruptedWork),
        (thenableState$1 = null),
        (thenableIndexCounter$1 = 0),
        (interruptedWork = workInProgress);
    for (; null !== interruptedWork; )
      unwindInterruptedWork(interruptedWork.alternate, interruptedWork),
        (interruptedWork = interruptedWork.return);
    workInProgress = null;
  }
}
function prepareFreshStack(root, lanes) {
  var timeoutHandle = root.timeoutHandle;
  -1 !== timeoutHandle &&
    ((root.timeoutHandle = -1), cancelTimeout(timeoutHandle));
  timeoutHandle = root.cancelPendingCommit;
  null !== timeoutHandle &&
    ((root.cancelPendingCommit = null), timeoutHandle());
  pendingEffectsLanes = 0;
  resetWorkInProgressStack();
  workInProgressRoot = root;
  workInProgress = timeoutHandle = createWorkInProgress(root.current, null);
  workInProgressRootRenderLanes = lanes;
  workInProgressSuspendedReason = 0;
  workInProgressThrownValue = null;
  workInProgressRootDidSkipSuspendedSiblings = !1;
  workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
  workInProgressRootDidAttachPingListener = !1;
  workInProgressSuspendedRetryLanes =
    workInProgressDeferredLane =
    workInProgressRootPingedLanes =
    workInProgressRootInterleavedUpdatedLanes =
    workInProgressRootSkippedLanes =
    workInProgressRootExitStatus =
      0;
  workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors =
    null;
  workInProgressRootDidIncludeRecursiveRenderUpdate = !1;
  0 !== (lanes & 8) && (lanes |= lanes & 32);
  var allEntangledLanes = root.entangledLanes;
  if (0 !== allEntangledLanes)
    for (
      root = root.entanglements, allEntangledLanes &= lanes;
      0 < allEntangledLanes;

    ) {
      var index$4 = 31 - clz32(allEntangledLanes),
        lane = 1 << index$4;
      lanes |= root[index$4];
      allEntangledLanes &= ~lane;
    }
  entangledRenderLanes = lanes;
  finishQueueingConcurrentUpdates();
  return timeoutHandle;
}
function handleThrow(root, thrownValue) {
  currentlyRenderingFiber = null;
  ReactSharedInternals.H = ContextOnlyDispatcher;
  thrownValue === SuspenseException || thrownValue === SuspenseActionException
    ? ((thrownValue = getSuspendedThenable()),
      (workInProgressSuspendedReason = 3))
    : thrownValue === SuspenseyCommitException
      ? ((thrownValue = getSuspendedThenable()),
        (workInProgressSuspendedReason = 4))
      : (workInProgressSuspendedReason =
          thrownValue === SelectiveHydrationException
            ? 8
            : null !== thrownValue &&
                "object" === typeof thrownValue &&
                "function" === typeof thrownValue.then
              ? 6
              : 1);
  workInProgressThrownValue = thrownValue;
  null === workInProgress &&
    ((workInProgressRootExitStatus = 1),
    logUncaughtError(
      root,
      createCapturedValueAtFiber(thrownValue, root.current)
    ));
}
function shouldRemainOnPreviousScreen() {
  var handler = suspenseHandlerStackCursor.current;
  return null === handler
    ? !0
    : (workInProgressRootRenderLanes & 4194048) ===
        workInProgressRootRenderLanes
      ? null === shellBoundary
        ? !0
        : !1
      : (workInProgressRootRenderLanes & 62914560) ===
            workInProgressRootRenderLanes ||
          0 !== (workInProgressRootRenderLanes & 536870912)
        ? handler === shellBoundary
        : !1;
}
function pushDispatcher() {
  var prevDispatcher = ReactSharedInternals.H;
  ReactSharedInternals.H = ContextOnlyDispatcher;
  return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
}
function pushAsyncDispatcher() {
  var prevAsyncDispatcher = ReactSharedInternals.A;
  ReactSharedInternals.A = DefaultAsyncDispatcher;
  return prevAsyncDispatcher;
}
function renderDidSuspendDelayIfPossible() {
  workInProgressRootExitStatus = 4;
  workInProgressRootDidSkipSuspendedSiblings ||
    ((workInProgressRootRenderLanes & 4194048) !==
      workInProgressRootRenderLanes &&
      null !== suspenseHandlerStackCursor.current) ||
    (workInProgressRootIsPrerendering = !0);
  (0 === (workInProgressRootSkippedLanes & 134217727) &&
    0 === (workInProgressRootInterleavedUpdatedLanes & 134217727)) ||
    null === workInProgressRoot ||
    markRootSuspended(
      workInProgressRoot,
      workInProgressRootRenderLanes,
      workInProgressDeferredLane,
      !1
    );
}
function renderRootSync(root, lanes, shouldYieldForPrerendering) {
  var prevExecutionContext = executionContext;
  executionContext |= 2;
  var prevDispatcher = pushDispatcher(),
    prevAsyncDispatcher = pushAsyncDispatcher();
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes)
    (workInProgressTransitions = null), prepareFreshStack(root, lanes);
  lanes = !1;
  var exitStatus = workInProgressRootExitStatus;
  a: do
    try {
      if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
        var unitOfWork = workInProgress,
          thrownValue = workInProgressThrownValue;
        switch (workInProgressSuspendedReason) {
          case 8:
            resetWorkInProgressStack();
            exitStatus = 6;
            break a;
          case 3:
          case 2:
          case 9:
          case 6:
            null === suspenseHandlerStackCursor.current && (lanes = !0);
            var reason = workInProgressSuspendedReason;
            workInProgressSuspendedReason = 0;
            workInProgressThrownValue = null;
            throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
            if (
              shouldYieldForPrerendering &&
              workInProgressRootIsPrerendering
            ) {
              exitStatus = 0;
              break a;
            }
            break;
          default:
            (reason = workInProgressSuspendedReason),
              (workInProgressSuspendedReason = 0),
              (workInProgressThrownValue = null),
              throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
        }
      }
      workLoopSync();
      exitStatus = workInProgressRootExitStatus;
      break;
    } catch (thrownValue$165) {
      handleThrow(root, thrownValue$165);
    }
  while (1);
  lanes && root.shellSuspendCounter++;
  lastContextDependency = currentlyRenderingFiber$1 = null;
  executionContext = prevExecutionContext;
  ReactSharedInternals.H = prevDispatcher;
  ReactSharedInternals.A = prevAsyncDispatcher;
  null === workInProgress &&
    ((workInProgressRoot = null),
    (workInProgressRootRenderLanes = 0),
    finishQueueingConcurrentUpdates());
  return exitStatus;
}
function workLoopSync() {
  for (; null !== workInProgress; ) performUnitOfWork(workInProgress);
}
function renderRootConcurrent(root, lanes) {
  var prevExecutionContext = executionContext;
  executionContext |= 2;
  var prevDispatcher = pushDispatcher(),
    prevAsyncDispatcher = pushAsyncDispatcher();
  workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes
    ? ((workInProgressTransitions = null),
      (workInProgressRootRenderTargetTime = now() + 500),
      prepareFreshStack(root, lanes))
    : (workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
        root,
        lanes
      ));
  a: do
    try {
      if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
        lanes = workInProgress;
        var thrownValue = workInProgressThrownValue;
        b: switch (workInProgressSuspendedReason) {
          case 1:
            workInProgressSuspendedReason = 0;
            workInProgressThrownValue = null;
            throwAndUnwindWorkLoop(root, lanes, thrownValue, 1);
            break;
          case 2:
          case 9:
            if (isThenableResolved(thrownValue)) {
              workInProgressSuspendedReason = 0;
              workInProgressThrownValue = null;
              replaySuspendedUnitOfWork(lanes);
              break;
            }
            lanes = function () {
              (2 !== workInProgressSuspendedReason &&
                9 !== workInProgressSuspendedReason) ||
                workInProgressRoot !== root ||
                (workInProgressSuspendedReason = 7);
              ensureRootIsScheduled(root);
            };
            thrownValue.then(lanes, lanes);
            break a;
          case 3:
            workInProgressSuspendedReason = 7;
            break a;
          case 4:
            workInProgressSuspendedReason = 5;
            break a;
          case 7:
            isThenableResolved(thrownValue)
              ? ((workInProgressSuspendedReason = 0),
                (workInProgressThrownValue = null),
                replaySuspendedUnitOfWork(lanes))
              : ((workInProgressSuspendedReason = 0),
                (workInProgressThrownValue = null),
                throwAndUnwindWorkLoop(root, lanes, thrownValue, 7));
            break;
          case 5:
            var resource = null;
            switch (workInProgress.tag) {
              case 26:
                resource = workInProgress.memoizedState;
              case 5:
              case 27:
                var hostFiber = workInProgress;
                if (
                  resource
                    ? preloadResource(resource)
                    : hostFiber.stateNode.complete
                ) {
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  var sibling = hostFiber.sibling;
                  if (null !== sibling) workInProgress = sibling;
                  else {
                    var returnFiber = hostFiber.return;
                    null !== returnFiber
                      ? ((workInProgress = returnFiber),
                        completeUnitOfWork(returnFiber))
                      : (workInProgress = null);
                  }
                  break b;
                }
            }
            workInProgressSuspendedReason = 0;
            workInProgressThrownValue = null;
            throwAndUnwindWorkLoop(root, lanes, thrownValue, 5);
            break;
          case 6:
            workInProgressSuspendedReason = 0;
            workInProgressThrownValue = null;
            throwAndUnwindWorkLoop(root, lanes, thrownValue, 6);
            break;
          case 8:
            resetWorkInProgressStack();
            workInProgressRootExitStatus = 6;
            break a;
          default:
            throw Error(formatProdErrorMessage(462));
        }
      }
      workLoopConcurrentByScheduler();
      break;
    } catch (thrownValue$167) {
      handleThrow(root, thrownValue$167);
    }
  while (1);
  lastContextDependency = currentlyRenderingFiber$1 = null;
  ReactSharedInternals.H = prevDispatcher;
  ReactSharedInternals.A = prevAsyncDispatcher;
  executionContext = prevExecutionContext;
  if (null !== workInProgress) return 0;
  workInProgressRoot = null;
  workInProgressRootRenderLanes = 0;
  finishQueueingConcurrentUpdates();
  return workInProgressRootExitStatus;
}
function workLoopConcurrentByScheduler() {
  for (; null !== workInProgress && !shouldYield(); )
    performUnitOfWork(workInProgress);
}
function performUnitOfWork(unitOfWork) {
  var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  null === next ? completeUnitOfWork(unitOfWork) : (workInProgress = next);
}
function replaySuspendedUnitOfWork(unitOfWork) {
  var next = unitOfWork;
  var current = next.alternate;
  switch (next.tag) {
    case 15:
    case 0:
      next = replayFunctionComponent(
        current,
        next,
        next.pendingProps,
        next.type,
        void 0,
        workInProgressRootRenderLanes
      );
      break;
    case 11:
      next = replayFunctionComponent(
        current,
        next,
        next.pendingProps,
        next.type.render,
        next.ref,
        workInProgressRootRenderLanes
      );
      break;
    case 5:
      resetHooksOnUnwind(next);
    default:
      unwindInterruptedWork(current, next),
        (next = workInProgress =
          resetWorkInProgress(next, entangledRenderLanes)),
        (next = beginWork(current, next, entangledRenderLanes));
  }
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  null === next ? completeUnitOfWork(unitOfWork) : (workInProgress = next);
}
function throwAndUnwindWorkLoop(
  root,
  unitOfWork,
  thrownValue,
  suspendedReason
) {
  lastContextDependency = currentlyRenderingFiber$1 = null;
  resetHooksOnUnwind(unitOfWork);
  thenableState$1 = null;
  thenableIndexCounter$1 = 0;
  var returnFiber = unitOfWork.return;
  try {
    if (
      throwException(
        root,
        returnFiber,
        unitOfWork,
        thrownValue,
        workInProgressRootRenderLanes
      )
    ) {
      workInProgressRootExitStatus = 1;
      logUncaughtError(
        root,
        createCapturedValueAtFiber(thrownValue, root.current)
      );
      workInProgress = null;
      return;
    }
  } catch (error) {
    if (null !== returnFiber) throw ((workInProgress = returnFiber), error);
    workInProgressRootExitStatus = 1;
    logUncaughtError(
      root,
      createCapturedValueAtFiber(thrownValue, root.current)
    );
    workInProgress = null;
    return;
  }
  if (unitOfWork.flags & 32768) {
    if (isHydrating || 1 === suspendedReason) root = !0;
    else if (
      workInProgressRootIsPrerendering ||
      0 !== (workInProgressRootRenderLanes & 536870912)
    )
      root = !1;
    else if (
      ((workInProgressRootDidSkipSuspendedSiblings = root = !0),
      2 === suspendedReason ||
        9 === suspendedReason ||
        3 === suspendedReason ||
        6 === suspendedReason)
    )
      (suspendedReason = suspenseHandlerStackCursor.current),
        null !== suspendedReason &&
          13 === suspendedReason.tag &&
          (suspendedReason.flags |= 16384);
    unwindUnitOfWork(unitOfWork, root);
  } else completeUnitOfWork(unitOfWork);
}
function completeUnitOfWork(unitOfWork) {
  var completedWork = unitOfWork;
  do {
    if (0 !== (completedWork.flags & 32768)) {
      unwindUnitOfWork(
        completedWork,
        workInProgressRootDidSkipSuspendedSiblings
      );
      return;
    }
    unitOfWork = completedWork.return;
    var next = completeWork(
      completedWork.alternate,
      completedWork,
      entangledRenderLanes
    );
    if (null !== next) {
      workInProgress = next;
      return;
    }
    completedWork = completedWork.sibling;
    if (null !== completedWork) {
      workInProgress = completedWork;
      return;
    }
    workInProgress = completedWork = unitOfWork;
  } while (null !== completedWork);
  0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
}
function unwindUnitOfWork(unitOfWork, skipSiblings) {
  do {
    var next = unwindWork(unitOfWork.alternate, unitOfWork);
    if (null !== next) {
      next.flags &= 32767;
      workInProgress = next;
      return;
    }
    next = unitOfWork.return;
    null !== next &&
      ((next.flags |= 32768), (next.subtreeFlags = 0), (next.deletions = null));
    if (
      !skipSiblings &&
      ((unitOfWork = unitOfWork.sibling), null !== unitOfWork)
    ) {
      workInProgress = unitOfWork;
      return;
    }
    workInProgress = unitOfWork = next;
  } while (null !== unitOfWork);
  workInProgressRootExitStatus = 6;
  workInProgress = null;
}
function commitRoot(
  root,
  finishedWork,
  lanes,
  recoverableErrors,
  transitions,
  didIncludeRenderPhaseUpdate,
  spawnedLane,
  updatedLanes,
  suspendedRetryLanes
) {
  root.cancelPendingCommit = null;
  do flushPendingEffects();
  while (0 !== pendingEffectsStatus);
  if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
  if (null !== finishedWork) {
    if (finishedWork === root.current) throw Error(formatProdErrorMessage(177));
    didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
    didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
    markRootFinished(
      root,
      lanes,
      didIncludeRenderPhaseUpdate,
      spawnedLane,
      updatedLanes,
      suspendedRetryLanes
    );
    root === workInProgressRoot &&
      ((workInProgress = workInProgressRoot = null),
      (workInProgressRootRenderLanes = 0));
    pendingFinishedWork = finishedWork;
    pendingEffectsRoot = root;
    pendingEffectsLanes = lanes;
    pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
    pendingPassiveTransitions = transitions;
    pendingRecoverableErrors = recoverableErrors;
    0 !== (finishedWork.subtreeFlags & 10256) ||
    0 !== (finishedWork.flags & 10256)
      ? ((root.callbackNode = null),
        (root.callbackPriority = 0),
        scheduleCallback$1(NormalPriority$1, function () {
          flushPassiveEffects();
          return null;
        }))
      : ((root.callbackNode = null), (root.callbackPriority = 0));
    recoverableErrors = 0 !== (finishedWork.flags & 13878);
    if (0 !== (finishedWork.subtreeFlags & 13878) || recoverableErrors) {
      recoverableErrors = ReactSharedInternals.T;
      ReactSharedInternals.T = null;
      transitions = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      spawnedLane = executionContext;
      executionContext |= 4;
      try {
        commitBeforeMutationEffects(root, finishedWork, lanes);
      } finally {
        (executionContext = spawnedLane),
          (ReactDOMSharedInternals.p = transitions),
          (ReactSharedInternals.T = recoverableErrors);
      }
    }
    pendingEffectsStatus = 1;
    flushMutationEffects();
    flushLayoutEffects();
    flushSpawnedWork();
  }
}
function flushMutationEffects() {
  if (1 === pendingEffectsStatus) {
    pendingEffectsStatus = 0;
    var root = pendingEffectsRoot,
      finishedWork = pendingFinishedWork,
      rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
    if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
      rootMutationHasEffect = ReactSharedInternals.T;
      ReactSharedInternals.T = null;
      var previousPriority = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      try {
        commitMutationEffectsOnFiber(finishedWork, root);
        var priorSelectionInformation = selectionInformation,
          curFocusedElem = getActiveElementDeep(root.containerInfo),
          priorFocusedElem = priorSelectionInformation.focusedElem,
          priorSelectionRange = priorSelectionInformation.selectionRange;
        if (
          curFocusedElem !== priorFocusedElem &&
          priorFocusedElem &&
          priorFocusedElem.ownerDocument &&
          containsNode(
            priorFocusedElem.ownerDocument.documentElement,
            priorFocusedElem
          )
        ) {
          if (
            null !== priorSelectionRange &&
            hasSelectionCapabilities(priorFocusedElem)
          ) {
            var start = priorSelectionRange.start,
              end = priorSelectionRange.end;
            void 0 === end && (end = start);
            if ("selectionStart" in priorFocusedElem)
              (priorFocusedElem.selectionStart = start),
                (priorFocusedElem.selectionEnd = Math.min(
                  end,
                  priorFocusedElem.value.length
                ));
            else {
              var doc = priorFocusedElem.ownerDocument || document,
                win = (doc && doc.defaultView) || window;
              if (win.getSelection) {
                var selection = win.getSelection(),
                  length = priorFocusedElem.textContent.length,
                  start$jscomp$0 = Math.min(priorSelectionRange.start, length),
                  end$jscomp$0 =
                    void 0 === priorSelectionRange.end
                      ? start$jscomp$0
                      : Math.min(priorSelectionRange.end, length);
                !selection.extend &&
                  start$jscomp$0 > end$jscomp$0 &&
                  ((curFocusedElem = end$jscomp$0),
                  (end$jscomp$0 = start$jscomp$0),
                  (start$jscomp$0 = curFocusedElem));
                var startMarker = getNodeForCharacterOffset(
                    priorFocusedElem,
                    start$jscomp$0
                  ),
                  endMarker = getNodeForCharacterOffset(
                    priorFocusedElem,
                    end$jscomp$0
                  );
                if (
                  startMarker &&
                  endMarker &&
                  (1 !== selection.rangeCount ||
                    selection.anchorNode !== startMarker.node ||
                    selection.anchorOffset !== startMarker.offset ||
                    selection.focusNode !== endMarker.node ||
                    selection.focusOffset !== endMarker.offset)
                ) {
                  var range = doc.createRange();
                  range.setStart(startMarker.node, startMarker.offset);
                  selection.removeAllRanges();
                  start$jscomp$0 > end$jscomp$0
                    ? (selection.addRange(range),
                      selection.extend(endMarker.node, endMarker.offset))
                    : (range.setEnd(endMarker.node, endMarker.offset),
                      selection.addRange(range));
                }
              }
            }
          }
          doc = [];
          for (
            selection = priorFocusedElem;
            (selection = selection.parentNode);

          )
            1 === selection.nodeType &&
              doc.push({
                element: selection,
                left: selection.scrollLeft,
                top: selection.scrollTop
              });
          "function" === typeof priorFocusedElem.focus &&
            priorFocusedElem.focus();
          for (
            priorFocusedElem = 0;
            priorFocusedElem < doc.length;
            priorFocusedElem++
          ) {
            var info = doc[priorFocusedElem];
            info.element.scrollLeft = info.left;
            info.element.scrollTop = info.top;
          }
        }
        _enabled = !!eventsEnabled;
        selectionInformation = eventsEnabled = null;
      } finally {
        (executionContext = prevExecutionContext),
          (ReactDOMSharedInternals.p = previousPriority),
          (ReactSharedInternals.T = rootMutationHasEffect);
      }
    }
    root.current = finishedWork;
    pendingEffectsStatus = 2;
  }
}
function flushLayoutEffects() {
  if (2 === pendingEffectsStatus) {
    pendingEffectsStatus = 0;
    var root = pendingEffectsRoot,
      finishedWork = pendingFinishedWork,
      rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
    if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
      rootHasLayoutEffect = ReactSharedInternals.T;
      ReactSharedInternals.T = null;
      var previousPriority = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      try {
        commitLayoutEffectOnFiber(root, finishedWork.alternate, finishedWork);
      } finally {
        (executionContext = prevExecutionContext),
          (ReactDOMSharedInternals.p = previousPriority),
          (ReactSharedInternals.T = rootHasLayoutEffect);
      }
    }
    pendingEffectsStatus = 3;
  }
}
function flushSpawnedWork() {
  if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
    pendingEffectsStatus = 0;
    requestPaint();
    var root = pendingEffectsRoot,
      finishedWork = pendingFinishedWork,
      lanes = pendingEffectsLanes,
      recoverableErrors = pendingRecoverableErrors;
    0 !== (finishedWork.subtreeFlags & 10256) ||
    0 !== (finishedWork.flags & 10256)
      ? (pendingEffectsStatus = 5)
      : ((pendingEffectsStatus = 0),
        (pendingFinishedWork = pendingEffectsRoot = null),
        releaseRootPooledCache(root, root.pendingLanes));
    var remainingLanes = root.pendingLanes;
    0 === remainingLanes && (legacyErrorBoundariesThatAlreadyFailed = null);
    lanesToEventPriority(lanes);
    finishedWork = finishedWork.stateNode;
    if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot)
      try {
        injectedHook.onCommitFiberRoot(
          rendererID,
          finishedWork,
          void 0,
          128 === (finishedWork.current.flags & 128)
        );
      } catch (err) {}
    if (null !== recoverableErrors) {
      finishedWork = ReactSharedInternals.T;
      remainingLanes = ReactDOMSharedInternals.p;
      ReactDOMSharedInternals.p = 2;
      ReactSharedInternals.T = null;
      try {
        for (
          var onRecoverableError = root.onRecoverableError, i = 0;
          i < recoverableErrors.length;
          i++
        ) {
          var recoverableError = recoverableErrors[i];
          onRecoverableError(recoverableError.value, {
            componentStack: recoverableError.stack
          });
        }
      } finally {
        (ReactSharedInternals.T = finishedWork),
          (ReactDOMSharedInternals.p = remainingLanes);
      }
    }
    0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
    ensureRootIsScheduled(root);
    remainingLanes = root.pendingLanes;
    0 !== (lanes & 261930) && 0 !== (remainingLanes & 42)
      ? root === rootWithNestedUpdates
        ? nestedUpdateCount++
        : ((nestedUpdateCount = 0), (rootWithNestedUpdates = root))
      : (nestedUpdateCount = 0);
    flushSyncWorkAcrossRoots_impl(0, !1);
  }
}
function releaseRootPooledCache(root, remainingLanes) {
  0 === (root.pooledCacheLanes &= remainingLanes) &&
    ((remainingLanes = root.pooledCache),
    null != remainingLanes &&
      ((root.pooledCache = null), releaseCache(remainingLanes)));
}
function flushPendingEffects() {
  flushMutationEffects();
  flushLayoutEffects();
  flushSpawnedWork();
  return flushPassiveEffects();
}
function flushPassiveEffects() {
  if (5 !== pendingEffectsStatus) return !1;
  var root = pendingEffectsRoot,
    remainingLanes = pendingEffectsRemainingLanes;
  pendingEffectsRemainingLanes = 0;
  var renderPriority = lanesToEventPriority(pendingEffectsLanes),
    prevTransition = ReactSharedInternals.T,
    previousPriority = ReactDOMSharedInternals.p;
  try {
    ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
    ReactSharedInternals.T = null;
    renderPriority = pendingPassiveTransitions;
    pendingPassiveTransitions = null;
    var root$jscomp$0 = pendingEffectsRoot,
      lanes = pendingEffectsLanes;
    pendingEffectsStatus = 0;
    pendingFinishedWork = pendingEffectsRoot = null;
    pendingEffectsLanes = 0;
    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
    var prevExecutionContext = executionContext;
    executionContext |= 4;
    commitPassiveUnmountOnFiber(root$jscomp$0.current);
    commitPassiveMountOnFiber(
      root$jscomp$0,
      root$jscomp$0.current,
      lanes,
      renderPriority
    );
    executionContext = prevExecutionContext;
    flushSyncWorkAcrossRoots_impl(0, !1);
    if (
      injectedHook &&
      "function" === typeof injectedHook.onPostCommitFiberRoot
    )
      try {
        injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
      } catch (err) {}
    return !0;
  } finally {
    (ReactDOMSharedInternals.p = previousPriority),
      (ReactSharedInternals.T = prevTransition),
      releaseRootPooledCache(root, remainingLanes);
  }
}
function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
  sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
  sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
  rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
  null !== rootFiber &&
    (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
}
function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
  if (3 === sourceFiber.tag)
    captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
  else
    for (; null !== nearestMountedAncestor; ) {
      if (3 === nearestMountedAncestor.tag) {
        captureCommitPhaseErrorOnRoot(
          nearestMountedAncestor,
          sourceFiber,
          error
        );
        break;
      } else if (1 === nearestMountedAncestor.tag) {
        var instance = nearestMountedAncestor.stateNode;
        if (
          "function" ===
            typeof nearestMountedAncestor.type.getDerivedStateFromError ||
          ("function" === typeof instance.componentDidCatch &&
            (null === legacyErrorBoundariesThatAlreadyFailed ||
              !legacyErrorBoundariesThatAlreadyFailed.has(instance)))
        ) {
          sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
          error = createClassErrorUpdate(2);
          instance = enqueueUpdate(nearestMountedAncestor, error, 2);
          null !== instance &&
            (initializeClassErrorUpdate(
              error,
              instance,
              nearestMountedAncestor,
              sourceFiber
            ),
            markRootUpdated$1(instance, 2),
            ensureRootIsScheduled(instance));
          break;
        }
      }
      nearestMountedAncestor = nearestMountedAncestor.return;
    }
}
function attachPingListener(root, wakeable, lanes) {
  var pingCache = root.pingCache;
  if (null === pingCache) {
    pingCache = root.pingCache = new PossiblyWeakMap();
    var threadIDs = new Set();
    pingCache.set(wakeable, threadIDs);
  } else
    (threadIDs = pingCache.get(wakeable)),
      void 0 === threadIDs &&
        ((threadIDs = new Set()), pingCache.set(wakeable, threadIDs));
  threadIDs.has(lanes) ||
    ((workInProgressRootDidAttachPingListener = !0),
    threadIDs.add(lanes),
    (root = pingSuspendedRoot.bind(null, root, wakeable, lanes)),
    wakeable.then(root, root));
}
function pingSuspendedRoot(root, wakeable, pingedLanes) {
  var pingCache = root.pingCache;
  null !== pingCache && pingCache.delete(wakeable);
  root.pingedLanes |= root.suspendedLanes & pingedLanes;
  root.warmLanes &= ~pingedLanes;
  workInProgressRoot === root &&
    (workInProgressRootRenderLanes & pingedLanes) === pingedLanes &&
    (4 === workInProgressRootExitStatus ||
    (3 === workInProgressRootExitStatus &&
      (workInProgressRootRenderLanes & 62914560) ===
        workInProgressRootRenderLanes &&
      300 > now() - globalMostRecentFallbackTime)
      ? 0 === (executionContext & 2) && prepareFreshStack(root, 0)
      : (workInProgressRootPingedLanes |= pingedLanes),
    workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes &&
      (workInProgressSuspendedRetryLanes = 0));
  ensureRootIsScheduled(root);
}
function retryTimedOutBoundary(boundaryFiber, retryLane) {
  0 === retryLane && (retryLane = claimNextRetryLane());
  boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
  null !== boundaryFiber &&
    (markRootUpdated$1(boundaryFiber, retryLane),
    ensureRootIsScheduled(boundaryFiber));
}
function retryDehydratedSuspenseBoundary(boundaryFiber) {
  var suspenseState = boundaryFiber.memoizedState,
    retryLane = 0;
  null !== suspenseState && (retryLane = suspenseState.retryLane);
  retryTimedOutBoundary(boundaryFiber, retryLane);
}
function resolveRetryWakeable(boundaryFiber, wakeable) {
  var retryLane = 0;
  switch (boundaryFiber.tag) {
    case 31:
    case 13:
      var retryCache = boundaryFiber.stateNode;
      var suspenseState = boundaryFiber.memoizedState;
      null !== suspenseState && (retryLane = suspenseState.retryLane);
      break;
    case 19:
      retryCache = boundaryFiber.stateNode;
      break;
    case 22:
      retryCache = boundaryFiber.stateNode._retryCache;
      break;
    default:
      throw Error(formatProdErrorMessage(314));
  }
  null !== retryCache && retryCache.delete(wakeable);
  retryTimedOutBoundary(boundaryFiber, retryLane);
}
function scheduleCallback$1(priorityLevel, callback) {
  return scheduleCallback$3(priorityLevel, callback);
}
var firstScheduledRoot = null,
  lastScheduledRoot = null,
  didScheduleMicrotask = !1,
  mightHavePendingSyncWork = !1,
  isFlushingWork = !1,
  currentEventTransitionLane = 0;
function ensureRootIsScheduled(root) {
  root !== lastScheduledRoot &&
    null === root.next &&
    (null === lastScheduledRoot
      ? (firstScheduledRoot = lastScheduledRoot = root)
      : (lastScheduledRoot = lastScheduledRoot.next = root));
  mightHavePendingSyncWork = !0;
  didScheduleMicrotask ||
    ((didScheduleMicrotask = !0), scheduleImmediateRootScheduleTask());
}
function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
  if (!isFlushingWork && mightHavePendingSyncWork) {
    isFlushingWork = !0;
    do {
      var didPerformSomeWork = !1;
      for (var root$170 = firstScheduledRoot; null !== root$170; ) {
        if (!onlyLegacy)
          if (0 !== syncTransitionLanes) {
            var pendingLanes = root$170.pendingLanes;
            if (0 === pendingLanes) var JSCompiler_inline_result = 0;
            else {
              var suspendedLanes = root$170.suspendedLanes,
                pingedLanes = root$170.pingedLanes;
              JSCompiler_inline_result =
                (1 << (31 - clz32(42 | syncTransitionLanes) + 1)) - 1;
              JSCompiler_inline_result &=
                pendingLanes & ~(suspendedLanes & ~pingedLanes);
              JSCompiler_inline_result =
                JSCompiler_inline_result & 201326741
                  ? (JSCompiler_inline_result & 201326741) | 1
                  : JSCompiler_inline_result
                    ? JSCompiler_inline_result | 2
                    : 0;
            }
            0 !== JSCompiler_inline_result &&
              ((didPerformSomeWork = !0),
              performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
          } else
            (JSCompiler_inline_result = workInProgressRootRenderLanes),
              (JSCompiler_inline_result = getNextLanes(
                root$170,
                root$170 === workInProgressRoot ? JSCompiler_inline_result : 0,
                null !== root$170.cancelPendingCommit ||
                  -1 !== root$170.timeoutHandle
              )),
              0 === (JSCompiler_inline_result & 3) ||
                checkIfRootIsPrerendering(root$170, JSCompiler_inline_result) ||
                ((didPerformSomeWork = !0),
                performSyncWorkOnRoot(root$170, JSCompiler_inline_result));
        root$170 = root$170.next;
      }
    } while (didPerformSomeWork);
    isFlushingWork = !1;
  }
}
function processRootScheduleInImmediateTask() {
  processRootScheduleInMicrotask();
}
function processRootScheduleInMicrotask() {
  mightHavePendingSyncWork = didScheduleMicrotask = !1;
  var syncTransitionLanes = 0;
  0 !== currentEventTransitionLane &&
    shouldAttemptEagerTransition() &&
    (syncTransitionLanes = currentEventTransitionLane);
  for (
    var currentTime = now(), prev = null, root = firstScheduledRoot;
    null !== root;

  ) {
    var next = root.next,
      nextLanes = scheduleTaskForRootDuringMicrotask(root, currentTime);
    if (0 === nextLanes)
      (root.next = null),
        null === prev ? (firstScheduledRoot = next) : (prev.next = next),
        null === next && (lastScheduledRoot = prev);
    else if (
      ((prev = root), 0 !== syncTransitionLanes || 0 !== (nextLanes & 3))
    )
      mightHavePendingSyncWork = !0;
    root = next;
  }
  (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus) ||
    flushSyncWorkAcrossRoots_impl(syncTransitionLanes, !1);
  0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
}
function scheduleTaskForRootDuringMicrotask(root, currentTime) {
  for (
    var suspendedLanes = root.suspendedLanes,
      pingedLanes = root.pingedLanes,
      expirationTimes = root.expirationTimes,
      lanes = root.pendingLanes & -62914561;
    0 < lanes;

  ) {
    var index$5 = 31 - clz32(lanes),
      lane = 1 << index$5,
      expirationTime = expirationTimes[index$5];
    if (-1 === expirationTime) {
      if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes))
        expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
    } else expirationTime <= currentTime && (root.expiredLanes |= lane);
    lanes &= ~lane;
  }
  currentTime = workInProgressRoot;
  suspendedLanes = workInProgressRootRenderLanes;
  suspendedLanes = getNextLanes(
    root,
    root === currentTime ? suspendedLanes : 0,
    null !== root.cancelPendingCommit || -1 !== root.timeoutHandle
  );
  pingedLanes = root.callbackNode;
  if (
    0 === suspendedLanes ||
    (root === currentTime &&
      (2 === workInProgressSuspendedReason ||
        9 === workInProgressSuspendedReason)) ||
    null !== root.cancelPendingCommit
  )
    return (
      null !== pingedLanes &&
        null !== pingedLanes &&
        cancelCallback$1(pingedLanes),
      (root.callbackNode = null),
      (root.callbackPriority = 0)
    );
  if (
    0 === (suspendedLanes & 3) ||
    checkIfRootIsPrerendering(root, suspendedLanes)
  ) {
    currentTime = suspendedLanes & -suspendedLanes;
    if (currentTime === root.callbackPriority) return currentTime;
    null !== pingedLanes && cancelCallback$1(pingedLanes);
    switch (lanesToEventPriority(suspendedLanes)) {
      case 2:
      case 8:
        suspendedLanes = UserBlockingPriority;
        break;
      case 32:
        suspendedLanes = NormalPriority$1;
        break;
      case 268435456:
        suspendedLanes = IdlePriority;
        break;
      default:
        suspendedLanes = NormalPriority$1;
    }
    pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root);
    suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
    root.callbackPriority = currentTime;
    root.callbackNode = suspendedLanes;
    return currentTime;
  }
  null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
  root.callbackPriority = 2;
  root.callbackNode = null;
  return 2;
}
function performWorkOnRootViaSchedulerTask(root, didTimeout) {
  if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus)
    return (root.callbackNode = null), (root.callbackPriority = 0), null;
  var originalCallbackNode = root.callbackNode;
  if (flushPendingEffects() && root.callbackNode !== originalCallbackNode)
    return null;
  var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
  workInProgressRootRenderLanes$jscomp$0 = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0,
    null !== root.cancelPendingCommit || -1 !== root.timeoutHandle
  );
  if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
  performWorkOnRoot(root, workInProgressRootRenderLanes$jscomp$0, didTimeout);
  scheduleTaskForRootDuringMicrotask(root, now());
  return null != root.callbackNode && root.callbackNode === originalCallbackNode
    ? performWorkOnRootViaSchedulerTask.bind(null, root)
    : null;
}
function performSyncWorkOnRoot(root, lanes) {
  if (flushPendingEffects()) return null;
  performWorkOnRoot(root, lanes, !0);
}
function scheduleImmediateRootScheduleTask() {
  scheduleMicrotask(function () {
    0 !== (executionContext & 6)
      ? scheduleCallback$3(
          ImmediatePriority,
          processRootScheduleInImmediateTask
        )
      : processRootScheduleInMicrotask();
  });
}
function requestTransitionLane() {
  if (0 === currentEventTransitionLane) {
    var actionScopeLane = currentEntangledLane;
    0 === actionScopeLane &&
      ((actionScopeLane = nextTransitionUpdateLane),
      (nextTransitionUpdateLane <<= 1),
      0 === (nextTransitionUpdateLane & 261888) &&
        (nextTransitionUpdateLane = 256));
    currentEventTransitionLane = actionScopeLane;
  }
  return currentEventTransitionLane;
}
function coerceFormActionProp(actionProp) {
  return null == actionProp ||
    "symbol" === typeof actionProp ||
    "boolean" === typeof actionProp
    ? null
    : "function" === typeof actionProp
      ? actionProp
      : sanitizeURL("" + actionProp);
}
function createFormDataWithSubmitter(form, submitter) {
  var temp = submitter.ownerDocument.createElement("input");
  temp.name = submitter.name;
  temp.value = submitter.value;
  form.id && temp.setAttribute("form", form.id);
  submitter.parentNode.insertBefore(temp, submitter);
  form = new FormData(form);
  temp.parentNode.removeChild(temp);
  return form;
}
function extractEvents$1(
  dispatchQueue,
  domEventName,
  maybeTargetInst,
  nativeEvent,
  nativeEventTarget
) {
  if (
    "submit" === domEventName &&
    maybeTargetInst &&
    maybeTargetInst.stateNode === nativeEventTarget
  ) {
    var action = coerceFormActionProp(
        (nativeEventTarget[internalPropsKey] || null).action
      ),
      submitter = nativeEvent.submitter;
    submitter &&
      ((domEventName = (domEventName = submitter[internalPropsKey] || null)
        ? coerceFormActionProp(domEventName.formAction)
        : submitter.getAttribute("formAction")),
      null !== domEventName && ((action = domEventName), (submitter = null)));
    var event = new SyntheticEvent(
      "action",
      "action",
      null,
      nativeEvent,
      nativeEventTarget
    );
    dispatchQueue.push({
      event: event,
      listeners: [
        {
          instance: null,
          listener: function () {
            if (nativeEvent.defaultPrevented) {
              if (0 !== currentEventTransitionLane) {
                var formData = submitter
                  ? createFormDataWithSubmitter(nativeEventTarget, submitter)
                  : new FormData(nativeEventTarget);
                startHostTransition(
                  maybeTargetInst,
                  {
                    pending: !0,
                    data: formData,
                    method: nativeEventTarget.method,
                    action: action
                  },
                  null,
                  formData
                );
              }
            } else
              "function" === typeof action &&
                (event.preventDefault(),
                (formData = submitter
                  ? createFormDataWithSubmitter(nativeEventTarget, submitter)
                  : new FormData(nativeEventTarget)),
                startHostTransition(
                  maybeTargetInst,
                  {
                    pending: !0,
                    data: formData,
                    method: nativeEventTarget.method,
                    action: action
                  },
                  action,
                  formData
                ));
          },
          currentTarget: nativeEventTarget
        }
      ]
    });
  }
}
for (
  var i$jscomp$inline_1577 = 0;
  i$jscomp$inline_1577 < simpleEventPluginEvents.length;
  i$jscomp$inline_1577++
) {
  var eventName$jscomp$inline_1578 =
      simpleEventPluginEvents[i$jscomp$inline_1577],
    domEventName$jscomp$inline_1579 =
      eventName$jscomp$inline_1578.toLowerCase(),
    capitalizedEvent$jscomp$inline_1580 =
      eventName$jscomp$inline_1578[0].toUpperCase() +
      eventName$jscomp$inline_1578.slice(1);
  registerSimpleEvent(
    domEventName$jscomp$inline_1579,
    "on" + capitalizedEvent$jscomp$inline_1580
  );
}
registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
registerSimpleEvent(ANIMATION_START, "onAnimationStart");
registerSimpleEvent("dblclick", "onDoubleClick");
registerSimpleEvent("focusin", "onFocus");
registerSimpleEvent("focusout", "onBlur");
registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
registerSimpleEvent(TRANSITION_START, "onTransitionStart");
registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
registerTwoPhaseEvent(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(" ")
);
registerTwoPhaseEvent(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " "
  )
);
registerTwoPhaseEvent("onBeforeInput", [
  "compositionend",
  "keypress",
  "textInput",
  "paste"
]);
registerTwoPhaseEvent(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" ")
);
registerTwoPhaseEvent(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" ")
);
registerTwoPhaseEvent(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
);
var mediaEventTypes =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " "
    ),
  nonDelegatedEvents = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle"
      .split(" ")
      .concat(mediaEventTypes)
  );
function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  eventSystemFlags = 0 !== (eventSystemFlags & 4);
  for (var i = 0; i < dispatchQueue.length; i++) {
    var _dispatchQueue$i = dispatchQueue[i],
      event = _dispatchQueue$i.event;
    _dispatchQueue$i = _dispatchQueue$i.listeners;
    a: {
      var previousInstance = void 0;
      if (eventSystemFlags)
        for (
          var i$jscomp$0 = _dispatchQueue$i.length - 1;
          0 <= i$jscomp$0;
          i$jscomp$0--
        ) {
          var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0],
            instance = _dispatchListeners$i.instance,
            currentTarget = _dispatchListeners$i.currentTarget;
          _dispatchListeners$i = _dispatchListeners$i.listener;
          if (instance !== previousInstance && event.isPropagationStopped())
            break a;
          previousInstance = _dispatchListeners$i;
          event.currentTarget = currentTarget;
          try {
            previousInstance(event);
          } catch (error) {
            reportGlobalError(error);
          }
          event.currentTarget = null;
          previousInstance = instance;
        }
      else
        for (
          i$jscomp$0 = 0;
          i$jscomp$0 < _dispatchQueue$i.length;
          i$jscomp$0++
        ) {
          _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
          instance = _dispatchListeners$i.instance;
          currentTarget = _dispatchListeners$i.currentTarget;
          _dispatchListeners$i = _dispatchListeners$i.listener;
          if (instance !== previousInstance && event.isPropagationStopped())
            break a;
          previousInstance = _dispatchListeners$i;
          event.currentTarget = currentTarget;
          try {
            previousInstance(event);
          } catch (error) {
            reportGlobalError(error);
          }
          event.currentTarget = null;
          previousInstance = instance;
        }
    }
  }
}
function listenToNonDelegatedEvent(domEventName, targetElement) {
  var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
  void 0 === JSCompiler_inline_result &&
    (JSCompiler_inline_result = targetElement[internalEventHandlersKey] =
      new Set());
  var listenerSetKey = domEventName + "__bubble";
  JSCompiler_inline_result.has(listenerSetKey) ||
    (addTrappedEventListener(targetElement, domEventName, 2, !1),
    JSCompiler_inline_result.add(listenerSetKey));
}
function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
  var eventSystemFlags = 0;
  isCapturePhaseListener && (eventSystemFlags |= 4);
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener
  );
}
var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
function listenToAllSupportedEvents(rootContainerElement) {
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = !0;
    allNativeEvents.forEach(function (domEventName) {
      "selectionchange" !== domEventName &&
        (nonDelegatedEvents.has(domEventName) ||
          listenToNativeEvent(domEventName, !1, rootContainerElement),
        listenToNativeEvent(domEventName, !0, rootContainerElement));
    });
    var ownerDocument =
      9 === rootContainerElement.nodeType
        ? rootContainerElement
        : rootContainerElement.ownerDocument;
    null === ownerDocument ||
      ownerDocument[listeningMarker] ||
      ((ownerDocument[listeningMarker] = !0),
      listenToNativeEvent("selectionchange", !1, ownerDocument));
  }
}
function addTrappedEventListener(
  targetContainer,
  domEventName,
  eventSystemFlags,
  isCapturePhaseListener
) {
  switch (getEventPriority(domEventName)) {
    case 2:
      var listenerWrapper = dispatchDiscreteEvent;
      break;
    case 8:
      listenerWrapper = dispatchContinuousEvent;
      break;
    default:
      listenerWrapper = dispatchEvent;
  }
  eventSystemFlags = listenerWrapper.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer
  );
  listenerWrapper = void 0;
  !passiveBrowserEventsSupported ||
    ("touchstart" !== domEventName &&
      "touchmove" !== domEventName &&
      "wheel" !== domEventName) ||
    (listenerWrapper = !0);
  isCapturePhaseListener
    ? void 0 !== listenerWrapper
      ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
          capture: !0,
          passive: listenerWrapper
        })
      : targetContainer.addEventListener(domEventName, eventSystemFlags, !0)
    : void 0 !== listenerWrapper
      ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
          passive: listenerWrapper
        })
      : targetContainer.addEventListener(domEventName, eventSystemFlags, !1);
}
function dispatchEventForPluginEventSystem(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  targetInst$jscomp$0,
  targetContainer
) {
  var ancestorInst = targetInst$jscomp$0;
  if (
    0 === (eventSystemFlags & 1) &&
    0 === (eventSystemFlags & 2) &&
    null !== targetInst$jscomp$0
  )
    a: for (;;) {
      if (null === targetInst$jscomp$0) return;
      var nodeTag = targetInst$jscomp$0.tag;
      if (3 === nodeTag || 4 === nodeTag) {
        var container = targetInst$jscomp$0.stateNode.containerInfo;
        if (container === targetContainer) break;
        if (4 === nodeTag)
          for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag; ) {
            var grandTag = nodeTag.tag;
            if (
              (3 === grandTag || 4 === grandTag) &&
              nodeTag.stateNode.containerInfo === targetContainer
            )
              return;
            nodeTag = nodeTag.return;
          }
        for (; null !== container; ) {
          nodeTag = getClosestInstanceFromNode(container);
          if (null === nodeTag) return;
          grandTag = nodeTag.tag;
          if (
            5 === grandTag ||
            6 === grandTag ||
            26 === grandTag ||
            27 === grandTag
          ) {
            targetInst$jscomp$0 = ancestorInst = nodeTag;
            continue a;
          }
          container = container.parentNode;
        }
      }
      targetInst$jscomp$0 = targetInst$jscomp$0.return;
    }
  batchedUpdates$1(function () {
    var targetInst = ancestorInst,
      nativeEventTarget = getEventTarget(nativeEvent),
      dispatchQueue = [];
    a: {
      var reactName = topLevelEventsToReactNames.get(domEventName);
      if (void 0 !== reactName) {
        var SyntheticEventCtor = SyntheticEvent,
          reactEventType = domEventName;
        switch (domEventName) {
          case "keypress":
            if (0 === getEventCharCode(nativeEvent)) break a;
          case "keydown":
          case "keyup":
            SyntheticEventCtor = SyntheticKeyboardEvent;
            break;
          case "focusin":
            reactEventType = "focus";
            SyntheticEventCtor = SyntheticFocusEvent;
            break;
          case "focusout":
            reactEventType = "blur";
            SyntheticEventCtor = SyntheticFocusEvent;
            break;
          case "beforeblur":
          case "afterblur":
            SyntheticEventCtor = SyntheticFocusEvent;
            break;
          case "click":
            if (2 === nativeEvent.button) break a;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            SyntheticEventCtor = SyntheticMouseEvent;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            SyntheticEventCtor = SyntheticDragEvent;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            SyntheticEventCtor = SyntheticTouchEvent;
            break;
          case ANIMATION_END:
          case ANIMATION_ITERATION:
          case ANIMATION_START:
            SyntheticEventCtor = SyntheticAnimationEvent;
            break;
          case TRANSITION_END:
            SyntheticEventCtor = SyntheticTransitionEvent;
            break;
          case "scroll":
          case "scrollend":
            SyntheticEventCtor = SyntheticUIEvent;
            break;
          case "wheel":
            SyntheticEventCtor = SyntheticWheelEvent;
            break;
          case "copy":
          case "cut":
          case "paste":
            SyntheticEventCtor = SyntheticClipboardEvent;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            SyntheticEventCtor = SyntheticPointerEvent;
            break;
          case "toggle":
          case "beforetoggle":
            SyntheticEventCtor = SyntheticToggleEvent;
        }
        var inCapturePhase = 0 !== (eventSystemFlags & 4),
          accumulateTargetOnly =
            !inCapturePhase &&
            ("scroll" === domEventName || "scrollend" === domEventName),
          reactEventName = inCapturePhase
            ? null !== reactName
              ? reactName + "Capture"
              : null
            : reactName;
        inCapturePhase = [];
        for (
          var instance = targetInst, lastHostComponent;
          null !== instance;

        ) {
          var _instance = instance;
          lastHostComponent = _instance.stateNode;
          _instance = _instance.tag;
          (5 !== _instance && 26 !== _instance && 27 !== _instance) ||
            null === lastHostComponent ||
            null === reactEventName ||
            ((_instance = getListener(instance, reactEventName)),
            null != _instance &&
              inCapturePhase.push(
                createDispatchListener(instance, _instance, lastHostComponent)
              ));
          if (accumulateTargetOnly) break;
          instance = instance.return;
        }
        0 < inCapturePhase.length &&
          ((reactName = new SyntheticEventCtor(
            reactName,
            reactEventType,
            null,
            nativeEvent,
            nativeEventTarget
          )),
          dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
      }
    }
    if (0 === (eventSystemFlags & 7)) {
      a: {
        reactName =
          "mouseover" === domEventName || "pointerover" === domEventName;
        SyntheticEventCtor =
          "mouseout" === domEventName || "pointerout" === domEventName;
        if (
          reactName &&
          nativeEvent !== currentReplayingEvent &&
          (reactEventType =
            nativeEvent.relatedTarget || nativeEvent.fromElement) &&
          (getClosestInstanceFromNode(reactEventType) ||
            reactEventType[internalContainerInstanceKey])
        )
          break a;
        if (SyntheticEventCtor || reactName) {
          reactName =
            nativeEventTarget.window === nativeEventTarget
              ? nativeEventTarget
              : (reactName = nativeEventTarget.ownerDocument)
                ? reactName.defaultView || reactName.parentWindow
                : window;
          if (SyntheticEventCtor) {
            if (
              ((reactEventType =
                nativeEvent.relatedTarget || nativeEvent.toElement),
              (SyntheticEventCtor = targetInst),
              (reactEventType = reactEventType
                ? getClosestInstanceFromNode(reactEventType)
                : null),
              null !== reactEventType &&
                ((accumulateTargetOnly =
                  getNearestMountedFiber(reactEventType)),
                (inCapturePhase = reactEventType.tag),
                reactEventType !== accumulateTargetOnly ||
                  (5 !== inCapturePhase &&
                    27 !== inCapturePhase &&
                    6 !== inCapturePhase)))
            )
              reactEventType = null;
          } else (SyntheticEventCtor = null), (reactEventType = targetInst);
          if (SyntheticEventCtor !== reactEventType) {
            inCapturePhase = SyntheticMouseEvent;
            _instance = "onMouseLeave";
            reactEventName = "onMouseEnter";
            instance = "mouse";
            if ("pointerout" === domEventName || "pointerover" === domEventName)
              (inCapturePhase = SyntheticPointerEvent),
                (_instance = "onPointerLeave"),
                (reactEventName = "onPointerEnter"),
                (instance = "pointer");
            accumulateTargetOnly =
              null == SyntheticEventCtor
                ? reactName
                : getNodeFromInstance(SyntheticEventCtor);
            lastHostComponent =
              null == reactEventType
                ? reactName
                : getNodeFromInstance(reactEventType);
            reactName = new inCapturePhase(
              _instance,
              instance + "leave",
              SyntheticEventCtor,
              nativeEvent,
              nativeEventTarget
            );
            reactName.target = accumulateTargetOnly;
            reactName.relatedTarget = lastHostComponent;
            _instance = null;
            getClosestInstanceFromNode(nativeEventTarget) === targetInst &&
              ((inCapturePhase = new inCapturePhase(
                reactEventName,
                instance + "enter",
                reactEventType,
                nativeEvent,
                nativeEventTarget
              )),
              (inCapturePhase.target = lastHostComponent),
              (inCapturePhase.relatedTarget = accumulateTargetOnly),
              (_instance = inCapturePhase));
            accumulateTargetOnly = _instance;
            if (SyntheticEventCtor && reactEventType)
              b: {
                inCapturePhase = getParent;
                reactEventName = SyntheticEventCtor;
                instance = reactEventType;
                lastHostComponent = 0;
                for (
                  _instance = reactEventName;
                  _instance;
                  _instance = inCapturePhase(_instance)
                )
                  lastHostComponent++;
                _instance = 0;
                for (var tempB = instance; tempB; tempB = inCapturePhase(tempB))
                  _instance++;
                for (; 0 < lastHostComponent - _instance; )
                  (reactEventName = inCapturePhase(reactEventName)),
                    lastHostComponent--;
                for (; 0 < _instance - lastHostComponent; )
                  (instance = inCapturePhase(instance)), _instance--;
                for (; lastHostComponent--; ) {
                  if (
                    reactEventName === instance ||
                    (null !== instance && reactEventName === instance.alternate)
                  ) {
                    inCapturePhase = reactEventName;
                    break b;
                  }
                  reactEventName = inCapturePhase(reactEventName);
                  instance = inCapturePhase(instance);
                }
                inCapturePhase = null;
              }
            else inCapturePhase = null;
            null !== SyntheticEventCtor &&
              accumulateEnterLeaveListenersForEvent(
                dispatchQueue,
                reactName,
                SyntheticEventCtor,
                inCapturePhase,
                !1
              );
            null !== reactEventType &&
              null !== accumulateTargetOnly &&
              accumulateEnterLeaveListenersForEvent(
                dispatchQueue,
                accumulateTargetOnly,
                reactEventType,
                inCapturePhase,
                !0
              );
          }
        }
      }
      a: {
        reactName = targetInst ? getNodeFromInstance(targetInst) : window;
        SyntheticEventCtor =
          reactName.nodeName && reactName.nodeName.toLowerCase();
        if (
          "select" === SyntheticEventCtor ||
          ("input" === SyntheticEventCtor && "file" === reactName.type)
        )
          var getTargetInstFunc = getTargetInstForChangeEvent;
        else if (isTextInputElement(reactName))
          if (isInputEventSupported)
            getTargetInstFunc = getTargetInstForInputOrChangeEvent;
          else {
            getTargetInstFunc = getTargetInstForInputEventPolyfill;
            var handleEventFunc = handleEventsForInputEventPolyfill;
          }
        else
          (SyntheticEventCtor = reactName.nodeName),
            !SyntheticEventCtor ||
            "input" !== SyntheticEventCtor.toLowerCase() ||
            ("checkbox" !== reactName.type && "radio" !== reactName.type)
              ? targetInst &&
                isCustomElement(targetInst.elementType) &&
                (getTargetInstFunc = getTargetInstForChangeEvent)
              : (getTargetInstFunc = getTargetInstForClickEvent);
        if (
          getTargetInstFunc &&
          (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))
        ) {
          createAndAccumulateChangeEvent(
            dispatchQueue,
            getTargetInstFunc,
            nativeEvent,
            nativeEventTarget
          );
          break a;
        }
        handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
        "focusout" === domEventName &&
          targetInst &&
          "number" === reactName.type &&
          null != targetInst.memoizedProps.value &&
          setDefaultValue(reactName, "number", reactName.value);
      }
      handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
      switch (domEventName) {
        case "focusin":
          if (
            isTextInputElement(handleEventFunc) ||
            "true" === handleEventFunc.contentEditable
          )
            (activeElement = handleEventFunc),
              (activeElementInst = targetInst),
              (lastSelection = null);
          break;
        case "focusout":
          lastSelection = activeElementInst = activeElement = null;
          break;
        case "mousedown":
          mouseDown = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          mouseDown = !1;
          constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
          break;
        case "selectionchange":
          if (skipSelectionChangeEvent) break;
        case "keydown":
        case "keyup":
          constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
      }
      var fallbackData;
      if (canUseCompositionEvent)
        b: {
          switch (domEventName) {
            case "compositionstart":
              var eventType = "onCompositionStart";
              break b;
            case "compositionend":
              eventType = "onCompositionEnd";
              break b;
            case "compositionupdate":
              eventType = "onCompositionUpdate";
              break b;
          }
          eventType = void 0;
        }
      else
        isComposing
          ? isFallbackCompositionEnd(domEventName, nativeEvent) &&
            (eventType = "onCompositionEnd")
          : "keydown" === domEventName &&
            229 === nativeEvent.keyCode &&
            (eventType = "onCompositionStart");
      eventType &&
        (useFallbackCompositionData &&
          "ko" !== nativeEvent.locale &&
          (isComposing || "onCompositionStart" !== eventType
            ? "onCompositionEnd" === eventType &&
              isComposing &&
              (fallbackData = getData())
            : ((root = nativeEventTarget),
              (startText = "value" in root ? root.value : root.textContent),
              (isComposing = !0))),
        (handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType)),
        0 < handleEventFunc.length &&
          ((eventType = new SyntheticCompositionEvent(
            eventType,
            domEventName,
            null,
            nativeEvent,
            nativeEventTarget
          )),
          dispatchQueue.push({ event: eventType, listeners: handleEventFunc }),
          fallbackData
            ? (eventType.data = fallbackData)
            : ((fallbackData = getDataFromCustomEvent(nativeEvent)),
              null !== fallbackData && (eventType.data = fallbackData))));
      if (
        (fallbackData = canUseTextInputEvent
          ? getNativeBeforeInputChars(domEventName, nativeEvent)
          : getFallbackBeforeInputChars(domEventName, nativeEvent))
      )
        (eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput")),
          0 < eventType.length &&
            ((handleEventFunc = new SyntheticCompositionEvent(
              "onBeforeInput",
              "beforeinput",
              null,
              nativeEvent,
              nativeEventTarget
            )),
            dispatchQueue.push({
              event: handleEventFunc,
              listeners: eventType
            }),
            (handleEventFunc.data = fallbackData));
      extractEvents$1(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget
      );
    }
    processDispatchQueue(dispatchQueue, eventSystemFlags);
  });
}
function createDispatchListener(instance, listener, currentTarget) {
  return {
    instance: instance,
    listener: listener,
    currentTarget: currentTarget
  };
}
function accumulateTwoPhaseListeners(targetFiber, reactName) {
  for (
    var captureName = reactName + "Capture", listeners = [];
    null !== targetFiber;

  ) {
    var _instance2 = targetFiber,
      stateNode = _instance2.stateNode;
    _instance2 = _instance2.tag;
    (5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2) ||
      null === stateNode ||
      ((_instance2 = getListener(targetFiber, captureName)),
      null != _instance2 &&
        listeners.unshift(
          createDispatchListener(targetFiber, _instance2, stateNode)
        ),
      (_instance2 = getListener(targetFiber, reactName)),
      null != _instance2 &&
        listeners.push(
          createDispatchListener(targetFiber, _instance2, stateNode)
        ));
    if (3 === targetFiber.tag) return listeners;
    targetFiber = targetFiber.return;
  }
  return [];
}
function getParent(inst) {
  if (null === inst) return null;
  do inst = inst.return;
  while (inst && 5 !== inst.tag && 27 !== inst.tag);
  return inst ? inst : null;
}
function accumulateEnterLeaveListenersForEvent(
  dispatchQueue,
  event,
  target,
  common,
  inCapturePhase
) {
  for (
    var registrationName = event._reactName, listeners = [];
    null !== target && target !== common;

  ) {
    var _instance3 = target,
      alternate = _instance3.alternate,
      stateNode = _instance3.stateNode;
    _instance3 = _instance3.tag;
    if (null !== alternate && alternate === common) break;
    (5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3) ||
      null === stateNode ||
      ((alternate = stateNode),
      inCapturePhase
        ? ((stateNode = getListener(target, registrationName)),
          null != stateNode &&
            listeners.unshift(
              createDispatchListener(target, stateNode, alternate)
            ))
        : inCapturePhase ||
          ((stateNode = getListener(target, registrationName)),
          null != stateNode &&
            listeners.push(
              createDispatchListener(target, stateNode, alternate)
            )));
    target = target.return;
  }
  0 !== listeners.length &&
    dispatchQueue.push({ event: event, listeners: listeners });
}
var NORMALIZE_NEWLINES_REGEX = /\r\n?/g,
  NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
function normalizeMarkupForTextOrAttribute(markup) {
  return ("string" === typeof markup ? markup : "" + markup)
    .replace(NORMALIZE_NEWLINES_REGEX, "\n")
    .replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
}
function checkForUnmatchedText(serverText, clientText) {
  clientText = normalizeMarkupForTextOrAttribute(clientText);
  return normalizeMarkupForTextOrAttribute(serverText) === clientText ? !0 : !1;
}
function setProp(domElement, tag, key, value, props, prevValue) {
  switch (key) {
    case "children":
      "string" === typeof value
        ? "body" === tag ||
          ("textarea" === tag && "" === value) ||
          setTextContent(domElement, value)
        : ("number" === typeof value || "bigint" === typeof value) &&
          "body" !== tag &&
          setTextContent(domElement, "" + value);
      break;
    case "className":
      setValueForKnownAttribute(domElement, "class", value);
      break;
    case "tabIndex":
      setValueForKnownAttribute(domElement, "tabindex", value);
      break;
    case "dir":
    case "role":
    case "viewBox":
    case "width":
    case "height":
      setValueForKnownAttribute(domElement, key, value);
      break;
    case "style":
      setValueForStyles(domElement, value, prevValue);
      break;
    case "data":
      if ("object" !== tag) {
        setValueForKnownAttribute(domElement, "data", value);
        break;
      }
    case "src":
    case "href":
      if ("" === value && ("a" !== tag || "href" !== key)) {
        domElement.removeAttribute(key);
        break;
      }
      if (
        null == value ||
        "function" === typeof value ||
        "symbol" === typeof value ||
        "boolean" === typeof value
      ) {
        domElement.removeAttribute(key);
        break;
      }
      value = sanitizeURL("" + value);
      domElement.setAttribute(key, value);
      break;
    case "action":
    case "formAction":
      if ("function" === typeof value) {
        domElement.setAttribute(
          key,
          "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
        );
        break;
      } else
        "function" === typeof prevValue &&
          ("formAction" === key
            ? ("input" !== tag &&
                setProp(domElement, tag, "name", props.name, props, null),
              setProp(
                domElement,
                tag,
                "formEncType",
                props.formEncType,
                props,
                null
              ),
              setProp(
                domElement,
                tag,
                "formMethod",
                props.formMethod,
                props,
                null
              ),
              setProp(
                domElement,
                tag,
                "formTarget",
                props.formTarget,
                props,
                null
              ))
            : (setProp(domElement, tag, "encType", props.encType, props, null),
              setProp(domElement, tag, "method", props.method, props, null),
              setProp(domElement, tag, "target", props.target, props, null)));
      if (
        null == value ||
        "symbol" === typeof value ||
        "boolean" === typeof value
      ) {
        domElement.removeAttribute(key);
        break;
      }
      value = sanitizeURL("" + value);
      domElement.setAttribute(key, value);
      break;
    case "onClick":
      null != value && (domElement.onclick = noop$1);
      break;
    case "onScroll":
      null != value && listenToNonDelegatedEvent("scroll", domElement);
      break;
    case "onScrollEnd":
      null != value && listenToNonDelegatedEvent("scrollend", domElement);
      break;
    case "dangerouslySetInnerHTML":
      if (null != value) {
        if ("object" !== typeof value || !("__html" in value))
          throw Error(formatProdErrorMessage(61));
        key = value.__html;
        if (null != key) {
          if (null != props.children) throw Error(formatProdErrorMessage(60));
          domElement.innerHTML = key;
        }
      }
      break;
    case "multiple":
      domElement.multiple =
        value && "function" !== typeof value && "symbol" !== typeof value;
      break;
    case "muted":
      domElement.muted =
        value && "function" !== typeof value && "symbol" !== typeof value;
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "defaultValue":
    case "defaultChecked":
    case "innerHTML":
    case "ref":
      break;
    case "autoFocus":
      break;
    case "xlinkHref":
      if (
        null == value ||
        "function" === typeof value ||
        "boolean" === typeof value ||
        "symbol" === typeof value
      ) {
        domElement.removeAttribute("xlink:href");
        break;
      }
      key = sanitizeURL("" + value);
      domElement.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        key
      );
      break;
    case "contentEditable":
    case "spellCheck":
    case "draggable":
    case "value":
    case "autoReverse":
    case "externalResourcesRequired":
    case "focusable":
    case "preserveAlpha":
      null != value && "function" !== typeof value && "symbol" !== typeof value
        ? domElement.setAttribute(key, "" + value)
        : domElement.removeAttribute(key);
      break;
    case "inert":
    case "allowFullScreen":
    case "async":
    case "autoPlay":
    case "controls":
    case "default":
    case "defer":
    case "disabled":
    case "disablePictureInPicture":
    case "disableRemotePlayback":
    case "formNoValidate":
    case "hidden":
    case "loop":
    case "noModule":
    case "noValidate":
    case "open":
    case "playsInline":
    case "readOnly":
    case "required":
    case "reversed":
    case "scoped":
    case "seamless":
    case "itemScope":
      value && "function" !== typeof value && "symbol" !== typeof value
        ? domElement.setAttribute(key, "")
        : domElement.removeAttribute(key);
      break;
    case "capture":
    case "download":
      !0 === value
        ? domElement.setAttribute(key, "")
        : !1 !== value &&
            null != value &&
            "function" !== typeof value &&
            "symbol" !== typeof value
          ? domElement.setAttribute(key, value)
          : domElement.removeAttribute(key);
      break;
    case "cols":
    case "rows":
    case "size":
    case "span":
      null != value &&
      "function" !== typeof value &&
      "symbol" !== typeof value &&
      !isNaN(value) &&
      1 <= value
        ? domElement.setAttribute(key, value)
        : domElement.removeAttribute(key);
      break;
    case "rowSpan":
    case "start":
      null == value ||
      "function" === typeof value ||
      "symbol" === typeof value ||
      isNaN(value)
        ? domElement.removeAttribute(key)
        : domElement.setAttribute(key, value);
      break;
    case "popover":
      listenToNonDelegatedEvent("beforetoggle", domElement);
      listenToNonDelegatedEvent("toggle", domElement);
      setValueForAttribute(domElement, "popover", value);
      break;
    case "xlinkActuate":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:actuate",
        value
      );
      break;
    case "xlinkArcrole":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:arcrole",
        value
      );
      break;
    case "xlinkRole":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:role",
        value
      );
      break;
    case "xlinkShow":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:show",
        value
      );
      break;
    case "xlinkTitle":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:title",
        value
      );
      break;
    case "xlinkType":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/1999/xlink",
        "xlink:type",
        value
      );
      break;
    case "xmlBase":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/XML/1998/namespace",
        "xml:base",
        value
      );
      break;
    case "xmlLang":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/XML/1998/namespace",
        "xml:lang",
        value
      );
      break;
    case "xmlSpace":
      setValueForNamespacedAttribute(
        domElement,
        "http://www.w3.org/XML/1998/namespace",
        "xml:space",
        value
      );
      break;
    case "is":
      setValueForAttribute(domElement, "is", value);
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      if (
        !(2 < key.length) ||
        ("o" !== key[0] && "O" !== key[0]) ||
        ("n" !== key[1] && "N" !== key[1])
      )
        (key = aliases.get(key) || key),
          setValueForAttribute(domElement, key, value);
  }
}
function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
  switch (key) {
    case "style":
      setValueForStyles(domElement, value, prevValue);
      break;
    case "dangerouslySetInnerHTML":
      if (null != value) {
        if ("object" !== typeof value || !("__html" in value))
          throw Error(formatProdErrorMessage(61));
        key = value.__html;
        if (null != key) {
          if (null != props.children) throw Error(formatProdErrorMessage(60));
          domElement.innerHTML = key;
        }
      }
      break;
    case "children":
      "string" === typeof value
        ? setTextContent(domElement, value)
        : ("number" === typeof value || "bigint" === typeof value) &&
          setTextContent(domElement, "" + value);
      break;
    case "onScroll":
      null != value && listenToNonDelegatedEvent("scroll", domElement);
      break;
    case "onScrollEnd":
      null != value && listenToNonDelegatedEvent("scrollend", domElement);
      break;
    case "onClick":
      null != value && (domElement.onclick = noop$1);
      break;
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "innerHTML":
    case "ref":
      break;
    case "innerText":
    case "textContent":
      break;
    default:
      if (!registrationNameDependencies.hasOwnProperty(key))
        a: {
          if (
            "o" === key[0] &&
            "n" === key[1] &&
            ((props = key.endsWith("Capture")),
            (tag = key.slice(2, props ? key.length - 7 : void 0)),
            (prevValue = domElement[internalPropsKey] || null),
            (prevValue = null != prevValue ? prevValue[key] : null),
            "function" === typeof prevValue &&
              domElement.removeEventListener(tag, prevValue, props),
            "function" === typeof value)
          ) {
            "function" !== typeof prevValue &&
              null !== prevValue &&
              (key in domElement
                ? (domElement[key] = null)
                : domElement.hasAttribute(key) &&
                  domElement.removeAttribute(key));
            domElement.addEventListener(tag, value, props);
            break a;
          }
          key in domElement
            ? (domElement[key] = value)
            : !0 === value
              ? domElement.setAttribute(key, "")
              : setValueForAttribute(domElement, key, value);
        }
  }
}
function setInitialProperties(domElement, tag, props) {
  switch (tag) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "img":
      listenToNonDelegatedEvent("error", domElement);
      listenToNonDelegatedEvent("load", domElement);
      var hasSrc = !1,
        hasSrcSet = !1,
        propKey;
      for (propKey in props)
        if (props.hasOwnProperty(propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "src":
                hasSrc = !0;
                break;
              case "srcSet":
                hasSrcSet = !0;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(137, tag));
              default:
                setProp(domElement, tag, propKey, propValue, props, null);
            }
        }
      hasSrcSet &&
        setProp(domElement, tag, "srcSet", props.srcSet, props, null);
      hasSrc && setProp(domElement, tag, "src", props.src, props, null);
      return;
    case "input":
      listenToNonDelegatedEvent("invalid", domElement);
      var defaultValue = (propKey = propValue = hasSrcSet = null),
        checked = null,
        defaultChecked = null;
      for (hasSrc in props)
        if (props.hasOwnProperty(hasSrc)) {
          var propValue$184 = props[hasSrc];
          if (null != propValue$184)
            switch (hasSrc) {
              case "name":
                hasSrcSet = propValue$184;
                break;
              case "type":
                propValue = propValue$184;
                break;
              case "checked":
                checked = propValue$184;
                break;
              case "defaultChecked":
                defaultChecked = propValue$184;
                break;
              case "value":
                propKey = propValue$184;
                break;
              case "defaultValue":
                defaultValue = propValue$184;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (null != propValue$184)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                setProp(domElement, tag, hasSrc, propValue$184, props, null);
            }
        }
      initInput(
        domElement,
        propKey,
        defaultValue,
        checked,
        defaultChecked,
        propValue,
        hasSrcSet,
        !1
      );
      return;
    case "select":
      listenToNonDelegatedEvent("invalid", domElement);
      hasSrc = propValue = propKey = null;
      for (hasSrcSet in props)
        if (
          props.hasOwnProperty(hasSrcSet) &&
          ((defaultValue = props[hasSrcSet]), null != defaultValue)
        )
          switch (hasSrcSet) {
            case "value":
              propKey = defaultValue;
              break;
            case "defaultValue":
              propValue = defaultValue;
              break;
            case "multiple":
              hasSrc = defaultValue;
            default:
              setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
          }
      tag = propKey;
      props = propValue;
      domElement.multiple = !!hasSrc;
      null != tag
        ? updateOptions(domElement, !!hasSrc, tag, !1)
        : null != props && updateOptions(domElement, !!hasSrc, props, !0);
      return;
    case "textarea":
      listenToNonDelegatedEvent("invalid", domElement);
      propKey = hasSrcSet = hasSrc = null;
      for (propValue in props)
        if (
          props.hasOwnProperty(propValue) &&
          ((defaultValue = props[propValue]), null != defaultValue)
        )
          switch (propValue) {
            case "value":
              hasSrc = defaultValue;
              break;
            case "defaultValue":
              hasSrcSet = defaultValue;
              break;
            case "children":
              propKey = defaultValue;
              break;
            case "dangerouslySetInnerHTML":
              if (null != defaultValue) throw Error(formatProdErrorMessage(91));
              break;
            default:
              setProp(domElement, tag, propValue, defaultValue, props, null);
          }
      initTextarea(domElement, hasSrc, hasSrcSet, propKey);
      return;
    case "option":
      for (checked in props)
        if (
          props.hasOwnProperty(checked) &&
          ((hasSrc = props[checked]), null != hasSrc)
        )
          switch (checked) {
            case "selected":
              domElement.selected =
                hasSrc &&
                "function" !== typeof hasSrc &&
                "symbol" !== typeof hasSrc;
              break;
            default:
              setProp(domElement, tag, checked, hasSrc, props, null);
          }
      return;
    case "dialog":
      listenToNonDelegatedEvent("beforetoggle", domElement);
      listenToNonDelegatedEvent("toggle", domElement);
      listenToNonDelegatedEvent("cancel", domElement);
      listenToNonDelegatedEvent("close", domElement);
      break;
    case "iframe":
    case "object":
      listenToNonDelegatedEvent("load", domElement);
      break;
    case "video":
    case "audio":
      for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++)
        listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
      break;
    case "image":
      listenToNonDelegatedEvent("error", domElement);
      listenToNonDelegatedEvent("load", domElement);
      break;
    case "details":
      listenToNonDelegatedEvent("toggle", domElement);
      break;
    case "embed":
    case "source":
    case "link":
      listenToNonDelegatedEvent("error", domElement),
        listenToNonDelegatedEvent("load", domElement);
    case "area":
    case "base":
    case "br":
    case "col":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "track":
    case "wbr":
    case "menuitem":
      for (defaultChecked in props)
        if (
          props.hasOwnProperty(defaultChecked) &&
          ((hasSrc = props[defaultChecked]), null != hasSrc)
        )
          switch (defaultChecked) {
            case "children":
            case "dangerouslySetInnerHTML":
              throw Error(formatProdErrorMessage(137, tag));
            default:
              setProp(domElement, tag, defaultChecked, hasSrc, props, null);
          }
      return;
    default:
      if (isCustomElement(tag)) {
        for (propValue$184 in props)
          props.hasOwnProperty(propValue$184) &&
            ((hasSrc = props[propValue$184]),
            void 0 !== hasSrc &&
              setPropOnCustomElement(
                domElement,
                tag,
                propValue$184,
                hasSrc,
                props,
                void 0
              ));
        return;
      }
  }
  for (defaultValue in props)
    props.hasOwnProperty(defaultValue) &&
      ((hasSrc = props[defaultValue]),
      null != hasSrc &&
        setProp(domElement, tag, defaultValue, hasSrc, props, null));
}
function updateProperties(domElement, tag, lastProps, nextProps) {
  switch (tag) {
    case "div":
    case "span":
    case "svg":
    case "path":
    case "a":
    case "g":
    case "p":
    case "li":
      break;
    case "input":
      var name = null,
        type = null,
        value = null,
        defaultValue = null,
        lastDefaultValue = null,
        checked = null,
        defaultChecked = null;
      for (propKey in lastProps) {
        var lastProp = lastProps[propKey];
        if (lastProps.hasOwnProperty(propKey) && null != lastProp)
          switch (propKey) {
            case "checked":
              break;
            case "value":
              break;
            case "defaultValue":
              lastDefaultValue = lastProp;
            default:
              nextProps.hasOwnProperty(propKey) ||
                setProp(domElement, tag, propKey, null, nextProps, lastProp);
          }
      }
      for (var propKey$201 in nextProps) {
        var propKey = nextProps[propKey$201];
        lastProp = lastProps[propKey$201];
        if (
          nextProps.hasOwnProperty(propKey$201) &&
          (null != propKey || null != lastProp)
        )
          switch (propKey$201) {
            case "type":
              type = propKey;
              break;
            case "name":
              name = propKey;
              break;
            case "checked":
              checked = propKey;
              break;
            case "defaultChecked":
              defaultChecked = propKey;
              break;
            case "value":
              value = propKey;
              break;
            case "defaultValue":
              defaultValue = propKey;
              break;
            case "children":
            case "dangerouslySetInnerHTML":
              if (null != propKey)
                throw Error(formatProdErrorMessage(137, tag));
              break;
            default:
              propKey !== lastProp &&
                setProp(
                  domElement,
                  tag,
                  propKey$201,
                  propKey,
                  nextProps,
                  lastProp
                );
          }
      }
      updateInput(
        domElement,
        value,
        defaultValue,
        lastDefaultValue,
        checked,
        defaultChecked,
        type,
        name
      );
      return;
    case "select":
      propKey = value = defaultValue = propKey$201 = null;
      for (type in lastProps)
        if (
          ((lastDefaultValue = lastProps[type]),
          lastProps.hasOwnProperty(type) && null != lastDefaultValue)
        )
          switch (type) {
            case "value":
              break;
            case "multiple":
              propKey = lastDefaultValue;
            default:
              nextProps.hasOwnProperty(type) ||
                setProp(
                  domElement,
                  tag,
                  type,
                  null,
                  nextProps,
                  lastDefaultValue
                );
          }
      for (name in nextProps)
        if (
          ((type = nextProps[name]),
          (lastDefaultValue = lastProps[name]),
          nextProps.hasOwnProperty(name) &&
            (null != type || null != lastDefaultValue))
        )
          switch (name) {
            case "value":
              propKey$201 = type;
              break;
            case "defaultValue":
              defaultValue = type;
              break;
            case "multiple":
              value = type;
            default:
              type !== lastDefaultValue &&
                setProp(
                  domElement,
                  tag,
                  name,
                  type,
                  nextProps,
                  lastDefaultValue
                );
          }
      tag = defaultValue;
      lastProps = value;
      nextProps = propKey;
      null != propKey$201
        ? updateOptions(domElement, !!lastProps, propKey$201, !1)
        : !!nextProps !== !!lastProps &&
          (null != tag
            ? updateOptions(domElement, !!lastProps, tag, !0)
            : updateOptions(domElement, !!lastProps, lastProps ? [] : "", !1));
      return;
    case "textarea":
      propKey = propKey$201 = null;
      for (defaultValue in lastProps)
        if (
          ((name = lastProps[defaultValue]),
          lastProps.hasOwnProperty(defaultValue) &&
            null != name &&
            !nextProps.hasOwnProperty(defaultValue))
        )
          switch (defaultValue) {
            case "value":
              break;
            case "children":
              break;
            default:
              setProp(domElement, tag, defaultValue, null, nextProps, name);
          }
      for (value in nextProps)
        if (
          ((name = nextProps[value]),
          (type = lastProps[value]),
          nextProps.hasOwnProperty(value) && (null != name || null != type))
        )
          switch (value) {
            case "value":
              propKey$201 = name;
              break;
            case "defaultValue":
              propKey = name;
              break;
            case "children":
              break;
            case "dangerouslySetInnerHTML":
              if (null != name) throw Error(formatProdErrorMessage(91));
              break;
            default:
              name !== type &&
                setProp(domElement, tag, value, name, nextProps, type);
          }
      updateTextarea(domElement, propKey$201, propKey);
      return;
    case "option":
      for (var propKey$217 in lastProps)
        if (
          ((propKey$201 = lastProps[propKey$217]),
          lastProps.hasOwnProperty(propKey$217) &&
            null != propKey$201 &&
            !nextProps.hasOwnProperty(propKey$217))
        )
          switch (propKey$217) {
            case "selected":
              domElement.selected = !1;
              break;
            default:
              setProp(
                domElement,
                tag,
                propKey$217,
                null,
                nextProps,
                propKey$201
              );
          }
      for (lastDefaultValue in nextProps)
        if (
          ((propKey$201 = nextProps[lastDefaultValue]),
          (propKey = lastProps[lastDefaultValue]),
          nextProps.hasOwnProperty(lastDefaultValue) &&
            propKey$201 !== propKey &&
            (null != propKey$201 || null != propKey))
        )
          switch (lastDefaultValue) {
            case "selected":
              domElement.selected =
                propKey$201 &&
                "function" !== typeof propKey$201 &&
                "symbol" !== typeof propKey$201;
              break;
            default:
              setProp(
                domElement,
                tag,
                lastDefaultValue,
                propKey$201,
                nextProps,
                propKey
              );
          }
      return;
    case "img":
    case "link":
    case "area":
    case "base":
    case "br":
    case "col":
    case "embed":
    case "hr":
    case "keygen":
    case "meta":
    case "param":
    case "source":
    case "track":
    case "wbr":
    case "menuitem":
      for (var propKey$222 in lastProps)
        (propKey$201 = lastProps[propKey$222]),
          lastProps.hasOwnProperty(propKey$222) &&
            null != propKey$201 &&
            !nextProps.hasOwnProperty(propKey$222) &&
            setProp(domElement, tag, propKey$222, null, nextProps, propKey$201);
      for (checked in nextProps)
        if (
          ((propKey$201 = nextProps[checked]),
          (propKey = lastProps[checked]),
          nextProps.hasOwnProperty(checked) &&
            propKey$201 !== propKey &&
            (null != propKey$201 || null != propKey))
        )
          switch (checked) {
            case "children":
            case "dangerouslySetInnerHTML":
              if (null != propKey$201)
                throw Error(formatProdErrorMessage(137, tag));
              break;
            default:
              setProp(
                domElement,
                tag,
                checked,
                propKey$201,
                nextProps,
                propKey
              );
          }
      return;
    default:
      if (isCustomElement(tag)) {
        for (var propKey$227 in lastProps)
          (propKey$201 = lastProps[propKey$227]),
            lastProps.hasOwnProperty(propKey$227) &&
              void 0 !== propKey$201 &&
              !nextProps.hasOwnProperty(propKey$227) &&
              setPropOnCustomElement(
                domElement,
                tag,
                propKey$227,
                void 0,
                nextProps,
                propKey$201
              );
        for (defaultChecked in nextProps)
          (propKey$201 = nextProps[defaultChecked]),
            (propKey = lastProps[defaultChecked]),
            !nextProps.hasOwnProperty(defaultChecked) ||
              propKey$201 === propKey ||
              (void 0 === propKey$201 && void 0 === propKey) ||
              setPropOnCustomElement(
                domElement,
                tag,
                defaultChecked,
                propKey$201,
                nextProps,
                propKey
              );
        return;
      }
  }
  for (var propKey$232 in lastProps)
    (propKey$201 = lastProps[propKey$232]),
      lastProps.hasOwnProperty(propKey$232) &&
        null != propKey$201 &&
        !nextProps.hasOwnProperty(propKey$232) &&
        setProp(domElement, tag, propKey$232, null, nextProps, propKey$201);
  for (lastProp in nextProps)
    (propKey$201 = nextProps[lastProp]),
      (propKey = lastProps[lastProp]),
      !nextProps.hasOwnProperty(lastProp) ||
        propKey$201 === propKey ||
        (null == propKey$201 && null == propKey) ||
        setProp(domElement, tag, lastProp, propKey$201, nextProps, propKey);
}
function isLikelyStaticResource(initiatorType) {
  switch (initiatorType) {
    case "css":
    case "script":
    case "font":
    case "img":
    case "image":
    case "input":
    case "link":
      return !0;
    default:
      return !1;
  }
}
function estimateBandwidth() {
  if ("function" === typeof performance.getEntriesByType) {
    for (
      var count = 0,
        bits = 0,
        resourceEntries = performance.getEntriesByType("resource"),
        i = 0;
      i < resourceEntries.length;
      i++
    ) {
      var entry = resourceEntries[i],
        transferSize = entry.transferSize,
        initiatorType = entry.initiatorType,
        duration = entry.duration;
      if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
        initiatorType = 0;
        duration = entry.responseEnd;
        for (i += 1; i < resourceEntries.length; i++) {
          var overlapEntry = resourceEntries[i],
            overlapStartTime = overlapEntry.startTime;
          if (overlapStartTime > duration) break;
          var overlapTransferSize = overlapEntry.transferSize,
            overlapInitiatorType = overlapEntry.initiatorType;
          overlapTransferSize &&
            isLikelyStaticResource(overlapInitiatorType) &&
            ((overlapEntry = overlapEntry.responseEnd),
            (initiatorType +=
              overlapTransferSize *
              (overlapEntry < duration
                ? 1
                : (duration - overlapStartTime) /
                  (overlapEntry - overlapStartTime))));
        }
        --i;
        bits += (8 * (transferSize + initiatorType)) / (entry.duration / 1e3);
        count++;
        if (10 < count) break;
      }
    }
    if (0 < count) return bits / count / 1e6;
  }
  return navigator.connection &&
    ((count = navigator.connection.downlink), "number" === typeof count)
    ? count
    : 5;
}
var eventsEnabled = null,
  selectionInformation = null;
function getOwnerDocumentFromRootContainer(rootContainerElement) {
  return 9 === rootContainerElement.nodeType
    ? rootContainerElement
    : rootContainerElement.ownerDocument;
}
function getOwnHostContext(namespaceURI) {
  switch (namespaceURI) {
    case "http://www.w3.org/2000/svg":
      return 1;
    case "http://www.w3.org/1998/Math/MathML":
      return 2;
    default:
      return 0;
  }
}
function getChildHostContextProd(parentNamespace, type) {
  if (0 === parentNamespace)
    switch (type) {
      case "svg":
        return 1;
      case "math":
        return 2;
      default:
        return 0;
    }
  return 1 === parentNamespace && "foreignObject" === type
    ? 0
    : parentNamespace;
}
function shouldSetTextContent(type, props) {
  return (
    "textarea" === type ||
    "noscript" === type ||
    "string" === typeof props.children ||
    "number" === typeof props.children ||
    "bigint" === typeof props.children ||
    ("object" === typeof props.dangerouslySetInnerHTML &&
      null !== props.dangerouslySetInnerHTML &&
      null != props.dangerouslySetInnerHTML.__html)
  );
}
var currentPopstateTransitionEvent = null;
function shouldAttemptEagerTransition() {
  var event = window.event;
  if (event && "popstate" === event.type) {
    if (event === currentPopstateTransitionEvent) return !1;
    currentPopstateTransitionEvent = event;
    return !0;
  }
  currentPopstateTransitionEvent = null;
  return !1;
}
var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0,
  cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0,
  localPromise = "function" === typeof Promise ? Promise : void 0,
  scheduleMicrotask =
    "function" === typeof queueMicrotask
      ? queueMicrotask
      : "undefined" !== typeof localPromise
        ? function (callback) {
            return localPromise
              .resolve(null)
              .then(callback)
              .catch(handleErrorInNextTick);
          }
        : scheduleTimeout;
function handleErrorInNextTick(error) {
  setTimeout(function () {
    throw error;
  });
}
function isSingletonScope(type) {
  return "head" === type;
}
function clearHydrationBoundary(parentInstance, hydrationInstance) {
  var node = hydrationInstance,
    depth = 0;
  do {
    var nextNode = node.nextSibling;
    parentInstance.removeChild(node);
    if (nextNode && 8 === nextNode.nodeType)
      if (((node = nextNode.data), "/$" === node || "/&" === node)) {
        if (0 === depth) {
          parentInstance.removeChild(nextNode);
          retryIfBlockedOn(hydrationInstance);
          return;
        }
        depth--;
      } else if (
        "$" === node ||
        "$?" === node ||
        "$~" === node ||
        "$!" === node ||
        "&" === node
      )
        depth++;
      else if ("html" === node)
        releaseSingletonInstance(parentInstance.ownerDocument.documentElement);
      else if ("head" === node) {
        node = parentInstance.ownerDocument.head;
        releaseSingletonInstance(node);
        for (var node$jscomp$0 = node.firstChild; node$jscomp$0; ) {
          var nextNode$jscomp$0 = node$jscomp$0.nextSibling,
            nodeName = node$jscomp$0.nodeName;
          node$jscomp$0[internalHoistableMarker] ||
            "SCRIPT" === nodeName ||
            "STYLE" === nodeName ||
            ("LINK" === nodeName &&
              "stylesheet" === node$jscomp$0.rel.toLowerCase()) ||
            node.removeChild(node$jscomp$0);
          node$jscomp$0 = nextNode$jscomp$0;
        }
      } else
        "body" === node &&
          releaseSingletonInstance(parentInstance.ownerDocument.body);
    node = nextNode;
  } while (node);
  retryIfBlockedOn(hydrationInstance);
}
function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
  var node = suspenseInstance;
  suspenseInstance = 0;
  do {
    var nextNode = node.nextSibling;
    1 === node.nodeType
      ? isHidden
        ? ((node._stashedDisplay = node.style.display),
          (node.style.display = "none"))
        : ((node.style.display = node._stashedDisplay || ""),
          "" === node.getAttribute("style") && node.removeAttribute("style"))
      : 3 === node.nodeType &&
        (isHidden
          ? ((node._stashedText = node.nodeValue), (node.nodeValue = ""))
          : (node.nodeValue = node._stashedText || ""));
    if (nextNode && 8 === nextNode.nodeType)
      if (((node = nextNode.data), "/$" === node))
        if (0 === suspenseInstance) break;
        else suspenseInstance--;
      else
        ("$" !== node && "$?" !== node && "$~" !== node && "$!" !== node) ||
          suspenseInstance++;
    node = nextNode;
  } while (node);
}
function clearContainerSparingly(container) {
  var nextNode = container.firstChild;
  nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
  for (; nextNode; ) {
    var node = nextNode;
    nextNode = nextNode.nextSibling;
    switch (node.nodeName) {
      case "HTML":
      case "HEAD":
      case "BODY":
        clearContainerSparingly(node);
        detachDeletedInstance(node);
        continue;
      case "SCRIPT":
      case "STYLE":
        continue;
      case "LINK":
        if ("stylesheet" === node.rel.toLowerCase()) continue;
    }
    container.removeChild(node);
  }
}
function canHydrateInstance(instance, type, props, inRootOrSingleton) {
  for (; 1 === instance.nodeType; ) {
    var anyProps = props;
    if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
      if (
        !inRootOrSingleton &&
        ("INPUT" !== instance.nodeName || "hidden" !== instance.type)
      )
        break;
    } else if (!inRootOrSingleton)
      if ("input" === type && "hidden" === instance.type) {
        var name = null == anyProps.name ? null : "" + anyProps.name;
        if (
          "hidden" === anyProps.type &&
          instance.getAttribute("name") === name
        )
          return instance;
      } else return instance;
    else if (!instance[internalHoistableMarker])
      switch (type) {
        case "meta":
          if (!instance.hasAttribute("itemprop")) break;
          return instance;
        case "link":
          name = instance.getAttribute("rel");
          if ("stylesheet" === name && instance.hasAttribute("data-precedence"))
            break;
          else if (
            name !== anyProps.rel ||
            instance.getAttribute("href") !==
              (null == anyProps.href || "" === anyProps.href
                ? null
                : anyProps.href) ||
            instance.getAttribute("crossorigin") !==
              (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) ||
            instance.getAttribute("title") !==
              (null == anyProps.title ? null : anyProps.title)
          )
            break;
          return instance;
        case "style":
          if (instance.hasAttribute("data-precedence")) break;
          return instance;
        case "script":
          name = instance.getAttribute("src");
          if (
            (name !== (null == anyProps.src ? null : anyProps.src) ||
              instance.getAttribute("type") !==
                (null == anyProps.type ? null : anyProps.type) ||
              instance.getAttribute("crossorigin") !==
                (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) &&
            name &&
            instance.hasAttribute("async") &&
            !instance.hasAttribute("itemprop")
          )
            break;
          return instance;
        default:
          return instance;
      }
    instance = getNextHydratable(instance.nextSibling);
    if (null === instance) break;
  }
  return null;
}
function canHydrateTextInstance(instance, text, inRootOrSingleton) {
  if ("" === text) return null;
  for (; 3 !== instance.nodeType; ) {
    if (
      (1 !== instance.nodeType ||
        "INPUT" !== instance.nodeName ||
        "hidden" !== instance.type) &&
      !inRootOrSingleton
    )
      return null;
    instance = getNextHydratable(instance.nextSibling);
    if (null === instance) return null;
  }
  return instance;
}
function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
  for (; 8 !== instance.nodeType; ) {
    if (
      (1 !== instance.nodeType ||
        "INPUT" !== instance.nodeName ||
        "hidden" !== instance.type) &&
      !inRootOrSingleton
    )
      return null;
    instance = getNextHydratable(instance.nextSibling);
    if (null === instance) return null;
  }
  return instance;
}
function isSuspenseInstancePending(instance) {
  return "$?" === instance.data || "$~" === instance.data;
}
function isSuspenseInstanceFallback(instance) {
  return (
    "$!" === instance.data ||
    ("$?" === instance.data && "loading" !== instance.ownerDocument.readyState)
  );
}
function registerSuspenseInstanceRetry(instance, callback) {
  var ownerDocument = instance.ownerDocument;
  if ("$~" === instance.data) instance._reactRetry = callback;
  else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState)
    callback();
  else {
    var listener = function () {
      callback();
      ownerDocument.removeEventListener("DOMContentLoaded", listener);
    };
    ownerDocument.addEventListener("DOMContentLoaded", listener);
    instance._reactRetry = listener;
  }
}
function getNextHydratable(node) {
  for (; null != node; node = node.nextSibling) {
    var nodeType = node.nodeType;
    if (1 === nodeType || 3 === nodeType) break;
    if (8 === nodeType) {
      nodeType = node.data;
      if (
        "$" === nodeType ||
        "$!" === nodeType ||
        "$?" === nodeType ||
        "$~" === nodeType ||
        "&" === nodeType ||
        "F!" === nodeType ||
        "F" === nodeType
      )
        break;
      if ("/$" === nodeType || "/&" === nodeType) return null;
    }
  }
  return node;
}
var previousHydratableOnEnteringScopedSingleton = null;
function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
  hydrationInstance = hydrationInstance.nextSibling;
  for (var depth = 0; hydrationInstance; ) {
    if (8 === hydrationInstance.nodeType) {
      var data = hydrationInstance.data;
      if ("/$" === data || "/&" === data) {
        if (0 === depth)
          return getNextHydratable(hydrationInstance.nextSibling);
        depth--;
      } else
        ("$" !== data &&
          "$!" !== data &&
          "$?" !== data &&
          "$~" !== data &&
          "&" !== data) ||
          depth++;
    }
    hydrationInstance = hydrationInstance.nextSibling;
  }
  return null;
}
function getParentHydrationBoundary(targetInstance) {
  targetInstance = targetInstance.previousSibling;
  for (var depth = 0; targetInstance; ) {
    if (8 === targetInstance.nodeType) {
      var data = targetInstance.data;
      if (
        "$" === data ||
        "$!" === data ||
        "$?" === data ||
        "$~" === data ||
        "&" === data
      ) {
        if (0 === depth) return targetInstance;
        depth--;
      } else ("/$" !== data && "/&" !== data) || depth++;
    }
    targetInstance = targetInstance.previousSibling;
  }
  return null;
}
function resolveSingletonInstance(type, props, rootContainerInstance) {
  props = getOwnerDocumentFromRootContainer(rootContainerInstance);
  switch (type) {
    case "html":
      type = props.documentElement;
      if (!type) throw Error(formatProdErrorMessage(452));
      return type;
    case "head":
      type = props.head;
      if (!type) throw Error(formatProdErrorMessage(453));
      return type;
    case "body":
      type = props.body;
      if (!type) throw Error(formatProdErrorMessage(454));
      return type;
    default:
      throw Error(formatProdErrorMessage(451));
  }
}
function releaseSingletonInstance(instance) {
  for (var attributes = instance.attributes; attributes.length; )
    instance.removeAttributeNode(attributes[0]);
  detachDeletedInstance(instance);
}
var preloadPropsMap = new Map(),
  preconnectsSet = new Set();
function getHoistableRoot(container) {
  return "function" === typeof container.getRootNode
    ? container.getRootNode()
    : 9 === container.nodeType
      ? container
      : container.ownerDocument;
}
var previousDispatcher = ReactDOMSharedInternals.d;
ReactDOMSharedInternals.d = {
  f: flushSyncWork,
  r: requestFormReset,
  D: prefetchDNS,
  C: preconnect,
  L: preload,
  m: preloadModule,
  X: preinitScript,
  S: preinitStyle,
  M: preinitModuleScript
};
function flushSyncWork() {
  var previousWasRendering = previousDispatcher.f(),
    wasRendering = flushSyncWork$1();
  return previousWasRendering || wasRendering;
}
function requestFormReset(form) {
  var formInst = getInstanceFromNode(form);
  null !== formInst && 5 === formInst.tag && "form" === formInst.type
    ? requestFormReset$1(formInst)
    : previousDispatcher.r(form);
}
var globalDocument = "undefined" === typeof document ? null : document;
function preconnectAs(rel, href, crossOrigin) {
  var ownerDocument = globalDocument;
  if (ownerDocument && "string" === typeof href && href) {
    var limitedEscapedHref =
      escapeSelectorAttributeValueInsideDoubleQuotes(href);
    limitedEscapedHref =
      'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
    "string" === typeof crossOrigin &&
      (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
    preconnectsSet.has(limitedEscapedHref) ||
      (preconnectsSet.add(limitedEscapedHref),
      (rel = { rel: rel, crossOrigin: crossOrigin, href: href }),
      null === ownerDocument.querySelector(limitedEscapedHref) &&
        ((href = ownerDocument.createElement("link")),
        setInitialProperties(href, "link", rel),
        markNodeAsHoistable(href),
        ownerDocument.head.appendChild(href)));
  }
}
function prefetchDNS(href) {
  previousDispatcher.D(href);
  preconnectAs("dns-prefetch", href, null);
}
function preconnect(href, crossOrigin) {
  previousDispatcher.C(href, crossOrigin);
  preconnectAs("preconnect", href, crossOrigin);
}
function preload(href, as, options) {
  previousDispatcher.L(href, as, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && href && as) {
    var preloadSelector =
      'link[rel="preload"][as="' +
      escapeSelectorAttributeValueInsideDoubleQuotes(as) +
      '"]';
    "image" === as
      ? options && options.imageSrcSet
        ? ((preloadSelector +=
            '[imagesrcset="' +
            escapeSelectorAttributeValueInsideDoubleQuotes(
              options.imageSrcSet
            ) +
            '"]'),
          "string" === typeof options.imageSizes &&
            (preloadSelector +=
              '[imagesizes="' +
              escapeSelectorAttributeValueInsideDoubleQuotes(
                options.imageSizes
              ) +
              '"]'))
        : (preloadSelector +=
            '[href="' +
            escapeSelectorAttributeValueInsideDoubleQuotes(href) +
            '"]')
      : (preloadSelector +=
          '[href="' +
          escapeSelectorAttributeValueInsideDoubleQuotes(href) +
          '"]');
    var key = preloadSelector;
    switch (as) {
      case "style":
        key = getStyleKey(href);
        break;
      case "script":
        key = getScriptKey(href);
    }
    preloadPropsMap.has(key) ||
      ((href = assign(
        {
          rel: "preload",
          href:
            "image" === as && options && options.imageSrcSet ? void 0 : href,
          as: as
        },
        options
      )),
      preloadPropsMap.set(key, href),
      null !== ownerDocument.querySelector(preloadSelector) ||
        ("style" === as &&
          ownerDocument.querySelector(getStylesheetSelectorFromKey(key))) ||
        ("script" === as &&
          ownerDocument.querySelector(getScriptSelectorFromKey(key))) ||
        ((as = ownerDocument.createElement("link")),
        setInitialProperties(as, "link", href),
        markNodeAsHoistable(as),
        ownerDocument.head.appendChild(as)));
  }
}
function preloadModule(href, options) {
  previousDispatcher.m(href, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && href) {
    var as = options && "string" === typeof options.as ? options.as : "script",
      preloadSelector =
        'link[rel="modulepreload"][as="' +
        escapeSelectorAttributeValueInsideDoubleQuotes(as) +
        '"][href="' +
        escapeSelectorAttributeValueInsideDoubleQuotes(href) +
        '"]',
      key = preloadSelector;
    switch (as) {
      case "audioworklet":
      case "paintworklet":
      case "serviceworker":
      case "sharedworker":
      case "worker":
      case "script":
        key = getScriptKey(href);
    }
    if (
      !preloadPropsMap.has(key) &&
      ((href = assign({ rel: "modulepreload", href: href }, options)),
      preloadPropsMap.set(key, href),
      null === ownerDocument.querySelector(preloadSelector))
    ) {
      switch (as) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
            return;
      }
      as = ownerDocument.createElement("link");
      setInitialProperties(as, "link", href);
      markNodeAsHoistable(as);
      ownerDocument.head.appendChild(as);
    }
  }
}
function preinitStyle(href, precedence, options) {
  previousDispatcher.S(href, precedence, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && href) {
    var styles = getResourcesFromRoot(ownerDocument).hoistableStyles,
      key = getStyleKey(href);
    precedence = precedence || "default";
    var resource = styles.get(key);
    if (!resource) {
      var state = { loading: 0, preload: null };
      if (
        (resource = ownerDocument.querySelector(
          getStylesheetSelectorFromKey(key)
        ))
      )
        state.loading = 5;
      else {
        href = assign(
          { rel: "stylesheet", href: href, "data-precedence": precedence },
          options
        );
        (options = preloadPropsMap.get(key)) &&
          adoptPreloadPropsForStylesheet(href, options);
        var link = (resource = ownerDocument.createElement("link"));
        markNodeAsHoistable(link);
        setInitialProperties(link, "link", href);
        link._p = new Promise(function (resolve, reject) {
          link.onload = resolve;
          link.onerror = reject;
        });
        link.addEventListener("load", function () {
          state.loading |= 1;
        });
        link.addEventListener("error", function () {
          state.loading |= 2;
        });
        state.loading |= 4;
        insertStylesheet(resource, precedence, ownerDocument);
      }
      resource = {
        type: "stylesheet",
        instance: resource,
        count: 1,
        state: state
      };
      styles.set(key, resource);
    }
  }
}
function preinitScript(src, options) {
  previousDispatcher.X(src, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && src) {
    var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts,
      key = getScriptKey(src),
      resource = scripts.get(key);
    resource ||
      ((resource = ownerDocument.querySelector(getScriptSelectorFromKey(key))),
      resource ||
        ((src = assign({ src: src, async: !0 }, options)),
        (options = preloadPropsMap.get(key)) &&
          adoptPreloadPropsForScript(src, options),
        (resource = ownerDocument.createElement("script")),
        markNodeAsHoistable(resource),
        setInitialProperties(resource, "link", src),
        ownerDocument.head.appendChild(resource)),
      (resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }),
      scripts.set(key, resource));
  }
}
function preinitModuleScript(src, options) {
  previousDispatcher.M(src, options);
  var ownerDocument = globalDocument;
  if (ownerDocument && src) {
    var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts,
      key = getScriptKey(src),
      resource = scripts.get(key);
    resource ||
      ((resource = ownerDocument.querySelector(getScriptSelectorFromKey(key))),
      resource ||
        ((src = assign({ src: src, async: !0, type: "module" }, options)),
        (options = preloadPropsMap.get(key)) &&
          adoptPreloadPropsForScript(src, options),
        (resource = ownerDocument.createElement("script")),
        markNodeAsHoistable(resource),
        setInitialProperties(resource, "link", src),
        ownerDocument.head.appendChild(resource)),
      (resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }),
      scripts.set(key, resource));
  }
}
function getResource(type, currentProps, pendingProps, currentResource) {
  var JSCompiler_inline_result = (JSCompiler_inline_result =
    rootInstanceStackCursor.current)
    ? getHoistableRoot(JSCompiler_inline_result)
    : null;
  if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
  switch (type) {
    case "meta":
    case "title":
      return null;
    case "style":
      return "string" === typeof pendingProps.precedence &&
        "string" === typeof pendingProps.href
        ? ((currentProps = getStyleKey(pendingProps.href)),
          (pendingProps = getResourcesFromRoot(
            JSCompiler_inline_result
          ).hoistableStyles),
          (currentResource = pendingProps.get(currentProps)),
          currentResource ||
            ((currentResource = {
              type: "style",
              instance: null,
              count: 0,
              state: null
            }),
            pendingProps.set(currentProps, currentResource)),
          currentResource)
        : { type: "void", instance: null, count: 0, state: null };
    case "link":
      if (
        "stylesheet" === pendingProps.rel &&
        "string" === typeof pendingProps.href &&
        "string" === typeof pendingProps.precedence
      ) {
        type = getStyleKey(pendingProps.href);
        var styles$243 = getResourcesFromRoot(
            JSCompiler_inline_result
          ).hoistableStyles,
          resource$244 = styles$243.get(type);
        resource$244 ||
          ((JSCompiler_inline_result =
            JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result),
          (resource$244 = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }),
          styles$243.set(type, resource$244),
          (styles$243 = JSCompiler_inline_result.querySelector(
            getStylesheetSelectorFromKey(type)
          )) &&
            !styles$243._p &&
            ((resource$244.instance = styles$243),
            (resource$244.state.loading = 5)),
          preloadPropsMap.has(type) ||
            ((pendingProps = {
              rel: "preload",
              as: "style",
              href: pendingProps.href,
              crossOrigin: pendingProps.crossOrigin,
              integrity: pendingProps.integrity,
              media: pendingProps.media,
              hrefLang: pendingProps.hrefLang,
              referrerPolicy: pendingProps.referrerPolicy
            }),
            preloadPropsMap.set(type, pendingProps),
            styles$243 ||
              preloadStylesheet(
                JSCompiler_inline_result,
                type,
                pendingProps,
                resource$244.state
              )));
        if (currentProps && null === currentResource)
          throw Error(formatProdErrorMessage(528, ""));
        return resource$244;
      }
      if (currentProps && null !== currentResource)
        throw Error(formatProdErrorMessage(529, ""));
      return null;
    case "script":
      return (
        (currentProps = pendingProps.async),
        (pendingProps = pendingProps.src),
        "string" === typeof pendingProps &&
        currentProps &&
        "function" !== typeof currentProps &&
        "symbol" !== typeof currentProps
          ? ((currentProps = getScriptKey(pendingProps)),
            (pendingProps = getResourcesFromRoot(
              JSCompiler_inline_result
            ).hoistableScripts),
            (currentResource = pendingProps.get(currentProps)),
            currentResource ||
              ((currentResource = {
                type: "script",
                instance: null,
                count: 0,
                state: null
              }),
              pendingProps.set(currentProps, currentResource)),
            currentResource)
          : { type: "void", instance: null, count: 0, state: null }
      );
    default:
      throw Error(formatProdErrorMessage(444, type));
  }
}
function getStyleKey(href) {
  return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
}
function getStylesheetSelectorFromKey(key) {
  return 'link[rel="stylesheet"][' + key + "]";
}
function stylesheetPropsFromRawProps(rawProps) {
  return assign({}, rawProps, {
    "data-precedence": rawProps.precedence,
    precedence: null
  });
}
function preloadStylesheet(ownerDocument, key, preloadProps, state) {
  ownerDocument.querySelector('link[rel="preload"][as="style"][' + key + "]")
    ? (state.loading = 1)
    : ((key = ownerDocument.createElement("link")),
      (state.preload = key),
      key.addEventListener("load", function () {
        return (state.loading |= 1);
      }),
      key.addEventListener("error", function () {
        return (state.loading |= 2);
      }),
      setInitialProperties(key, "link", preloadProps),
      markNodeAsHoistable(key),
      ownerDocument.head.appendChild(key));
}
function getScriptKey(src) {
  return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
}
function getScriptSelectorFromKey(key) {
  return "script[async]" + key;
}
function acquireResource(hoistableRoot, resource, props) {
  resource.count++;
  if (null === resource.instance)
    switch (resource.type) {
      case "style":
        var instance = hoistableRoot.querySelector(
          'style[data-href~="' +
            escapeSelectorAttributeValueInsideDoubleQuotes(props.href) +
            '"]'
        );
        if (instance)
          return (
            (resource.instance = instance),
            markNodeAsHoistable(instance),
            instance
          );
        var styleProps = assign({}, props, {
          "data-href": props.href,
          "data-precedence": props.precedence,
          href: null,
          precedence: null
        });
        instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement(
          "style"
        );
        markNodeAsHoistable(instance);
        setInitialProperties(instance, "style", styleProps);
        insertStylesheet(instance, props.precedence, hoistableRoot);
        return (resource.instance = instance);
      case "stylesheet":
        styleProps = getStyleKey(props.href);
        var instance$249 = hoistableRoot.querySelector(
          getStylesheetSelectorFromKey(styleProps)
        );
        if (instance$249)
          return (
            (resource.state.loading |= 4),
            (resource.instance = instance$249),
            markNodeAsHoistable(instance$249),
            instance$249
          );
        instance = stylesheetPropsFromRawProps(props);
        (styleProps = preloadPropsMap.get(styleProps)) &&
          adoptPreloadPropsForStylesheet(instance, styleProps);
        instance$249 = (
          hoistableRoot.ownerDocument || hoistableRoot
        ).createElement("link");
        markNodeAsHoistable(instance$249);
        var linkInstance = instance$249;
        linkInstance._p = new Promise(function (resolve, reject) {
          linkInstance.onload = resolve;
          linkInstance.onerror = reject;
        });
        setInitialProperties(instance$249, "link", instance);
        resource.state.loading |= 4;
        insertStylesheet(instance$249, props.precedence, hoistableRoot);
        return (resource.instance = instance$249);
      case "script":
        instance$249 = getScriptKey(props.src);
        if (
          (styleProps = hoistableRoot.querySelector(
            getScriptSelectorFromKey(instance$249)
          ))
        )
          return (
            (resource.instance = styleProps),
            markNodeAsHoistable(styleProps),
            styleProps
          );
        instance = props;
        if ((styleProps = preloadPropsMap.get(instance$249)))
          (instance = assign({}, props)),
            adoptPreloadPropsForScript(instance, styleProps);
        hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
        styleProps = hoistableRoot.createElement("script");
        markNodeAsHoistable(styleProps);
        setInitialProperties(styleProps, "link", instance);
        hoistableRoot.head.appendChild(styleProps);
        return (resource.instance = styleProps);
      case "void":
        return null;
      default:
        throw Error(formatProdErrorMessage(443, resource.type));
    }
  else
    "stylesheet" === resource.type &&
      0 === (resource.state.loading & 4) &&
      ((instance = resource.instance),
      (resource.state.loading |= 4),
      insertStylesheet(instance, props.precedence, hoistableRoot));
  return resource.instance;
}
function insertStylesheet(instance, precedence, root) {
  for (
    var nodes = root.querySelectorAll(
        'link[rel="stylesheet"][data-precedence],style[data-precedence]'
      ),
      last = nodes.length ? nodes[nodes.length - 1] : null,
      prior = last,
      i = 0;
    i < nodes.length;
    i++
  ) {
    var node = nodes[i];
    if (node.dataset.precedence === precedence) prior = node;
    else if (prior !== last) break;
  }
  prior
    ? prior.parentNode.insertBefore(instance, prior.nextSibling)
    : ((precedence = 9 === root.nodeType ? root.head : root),
      precedence.insertBefore(instance, precedence.firstChild));
}
function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
  null == stylesheetProps.crossOrigin &&
    (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
  null == stylesheetProps.referrerPolicy &&
    (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
  null == stylesheetProps.title && (stylesheetProps.title = preloadProps.title);
}
function adoptPreloadPropsForScript(scriptProps, preloadProps) {
  null == scriptProps.crossOrigin &&
    (scriptProps.crossOrigin = preloadProps.crossOrigin);
  null == scriptProps.referrerPolicy &&
    (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
  null == scriptProps.integrity &&
    (scriptProps.integrity = preloadProps.integrity);
}
var tagCaches = null;
function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
  if (null === tagCaches) {
    var cache = new Map();
    var caches = (tagCaches = new Map());
    caches.set(ownerDocument, cache);
  } else
    (caches = tagCaches),
      (cache = caches.get(ownerDocument)),
      cache || ((cache = new Map()), caches.set(ownerDocument, cache));
  if (cache.has(type)) return cache;
  cache.set(type, null);
  ownerDocument = ownerDocument.getElementsByTagName(type);
  for (caches = 0; caches < ownerDocument.length; caches++) {
    var node = ownerDocument[caches];
    if (
      !(
        node[internalHoistableMarker] ||
        node[internalInstanceKey] ||
        ("link" === type && "stylesheet" === node.getAttribute("rel"))
      ) &&
      "http://www.w3.org/2000/svg" !== node.namespaceURI
    ) {
      var nodeKey = node.getAttribute(keyAttribute) || "";
      nodeKey = type + nodeKey;
      var existing = cache.get(nodeKey);
      existing ? existing.push(node) : cache.set(nodeKey, [node]);
    }
  }
  return cache;
}
function mountHoistable(hoistableRoot, type, instance) {
  hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
  hoistableRoot.head.insertBefore(
    instance,
    "title" === type ? hoistableRoot.querySelector("head > title") : null
  );
}
function isHostHoistableType(type, props, hostContext) {
  if (1 === hostContext || null != props.itemProp) return !1;
  switch (type) {
    case "meta":
    case "title":
      return !0;
    case "style":
      if (
        "string" !== typeof props.precedence ||
        "string" !== typeof props.href ||
        "" === props.href
      )
        break;
      return !0;
    case "link":
      if (
        "string" !== typeof props.rel ||
        "string" !== typeof props.href ||
        "" === props.href ||
        props.onLoad ||
        props.onError
      )
        break;
      switch (props.rel) {
        case "stylesheet":
          return (
            (type = props.disabled),
            "string" === typeof props.precedence && null == type
          );
        default:
          return !0;
      }
    case "script":
      if (
        props.async &&
        "function" !== typeof props.async &&
        "symbol" !== typeof props.async &&
        !props.onLoad &&
        !props.onError &&
        props.src &&
        "string" === typeof props.src
      )
        return !0;
  }
  return !1;
}
function preloadResource(resource) {
  return "stylesheet" === resource.type && 0 === (resource.state.loading & 3)
    ? !1
    : !0;
}
function suspendResource(state, hoistableRoot, resource, props) {
  if (
    "stylesheet" === resource.type &&
    ("string" !== typeof props.media ||
      !1 !== matchMedia(props.media).matches) &&
    0 === (resource.state.loading & 4)
  ) {
    if (null === resource.instance) {
      var key = getStyleKey(props.href),
        instance = hoistableRoot.querySelector(
          getStylesheetSelectorFromKey(key)
        );
      if (instance) {
        hoistableRoot = instance._p;
        null !== hoistableRoot &&
          "object" === typeof hoistableRoot &&
          "function" === typeof hoistableRoot.then &&
          (state.count++,
          (state = onUnsuspend.bind(state)),
          hoistableRoot.then(state, state));
        resource.state.loading |= 4;
        resource.instance = instance;
        markNodeAsHoistable(instance);
        return;
      }
      instance = hoistableRoot.ownerDocument || hoistableRoot;
      props = stylesheetPropsFromRawProps(props);
      (key = preloadPropsMap.get(key)) &&
        adoptPreloadPropsForStylesheet(props, key);
      instance = instance.createElement("link");
      markNodeAsHoistable(instance);
      var linkInstance = instance;
      linkInstance._p = new Promise(function (resolve, reject) {
        linkInstance.onload = resolve;
        linkInstance.onerror = reject;
      });
      setInitialProperties(instance, "link", props);
      resource.instance = instance;
    }
    null === state.stylesheets && (state.stylesheets = new Map());
    state.stylesheets.set(resource, hoistableRoot);
    (hoistableRoot = resource.state.preload) &&
      0 === (resource.state.loading & 3) &&
      (state.count++,
      (resource = onUnsuspend.bind(state)),
      hoistableRoot.addEventListener("load", resource),
      hoistableRoot.addEventListener("error", resource));
  }
}
var estimatedBytesWithinLimit = 0;
function waitForCommitToBeReady(state, timeoutOffset) {
  state.stylesheets &&
    0 === state.count &&
    insertSuspendedStylesheets(state, state.stylesheets);
  return 0 < state.count || 0 < state.imgCount
    ? function (commit) {
        var stylesheetTimer = setTimeout(function () {
          state.stylesheets &&
            insertSuspendedStylesheets(state, state.stylesheets);
          if (state.unsuspend) {
            var unsuspend = state.unsuspend;
            state.unsuspend = null;
            unsuspend();
          }
        }, 6e4 + timeoutOffset);
        0 < state.imgBytes &&
          0 === estimatedBytesWithinLimit &&
          (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
        var imgTimer = setTimeout(
          function () {
            state.waitingForImages = !1;
            if (
              0 === state.count &&
              (state.stylesheets &&
                insertSuspendedStylesheets(state, state.stylesheets),
              state.unsuspend)
            ) {
              var unsuspend = state.unsuspend;
              state.unsuspend = null;
              unsuspend();
            }
          },
          (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) +
            timeoutOffset
        );
        state.unsuspend = commit;
        return function () {
          state.unsuspend = null;
          clearTimeout(stylesheetTimer);
          clearTimeout(imgTimer);
        };
      }
    : null;
}
function onUnsuspend() {
  this.count--;
  if (0 === this.count && (0 === this.imgCount || !this.waitingForImages))
    if (this.stylesheets) insertSuspendedStylesheets(this, this.stylesheets);
    else if (this.unsuspend) {
      var unsuspend = this.unsuspend;
      this.unsuspend = null;
      unsuspend();
    }
}
var precedencesByRoot = null;
function insertSuspendedStylesheets(state, resources) {
  state.stylesheets = null;
  null !== state.unsuspend &&
    (state.count++,
    (precedencesByRoot = new Map()),
    resources.forEach(insertStylesheetIntoRoot, state),
    (precedencesByRoot = null),
    onUnsuspend.call(state));
}
function insertStylesheetIntoRoot(root, resource) {
  if (!(resource.state.loading & 4)) {
    var precedences = precedencesByRoot.get(root);
    if (precedences) var last = precedences.get(null);
    else {
      precedences = new Map();
      precedencesByRoot.set(root, precedences);
      for (
        var nodes = root.querySelectorAll(
            "link[data-precedence],style[data-precedence]"
          ),
          i = 0;
        i < nodes.length;
        i++
      ) {
        var node = nodes[i];
        if (
          "LINK" === node.nodeName ||
          "not all" !== node.getAttribute("media")
        )
          precedences.set(node.dataset.precedence, node), (last = node);
      }
      last && precedences.set(null, last);
    }
    nodes = resource.instance;
    node = nodes.getAttribute("data-precedence");
    i = precedences.get(node) || last;
    i === last && precedences.set(null, nodes);
    precedences.set(node, nodes);
    this.count++;
    last = onUnsuspend.bind(this);
    nodes.addEventListener("load", last);
    nodes.addEventListener("error", last);
    i
      ? i.parentNode.insertBefore(nodes, i.nextSibling)
      : ((root = 9 === root.nodeType ? root.head : root),
        root.insertBefore(nodes, root.firstChild));
    resource.state.loading |= 4;
  }
}
var HostTransitionContext = {
  $$typeof: REACT_CONTEXT_TYPE,
  Provider: null,
  Consumer: null,
  _currentValue: sharedNotPendingObject,
  _currentValue2: sharedNotPendingObject,
  _threadCount: 0
};
function FiberRootNode(
  containerInfo,
  tag,
  hydrate,
  identifierPrefix,
  onUncaughtError,
  onCaughtError,
  onRecoverableError,
  onDefaultTransitionIndicator,
  formState
) {
  this.tag = 1;
  this.containerInfo = containerInfo;
  this.pingCache = this.current = this.pendingChildren = null;
  this.timeoutHandle = -1;
  this.callbackNode =
    this.next =
    this.pendingContext =
    this.context =
    this.cancelPendingCommit =
      null;
  this.callbackPriority = 0;
  this.expirationTimes = createLaneMap(-1);
  this.entangledLanes =
    this.shellSuspendCounter =
    this.errorRecoveryDisabledLanes =
    this.expiredLanes =
    this.warmLanes =
    this.pingedLanes =
    this.suspendedLanes =
    this.pendingLanes =
      0;
  this.entanglements = createLaneMap(0);
  this.hiddenUpdates = createLaneMap(null);
  this.identifierPrefix = identifierPrefix;
  this.onUncaughtError = onUncaughtError;
  this.onCaughtError = onCaughtError;
  this.onRecoverableError = onRecoverableError;
  this.pooledCache = null;
  this.pooledCacheLanes = 0;
  this.formState = formState;
  this.incompleteTransitions = new Map();
}
function createFiberRoot(
  containerInfo,
  tag,
  hydrate,
  initialChildren,
  hydrationCallbacks,
  isStrictMode,
  identifierPrefix,
  formState,
  onUncaughtError,
  onCaughtError,
  onRecoverableError,
  onDefaultTransitionIndicator
) {
  containerInfo = new FiberRootNode(
    containerInfo,
    tag,
    hydrate,
    identifierPrefix,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    onDefaultTransitionIndicator,
    formState
  );
  tag = 1;
  !0 === isStrictMode && (tag |= 24);
  isStrictMode = createFiberImplClass(3, null, null, tag);
  containerInfo.current = isStrictMode;
  isStrictMode.stateNode = containerInfo;
  tag = createCache();
  tag.refCount++;
  containerInfo.pooledCache = tag;
  tag.refCount++;
  isStrictMode.memoizedState = {
    element: initialChildren,
    isDehydrated: hydrate,
    cache: tag
  };
  initializeUpdateQueue(isStrictMode);
  return containerInfo;
}
function getContextForSubtree(parentComponent) {
  if (!parentComponent) return emptyContextObject;
  parentComponent = emptyContextObject;
  return parentComponent;
}
function updateContainerImpl(
  rootFiber,
  lane,
  element,
  container,
  parentComponent,
  callback
) {
  parentComponent = getContextForSubtree(parentComponent);
  null === container.context
    ? (container.context = parentComponent)
    : (container.pendingContext = parentComponent);
  container = createUpdate(lane);
  container.payload = { element: element };
  callback = void 0 === callback ? null : callback;
  null !== callback && (container.callback = callback);
  element = enqueueUpdate(rootFiber, container, lane);
  null !== element &&
    (scheduleUpdateOnFiber(element, rootFiber, lane),
    entangleTransitions(element, rootFiber, lane));
}
function markRetryLaneImpl(fiber, retryLane) {
  fiber = fiber.memoizedState;
  if (null !== fiber && null !== fiber.dehydrated) {
    var a = fiber.retryLane;
    fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
  }
}
function markRetryLaneIfNotHydrated(fiber, retryLane) {
  markRetryLaneImpl(fiber, retryLane);
  (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
}
function attemptContinuousHydration(fiber) {
  if (13 === fiber.tag || 31 === fiber.tag) {
    var root = enqueueConcurrentRenderForLane(fiber, 67108864);
    null !== root && scheduleUpdateOnFiber(root, fiber, 67108864);
    markRetryLaneIfNotHydrated(fiber, 67108864);
  }
}
function attemptHydrationAtCurrentPriority(fiber) {
  if (13 === fiber.tag || 31 === fiber.tag) {
    var lane = requestUpdateLane();
    lane = getBumpedLaneForHydrationByLane(lane);
    var root = enqueueConcurrentRenderForLane(fiber, lane);
    null !== root && scheduleUpdateOnFiber(root, fiber, lane);
    markRetryLaneIfNotHydrated(fiber, lane);
  }
}
var _enabled = !0;
function dispatchDiscreteEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent
) {
  var prevTransition = ReactSharedInternals.T;
  ReactSharedInternals.T = null;
  var previousPriority = ReactDOMSharedInternals.p;
  try {
    (ReactDOMSharedInternals.p = 2),
      dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    (ReactDOMSharedInternals.p = previousPriority),
      (ReactSharedInternals.T = prevTransition);
  }
}
function dispatchContinuousEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent
) {
  var prevTransition = ReactSharedInternals.T;
  ReactSharedInternals.T = null;
  var previousPriority = ReactDOMSharedInternals.p;
  try {
    (ReactDOMSharedInternals.p = 8),
      dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    (ReactDOMSharedInternals.p = previousPriority),
      (ReactSharedInternals.T = prevTransition);
  }
}
function dispatchEvent(
  domEventName,
  eventSystemFlags,
  targetContainer,
  nativeEvent
) {
  if (_enabled) {
    var blockedOn = findInstanceBlockingEvent(nativeEvent);
    if (null === blockedOn)
      dispatchEventForPluginEventSystem(
        domEventName,
        eventSystemFlags,
        nativeEvent,
        return_targetInst,
        targetContainer
      ),
        clearIfContinuousEvent(domEventName, nativeEvent);
    else if (
      queueIfContinuousEvent(
        blockedOn,
        domEventName,
        eventSystemFlags,
        targetContainer,
        nativeEvent
      )
    )
      nativeEvent.stopPropagation();
    else if (
      (clearIfContinuousEvent(domEventName, nativeEvent),
      eventSystemFlags & 4 &&
        -1 < discreteReplayableEvents.indexOf(domEventName))
    ) {
      for (; null !== blockedOn; ) {
        var fiber = getInstanceFromNode(blockedOn);
        if (null !== fiber)
          switch (fiber.tag) {
            case 3:
              fiber = fiber.stateNode;
              if (fiber.current.memoizedState.isDehydrated) {
                var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                if (0 !== lanes) {
                  var root = fiber;
                  root.pendingLanes |= 2;
                  for (root.entangledLanes |= 2; lanes; ) {
                    var lane = 1 << (31 - clz32(lanes));
                    root.entanglements[1] |= lane;
                    lanes &= ~lane;
                  }
                  ensureRootIsScheduled(fiber);
                  0 === (executionContext & 6) &&
                    ((workInProgressRootRenderTargetTime = now() + 500),
                    flushSyncWorkAcrossRoots_impl(0, !1));
                }
              }
              break;
            case 31:
            case 13:
              (root = enqueueConcurrentRenderForLane(fiber, 2)),
                null !== root && scheduleUpdateOnFiber(root, fiber, 2),
                flushSyncWork$1(),
                markRetryLaneIfNotHydrated(fiber, 2);
          }
        fiber = findInstanceBlockingEvent(nativeEvent);
        null === fiber &&
          dispatchEventForPluginEventSystem(
            domEventName,
            eventSystemFlags,
            nativeEvent,
            return_targetInst,
            targetContainer
          );
        if (fiber === blockedOn) break;
        blockedOn = fiber;
      }
      null !== blockedOn && nativeEvent.stopPropagation();
    } else
      dispatchEventForPluginEventSystem(
        domEventName,
        eventSystemFlags,
        nativeEvent,
        null,
        targetContainer
      );
  }
}
function findInstanceBlockingEvent(nativeEvent) {
  nativeEvent = getEventTarget(nativeEvent);
  return findInstanceBlockingTarget(nativeEvent);
}
var return_targetInst = null;
function findInstanceBlockingTarget(targetNode) {
  return_targetInst = null;
  targetNode = getClosestInstanceFromNode(targetNode);
  if (null !== targetNode) {
    var nearestMounted = getNearestMountedFiber(targetNode);
    if (null === nearestMounted) targetNode = null;
    else {
      var tag = nearestMounted.tag;
      if (13 === tag) {
        targetNode = getSuspenseInstanceFromFiber(nearestMounted);
        if (null !== targetNode) return targetNode;
        targetNode = null;
      } else if (31 === tag) {
        targetNode = getActivityInstanceFromFiber(nearestMounted);
        if (null !== targetNode) return targetNode;
        targetNode = null;
      } else if (3 === tag) {
        if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
          return 3 === nearestMounted.tag
            ? nearestMounted.stateNode.containerInfo
            : null;
        targetNode = null;
      } else nearestMounted !== targetNode && (targetNode = null);
    }
  }
  return_targetInst = targetNode;
  return null;
}
function getEventPriority(domEventName) {
  switch (domEventName) {
    case "beforetoggle":
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "toggle":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 2;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 8;
    case "message":
      switch (getCurrentPriorityLevel()) {
        case ImmediatePriority:
          return 2;
        case UserBlockingPriority:
          return 8;
        case NormalPriority$1:
        case LowPriority:
          return 32;
        case IdlePriority:
          return 268435456;
        default:
          return 32;
      }
    default:
      return 32;
  }
}
var hasScheduledReplayAttempt = !1,
  queuedFocus = null,
  queuedDrag = null,
  queuedMouse = null,
  queuedPointers = new Map(),
  queuedPointerCaptures = new Map(),
  queuedExplicitHydrationTargets = [],
  discreteReplayableEvents =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
      " "
    );
function clearIfContinuousEvent(domEventName, nativeEvent) {
  switch (domEventName) {
    case "focusin":
    case "focusout":
      queuedFocus = null;
      break;
    case "dragenter":
    case "dragleave":
      queuedDrag = null;
      break;
    case "mouseover":
    case "mouseout":
      queuedMouse = null;
      break;
    case "pointerover":
    case "pointerout":
      queuedPointers.delete(nativeEvent.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      queuedPointerCaptures.delete(nativeEvent.pointerId);
  }
}
function accumulateOrCreateContinuousQueuedReplayableEvent(
  existingQueuedEvent,
  blockedOn,
  domEventName,
  eventSystemFlags,
  targetContainer,
  nativeEvent
) {
  if (
    null === existingQueuedEvent ||
    existingQueuedEvent.nativeEvent !== nativeEvent
  )
    return (
      (existingQueuedEvent = {
        blockedOn: blockedOn,
        domEventName: domEventName,
        eventSystemFlags: eventSystemFlags,
        nativeEvent: nativeEvent,
        targetContainers: [targetContainer]
      }),
      null !== blockedOn &&
        ((blockedOn = getInstanceFromNode(blockedOn)),
        null !== blockedOn && attemptContinuousHydration(blockedOn)),
      existingQueuedEvent
    );
  existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
  blockedOn = existingQueuedEvent.targetContainers;
  null !== targetContainer &&
    -1 === blockedOn.indexOf(targetContainer) &&
    blockedOn.push(targetContainer);
  return existingQueuedEvent;
}
function queueIfContinuousEvent(
  blockedOn,
  domEventName,
  eventSystemFlags,
  targetContainer,
  nativeEvent
) {
  switch (domEventName) {
    case "focusin":
      return (
        (queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedFocus,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        )),
        !0
      );
    case "dragenter":
      return (
        (queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedDrag,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        )),
        !0
      );
    case "mouseover":
      return (
        (queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedMouse,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        )),
        !0
      );
    case "pointerover":
      var pointerId = nativeEvent.pointerId;
      queuedPointers.set(
        pointerId,
        accumulateOrCreateContinuousQueuedReplayableEvent(
          queuedPointers.get(pointerId) || null,
          blockedOn,
          domEventName,
          eventSystemFlags,
          targetContainer,
          nativeEvent
        )
      );
      return !0;
    case "gotpointercapture":
      return (
        (pointerId = nativeEvent.pointerId),
        queuedPointerCaptures.set(
          pointerId,
          accumulateOrCreateContinuousQueuedReplayableEvent(
            queuedPointerCaptures.get(pointerId) || null,
            blockedOn,
            domEventName,
            eventSystemFlags,
            targetContainer,
            nativeEvent
          )
        ),
        !0
      );
  }
  return !1;
}
function attemptExplicitHydrationTarget(queuedTarget) {
  var targetInst = getClosestInstanceFromNode(queuedTarget.target);
  if (null !== targetInst) {
    var nearestMounted = getNearestMountedFiber(targetInst);
    if (null !== nearestMounted)
      if (((targetInst = nearestMounted.tag), 13 === targetInst)) {
        if (
          ((targetInst = getSuspenseInstanceFromFiber(nearestMounted)),
          null !== targetInst)
        ) {
          queuedTarget.blockedOn = targetInst;
          runWithPriority(queuedTarget.priority, function () {
            attemptHydrationAtCurrentPriority(nearestMounted);
          });
          return;
        }
      } else if (31 === targetInst) {
        if (
          ((targetInst = getActivityInstanceFromFiber(nearestMounted)),
          null !== targetInst)
        ) {
          queuedTarget.blockedOn = targetInst;
          runWithPriority(queuedTarget.priority, function () {
            attemptHydrationAtCurrentPriority(nearestMounted);
          });
          return;
        }
      } else if (
        3 === targetInst &&
        nearestMounted.stateNode.current.memoizedState.isDehydrated
      ) {
        queuedTarget.blockedOn =
          3 === nearestMounted.tag
            ? nearestMounted.stateNode.containerInfo
            : null;
        return;
      }
  }
  queuedTarget.blockedOn = null;
}
function attemptReplayContinuousQueuedEvent(queuedEvent) {
  if (null !== queuedEvent.blockedOn) return !1;
  for (
    var targetContainers = queuedEvent.targetContainers;
    0 < targetContainers.length;

  ) {
    var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
    if (null === nextBlockedOn) {
      nextBlockedOn = queuedEvent.nativeEvent;
      var nativeEventClone = new nextBlockedOn.constructor(
        nextBlockedOn.type,
        nextBlockedOn
      );
      currentReplayingEvent = nativeEventClone;
      nextBlockedOn.target.dispatchEvent(nativeEventClone);
      currentReplayingEvent = null;
    } else
      return (
        (targetContainers = getInstanceFromNode(nextBlockedOn)),
        null !== targetContainers &&
          attemptContinuousHydration(targetContainers),
        (queuedEvent.blockedOn = nextBlockedOn),
        !1
      );
    targetContainers.shift();
  }
  return !0;
}
function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
  attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
}
function replayUnblockedEvents() {
  hasScheduledReplayAttempt = !1;
  null !== queuedFocus &&
    attemptReplayContinuousQueuedEvent(queuedFocus) &&
    (queuedFocus = null);
  null !== queuedDrag &&
    attemptReplayContinuousQueuedEvent(queuedDrag) &&
    (queuedDrag = null);
  null !== queuedMouse &&
    attemptReplayContinuousQueuedEvent(queuedMouse) &&
    (queuedMouse = null);
  queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
  queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
}
function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
  queuedEvent.blockedOn === unblocked &&
    ((queuedEvent.blockedOn = null),
    hasScheduledReplayAttempt ||
      ((hasScheduledReplayAttempt = !0),
      Scheduler.unstable_scheduleCallback(
        Scheduler.unstable_NormalPriority,
        replayUnblockedEvents
      )));
}
var lastScheduledReplayQueue = null;
function scheduleReplayQueueIfNeeded(formReplayingQueue) {
  lastScheduledReplayQueue !== formReplayingQueue &&
    ((lastScheduledReplayQueue = formReplayingQueue),
    Scheduler.unstable_scheduleCallback(
      Scheduler.unstable_NormalPriority,
      function () {
        lastScheduledReplayQueue === formReplayingQueue &&
          (lastScheduledReplayQueue = null);
        for (var i = 0; i < formReplayingQueue.length; i += 3) {
          var form = formReplayingQueue[i],
            submitterOrAction = formReplayingQueue[i + 1],
            formData = formReplayingQueue[i + 2];
          if ("function" !== typeof submitterOrAction)
            if (null === findInstanceBlockingTarget(submitterOrAction || form))
              continue;
            else break;
          var formInst = getInstanceFromNode(form);
          null !== formInst &&
            (formReplayingQueue.splice(i, 3),
            (i -= 3),
            startHostTransition(
              formInst,
              {
                pending: !0,
                data: formData,
                method: form.method,
                action: submitterOrAction
              },
              submitterOrAction,
              formData
            ));
        }
      }
    ));
}
function retryIfBlockedOn(unblocked) {
  function unblock(queuedEvent) {
    return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
  }
  null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
  null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
  null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
  queuedPointers.forEach(unblock);
  queuedPointerCaptures.forEach(unblock);
  for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
    var queuedTarget = queuedExplicitHydrationTargets[i];
    queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
  }
  for (
    ;
    0 < queuedExplicitHydrationTargets.length &&
    ((i = queuedExplicitHydrationTargets[0]), null === i.blockedOn);

  )
    attemptExplicitHydrationTarget(i),
      null === i.blockedOn && queuedExplicitHydrationTargets.shift();
  i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
  if (null != i)
    for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
      var form = i[queuedTarget],
        submitterOrAction = i[queuedTarget + 1],
        formProps = form[internalPropsKey] || null;
      if ("function" === typeof submitterOrAction)
        formProps || scheduleReplayQueueIfNeeded(i);
      else if (formProps) {
        var action = null;
        if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
          if (
            ((form = submitterOrAction),
            (formProps = submitterOrAction[internalPropsKey] || null))
          )
            action = formProps.formAction;
          else {
            if (null !== findInstanceBlockingTarget(form)) continue;
          }
        else action = formProps.action;
        "function" === typeof action
          ? (i[queuedTarget + 1] = action)
          : (i.splice(queuedTarget, 3), (queuedTarget -= 3));
        scheduleReplayQueueIfNeeded(i);
      }
    }
}
function defaultOnDefaultTransitionIndicator() {
  function handleNavigate(event) {
    event.canIntercept &&
      "react-transition" === event.info &&
      event.intercept({
        handler: function () {
          return new Promise(function (resolve) {
            return (pendingResolve = resolve);
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
  }
  function handleNavigateComplete() {
    null !== pendingResolve && (pendingResolve(), (pendingResolve = null));
    isCancelled || setTimeout(startFakeNavigation, 20);
  }
  function startFakeNavigation() {
    if (!isCancelled && !navigation.transition) {
      var currentEntry = navigation.currentEntry;
      currentEntry &&
        null != currentEntry.url &&
        navigation.navigate(currentEntry.url, {
          state: currentEntry.getState(),
          info: "react-transition",
          history: "replace"
        });
    }
  }
  if ("object" === typeof navigation) {
    var isCancelled = !1,
      pendingResolve = null;
    navigation.addEventListener("navigate", handleNavigate);
    navigation.addEventListener("navigatesuccess", handleNavigateComplete);
    navigation.addEventListener("navigateerror", handleNavigateComplete);
    setTimeout(startFakeNavigation, 100);
    return function () {
      isCancelled = !0;
      navigation.removeEventListener("navigate", handleNavigate);
      navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
      navigation.removeEventListener("navigateerror", handleNavigateComplete);
      null !== pendingResolve && (pendingResolve(), (pendingResolve = null));
    };
  }
}
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}
ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render =
  function (children) {
    var root = this._internalRoot;
    if (null === root) throw Error(formatProdErrorMessage(409));
    var current = root.current,
      lane = requestUpdateLane();
    updateContainerImpl(current, lane, children, root, null, null);
  };
ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount =
  function () {
    var root = this._internalRoot;
    if (null !== root) {
      this._internalRoot = null;
      var container = root.containerInfo;
      updateContainerImpl(root.current, 2, null, root, null, null);
      flushSyncWork$1();
      container[internalContainerInstanceKey] = null;
    }
  };
function ReactDOMHydrationRoot(internalRoot) {
  this._internalRoot = internalRoot;
}
ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function (target) {
  if (target) {
    var updatePriority = resolveUpdatePriority();
    target = { blockedOn: null, target: target, priority: updatePriority };
    for (
      var i = 0;
      i < queuedExplicitHydrationTargets.length &&
      0 !== updatePriority &&
      updatePriority < queuedExplicitHydrationTargets[i].priority;
      i++
    );
    queuedExplicitHydrationTargets.splice(i, 0, target);
    0 === i && attemptExplicitHydrationTarget(target);
  }
};
var isomorphicReactPackageVersion$jscomp$inline_1840 = React.version;
if (
  "19.2.1" !==
  isomorphicReactPackageVersion$jscomp$inline_1840
)
  throw Error(
    formatProdErrorMessage(
      527,
      isomorphicReactPackageVersion$jscomp$inline_1840,
      "19.2.1"
    )
  );
ReactDOMSharedInternals.findDOMNode = function (componentOrElement) {
  var fiber = componentOrElement._reactInternals;
  if (void 0 === fiber) {
    if ("function" === typeof componentOrElement.render)
      throw Error(formatProdErrorMessage(188));
    componentOrElement = Object.keys(componentOrElement).join(",");
    throw Error(formatProdErrorMessage(268, componentOrElement));
  }
  componentOrElement = findCurrentFiberUsingSlowPath(fiber);
  componentOrElement =
    null !== componentOrElement
      ? findCurrentHostFiberImpl(componentOrElement)
      : null;
  componentOrElement =
    null === componentOrElement ? null : componentOrElement.stateNode;
  return componentOrElement;
};
var internals$jscomp$inline_2347 = {
  bundleType: 0,
  version: "19.2.1",
  rendererPackageName: "react-dom",
  currentDispatcherRef: ReactSharedInternals,
  reconcilerVersion: "19.2.1"
};
if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
  var hook$jscomp$inline_2348 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (
    !hook$jscomp$inline_2348.isDisabled &&
    hook$jscomp$inline_2348.supportsFiber
  )
    try {
      (rendererID = hook$jscomp$inline_2348.inject(
        internals$jscomp$inline_2347
      )),
        (injectedHook = hook$jscomp$inline_2348);
    } catch (err) {}
}
exports.createRoot = function (container, options) {
  if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
  var isStrictMode = !1,
    identifierPrefix = "",
    onUncaughtError = defaultOnUncaughtError,
    onCaughtError = defaultOnCaughtError,
    onRecoverableError = defaultOnRecoverableError;
  null !== options &&
    void 0 !== options &&
    (!0 === options.unstable_strictMode && (isStrictMode = !0),
    void 0 !== options.identifierPrefix &&
      (identifierPrefix = options.identifierPrefix),
    void 0 !== options.onUncaughtError &&
      (onUncaughtError = options.onUncaughtError),
    void 0 !== options.onCaughtError && (onCaughtError = options.onCaughtError),
    void 0 !== options.onRecoverableError &&
      (onRecoverableError = options.onRecoverableError));
  options = createFiberRoot(
    container,
    1,
    !1,
    null,
    null,
    isStrictMode,
    identifierPrefix,
    null,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    defaultOnDefaultTransitionIndicator
  );
  container[internalContainerInstanceKey] = options.current;
  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(options);
};
exports.hydrateRoot = function (container, initialChildren, options) {
  if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
  var isStrictMode = !1,
    identifierPrefix = "",
    onUncaughtError = defaultOnUncaughtError,
    onCaughtError = defaultOnCaughtError,
    onRecoverableError = defaultOnRecoverableError,
    formState = null;
  null !== options &&
    void 0 !== options &&
    (!0 === options.unstable_strictMode && (isStrictMode = !0),
    void 0 !== options.identifierPrefix &&
      (identifierPrefix = options.identifierPrefix),
    void 0 !== options.onUncaughtError &&
      (onUncaughtError = options.onUncaughtError),
    void 0 !== options.onCaughtError && (onCaughtError = options.onCaughtError),
    void 0 !== options.onRecoverableError &&
      (onRecoverableError = options.onRecoverableError),
    void 0 !== options.formState && (formState = options.formState));
  initialChildren = createFiberRoot(
    container,
    1,
    !0,
    initialChildren,
    null != options ? options : null,
    isStrictMode,
    identifierPrefix,
    formState,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    defaultOnDefaultTransitionIndicator
  );
  initialChildren.context = getContextForSubtree(null);
  options = initialChildren.current;
  isStrictMode = requestUpdateLane();
  isStrictMode = getBumpedLaneForHydrationByLane(isStrictMode);
  identifierPrefix = createUpdate(isStrictMode);
  identifierPrefix.callback = null;
  enqueueUpdate(options, identifierPrefix, isStrictMode);
  options = isStrictMode;
  initialChildren.current.lanes = options;
  markRootUpdated$1(initialChildren, options);
  ensureRootIsScheduled(initialChildren);
  container[internalContainerInstanceKey] = initialChildren.current;
  listenToAllSupportedEvents(container);
  return new ReactDOMHydrationRoot(initialChildren);
};
exports.version = "19.2.1";

},{"scheduler":4,"react":2,"react-dom":5}]; // ../../../../opt/oai-docgen/node_modules/react-dom/cjs/react-dom-client.production.js
defs[4]=[function(module,exports,require){
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";
function push(heap, node) {
  var index = heap.length;
  heap.push(node);
  a: for (; 0 < index; ) {
    var parentIndex = (index - 1) >>> 1,
      parent = heap[parentIndex];
    if (0 < compare(parent, node))
      (heap[parentIndex] = node), (heap[index] = parent), (index = parentIndex);
    else break a;
  }
}
function peek(heap) {
  return 0 === heap.length ? null : heap[0];
}
function pop(heap) {
  if (0 === heap.length) return null;
  var first = heap[0],
    last = heap.pop();
  if (last !== first) {
    heap[0] = last;
    a: for (
      var index = 0, length = heap.length, halfLength = length >>> 1;
      index < halfLength;

    ) {
      var leftIndex = 2 * (index + 1) - 1,
        left = heap[leftIndex],
        rightIndex = leftIndex + 1,
        right = heap[rightIndex];
      if (0 > compare(left, last))
        rightIndex < length && 0 > compare(right, left)
          ? ((heap[index] = right),
            (heap[rightIndex] = last),
            (index = rightIndex))
          : ((heap[index] = left),
            (heap[leftIndex] = last),
            (index = leftIndex));
      else if (rightIndex < length && 0 > compare(right, last))
        (heap[index] = right), (heap[rightIndex] = last), (index = rightIndex);
      else break a;
    }
  }
  return first;
}
function compare(a, b) {
  var diff = a.sortIndex - b.sortIndex;
  return 0 !== diff ? diff : a.id - b.id;
}
exports.unstable_now = void 0;
if ("object" === typeof performance && "function" === typeof performance.now) {
  var localPerformance = performance;
  exports.unstable_now = function () {
    return localPerformance.now();
  };
} else {
  var localDate = Date,
    initialTime = localDate.now();
  exports.unstable_now = function () {
    return localDate.now() - initialTime;
  };
}
var taskQueue = [],
  timerQueue = [],
  taskIdCounter = 1,
  currentTask = null,
  currentPriorityLevel = 3,
  isPerformingWork = !1,
  isHostCallbackScheduled = !1,
  isHostTimeoutScheduled = !1,
  needsPaint = !1,
  localSetTimeout = "function" === typeof setTimeout ? setTimeout : null,
  localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null,
  localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
function advanceTimers(currentTime) {
  for (var timer = peek(timerQueue); null !== timer; ) {
    if (null === timer.callback) pop(timerQueue);
    else if (timer.startTime <= currentTime)
      pop(timerQueue),
        (timer.sortIndex = timer.expirationTime),
        push(taskQueue, timer);
    else break;
    timer = peek(timerQueue);
  }
}
function handleTimeout(currentTime) {
  isHostTimeoutScheduled = !1;
  advanceTimers(currentTime);
  if (!isHostCallbackScheduled)
    if (null !== peek(taskQueue))
      (isHostCallbackScheduled = !0),
        isMessageLoopRunning ||
          ((isMessageLoopRunning = !0), schedulePerformWorkUntilDeadline());
    else {
      var firstTimer = peek(timerQueue);
      null !== firstTimer &&
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
}
var isMessageLoopRunning = !1,
  taskTimeoutID = -1,
  frameInterval = 5,
  startTime = -1;
function shouldYieldToHost() {
  return needsPaint
    ? !0
    : exports.unstable_now() - startTime < frameInterval
      ? !1
      : !0;
}
function performWorkUntilDeadline() {
  needsPaint = !1;
  if (isMessageLoopRunning) {
    var currentTime = exports.unstable_now();
    startTime = currentTime;
    var hasMoreWork = !0;
    try {
      a: {
        isHostCallbackScheduled = !1;
        isHostTimeoutScheduled &&
          ((isHostTimeoutScheduled = !1),
          localClearTimeout(taskTimeoutID),
          (taskTimeoutID = -1));
        isPerformingWork = !0;
        var previousPriorityLevel = currentPriorityLevel;
        try {
          b: {
            advanceTimers(currentTime);
            for (
              currentTask = peek(taskQueue);
              null !== currentTask &&
              !(
                currentTask.expirationTime > currentTime && shouldYieldToHost()
              );

            ) {
              var callback = currentTask.callback;
              if ("function" === typeof callback) {
                currentTask.callback = null;
                currentPriorityLevel = currentTask.priorityLevel;
                var continuationCallback = callback(
                  currentTask.expirationTime <= currentTime
                );
                currentTime = exports.unstable_now();
                if ("function" === typeof continuationCallback) {
                  currentTask.callback = continuationCallback;
                  advanceTimers(currentTime);
                  hasMoreWork = !0;
                  break b;
                }
                currentTask === peek(taskQueue) && pop(taskQueue);
                advanceTimers(currentTime);
              } else pop(taskQueue);
              currentTask = peek(taskQueue);
            }
            if (null !== currentTask) hasMoreWork = !0;
            else {
              var firstTimer = peek(timerQueue);
              null !== firstTimer &&
                requestHostTimeout(
                  handleTimeout,
                  firstTimer.startTime - currentTime
                );
              hasMoreWork = !1;
            }
          }
          break a;
        } finally {
          (currentTask = null),
            (currentPriorityLevel = previousPriorityLevel),
            (isPerformingWork = !1);
        }
        hasMoreWork = void 0;
      }
    } finally {
      hasMoreWork
        ? schedulePerformWorkUntilDeadline()
        : (isMessageLoopRunning = !1);
    }
  }
}
var schedulePerformWorkUntilDeadline;
if ("function" === typeof localSetImmediate)
  schedulePerformWorkUntilDeadline = function () {
    localSetImmediate(performWorkUntilDeadline);
  };
else if ("undefined" !== typeof MessageChannel) {
  var channel = new MessageChannel(),
    port = channel.port2;
  channel.port1.onmessage = performWorkUntilDeadline;
  schedulePerformWorkUntilDeadline = function () {
    port.postMessage(null);
  };
} else
  schedulePerformWorkUntilDeadline = function () {
    localSetTimeout(performWorkUntilDeadline, 0);
  };
function requestHostTimeout(callback, ms) {
  taskTimeoutID = localSetTimeout(function () {
    callback(exports.unstable_now());
  }, ms);
}
exports.unstable_IdlePriority = 5;
exports.unstable_ImmediatePriority = 1;
exports.unstable_LowPriority = 4;
exports.unstable_NormalPriority = 3;
exports.unstable_Profiling = null;
exports.unstable_UserBlockingPriority = 2;
exports.unstable_cancelCallback = function (task) {
  task.callback = null;
};
exports.unstable_forceFrameRate = function (fps) {
  0 > fps || 125 < fps
    ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      )
    : (frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5);
};
exports.unstable_getCurrentPriorityLevel = function () {
  return currentPriorityLevel;
};
exports.unstable_next = function (eventHandler) {
  switch (currentPriorityLevel) {
    case 1:
    case 2:
    case 3:
      var priorityLevel = 3;
      break;
    default:
      priorityLevel = currentPriorityLevel;
  }
  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;
  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
};
exports.unstable_requestPaint = function () {
  needsPaint = !0;
};
exports.unstable_runWithPriority = function (priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      break;
    default:
      priorityLevel = 3;
  }
  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;
  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
};
exports.unstable_scheduleCallback = function (
  priorityLevel,
  callback,
  options
) {
  var currentTime = exports.unstable_now();
  "object" === typeof options && null !== options
    ? ((options = options.delay),
      (options =
        "number" === typeof options && 0 < options
          ? currentTime + options
          : currentTime))
    : (options = currentTime);
  switch (priorityLevel) {
    case 1:
      var timeout = -1;
      break;
    case 2:
      timeout = 250;
      break;
    case 5:
      timeout = 1073741823;
      break;
    case 4:
      timeout = 1e4;
      break;
    default:
      timeout = 5e3;
  }
  timeout = options + timeout;
  priorityLevel = {
    id: taskIdCounter++,
    callback: callback,
    priorityLevel: priorityLevel,
    startTime: options,
    expirationTime: timeout,
    sortIndex: -1
  };
  options > currentTime
    ? ((priorityLevel.sortIndex = options),
      push(timerQueue, priorityLevel),
      null === peek(taskQueue) &&
        priorityLevel === peek(timerQueue) &&
        (isHostTimeoutScheduled
          ? (localClearTimeout(taskTimeoutID), (taskTimeoutID = -1))
          : (isHostTimeoutScheduled = !0),
        requestHostTimeout(handleTimeout, options - currentTime)))
    : ((priorityLevel.sortIndex = timeout),
      push(taskQueue, priorityLevel),
      isHostCallbackScheduled ||
        isPerformingWork ||
        ((isHostCallbackScheduled = !0),
        isMessageLoopRunning ||
          ((isMessageLoopRunning = !0), schedulePerformWorkUntilDeadline())));
  return priorityLevel;
};
exports.unstable_shouldYield = shouldYieldToHost;
exports.unstable_wrapCallback = function (callback) {
  var parentPriorityLevel = currentPriorityLevel;
  return function () {
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = parentPriorityLevel;
    try {
      return callback.apply(this, arguments);
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
};

},{}]; // ../../../../opt/oai-docgen/node_modules/scheduler/cjs/scheduler.production.js
defs[5]=[function(module,exports,require){
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";
var React = require("react");
function formatProdErrorMessage(code) {
  var url = "https://react.dev/errors/" + code;
  if (1 < arguments.length) {
    url += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var i = 2; i < arguments.length; i++)
      url += "&args[]=" + encodeURIComponent(arguments[i]);
  }
  return (
    "Minified React error #" +
    code +
    "; visit " +
    url +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
function noop() {}
var Internals = {
    d: {
      f: noop,
      r: function () {
        throw Error(formatProdErrorMessage(522));
      },
      D: noop,
      C: noop,
      L: noop,
      m: noop,
      X: noop,
      S: noop,
      M: noop
    },
    p: 0,
    findDOMNode: null
  },
  REACT_PORTAL_TYPE = Symbol.for("react.portal");
function createPortal$1(children, containerInfo, implementation) {
  var key =
    3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
  return {
    $$typeof: REACT_PORTAL_TYPE,
    key: null == key ? null : "" + key,
    children: children,
    containerInfo: containerInfo,
    implementation: implementation
  };
}
var ReactSharedInternals =
  React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
function getCrossOriginStringAs(as, input) {
  if ("font" === as) return "";
  if ("string" === typeof input)
    return "use-credentials" === input ? input : "";
}
exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE =
  Internals;
exports.createPortal = function (children, container) {
  var key =
    2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
  if (
    !container ||
    (1 !== container.nodeType &&
      9 !== container.nodeType &&
      11 !== container.nodeType)
  )
    throw Error(formatProdErrorMessage(299));
  return createPortal$1(children, container, null, key);
};
exports.flushSync = function (fn) {
  var previousTransition = ReactSharedInternals.T,
    previousUpdatePriority = Internals.p;
  try {
    if (((ReactSharedInternals.T = null), (Internals.p = 2), fn)) return fn();
  } finally {
    (ReactSharedInternals.T = previousTransition),
      (Internals.p = previousUpdatePriority),
      Internals.d.f();
  }
};
exports.preconnect = function (href, options) {
  "string" === typeof href &&
    (options
      ? ((options = options.crossOrigin),
        (options =
          "string" === typeof options
            ? "use-credentials" === options
              ? options
              : ""
            : void 0))
      : (options = null),
    Internals.d.C(href, options));
};
exports.prefetchDNS = function (href) {
  "string" === typeof href && Internals.d.D(href);
};
exports.preinit = function (href, options) {
  if ("string" === typeof href && options && "string" === typeof options.as) {
    var as = options.as,
      crossOrigin = getCrossOriginStringAs(as, options.crossOrigin),
      integrity =
        "string" === typeof options.integrity ? options.integrity : void 0,
      fetchPriority =
        "string" === typeof options.fetchPriority
          ? options.fetchPriority
          : void 0;
    "style" === as
      ? Internals.d.S(
          href,
          "string" === typeof options.precedence ? options.precedence : void 0,
          {
            crossOrigin: crossOrigin,
            integrity: integrity,
            fetchPriority: fetchPriority
          }
        )
      : "script" === as &&
        Internals.d.X(href, {
          crossOrigin: crossOrigin,
          integrity: integrity,
          fetchPriority: fetchPriority,
          nonce: "string" === typeof options.nonce ? options.nonce : void 0
        });
  }
};
exports.preinitModule = function (href, options) {
  if ("string" === typeof href)
    if ("object" === typeof options && null !== options) {
      if (null == options.as || "script" === options.as) {
        var crossOrigin = getCrossOriginStringAs(
          options.as,
          options.crossOrigin
        );
        Internals.d.M(href, {
          crossOrigin: crossOrigin,
          integrity:
            "string" === typeof options.integrity ? options.integrity : void 0,
          nonce: "string" === typeof options.nonce ? options.nonce : void 0
        });
      }
    } else null == options && Internals.d.M(href);
};
exports.preload = function (href, options) {
  if (
    "string" === typeof href &&
    "object" === typeof options &&
    null !== options &&
    "string" === typeof options.as
  ) {
    var as = options.as,
      crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
    Internals.d.L(href, as, {
      crossOrigin: crossOrigin,
      integrity:
        "string" === typeof options.integrity ? options.integrity : void 0,
      nonce: "string" === typeof options.nonce ? options.nonce : void 0,
      type: "string" === typeof options.type ? options.type : void 0,
      fetchPriority:
        "string" === typeof options.fetchPriority
          ? options.fetchPriority
          : void 0,
      referrerPolicy:
        "string" === typeof options.referrerPolicy
          ? options.referrerPolicy
          : void 0,
      imageSrcSet:
        "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
      imageSizes:
        "string" === typeof options.imageSizes ? options.imageSizes : void 0,
      media: "string" === typeof options.media ? options.media : void 0
    });
  }
};
exports.preloadModule = function (href, options) {
  if ("string" === typeof href)
    if (options) {
      var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
      Internals.d.m(href, {
        as:
          "string" === typeof options.as && "script" !== options.as
            ? options.as
            : void 0,
        crossOrigin: crossOrigin,
        integrity:
          "string" === typeof options.integrity ? options.integrity : void 0
      });
    } else Internals.d.m(href);
};
exports.requestFormReset = function (form) {
  Internals.d.r(form);
};
exports.unstable_batchedUpdates = function (fn, a) {
  return fn(a);
};
exports.useFormState = function (action, initialState, permalink) {
  return ReactSharedInternals.H.useFormState(action, initialState, permalink);
};
exports.useFormStatus = function () {
  return ReactSharedInternals.H.useHostTransitionStatus();
};
exports.version = "19.2.1";

},{"react":2}]; // ../../../../opt/oai-docgen/node_modules/react-dom/cjs/react-dom.production.js
defs[6]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRoute = parseRoute;
exports.homeHash = homeHash;
exports.App = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("./lib/api");
const dates_1 = require("./lib/dates");
const store_1 = require("./lib/store");
const QuickCapture_1 = require("./components/QuickCapture");
const TaskPanel_1 = require("./components/TaskPanel");
const ui_1 = require("./components/ui");
const Notes_1 = require("./views/Notes");
const Projects_1 = require("./views/Projects");
const Settings_1 = require("./views/Settings");
const Team_1 = require("./views/Team");
const Today_1 = require("./views/Today");
const Work_1 = require("./views/Work");
const NAV = [
    ["hoy", "Hoy", "Alt+1"], ["proyectos", "Proyectos", "Alt+2"], ["trabajo", "Trabajo", "Alt+3"], ["equipo", "Equipo", "Alt+4"], ["notas", "Notas", "Alt+5"],
];
function parseRoute(hash) {
    const [, view = "", id] = (hash || "").replace(/^#/, "").split("/");
    const n = id ? Number(id) : undefined;
    return { view, id: n && Number.isFinite(n) ? n : undefined };
}
/** Destino de «inicio»: la pantalla de apertura configurada (o la última vista si así se configuró). */
function homeHash(s) {
    return "#/" + (s.start_view === "ultima" ? s.last_view || "hoy" : s.start_view || "hoy");
}
function isTyping(e) {
    const t = e.target;
    return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}
function App({ initialBoot }) {
    const [boot, setBoot] = (0, react_1.useState)(initialBoot ?? null);
    const [bootError, setBootError] = (0, react_1.useState)("");
    const [hash, setHash] = (0, react_1.useState)(typeof window !== "undefined" ? window.location.hash : "");
    const [dataVersion, setDataVersion] = (0, react_1.useState)(0);
    const [taskId, setTaskId] = (0, react_1.useState)(null);
    const [quick, setQuick] = (0, react_1.useState)(null);
    const [search, setSearch] = (0, react_1.useState)(false);
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const [reminderCount, setReminderCount] = (0, react_1.useState)(0);
    const toastSeq = (0, react_1.useRef)(0);
    const reloadBoot = (0, react_1.useCallback)(async () => {
        try {
            setBoot(await api_1.api.get("/api/bootstrap"));
            setBootError("");
        }
        catch (e) {
            setBootError(e.message);
        }
    }, []);
    (0, react_1.useEffect)(() => { if (!initialBoot)
        void reloadBoot(); }, []);
    (0, react_1.useEffect)(() => {
        const on = () => setHash(window.location.hash);
        window.addEventListener("hashchange", on);
        return () => window.removeEventListener("hashchange", on);
    }, []);
    (0, react_1.useEffect)(() => { if (boot)
        document.title = boot.settings.app_name || "KAOSnt"; }, [boot?.settings.app_name]);
    (0, react_1.useEffect)(() => { if (boot && !window.location.hash)
        window.location.hash = homeHash(boot.settings); }, [boot === null]);
    const route = parseRoute(hash);
    (0, react_1.useEffect)(() => {
        if (!boot || boot.settings.start_view !== "ultima" || !route.view || route.view === boot.settings.last_view)
            return;
        const t = setTimeout(() => { api_1.api.patch("/api/settings", { last_view: route.view }).catch(() => undefined); }, 1500);
        return () => clearTimeout(t);
    }, [route.view]);
    const toast = (0, react_1.useCallback)((text, kind = "info", action) => {
        const id = ++toastSeq.current;
        setToasts((t) => [...t.slice(-3), { id, text, kind, action }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 9000 : 5000);
    }, []);
    const navigate = (0, react_1.useCallback)((h) => { window.location.hash = h; }, []);
    const newNote = (0, react_1.useCallback)(async (preset = {}) => {
        try {
            const n = await api_1.api.post("/api/notes", preset);
            setDataVersion((v) => v + 1);
            window.location.hash = `#/notas/${n.id}`;
        }
        catch (e) {
            toast(e.message, "error");
        }
    }, []);
    const ctx = (0, react_1.useMemo)(() => boot && ({
        boot, tz: boot.settings.timezone, meId: boot.me_id,
        person: (id) => (id == null ? undefined : boot.people.find((p) => p.id === id)),
        project: (id) => (id == null ? undefined : boot.projects.find((p) => p.id === id)),
        reloadBoot, dataVersion, changed: () => setDataVersion((v) => v + 1),
        openTask: (id) => setTaskId(id), quickTask: (preset) => setQuick(preset || {}), newNote, navigate, toast,
    }), [boot, dataVersion]);
    (0, react_1.useEffect)(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.altKey)
                return; // AltGr en teclados españoles
            if (e.altKey && !e.shiftKey && (e.key === "t" || e.key === "T")) {
                e.preventDefault();
                setQuick({});
            }
            else if (e.altKey && (e.key === "n" || e.key === "N")) {
                e.preventDefault();
                void newNote();
            }
            else if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
                e.preventDefault();
                setSearch(true);
            }
            else if (e.key === "/" && !isTyping(e)) {
                e.preventDefault();
                setSearch(true);
            }
            else if (e.altKey && /^[1-5]$/.test(e.key)) {
                e.preventDefault();
                navigate("#/" + NAV[Number(e.key) - 1][0]);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    (0, react_1.useEffect)(() => {
        const before = (e) => { for (const s of Notes_1.activeSavers)
            if (s.hasUnsaved) {
                void s.flush();
                e.preventDefault();
                e.returnValue = "";
                return;
            } };
        const hidden = () => { if (document.visibilityState === "hidden")
            for (const s of Notes_1.activeSavers)
                void s.flush(); };
        window.addEventListener("beforeunload", before);
        document.addEventListener("visibilitychange", hidden);
        return () => { window.removeEventListener("beforeunload", before); document.removeEventListener("visibilitychange", hidden); };
    }, []);
    // Recordatorios: recálculo periódico mientras la app está abierta y aviso agrupado opcional
    (0, react_1.useEffect)(() => {
        if (!boot)
            return;
        const check = async () => {
            try {
                const r = await api_1.api.get("/api/reminders");
                setReminderCount(r.active.length);
                const fresh = r.active.filter((x) => !x.notified);
                const st = boot.settings;
                if (!fresh.length || !st.notifications_enabled || typeof Notification === "undefined" || Notification.permission !== "granted")
                    return;
                if ((0, dates_1.inQuietHours)(st.quiet_start, st.quiet_end, st.timezone))
                    return;
                const body = st.notifications_discreet || fresh.length > 1 ? `${fresh.length} recordatorio(s) pendiente(s)` : fresh[0].rule_label;
                new Notification(st.app_name || "KAOSnt", { body, tag: "kaosnt-recordatorios" });
                await api_1.api.post("/api/reminders/notified", { ids: fresh.map((x) => x.id) });
            }
            catch { /* el centro interno sigue disponible */ }
        };
        void check();
        const t = setInterval(check, 60000);
        return () => clearInterval(t);
    }, [boot?.settings.notifications_enabled, dataVersion]);
    if (!boot || !ctx)
        return (0, jsx_runtime_1.jsx)("main", { className: "boot", children: bootError ? (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: bootError, onRetry: reloadBoot }) : (0, jsx_runtime_1.jsx)("p", { children: "Cargando\u2026" }) });
    let content;
    switch (route.view) {
        case "proyectos":
            content = route.id ? (0, jsx_runtime_1.jsx)(Projects_1.ProjectDetail, { id: route.id }, route.id) : (0, jsx_runtime_1.jsx)(Projects_1.ProjectsView, {});
            break;
        case "trabajo":
            content = (0, jsx_runtime_1.jsx)(Work_1.WorkView, {});
            break;
        case "equipo":
            content = (0, jsx_runtime_1.jsx)(Team_1.TeamView, { personId: route.id });
            break;
        case "notas":
            content = (0, jsx_runtime_1.jsx)(Notes_1.NotesView, { routeId: route.id });
            break;
        case "config":
            content = (0, jsx_runtime_1.jsx)(Settings_1.SettingsView, {});
            break;
        default: content = (0, jsx_runtime_1.jsx)(Today_1.TodayView, {});
    }
    const current = route.view || "hoy";
    return ((0, jsx_runtime_1.jsxs)(store_1.Ctx.Provider, { value: ctx, children: [(0, jsx_runtime_1.jsx)("a", { className: "skip", href: "#main", children: "Saltar al contenido" }), (0, jsx_runtime_1.jsxs)("header", { className: "topbar", children: [(0, jsx_runtime_1.jsx)("a", { className: "brand", href: homeHash(boot.settings), title: "Ir a la pantalla de inicio", children: boot.settings.app_name || "KAOSnt" }), boot.demo && (0, jsx_runtime_1.jsx)("span", { className: "demo-badge", children: "DEMO \u00B7 datos ficticios" }), (0, jsx_runtime_1.jsx)("nav", { "aria-label": "Principal", className: "mainnav", children: NAV.map(([k, label, key]) => (0, jsx_runtime_1.jsx)("a", { href: `#/${k}`, className: current === k ? "active" : "", "aria-current": current === k ? "page" : undefined, title: key, children: label }, k)) }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setQuick({}), title: "Alt+T", children: ["+ Tarea ", (0, jsx_runtime_1.jsx)("kbd", { children: "Alt+T" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => newNote(), title: "Alt+N", children: ["+ Nota ", (0, jsx_runtime_1.jsx)("kbd", { children: "Alt+N" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setSearch(true), title: "Ctrl+K o /", children: ["Buscar ", (0, jsx_runtime_1.jsx)("kbd", { children: "Ctrl+K" })] }), (0, jsx_runtime_1.jsxs)("a", { href: "#/hoy", className: "bell", title: "Recordatorios pendientes (en Hoy)", "aria-label": `${reminderCount} recordatorios pendientes`, children: ["\uD83D\uDD14 ", reminderCount] }), (0, jsx_runtime_1.jsx)("a", { href: "#/config", className: "navlink" + (current === "config" ? " active" : ""), title: "Configuraci\u00F3n, copias y cierre", children: "\u2699 Configuraci\u00F3n" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "layout" + (taskId ? " with-panel" : ""), children: [(0, jsx_runtime_1.jsx)("main", { id: "main", tabIndex: -1, children: content }), taskId !== null && (0, jsx_runtime_1.jsx)(TaskPanel_1.TaskPanel, { id: taskId, onClose: () => setTaskId(null) }, taskId)] }), quick && (0, jsx_runtime_1.jsx)(QuickCapture_1.QuickTask, { preset: quick, onClose: () => setQuick(null) }), search && (0, jsx_runtime_1.jsx)(QuickCapture_1.SearchDialog, { onClose: () => setSearch(false) }), (0, jsx_runtime_1.jsx)("div", { className: "toasts", "aria-live": "polite", role: "status", children: toasts.map((t) => (0, jsx_runtime_1.jsxs)("div", { className: `toast toast-${t.kind}`, children: [(0, jsx_runtime_1.jsx)("span", { children: t.text }), t.action && (0, jsx_runtime_1.jsx)("button", { className: "small", onClick: () => { t.action.run(); setToasts((x) => x.filter((y) => y.id !== t.id)); }, children: t.action.label }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", "aria-label": "Cerrar aviso", onClick: () => setToasts((x) => x.filter((y) => y.id !== t.id)), children: "\u2715" })] }, t.id)) })] }));
}

},{"react/jsx-runtime":1,"react":2,"./lib/api":7,"./lib/dates":8,"./lib/store":9,"./components/QuickCapture":10,"./components/TaskPanel":15,"./components/ui":13,"./views/Notes":18,"./views/Projects":20,"./views/Settings":23,"./views/Team":24,"./views/Today":25,"./views/Work":26}]; // build/src/App.js
defs[7]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.ApiError = void 0;
// Cliente HTTP mínimo. Solo habla con el propio servidor local (mismo origen).
class ApiError extends Error {
    constructor(status, code, message, extra = {}) {
        super(message);
        this.status = status;
        this.code = code;
        this.extra = extra;
    }
}
exports.ApiError = ApiError;
async function request(method, url, body) {
    let res;
    try {
        res = await fetch(url, {
            method,
            headers: body !== undefined ? { "Content-Type": "application/json", "X-KAOSnt": "1" } : { "X-KAOSnt": "1" },
            body: body !== undefined ? JSON.stringify(body) : undefined,
            credentials: "same-origin",
        });
    }
    catch {
        throw new ApiError(0, "sin_conexion", "No se puede conectar con la aplicación local. Comprueba que KAOSnt sigue en marcha (iniciar.bat).");
    }
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    }
    catch {
        data = null;
    }
    if (!res.ok)
        throw new ApiError(res.status, data?.code || "error", data?.message || `Error ${res.status}`, data || {});
    return data;
}
exports.api = {
    get: (url) => request("GET", url),
    post: (url, body = {}) => request("POST", url, body),
    patch: (url, body) => request("PATCH", url, body),
    put: (url, body) => request("PUT", url, body),
    del: (url) => request("DELETE", url),
};

},{}]; // build/src/lib/api.js
defs[8]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pad = pad;
exports.todayIn = todayIn;
exports.addDays = addDays;
exports.weekStart = weekStart;
exports.isoDow = isoDow;
exports.fmtDate = fmtDate;
exports.fmtDateTime = fmtDateTime;
exports.daysBetween = daysBetween;
exports.dueLabel = dueLabel;
exports.fmtDuration = fmtDuration;
exports.elapsedSinceStart = elapsedSinceStart;
exports.sinceLabel = sinceLabel;
exports.zonedToUtc = zonedToUtc;
exports.utcToZonedInput = utcToZonedInput;
exports.inQuietHours = inQuietHours;
exports.monthGrid = monthGrid;
// Fechas: instantes en UTC o 'YYYY-MM-DD'. Se muestran en la zona configurada (Europe/Madrid por defecto).
const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function parts(d, tz) {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    const out = {};
    for (const p of f.formatToParts(d))
        if (p.type !== "literal")
            out[p.type] = parseInt(p.value, 10);
    return out;
}
function pad(n) { return n < 10 ? "0" + n : String(n); }
function todayIn(tz, now = new Date()) {
    const p = parts(now, tz);
    return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}
function addDays(iso, n) {
    const d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}
function weekStart(iso) { return addDays(iso, -((new Date(iso + "T12:00:00Z").getUTCDay() + 6) % 7)); }
function isoDow(iso) { return ((new Date(iso + "T12:00:00Z").getUTCDay() + 6) % 7) + 1; }
function fmtDate(iso) {
    if (!iso)
        return "sin fecha";
    const d = new Date(iso.slice(0, 10) + "T12:00:00Z");
    return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}
function fmtDateTime(utc, tz) {
    if (!utc)
        return "no informado";
    const p = parts(new Date(utc), tz);
    return `${fmtDate(`${p.year}-${pad(p.month)}-${pad(p.day)}`)} ${p.year} ${pad(p.hour)}:${pad(p.minute)}`;
}
function daysBetween(a, b) {
    return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000);
}
function dueLabel(due, today) {
    const d = daysBetween(today, due);
    if (d < 0)
        return `venció hace ${-d} d`;
    if (d === 0)
        return "vence hoy";
    if (d === 1)
        return "vence mañana";
    return `vence ${fmtDate(due)}`;
}
/** Duración natural legible. Nunca se presenta como horas trabajadas. */
function fmtDuration(ms) {
    if (ms < 0)
        ms = 0;
    const min = Math.floor(ms / 60000);
    const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    if (d > 0)
        return `${d} d ${h} h`;
    if (h > 0)
        return `${h} h ${m} min`;
    return `${m} min`;
}
function elapsedSinceStart(startedAt, completedAt, now = new Date()) {
    if (!startedAt)
        return "no informado (sin fecha de inicio)";
    const end = completedAt ? Date.parse(completedAt) : now.getTime();
    return `${fmtDuration(end - Date.parse(startedAt))} de tiempo natural transcurrido${completedAt ? " (hasta la finalización)" : ""}`;
}
function sinceLabel(utc, now = new Date()) {
    return utc ? `hace ${fmtDuration(now.getTime() - Date.parse(utc))}` : "no informado";
}
function zonedToUtc(local, tz) {
    const [d, t] = local.split("T");
    const [y, mo, da] = d.split("-").map(Number);
    const [h, mi] = (t || "00:00").split(":").map(Number);
    const wall = Date.UTC(y, mo - 1, da, h, mi);
    let guess = wall;
    for (let i = 0; i < 3; i++) {
        const p = parts(new Date(guess), tz);
        const diff = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - wall;
        if (diff === 0)
            break;
        guess -= diff;
    }
    return new Date(guess).toISOString().replace(/\.\d{3}Z$/, "Z");
}
function utcToZonedInput(utc, tz) {
    if (!utc)
        return "";
    const p = parts(new Date(utc), tz);
    return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}
function inQuietHours(start, end, tz, now = new Date()) {
    const p = parts(now, tz);
    const cur = p.hour * 60 + p.minute;
    const [sh, sm] = start.split(":").map(Number), [eh, em] = end.split(":").map(Number);
    const s = sh * 60 + sm, e = eh * 60 + em;
    if (s === e)
        return false;
    return s < e ? cur >= s && cur < e : cur >= s || cur < e;
}
function monthGrid(iso) {
    const start = weekStart(iso.slice(0, 8) + "01");
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

},{}]; // build/src/lib/dates.js
defs[9]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiCache = exports.Ctx = void 0;
exports.useApp = useApp;
exports.useApi = useApi;
const react_1 = require("react");
const api_1 = require("./api");
exports.Ctx = (0, react_1.createContext)(null);
function useApp() {
    const c = (0, react_1.useContext)(exports.Ctx);
    if (!c)
        throw new Error("Contexto de aplicación no disponible");
    return c;
}
// Caché por URL: muestra datos previos mientras se recargan y facilita las pruebas de renderizado.
exports.apiCache = new Map();
function useApi(url) {
    const { dataVersion } = useApp();
    const [data, setData] = (0, react_1.useState)(url ? exports.apiCache.get(url) : undefined);
    const [error, setError] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(!data);
    const [tick, setTick] = (0, react_1.useState)(0);
    const current = (0, react_1.useRef)(url);
    current.current = url;
    (0, react_1.useEffect)(() => {
        if (!url) {
            setData(undefined);
            setLoading(false);
            return;
        }
        let alive = true;
        if (exports.apiCache.has(url))
            setData(exports.apiCache.get(url));
        setLoading(true);
        api_1.api.get(url).then((d) => { if (alive && current.current === url) {
            exports.apiCache.set(url, d);
            setData(d);
            setError("");
            setLoading(false);
        } }, (e) => { if (alive) {
            setError(e.message || "Error");
            setLoading(false);
        } });
        return () => { alive = false; };
    }, [url, dataVersion, tick]);
    const reload = (0, react_1.useCallback)(() => setTick((x) => x + 1), []);
    return { data, error, loading, reload };
}

},{"react":2,"./api":7}]; // build/src/lib/store.js
defs[10]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickTask = QuickTask;
exports.SearchDialog = SearchDialog;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const store_1 = require("../lib/store");
const Recurrences_1 = require("./Recurrences");
const ui_1 = require("./ui");
/** Captura rápida de tarea: solo el título es obligatorio. Más campos (incluida la repetición) bajo demanda. */
function QuickTask({ preset, onClose }) {
    const app = (0, store_1.useApp)();
    const [title, setTitle] = (0, react_1.useState)(preset.title || "");
    const [more, setMore] = (0, react_1.useState)(false);
    const [projectId, setProjectId] = (0, react_1.useState)(preset.project_id ?? null);
    const [assignee, setAssignee] = (0, react_1.useState)(preset.assignee_id ?? null);
    const [due, setDue] = (0, react_1.useState)("");
    const [backlog, setBacklog] = (0, react_1.useState)(!!preset.backlog);
    const [repeat, setRepeat] = (0, react_1.useState)(false);
    const [rule, setRule] = (0, react_1.useState)((0, Recurrences_1.emptyRule)((0, dates_1.todayIn)(app.tz)));
    const [error, setError] = (0, react_1.useState)("");
    const [busy, setBusy] = (0, react_1.useState)(false);
    const submit = async (openAfter) => {
        if (!title.trim() || busy || (repeat && !(0, Recurrences_1.ruleIsValid)(rule)))
            return;
        setBusy(true);
        try {
            let t = await api_1.api.post("/api/tasks", { title: title.trim(), project_id: projectId, assignee_id: assignee,
                due_date: due || null, status: backlog ? "backlog" : "pendiente" });
            if (repeat) {
                t = await api_1.api.post(`/api/tasks/${t.id}/recurrence`, { rule: rule.rule, weekdays: rule.rule === "semanal" ? rule.weekdays : [],
                    interval_days: rule.rule === "cada_n_dias" ? rule.interval_days : null, start_date: due || rule.start_date, end_date: rule.end_date, non_working: rule.non_working });
            }
            app.changed();
            app.toast(`Tarea creada: ${t.title}`, "ok", { label: "Abrir", run: () => app.openTask(t.id) });
            onClose();
            if (openAfter)
                app.openTask(t.id);
        }
        catch (e) {
            setError(e.message);
            setBusy(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)(ui_1.Modal, { title: "Nueva tarea", onClose: onClose, wide: repeat, children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => { e.preventDefault(); void submit(false); }, children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "T\u00EDtulo (obligatorio)", children: (0, jsx_runtime_1.jsx)("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "\u00BFQu\u00E9 hay que hacer?", required: true, maxLength: 300 }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "ghost small", onClick: () => setMore(!more), "aria-expanded": more, children: more ? "Menos campos" : "Más campos (opcionales)" }), more && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid2", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Proyecto", children: (0, jsx_runtime_1.jsx)(ui_1.ProjectSelect, { value: projectId, onChange: setProjectId }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Responsable", children: (0, jsx_runtime_1.jsx)(ui_1.PersonSelect, { value: assignee, onChange: setAssignee }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Fecha l\u00EDmite", children: (0, jsx_runtime_1.jsx)("input", { type: "date", value: due, onChange: (e) => setDue(e.target.value) }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: backlog, onChange: (e) => setBacklog(e.target.checked) }), " Guardar en Backlog (a\u00FAn no comprometida)"] }), (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: repeat, onChange: (e) => setRepeat(e.target.checked) }), " Se repite"] }), repeat && (0, jsx_runtime_1.jsx)(Recurrences_1.RuleEditor, { value: { ...rule, start_date: due || rule.start_date }, onChange: setRule })] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-foot", children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", className: "primary", disabled: !title.trim() || busy || (repeat && !(0, Recurrences_1.ruleIsValid)(rule)), children: "Crear (Enter)" }), (0, jsx_runtime_1.jsx)("button", { type: "button", disabled: !title.trim() || busy, onClick: () => submit(true), children: "Crear y abrir detalle" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, children: "Cancelar" })] })] }) }));
}
function SearchDialog({ onClose }) {
    const app = (0, store_1.useApp)();
    const [q, setQ] = (0, react_1.useState)("");
    const [archived, setArchived] = (0, react_1.useState)(false);
    const [trash, setTrash] = (0, react_1.useState)(false);
    const [results, setResults] = (0, react_1.useState)([]);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [error, setError] = (0, react_1.useState)("");
    const [sel, setSel] = (0, react_1.useState)(0);
    const seq = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(() => {
        if (!q.trim()) {
            setResults([]);
            setTotal(0);
            return;
        }
        const my = ++seq.current;
        const t = setTimeout(() => {
            api_1.api.get(`/api/search?q=${encodeURIComponent(q)}${archived ? "&archived=true" : ""}${trash ? "&trash=true" : ""}`)
                .then((r) => { if (my === seq.current) {
                setResults(r.results);
                setTotal(r.total);
                setSel(0);
                setError("");
            } }, (e) => setError(e.message));
        }, 200);
        return () => clearTimeout(t);
    }, [q, archived, trash]);
    const open = (r) => {
        onClose();
        if (r.type === "tarea")
            app.openTask(r.id);
        else
            app.navigate(r.type === "nota" ? `#/notas/${r.id}` : `#/proyectos/${r.id}`);
    };
    return ((0, jsx_runtime_1.jsxs)(ui_1.Modal, { title: "Buscar", onClose: onClose, wide: true, children: [(0, jsx_runtime_1.jsx)("input", { "aria-label": "Texto a buscar", placeholder: 'Palabras o "frase exacta" en tareas, proyectos y notas', value: q, onChange: (e) => setQ(e.target.value), onKeyDown: (e) => {
                    if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSel(Math.min(sel + 1, results.length - 1));
                    }
                    if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSel(Math.max(sel - 1, 0));
                    }
                    if (e.key === "Enter" && results[sel]) {
                        e.preventDefault();
                        open(results[sel]);
                    }
                } }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: archived, onChange: (e) => setArchived(e.target.checked) }), " Incluir archivados"] }), (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: trash, onChange: (e) => setTrash(e.target.checked) }), " Incluir papelera"] })] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error }), q.trim() && !results.length && !error && (0, jsx_runtime_1.jsx)("p", { className: "empty", children: "Sin resultados. Prueba con menos palabras o sin comillas." }), (0, jsx_runtime_1.jsx)("ul", { className: "results", role: "listbox", "aria-label": "Resultados", children: results.map((r, i) => ((0, jsx_runtime_1.jsx)("li", { role: "option", "aria-selected": i === sel, className: i === sel ? "sel" : "", children: (0, jsx_runtime_1.jsxs)("button", { className: "result", onClick: () => open(r), children: [(0, jsx_runtime_1.jsx)("span", { className: "result-type", children: r.type === "nota" ? "Nota" : r.type === "tarea" ? "Tarea" : "Proyecto" }), (0, jsx_runtime_1.jsx)("strong", { children: r.title }), " ", (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: ["\u00B7 ", r.context] }), r.snippet && (0, jsx_runtime_1.jsx)("span", { className: "snippet", children: r.snippet })] }) }, r.type + r.id))) }), total > results.length && (0, jsx_runtime_1.jsxs)("p", { className: "hint", children: ["Mostrando ", results.length, " de ", total, ". Afina la b\u00FAsqueda."] })] }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/store":9,"./Recurrences":11,"./ui":13}]; // build/src/components/QuickCapture.js
defs[11]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyRule = emptyRule;
exports.ruleIsValid = ruleIsValid;
exports.RuleEditor = RuleEditor;
exports.RecurrencesModal = RecurrencesModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const labels_1 = require("../lib/labels");
const store_1 = require("../lib/store");
const ui_1 = require("./ui");
function emptyRule(start) {
    return { rule: "semanal", weekdays: [(0, dates_1.isoDow)(start)], interval_days: 2, start_date: start, end_date: null, non_working: "saltar" };
}
function ruleIsValid(r) {
    return !!r.start_date && (r.rule !== "semanal" || r.weekdays.length > 0) && (r.rule !== "cada_n_dias" || (r.interval_days || 0) >= 1);
}
/** Editor de la regla de repetición (compartido por la tarea, la captura rápida y el gestor). */
function RuleEditor({ value, onChange, lockRule }) {
    const set = (p) => onChange({ ...value, ...p });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "rule-editor", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid2", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Se repite", children: (0, jsx_runtime_1.jsx)("select", { value: value.rule, disabled: lockRule, onChange: (e) => set({ rule: e.target.value }), children: Object.keys(labels_1.RULE).map((k) => (0, jsx_runtime_1.jsx)("option", { value: k, children: labels_1.RULE[k] }, k)) }) }), value.rule === "cada_n_dias" && (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Cada cu\u00E1ntos d\u00EDas", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", disabled: lockRule, value: value.interval_days ?? "", onChange: (e) => set({ interval_days: e.target.value ? Number(e.target.value) : null }) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Empieza", children: (0, jsx_runtime_1.jsx)("input", { type: "date", disabled: lockRule, value: value.start_date, onChange: (e) => set({ start_date: e.target.value }) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Termina (opcional)", children: (0, jsx_runtime_1.jsx)("input", { type: "date", value: value.end_date || "", onChange: (e) => set({ end_date: e.target.value || null }) }) })] }), value.rule === "semanal" && ((0, jsx_runtime_1.jsxs)("fieldset", { className: "weekdays", disabled: lockRule, children: [(0, jsx_runtime_1.jsx)("legend", { children: "D\u00EDas de la semana" }), labels_1.DAYS_SHORT.map((d, i) => ((0, jsx_runtime_1.jsxs)("label", { className: "daybox", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: value.weekdays.includes(i + 1), onChange: (e) => set({ weekdays: e.target.checked ? [...value.weekdays, i + 1].sort() : value.weekdays.filter((x) => x !== i + 1) }) }), d] }, d)))] })), value.rule !== "laborables" && ((0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Si cae en d\u00EDa no laborable", hint: "No laborables: d\u00EDas de la semana y festivos registrados (comunes y de la oficina del responsable)", children: (0, jsx_runtime_1.jsx)("select", { value: value.non_working, onChange: (e) => set({ non_working: e.target.value }), children: Object.entries(labels_1.NONWORK).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k)) }) }))] }));
}
function RecurrencesModal({ onClose }) {
    const app = (0, store_1.useApp)();
    const { data, error, reload } = (0, store_1.useApi)("/api/recurrences");
    const [form, setForm] = (0, react_1.useState)(null);
    const [err, setErr] = (0, react_1.useState)("");
    const save = async () => {
        if (!form)
            return;
        const { r, ...f } = form;
        try {
            if (f.id) {
                const applyFuture = window.confirm("¿Aplicar también a las ocurrencias futuras ya generadas que sigan pendientes?\n\nAceptar = también las futuras · Cancelar = solo las nuevas");
                await api_1.api.patch(`/api/recurrences/${f.id}`, { title: f.title, project_id: f.project_id ?? null, assignee_id: f.assignee_id ?? null,
                    priority: f.priority, estimate_hours: f.estimate_hours ?? null, end_date: r.end_date, non_working: r.non_working, apply_to_future: applyFuture });
            }
            else {
                await api_1.api.post("/api/recurrences", { title: f.title, project_id: f.project_id ?? null, assignee_id: f.assignee_id ?? null,
                    priority: f.priority || "normal", estimate_hours: f.estimate_hours ?? null, ...r, interval_days: r.rule === "cada_n_dias" ? r.interval_days : null });
            }
            setForm(null);
            reload();
            app.changed();
            setErr("");
        }
        catch (e) {
            setErr(e.message);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(ui_1.Modal, { title: "Tareas recurrentes", onClose: onClose, wide: true, children: [(0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Tambi\u00E9n puedes hacer recurrente cualquier tarea desde su detalle (secci\u00F3n \u00ABRepetici\u00F3n\u00BB). Cada ocurrencia es una tarea propia: se completa o se salta sin afectar a las dem\u00E1s." }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error || err, onRetry: reload }), !form && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "table-wrap", children: (0, jsx_runtime_1.jsxs)("table", { className: "list compact", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "T\u00EDtulo" }), (0, jsx_runtime_1.jsx)("th", { children: "Repetici\u00F3n" }), (0, jsx_runtime_1.jsx)("th", { children: "Responsable" }), (0, jsx_runtime_1.jsx)("th", { children: "Estado" }), (0, jsx_runtime_1.jsx)("th", {})] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: data?.map((r) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: r.title }), (0, jsx_runtime_1.jsxs)("td", { children: [(0, labels_1.describeRule)(r), " \u00B7 desde ", (0, dates_1.fmtDate)(r.start_date), r.end_date ? ` hasta ${(0, dates_1.fmtDate)(r.end_date)}` : ""] }), (0, jsx_runtime_1.jsx)("td", { children: app.person(r.assignee_id)?.name || "Sin asignar" }), (0, jsx_runtime_1.jsx)("td", { children: r.active ? "Activa" : "Pausada" }), (0, jsx_runtime_1.jsxs)("td", { className: "nowrap", children: [(0, jsx_runtime_1.jsx)("button", { className: "small", onClick: () => setForm({ ...r, r: { rule: r.rule, weekdays: r.weekdays, interval_days: r.interval_days, start_date: r.start_date, end_date: r.end_date, non_working: r.non_working } }), children: "Editar" }), (0, jsx_runtime_1.jsx)("button", { className: "small ghost", onClick: async () => { await api_1.api.patch(`/api/recurrences/${r.id}`, { active: !r.active }); reload(); app.changed(); }, children: r.active ? "Pausar" : "Reactivar" })] })] }, r.id))) })] }) }), data && !data.length && (0, jsx_runtime_1.jsx)("p", { className: "empty", children: "No hay tareas recurrentes." }), (0, jsx_runtime_1.jsx)("div", { className: "modal-foot", children: (0, jsx_runtime_1.jsx)("button", { className: "primary", onClick: () => setForm({ priority: "normal", r: emptyRule((0, dates_1.todayIn)(app.tz)) }), children: "Nueva recurrencia" }) })] }), form && ((0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => { e.preventDefault(); void save(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid2", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "T\u00EDtulo", children: (0, jsx_runtime_1.jsx)("input", { value: form.title || "", onChange: (e) => setForm({ ...form, title: e.target.value }), required: true }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Responsable", children: (0, jsx_runtime_1.jsx)(ui_1.PersonSelect, { value: form.assignee_id, onChange: (v) => setForm({ ...form, assignee_id: v }) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Proyecto", children: (0, jsx_runtime_1.jsx)(ui_1.ProjectSelect, { value: form.project_id, onChange: (v) => setForm({ ...form, project_id: v }) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Prioridad", children: (0, jsx_runtime_1.jsx)("select", { value: form.priority, onChange: (e) => setForm({ ...form, priority: e.target.value }), children: Object.entries(labels_1.PRIORITY).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k)) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Esfuerzo estimado por ocurrencia (h)", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", step: "0.5", value: form.estimate_hours ?? "", onChange: (e) => setForm({ ...form, estimate_hours: e.target.value === "" ? null : Number(e.target.value) }) }) })] }), (0, jsx_runtime_1.jsx)(RuleEditor, { value: form.r, onChange: (r) => setForm({ ...form, r }), lockRule: !!form.id }), form.id && (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "La regla y el inicio no se modifican para no alterar el hist\u00F3rico; si cambian, pausa esta serie y crea otra." }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-foot", children: [(0, jsx_runtime_1.jsx)("button", { className: "primary", type: "submit", disabled: !form.title?.trim() || !ruleIsValid(form.r), children: "Guardar" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setForm(null), children: "Volver" })] })] }))] }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/labels":12,"../lib/store":9,"./ui":13}]; // build/src/components/Recurrences.js
defs[12]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAYS_LONG = exports.DAYS_SHORT = exports.NONWORK = exports.RULE = exports.SIGNAL = exports.GROUPING_KIND = exports.MILESTONE_KIND = exports.NOTE_KIND = exports.PROJECT_TYPE = exports.HEALTH = exports.PROJECT_STATUS = exports.APPROVAL = exports.KIND = exports.CONDITION = exports.PRIORITY_MARK = exports.PRIORITY = exports.STATUS_ORDER = exports.BOARD_COLUMNS = exports.STATUS = void 0;
exports.projectTypeLabel = projectTypeLabel;
exports.describeRule = describeRule;
exports.STATUS = {
    backlog: "Backlog", pendiente: "Pendiente", en_curso: "En curso", en_revision: "En revisión", hecha: "Hecha", cancelada: "Cancelada",
};
exports.BOARD_COLUMNS = ["pendiente", "en_curso", "en_revision", "hecha"];
exports.STATUS_ORDER = ["backlog", "pendiente", "en_curso", "en_revision", "hecha", "cancelada"];
exports.PRIORITY = { urgente: "Urgente", alta: "Alta", normal: "Normal", baja: "Baja" };
exports.PRIORITY_MARK = { urgente: "‼", alta: "!", normal: "", baja: "↓" };
exports.CONDITION = { espera: "En espera", bloqueada: "Bloqueada" };
exports.KIND = { tarea: "Tarea", peticion: "Petición", incidencia: "Incidencia", mejora: "Mejora", evolutivo: "Evolutivo" };
exports.APPROVAL = { no_requerida: "No requerida", pendiente: "Pendiente", aprobada: "Aprobada", rechazada: "Rechazada" };
exports.PROJECT_STATUS = { activo: "Activo", pausado: "Pausado", cerrado: "Cerrado", archivado: "Archivado" };
exports.HEALTH = { normal: "Normal", atencion: "Requiere atención", bloqueado: "Bloqueado" };
exports.PROJECT_TYPE = {
    implementacion: "Implementación", mantenimiento: "Mantenimiento", id: "I+D", consultoria: "Consultoría",
    benchmark: "Benchmark", propuesta: "Propuesta comercial", otro: "Otro",
};
exports.NOTE_KIND = { acta: "Acta", decision: "Decisión", documentacion: "Documentación" };
exports.MILESTONE_KIND = { hito: "Hito", decision: "Decisión pendiente", compromiso: "Compromiso" };
exports.GROUPING_KIND = { linea: "Línea de trabajo", fase: "Fase", entregable: "Entregable" };
exports.SIGNAL = {
    vencida: "Vencida", vence_hoy: "Vence hoy", vence_semana: "Vence esta semana", espera: "En espera", bloqueada: "Bloqueada",
    bloqueada_por_dependencia: "Depende de otra tarea", bloquea_otras: "Bloquea otras tareas", backlog: "En backlog",
    aprobacion_pendiente: "Aprobación pendiente", aprobacion_rechazada: "Aprobación rechazada",
};
exports.RULE = { diaria: "Todos los días", laborables: "Días laborables", semanal: "Semanal (días concretos)", cada_n_dias: "Cada X días" };
exports.NONWORK = { saltar: "Saltar ese día", siguiente_laborable: "Mover al siguiente laborable", mantener: "Mantener la fecha" };
exports.DAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
exports.DAYS_LONG = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
function projectTypeLabel(t) { return exports.PROJECT_TYPE[t] || t; }
function describeRule(r) {
    if (r.rule === "semanal")
        return "Cada semana: " + ([...(r.weekdays || [])].sort().map((d) => exports.DAYS_LONG[d - 1].toLowerCase()).join(", ") || "—");
    if (r.rule === "cada_n_dias")
        return `Cada ${r.interval_days || 1} días`;
    return exports.RULE[r.rule];
}

},{}]; // build/src/lib/labels.js
defs[13]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = Modal;
exports.Field = Field;
exports.AutoText = AutoText;
exports.CommitText = CommitText;
exports.PersonSelect = PersonSelect;
exports.ProjectSelect = ProjectSelect;
exports.LocationSelect = LocationSelect;
exports.Chip = Chip;
exports.Empty = Empty;
exports.ErrorBox = ErrorBox;
exports.SafeLink = SafeLink;
exports.LinksEditor = LinksEditor;
exports.TagPicker = TagPicker;
exports.TaskPicker = TaskPicker;
exports.AccItem = AccItem;
exports.Section = Section;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const labels_1 = require("../lib/labels");
const links_1 = require("../lib/links");
const store_1 = require("../lib/store");
function Modal({ title, onClose, children, wide }) {
    const ref = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const prev = document.activeElement;
        ref.current?.querySelector("input, textarea, select, button:not(.modal-close)")?.focus();
        const onKey = (e) => { if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
        } };
        window.addEventListener("keydown", onKey, true);
        return () => { window.removeEventListener("keydown", onKey, true); prev?.focus?.(); };
    }, []);
    return ((0, jsx_runtime_1.jsx)("div", { className: "modal-backdrop", onMouseDown: (e) => { if (e.target === e.currentTarget)
            onClose(); }, children: (0, jsx_runtime_1.jsxs)("div", { className: "modal" + (wide ? " modal-wide" : ""), role: "dialog", "aria-modal": "true", "aria-label": title, ref: ref, children: [(0, jsx_runtime_1.jsxs)("div", { className: "modal-head", children: [(0, jsx_runtime_1.jsx)("h2", { children: title }), (0, jsx_runtime_1.jsx)("button", { className: "ghost modal-close", onClick: onClose, "aria-label": "Cerrar (Esc)", children: "\u2715" })] }), children] }) }));
}
function Field({ label, children, hint, wide }) {
    return ((0, jsx_runtime_1.jsxs)("label", { className: "field" + (wide ? " field-wide" : ""), children: [(0, jsx_runtime_1.jsx)("span", { className: "field-label", children: label }), children, hint && (0, jsx_runtime_1.jsx)("span", { className: "hint", children: hint })] }));
}
/** Área de texto que crece con el contenido (entre minRows y maxRows líneas) sin desbordar su contenedor. */
function AutoText({ value, onChange, minRows = 1, maxRows = 8, ...rest }) {
    const ref = (0, react_1.useRef)(null);
    (0, react_1.useLayoutEffect)(() => {
        const el = ref.current;
        if (!el || typeof getComputedStyle === "undefined")
            return;
        el.style.height = "auto";
        const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
        const max = lh * maxRows + 12;
        el.style.height = Math.min(Math.max(el.scrollHeight + 2, lh * minRows + 12), max) + "px";
        el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    }, [value, maxRows, minRows]);
    return (0, jsx_runtime_1.jsx)("textarea", { ref: ref, rows: minRows, className: "autotext", value: value, onChange: (e) => onChange(e.target.value), ...rest });
}
/** Texto que se guarda al salir del campo o con Ctrl+Enter. Esc deshace la edición en curso. */
function CommitText({ value, onCommit, placeholder, label, maxRows = 6 }) {
    const [v, setV] = (0, react_1.useState)(value);
    (0, react_1.useEffect)(() => setV(value), [value]);
    const commit = () => { if (v !== value)
        onCommit(v); };
    return (0, jsx_runtime_1.jsx)(AutoText, { value: v, onChange: setV, "aria-label": label, placeholder: placeholder, maxRows: maxRows, onBlur: commit, onKeyDown: (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                commit();
            }
            if (e.key === "Escape") {
                e.stopPropagation();
                setV(value);
            }
        } });
}
function PersonSelect({ value, onChange, label = "Persona", allowEmpty = true, emptyLabel = "Sin asignar" }) {
    const { boot } = (0, store_1.useApp)();
    return ((0, jsx_runtime_1.jsxs)("select", { "aria-label": label, value: value ?? "", onChange: (e) => onChange(e.target.value ? Number(e.target.value) : null), children: [allowEmpty && (0, jsx_runtime_1.jsx)("option", { value: "", children: emptyLabel }), boot.people.filter((p) => p.active || p.id === value).map((p) => (0, jsx_runtime_1.jsxs)("option", { value: p.id, children: [p.name, p.is_me ? " (yo)" : ""] }, p.id))] }));
}
function ProjectSelect({ value, onChange, label = "Proyecto", emptyLabel = "Sin proyecto" }) {
    const { boot } = (0, store_1.useApp)();
    return ((0, jsx_runtime_1.jsxs)("select", { "aria-label": label, value: value ?? "", onChange: (e) => onChange(e.target.value ? Number(e.target.value) : null), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: emptyLabel }), boot.projects.filter((p) => p.status !== "archivado" || p.id === value).map((p) => ((0, jsx_runtime_1.jsxs)("option", { value: p.id, children: [p.name, p.status !== "activo" ? ` (${p.status})` : ""] }, p.id)))] }));
}
function LocationSelect({ value, onChange, emptyLabel = "Sin oficina" }) {
    const { boot } = (0, store_1.useApp)();
    return ((0, jsx_runtime_1.jsxs)("select", { "aria-label": "Oficina", value: value ?? "", onChange: (e) => onChange(e.target.value ? Number(e.target.value) : null), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: emptyLabel }), boot.locations.map((l) => (0, jsx_runtime_1.jsx)("option", { value: l.id, children: l.name }, l.id))] }));
}
function Chip({ children, tone = "neutral", title }) {
    return (0, jsx_runtime_1.jsx)("span", { className: `chip chip-${tone}`, title: title, children: children });
}
function Empty({ children }) { return (0, jsx_runtime_1.jsx)("p", { className: "empty", children: children }); }
function ErrorBox({ error, onRetry }) {
    if (!error)
        return null;
    return (0, jsx_runtime_1.jsxs)("div", { className: "error-box", role: "alert", children: [(0, jsx_runtime_1.jsx)("span", { children: error }), onRetry && (0, jsx_runtime_1.jsx)("button", { onClick: onRetry, children: "Reintentar" })] });
}
function SafeLink({ link }) {
    if (!(0, links_1.isSafeUrl)(link.url))
        return (0, jsx_runtime_1.jsxs)("span", { className: "unsafe-link", children: [link.label || link.url, " [bloqueado]"] });
    return (0, jsx_runtime_1.jsx)("a", { ...(0, links_1.linkProps)(link.url), title: link.url, children: link.label || link.url });
}
function LinksEditor({ value, onChange }) {
    const [label, setLabel] = (0, react_1.useState)("");
    const [url, setUrl] = (0, react_1.useState)("");
    const [err, setErr] = (0, react_1.useState)("");
    const add = () => {
        if (!(0, links_1.isSafeUrl)(url)) {
            setErr("Usa un enlace http(s), mailto o file. Otros esquemas se bloquean.");
            return;
        }
        onChange([...value, { label: label.trim(), url: url.trim() }]);
        setLabel("");
        setUrl("");
        setErr("");
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "links-editor", children: [value.length === 0 && (0, jsx_runtime_1.jsx)("span", { className: "muted", children: "Sin enlaces" }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: value.map((l, i) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)(SafeLink, { link: l }), " ", (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => onChange(value.filter((_, j) => j !== i)), "aria-label": `Quitar enlace ${l.label || l.url}`, children: "Quitar" })] }, i))) }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("input", { placeholder: "Etiqueta (opcional)", "aria-label": "Etiqueta del enlace", value: label, onChange: (e) => setLabel(e.target.value) }), (0, jsx_runtime_1.jsx)("input", { className: "grow", placeholder: "https://\u2026 o file:///\u2026", "aria-label": "URL del enlace", value: url, onChange: (e) => setUrl(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") {
                            e.preventDefault();
                            add();
                        } } }), (0, jsx_runtime_1.jsx)("button", { onClick: add, disabled: !url.trim(), children: "A\u00F1adir enlace" })] }), err && (0, jsx_runtime_1.jsx)("p", { className: "field-error", children: err })] }));
}
/** Selector de etiquetas: reutiliza las existentes; Enter elige la sugerencia resaltada o crea una nueva. */
function TagPicker({ value, onChange }) {
    const { boot } = (0, store_1.useApp)();
    const [text, setText] = (0, react_1.useState)("");
    const [sel, setSel] = (0, react_1.useState)(0);
    const [open, setOpen] = (0, react_1.useState)(false);
    const lower = value.map((v) => v.toLowerCase());
    const q = text.trim().toLowerCase();
    const exact = boot.tags.find((t) => t.toLowerCase() === q);
    const items = (0, react_1.useMemo)(() => {
        const opts = boot.tags.filter((t) => !lower.includes(t.toLowerCase()) && (!q || t.toLowerCase().includes(q))).slice(0, 8)
            .map((t) => ({ label: "#" + t, name: t }));
        if (q && !exact)
            opts.push({ label: `Crear «${text.trim()}»`, name: text.trim() });
        return opts;
    }, [boot.tags, value.join("|"), q, text]);
    const add = (name) => {
        const n = name.trim().replace(/\s+/g, " ");
        if (n && !lower.includes(n.toLowerCase()))
            onChange([...value, boot.tags.find((t) => t.toLowerCase() === n.toLowerCase()) || n]);
        setText("");
        setSel(0);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "tagpicker", onBlur: (e) => { if (!e.currentTarget.contains(e.relatedTarget))
            setOpen(false); }, children: [value.map((t) => ((0, jsx_runtime_1.jsxs)("span", { className: "tagchip", children: ["#", t, (0, jsx_runtime_1.jsx)("button", { className: "ghost small", "aria-label": `Quitar etiqueta ${t}`, onClick: () => onChange(value.filter((x) => x !== t)), children: "\u00D7" })] }, t))), (0, jsx_runtime_1.jsx)("input", { "aria-label": "A\u00F1adir etiqueta", placeholder: value.length ? "" : "Añadir etiqueta…", value: text, maxLength: 60, onFocus: () => setOpen(true), onChange: (e) => { setText(e.target.value); setOpen(true); setSel(0); }, onKeyDown: (e) => {
                    if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setOpen(true);
                        setSel(Math.min(sel + 1, items.length - 1));
                    }
                    else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSel(Math.max(sel - 1, 0));
                    }
                    else if (e.key === "Enter") {
                        e.preventDefault();
                        if (exact)
                            add(exact);
                        else if (items[sel])
                            add(items[sel].name);
                    }
                    else if (e.key === "Backspace" && !text && value.length)
                        onChange(value.slice(0, -1));
                    else if (e.key === "Escape") {
                        e.stopPropagation();
                        setOpen(false);
                    }
                } }), open && items.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { className: "dropdown", role: "listbox", children: items.map((it, i) => (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("button", { tabIndex: -1, className: i === sel ? "sel" : "", onMouseDown: (e) => { e.preventDefault(); add(it.name); }, children: it.label }) }, it.label)) }))] }));
}
/** Buscador de tareas por título, con contexto (proyecto, estado, responsable) en lugar de identificadores. */
function TaskPicker({ tasks, onPick, placeholder = "Buscar tarea por título…", exclude = [] }) {
    const app = (0, store_1.useApp)();
    const [q, setQ] = (0, react_1.useState)("");
    const [open, setOpen] = (0, react_1.useState)(false);
    const [sel, setSel] = (0, react_1.useState)(0);
    const norm = (s) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const nq = norm(q.trim());
    const list = tasks.filter((t) => !exclude.includes(t.id) && (!nq || norm(t.title + " " + (app.project(t.project_id)?.name || "")).includes(nq))).slice(0, 10);
    const pick = (id) => { onPick(id); setQ(""); setOpen(false); };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "taskpicker", onBlur: (e) => { if (!e.currentTarget.contains(e.relatedTarget))
            setOpen(false); }, children: [(0, jsx_runtime_1.jsx)("input", { "aria-label": placeholder, placeholder: placeholder, value: q, onFocus: () => setOpen(true), onChange: (e) => { setQ(e.target.value); setOpen(true); setSel(0); }, onKeyDown: (e) => {
                    if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setSel(Math.min(sel + 1, list.length - 1));
                    }
                    else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setSel(Math.max(sel - 1, 0));
                    }
                    else if (e.key === "Enter" && list[sel]) {
                        e.preventDefault();
                        pick(list[sel].id);
                    }
                    else if (e.key === "Escape") {
                        e.stopPropagation();
                        setOpen(false);
                    }
                } }), open && ((0, jsx_runtime_1.jsxs)("ul", { className: "dropdown", role: "listbox", children: [list.length === 0 && (0, jsx_runtime_1.jsx)("li", { className: "muted pad-s", children: "Sin coincidencias" }), list.map((t, i) => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsxs)("button", { tabIndex: -1, className: i === sel ? "sel" : "", onMouseDown: (e) => { e.preventDefault(); pick(t.id); }, children: [(0, jsx_runtime_1.jsx)("span", { className: "dd-title", children: t.title }), (0, jsx_runtime_1.jsx)("span", { className: "dd-ctx", children: [app.project(t.project_id)?.name || "Sin proyecto", labels_1.STATUS[t.status], app.person(t.assignee_id)?.name || "Sin asignar"].join(" · ") })] }) }, t.id)))] }))] }));
}
/** Acordeón: solo una sección abierta a la vez (lo controla el padre). */
function AccItem({ id, title, open, setOpen, children, badge }) {
    const isOpen = open === id;
    return ((0, jsx_runtime_1.jsxs)("section", { className: "acc" + (isOpen ? " open" : ""), children: [(0, jsx_runtime_1.jsxs)("button", { className: "acc-head", "aria-expanded": isOpen, onClick: () => setOpen(isOpen ? null : id), children: [(0, jsx_runtime_1.jsx)("span", { className: "acc-caret", "aria-hidden": "true", children: isOpen ? "▾" : "▸" }), " ", title, " ", badge] }), isOpen && (0, jsx_runtime_1.jsx)("div", { className: "acc-body", children: children })] }));
}
function Section({ title, count, children, actions, id }) {
    return ((0, jsx_runtime_1.jsxs)("section", { className: "section", "aria-labelledby": id, children: [(0, jsx_runtime_1.jsxs)("div", { className: "section-head", children: [(0, jsx_runtime_1.jsxs)("h2", { id: id, children: [title, count !== undefined && (0, jsx_runtime_1.jsxs)("span", { className: "count", children: [" (", count, ")"] })] }), actions] }), children] }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/labels":12,"../lib/links":14,"../lib/store":9}]; // build/src/components/ui.js
defs[14]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSafeUrl = isSafeUrl;
exports.linkProps = linkProps;
// Validación de enlaces: solo esquemas seguros. Nunca se abren automáticamente.
const SAFE = /^(https?:\/\/|mailto:|file:)/i;
function isSafeUrl(url) {
    if (!url)
        return false;
    const u = url.trim();
    if (/[\u0000-\u001f]/.test(u))
        return false;
    return SAFE.test(u);
}
function linkProps(url) {
    return { href: url, target: "_blank", rel: "noopener noreferrer nofollow", referrerPolicy: "no-referrer" };
}

},{}]; // build/src/lib/links.js
defs[15]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchTask = patchTask;
exports.TaskPanel = TaskPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const labels_1 = require("../lib/labels");
const markdown_1 = require("../lib/markdown");
const store_1 = require("../lib/store");
const Recurrences_1 = require("./Recurrences");
const ReminderForm_1 = require("./ReminderForm");
const ui_1 = require("./ui");
const EDITABLE = [
    "title", "description", "kind", "project_id", "workstream_id", "phase_id", "deliverable_id",
    "assignee_id", "reviewer_id", "due_date", "planned_date", "estimate_hours", "approval", "condition",
    "wait_reason", "wait_on", "wait_on_person_id", "wait_next_action", "follow_up_at", "follow_up_every_days",
    "next_review_at", "review_after_start_hours", "review_after_idle_hours", "review_hours_mode", "links", "started_at",
];
const KEEP_EMPTY_STRING = new Set(["title", "description", "wait_reason", "wait_on", "wait_next_action"]);
/** PATCH de tarea; si la aprobación comercial está pendiente, pide confirmación explícita. */
async function patchTask(id, body) {
    try {
        return await api_1.api.patch(`/api/tasks/${id}`, body);
    }
    catch (e) {
        if (e instanceof api_1.ApiError && e.code === "aprobacion_pendiente") {
            return window.confirm(e.message) ? api_1.api.patch(`/api/tasks/${id}`, { ...body, force: true }) : null;
        }
        throw e;
    }
}
function pick(t) {
    const o = {};
    for (const k of EDITABLE)
        o[k] = t[k];
    return o;
}
function TaskPanel({ id, onClose }) {
    const app = (0, store_1.useApp)();
    const [task, setTask] = (0, react_1.useState)(null);
    const [draft, setDraft] = (0, react_1.useState)({});
    const [error, setError] = (0, react_1.useState)("");
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [open, setOpen] = (0, react_1.useState)("basico");
    const [allTasks, setAllTasks] = (0, react_1.useState)([]);
    const load = () => api_1.api.get(`/api/tasks/${id}`).then((t) => { setTask(t); setDraft(pick(t)); setError(""); }, (e) => setError(e.message));
    (0, react_1.useEffect)(() => { void load(); }, [id]);
    (0, react_1.useEffect)(() => { api_1.api.get("/api/tasks?include_backlog=1").then(setAllTasks, () => undefined); }, [id, app.dataVersion]);
    const dirtyKeys = (0, react_1.useMemo)(() => task ? EDITABLE.filter((k) => JSON.stringify(draft[k] ?? null) !== JSON.stringify(task[k] ?? null)) : [], [draft, task]);
    (0, react_1.useEffect)(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                void save();
            }
            if (e.key === "Escape" && !document.querySelector(".modal")) {
                if (dirtyKeys.length && !window.confirm("Hay cambios sin guardar en la tarea. ¿Cerrar sin guardar?"))
                    return;
                onClose();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });
    if (!task)
        return (0, jsx_runtime_1.jsxs)("aside", { className: "panel", "aria-label": "Detalle de tarea", children: [(0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error, onRetry: load }), !error && (0, jsx_runtime_1.jsx)("p", { className: "muted pad", children: "Cargando\u2026" })] });
    const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
    const after = (t, msg) => {
        if (!t)
            return;
        // conserva los cambios del borrador que no tocaba esta acción
        setTask(t);
        setDraft((d) => { const base = pick(t); for (const k of dirtyKeys)
            base[k] = d[k]; return base; });
        app.changed();
        if (msg)
            app.toast(msg, "ok");
    };
    const run = async (fn, msg) => {
        setError("");
        try {
            after(await fn(), msg);
            return true;
        }
        catch (e) {
            setError(e.message);
            return false;
        }
    };
    async function save() {
        if (!task || !dirtyKeys.length)
            return;
        const body = {};
        for (const k of dirtyKeys)
            body[k] = draft[k] === "" && !KEEP_EMPTY_STRING.has(k) ? null : draft[k];
        if (typeof body.title === "string" && !body.title.trim()) {
            setError("El título es obligatorio");
            return;
        }
        setSaving(true);
        setError("");
        try {
            const t = await patchTask(task.id, body);
            if (t) {
                setTask(t);
                setDraft(pick(t));
                app.changed();
                app.toast("Tarea guardada", "ok");
            }
        }
        catch (e) {
            setError(e.message);
        }
        setSaving(false);
    }
    const quick = (body, msg) => run(() => patchTask(task.id, body), msg);
    const setTags = async (tags) => {
        if (await run(() => api_1.api.patch(`/api/tasks/${task.id}`, { tags })))
            await app.reloadBoot();
    };
    const groupings = app.boot.groupings.filter((g) => g.project_id === draft.project_id);
    const deps = allTasks.filter((t) => t.id !== task.id);
    const acc = { open, setOpen };
    return ((0, jsx_runtime_1.jsxs)("aside", { className: "panel", "aria-label": `Detalle de la tarea ${task.title}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-head", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grow", children: [task.parent_id && (0, jsx_runtime_1.jsxs)("p", { className: "parent-line", children: ["\u21B3 Subtarea de ", (0, jsx_runtime_1.jsxs)("button", { className: "linklike", onClick: () => app.openTask(task.parent_id), children: ["\u00AB", task.parent_title, "\u00BB"] }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => quick({ parent_id: null }, "Ya no es subtarea"), title: "Convertir en tarea independiente", children: "Independizar" })] }), (0, jsx_runtime_1.jsx)(ui_1.AutoText, { className: "title-input autotext", "aria-label": "T\u00EDtulo", value: draft.title, maxRows: 4, onChange: (v) => set("title", v.replace(/\n/g, " ")) })] }), (0, jsx_runtime_1.jsx)("button", { className: "ghost", onClick: () => { if (!dirtyKeys.length || window.confirm("Hay cambios sin guardar. ¿Cerrar sin guardar?"))
                            onClose(); }, "aria-label": "Cerrar detalle (Esc)", children: "\u2715" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "panel-bar", children: [(0, jsx_runtime_1.jsxs)("label", { className: "inline", children: ["Estado ", (0, jsx_runtime_1.jsx)("select", { value: task.status, onChange: (e) => quick({ status: e.target.value }, "Estado actualizado"), children: labels_1.STATUS_ORDER.map((s) => (0, jsx_runtime_1.jsx)("option", { value: s, children: labels_1.STATUS[s] }, s)) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "inline", children: ["Prioridad ", (0, jsx_runtime_1.jsx)("select", { value: task.priority, onChange: (e) => quick({ priority: e.target.value }, "Prioridad actualizada"), children: Object.entries(labels_1.PRIORITY).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k)) })] }), task.status === "backlog" && (0, jsx_runtime_1.jsx)("button", { onClick: () => quick({ status: "pendiente" }, "Promovida a Pendiente"), children: "Promover a Pendiente" }), task.condition && (0, jsx_runtime_1.jsx)(ui_1.Chip, { tone: task.condition === "bloqueada" ? "danger" : "warn", children: labels_1.CONDITION[task.condition] }), task.recurrence && (0, jsx_runtime_1.jsx)(ui_1.Chip, { title: (0, labels_1.describeRule)(task.recurrence), children: "\u21BB recurrente" }), task.archived && (0, jsx_runtime_1.jsx)(ui_1.Chip, { children: "Archivada" })] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error }), (0, jsx_runtime_1.jsxs)("div", { className: "panel-body", children: [(0, jsx_runtime_1.jsxs)(ui_1.AccItem, { id: "basico", title: "B\u00E1sico", ...acc, children: [(0, jsx_runtime_1.jsx)(DescriptionField, { value: draft.description || "", onChange: (v) => set("description", v) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid2", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Proyecto", children: (0, jsx_runtime_1.jsx)(ui_1.ProjectSelect, { value: draft.project_id, onChange: (v) => setDraft((d) => ({ ...d, project_id: v, workstream_id: null, phase_id: null, deliverable_id: null })) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Tipo", children: (0, jsx_runtime_1.jsx)("select", { value: draft.kind, onChange: (e) => set("kind", e.target.value), children: Object.entries(labels_1.KIND).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k)) }) }), ["linea", "fase", "entregable"].map((kind) => {
                                        const opts = groupings.filter((g) => g.kind === kind);
                                        if (!opts.length)
                                            return null;
                                        const key = kind === "linea" ? "workstream_id" : kind === "fase" ? "phase_id" : "deliverable_id";
                                        return (0, jsx_runtime_1.jsx)(ui_1.Field, { label: kind === "linea" ? "Línea de trabajo" : kind === "fase" ? "Fase" : "Entregable", children: (0, jsx_runtime_1.jsxs)("select", { value: draft[key] ?? "", onChange: (e) => set(key, e.target.value ? Number(e.target.value) : null), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "\u2014" }), opts.map((g) => (0, jsx_runtime_1.jsx)("option", { value: g.id, children: g.name }, g.id))] }) }, kind);
                                    }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Responsable de ejecuci\u00F3n", children: (0, jsx_runtime_1.jsx)(ui_1.PersonSelect, { value: draft.assignee_id, onChange: (v) => set("assignee_id", v) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Persona revisora", children: (0, jsx_runtime_1.jsx)(ui_1.PersonSelect, { value: draft.reviewer_id, onChange: (v) => set("reviewer_id", v), emptyLabel: "Sin revisor" }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Fecha l\u00EDmite", children: (0, jsx_runtime_1.jsx)("input", { type: "date", value: draft.due_date || "", onChange: (e) => set("due_date", e.target.value || null) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Fecha planificada", children: (0, jsx_runtime_1.jsx)("input", { type: "date", value: draft.planned_date || "", onChange: (e) => set("planned_date", e.target.value || null) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Esfuerzo estimado (h)", hint: "Vac\u00EDo = no informado (no cuenta como 0)", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", step: "0.5", value: draft.estimate_hours ?? "", onChange: (e) => set("estimate_hours", e.target.value === "" ? null : Number(e.target.value)) }) })] }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Etiquetas", hint: "Se guardan al momento. Gestiona (renombrar/eliminar) en Configuraci\u00F3n.", children: (0, jsx_runtime_1.jsx)(ui_1.TagPicker, { value: task.tags, onChange: setTags }) })] }), (0, jsx_runtime_1.jsx)(ui_1.AccItem, { id: "pasos", title: "Pasos y subtareas", badge: (task.steps_total + task.subtasks.length) > 0 ? (0, jsx_runtime_1.jsxs)("span", { className: "count", children: ["(", task.steps_done, "/", task.steps_total, " pasos \u00B7 ", task.subtasks.length, " subtareas)"] }) : null, ...acc, children: (0, jsx_runtime_1.jsx)(StepsAndSubtasks, { task: task, run: run, reload: load }) }), (0, jsx_runtime_1.jsxs)(ui_1.AccItem, { id: "espera", title: "Espera o bloqueo", badge: task.condition ? (0, jsx_runtime_1.jsx)(ui_1.Chip, { tone: task.condition === "bloqueada" ? "danger" : "warn", children: labels_1.CONDITION[task.condition] }) : null, ...acc, children: [(0, jsx_runtime_1.jsxs)("p", { className: "hint", children: ["Condici\u00F3n adicional: la tarea conserva su estado (", labels_1.STATUS[task.status], ")."] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid2", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Condici\u00F3n", children: (0, jsx_runtime_1.jsxs)("select", { value: draft.condition ?? "", onChange: (e) => set("condition", e.target.value || null), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Ninguna" }), (0, jsx_runtime_1.jsx)("option", { value: "espera", children: "En espera" }), (0, jsx_runtime_1.jsx)("option", { value: "bloqueada", children: "Bloqueada" })] }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Depende de (persona del equipo)", children: (0, jsx_runtime_1.jsx)(ui_1.PersonSelect, { value: draft.wait_on_person_id, onChange: (v) => set("wait_on_person_id", v), emptyLabel: "\u2014" }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Depende de (tercero)", children: (0, jsx_runtime_1.jsx)("input", { value: draft.wait_on, onChange: (e) => set("wait_on", e.target.value), placeholder: "p. ej. sistemas del cliente" }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Fecha de seguimiento", children: (0, jsx_runtime_1.jsx)("input", { type: "datetime-local", value: (0, dates_1.utcToZonedInput)(draft.follow_up_at, app.tz), onChange: (e) => set("follow_up_at", e.target.value ? (0, dates_1.zonedToUtc)(e.target.value, app.tz) : null) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Recordar seguimiento cada (d\u00EDas)", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", value: draft.follow_up_every_days ?? "", onChange: (e) => set("follow_up_every_days", e.target.value ? Number(e.target.value) : null) }) })] }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Motivo", children: (0, jsx_runtime_1.jsx)(ui_1.AutoText, { value: draft.wait_reason, minRows: 2, onChange: (v) => set("wait_reason", v), placeholder: "Qu\u00E9 falta y por qu\u00E9" }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Pr\u00F3xima acci\u00F3n", children: (0, jsx_runtime_1.jsx)(ui_1.AutoText, { value: draft.wait_next_action, minRows: 2, onChange: (v) => set("wait_next_action", v), placeholder: "Qu\u00E9 har\u00E1s para desbloquearlo" }) }), task.condition && (0, jsx_runtime_1.jsx)(FollowUp, { task: task, run: run, quick: quick })] }), (0, jsx_runtime_1.jsxs)(ui_1.AccItem, { id: "tiempos", title: "Tiempos, revisiones y recordatorios", ...acc, children: [(0, jsx_runtime_1.jsxs)("dl", { className: "facts", children: [(0, jsx_runtime_1.jsx)("dt", { children: "Tiempo desde el inicio" }), (0, jsx_runtime_1.jsxs)("dd", { children: [(0, dates_1.elapsedSinceStart)(task.started_at, task.completed_at), " ", (0, jsx_runtime_1.jsx)("span", { className: "hint", children: "(no equivale a dedicaci\u00F3n ni a horas trabajadas)" })] }), (0, jsx_runtime_1.jsx)("dt", { children: "\u00DAltima actualizaci\u00F3n significativa" }), (0, jsx_runtime_1.jsxs)("dd", { children: [(0, dates_1.sinceLabel)(task.last_significant_update), " \u00B7 ", (0, dates_1.fmtDateTime)(task.last_significant_update, app.tz)] }), (0, jsx_runtime_1.jsx)("dt", { children: "Inicio real" }), (0, jsx_runtime_1.jsx)("dd", { children: task.started_at ? (0, dates_1.fmtDateTime)(task.started_at, app.tz) : "no informado" }), (0, jsx_runtime_1.jsx)("dt", { children: "Finalizaci\u00F3n" }), (0, jsx_runtime_1.jsx)("dd", { children: task.completed_at ? (0, dates_1.fmtDateTime)(task.completed_at, app.tz) : "—" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid2", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Revisar en fecha y hora", children: (0, jsx_runtime_1.jsx)("input", { type: "datetime-local", value: (0, dates_1.utcToZonedInput)(draft.next_review_at, app.tz), onChange: (e) => set("next_review_at", e.target.value ? (0, dates_1.zonedToUtc)(e.target.value, app.tz) : null) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Revisar tras (h) desde el inicio", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", value: draft.review_after_start_hours ?? "", onChange: (e) => set("review_after_start_hours", e.target.value ? Number(e.target.value) : null) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Revisar tras (h) sin actualizaci\u00F3n", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", value: draft.review_after_idle_hours ?? "", onChange: (e) => set("review_after_idle_hours", e.target.value ? Number(e.target.value) : null) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "C\u00F3mputo de esas horas", hint: `Laborables: ${app.boot.settings.work_start}–${app.boot.settings.work_end}, días y festivos registrados`, children: (0, jsx_runtime_1.jsxs)("select", { value: draft.review_hours_mode, onChange: (e) => set("review_hours_mode", e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "natural", children: "Tiempo natural" }), (0, jsx_runtime_1.jsx)("option", { value: "laborable", children: "Horas laborables" })] }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Inicio real (corregir)", children: (0, jsx_runtime_1.jsx)("input", { type: "datetime-local", value: (0, dates_1.utcToZonedInput)(draft.started_at, app.tz), onChange: (e) => set("started_at", e.target.value ? (0, dates_1.zonedToUtc)(e.target.value, app.tz) : null) }) })] }), (0, jsx_runtime_1.jsxs)("p", { className: "hint", children: ["Zona horaria: ", app.tz, ". Abrir o consultar la tarea no reinicia ning\u00FAn contador."] }), (0, jsx_runtime_1.jsx)("h4", { children: "Recordatorio puntual" }), (0, jsx_runtime_1.jsx)(ReminderForm_1.ReminderForm, { taskId: task.id, defaultTitle: task.wait_on ? `Contactar con ${task.wait_on}` : "" })] }), (0, jsx_runtime_1.jsx)(ui_1.AccItem, { id: "repeticion", title: "Repetici\u00F3n", badge: task.recurrence ? (0, jsx_runtime_1.jsxs)("span", { className: "count", children: ["(", (0, labels_1.describeRule)(task.recurrence), ")"] }) : null, ...acc, children: (0, jsx_runtime_1.jsx)(Repetition, { task: task, run: run }) }), (0, jsx_runtime_1.jsx)(ui_1.AccItem, { id: "aprobacion", title: "Aprobaci\u00F3n comercial", badge: task.approval !== "no_requerida" ? (0, jsx_runtime_1.jsx)(ui_1.Chip, { tone: task.approval === "aprobada" ? "neutral" : "warn", children: labels_1.APPROVAL[task.approval] }) : null, ...acc, children: (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Aprobaci\u00F3n (independiente del estado de ejecuci\u00F3n)", hint: "Puedes preparar el an\u00E1lisis antes; al iniciar la ejecuci\u00F3n sin aprobaci\u00F3n se pide confirmaci\u00F3n.", children: (0, jsx_runtime_1.jsx)("select", { value: draft.approval, onChange: (e) => set("approval", e.target.value), children: Object.entries(labels_1.APPROVAL).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k)) }) }) }), (0, jsx_runtime_1.jsxs)(ui_1.AccItem, { id: "dependencias", title: "Dependencias", badge: task.blocked_by.length + task.blocks.length ? (0, jsx_runtime_1.jsxs)("span", { className: "count", children: ["(", task.blocked_by.length, " de las que depende \u00B7 bloquea ", task.blocks.length, ")"] }) : null, ...acc, children: [(0, jsx_runtime_1.jsx)("h4", { children: "Esta tarea depende de" }), task.blocked_by.length === 0 && (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Ninguna" }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: task.blocked_by.map((d) => ((0, jsx_runtime_1.jsxs)("li", { className: "ref-row", children: [(0, jsx_runtime_1.jsx)(TaskRefLabel, { t: d }), d.assignee_id === app.meId && d.status !== "hecha" && (0, jsx_runtime_1.jsx)(ui_1.Chip, { tone: "info", children: "pendiente de m\u00ED" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => run(() => api_1.api.del(`/api/tasks/${task.id}/dependencies/${d.id}`)), children: "Quitar" })] }, d.id))) }), (0, jsx_runtime_1.jsx)(ui_1.TaskPicker, { tasks: deps, exclude: task.blocked_by.map((d) => d.id), placeholder: "A\u00F1adir dependencia: buscar tarea\u2026", onPick: (depId) => run(() => api_1.api.post(`/api/tasks/${task.id}/dependencies`, { depends_on_id: depId }), "Dependencia añadida") }), (0, jsx_runtime_1.jsx)("h4", { children: "Bloquea a" }), task.blocks.length === 0 ? (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Ninguna tarea depende de esta" }) :
                                (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: task.blocks.map((d) => (0, jsx_runtime_1.jsx)("li", { className: "ref-row", children: (0, jsx_runtime_1.jsx)(TaskRefLabel, { t: d }) }, d.id)) })] }), (0, jsx_runtime_1.jsxs)(ui_1.AccItem, { id: "notas", title: "Notas vinculadas", badge: task.notes.length ? (0, jsx_runtime_1.jsxs)("span", { className: "count", children: ["(", task.notes.length, ")"] }) : null, ...acc, children: [task.notes.length === 0 && (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Sin notas vinculadas" }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: task.notes.map((n) => (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.navigate(`#/notas/${n.id}`), children: n.display_title }), n.excerpt && (0, jsx_runtime_1.jsx)("blockquote", { className: "excerpt", children: n.excerpt })] }, n.id)) }), (0, jsx_runtime_1.jsx)("button", { onClick: async () => {
                                    try {
                                        const n = await api_1.api.post("/api/notes", { task_id: task.id });
                                        app.changed();
                                        app.navigate(`#/notas/${n.id}`);
                                    }
                                    catch (e) {
                                        setError(e.message);
                                    }
                                }, children: "+ Nueva nota vinculada" })] }), (0, jsx_runtime_1.jsxs)(ui_1.AccItem, { id: "enlaces", title: "Enlaces", badge: task.links.length ? (0, jsx_runtime_1.jsxs)("span", { className: "count", children: ["(", task.links.length, ")"] }) : null, ...acc, children: [(0, jsx_runtime_1.jsx)(ui_1.LinksEditor, { value: draft.links || [], onChange: (v) => set("links", v) }), (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Solo enlaces a los archivos y recursos originales; no se almacenan adjuntos." })] }), task.estimate_hours !== null && ((0, jsx_runtime_1.jsx)(ui_1.AccItem, { id: "reparto", title: "Repartir esfuerzo entre semanas (opcional)", ...acc, children: (0, jsx_runtime_1.jsx)(Allocation, { task: task, run: run }) })), (0, jsx_runtime_1.jsx)(ui_1.AccItem, { id: "historial", title: "Historial y actualizaciones", ...acc, children: (0, jsx_runtime_1.jsx)(History, { task: task, run: run }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "panel-foot", children: [(0, jsx_runtime_1.jsx)("button", { className: "primary", disabled: !dirtyKeys.length || saving, onClick: save, children: saving ? "Guardando…" : dirtyKeys.length ? `Guardar cambios (${dirtyKeys.length})` : "Sin cambios" }), dirtyKeys.length > 0 && (0, jsx_runtime_1.jsx)("button", { onClick: () => setDraft(pick(task)), children: "Descartar" }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), task.recurrence_id && task.status !== "hecha" && task.status !== "cancelada" &&
                        (0, jsx_runtime_1.jsx)("button", { onClick: () => run(() => api_1.api.post(`/api/tasks/${task.id}/skip`), "Ocurrencia saltada"), children: "Saltar ocurrencia" }), task.status !== "cancelada" && (0, jsx_runtime_1.jsx)("button", { onClick: () => quick({ status: "cancelada" }, "Tarea cancelada"), children: "Cancelar tarea" }), !task.archived ? (0, jsx_runtime_1.jsx)("button", { onClick: () => quick({ archived: true }, "Tarea archivada (Trabajo → Archivadas)"), children: "Archivar" }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => quick({ archived: false }, "Tarea restaurada"), children: "Restaurar" }), (0, jsx_runtime_1.jsx)("button", { className: "danger", onClick: async () => {
                                    if (!window.confirm("¿Eliminar definitivamente esta tarea? No se puede deshacer."))
                                        return;
                                    try {
                                        await api_1.api.del(`/api/tasks/${task.id}`);
                                        app.changed();
                                        onClose();
                                        app.toast("Tarea eliminada", "ok");
                                    }
                                    catch (e) {
                                        setError(e.message);
                                    }
                                }, children: "Eliminar definitivamente" })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "hint pad", children: "Ctrl+S guarda \u00B7 Esc cierra" })] }));
}
function TaskRefLabel({ t }) {
    const app = (0, store_1.useApp)();
    return (0, jsx_runtime_1.jsxs)("span", { className: "ref", children: [(0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.openTask(t.id), children: t.title }), (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [" \u00B7 ", [app.project(t.project_id)?.name, labels_1.STATUS[t.status], app.person(t.assignee_id)?.name].filter(Boolean).join(" · ")] })] });
}
function DescriptionField({ value, onChange }) {
    const [preview, setPreview] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "field", children: [(0, jsx_runtime_1.jsxs)("div", { className: "row tight", children: [(0, jsx_runtime_1.jsx)("span", { className: "field-label", children: "Descripci\u00F3n" }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => setPreview(!preview), "aria-pressed": preview, children: preview ? "Editar" : "Vista previa" })] }), preview ? (0, jsx_runtime_1.jsx)(markdown_1.Markdown, { text: value }) : (0, jsx_runtime_1.jsx)(ui_1.AutoText, { value: value, minRows: 3, maxRows: 14, onChange: onChange, "aria-label": "Descripci\u00F3n", placeholder: "Texto libre (admite Markdown)" })] }));
}
function StepsAndSubtasks({ task, run }) {
    const app = (0, store_1.useApp)();
    const [text, setText] = (0, react_1.useState)("");
    const addStep = async () => { if (text.trim() && await run(() => api_1.api.post(`/api/tasks/${task.id}/steps`, { text: text.trim() })))
        setText(""); };
    const addSub = async () => {
        if (!text.trim())
            return;
        try {
            const sub = await api_1.api.post("/api/tasks", { title: text.trim(), parent_id: task.id, project_id: task.project_id, assignee_id: task.assignee_id });
            setText("");
            app.changed();
            app.toast(`Subtarea creada: ${sub.title}`, "ok", { label: "Abrir", run: () => app.openTask(sub.id) });
            await run(() => api_1.api.get(`/api/tasks/${task.id}`));
        }
        catch (e) {
            app.toast(e.message, "error");
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("input", { className: "grow", "aria-label": "Nuevo paso o subtarea", placeholder: "Describe el paso o la subtarea\u2026", value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") {
                            e.preventDefault();
                            if (e.ctrlKey || e.metaKey)
                                void addSub();
                            else
                                void addStep();
                        } } }), (0, jsx_runtime_1.jsx)("button", { disabled: !text.trim(), onClick: addStep, title: "Enter", children: "A\u00F1adir paso" }), (0, jsx_runtime_1.jsx)("button", { disabled: !text.trim(), onClick: addSub, title: "Ctrl+Enter", children: "A\u00F1adir subtarea" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "hint", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Paso" }), ": casilla dentro de esta tarea (no aparece en tablero, lista ni calendario). ", (0, jsx_runtime_1.jsx)("strong", { children: "Subtarea" }), ": tarea completa con su responsable y fechas, visible en todas las vistas con la marca \u00AB\u21B3 Subtarea de\u2026\u00BB. Completar pasos o subtareas no completa esta tarea."] }), task.steps.length > 0 && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Pasos (", task.steps.filter((s) => s.done).length, "/", task.steps.length, ")"] }), (0, jsx_runtime_1.jsx)("ul", { className: "plain steps", children: task.steps.map((s) => ((0, jsx_runtime_1.jsxs)("li", { className: s.done ? "done" : "", children: [(0, jsx_runtime_1.jsxs)("label", { className: "check grow", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: s.done, onChange: (e) => run(() => api_1.api.patch(`/api/steps/${s.id}`, { done: e.target.checked })) }), (0, jsx_runtime_1.jsx)("span", { className: "step-text", children: s.text })] }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => { const v = window.prompt("Editar paso:", s.text); if (v?.trim())
                                        void run(() => api_1.api.patch(`/api/steps/${s.id}`, { text: v.trim() })); }, children: "Editar" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", title: "Convertir en subtarea completa", onClick: async () => {
                                        try {
                                            const sub = await api_1.api.post(`/api/steps/${s.id}/promote`);
                                            app.changed();
                                            app.toast(`Convertido en subtarea: ${sub.title}`, "ok");
                                            await run(() => api_1.api.get(`/api/tasks/${task.id}`));
                                        }
                                        catch (e) {
                                            app.toast(e.message, "error");
                                        }
                                    }, children: "\u2192 Subtarea" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", "aria-label": `Eliminar paso ${s.text}`, onClick: () => run(() => api_1.api.del(`/api/steps/${s.id}`)), children: "\u2715" })] }, s.id))) })] }), task.subtasks.length > 0 && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Subtareas (", task.subtasks.filter((s) => s.status === "hecha" || s.status === "cancelada").length, "/", task.subtasks.length, ")"] }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: task.subtasks.map((s) => ((0, jsx_runtime_1.jsxs)("li", { className: "ref-row", children: [(0, jsx_runtime_1.jsx)(TaskRefLabel, { t: s }), s.due_date && (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [" \u00B7 ", (0, dates_1.fmtDate)(s.due_date)] }), s.estimate_hours !== null && (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [" \u00B7 ", s.estimate_hours, " h"] })] }, s.id))) })] })] }));
}
function FollowUp({ task, run, quick }) {
    const app = (0, store_1.useApp)();
    const [text, setText] = (0, react_1.useState)("");
    return ((0, jsx_runtime_1.jsxs)("div", { className: "subtle-box", children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Desde: ", (0, dates_1.fmtDateTime)(task.wait_since, app.tz), " \u00B7 \u00DAltimo seguimiento: ", task.last_follow_up_at ? (0, dates_1.fmtDateTime)(task.last_follow_up_at, app.tz) : "ninguno registrado"] }), (0, jsx_runtime_1.jsx)(ui_1.AutoText, { value: text, onChange: setText, minRows: 1, "aria-label": "Nota del seguimiento", placeholder: "Nota del seguimiento (opcional)" }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("button", { onClick: async () => { if (await run(() => api_1.api.post(`/api/tasks/${task.id}/follow-up`, { text }), "Seguimiento registrado (la espera continúa)"))
                            setText(""); }, children: "Seguimiento realizado" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => quick({ condition: null }, "Espera/bloqueo resuelto"), children: "Marcar resuelto" })] }), (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "\u00ABRecordar contactar\u00BB no env\u00EDa nada: solo te lo recuerda." })] }));
}
function Repetition({ task, run }) {
    const app = (0, store_1.useApp)();
    const [rule, setRule] = (0, react_1.useState)((0, Recurrences_1.emptyRule)(task.due_date || (0, dates_1.todayIn)(app.tz)));
    if (task.recurrence) {
        const r = task.recurrence;
        return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: (0, labels_1.describeRule)(r) }), " \u00B7 desde ", (0, dates_1.fmtDate)(r.start_date), r.end_date ? ` hasta ${(0, dates_1.fmtDate)(r.end_date)}` : "", " \u00B7 ", r.active ? "activa" : "pausada"] }), (0, jsx_runtime_1.jsxs)("p", { className: "hint", children: ["Esta tarea es una ocurrencia de la serie (fecha ", (0, dates_1.fmtDate)(task.occurrence_date), "). Lo que cambies aqu\u00ED solo afecta a esta ocurrencia."] }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("button", { onClick: async () => { await api_1.api.patch(`/api/recurrences/${r.id}`, { active: !r.active }); await run(() => api_1.api.get(`/api/tasks/${task.id}`), r.active ? "Serie pausada: no se generarán más ocurrencias" : "Serie reactivada"); }, children: r.active ? "Pausar la serie" : "Reactivar la serie" }), (0, jsx_runtime_1.jsx)("button", { onClick: async () => {
                                const fields = { title: task.title, assignee_id: task.assignee_id, priority: task.priority, estimate_hours: task.estimate_hours, project_id: task.project_id };
                                if (!window.confirm("¿Aplicar título, responsable, proyecto, prioridad y estimación de esta tarea a la serie y a sus ocurrencias futuras pendientes?"))
                                    return;
                                await api_1.api.patch(`/api/recurrences/${r.id}`, { ...fields, apply_to_future: true });
                                await run(() => api_1.api.get(`/api/tasks/${task.id}`), "Aplicado a esta y a las futuras");
                            }, children: "Aplicar estos datos a las futuras" })] })] });
    }
    return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "hint", children: ["Convierte esta tarea en la primera de una serie. Las siguientes se crean solas (hasta ", app.boot.settings.recurrence_horizon_days, " d\u00EDas vista) con el mismo t\u00EDtulo, responsable, proyecto y prioridad."] }), (0, jsx_runtime_1.jsx)(Recurrences_1.RuleEditor, { value: rule, onChange: setRule }), (0, jsx_runtime_1.jsx)("button", { className: "primary", disabled: !(0, Recurrences_1.ruleIsValid)(rule), onClick: () => run(() => api_1.api.post(`/api/tasks/${task.id}/recurrence`, {
                    rule: rule.rule, weekdays: rule.rule === "semanal" ? rule.weekdays : [], interval_days: rule.rule === "cada_n_dias" ? rule.interval_days : null,
                    start_date: rule.start_date, end_date: rule.end_date, non_working: rule.non_working
                }), "La tarea ahora se repite"), children: "Hacer recurrente" })] });
}
function Allocation({ task, run }) {
    const app = (0, store_1.useApp)();
    const [week, setWeek] = (0, react_1.useState)((0, dates_1.weekStart)(task.planned_date || (0, dates_1.todayIn)(app.tz)));
    const [hours, setHours] = (0, react_1.useState)("");
    const assigned = task.allocations.reduce((a, b) => a + b.hours, 0);
    return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: "hint", children: ["Solo es \u00FAtil para tareas grandes que ocupan varias semanas. En la ", (0, jsx_runtime_1.jsx)("em", { children: "Planificaci\u00F3n semanal" }), " de Equipo, una tarea suma su estimaci\u00F3n completa (", task.estimate_hours, " h) en la semana de su fecha planificada. Si va a repartirse (p. ej. 30 h en 3 semanas), indica aqu\u00ED cu\u00E1ntas horas corresponden a cada semana y la planificaci\u00F3n usar\u00E1 esas cifras. Nada se reparte autom\u00E1ticamente."] }), task.allocations.length > 0 && (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: task.allocations.map((a) => (0, jsx_runtime_1.jsxs)("li", { children: ["Semana del ", (0, dates_1.fmtDate)(a.week_start), ": ", a.hours, " h", (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => run(() => api_1.api.put(`/api/tasks/${task.id}/allocations`, { week_start: a.week_start, hours: 0 })), children: "Quitar" })] }, a.week_start)) }), task.allocations.length > 0 && (0, jsx_runtime_1.jsxs)("p", { className: "muted small", children: ["Repartidas ", assigned, " h de ", task.estimate_hours, " h estimadas."] }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsxs)("label", { className: "inline", children: ["Semana del ", (0, jsx_runtime_1.jsx)("input", { type: "date", value: week, onChange: (e) => setWeek(e.target.value ? (0, dates_1.weekStart)(e.target.value) : "") })] }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", step: "0.5", "aria-label": "Horas", placeholder: "horas", value: hours, onChange: (e) => setHours(e.target.value) }), (0, jsx_runtime_1.jsx)("button", { disabled: !week || hours === "", onClick: async () => { if (await run(() => api_1.api.put(`/api/tasks/${task.id}/allocations`, { week_start: week, hours: Number(hours) })))
                            setHours(""); }, children: "Guardar" })] })] });
}
function History({ task, run }) {
    const app = (0, store_1.useApp)();
    const [text, setText] = (0, react_1.useState)("");
    const [editing, setEditing] = (0, react_1.useState)(null);
    const add = async () => { if (text.trim() && await run(() => api_1.api.post(`/api/tasks/${task.id}/update`, { text: text.trim() }), "Actualización registrada"))
        setText(""); };
    const saveEdit = async () => { if (editing && editing.text.trim() && await run(() => api_1.api.patch(`/api/tasks/${task.id}/history/${editing.id}`, { text: editing.text.trim() }), "Actualización corregida"))
        setEditing(null); };
    const kindLabel = (h) => h.kind === "actualizacion" ? "Nota" : h.kind === "seguimiento" ? "Seguimiento" : "Auto";
    return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ui_1.AutoText, { value: text, onChange: setText, minRows: 3, maxRows: 12, "aria-label": "Registrar actualizaci\u00F3n", placeholder: "Qu\u00E9 se ha hecho, qu\u00E9 ha cambiado o una nota personal (cuenta como actualizaci\u00F3n significativa). Ctrl+Enter para registrar.", onKeyDown: (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    void add();
                } } }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("button", { disabled: !text.trim(), onClick: add, children: "Registrar actualizaci\u00F3n" }), (0, jsx_runtime_1.jsx)("span", { className: "hint", children: "Tus notas se pueden editar; los cambios autom\u00E1ticos no (sirven de registro)." })] }), (0, jsx_runtime_1.jsx)("ul", { className: "history", children: task.history.map((h) => ((0, jsx_runtime_1.jsxs)("li", { className: `h-${h.kind}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "h-meta", children: [(0, jsx_runtime_1.jsx)("span", { className: `h-kind h-kind-${h.kind}`, children: kindLabel(h) }), " ", (0, jsx_runtime_1.jsx)("time", { children: (0, dates_1.fmtDateTime)(h.at, app.tz) }), h.edited_at && (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [" \u00B7 editada ", (0, dates_1.fmtDateTime)(h.edited_at, app.tz)] }), h.editable && editing?.id !== h.id && (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => setEditing({ id: h.id, text: h.text }), children: "Editar" })] }), editing?.id === h.id ? (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ui_1.AutoText, { value: editing.text, onChange: (v) => setEditing({ id: h.id, text: v }), minRows: 2, maxRows: 12, "aria-label": "Editar actualizaci\u00F3n", onKeyDown: (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                        e.preventDefault();
                                        void saveEdit();
                                    } if (e.key === "Escape") {
                                        e.stopPropagation();
                                        setEditing(null);
                                    } } }), (0, jsx_runtime_1.jsxs)("div", { className: "row tight", children: [(0, jsx_runtime_1.jsx)("button", { className: "small primary", onClick: saveEdit, children: "Guardar" }), (0, jsx_runtime_1.jsx)("button", { className: "small", onClick: () => setEditing(null), children: "Cancelar" })] })] }) : (0, jsx_runtime_1.jsx)("div", { className: "h-text", children: h.text })] }, h.id))) })] });
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/labels":12,"../lib/markdown":16,"../lib/store":9,"./Recurrences":11,"./ReminderForm":17,"./ui":13}]; // build/src/components/TaskPanel.js
defs[16]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMarkdown = renderMarkdown;
exports.Markdown = Markdown;
const jsx_runtime_1 = require("react/jsx-runtime");
const links_1 = require("./links");
let keySeq = 0;
const k = () => "md" + keySeq++;
function inline(text) {
    const out = [];
    const re = /(`[^`]+`)|(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))|(<?(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])>?)|(\*\*([^*]+)\*\*|__([^_]+)__)|(\*([^*\s][^*]*)\*|_([^_\s][^_]*)_)|(~~([^~]+)~~)/g;
    let last = 0;
    let m;
    while ((m = re.exec(text))) {
        if (m.index > last)
            out.push(text.slice(last, m.index));
        if (m[1])
            out.push((0, jsx_runtime_1.jsx)("code", { children: m[1].slice(1, -1) }, k()));
        else if (m[2])
            out.push((0, links_1.isSafeUrl)(m[4])
                ? (0, jsx_runtime_1.jsxs)("a", { ...(0, links_1.linkProps)(m[4]), title: m[4], children: ["[imagen: ", m[3] || "sin descripción", " \u2014 no se carga]"] }, k())
                : (0, jsx_runtime_1.jsxs)("span", { children: ["[imagen: ", m[3], "]"] }, k()));
        else if (m[5])
            out.push((0, links_1.isSafeUrl)(m[7])
                ? (0, jsx_runtime_1.jsx)("a", { ...(0, links_1.linkProps)(m[7]), title: m[7], children: inline(m[6]) }, k())
                : (0, jsx_runtime_1.jsxs)("span", { className: "unsafe-link", title: "Enlace bloqueado: esquema no permitido", children: [m[6], " [enlace bloqueado]"] }, k()));
        else if (m[8])
            out.push((0, jsx_runtime_1.jsx)("a", { ...(0, links_1.linkProps)(m[9]), children: m[9] }, k()));
        else if (m[10])
            out.push((0, jsx_runtime_1.jsx)("strong", { children: inline(m[11] ?? m[12]) }, k()));
        else if (m[13])
            out.push((0, jsx_runtime_1.jsx)("em", { children: inline(m[14] ?? m[15]) }, k()));
        else if (m[16])
            out.push((0, jsx_runtime_1.jsx)("del", { children: inline(m[17]) }, k()));
        last = re.lastIndex;
    }
    if (last < text.length)
        out.push(text.slice(last));
    return out;
}
const isTableSep = (l) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l);
const cells = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const startsTable = (lines, i) => lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]);
function renderMarkdown(src) {
    const lines = (src || "").replace(/\r\n?/g, "\n").split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (/^\s*```/.test(line)) {
            const buf = [];
            i++;
            while (i < lines.length && !/^\s*```/.test(lines[i]))
                buf.push(lines[i++]);
            i++;
            out.push((0, jsx_runtime_1.jsx)("pre", { children: (0, jsx_runtime_1.jsx)("code", { children: buf.join("\n") }) }, k()));
            continue;
        }
        if (!line.trim()) {
            i++;
            continue;
        }
        const h = /^(#{1,6})\s+(.*)$/.exec(line);
        if (h) {
            const Tag = ("h" + Math.min(h[1].length + 1, 6));
            out.push((0, jsx_runtime_1.jsx)(Tag, { children: inline(h[2]) }, k()));
            i++;
            continue;
        }
        if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
            out.push((0, jsx_runtime_1.jsx)("hr", {}, k()));
            i++;
            continue;
        }
        if (startsTable(lines, i)) {
            const head = cells(line);
            i += 2;
            const body = [];
            while (i < lines.length && lines[i].includes("|") && lines[i].trim())
                body.push(cells(lines[i++]));
            out.push((0, jsx_runtime_1.jsx)("div", { className: "md-table", children: (0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", { children: head.map((c) => (0, jsx_runtime_1.jsx)("th", { children: inline(c) }, k())) }) }), (0, jsx_runtime_1.jsx)("tbody", { children: body.map((r) => (0, jsx_runtime_1.jsx)("tr", { children: r.map((c) => (0, jsx_runtime_1.jsx)("td", { children: inline(c) }, k())) }, k())) })] }) }, k()));
            continue;
        }
        if (/^\s*>/.test(line)) {
            const buf = [];
            while (i < lines.length && /^\s*>/.test(lines[i]))
                buf.push(lines[i++].replace(/^\s*>\s?/, ""));
            out.push((0, jsx_runtime_1.jsx)("blockquote", { children: renderMarkdown(buf.join("\n")) }, k()));
            continue;
        }
        if (LIST_RE.test(line)) {
            const ordered = /^\s*\d/.test(line);
            const items = [];
            while (i < lines.length && LIST_RE.test(lines[i])) {
                const m = LIST_RE.exec(lines[i]);
                const task = /^\[([ xX])\]\s+(.*)$/.exec(m[3]);
                const content = task
                    ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { "aria-label": task[1].trim() ? "completado" : "pendiente", children: task[1].trim() ? "☑" : "☐" }), " ", inline(task[2])] })
                    : inline(m[3]);
                items.push((0, jsx_runtime_1.jsx)("li", { style: m[1].length ? { marginLeft: `${Math.min(m[1].length, 12) * 0.6}em` } : undefined, children: content }, k()));
                i++;
            }
            out.push(ordered ? (0, jsx_runtime_1.jsx)("ol", { children: items }, k()) : (0, jsx_runtime_1.jsx)("ul", { children: items }, k()));
            continue;
        }
        const buf = [];
        while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*```|\s*>)/.test(lines[i]) && !LIST_RE.test(lines[i]) && !startsTable(lines, i))
            buf.push(lines[i++]);
        if (!buf.length)
            buf.push(lines[i++]);
        out.push((0, jsx_runtime_1.jsx)("p", { children: buf.flatMap((b, j) => (j ? [(0, jsx_runtime_1.jsx)("br", {}, k()), ...inline(b)] : inline(b))) }, k()));
    }
    return out;
}
function Markdown({ text }) {
    return (0, jsx_runtime_1.jsx)("div", { className: "markdown", children: renderMarkdown(text) });
}

},{"react/jsx-runtime":1,"./links":14}]; // build/src/lib/markdown.js
defs[17]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderForm = ReminderForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const store_1 = require("../lib/store");
/** Recordatorio manual. «Recordar contactar» no envía nada: solo avisa dentro de la aplicación. */
function ReminderForm({ taskId, projectId, defaultTitle = "", onCreated }) {
    const app = (0, store_1.useApp)();
    const [title, setTitle] = (0, react_1.useState)(defaultTitle);
    const [when, setWhen] = (0, react_1.useState)((0, dates_1.addDays)((0, dates_1.todayIn)(app.tz), 1) + "T09:00");
    const [err, setErr] = (0, react_1.useState)("");
    const submit = async () => {
        try {
            await api_1.api.post("/api/reminders", { title: title.trim(), due_at: (0, dates_1.zonedToUtc)(when, app.tz), task_id: taskId ?? null, project_id: projectId ?? null });
            app.toast("Recordatorio programado", "ok");
            setErr("");
            onCreated?.();
            app.changed();
        }
        catch (e) {
            setErr(e.message);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("form", { className: "row", onSubmit: (e) => { e.preventDefault(); void submit(); }, children: [(0, jsx_runtime_1.jsx)("input", { className: "grow", "aria-label": "Texto del recordatorio", placeholder: "Recordarme\u2026 (p. ej. llamar a sistemas)", value: title, onChange: (e) => setTitle(e.target.value) }), (0, jsx_runtime_1.jsx)("input", { type: "datetime-local", "aria-label": `Fecha y hora (${app.tz})`, value: when, onChange: (e) => setWhen(e.target.value) }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !title.trim() || !when, children: "Programar" }), err && (0, jsx_runtime_1.jsx)("span", { className: "field-error", children: err })] }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/store":9}]; // build/src/components/ReminderForm.js
defs[18]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeSavers = void 0;
exports.NotesView = NotesView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const labels_1 = require("../lib/labels");
const markdown_1 = require("../lib/markdown");
const saver_1 = require("../lib/saver");
const store_1 = require("../lib/store");
const ui_1 = require("../components/ui");
const SCOPES = [["sin_clasificar", "Sin clasificar"], ["todas", "Todas"], ["fijadas", "Fijadas"], ["archivo", "Archivo"], ["papelera", "Papelera"]];
// Autoguardados activos, para avisar antes de cerrar la pestaña del navegador
exports.activeSavers = new Set();
function NotesView({ routeId }) {
    const app = (0, store_1.useApp)();
    const [scope, setScope] = (0, react_1.useState)("todas");
    const [kind, setKind] = (0, react_1.useState)("");
    const [tag, setTag] = (0, react_1.useState)("");
    const { data: list, error, reload } = (0, store_1.useApi)(`/api/notes?scope=${scope}${kind ? `&kind=${kind}` : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`);
    const [tabs, setTabs] = (0, react_1.useState)(null);
    const [titles, setTitles] = (0, react_1.useState)({});
    const [tabsError, setTabsError] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => { api_1.api.get("/api/session/note-tabs").then(setTabs, (e) => setTabsError(e.message)); }, []);
    (0, react_1.useEffect)(() => {
        if (!tabs || !routeId)
            return;
        if (!tabs.open.includes(routeId) || tabs.active !== routeId)
            persist({ open: tabs.open.includes(routeId) ? tabs.open : [...tabs.open, routeId], active: routeId });
    }, [routeId, tabs === null]);
    (0, react_1.useEffect)(() => {
        if (!tabs)
            return;
        for (const id of tabs.open.filter((x) => !(x in titles)))
            api_1.api.get(`/api/notes/${id}`).then((n) => setTitles((t) => ({ ...t, [id]: n.display_title })), () => undefined);
    }, [tabs?.open.join(",")]);
    function persist(next) {
        setTabs(next);
        api_1.api.put("/api/session/note-tabs", next).then(undefined, (e) => setTabsError("No se pudo guardar la sesión de pestañas: " + e.message));
    }
    const openNote = (id) => app.navigate(`#/notas/${id}`);
    const closeTab = (id) => {
        if (!tabs)
            return;
        const idx = tabs.open.indexOf(id);
        const open = tabs.open.filter((x) => x !== id);
        const active = tabs.active === id ? (open[idx] ?? open[idx - 1] ?? null) : tabs.active;
        persist({ open, active });
        app.navigate(active ? `#/notas/${active}` : "#/notas");
    };
    const moveTab = (id, dir) => {
        if (!tabs)
            return;
        const open = [...tabs.open];
        const i = open.indexOf(id), j = i + dir;
        if (j < 0 || j >= open.length)
            return;
        [open[i], open[j]] = [open[j], open[i]];
        persist({ ...tabs, open });
    };
    const active = routeId ?? tabs?.active ?? null;
    (0, react_1.useEffect)(() => {
        const onKey = (e) => { if (e.altKey && !e.ctrlKey && (e.key === "w" || e.key === "W") && active) {
            e.preventDefault();
            closeTab(active);
        } };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view notes-view", children: [(0, jsx_runtime_1.jsxs)("aside", { className: "notes-side", "aria-label": "Lista de notas", children: [(0, jsx_runtime_1.jsx)("button", { className: "primary block", onClick: () => app.newNote(), children: "Nueva nota (Alt+N)" }), (0, jsx_runtime_1.jsx)("div", { className: "scope-tabs", role: "tablist", "aria-label": "Bandejas", children: SCOPES.map(([k, label]) => (0, jsx_runtime_1.jsx)("button", { role: "tab", "aria-selected": scope === k, className: scope === k ? "active" : "", onClick: () => setScope(k), children: label }, k)) }), (0, jsx_runtime_1.jsxs)("div", { className: "row tight", children: [(0, jsx_runtime_1.jsxs)("select", { "aria-label": "Tipo de nota", value: kind, onChange: (e) => setKind(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Todos los tipos" }), Object.entries(labels_1.NOTE_KIND).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k))] }), (0, jsx_runtime_1.jsxs)("select", { "aria-label": "Etiqueta", value: tag, onChange: (e) => setTag(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Todas las etiquetas" }), app.boot.tags.map((t) => (0, jsx_runtime_1.jsxs)("option", { value: t, children: ["#", t] }, t))] })] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error, onRetry: reload }), list && !list.length && (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: scope === "papelera" ? "La papelera está vacía." : scope === "sin_clasificar" ? "No hay notas sin clasificar." : "Sin notas aquí. Crea una con Alt+N: no necesita título ni proyecto." }), (0, jsx_runtime_1.jsx)("ul", { className: "plain note-items", children: list?.map((n) => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsxs)("button", { className: "note-item" + (n.id === active ? " active" : ""), onClick: () => openNote(n.id), children: [(0, jsx_runtime_1.jsxs)("span", { className: "note-item-title", children: [n.pinned ? "📌 " : "", n.display_title] }), (0, jsx_runtime_1.jsxs)("span", { className: "note-item-meta", children: [(0, dates_1.fmtDate)(n.updated_at.slice(0, 10)), n.kind ? ` · ${labels_1.NOTE_KIND[n.kind]}` : "", n.project_id ? ` · ${app.project(n.project_id)?.name ?? ""}` : "", n.linked_tasks ? ` · ${n.linked_tasks} tarea(s)` : ""] }), (0, jsx_runtime_1.jsx)("span", { className: "note-item-excerpt", children: n.excerpt })] }) }, n.id))) })] }), (0, jsx_runtime_1.jsxs)("section", { className: "notes-main", children: [(0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: tabsError }), (0, jsx_runtime_1.jsx)("div", { className: "note-tabs", role: "tablist", "aria-label": "Notas abiertas", children: tabs?.open.map((id) => ((0, jsx_runtime_1.jsxs)("div", { className: "note-tab" + (id === active ? " active" : ""), role: "presentation", children: [(0, jsx_runtime_1.jsx)("button", { role: "tab", "aria-selected": id === active, onClick: () => openNote(id), title: `${titles[id] || ""} — Alt+←/→ para reordenar`, onKeyDown: (e) => { if (e.altKey && e.key === "ArrowLeft")
                                        moveTab(id, -1); if (e.altKey && e.key === "ArrowRight")
                                        moveTab(id, 1); }, children: titles[id] || "Nota" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", "aria-label": `Cerrar pestaña ${titles[id] || ""} (no borra la nota)`, title: "Cerrar pesta\u00F1a (Alt+W). La nota no se borra.", onClick: () => closeTab(id), children: "\u00D7" })] }, id))) }), active ? (0, jsx_runtime_1.jsx)(NoteEditor, { id: active, onTitle: (t) => setTitles((x) => ({ ...x, [active]: t })), onListChange: reload }, active)
                        : (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "Abre una nota de la lista o crea una nueva. Cerrar una pesta\u00F1a nunca borra ni archiva la nota." })] })] }));
}
const EMERGENCY = (id) => `kaosnt-nota-pendiente-${id}`;
function NoteEditor({ id, onTitle, onListChange }) {
    const app = (0, store_1.useApp)();
    const [note, setNote] = (0, react_1.useState)(null);
    const [text, setText] = (0, react_1.useState)("");
    const [state, setState] = (0, react_1.useState)("guardado");
    const [saveErr, setSaveErr] = (0, react_1.useState)("");
    const [loadErr, setLoadErr] = (0, react_1.useState)("");
    const [preview, setPreview] = (0, react_1.useState)(false);
    const [recovered, setRecovered] = (0, react_1.useState)(null);
    const [toTask, setToTask] = (0, react_1.useState)(null);
    const [tasks, setTasks] = (0, react_1.useState)([]);
    const saver = (0, react_1.useRef)(null);
    const area = (0, react_1.useRef)(null);
    const load = async () => {
        try {
            const n = await api_1.api.get(`/api/notes/${id}`);
            setNote(n);
            setText(n.content);
            onTitle(n.display_title);
            setLoadErr("");
            saver.current?.dispose();
            if (saver.current)
                exports.activeSavers.delete(saver.current);
            saver.current = new saver_1.NoteSaver(n.content, n.version, {
                save: async (content, base) => {
                    const r = await api_1.api.patch(`/api/notes/${id}`, { content, base_version: base });
                    setNote(r);
                    onTitle(r.display_title);
                    return { version: r.version };
                },
                onState: (s, err) => { setState(s); setSaveErr(err || ""); if (s === "guardado")
                    onListChange(); },
                emergency: {
                    put: (c) => { try {
                        localStorage.setItem(EMERGENCY(id), c);
                    }
                    catch { /* sin almacenamiento local */ } },
                    clear: () => { try {
                        localStorage.removeItem(EMERGENCY(id));
                    }
                    catch { /* */ } },
                },
            });
            exports.activeSavers.add(saver.current);
            try {
                const pending = localStorage.getItem(EMERGENCY(id));
                if (pending !== null && pending !== n.content)
                    setRecovered(pending);
            }
            catch { /* */ }
        }
        catch (e) {
            setLoadErr(e.message);
        }
    };
    (0, react_1.useEffect)(() => {
        void load();
        api_1.api.get("/api/tasks?include_backlog=1").then(setTasks, () => undefined);
        return () => { const s = saver.current; if (s) {
            void s.flush().finally(() => exports.activeSavers.delete(s));
            s.dispose();
        } };
    }, [id]);
    if (loadErr)
        return (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: loadErr, onRetry: load });
    if (!note)
        return (0, jsx_runtime_1.jsx)("p", { className: "muted pad", children: "Cargando\u2026" });
    const meta = async (body, msg) => {
        try {
            const r = await api_1.api.patch(`/api/notes/${id}`, body);
            setNote({ ...r, content: note.content });
            onTitle(r.display_title);
            onListChange();
            app.changed();
            if (msg)
                app.toast(msg, "ok");
            return true;
        }
        catch (e) {
            app.toast(e.message, "error");
            return false;
        }
    };
    function startToTask() {
        const ta = area.current;
        let sel = "";
        if (ta) {
            sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
            if (!sel.trim()) {
                const before = ta.value.lastIndexOf("\n", ta.selectionStart - 1) + 1;
                const after = ta.value.indexOf("\n", ta.selectionStart);
                sel = ta.value.slice(before, after === -1 ? undefined : after);
            }
        }
        const first = sel.split("\n").map((l) => l.replace(/^\s*([-*+]\s+(\[[ xX]\]\s+)?|\d+[.)]\s+|#+\s+)/, "").trim()).find(Boolean) || "";
        setToTask({ title: first.slice(0, 200), excerpt: sel.trim() });
    }
    const indicator = state === "guardado" && saver.current?.hasUnsaved ? "pendiente" : state;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "note-editor", onKeyDown: (e) => {
            if (e.altKey && !e.ctrlKey && e.shiftKey && (e.key === "T" || e.key === "t")) {
                e.preventDefault();
                startToTask();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                void saver.current?.flush();
            }
        }, children: [recovered !== null && (0, jsx_runtime_1.jsxs)("div", { className: "warn-box", role: "alert", children: ["Hay texto de esta nota que no lleg\u00F3 a guardarse en una sesi\u00F3n anterior.", (0, jsx_runtime_1.jsx)("button", { onClick: () => { setText(recovered); saver.current?.edit(recovered); setRecovered(null); }, children: "Recuperar ese texto" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost", onClick: () => { try {
                            localStorage.removeItem(EMERGENCY(id));
                        }
                        catch { /* */ } setRecovered(null); }, children: "Descartarlo" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "note-head", children: [(0, jsx_runtime_1.jsx)("input", { className: "title-input grow", "aria-label": "T\u00EDtulo manual (opcional)", placeholder: `${note.display_title} (título sugerido)`, defaultValue: note.title_manual || "", onBlur: (e) => { if ((e.target.value || null) !== (note.title_manual || null))
                            void meta({ title_manual: e.target.value }); } }, "t" + (note.title_manual || "")), (0, jsx_runtime_1.jsx)("span", { className: `save-state save-${indicator}`, role: "status", "aria-live": "polite", children: saver_1.SAVE_LABEL[indicator] }), (state === "error" || state === "conflicto") && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => saver.current?.retry(), children: "Reintentar" }), state === "conflicto" && (0, jsx_runtime_1.jsx)("button", { onClick: () => saver.current?.overwrite(), children: "Sobrescribir con mi texto" }), state === "conflicto" && (0, jsx_runtime_1.jsx)("button", { className: "ghost", onClick: () => { navigator.clipboard?.writeText(text).catch(() => undefined); app.toast("Tu texto se ha copiado al portapapeles", "info"); void load(); }, children: "Copiar mi texto y recargar" })] })] }), saveErr && (0, jsx_runtime_1.jsxs)("p", { className: "field-error", role: "alert", children: [saveErr, ". El texto sigue en el editor y en una copia de emergencia local."] }), (0, jsx_runtime_1.jsxs)("div", { className: "note-toolbar row", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Tipo ", (0, jsx_runtime_1.jsxs)("select", { value: note.kind || "", onChange: (e) => meta({ kind: e.target.value || null }), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Nota" }), Object.entries(labels_1.NOTE_KIND).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Proyecto ", (0, jsx_runtime_1.jsx)(ui_1.ProjectSelect, { value: note.project_id, onChange: (v) => meta({ project_id: v }, v ? "Nota vinculada al proyecto" : "Nota sin proyecto") })] }), (0, jsx_runtime_1.jsx)("button", { "aria-pressed": note.pinned, onClick: () => meta({ pinned: !note.pinned }), children: note.pinned ? "📌 Fijada" : "Fijar" }), (0, jsx_runtime_1.jsx)("button", { "aria-pressed": preview, onClick: () => setPreview(!preview), children: preview ? "Editar" : "Vista previa" }), (0, jsx_runtime_1.jsx)("button", { onClick: startToTask, title: "Alt+Shift+T", children: "Crear tarea desde selecci\u00F3n" }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), note.state === "activa" && (0, jsx_runtime_1.jsx)("button", { onClick: () => meta({ state: "archivada" }, "Nota archivada"), children: "Archivar" }), note.state !== "activa" && (0, jsx_runtime_1.jsx)("button", { onClick: () => meta({ state: "activa" }, "Nota restaurada"), children: "Restaurar" }), note.state !== "papelera" && (0, jsx_runtime_1.jsx)("button", { onClick: () => meta({ state: "papelera" }, "Nota enviada a la papelera (recuperable)"), children: "A la papelera" }), note.state === "papelera" && (0, jsx_runtime_1.jsx)("button", { className: "danger", onClick: async () => {
                            if (!window.confirm("¿Eliminar definitivamente esta nota? No se puede deshacer."))
                                return;
                            try {
                                await api_1.api.del(`/api/notes/${id}`);
                                app.toast("Nota eliminada", "ok");
                                onListChange();
                                app.navigate("#/notas");
                            }
                            catch (e) {
                                app.toast(e.message, "error");
                            }
                        }, children: "Eliminar definitivamente" })] }), note.state !== "activa" && (0, jsx_runtime_1.jsxs)("p", { className: "hint", children: ["Esta nota est\u00E1 ", note.state === "archivada" ? "archivada" : "en la papelera", "."] }), preview ? (0, jsx_runtime_1.jsx)("div", { className: "note-preview", children: (0, jsx_runtime_1.jsx)(markdown_1.Markdown, { text: text }) }) :
                (0, jsx_runtime_1.jsx)("textarea", { ref: area, className: "note-text", "aria-label": "Contenido de la nota", value: text, spellCheck: true, placeholder: "Escribe libremente. Se guarda solo. Admite Markdown (# t\u00EDtulos, - listas, ``` c\u00F3digo, | tablas |), pero no es necesario.", onChange: (e) => { setText(e.target.value); saver.current?.edit(e.target.value); }, onBlur: () => void saver.current?.flush() }), (0, jsx_runtime_1.jsxs)("div", { className: "note-foot", children: [(0, jsx_runtime_1.jsxs)("span", { className: "muted", children: ["Creada ", (0, dates_1.fmtDateTime)(note.created_at, app.tz), " \u00B7 Actualizada ", (0, dates_1.fmtDateTime)(note.updated_at, app.tz)] }), (0, jsx_runtime_1.jsxs)("div", { className: "note-tags", children: [(0, jsx_runtime_1.jsx)("span", { className: "field-label", children: "Etiquetas" }), (0, jsx_runtime_1.jsx)(ui_1.TagPicker, { value: note.tags, onChange: async (v) => { if (await meta({ tags: v }))
                                    await app.reloadBoot(); } })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "note-links", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Tareas vinculadas" }), note.tasks.length === 0 && (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Ninguna. Selecciona texto y usa \u00ABCrear tarea desde selecci\u00F3n\u00BB, o vincula una existente." }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: note.tasks.map((t) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.openTask(t.id), children: t.title }), " ", (0, jsx_runtime_1.jsx)(ui_1.Chip, { children: labels_1.STATUS[t.status] }), (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [" ", app.project(t.project_id)?.name || ""] }), t.excerpt && (0, jsx_runtime_1.jsx)("blockquote", { className: "excerpt", children: t.excerpt }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: async () => { await api_1.api.del(`/api/notes/${id}/links/${t.id}`); void load(); app.changed(); }, children: "Desvincular" })] }, t.id))) }), (0, jsx_runtime_1.jsx)(ui_1.TaskPicker, { tasks: tasks, exclude: note.tasks.map((t) => t.id), placeholder: "Vincular tarea existente: buscar por t\u00EDtulo\u2026", onPick: async (tid) => { await api_1.api.post(`/api/notes/${id}/links`, { task_id: tid }); void load(); app.changed(); } })] }), toTask && (0, jsx_runtime_1.jsx)(ToTaskDialog, { noteId: id, projectId: note.project_id, initial: toTask, onClose: () => setToTask(null), onDone: () => { setToTask(null); void load(); } })] }));
}
function ToTaskDialog({ noteId, projectId, initial, onClose, onDone }) {
    const app = (0, store_1.useApp)();
    const [title, setTitle] = (0, react_1.useState)(initial.title);
    const [project, setProject] = (0, react_1.useState)(projectId);
    const [assignee, setAssignee] = (0, react_1.useState)(null);
    const [due, setDue] = (0, react_1.useState)("");
    const [error, setError] = (0, react_1.useState)("");
    const submit = async () => {
        try {
            const t = await api_1.api.post(`/api/notes/${noteId}/to-task`, { title: title.trim(), excerpt: initial.excerpt, project_id: project, assignee_id: assignee, due_date: due || null });
            app.changed();
            app.toast(`Tarea creada y vinculada: ${t.title}`, "ok", { label: "Abrir", run: () => app.openTask(t.id) });
            onDone();
        }
        catch (e) {
            setError(e.message);
        }
    };
    return ((0, jsx_runtime_1.jsx)(ui_1.Modal, { title: "Crear tarea desde la nota", onClose: onClose, children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => { e.preventDefault(); void submit(); }, children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "T\u00EDtulo de la tarea", children: (0, jsx_runtime_1.jsx)("input", { value: title, onChange: (e) => setTitle(e.target.value), required: true }) }), initial.excerpt && (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Fragmento de referencia (la nota no se modifica)", children: (0, jsx_runtime_1.jsx)("blockquote", { className: "excerpt", children: initial.excerpt }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid2", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Proyecto", children: (0, jsx_runtime_1.jsx)(ui_1.ProjectSelect, { value: project, onChange: setProject }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Responsable", children: (0, jsx_runtime_1.jsx)(ui_1.PersonSelect, { value: assignee, onChange: setAssignee }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Fecha l\u00EDmite", children: (0, jsx_runtime_1.jsx)("input", { type: "date", value: due, onChange: (e) => setDue(e.target.value) }) })] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-foot", children: [(0, jsx_runtime_1.jsx)("button", { className: "primary", type: "submit", disabled: !title.trim(), children: "Crear tarea" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, children: "Cancelar" })] })] }) }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/labels":12,"../lib/markdown":16,"../lib/saver":19,"../lib/store":9,"../components/ui":13}]; // build/src/views/Notes.js
defs[19]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAVE_LABEL = exports.NoteSaver = void 0;
class NoteSaver {
    constructor(initial, version, o) {
        this.version = version;
        this.o = o;
        this.pending = null;
        this.timer = null;
        this.inflight = null;
        this.state = "guardado";
        this.lastError = "";
        this.serverVersion = null;
        this.confirmed = initial;
    }
    get text() { return this.pending ?? this.confirmed; }
    get hasUnsaved() { return this.pending !== null && this.pending !== this.confirmed; }
    set(s, err = "") { this.state = s; this.lastError = err; this.o.onState(s, err); }
    edit(content) {
        this.pending = content;
        if (this.state !== "guardando")
            this.set(this.state === "error" || this.state === "conflicto" ? this.state : "pendiente");
        this.schedule();
    }
    schedule() {
        const st = this.o.setTimer ?? ((f, ms) => setTimeout(f, ms));
        const ct = this.o.clearTimer ?? ((t) => clearTimeout(t));
        if (this.timer)
            ct(this.timer);
        this.timer = st(() => { this.timer = null; void this.flush(); }, this.o.delay ?? 700);
    }
    async flush(force = false) {
        if (this.inflight) {
            await this.inflight;
            if (this.state === "error" || this.state === "conflicto")
                return;
        }
        if (this.pending === null || (this.pending === this.confirmed && !force)) {
            if (this.pending === this.confirmed)
                this.pending = null;
            if (this.state !== "error" && this.state !== "conflicto")
                this.set("guardado");
            return;
        }
        const content = this.pending;
        this.set("guardando");
        this.inflight = (async () => {
            try {
                const r = await this.o.save(content, this.version);
                this.version = r.version;
                this.confirmed = content;
                if (this.pending === content)
                    this.pending = null;
                this.o.emergency?.clear();
                if (this.pending !== null) {
                    this.set("pendiente");
                    this.schedule();
                }
                else
                    this.set("guardado");
            }
            catch (e) {
                this.o.emergency?.put(content);
                const conflict = e?.code === "conflicto_version";
                if (conflict && typeof e?.extra?.server_version === "number")
                    this.serverVersion = e.extra.server_version;
                this.set(conflict ? "conflicto" : "error", e?.message || "Error al guardar");
            }
        })();
        try {
            await this.inflight;
        }
        finally {
            this.inflight = null;
        }
    }
    retry() { this.set("pendiente"); return this.flush(true); }
    overwrite() {
        if (this.serverVersion !== null)
            this.version = this.serverVersion;
        if (this.pending === null)
            this.pending = this.confirmed;
        this.set("pendiente");
        return this.flush(true);
    }
    dispose() { const ct = this.o.clearTimer ?? ((t) => clearTimeout(t)); if (this.timer)
        ct(this.timer); }
}
exports.NoteSaver = NoteSaver;
exports.SAVE_LABEL = {
    guardado: "Guardado", pendiente: "Cambios sin guardar…", guardando: "Guardando…",
    error: "Error al guardar — el texto se conserva", conflicto: "Conflicto: modificada en otra ventana",
};

},{}]; // build/src/lib/saver.js
defs[20]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsView = ProjectsView;
exports.ProjectDetail = ProjectDetail;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const labels_1 = require("../lib/labels");
const store_1 = require("../lib/store");
const TaskViews_1 = require("../components/TaskViews");
const ui_1 = require("../components/ui");
function ProjectsView() {
    const app = (0, store_1.useApp)();
    const [tab, setTab] = (0, react_1.useState)("proyectos");
    const [showAll, setShowAll] = (0, react_1.useState)(false);
    const [creating, setCreating] = (0, react_1.useState)(false);
    const { data, error, reload } = (0, store_1.useApi)(`/api/projects${showAll ? "?include_archived=true" : ""}`);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view", children: [(0, jsx_runtime_1.jsxs)("header", { className: "view-head row", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Proyectos" }), (0, jsx_runtime_1.jsxs)("div", { role: "tablist", className: "tabs-inline", "aria-label": "Proyectos o clientes", children: [(0, jsx_runtime_1.jsx)("button", { role: "tab", "aria-selected": tab === "proyectos", className: tab === "proyectos" ? "active" : "", onClick: () => setTab("proyectos"), children: "Proyectos" }), (0, jsx_runtime_1.jsx)("button", { role: "tab", "aria-selected": tab === "clientes", className: tab === "clientes" ? "active" : "", onClick: () => setTab("clientes"), children: "Clientes" })] }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), tab === "proyectos" && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: showAll, onChange: (e) => setShowAll(e.target.checked) }), " Incluir archivados"] }), (0, jsx_runtime_1.jsx)("button", { className: "primary", onClick: () => setCreating(true), children: "Nuevo proyecto" })] })] }), tab === "clientes" ? (0, jsx_runtime_1.jsx)(ClientsPanel, {}) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error, onRetry: reload }), data && !data.length && (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "A\u00FAn no hay proyectos. No son obligatorios: puedes capturar tareas y notas sin proyecto y vincularlas despu\u00E9s." }), (0, jsx_runtime_1.jsx)("div", { className: "project-grid", children: data?.map((p) => ((0, jsx_runtime_1.jsxs)("article", { className: `project-card status-${p.status}`, children: [(0, jsx_runtime_1.jsx)("button", { className: "linklike project-name", onClick: () => app.navigate(`#/proyectos/${p.id}`), children: p.name }), (0, jsx_runtime_1.jsxs)("div", { className: "card-meta", children: [(0, jsx_runtime_1.jsx)(ui_1.Chip, { children: (0, labels_1.projectTypeLabel)(p.type) }), p.status !== "activo" && (0, jsx_runtime_1.jsx)(ui_1.Chip, { children: labels_1.PROJECT_STATUS[p.status] }), p.health && (0, jsx_runtime_1.jsx)(ui_1.Chip, { tone: p.health === "bloqueado" ? "danger" : p.health === "atencion" ? "warn" : "neutral", children: labels_1.HEALTH[p.health] }), p.client_name && (0, jsx_runtime_1.jsx)("span", { className: "muted", children: p.client_name })] }), p.health_note && (0, jsx_runtime_1.jsx)("p", { className: "health-note", children: p.health_note }), (0, jsx_runtime_1.jsx)("p", { className: "clamp", children: p.summary || (0, jsx_runtime_1.jsx)("span", { className: "muted", children: "Sin resumen \u00ABD\u00F3nde lo dejamos\u00BB" }) }), p.next_action && (0, jsx_runtime_1.jsxs)("p", { className: "clamp", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Siguiente:" }), " ", p.next_action] }), (0, jsx_runtime_1.jsxs)("p", { className: "muted small", children: [p.open_tasks ?? 0, " tareas operativas \u00B7 ", p.conditioned_tasks ?? 0, " con espera/bloqueo \u00B7 resumen ", p.summary_updated_at ? (0, dates_1.sinceLabel)(p.summary_updated_at) : "no informado"] })] }, p.id))) })] }), creating && (0, jsx_runtime_1.jsx)(ProjectForm, { onClose: () => setCreating(false), onSaved: (id) => { setCreating(false); app.navigate(`#/proyectos/${id}`); } })] }));
}
/** Gestión de clientes: crear, renombrar y eliminar (los proyectos se conservan sin cliente). */
function ClientsPanel() {
    const app = (0, store_1.useApp)();
    const { data, error, reload } = (0, store_1.useApi)("/api/clients");
    const [name, setName] = (0, react_1.useState)("");
    const [edit, setEdit] = (0, react_1.useState)(null);
    const [err, setErr] = (0, react_1.useState)("");
    const call = async (fn) => { try {
        await fn();
        reload();
        await app.reloadBoot();
        app.changed();
        setErr("");
        return true;
    }
    catch (e) {
        setErr(e.message);
        return false;
    } };
    return ((0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Clientes", count: data?.length, children: [(0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Opcionales: un proyecto puede no tener cliente. Cambia el cliente de un proyecto desde su pantalla." }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error || err, onRetry: reload }), (0, jsx_runtime_1.jsxs)("form", { className: "row", onSubmit: async (e) => { e.preventDefault(); if (await call(() => api_1.api.post("/api/clients", { name: name.trim() })))
                    setName(""); }, children: [(0, jsx_runtime_1.jsx)("input", { className: "grow", "aria-label": "Nombre del nuevo cliente", placeholder: "Nombre del nuevo cliente", value: name, onChange: (e) => setName(e.target.value) }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !name.trim(), children: "A\u00F1adir cliente" })] }), data && !data.length && (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "Sin clientes registrados." }), (0, jsx_runtime_1.jsx)("ul", { className: "plain clients", children: data?.map((c) => ((0, jsx_runtime_1.jsx)("li", { className: "row", children: edit?.id === c.id ? (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("input", { className: "grow", "aria-label": "Nuevo nombre", value: edit.name, onChange: (e) => setEdit({ id: c.id, name: e.target.value }), onKeyDown: async (e) => { if (e.key === "Enter" && edit.name.trim()) {
                                    if (await call(() => api_1.api.patch(`/api/clients/${c.id}`, { name: edit.name.trim() })))
                                        setEdit(null);
                                } if (e.key === "Escape")
                                    setEdit(null); } }), (0, jsx_runtime_1.jsx)("button", { className: "small primary", disabled: !edit.name.trim(), onClick: async () => { if (await call(() => api_1.api.patch(`/api/clients/${c.id}`, { name: edit.name.trim() })))
                                    setEdit(null); }, children: "Guardar" }), (0, jsx_runtime_1.jsx)("button", { className: "small", onClick: () => setEdit(null), children: "Cancelar" })] }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("strong", { className: "grow", children: c.name }), (0, jsx_runtime_1.jsx)("span", { className: "muted small", children: c.projects ? `${c.projects} proyecto(s)` : "sin proyectos" }), (0, jsx_runtime_1.jsx)("button", { className: "small", onClick: () => setEdit({ id: c.id, name: c.name }), children: "Renombrar" }), (0, jsx_runtime_1.jsx)("button", { className: "small ghost", onClick: () => { if (window.confirm(`¿Eliminar el cliente «${c.name}»?${c.projects ? ` Sus ${c.projects} proyecto(s) se conservan, sin cliente.` : ""}`))
                                    void call(() => api_1.api.del(`/api/clients/${c.id}`)); }, children: "Eliminar" })] }) }, c.id))) })] }));
}
/** Selector de cliente con opción de crear uno nuevo en línea. */
function ClientPicker({ value, onChange }) {
    const app = (0, store_1.useApp)();
    const [creating, setCreating] = (0, react_1.useState)(false);
    const [name, setName] = (0, react_1.useState)("");
    if (creating)
        return (0, jsx_runtime_1.jsxs)("span", { className: "row tight", children: [(0, jsx_runtime_1.jsx)("input", { "aria-label": "Nombre del nuevo cliente", placeholder: "Nombre del cliente", value: name, autoFocus: true, onChange: (e) => setName(e.target.value), onKeyDown: (e) => { if (e.key === "Escape")
                        setCreating(false); } }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "small primary", disabled: !name.trim(), onClick: async () => {
                        try {
                            const c = await api_1.api.post("/api/clients", { name: name.trim() });
                            await app.reloadBoot();
                            onChange(c.id);
                            setCreating(false);
                            setName("");
                        }
                        catch (e) {
                            app.toast(e.message, "error");
                        }
                    }, children: "Crear" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "small", onClick: () => setCreating(false), children: "Cancelar" })] });
    return (0, jsx_runtime_1.jsxs)("select", { "aria-label": "Cliente", value: value ?? "", onChange: (e) => e.target.value === "nuevo" ? setCreating(true) : onChange(e.target.value ? Number(e.target.value) : null), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Sin cliente" }), app.boot.clients.map((c) => (0, jsx_runtime_1.jsx)("option", { value: c.id, children: c.name }, c.id)), (0, jsx_runtime_1.jsx)("option", { value: "nuevo", children: "+ Nuevo cliente\u2026" })] });
}
function ProjectForm({ onClose, onSaved }) {
    const app = (0, store_1.useApp)();
    const [name, setName] = (0, react_1.useState)("");
    const [type, setType] = (0, react_1.useState)("implementacion");
    const [clientId, setClientId] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)("");
    const submit = async () => {
        try {
            const p = await api_1.api.post("/api/projects", { name: name.trim(), type, client_id: clientId });
            await app.reloadBoot();
            app.changed();
            onSaved(p.id);
        }
        catch (e) {
            setError(e.message);
        }
    };
    return ((0, jsx_runtime_1.jsx)(ui_1.Modal, { title: "Nuevo proyecto", onClose: onClose, children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => { e.preventDefault(); void submit(); }, children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Nombre", children: (0, jsx_runtime_1.jsx)("input", { value: name, onChange: (e) => setName(e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Tipo", children: (0, jsx_runtime_1.jsx)("select", { value: type, onChange: (e) => setType(e.target.value), children: app.boot.settings.project_types.map((t) => (0, jsx_runtime_1.jsx)("option", { value: t, children: (0, labels_1.projectTypeLabel)(t) }, t)) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Cliente (opcional)", children: (0, jsx_runtime_1.jsx)(ClientPicker, { value: clientId, onChange: setClientId }) }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-foot", children: [(0, jsx_runtime_1.jsx)("button", { className: "primary", type: "submit", disabled: !name.trim(), children: "Crear" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, children: "Cancelar" })] })] }) }));
}
function ProjectDetail({ id }) {
    const app = (0, store_1.useApp)();
    const { data: p, error, reload } = (0, store_1.useApi)(`/api/projects/${id}`);
    const [showBacklog, setShowBacklog] = (0, react_1.useState)(false);
    const [showDone, setShowDone] = (0, react_1.useState)(false);
    const { data: tasks } = (0, store_1.useApi)(`/api/tasks?project_id=${id}${showBacklog ? "&include_backlog=1" : ""}${showDone ? "&include_closed=1" : ""}`);
    const { data: notes } = (0, store_1.useApi)(`/api/notes?project_id=${id}`);
    const [summary, setSummary] = (0, react_1.useState)("");
    const [groupBy, setGroupBy] = (0, react_1.useState)("linea");
    const [err, setErr] = (0, react_1.useState)("");
    const [ms, setMs] = (0, react_1.useState)({ kind: "hito", title: "", date: "" });
    const [grp, setGrp] = (0, react_1.useState)({ kind: "linea", name: "" });
    const [personToAdd, setPersonToAdd] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => { if (p)
        setSummary(p.summary); }, [p?.id, p?.summary]);
    if (!p)
        return (0, jsx_runtime_1.jsxs)("div", { className: "view", children: [(0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error, onRetry: reload }), !error && (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Cargando\u2026" })] });
    const patch = async (body, msg = "Proyecto actualizado") => {
        try {
            await api_1.api.patch(`/api/projects/${id}`, body);
            reload();
            await app.reloadBoot();
            app.toast(msg, "ok");
            setErr("");
        }
        catch (e) {
            setErr(e.message);
        }
    };
    const call = async (fn) => { try {
        await fn();
        reload();
        await app.reloadBoot();
        app.changed();
        setErr("");
    }
    catch (e) {
        setErr(e.message);
    } };
    const sig = p.signals;
    const pendingDecisions = p.milestones.filter((m) => m.kind === "decision" && m.status === "pendiente");
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view project", children: [(0, jsx_runtime_1.jsxs)("header", { className: "view-head", children: [(0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.navigate("#/proyectos"), children: "\u2190 Proyectos" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("h1", { className: "wrap", children: p.name }), (0, jsx_runtime_1.jsx)(ui_1.Chip, { children: (0, labels_1.projectTypeLabel)(p.type) }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { const n = window.prompt("Nuevo nombre del proyecto:", p.name); if (n?.trim())
                                    void patch({ name: n.trim() }); }, children: "Renombrar" }), (0, jsx_runtime_1.jsx)("a", { className: "button", href: `/api/export/project/${p.id}`, download: true, children: "Exportar proyecto" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Cliente ", (0, jsx_runtime_1.jsx)(ClientPicker, { value: p.client_id, onChange: (v) => patch({ client_id: v }, "Cliente actualizado") })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Actividad ", (0, jsx_runtime_1.jsx)("select", { value: p.status, onChange: (e) => patch({ status: e.target.value }), children: Object.entries(labels_1.PROJECT_STATUS).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k)) })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Estado general (manual) ", (0, jsx_runtime_1.jsxs)("select", { value: p.health || "", onChange: (e) => patch({ health: e.target.value || null }), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "No informado" }), Object.entries(labels_1.HEALTH).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k))] })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Por qu\u00E9 (explicaci\u00F3n breve del estado general; se muestra en la lista de proyectos)", wide: true, children: (0, jsx_runtime_1.jsx)(ui_1.CommitText, { label: "Explicaci\u00F3n del estado general", value: p.health_note, placeholder: "p. ej. Pendiente de accesos del cliente para continuar las pruebas", maxRows: 4, onCommit: (v) => patch({ health_note: v }, "Explicación guardada") }) })] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: err }), (0, jsx_runtime_1.jsxs)("div", { className: "project-top", children: [(0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "D\u00F3nde lo dejamos", id: "p-donde", children: [(0, jsx_runtime_1.jsx)(ui_1.AutoText, { value: summary, minRows: 4, maxRows: 14, onChange: setSummary, "aria-label": "Resumen d\u00F3nde lo dejamos", placeholder: "Estado actual en pocas l\u00EDneas" }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("button", { className: "primary", disabled: summary === p.summary, onClick: () => patch({ summary }, "Resumen actualizado"), children: "Guardar resumen" }), (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: ["Fecha del resumen: ", p.summary_updated_at ? `${(0, dates_1.fmtDateTime)(p.summary_updated_at, app.tz)} (${(0, dates_1.sinceLabel)(p.summary_updated_at)})` : "no informado"] })] }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Siguiente acci\u00F3n", hint: "Se guarda al salir del campo o con Ctrl+Enter", wide: true, children: (0, jsx_runtime_1.jsx)(ui_1.CommitText, { label: "Siguiente acci\u00F3n", value: p.next_action, placeholder: "La pr\u00F3xima cosa concreta que hay que hacer", onCommit: (v) => patch({ next_action: v }, "Siguiente acción guardada") }) }), (0, jsx_runtime_1.jsxs)("details", { className: "mini", children: [(0, jsx_runtime_1.jsx)("summary", { children: "Objetivo y fase actual (opcional)" }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Objetivo", wide: true, children: (0, jsx_runtime_1.jsx)(ui_1.CommitText, { label: "Objetivo", value: p.objective, onCommit: (v) => patch({ objective: v }) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Fase actual", wide: true, children: (0, jsx_runtime_1.jsx)(ui_1.CommitText, { label: "Fase actual", value: p.phase, maxRows: 2, onCommit: (v) => patch({ phase: v }) }) })] })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Se\u00F1ales objetivas", id: "p-sig", children: [(0, jsx_runtime_1.jsxs)("ul", { className: "signals", children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: sig.overdue }), " vencidas"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: sig.due_14d }), " vencen en 14 d\u00EDas"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: sig.blocked }), " bloqueadas \u00B7 ", (0, jsx_runtime_1.jsx)("strong", { children: sig.waiting }), " en espera"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: sig.milestones_14d }), " hitos/compromisos en 14 d\u00EDas"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: sig.decisions_pending }), " decisiones pendientes"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: sig.approvals_pending }), " aprobaciones pendientes"] })] }), (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Calculadas a partir de los datos registrados. Que no haya se\u00F1ales no significa que el proyecto vaya bien." }), pendingDecisions.length > 0 && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Decisiones pendientes" }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: pendingDecisions.map((m) => (0, jsx_runtime_1.jsxs)("li", { children: [m.title, " ", m.date && (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: ["\u00B7 ", (0, dates_1.fmtDate)(m.date)] })] }, m.id)) })] }), (0, jsx_runtime_1.jsx)("h3", { children: "Pr\u00F3ximos compromisos (14 d\u00EDas)" }), p.commitments.length ? (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: p.commitments.map((c) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, dates_1.fmtDate)(c.date), " \u00B7 ", c.type === "tarea" ? (0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.openTask(c.id), children: c.title }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [labels_1.MILESTONE_KIND[c.type], ": ", c.title] })] }, c.type + c.id))) })
                                : (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Ninguno registrado." })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Section, { title: "Tareas", count: tasks?.length, id: "p-tareas", actions: (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Agrupar por ", (0, jsx_runtime_1.jsxs)("select", { value: groupBy, onChange: (e) => setGroupBy(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "linea", children: "L\u00EDnea de trabajo" }), (0, jsx_runtime_1.jsx)("option", { value: "fase", children: "Fase" }), (0, jsx_runtime_1.jsx)("option", { value: "entregable", children: "Entregable" }), (0, jsx_runtime_1.jsx)("option", { value: "persona", children: "Persona" }), (0, jsx_runtime_1.jsx)("option", { value: "ninguna", children: "Sin agrupar" })] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: showBacklog, onChange: (e) => setShowBacklog(e.target.checked) }), " Backlog"] }), (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: showDone, onChange: (e) => setShowDone(e.target.checked) }), " Terminadas"] }), (0, jsx_runtime_1.jsx)("button", { className: "primary", onClick: () => app.quickTask({ project_id: p.id }), children: "Nueva tarea" })] }), children: tasks ? (0, jsx_runtime_1.jsx)(TaskViews_1.Board, { tasks: tasks, showBacklog: showBacklog, showDone: showDone, groupBy: groupBy, showProject: false }) : (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Cargando\u2026" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "project-bottom", children: [(0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Notas", count: notes?.length, id: "p-notas", actions: (0, jsx_runtime_1.jsx)("button", { onClick: () => app.newNote({ project_id: p.id }), children: "Nueva nota" }), children: [notes && !notes.length && (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "Sin notas vinculadas a este proyecto o a sus tareas." }), (0, jsx_runtime_1.jsx)("ul", { className: "plain note-list", children: notes?.map((n) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsxs)("button", { className: "linklike", onClick: () => app.navigate(`#/notas/${n.id}`), children: [n.pinned ? "📌 " : "", n.display_title] }), (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [" \u00B7 ", n.kind || "nota", " \u00B7 ", (0, dates_1.fmtDate)(n.updated_at.slice(0, 10))] })] }, n.id))) })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Personas y dedicaci\u00F3n", count: p.people.length, id: "p-personas", children: [(0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Dedicaci\u00F3n opcional: % de la capacidad semanal de la persona destinada a este proyecto. Se usa en la Planificaci\u00F3n semanal para comparar con el esfuerzo estimado registrado." }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: p.people.map((x) => ((0, jsx_runtime_1.jsxs)("li", { className: "row", children: [(0, jsx_runtime_1.jsx)("button", { className: "linklike grow", onClick: () => app.navigate(`#/equipo/${x.id}`), children: x.name }), (0, jsx_runtime_1.jsxs)("label", { className: "inline small", children: ["Dedicaci\u00F3n ", (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "100", step: "5", className: "num", "aria-label": `Dedicación de ${x.name} (%)`, defaultValue: x.dedication_pct ?? "", onBlur: (e) => { const v = e.target.value === "" ? null : Number(e.target.value); if (v !== x.dedication_pct)
                                                        void call(() => api_1.api.post(`/api/projects/${id}/people`, { person_id: x.id, dedication_pct: v })); } }, String(x.dedication_pct)), " %"] }), (0, jsx_runtime_1.jsx)("span", { className: "muted small", children: x.dedication_hours !== null ? `≈ ${x.dedication_hours} h/sem` : x.dedication_pct !== null ? "capacidad no informada" : "no informada" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => call(() => api_1.api.del(`/api/projects/${id}/people/${x.id}`)), children: "Desvincular" })] }, x.id))) }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)(ui_1.PersonSelect, { value: personToAdd, onChange: setPersonToAdd, emptyLabel: "Elegir persona\u2026" }), (0, jsx_runtime_1.jsx)("button", { disabled: !personToAdd, onClick: () => call(() => api_1.api.post(`/api/projects/${id}/people`, { person_id: personToAdd })).then(() => setPersonToAdd(null)), children: "Vincular" })] })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Hitos, decisiones y compromisos", id: "p-hitos", children: [(0, jsx_runtime_1.jsx)("ul", { className: "plain", children: p.milestones.map((m) => ((0, jsx_runtime_1.jsxs)("li", { className: m.status !== "pendiente" ? "done" : "", children: [(0, jsx_runtime_1.jsx)(ui_1.Chip, { children: labels_1.MILESTONE_KIND[m.kind] }), " ", m.title, " ", (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [m.date ? (0, dates_1.fmtDate)(m.date) : "sin fecha", " \u00B7 ", m.status] }), m.status === "pendiente" && (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => call(() => api_1.api.patch(`/api/milestones/${m.id}`, { status: "cumplido" })), children: m.kind === "decision" ? "Decidida" : "Cumplido" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => { if (window.confirm("¿Eliminar este elemento?"))
                                                void call(() => api_1.api.del(`/api/milestones/${m.id}`)); }, children: "Eliminar" })] }, m.id))) }), (0, jsx_runtime_1.jsxs)("form", { className: "row", onSubmit: (e) => { e.preventDefault(); void call(() => api_1.api.post(`/api/projects/${id}/milestones`, { kind: ms.kind, title: ms.title, date: ms.date || null })).then(() => setMs({ ...ms, title: "", date: "" })); }, children: [(0, jsx_runtime_1.jsx)("select", { "aria-label": "Tipo", value: ms.kind, onChange: (e) => setMs({ ...ms, kind: e.target.value }), children: Object.entries(labels_1.MILESTONE_KIND).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k)) }), (0, jsx_runtime_1.jsx)("input", { className: "grow", "aria-label": "T\u00EDtulo", placeholder: "T\u00EDtulo", value: ms.title, onChange: (e) => setMs({ ...ms, title: e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { "aria-label": "Fecha", type: "date", value: ms.date, onChange: (e) => setMs({ ...ms, date: e.target.value }) }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !ms.title.trim(), children: "A\u00F1adir" })] })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Agrupaciones", id: "p-grupos", children: [["linea", "fase", "entregable"].map((k) => {
                                const gs = p.groupings.filter((g) => g.kind === k);
                                return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { children: labels_1.GROUPING_KIND[k] }), gs.length ? (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: gs.map((g) => (0, jsx_runtime_1.jsxs)("li", { children: [g.name, (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => { const n = window.prompt("Nuevo nombre:", g.name); if (n?.trim())
                                                            void call(() => api_1.api.patch(`/api/groupings/${g.id}`, { name: n.trim() })); }, children: "Renombrar" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => { if (window.confirm("¿Eliminar la agrupación? Las tareas se conservan sin ella."))
                                                            void call(() => api_1.api.del(`/api/groupings/${g.id}`)); }, children: "Eliminar" })] }, g.id)) })
                                            : (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "\u2014" })] }, k);
                            }), (0, jsx_runtime_1.jsxs)("form", { className: "row", onSubmit: (e) => { e.preventDefault(); void call(() => api_1.api.post(`/api/projects/${id}/groupings`, grp)).then(() => setGrp({ ...grp, name: "" })); }, children: [(0, jsx_runtime_1.jsx)("select", { "aria-label": "Dimensi\u00F3n", value: grp.kind, onChange: (e) => setGrp({ ...grp, kind: e.target.value }), children: Object.entries(labels_1.GROUPING_KIND).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k)) }), (0, jsx_runtime_1.jsx)("input", { className: "grow", "aria-label": "Nombre", placeholder: "Nombre", value: grp.name, onChange: (e) => setGrp({ ...grp, name: e.target.value }) }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !grp.name.trim(), children: "A\u00F1adir" })] })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Enlaces", id: "p-enlaces", children: [(0, jsx_runtime_1.jsx)("ul", { className: "plain", children: p.links.map((l, i) => (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)(ui_1.SafeLink, { link: l }) }, i)) }), (0, jsx_runtime_1.jsxs)("details", { className: "mini", children: [(0, jsx_runtime_1.jsx)("summary", { children: "Editar enlaces" }), (0, jsx_runtime_1.jsx)(ui_1.LinksEditor, { value: p.links, onChange: (v) => patch({ links: v }, "Enlaces actualizados") })] })] })] })] }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/labels":12,"../lib/store":9,"../components/TaskViews":21,"../components/ui":13}]; // build/src/views/Projects.js
defs[21]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveTask = moveTask;
exports.Board = Board;
exports.TaskTable = TaskTable;
exports.dayContextText = dayContextText;
exports.Calendar = Calendar;
exports.WeekAvailabilityStrip = WeekAvailabilityStrip;
exports.FilterBar = FilterBar;
exports.filtersToQuery = filtersToQuery;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const labels_1 = require("../lib/labels");
const store_1 = require("../lib/store");
const TaskCard_1 = require("./TaskCard");
const ui_1 = require("./ui");
/** Mueve/reordena una tarea; si la aprobación está pendiente pide confirmación explícita. */
async function moveTask(id, body) {
    try {
        await api_1.api.post(`/api/tasks/${id}/reorder`, body);
        return true;
    }
    catch (e) {
        if (e instanceof api_1.ApiError && e.code === "aprobacion_pendiente") {
            if (!window.confirm(e.message))
                return false;
            await api_1.api.post(`/api/tasks/${id}/reorder`, { ...body, force: true });
            return true;
        }
        throw e;
    }
}
function Board({ tasks, showBacklog, showDone, groupBy = "ninguna", showProject = true }) {
    const app = (0, store_1.useApp)();
    const [dragId, setDragId] = (0, react_1.useState)(null);
    const columns = [...(showBacklog ? ["backlog"] : []), ...labels_1.BOARD_COLUMNS.filter((c) => c !== "hecha" || showDone)];
    const lanes = (0, react_1.useMemo)(() => {
        if (groupBy === "ninguna")
            return [{ key: "all", label: "", tasks }];
        const keyOf = (t) => groupBy === "linea" ? t.workstream_id : groupBy === "fase" ? t.phase_id
            : groupBy === "entregable" ? t.deliverable_id : groupBy === "proyecto" ? t.project_id : t.assignee_id;
        const labelOf = (k) => {
            if (k === null)
                return groupBy === "persona" ? "Sin asignar" : groupBy === "proyecto" ? "Sin proyecto" : `Sin ${labels_1.GROUPING_KIND[groupBy].toLowerCase()}`;
            if (groupBy === "proyecto")
                return app.project(k)?.name || "—";
            if (groupBy === "persona")
                return app.person(k)?.name || "—";
            return app.boot.groupings.find((g) => g.id === k)?.name || "—";
        };
        const map = new Map();
        for (const t of tasks) {
            const k = keyOf(t);
            map.set(k, [...(map.get(k) || []), t]);
        }
        return [...map.entries()].sort((a, b) => (a[0] === null ? 1 : b[0] === null ? -1 : labelOf(a[0]).localeCompare(labelOf(b[0]))))
            .map(([k, ts]) => ({ key: String(k), label: labelOf(k), tasks: ts }));
    }, [tasks, groupBy, app.boot]);
    const act = async (id, body) => {
        try {
            if (await moveTask(id, body))
                app.changed();
        }
        catch (e) {
            app.toast(e.message, "error");
        }
    };
    if (!tasks.length)
        return (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "No hay tareas con estos filtros. Crea una con \u00AB+ Tarea\u00BB (Alt+T) o revisa los filtros." });
    return ((0, jsx_runtime_1.jsx)("div", { className: "board-wrap", children: lanes.map((lane) => ((0, jsx_runtime_1.jsxs)("div", { className: "lane", children: [lane.label && (0, jsx_runtime_1.jsxs)("h3", { className: "lane-title", children: [lane.label, " ", (0, jsx_runtime_1.jsxs)("span", { className: "count", children: ["(", lane.tasks.length, ")"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "board", style: { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }, children: columns.map((col, ci) => {
                        const items = lane.tasks.filter((t) => t.status === col).sort((a, b) => a.position - b.position);
                        return ((0, jsx_runtime_1.jsxs)("div", { className: "column", "aria-label": `Columna ${labels_1.STATUS[col]}`, onDragOver: (e) => e.preventDefault(), onDrop: (e) => {
                                e.preventDefault();
                                if (dragId === null)
                                    return;
                                const last = items.filter((t) => t.id !== dragId).slice(-1)[0];
                                void act(dragId, { status: col, ...(last ? { after_id: last.id } : {}) });
                                setDragId(null);
                            }, children: [(0, jsx_runtime_1.jsxs)("h4", { className: "column-title", children: [labels_1.STATUS[col], " ", (0, jsx_runtime_1.jsx)("span", { className: "count", children: items.length })] }), items.map((t, i) => ((0, jsx_runtime_1.jsx)("div", { onDragOver: (e) => e.preventDefault(), onDrop: (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (dragId === null || dragId === t.id)
                                            return;
                                        const prev = items.slice(0, i).filter((x) => x.id !== dragId).slice(-1)[0];
                                        void act(dragId, { status: col, before_id: t.id, ...(prev ? { after_id: prev.id } : {}) });
                                        setDragId(null);
                                    }, children: (0, jsx_runtime_1.jsx)(TaskCard_1.TaskCard, { task: t, showProject: showProject, draggable: true, onDragStart: (e) => { setDragId(t.id); e.dataTransfer.setData("text/plain", String(t.id)); }, actions: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { className: "ghost small", disabled: ci === 0, onClick: () => act(t.id, { status: columns[ci - 1] }), "aria-label": `Mover «${t.title}» a la columna anterior`, title: "Columna anterior", children: "\u25C0" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", disabled: i === 0, onClick: () => act(t.id, { before_id: items[i - 1].id, ...(i > 1 ? { after_id: items[i - 2].id } : {}) }), "aria-label": `Subir «${t.title}»`, title: "Subir", children: "\u25B2" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", disabled: i === items.length - 1, onClick: () => act(t.id, { after_id: items[i + 1].id, ...(i + 2 < items.length ? { before_id: items[i + 2].id } : {}) }), "aria-label": `Bajar «${t.title}»`, title: "Bajar", children: "\u25BC" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", disabled: ci === columns.length - 1, onClick: () => act(t.id, { status: columns[ci + 1] }), "aria-label": `Mover «${t.title}» a la columna siguiente`, title: "Columna siguiente", children: "\u25B6" })] }) }) }, t.id)))] }, col));
                    }) })] }, lane.key))) }));
}
function TaskTable({ tasks, archived }) {
    const app = (0, store_1.useApp)();
    const today = (0, dates_1.todayIn)(app.tz);
    if (!tasks.length)
        return (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: archived ? "No hay tareas archivadas." : "No hay tareas con estos filtros." });
    const act = async (fn, msg) => { try {
        await fn();
        app.changed();
        app.toast(msg, "ok");
    }
    catch (e) {
        app.toast(e.message, "error");
    } };
    return ((0, jsx_runtime_1.jsx)("div", { className: "table-wrap", children: (0, jsx_runtime_1.jsxs)("table", { className: "list", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "Tarea" }), (0, jsx_runtime_1.jsx)("th", { children: "Proyecto" }), (0, jsx_runtime_1.jsx)("th", { children: "Responsable" }), (0, jsx_runtime_1.jsx)("th", { children: "Estado" }), !archived && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("th", { children: "Condici\u00F3n" }), (0, jsx_runtime_1.jsx)("th", { children: "Prioridad" }), (0, jsx_runtime_1.jsx)("th", { children: "L\u00EDmite" }), (0, jsx_runtime_1.jsx)("th", { children: "Planificada" }), (0, jsx_runtime_1.jsx)("th", { children: "Estimaci\u00F3n" })] }), archived && (0, jsx_runtime_1.jsx)("th", { children: "Acciones" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: tasks.map((t) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsxs)("td", { className: "wrap", children: [t.parent_id && (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: ["\u21B3 ", t.parent_title, " \u00B7 "] }), (0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.openTask(t.id), children: t.title }), t.open_blockers > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "muted", title: "Depende de otras tareas", children: [" \u26D3", t.open_blockers] }), t.open_dependents > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "muted", title: "Bloquea otras tareas", children: [" \u279C", t.open_dependents] }), t.steps_total > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "muted", title: "Pasos", children: [" \u2611", t.steps_done, "/", t.steps_total] })] }), (0, jsx_runtime_1.jsx)("td", { children: app.project(t.project_id)?.name || "—" }), (0, jsx_runtime_1.jsx)("td", { children: app.person(t.assignee_id)?.name || "Sin asignar" }), (0, jsx_runtime_1.jsx)("td", { children: labels_1.STATUS[t.status] }), !archived && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("td", { children: t.condition ? labels_1.CONDITION[t.condition] : "—" }), (0, jsx_runtime_1.jsxs)("td", { children: [labels_1.PRIORITY_MARK[t.priority], " ", labels_1.PRIORITY[t.priority]] }), (0, jsx_runtime_1.jsx)("td", { className: t.due_date && t.due_date < today ? "overdue" : "", children: t.due_date ? (0, dates_1.fmtDate)(t.due_date) + (t.due_date < today ? " (vencida)" : "") : "—" }), (0, jsx_runtime_1.jsx)("td", { children: t.planned_date ? (0, dates_1.fmtDate)(t.planned_date) : "—" }), (0, jsx_runtime_1.jsx)("td", { children: t.estimate_hours !== null ? `${t.estimate_hours} h` : "no informado" })] }), archived && (0, jsx_runtime_1.jsxs)("td", { className: "nowrap", children: [(0, jsx_runtime_1.jsx)("button", { className: "small", onClick: () => act(() => api_1.api.patch(`/api/tasks/${t.id}`, { archived: false }), "Tarea restaurada"), children: "Restaurar" }), (0, jsx_runtime_1.jsx)("button", { className: "small danger", onClick: () => { if (window.confirm(`¿Eliminar definitivamente «${t.title}»? No se puede deshacer.`))
                                            void act(() => api_1.api.del(`/api/tasks/${t.id}`), "Tarea eliminada"); }, children: "Eliminar" })] })] }, t.id))) })] }) }));
}
/** Texto compacto para festivos y ausencias registrados de un día. */
function dayContextText(c) {
    if (!c)
        return { holiday: "", absent: "", title: "" };
    const holiday = c.holidays.map((h) => h.location ? `Festivo ${h.location}` : "Festivo").join(" · ");
    const absent = c.absences.length ? `Ausente: ${c.absences.map((a) => a.name.split(" ")[0]).join(", ")}` : "";
    const title = [...c.holidays.map((h) => `${h.name || "Festivo"}${h.location ? ` (${h.location})` : " (todas las oficinas)"}: ${h.people.join(", ") || "nadie asignado"}`),
        ...(c.absences.length ? [`Ausencias registradas: ${c.absences.map((a) => a.name).join(", ")}`] : [])].join("\n");
    return { holiday, absent, title };
}
const CAL_LABEL = { vence: "📅", plan: "🗓", revision: "🔎" };
const CAL_TEXT = { vence: "Vence", plan: "Planificada", revision: "Revisión" };
function Calendar({ tasks, mode, anchor, setAnchor, setMode }) {
    const app = (0, store_1.useApp)();
    const today = (0, dates_1.todayIn)(app.tz);
    const days = mode === "semana" ? Array.from({ length: 7 }, (_, i) => (0, dates_1.addDays)((0, dates_1.weekStart)(anchor), i)) : (0, dates_1.monthGrid)(anchor);
    const { data: ctx } = (0, store_1.useApi)(`/api/calendar-context?start=${days[0]}&end=${days[days.length - 1]}`);
    const byDay = (0, react_1.useMemo)(() => {
        const m = new Map();
        const put = (d, it) => { if (d)
            m.set(d, [...(m.get(d) || []), it]); };
        for (const t of tasks) {
            put(t.due_date, { task: t, kind: "vence" });
            if (t.planned_date && t.planned_date !== t.due_date)
                put(t.planned_date, { task: t, kind: "plan" });
            if (t.next_review_at)
                put((0, dates_1.utcToZonedInput)(t.next_review_at, app.tz).slice(0, 10), { task: t, kind: "revision" });
        }
        return m;
    }, [tasks]);
    const undated = tasks.filter((t) => !t.due_date && !t.planned_date && !t.next_review_at).length;
    const shift = (dir) => {
        if (mode === "semana")
            setAnchor((0, dates_1.addDays)(anchor, dir * 7));
        else {
            const d = new Date(anchor.slice(0, 8) + "15T12:00:00Z");
            d.setUTCMonth(d.getUTCMonth() + dir);
            setAnchor(d.toISOString().slice(0, 10));
        }
    };
    const month = anchor.slice(0, 7);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "row cal-bar", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => shift(-1), "aria-label": "Anterior", children: "\u25C0" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setAnchor(today), children: "Hoy" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => shift(1), "aria-label": "Siguiente", children: "\u25B6" }), (0, jsx_runtime_1.jsx)("strong", { children: mode === "semana" ? `Semana del ${(0, dates_1.fmtDate)(days[0])} al ${(0, dates_1.fmtDate)(days[6])}` : new Date(anchor.slice(0, 8) + "15T12:00:00Z").toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" }) }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), (0, jsx_runtime_1.jsxs)("div", { role: "group", "aria-label": "Escala del calendario", className: "tabs-inline", children: [(0, jsx_runtime_1.jsx)("button", { "aria-pressed": mode === "semana", className: mode === "semana" ? "active" : "", onClick: () => setMode("semana"), children: "Semana" }), (0, jsx_runtime_1.jsx)("button", { "aria-pressed": mode === "mes", className: mode === "mes" ? "active" : "", onClick: () => setMode("mes"), children: "Mes" })] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "hint", children: ["\uD83D\uDCC5 Vence \u00B7 \uD83D\uDDD3 Planificada \u00B7 \uD83D\uDD0E Revisi\u00F3n \u00B7 en gris, festivos y ausencias registrados (pasa el rat\u00F3n para ver a qui\u00E9n afectan). ", undated > 0 && `${undated} tarea(s) sin fecha no se muestran.`] }), (0, jsx_runtime_1.jsxs)("div", { className: `calendar cal-${mode}`, children: [["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((d) => (0, jsx_runtime_1.jsx)("div", { className: "cal-dow", children: d }, d)), days.map((d) => {
                        const items = byDay.get(d) || [];
                        const c = dayContextText(ctx?.days[d]);
                        const globalHoliday = ctx?.days[d]?.holidays.some((h) => !h.location);
                        return ((0, jsx_runtime_1.jsxs)("div", { className: `cal-day${d === today ? " today" : ""}${mode === "mes" && d.slice(0, 7) !== month ? " out" : ""}${(0, dates_1.isoDow)(d) >= 6 || globalHoliday ? " weekend" : ""}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "cal-date", children: [Number(d.slice(8)), d === today && (0, jsx_runtime_1.jsx)("span", { className: "sr", children: " (hoy)" })] }), (c.holiday || c.absent) && (0, jsx_runtime_1.jsxs)("div", { className: "cal-ctx", title: c.title, children: [c.holiday && (0, jsx_runtime_1.jsx)("span", { children: c.holiday }), c.absent && (0, jsx_runtime_1.jsx)("span", { children: c.absent })] }), items.map((it) => ((0, jsx_runtime_1.jsxs)("button", { className: `cal-item cal-${it.kind}`, onClick: () => app.openTask(it.task.id), title: `${CAL_TEXT[it.kind]}: ${it.task.title}`, children: [(0, jsx_runtime_1.jsx)("span", { "aria-label": CAL_TEXT[it.kind], children: CAL_LABEL[it.kind] }), " ", it.task.title] }, it.kind + it.task.id)))] }, d));
                    })] })] }));
}
/** Línea discreta con festivos y ausencias registrados en la semana actual. */
function WeekAvailabilityStrip() {
    const app = (0, store_1.useApp)();
    const ws = (0, dates_1.weekStart)((0, dates_1.todayIn)(app.tz));
    const { data } = (0, store_1.useApi)(`/api/calendar-context?start=${ws}&end=${(0, dates_1.addDays)(ws, 6)}`);
    if (!data)
        return null;
    const parts = [];
    for (let i = 0; i < 7; i++) {
        const d = (0, dates_1.addDays)(ws, i);
        const c = data.days[d];
        if (!c)
            continue;
        const names = [...new Set([...c.holidays.flatMap((h) => h.people), ...c.absences.map((a) => a.name)])];
        if (!names.length)
            continue;
        const t = dayContextText(c);
        parts.push({ text: `${(0, dates_1.fmtDate)(d)}: ${names.map((n) => n.split(" ")[0]).join(", ")}`, title: t.title });
    }
    if (!parts.length)
        return null;
    return (0, jsx_runtime_1.jsxs)("p", { className: "availability-strip", "aria-label": "Festivos y ausencias registrados esta semana", children: [(0, jsx_runtime_1.jsx)("span", { className: "muted", children: "No disponibles esta semana (festivos/ausencias registrados):" }), " ", parts.map((p, i) => (0, jsx_runtime_1.jsx)("span", { className: "avail-item", title: p.title, children: p.text }, i))] });
}
function FilterBar({ filters, setFilters, hideProject }) {
    const app = (0, store_1.useApp)();
    const set = (k, v) => setFilters({ ...filters, [k]: v });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "filters", role: "group", "aria-label": "Filtros", children: [!hideProject && (0, jsx_runtime_1.jsxs)("label", { children: ["Proyecto ", (0, jsx_runtime_1.jsx)(ui_1.ProjectSelect, { value: filters.project_id ? Number(filters.project_id) : null, emptyLabel: "Todos", onChange: (v) => set("project_id", v ? String(v) : "") })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Persona ", (0, jsx_runtime_1.jsx)(ui_1.PersonSelect, { value: filters.person_id ? Number(filters.person_id) : null, emptyLabel: "Todas", onChange: (v) => set("person_id", v ? String(v) : "") })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Estado ", (0, jsx_runtime_1.jsxs)("select", { value: filters.status || "", onChange: (e) => set("status", e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Operativas" }), Object.keys(labels_1.STATUS).map((s) => (0, jsx_runtime_1.jsx)("option", { value: s, children: labels_1.STATUS[s] }, s))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Condici\u00F3n ", (0, jsx_runtime_1.jsxs)("select", { value: filters.condition || "", onChange: (e) => set("condition", e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Cualquiera" }), (0, jsx_runtime_1.jsx)("option", { value: "cualquiera", children: "En espera o bloqueadas" }), (0, jsx_runtime_1.jsx)("option", { value: "espera", children: "En espera" }), (0, jsx_runtime_1.jsx)("option", { value: "bloqueada", children: "Bloqueadas" })] })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Prioridad ", (0, jsx_runtime_1.jsxs)("select", { value: filters.priority || "", onChange: (e) => set("priority", e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Todas" }), Object.entries(labels_1.PRIORITY).map(([k, v]) => (0, jsx_runtime_1.jsx)("option", { value: k, children: v }, k))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Etiqueta ", (0, jsx_runtime_1.jsxs)("select", { value: filters.tag || "", onChange: (e) => set("tag", e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Todas" }), app.boot.tags.map((t) => (0, jsx_runtime_1.jsx)("option", { value: t, children: t }, t))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Orden ", (0, jsx_runtime_1.jsxs)("select", { value: filters.sort || "", onChange: (e) => set("sort", e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Manual" }), (0, jsx_runtime_1.jsx)("option", { value: "fecha", children: "Fecha l\u00EDmite" }), (0, jsx_runtime_1.jsx)("option", { value: "prioridad", children: "Prioridad" })] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!filters.include_backlog, onChange: (e) => set("include_backlog", e.target.checked) }), " Backlog"] }), (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: !!filters.include_closed, onChange: (e) => set("include_closed", e.target.checked) }), " Terminadas"] })] }));
}
function filtersToQuery(f) {
    const p = [];
    const add = (k, v) => { if (v !== undefined && v !== "" && v !== false && v !== null)
        p.push(`${k}=${encodeURIComponent(v === true ? "1" : v)}`); };
    add("project_id", f.project_id);
    add("person_id", f.person_id);
    add("status", f.status);
    add("priority", f.priority);
    add("tag", f.tag);
    add("condition", f.condition);
    add("include_backlog", f.include_backlog);
    add("include_closed", f.include_closed);
    add("sort", f.sort);
    return p.length ? "?" + p.join("&") : "";
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/labels":12,"../lib/store":9,"./TaskCard":22,"./ui":13}]; // build/src/components/TaskViews.js
defs[22]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCard = TaskCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const dates_1 = require("../lib/dates");
const labels_1 = require("../lib/labels");
const store_1 = require("../lib/store");
const ui_1 = require("./ui");
function TaskCard({ task, showStatus, showProject = true, actions, draggable, onDragStart }) {
    const app = (0, store_1.useApp)();
    const today = (0, dates_1.todayIn)(app.tz);
    const project = app.project(task.project_id);
    const assignee = app.person(task.assignee_id);
    const overdue = task.due_date && task.due_date < today;
    const approvals = (task.signals || []).filter((s) => s.startsWith("aprobacion"));
    return ((0, jsx_runtime_1.jsxs)("article", { className: `card prio-${task.priority}${task.condition ? " has-condition" : ""}${task.parent_id ? " is-sub" : ""}`, draggable: draggable, onDragStart: onDragStart, "data-task-id": task.id, children: [task.parent_id && ((0, jsx_runtime_1.jsxs)("button", { className: "card-parent linklike", onClick: () => app.openTask(task.parent_id), title: "Abrir la tarea principal", children: ["\u21B3 Subtarea de \u00AB", task.parent_title, "\u00BB"] })), (0, jsx_runtime_1.jsxs)("button", { className: "card-title linklike", onClick: () => app.openTask(task.id), title: "Abrir detalle", children: [labels_1.PRIORITY_MARK[task.priority] && (0, jsx_runtime_1.jsxs)("span", { className: "prio-mark", "aria-label": `Prioridad ${labels_1.PRIORITY[task.priority]}`, children: [labels_1.PRIORITY_MARK[task.priority], " "] }), task.title] }), (0, jsx_runtime_1.jsxs)("div", { className: "card-meta", children: [showStatus && (0, jsx_runtime_1.jsx)(ui_1.Chip, { children: labels_1.STATUS[task.status] }), task.condition && (0, jsx_runtime_1.jsxs)(ui_1.Chip, { tone: task.condition === "bloqueada" ? "danger" : "warn", title: task.wait_on || undefined, children: [task.condition === "bloqueada" ? "⛔" : "⏸", " ", labels_1.CONDITION[task.condition], task.wait_on ? `: ${task.wait_on}` : ""] }), task.due_date && (0, jsx_runtime_1.jsxs)(ui_1.Chip, { tone: overdue ? "danger" : task.due_date === today ? "warn" : "neutral", children: ["\uD83D\uDCC5 ", (0, dates_1.dueLabel)(task.due_date, today)] }), task.status === "backlog" && !showStatus && (0, jsx_runtime_1.jsx)(ui_1.Chip, { children: "Backlog" }), task.open_blockers > 0 && (0, jsx_runtime_1.jsxs)(ui_1.Chip, { tone: "warn", title: "Depende de tareas no terminadas", children: ["\u26D3 espera ", task.open_blockers] }), task.open_dependents > 0 && (0, jsx_runtime_1.jsxs)(ui_1.Chip, { tone: "info", title: "Otras tareas dependen de esta", children: ["\u279C bloquea ", task.open_dependents] }), approvals.map((s) => (0, jsx_runtime_1.jsx)(ui_1.Chip, { tone: "warn", children: labels_1.SIGNAL[s] }, s)), task.steps_total > 0 && (0, jsx_runtime_1.jsxs)(ui_1.Chip, { title: "Pasos completados", children: ["\u2611 ", task.steps_done, "/", task.steps_total, " pasos"] }), task.subtasks_total > 0 && (0, jsx_runtime_1.jsxs)(ui_1.Chip, { title: "Subtareas cerradas", children: ["\u229E ", task.subtasks_closed, "/", task.subtasks_total, " subtareas"] }), task.recurrence_id && (0, jsx_runtime_1.jsx)(ui_1.Chip, { title: "Tarea recurrente", children: "\u21BB" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "card-foot", children: [showProject && project && (0, jsx_runtime_1.jsx)("span", { className: "muted", children: project.name }), (0, jsx_runtime_1.jsx)("span", { className: "muted", children: assignee ? assignee.name : "Sin asignar" }), task.tags.map((t) => (0, jsx_runtime_1.jsxs)("span", { className: "tag", children: ["#", t] }, t))] }), actions && (0, jsx_runtime_1.jsx)("div", { className: "card-actions", children: actions })] }));
}

},{"react/jsx-runtime":1,"../lib/dates":8,"../lib/labels":12,"../lib/store":9,"./ui":13}]; // build/src/components/TaskCard.js
defs[23]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsView = SettingsView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const labels_1 = require("../lib/labels");
const store_1 = require("../lib/store");
const ui_1 = require("../components/ui");
function SettingsView() {
    const app = (0, store_1.useApp)();
    const s = app.boot.settings;
    const [draft, setDraft] = (0, react_1.useState)(s);
    const [err, setErr] = (0, react_1.useState)("");
    const { data: backups, reload: reloadBackups } = (0, store_1.useApi)("/api/backups");
    const [restoreData, setRestoreData] = (0, react_1.useState)(null);
    const [preview, setPreview] = (0, react_1.useState)(null);
    const [notifMsg, setNotifMsg] = (0, react_1.useState)("");
    const set = (k, v) => setDraft({ ...draft, [k]: v });
    const save = async () => {
        try {
            await api_1.api.patch("/api/settings", {
                app_name: draft.app_name.trim(), start_view: draft.start_view, timezone: draft.timezone, due_soon_days: Number(draft.due_soon_days),
                workdays: draft.workdays, work_start: draft.work_start, work_end: draft.work_end, backup_retention: Number(draft.backup_retention),
                quiet_start: draft.quiet_start, quiet_end: draft.quiet_end, notifications_discreet: draft.notifications_discreet,
                recurrence_horizon_days: Number(draft.recurrence_horizon_days),
            });
            await app.reloadBoot();
            app.changed();
            app.toast("Configuración guardada", "ok");
            setErr("");
        }
        catch (e) {
            setErr(e.message);
        }
    };
    const enableNotifications = async () => {
        if (!("Notification" in window)) {
            setNotifMsg("Este navegador no admite notificaciones del sistema. Los recordatorios siguen disponibles dentro de la aplicación.");
            return;
        }
        if (Notification.permission === "denied") {
            setNotifMsg("El permiso está denegado en el navegador. No se volverá a solicitar; puedes cambiarlo en la configuración del sitio.");
            return;
        }
        const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
        if (perm === "granted") {
            await api_1.api.patch("/api/settings", { notifications_enabled: true });
            await app.reloadBoot();
            setNotifMsg("Notificaciones activadas.");
        }
        else
            setNotifMsg("Permiso no concedido. Los recordatorios internos siguen funcionando.");
    };
    const pickFile = async (e) => {
        const f = e.target.files?.[0];
        setPreview(null);
        setRestoreData(null);
        setErr("");
        if (!f)
            return;
        try {
            const data = JSON.parse(await f.text());
            setPreview(await api_1.api.post("/api/restore/preview", data));
            setRestoreData(data);
        }
        catch (ex) {
            setErr(ex instanceof SyntaxError ? "El archivo no es un JSON válido" : ex.message);
        }
    };
    const doRestore = async () => {
        if (!window.confirm("Se sustituirán TODOS los datos actuales por los del archivo. Antes se creará una copia de seguridad. ¿Continuar?"))
            return;
        try {
            const r = await api_1.api.post("/api/restore", { data: restoreData, confirm: true });
            app.toast(`Restauración completada. Copia previa: ${r.previous_backup}`, "ok");
            setTimeout(() => window.location.reload(), 800);
        }
        catch (e) {
            setErr(e.message);
        }
    };
    const restoreBackup = async (name) => {
        if (!window.confirm(`Se sustituirán todos los datos actuales por la copia ${name}. Antes se creará una copia del estado actual. ¿Continuar?`))
            return;
        try {
            const r = await api_1.api.post(`/api/backups/${encodeURIComponent(name)}/restore`);
            app.toast(`Copia restaurada. Copia previa: ${r.previous_backup}`, "ok");
            setTimeout(() => window.location.reload(), 800);
        }
        catch (e) {
            setErr(e.message);
        }
    };
    const shutdown = async () => {
        if (!window.confirm("¿Cerrar la aplicación? Los datos ya están guardados en la base de datos local."))
            return;
        try {
            await api_1.api.post("/api/system/shutdown");
            document.body.textContent = `${s.app_name} se ha cerrado correctamente. Puedes cerrar esta pestaña.`;
        }
        catch (e) {
            setErr(e.message);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view settings", children: [(0, jsx_runtime_1.jsxs)("header", { className: "view-head row", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Configuraci\u00F3n" }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), (0, jsx_runtime_1.jsx)("button", { className: "primary", onClick: save, children: "Guardar configuraci\u00F3n" })] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: err }), (0, jsx_runtime_1.jsxs)("div", { className: "settings-grid", children: [(0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "General", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Nombre de la aplicaci\u00F3n", children: (0, jsx_runtime_1.jsx)("input", { value: draft.app_name, maxLength: 40, onChange: (e) => set("app_name", e.target.value) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Pantalla de apertura", hint: "Tambi\u00E9n es el destino al pulsar el nombre de la aplicaci\u00F3n.", children: (0, jsx_runtime_1.jsxs)("select", { value: draft.start_view, onChange: (e) => set("start_view", e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "hoy", children: "Hoy" }), (0, jsx_runtime_1.jsx)("option", { value: "proyectos", children: "Proyectos" }), (0, jsx_runtime_1.jsx)("option", { value: "trabajo", children: "Trabajo" }), (0, jsx_runtime_1.jsx)("option", { value: "equipo", children: "Equipo" }), (0, jsx_runtime_1.jsx)("option", { value: "notas", children: "Notas" }), (0, jsx_runtime_1.jsx)("option", { value: "ultima", children: "Recordar la \u00FAltima vista" })] }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Zona horaria", hint: "Identificador IANA. Por defecto Europe/Madrid (incluye cambios de horario).", children: (0, jsx_runtime_1.jsx)("input", { value: draft.timezone, onChange: (e) => set("timezone", e.target.value) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Generar ocurrencias recurrentes con antelaci\u00F3n (d\u00EDas)", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "60", value: draft.recurrence_horizon_days, onChange: (e) => set("recurrence_horizon_days", e.target.value) }) })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Horario laboral", children: [(0, jsx_runtime_1.jsxs)("fieldset", { className: "weekdays", children: [(0, jsx_runtime_1.jsx)("legend", { children: "D\u00EDas laborables" }), labels_1.DAYS_LONG.map((d, i) => (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: draft.workdays.includes(i + 1), onChange: (e) => set("workdays", e.target.checked ? [...draft.workdays, i + 1].sort() : draft.workdays.filter((x) => x !== i + 1)) }), d] }, d))] }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Inicio", children: (0, jsx_runtime_1.jsx)("input", { type: "time", value: draft.work_start, onChange: (e) => set("work_start", e.target.value) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Fin", children: (0, jsx_runtime_1.jsx)("input", { type: "time", value: draft.work_end, onChange: (e) => set("work_end", e.target.value) }) })] }), (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Los festivos se gestionan por oficina en la secci\u00F3n \u00ABOficinas y festivos\u00BB." })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Recordatorios y notificaciones", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Avisar de vencimientos con (d\u00EDas) de antelaci\u00F3n", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "30", value: draft.due_soon_days, onChange: (e) => set("due_soon_days", e.target.value) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Horario silencioso desde", children: (0, jsx_runtime_1.jsx)("input", { type: "time", value: draft.quiet_start, onChange: (e) => set("quiet_start", e.target.value) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "hasta", children: (0, jsx_runtime_1.jsx)("input", { type: "time", value: draft.quiet_end, onChange: (e) => set("quiet_end", e.target.value) }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: draft.notifications_discreet, onChange: (e) => set("notifications_discreet", e.target.checked) }), " Contenido discreto (sin t\u00EDtulos ni datos de cliente)"] }), (0, jsx_runtime_1.jsxs)("p", { children: ["Notificaciones del sistema: ", (0, jsx_runtime_1.jsx)("strong", { children: s.notifications_enabled ? "activadas" : "desactivadas" }), ". Opcionales y solo con la aplicaci\u00F3n abierta; el centro de recordatorios interno funciona siempre."] }), s.notifications_enabled ? (0, jsx_runtime_1.jsx)("button", { onClick: async () => { await api_1.api.patch("/api/settings", { notifications_enabled: false }); await app.reloadBoot(); setNotifMsg("Notificaciones desactivadas."); }, children: "Desactivar notificaciones" })
                                : (0, jsx_runtime_1.jsx)("button", { onClick: enableNotifications, children: "Activar notificaciones del sistema" }), notifMsg && (0, jsx_runtime_1.jsx)("p", { className: "hint", role: "status", children: notifMsg })] }), (0, jsx_runtime_1.jsx)(OfficesAndHolidays, {}), (0, jsx_runtime_1.jsx)(TagsManager, {}), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Copias de seguridad", children: [(0, jsx_runtime_1.jsxs)("dl", { className: "paths", children: [(0, jsx_runtime_1.jsx)("dt", { children: "Datos" }), (0, jsx_runtime_1.jsx)("dd", { children: (0, jsx_runtime_1.jsx)("code", { children: app.boot.data_dir }) }), (0, jsx_runtime_1.jsx)("dt", { children: "Copias" }), (0, jsx_runtime_1.jsx)("dd", { children: (0, jsx_runtime_1.jsx)("code", { children: backups?.dir }) })] }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Copias autom\u00E1ticas diarias a conservar", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "1", max: "365", value: draft.backup_retention, onChange: (e) => set("backup_retention", e.target.value) }) }), (0, jsx_runtime_1.jsx)("button", { onClick: async () => { try {
                                    const r = await api_1.api.post("/api/backups");
                                    app.toast(`Copia creada: ${r.name}`, "ok");
                                    reloadBackups();
                                }
                                catch (e) {
                                    setErr(e.message);
                                } }, children: "Crear copia ahora" }), (0, jsx_runtime_1.jsx)("ul", { className: "plain backups", children: backups?.items.slice(0, 30).map((b) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("code", { children: b.name }), " ", (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [(b.size / 1024).toFixed(0), " KB \u00B7 ", (0, dates_1.fmtDateTime)(b.modified, app.tz)] }), (0, jsx_runtime_1.jsx)("button", { className: "small ghost", onClick: () => restoreBackup(b.name), children: "Restaurar" })] }, b.name))) }), (0, jsx_runtime_1.jsx)("p", { className: "warn-box", children: "Las copias locales est\u00E1n en el mismo equipo: no protegen ante p\u00E9rdida, robo o aver\u00EDa del port\u00E1til. Guarda peri\u00F3dicamente la exportaci\u00F3n completa en una ubicaci\u00F3n autorizada por tu organizaci\u00F3n." })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Exportar", children: [(0, jsx_runtime_1.jsxs)("ul", { className: "plain export-list", children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("a", { className: "button", href: "/api/export/full", download: true, children: "Exportaci\u00F3n completa (JSON)" }), " ", (0, jsx_runtime_1.jsx)("span", { className: "hint", children: "\u00DAnica exportaci\u00F3n restaurable." })] }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("a", { className: "button", href: "/api/export/notes.zip", download: true, children: "Notas en Markdown (ZIP)" }) }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("a", { className: "button", href: "/api/export/tasks.csv", download: true, children: "Tareas en CSV" }), " ", (0, jsx_runtime_1.jsx)("span", { className: "hint", children: "Para consulta; no es copia completa." })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "La exportaci\u00F3n por proyecto est\u00E1 en la pantalla de cada proyecto." })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Restaurar desde exportaci\u00F3n completa", children: [(0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Restauraci\u00F3n completa (sin fusi\u00F3n). Se valida el archivo, se muestra qu\u00E9 se restaurar\u00E1 y se crea una copia previa." }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "application/json,.json", "aria-label": "Archivo de exportaci\u00F3n completa", onChange: pickFile }), preview && (0, jsx_runtime_1.jsxs)("div", { className: "subtle-box", children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Exportado: ", (0, dates_1.fmtDateTime)(preview.exported_at, app.tz), " \u00B7 versi\u00F3n ", preview.app_version] }), (0, jsx_runtime_1.jsx)("div", { className: "table-wrap", children: (0, jsx_runtime_1.jsxs)("table", { className: "list compact", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "Tabla" }), (0, jsx_runtime_1.jsx)("th", { children: "Actual" }), (0, jsx_runtime_1.jsx)("th", { children: "Tras restaurar" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: Object.keys(preview.incoming).map((k) => (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: k }), (0, jsx_runtime_1.jsx)("td", { children: preview.current[k] }), (0, jsx_runtime_1.jsx)("td", { children: preview.incoming[k] })] }, k)) })] }) }), (0, jsx_runtime_1.jsx)("button", { className: "danger", onClick: doRestore, children: "Restaurar (sustituye todos los datos)" })] })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Sistema", children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Versi\u00F3n ", app.boot.version, app.boot.demo ? " · MODO DEMO (datos ficticios)" : "", ". Escucha solo en 127.0.0.1. Sin conexiones externas ni telemetr\u00EDa."] }), (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Sin inicio de sesi\u00F3n: cualquier persona con acceso a tu sesi\u00F3n de Windows puede abrir la aplicaci\u00F3n. Protege tu equipo con las medidas de tu organizaci\u00F3n." }), (0, jsx_runtime_1.jsx)("button", { className: "danger", onClick: shutdown, children: "Cerrar aplicaci\u00F3n" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "sticky-save", children: (0, jsx_runtime_1.jsx)("button", { className: "primary", onClick: save, children: "Guardar configuraci\u00F3n" }) })] }));
}
/** Oficinas y festivos: comunes (todas las oficinas) o de una oficina concreta. Se guardan al momento. */
function OfficesAndHolidays() {
    const app = (0, store_1.useApp)();
    const [year, setYear] = (0, react_1.useState)(Number((0, dates_1.todayIn)(app.tz).slice(0, 4)));
    const { data: locations, reload: reloadLoc } = (0, store_1.useApi)("/api/locations");
    const { data: holidays, reload: reloadHol } = (0, store_1.useApi)(`/api/holidays?year=${year}`);
    const [locName, setLocName] = (0, react_1.useState)("");
    const [h, setH] = (0, react_1.useState)({ date: "", name: "", location_id: null });
    const [err, setErr] = (0, react_1.useState)("");
    const call = async (fn) => { try {
        await fn();
        reloadLoc();
        reloadHol();
        await app.reloadBoot();
        app.changed();
        setErr("");
        return true;
    }
    catch (e) {
        setErr(e.message);
        return false;
    } };
    return ((0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Oficinas y festivos", children: [(0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Asigna a cada persona su oficina (Equipo \u2192 Editar). Un festivo \u00ABcom\u00FAn\u00BB aplica a todas. No se infieren festivos: solo cuentan los registrados aqu\u00ED." }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: err }), (0, jsx_runtime_1.jsx)("h3", { children: "Oficinas" }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: locations?.map((l) => ((0, jsx_runtime_1.jsxs)("li", { className: "row", children: [(0, jsx_runtime_1.jsx)("strong", { className: "grow", children: l.name }), (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [l.people, " persona(s) \u00B7 ", l.holidays, " festivo(s)"] }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => { const n = window.prompt("Nuevo nombre de la oficina:", l.name); if (n?.trim())
                                void call(() => api_1.api.patch(`/api/locations/${l.id}`, { name: n.trim() })); }, children: "Renombrar" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => { if (window.confirm(`¿Eliminar «${l.name}»? Se eliminan sus festivos locales y sus personas quedan sin oficina.`))
                                void call(() => api_1.api.del(`/api/locations/${l.id}`)); }, children: "Eliminar" })] }, l.id))) }), locations && !locations.length && (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Sin oficinas: todos los festivos ser\u00E1n comunes." }), (0, jsx_runtime_1.jsxs)("form", { className: "row", onSubmit: async (e) => { e.preventDefault(); if (await call(() => api_1.api.post("/api/locations", { name: locName.trim() })))
                    setLocName(""); }, children: [(0, jsx_runtime_1.jsx)("input", { className: "grow", "aria-label": "Nueva oficina", placeholder: "Nueva oficina (p. ej. Zaragoza)", value: locName, onChange: (e) => setLocName(e.target.value) }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !locName.trim(), children: "A\u00F1adir oficina" })] }), (0, jsx_runtime_1.jsxs)("h3", { className: "row", children: ["Festivos ", (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => setYear(year - 1), "aria-label": "A\u00F1o anterior", children: "\u25C0" }), (0, jsx_runtime_1.jsx)("span", { children: year }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => setYear(year + 1), "aria-label": "A\u00F1o siguiente", children: "\u25B6" })] }), holidays && !holidays.length && (0, jsx_runtime_1.jsxs)(ui_1.Empty, { children: ["Sin festivos registrados en ", year, "."] }), (0, jsx_runtime_1.jsx)("ul", { className: "plain holidays", children: holidays?.map((x) => ((0, jsx_runtime_1.jsxs)("li", { className: "row", children: [(0, jsx_runtime_1.jsx)("span", { className: "nowrap", children: (0, dates_1.fmtDate)(x.date) }), (0, jsx_runtime_1.jsx)("span", { className: "grow", children: x.name || "Festivo" }), (0, jsx_runtime_1.jsx)("span", { className: "chip " + (x.location ? "chip-info" : "chip-neutral"), children: x.location || "Común" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", "aria-label": `Eliminar festivo ${x.date}`, onClick: () => call(() => api_1.api.del(`/api/holidays/${x.id}`)), children: "\u2715" })] }, x.id))) }), (0, jsx_runtime_1.jsxs)("form", { className: "row", onSubmit: async (e) => { e.preventDefault(); if (await call(() => api_1.api.post("/api/holidays", { date: h.date, name: h.name.trim(), location_id: h.location_id })))
                    setH({ ...h, date: "", name: "" }); }, children: [(0, jsx_runtime_1.jsx)("input", { type: "date", "aria-label": "Fecha del festivo", value: h.date, onChange: (e) => setH({ ...h, date: e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { className: "grow", "aria-label": "Nombre del festivo", placeholder: "Nombre (opcional)", value: h.name, onChange: (e) => setH({ ...h, name: e.target.value }) }), (0, jsx_runtime_1.jsx)(ui_1.LocationSelect, { value: h.location_id, onChange: (v) => setH({ ...h, location_id: v }), emptyLabel: "Com\u00FAn (todas)" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !h.date, children: "A\u00F1adir festivo" })] })] }));
}
function TagsManager() {
    const app = (0, store_1.useApp)();
    const { data, reload } = (0, store_1.useApi)("/api/tags");
    const [err, setErr] = (0, react_1.useState)("");
    const call = async (fn) => { try {
        await fn();
        reload();
        await app.reloadBoot();
        app.changed();
        setErr("");
    }
    catch (e) {
        setErr(e.message);
    } };
    return ((0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Etiquetas", count: data?.length, children: [(0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Se crean al escribirlas en una tarea o nota. Renombrar a un nombre existente fusiona ambas. Eliminar la quita de todas las tareas y notas." }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: err }), data && !data.length && (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "Sin etiquetas." }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: data?.map((t) => ((0, jsx_runtime_1.jsxs)("li", { className: "row", children: [(0, jsx_runtime_1.jsxs)("span", { className: "tagchip", children: ["#", t.name] }), (0, jsx_runtime_1.jsxs)("span", { className: "muted small grow", children: [t.tasks, " tarea(s) \u00B7 ", t.notes, " nota(s)"] }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => { const n = window.prompt("Nuevo nombre de la etiqueta:", t.name); if (n?.trim() && n.trim() !== t.name)
                                void call(() => api_1.api.patch(`/api/tags/${t.id}`, { name: n.trim() })); }, children: "Renombrar" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => { if (window.confirm(`¿Eliminar la etiqueta «${t.name}»? Se quitará de ${t.tasks} tarea(s) y ${t.notes} nota(s).`))
                                void call(() => api_1.api.del(`/api/tags/${t.id}`)); }, children: "Eliminar" })] }, t.id))) })] }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/labels":12,"../lib/store":9,"../components/ui":13}]; // build/src/views/Settings.js
defs[24]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamView = TeamView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const store_1 = require("../lib/store");
const TaskCard_1 = require("../components/TaskCard");
const ui_1 = require("../components/ui");
function TeamView({ personId }) {
    const app = (0, store_1.useApp)();
    const [tab, setTab] = (0, react_1.useState)("personas");
    const [editing, setEditing] = (0, react_1.useState)(null);
    const people = app.boot.people;
    const sel = personId ?? people.find((p) => p.is_me)?.id ?? people[0]?.id;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view", children: [(0, jsx_runtime_1.jsxs)("header", { className: "view-head row", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Equipo" }), (0, jsx_runtime_1.jsxs)("div", { role: "tablist", className: "tabs-inline", "aria-label": "Secciones de equipo", children: [(0, jsx_runtime_1.jsx)("button", { role: "tab", "aria-selected": tab === "personas", className: tab === "personas" ? "active" : "", onClick: () => setTab("personas"), children: "Personas" }), (0, jsx_runtime_1.jsx)("button", { role: "tab", "aria-selected": tab === "plan", className: tab === "plan" ? "active" : "", onClick: () => setTab("plan"), children: "Planificaci\u00F3n semanal" })] }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), (0, jsx_runtime_1.jsx)("button", { className: "primary", onClick: () => setEditing("nueva"), children: "Nueva persona" })] }), (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Vista operativa de los datos registrados. No se muestran rankings, puntuaciones ni valoraciones de desempe\u00F1o." }), tab === "personas" ? ((0, jsx_runtime_1.jsxs)("div", { className: "split", children: [(0, jsx_runtime_1.jsx)("nav", { className: "side-list", "aria-label": "Personas", children: (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: people.map((p) => ((0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsxs)("button", { className: "side-item" + (p.id === sel ? " active" : ""), "aria-current": p.id === sel, onClick: () => app.navigate(`#/equipo/${p.id}`), children: [p.name, p.is_me ? " (yo)" : "", !p.active && " · inactiva"] }) }, p.id))) }) }), sel ? (0, jsx_runtime_1.jsx)(PersonDetail, { id: sel, onEdit: (p) => setEditing(p) }) : (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "A\u00F1ade personas del equipo." })] })) : (0, jsx_runtime_1.jsx)(WeekPlan, {}), editing && (0, jsx_runtime_1.jsx)(PersonForm, { person: editing === "nueva" ? null : editing, onClose: () => setEditing(null) })] }));
}
function PersonDetail({ id, onEdit }) {
    const app = (0, store_1.useApp)();
    const { data: p, error, reload } = (0, store_1.useApi)(`/api/people/${id}/view`);
    const [abs, setAbs] = (0, react_1.useState)({ start_date: "", end_date: "", label: "" });
    const [err, setErr] = (0, react_1.useState)("");
    if (!p)
        return (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error, onRetry: reload }) });
    const list = (ts, empty) => ts.length ? (0, jsx_runtime_1.jsx)("div", { className: "cards", children: ts.map((t) => (0, jsx_runtime_1.jsx)(TaskCard_1.TaskCard, { task: t, showStatus: true }, t.id)) }) : (0, jsx_runtime_1.jsx)("p", { className: "muted", children: empty });
    const addAbs = async () => {
        try {
            await api_1.api.post("/api/absences", { person_id: id, ...abs });
            setAbs({ start_date: "", end_date: "", label: "" });
            reload();
            app.changed();
            setErr("");
        }
        catch (e) {
            setErr(e.message);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "person-detail", children: [(0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsxs)("h2", { children: [p.name, p.is_me ? " (yo)" : ""] }), p.role && (0, jsx_runtime_1.jsx)("span", { className: "muted", children: p.role }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => app.quickTask({ assignee_id: p.id }), children: ["Nueva tarea para ", p.is_me ? "mí" : p.name] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => onEdit(p), children: "Editar" })] }), (0, jsx_runtime_1.jsxs)("p", { className: "muted", children: ["Oficina: ", p.location_name || "no informada", " \u00B7 Capacidad semanal: ", p.weekly_capacity_hours !== null ? `${p.weekly_capacity_hours} h` : "no informada", " \u00B7 Esfuerzo estimado registrado (no backlog): ", p.estimate.known_hours !== null ? `${p.estimate.known_hours} h en ${p.estimate.tasks_with_estimate} tareas` : "no informado", p.estimate.tasks_without_estimate > 0 && ` · ${p.estimate.tasks_without_estimate} sin estimación`] }), (0, jsx_runtime_1.jsxs)("p", { className: "muted", children: ["Proyectos: ", p.projects.length ? p.projects.map((x) => `${x.name}${x.dedication_pct !== null ? ` (${x.dedication_pct}%)` : ""}`).join(", ") : "ninguno vinculado"] }), !p.active_tasks.length && !p.in_review.length && (0, jsx_runtime_1.jsx)("p", { className: "empty", children: "Sin tareas activas registradas." }), (0, jsx_runtime_1.jsxs)("div", { className: "grid2", children: [(0, jsx_runtime_1.jsx)(ui_1.Section, { title: "Tareas activas", count: p.active_tasks.length, children: list(p.active_tasks, "Sin tareas activas registradas.") }), (0, jsx_runtime_1.jsx)(ui_1.Section, { title: "En revisi\u00F3n", count: p.in_review.length, children: list(p.in_review, "Ninguna.") }), (0, jsx_runtime_1.jsx)(ui_1.Section, { title: "Pr\u00F3ximos vencimientos (14 d\u00EDas)", count: p.upcoming_due.length, children: list(p.upcoming_due, "Ninguno registrado.") }), (0, jsx_runtime_1.jsx)(ui_1.Section, { title: "Con espera o bloqueo", count: p.blocked.length, children: list(p.blocked, "Ninguna.") }), (0, jsx_runtime_1.jsx)(ui_1.Section, { title: "Planificado esta semana", count: p.planned_week.length, children: list(p.planned_week, "Nada planificado con fecha esta semana.") }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Ausencias y festivos registrados", children: [p.absences.length ? (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: p.absences.map((a) => (0, jsx_runtime_1.jsxs)("li", { children: ["Ausencia ", (0, dates_1.fmtDate)(a.start_date), " \u2013 ", (0, dates_1.fmtDate)(a.end_date), " ", a.label && (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: ["\u00B7 ", a.label] }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: async () => { if (window.confirm("¿Eliminar esta ausencia?")) {
                                                await api_1.api.del(`/api/absences/${a.id}`);
                                                reload();
                                                app.changed();
                                            } }, children: "Eliminar" })] }, a.id)) })
                                : (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Sin ausencias registradas." }), p.holidays.length > 0 && (0, jsx_runtime_1.jsxs)("p", { className: "muted small", children: ["Festivos pr\u00F3ximos: ", p.holidays.map((h) => `${(0, dates_1.fmtDate)(h.date)}${h.location ? "" : " (común)"}`).join(", ")] }), (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("input", { type: "date", "aria-label": "Desde", value: abs.start_date, onChange: (e) => setAbs({ ...abs, start_date: e.target.value, end_date: abs.end_date || e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { type: "date", "aria-label": "Hasta", value: abs.end_date, onChange: (e) => setAbs({ ...abs, end_date: e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { className: "grow", "aria-label": "Etiqueta opcional", placeholder: "Etiqueta (opcional)", value: abs.label, onChange: (e) => setAbs({ ...abs, label: e.target.value }) }), (0, jsx_runtime_1.jsx)("button", { disabled: !abs.start_date || !abs.end_date, onClick: addAbs, children: "Registrar ausencia" })] }), (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "No se piden motivos. Las tareas no se reasignan autom\u00E1ticamente." }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: err })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Section, { title: "\u00DAltimas actualizaciones de sus tareas", children: p.recent_updates.length ? (0, jsx_runtime_1.jsx)("ul", { className: "history", children: p.recent_updates.map((u, i) => (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "h-meta", children: [(0, jsx_runtime_1.jsx)("time", { children: (0, dates_1.fmtDateTime)(u.at, app.tz) }), " \u00B7 ", (0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.openTask(u.task_id), children: u.title })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-text", children: u.text })] }, i)) })
                    : (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Sin actualizaciones registradas." }) })] }));
}
function WeekPlan() {
    const app = (0, store_1.useApp)();
    const [week, setWeek] = (0, react_1.useState)((0, dates_1.weekStart)((0, dates_1.todayIn)(app.tz)));
    const { data, error, reload } = (0, store_1.useApi)(`/api/planning?week=${week}`);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setWeek((0, dates_1.addDays)(week, -7)), "aria-label": "Semana anterior", children: "\u25C0" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setWeek((0, dates_1.weekStart)((0, dates_1.todayIn)(app.tz))), children: "Esta semana" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setWeek((0, dates_1.addDays)(week, 7)), "aria-label": "Semana siguiente", children: "\u25B6" }), (0, jsx_runtime_1.jsxs)("strong", { children: ["Semana del ", (0, dates_1.fmtDate)(week), " al ", (0, dates_1.fmtDate)((0, dates_1.addDays)(week, 6))] })] }), (0, jsx_runtime_1.jsxs)("details", { className: "mini", children: [(0, jsx_runtime_1.jsx)("summary", { children: "\u00BFC\u00F3mo se calcula?" }), (0, jsx_runtime_1.jsxs)("ul", { className: "hint", children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Esfuerzo registrado" }), ": estimaci\u00F3n de las tareas planificadas esa semana (o el reparto semanal expl\u00EDcito si lo hay). Las tareas sin estimaci\u00F3n se listan aparte; nunca cuentan como 0."] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Disponible" }), ": capacidad semanal \u00D7 d\u00EDas laborables que quedan tras festivos (comunes y de su oficina) y ausencias registrados."] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Por proyecto" }), ": dedicaci\u00F3n (% de su capacidad, definido en cada proyecto) frente al esfuerzo estimado de las tareas de ese proyecto."] }), (0, jsx_runtime_1.jsx)("li", { children: "Son datos de referencia para planificar; no miden rendimiento ni horas trabajadas." })] })] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error, onRetry: reload }), (0, jsx_runtime_1.jsx)("div", { className: "plan", children: data?.people.map((p) => {
                    const av = p.availability;
                    return (0, jsx_runtime_1.jsxs)("article", { className: "plan-person", children: [(0, jsx_runtime_1.jsx)("h3", { children: p.name }), (0, jsx_runtime_1.jsxs)("dl", { className: "facts", children: [(0, jsx_runtime_1.jsx)("dt", { children: "Esfuerzo registrado" }), (0, jsx_runtime_1.jsxs)("dd", { children: [(0, jsx_runtime_1.jsx)("strong", { children: p.counted_hours !== null ? `${p.counted_hours} h` : "no informado" }), p.unestimated.length > 0 && (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: [" + ", p.unestimated.length, " sin estimar"] })] }), av && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("dt", { children: "Disponible" }), (0, jsx_runtime_1.jsxs)("dd", { children: [av.available_hours !== null ? `${av.available_hours} h` : "capacidad no informada", " ", (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: ["(", av.available_days, " de ", av.nominal_days, " d\u00EDas laborables", av.holiday_days ? ` · ${av.holiday_days} festivo(s)` : "", av.absence_days ? ` · ${av.absence_days} de ausencia` : "", ")"] })] })] })] }), av?.available_hours != null && p.counted_hours !== null && p.counted_hours > av.available_hours && (0, jsx_runtime_1.jsx)("p", { children: (0, jsx_runtime_1.jsx)(ui_1.Chip, { tone: "warn", children: "El esfuerzo registrado supera lo disponible" }) }), p.by_project.length > 0 && (0, jsx_runtime_1.jsxs)("table", { className: "list compact", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "Proyecto" }), (0, jsx_runtime_1.jsx)("th", { children: "Dedicaci\u00F3n" }), (0, jsx_runtime_1.jsx)("th", { children: "Estimado" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: p.by_project.map((b) => (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { className: "wrap", children: b.name }), (0, jsx_runtime_1.jsx)("td", { children: b.dedication_pct !== null ? `${b.dedication_pct}%${b.dedication_hours !== null ? ` · ${b.dedication_hours} h` : ""}` : "—" }), (0, jsx_runtime_1.jsxs)("td", { children: [b.counted_hours !== null ? `${b.counted_hours} h` : "—", b.unestimated ? (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: [" +", b.unestimated, " sin est."] }) : null, b.dedication_hours !== null && b.counted_hours !== null && b.counted_hours > b.dedication_hours && (0, jsx_runtime_1.jsx)("span", { title: "Supera la dedicaci\u00F3n registrada", children: " \u26A0" })] })] }, String(b.project_id))) })] }), p.conflicts.length > 0 && (0, jsx_runtime_1.jsxs)("div", { className: "warn-box", role: "note", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Coincide con festivo o ausencia registrados:" }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: p.conflicts.map((c, i) => (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.openTask(c.task_id), children: c.title }), " \u00B7 ", c.field === "due_date" ? "vence" : "planificada", " el ", (0, dates_1.fmtDate)(c.date), " (", c.reason, ")"] }, i)) })] }), (0, jsx_runtime_1.jsxs)("details", { className: "mini", children: [(0, jsx_runtime_1.jsxs)("summary", { children: ["Tareas de la semana (", p.counted.length + p.unestimated.length + p.split_into_subtasks.length, ")"] }), (0, jsx_runtime_1.jsxs)("ul", { className: "plain", children: [p.counted.map((t) => (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.openTask(t.id), children: t.title }), " \u00B7 ", t.counted_hours, " h ", (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: ["(", t.source === "reparto" ? "reparto semanal" : "estimación", ")"] })] }, t.id)), p.unestimated.map((t) => (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.openTask(t.id), children: t.title }), " \u00B7 ", (0, jsx_runtime_1.jsx)("span", { className: "muted", children: "sin estimaci\u00F3n" })] }, t.id)), p.split_into_subtasks.map((t) => (0, jsx_runtime_1.jsxs)("li", { className: "muted", children: [t.title, " \u00B7 se cuentan sus subtareas"] }, t.id))] })] })] }, String(p.person_id));
                }) })] }));
}
function PersonForm({ person, onClose }) {
    const app = (0, store_1.useApp)();
    const [name, setName] = (0, react_1.useState)(person?.name || "");
    const [role, setRole] = (0, react_1.useState)(person?.role || "");
    const [cap, setCap] = (0, react_1.useState)(person?.weekly_capacity_hours?.toString() || "");
    const [loc, setLoc] = (0, react_1.useState)(person?.location_id ?? null);
    const [active, setActive] = (0, react_1.useState)(person ? !!person.active : true);
    const [error, setError] = (0, react_1.useState)("");
    const submit = async () => {
        const body = { name: name.trim(), role, weekly_capacity_hours: cap === "" ? null : Number(cap), location_id: loc, active };
        try {
            if (person)
                await api_1.api.patch(`/api/people/${person.id}`, body);
            else
                await api_1.api.post("/api/people", body);
            await app.reloadBoot();
            app.changed();
            onClose();
        }
        catch (e) {
            setError(e.message);
        }
    };
    return ((0, jsx_runtime_1.jsx)(ui_1.Modal, { title: person ? "Editar persona" : "Nueva persona", onClose: onClose, children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => { e.preventDefault(); void submit(); }, children: [(0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Nombre", children: (0, jsx_runtime_1.jsx)("input", { value: name, onChange: (e) => setName(e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Rol (opcional)", children: (0, jsx_runtime_1.jsx)("input", { value: role, onChange: (e) => setRole(e.target.value) }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Oficina (opcional)", hint: "Determina qu\u00E9 festivos locales le aplican. Gestiona oficinas en Configuraci\u00F3n.", children: (0, jsx_runtime_1.jsx)(ui_1.LocationSelect, { value: loc, onChange: setLoc }) }), (0, jsx_runtime_1.jsx)(ui_1.Field, { label: "Capacidad semanal en horas (opcional)", hint: "Vac\u00EDo = no informada. Se combina con la dedicaci\u00F3n por proyecto y con festivos/ausencias en la Planificaci\u00F3n semanal.", children: (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "168", value: cap, onChange: (e) => setCap(e.target.value) }) }), person && (0, jsx_runtime_1.jsxs)("label", { className: "check", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: active, onChange: (e) => setActive(e.target.checked) }), " Activa (desmarca para ocultarla sin borrar su historial)"] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error }), (0, jsx_runtime_1.jsxs)("div", { className: "modal-foot", children: [(0, jsx_runtime_1.jsx)("button", { className: "primary", type: "submit", disabled: !name.trim(), children: "Guardar" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, children: "Cancelar" })] })] }) }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/store":9,"../components/TaskCard":22,"../components/ui":13}]; // build/src/views/Team.js
defs[25]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodayView = TodayView;
exports.Reminders = Reminders;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const labels_1 = require("../lib/labels");
const store_1 = require("../lib/store");
const ReminderForm_1 = require("../components/ReminderForm");
const TaskCard_1 = require("../components/TaskCard");
const TaskPanel_1 = require("../components/TaskPanel");
const ui_1 = require("../components/ui");
function TodayView() {
    const app = (0, store_1.useApp)();
    const { data, error, reload } = (0, store_1.useApi)("/api/today");
    if (!data)
        return (0, jsx_runtime_1.jsxs)("div", { className: "view", children: [(0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error, onRetry: reload }), !error && (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Cargando\u2026" })] });
    const s = data.sections;
    const nothing = !s.vence.length && !s.revisar.length && !s.bloqueos_externos.length && !s.depende_de_mi.length && !data.reminders.length;
    const act = async (t, body, msg) => {
        try {
            if (await (0, TaskPanel_1.patchTask)(t.id, body)) {
                app.changed();
                app.toast(msg, "ok");
            }
        }
        catch (e) {
            app.toast(e.message, "error");
        }
    };
    const actions = (t) => (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [t.status === "backlog" && (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => act(t, { status: "pendiente" }, "Promovida a Pendiente"), children: "Promover" }), (0, jsx_runtime_1.jsx)("button", { className: "ghost small", onClick: () => act(t, { status: "hecha" }, "Marcada como hecha"), children: "Hecha" })] });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view today", children: [(0, jsx_runtime_1.jsxs)("header", { className: "view-head", children: [(0, jsx_runtime_1.jsxs)("h1", { children: ["Hoy \u00B7 ", (0, dates_1.fmtDate)(data.today)] }), (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Resumen de atenci\u00F3n. Cada tarea aparece una sola vez; las dem\u00E1s se\u00F1ales se indican en la tarjeta." })] }), nothing && (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "Nada requiere acci\u00F3n seg\u00FAn los datos registrados. Esto no significa que todo est\u00E9 bien: revisa los proyectos si hace tiempo que no los actualizas." }), (0, jsx_runtime_1.jsxs)("div", { className: "today-grid", children: [(0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Vence hoy y esta semana", count: s.vence.length, id: "sec-vence", children: [s.vence.length ? (0, jsx_runtime_1.jsx)("div", { className: "cards", children: s.vence.map((t) => (0, jsx_runtime_1.jsx)(TaskCard_1.TaskCard, { task: t, showStatus: true, actions: actions(t) }, t.id)) })
                                : (0, jsx_runtime_1.jsxs)(ui_1.Empty, { children: ["Sin vencimientos registrados hasta el ", (0, dates_1.fmtDate)(data.week_end), "."] }), data.milestones.length > 0 && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Hitos y compromisos" }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: data.milestones.map((m) => ((0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)(ui_1.Chip, { children: labels_1.MILESTONE_KIND[m.kind] }), " ", (0, dates_1.fmtDate)(m.date), " \u00B7 ", (0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.navigate(`#/proyectos/${m.project_id}`), children: m.project_name }), ": ", m.title] }, m.id))) })] })] }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Revisiones y recordatorios", count: s.revisar.length + data.reminders.length, id: "sec-rev", children: [s.revisar.length > 0 && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Pendientes de mi revisi\u00F3n" }), (0, jsx_runtime_1.jsx)("div", { className: "cards", children: s.revisar.map((t) => (0, jsx_runtime_1.jsx)(TaskCard_1.TaskCard, { task: t, showStatus: true }, t.id)) })] }), (0, jsx_runtime_1.jsx)(Reminders, { items: data.reminders, onChange: reload }), !s.revisar.length && !data.reminders.length && (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "Sin revisiones ni recordatorios pendientes." }), (0, jsx_runtime_1.jsxs)("details", { className: "mini", children: [(0, jsx_runtime_1.jsx)("summary", { children: "Programar un recordatorio" }), (0, jsx_runtime_1.jsx)(ReminderForm_1.ReminderForm, { onCreated: reload })] })] }), (0, jsx_runtime_1.jsx)(ui_1.Section, { title: "Bloqueos externos", count: s.bloqueos_externos.length, id: "sec-bloq", children: s.bloqueos_externos.length ? (0, jsx_runtime_1.jsx)("div", { className: "cards", children: s.bloqueos_externos.map((t) => (0, jsx_runtime_1.jsx)(TaskCard_1.TaskCard, { task: t, showStatus: true }, t.id)) })
                            : (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "Sin esperas ni bloqueos registrados." }) }), (0, jsx_runtime_1.jsxs)(ui_1.Section, { title: "Tareas que dependen de m\u00ED", count: s.depende_de_mi.length, id: "sec-mi", children: [app.meId === null && (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "Configura qui\u00E9n eres en Equipo." }), s.depende_de_mi.length ? (0, jsx_runtime_1.jsx)("div", { className: "cards", children: s.depende_de_mi.map((t) => (0, jsx_runtime_1.jsx)(TaskCard_1.TaskCard, { task: t, showStatus: true }, t.id)) })
                                : (0, jsx_runtime_1.jsx)(ui_1.Empty, { children: "Ninguna tarea registrada est\u00E1 esperando por ti (fuera de las secciones anteriores)." })] }), (0, jsx_runtime_1.jsx)(ui_1.Section, { title: "Resumen operativo del equipo", id: "sec-eq", children: (0, jsx_runtime_1.jsx)("ul", { className: "plain team-list", children: data.team.map((p) => {
                                const counts = [p.active ? `${p.active} activas` : "", p.in_review ? `${p.in_review} en revisión` : "",
                                    p.blocked ? `${p.blocked} con espera/bloqueo` : "", p.due_this_week ? `${p.due_this_week} vencen esta semana` : ""].filter(Boolean);
                                return (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsxs)("button", { className: "linklike strong", onClick: () => app.navigate(`#/equipo/${p.person_id}`), children: [p.name, p.is_me ? " (yo)" : ""] }), (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: [" \u00B7 ", counts.length ? counts.join(" · ") : "Sin tareas activas registradas"] }), (p.absences.length > 0 || p.holidays.length > 0) && (0, jsx_runtime_1.jsxs)("div", { className: "team-avail", children: [p.absences.map((a) => (0, jsx_runtime_1.jsxs)("span", { children: ["Ausencia ", (0, dates_1.fmtDate)(a.start_date), a.end_date !== a.start_date ? `–${(0, dates_1.fmtDate)(a.end_date)}` : ""] }, "a" + a.id)), p.holidays.map((h) => (0, jsx_runtime_1.jsxs)("span", { children: ["Festivo ", (0, dates_1.fmtDate)(h.date), h.location ? ` (${h.location})` : ""] }, "h" + h.date))] })] }, p.person_id);
                            }) }) })] })] }));
}
function Reminders({ items, onChange }) {
    const app = (0, store_1.useApp)();
    const [err, setErr] = (0, react_1.useState)("");
    if (!items.length)
        return null;
    const groups = new Map();
    for (const r of items)
        groups.set(r.rule_label, [...(groups.get(r.rule_label) || []), r]);
    const act = async (r, action, until) => {
        try {
            await api_1.api.post(`/api/reminders/${r.id}/action`, { action, until });
            onChange();
            app.changed();
        }
        catch (e) {
            setErr(e.message);
        }
    };
    const tomorrow9 = (0, dates_1.zonedToUtc)((0, dates_1.addDays)((0, dates_1.todayIn)(app.tz), 1) + "T09:00", app.tz);
    const in2h = new Date(Date.now() + 2 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
    return ((0, jsx_runtime_1.jsxs)("div", { className: "reminders", children: [(0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: err }), [...groups.entries()].map(([label, rs]) => ((0, jsx_runtime_1.jsxs)("div", { className: "rem-group", children: [(0, jsx_runtime_1.jsxs)("h3", { children: [label, " ", (0, jsx_runtime_1.jsxs)("span", { className: "count", children: ["(", rs.length, ")"] })] }), (0, jsx_runtime_1.jsx)("ul", { className: "plain", children: rs.map((r) => ((0, jsx_runtime_1.jsxs)("li", { className: "rem", children: [(0, jsx_runtime_1.jsxs)("div", { className: "rem-text", children: [r.task_id ? (0, jsx_runtime_1.jsx)("button", { className: "linklike", onClick: () => app.openTask(r.task_id), children: r.task_title }) : (0, jsx_runtime_1.jsx)("strong", { children: r.title }), (0, jsx_runtime_1.jsxs)("span", { className: "muted small", children: [" \u00B7 ", r.task_id ? r.title : "", r.project_name ? ` · ${r.project_name}` : "", " \u00B7 desde ", (0, dates_1.fmtDateTime)(r.due_at, app.tz), r.task_shown_elsewhere ? " · también arriba" : ""] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "row tight", children: [(0, jsx_runtime_1.jsx)("button", { className: "small", onClick: () => act(r, "atendido"), children: "Atendido" }), (0, jsx_runtime_1.jsx)("button", { className: "small", onClick: () => act(r, "posponer", in2h), children: "+2 h" }), (0, jsx_runtime_1.jsx)("button", { className: "small", onClick: () => act(r, "posponer", tomorrow9), children: "Ma\u00F1ana 9:00" }), (0, jsx_runtime_1.jsx)("button", { className: "small ghost", onClick: () => act(r, "descartar"), children: "Descartar" })] })] }, r.id))) })] }, label)))] }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/labels":12,"../lib/store":9,"../components/ReminderForm":17,"../components/TaskCard":22,"../components/TaskPanel":15,"../components/ui":13}]; // build/src/views/Today.js
defs[26]=[function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkView = WorkView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../lib/api");
const dates_1 = require("../lib/dates");
const store_1 = require("../lib/store");
const Recurrences_1 = require("../components/Recurrences");
const TaskViews_1 = require("../components/TaskViews");
const ui_1 = require("../components/ui");
function WorkView() {
    const app = (0, store_1.useApp)();
    const [mode, setMode] = (0, react_1.useState)("kanban");
    const [filters, setFilters] = (0, react_1.useState)({});
    const [groupBy, setGroupBy] = (0, react_1.useState)("ninguna");
    const [calMode, setCalMode] = (0, react_1.useState)("semana");
    const [anchor, setAnchor] = (0, react_1.useState)((0, dates_1.todayIn)(app.tz));
    const [viewId, setViewId] = (0, react_1.useState)("");
    const [recurrences, setRecurrences] = (0, react_1.useState)(false);
    let url = mode === "archivadas" ? "/api/tasks?archived=only" : "/api/tasks" + (0, TaskViews_1.filtersToQuery)(filters);
    if (mode === "calendario") {
        const days = calMode === "semana" ? [(0, dates_1.weekStart)(anchor), (0, dates_1.addDays)((0, dates_1.weekStart)(anchor), 6)] : [(0, dates_1.monthGrid)(anchor)[0], (0, dates_1.monthGrid)(anchor)[41]];
        url += (url.includes("?") ? "&" : "?") + `date_from=${days[0]}&date_to=${days[1]}`;
    }
    const { data, error, reload } = (0, store_1.useApi)(url);
    const applyView = (id) => {
        setViewId(id);
        const v = app.boot.saved_views.find((x) => String(x.id) === id);
        if (v) {
            setMode(v.view);
            setFilters(v.filters || {});
        }
    };
    const saveView = async () => {
        const name = window.prompt("Nombre de la vista guardada:");
        if (!name?.trim())
            return;
        try {
            const v = await api_1.api.post("/api/saved-views", { name: name.trim(), view: mode === "archivadas" ? "lista" : mode, filters });
            await app.reloadBoot();
            setViewId(String(v.id));
            app.toast("Vista guardada", "ok");
        }
        catch (e) {
            app.toast(e.message, "error");
        }
    };
    (0, react_1.useEffect)(() => { if (filters.project_id && groupBy === "ninguna")
        setGroupBy("linea"); }, [filters.project_id]);
    const tabs = [["kanban", "Kanban"], ["lista", "Lista"], ["calendario", "Calendario"], ["archivadas", "Archivadas"]];
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view", children: [(0, jsx_runtime_1.jsxs)("header", { className: "view-head row", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Trabajo" }), (0, jsx_runtime_1.jsx)("div", { role: "tablist", "aria-label": "Tipo de vista", className: "tabs-inline", children: tabs.map(([m, label]) => (0, jsx_runtime_1.jsx)("button", { role: "tab", "aria-selected": mode === m, className: mode === m ? "active" : "", onClick: () => setMode(m), children: label }, m)) }), (0, jsx_runtime_1.jsx)("span", { className: "spacer" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setRecurrences(true), title: "Ver y gestionar todas las series recurrentes", children: "\u21BB Recurrentes" }), mode !== "archivadas" && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Vista guardada ", (0, jsx_runtime_1.jsxs)("select", { value: viewId, onChange: (e) => applyView(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "\u2014" }), app.boot.saved_views.map((v) => (0, jsx_runtime_1.jsx)("option", { value: v.id, children: v.name }, v.id))] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: saveView, children: "Guardar vista" }), viewId && (0, jsx_runtime_1.jsx)("button", { className: "ghost", onClick: async () => { if (window.confirm("¿Eliminar esta vista guardada? Las tareas no se ven afectadas.")) {
                                    await api_1.api.del(`/api/saved-views/${viewId}`);
                                    setViewId("");
                                    await app.reloadBoot();
                                } }, children: "Eliminar vista" })] })] }), mode === "archivadas" ? (0, jsx_runtime_1.jsx)("p", { className: "hint", children: "Tareas archivadas: rest\u00E1uralas o elim\u00EDnalas definitivamente. Archivar oculta una tarea de todas las vistas sin borrarla." }) : (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(TaskViews_1.FilterBar, { filters: filters, setFilters: (f) => { setFilters(f); setViewId(""); } }), (0, jsx_runtime_1.jsx)(TaskViews_1.WeekAvailabilityStrip, {}), mode === "kanban" && (0, jsx_runtime_1.jsxs)("div", { className: "row", children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Agrupar por ", (0, jsx_runtime_1.jsxs)("select", { value: groupBy, onChange: (e) => setGroupBy(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "ninguna", children: "Sin agrupar" }), (0, jsx_runtime_1.jsx)("option", { value: "proyecto", children: "Proyecto" }), (0, jsx_runtime_1.jsx)("option", { value: "persona", children: "Persona" }), (0, jsx_runtime_1.jsx)("option", { value: "linea", children: "L\u00EDnea de trabajo" }), (0, jsx_runtime_1.jsx)("option", { value: "fase", children: "Fase" }), (0, jsx_runtime_1.jsx)("option", { value: "entregable", children: "Entregable" })] })] }), (0, jsx_runtime_1.jsx)("span", { className: "hint", children: "Backlog y terminadas ocultos por defecto (act\u00EDvalos en los filtros)." })] })] }), (0, jsx_runtime_1.jsx)(ui_1.ErrorBox, { error: error, onRetry: reload }), !data ? (0, jsx_runtime_1.jsx)("p", { className: "muted", children: "Cargando\u2026" }) :
                mode === "kanban" ? (0, jsx_runtime_1.jsx)(TaskViews_1.Board, { tasks: data, showBacklog: !!filters.include_backlog, showDone: !!filters.include_closed, groupBy: groupBy }) :
                    mode === "lista" ? (0, jsx_runtime_1.jsx)(TaskViews_1.TaskTable, { tasks: data }) :
                        mode === "archivadas" ? (0, jsx_runtime_1.jsx)(TaskViews_1.TaskTable, { tasks: data, archived: true }) :
                            (0, jsx_runtime_1.jsx)(TaskViews_1.Calendar, { tasks: data, mode: calMode, setMode: setCalMode, anchor: anchor, setAnchor: setAnchor }), recurrences && (0, jsx_runtime_1.jsx)(Recurrences_1.RecurrencesModal, { onClose: () => setRecurrences(false) })] }));
}

},{"react/jsx-runtime":1,"react":2,"../lib/api":7,"../lib/dates":8,"../lib/store":9,"../components/Recurrences":11,"../components/TaskViews":21,"../components/ui":13}]; // build/src/views/Work.js
req(0);
})();
