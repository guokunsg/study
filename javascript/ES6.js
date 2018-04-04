// http://es6-features.org
// Constants: const
// Scoping: Block-scoped variables, Block-scoped functions
// Arrows functions
// Extended parameter handling
//     Default parameter values: function(x, y = 1)
//     Rest parameter: function f(x, y, ...a)
//     Spread operator (...): Spreading of elements of iterable collection into both literal elements and individual function parameters
console.debug("Spread operator(...)");
let params = ["hello", true, 7]; 
console.debug("Param is: " + params);
console.debug("[1, 2, ...params] is: " + [1, 2, ...params]); // [1, 2, "hello", true, 7]
console.debug("{ ...params } is: ", { ...params }); // { '0': 'hello', '1': true, '2': 7 }
let str = "foo"; 
console.debug("str='foo' [...str] is: ", [...str]); // ["f", "o", "o"]
let object = { propA: "A", propB: "B" };
console.debug("object is: ", object, " {...object} is: ", {...object});
// Template literals
//     String interpolation
console.debug("Use `(not ') for string interpolation. ${object.propA} is: ", `object.propA ${object.propA}`);
//     Custom interpolation: 
console.debug("Custom interpolation ${2+3} is: ", `${2+3}`);
//     Raw string access: Access the raw template string content. String.raw``
// Extended literals
//     Binary & Octal literal: 0b111110111 === 503 === 0o767 
//     Unicode String & RegExp Literal: 
// Enhanced Regular Expression
// Enhanced Object Properties
//     Property Shorthand: Shorter syntax for common object property definition idiom.
let x = "XXX", y = "YYY";
object = { x, y }; // ES5 style: { x: x, y: y}
console.debug("x='XXX' y='YYY' {x, y} is: ", object);
//     Computed property names:
console.debug("{[x + y]} is: ", { [x + y] : 42 });
//     Method properties
object = { foo(a, b) {} }; // ES5 style: { foo: function(a, b) {} }
// Destructuring Assignment
//     Array Matching
let [a, , c] = params;
console.debug("Params is ", params, "let [a, , c] = params; a is:", a, "c is: ", c);
//     Object Matching, Shorthand Notation: Intuitive and flexible destructuring of Objects into individual variables during assignment.
object = {aa: "AA", bb: "BB"}; 
let {aa, bb} = object; // Seems have to define new variables
console.debug("object destruction into aa", aa, "bb", bb);
//     Object matching, deep matching: var { op: a, lhs: { op: b }, rhs: c } = getASTNode()
let {aa : aaa, bb: bbb} = object;
console.debug("Object matching with new variables: ", aaa, bbb);
//     Object And Array Matching, Default Values: var { a, b = 2 } = obj
//     Parameter Context Matching: Intuitive and flexible destructuring of Arrays and Objects into individual parameters during function calls.
function f1({ name: n, value: v}) { console.debug("Name is:", n, "value is:", v)}
f1({ name: "foo", value: "bar"});
//     Fail-Soft Destructuring: Fail-soft destructuring, optionally with defaults. 
//         var list=[7, 42]; var [a=1, b=2, c=3, d]=list; // a === 7 b === 42 c === 3 d === undefined
// Modules
//     Value Export/Import: Support for exporting/importing values from/to modules without global namespace pollution
//     Default & Wildcard: Marking a value as the default exported value and mass-mixin of values.
//         export function sum(x, y) {} export var pi=3.14; // match.js
//         import * as match from "lib/match"; import { sum, pi} from "lib/math";
// Classes
//     Class Definition, Class Inheritance, Class Inheritance, From Expressions, Base Class Access
//     Static Members, Getter/Setter
// Symbol Type
//     Symbol Type
//     Global Symbols: Global symbols, indexed through unique keys.
// Iterators
//     Iterator & For-Of Operator
let fibonacci = { 
    [Symbol.iterator]() { let pre = 0, cur = 1;
        return { next () { [ pre, cur ] = [ cur, pre + cur ];
                return { done: false, value: cur } 
}}}}
for (let n of fibonacci) { if (n > 1000) break; }
// Generators
// Map/Set & WeakMap/WeakSet
//     Set Data-Structure: Set
//     Map Data-Structure: Map
//     Weak-Link Data-Structures: WeakSet, WeakMap
// Typed Arrays (ignored)
// New Built-In Methods (ignored)
// Promises
// Meta-Programming
//     Proxying
let target = { foo: "Welcome, foo" } 
let proxy = new Proxy(target, { 
    get (receiver, name) { 
        return name in receiver ? receiver[name] : `Hello, ${name}` } 
    })
console.debug("Proxy. proxy.foo", proxy.foo, "proxy.world", proxy.world); // world is not in target
//     Reflection: Make calls corresponding to the object meta-operations. Reflect.ownKeys(obj)
// Internationalization & Localization (ignored)
