# Swift
Notes for https://www.tutorialspoint.com/swift/index.htm

## Basic
* Comments: // /* */
* Use import statement to import any Objective-C framework (or C) library
* Does not require ; after each statement, optional
* Keywords: 
    * Declarations: `Class deinit Enum extension Func import Init internal Let operator private protocol public static  struct subscript typealias var`
    * Statements: `break case continue default do else fallthrough for if in return switch where while`
    * Expressions and types: `as dynamicType false is nil self Self super true _COLUMN_ _FILE_ _FUNCTION_ _LINE_`
    * Other context: `associativity convenience dynamic didSet final get infix inout lazy left mutating none nonmutating optional override postfix precedence prefix Protocol required right set Type unowned weak willSet`
    * @objc: Let class, property and method be usable in objective-c
* Literals: 92 (int) 3.14 "hello"
* print("Something to print")

## Data types
* Built-in data types
    * Int(32/64 bit on 32/64 bit platform) UInt Int32 Int64 UInt32 UInt64 Float(32 bit) Double(64 bit) Bool String Character 
    * Optional: A variable that can hold either a value or no value
    * Tuples: Used to group multiple values in single Compound value
* typealias: Create a new name for an existing type  
    typealias newname = type
* Swift is type-safe
* Type inference: Complier deduces the type of a particular expression automatically  
    var a = 42 // a is Int
* Type casting:
    * is: Check the type of a value. 
      eg: if instance is some_class { } 
    * as: Cast the type value to a different type  
      eg: let v as some_class
        * as?: Returns an optional value when the value returns nil
        * as!: Returns force unwrapping. Triggers runtime error
* Any: Keyword Any is used to represent an instance which belongs to any type including function types.  
  eg: `var exampleany = [Any]()`
* AnyObject: To represent the instance of any class type

## Variables
* Declaration: var name = `<initial value>`
* Type annotation: var name: `<data type>` = `<optional initial value>`
* Print variables: Escape with a backslash before the parenthesis  
    print("Value of \(varA) is more than \(varB) millions")
* Optionals: 
    * Variable can have value or nil. 
    * Swift implementation of Optionals is enum with None and Some. 
    ```
    var str: String? = "Hello"
    print(str) // Output is "Optional("Hello")"
    print(str!) // Need to unwrap to print the actual value "Hello"
    var str: String! // ! is auto unwrapping
    print(str) // Output is "Hello"
    if let name = str { // Optional binding 
        // Statement 
    } else {
        // No value statement
    }
    ```
    * Optional chaining: The process of querying, calling properties, subscripts and methods on an optional that may be nil is defined as optional chaining. 
        * If the optional contains a value, then calling its related property, methods and subscripts returns values
        * If the optional contains nil, all its related property, methods and subscripts returns nil
    ```
        class ElectionPoll { var candidate: Pollbooth? }
        class Pollbooth { var name = "MP" }
        let cand = ElectionPoll()
        let candname = cand.candidate!.name // Will crash
        if let candname = cand.candidate?.name {
            print("Candidate name is \(candname)")
        } else {
            print("Candidate name cannot be retreived") // Will execute
        }
    ```
* Tuples  
    * var tup = (value1, value2, ..., any number of values)
    * Can name the variables of a tuple while declaring and can call using names  
      var err = (errorCode: 501, description: "Not implemented")  
      print(err.errorCode)
    * Tuples are useful in returning multiple values from a function. 
* Constants: let constName = `<initial value>`  
  Can have type annotation: let constName : `<data type>` = `<initial value>`

## Operators
* Arithmetic: + - * / %
* Comparison: == != > < >= <=
* Logical: && || !
* Bitwise: & | ^ ~ << >>
* Assignment: = += -= *= /= %= <<= >>= &= ^= |=
* Range: 
    * Closed range: (a...b) defines a range from a to b, including a and b
    * Half-open range: `(a..<b)` defines a range from a to b, not including b
    * One sided range: a... defines a range from a to end of elements, ...a defines a range from start to a
* Misc: -1  +1  condition ? X : Y

## Controls
```
    if boolean_expression { 
    } else { }
    switch expression {
        case expression1: 
            ...
            // By default, will go out to switch
            // fallthrough: To continue to next case
        default: statement;
    }
    for ele in var { }
    while condition { }
    repeat { ... } while (condition)  
    // Can use continue/break in loops
```

## Strings
* String constants: let constStr = ""
* String interpolation: var varA = 1; let constA = 1; var str = "\(varA) \(constA)"
* String concatenation: var str = varA + constA
* String length: str.count
* String comparison: str1 == str2
* String iterating: for chars in str { }
* Unicode: str.utf8 str.utf16

## Data strucutre
* Arrays
    * `var array = [some_type]()`
    * `var array = [some_type](count: numberOfElements, repeatedValue: initialValue)`  
    eg: var someInts = [Int](count: 3, repeatedValue: 0)
    * Add array: Can use + to add 2 arrays of same type which will yield a new array with a combination of values from 2 arrays
    * `for in` to loop, `count` to get length, `array[index]` to access data
* Sets
    * `var someSet = Set<data_type>()`
* Dictionaries
    * `var someDic = [key_type: value_type]()`  
      eg: `var someDic = [Int: String]()`
    * Can create dictionary from arrays: 
      eg: `var cities = ["city_name", ...]; var distance = [1000, ...];`  
         `let cityDistanceDict = Dictionary(uniqueKeysWithValues: zip(cities, distance))` 
    * Filtering: dict.filter{ $0.value < 1000 }
    * Access: dict[key]  Modifying: dict.updateValue(value, forKey: key) Deleting: dict.removeValue(forKey: key)
    * Iterating: for (key, value) in dict.enumerated() { }
    * Grouping: var grouped = Dictionary(grouping: some_array) { $0.first! }

## Functions
* Declaration: func func_name(external_label varName: type, ...) -> return_type { ... return ...; }  
  eg: func student(name: String, _ age: Int) {}  
      student(name: "bob", 18) // _ means no external lablel for second parameter
    * Can return tuples: -> (var1: value1, var2: value2)
    * Variadic parameters: func func_name<N>(parameters: N...) { }
    * I/O parameters: in out inout: func func_name(varName: inout type, ...)  
        eg: func setZero(a: inout Int) { a = 0; }  var a = 10; setZero(a: &a) // a is modified
    * Can use _ for no external label parameter: func student(name: String, _ age: String) { } 
* Calling: func_name(varName: value)
* Function types:
    * Syntax: 
    ```
    func sum(a: Int, b: Int) -> Int { return a + b }
    var addition: (Int, Int) -> Int = sum
    addition(1, 2)
    ```
    * Can be used as parameter types and return types
* Nested functions: A nested function provides the facility to call the outer function by invoking the inside function

## Closures
* Syntax: { (parameters) -> return type in statements }  
    ```
    let add = { 
        (a: Int, b: Int) -> Int in 
        return a + b
    }
    let result = add(1, 2)
    let ascending = array.sorted(by: { a, b in a < b }) // Array sort
    ```
* Can use $0, $1 for parameters
* Closures as trailers: reversed = sorted(names) { $0 > $1 }
* Capturing values and reference types
    ```
    func calcDecrement(forDecrement total: Int) -> () -> Int {
        var overallDecrement = 100
        func decrementer() -> Int {
            overallDecrement -= total
            return overallDecrement
        }
        return decrementer
    }
    let decrem = calcDecrement(forDecrement: 18)
    decrem() // 82  decrem() // 64  decrem() // 46
    ```

## Enumerations
* Syntax: 
    ```
    enum DaysOfWeek { case Monday, Tuesday ... }
    switch day {
        case .Monday: ...
    }
    ```
* Enum with associated values
    ```
    enum Student { 
        case Name(String)
        case Mark(Int)
    }
    var studName = Student.Name("some_name)
    var studMark = Student.Mark(60)
    switch studMark {
        case .Name(let name): ...
        case .Mark(let mark): ...
    }
    ```

## Structures & Classes
* Synctax
```
    struct Student { // Or class Student
        var name: String
        var mark: Int
        init(name: String, mark: Int) {
            self.name = name
            self.mark = mark
        }
    }
    var student = Student("bob", 100)
    // Class identity operators: === !== returns true/false when two constants or variables pointing to a same instance
    let a = Student("bob", 100); let b = Student("bob", 100);  
    a == b // true, data the same
    a === b // false, not same object
```
* Properties
```
    struct Number {
        var digits: Int
        let PI = 3.1415926
        lazy var no = number_generator() // Lazy property
        var middle: (Double, Duble) { // Computed property
            get { return ( calculated1, calculated2 )} // Compute data and return as tuple
            set(data) { process(data.0), process(data.1) } // Process data tuple
        }
        var counter: Int {
            willset(newValue) { } // Called before setting new value
            didSet { } // Called after setting value
            return something // Can return constants as a read-only property
        }

        static var globalProperty // Global property
    }
```
* Subscripts: Store and retrieve the values with the help of index
```
    class example {
        subscript(index: Int) -> Int { return something }
    }
    let a = example(); Can use a[0] a[1] to get data
    struct Matrix {
        let rows: Int, columns: Int
        var matrix: [Double]
        init(rows: Int, columns: Int) {
            self.rows = rows
            self.columns = columns
            matrix = Array(count: rows * columns, repeatedValue: 0.0)
        }
        subscript(row: Int, column: Int) -> Double {
            get { return matrix[(rows * columns) + column] }
            set { matrix[(row * column) + column] = newValue }
        }
    }
    let m = Matrix(10, 10); m[0, 0] = 1.0
```
* Inheritance
```
    class Base { 
        var prop: String
        final var prop1: Int // Use final to prevent overriding
        init(prop: String) { self.prop = prop } 
        // required init(prop: String) { } // required: Child also needs to use required init(prop: String) not override
        func someFunc() { }
    }
    class Child : Base {
        override var prop: String {
            return super.prop // Can still reference the base class property
        }
        override init(prop: String) { super.init(prop) }
        override convenience init() { super.init("") } // Convenient init with less parameters
        init?(prop: String, name: String) { // Can return nil in failable initializer. Use ! for unwrapped
            super.init(prop)
            if name.isEmpty { return nil }
        }
        override func someFunc() { }
    }
```
* Deinitialization: deinit { } to release resources

## Automatic reference counting (ARC)
* Default reference type is strong
* Strong reference cycles: Two classes references each other
* Class type properties has two ways to resolve storng reference cycles
    * weak reference: Do not increase the retain count. Will be set to nil on deallocation.  
      eg: weak var varName
    * unowned reference: Do not increase the retain count. Not auto set to nil on deallocation.  
      eg: unowned var varName
    * Use weak reference whenever it is valid fro that reference to become nil at some ponit during lifetime
    * Use unowned reference when you know that the reference will never be nil once it has been set
* @objc class : NSObject {} : Class can be used in Objective-C

## Extension
* Functionality of an existing class, structure or enumeration type can be added with the help of extensions.
* Overriding functionality is not possible with extensions
* Syntax: 
    ```
    extension SomeType { // new functionalities here }
    extension SomeType : SomeProtocol, AnotherProtocol { // Protocol requirements }
    extension Int {
        var add: Int { return self + 100 } // computed property
        init(a: Int) {}  // Initializer. (Illustration, may not work)
        func sum() { } // Function
        // Mutating methods: Method that modifies self or property must be marked as mutating. 
        mutating func square() { self = self * self } 
        subscript(var index: Int) -> Int { } // Subscript
        // Nested types
        enum type { }
        var the_type: type { }
    }
    let v = 3.add // Call computed property
    ```

## Protocols
* Syntax: 
```
    protocol SomeProtocol {
        var name: String { get set }
        var marks: Int { get }
        func attendence() -> String
        init(name: String) {} // Initializer requirement
        mutating func setMark(mark: Int) // Will modify self or property
        optional func optionalFunc() {} // When there is optional, protocol must be "@objc protocol SomeProtocol"
    }
    class SomeClass : SomeProtocol {
        var name: String
        required init(name: String) {} // required
        func attendence() -> String { }
        mutating func setMark(mark: Int) { } // mutating
    }
```

## Generics
* Syntax
```
    func swap<T>(a: inout T, b: inout T) {
        let temp = a; a = b; b = temp
    }
    struct TOS<T> {
        var items = [T]()
        mutating func push(item: T) { items.append(item) }
        mutating func pop() -> T { return items.removeLast() }
    }
    protocol Container {
        associatedtype ItemType // Associated types
        mutating func append(item: ItemType)
    }
    // Where clause
    func allItemsMatch<C1: Container, C2: Container where C1.ItemType == C2.ItemType, C1.ItemType: Equatable>
        (someContainer: C1, otherContainer: C2) -> Bool {

    }
```

## Access Control
* public: Enables entities to be processed with in any source file from their defining module, a source file from another module that imports the defining module.
* internal: Enables entities to be used within any source file from their defining module, but not in any source file outside of that module.
* private: Restricts the use of an entity to its own defining source file. Private access plays role to hide the implementation details of a specific code functionality.
