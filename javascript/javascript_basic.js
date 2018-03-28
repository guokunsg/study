"use strict"
// Use "use strict" to enable some modern features

let message;            // Declare a variable 
var age = 25;           // var is the old style
// num = 5;             // Valid in old style but not for modern style ("use strict")
message = "Hello"       // ; can be omitted for some statement
const PI = 3.1415926;   // Constant variable

message = 12345;        // A variable can contain any data
// Infinity             // Infinity is a constant. 1 / 0 is equal to Infinity
// NaN                  // NaN represents computational error. Any computation after NaN results in NaN
// null                 // null value
// undefined            // undefined value
// 7 basic types:       number, string, boolean, null, undefined, object, symbol
console.info("typeof null: " + typeof(null))  // null is not actually an object type. JS language error
console.debug("typeof undefined: " + typeof(undefined)); // undefined
console.debug("typeof NaN: " + typeof(NaN)); // number
console.debug("NaN == undefined: " + (NaN == undefined)); // false
console.debug("NaN == NaN: " + (NaN == NaN)); // false: NaN is not equal to any number

message = "Hello";      // Double quote string
message = 'Hello';      // Single quote string
message = `PI is ${PI}`;        // `` Allows to embed variables and expressions in a string, and also allows to span over multi-lines
message = `1 + 2 = ${1 + 2}`;   // Use `` with expression

message = String(PI);   // Convert type to string
let num = Number(PI);   // Convert type to number
// Number(true) is 1; Number(false) is 0; Number(null) is 0; Number(undefined) is NaN;
num = "6" / "3";        // Can do computation with string directly. returned type is number.
num = Boolean("true");  // Convert to boolean. Empty, null, undefined, NaN are converted to false, all others to true

num = +"6";             // unary form of + can be used to convert other types to number. Same as Number(variable) but shorter
num = 5 ** 2;           // Exponentiation **
num = 25 ** (1/2);      // Exponentiation ** for square root

console.debug("'Z' > 'A' is " + ('Z' > 'A'))            // Can do string comparison
console.debug("'2' > 1 is " + ('2' > 1))                // Compare with number
console.debug("Boolean(0)=" + Boolean(0) + " Boolean('0')=" + Boolean("0") + " 0=='0' is " + (0 == '0'));
console.debug("Strict equal: 0==false is " + (0 == false) + " 0===false is " + (0 === false)); // Strict equality checks the type 

console.log("1 +  +'2' + '2' = " + (1 +  +"2" + "2"));
console.log("1 +  -'1' + '2' = " + (1 +  -"1" + "2"));
console.log('+"1" +  "1" + "2" = ' + (+"1" +  "1" + "2"));
console.log('"A" - "B" + "2" = ' + ("A" - "B" + "2"));
console.log('"A" - "B" + 2 = ' + ("A" - "B" + 2));
// String concatenation 
// Number + Number -> add
// Boolean + Number -> add
// Boolean + Boolean -> add
// Number + String -> concat
// String + Boolean -> concat
// String + String -> concat

// Function declaration
// Function can accept any number of arguments (even not declared). Can get with rest or arguments variable
function some_func(param1, param2="defaule_value", ...rest) {
    if (param2 == null) 
        return; // Same as return undefined
    return "some_value"; // Note: Return and the value must be on the same line, otherwise it returns undefined without computation value
}
some_func.counter = 0;   // Function can have properties like object
// A Function Declaration is usable in the whole script/code block.
function callback(result) { 
}
let func = callback;    // Can be used to implement callback functions
func = function() { };  // Function expression. Only usable afterwards
func = function func_name()  { };  // Function expression can have a function name which only exists in its body scope. Can be used to reference itself

let sum = (a, b) => a + b;  // Arrow function 
sum = (a, b) => { // Can have body in {} 
    return a + b;
}
sum = new Function('a', 'b', 'return a + b;') // Function can be created with string in format: new Function ([arg1[, arg2[, ...argN]],] functionBody)

(function() {
    let a = b = 3;
})();
console.debug("b: " + b + " a: " + typeof a); 
// b is a global variable. a is a local variable

// Object
let user = new Object();
let prop_name = "prop_name";
user = { // Object literal way to create new object
    name: "Bob",
    age: 15, 
    "some prop" : true,         // Multiword property name must be quoted
    [prop_name] : 100,          // Computed properties
    toString: function () {
        return "I am user: " + this.name;
    },
    getName() { return this.name; }, 
    get Fullname() { return this.name; } // Use get for getter, use set for setter
}
user.age = 16;
user["some prop"] = false;              // Use ['prop name'] to access multiword property
delete user["some prop"];               // Can use delete to delete properties. Value will be undefined
user["some prop"] === undefined;        // Existence check 
console.debug("name exists in object: " + ("name" in user));    // Use in to check existence
user.score = 100;                       // Can add one extra property
let str = "";
for (let name in user)                  // Use for in to loop properties
    str += name + " "
console.debug("All properties: " + str);
console.debug("Call function: toString: " + user.toString() + " getName: " + user.getName());
let GN = user.getName; 
console.debug("Use function call to call object function: " + GN.call(user)); // There is another apply function to pass an array of parameters
// Can use Object.defineProperties to make property writable, enumerable, configurable 

// Prototypal inheritance: use __proto__ for inheritance
let admin = {
    __proto__ : user,                   // __proto__ implements getter and setter to forward calls to the base
    isAdmin: true
}
console.debug("Inherited user: " + admin.name);
console.debug("User constructor: " + user.constructor);

// Objects are copied by reference
let clone = Object.assign({}, user);    // Create a copy of an object. (Not a deep copy)

let id = Symbol(); // “Symbol” value represents a unique identifier. symbols are always different
user.id = 12345;   // To avoid naming conflict
// Symbols will not appear in the FOR IN loop but in Object.assign copy
let id1 = Symbol("ID"), id2 = Symbol("ID");
console.debug("ID1 == ID2: " + (id1 == id2));
id1 = Symbol.for("ID"); id2 = Symbol.for("ID");     // use Symbol.for(key) to create global symbol
console.debug("ID1 == ID2: " + (id1 == id2));

// Constructor function: Must be used with new function()
function User(name) {
    // this = {}; (implicitly)
    if (!new.target) { // Can check whether the function is called with new 
        return new User(name); // Add a new so that the function can be used as constructor in a normal call
      }
    this.name = name;
    // return this;  (implicitly)
}   // By default, there is a prototype created: User.prototype = { constructor: User };
// prototype is more memory efficient, all methods are actually inside prototype not on the object. 
user = new User("Peter");
console.debug("Created a new User: " + user.name);
console.debug("user.__proto__ == User.prototype: " + (user.__proto__ == User.prototype));

// Class
class BaseClass {
    constructor(...args) {
        this.prop_name = "some value";
    }
    method1(...args) {}
    get something() {}
    set something(value) {}
    static staticMethod(...args) {}
}
class OtherClass extends BaseClass {}

var Employee = {
    company: 'xyz'
}
var emp1 = Object.create(Employee); 
// emp1 is created with prototype and have no company property
delete emp1.company
console.log(emp1.company);

// Array
let arr = new Array();
arr = [];
let chars = ['A', 'B', 'C', 'D', 'E'];
let [A, B, ...rest] = chars; // Array destructing. A is 'A', B is 'B', rest is the array of rest elements
let [name = "Guest", surname = "Anonymous"] = ["Julius"]; // Default values. name will be set to Julius, surname no change
// Destructing also works for object
arr = [1, 2, 3, 4, 5];
console.debug("Use spread to pass array as function argument list: " + Math.max(...arr)); // Spread array to the function parameters

// Extend error
class MyError extends Error {
    constructor(message) {
        super(message);
    }
}
try {
    throw new MyError("Some error");
} catch (err) {
    console.debug("Try catch error: " + err.message + " is MyError: " + (err instanceof MyError));
}

// RegExp: syntax: /pattern/modifiers
// Modifiers: i: case-insensitive   g: global match (find all matches)   m: multiline matching
str = "This is a test";
str = str.replace(/[\W_]/g, '').toLowerCase(); // Remove all non word characters
console.debug("str is: " + str);

// Iteratable to show interface
let range = {
    from: 1,
    to: 5
}; 
// 1. call to for..of initially calls this
range[Symbol.iterator] = function() { 
    // 2. ...it returns the iterator:
    return {
        current: this.from,
        last: this.to,
        // 3. next() is called on each iteration by the for..of loop
        next() {
            // 4. it should return the value as an object {done:.., value :...}
            if (this.current <= this.last) {
                return { done: false, value: this.current++ };
            } else {
                return { done: true };
            }
        }
    };
};

// window can be used as a global variable holder
