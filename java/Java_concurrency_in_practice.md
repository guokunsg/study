# Java Concurrency In Practice
Notes for Java Concurrency In Practice

## Chapter 1: Introduction
### 1.1 Concurrency 
  * Threads are the easiest way to tap the computing power of multiprocessor systems
  * Processes could communicate with one another through a variety of coarse-grained communication mechanisms: sockets, signal handlers, shared memory, semaphores, and files
  * Threads share process-wide resources such as memory and file handles, but each thread has its own program counter, stack and local variables.  
  * Multiple threads within the same program can be scheduled simultaneously on multiple CPUs. 
### 1.2 Benefits of threads
1. Exploiting multiple processors
2. Simplicity of modeling
3. Simplified handling of asynchronous events
4. More responsive user interfaces
### 1.3 Risks of threads
1. Safety hazards  
    In the absence of synchronization, compiler, hardware and runtime are allowed to take substantial liberties with the timing and ordering of actions, such as caching variables in registers or processor-local caches where they are temporarily (or even permanently) invisible to other threads. 
2. Liveness hazards  
    A liveness failure occurs when an activity gets into a state such that it is permanently unable to make forward progress. 
3. Performance hazards  
    * Poor service time, responsiveness, throughput, resource consumption, or scalability. 
    * Context switches have significant costs: saving and restoring execution context, loss of locality, and CPU time spent scheduling threads instead of running them. 
### 1.4 Threads are everywhere
  * When JVM starts, it creates threads for JVM housekeeping tasks (garbage collection, finalization) and a main thread for running main method. 
  * Thread or thread pools to run timer, servlets, RMI, Swing, AWT

# Fundamentals
## Chapter 2: Thread safety
  * Writing thread-safe code is, at its core, about managing access to *state*, and in particular to *shared, mutable state*. 
  * If multiple threads access the same mutable state variable without appropriate synchronization, your program is broken. 3 ways to fix it: 
    * Don't share the state variable across threads
    * Make the state variable immutable
    * Use synchronization whenever accessing the state variable. 
  * It is far easier to design a class to be thread-safe than to retrofit it for thread-safety later. 
  * When designing thread safe classes, good object oriented techniques encapsulation, immutability, and clear specification of invariants are your best friends. 
  * First make your code right and then make it fast. 
### 2.1 What is thread safety?
  * A class is thread safe if it behaves correctly when accessed from multiple threads, regardless of the scheduling or interleaving of the execution of those threads by the runtime environment, and with no additional synchronization or other coordination on the part of the calling code. 
  * Thread safe classes encapsulate any needed synchronization so that clients need not provide their own. 
  * Stateless objects are always thread safe. 
### 2.2. Atomicity 
1. Race Condition
    * A race condition occurs when the correctness of a computation depends on the relative timing or interleaving of multiple threads by the runtime.
    * Most common type of race condition is *check-then-act*, when a potentially stale observation is used to make a decision on what to do next. 
2. Example: race condition in lazy initialization
3. Compound Actions
    * Operations A and B are atomic with respect to each other if, from the perspective of a thread executing A, when another thread executes B, either all of B has executed or none of it has. An atomic operation is one that is atomic with respect to all operations, including itself, that operate on the same state. 
    * Where practical, use existing thread safe objects, like AtomicLong, to manage your class's state. It is simpler to reason about the possible states and state transitions for existing thread safe objects than it is for arbitrary state variables, and this makes it easier to maintain and verify thread safety. 
### 2.3 Locking
  * To preserve state consistency, update related state variables in a single atomic operation. 
1. Intrinsic locks (or monitor locks): 
    * synchronized block
    * Intrinsic locks act as mutexes (or mutual exclusion locks), which means that at most one thread may own the lock. 
2. Reentrancy: 
    * Intrinsic locks are reentrant: if a thread tries to acquire a lock that it already holds, the request succeeds.
    * Reentrancy means that locks are acquired on a per-thread rather than per-invocation basis.
    * Implemented by associating with each block an acquisition count and an owning thread. When count is 0, block is unheld. Increase and decrease count when entering and leaving block. 
### 2.4 Guarding state with locks
  * For each mutable state variable that may be accessed by more than one thread, all accesses to that variable must be performed with the same lock held. In this case, we say that the variable is guarded by that lock. 
  * Acquiring the lock associated with an object does NOT prevent other threads from accessing that object - the only thing that acquiring a lock prevents any other thread from doing is acquiring that same lock. 
  * Every shared, mutable variable should be guarded by exactly one lock. Make it clear to maintainers which lock that is. 
  * For every invariant that involves more than one variable, all the variables involved in that invariant must be guarded by the same lock. 
### 2.5 Liveness and Performance 
  * There is frequently a tension between simplicity and performance. When implementing a synchronization policy, resist the temptation to prematurely sacrifice simplicity (potentially compromising safety) for the sake of performance. 
  * Avoid holding locks during lengthy computations or operations at risk of not completing quickly such as network or console I/O. 

## Chapter 3: Sharing Objects
### 3.1 Visibility
  * No guarantee that the reading thread will see a value written by another thread on a timely basis, or even at all 
  * Reordering: In the absence of synchronization, the compiler, processor, and runtime can do some downright weird things to the order in which operations appear to execute. Attempts to reason about the order in which memory actions "must" happen in insufficiently synchronized multithreaded programs will almost certainly be incorrect. 
1. Stale data: Out-of-date data
2. Non-atomic 64-bit operations
    * Java Memory Model requires fetch and store operations to be atomic, but for non-volatile long and double variables, JVM is permitted to treat a 64 bit read or write as two separate 32-bit operations. 
    * If the reads and writes occur in different threads, it is therefore possible to read a nonvolatile long and get back the high 32 bits of one value and the low 32 bits of another.
3. Locking and visibility
    * Locking is not just about mutual exclusion; it is also about memory visibility. To ensure that all threads see the most up-to-date values of shared mutable variables, the reading and writing threads must synchronize on a common lock. 
4. Volatile variables
    * When a field is declared volatile, the compiler and runtime are put on notice that this variable is shared and that operations on it should not be reordered with other memory operations. Volatile variables are not cached in registers or in caches where they are hidden from other processors, so a read of a volatile variable always returns the most recent write by any thread. 
    * Volatile variables is lighter-weight synchronization mechanism than synchronized. Writing a volatile variable is like exiting a synchronized block and reading a volatile is like entering a synchronized block. 
    * Do not recommend relying too heavily on volatile variables for visibility; code that relies on volatile variables for visibility or arbitrary state is more fragile and harder to understand than code that uses locking. 
    * Use volatile variables only when they simplify implementing and verifying your synchronization policy; avoid using volatile variables when verifying correctness would require subtle reasoning about visibility. Good uses of volatile variables include ensuring the visibility of their own state, that of the object they refer to, or indicating that an important lifecycle event (such as initialization or shutdown) has occurred. 
    * Not strong enough to make the increment operation (count++) atomic, unless you can guarantee that the variable is written only from a single thread. 
    * Locking can guarantee both visibility and atomicity; volatile variables can only guarantee visibility. 
    * You can use volatile variables only when all the following criteria are met: 
        * Writes to the variable do not depend on its current value, or you can ensure that only a single thread ever updates the value; 
        * The variable does not participate in invariants with other state variables; and 
        * Locking is not required for any other reason while the variable is being accessed. 
### 3.2 Publication and escape
  * Publishing an object means making it available to code outside of its current scope 
  * An object that is published when it should not have been is said to have escaped. 
  * Publishing one object may indirectly publish others.
    ```
        // Allowing Internal Mutable State to Escape. Don't Do this. 
        class UnsafeStates {
            private String[] states = new String[] { "AK", "AL" };
            public String[] getStates() { return states; }
        }
        // Implicitly Allowing this Reference to Escape. Don't Do this. 
        public class ThisEscape {
            public ThisEscape(EventSource source) { // Constructor
                source.registerListener(
                    // EventListener is published with implicitly publishing the enclosing ThisEscape instances, 
                    // because inner class instances contain a hidden reference to the enclosing instance. 
                    // Escaped when construction not finished
                    new EventListener() { ... };
            } 
        }
    ```
1. Safe construction practices
    * Do not allow this reference to escape during construction. 
    * A common mistake that can let this reference escape during construction is to start a thread from a constructor. 
        * Class is shared with the new thread, either explicitly (passing it) or implicitly (Thread or Runnable as an inner class)
        * There's nothing wrong with creating a thread in a constructor, but it is best not to start the thread immediately.  
        Instead, expose a start or initialize method that starts the owned thread. 
    * Can void the improper construction by using a private constructor and a public factory method 
    ```
        public class SafeListener {
            private final EventListener listener;
            private SafeListener() {
                listener = new EventListener() { ... }; 
            } 
            public static SafeListener newInstance(EventSource source) {
                SafeListener safe = new SafeListener();
                source.registerListener(safe.listener);
                return safe;
            } 
        } 
    ```
### 3.3 Thread confinement
  * Thread confinement to achieve thread safety: If data is only accessed from a single thread, no synchronization is needed. 
  * Sample usage: UI thread. JDBC thread pool
1. Ad-hoc thread confinement
    * Ad-hoc thread confinement describes when the responsibility for maintaining thread confinement falls entirely on the implementation.
    * Often implement a particular subsystem as a single-threaded subsystem. 
    * Volatile variables: Safe to perform read-modify-write operations on shared volatile variables as long as can ensure that the volatile variable is only written from a single thread. Confining the modification to a single thread to prevent race conditions.
2. Stack confinement
    * An object can only be reached through local variables .
    * Primitive local variables are always stack confined; there is no way to obtain a reference to a primitive variable
    * Maintaining stack confinement for object references requires to ensure that the referent does not escape. 
3. ThreadLocal
    * A more formal means of maintaining thread confinement is ThreadLocal, which allows to associate a per-thread value with a value-holding object. 
    * Thread-local variables are often used to prevent sharing in designs based on mutable Singletons or global variables; Can also used when a frequently used operation requires a temporary object such as a buffer and wants to avoid reallocating the temporary object on each invocation. 
    * Like global variables, thread local variables can detract from reusability and introduce hidden couplings among classes, and should therefore be used with care. 
### 3.4 Immutability
  * Immutable objects are always thread safe. 
  * An object is immutable if: 
    * Its state cannot be modified after construction;
    * All its fields are final; 
    * It is properly constructed (this reference does not escape during construction)
1. Final fields
    * A good practice to make all fields final unless they need to be mutable. 
2. Example: Using volatile to public immutable objects
    ```
        class Cache { 
            private final BigInteger someData; 
            Cache(BigInteger data) { someData = data; }
            BigInteger getData() { return someData; } 
        }
        private volatile Cache cache;
        BigInteger data = cache.getData();
        If (data == null) { // Get some data
            cache = new Cache(data);
        }
    ```
### 3.5 Safe publication
1. Improper publication: when good objects go bad
2. Immutable objects and initialization safety
    * Immutable objects can be used safely by any thread without additional synchronization, even when synchronization is not used to publish them. 
3. Safe publication idioms
    * To publish an object safely, both the reference to the object and the object's state must be made visible to other threads at the same time. A properly constructed object can be safely published by: 
        * Initializing an object reference from a static initializer; 
        * Storing a reference to it into a volatile field or AtomicReference; 
        * Storing a reference to it into a final field of a properly constructed object; or
        * Storing a reference to it into a field that is properly guarded by a lock. 
4. Effectively immutable objects
    * Objects that are not technically immutable, but whose state will not be modified after publication, are called effectively immutable.
    * Safely published effectively immutable objects can be used safely by any thread without additional synchronization. 
5. Mutable objects
    * The publication requirements for an object depend on its mutability: 
        * Immutable objects can be published through any mechanism; 
        * Effectively immutable objects must be safely published; 
        * Mutable objects must be safely published, and must be either thread safe or guarded by a lock. 
6. Sharing objects safely
    * The most useful policies for using and sharing objects in a concurrent program are: 
        * Thread confined. A thread confined object is owned exclusively by and confined to one thread, and can be modified by its owning thread.
        * Shared read only. A shared read only object can be accessed concurrently by multiple threads without additional synchronization, but cannot be modified by any thread. Shared read only objects include immutable and effectively immutable objects.
        * Shared thread safe. A thread safe object performs synchronization internally, so multiple threads can freely access it through its public interface without further synchronization.
        * Guarded. A guarded object can be accessed only with a specific lock held. Guarded objects include those that are encapsulated within other thread safe objects and published objects that are known to be guarded by a specific lock.

## Chapter 4: Composing objects
### 4.1 Designing a thread-safe class
  * The design process for a thread safe class should include these three basic elements: 
    * Identify the variables that form the object's state;
    * Identify the invariants that constrain the state variables; 
    * Establish a policy for managing concurrent access to the object's state. 
  * Synchronization policy defines how an object coordinates access to its state without violating its invariants or post conditions. It specifies what combination of immutability, thread confinement, and locking is used to maintain thread safety, and which variables are guarded by which locks. 
1. Gathering synchronization requirements
    * Thread safety cannot be ensured without understanding an object's invariants and post conditions. Constraints on the valid values or state transitions for state variables can create atomicity and encapsulation requirements. 
2. State-dependent operations
    * Operations with state based preconditions are called state dependent 
    * Concurrent programs add the possibility of waiting until the precondition becomes true, and then proceeding with the operation. 
3. State ownership
    * When defining which variables form an object's state, we want to consider only the data that object owns. Ownership is not embodied explicitly in the language, but is instead an element of class design. 
### 4.2 Instance confinement
  * Encapsulation simplifies making classes thread safe by promoting instance confinement, often just called confinement. 
  * Encapsulating data within an object confines access to the data to the object's methods, making it easier to ensure that the data is always accessed with the appropriate lock held. 
  * Confinement makes it easier to build thread safe classes because a class that confines its state can be analyzed for thread safety without having to examine the whole program. 
  * The Java monitor pattern  
    An object following the Java monitor pattern encapsulates all its mutable state and guards it with the object's own intrinsic lock. 
### 4.3 Delegating thread safety
1. Example: Vehicle tracker using delegation  
    Delegate thread-safety to a thread-safe class. 
2. Independent state variables  
    If a class is composed of multiple independent thread safe state variables and has no operations that have any invalid state transitions, then it can delegate thread safety to the underlying state variables. 
3. When delegation fails
    * If a class has compound actions, delegation alone is again not a suitable approach for thread safety. In these cases, the class must provide its own locking to ensure that compound actions are atomic, unless the entire compound action can also be delegated to the underlying state variables. 
    * Sample: Range: setLower(), setUpper(), lower must be < upper
4. Publishing underlying state variables
    * If a state variable is thread safe, does not participate in any invariants that constrain its value, and has no prohibited state transitions for any of its operations, then it can safely be published. 
### 4.4 Adding Functionality to Existing Thread safe Classes 
  * Reusing existing classes is often preferable to creating new ones. 
  * Another approach is to extend the class
  * Extension is more fragile than adding code directly to a class, because the implementation of the synchronization policy is now distributed over multiple, separately maintained source files. If the underlying class policy is changed, the subclass will break.
1. Client-side locking
    * A third strategy is to extend the functionality of the class without extending the class itself by placing extension code in a "helper" class. 
    * Client side locking is even more fragile because it entails putting locking code for class C into classes that are totally unrelated to C 
    ```
        @NotThreadSafe class ListHelper<E> {
            List<E> list = Collections.synchronizedList(new ArrayList<E>());
            // synchronized on wrong lock. Need to synchronize on list but no guarantee if list sync policy changed
            public synchronized void putIfAbsent(E x) { 
                if (! list.contains(x)) list.add(x);
            }
        }
    ```
2. Composition
    * A less fragile alternative for adding an atomic operation to an existing class
    * Use its own consistent locking that provides thread safety other than delegating to underlying object 
### 4.5 Document synchronization policies
  * Document a class's thread safety guarantees for its clients; document its synchronization policy for its maintainers. 
  * Each use of synchronized, volatile, or any thread-safe class reflects a synchronization policy defining a strategy for ensuring the integrity of data in the face of concurrent access. 

## Chapter 5: Building blocks
### 5.1 Synchronized blocks
1. Problem with synchronized collections
    * The synchronized collections are thread-safe but may sometimes need to use additional client-side locking to guard compound actions, as they may not behave as expected when other threads can concurrently modify the colleciton.  
2. Iterators and ConcurrentModificationException
    * Iterators returned by the synchronized collections are not designed to deal with concurrent modification, and they are fail-fast:
        * fail-fast: If they detect that the collection has changed since iteration began, they throw the unchecked ConcurrentModificationException. 
        * fast-fails are implemented by associating a modification count with the collection: 
            * If the modification count changes during iteration, hasNext or next throws ConcurrentModificationException. 
            * However, this check is done without synchronization, so there is a risk of seeing a stale value of the modification count and therefore that the iterator does not realize a modification has been made. 
            * This was a deliberate design tradeoff to reduce the performance impact of the concurrent modification detection code. 
    * An alternative to locking the collection during iteration is to clone the collection and iterate the copy instead. 
3. Hidden iterators
    * The greater the distance between the state and the synchronization that guards it, the more likely that someone will forget to use proper synchronization when accessing the state. 
    * Just as encapsulating an object's state makes it easier to preserve its invariants, encapsulating its synchronization makes it easier to enforce its synchronization policy. 
### 5.2 Concurrent collections
  * Synchronized collections achieve their thread safety by serializing all access to the collection's state. The cost of this approach is poor concurrency performance. 
  * Replacing synchronized collections with concurrent collections can offer dramatic scalability improvements with little risk. 
1. ConcurrentHashMap
    * Uses a finer-grained locking mechanism called lock striping to allow a greater degree of shared access. 
    * Provides iterators that do not throw ConcurrentModificationException, eliminating the need to lock the collection during iteration. 
        * Iterators returned by ConcurrentHashMap are weakly consistent: Can tolerate concurrent modification, traverses elements as they existed when the iterator was constructed and may (but not guaranteed to) reflect modifications to the collection after the construction of iterator. 
        * weakly consistent iterators: Collections which rely on CAS (compare-and-swap) have weakly consistent iterators, which reflect some but not necessarily all of the changes that have been made to their backing collection since they were created. For example, if elements in the collection have been modified or removed before the iterator reaches them, it definitely will reflect these changes, but no such guarantee is made for insertions. 
2. Additional atomic map operations
    * ConcurrentHashMap cannot be locked for exclusive access; cannot use client-side locking to create new atomic operations.
    * A number of common compound operations such as put-if-absent, remove-if-equal, and replace-if-equal are implemented. 
3. CopyOnWriteArrayList
    * Implement mutability by creating and republishing a new copy of the collection every time it is modified. 
    * The iterator returned by the copy-on-write collections return the elements exactly as they were at the time the iterator was created, regardless of subsequent modifications. 
    * Fail safe iterator iterator mechanism makes a copy of the internal Collection data structure and uses it to iterate over the elements. This prevents any concurrent modification exceptions from being thrown if the underlying data structure changes. Of course, the overhead of copying the entire array is introduced.
### 5.3 Blocking queues and the producer-consumer pattern
  * Blocking queues provide blocking put and take methods as well as the timed equivalents offer and poll. 
    * If the queue is full, put blocks until space becomes available; 
    * if the queue is empty, take blocks until an element is available. 
    * Queues can be bounded or unbounded; unbounded queues are never full, so a put on an unbounded queue never blocks. 
  * Blocking queues support the producer consumer design pattern. 
    * If the producers don't generate work fast enough to keep the consumers busy, the consumers just wait until more work is available. 
    * If the producers consistently generate work faster than the consumers can process it, eventually the application will run out of memory because work items will queue up without bound 
  * The producer consumer pattern also enables several performance benefits. Producers and consumers can execute concurrently; if one is I/O bound and the other is CPU bound, executing them concurrently yields better overall throughput than executing them sequentially. 
  * Bounded queues are a powerful resource management tool for building reliable applications: they make your program more robust to overload by throttling activities that threaten to produce more work than can be handled. 
  * BlockingQueue: LinkedBlockingQueue, ArrayBlockingQueue, PriorityBlockingQueue, SynchronousQueue 
1. Example: Desktop search
2. Serial thread confinement
    * For mutable objects, producer consumer designs and blocking queues facilitate serial thread confinement for handing off ownership of objects from producers to consumers. 
        * A thread confined object is owned exclusively by a single thread, but that ownership can be "transferred" by publishing it safely where only one other thread will gain access to it and ensuring that the publishing thread does not access it after the handoff. 
        * The safe publication ensures that the object's state is visible to the new owner, and since the original owner will not touch it again, it is now confined to the new thread. The new owner may modify it freely since it has exclusive access. 
3. Deques and work stealing
    * Deque and BlockingDeque: extend Queue and BlockingQueue 
    * A Deque is a double ended queue that allows efficient insertion and removal from both the head and the tail. Includes ArrayDeque, LinkedBlockingDeque 
    * Work stealing pattern: 
        * A producer consumer design has one shared work queue for all consumers; in a work stealing design, every consumer has its own deque. 
        * If a consumer exhausts the work in its own deque, it can steal work from the tail of someone else's deque. 
        * Work stealing can be more scalable than a traditional producer consumer design because workers don't contend for a shared work queue; most of the time they access only their own deque, reducing contention. When a worker has to access another's queue, it does so from the tail rather than the head, further reducing contention. 
    * Work stealing is well suited to problems in which consumers are also producers - when performing a unit of work is likely to result in the identification of more work. 
### 5.4 Blocking and interruptible methods
  * When your code calls a method that throws InterruptedException, then your method is a blocking method too, and must have a plan for responding to interruption. For library code, there are basically two choices: 
    * Propagate the InterruptedException to your caller
    * Restore the interrupt 
    ```
        try { processTask(queue.take());
        } catch (InterruptedException e) {
            // restore interrupted status
            Thread.currentThread().interrupt();
        } 
    ```
    * The only situation in which it is acceptable to swallow an interrupt is when you are extending Thread and therefore control all the code higher up on the call stack. 
### 5.5 Synchronizers
  * A synchronizer is any object that coordinates the control flow of the threads based on its state. 
  * Blocking queues can act as synchronizers; other types include semaphores, barriers, and latches. 
1. Latch
    * A latch is a synchronizer that can delay the progress of threads until it reaches its terminal state.
    * Latches can be used to ensure that certain activities do not proceed until other one-time activities complete, such as: 
        * Ensuring that a computation does not proceed until resources it needs have been initialized.
        * Ensuring that a service does not start until other services on which it depends have started.
        * Waiting until all the parties involved in an activity, for instance the players in a multi player game, are ready to proceed
    * Two common usages: Start gate and end gate
    ```
        final CountDownLatch startGate = new CountDownLatch(1);
        final CountDownLatch endGate = new CountDownLatch(nThreads);
        for (int i = 0; i < nThreads; i++) {
            Thread t = new Thread() {
                public void run() {
                    try {
                        startGate.await();
                        try {
                            task.run();
                        } finally {
                            endGate.countDown();
                        }
                    } catch (InterruptedException ignored) { }
                }
        }; 
        t.start(); 
        } 
        long start = System.nanoTime();
        startGate.countDown();
        endGate.await();
        long end = System.nanoTime();
        return end-start;
    ```
2. FutureTask
    * FutureTask implements Future, which describes an abstract result-bearing computation.
    * A computation represented by a FutureTask is implemented with a Callable, and can be in one of three states: Waiting to run, running, completed. 
    * get blocks until the task completes or throws an exception, or return result immediately if completed. 
3. Semaphores 
    * Counting semaphores are used to control the number of activities that can access a certain resource or perform a given action at the same time. 
    * Counting semaphores can be used to implement resource pools or to impose a bound on a collection 
    * A Semaphore manages a set of virtual permits; 
        * The initial number of permits is passed to the Semaphore constructor. 
        * Activities can acquire permits (as long as some remain) and release permits when they are done with them. 
        * If no permit is available, acquire blocks until one is (or until interrupted or the operation times out). 
        * The release method returns a permit to the semaphore. 
    * A degenerate case of a counting semaphore is a binary semaphore, a Semaphore with an initial count of one. 
    * A binary semaphore can be used as a mutex with non reentrant locking semantics; whoever holds the sole permit holds the mutex. 
4. Barriers
    * Barriers are similar to latches in that they block a group of threads until some event has occurred. 
        * The key difference is that with a barrier, all the threads must come together at a barrier point at the same time in order to proceed. 
        * Latches are for waiting for events; barriers are for waiting for other threads. 
    * CyclicBarrier 
        * Allows a fixed number of parties to rendezvous repeatedly at a barrier point and is useful in parallel iterative algorithms that break down a problem into a fixed number of independent sub-problems. 
        * Threads call await when they reach the barrier point, and await blocks until all the threads have reached the barrier point. 
            * If all threads meet at the barrier point, the barrier has been successfully passed, in which case all threads are released and the barrier is reset so it can be used again. 
            * If a call to await times out or a thread blocked in await is interrupted, then the barrier is considered broken and all outstanding calls to await terminate with BrokenBarrierException. 
            * If the barrier is successfully passed, await returns a unique arrival index for each thread, which can be used to "elect" a leader that takes some special action in the next iteration. 
        * CyclicBarrier also lets you pass a barrier action to the constructor; this is a Runnable that is executed (in one of the subtask threads) when the barrier is successfully passed but before the blocked threads are released. 
    * Exchanger
        * A two party barrier in which the parties exchange data at the barrier point.
        * Useful when the parties perform asymmetric activities, for example when one thread fills a buffer with data and the other thread consumes the data from the buffer; these threads could use an Exchanger to meet and exchange a full buffer for an empty one. When two threads exchange objects via an Exchanger, the exchange constitutes a safe publication of both objects to the other party. 
### 5.6. Building an Efficient, Scalable Result Cache 
  * A sample to build a cache for computation using concurrent collections
    ```
        class Memoizer<A, V> implements Computable<A, V> {
            private final ConcurrentMap<A, Future<V>> cache = new ConcurrentHashMap<A, Future(V)>();
            private final Computable(A, V) c = ...;
            public V compute(final A arg) throws InterruptedException {
                while (true) {
                    Future<V> f = cache.get(arg);
                    if (f == null) {
                        Callable<V> eval = new Callable<V>() {
                            public V call() throws InterruptedException {
                                return c.compute(arg); } }
                        FutureTask<V> ft = new FutureTask<V>(eval);
                        f = cache.putIfAbsent(arg, ft);
                        if (f == null) {
                            f = ft; ft.run(); } }
                    try { return f.get();
                    } catch (CancellationException e) { cache.remove(arg, f);
                    } catch (ExecutionException e) { throw launderThrowable(e.getCause()); }
                }
            } }
    ```
### Summary of Part I: Fundamentals
  * All concurrency issues boil down to coordinating access to mutable state. The less mutable state, the easier it is to ensure thread safety.
  * Make fields final unless they need to be mutable.
  * Immutable objects are automatically thread safe.  
    Immutable objects simplify concurrent programming tremendously. They are simpler and safer, and can be shared freely without locking or defensive copying.
  * Encapsulation makes it practical to manage the complexity.  
    * Encapsulating data within objects makes it easier to preserve their invariants
    * Encapsulating synchronization within objects makes it easier to comply with their synchronization policy
  * Guard each mutable variable with a lock.
  * Guard all variables in an invariant with the same lock.
  * Hold locks for the duration of compound actions.
  * A program that accesses a mutable variable from multiple threads without synchronization is a broken program.
  * Don't rely on clever reasoning about why you don't need to synchronize.
  * Include thread safety in the design processor explicitly document that your class is not thread safe.
  * Document your synchronization policy.

# Structuring concurrent applications
## Chapter 6: Task execution
### 6.1 Executing tasks in threads
1. Executing Tasks Sequentially  
   Poor performance
2. Explicitly Creating Threads for Tasks 
   Create a new thread for serving each request
3. Disadvantages of Unbounded Thread Creation
    * Thread lifecycle overhead: Creating a new thread consume computing resources
    * Resource consumption: Active threads consume system resources, especially memory.
    * Stability: There is a limit on how many threads can be created. 
  * Up to a certain point, More threads can improve throughput, but beyond that point creating more threads just slows down the application or crash the application. 
### 6.2. The Executor Framework 
  * Executor is based on the producer-consumer pattern, where activities that submit tasks are the producers (producing units of work to be done) and the threads that execute tasks are the consumers (consuming those units of work)
1. Example: Web server using Executor
2. Execution Policies 
    * In what thread will tasks be executed?
    * In what order should tasks be executed (FIFO, LIFO, priority order)?
    * How many tasks may execute concurrently?
    * How many tasks may be queued pending execution?
    * If a task has to be rejected because the system is overloaded, which task should be selected as the victim, and how should the application be notified?
    * What actions should be taken before or after executing a task?
3. Thread pools
    * A thread pool manages a homogeneous pool of worker threads. Tightly bound to a worker queue holding tasks waiting to be executed. 
    * newFixedThreadPool, newCachedThreadPool, newSingleThreadExecutor, newScheduledThreadPool
4. Executor Lifecycle  
    * ExecutorService interface extends Executor, adding a number of methods for lifecycle management (as well as some convenience methods for task submission).
        * Lifecycle implied by ExectorService has three states: running, shutting down, and terminated
        * It is common to follow shutdown immediately by awaitTermination, creating the effect of synchronously shutting down the ExecutorService.
5. Delayed and Periodic Tasks 
    * Timer facility manages the execution of deferred and periodic tasks. However, Timer has some drawbacks, and ScheduledThreadPoolExecutor should be thought of as its replacement. 
    * A Timer creates only a single thread for executing timer tasks. If a timer task takes too long to run, the timing accuracy of other TimerTasks can suffer. 
    * Another problem with Timer is that it behaves poorly if a TimerTask throws an unchecked exception which terminates the Timer thread. 
### 6.3. Finding Exploitable Parallelism 
1. Example: Sequential page renderer
2. Result-bearing Tasks: Callable and Future 
    * Runnable is a fairly limiting abstraction; run cannot return a value or throw checked exceptions
    * Callable is a better abstraction: it expects that the main entry point, call, will return a value and anticipates that it might throw an exception. 
    * The lifecycle of a task executed by an Executor has four phases: created, submitted, started and completed. 
    * Future represents the lifecycle of a task and provides methods to test whether the task has completed or been cancelled, retrieve its result, and cancel the task. 
3. Example: page renderer with Future
4. Limitations of parallelizing heterogeneous tasks 
    * Assigning a different type of task to each worker does not scale well
    * A further problem with dividing heterogeneous tasks among multiple workers is that the tasks may have disparate sizes. 
    * Dividing a task among multiple works always involves some amount of coordination overhead. 
    * The real performance payoff of dividing a program's workload into tasks comes when there are a large number of independent, homogeneous tasks that can be processed concurrently. 
5. CompletionService: Executor Meets BlockingQueue 
    * CompletionService combines the functionality of an Executor and a BlockingQueue. 
    * Submit Callable tasks for execution and use the queue-like methods take and poll to retrieve completed results, packaged as Futures when available. 
6. Example: Page renderer with CompletionService
7. Placing Time Limits on Tasks 
    * Primary challenge is making sure don't wait longer than the time budget.  
    Future.get() returns as soon as result is ready, but throws TimeoutException if the result is not ready within the timeout period
    * Secondary problem is to stop them when they run out of time
    Can be accomplished by having the task strictly manage its own time budget and abort if it runs out of time, or by cancelling the task if the timeout expires. If a timed get completes with a TimeoutException, cancel the task. 
8. Example: a travel reservations portal 

## Chapter 7: Cancellation and shutdown
  * Java does not provide any mechanism for safely forcing a thread to stop what it is doing. 
  * Instead it provides interruption, a cooperative mechanism that lets one thread ask another to stop what it is doing
### 7.1 Task cancellation
1. Interruption
    * One mechanism is setting a "cancellation requested" flag that the task checks periodically; if it finds the flag set, the task terminates early.      
        * However, if task that uses this approach calls a blocking method, the task might never check the cancellation flag and might never terminate. 
    * There is nothing in API or language specification that ties interruption to any specific cancellation semantics, but in practice, using interruption for anything but cancellation is fragile and difficult to sustain in larger applications
    * Each thread has a boolean interrupted status; interrupting a thread sets its interrupted status to true. 
    * Calling interrupt does not necessarily stop the target thread from doing what it is doing; it merely delivers the message that interruption has been requested
        * Interruption does not actually interrupt a running thread; it just requests that the thread interrupt itself at the next convenient opportunity. 
    * Interruption is usually the most sensible way to implement cancellation. 
    * If calling interrupted returns true, unless planning to swallow the interruption, should throw InterruptedException or restore the interrupted status by calling interrupt again. 
    * Thread.currentThread().interrupt();
2. Interruption policies
    * An interruption policy determines how a thread interprets an interruption request - what it does when one is detected, what units of work are considered atomic with respect to interruption, and how quickly it reacts to interruption. 
    * The most sensible interruption policy is some form of thread-level or service-level cancellation: Exit as quickly as practical, cleaning up if necessary, and possibly notifying some owning entity that the thread is exiting. May have other policies like pausing and resuming but many need to be restricted to tasks that are aware of the policy.  
    * Because each thread has its own interruption policy, you should not interrupt a thread unless you know what interruption means to that thread. 
    * A thread should be interrupted only by its owner.  
    Code that doesn't own the thread (for a thread pool, any code outside of the thread pool implementation) should be careful to preserve the interrupted status so that the owning code can eventually act on it. 
3. Responding to interruption
    * Two strategies: 
        * Propagate the exception (possibly after some task-specific cleanup), making your method an interruptible blocking method too. 
        * Restore the interruption status by interrupt again so that code higher up on the call stack can deal wit it. 
    * Only code that implements a thread’s interruption policy may swallow an interruption request. General-purpose task and library code should never swallow interruption requests.
4. Example: Timed run
5. Cancellation via Future
    * cancel(boolean mayInterruptIfRunning)
    * When Future.get throws InterruptedException or TimeoutException and you know that the result is no longer needed by the program, cancel the task with Future.cancel
6. Dealing with Non-interruptible blocking
    * Depends on the function implementation
    * Synchronous socket I/O in java.io: read and write methods in InputStream and OutputStream are not responsive to interruption, but closing the underlying socket makes any threads blocked in read or write throw a SocketException
    * Synchronous I/O in java.nio: Interrupting a thread waiting on an InterruptibleChannel causes it to throw ClosedByInterruptException and close the channel. Closing an InterruptibleChannel causes threads blocked on channel operations to throw AsynchronousCloseException. 
    * Asynchronous I/O with Selector: If a thread is blocked in Selector.select (in java.nio.channels), calling close or wakeup causes it to return prematurely
7. Encapsulating nonstandard cancellation with newTaskFor
    * newTaskFor hook is a factory method that creates the Future representing the task. It returns a RunnableFuture, an interface that extends both Future and Runnable. 
### 7.2 Stopping a thread-based service
  * Provide lifecycle methods whenever a thread-owning service has a lifetime longer than that of the method that created it.
1. Example: a logging service
2. ExecutorService shutdown
    * shutdown: slower but safer because the ExecutorService does not shut down until all queued tasks are processed. 
    * shutdownNow: faster but riskier because tasks may be interrupted in the middle of execution. Returns the list of tasks that had not yet started. 
3. Poison pills
    * Poison pills method: Place a recognizable object on the queue to mean “when get this, stop”
4. Example: a one-shot execution service
5. Limitations of ShutdownNow
    * No general way to find out which task started but did not complete. 
### 7.3 Handling abnormal thread termination
  * Use try-catch block to catch unchecked exceptions or within a try-finally block to ensure that if the thread exists abnormally the framework is informed of this and can take corrective action. 
1. UncaughtExceptionHandler
    * In long-running applications, always use uncaught exception handlers for all threads that at least log the exception. 
### 7.4 JVM shutdown
  * Orderly shutdown: initiated when the last normal thread terminates, someone calls System.exit, or by other platform-specific means (SIGINT, ctrl-c).
  * Abrupt: Calling Runtime.halt or killing the JVM process through the operating system (SIGKILL ...)
1. Shutdown hooks
    * Shutdown hooks are unstarted threads that are registered with Runtime.addShutdownHook.
    * In an orderly shutdown, JVM first starts all registered shutdown hooks. 
    * Application threads (daemon or non-daemon) still run at shutdown time concurrently with the shutdown process.
    * When all shutdown hooks completed, JVM may choose to run finalizers if runFinalizersOnExit is true and then halts.
    * JVM makes no attempt to stop or interrupt application threads that are still running at shutdown time; they are abruptly terminated when JVM halts. 
2. Daemon threads
    * Threads are divided into two types: Normal threads and daemon threads
    * When JVM starts up, all the threads it creates (such as GC and other housekeeping threads) are damon threads, except the main thread. When a new thread is created, it inherits the daemon status of the thread that created it, so by default any thread created by the main thread are also normal threads.
    * Normal threads and daemon threads differ only in what happens when they exit: 
        * When a thread exits, JVM performs an inventory of running threads, and if the only threads left are daemon threads, it initiates an orderly shutdown. 
        * When JVM halts, any remaining daemon threads are abandoned
    * Daemon threads are not a good substitute for properly managing the lifecycle of services within an application. In particular, it is dangerous to use daemon threads for tasks that might perform any sort of I/O. 
3. Finalizers
    * In most cases, the combination of finally blocks and explicit close methods does a better job of resource management than finalizers. 
    * Avoid finalizers

## Chapter 8: Applying thread pools
### 8.1 Implicit couplings between tasks and execution policies
  * Types of tasks that require specific execution policies:
    * Dependent tasks; Tasks that exploit thread confinement; Response-time-sensitive tasks; Tasks that use ThreadLocal
  * Thread pools work best when tasks are homogeneous and independent.
  * Tasks that depend on other tasks require that the thread pool be large enough that tasks are never queued or rejected.
  * Tasks that exploit thread confinement require sequential execution.
  * Document the requirements
1. Thread starvation deadlock
    * All threads are executing tasks that are blocked waiting for other tasks still on the work queue
    * Whenever submitting to an executor tasks that are not independent, be aware of the possibility of thread starvation deadlock, and document any pool sizing or configuration constraints in the code or configuration file where the executor is configured
    * There may also be implicit limits because of constraints on other resources, eg. JDBC connection pool with 10 connections and each tasks require a connection.
2. Long-running tasks
    * Thread pools can have responsiveness problems if tasks can block for extended periods of time, even if deadlock is not a possibility. 
    * One technique that can mitigate the ill effects of long-running tasks is for tasks to use timed resource waits instead of unbounded waits, eg wait with timeout.
### 8.2 Sizing thread pools
  * Thread pool sizes should be provided by a configuration mechanism or computed dynamically by consulting Runtime.availableProcessors
  * For compute-intensive tasks, an N processor system usually achieves optimum utilization with a thread pool of N + 1 threads. 
  * For tasks that also include I/O or other blocking operation, a larger pool may be wanted, since not all of the threads will be schedulable at all times. 
  * Other resources that can contribute to sizing constraints are memory, file handles, socket handles, and database connections, etc. 
### 8.3 Configuring ThreadPoolExecutor
1. Thread creation and teardown
    * The core pool size, maximum pool size, and keep-alive time govern thread creation and teardown. 
    * The core size is the target size; the implementation attempts to maintain the pool at this size even when there are no tasks to execute, and will not create more threads than this unless the work queue is full. 
    * Maximum pool size is the upper bound on how many pool threads can be active at once. 
    * A thread that has been idle for longer than the keep-alive time becomes a candidate for reaping and can be terminated if the current pool size exceeds the core size. 
2. Managing queued tasks
    * Unbounded thread creation could lead to instability. 
    * newCachedThreadPool factory is a good default choice for an executor, providing better queuing performance than a fixed thread pool. 
    * A fixed thread pool is a good choice when need to limit the number of concurrent tasks for resource-management purposes, as in a server application that accepts requests from network clients and would otherwise be vulnerable to overload.
3. Saturation policies
    * Saturation policy for a ThreadPoolExecutor can be modified by calling setRejectedExecutionHandler. 
    * Several RejectedExecutionHandler policies: 
        * Abort: default, causes execute to throw the unchecked RejectedExecutionException. 
        * Discard: Silently discard the newly submitted task if it cannot be queued for execution
        * Discard-oldest: Discard the task that would otherwise be executed next and tries to resubmit the new task. 
        * Caller-runs: Push some of the work back to the caller. It executes the newly submitted task not in a pool thread but in the thread that calls execute. 
4. Thread factories
    * Whenever a thread pool needs to create a thread, it does so through a thread factory. 
    * Default thread factory creates a new non-daemon thread with no special configuration. 
    * Specifying a thread factory allows you to customize the configuration of pool threads. 
5. Customizing ThreadPoolExecutor after construction
### 8.4 Extending ThreadPoolExecutor
  * beforeExecute, afterExecute and terminated can be used to extend the behavior of ThreadPoolExecutor
1. Example: adding statistics to a thread pool
### 8.5 Parallelizing recursive algorithms
  * Sequential loop iterations are suitable for parallelization when each iteration is independent of others and the work done in each iteration of the loop body is significant enough to offset the cost of managing a new task. 
1. Example: A puzzle framework

## Chapter 9: GUI Applications
### 9.1 Why are GUIs single threaded?
1. Sequential event processing
    * In the old days, GUI applications were single-threaded and GUI events were processed from a "main event loop".
    * Modern GUI frameworks use a model that is only slightly different: they create a dedicated event dispatch thread (EDT) for handing GUI events.
2. Thread confinement in Swing
    * Swing single-thread rule: Swing components and models should be created, modified and queried only from the event-dispatching thread
### 9.2 Short-running GUI tasks
    * Short-running tasks, the entire action can stay in the even thread. 
### 9.3 Long-running GUI tasks
  * For longer-running tasks, some of the processing should be offloaded to another thread. 
1. Cancellation
    * Can use Future for the background process
2. Progress and completion indication
    * FutureTask has a done hook that similarly facilitates completion notification. 
3. SwingWorker
### 9.4 Shared data models
1. Thread-safe data models
2. Split data models
    * The presentation model is confined to the event thread and the other model, shared model, is thread-safe and may be accessed by both the event thread and the application threads. 
        * Presentation model registers listeners with the shared model so it can be notified of updates. 
        * Presentation model can then be updated from the shared model by embedding a snapshot of the relevant state in the update message or by having the presentation model retrieve the data directly form the shared model when it receives an update event.
### 9.5 Other forms of single-threaded subsystem

# Liveness, Performance and Testing
## Chapter 10: Avoiding liveness hazards
### 10.1 Deadlock
  * When a thread holds a lock forever, other threads attempting to acquire that lock will block forever waiting. 
  * Database systems are designed to detect and recover from deadlock.  
    When database server detects that a set of transaction is deadlocked (which it does by searching the is-waiting-for graph for cycles), it picks a victim and aborts that transaction. 
  * JVM is not resolving deadlocks
1. Lock-ordering deadlocks
    * A program will be free of lock-ordering deadlocks if all threads acquire the locks they need in a fixed global order
2. Dynamic lock order deadlocks
    * Lock order depends on the order of arguments.  
      transfer(A, B) <=> transfer(B, A)
    * Must induce an ordering on the locks and acquire them according to the induced ordering consistently
        * One way to induce an ordering is to use System.identityHashCode, which returns the value that would be returned by Object.hashCode.  
          If object has unique, immutable and comparable key, it is easier to use the key for ordering. 
        ```
            int a_hash = System.identityHashCode(A);
            int b_hash = System.identityHashCode(B);
            if (a_hash < b_hash>) {
                synchronized(A_LOCK) { synchronized(B_LOCK) { ... }}
            } else if (a_hash > b_hash) {
                synchronized(B_LOCK) { synchronized(A_LOCK) { ... }}
            } else {
                synchronized(TIE_LOCK) { // Make sure only one thread is running the task when hashes are equal
                    synchronized(A_LOCK) { synchronized(B_LOCK) { ... }}
                }
            }
        ```
3. Deadlocks between cooperating objects  
    * Invoking an alien (external) method with a lock held is asking for liveness trouble. The alien method might acquire other locks (risking deadlock) or block for an unexpectedly long time, stalling other threads that need the lock you hold. 
    * Calling an alien method with a lock held is difficult to analyze and therefore risky. 
4. Open calls
    * Calling a method with no locks held is called an open call
    * Strive to use open calls throughout your program. Programs that rely on open calls are far easier to analyze for deadlock-freedom than those that allow calls to alien methods with locks held. 
    * In many cases, the loss of atomicity is acceptable.
    * In some cases, when loss of atomicity is a problem, need to use other techniques to achieve atomicity. One such technique is relying on constructing protocols on concurrent objects so that only one thread can execute the code path following the open call. 
5. Resource deadlocks
    * Threads waiting for resources that the other holds and will not release
    * Another form is thread-starvation deadlock. Tasks that wait for the results of other tasks are the primary source of thread-starvation deadlock.
### 10.2 Avoiding and diagnosing deadlocks
  * A program that never acquires more than one lock at a time cannot experience lock-ordering deadlock.
  * If must acquire multiple locks, lock ordering must be a part of the design: Try to minimize the number of potential locking interactions, and follow and document a lock-ordering protocol for locks that may be acquired together. 
1. Timed lock attempts
    * Explicit locks let you specify a timeout after which tryLock returns failure
2. Deadlock analysis with thread dumps
### 10.3 Other liveness hazards
1. Starvation
    * Starvation occurs when a thread is perpetually denied access to resources it needs in order to make progress; most commonly CPU cycles
    * Can be caused by inappropriate use of thread priorities, infinite loops or resources waits
    * Avoid the temptation to use thread priorities, since they increase platform dependence and can cause liveness problems. Most concurrent applications can use the default priority for all threads.
2. Poor responsiveness
3. Livelock
    * A thread, while not blocked, still cannot make progress because it keeps retrying an operation that will always fail. 
    * Often occurs in transactional messaging applications, where the messaging infrastructure rolls back a transaction if a message cannot be processed successfully and puts it back at the head of the queue. 
    * Can also occur when multiple cooperating threads change their state in response to the others in such a way that no thread can ever make progress.
    * The solution is to introduce some randomness into the retry mechanism. 

## Chapter 11: Performance and scalability
  * Safety always comes first before performance
### 11.1 Thinking about performance
  * Try to utilize the processing resources we have more effectively; and enable our program to exploit additional processing resources if they become available.
1. Performance versus scalability
    * Scalability describes the ability to improve throughput or capacity when additional computing resources (such as additional CPUs, memory, storage, or I/O bandwidth) are added. 
    * Turning for performance, the goal is usually to do the *same* work with *less* effort
    * Turning for scalability, the goal is instead trying to find ways to parallelize the problem to take advantage of additional processing resources to do *more* work with *more* resources.
    * Sometimes in order to achieve higher scalability or better hardware utilization, we often end up increasing the amount of work done to process each individual task, such as when deviding tasks into multiple pipelined subtasks. Many of the tricks that improve performance in single-threaded programs are bad for scalability. 
    * "how much" aspects - scalability, throughput and capacity - are usually of greater concern for server applications than "how fast" aspects. 
2. Evaluating performance tradeoffs
    * Most optimizations are premature: They are often undertaken before a clear set of requirements is available. 
    * Measure, don't guess
### 11.2 Amdahl's law
  * Amdahl's law describes how much a program can theoretically be sped up by additional computing resources, based on the proportion of parallelizable and serial components. 
  * Speedup <= 1 / F + ((1 - F) / N). F is the fraction of the calculation that must be executed serially, N is processors. 
  * All concurrent applications have some sources of serialization
1. Example: Serialization hidden in frameworks
2. Applying Amdahl's law qualitatively
### 11.3 Costs introduced by threads
1. Context switching
2. Memory synchronization
    * Uncontended synchronization happens when ownership gained strait away or already owned by the same thread
    * Contended synchronization means the thread will be blocked until owner thread release the monitor lock. 
    * Don't worry excessively about the cost of uncontended synchronization. The basic mechanism is already quite fast, and JVMs can perform additional optimizations that further reduce or eliminate the cost. Instead, focus optimization efforts on areas where lock contention actually occurs. 
3. Blocking
    * Uncontended synchronization can be handled entirely within JVM; contended synchronization may require OS activity which adds to the cost
    * JVM can implement blocking either via spin-waiting (repeatedly trying to acquire the lock until success) or by suspending the blocked thread through OS. 
    * Suspending causes two context switches: Blocked thread is switched out and back
### 11.4 Reducing lock contention
  * Serialization hurts scalability; context switches hurt performance; Contended locking causes both
  * The principal threat to scalability in concurrent applications is the exclusive resource lock
  * Ways to reduce lock contention
    * Reduce the duration for which locks are held
    * Reduce the frequency with which locks are requested
    * Replace exclusive locks with coordination mechanisms that permit greater concurrency. 
1. Narrowing lock scope ("Get in, get out")
    * Move code that doesn't require the lock out of synchronized blocks, especially for expensive operations and potentially blocking operations such as I/O.
2. Reducing lock granularity
    * Use separate locks to guard multiple independent state variables instead of a single lock.
3. Lock striping 
    * Lock splitting can sometimes be extended to partition locking on a variable-sized set of independent objects, called lock striping.  
      eg: ConcurrentHashMap uses an array of 16 locks, each guards 1/16 of the hash buckets.
    * One of the downsides of lock striping is that locking the collection for exclusive access is more difficult and costly than with a single lock.  
      eg: Need to lock the entire collection when ConcurrentHashMap expands.
4. Avoiding hot fields
    * Lock granularity cannot be reduced when there are variables that are required for every operation.  
      eg: size count in hashmap. ConcurrentHashMap adds the count of each segment and modCount in 2 iterations; if modCount changed (means the data has been changed when counting), use lock on all segments to do the counting. 
5. Alternatives to exclusive locks
    * Use more concurrency-friendly means of managing shared state, including using concurrent collections, read-write locks, immutable objects and atomic variables. 
    * ReadWriteLock (Chapter13) enforces a multiple-reader, single-writer locking discipline: more than one reader can access the shared resource concurrently so long as none of them wants to modify it, but writers must acquire the lock exclusively. 
    * Atomic (Chapter 15) variables offer a means of reducing the cost of updating "hot fields" such as statistics counters, sequence generators, or the reference to the first node in a linked data structure. 
6. Monitoring CPU utilization
7. Just say no to object pooling
    * Modern JVM allocates object fast
    * Allocating objects is usually cheaper than synchronizing
### 11.5 Example: Comparing Map performance
### 11.6 Reducing context switch overhead
    * Moving the I/O out of the request-processing thread is likely to shorten the mean service time for request processing. 
    * Example: logging. Put the message in a queue and write log in a dedicated thread. 

## Chapter 12: Testing concurrent programs
### 12.1 Testing for correctness
1. Basic unit tests
2. Testing blocking operations
    * Tests of essential concurrency properties require introducing more than one thread. 
    * Start a blocking activity in a separate thread, wait until the thread blocks, interrupt it and then assert that the blocking operation completed. 
    * The result of Thread.getState should NOT be used for concurrency control, and is of limited usefulness for testing - its primary utility is as a source of debugging information. 
3. Testing safety
    * The challenge to constructing effective safety tests for concurrent classes is identifying easily check properties that will, with high probability, fail if something goes wrong, while at the same time not letting the failure-auditing code limit concurrency artificially. It is best if checking the test property does not require any synchronization.  
      eg: Use check sum and random data to test a queue
    * Tests should be run on multiprocessor systems to increase the diversity of potential interleavings. However, having more than a few CPUs does not necessarily make tests more effective. To maximize the chance of detecting timing-sensitive data races, there should be more active threads than CPUs, so that at any given time some threads are running and some are switched out, thus reducing the predictability of interactions between threads. 
4. Testing resource management
    * Any object that holds or manages other objects should not continue to maintain references to those objects longer than necessary. 
5. Using callbacks
    * Callbacks to the client-provided code can be helpful in constructing test cases. 
6. Generating more interleavings
    * Many of the potential failures in concurrent code are low-probability events, testing for concurrency errors is a numbers game. 
    * A useful trick for increasing the number of interleavings is to use Thread.yield to encourage more context switches during operations that access shared state. 
### 12.2 Testing for performance
  * Performance can be measured in a number of ways: 
    * Throughput: The rate at which a set of concurrent tasks is completed
    * Responsiveness: The delay between a request for and completion of some action (also called latency)
    * Scalability: The improvement in throughtput (or lack) as more resources (usually CPU) are made available
  * Performance tests are often extended versions fo the functionality tests. 
  * Performance tests seek to measure end-to-end performance metrics for representative use cases; ideally, tests should reflect how the objects being tested are actually used in the application. 
  * A common secondary goal of performance testing is to select sizing empirically for various bounds - numbers of threads, buffer capacities, and so on. 
1. Example: Extending PutTakeTest to add timing
    * A more accurate measure is by timing the entire run and dividing by the number of operations to get a per-operation time. 
    * Run test for various combinations of parameters
2. Comparing multiple algorithms
3. Measuring responsiveness
### 12.3 Avoiding performance testing pitfalls
1. Garbage collection
    * Two strategies for preventing garbage collection from biasing the results
        * Ensure GC not run at all (invoke JVM with -verbose:gc)
        * Make sure GC runs a number of times during test run
        * Later one is often better - it is more likely to reflect real-world performance
2. Dynamic compilation
    * HotSpot JVM uses a combination of bytecode interpretation and dynamic compilation  
      When a class is first loaded, JVM executes it by interpreting the bytecode. At some point, if a method is run often enough, the dynamic compiler kicks in and converts it to machine code; when compilation completes, it switches from interpretation to direct execution
    * The timing tests should run only after all code has been compiled; there is no value in measuring the speed of the interpreted code since most programs run long enough that all frequently executed code paths are compiled. 
    * Run the program long enough
    * JVM has background threads for housekeeping tasks; it is a good idea to place explicit pauses between the measured trials to give JVM chance to catch up with background tasks.
3. Unrealistic sampling of code paths  
    JVM may optimize the code; so even if you want to measure only single-thread performance, tests of multithreaded performance should normally be mixed
4. Unrealistic degrees of contention  
    To obtain realistic results, concurrent performance tests should try to approximate the thread-local computation done by a typical application in addition to the concurrent coordination under study. 
5. Dead code elimination  
    * Writing effective performance tests requires tricking the optimizer into not optimizing away your benchmark as dead code. This requires every computed result to be used somehow by the program - in a way that does not require synchronization or substantial computation
    * A cheap trick for preventing a calculation from being optimized away without introducing too much overhead is to compute the hashCode and and compare it to an arbitrary value and print a useless message
### 12.4 Complementary testing approaches
1. Code review
2. Static analysis tools
3. Aspect-oriented testing techniques
4. Profilers and monitoring tools

# Advanced topics
## Chapter 13: Explicit locks
### 13.1 Lock and ReentrantLock
  * Intrinsic locking limitations: not possible to interrupt a thread waiting to acquire a lock, or to attempt to acquire a lock without being willing to wait forever; must be released in the same block of code in which they are acquired
1. Polled and timed lock acquisition
    * Timed and polled locking offer another option: probabalistic deadlock avoidance
    * Using timed or polled lock acquisition lets you regain control if you cannot acquire all the required locks, release the ones you did acquire and try again. 
2. Interruptible lock acquisition
    * Interruptible lock acquisition allows you try to acquire a lock while remaining responsive to interruption.
3. Non-block-structured locking
### 13.2 Performance considerations
  * Intrinsic lock is slower than ReentrantLock on Java 5, almost the same on Java 6+
  * Performance is a moving target; yesterdays' benchmark showing that X is faster than Y may already be out of date today.
### 13.3 Fairness
  * ReentrantLock constructor offers two fairness options: 
    * nonfair (default): Permits barging: Threads requesting a lock can jump ahead of the queue if the lock happens to be available when it is requested.
    * fair: Threads acquire a fair lock in the order in which they requested it
    * Fairness has a significant performance cost because of the overhead of suspending and resuming threads.
### 13.4 Choosing between synchronized and ReentrantLock
  * ReentrantLock is an advanced tool for situations where intrinsic locking is not practical. Use it if you need its advanced features: timed, polled, or interruptible lock acquisition, fair queueing, or non-block-structured locking. Otherwise prefer synchronized.
  * Future performance improvements are likely to favor synchronized over ReentrantLock, because synchronized is built into JVM
### 13.5 Read-write locks
  * A resource can be accessed by multiple readers or a single writer at a time, but not both
  ```
    public interface ReadWriteLock {
        Lock readLock();
        Lock writeLock();
    }
  ```
  * Implementation options: Release preference, Reader barging, Reentrancy, Downgrading, Upgrading
  * Read-write locks can improve concurrency when locks are typically held for a moderately long time and most operations do not modify the guarded resources.
  
## Chapter 14: Building custom synchronizers
### 14.1 Managing state dependence
  * State-dependent operations that block until the operation can proceed are more convenient and less error-prone than those that simply fail
1. Example: propagating precondition failure to callers
2. Example: crude blocking by polling and sleeping
3. Condition queues to rescue
    * A condition queue gives a group of threads a way to wait for a specific condition to become true. 
    * The elements of a condition queue are threads waiting for the condition.
    * Each object can act as a condition queue, and the wait(), notify() and notifyAll() in Object constitute the API for intrinsic condition queues. 
### 14.2 Using condition queues
    ```
        // condition predicate must be guarded by lock
        synchronized(lock) {
            while (! conditionPredicate()) {
                lock.wait();
            }
            // object is now in desired state
        }
        synchronized(lock) { ...  lock.notifyAll(); }
    ```
1. The condition predicate
    * The condition predicate is the precondition that makes an operation state-dependent in the first place. 
    * Document the condition predicate associated with a condition queue and the operations that wait on them. 
    * wait method releases the lock, blocks the current thread, and waits until the specified timeout expires, the thread is interrupted, or the thread is awakened by a notification. After the thread wakes up, wait reacquires the lock before returning. 
    * Every call to wait is implicitly associated with a specific condition predicate. When calling wait regarding a particular condition predicate, the caller must already hold the lock associated with the condition queue, and the lock must also guard the state variables from which the condition predicate is composed. 
2. Waking up too soon 
    * When using condition waits (Object.wait or Condition.wait):
        * Always have a condition predicate - some test of object state that must hold before proceeding
        * Always test the condition predicate before calling wait, and again after returning from wait
        * Always call wait in a loop
        * Ensure that the state variables making up the condition predicate are guarded by the lock associated with the condition queue
        * Hold the lock associated with the condition queue when calling wait, notify, or notifyAll
        * Do not release the lock after checking the condition predicate but before acting on it
3. Missed signals
    * A missed signal occurs when a thread must wait for a specific condition that is already true, but fails to check the condition predicate before waiting. 
4. Notification
    * Whenever you wait on a condition, make sure that someone will perform a notification whenever the condition predicate becomes true. 
    * The prevailing wisdom is to use notifyAll in preference to single notify. 
    * Single notify can be used instead of notifyAll only when both of the following conditions hold:
        * Uniform waiters: Only one condition predicate is associated with the condition queue, and each thread executes the same logic upon returning from wait
        * One-in, one-out: A notification on the condition variable enables at most one thread to proceed. 
    * notifyAll may be inefficient - all threads wake up and go back to sleep - a lot of context switches
    * Single notify and conditional notification are just optimizations - First make it right and then make if fast. 
5. Example: a gate class
6. Subclass safety issues
    * A state-dependent class should either fully expose (and document) its waiting and notification protocols to subclasses, or prevent subclasses form participating in them at all. 
7. Encapsulating condition queues
8. Entry and exit protocols
    * The entry protocol is the operation's condition predicate
    * The exit protocol involves examining any state variables that have been changed by the operation to see if they might have caused some other condition predicate to become true, and if so, notifying on the associated condition queue.
### 14.3 Explicit Condition objects
  * Intrinsic condition queues have several drawbacks:
    * Each intrinsic lock can have only one associated condition queue, which means multiple threads might wait on the same condition queue for different condition predicates, and the most common pattern for locking involves exposing the condition queue object. 
  * A Condition is associated with a single Lock, call Lock.newCondition on the associated lock to create it. 
  * Condition offers a richer feature set than intrinsic condition queues
  * Hazard warning: The equivalent of wait, notify and notifyAll for Condition objects are await, signal and signalAll. However, Condition extends Object, which means that it also has wait and notify methods. Be sure to use the proper versions - await and signal
### 14.4 Anatomy of a synchronizer
  * AbstractQueuedSynchronizer (AQS) is a framework for building locks and synchronizers
### 14.5 AbstractQueuedSynchronizer
  * The basic operations that an AQS-based synchronizer performs are some variants of acquire and release
  * It manages a single integer of state information that can be manipulated through the protected getState, setState and compareAndSetState methods.
1. Example: A simple latch
### 14.6 AQS in java.util.concurrent synchronizer classes
1. ReentrantLock
2. Semaphore and CountDownLatch
3. FutureTask
4. ReentrantReadWriteLock

## Chapter 15: Atomic variables and non-blocking synchronization
  * Non-blocking algorithms uses low-level atomic machine instructions such as compare-and-swap instead of locks to ensure data integrity under concurrent access. 
  * Non-blocking algorithms are considerably more complicated to design and implement than lock-based alternatives but they can offer significant scalability and liveness advantages. 
### 15.1 Disadvantages of locking
  * Locking is a heavyweight mechanism with hazards. 
### 15.2 Hardware support for concurrency
  * Exclusive locking is a pessimistic technique - it assumes the worst and doesn't proceed until can guarantee that other threads will not interfere
  * Optimistic approach: proceed with an update, hopeful that can complete without interference. 
1. Compare and swap
    * CAS has three operands: a memory location V on which to operate, the expected old value A and the new value B. 
        * CAS atomically updates V to the new value B but only if the value V matches the expected old value A; otherwise, do nothing
        * In either case, it returns the value currently in V
        * When multiple threads attempt to update the same variable simultaneously using CAS, one wins and updates the value and the rest lose. 
        * Losers are not punished by suspension; instead they can try again, take some other recovery action or do nothing. 
2. Example: A non-blocking counter
3. CAS support in JVM
### 15.3 Atomic variable classes
  * Atomic variables are finder-grained and lighter-weight than locks, and are critical for implementing high-performance concurrent code on multiprocessor systems. 
1. Atomics as "better volatiles"
2. Performance comparison: locks versus atomic variables
    * With low to moderate contention, atomics offer better scalability; with high contention, locks offer better contention avoidance. 
### 15.4 Non-blocking algorithms
  * The key to creating non-blocking algorithms is figuring out how to limit the scope of atomic changes to a *single* variable while maintaining data consistency. 
1. A non-blocking stack
    ```
        class ConcurrentStack<E> {
            AtomicReference<Node<E>> top = new AtomicReference<Node<E>>();
            void push(E item) {
                Node<E> newHead = new Node<E>(item); Node<E> oldHead;
                do { 
                    oldHead = top.get(); newHead.next = oldHead;
                } while (! top.compareAndSet(oldHead, newHead));
            } ... }
    ```
2. A non-blocking linked list
    ```
    class LinkedQueue<E> {
        static class Node<E> {
            E item;
            AtomicReference<Node<E>> next;
        }
        final Node<E> dummy = new Node<E>(null, null);
        final AtomicReference<Node<E>> head = new AtomicReference<Node<E>>(dummy);
        final AtomicReference<Node<E>> tail = new AtomicReference<Node<E>>(dummy);
        boolean put(E item) {
            Node<E> newNode = new Node<E>(item, null);
            while (true) {
                Node<E> curTail = tail.get(); Node<E> tailNext = curTail.next.get();
                if (curTail == tail.get()) {
                    if (tailNext != null) { // Check to see if the queue is in the intermediate state
                        // Some other thread already in the process of inserting element, help it by finishing the operation
                        tail.compareAndSet(curTail, tailNext); 
                    } else {
                        // Try inserting new node. May fail, try again in the next loop
                        if (curTail.next.compareAndSet(null, newNode)) {
                            tail.compareAndSet(curTail, newNode); // If failed, means some other thread already did it (5 lines above)
                            return true;
                        }
                    } } } } }
    ```
3. Atomic field updaters
    * AtomicReferenceFieldUpdater represent a reflection-based "view" of an existing *volatile* field so that CAS can be used on existing volatile fields. 
    * Eliminating the creation of AtomicReference for frequently allocated and short lived objects
4. ABA problem
    * Changing V from A to B and then back to A
    * A relatively simple solution: update a pair of values, a reference and a version number
    * AtomicStampedReference

## Chapter 16: The Java memory model
### 16.1 What is a memory model, and why would I want one? 
1. Platform memory models
2. Reordering
3. The Java Memory Model in 500 words or less
    * Java Memory Model is specified in terms of actions, which include reads and writes to variables, locks and unlocks of monitors, and starting and joining with threads. 
    * JMM defines a partial ordering called *happens-before* on all actions within the program. 
    * In the absence of a happen-before ordering between two operations, JVM is free to reorder them as it pleases. 
    * The rules for happens-before are: 
        * Program order rule: Each action in a thread happens-before every action in that thread that comes later in the program order
        * Monitor lock rule: An unlock on a monitor lock happens-before every subsequent lock on that same monitor lock
        * Volatile variable rule: A write to a volatile field happens-before every subsequent read of that same field
        * Thread start rule: A call to Thread.start on a thread happens-before every action in the started thread
        * Thread termination rule: Any action in a thread happens-before any other thread detects that thread has terminated, either by successfully return from Thread.join or by Thread.isAlive returning false
        * Interruption rule: A thread calling interrupt on another thread happens-before the interrupted thread detects the interrupt (either by having InterruptedException thrown or invoking isInterrupted or interrupted)
        * Finalizer rule: The end of a constructor for an object happens-before the start of the finalizer for that object
        * Transitivity: If A happens-before B, and B happens-before C, then A happens-before C. 
    * A data race occurs when a variable is read by more than one thread, and written by at least one thread, but the reads and writes are not ordered by happens-before.
    * Even though actions are only partially ordered, synchronization actions are totally ordered. 
    * A correctly synchronized program is one with no data races, and exhibits sequential consistency in a fixed global order. 
4. Piggybacking on synchronization
### 16.2 Publication
1. Unsafe publication
  * With the exception of immutable objects, it is not safe to use an object that has been initialized by another thread unless the publication happens-before the consuming thread uses it. 
2. Safe publication
3. Safe initialization idioms
4. Double checked locking
    * Unsafe. Don't do it
### 16.3 Initialization safety
  * Initialization safety guarantees that for properly constructed objects, all threads will see the correct values of *final* fields that were set by the constructor, regardless of how the object is published. 
  * Further, any variables that can be reached through a *final* field of a properly constructed object are also guaranteed to be visible to other threads. 
  * Initialization safety makes visibility guarantees only for the values that are reachable through *final* fields as of the time the constructor finishes.
  * For values reachable through non-final fields, or values that may change after construction, you must use synchronization to ensure visibility. 
