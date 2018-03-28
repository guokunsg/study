#!/usr/bin/env python3

# ** operator for power
print( "** means power. 5**2=", 5 ** 2 )

# raw string
print(r"r before a string means to use the raw string\t\n")

# Use """ for Multi-line string. \ means to ignore new line
print("""Mulitline string
line2\
 still the same line\
""")

# * operator to repeat strings
print("Can use * to repeat strings. 3 * 'OK' =", 3 * "OK")
print("String format {0}, {A}, {B}".format("First", A="AAAA", B="BBBB"))

# Use [] to Access characters in string. Can be negative to access last 
WORD="PYTHON"
print("WORD =", WORD)
print("WORD[0] =", WORD[0], "WORD[-1] =", WORD[-1])
print("WORD[0:2] =", WORD[0:2], "WORD[-3:-1] =", WORD[-3:-1], "last 3: WORD[-3:] =", WORD[-3:])
# Strings are immutable, cannot be modified with []

# List
numbers = [1, 2, 3, 4, 5]
print("\nList\nnumbers=", numbers)
print("numbers+[6, 7, 8] =", numbers + [6, 7, 8])
# Append list
numbers.append(6)
print("numbers.append(6) =", numbers) # Same as numbers=numbers+[6] but more efficient
# Use slice to remove
numbers[-1:] = []
print("numbers[-1:]=[] =", numbers)
print("len(numbers) =", len(numbers))
print("Tuple:", (1, 2, 3, 4, 5))
print("set:", {1, 2, 2, 1})
print("Dictionary:", {'a':"A", 'b':"B", 'c':"C"})
print("Dictionary with dict:", dict(a="A", b="B"))
# List Comprehensions
print("List Comprehensions:", [(x, y) for x in [1,2,3] for y in [3,1,4] if x != y])

print("\nControl flows")
# If
if len(numbers) < 5:
    print("Length < 5")
elif len(numbers) == 5:
    print("Length is 5")
else:
    print("Length > 5")
# For
total = 0
for n in numbers:
    total += n
print("Sum is", total)
# Object returned by range is not a list
print("list(range(5, 10)) =", list(range(5, 10)))
# Code to find prime numbers
print("Code to find prime numbers. Note the break and else use with the for loop")
def findPrimes(start, end): 
    for n in range(start, end):
        for x in range(2, n):
            if n % x == 0:
                print(n, 'equals', x, '*', n//x)
                break # Break the loop, else will not be executed
        else: # This else is with for. 
            # executed when the loop terminates through exhaustion of the list (with for) or 
            # when the condition becomes false (with while), 
            # but not when the loop is terminated by a break statement.
            print(n, 'is a prime number')
findPrimes(2, 10)
def emptyFunc():
    pass # Use pass to define empty functions or body
# function with default value
# Warning: default value is evaluated only once. If it is mutable and modified, next time the value will be incorrect
# Can have multiple default values, and call with isOk(text, param2="") to set value with param2 only
def isOk(text, message="Invalid option", param2=""):
    if text in ('y', 'yes'):
        return True
    if text in ('n', 'no'):
        return False
    raise ValueError(message)
# Arbitrary Argument Lists
def arbitraryArguments(*param1, **param2):
    print("Arbitrary Argument Param1 =", param1)
    print("Arbitrary Argument Param2 =", param2)
arbitraryArguments('a', 'b', 'c', a='a', b='b')
def funcDoc():
    """Function documentation
    Function documentation line2"""
    pass
print(funcDoc.__doc__)
# Lambda
pairs = [(1, 'one'), (2, 'two'), (3, 'three'), (4, 'four')]
pairs.sort(key=lambda pair: pair[1]) # Use second element to sort
print(pairs)

# Error handling
try:
    a = 10 / 0
except ZeroDivisionError as err:
    print("Expected error: A value divided by 0!", err)
else: # Always execute if there is no exception
    pass
finally: # Always execute whether there is exception or not
    pass

# Use with to open file
try:
    with open("test", "r") as f:
        for line in f:
            print(line)
except FileNotFoundError:
    print("Expected error as trying to read a non-existed file")

# Scope and namespaces
print("\nScope and namespaces")
def scope_test():
    def do_local():
        spam = "local spam"
    def do_nonlocal():
        nonlocal spam
        spam = "nonlocal spam"
    def do_global():
        global spam
        spam = "global spam"

    spam = "test spam"
    do_local()
    print("After local assignment:", spam)
    do_nonlocal()
    print("After nonlocal assignment:", spam)
    do_global()
    print("After global assignment:", spam)
scope_test()
print("In global scope:", spam)

# Class
class SampleClass:
    """A simple sample class"""
    shared_data = [] # Shared data among all the instances
    def __init__(self, name):
        print("SimpleClass Constructor")
        self.name = name
        # no private attribute, but name with _ prefix should be treated as private
    def toString(self):
        return "SampleClass"
# Inherintance
class InheritedClass(SampleClass):
    # All methods in Python are effectively virtual functions
    def toString(self):
        return "InheritedClass"
obj = InheritedClass("A")
print("isinstance:", isinstance(obj, SampleClass))
print("bool is a subclass of int:", issubclass(bool, int))
print("toString", obj.toString())
print("toString", SampleClass.toString(obj))

# Generator
def reverse(data):
    for index in range(len(data)-1, -1, -1):
        yield data[index]
print("Generator expression:", sum(i*i for i in range(10)))
