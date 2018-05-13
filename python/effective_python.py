##### Chapter 1: Pythonic thinking
# Item 1: Know which version of python you're using
import sys
print (sys.version_info)
print (sys.version)
# Item 2: Follow the PEP 8 Style Guide
# Item 3: Know the Differences Between bytes, str, and unicode
#    Python3 bytes contains sequences of 8-bit values, str contains sequences of unicode characters
# Item 4: Write Helper Functions Instead of Complex Expressions
# Item 5: Know How to Slice Sequences
#    Avoid being verbose: Don't supply 0 for the start index or the length of the sequence for the end index
#    Slicing is forgiving of start or end indexes that are out of bounds
a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
print("slice a[:20]", a[:20], "length is ", len(a[:20]))
#    Assigning to a list slice will replace that range in the original sequence with what's referenced even if their lengths are different
a[2:7] = ['C', 'D']
print(a)
# Item 6: Avoid Using start, end, and stride in a Single Slice
a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print('odd', a[::2])
print('back to front', a[::-2])
#     Specifying start, end and stride in a slice can be extremely confusing.
#     Prefer using positive stride values in slices without start or end indexes. Avoid negative value if possible.
#     Avoid using start, end and stride in a single slice. Consider two assignments for clarity.
# Item 7: Use List Comprehensions Instead of map and filter
even_squares = [ x**2 for x in a if x % 2 == 0]
print(even_squares)
# map way using lambda is not clearer
even_squares = list(map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, a)))
print(even_squares)
#     List comprehensions are clearer than the map and filter built-in functions.
#     Dictionaries and sets also support comprehension expressions.
# Item 8: Avoid More Than Two Expressions in List Comprehensions.
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flat = [x for row in matrix for x in row]
print(flat)
#     List comprehensions support multiple levels of loops and multiple conditions per loop level.
#     List comprehensions with more than two expressions are very difficult to read and should be avoided.
# Item 9: Consider Generator Expressions for Large Comprehensions
#     List comprehensions can cause problems for large inputs by using too much memory
#     Generator expressions avoid memory issues by producing outputs one at a time as an iterator
#     Generator can be chained and run very quickly
flat = (x for row in matrix for x in row)
print('generator', next(flat), next(flat))
# Item 10: Prefer enumerate Over range
for i, row in enumerate(matrix, 1):
    print('row ', i, row)
#     enumerate provides concise syntax for looping over an iterator and getting the index of each item from the iterator as you go
#     Prefer enumerate instead of looping over a range and indexing into a sequence
#     Can supply a second parameter to enumerate to specify the number from which to begin counting
# Item 11: Use zip to Process Iterators in Parallel
#     The zip built-in function can be used to iterate over multiple iterators in parallel
#         eg: for name, count in zip(names, letters)
#     zip truncates its output silently if you supply with iterators of different lengths
#     zip_longest function from the itertools built-in module lets you iterate over multiple iterators in parallel regardless of their lengths
# Item 12: Avoid else Blocks After for and while Loops
#     Python has special syntax that allows else blocks to immediately follow for and while loop interior blocks
#     else block after a loop only runs if the loop body did not encounter a break statement
#     Avoid using else block after loops because their behavior isn't intuitive and can be confusing
# Item 13: Take Advantage of Each Block in try/except/else/finally
#     try/finally lets you run cleanup code regardless of whether exceptions were raised in the try block
#     else block helps you minimize the amount of code in try blocks and visually distinguish the success case from the try/except blocks
#     An else block can be used to perform additional actions after a successful try block but before common cleanup in a finally block

##### Chapter 2: Functions
# Item 14: Prefer Exceptions to Returning None
#     Functions that return None to indicate special meaning are error prone because None and other values (eg: zero, empty string) all evaluate to False in conditional expressions
#     Raise exceptions to indicate special situtations instead of returning None. Expect the calling code to handle exceptions properly when they're documented.
# Item 15: Know How Closures Interact with Variable Scope
#     nonlocal global
# Item 16: Consider Generators Instead of Returning Lists
#     Using generators can be clearer than the alternative of returning lists of accumulated results
#     The iterator returned by a generator produces the set of values passed to yield expressions within the generator function's body
#     Generators can produce a sequence of outputs for arbitrarily large inputs because their working memory doesn't include all inputs and outputs
# Item 17: Be Defensive When Iterating Over Arguments
#     Beware of functions that iterate over input arguments multiple times. If these arguments are iterators, may see strange behavior and missing values
#     Python's iterator protocol defines how containers and iterators interact with the iter and next built-in functions, for loops, and related expressions
#     Can define own iterable container type by implementing the __iter__ method as a generator
#     Can detect that a value is an iterator (instead of container) if calling iter on it twice produces the same result, which can then be progressed with the next built-in function
# Item 18: Reduce Visual Noise with Variable Positional Arguments
#     Functions can accept a variable number of positional arguments by using *args in the def statement
#     You can use the items from a sequence as the positional arguments for a function with the * operator
#     Using * with a generator may cause the program to run out of memory. Variable arguments are always turned into a tuple before passing to the function
#     Adding new positional parameters to functions that accept *args can introduce hard-to-find bugs
# Item 19: Provide Optional Behavior with Keyword Arguments
#     Keywords make it clear what the purpose of each argument is
#     Keyword arguments with default values make it easy to add new behaviors to a function
# Item 20: Use None and Docstrings to Specify Dynamic Default Arguments
#     Default arguments are only evaluated once during function definition at module load time. This can cause odd behaviors for dynamic values like {} []
#     Use None as the default value for keyword arguments that have a dynamic value
# Item 21: Enforce Clarity with Keyword-Only Arguments
#     Keyword arguments make the intention of a function call more clear
#     Use keyword-only arguments to force callers to supply keyword arguments for potentially confusing functions

##### Chapter 3: Classes and Inheritance
# Item 22: Prefer Helper Classes Over Bookkeeping with Dictionaries and Tuples
#     Avoid making dictionaries with values that are other dictionaries or long tuples
#     Use namedtuple for lightweight, immutable data containers before you need the flexibility of a full class
#     Move bookkeeping code to use multiple helper classes when the state dictionaries get complicated
# Item 23: Accept Functions for Simple Interfaces Instead of Classes
#     References to functions and methods in Python are first class, meaning they can be used in expressions like any other type
#     __call__ special method enables instances of a class to be called like plain Python functions
class WithCall:
    def __call__(self):
        print('called like a function')
call = WithCall()
call()
# Item 24: Use @classmethod Polymorphism to Construct Objects Generically
#     Python only supports a single constructor per class, the __init__ method
#     @classmethod: when this method is called, pass the class as the first argument instead of the instance of that class.
#     @staticmethod: when this method is called, don't pass an instance of the class
#     Use @classmethod to define alternative constructors for your classes
#     Use class method polymorphism to provide generic ways to build and connect concrete subclasses
class ClassMethodDemo:
    @classmethod
    def create_object(cls):
        return 'something' # factory to return instance
print(ClassMethodDemo.create_object())
# Item 25: Initialize Parent Classes with super
#     Python's standard method resolution order (MRO) solves the problems of superclass initialization order and diamond inheritance
#     Always use the super built-in function to initialize parent classes
# Item 26: Use Multiple Inheritance Only for Mix-in Utility Classes
#     Avoid using multiple inheritance if mix-in classes can achieve the same outcome.
#     Use pluggable behaviors at the instance level to provide per-class customization when mix-in classes may require it
#     Compose mix-ins to create complex functionality from simple behaviors
# Item 27: Prefer Public Attributes Over Private Ones
#     Private attributes aren't rigorously enforced by the Python compiler
# Item 28: Inherit from collections.abc for Custom Container Types
#     Inherit directly form Python's container types (like list or dict) for simple use cases
#     Beware of the large number of methods required to implement custom container types correctly
#     Have the custom container types inherit from the interfaces defined in collections.abc to ensure that your classes match required interfaces and behaviors

##### Chapter 4: Metaclasses and Attributes
# Item 29: Use Plain Attributes Instead of Get and Set Methods
#     Define new class interfaces using simple public attributes, and avoid set and get method
#     Use @property to define special behavior when attributes are accessed on your objects, if necessary
#     Ensure @property methods are fast; do slow or complex work using normal methods
# Item 30: Consider @property Instead of Refactoring Attributes
#     Use @property to give existing instance attributes new functionality
class Student(object):
    @property
    def score(self):
        return self._score
    @score.setter
    def score(self, value):
        self._score = value
# Item 31: Use Descriptors for Reusable @property Methods
#     Reuse the behavior and validation of @property methods by defining your own descriptor classes
#     Use WeakKeyDictionary to ensure that your descriptor classes don't cause memory leaks
class Grade(object):
    def __init__(self): self._values = {}
    def __get__(self, instance, instance_type):
        if instance is None: return self
        return self._values.get(instance, 0)
    def __set__(self, instance, value): self._values[instance] = value
class Exam(object):
    math_grade = Grade()
    science_grade = Grade()
first_exam = Exam()
first_exam.match_grade = 100
# Item 32: Use __getattr__, __getattribute__, and __setattr__ for Lazy Attributes
#     __getattr__: Called when an attribute lookup has not found the attribute in the usual places. if the attribute is found through the normal mechanism, __getattr__() is not called
#     Use __getattr__ and __setattr__ to lazily load and save attributes for an object
#     Understand that __getattr__ only gets called once when accessing a missing attribute, whereas __getattribute__ gets called every time an attribute is accessed
#     Avoid infinite recursion in __getattribute__ and __setattr__ by using methods from super() to access instance attributes directly
# Item 33: Validate Subclasses with Metaclasses
class Meta(type):
    def __new__(meta, name, bases, class_dict):
        print('Meta checking', (meta, name, bases, class_dict))
        return type.__new__(meta, name, bases, class_dict)
class MyClass(object, metaclass=Meta):
    pass
MyClass()
#     Use metaclasses to ensure that subclasses are well formed at the time they are defined, before objects of their type are constructed
#     The __new__ method of metaclasses is run after the class statement's entire body has been processed
# Item 34: Register Class Existence with Metaclasses
#     Class registration is a helpful pattern for building modular Python programs
#     Metaclasses let you run registration code automatically each time your base class is subclassed in a program
#     Using metaclasses for class registration avoids errors by ensuring that you never miss a registration call
# Item 35: Annotate Class Attributes with Metaclasses
#     Metaclasses enable you to modify a class's attributes before the class is fully defined
#     Descriptors and metaclasses make a powerful combination for declarative behavior and runtime introspection

##### Chapter 5: Concurrency and Parallelism
# Item 36: Use subprocess to Manage Child Processes
#     Use subprocess module to run child processes and manage their input and output streams
# Item 37: Use Threads for Blocking I/O, Avoid for Parallelism
#     Python thread can't run bytecode in parallel on multiple CPU cores because of the global interpreter lock (GIL)
#     Python threads are still useful despite the GIL because they procide an easy way to do multiple things at seemingly the same time
#     Use Python threads to make multiple system calls in parallel. This allows you to do blocking I/O at the same time as computation
# Item 38: Use Lock to Prevent Data Races in Threads
#     There are data races between the threads in your program
#     Lock class in the threading built-in module is Python's standard mutual exclusion lock implementation
# Item 39: Use Queue to Coordinate Work Between Threads
#     Pipelines are a great way to organize sequences of work that run concurrently using multiple Python threads
#     Be aware of the many problems in building concurrent pipelines: busy waiting, stopping workers, and memory explosion
#     Queue class has all of the facilities you need to build robust pipelines: blocking operations, buffer sizes, and joining
# Item 40: Consider Coroutines to Run Many Functions Concurrently
#     Coroutines are computer-program components that generalize subroutines for non-preemptive multitasking, by allowing multiple entry points for suspending and resuming execution at certain locations.
#     Coroutines are similar to generators. Generator are data producers. Coroutines are data consumers
def grep(pattern):
    while True:
        line = (yield) # Pause 
        if pattern in line: 
            print(pattern + ' found')
it = grep('coroutine')
next(it) # initialization
it.send('Demo for coroutine') 
#     New way: asyncio module
# Item 41: Consider concurrent.futures for True Parallelism
#     Moving CPU bottlenecks to C extension modules can be an effective way to improve performance. Maybe complex
#     multiprocessing module provides powerful tools that can parallelize certain types of Python computation with minimal effort
#     See concurrent.futures built-in module and ProcessPoolExecutor class

##### Chapter 6: Built-in Modules
# Item 42: Define Function Decorators with functools.wraps
#     Decorators are Python syntax for allowing one function to modify another function at runtime
#     Using decorators can cause strange behaviors in tools that do introspection, such as debuggers
#     Use the wraps decorator from the functools built-in module when you define your own decorators to avoid issues
from functools import wraps
def trace(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        #print(func.__name__, args, kwargs, result)
        return result
    return wrapper
@trace
def fibo(n):
    if n in (0, 1):
        return n
    return (fibo(n - 2) + fibo(n - 1))
print('Fibonacci: ', fibo(4))
# Item 43: Consider contextlib and with Statements for Reusable try/finally Behavior
#     With statement in Python is used to indicate when code is running in a special context
#     contextlib built-in module provides a contextmanager decorator that makes it easy to use your own functions in with statements
from threading import Lock
lock = Lock()
with lock:
    print('with lock')
# same as below
lock.acquire()
try:
    print('try/finally way')
finally:
    lock.release()
# Item 44: Make pickle Reliable with copyreg
#     pickle built-in module is only useful for serializing and deserializing objects between trusted programs
#     pickle module may break down when used for more than trivial use cases
#     Use copyreg built-in module with pickle to add missing attribute values, allow versioning of classes, and provide stable import paths
# Item 45: Use datetime Instead of time for Local Clocks
#     Avoid using the time module for translating between different time zones
#     Use datetime built-in module with pytz module to reliably convert between times in different time zones
#     Always represent time in UTC and do conversions to local time as the final step before presentation
# Item 46: Use Built-in Algorithms and Data Structures
#     Use Python's built-in modules for algorithms and data structures. Don't reimplement
# Item 47: Use decimal When Precision Is Paramount
#     Python has built-in types and classes in modules that can represent practically every type of numerical value
#     Decimal class is ideal for situations that require high precision and exact rounding behavior, such as computations of monetary values.
# Item 48: Know Where to Find Community-Built Modules
#     Python Package Index (PyPI) contains a wealth of common packages that are built and maintained by the Python community
#     pip is the command-line tool to use for installing packages from PyPI

##### Chapter 7: Collaboration
# Item 49: Write Docstrings for Every Function, Class, and Module
# Item 50: Use Packages to Organize Modules and Provide Stable APIs
#     Simple packages are defined by adding an __init__.py file to a directory that contains other source files. These files become the child modules of the directory's package. Package directories may also contain other packages.
#     You can provide an explicit API for a module by listing its publicly visible names in its __all__ special attribute
#     Hide a package's internal implementation by only importing public names in the package's __init__.py file or by naming internal-only members with a leading underscore
# Item 51: Define a Root Exception to Insulate Callers from APIs
#     Defining your root exceptions for your modules allows API consumers to insulate themselves from your API
# Item 52: Know How to Break Circular Dependencies
#     Circular dependencies happen when two modules must call into each other at import time. They can cause your program to crash at startup
#     The best way to break a circular dependency is refactoring mutual dependencies into a separate module at the bottom of the dependency tree
#     Dynamic imports (import within a function or method) are the simplest solution for breaking a circular dependency between modules while minimizing refactoring and complexity
# Item 53: Use Virtual Environments for Isolated and Reproducible Dependencies
#     Virtual environments allow you to use pip to install many different versions of the same package on the same machine without conflicts
#     Virtual environments are created with pyvenv, enabled with source bin/activate, and disabled with deactivate

##### Chapter 8: Production
# Item 54: Consider Module-Scoped Code to Configure Deployment Environments
#     Programs often need to run in multiple deployment environments that each have unique assumptions and configurations
#     You can tailor a module's contents to different deployment environments by using normal Python statements in module scope
#     Module contents can be the product of any external condition, including host introspection through the sys and os modules
# Item 55: Use repr Strings for Debugging Output
#     Calling print on built-in Python types will produce the human-readable string version of a value, which hides type information
#     Calling repr on built-in Python types will produce the printable string version of a value. These repr strings can be passed to the eval built-in function to get back the original value
print('print("5"):', '5', ' print(repr("5")):', repr('5'))
#     %s in format strings will produce human-readable strings like str. %r will produce printable strings like repr
#     You can reach into any object's __dict__ attribute to view its internals
# Item 56: Test Everything with unittest
#     unittest built-in module provides facilities you'll need to write good tests
#     Define tests by subclassing TestCase and defining one method per behavior you'd like to test. 
# Item 57: Consider Interactive Debugging with pdb
#     You can initiate Python interactive debugger at a point of interest directly in your program with import pdb; pdb.set_trace() statements
# Item 58: Profile Before Optimizing
#     Python provides a built-in profiler for determing which parts of a program are responsible for its execution time. 
# Item 59: Use tracemalloc to Understand Memory Usage and Leaks
#     built-in modules: gc tracemalloc































