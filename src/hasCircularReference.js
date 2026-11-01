var isObject = require('./isObject');
var isMap = require('./isMap');
var isSet = require('./isSet');
var hasNativeBrand = require('./util/hasNativeBrand');
var getNativeGetter = require('./util/getNativeGetter');
var createReferenceSet = require('./util/createReferenceSet');
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var mapPrototype = typeof Map === 'function' ? Map.prototype : undefined;
var setPrototype = typeof Set === 'function' ? Set.prototype : undefined;

// Native content access ignores application iterators and instance overrides.
// Other captured receiver-checking operations keep partial native APIs useful.
var collections = [
  {
    name: 'Map',
    check: isMap,
    has: mapPrototype && typeof mapPrototype.has === 'function',
    brand:
      getNativeGetter(typeof Map === 'function' ? Map : undefined, 'size') ||
      (mapPrototype && typeof mapPrototype.entries === 'function' ? mapPrototype.entries : undefined),
    forEach: mapPrototype && typeof mapPrototype.forEach === 'function' ? mapPrototype.forEach : undefined,
    pairs: true
  },
  {
    name: 'Set',
    check: isSet,
    has: setPrototype && typeof setPrototype.has === 'function',
    brand:
      getNativeGetter(typeof Set === 'function' ? Set : undefined, 'size') ||
      (setPrototype && typeof setPrototype.values === 'function' ? setPrototype.values : undefined),
    forEach: setPrototype && typeof setPrototype.forEach === 'function' ? setPrototype.forEach : undefined,
    pairs: false
  }
];

// Only the native receiver check can fail here: the private callback does no work.
function ignore() {}
function isCollection(value, kind) {
  if (kind.has) return kind.check(value);
  if (kind.brand) return hasNativeBrand(value, kind.brand);
  if (!kind.forEach) return false;
  try {
    kind.forEach.call(value, ignore);
    return true;
  } catch (error) {
    return false;
  }
}

function collectionReferences(value) {
  var references = [];
  for (var index = 0; index < collections.length; index++) {
    var kind = collections[index];
    if (!isCollection(value, kind)) continue;
    if (!kind.forEach) throw new TypeError('Native ' + kind.name + ' traversal is unavailable in this runtime.');
    // Copy native references without evaluating the referenced objects. Entry
    // arrays are not graph vertices; Map keys precede their corresponding values.
    kind.forEach.call(value, function (item, key) {
      if (kind.pairs) references.push(key);
      references.push(item);
    });
    break;
  }
  return references;
}

// Preserve for-in scope, including inherited enumerable string properties and
// hidden own shadows. Symbols and non-enumerable properties remain excluded.
function enumerableKeys(value) {
  var keys = [];
  for (var key in value) {
    var descriptor = getOwnPropertyDescriptor(value, key);
    if (!descriptor || descriptor.enumerable) keys.push(key);
  }
  return keys;
}

function frame(value) {
  return { value: value, keys: enumerableKeys(value), index: 0, references: undefined, referenceIndex: 0 };
}

function hasCircularReference(value) {
  if (!isObject(value)) return false;
  var active = createReferenceSet();
  var completed = createReferenceSet();
  var stack = [frame(value)];
  active.add(value);

  // Explicit frames avoid recursive stack growth. Only an active ancestor
  // creates a cycle; completed shared descendants are inspected once.
  while (stack.length > 0) {
    var current = stack[stack.length - 1];
    var child;
    if (current.index < current.keys.length) {
      child = current.value[current.keys[current.index++]];
    } else {
      // Preserve existing property-read order and early returns before visiting
      // collection contents. This is not an immutable snapshot of the graph.
      if (current.references === undefined) current.references = collectionReferences(current.value);
      if (current.referenceIndex === current.references.length) {
        active.delete(current.value);
        completed.add(current.value);
        stack.pop();
        continue;
      }
      child = current.references[current.referenceIndex++];
    }
    if (!isObject(child)) continue;
    if (active.has(child)) return true;
    if (!completed.has(child)) {
      active.add(child);
      stack.push(frame(child));
    }
  }
  return false;
}

module.exports = hasCircularReference;
