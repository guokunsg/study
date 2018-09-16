# Effective Objective-C 2.0

## Accustoming yourself to Objective-C
### Item 1: Familiarize yourself with Objective-C’s roots
* Uses a messaging structure ranther than function calling
    ```
    // Messaging (Objective-C): Runtime decides which code gets executed
    Object *obj = [Object new]; 
    [obj performWith:parameter1 and:parameter2];
    // Function calling (C++): Compiler decides which code will be executed
    Object *obj = new Object; 
    obj->perform(parameter1, parameter2);
    ```
* The memory for Objective-C objects is always allocated in heap space and never on the stack  
    ```
    NSString *str = @”Some string”; // Always a pointer 
    NSString str; // Error: interface type cannot be statically allocated  
    NSString *anotherStr = str; // Point to the same object  
    ```
* Can still use C struct which contains no Objective-C objects
### Item 2: Minimize importing headers in headers  
* Always import headers at the very deepest point possible. This usually means forward declaring classes in a header and importing their corresponding headers in an implementation. Doing so avoids coupling classes together as much as possible.
* Forward declaration: @class EOCEmployer;
* Sometimes, forward declaration is not possible, as when declaring protocol conformance, like inheritance or implementing.
### Item 3: Prefer literal syntax over the equivalent methods
```
NSString *someStr = @"Objective-C";
Literal numbers
  NSNumber *someNumber = [NSNumber numberWithInt:1]; // Non literal way
  NSNumber *someNumber = @1; // Literal way
  NSNumber *floatNumber = @2.5f;
  NSNumber *doubleNumber = @3.1415926;
  NSNumber *boolNumber = @YES;	
  NSNumber *charNumber = @’a’;
  int x=5; float y = 6.32f; NSNumber *expressionNumber = @(x * y); // Literal syntax for expressions
Literal Arrays:
  NSArray *animals = [NSArray arrayWithObjects:@”cat”, @”dog”, nil]; // Non literal way can have nil
  NSArray *animals = @[@”cat”, @”dog”]; // Literal array not allow nil
  id obj1; id obj2; id obj3;
  NSArray* arrayA = [NSArray arrayWithObjects: obj1, obj2, obj3, nil];
  NSArray* arrayB = @[obj1, obj2, obj3];
  // Literal way is safer: If obj2 is nil, arrayA is created with only 1 element obj1; ArrayB throws exception
Literal Dictionaries
  // Non literal way, order is: <object>, <key>, <object>, <key>, …
  NSDictionary *personData = [NSDictionary dictionaryWithObjectsAndKeys: @”Matt”, @”firstName”, @”Galloway”, @”lastName”, [NSNumber numberWithInt:28], @”age”, nil]; 
  NSDictionary *personData = @{@”firstName” : @”Matt”, @”lastName” : @”Galloway”, @”age” : @28 }; // Literal way, not allow nil
  NSString *lastName=[personData objectForKey:@”lastName”];
  NSString *lastName=personData[@”lastName”];
Mutable arrays and dictionaries
  [mutableArray replaceObjectAtIndex:1 withObject:@”dog”];
  mutableArray[1] = @”dog”;
  [mutableDictionary setObject:@”Galloway” forKey:@”lastName”];
  mutableDictionary[@”lastName”] =  @”Galloway”;
```
* Limitations
    * The class of the created object must be the one from the Foundation framework
    * For strings, arrays and dictionaries, only immutable variants can be created with the literal syntax. Use mutable copy to create a mutable variant.  
      NSMutableArray *mutable = [@[@1, @2] mutableCopy];
### Item 4: Prefer typed constants to pre-processor #define
* Avoid preprocessor defines. They don't contain any type information and are simply a find and replace executed before compilation.  
  Avoid: #define ANIMATION_DURATION 0.3
* Define translation-unit-specific constants within an implementation file as static const.  
  static const NSTimeInterval kAnimationDuration = 0.3
* Define global constants as external in a header file and define them in the associated implementation file.  
  extern NSString *const EOCStringConstant; // header file  
  NSString *const EOCStringConstant = @”Value”; // Implementation file
### Item 5: Use enumerations for states, options and status code
* Unscoped:
    ```
    enum Color { red, green }; // red==0, green==1
    typedef enum Color Color; // As a type, don’t have to always add enum
    Color color = red;
    enum Color : NSInteger; // C++ 11 allows to dictate the underlying type used to store variables of the enumerated type. 
    Color color = red | green; // Actually the bit ‘Or’ of red(0) and green(1) value
    ```
* Scoped: 
    ```
    enum class Color { red, green };
    Color color = Color::red;
    ```
* Use NS_ENUM and NS_OPTIONS macros to define enumeration types with an explicit type
    ```
    typedef NS_ENUM(NSUInteger, Color) { Red, Green };
    typedef NS_OPTION(NSUInteger, Direction) { Left, Right, Up, Down };
    Direction direction = Left | Up;
    ```
* Switch: Better not to have a default case that handle enumerated types. This helps if new value added to enum, compiler can give warning on not handled case

## Objects, Messaging, and the Runtime
### Item 6: Understanding properties
* @property: Compiler automatically generates variable and access method  
    ```
    @interface Person : NSObject
        @property NSString* firstName
    @end
    @implementation Person
        // Compiler auto adds an instance variable to the class with the name of the property prefixed with an _, eg: _firstName. 
        // @synthesize can change change the auto synthesized variable _firstName name
        @synthesize firstName = _myFirstName; // Use _myFirstName instead of auto generated _firstName
        //@dynamic firstName; // @dynamic can prevent generating accessors or instance variables 
    @end
    Equivalent to class like: 
    @interface Person : NSObject {
        -(NSString*) firstName;
        -(void)setFistName: (NSString*)firstName;
        -(NSString*) _lastName; // auto-synthesized instance variable
    @end
    person.firstName=@”Bob” // The same as [person setFistName:@”Bob”];
    person.firstName; // The same as [person firstName];
    ```
* Property attributes
    * Atomicity: 
        - By default, synthesized accessors include locking to make atomic. 
        - Use nonatomic to make no locking.
    * Read/Write
        - readwrite: Both getter and setter are available
        - readonly: Only getter is available
    * Memory-management semantics
        - assign: Simple assign operation
        - strong: Owning relationship. When a new value is set, it is first retained, the old value is released, and then the value is set.
        - weak: Non-owning relationship. When a new value is set, it is not retained; nor is the old value released. Similar to assign but the value is nilled out when the object destroyed. 
        - unsafe_unretained: Same semantics as assign but used where the type is an object type to indicate a nonowning relationship (unretained) that is not nilled out (unsafe) when the target is destroyed, unlike weak.
        - copy: Owning relationship similar to strong, instead of retaining the value, it is copied. 
* Method names
    * getter=`<name>`: Specify the name for getter. Usually for Boolean property which want the getter to be prefixed with is.  
      eg: @property (nonatomic, getter=isOn) BOOL on;
    * setter=`<name>`: Specify the name for setter.
* Use nonatomic on iOS for performance
### Item 7: Access instance variables primarily directly when accessing them internally
* Prefer to read through instance variable internally and write data through properties
    * Direct access to the instance variables will be faster, as it does not have to go though Objective-C method dispatch
    * Direct access bypasses the property's memory-management semantics defined by the setter.
    * Key-Value Observing (KVO) notifications would not be fired when accessing the instance variables directly (May or may not be problem).
* Within initializer and dealloc, always read and write data directly through instance variables, because subclass may override the function
* Need to read through property if the data is lazy initialized
### Item 8: Understand object equality
* Provide isEqual: and hash methods for objects need to check for equality
* Determine what is necessary to test for equality (like primary key) rather than testing all properties.
* Write hash method that will be quick but provide a reasonably low level of collisions. 
* NSArray checks whether the two arrays being compared contain the same number of objects and if so, iterates through them and calls isEqual on each. 
### Item 9: Use the class cluster pattern to hide implementation detail 
* Class cluster pattern: An abstract class that groups a set of private concrete subclasses, providing a simplified interface to the user through the abstract class. Like Abstract Factory pattern.  
  eg: +(UIButton*) buttonWithType:(UIButtonType)type;
### Item 10: Use associated objects to attach custom data to existing classes
* Association management methods:
    ```
    void objc_setAssociatedObject(id object, void* key, id value, objc_AssocationPolicy policy)
    id objc_getAssociatedObject(id object, void* key)
    void objc_removeAssociatedObjects(id object)
    ```
* Key is treated purely as an opaque pointer
* Memory-management semantics of associated objects can be defined to mimic owning or non-owning relationship.
* Associated objects should be used only when other approach is not possible, since they can easily introduce hard-to-find bugs.
### Item 11: Understand the role of objc_msgSend
* void objc_msgSend(id self, SEL cmd, …);
* A message consists of a receiver, a selector, and parameters. Invoking a message is synonymous with calling a method on an object
* When invoked, all messages go through the dynamic message dispatch system whereby the implementation is looked up and then run
### Item 12: Understand message forwarding
* Message forwarding is the process that an object goes through when it is found to not respond to a selector
* Dynamic method resolution: Add methods to a class at runtime as and when they are used  
  +(BOOL)resolveInstanceMethod: (SEL)selector  // The first method that's called for a not understand message, returns a boolean to indicate whether an instance method was added to the class that can now handle the selector.
  BOOL class_addMethod(Class cls, SEL name, IMP imp, const char *types);
* Replacement receiver: Return another object to handle the selector  
  -(id)forwardingTargetForSelector: (SEL)selector
* Full forwarding is invoked only when no previous way of handling a selector is found  
  -(void)forwardInvocation: (NSInvocation*)invocation;
### Item 13: Consider method swizzling to debug opaque methods
* Method implementation for a given selector of a class can be added or replaced at runtime
* Swizzling is the process of swapping one method implementation for another, usually to add functionality to the original implementation
    ```
    #include <objc/runtime.h>
    Method class_getInstanceMethod(Class cls, SEL selector);
    void method_exchangeImplementation(Method m1, Method m2);
    // Add logging to NSString lowercaseString
    @interface NSString(MyAddition)
        -(NSString*)myLowercaseString;
    @end
    @implementation NSString(MyAddition)
        -(NSString*)myLowercaseString {
        NSString* lowercase = [self myLowercaseString]; // Swapped, actually calling lowercaseString
        // Do logging 
        return lowercase;
    }
    @end
    Method orgMethod=class_getInstanceMethod([NSString class], @selector(lowercaseString));
    Method newMethod=class_getInstanceMethod([NSString class], @selector(myLowercaseString));
    method_exchangeImplementation(orgMethod, newMethod);
* Meddling with methods through the runtime is usually good only for debugging and should not be used just because it can
### Item 14: Understand what a class object is
* Each object contains as its first member a variable of type Class
    ```
    typedef struct objc_class *Class;
    struct objc_class {
        Class isa;  Class super_class;  const char* name;  long version;  long info;  long instance_size;  
        struct objc_ivar_list* ivars;  struct objc_method_list **methodLists;  struct objc_cache *cache;  
        struct objc_protocol_list *protocols;
    }
    ```
* Introspection methods can be used to inspect the class hierachy. 
* isMemberOfClass: Check whether an object is an instance of a certain class
* isKindOfClass: Check whether an object is an instance of a certain class or any class that inherits from it

## Interface and API design
### Item 15: Use prefix names to avoid namespace clashes
* Choose a class prefix and stick with the prefix throughout also in C functions. The prefix should be at least 3 characters because Apple reserved 2 characters
* Consider prefixing third-party library also if used in the own library
### Item 16: Have a designated initializer
* Implement a designated initializer in the class, and document which one it is. All other initializers should call through to this one
* If the designated initializer is different from the superclass, ensure that its designated initializer is overridden
* Throw an exception in initializers overridden from superclasses that should not be used in the subclass.
### Item 17: Implement the description method
* Implement the description method to provide a meaningful string description of instances  
  -(NSString*) description;  
  NSLog(@(“object=%@”, obj);
* If the object description could do with more detail for use during debugging, implement debugDescription
### Item 18: Prefer immutable objects
* When possible, create objects that are immutable
* Extend read-only properties in a class-continuation category to read-write if the property will be set internally
    ```
    @interface Person : NSObject
        @property(readonly) name
    @end
    @implementation Person 
        @property(readwrite) name
    @end
    // But still can be set using Key-Value Coding (KVC)
    [person setValue:@”bob” forKey:@”name”];
    ```
* Provide methods to mutable collections held by objects rather than exposing a mutable collection as a property
### Item 19: Use clear and consistent naming
* Some rules for method naming
    * If the method returns a newly created value, the first word in the method name should be its type (e.g stringWithString), unless a qualifier needs to go in front (e.g localizedString). 
    * A parameter should be immediately preceded by a noun describing its type
    * Methods that cause an action to happen on an object should contain a verb followed by a noun (or multiple nouns) for parameters
    * Avoid abbreviations
    * Prefix Boolean property with is or has
    * Reserve the prefix get for use with methods that return values via an out-parameter, such as those that fill a C-style array  
      -(NSString*)stringByReplacingOccurrencesOfString:(NSString *)target withString:(NSString *)replacement;
### Item 20: Prefix private method names
* Prefix private method names so that they are easily distinguished from public methods. And class inheritance will have no collision
* Avoid using a single underscore as the method prefix, since it is reserved by Apple.
### Item 21: Understand the Objective-C error model
* Use exceptions only for fatal errors that should bring down the entire application
    * Automatic Reference Counting (ARC) is not exception safe by default. Compiler flag  
    –fobjc-arc-exceptions allows creating exception-safe code with extra code cost. 
* For nonfatal errors, either provide a delegate method to handle errors or offer an out-parameter NSError object
### Item 22: Understand the NSCopying protocol
* Implement the NSCopying protocol if the object needs to be copied
* If the object has mutable and immutable variants, implement bot NSCopying and NSMutableCopying protocols
* Decide whether a copy will be shallow or deep, and prefer shallow for a normal copy
* Consider adding a deep-copy method if it is useful

## Protocols and categories
### Item 23: Use delegate and data source protocols for inter-object communication
* Use the delegate pattern to provide an interface to the object that needs to tell other objects about pertinent events
* Define a protocol with potentially optional methods to define the interface that the delegate should support
    ```
    @protocol NetworkFetcherDelegate
        @optional
        -(void)networkFetcher:(NetworkFetcher*)fetcher didReceiveData:(NSData*)data; 
        -(void)networkFetcher:(NetworkFetcher*)fetcher didFailWithError:(NSError*)error;
    @end
    @interface NetworkFetcher : NSObject
        @property (nonatomic, weak) id<NetworkFetcherDelegate> delegate;
        // Property must be defined as weak to be a nonowning relationship. Otherwise there will retain cycle
    @end
    // Check whether a delegate implements the method
    if ([_delegate respondsToSelector:@selector(networkFetcher:didReceiveData:)] {
        [_delegate networkFetcher:self didReceiveData:data];
    }
    ```
### Item 24: Use categories to break class implementations into manageable segments
```
    @interface Person : NSObject
        @property(nonatomic, copy, readonly) NSString* name;
    @end
    @interface Person(Friendship) // Category
        -(void)addFriend:(Person*) person;
    @end
    @interface Person(Private) // Can be used to indicate private methods
    @end
    Categories could be extracted into files: Person+Friendship(.h/.m) Person+Private(.h/.m)
```
### Item 25: Always prefix category names on third-party classes
* Always prepend your naming prefix to the names of categories you add to classes that are not your own to avoid collision
* Always prepend your naming prefix to the method names within categories you add to classes that are not your own
### Item 26: Avoid properties in categories
* Keep all property declarations for encapsulated data in the main interface definition
* Prefer accessor methods to property declarations in categories, unless it is a class-continuation category
### Item 27: Use the class-continuation category to hide implementation detail
* Use class-continuation category to add instance variables to a class
* Redeclare properties in the class-continuation category as read-write if they are read-only in the main interface, if the setter accessor is required internally within the class
* Declare method prototypes for private methods within the class-continuation category
* Use class-contination category to declare protocols that your class conforms to that you want to keep private
```
    // Person.h
    @interface Person : NSObject
        @property(nonatomic, copy, readonly) NSString* name;
    @end
    // Person.m
    @interface Person() { // Continuation
        @private
        NSString *p_address; // Add instance variables to a class
        @property(nonatomic, copy, readwrite) NSString* name; // Redeclare as readwrite internally
        std::string* str; // Add C++ class internally so user doesn’t have to use Objective-C++ file (.mm)
    }
    @end
    @implementation Person
    @end
    @interface Person()<SomeDelegate> // Declare protocols which the class confirms to privately
    @end
```
### Item 28: Use a protocol to provide anonymous objects
* Protocols define a set of methods that a conforming object should implement. They can therefore be used to hide implementation details in your API by returning objects that are typed as a plain id that confirms to a protocol. 
* Use anonymous objects when the type (class name) should be hidden
* Use anonymous objects when the type is irrelevant, and the fact that the object responds to certain methods (the ones defined in the protocol) is more important.
```
    @property(nonatomic, weak) id<SomeDelegate> delegate;
    -(void)setObject:(id)object forKey:(id<NSCopying>)key;
    -(id<Connection>)connectionWithId:(NSString*)id;
```

## Memory management
### Item 29: Understand reference counting
* Reference-counting memory management is based on a counter that is incremented and decremented. An object is created with a count of at least 1. An object with a positive retain count is alive. When the retain count drops to 0, the object is destroyed.
* autorelease: Add autorelease to the object allocated in a method and is returned. Put the object in the autorelease pool and release it when the pool is drained. 
* As it goes through its life cycle, an object is retained and released by other object holding references to it. 
* Retain cycle: When multiple objects reference one another cyclically. Use weak references.
### Item 30: Use ARC to make reference counting easier
* Method-naming rules applied by ARC
    * A method returning an object returns it owned by the caller (who responsible for releasing the returned object) if its method name begins with one of the following:  
      alloc / new / copy / mutableCopy
    * Any other method name indicates the object will be returned autoreleased, so that the value is alive across the method call boundary. If wants to stay alive longer, the calling code must retain it. 
* Qualifiers to alter semantics of local and instance variables
    * __strong: The default; value is retained
    * __unsafe_unretained: Value not retained and potentially unsafe, as the object may be deallocated already by the time the variable is used again
    * __weak: Value not retained but safe because automatically set to nil if deallocated
    * __autoreleasing: Used when an object is passed by reference to a method. Autoreleased on return.
### Item 31: Release references and clean up observation state only in dealloc
* dealloc method should be used only to release references to other objects and to unregister anything that needs to be
* Use other method to release system resources instead of dealloc
* Avoid method calls in dealloc in case those methods try to perform asynchronous work and assume the object is in a normal state.
### Item 32: Beware of memory management with exception-safe code
* When exceptions are caught, care should be taken to ensure that any required cleanup is done for objects created within the try block
* By default, ARC does not emit code that handles cleanup when exceptions are thrown. This can be enabled with a compiler flag –fobjc-arc-exceptions but produces code that is larger and comes with a runtime cost
### Item 33: Use weak references to avoid retain cycles
* Retain cycles can be avoided by making certain references weak
* General rule is that if don’t own an object, should not retain it
* Weak references may or may not be auto-nilling. Autonilling is a new feature with ARC and implemented in the runtime.
### Item 34: Use autorelease pool blocks to reduce high-memory waterline
* @autoreleasepool { ... }
* Autorelease pools are arranged in a stack, with an object being added to the topmost pool when it is sent the autorelease message
* Correct application of autorelease pools can help reduce the high-memory waterline
* Modern autorelease pools using the new @autoreleasepool syntax are cheap
### Item 35: Use zombies to help debug memory-management problems
* When an object is deallocated, it can optionally be turned into a zombie instead of being deallocated. Use NSZombieEnabled environment flag to turn on this feature
* Manipulating isa pointer to change the object into a zombie class. A zombie class responds to all selectors by aborting the app after printing an error message 
### Item 36: Avoid using retainCount
* The retain count of an object is not accurate and not useful
* retainCount will cause a compilation error in ARC

## Blocks and Grand Central Dispatch
### Item 37: Understand blocks
* Blocks are lexical closures for C, C++ and Objective-C: 
    * ^ { … } 
    ```
    Block type: return_type (^block_name)(parameters)
    void (^someBlock)() = ^{ ... }
	int (^addBlock)(int a, int b) = ^(int a, int b) { return a+b; } // Define block
	int sum = addBlock(2 + 5); // Use block
    ```
* Variables available to the scope in which the block is declared also available inside the block but not modifiable. Add __block qualifier to be modifiable.
    ```
    int additional = 0; 
    int (^addBlock)(int a) = ^(int a) { return a + additional; }
    NSArray* array = @[@0, @1, @2];
    __block NSInteger sum = 0;
    [array enumerateObjectsUsingBlock:
        ^(NSNumber* number, NSUInteger idx, BOOL* stop) {
            sum += number;
        }]; // inline block
    ```
* Blocks can be considered as an object
* Blocks can be stack allocated, heap allocated, or global. 
    ```
    void (^block)(); // Variable to store the block
    if () { 
        block = ^{…} // Wrong because block is stack allocated
    }
    if () { 
        block = [^{…} copy]; // Copy into heap allocated
    }
    ```
### Item 38: Create typedefs for common block types
* typedef return_type (^SomeBlock)(parameters); SomeBlock block = ^(parameters) { }
* Follow naming conventions when definng new types so won’t clash with others
### Item 39: Use handler blocks to reduce code separation
```
    @class NetworkFetcher;
    typedef void(^NetworkFetcherCompletionHandler)(NSData* data, NSError* error);
    @interface NetworkFetcher : NSObject
        -(id)initWithUrl: (NSURL*) url;
        -(void)startWithCompletionHandler: (NetworkFetcherCompletionHandler) handler;
    @end
```
* Use a handler block when it is useful to have the business logic of the handler be declared inline with the creation of the object.
* Handlers block is associated with the object directly rather than delegation, which often requires switching based on the object if multiple instances are being observed
* Consider passing a queue as parameter to designate on which queue the block should be enqueued
### Item 40: Avoid retain cycles introduced by block referencing object owning them
* Be aware of the retain cycles by blocks that capture objects that directly or indirectly retain the block
* Ensure that retain cycles are broken at an opportune moment, but never leave responsibility to the consumer of the API.
    ```
    typedef void (^CompletionHandler)(NSData* data);
    @interface NetworkFetcher
    -(void)startWithCompletionHandler:(CompletionHandler)handler {
        self.completionHandler = handler;
    } @end
    @implementation SomeClass {
        NetworkFetcher* _networkFetcher;
        NSData* _fetchedData;
        -(void)downloadData {
            [_networkFetcher startWithCompletionHandler:^(NSData* data) {
                self._fetchedData = data; // SomeClass is retained by block through self
            }
        }
    } @end
    // Retain cycle: SomeClass._networkFetcher -> NetworkFetcher.completionHandler -> Block -> SomeClass._fetchedData 
    // Break the cycle by setting _networkFetcher to nil in handler or setting handler to nil in the fetcher when complete
    ```
### Item 41: Prefer dispatch queues to locks for synchronization
* Dispatch block in a serial queue can provide synchronization semantics and offer a simpler alternative to @synchronized blocks or NSLock objects
dispatch_sync(queue, ^{…});
    ```
    @synchronized(lock) { } // @synchronized way
    _lock = [[NSLock alloc] init]; // Lock way
    -(void)syncMethod{ [_lock lock]; ... [_lock unlock];}
    _syncQueue = dispatch_queue_create("queue_name", NULL); // dispatch way
    dispatch_sync(_syncQueue, ^{ ... });
    ```
* Mixing synchronous and asynchronous dispatches can provide the same synchronized behaviour as with normal locking but without blocking the calling thread in the asynchronous dispatches. There is extra cost of copying block in asynchronous mode.
* Concurrent queues and barrier blocks can be used to make synchronized behaviour more efficient.  
    * A barrier is executed exclusively with respect to all other blocks on that queue. When a queue is processed and the next block is a barrier block, the queue waits for all current block to finish and then executes the barrier block. When the barrier block finishes executing, processing of the queue continues as normal.  
      void dispatch_barrier_async(dispatch_queue_t queue, dispatch_block_t block);
      void dispatch_barrier_sync(dispatch_queue_t queue, dispatch_block_t block);
### Item 42: Prefer GCD to performSelector and Friends
* [object selectorName]; is the same as [object performSelector:@selector(selectorName)];  
  Useful for dynamic decided selector: SEL selector; if () selector = xxx else selector = yyy; [object performSelector: selector];
* performSelector is potentially dangerous with respect to memory management. Selector may create object. If it has no way of determining what selector is going to be performed, ARC compiler cannot insert the appropriate memory-management calls for object.
* performSelector is very limited with respect to the return type and the number of parameters that can be sent to the method
* The methods that allow performing a selector on a different thread are better replaced with certain GCD calls using blocks
    ```
    [self performSelector:@selector(doSomething) withObject:nil afterDelay:5.0];
    dispatch_time_t time = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(5.0 * NSEC_PER_SEC));
    dispatch_after(time, dispatch_get_main_queue(), ^(void){[self doSomething]; });
    [self performSelectorOnMainThread:@selector(doSomething) withObject:nil waitUntilDone:NO];
    dispatch_async(dispatch_get_main_queue(), ^{ [self doSomething]; }); // Use dispatch_sync if waitUntilDone=YES
    ```
### Item 43: Know when to use GCD and when to use operation
* GCD is a lightweight pure C API, whereas operation queues are Objective-C objects
* Benefits of NSOperation and NSOperationQueue:
    * Cancelling operations
    * Operation dependencies: Certain operations can execute only after another operation has completed successfully.
    * Key-Value Observing of operation properties: isCanceled, isFinished, …
    * Operation priorities
    * Reuse of operations
### Item 44: Use dispatch groups to take advantage of platform scaling
* Dispatch groups are used to group a set of tasks. You can optionally be notified when the group finishes executing
* Dispatch groups can be used to execute multiple tasks concurrently through a concurrent dispatch queue. In this case, GCD handles the scheduling of multiple tasks at the same time, based on system resources. 
### Item 45: Use dispatch_once for thread-safe single-time code execution
* Thread-safe single-code execution
    ```
    +(id)sharedInstance {
        static SomeClass* sharedInstance = nil;
        static dispatch_once_t onceToken; // token needs to be the same object
        dispatch_once(&onceToken, ^{ sharedInstance = [[self alloc] init]; });
        return sharedInstance;
    }
    ```
### Item 46: Avoid dispatch_get_current_queue
* dispatch_get_current_queue function does not in general perform as expected. It has been deprectated and should only be used for debugging
    ```
    dispatch_sync(queueA, ^{
        dispatch_sync(queueB, ^{
            dispatch_block_t block = ^{ … };
            if (dispatch_get_current_queue() == queueA) block;
            else { dispatch_sync(queueA, block); }) });
    ```
* dispatch queues are organized into a hierarchy (queue started by other queue); the current queue cannot be described simply by a single queue object.
* Queue-specific data can be used to avoid deadlocks owing to nonreentrant code  
  void dispatch_queue_set_specific(dispatch_queue_t queue, const void* key, void* context, dispatch_function_t destructor);

## The System frameworks
### Item 47: Familiar yourself with the system frameworks
### Item 48: Prefer block enumeration to for loops
* NSEnumerator  
  -(NSArray*)allObjects  
  -(id)nextObject  
* Fast enumeration  
  NSArray* array;  
  for (id object in array) {…}  
  for (id object in [array reverseObjectEnumerator]) {…}  
  NSDictionary* dict;  
  for (id key in dict) { id value = dict[key]; }  
* Block-based enumeration  
    -(void)enumerateObjectsUsingBlock: (void(^)(id object, NSUInteger idx, BOOL *stop))block;  
    -(void)enumerateKeysAndObjectsUsingBlock: (void(^)(id key, id object, BOOL* stop))block;  
### Item 49: Use toll-free bridging for collections with custom memory-management semantics
* CoreFoundation: C API that mirrors much of the functionality of the Foundation framework
* __bridge cast:  
  NSArray* array; CFArrayRef aCFArray = (__bridge CFArrayRef)array;
* Toll-free bridging allows casting between Foundation’s Objective-C objects and CoreFoundation’s C data structures
* Use CoreFoundation to create a collection allows specifying various callbacks that are used when the collection handles the contents to have custom memory-management semantics. 
### Item 50: Use NSCache instead of NSDictionary for caches
### Item 51: Keep initialize and load implementation lean
* Classes go though a load phase in which they have the load method called on them if it has been implemented.  This method may also be present in categories whereby the class load always happens before the category load. Load method does not participate in overriding.  
  +(void) load;
* Before a class is used for the first time, it is sent the initialize method. This method does participate in overriding, so it is usually best to check which class is being initialized.  
  +(void) initialize;
* Both implementations of load and initialize should be kept lean, which helps to keep applications responsive and reduces the likelihood that interdependency cycles will be introduces.   
### Item 52: Remember that NSTimer retains its target
* An NSTimer object retains its target until the timer is invalidated either because it fires or though an explicit call to invalidate
