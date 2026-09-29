const isArray = require('./isArray');
const isValidArrayLength = require('./util/isValidArrayLength');
const isString = require('./isString');
const getDescriptor = Object.getOwnPropertyDescriptor;
const hasOwn = Object.prototype.hasOwnProperty;
const stringValueOf = String.prototype.valueOf;

// These nodes are immutable implementation constants, not a cache of caller-owned matchers.
const pureNode = check => ({check, pure: [check]});
const typeNodes = Object.freeze({
    __proto__: null,
    undefined: pureNode(value => typeof value === 'undefined'),
    object: pureNode(value => typeof value === 'object'),
    boolean: pureNode(value => typeof value === 'boolean'),
    number: pureNode(value => typeof value === 'number'),
    bigint: pureNode(value => typeof value === 'bigint'),
    string: pureNode(value => typeof value === 'string'),
    symbol: pureNode(value => typeof value === 'symbol'),
    function: pureNode(value => typeof value === 'function')
});
const nullNode = pureNode(value => value === null);
const undefinedNode = pureNode(value => value === undefined);
const neverNode = {check: () => false, pure: []};

function invalidMatcher() {
    return new TypeError('Expected a valid typeof name, instance target, null, undefined, union array, or an own {predicate: fn}/{instanceOf: fn} descriptor.');
}

function instanceNode(target) {
    if (typeof target !== 'function') throw invalidMatcher();
    const method = target[Symbol.hasInstance];
    if (method !== null && method !== undefined && typeof method !== 'function') throw invalidMatcher();
    // Callable targets (including bound functions) do not expose enough public
    // information for a safe prototype/constructibility preflight. Only native
    // evaluation can decide; it must not run as part of compilation.
    return {check: value => value instanceof target};
}

function leafNode(type) {
    if (typeof type === 'string') {
        const node = typeNodes[type];
        if (!node) throw invalidMatcher();
        return node;
    }
    if (type === null) return nullNode;
    if (type === undefined) return undefinedNode;
    if (typeof type === 'function') return instanceNode(type);
    if (typeof type !== 'object') throw invalidMatcher();
    if (isString(type)) {
        const node = typeNodes[stringValueOf.call(type)];
        if (!node) throw invalidMatcher();
        return node;
    }
    const predicate = getDescriptor(type, 'predicate');
    const instanceOf = getDescriptor(type, 'instanceOf');
    if (predicate && !instanceOf && typeof predicate.value === 'function') {
        const check = predicate.value;
        return {check(value) {
            const result = check(value);
            if (typeof result !== 'boolean') {
                throw new TypeError('A type predicate must return a synchronous primitive boolean.');
            }
            return result;
        }};
    }
    if (instanceOf && !predicate) return instanceNode(instanceOf.value);
    throw invalidMatcher();
}

function unionFrame(type) {
    const length = type.length;
    if (!isValidArrayLength(length)) throw invalidMatcher();
    return {type, index: 0, length, children: []};
}

function combine(children) {
    if (children.length === 0) return neverNode;
    if (children.length === 1) return children[0];
    if (children.every(child => child.pure !== undefined)) {
        // A pure union has at most ten distinct built-in checks. Collapse shared
        // branches here, not by expanding them exponentially or memoizing user code.
        const checks = [...new Set(children.flatMap(child => child.pure))];
        if (checks.length === 0) return neverNode;
        if (checks.length === 1) return {check: checks[0], pure: checks};
        return {pure: checks, check(value) {
            for (let i = 0; i < checks.length; i++) if (checks[i](value)) return true;
            return false;
        }};
    }
    return {children};
}

function evaluator(root) {
    if (root.check) return root.check;
    if (root.children.every(child => child.check)) {
        const checks = root.children.map(child => child.check);
        return function checkFlatUnion(value) {
            for (let i = 0; i < checks.length; i++) if (checks[i](value)) return true;
            return false;
        };
    }
    return function checkGraph(value) {
        let children = root.children;
        let index = 0;
        let stack;
        for (;;) {
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
    };
}

/**
 * Validates and snapshots a matcher structure once, returning a reusable synchronous checker.
 * Validates and snapshots each distinct union array once per compilation. Shared arrays stay shared, so repeated branches do not expand into a large tree. Only pure built-in checks are deduplicated; application predicates and instance hooks keep their order, repeat count and live state.
 *
 * Compilation and evaluation are iterative. They do not use eval or generated source, and no cache is retained across separate calls. Prepare reusable checkers outside hot loops. An omitted type means undefined. Instance-target prototype errors are deferred to native evaluation; compilation does not probe whether a target can be constructed.
 * @param {*} type Matcher specification.
 * @returns {function}
 * @example createTypeChecker(["number",null])(1);   // => true
 * @example createTypeChecker(["number",null])("1"); // => false
 * @example createTypeChecker([])(undefined);        // => false
 */
function createTypeChecker(type) {
    if (!isArray(type)) return leafNode(type).check;
    // Flat unions need neither graph maps nor a traversal stack. Allocate graph
    // bookkeeping lazily on the first nested array, which can also be a cycle.
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
                return function checkFlatUnion(value) {
                    for (let i = 0; i < children.length; i++) if (children[i].check(value)) return true;
                    return false;
                };
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
        // Snapshot own data elements without running accessors or inheriting configuration.
        const descriptor = getDescriptor(frame.type, frame.index++);
        if (descriptor && !hasOwn.call(descriptor, 'value')) throw invalidMatcher();
        const item = descriptor ? descriptor.value : undefined;
        if (!isArray(item)) {
            frame.children.push(leafNode(item));
        } else {
            if (!completed) {
                completed = new WeakMap();
                active = new WeakSet([type]);
            }
            if (active.has(item)) throw new TypeError('Type matcher unions must not contain cycles.');
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
module.exports = createTypeChecker;
