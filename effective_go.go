/*
Reading notes for effective go: https://golang.org/doc/effective_go.html
*/
package main

import (
	"net/http"
	"os"
)

// Indentation: use tabs instead of spaces
// gofmt: command to format code
// godoc: Extract comments to generate docs

// Semicolons: Go uses semicolons to terminate statements, but those semicolons do not appear in the source code
//     if condition { // { is mandatory and must be on the same line!
// Loop: No while, only for
//     for init; condition; post {}
//     for condition {}
//     for {} // like C for (;;)
//     for key, value := range aMap { } // range clause to loop through array, map, slice
//     for _, value := range array {} // Only get the second item
// Switch:
//     case '0' <= c && c <= '9': // Can use condition
//     case ' ', '?', '&': // Can use comma-seperated list
//     can use switch to discover types
// break: Supports break with a label. continue accepts label for loops

// Multiple return values
// Return value can have a name: (int, nextPos int). nextPos can be used a variable
func nextInt(b []byte, i int) (int, int) {
	x := int(b[i])
	return x, i
}

// defer schedules a function call to be run immediately before the function executing the defer returns (function ends)
// defer functions are execute in LIFO order
func readFile(filename string) (string, error) {
	f, err := os.Open(filename)
	defer f.Close() // f.Close will run when we finished
	// ... read the content
	return "", err
}

// new: Allocate and zeros the memory
// composition-literal: File(fd, name)
//     It is fine to return address of a local variable: return &File(fd: fd, name: name)
var p *[]int = new([]int) // allocate slice structure; *p = nil
var v = make([]int, 100)  // v referes to a new array of 100 ints

// arrays:
//      arrays are values. Assigning one array to another copies all the elements
//      If pass an array to a function, it will receive a copy of the array, not a pointer
//      The size of an array is part of its type. [10]int and [20]int are distinct
//      Array can be passed as a pointer for efficiency
// slice: array[start:end]
//      slice holds references to an underlying array.
//      If a function takes a slicing argument, changes it makes to the element will be visible to the caller.
//      len(slice) to get the length, cap(slice) to get capacity
// map: key can be of any type for which the equality operator is defined
//      slices cannot be used as map keys
//      maps hold references to an underlying data strucutre.
//      value, exist = map[key]: Can use two variables to get the value and check the existence
// append: func append(slice []T, elements ...T) []T
//      sample: x := []int{1,2,3}    x = append(x, 4, 5, 6)
//      x := []int{1,2,3}  y := []int{4,5,6} x=append(x, y...) // Note ...

// enum constants type
type ByteSize float64

// enum constants
const (
	_           = iota             // Ignore first value
	KB ByteSize = 1 << (10 * iota) // 1024 1 << (10 * 1)
	MB                             // 1 << (10 * 2)
)

// Variables
var (
	home   = os.Getenv("HOME")
	user   = os.Getenv("USER")
	gopath = os.Getenv("GOPATH")
)

// init function: each source file can define its own init function to setup whatever state is required. (Can have multiple)
func init() {

}

type ByteSlice []byte

// value methods can be invoked on pointers and values, but pointer methods can only be invoked on pointers
// When the value is addressable, the language invokes a pointer method on a value by inserting the address operator, b.Write changes to (&b).Write
func (slice ByteSlice) Append(data []byte) []byte {
	// Do append and need to return
	return nil
}
func (p *ByteSlice) Append2(data []byte) {
	// Change the pointer reference directly
}

// type switch: value.(typeName)
// _: blank identifier. Can be assigned or declared with any value of any type, with the value discarded harmlessly
//     Useful for ignoring some value in multiple assignement, remove warning on unused imports and variables, import package for only its side effects
//     Interface checks: if _, ok := val.(json.Marshaler); ok {

// Embedding: embedding types within a struct or interface
//     type ReadWriter interface { Reader, Writer } // Interface can only embed interfaces, a union of functions

// Share by communicating:
//     Do not communicate by sharing memory; instead, share memory by communicating
// goroutines: it is a function executing concurrently with other goroutines in the same address space
//     Prefix a function or method call with the go keyword to run the call in a new goroutine
// channels: allocated with make: ch := make(chan int)
var sem = make(chan int, 100)

func Serve(queue chan *http.Request) {
	// Loop variable is reused for each iteration, req is shared across all goroutines.
	// So need to pass it as parameter or declare another local instance
	for req := range queue {
		// An alternative way is to create new instance of req for goroutine
		// req := req // Can use the same name
		sem <- 1
		go func(req *http.Request) {
			//process(req)
			<-sem
		}(req) //
	}
}

func main() {

}
