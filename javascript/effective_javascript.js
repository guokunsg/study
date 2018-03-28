// Item1: Know which JavaScript you are using

// Item2: Understand JavaScript's floating-point numbers
//   * All numbers in JavaScript are double-precision floating-point numbers.
//   * Integers in JavaScript are just a subset of double rather than a separate datatype.
//   * Bitwise operators treat numbers as if they were 32-bit signed integers.
console.debug("0.1 + 0.2=" + (0.1 + 0.2) + " == 0.3: " + (0.1 + 0.2 == 0.3)); 

// Item3: Beware of implicit coercions
//   * NaN: Not a number. NaN is the only JS value that is treated as unequal to itself
console.debug("NaN == NaN: " + (NaN == NaN));
//   * isNaN not safe to use, it converts type to number first, so invalid value converted to NaN
console.debug("isNan(NaN): " + isNaN(NaN) + ". isNaN('string'): " + isNaN('string'));
//   * Can use NaN != NaN to test whether it is really NaN
function isReallyNaN(X) { return x !== x; }
//   * Objects can be converted to numbers via their valueOf method, so string concatenation with
//     an object can behave unexpectedly
var obj = { 
    toString: function() { return "An object";},
    valueOf: function() { return 17; }
};
console.debug("valueOf is called when string concatenation: " + obj);
//   * Use typeof or comparison to undefined rather than truthiness to test for undefined values
//     (Don't use if (some_object), use some_object === undefined or typeof(some_object) === 'undefined') 

// Item4: Prefer primitives to object wrappers
//   * primitive values: booleans, numbers, strings, null, undefined, symbol (Added in ES6)
console.debug("typeof(null): " + typeof(null)); // Null is reported as object
console.debug("typeof(''): " + typeof('') + ". typeof(new String(''): " + typeof(new String("")));
console.debug("'' === '': " + ('' === '') + ". new String('') === new String(''): " + 
        (new String('' === new String(''))));
//   * Getting and setting properties on primitives implicitly creates object wrappers
"hello".someProp = 17;
console.debug("someProp: " + "hello".someProp); 

// Item5: Avoid using == with mixed types
//   * == applies a confusing set of implicit coercions when its arguments are of different types
//   * === makes it clear that the comparison does not involve any implicit coercions
//   * Defined function for explicit coercions when comparing values of different types to mkae clear
console.debug("null == undefined: " + (null == undefined));

// Item6: Learn the limits of semicolon insertion
//   * ; is inserted before a } token, after one or more newlines or at the endof the program input
//   * ; is only inserted when the next input token cannot be parsed
//   * ; is never inserted as separators in the head of a for loop or as empty statements
//   * Never omit ; before a statement beginning with ([+-/
//   * When concatenating scripts, insert ; explicitly between scripts
;(function(x) {} ) // Defensively add a ; before the function
//   * Never put a newline before the argument to return, throw, break, continue, ++ or --
//     return {}; is not the same as return\n {}; , a ; will be inserted after return and before \n

// Item7: Think of strings as sequences of 16bit code units


// Item8: Minimize use of the global object
//   * Avoid declaring global variables
//   * Declare variables as locally as possible
//   * Avoid adding properties to the global object
//   * Use the global object for platform feature detection

// Item9: Always declare local variables
//   * Always declare new local variables with var (ES6 use let)
//   * Consider using lint tools to help check for unbound variables

// Item10: Avoid with

// Item11: Get comfortable with closures
//   * Functions can refer to variables defined in outer scopes
//   * Closures can outlive the function that creates them
//   * Closures internally store REFERENCES to their outer variables, and can read and update stored variables
function sandwichMaker(magicIngredient) {
    // Returns a function expression. magicIngredient is stored with the function
    return function(filling) {
        return magicIngredient + " and " + filling;
    };
}
f = sandwichMaker("ham");
console.debug("Closure: " + f("egg"));

// Item12: Understand variable hoisting
//    * Variable declarations within a block are implicitly hoisted to the enclosing function
//    * Redeclarations of a variable are treated as a single variable
function testWithVar(A) {
    { var A = "B"; }    // Scope of A is entire function
    return A;
}
function testWithLet(A) {
    { let A = "B"; }    // Scope of A is insided the function
    return A;
}
console.debug("Var declartion scop is function: " + testWithVar("A") + ". let scope is block: " + testWithLet("A"));

// Item13: Use immediately invoked function expressions to create local scopes
//    * Closures capture their outer variables by reference, not by value
function wrapElements(a) {
    for (var result = [], i = 0, n = a.length; i < n; i ++) {
        result[i] = function() { 
            // Closure store their outer variables by reference, so i is the final value 5
            return a[i]; 
        };
    }
    return result;
}
let wrapped = wrapElements([1, 2, 3, 4, 5]);
console.debug("Closure stores their outer variables by reference so all functions in wrapped returns undefined");
//    * Use immediately invoked function expressions (IIFEs) to create local scopes
function wrapElements2(a) {
    for (var result = [], i = 0, n = a.length; i < n; i ++) {
        // The idea is to create a local variable to store the value
        // An alternative way is to pass i as function parameter
        (function() {
            var j = i;
            result[i] = function() { return a[j]; };
        })();
    }
    return result;
}
wrapped = wrapElements2([1, 2, 3, 4, 5]);

// Item14: Beware of unportable scoping of named function expressions
//    * Named function expressions mainly used to improve stack traces in error objects and debuggers
function double(x) { return x * 2; } // Function 
f = function double(x) { return x * 2; } // Named function express

// Item15: Beware of unportable scoping of block-local function declarations
//    * Behavior of defining a function in a block is not defined (Not sure about ES6)
//    * Use var declarations instead of function declarations
f = function() { };

// Item16: Avoid creating local variables with eval
eval("console.debug('Executed by eval');");
//    * Avoid creating variables with eval that pollutes the caller's scope
//    * If eval code might create global variables, wrap the call in a nested function to prevent scope pollution
//      (function() { eval(src);}) ();

// Item17: Prefer indirect eval to direct eval
//    * eval has access to the full scope at the point where it's called
//    * Prefer indirect eval because direct call may expose local variables
x = "global";
function directEval() {
    var x = "local";
    return eval("x");
}
console.debug("Direct call of eval uses local scope variable: " + directEval());
function indirectEval() {
    var x = "local";
    var f = eval; // Indirect call. 
    return f("x"); // Can also use (0, eval)(src) for indirect call
}
console.debug("Indirect call of eval uses global scope variable: " + indirectEval());

// Item18: Understand the difference between function, method, and constructor calls
//    * Method calls provide the object this in which the method property is looked up as their receiver
//    * Function calls provide the global object (or undefined for strict functions) as their receiver
//    * Constructors are called with new and receive a fresh object as their receiver

// Item19: Get comfortable using higher-order functions
//    * Higher-order functions are functions that take other functions as arguments 
//      or return functions as their result

// Item20: Use call to call methods with a custom receiver
// call method: f.call(object, arg1, arg2); similar to f(arg1, arg2) except, 
//              the first argument provides an explicit receiver object
//    * Use the call method to call a function with a custom receiver
//    * Use the call method for calling methods that may not exist on a given object
//    * Use the call method for defining higher-order functions that allow clients to provide a receiver for the callback 

// Item21: Use apply to call functions with different numbers of arguments
//    * Use the apply method to call variadic functions with a computed array of arguments
//    * Use the fist argument of apply to provide a receiver for variadic methods

// Item22: Use arguments to create variadic functions
//    * Use the implicit arguments object to implement variable-arity functions

// Item23: Never modify the arguments object
//    * Copy the arguments object to a real array using [].slice.call(arguments) before modifying it

// Item24: Use a variable to save a reference to arguments
//    * Be aware of the function nesting level when referring to arguments
//    * Bind an explicitly scoped reference to arguments in order to refer to it from nested functions

// Item25: Use bind to extract methods with a fixed receiver
//    * Beware that extracting a method does not bind the method's receiver to its object
//    * Use bind as a shorthand for creating a function bound to the appropriate receiver
var buffer = {
    entries: [],
    add: function(s) { this.entries.push(s); },
    join: function() { return this.entries.join(""); }
};
var source = ["1", "2", "3"];
source.forEach(buffer.add.bind(buffer)); // bind creates a new function with its receiver bound to buffer
console.debug("Use bind to extract methods with a fixed receiver: " + buffer.join());

// Item26: Use bind to curry functions
//    * Use bind to curry a function, to create a delegating function with a fixed subset of the required arguments
//    * Pass null or undefined as the receiver argument to curry a function that ignores its receiver

// Item27: Prefer closures to strings for encapsulating code
//    * Never include local references in strings when sending them to APIs that execute them with eval
//    * Prefer APIs that accept functions to call rather than string to eval 

// Item28: Avoid relying on the toString method of functions
//    * Avoid using toString method on functions, which returns unreliable source code

// Item29: Avoid nonstandard stack inspection properties
//    * Avoid the nonstandard arguments.caller and arguments.callee because they are not reliably portable

// Item30: Understand the differences between prototype, getPrototypeOf, and __proto__
//    * C.prototype determines the prototype of objects created by new C()
//    * Object.getPrototypeOf(obj) is the standard function for retrieving the prototype of an object
//    * obj.__proto__ is a nonstandard mechanism for retrieving the prototype of an object
//    * A class is a design pattern consisting of a constructor function and an associated prototype

// Item31: Prefer Object.getPrototypeOf to __proto__
//    * Prefer the standards-compliant Object.getPrototypeOf to the non-standard __proto__ property

// Item32: Never modify __proto__
//    * Never modify an object's __proto__ property
//    * Use Object.create to provide a custom prototype for new objects

// Item33: Make your constructors new-Agnostic
function User(name) {
    // Check whether the function is called with new. Can also check whether new.target is null
    if (!(this instanceof User))
        return new User(name);
    this.name = name;
}

// Item34: Store methods on prototypes
//    * Storing methods on instance objects creates multiple copies of the functions, one per instance object
//    * Prefer storing methods on prototypes over storing them on instance objects

// Item35: Use closures to store private data
//    * Closure variables are private, accessible only to local references
//    * Use local variables as private data to enforce information hiding within methods
function User2(name) {
    this.toString = function() {
        // Outside code has no direct access to this name as a User2 property
        return "[User " + name + "]";
    };
}

// Item36: Store instance state only on instance objects
//    * Mutable data can be problematic when shared, and prototypes are shared among all their instances
//    * Store mutable per-instance state on instance objects

// Item37: Recognize the implicit binding of this
//    * The scope of this is always determined by its nearest enclosing function
//    * User a local variable, usually called self, me, or that, to make a this-binding available to inner functions
function thisBound(name) {
    this.name = name;
    (function(object) {
        // this.name is referring to the function expression. Can be solved by passing this as a parameter
        console.debug("this.name:" + this.name + " x: " + object.name);
    })(this);
}
new thisBound("Test");

// Item38: Call superclass constructors from subclass constructors
//    * Call the superclass constructor explicity from subclass constructors, passing this as the explicit receiver
//    * Use Object.create to construct the subclass prototype object to avoid calling the superclass constructor
function Actor(name, age) {
    User.call(this, name);
    this.age = age;
}
Actor.prototype = Object.create(User.prototype);
let actor = new Actor("test", 10);
console.debug("Actor is a subclass of User: " + actor.name);

// Item39: Never reuse superclass property names

// Item40: Avoid inheriting from standard classes
//    * Inheriting from standard classes tends to break due to special internal properties such as [[Class]]
//    * Prefer delegating to properties instead of inheriting from standard classes

// Item41: Treat prototypes as an implementation detail
//    * Objects are interfaces; prototypes are implementations
//    * Avoid inspecting the prototype structure of objects you don't control
//    * Avoid inspecting properties that implement the internals of objects you don't control

// Item42: Avoid reckless monkey-patching
//    * Avoid adding, removing or modifying common object prototype properties

// Item43: Build lightweight dictionaries from direct instances of object

// Item44: Use null prototypes to prevent prototype pollution
//    * Use Object.create(null) to create prototype-free empty objects that are less susceptible to pollution

// Item45: Use hasOwnProperty to protect against prototype pollution
// The hasOwnProperty() method returns a boolean indicating whether the object has the specified property 
// as own (not inherited) property
let hasOwn = Object.prototype.hasOwnProperty;
// ??? Seems Actor is not a true subclass of User
console.debug("Actor hasOwnProperty: name=" + hasOwn.call(actor, "name") + " toString: " + actor.hasOwnProperty("toString"));

// Item46: Prefer arrays to dictionaries for ordered collections

// Item47: Never add enumerable properties to Object.prototype
//    * Avoid adding properties to Object.prototype
//    * Object.defineProperty can be used to make prototype property writable, enumerable, configurable

// Item48: Avoid modifying an object during enumeration
//    * Make sure not to modify an object while enumerating its properties with a for-in loop
//    * Use a while loop or classic for loop instead of a for-in loop when iterating over and object whose contents might change during the loop

// Item49: Prefer for loops to for-in loops for array iteration
//    * A for-in loop always enumerate the keys
var scores = [98, 74, 85, 77, 93, 100, 89];
var total = 0;
for (var score in scores)
    total += score;
var mean = total / scores.length;
// total is the concatenation of all the keys (string)
console.debug("Incorrect adding using for-in loop. Mean is: " + mean); 

// Item50: Prefer iteration methods to loops
//    * Use iteration methods such as Array.prototype.forEach and map in place of for loops to make code 
//      more readable and avoid duplicating loop control logic
//    * some and every methods can be used for early exit
[1, 2, 3, 4, 5].some(x => {
    if (x > 3) {
        console.debug("Use some for early termination when value > 3");
        return true;
    } else {
        return false;
    }
});

// Item51: Reuse generic array methods on array-like objects
//    * Reuse generic array methods on array-like objects by extracting method objects and using their call method
//    * Any object can be used with generic array methods if it has indexed properties and an appropriate length property

// Item52: Prefer array literals to the array constructor
//    * Array constructor behaves differently if its first argument is a number

// Item53: Maintain constraint conventions
//    * Use consistent conventions for variable names and function signatures

// Item54: Treat undefined as no value
//    * Avoid using undefined to represent anything other than the absence of a specific value
//    * Never use truthiness tests for parameter default values that should allow 0, NaN or empty string as valid arguments

// Item55: Accept options objects for keyword arguments
//    * Use options objects to make APIs more readable and memorable
//    * The arguments provided by an options object should all be treated as optional
//    * Use an extend utility function to abstract out the logic of extracting values from options objects

// Item56: Avoid unnecessary state
//    * Prefer stateless APIs where possible

// Item57: Use structural typing for flexible interfaces
//    * Structural type or duck typing: Any object will do so long as it has the expected structure 
//      (if it looks like a duck, swims like a duck and quacks like a duck)
//    * Avoid inheritance when structural interfaces are more flexible and lightweight
//    * Use mock objects for unit testing

// Item58: Distinguish between array and array-like
//    * Never overload structural types with other overlapping types
//    * When overloading a structural type with other types, test for the other types first
//    * Accept true arrays instead of array-like objects when overloading with other object types
//    * Can use Array.isArray to check whether is an array

// Item59: Avoid excessive coercion
//    * Avoid mixing coercions with overloading
//    * Consider defensively guarding against unexpected inputs

// Item60: Support method chaining
//    * Use method chaining to combine stateless operations
//    * Support method chaining by designing stateless methods that produce new objects
//    * Support method chaining in stateful methods by returning this

// Item61: Don't block the event queue on I/O
//    * Asynchronous APIs take callbacks to defer processing of expensive operations and avoid blocking the main application
//    * JavaScript accepts events concurrently but processes event handlers sequentially using an event queue
//    * Never use blocking I/O in an application's event queue

// Item62: Use nested or named callbacks for asynchronous sequencing
//    * Use nested or named callbacks to perform several asynchronous operations in sequence
//    * Try to strike a balance between excessive nesting of callbacks and awkward naming of non-nested callbacks
//    * Avoid sequencing operations that can be performed concurrently

// Item63: Be aware of dropped errors
//    * Make sure to handle all error conditions explicitly to avoid dropped errors

// Item64: Use recursion for asynchronous loops
//    * Loops cannot be asynchronous
//    * Use recursive functions to perform iterations in separate turns of the event loop

// Item65: Don't block the event queue on computation
//    * Avoid expensive algorithms in the main event queue

// Item66: Use a counter to perform concurrent operations
//    * Events in a JavaScript application occur non-deterministically, in unpredictable order
//    * Use a counter to avoid data races in concurrent operations

// Item67: Never call asynchronous callbacks synchronously 
//    * Never call an synchronous callback synchronously, even if the data is immediately available
//    * Calling an async callback synchronously disrupts the expected sequence of operations and can lead to unexpected interleaving of code
//    * Calling an async callback synchronously can lead to stack overflows or mishandled exceptions
//    * Use an async API such setTimeout to schedule an async callback to run in another turn

// Item68: Use promises for cleaner asynchronous logic
//    * Promises is like Future in java
//    * Promises represent eventual values, that is, concurrent computations that eventually produce a result
//    * Use promises to compose different concurrent operations
//    * Use promises APIs to avoid data races
//    * Use select for situations where an intentional race condition is required


























