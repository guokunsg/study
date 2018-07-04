package com.gt.gtweather

fun variableAndType() {
    var int1 = 1; // Mutable variable
    val int2 = 2; // Immutable variable

    val str1 = "Test\n"; // Escaped string
    val str2 = """
        Test
    """.trimIndent(); // Raw string with """
    // Can use str[index] to access the character
    val str3 = "str1 value is $str1 length is ${str1.length}"; // String template
    // Use structural equality (==) to compare value. Use referential equality (===) to compare address

    val val1 : Long = int1.toLong(); // No support for implicit conversion. Must use toXXX
}

fun operatorAndControl() {
    val int1 = 1;
    val int2 = 2;
    // No bitwise operator. Use function shl(bits): signed shift left; shr(bits): signed shift right;
    // ushr(bits: unsigned shift right; and(bits): bitwise and; or(bits); xor(bits); inv(): bitwise inverse
    val val2 = int1.shl(2); // signed shift left
    // TODO: Check inv() bitwise inverse

    // Standard input and output: readline() print() println()

    // If else with a return value
    val result = if (int1 > int2) "$int1 is greater than $int2" else "$int1 is smaller than $int2"

    // when is like switch
    val val3 = when(val2) {
        1, 2, 3 -> "1 or 2 or 3"; // Multiple constants
        in 6..10 -> "6 to 10"; // Range
        else -> "default";
    }

    val array1 = arrayOf(1, 2, 3, 4, 5);
    for (i in array1); // Like foreach
    for (i in array1.indices) // With index
        print("array[$i]" + array1[i]);

    for (i in 1..5); // Range; for(i in 5..1) does nothing
    for (i in 0..array1.size - 1); // range index
    for (i in 0 until array1.size - 1);
    for (i in 5 downTo 1 step 2); // 5, 3, 1

    // while, do-while same as java
    // Support break, continue, return
    loop@ for (i in 1..5) // Labeled break
        for (j in 1..3) {
            if (i == 2)
                break@loop;
            if (i == 3)
                continue@loop;
        }
}


fun main(args: Array<String>) {

}

// Tail Recursion: a recursion which performs the calculation first, then makes the recursive call
// The recursive call must be the last call of the method. To avoid StackOverflowError for normal recursion
tailrec fun factorial(n: Int): Long {
    return if (n == 1) {
        1
    } else {
        factorial(n-1)
    }
}

// Function supports default arguments and named arguments

// Lambda syntax: { variable -> body_of_function}
val lamAdd : (Int, Int) -> Int = { a: Int, b: Int -> a + b };

// Higher order function: a function which accepts function as parameter or returns a function or can do both
fun func1(a: Int, b: Int, fn: (Int, Int) -> Int): Unit {
    fn(a, b);
}

// inline functions
// Non local control flow: If fn1 contains return, inlineFunc will exit. fn2 will not execute
// fn2 use crossinline to forbid the return
inline fun inlineFunc(fn1: ()-> Unit, crossinline fn2: () -> Unit) {
    fn1(); fn2();
}

// Kotlin does not support checked exception

fun nullSafety() {
    var str4: String? = null; // Nullable variable is declared with ?=
    // Use is !is to check type, eg: str4 !is String
    var str5: String? = str4 as String; // Unsafe cast operator: as Throws exception if cannot cast
    var str6: String? = str4 as? String; // Safe cast operator: as? Returns null if cannot cast
    val len1: Int = str6?.length ?: -1; // Elvis operator: ?: Same as val len1: Int = if (str6 != null) str6.length else -1
    val str7 = str6 ?: return; // If null return
}

fun arrayAndCollections() {
    val array1 = arrayOf(1, 2, 3, 4, 5); // Arrays are created using library function arrayOf or Array()
    val array2 = Array(5, {i -> i * 2}); // 1st is size, 2nd is the function to initialize the array
    // Array can be created using arrayOf(), intArrayOf(), charArrayOf(), booleanArrayOf(), longArrayOf(), shortArrayOf(), byteArrayOf()
    val array3 = Array<Int>(5){0}; // Create an array with size 5 and all elements set to 0

    // Immutable collections:
    // List: listOf(), listOf<T>()      Map: mapOf()        Set: setOf()
    // Mutable collections:
    // List: ArrayList<T>(), arrayListOf(), mutableListOf()
    // Map: HashMap, hashMapOf(), mutableMapOf()        Set: hashSetOf(), mutableSetOf()
}

// All Kotlin classes have a common superclass "Any".
// open means inheritable. By default, not inheritable
open class BaseClass {
    var VAR1 = 1; // Public by default
    private var VAR2 = 2; // Private to BaseClass
    protected open var VAR3 = 3; // Visible to Base and Derived class
    internal var VAR4 = 4; // Visible inside the same module
    protected var VAR5 = 5; // Protected and cannot inherit

    open fun funA() : Double {
        return 0.0;
    }
}
// Abstract class
abstract class AbsClass {
    abstract fun funB();
}

interface AInterface {
    val id: Int; // Abstract property
    var idStr: String;
    fun IFunc(); // Abstract method
    fun funOptional() { // Can have optional body
        idStr = "";
    }
}

// Class with primary constructor, inherit BaseClass, implement AInterface
class OuterClass(name: String, override var idStr: String) : BaseClass(), AInterface {
    val name: String; // Public by default
    override var VAR3 = 10; // Override the protected types
    // override var VAR5 = 10;
    internal var state = null; // internal modifier makes the field visible only inside the module in which it is implemented.
    override val id = 1; // Implement interface property

    // companion is like static in java. object like anonymous class
    companion object { };

    init {
        // Primary constructor initialization
        this.name = name;
    }

    // Secondary constructor. Must call primary constructor. Can call other secondary or super class constructor
    constructor(name: String, id: Int) : this(name, "") {
    }
    // Override function in BaseClass
    override fun funA() : Double {
        return 0.0;
    }
    // Implement function in AInterface
    override fun IFunc() {
    }
    override fun funOptional() {
        super<AInterface>.funOptional(); // Can specify which function in interface to call for multiple interface
    }

    // Nested class is static by default
    class NestedClass {}
    // Inner class is able to access private data in OuterClass
    inner class InnerClass {}
}

// Extension function: a facility to "add" methods to class without inheriting a class or using any type of design pattern.
fun OuterClass.funExtended() {

}

// Data class cannot be abstract, inner, open or sealed. Contain primary constructor with at least one parameter all marked as val or var
// == calls equals; copy() to return a copy
data class User(var name: String, val id: Int);

// sealed restricts the class hierarchy
// Sealed class is used when the object have one of the types from limited set, but cannot have any other type.
// The constructors of sealed classes are private in default and cannot be allowed as non-private.
sealed class Expr;
data class Const(val number: Double) : Expr()
data class Sum(val e1: Expr, val e2: Expr) : Expr()
object NotANumber : Expr()
fun eval(expr: Expr): Double = when(expr) {
    is Const -> expr.number
    is Sum -> eval(expr.e1) + eval(expr.e2)
    NotANumber -> Double.NaN
    // Else is not required as all cases are covered
}

// Generic
class Person<T>(private val age: T){ }
var ageInt: Person<Int> = Person<Int>(30)
var ageString: Person<String> = Person<String>("40")






















