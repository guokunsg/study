package main

// No support for type inheritance, operator overloading, method overloading, pointer arithmetic, generic programming

import (
	"errors"
	"fmt"
	"math"
	"sync"
	"time"
)

// PI global constant varaibles
const PI = 3.1415926

func main() {
	dataTypes()

	var a, b int
	a, b = retMultiValues(a, b)
	fmt.Printf("Returns 2 value a=%d b=%d\n", a, b)

	arraySlice()
	mapAndRange()

	// Shape is an interface and Rectangle implements the function
	var shape Shape
	shape = Rectangle{width: 10, height: 5}
	fmt.Println("Area: ", shape.area())

	concurrentBasic()
	concurrentWithSelect()
}

func dataTypes() {
	var a uint32
	b := 42      // := is a dynamic type declaration
	var c = 20.0 // Type is float64
	fmt.Printf("a=%d type=%T\n", a, a)
	fmt.Printf("b=%d type=%T\n", b, b)
	fmt.Printf("c=%f type=%T\n", c, c)

	// Arrays
	var arr1 [3]int
	fmt.Printf("Array type: %T\n", arr1)
	var arr2 = [5]float32{1000.0, 2.0, 3.4, 7.0, 50.0} // Array with value initialization
	fmt.Printf("Array type: %T\n", arr2)
	var sum float64
	for i := 0; i < len(arr2); i++ {
		sum += float64(arr2[i]) // Cannot directly assign. Need to use type casting
	}
	fmt.Printf("Sum is %f\n", sum)

	// pointers
	var p1 *uint32
	p1 = &a
	fmt.Printf("Pointer type: %T value=0x%X\n", p1, p1)
	p1 = nil // NULL
}

// A function with parameters and 2 return values
func retMultiValues(a, b int) (int, int) {
	return a + 1, b + 1
}

// Book is a struct
type Book struct {
	title string
}

// Pass by reference
// Array is passed by reference
func printBook(book *Book) {
	fmt.Printf("Book title: %s\n", book.title)
	book.title = "book2" // Original book title is changed
}

// Pass by value
func printBookByValue(book Book) {
	fmt.Printf("Book title: %s\n", book.title)
	book.title = "book3" // Only local variable is changed
}

func arraySlice() {
	// Create array
	var numbers = make([]int, 5, 8)
	fmt.Printf("Slice len=%d cap=%d\n", len(numbers), cap(numbers))
	fmt.Println("numbers=", numbers)
	fmt.Println("numbers[2:4]=", numbers[2:4]) // Slice
	numbers = append(numbers, 1, 2, 3)
	fmt.Println("numbers=", numbers)
}

func mapAndRange() {
	var countryCapitalMap map[string]string     // map type
	countryCapitalMap = make(map[string]string) // Use make to create new instance
	countryCapitalMap = map[string]string{"France": "Paris", "Italy": "Rome", "Japan": "Tokyo"}
	for country := range countryCapitalMap {
		fmt.Println("Capital of", country, "is", countryCapitalMap[country])
	}
	delete(countryCapitalMap, "France") // Delete an entry
}

// Shape is an interface
type Shape interface {
	area() float64
}

// Rectangle is a struct
type Rectangle struct {
	width, height float64
}

// Implement the interface
func (rect Rectangle) area() float64 {
	return rect.width * rect.height
}

// Sqrt show Error handling. Return error in the last return value
func Sqrt(value float64) (float64, error) {
	if value < 0 {
		return 0, errors.New("Math: negative number passed to Sqrt")
	}
	return math.Sqrt(value), nil
}

func concurrentBasic() {
	// Create channel
	ch := make(chan string)
	// Create another thread
	go fmt.Println("Print something in another thread")
	go func() {
		fmt.Println("Print something again")
		ch <- "Hello!" // Write into channel
	}() // Anoymous function
	fmt.Println("Received:", <-ch) // Read from channel, blocked read
	close(ch)                      // Close the channel
	time.Sleep(time.Millisecond * 200)
}

func concurrentWithSelect() {
	people := []string{"Anna", "Bob", "Cody", "Dave", "Eva"}
	match := make(chan string, 1)
	wg := new(sync.WaitGroup)
	wg.Add(len(people))
	for _, name := range people { // _ ignores the index
		go Seek(name, match, wg)
	}
	wg.Wait()
	select {
	case name := <-match:
		fmt.Printf("No one received %s’s message.\n", name)
	default:

	}
}

// Seek no comment
func Seek(name string, match chan string, wg *sync.WaitGroup) {
	select {
	case peer := <-match:
		// Receive message from channel if there is
		fmt.Printf("%s sent a message to %s.\n", peer, name)
	case match <- name:
		// Send name as a message to the channel
	}
	wg.Done()
}
