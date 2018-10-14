# Kotlin In Action  
Reading notes for "Kotlin In Action"

# Part 1: Introducing Kotlin
## Chapter 1: Kotlin: What and why
### 1.1 A taste of Kotlin
### 1.2 Kotlin's primary traits
1. Target platforms: server-side, Android, anywhere Java runs
2. Statically typed
    * Kotlin is a statically typed programming language: 
        * The type of every expression in a program is known at compile time, and the compiler can validate that the methods and fields you're trying to access exist on the objects you are using. 
    * Type inference: 
        * Compiler is able to determine types from context
        * Benefits: Performance; Reliability; Maintainability; Tool support
3. Functional and object-oriented
    * Functional programming key concepts
        * First-class functions: Work with functions as values
        * Immutability: Work with immutable objects, which guarantees that their state can't change after their creation
        * No side effects: Use pure functions that return the same result given the same inputs and don't modify the state of other objects or interact with the outside world
    * Benefits
        * Conciseness: 
            * Working with functions as values gives more power of abstraction, which avoids duplication in the code. 
            * Extract the common part of the logic into a function and pass the differing parts as arguments - lambda expressions
        * Safe multi-threading: Use immutable data structures and pure functions, unsafe modification won't happen
        * Easier testing: Functions without side effects can be tested in isolation without constructing environment they depend on. 
    * Kotlin features to support function programming: 
        * Function types: Allowing functions to receive other functions as parameters or return other functions
        * Lambda expressions: Pass around blocks of code with minimum boilerplate
        * Data classes: Providing a concise syntax for creating immutable value objects
        * A rich set of APIs in the standard library for working with objects and collections in the function style
4. Free and open source
### 1.3 Kotlin applications
### 1.4 The philosophy of Kotlin
1.Pragmatic 2. Concise 3. Safe 4. Interoperable
### 1.5 Using the Kotlin tools

## Chapter 2: Kotlin basics
### 2.1 Basic elements: functions and variables
1. Hello world!
2. Functions  
    ```
    fun max(a: Int, b: Int): Int {
        return if (a > b) a else b
    }
    // Expression body way
    fun max(a: Int, b: Int): Int = if (a > b) a else b
    ```
* Statements and expressions
    * Expression has a value, which can be used as part of another expression
    * A statement is always a top-level element in its enclosing block and doesn't have its own value
    * In Java, all control structures are statements
    * In Kotlin, most control structures, except for the loops (for, do, do/while) are expressions.
    * Assignments are expressions in Java and become statements in Kotlin, to help avoid confusion between comparison and assignments. 
* Expression bodies
    * Can use expression as the entire body of the function
3. Variables
    * Mutable and immutable variables
        * val (from value) - Immutable reference; Can't be reassigned after it's initialized; final variable in Java
        * var (from variable) - Mutable reference; Value can be changed; regular Java variable
    * Strive to declare all variables with val; change to var only if necessary
    * var value can be changed but type is fixed
4. Easier string formatting: string templates
    * Kotlin allows to refer to local variables in string literals by putting $ character in front of the variable name
    * \$ to escape character $
### 2.2 Classes and properties
1. Properties
    * The combination of the field and its accessors is often referred to as a property in Java
    * Kotlin declares a property in a class in the same way as declaring a variable: val and var keywords
    * When you declaring a property, you declare the corresponding accessors (a getter for val, getter and setter for var)
2. Custom accessors
    ```
    class Rectangle(val height: Int, val width: Int) {
        val isSquare: Boolean {
            get() { return height == width } // Property getter declaration
        } }
    ```
    * Declare a function without parameters or a property with a custom getter: No difference in implementation or performance; only readability: if describing the characteristic (property) of a class, declare it as a property. 
3. Kotlin source code layout: directories and packages
    * Kotlin doesn't make a distinction between importing classes and functions, and can import any kind of declaration using import. 
    * Kotlin doesn't impose any restrictions on the layout of source files on disk; however, it is a good practice to follow Java's directory layout and to organize source files into directories according to the package structure. 
### 2.3 Representing and handling choices: enums and "when"
1. Declaring enum classes  
    ```
    enum class Color(val r: Int, val g: Int, val b: Int) {
        RED(255, 0, 0), ORANGE(255, 165, 0), YELLOW(255, 255, 0), GREEN(0, 255, 0), BLUE(0, 0, 255), 
        INDIGO(75, 0, 130), VIOLET(238, 130, 238); // <- Semicolon is required
        fun rgb() = (r * 256 + g) * 256 + b // Defines a method on the enum class
    }
    ```
    * enum is a so-called sof keyword: it has a special meaning when it comes before class, but you can use it as a regular name in other places. 
2. Using "when" to deal with enum classes  
    * when is like switch in Java
    * when is an expression that returns a value; don't need to write break in each branch
        ```
        fun getWarmth(color: Color) = when(color) {
            Color.RED, Color.ORANGE, Color.YELLOW -> "warm"
            GREEN -> "neutral"
            else -> "cold"
        }
        ```
3. Using "when" with arbitrary objects  
    ```
    // An argument of the when expression can be any object. It is checked for equality with the branch conditions
    fun mix(c1: Color, c2: Color) = when(setOf(c1, c2)) { // setOf creates a set
        setOf(RED, YELLOW) -> ORANGE
        setOf(YELLOW, BLUE) -> GREEN
    }
    ```
4. Using "when" without an argument  
    ```
    // If no argument is supplied for the when expression, the branch condition is any boolean expression. 
    fun mix(c1: Color, c2: Color) = when { 
        (c1 == RED && c2 == YELLOW) -> ORANGE
    }
    ```
5. Smart casts: combining type checks and casts  
    * Check whether a variable is of a certain type by using an is check
    * After checking the variable for a certain type, don't need to cast it, and can use it as having the type checked for. Compiler performs the cast, and it is called smart cast.
        ```
        if (e is Node) { return e.left + e.right } // smart cast
        val n = e as Node // explicit cast
        ```
6. Refactoring: replacing if with when   
    is can be used with when: `when(e) { is something -> xxx }`
7. Blocks as branches of if and when  
    Both if and when can have blocks as branches; in this case, the last expression in the block is the result  
### 2.4 Iterating over things: while and for loops
1. The while loop: Same as Java
2. Iterating over numbers: ranges and progressions
    * A range is essentially just an interval between two values; ranges are closed or inclusive, the second value is always a part
        ```
        for (i in 1..100)
        for (i in 100 downTo 1 step 2)
        for (x in 0 until size) same as for (x in 0..size-1)
        ```
3. Iterating over maps  
    `for((key, value) in map)`
4. Using "in" to check collection and range membership  
    `when(c) { in '0'..'9' -> "digit" }`
### 2.5 Exceptions in Kotlin
1. try, catch and finally  
2. try as an expression  
    The value of the try expression as a whole is the value of the last expression. 

## Chapter 3: Defining and calling functions
### 3.1 Creating collections in Kotlin  
Kotlin uses the standard Java collection classes; Kotlin's collections are exactly the same classes as Java collections.
### 3.2 Making functions easier to call
1. Named arguments
    * When calling a function written in Kotlin, you can specify the names of some arguments that you're passing to the function  
      eg: `joinToString(collection, separator=" ", prefix=" ", postFix=" ")`
    * Can't use named arguments when calling methods written in Java; Storing parameter names in .class files is supported as an optional feature only starting with Java 8
2. Default parameter values  
    * eg: `fun <T> joinToString(collection: Collection<T>, separator: String = ", ", prefix: String="", postFix: String=""): String`
    * Java doesn't have the concept of default parameter values, need to specify all the parameter values explicitly when calling a Kotlin function with default parameter values from Java.  
    * Can use @JvmOverloads to generate Java overloaded methods, omitting each of the parameters one by one
3. Getting rid of static utility classes: top-level functions and properties
    * In Kotlin, can place functions directly at the top level of a source file, outside of any class
    * JVM can only execute code in classes; Kotlin wraps the function into a class with the same name as the file name.  
      eg: `fun joinToString()` in `join.kt` is the same as `public class JoinKt { public static String joinToString() }`
    * Change the file class name: Add @JvmName annotation to the file.  
      eg: `@file:JvmName("StringFunctions")`
### 3.3 Adding methods to other people's classes: extension functions and properties  
* Extension function
    * a function that can be called as a member of a class but is defined outside of it. 
    * eg: `fun String.lastChar(): Char = this.get(this.length - 1)`  String is the receiver type; this is the receiver object
    * this can be omitted. above is the same as `fun String.lastChar(): Char = get(length - 1)`
1. Imports and extension functions
    * When you define an extension function, it doesn't automatically become available across your entire project;
    * it needs to be imported: `import strings.lastChar`
    * Can change the name of the class or function using as keyword: `import strings.lastChar as last` `val c = "Kotlin".last()`
2. Calling extension functions from Java
    * An extension function is just a static method that accepts the receiver object as its first arguments
    * In Java: Call the static method and pass the receiver object instance. eg: `char c = StringUtilKt.lastChar("Java")`
3. Utility functions as extensions
    * Define joinToString as extension: 
        `fun <T> Collection<T>.joinToString(separator: String = ", ", prefix: String = "", postfix: String = "") : String`
4. No overriding for extension functions  
    * Extension functions aren't a part of the class; they're declared externally to it, and Kotlin resolves them statically
    * If the class has a member function with the same signature as an extension function, the member function always takes precedence.
5. Extension properties
    * Extension properties cannot have any state, because there's no proper place to store it: not possible to add extra fields to existing instances of Java objects
    * eg: `var StringBuilder.lastChar: Char get() = get(length - 1) set(value: Char) { setCharAt(length - 1, value) }`
### 3.4 Working with collections: varargs, infix calls, and library support
1. Extending the Java Collection API
    * Collections in Kotlin are the same classes as in Java but with an extended API. 
2. varargs: functions that accept an arbitrary number of arguments
    * listOf function definition: `fun listOf<T>(vararg values: T): List<T>`
    * Kotlin uses vararg modifier on the parameter to allow pass an arbitrary number of values
    * If the arguments are already packed in an array, need to unpack the array using the spread operator *. 
    * eg: `fun main(args: Array<String>) { val list = listOf("Extra argument", *args) }` *args unpacks the array
3. Working with pairs: infix calls and destructuring declarations
    * mapOf function: `val map = mapOf(1 to "one", 7 to "seven")`
    * to isn't a built-in construct, but rather a method invocation of a special kind, called an infix call
    * In an infix call, the method name is placed immediately between the target object name and the parameter, with no extra separators. `1.to("one")` <- regular call ; `1 to "one"` <- infix call
    * To allow a function being called using infix notation, mark it with the infix modifier.  
      eg: `infix fun Any.to(other: Any) = Pair(this, other)`
    * Destructuring declaration: initialize two variables with the contents of a Pair directly:  
      eg: `val (number, name) = 1 to "one"` `for ((index, element) in collection.withIndex())`
### 3.5 Working with strings and regular expressions
1. Splitting strings
    * split method in Java doesn't work with a dot: `"12.345-6.A".split(".")` returns empty array because . is a regular expression
    * Kotlin provides several overloaded extensions named split that have different arguments:
        * require Regex type: `"12.345-6.A".split("\\.|-".toRegex())` Creates a regular expression explicitly
        * several delimiters: `"12.345-6.A".split(".", "-")`
2. Regular expressions and triple-quoted strings  
    * triple-quoted string: Don't need to escape any characters, including the backslash.  
        ```
        // Parse a file path into directory, filename and file extension
        val result = """(.+)/(.+)\.(.+)""".toRegex().matchEntire(path)
        if (result != null) {
            val (dir, filename, ext) = result.destructured
        }
        ```
3. Multiple triple-quoted strings
    * Multi-line string contains all the characters between the triple quotes, including indents used to format the code.
    * Call trimMargin() to delete the prefix and the preceding whitespace in each line. 
    * Useful for testing
### 3.6 Making your code tidy: local functions and extensions
  * break long method into many small methods with no clear relationship may affect readability 
  * Kotlin gives a cleaner solution: Nest the functions extracted in the containing function. 
  * Extension functions can also be declared as local functions
  * Don't recommend using more than one level of nesting

## Chapter 4: Classes, objects, and interfaces
### 4.1 Defining class hierarchies
1. Interfaces in Kotlin
    * Kotlin interfaces are similar to Java 8:  
      they can contain definitions of abstract methods as well as implementations of non-abstract methods (similar to Java 8 default methods), but they can't contain any state
    * Using override modifier is mandatory in Kotlin
2. open, final, and abstract modifiers: final by default
    * Kotlin classes are final by default; if allow the creation of subclasses of a class, need to mark the class with open modifier.  
      In addition, need to add open modifier to every property or method that can be overridden.
    * If override a member of a base class or interface, the overriding member will also be open by default.  
      Add final to forbid overriding. eg: `open class RichButton : Clickable { final override fun click() {} }` final isn't redundant
    * Open classes and smart casts:  
        * Smart casts work only for variables that couldn't have changed after the type check.  
        * For a class, this means smart casts can only be used with a class property that is a val and that doesn't have a custom accessor.  
        * Properties are final by default, so can use smart carsts with most properties. 
    * abstract class cannot be instantiated 
3. Visibility modifiers: public by default
    * Default visibility is public in Kotlin; Default visibility, package-private in Java, isn't present in Kotlin. 
    * internal visibility: 
        * Visible inside a module; a module is a set of Kotlin files compiled together. 
        * Advantage: Provides real encapsulation for the implementation details of your module.  
          With Java, the encapsulation can be broken because external code can define classes in the same packages and get access to the package-private declarations. 
    * Another difference is that Kotlin allows the use of private visibility for top-level declarations. Such declarations are visible only in the file where they are declared. 
    * protected difference: 
        * In Kotlin, a protected member is only visible in the class and subclasses
        * In Java, accessible from the same package. Extension functions don't get access to private or protected members
    * Java bytecode
        * public, protected and private modifiers in Kotlin are preserved when compiling to Java byte code
            * private class is compiled to a package-private declaration
        * internal becomes public in the bytecode
        * Sometimes you can access something from Java code that you can't access from Kotlin. 
4. Inner and nested classes: nested by default
    * A nested class in Kotlin with no explicit modifier is the same as a static nested class in Java
    * To turn it into an inner class so that it contains a reference to an outer class, use the inner modifier. 
    * Use this@Outer to access the Outer class from the Inner class  
      eg: `class Outer { inner class Inner { fun getOuterReference(): Outer = this@Outer } }`
5. Sealed classes: defining restricted class hierarchies
    * sealed classes: Restrict all the direct subclasses must be nested in the superclass
    * Under the hood, super class has a private constructor, which can be called only inside the class
        ```
        sealed class Expr {
            class Num() : Expr()
            class Sum() : Expr() }
        fun eval(e: Expr): Int = when(e) { // when expression covers all possible cases, 
            is Expr.Num -> ...
            is Expr.Sum -> ...
        } // no else is needed. If a new subclass is added, there will be compile error if no case added
        ```
### 4.2 Declaring a class with nontrivial constructors or properties
1. Initializing classes: primary constructor and initializer blocks
    ```
    class User constructor(nickname: String) { // Primary constructor
        val nickname: String 
        init { this.nickname = nickname } // Initializer block
    } 
    class User(_nickname: String) { val nickname = _nickname } 
    class User(val nickname: String) // Most concise way
    class User(val nickname: String = "") // Can have default value
    class TwitterUser(nickname: String) : User(nickname) // Subclass need to initialize the superclass, interface doesn't have to
    class Secretive private constructor() // Private constructor
    ```
2. Secondary constructors: initializing the superclass in different ways
    * Don't declare multiple secondary constructors to overload and provide default values for arguments. Instead, specify default values directly. 
        ```
        class MyButton : View {
            constructor(ctx: Context) : this(ctx, MY_STYLE) { }
            constructor(ctx: Context, attr: AttributeSet) : super(ctx, attr) { } 
        }
        ```
3. Implementing properties declared in interfaces
    * In Kotlin, an interface can contain abstract property declarations. eg: `interface User { val nickname: String }`
        ```
        interface User { val nickname: String }
        class PrivateUser(override val nickname: String) : User {} // Primary constructor property
        class SubscribingUser(val email: String) : User {
            override val nickname: String get() = email.substringBefore('@) // Custom getter, runs on each call 
        }
        class FacebookUser(val accountId: Int) : User {
            override val nickname = getFacebookName(accountId) // Property initializer, run once 
        }
        interface User {
            val email: String
            val nickname: String get() = email.substringBefore('@') // Result value is computed on each access
        }
        ```
4. Accessing a backing field from a getter or setter  
    In the body of the setter, use the special identifier field to access the value of the backing field.  
    eg: `set(value: String) { field = value }` 
5. Changing accessor visibility  
    `class Counter { var counter: Int = 0 private set }` // Can only change counter inside of the class
### 4.3 Compiler generated methods: data classes and class delegation
1. Universal object methods
    * String representation: toString()
    * Object equality: equals()
        * == for equality
            * In Java, == compares values for primitive types, references for reference types
            * In Kotlin, == compares the values by calling equals under the hood. === compares reference as in Java
        * Need to implement equals to make == work
    * Hash containers: hashCode()
        * hashCode should be always overridden together with equals
2. Data classes: auto-generated implementations of universal methods  
    * If add modifier data to the class, all the necessary methods are automatically generated. 
    * Data classes and immutability: the copy() method
        * Recommended to use read-only properties, making the instances of the data class immutable
        * Kotlin compiler generates one more method:  
          A method that allows you to copy the instances of your class, changing the values of some properties.  
          If implemented manually:
            ```
            class Client(val name: String, val postCode: Int) {
                fun copy(name: String = this.name, postCode: Int = this.postCode) = Client(name, postCode)
            }
            val bob = Client("Bob", 123456)
            bob.copy(postCode=654321)
            ```
3. Class delegation: using the by keyword
    * Use decorator pattern to add behavior to another class, even if it wasn't designed to be extended
    * A lot of APIs need to be implemented; Kotlin solves this using *by* keyword to delegate
        ```
        class DelegatingCollection<T>( innerList: Collection<T> = ArrayList<T>() ) : Collection<T> by innerList {
            // Compiler auto-generates method implementations; override what needs to be changed
            override fun add(element: T) : Boolean { ... } 
        }
        ```
### 4.4 The "object" keyword: declaring a class and creating an instance, combined
1. Object declarations: singletons made easy
    * The object declaration combines a class declaration and a declaration of a single instance of that class
    * Object declaration can contain declarations of properties, methods, initializer blocks, and so on;  
      but no any constructors
    * Object declaration can also inherit from classes and interfaces  
      eg: `object FileComparator : Comparator<File> { override fun compare(file1: File, file2: File) : Int { ... } }`
    * An object declaration is compiled as a class with a static field holding its single instance, which is always named INSTANCE.  
      eg: Use it in Java: `FileComparator.INSTANCE.compare(file1, file2);`
    * Can also declare objects in a class;  
      such objects also have just a single instance; they don't have a separate instance per instance of the containing class. 
    * Singleton and object declarations are not good for large components that interact with many other parts of the system.  
      No control over the instantiation of objects and you can't specify parameters for the constructors.
2. Companion objects: a place for factory methods and static members
    * Classes in Kotlin can't have static members;  
      As a replacement, Kotlin relies on package-level functions and object declarations
    * Companion object has access to all private members of the class, including constructors
    * Factory method pattern with private constructors and companion objects
3. Companion objects as regular objects
    * A companion object is a regular object that is declared in a class.  
      It can be named, implement an interface, or have extension functions or properties. 
    * The companion object for a class is compiled similarly to a single object: a static field in a class refers to its instance.
        * Companion is the default name if no name is specified,  
          eg: In Java: `Person.Companion.XXX`
        * Use `@JvmStatic` and `@JvmField` annotation to mark a member of the class to be static
    * Companion object extensions  
      Need to define a companion object in the class (even an empty one); then can define extension function on `Class.Companion` object
4. Object expressions: anonymous inner classes rephrased
    * object keyword can be used for declaring anonymous objects to replace Java's use of anonymous inner classes.  
      eg: `window.addMouseListener( object: MouseAdapter() { ... })`
    * Can store it in a variable: `val listener = object : MouseAdapter() { }`
    * Kotlin anonymous object can implement multiple interfaces or no interfaces

## Chapter 5: Programming with lambdas
### 5.1 Lambda expressions and member references
1. Introduction to lambdas: blocks of code as function parameters  
    Treat functions as values and pass a function directly; Lambda can be used as an alternative to an anonymous object with only one method.
2. Lambda and collections
    * eg: people is a list, maxBy is a function, to find the maximum:  
      `list.maxBy { it.age }` { it.age } is a lambda which takes a parameter and returns the value to compare.  
      If lambda just delegates to a function or property, it can be replaced by a member reference: `list.maxBy(Person::age)`
3. Syntax for lambda expressions
    * A lambda expression in Kotlin is always surrounded by curly braces. No parentheses around the arguments. 
    * Can store a lambda expression in a variable and treat this variable like a normal function.  
      eg: `val sum = { x: Int, y: Int -> x + y }`
    * Can call the lambda expression directly or use run to call it:  
      `{ println(42) }()` `run { println(42) }`
    * `{it.age}` is the short form of `{ p: Person -> p.age }`
    * `it` convention is for shortening the code, but shouldn't abuse it.  
      Better to declare the parameter of each lambda explicitly in nested lambdas or the meaning or the type of parameter isn't clear from the context. 
4. Accessing variables in scope
    * Kotlin, unlike Java, allows you to access non-final variables and even modify them in a lambda. 
    * External variables accessed from a lambda are said to be captured by the lambda. 
    * When capture a val variable, its value is stored together with the lambda code
    * For var variables, the value is enclosed in a special wrapper that lets you change it, and that reference is stored with the lambda. 
5. Member references
    * Use `::` operator to convert a function to a value. eg: `val getAge = Person::age`. 
    * This expression is called member reference. More concise expression of the lambda: `val getAge={person:Person -> person.age}`
    * It's convenient to provide a member reference or constructor reference to provide functions
        ```
        val nextAction = ::sendEmail // sendEmail is a function which can have parameters
        data class Person(val name: String, val age: Int)
        val createPerson = ::Person
        val p = createPerson("Alice", 29)
        ```
    * Bound reference: Kotlin 1.1 allows to use the member-reference syntax to capture a reference to the method on a specific object instance.  
      `val pAge = p::age` `pAge()` is the same as p::getAge()
### 5.2 Functional APIs for collections
1. Essentials: filter and map
    * filter function goes through a collection and selects the elements for which the given lambda returns true.  
      Result is a new collection. eg: `list.filter { it % 2 == 0}`
    * map function applies the given function to each element in the collection and collects the result into a new collection.  
      eg: `list.map { it * it}`
    * eg: `people.filter { it.age > 30 }.map(Person::name)`
    * Be aware of performance. Don't repeat other calculation in the filter.
    * filterKeys mapKeys filterValues mapValues
2. all, any, count and find: applying a predicate to a collection
    * Use all/any to check whether all/any elements in a collection match a certain condition, returns boolean
    * count checks how many elements satisfy the predicate; find returns the first matching element
3. groupBy: converting a list to a map of groups
    * Divide all elements into different groups according to some quality.
    * eg: `val people = listOf(Person("A", 1), Person("B", 2))` `people.groupBy{it.age}`  
      Group by the same age. Result is `Map<Int, List<Person>>`
4. flatMap and flatten: processing elements in nested collections
    * flatMap first transforms (maps) each element to a collection according to the function given as an argument,  
      then it combines several lists into one. 
    * If don't need to transform anything and just need to flatten a collection, can use `flatten` function.
* General advice:  
  When writing code that works with collections, think of how the operation could be expressed as a general transformation,  
  and to look for a library function that performs such a transformation. 
### 5.3 Lazy collection operations: sequences
  * Chained map/filter collection functions will need to create intermediate collections to store the result of each step. 
  * More efficient to use sequences.  
    eg: `people.asSequence().map(Person::name).filter{ it.age > 20 }.toList()`
  * Entry point for lazy collection operations is the Sequence interface
    * Sequence provides only one method, iterator, presents a sequence of element which can be enumerated one by one. 
    * elements in a sequence are evaluated lazily. 
  * Use a sequence whenever you have a chain of operations on a large collection. 
1. Executing sequence operations: intermediate and terminal operations
    * Operations on a sequence are divided into two categories
        * intermediate: returns another sequence, which knows how to transform the elements of the original sequence. eg: map/filter functions. 
        * terminal: returns a result, which may be a collection, an element, a number, or any other object,  
          that's somehow obtained by the sequence of transformations of the initial collection. eg: asList function
    * Intermediate operations are always lazy.  
      If no terminal operation, intermediate operations are not executed. 
    * Operations are applied to each element sequentially: 
        * First element is mapped then filtered, and second, and so on.  
        * Some element aren't transformed at all if the result is obtained before they are reached. 
        * The order of the operations can affect performance. 
    * Streams vs sequence: 
        * Sequences are exactly the same concept as Java 8 streams.  
          Kotlin provides sequence because Java 8 streams aren't available on old platforms. 
        * Streams has one big feature: run a stream operation on multiple CPUs in parallel. 
2. Creating sequences
    * Use generateSequence to create sequence:  
      eg: `generateSequence(0) { it + 1 }.takeWhile { it < 100 }`
    * Another common use case is a sequence of parents.  
      eg: Sequence of file parent to get the path
### 5.4 Using Java functional interfaces
  * Functional interfaces or single abstract method (SAM) interfaces:  
    interfaces which have only one abstract method
1. Passing a lambda as a parameter to a Java method
    * can pass a lambda to any Java method that expects a functional interface. 
    * Compiler automatically convert the lambda expression into an instance of Runnable
        * As of Kotlin 1.0, every lambda expression is compiled into an anonymous class, unless it is an inline lambda.  
          Support for generating Java 8 bytecode is planned for later versions, which allows the compiler to avoid a separate .class
        * If a lambda captures variables, the anonymous class will have a field for each captured variable,  
          and a new instance of that class will be created for every invocation. 
        * Otherwise, a single instance is created.  
          The name of the class is derived by adding a suffix from the name of the function in which the lambda is declared. eg: HandleComputation$1
    * If pass a lambda to the Kotlin function marked with inline, no anonymous classes are created. Most of the library functions are inline. 
2. SAM constructors: explicit conversion of lambdas to functional interfaces
    * SAM constructor is a compiler-generated function that lets you perform an explicit conversion of a lambda into an instance of a functional interface. 
    * Use it in contexts when the compiler doesn't apply the conversion automatically
        * Can't return a lambda directly, wrap it into a SAM constructor: `return Runnable { lambda_expression }`
        * When need to store a functional interface instance generated from a lambda in a variable.  
          eg: Reuse listener: `val listener = OnClickListener { view -> ... }`
        * Note: there is no this in a lambda.  
          From compiler's view, the lambda is a block of code, not an object. this in a lambda refers to a surrounding class.  
          If the even listener needs to unsubscribe itself, cannot use lambda for that. Use anonymous object instead. 
### 5.5 Lambdas with receivers: with and apply
* Kotlin has the ability to call methods of a different object in the body of a lambda without any addition qualifiers.  
  Such lambdas are called lambdas with receivers. 
1. The with function
    * provided as a library function, not a special language construct. 
        ```
        val sb = StringBuilder()
        with(sb) { // Specify the receiver value on which you're calling the methods
            this.append('A') // Calls a method on the receiver value through an explicit this
            append('B') // Calls a method omitting this
            this.toString() // Returns a value from the lambda
        } // Can be rewritten as with(sb, { ... }) but less readable
        ```
    * `this` in extension function refers to the instance of the type which the function is extending.  
      A lambda is a way to define behavior similar to a regular function.  
      A lambda with a receiver is a way to define behavior similar to an extension function. 
    * If object and surrounding class have methods with the same name, to call function in class:  
      `this@OuterClass.toString()`
2. The apply function
    * apply function works almost exactly the same as with;  
      the only difference is that apply always returns the object passed in as the argument (receiver object).  
      eg: `StringBuilder().apply { ... }.toString()`
    * apply is declared as an extension function. 
    * One useful case is when creating an instance of an object and need to initialize some properties right away. eg: Builder

## Chapter 6: The Kotlin type system
### 6.1 Nullability
  * By support nullbility as part of the type system, the compiler can detect many possible errors during compilation and reduce the possibility of having runtime exceptions 
1. Nullable types
    * A type without a question mark denotes that variables of this type can't store null references. 
    * Need to compare nullable with null, and once compared,  
      the compiler remembers that and treats the value as being non-null in the scope where the check is performed. 
    * eg: `fun strLenSafe(s: String?): Int = if (s != null) s.length else 0`
2. The meaning of types
    * A type is a classification that determines the possible values for that type,  
      and the operations that can be done on values of that type. 
    * Objects of nullable or non-null types at runtime are the same;  
        * a nullable type isn't a wrapper for a non-null type.  
        * All checks are performed at compilation time. 
        * No runtime overhead for working with nullable types in Kotlin. 
3. Safe call operator: ?
    * Safe-call operator `?` allows to combine a null check and a method call into a single operation. 
        * If the value on which you're trying to call the method isn't null, the method call is executed normally. 
        * If it is null, the call is skipped, and null is used as the value instead. 
        * The result type of such an invocation is nullable. 
        * Safe calls can be used for accessing properties as well. 
    * eg: `s?.toUpperCase()` is equivalent to `if (s != null) s.toUpperCase() else null`
    * eg: chained calls: `company?.address?.country`
4. Elvis operator: ?:
    * Operator takes two values, and the result is the first value if it isn't null or the second value if the first one is null. 
    * eg: `s ?: ""` // If s is null, the result is an empty string. 
    * Often used with the safe-call operator: eg: `val len = s?.length ?: 0`
    * Helpful for checking preconditions:  
      eg: `val addr = person.company?.address ?: throw Exception()` throws an exception if address is absent
5. Safe casts: as?
    * `as` operator throws ClassCastException if the value doesn't have the type you're trying to cast to. 
    * `as?` operator tries to cast a value to the specified type and return null if the value doesn't have the proper type. 
    * One common pattern of using a safe cast is combining it with the elvis operator.  
      eg: `o as? Person ?: do_xxx`
6. Not-null assertions: `!!`
    * Convert any value to a non-null type, throws exception for null values. 
    * Exception is thrown at the assertion, not a subsequent call on the value. 
    * Designers used `!!` trying to nudge you toward a better solution that doesn't involve making assertions that can't be verified by the compiler. 
    * Avoid multi-`!!` on the same line:  
      exception only contains the line number and no specific reason. 
7. The let function
    * let allows to evaluate an expression, check the result for null, and store the result in a variable,  
      all in a single concise expression.
    * One common use is handling a nullable argument that should be passed to a function that expects a non-null parameter.  
      eg: `email?.let { email -> sendEmailTo(email)}` or shorter `email?.let { sendEmailTo(it) }`
8. Late-initialized properties
    * A late-initialized property is always a var.  
      No longer need to initialize it in a constructor. 
    * Must initialize before use, otherwise, exception. 
    * A common use case is dependency injection. 
9. Extensions for nullable types
    * Defining extension functions for nullable types if one more powerful way to deal with null values.
    * Can allow the calls with null as receiver and deal with null in the function;  
      only possible for extension functions, regular member calls can never be performed when the instance is null.
    * `this` is always non-null in Java; `this` can be null in an extension function in Kotlin
    * When defining extension function, need to consider whether should define it as an extension for a nullable type. 
        ```
        fun String?.isNullOrBlank() : Boolean = // Extension for a nullable string
            this == null || this.isBlank() // A smart cast is applied to the second this
        fun verifyUserInput(input: String?) { 
            if (input.isNullOrBlank()) { // No safe call is needed
                ... } 
        } 
        verifyUserInput(null) // No exception happens when call isNullOrBlank with null as a receiver. 
        ```
10. Nullability of type parameters
    * By default, all type parameters of functions and classes in Kotlin are nullable.  
      eg: `fun <T> printHashCode(t: T) { println(t?.hashCode()) }` // t might be null
    * To make the type parameter non-null, specify a non-null upper bound for it.  
      eg: `fun <T:Any> printHashCode(t: T) { println(t.hashCode()) }` // t cannot be null now
11. Nullability and Java
    * Kotlin recognize annotation. `@Nullable String` in Java is seen as `String?` by Kotlin, and `@NotNull String` is `String`. 
    * Platform types
        * A platform type is essentially a type for which Kotlin doesn't have nullability information;  
          you can work with it as either nullable or a non-null type. 
        * It also won't highlight as redundant any null-safe operations on such values,  
          which it normally does when performing a null-safe operation on a non-null type. 
        * Why platform types?
            * Why not treat as nullable?  
              Would require a large number of redundant null checks for values that can never be null. 
            * Bad with generics.  
              `ArrayList<String?>?` need to check values for null on every access or use a cast. 
    * Inheritance
        * When overriding a Java method in Kotlin, you have a choice whether to declare the parameters and the return type as nullable or non-null.  
          Both are accepted by compiler. 
### 6.2 Primitive and other basic types
1. Primitive types: Int, Boolean, and more
    * Java makes a distinction between primitive types and reference types
        * Primitive type variable holds its value directly
        * Reference type variable holds a reference to the memory location containing the object. 
        * Java provides special wrapper types. java.lang.Integer
    * Kotlin doesn't distinguish between primitive types and wrapper types. 
        * At runtime, the number types are represented in the most efficient way possible.  
            * In most cases, Int is compiled to primitive int.  
            * When used in generic classes, compiled as wrapper type. 
2. Nullable primitive types: Int?, Boolean?, and more
    * Nullable types in Kotlin can't be represented by Java primitive types;  
      nullable primitive types is compiled to the wrapper type.
    * If need to efficiently store large collections of primitive types,  
      either use a third-party library (like Trove4j) that provides support for such collections,  
      or store them in arrays. 
3. Number conversions
    * Kotlin doesn't automatically convert numbers from one type to the other, even when the other type is larger. 
    * Instead, need to apply the conversion explicitly. eg. `toLong()`.  
      Conversion functions are defined for every primitive type (except Boolean)
    * Kotlin makes the conversion explicit in order to avoid surprises, especially when comparing boxed values. 
      eg: `x.toLong() in listOf(1L, 2L)` // Force to convert the types explicitly
4. Any and Any?: the root types
    * `Any` type is the supertype of all non-nullable types (including primitive types like Int) in Kotlin like Object in Java. 
    * `Any` is non-nullable type
    * `Any` is compiled to Object in the Java bytecode
5. The Unit type: Kotlin's void
    * `Unit` type in Kotlin fulfills the same function as void in Java. 
    * Can be used as a return type of a function that has nothing to return:  
      `fun f(): Unit { }` same as `fun f() {}`
        ```
        interface Processor<T> { fun process(): T }
        class NoResultProcessor : Processor<Unit> { // Returns Unit
            override fun process() { 
                /* Don't need an explicit return */ 
            }
        } 
        // Java needs to use a special type Void, and has to return null in the function. 
        ```
6. The Nothing type: this function never returns
    * Some functions never completes successfully.  
      Like testing function fail throws exception or function with infinite loop
    * To express that, Kotlin uses a special return type Nothing. 
    * eg: `fun fail(message: String): Nothing { throw IllegalStateException(message) }`
### 6.3 Collections and arrays
1. Nullability and collections
    * List<Int?> can store null; filterNotNull() to filter out nulls
2. Read-only and mutable collections
    * Kotlin's collection design separates interfaces for accessing the data in a collection and for modifying the data
        * `kotlin.collections.Collection`
        * `kotlin.collections.MutableCollection`
    * read-only collections aren't necessarily immutable: other references can have a mutable
3. Kotlin collections and Java
    * Kotlin collection is an instance of the corresponding Java collection interface
    * Every Java collection interface has two representations in Kotlin: a read-only one and mutable one
    * `ArrayList` implements `MutableList`(extends `List`) -> `MutableCollection`(extends `Collection`) -> `MutableIterable`(extends `Iterable`)
    * Java doesn't distinguish between read-only and mutable collections,  
      it can modify the collection even if it's declared as a read-only on Kotlin side
4. Collections as platform types
    * Variables of collection type declared in Java are also seen as platform types, mutability is unknown.
    * When overriding or implementing a Java method that has a collection type in its signature,  
      need to decide which Kotlin type to use and need to know the exact contract the Java interface or class needs to follow. 
5. Arrays of objects and primitive types
    * To create an array in Kotlin
        * `arrayOf` `arrayOfNulls`
        * `Array` constructor takes the size of the array and a lambda, and initializes each array element by calling the lambda.  
          eg: `Array<String>(26) { i -> ('a' + i).toString() }`
    * Use toTypedArray to convert a collection to an array.
      eg: `"%s%s%s".format(*list.toTypedArray())` Spread operator `*` is used to pass an array when vararg parameter is expected
    * Type arguments of array types always become object types;  
      To use primitive type arrays, use IntArray, ByteArray, etc
      eg: `IntArray(5)` `intArrayOf(0, 0, 0, 0, 0)` `IntArray(5) { i -> i * i}`
    * Kotlin standard library supports the same set of extension functions for arrays as for collections;  
      `filter/map` also work for array (Note that the return values of these functions are lists, not arrays). 

# Part 2: Embracing Kotlin
## Chapter 7: Operator overloading and other conventions
### 7.1 Overloading arithmetic operators
1. Overloading binary arithmetic operations
    * Use operator keyword on function to define operator
    * Can overload operator with the function name: `*(times) /(div) %(mod) +(plus) -(minus)`
        ```
        data class Point(val x: Int, val y: Int) { 
            operator fun plus(other: Point) : Point { return Point(x + other.x, y + other.y) }
        } // Then can use Point(1, 2) + Point(3, 4)
        ```
    * Common way is defining operator as an extension function:  
      `operator fun Point.plus(other: Point) : Point { }`
    * parameters and return types can be different.  
      eg: `operator fun Char.times(count: Int) : String {}` `'a' * 3`
    * No special operators for bitwise operations because Kotlin doesn't define any bitwise operators.  
      Kotlin bitwise operation functions: `shl(<<) shr(>>) ushr(>>>) and(&) or(|) xor(^) inv(~)`
2. Overloading compound assignment operators
    * `+= -=` are called compound assignment operators
    * Modifies an object without reassign the reference.  
      eg: `val numbers = ArrayList<Int>()` `numbers += 42`
    * If defining a function named plusAssign with the Unit return type, Kotlin will call it when += operator is used.  
      eg: `operator fun <T> MutableCollection<T>.plusAssign(element: T) {}`
    * There will be error when both + and += are defined.  
      Try not to define both. When both defined, can use function call or use val reference so plusAssign operation becomes inapplicable. 
    * Kotlin standard library supports both. 
        * `+` and `-` operators always return a new collection
        * `+=` and `-=` operators
            * on mutable collections by modifying them in place
            * on read-only collection by returning a modified copy.  
              (So `+=/-=` can only be used with a read-only collection if variable is var)
        * eg: `val list = arrayListOf(1, 2)` `list += 3` // Changes list
        * eg: `val newList = list + listOf(3, 4)` // Returns a new list containing all the elements
3. Overloading unary operators
    * Can overload with function name: `+(unaryPlus) -(unaryMinus) !(not) ++(inc) --(dec)`  
      eg: `operator fun BigDecimal.inc() = this + BigDecimal.ONE`
    * Compiler automatically supports the same semantics for pre- and post- operators (`++a a++`)  
### 7.2 Overloading comparison operators
1. Equality operators: equals
    * == operator is translated into a call of equals method; can be used with nullable operands
    * identity equals operator === to check whether the same object
    * operator modifier on a method applies to all methods that implement or override it. 
2. Ordering operators: compareTo
    * `< > <= =>` are translated into calls of compareTo method in Comparable interface. 
    * Can use compareValueBy to help comparison:  
      `compareValueBy(this, that, Person::lastName, Person::firstName, ...)`  
      More concise but slower
### 7.3 Conventions used for collections and ranges
1. Accessing elements by index: get and set
    * Reading an element using the index operator is translated into a call of the `get` operator method,  
      and writing becomes a call to `set`.
      eg: `operator fun Point.get(index: Int): Int { }`
    * The parameter of get can be any type, not just Int
    * Can also define a get method with multiple parameters.  
      eg: `operator fun get(row: Int, col: Int)` `matrix[row, col]`
    * Can define multiple overloaded get methods with different parameter types.
2. The "in" convention
    * in operator is translated into `contains` function call
3. The rangeTo convention
    * `..` operator is a concise way to call the `rangeTo` function
    * Koltin library already defines the `rangeTo` function that can be called on any class that implements `Comparable` interface.  
      `operator fun <T: Comparable<T>> T.rangeTo(that: T): ClosedRange<T>`
        ```
        val now = LocalDate.now()
        val vacation = new..now.plusDays(10) // Creates a 10 day range starting from now
        now.plusWeeks(1) in vacation // Checks whether a specific date belongs to the range
        ```
4. The "iterator" convention for the "for" loop
    * `for (x in list) { }` is translated into a call of `list.iterator()`,  
      on which the hasNext and next are then repeatedly called. 
    * iterator method can be defined as an extension. 
### 7.4 Destructuring declarations and component functions
* Destructuring declarations allows you to unpack a single composite value and use it to initialize several separate variables.
* Once again using the principle of conventions
    * a function named `componentN` is called, where N is the position of the variable in the declaration. 
    * For a data class, the compiler generates a `componentN` function for every property declared in the primary constructor. 
    * Can be declared manually for a non-data class
        ```
        class Point(val x: Int, val y: Int) {
            operator fun component1() = x
            operator fun component2() = y }
        ```
    * The standard library allows to use this syntax to access the first 5 elements of a container
* One of the main use case is to return multiple values from a function;  
  Can also use Pair and Triple class, less code but less expressive.
1. Destructuring declarations and loops  
  eg: `for ((key, value) in map) {}`
### 7.5 Reusing property accessor logic: delegated properties
1. Delegated properties: the basics
    * The general syntax of a delegated property is:  
      `class Foo { var p: Type by Delegate()}`. 
        * p delegates the logic of its accessors to another object, a new instance of the Delegate class. 
        * By convention, Delegate class must have getValue and setValue methods (if mutable)
        * When using p as a regular property, under the hood, the methods on the helper are called
2. Using delegated properties: lazy initialization and "by lazy()"
    * Lazy initialization is a common pattern that entails creating part of an object on demand,  
      when it's accessed for the first time.
    * Implementing lazy initialization using a backing property
        ```
        class Person {
            private var _emails: List<Email>? = null
            val emails: List<Email> get() {
                if (_email == null) _email = loadEmails(this) // Loads data on access
                return _emails!!
            }
        }
        ```
    * Kotlin provides a better solution, using lazy function. 
        * `val emails by lazy { loadEmails(this) }`
        * lazy function returns an object that has a method called getValue with the proper signature;  
        * argument is a lambda to initialize the value;  
        * thread-safe by default
3. Implementing delegated properties
    * Using Delegates.observable to implement property change notification
        ```
        class Person() {
            private val observer = { 
                prop: KProperty<*>, 
                oldValue: Int, 
                newValue: Int -> fire_some_event() 
            }
            var age: Int by Delegates.observable(age, observer) 
        }
        ```
4. Delegated-property translation rules
    * When using `class C { var prop: Type by Delegate() }`, compiler generates code like this:
        ```
        class C {
            private val _delegate = Delegate() // backing property
            var prop: Type
                get() = _delegate.getValue(this, _prop) // _prop is a KProperty object to represent the property
                set(value: Type) = _delegate.setValue(this, _prop, value)
        }
        val x = c.prop is like val x = _delegate.getValue(c, _prop)
        c.prop = x is like _delegate.setValue(c, _prop, x)
        ```
5. Storing property values in a map
    * Standard library defines getValue and setValue extension functions on the standard Map and MutableMap interfaces. 
    * Can use map as a delegated property
        ```
        private val _attributes = hashMapOf<String, String>()
        val name: String by _attributes // The name of the property is used as the key to store the value in the map
        ```
6. Delegated properties in frameworks
    * Can use compact code to customize where the value of the property is stored (map, database, cookies)  
      and also what happens when the property is accessed (add validation, change notifications, ...)

## Chapter 8: Higher-order functions: lambdas as parameters and return values
### 8.1 Declaring higher-order functions
* A higher-order function is a function that takes another function as an argument or returns one. 
1. Function types
    * eg: `val sum: (Int, Int) -> Int = { x, y -> x + y}` `val action: () -> Unit = {}` 
    * Nullable `var funOrNull: ((Int, Int) -> Int)? = null`
2. Calling functions passed as arguments
3. Using function types from Java
    * Under the hood, function types are declared as regular interfaces: 
        * a variable of a function type is an implementation of a FunctionN interface.  
          eg: `Function0<R>`, `Function1<P1, R>`, etc
        * Each interface defines a single invoke method, and calling it will execute the function
            ```
            fun processTheAnswer(f: (Int) -> Int) {} // Kotlin function
            processTheAnswer(number -> number + 1) // Calling with Java 8 lambda
            processTheAnswer(new Function1<Integer, Integer>() { // Old Java
                @Override public Integer invoke(Integer number) {}
            })
            ```
4. Default and null values for a parameters with function type  
    Function type parameter can have default or null values
5. Returning functions from functions  
    To declare a function that returns another function, specify a function type as its return type
6. Removing duplication through lambdas  
    Function types can help eliminate code duplication.
### 8.2 Inline functions: removing the overhead of lambdas
1. How inlining works
    * When declaring a function as inline, its body is inlined:  
      it's substituted directly into places where the function is called instead of being invoked normally.
    * Example: Simulate synchronized with a Lock
        ```
        inline fun <T> synced(lock: Lock, action: () -> T) : T {
            lock.lock()
            try { return action() } finally { lock.unlock() }
        }
        val lock = Lock()
        synced(lock) { ... }
        ```
2. Restrictions on inline functions
    * Generally, the parameter can be inlined if it's called directly or passed as an argument to another inline function.
    * If the parameter is stored somewhere for further use, the code of the lambda expression can't be inlined,  
      because there must be an object that contains this code. 
3. Inlining collection operations
    * filter and map functions on collection are inlined
    * For large number of elements to process, use sequence.  
      But filter/map on sequence are not inlined because the lambda passed in is stored for later use. 
4. Deciding when to declare functions as inline
    * Using the inline keyword is likely to improve performance only with functions that take lambdas as arguments
    * All other cases require additional measuring and investigation.
        * For regular function calls, JVM already provides powerful inlining support.  
            * JVM analyzes the code execution and inlines calls whenever doing so provides the most benefit;  
            * it happens while translating bytecode to machine code. 
        * In bytecode, the implementation of each function is repeated only once and doesn't need to be copied to every place where the function is called,  
          as with Kotlin's inline functions.
        * The stacktrace is clearer if the function is called directly. 
    * Inlining functions with lambda arguments is beneficial
        * The overhead avoided through inlining is more significant,  
          not only on the call but also on the creation of the extra class for each lambda and an object for the lambda instance
        * JVM currently isn't smart enough to always perform inlining through the call and the lambda. 
        * Inlining lets you use features that are impossible to make work with regular lambdas, such as non-local returns. 
    * Inlining could increase code size
5. Using inlined lambdas for resource management
    * Kotlin doesn't have try-with-resource as in Java,  
      but can do the same through a function with a parameter of a function type.
    * Kotlin provides withLock and use function
        ```
        fun <T> Lock.withLock(action: () -> T): T { // withLock is an extension function on Lock
            lock()
            try { return action() } finally { unlock() }
        }
        // use function is an extension function called on a closable resource; 
        // it receives a lambda as an argument, it calls the lambda and ensures that the resource is locked after use
        fun readFirstLineFromFile(path: String) : String {
            BufferedReader(FileReader(path)).use { br -> return br.readLine() } 
        }
        ```
### 8.3 Control flow in higher-order functions
1. Return statements in lambdas: return from an enclosing function
    * If you use the return keyword in a lambda, it returns from the function in which you called the lambda, not just from the lambda itself.  
      Such a return is called a non-local return, because it returns from a larger block than the block containing it. 
        ```
        fun lookForAlice(people: List<Person>) {
            people.forEach {
                if (it.name == "Alice") {
                    println("Alice is found")
                    return // It would return from the entire function
                }
            } 
            println("Alice is not found")
        }
        ```
    * The return from the outer function is possible only if the function that takes the lambda as an argument is inlined;  
      Using the return expression in lambdas passed to non-inline functions isn't allowed. 
2. Returning from lambdas: return with a label
    ```
    fun lookForAlice(people: List<Person>) {
        people.forEach label@ { // Labels the lambda expression
            if (it.name == "Alice") return@label // return@label refers to the label and return from the loop
            // Alternatively, can use return@forEach to return from the lambda
        }
    }
    StringBuilder().apply sb@ { // The outer lambda's implicit receiver is accessed by this@sb
        listOf(1, 2, 3).apply {
            this@sb.append(this.toString()) // this refers to the closed implicit receiver in the scope
        }}
    ```
3. Anonymous functions: local returns by default
    * Return returns from the closed function declared using the fun keyword. 
        ```
        people.forEach(fun(person) { // Use an anonymous function instead of a lambda expression
            if (person.name == "Alice") return // Returns from the anonymous function
        })
        ```
## Chapter 9: Generics
1. Generics at runtime: type checks and casts
    * Kotlin's generics are erased at runtime just as in Java.  
      An instance of a generic class doesn't carry information about the type arguments used to create that instance. 
    * Can check whether the variable is a list.  
      `if (value is List<*>)` * is the star projection
    * Cannot check whether it is a list of String.  
      `if (value is List<String>)` compilation error
2. Declaring functions with reified type parameters
    * When calling a generic function, in its body, you can't determine the type argument it was invoked with
    * Type parameter of inline functions can be reified, which means you can refer to actual type arguments at runtime. 
    * eg: `inline fun <reified T> isA(value: Any) = value is T` `isA<String>("abc")` returns true
    * eg: A simplified implementation of filterIsInstance in Kotlin library:  
      `inline fun <reified T> Iterable<*>.filterIsInstance(): List<T> { ... }`  
      `items.filterIsInstance<String>()`
    * Why reification works for inline functions only
        * Compiler inserts the inline bytecode into every place where it's called;  
            * compiler knows the exact type used as the type argument in that particular call;  
            * therefore, compiler can generate the bytecode that references the specific class used as a type argument. 
        * inline function with reified type parameters can't be called from Java code.  
          Normal inline functions are accessible to Java as regular functions: can be called by not inlined
3. Replacing class references with reified type parameters
    * One common use case for reified type parameters is building adapters for APIs that take parameters of type java.lang.Class. 
    * eg: Simplifying the startActivity function onAndroid
        ```
        inline fun <reified T: Activity> Context.startActivity() {
            val intent = Intent(this, T::class.java) // Accesses the class of the type parameter as T::class
            startActivity(intent)
        }
        startActivity<DetailActivity>()
        ```
4. Restrictions on reified type parameters
    * Can be used for: 
        * Type checks and casts (is, as); 
        * Kotlin reflection APIs; 
        * get the corresponding java.lang.Class(::class.java); 
        * as a type argument to call other functions
    * Cannot do: 
        * Create new instances of the class specified as a type parameter; 
        * call methods on the companion object of the type parameter class; 
        * Use a non-reified type parameter as a type argument when calling a function with a reified type parameter; 
        * Mark type parameters of classes, properties, or non-inline functions as reified. 
### 9.3 Variance: generics and subtyping
1. Why variance exists: passing an argument to a function  
    Passing a list of strings to a function that expects a list of Any objects is not safe
2. Classes, types and subtypes
    * Class and type difference: String and String?
    * A type B is a subtype of a type A if you can use the value of the type B whenever a value of the type A is required;  
      A is the supertype of B
    * Passing an expression to a function is allowed only when the type of the expression is a subtype of the function parameter type.
    * A generic class - for instance, MutableList - is called invariant on the type parameter if, for any two different types `A` and `B`,  
      `MutableList<A>` isn't a subtype or a supertype of `MutableList<B>`.  
      In Java, all classes are invariant. 
3. Covariance: preserved subtyping relation
    * A covariant class is a generic class for which the following holds:  
      `Producer<A>` is a subtype of `Producer<B>` if `A` is a subtype of `B`. We say that the subtyping is preserved. 
        ```
        open class Animal {}    class Cat: Animal() {}    
        class Herd<out T: Animal> { // T parameter is covariant
            operator fun get(i: Int): T { ... } // T is in the out position
        } 
        fun feedAll(animals: Herd<Animal>) {
            for (i in 0 until animals.size) animals[i].feed()
        }
        fun takeCareOfCats(cats: Herd<Cat>) {
            feedAll(cats) // Without out, will be error: inferred type is Herd<Cat>, but Herd<Animal> was expected.  
        }
        ```
    * Uses of a type parameter in declarations of class members can be divided into in and out positions
        * If T is used as the return type of a function, it is in the out position
        * If T is used as the type of a function parameter, it is in the in position. 
    * out keyword on the type parameter T means two things:
        * The subtyping is preserved (`Herd<Cat>` is a subtype of `Herd<Animal>`)
        * T can be used only in out positions. If used as parameter, cannot mark with `out`.
    * Constructor parameters are in neither in nor out position, and `out T` can be used with constructor. 
    * Rules cover only the externally visible (non-private) APIs.  
      Private methods are in neither in nor out position. 
4. Contravariance: reversed subtyping relation
    * A class that is contravariant on the type parameter is a generic class for which the following holds:  
      `Consumer<A>` is a subtype of `Consumer<B>` if `B` is a subtype of `A`. 
    * The in keyword on the type parameter T means the subtyping is preserved and T can be used only in in positions. 
    * A class or interface can be convariant on one type parameter and contravariant on another.  
      eg: `interface Function1<in P, out R> { operator fun invoke(p: P): R }` 
5. Use-site variance: specifying variance for type occurrences
    * Specify variance modifiers on class declaration is called declaration-ste variance.  
      Convenient because the modifiers apply to all places where the class is used.
    * Java uses use-site variance:  
      every time you use a type with a type parameter, you can also specify whether this type parameter can be replaced with its subtypes or supertypes.  
      `(? extends and ? super)`
    * eg: `public interface Stream<T> { <R> Stream<R> map(Function<? super T, ? extends R> mapper)}`
    * Kotlin supports use-site variance too.  
        * eg: `fun <T: R, R> copyData(src: MutableList<T>, dest: MutableList<R>){}`  
          Source element type should be a subtype of the destination's element type
        * `MutableList<out T>` is `MutableList<? extends T>` in Java;  
          `MutableList<in T>` is `MutableList<? super T>` in Java
        * Can specify a variance modifier on any usage of a type parameter in a type declaration:  
          for a parameter type, local variable type, function return type, and so on. 
        * What happens here is called type projection:  
          source isn't a regular MutableList but a projected (restricted) one. 
        * May not able to call some methods if using a projected type. 
6. Star projection: using * instead of a type argument
    * Can use start-projection syntax to indicate that you have no information about a generic argument. 
    * eg: a list of elements of unknown type: `List<*>`
    * `MutableList<*>` isn't the same as `MutableList<Any?>`
        * `MutableList<Any?>` is a list that can contain elements of any type
        * `MutableList<*>` is a list that contains elements of a specific type, but you don't know what type is. 
    * Cannot put anything into the `MutableList<*>` because type is unknown.  
      But it is possible to get the elements from the list. 
    * `MutableList<*>` is projected to `MutableList<out Any?>`;  
      `Consumer<in T>` is equivalent to `<in Nothing>`

## Chapter 10: Annotations and reflection
### 10.1 Declaring and applying annotations
1. Applying annotations
    * `@Deprecated` enhanced with replaceWith parameter:   
      `@Deprecated("Use removeAt instead", ReplaceWith("removeAt(index"))) fun remove(index: Int) {} `.  
      IntelliJ IDEA will not only show what function should be used instead (`removeAt`) but also offer a quick fix to replace it. 
    * Syntax for specifying annotation arguments is slightly different from Java's
        * To specify a class as an annotation argument, put ::class after the class name:  
          `@MyAnnotation(MyClass::class)`
        * To specify another annotation as an argument, don't put @ before the annotation name.  
          eg: ReplaceWith is an annotation
        * To specify an array as an argument, use the arrayOf function:  
          `@RequestMapping(path = arrayOf("/foo", "/bar"))`
    * To use a property as an annotation argument, need to mark it with a const modifier,  
      which tells the compiler that the property is a compile-time constant.  
      eg: `const val TEST_TIMEOUT = 100L` `@Test(timeout=TEST_TIMEOUT) fun testMethod() {}`
2. Annotation targets
    * A single declaration in Kotlin may corresponds to multiple Java declarations, and each of them can carry annotations.  
      eg: a Kotlin property corresponds to a Java field, getter, setter and its parameter.
    * Use use-site target declaration to specify the element to be annotated.  
      The use-site target is placed between @ and the annotation name and is separated from the name with a colon.  
      eg: `@get:Rule` causes the annotation `@Rule` applied to the property getter, not the property. 
    * Supported use-site targets:
        * property - Java annotation can't be applied with this use-site target
        * field - Field generated for the property
        * get/set - Property getter/setter
        * receiver - Receiver parameter of an extension function or property
        * param - Constructor parameters
        * setparam - Property setter parameter
        * delegate - Field storing the delegate instance for a delegated property
        * file - Class containing top-level functions and properties declared in the file
    * Any annotation with the file target needs to be placed at the top level of the file, before the package directive.  
      One common applied annotation is `@JvmName`, which changes the name of the corresponding class.  
      `@file:JvmName("StringFunctions")`
    * Kotlin provides a variety of annotations to control how declarations written in Kotlin are compiled to Java bytecode and exposed to Java callers.
        * `@Volatile` and `@Strictfp` serve as direct replacements for Java's `volatile` and `strictfp` methods. 
        * `@JvmName` changes the name of a Java method or field generated from a Kotlin declaration
        * `@JvmStatic` can be applied to methods of an object declaration or a companion object to expose them as static Java methods. 
        * `@JvmOverloads` instructs Kotlin compiler to generate overloads for a function that has default parameter values. 
        * `@JvmField` can be applied to a property to expose that property as a public Java field with no getters or setters. 
3. Using annotations to customize JSON serialization
4. Declaring annotations
    * `annotation class JsonName(val name: String)` same as  
      `public @interface JsonName { String value(); }` in Java
    * In Kotlin, applying an annotation is a regular constructor call. 
    * If need to apply an annotation declared in Java,  
      have to use the named-argument syntax for all arguments except value, which Kotlin recognizes as special
5. Meta-annotations: controlling how an annotation is processed
    * `@Target(AnnotationTarget.PROPERTY) annotation class JsonExclude`
    * `@Retention` in Java specifies whether the annotation is stored in the .class file and whether accessible at runtime through reflection.  
        * Java by default retains annotations in .class file but doesn't make them accessible at runtime.  
        * Kotlin defaults annotations having RUNTIME retention.
6. Classes as annotation parameters
    * `annotation class DeserializeInterface(val targetClass: KClass<out Any>)`
7. Generic classes as annotation parameters
    * `annotation class CustomSerializer { val serializerClass: KClass<out ValueSerializer<*>>}`
### 10.2 Reflection: introspecting Kotlin objects at runtime
  * Kotlin reflection API, defined in `kotlin.reflect` package,  
    gives access to concepts that don't exist in the Java world, such as properties and nullable types.  
    But it doesn't provide a comprehensive replacement for Java reflection API. 
1. The Kotlin reflection API: KClass, KCallable, KFunction, and KProperty
    * `KClass` is the counterpart of `java.lang.Class`. 
    * `KCallbale` is a superinterface for functions and properties
    * Types such as `KFunction1` represent functions with different numbers of parameters.  
      These function types are synthetic compiler-generated types, and not declared in `kotlin.reflect` package. 
    * A member-property is represented by an instance of `KProperty1`, which has a one-argument get method. 
2. Implementing object serialization using reflection
3. Customizing serialization with annotations
    * Get KClass:  
      `val kClass = obj.javaClass.kotlin`
    * Get all properties of the class:  
      `val properties = kClass.memberProperties`
    * Get property value:  
      `prop.get(obj)`
4. JSON parsing and object deserialization
    * Helper function:  
      `inline fun <reified T> KAnnotatedElement.findAnnotation(): T? = annotations.filterIsInstance<T>().firstOrNull()`
5. Final deserialization step: callBy() and creating objects using reflection
    * `KCallable.call` method calls a function or constructor by taking a list of arguments.  
      One restriction: doesn't support default parameter values
    * `KCallable.callBy`: `interface KCallable<out R> { fun callBy(args: Map<KParameter, Any?>): R }`
        * Takes a map of parameters to their corresponding values that will be passed as arguments
        * If a parameter is missing from the map, its default value will be used if possible. 

## Chapter 11: DSL construction
### 11.1 From APIs to DSLs
* Clean API
    * It needs to be clear to readers what's going on in the code.  
      Can be achieved with a good choice of names and concepts
    * The code needs to look clean, with minimal ceremony and no unnecessary syntax. 
* Kotlin support for clean syntax
    * Extension function: `StringUtil.capitalize(s)` -> `s.capitalize()`
    * Infix call: `.to("one")` -> `1 to "one"`
    * Operator overloading: `set.add(2)` -> `set += 2`
    * Convention for the get method: `map.get("key")` -> `map["key"]`
    * Lambda outside of parentheses: `file.use({ f -> f.read() })` -> file.use { it.read() }
    * Lambda with a receiver: `sb.append("yes")` -> `with(sb) { append("yes") }`
* Kotlin's DSLs build on the clean-syntax features and extend them with the ability to create structure out of multiple method calls.
* Kotlin DSLs are fully statically typed. 
1. The concept of domain-specific languages
    * General-purpose programming language:  
      with a set of capabilities complete enough to solve essentially any problem that can be solved with a computer
    * Domain-specific language:  
      focuses on a specific task or domain, and forgoes the functionality that's irrelevant for that domain. 
    * Common DSLs: SQL and regular expressions. 
    * DSLs tend to be declarative
        * imperative language describes the exact sequence of steps required to perform an operation
        * declarative language describes the desired result and leaves the execution details to the engine that interprets it. 
    * DSL disadvantage: it can be difficult to combine them with a host application in a general-purpose language. 
2. Internal DSLs
    * Part of programs written in a general-purpose language, using exactly the same syntax;  
      isn't a fully separate language, but rather a particular way of using the main language while retaining the key advantages of DSLs with an independent syntax. 
3. Structure of DSLs
    * In a Kotlin DSL, structure is most commonly created through the nesting of lambdas or through chained method calls. 
4. Building HTML with an internal DSL
### 11.2 Building structure APIs: lambdas with receivers in DSLs
1. Lambdas with receivers and extension function types
    ```
    // Defining buildString() that takes a lambda as an argument
    fun buildString(builderAction: (StringBuilder) -> Unit): String { // Parameter of a function type
        val sb = StringBuilder()  
        builderAction(sb) // Pass a StringBuilder as an argument to the lambda
        return sb.toString()
    }
    val s = buildString { it.append("A")  it.append("B")} // Uses "it" to refer to the StringBuilder instance. 
    // Redefining buildString() to take a lambda with a receiver
    fun buildString(builderAction: StringBuilder.() -> Unit): String { // Parameter of a function type with a receiver 
        val sb = StringBuilder()
        sb.builderAction() // Passes a StringBuilder as a receiver to the lambda
        return sb.toString()
    }
    val s = buildString {
        this.append("A") // this refers to the StringBuilder instance
        append("B") // Can omit this and refer to StringBuilder implicitly
    }
    ```
    * Extension function type: 
        * `String.(Int, Int) -> Unit`  
          `String`: receiver type; `(Int, Int)`: parameter type; `Unit`: Return type.
        * Describes a block of code that can be called as an extension function 
        * Can also declare a variable of an extension function type
            ```
            val appendExcl : StringBuilder.() -> Unit = { this.append("!" )} // A value of an extension function type
            val sb = StringBuilder("Hi")
            sb.appendExcl() // Can call appendExcl as an extension function
            buildString(appendExcl) // Can also pass appendExcl as an argument
            ```
    * A lambda with a receiver looks exactly the same as a regular lambda in the source code.  
      Need to look at the signature of the function to which the lambda is passed. 
    * Implementation of `buildString`, `apply` and `with` in the standard library:  
        ```
        fun buildString(builderAction: StringBuilder.() -> Unit): String = 
            StringBuilder().apply(builderAction).toString()
        inline fun <T> T.apply(block: T.() -> Unit): T {
            block() // Equivalent to this.block(); invokes the lambda with the receiver of apply as the receiver object
            return this // returns receiver
        }
        inline fun <T, R> with(receiver: T, block: T.() -> R): R = receiver.block // Returns the result of the calling lambda
        ```
    * Basically, all `apply` and `with` do is invoke the argument of an extension function type on the provided receiver. 
        * `apply` is declared as an extension to that receiver; `apply` returns the receiver itself
        * `with` takes the receiver as a first argument; `with` returns the result of calling the lambda
2. Using lambdas with receivers in HTML builders
    * Producing a simple HTML table with a kotlin HTML builder:  
      `createHtml().table { tr { td { +"cell" }}}`
    * Core implementation
        ```
        open class Tag
        class TABLE : Tag { fun tr(init: TR.() -> Unit) }
        class TR : Tag { fun td(init: TD.() -> Unit) }
        class TD: Tag
        ```
3. Kotlin builders: enabling abstraction and reuse
    * A sample to abstract repeated chunks of code into new functions and reuse them
### 11.3 More flexible block nesting with the invoke convention
1. The invoke convention: objects callable as functions
    * isn't a feature for everyday use, because it can be used to write hard-to-understand code, such as `1()`
    * A class for which the invoke method with an operator modifier is defined can be called as a function
        ```
        class Greeter(val greeting: String) {
            operator fun invoke(name: String) { } // Define the invoke method on Greeter
        }
        val greeter = Greeter("")
        greeter("Hello") // Calls the greeter instance as a function
        ```
2. The invoke convention and functional types
    * The way to invoke a lambda (lambda()) is an application of this convention:  
      Lambdas are compiled into classes that implement functional interfaces (Function1 and so on),  
      and those interfaces defines the invoke method with the corresponding number of parameters:  
      `interface Function2<in P1, in P2, out R> { operator fun invoke(p1: P1, p2: P2): R }`
    * Can use a class to define lambda and split the complex code into multiple methods
        ```
        class Processor() : (Issue) -> Boolean { // Uses the function type as a base class
            override fun invoke(issue: Issue): Boolean { } // Implements the invoke method
        }
        ```
3. The invoke convention in DSLs: declaring dependencies in Gradle
    * `dependencies { compile("junit:junit:4.11") }`
### 11.4 Kotlin DSLs in practice
1. Chaining infix calls: "should" in test frameworks
    * Expressing an assertion with kotlintest DSL: `s should startWith("kot")`
    * Implementation
        ```
        infix fun <T> T.should(matcher: Matcher<T>) = matcher.test(this) 
        interface Matcher<T> { fun test(value: T) }
        class startWith(val prefix: String) : Matcher<String> {
            override fun test(value: String) {
                if (! value.startsWith(prefix))
                    throw AssertionError("...")
            }
        }
        ```
2. Defining extensions on primitive types: handling dates
    ```
    val yesterday = 1.days.ago
    val tomorrow = 1.days.fromNow
    val Int.days: Period get() = Period.ofDays(this) // this refers to the value of the numeric constant
    val Period.ago: LocalDate get() = LocalDate.now() - this 
    val Period.fromNow: LocalDate get() = LocalDate.now() + this
    ```
3. Member extension functions: internal DSL for SQL
    * Member extension:  
      A function or property which is both a member of its containing class and an extension to some other type at the same time. 
    * eg: `class Table { fun Column<Int>.autoIncrement(): Column<Int> }`
    * Member extension cannot be used outside of the scope of the containing class. 
    * Extension function can be used to restrict the receiver type: autoIncrement only for Column<Int>
4. Anko: creating Android UIs dynamically

