# Looper, Handler, Message
* Looper:  
    Maintain a message queue, put Message in queue and dispatch Message in for loop
    ```
    public static final void prepare()
        ... sThreadLocal.set(new Looper(true)); // sThreadLocal is a ThreadLocal instance, put a Looper in
    private Looper(boolean quitAllowed) 
        mQueue = new MessageQueue(quitAllowed);  
        mRun = true;  
        mThread = Thread.currentThread();  
    public static void loop()
        MessageQueue queue = myLooper().mQueue;
        for (;;)
            Message msg = queue.next();
            msg.target.dispatchMessage(msg); // msg.target is a handler
            msg.recycle();
    ```
* Handler:  
    sendMessage put message in queue, handleMessage handles the message
    ```
    Handler(...)
        mLooper = Looper.myLooper(); // Require current thread calls Looper.prepare()
        mQueue = mLooper.mQueue;
    final boolean sendMessage(Message msg) // Will call sendMessageAtTime eventually
    boolean sendMessageAtTime(Message msg, long uptimeMillis)
        return enqueueMessage(queue, msg, uptimeMillis); 
    private boolean enqueueMessage(MessageQueue queue, Message msg, long uptimeMillis)
        msg.target = this;  
        if (mAsynchronous) msg.setAsynchronous(true);  
        return queue.enqueueMessage(msg, uptimeMillis); // Saved to message queue eventually
    void dispatchMessage(Message msg)
        if (msg.callback != null) // If message has own handler
            handleCallback(msg); return;
        if (mCallback != null && mCallback.handleMessage(msg)) 
            return;
        handleMessage(msg);  
    void handleMessage(android.os.Message msg) // User defined function
    boolean post(Runnable r) // Will put Runnable in msg.callback
    ```
* There are similar Looper, Handler, Message implementations in native code part, but not directly connected to Java part
* MessageQueue
    - Have native implementation. Queue is shared between native and java layer
    - Native layer can also write to MessageQueue and has a **higher** processing priority

# AsyncTask
* Constructor
    ```
    public AsyncTask()
        mWorker = new WorkerRunnable(Params, Result)() // Inner anonymous class
            @Override public Result call() 
                ... 
                Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);  
                Result result = doInBackground(mParams); // doInBackground
                Binder.flushPendingCommands();  
                return postResult(result);  
        mFuture = new FutureTask<Result>(mWorker) // Inner anonymous class
            @Override protected void done() 
                ... postResultIfNotInvoked(get());
    ```
* Execute
    ```
    public final AsyncTask<Params, Progress, Result> executeOnExecutor(Executor exec, Params... params)
        ... 
        mStatus = Status.RUNNING;
        onPreExecute();
        mWorker.mParams = params;
        exec.execute(mFuture);
        return this;  
    ``` 
* Executors
    * public static final Executor SERIAL_EXECUTOR = new SerialExecutor();  
    * private static volatile Executor sDefaultExecutor = SERIAL_EXECUTOR; 
    * public static final Executor THREAD_POOL_EXECUTOR;
* Serial executor implementation
    ```
    private static class SerialExecutor implements Executor // Serial executor 
        final ArrayDeque<Runnable> mTasks = new ArrayDeque<Runnable>();  
        Runnable mActive;  
        public synchronized void execute(final Runnable r)
            mTasks.offer(new Runnable()
                @Override public void run() {  
                    try { r.run(); } 
                    finally { scheduleNext(); }
            if (mActive == null)
                scheduleNext();  
        }  
        protected synchronized void scheduleNext() 
            if ((mActive = mTasks.poll()) != null) 
                THREAD_POOL_EXECUTOR.execute(mActive);  
    ```
* Thread pool executor implementation 
```
/** We want at least 2 threads and at most 4 threads in the core pool, preferring to have 1 less than the CPU count to avoid saturating the CPU with background work  */
private static final int CPU_COUNT = Runtime.getRuntime().availableProcessors();
/** Number of threads which are not recycled even if the thread is idled */
private static final int CORE_POOL_SIZE = Math.max(2, Math.min(CPU_COUNT - 1, 4)); 
/** Maximum number of threads */
private static final int MAXIMUM_POOL_SIZE = CPU_COUNT * 2 + 1;  
/** Time before non-core threads are released */
private static final int KEEP_ALIVE_SECONDS = 30; 
/** Factory for ThreadPoolExecutor to create new thread */
private static final ThreadFactory sThreadFactory = new ThreadFactory() 
    public Thread newThread(Runnable r)
        return new Thread(r, "AsyncTask #" + mCount.getAndIncrement());  
private static final BlockingQueue<Runnable> sPoolWorkQueue 
    = new LinkedBlockingQueue<Runnable>(128);  
public static final Executor THREAD_POOL_EXECUTOR; // Executes tasks in parallel. 
static // static initialization
    ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(  
            CORE_POOL_SIZE, MAXIMUM_POOL_SIZE, KEEP_ALIVE_SECONDS, 
            TimeUnit.SECONDS, sPoolWorkQueue, sThreadFactory);  
    threadPoolExecutor.allowCoreThreadTimeOut(true);  
    THREAD_POOL_EXECUTOR = threadPoolExecutor;  
```