// Need to install modules: npm install async

// reactor pattern: 
//    * Handles I/O by blocking until new events are available from a set of observed resources, 
//      and then reacts by dispatching each event to and associated handler
//    * Steps:
//      1. Application generates a new I/O operation by submitting a request to the event demultiplexer.
//         Application also specifies a handler, which will be invoked when the operation completes.
//         Submitting a new request to the event demultiplexer is a non-blocking call and it immediately returns control to the application
//      2. When a set of I/O operations completes, event demultiplexer pushes the new event into event queue
//      3. At this point, event loop iterates over the items of the event queue
//      4. For each event, the associated handler is invoked
//      5. Handler (application's code) will give back control to the event loop when its execution completes. 
//      6. When all the items in event queue are processed, the loop will block again on event demultiplexer which will then trigger another cycle when a new event is available.

const fs = require('fs');
const EventEmitter = require('events');

// Chapter 2: Node.js essential patterns
// Pattern Callback:
function add(a, b, callback) { callback(a + b); }
function addAsync(a, b, callback) { setTimeout(() => callback(a + b), 0); }
// Zalgo: Unpredictable function, which behaves synchronously under certain conditions and asynchronously under others
// * Prefer the direct style for purely synchronous functions
// * We guarantee that a callback is invoked asynchronously by deferring its execution using process.nextTick()
process.nextTick(() => console.debug("run in process.nextTick"));
// Callback conventions: callbacks come last, error comes first, propagating errors
function readFile(filename, callback) {
    fs.readFile(filename, "utf8", (err, data) => {
        if (err) // Propagate the error
            return callback(err);
        callback(null, data);
    });
}

// Module system
// Revealing module pattern:
const simple_module = (() => {
    const privateFoo = () => {}; 
    const exports = {
        publicBar: () => { }
    }
    return exports;
});
function load_simple_module(filename, module, require) {
    const wrappedSrc = "(function(module, exports, require) {"
        "${fs.readFileSync(filename, 'utf8')}})(module, module.exported, require);";
    eval(wrappedSrc);
}
// require will load module with caches. The module is cached using its full path as lookup key.
// Everything inside a module is private unless it's assigned to the module.exports variable 
// A special variable global can be used to define a global variable, but polluting the global scope is considered bad practice
// Require function is synchronous so any assignment to module.exports must be synchronous

function Module() { 
    return { exports: () => {} } // Simulate a module with exports 
}
let inner_module = new Module(); // Simulate a module
function req(mod) { return mod.exports; } // Simulate the require function, returns exports object
let mod;

// Module definition patterns:
// Named exports: assigning all the values we want to make public to properties of the object referenced by exports
inner_module.exports.info = (message) => {};
mod = req(inner_module); mod.info("some message");

// Exporting a function: Reassigning the whole module.exports to a function
inner_module.exports = (message) => {};
inner_module.exports.verbose = (message) => {}; // Still can add named function
mod = req(inner_module); mod("some message"); mod.verbose("some verbose message");
// Single Responsibility Principle (SRP): Every module should have responsibility over a single functionality and that 
//       functionality should be entirely encapsulated by the module
// Substack pattern: Expose the main functionality of a module by exporting only one function,
//     Use the exported function as namespace to expose any auxiliary functionality.

// Exporting a constructor: Allows the user to create new instances using the constructor,
//     but also give them the ability to extend its prototype and forge new classes
function mod_logger(name) { this.name = name; }
mod_logger.prototype.log = (message) => {};
// Same as class mod_logger { constructor(name) { this.name = name; } log(message) {} }
inner_module.exports = mod_logger;
mod = req(inner_module); mod_instance = new mod("test"); mod_instance.log("test");

// Exporting an instance: like create a singleton but cannot guarantee the uniqueness as the module might be installed multiple times
// Modifying other modules or the global scope: Bad practice but may be useful for testing

// Observer pattern: Can use EventEmitter class for observer pattern
function testEmitter() {
    let emitter = new EventEmitter();
    setTimeout(()=> emitter.emit("test"), 100);
    return emitter;
}
testEmitter().on("test", () => { console.debug("Event happened"); });
// Extend EventEmitter class to make object observable

// Chapter 3: Asynchronous control flow patterns with callbacks
// Organize code to avoid callback hell
//     Exit as soon as possible; create named functions for callbacks, keeping them out of closures and passing intermediate resultes as arguments; modularize code
// Sequential iterator pattern
//     Execute a list of tasks in sequence by creating a function named iterator, which invokes the next available task in the collection and 
//     makes sure to invoke the next step of iteration when the current task completes
// Parallel execution pattern
//     Run a set of asynchronous tasks in parallel by spawning them all at once, and then wait for all of them to complete by 
//     counting the number of times their callbacks are invoked.
//     Use queue to limit the concurrency. 
// Async library
const async = require('async');
// async.series(tasks, [callback]);
async.series([
    function(cb) { console.debug("async.series task1"); cb(); }, // Callback needs to be called to continue
    function(cb) { console.debug("async.series task2"); cb(); },
], err => { console.debug("async.series.done with error: " + err); });
// async.waterfall executes the tasks in sequence but in addition, it also provides the output of each task as input the next.
// async.eachSeries iterates over a collection of data in sequential way. async.each similar but runs in parallel
async.eachSeries(["A", "B"], (data, cb) => {
    console.debug("async.eachSeries processing " + data); cb();
}, (err) => { console.debug("async.eachSeries done with error: " + err) });
// async.queue(worker_function, concurrency)
const q = async.queue((taskData, cb) => {
    console.debug("async.queue processing queued data: " + taskData); cb(null);
}, 2);
q.push("A", err => { console.debug("async.queue done with error: " + err); });

// Chapter 4: Asynchronous control flow patterns with ES2015 and beyond
// Promise: An abstraction that allows a function to return an object called promise, which represents the eventual result of an async operation.
//     promise.then([onFulfilled], [onRejected]);
//     onFulfilled and onRejected are guaranteed to be invoked asynchronously
// ES2015 promises: Constructor( new Promise( function ( resolve, reject ) {} ));
new Promise((resolve, reject) => { console.debug("promise is running"); resolve("Resolved!");})
    .then(result => { console.debug("promise running result: " + result); return "Then1 result" })
    .then(result => { console.debug("promise then1 result: " + result)} ) // Can have multiple then
    .catch(err => { console.debug("promise failed with error: " + err)}); // Only called when there is error
// promisify is a function which can turn callback based function into promise style
function funcWithCallbacks(param1, param2, cb) { // A simple function with callback style
    process.nextTick(() => cb(null, "Data1", "Data2", "Data3"));
}
function promisify(callbackBasedApi) {
    return function promisified() { // Replace the callbackBasedApi function with this one
        const args = [].slice.call(arguments); // Copy the arguments 
        return new Promise((resolve, reject) => {
            args.push((err, ...result) => { // Append this callback to the end of arguments. (Maybe should remove the callback user passed in?)
                if (err) return reject(err); // Error case
                resolve(result); // Default promise limitation: resolve can only accept one parameter. 
            });
            callbackBasedApi.apply(null, args); // Call the function with this modified arguments
        });
    }
}
promisify(funcWithCallbacks)("param1", "param2")
    .then(args => console.debug("Promisify function wrapper returns: " + args)); // Only one argument can be returned for this implementation
// Sequential iteration pattern: promise = promise.then(...).then(...).then(...)
// Parallel execution: Promise.all
let promises = [ Promise.resolve(1), Promise.resolve(2), new Promise((resolve, reject) => { resolve(3); }) ];
Promise.all(promises).then(results => console.debug("Promise.all results: " + results));
// Exposing callbacks and promises in public APIs
//     Promises have advantages but may need developer to understand it. Callback is simple. Two approaches: 
//     * Only based on callbacks and leave the developer the option to promisify all the exposed functions if needed.
//     * Callback API but it is optional. When callback is missing, return promise

// Generators: function* 
function* fruitGenerator() { yield "apple"; yield "orange"; return "watermelon"; }
gen = fruitGenerator(); // gen.next() return value is an object wil value and done (boolean) properties
console.debug("Generator 1: " + gen.next().value + " 2: " + gen.next().value + " 3: " + gen.next().value + " done: " + gen.next().done);
// Offer a way to actually suspend the execution of a function and resume it at a later stage.

// async / await
function sleep(ms) { return new Promise( 
    resolve => setTimeout(resolve("result"), ms) ); }
async function testAsyncAwait() {
    console.debug("Before sleep");
    let result = await sleep(200); // Await a function which returns promise
    console.debug("After sleep. Result: " + result);
}
testAsyncAwait();

// Chapter 5: Coding with streams
const stream = require('stream');
const Chance = require('chance'); // Random module
const chance = new Chance();
// Every stream is an implementation of one of the 4 base abstract classes in the stream core module:
//     Stream.Readable, Stream.Writable, Stream.Duplex, Stream.Transform
// Each stream class is also an instance of EventEmitter
// Binary mode: Data is streamed in the form of chunks, such as buffers or strings
// Object mode: Streaming of data is treated as a sequence of discrete objects
// Readable stream: readable.read([size])
class RandomStream extends stream.Readable {
    constructor(options) { super(options); }
    _read(size) { // The interface to implement
        const chunk = chance.string();
        this.push(chunk, 'utf8'); // Write data into stream
        if (chance.bool({likelihood: 20})) // 20% chances of true
            this.push(null); // Push null to indicate the end
    }}
rs = new RandomStream();
rs.on('readable', () => {
    let chunk;
    while ((chunk = rs.read()) != null) // Read from stream until returns null
        console.log("Chunk received: " + chunk);
}).on('end', () => console.debug("Stream ends"));
// Writable stream: writable.write(chunk, [encoding], [callback]), writable.end([chunk], [encoding], [callback])
// writable.write will return false when the internal buffer exceeds the highWaterMark limit. Should stop writing until 'drain' event is received
class ObjectStream extends stream.Writable {
    constructor() { super({objectMode: true}); } // Working in objectMode. Other options: highWaterMark, decodeStrings
    _write(chunk, encoding, callback) {
        console.debug("Received object: " + chunk.data);
    }
}
ws = new ObjectStream();
ws.write({data: "data"});
ws.end();
// Duplex streams: A stream that is both readable and writable. 
// Useful when we want to describe an entity that is both a data source and a data destination, such as network secket
// Duplex streams inherit the methods of both stream.Readable and stream.Writable
// Transform streams: A special kind of duplex stream that are specially designed to handle data transformations
class ReplaceStream extends stream.Transform { // A stream which replaces text
    constructor(searchString, replaceString) { super(); this.searchString = searchString; this.replaceString = replaceString; this.tailPiece = ""; }
    _transform(chunk, encoding, callback) {
        const pieces = (this.tailPiece + chunk).split(this.searchString); // Split with keyword
        const lastPiece = pieces[pieces.length - 1];
        const tailPieceLen = this.searchString.length - 1;
        this.tailPiece = lastPiece.slice(-tailPieceLen);
        pieces[pieces.length - 1] = lastPiece.slice(0, -tailPieceLen);
        this.push(pieces.join(this.replaceString));
        callback();
    }
    _flush(callback) { this.push(this.tailPiece); callback(); }
}
const res = new ReplaceStream("World", "Node.js");
res.on("data", chunk => console.log("Received from ReplaceStream: " + chunk));
res.write("Hello W"); res.write("orld!");
res.end();
// Connecting streams using pipes: readable.pipe(writable, [options])
new RandomStream().pipe(new ObjectStream());
// through2 library to create transform stream: transform = through2([options], [_transform], [_flush])
// from2 library to create readable stream: readable = from2([options], _read)
// Pipe patterns:
//     Combining streams: Can use 'multiple' module
//     Forking streams: Piping a single readable stream into multiple writable streams. Just .pipe multiple writable streams
//     Merging streams: Piping a set of readable streams into a single writable stream. Example: tar ball
//     Multiplexing and demultiplexing: Use a shared channel to deliver the data of a set of streams

// Chapter 6: Design patterns: 
// Factory: A generic interface for creating objects. A mechanism to enforce encapsulation to hide information
// Revealing constructor: Constructor accepts an executor function. Sample: Promise(resolve, reject)
//     Other sample: Read-only event emitter: constructor(executor) { super(); const emit = this.emit.bind(this); 
//                   this.emit = undefined; executor(emit); } // Only the executor is able to call the emit function (Not perfect)
// Proxy/surrogate: 
// Decorator: 
// Adapter: 
// Strategy:
// State: A variation of the strategy pattern where the strategy changes depending on the state of the context. 
// Template:
// Middleware: A particular pattern whereby a set of processing units, filters, and handlers, under the form of functions, 
//      are connected to form an asynchronous sequence in order to perform the preprocessing and postprocessing of any kind of data.
// Command: An object that encapsulates all the information necessary to perform an action at a later time.

// Chapter 7: Wiring modules
// Singleton pattern: Exporting an instance using module.exports is already enough to obtain something very similar to the Singleton pattern
//     But it is only guaranteed to be a singleton within the current package, because each package may have its own copy of the module
// Patterns for wiring modules
// * Hardcoded dependency: A client module explicitly loads another module using require()
// * Dependency injection: The dependencies of a component is provided as input by an external entity.   
//   Factory injection, constructor injection, property injection. property injection is less robust but useful to solve dependency cycle.
//   Pros: decouple module from a particular dependency instance; testing with mock; shifts the responsibility from lower to higher (higher less reusable than lower)
//   Cons: more difficult to understand the relationship; less manageable
// * Service locator: Core principle is to have a central registry in order to manage the components of the system and 
//       to act as a mediator whenever a module needs to load a dependency
//       serviceLocator { factory(name, factory) => {}; register(name, instance) => {}; get(name) => { 
//                            if (registered(name)) return registered_one; if (factory(name)) return factory_created; throw error; } }
//   Cons: Hard to identify the relationship between the components as they are resolved at runtime
// * Dependency injection container: A service locator with the addition of one feature: identifies the dependency requirements of a module before instantiating it.
//       A simple way is based on the arguments' names used in a factory or constructor. 
//       diContainer extends serviceLocator { override get(name) => { if (registered(name)) return registered_one; 
//                            if (factory && inject(factory)) return factory_created; throw error; }
//                            inject(factory) => { find dependencies of the factory arguments and auto instance them; } }

// Wiring plugins
// Plugins as packages: Plugins of an application are installed as packages into the mode_modules directory of a project
//     One popular pattern is to build entire applications by wrapping their components into packages, as if they were internal plugins. 
//     A package can be private and not necessarily available on the public npm registry by setting private flag into package.json
// Extension points: 
//     Some design patterns can be used to change or augment the functionality of a service, like proxy, decorator, strategy, middleware
//     Explicity extension: Plugin-controlled. A specific component explicity extending the infrastructure. 
//          module.exports = (app) => { app.do_something; }
//     Extension through Inversion of Control (IoC): application-controlled extension. 
//          Infrastructure controls the extension by loading, installing or executing the new specified component. 
//          module.exports = () => { return { method: 'method'; }} plugin = require('the_plugin'); app[plugin.method]();


























