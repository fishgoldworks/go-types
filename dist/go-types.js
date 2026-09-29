/*! go-types v2.0.0

The MIT License

Copyright 2015 Michael Ko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else if (typeof define === 'function' && define.amd) define([], factory);
    else root.Types = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    var module = {exports: {}};
    var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// src/isUndefined.js
var require_isUndefined = __commonJS({
  "src/isUndefined.js"(exports2, module2) {
    function isUndefined(value) {
      return value === void 0;
    }
    __name(isUndefined, "isUndefined");
    module2.exports = isUndefined;
  }
});

// src/isNull.js
var require_isNull = __commonJS({
  "src/isNull.js"(exports2, module2) {
    function isNull(value) {
      return value === null;
    }
    __name(isNull, "isNull");
    module2.exports = isNull;
  }
});

// src/isObject.js
var require_isObject = __commonJS({
  "src/isObject.js"(exports2, module2) {
    function isObject(value) {
      const type = typeof value;
      return type === "object" ? value !== null : type === "function" || type === "undefined" && value !== void 0;
    }
    __name(isObject, "isObject");
    module2.exports = isObject;
  }
});

// src/util/hasNativeBrand.js
var require_hasNativeBrand = __commonJS({
  "src/util/hasNativeBrand.js"(exports2, module2) {
    var isObject = require_isObject();
    function hasNativeBrand(value, method) {
      if (!isObject(value) || typeof method !== "function") {
        return false;
      }
      try {
        method.call(value);
        return true;
      } catch (error) {
        return false;
      }
    }
    __name(hasNativeBrand, "hasNativeBrand");
    module2.exports = hasNativeBrand;
  }
});

// src/util/nativeTypes.js
var require_nativeTypes = __commonJS({
  "src/util/nativeTypes.js"(exports2, module2) {
    "use strict";
    var nativeTypes;
    try {
      if (typeof process === "object" && process !== null) {
        const getBuiltinModule = process.getBuiltinModule;
        if (typeof getBuiltinModule === "function") {
          const util = getBuiltinModule.call(process, "node:util");
          nativeTypes = util && util.types;
        }
      }
    } catch (error) {
    }
    module2.exports = nativeTypes;
  }
});

// src/isBoolean.js
var require_isBoolean = __commonJS({
  "src/isBoolean.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var valueOf = Boolean.prototype.valueOf;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isBooleanObject === "function" ? nativeTypes.isBooleanObject : (value) => hasNativeBrand(value, valueOf);
    function isBoolean(value) {
      return typeof value === "boolean" || checkNativeBrand(value);
    }
    __name(isBoolean, "isBoolean");
    module2.exports = isBoolean;
  }
});

// src/isNumber.js
var require_isNumber = __commonJS({
  "src/isNumber.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var valueOf = Number.prototype.valueOf;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isNumberObject === "function" ? nativeTypes.isNumberObject : (value) => hasNativeBrand(value, valueOf);
    function isNumber(value) {
      return typeof value === "number" || checkNativeBrand(value);
    }
    __name(isNumber, "isNumber");
    module2.exports = isNumber;
  }
});

// src/isString.js
var require_isString = __commonJS({
  "src/isString.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var valueOf = String.prototype.valueOf;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isStringObject === "function" ? nativeTypes.isStringObject : (value) => hasNativeBrand(value, valueOf);
    function isString(value) {
      return typeof value === "string" || checkNativeBrand(value);
    }
    __name(isString, "isString");
    module2.exports = isString;
  }
});

// src/isSymbol.js
var require_isSymbol = __commonJS({
  "src/isSymbol.js"(exports2, module2) {
    function isSymbol(value) {
      return typeof value === "symbol";
    }
    __name(isSymbol, "isSymbol");
    module2.exports = isSymbol;
  }
});

// src/isBigInt.js
var require_isBigInt = __commonJS({
  "src/isBigInt.js"(exports2, module2) {
    function isBigInt(value) {
      return typeof value === "bigint";
    }
    __name(isBigInt, "isBigInt");
    module2.exports = isBigInt;
  }
});

// src/isPrimitive.js
var require_isPrimitive = __commonJS({
  "src/isPrimitive.js"(exports2, module2) {
    var isObject = require_isObject();
    function isPrimitive(value) {
      return !isObject(value);
    }
    __name(isPrimitive, "isPrimitive");
    module2.exports = isPrimitive;
  }
});

// src/isNullish.js
var require_isNullish = __commonJS({
  "src/isNullish.js"(exports2, module2) {
    function isNullish(value) {
      return value === null || value === void 0;
    }
    __name(isNullish, "isNullish");
    module2.exports = isNullish;
  }
});

// src/isArray.js
var require_isArray = __commonJS({
  "src/isArray.js"(exports2, module2) {
    var nativeIsArray = Array.isArray;
    function isArray(value) {
      return nativeIsArray(value);
    }
    __name(isArray, "isArray");
    module2.exports = isArray;
  }
});

// src/isMap.js
var require_isMap = __commonJS({
  "src/isMap.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var has = typeof Map === "function" ? Map.prototype.has : void 0;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isMap === "function" ? nativeTypes.isMap : (value) => hasNativeBrand(value, has);
    function isMap(value) {
      return checkNativeBrand(value);
    }
    __name(isMap, "isMap");
    module2.exports = isMap;
  }
});

// src/isSet.js
var require_isSet = __commonJS({
  "src/isSet.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var has = typeof Set === "function" ? Set.prototype.has : void 0;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isSet === "function" ? nativeTypes.isSet : (value) => hasNativeBrand(value, has);
    function isSet(value) {
      return checkNativeBrand(value);
    }
    __name(isSet, "isSet");
    module2.exports = isSet;
  }
});

// src/util/getArrayLikeLength.js
var require_getArrayLikeLength = __commonJS({
  "src/util/getArrayLikeLength.js"(exports2, module2) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    function getArrayLikeLength(value) {
      if (value === null || value === void 0 || typeof value === "function") {
        return void 0;
      }
      var length = value.length;
      return typeof length === "number" && length >= 0 && length <= MAX_SAFE_INTEGER && Math.floor(length) === length ? length : void 0;
    }
    __name(getArrayLikeLength, "getArrayLikeLength");
    module2.exports = getArrayLikeLength;
  }
});

// src/isPlainObject.js
var require_isPlainObject = __commonJS({
  "src/isPlainObject.js"(exports2, module2) {
    var getPrototypeOf = Object.getPrototypeOf;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var functionToString = Function.prototype.toString;
    var objectConstructorSource = functionToString.call(Object);
    function isPlainObject(value) {
      if (value === null || typeof value !== "object") {
        return false;
      }
      var prototype = getPrototypeOf(value);
      if (prototype === null) {
        return true;
      }
      if (getPrototypeOf(prototype) !== null) {
        return false;
      }
      var descriptor = getOwnPropertyDescriptor(prototype, "constructor");
      return !!descriptor && typeof descriptor.value === "function" && descriptor.value.prototype === prototype && functionToString.call(descriptor.value) === objectConstructorSource;
    }
    __name(isPlainObject, "isPlainObject");
    module2.exports = isPlainObject;
  }
});

// src/isIterable.js
var require_isIterable = __commonJS({
  "src/isIterable.js"(exports2, module2) {
    function isIterable(value) {
      return value !== null && value !== void 0 && typeof Symbol === "function" && Symbol.iterator !== void 0 && typeof value[Symbol.iterator] === "function";
    }
    __name(isIterable, "isIterable");
    module2.exports = isIterable;
  }
});

// src/isAsyncIterable.js
var require_isAsyncIterable = __commonJS({
  "src/isAsyncIterable.js"(exports2, module2) {
    function isAsyncIterable(value) {
      return value !== null && value !== void 0 && typeof value[Symbol.asyncIterator] === "function";
    }
    __name(isAsyncIterable, "isAsyncIterable");
    module2.exports = isAsyncIterable;
  }
});

// src/isIteratorLike.js
var require_isIteratorLike = __commonJS({
  "src/isIteratorLike.js"(exports2, module2) {
    var isObject = require_isObject();
    function isIteratorLike(value) {
      return isObject(value) && typeof value.next === "function";
    }
    __name(isIteratorLike, "isIteratorLike");
    module2.exports = isIteratorLike;
  }
});

// src/util/assertSizedInput.js
var require_assertSizedInput = __commonJS({
  "src/util/assertSizedInput.js"(exports2, module2) {
    var isIterable = require_isIterable();
    var isAsyncIterable = require_isAsyncIterable();
    var isIteratorLike = require_isIteratorLike();
    function assertSizedInput(value) {
      if (isIterable(value) || isAsyncIterable(value) || isIteratorLike(value)) {
        throw new TypeError("Cannot inspect unsized protocol input without consuming it. For a synchronous iterable, use isEmptyIterable or isBlankIterable. Next-only iterators need an iterable adapter; asynchronous iteration is not supported by these helpers.");
      }
    }
    __name(assertSizedInput, "assertSizedInput");
    module2.exports = assertSizedInput;
  }
});

// src/isEmpty.js
var require_isEmpty = __commonJS({
  "src/isEmpty.js"(exports2, module2) {
    var isArray = require_isArray();
    var isString = require_isString();
    var isMap = require_isMap();
    var isSet = require_isSet();
    var getArrayLikeLength = require_getArrayLikeLength();
    var isPlainObject = require_isPlainObject();
    var assertSizedInput = require_assertSizedInput();
    var keys = Object.keys;
    var stringValueOf = String.prototype.valueOf;
    var mapSize = Object.getOwnPropertyDescriptor(Map.prototype, "size").get;
    var setSize = Object.getOwnPropertyDescriptor(Set.prototype, "size").get;
    function isEmpty(value) {
      if (value === null || value === void 0) return true;
      if (!isArray(value)) {
        if (isString(value)) return stringValueOf.call(value).length === 0;
        if (isMap(value)) return mapSize.call(value) === 0;
        if (isSet(value)) return setSize.call(value) === 0;
      }
      const length = getArrayLikeLength(value);
      if (length !== void 0) return length === 0;
      assertSizedInput(value);
      return isPlainObject(value) && keys(value).length === 0;
    }
    __name(isEmpty, "isEmpty");
    module2.exports = isEmpty;
  }
});

// src/isBlank.js
var require_isBlank = __commonJS({
  "src/isBlank.js"(exports2, module2) {
    var isArray = require_isArray();
    var isString = require_isString();
    var isMap = require_isMap();
    var isSet = require_isSet();
    var getArrayLikeLength = require_getArrayLikeLength();
    var isPlainObject = require_isPlainObject();
    var assertSizedInput = require_assertSizedInput();
    var keys = Object.keys;
    var stringValueOf = String.prototype.valueOf;
    var mapValues = Map.prototype.values;
    var setValues = Set.prototype.values;
    var nonSpace = /\S/;
    function isBlank(value) {
      if (value === null || value === void 0) return true;
      if (!isArray(value)) {
        if (isString(value)) return !nonSpace.test(stringValueOf.call(value));
        const map = isMap(value);
        if (map || isSet(value)) {
          const values = map ? mapValues.call(value) : setValues.call(value);
          for (const item of values) if (item !== null && item !== void 0) return false;
          return true;
        }
      }
      const length = getArrayLikeLength(value);
      if (length !== void 0) {
        for (let index = 0; index < length; index++) {
          const item = value[index];
          if (item !== null && item !== void 0) return false;
        }
        return true;
      }
      assertSizedInput(value);
      if (!isPlainObject(value)) return false;
      const names = keys(value);
      for (let index = 0; index < names.length; index++) {
        const item = value[names[index]];
        if (item !== null && item !== void 0) return false;
      }
      return true;
    }
    __name(isBlank, "isBlank");
    module2.exports = isBlank;
  }
});

// src/isTruthy.js
var require_isTruthy = __commonJS({
  "src/isTruthy.js"(exports2, module2) {
    function isTruthy(value) {
      return value ? true : false;
    }
    __name(isTruthy, "isTruthy");
    module2.exports = isTruthy;
  }
});

// src/isFalsy.js
var require_isFalsy = __commonJS({
  "src/isFalsy.js"(exports2, module2) {
    function isFalsy(value) {
      return value ? false : true;
    }
    __name(isFalsy, "isFalsy");
    module2.exports = isFalsy;
  }
});

// src/util/getNumberValue.js
var require_getNumberValue = __commonJS({
  "src/util/getNumberValue.js"(exports2, module2) {
    var isObject = require_isObject();
    var numberValueOf = Number.prototype.valueOf;
    var nativeTypes = require_nativeTypes();
    var isNumberObject = nativeTypes && typeof nativeTypes.isNumberObject === "function" ? nativeTypes.isNumberObject : void 0;
    function nativeNumberValue(value) {
      if (typeof value === "number") return value;
      return isNumberObject(value) ? numberValueOf.call(value) : void 0;
    }
    __name(nativeNumberValue, "nativeNumberValue");
    function intrinsicNumberValue(value) {
      if (typeof value === "number") return value;
      if (!isObject(value)) return void 0;
      try {
        return numberValueOf.call(value);
      } catch (error) {
        return void 0;
      }
    }
    __name(intrinsicNumberValue, "intrinsicNumberValue");
    module2.exports = isNumberObject ? nativeNumberValue : intrinsicNumberValue;
  }
});

// src/isInteger.js
var require_isInteger = __commonJS({
  "src/isInteger.js"(exports2, module2) {
    var getNumberValue = require_getNumberValue();
    var nativeCheck = Number.isInteger;
    function isInteger(value) {
      return nativeCheck(typeof value === "number" ? value : getNumberValue(value));
    }
    __name(isInteger, "isInteger");
    module2.exports = isInteger;
  }
});

// src/isSafeInteger.js
var require_isSafeInteger = __commonJS({
  "src/isSafeInteger.js"(exports2, module2) {
    var getNumberValue = require_getNumberValue();
    var nativeCheck = Number.isSafeInteger;
    function isSafeInteger(value) {
      return nativeCheck(typeof value === "number" ? value : getNumberValue(value));
    }
    __name(isSafeInteger, "isSafeInteger");
    module2.exports = isSafeInteger;
  }
});

// src/isFloat.js
var require_isFloat = __commonJS({
  "src/isFloat.js"(exports2, module2) {
    var getNumberValue = require_getNumberValue();
    var floor = Math.floor;
    function isFloat(value) {
      const number = typeof value === "number" ? value : getNumberValue(value);
      return number !== void 0 && number === number && floor(number) !== number;
    }
    __name(isFloat, "isFloat");
    module2.exports = isFloat;
  }
});

// src/isFinite.js
var require_isFinite = __commonJS({
  "src/isFinite.js"(exports2, module2) {
    var getNumberValue = require_getNumberValue();
    var nativeCheck = Number.isFinite;
    function isFinite(value) {
      return nativeCheck(typeof value === "number" ? value : getNumberValue(value));
    }
    __name(isFinite, "isFinite");
    module2.exports = isFinite;
  }
});

// src/isInfinite.js
var require_isInfinite = __commonJS({
  "src/isInfinite.js"(exports2, module2) {
    var getNumberValue = require_getNumberValue();
    function isInfinite(value) {
      const number = typeof value === "number" ? value : getNumberValue(value);
      return number === Infinity || number === -Infinity;
    }
    __name(isInfinite, "isInfinite");
    module2.exports = isInfinite;
  }
});

// src/isNaN.js
var require_isNaN = __commonJS({
  "src/isNaN.js"(exports2, module2) {
    var getNumberValue = require_getNumberValue();
    function isNaN(value) {
      const number = typeof value === "number" ? value : getNumberValue(value);
      return number !== number;
    }
    __name(isNaN, "isNaN");
    module2.exports = isNaN;
  }
});

// src/isNumeric.js
var require_isNumeric = __commonJS({
  "src/isNumeric.js"(exports2, module2) {
    var nonSpace = /\S/;
    var stringValueOf = String.prototype.valueOf;
    var isFinite = require_isFinite();
    var isString = require_isString();
    var isBigInt = require_isBigInt();
    function isNumeric(value) {
      if (isFinite(value) || isBigInt(value)) {
        return true;
      }
      if (!isString(value)) {
        return false;
      }
      var text = stringValueOf.call(value);
      return nonSpace.test(text) && isFinite(text * 1);
    }
    __name(isNumeric, "isNumeric");
    module2.exports = isNumeric;
  }
});

// src/util/isValidArrayLength.js
var require_isValidArrayLength = __commonJS({
  "src/util/isValidArrayLength.js"(exports2, module2) {
    function isValidArrayLength(value) {
      return typeof value === "number" && value >= 0 && value <= 4294967295 && value % 1 === 0;
    }
    __name(isValidArrayLength, "isValidArrayLength");
    module2.exports = isValidArrayLength;
  }
});

// src/createTypeChecker.js
var require_createTypeChecker = __commonJS({
  "src/createTypeChecker.js"(exports2, module2) {
    var isArray = require_isArray();
    var isValidArrayLength = require_isValidArrayLength();
    var isString = require_isString();
    var getDescriptor = Object.getOwnPropertyDescriptor;
    var hasOwn = Object.prototype.hasOwnProperty;
    var stringValueOf = String.prototype.valueOf;
    var pureNode = /* @__PURE__ */ __name((check) => ({ check, pure: [check] }), "pureNode");
    var typeNodes = Object.freeze({
      __proto__: null,
      undefined: pureNode((value) => typeof value === "undefined"),
      object: pureNode((value) => typeof value === "object"),
      boolean: pureNode((value) => typeof value === "boolean"),
      number: pureNode((value) => typeof value === "number"),
      bigint: pureNode((value) => typeof value === "bigint"),
      string: pureNode((value) => typeof value === "string"),
      symbol: pureNode((value) => typeof value === "symbol"),
      function: pureNode((value) => typeof value === "function")
    });
    var nullNode = pureNode((value) => value === null);
    var undefinedNode = pureNode((value) => value === void 0);
    var neverNode = { check: /* @__PURE__ */ __name(() => false, "check"), pure: [] };
    function invalidMatcher() {
      return new TypeError("Expected a valid typeof name, instance target, null, undefined, union array, or an own {predicate: fn}/{instanceOf: fn} descriptor.");
    }
    __name(invalidMatcher, "invalidMatcher");
    function instanceNode(target) {
      if (typeof target !== "function") throw invalidMatcher();
      const method = target[Symbol.hasInstance];
      if (method !== null && method !== void 0 && typeof method !== "function") throw invalidMatcher();
      return { check: /* @__PURE__ */ __name((value) => value instanceof target, "check") };
    }
    __name(instanceNode, "instanceNode");
    function leafNode(type) {
      if (typeof type === "string") {
        const node = typeNodes[type];
        if (!node) throw invalidMatcher();
        return node;
      }
      if (type === null) return nullNode;
      if (type === void 0) return undefinedNode;
      if (typeof type === "function") return instanceNode(type);
      if (typeof type !== "object") throw invalidMatcher();
      if (isString(type)) {
        const node = typeNodes[stringValueOf.call(type)];
        if (!node) throw invalidMatcher();
        return node;
      }
      const predicate = getDescriptor(type, "predicate");
      const instanceOf = getDescriptor(type, "instanceOf");
      if (predicate && !instanceOf && typeof predicate.value === "function") {
        const check = predicate.value;
        return { check(value) {
          const result = check(value);
          if (typeof result !== "boolean") {
            throw new TypeError("A type predicate must return a synchronous primitive boolean.");
          }
          return result;
        } };
      }
      if (instanceOf && !predicate) return instanceNode(instanceOf.value);
      throw invalidMatcher();
    }
    __name(leafNode, "leafNode");
    function unionFrame(type) {
      const length = type.length;
      if (!isValidArrayLength(length)) throw invalidMatcher();
      return { type, index: 0, length, children: [] };
    }
    __name(unionFrame, "unionFrame");
    function combine(children) {
      if (children.length === 0) return neverNode;
      if (children.length === 1) return children[0];
      if (children.every((child) => child.pure !== void 0)) {
        const checks = [...new Set(children.flatMap((child) => child.pure))];
        if (checks.length === 0) return neverNode;
        if (checks.length === 1) return { check: checks[0], pure: checks };
        return { pure: checks, check(value) {
          for (let i = 0; i < checks.length; i++) if (checks[i](value)) return true;
          return false;
        } };
      }
      return { children };
    }
    __name(combine, "combine");
    function evaluator(root) {
      if (root.check) return root.check;
      if (root.children.every((child) => child.check)) {
        const checks = root.children.map((child) => child.check);
        return /* @__PURE__ */ __name(function checkFlatUnion(value) {
          for (let i = 0; i < checks.length; i++) if (checks[i](value)) return true;
          return false;
        }, "checkFlatUnion");
      }
      return /* @__PURE__ */ __name(function checkGraph(value) {
        let children = root.children;
        let index = 0;
        let stack;
        for (; ; ) {
          if (index === children.length) {
            if (!stack || stack.length === 0) return false;
            index = stack.pop();
            children = stack.pop();
            continue;
          }
          const node = children[index++];
          if (node.check) {
            if (node.check(value)) return true;
          } else {
            if (!stack) stack = [];
            stack.push(children, index);
            children = node.children;
            index = 0;
          }
        }
      }, "checkGraph");
    }
    __name(evaluator, "evaluator");
    function createTypeChecker(type) {
      if (!isArray(type)) return leafNode(type).check;
      let completed;
      let active;
      const stack = [unionFrame(type)];
      let root;
      while (stack.length > 0) {
        const frame = stack[stack.length - 1];
        if (frame.index === frame.length) {
          if (!completed) {
            const children = frame.children;
            if (children.length === 0) return neverNode.check;
            if (children.length === 1) return children[0].check;
            return /* @__PURE__ */ __name(function checkFlatUnion(value) {
              for (let i = 0; i < children.length; i++) if (children[i].check(value)) return true;
              return false;
            }, "checkFlatUnion");
          }
          const node = combine(frame.children);
          completed.set(frame.type, node);
          active.delete(frame.type);
          stack.pop();
          if (stack.length) {
            if (node !== neverNode) stack[stack.length - 1].children.push(node);
          } else root = node;
          continue;
        }
        const descriptor = getDescriptor(frame.type, frame.index++);
        if (descriptor && !hasOwn.call(descriptor, "value")) throw invalidMatcher();
        const item = descriptor ? descriptor.value : void 0;
        if (!isArray(item)) {
          frame.children.push(leafNode(item));
        } else {
          if (!completed) {
            completed = /* @__PURE__ */ new WeakMap();
            active = new WeakSet([type]);
          }
          if (active.has(item)) throw new TypeError("Type matcher unions must not contain cycles.");
          const node = completed.get(item);
          if (node) {
            if (node !== neverNode) frame.children.push(node);
          } else {
            active.add(item);
            stack.push(unionFrame(item));
          }
        }
      }
      return evaluator(root);
    }
    __name(createTypeChecker, "createTypeChecker");
    module2.exports = createTypeChecker;
  }
});

// src/isTypeOf.js
var require_isTypeOf = __commonJS({
  "src/isTypeOf.js"(exports2, module2) {
    var createTypeChecker = require_createTypeChecker();
    function isTypeOf(value, type) {
      return createTypeChecker(type)(value);
    }
    __name(isTypeOf, "isTypeOf");
    module2.exports = isTypeOf;
  }
});

// src/hasCircularReference.js
var require_hasCircularReference = __commonJS({
  "src/hasCircularReference.js"(exports2, module2) {
    var isObject = require_isObject();
    function enumerableKeys(value) {
      var keys = [];
      for (var key in value) {
        keys.push(key);
      }
      return keys;
    }
    __name(enumerableKeys, "enumerableKeys");
    function hasCircularReference(value) {
      if (!isObject(value)) {
        return false;
      }
      var active = /* @__PURE__ */ new WeakSet();
      var completed = /* @__PURE__ */ new WeakSet();
      var stack = [{ value, keys: enumerableKeys(value), index: 0 }];
      active.add(value);
      while (stack.length > 0) {
        var frame = stack[stack.length - 1];
        if (frame.index === frame.keys.length) {
          active.delete(frame.value);
          completed.add(frame.value);
          stack.pop();
          continue;
        }
        var child = frame.value[frame.keys[frame.index++]];
        if (!isObject(child)) {
          continue;
        }
        if (active.has(child)) {
          return true;
        }
        if (!completed.has(child)) {
          active.add(child);
          stack.push({ value: child, keys: enumerableKeys(child), index: 0 });
        }
      }
      return false;
    }
    __name(hasCircularReference, "hasCircularReference");
    module2.exports = hasCircularReference;
  }
});

// src/isCyclic.js
var require_isCyclic = __commonJS({
  "src/isCyclic.js"(exports2, module2) {
    var hasCircularReference = require_hasCircularReference();
    function isCyclic(value) {
      return hasCircularReference(value);
    }
    __name(isCyclic, "isCyclic");
    module2.exports = isCyclic;
  }
});

// src/isArrayOf.js
var require_isArrayOf = __commonJS({
  "src/isArrayOf.js"(exports2, module2) {
    var isArray = require_isArray();
    var isValidArrayLength = require_isValidArrayLength();
    var createTypeChecker = require_createTypeChecker();
    function isArrayOf(value, type) {
      const check = createTypeChecker(type);
      if (!isArray(value)) return false;
      const length = value.length;
      if (!isValidArrayLength(length)) return false;
      for (let index = 0; index < length; index++) if (!check(value[index])) return false;
      return true;
    }
    __name(isArrayOf, "isArrayOf");
    module2.exports = isArrayOf;
  }
});

// src/isArrayLike.js
var require_isArrayLike = __commonJS({
  "src/isArrayLike.js"(exports2, module2) {
    var getArrayLikeLength = require_getArrayLikeLength();
    function isArrayLike(value) {
      return getArrayLikeLength(value) !== void 0;
    }
    __name(isArrayLike, "isArrayLike");
    module2.exports = isArrayLike;
  }
});

// src/isArrayLikeOf.js
var require_isArrayLikeOf = __commonJS({
  "src/isArrayLikeOf.js"(exports2, module2) {
    var getArrayLikeLength = require_getArrayLikeLength();
    var createTypeChecker = require_createTypeChecker();
    function isArrayLikeOf(value, type) {
      const check = createTypeChecker(type);
      const length = getArrayLikeLength(value);
      if (length === void 0) return false;
      for (let index = 0; index < length; index++) if (!check(value[index])) return false;
      return true;
    }
    __name(isArrayLikeOf, "isArrayLikeOf");
    module2.exports = isArrayLikeOf;
  }
});

// src/isPair.js
var require_isPair = __commonJS({
  "src/isPair.js"(exports2, module2) {
    var isArray = require_isArray();
    function isPair(value) {
      return isArray(value) && value.length === 2;
    }
    __name(isPair, "isPair");
    module2.exports = isPair;
  }
});

// src/isWeakMap.js
var require_isWeakMap = __commonJS({
  "src/isWeakMap.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var has = typeof WeakMap === "function" ? WeakMap.prototype.has : void 0;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isWeakMap === "function" ? nativeTypes.isWeakMap : (value) => hasNativeBrand(value, has);
    function isWeakMap(value) {
      return checkNativeBrand(value);
    }
    __name(isWeakMap, "isWeakMap");
    module2.exports = isWeakMap;
  }
});

// src/isWeakSet.js
var require_isWeakSet = __commonJS({
  "src/isWeakSet.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var has = typeof WeakSet === "function" ? WeakSet.prototype.has : void 0;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isWeakSet === "function" ? nativeTypes.isWeakSet : (value) => hasNativeBrand(value, has);
    function isWeakSet(value) {
      return checkNativeBrand(value);
    }
    __name(isWeakSet, "isWeakSet");
    module2.exports = isWeakSet;
  }
});

// src/isFunction.js
var require_isFunction = __commonJS({
  "src/isFunction.js"(exports2, module2) {
    function isFunction(value) {
      return typeof value === "function";
    }
    __name(isFunction, "isFunction");
    module2.exports = isFunction;
  }
});

// src/isDate.js
var require_isDate = __commonJS({
  "src/isDate.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var getTime = Date.prototype.getTime;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isDate === "function" ? nativeTypes.isDate : (value) => hasNativeBrand(value, getTime);
    function isDate(value) {
      return checkNativeBrand(value);
    }
    __name(isDate, "isDate");
    module2.exports = isDate;
  }
});

// src/isValidDate.js
var require_isValidDate = __commonJS({
  "src/isValidDate.js"(exports2, module2) {
    var isDate = require_isDate();
    var getTime = Date.prototype.getTime;
    function isValidDate(value) {
      if (!isDate(value)) {
        return false;
      }
      var time = getTime.call(value);
      return time === time;
    }
    __name(isValidDate, "isValidDate");
    module2.exports = isValidDate;
  }
});

// src/isInvalidDate.js
var require_isInvalidDate = __commonJS({
  "src/isInvalidDate.js"(exports2, module2) {
    var isDate = require_isDate();
    var getTime = Date.prototype.getTime;
    function isInvalidDate(value) {
      if (!isDate(value)) {
        return false;
      }
      var time = getTime.call(value);
      return time !== time;
    }
    __name(isInvalidDate, "isInvalidDate");
    module2.exports = isInvalidDate;
  }
});

// src/isRegExp.js
var require_isRegExp = __commonJS({
  "src/isRegExp.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var regExpPrototype = RegExp.prototype;
    var getSource = Object.getOwnPropertyDescriptor(regExpPrototype, "source").get;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isRegExp === "function" ? nativeTypes.isRegExp : (value) => hasNativeBrand(value, getSource);
    function isRegExp(value) {
      return value !== regExpPrototype && checkNativeBrand(value);
    }
    __name(isRegExp, "isRegExp");
    module2.exports = isRegExp;
  }
});

// src/isPromise.js
var require_isPromise = __commonJS({
  "src/isPromise.js"(exports2, module2) {
    function isPromise(value) {
      return typeof Promise === "function" && value instanceof Promise;
    }
    __name(isPromise, "isPromise");
    module2.exports = isPromise;
  }
});

// src/isPromiseLike.js
var require_isPromiseLike = __commonJS({
  "src/isPromiseLike.js"(exports2, module2) {
    var isObject = require_isObject();
    function isPromiseLike(value) {
      return isObject(value) && typeof value.then === "function" && typeof value.catch === "function";
    }
    __name(isPromiseLike, "isPromiseLike");
    module2.exports = isPromiseLike;
  }
});

// src/isThenable.js
var require_isThenable = __commonJS({
  "src/isThenable.js"(exports2, module2) {
    var isObject = require_isObject();
    function isThenable(value) {
      return isObject(value) && typeof value.then === "function";
    }
    __name(isThenable, "isThenable");
    module2.exports = isThenable;
  }
});

// src/isError.js
var require_isError = __commonJS({
  "src/isError.js"(exports2, module2) {
    var nativeIsError = Error.isError;
    var objectToString = Object.prototype.toString;
    function isError(value) {
      if (typeof nativeIsError === "function") {
        return nativeIsError(value);
      }
      if (value === null || typeof value !== "object") {
        return false;
      }
      if (typeof Symbol === "function" && Symbol.toStringTag && Symbol.toStringTag in value) {
        return false;
      }
      return objectToString.call(value) === "[object Error]";
    }
    __name(isError, "isError");
    module2.exports = isError;
  }
});

// src/isNode.js
var require_isNode = __commonJS({
  "src/isNode.js"(exports2, module2) {
    function isNode(value) {
      return typeof Node === "function" && value instanceof Node;
    }
    __name(isNode, "isNode");
    module2.exports = isNode;
  }
});

// src/isElement.js
var require_isElement = __commonJS({
  "src/isElement.js"(exports2, module2) {
    function isElement(value) {
      return typeof Element === "function" && value instanceof Element;
    }
    __name(isElement, "isElement");
    module2.exports = isElement;
  }
});

// src/isFragment.js
var require_isFragment = __commonJS({
  "src/isFragment.js"(exports2, module2) {
    function isFragment(value) {
      return typeof DocumentFragment === "function" && value instanceof DocumentFragment;
    }
    __name(isFragment, "isFragment");
    module2.exports = isFragment;
  }
});

// src/isArrayBuffer.js
var require_isArrayBuffer = __commonJS({
  "src/isArrayBuffer.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var getter = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, "byteLength").get;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isArrayBuffer === "function" ? nativeTypes.isArrayBuffer : (value) => hasNativeBrand(value, getter);
    function isArrayBuffer(value) {
      return checkNativeBrand(value);
    }
    __name(isArrayBuffer, "isArrayBuffer");
    module2.exports = isArrayBuffer;
  }
});

// src/isSharedArrayBuffer.js
var require_isSharedArrayBuffer = __commonJS({
  "src/isSharedArrayBuffer.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var getter = typeof SharedArrayBuffer === "function" ? Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength").get : void 0;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = getter && nativeTypes && typeof nativeTypes.isSharedArrayBuffer === "function" ? nativeTypes.isSharedArrayBuffer : (value) => hasNativeBrand(value, getter);
    function isSharedArrayBuffer(value) {
      return checkNativeBrand(value);
    }
    __name(isSharedArrayBuffer, "isSharedArrayBuffer");
    module2.exports = isSharedArrayBuffer;
  }
});

// src/isArrayBufferView.js
var require_isArrayBufferView = __commonJS({
  "src/isArrayBufferView.js"(exports2, module2) {
    var nativeIsView = ArrayBuffer.isView;
    function isArrayBufferView(value) {
      return nativeIsView(value);
    }
    __name(isArrayBufferView, "isArrayBufferView");
    module2.exports = isArrayBufferView;
  }
});

// src/isTypedArray.js
var require_isTypedArray = __commonJS({
  "src/isTypedArray.js"(exports2, module2) {
    var isView = ArrayBuffer.isView;
    var typedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);
    var getTypedArrayTag = Object.getOwnPropertyDescriptor(typedArrayPrototype, Symbol.toStringTag).get;
    var apply = Reflect.apply;
    var noArguments = [];
    function isTypedArray(value) {
      return isView(value) && typeof apply(getTypedArrayTag, value, noArguments) === "string";
    }
    __name(isTypedArray, "isTypedArray");
    module2.exports = isTypedArray;
  }
});

// src/isDataView.js
var require_isDataView = __commonJS({
  "src/isDataView.js"(exports2, module2) {
    var hasNativeBrand = require_hasNativeBrand();
    var getter = Object.getOwnPropertyDescriptor(DataView.prototype, "buffer").get;
    var nativeTypes = require_nativeTypes();
    var checkNativeBrand = nativeTypes && typeof nativeTypes.isDataView === "function" ? nativeTypes.isDataView : (value) => hasNativeBrand(value, getter);
    function isDataView(value) {
      return checkNativeBrand(value);
    }
    __name(isDataView, "isDataView");
    module2.exports = isDataView;
  }
});

// src/isNonNullish.js
var require_isNonNullish = __commonJS({
  "src/isNonNullish.js"(exports2, module2) {
    function isNonNullish(value) {
      return value !== null && value !== void 0;
    }
    __name(isNonNullish, "isNonNullish");
    module2.exports = isNonNullish;
  }
});

// src/isObjectLike.js
var require_isObjectLike = __commonJS({
  "src/isObjectLike.js"(exports2, module2) {
    function isObjectLike(value) {
      const type = typeof value;
      return type === "object" ? value !== null : type === "undefined" && value !== void 0;
    }
    __name(isObjectLike, "isObjectLike");
    module2.exports = isObjectLike;
  }
});

// src/isNonEmptyArray.js
var require_isNonEmptyArray = __commonJS({
  "src/isNonEmptyArray.js"(exports2, module2) {
    var isArray = require_isArray();
    var isValidArrayLength = require_isValidArrayLength();
    function isNonEmptyArray(value) {
      if (!isArray(value)) return false;
      const length = value.length;
      return isValidArrayLength(length) && length > 0;
    }
    __name(isNonEmptyArray, "isNonEmptyArray");
    module2.exports = isNonEmptyArray;
  }
});

// src/isJson.js
var require_isJson = __commonJS({
  "src/isJson.js"(exports2, module2) {
    var isString = require_isString();
    var stringValueOf = String.prototype.valueOf;
    var parse = JSON.parse;
    function isJson(value) {
      if (!isString(value)) {
        return false;
      }
      try {
        parse(stringValueOf.call(value));
        return true;
      } catch (error) {
        return false;
      }
    }
    __name(isJson, "isJson");
    module2.exports = isJson;
  }
});

// src/isSetOf.js
var require_isSetOf = __commonJS({
  "src/isSetOf.js"(exports2, module2) {
    var isSet = require_isSet();
    var createTypeChecker = require_createTypeChecker();
    var values = Set.prototype.values;
    function isSetOf(value, type) {
      const check = createTypeChecker(type);
      if (!isSet(value)) return false;
      for (const item of values.call(value)) if (!check(item)) return false;
      return true;
    }
    __name(isSetOf, "isSetOf");
    module2.exports = isSetOf;
  }
});

// src/isMapOf.js
var require_isMapOf = __commonJS({
  "src/isMapOf.js"(exports2, module2) {
    var isMap = require_isMap();
    var createTypeChecker = require_createTypeChecker();
    var entries = Map.prototype.entries;
    function isMapOf(value, keyType, valueType) {
      const checkKey = createTypeChecker(keyType);
      const checkValue = createTypeChecker(valueType);
      if (!isMap(value)) return false;
      for (const entry of entries.call(value)) {
        if (!checkKey(entry[0]) || !checkValue(entry[1])) return false;
      }
      return true;
    }
    __name(isMapOf, "isMapOf");
    module2.exports = isMapOf;
  }
});

// src/isEmptyIterable.js
var require_isEmptyIterable = __commonJS({
  "src/isEmptyIterable.js"(exports2, module2) {
    function isEmptyIterable(value) {
      for (const item of value) return false;
      return true;
    }
    __name(isEmptyIterable, "isEmptyIterable");
    module2.exports = isEmptyIterable;
  }
});

// src/isBlankIterable.js
var require_isBlankIterable = __commonJS({
  "src/isBlankIterable.js"(exports2, module2) {
    function isBlankIterable(value) {
      for (const item of value) if (item !== null && item !== void 0) return false;
      return true;
    }
    __name(isBlankIterable, "isBlankIterable");
    module2.exports = isBlankIterable;
  }
});

// src/conversion/toArray.js
var require_toArray = __commonJS({
  "src/conversion/toArray.js"(exports2, module2) {
    "use strict";
    var arrayFrom = Array.from;
    function toArray(value) {
      return arrayFrom(value);
    }
    __name(toArray, "toArray");
    module2.exports = toArray;
  }
});

// src/util/shouldConvert.js
var require_shouldConvert = __commonJS({
  "src/util/shouldConvert.js"(exports2, module2) {
    "use strict";
    function shouldConvert(value, condition) {
      if (condition === void 0) return false;
      const result = typeof condition === "function" ? condition(value) : condition;
      if (typeof result !== "boolean") {
        throw new TypeError("Conversion condition must be a boolean or a synchronous boolean predicate.");
      }
      return result;
    }
    __name(shouldConvert, "shouldConvert");
    module2.exports = shouldConvert;
  }
});

// src/conversion/toArrayIf.js
var require_toArrayIf = __commonJS({
  "src/conversion/toArrayIf.js"(exports2, module2) {
    "use strict";
    var toArray = require_toArray();
    var shouldConvert = require_shouldConvert();
    function toArrayIf(value, condition) {
      return shouldConvert(value, condition) ? toArray(value) : value;
    }
    __name(toArrayIf, "toArrayIf");
    module2.exports = toArrayIf;
  }
});

// src/conversion/toBigInt.js
var require_toBigInt = __commonJS({
  "src/conversion/toBigInt.js"(exports2, module2) {
    "use strict";
    var nativeBigInt = BigInt;
    function toBigInt(value) {
      return nativeBigInt(value);
    }
    __name(toBigInt, "toBigInt");
    module2.exports = toBigInt;
  }
});

// src/conversion/toBigIntIf.js
var require_toBigIntIf = __commonJS({
  "src/conversion/toBigIntIf.js"(exports2, module2) {
    "use strict";
    var toBigInt = require_toBigInt();
    var shouldConvert = require_shouldConvert();
    function toBigIntIf(value, condition) {
      return shouldConvert(value, condition) ? toBigInt(value) : value;
    }
    __name(toBigIntIf, "toBigIntIf");
    module2.exports = toBigIntIf;
  }
});

// src/conversion/toBoolean.js
var require_toBoolean = __commonJS({
  "src/conversion/toBoolean.js"(exports2, module2) {
    "use strict";
    var nativeBoolean = Boolean;
    function toBoolean(value) {
      return nativeBoolean(value);
    }
    __name(toBoolean, "toBoolean");
    module2.exports = toBoolean;
  }
});

// src/conversion/toBooleanIf.js
var require_toBooleanIf = __commonJS({
  "src/conversion/toBooleanIf.js"(exports2, module2) {
    "use strict";
    var toBoolean = require_toBoolean();
    var shouldConvert = require_shouldConvert();
    function toBooleanIf(value, condition) {
      return shouldConvert(value, condition) ? toBoolean(value) : value;
    }
    __name(toBooleanIf, "toBooleanIf");
    module2.exports = toBooleanIf;
  }
});

// src/conversion/toDate.js
var require_toDate = __commonJS({
  "src/conversion/toDate.js"(exports2, module2) {
    "use strict";
    var NativeDate = Date;
    var isDate = require_isDate();
    function toDate(value) {
      return isDate(value) ? value : new NativeDate(value);
    }
    __name(toDate, "toDate");
    module2.exports = toDate;
  }
});

// src/conversion/toDateIf.js
var require_toDateIf = __commonJS({
  "src/conversion/toDateIf.js"(exports2, module2) {
    "use strict";
    var toDate = require_toDate();
    var shouldConvert = require_shouldConvert();
    function toDateIf(value, condition) {
      return shouldConvert(value, condition) ? toDate(value) : value;
    }
    __name(toDateIf, "toDateIf");
    module2.exports = toDateIf;
  }
});

// src/conversion/toNumber.js
var require_toNumber = __commonJS({
  "src/conversion/toNumber.js"(exports2, module2) {
    "use strict";
    var nativeNumber = Number;
    function toNumber(value) {
      return nativeNumber(value);
    }
    __name(toNumber, "toNumber");
    module2.exports = toNumber;
  }
});

// src/conversion/toInteger.js
var require_toInteger = __commonJS({
  "src/conversion/toInteger.js"(exports2, module2) {
    "use strict";
    var toNumber = require_toNumber();
    var trunc = Math.trunc;
    function toInteger(value) {
      return trunc(toNumber(value));
    }
    __name(toInteger, "toInteger");
    module2.exports = toInteger;
  }
});

// src/conversion/toIntegerIf.js
var require_toIntegerIf = __commonJS({
  "src/conversion/toIntegerIf.js"(exports2, module2) {
    "use strict";
    var toInteger = require_toInteger();
    var shouldConvert = require_shouldConvert();
    function toIntegerIf(value, condition) {
      return shouldConvert(value, condition) ? toInteger(value) : value;
    }
    __name(toIntegerIf, "toIntegerIf");
    module2.exports = toIntegerIf;
  }
});

// src/conversion/toNumberIf.js
var require_toNumberIf = __commonJS({
  "src/conversion/toNumberIf.js"(exports2, module2) {
    "use strict";
    var toNumber = require_toNumber();
    var shouldConvert = require_shouldConvert();
    function toNumberIf(value, condition) {
      return shouldConvert(value, condition) ? toNumber(value) : value;
    }
    __name(toNumberIf, "toNumberIf");
    module2.exports = toNumberIf;
  }
});

// src/conversion/toObject.js
var require_toObject = __commonJS({
  "src/conversion/toObject.js"(exports2, module2) {
    "use strict";
    var nativeObject = Object;
    function toObject(value) {
      return nativeObject(value);
    }
    __name(toObject, "toObject");
    module2.exports = toObject;
  }
});

// src/conversion/toObjectIf.js
var require_toObjectIf = __commonJS({
  "src/conversion/toObjectIf.js"(exports2, module2) {
    "use strict";
    var toObject = require_toObject();
    var shouldConvert = require_shouldConvert();
    function toObjectIf(value, condition) {
      return shouldConvert(value, condition) ? toObject(value) : value;
    }
    __name(toObjectIf, "toObjectIf");
    module2.exports = toObjectIf;
  }
});

// src/conversion/toString.js
var require_toString = __commonJS({
  "src/conversion/toString.js"(exports2, module2) {
    "use strict";
    var nativeString = String;
    function toString(value) {
      return nativeString(value);
    }
    __name(toString, "toString");
    module2.exports = toString;
  }
});

// src/conversion/toStringIf.js
var require_toStringIf = __commonJS({
  "src/conversion/toStringIf.js"(exports2, module2) {
    "use strict";
    var toString = require_toString();
    var shouldConvert = require_shouldConvert();
    function toStringIf(value, condition) {
      return shouldConvert(value, condition) ? toString(value) : value;
    }
    __name(toStringIf, "toStringIf");
    module2.exports = toStringIf;
  }
});

// src/conversion/toSymbol.js
var require_toSymbol = __commonJS({
  "src/conversion/toSymbol.js"(exports2, module2) {
    "use strict";
    var nativeSymbol = Symbol;
    var symbolValueOf = Symbol.prototype.valueOf;
    function toSymbol(value) {
      if (typeof value === "symbol") return value;
      if (value !== null && typeof value === "object") {
        try {
          return symbolValueOf.call(value);
        } catch (_) {
        }
      }
      return nativeSymbol(value);
    }
    __name(toSymbol, "toSymbol");
    module2.exports = toSymbol;
  }
});

// src/conversion/toSymbolIf.js
var require_toSymbolIf = __commonJS({
  "src/conversion/toSymbolIf.js"(exports2, module2) {
    "use strict";
    var toSymbol = require_toSymbol();
    var shouldConvert = require_shouldConvert();
    function toSymbolIf(value, condition) {
      return shouldConvert(value, condition) ? toSymbol(value) : value;
    }
    __name(toSymbolIf, "toSymbolIf");
    module2.exports = toSymbolIf;
  }
});

// index.js
exports.isUndefined = require_isUndefined();
exports.isNull = require_isNull();
exports.isBoolean = require_isBoolean();
exports.isNumber = require_isNumber();
exports.isString = require_isString();
exports.isSymbol = require_isSymbol();
exports.isBigInt = require_isBigInt();
exports.isPrimitive = require_isPrimitive();
exports.isNullish = require_isNullish();
exports.isEmpty = require_isEmpty();
exports.isBlank = require_isBlank();
exports.isTruthy = require_isTruthy();
exports.isFalsy = require_isFalsy();
exports.isInteger = require_isInteger();
exports.isSafeInteger = require_isSafeInteger();
exports.isFloat = require_isFloat();
exports.isFinite = require_isFinite();
exports.isInfinite = require_isInfinite();
exports.isNaN = require_isNaN();
exports.isNumeric = require_isNumeric();
exports.isTypeOf = require_isTypeOf();
exports.isObject = require_isObject();
exports.isPlainObject = require_isPlainObject();
exports.isCyclic = require_isCyclic();
exports.isIterable = require_isIterable();
exports.isArray = require_isArray();
exports.isArrayOf = require_isArrayOf();
exports.isArrayLike = require_isArrayLike();
exports.isArrayLikeOf = require_isArrayLikeOf();
exports.isPair = require_isPair();
exports.isMap = require_isMap();
exports.isSet = require_isSet();
exports.isWeakMap = require_isWeakMap();
exports.isWeakSet = require_isWeakSet();
exports.isFunction = require_isFunction();
exports.isDate = require_isDate();
exports.isValidDate = require_isValidDate();
exports.isInvalidDate = require_isInvalidDate();
exports.isRegExp = require_isRegExp();
exports.isPromise = require_isPromise();
exports.isPromiseLike = require_isPromiseLike();
exports.isThenable = require_isThenable();
exports.isError = require_isError();
exports.isNode = require_isNode();
exports.isElement = require_isElement();
exports.isFragment = require_isFragment();
exports.isArrayBuffer = require_isArrayBuffer();
exports.isSharedArrayBuffer = require_isSharedArrayBuffer();
exports.isArrayBufferView = require_isArrayBufferView();
exports.isTypedArray = require_isTypedArray();
exports.isDataView = require_isDataView();
exports.isAsyncIterable = require_isAsyncIterable();
exports.isIteratorLike = require_isIteratorLike();
exports.isNonNullish = require_isNonNullish();
exports.isObjectLike = require_isObjectLike();
exports.isNonEmptyArray = require_isNonEmptyArray();
exports.isJson = require_isJson();
exports.createTypeChecker = require_createTypeChecker();
exports.isSetOf = require_isSetOf();
exports.isMapOf = require_isMapOf();
exports.isEmptyIterable = require_isEmptyIterable();
exports.isBlankIterable = require_isBlankIterable();
exports.toArray = require_toArray();
exports.toArrayIf = require_toArrayIf();
exports.toBigInt = require_toBigInt();
exports.toBigIntIf = require_toBigIntIf();
exports.toBoolean = require_toBoolean();
exports.toBooleanIf = require_toBooleanIf();
exports.toDate = require_toDate();
exports.toDateIf = require_toDateIf();
exports.toInteger = require_toInteger();
exports.toIntegerIf = require_toIntegerIf();
exports.toNumber = require_toNumber();
exports.toNumberIf = require_toNumberIf();
exports.toObject = require_toObject();
exports.toObjectIf = require_toObjectIf();
exports.toString = require_toString();
exports.toStringIf = require_toStringIf();
exports.toSymbol = require_toSymbol();
exports.toSymbolIf = require_toSymbolIf();
return module.exports;
});
//# sourceMappingURL=go-types.js.map
