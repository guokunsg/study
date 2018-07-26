# Notes for https://developer.android.com/guide/

# Process and activity state
```
Process state                               Activity state
Foreground (having or about to get focus) 	Created/Started/Resumed
Background (lost focus) 	                Paused
Background (not visible) 	                Stopped
(Empty) 	                                Destroyed
```

# Handle Activity State Changes 
* When a configuration change occurs, the activity is destroyed and recreated
    - onPause(), onStop(), and onDestroy() => onCreate(), onStart(), and onResume()
* Multi-window cases
    - only the one with which the user is interacting is in the foreground and has focus
    - topmost is the only activity in the RESUMED state. All other visible activities are STARTED but are not RESUMED
    - When the user switches from app A to app B, the system calls onPause() on app A, and onResume() on app B
* User taps Back button: 
    - onPause(), onStop(), and onDestroy(), but onSaveInstanceState() callback does not fire

# Tasks and Back Stack 
* Activities in the stack are never rearranged, only pushed and popped from the stack—pushed onto the stack
* "launchMode" in manifest 
    * standard: Default. 
        - Creates a new instance in the task from which it was started and routes the intent to it.
        - Can be instantiated multiple times, each instance can belong to different tasks, and one task can have multiple instances.
    * singleTop: 
        - If an instance already exists at the top of the current task, the system routes the intent to that instance through a call to its onNewIntent() method, rather than creating a new instance of the activity. 
        - Can be instantiated multiple times, each instance can belong to different tasks, and one task can have multiple instances (but only if the activity at the top of the back stack is not an existing instance of the activity).  
        - When an existing instance of an activity handles a new intent, the user cannot press the Back button to return to the state of the activity before the new intent arrived in onNewIntent().  
        eg: ABCD -(start D)-> ABCD -(start B)-> ABCDB
    * singleTask:
        - The system creates a new task and instantiates the activity at the root of the new task
        If an instance already exists in a separate task, the system routes the intent to the existing instance through a call to its onNewIntent() method, rather than creating a new instance. 
        - Only one instance of the activity can exist at a time. 
        - Back button still returns the user to the previous activity.
    * singleInstance: 
        - Same as "singleTask", except that the system doesn't launch any other activities into the task holding the instance. 
        - The activity is always the single and only member of its task; any activities started by this one open in a separate task.
* Back button always takes the user to the previous activity except singleTask
    - for singleTask, if an instance of that activity exists in a background task, that whole task is brought to the foreground  
        eg: [Act1 Act2] -(start B)-> [ActA ActB] -(back)-> [ActA] -(back)-> [Act1 Act2]
* Intent Flags: 
    - Flags included with the intent that start the activity can override launchMode in manifest
    - FLAG_ACTIVITY_NEW_TASK: singleTask
    - FLAG_ACTIVITY_SINGLE_TOP: singleTop
    - FLAG_ACTIVITY_CLEAR_TOP: No equivalent in launchMode
        - If the activity being started is already running in the current task, then instead of launching a new instance, all other activities on top of it are destroyed and this intent is delivered to the resumed instance of the activity (now on top), through onNewIntent()). 
        - Often used with NEW_TASK, a way of locating an existing activity in another task and putting it can respond to the intent.
    - FLAG_ACTIVITY_RESET_TASK_IF_NEEDED:
        - If set, and this activity is either being started in a new task or bringing to the top an existing task, then it will be launched as the front door of the task. 
        - This will result in the application of any affinities needed to have that task in the proper state (either moving activities to or from it), or simply resetting that task to its initial state if needed. 
        - Launcher will set this; Recents will not
* Affinities: 
    - indicates which task an activity prefers to belong to.
    - By default, all the activities from the same app have an affinity for each other, but can modify the default affinity for an activity.
    - Activities defined in different apps can share an affinity, or activities defined in the same app can be assigned different task affinities.
    - Can re-parent by setting allowTaskReparenting to "true"
* Clearing the back stack
    - If the user leaves a task for a long time, the system clears the task of all activities except the root activity. When the user returns to the task again, only the root activity is restored
    - alwaysRetainTaskState: retains all activities in its stack even after a long period
    - clearTaskOnLaunch: the stack is cleared down to the root activity whenever the user leaves the task and returns to it
    - finishOnTaskLaunch: like clearTaskOnLaunch, but it operates on a single activity, not an entire task
* Starting a task
    ```
    <intent-filter ... >
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    ```
* Recents
    - Using the Intent flag to add a task: FLAG_ACTIVITY_NEW_DOCUMENT FLAG_ACTIVITY_MULTIPLE_TASK FLAG_ACTIVITY_RETAIN_IN_RECENTS
    - Using the activity attribute to add a task: android:documentLaunchMode: intoExisting, always, none, never. Remove: android:excludeFromRecents 
    - ActivityManager.AppTask allows you to manage your own application's tasks
* App Shortcuts 
    - Android >= 7.1 (API level 25), can define shortcuts to specific actions in your app. These shortcuts can be displayed in a supported launcher.
    - Each shortcut references one or more intents, each of which launches a specific action in your app 
    - Static shortcuts are defined in a resource file that is packaged into an APK.
    - Dynamic shortcuts are published at runtime using the ShortcutManager API.
    - Pinned shortcuts are published at runtime and also use the ShortcutManager API. Appears in supported launchers only if the user accepts the pinning request. 

# Processes and Application Lifecycle 
* A common misuse of BroadcastReceiver: 
    - Starts a thread when it receives an Intent in its BroadcastReceiver.onReceive() method, and then returns from the function. Once it returns, the system considers the BroadcastReceiver to be no longer active, and thus, may kill the process
    - The solution is typically to schedule a JobService from the BroadcastReceiver, so the system knows that there is active work being done.
* Foreground process is one that is required for what the user is currently doing.
    - Only killed as a last resort if the memory is so low that not even these processes can continue to run.  
    eg: Running an activity at the top of the screen, BroadcastReceiver.onReceive() executing, Service callback functions executing. 
* Visible process is doing work that the user is currently aware of
    - Will not be killed unless doing so is required to keep all foreground processes running  
    eg. Running an activity that is visible to the user on-screen but not in the foreground, Service.startForeground, system required service
* Service process is one holding a Service that has been started with the startService(). May do things users care about.
    - Will keep such processes running unless there is not enough memory to retain all foreground and visible processes.
    - Services running for a long time (> 30 mins) may be demoted in importance to allow their process to drop the the cached LRU list.
* Cached process is one that is not currently needed, so the system is free to kill it as desired when memory is needed elsewhere.
    - Often hold one or more activity instances that are not currently visible to user. 
    - pseudo-LRU list with other policies trying to keep more useful processes. 

# Deep Links & App Links
* Deep links are URLs that take users directly to specific content in your app. 
  - By adding intent filters and extracting data from incoming intents to drive users to the right activity
* Android App Links on Android 6.0 (API level 23) and higher allow an app to designate itself as the default handler of a given type of link
  - https://developer.android.com/training/app-links/ 
  - https://developer.android.com/topic/google-play-instant/
  - Steps: 1. Create deep links to specific content in your app 2. Add verification for your deep links

# Loaders
* Loaders have been deprecated as of Android P (API 28). 
    - Recommend to use a combination of ViewModels and LiveData.
* run on separate threads; callback methods when events occur; persist and cache results across configuration changes to prevent duplicate queries; observer to monitor for changes
* getSupportLoaderManager().initLoader(id, bundle, LoaderCallbacks);  
  LoaderCallbacks: public Loader<Cursor> onCreateLoader(int id, Bundle args) 

# Intents and Intent Filters 
* Starting an activity, Starting a service, Delivering a broadcast
* Explicit intents specify which application will satisfy the intent, by supplying either the target app's package name or a fully-qualified component class name. 
* Implicit intents do not name a specific component, but instead declare a general action to perform, which allows a component from another app to handle it. 
* PendingIntent object is a wrapper around an Intent object. The primary purpose is to grant permission to a foreign application to use the contained Intent as if it were executed from your app's own process.

# Notifications
https://developer.android.com/guide/topics/ui/notifiers/notifications
* Heads-up notification: Beginning with Android 5.0, notifications can briefly appear in a floating window called a heads-up notification
* Lock screen: Beginning with Android 5.0, notifications can appear on the lock screen.
* App icon badge: In supported launchers on devices running Android 8.0 (API level 26) and higher, app icons indicate new notifications with a colored "badge" on the corresponding app launcher icon.
* Notification anatomy: Small icon, app name, timestamp, large icon, title, text
* Other features: notification actions; Expandable notification; Notification updates and groups
* Notification channels: 
    - Starting in Android 8.0 (API level 26), all notifications must be assigned to a channel or it will not appear.
    - On devices running Android 7.1 (API level 25) and lower, users can manage notifications on a per-app basis only.
* Notification importance:
    - On Android 8.0 (API level 26) and above, importance of a notification is determined by the importance of the channel the notification was posted to.
    - On Android 7.1 (API level 25) and below, importance of each notification is determined by the notification's priority.
* Do Not Disturb mode: Starting in Android 5.0 (API level 21); Total silence, Alarms only, Priority only
    - On Android 8.0 (API level 26) and above, users can additionally allow notifications on a channel-by-channel basis
* Foreground services: A notification is required when your app is running a "foreground service" 
    - a Service running in the background that's long living and noticeable to the user, such as a media player.
* Posting limits: Beginning with Android 8.1 (API level 27), apps cannot make a notification sound more than once per second. 
* Notification compatibility: support library notification API: NotificationCompat NotificationManagerCompat

# Copy and paste
* Data types: Text, Uri, Intent
* ClipboardManager, ClipData, ClipData.Item, and ClipDescription; multiple items
* Drag and drop: View.OnDragListener() https://developer.android.com/guide/topics/ui/drag-drop

# Create backward-compatible UIs 
* Abstract the new APIs; Proxy to the new APIs; Create an implementation with older APIs; Use the version-aware component

# Background tasks
* ThreadPools: 
    - For work that should only be done when your app is in the foreground, use ThreadPools.
* Foreground services: 
    - For work that must execute to completion, if you need the work to execute immediately, use a foreground service.
    - tells the system that the app is doing something important and they shouldn’t be killed; visible to user via a non-dismissible notification
* WorkManager: 
    - For work that must execute to completion and is deferrable, use WorkManager. 
    - gracefully runs deferrable background work when the work's triggers (like appropriate network state and battery conditions) are satisfied.
* Restrictions:
    - Android 6.0 (API level 23) introduced Doze mode and app standby.
    - Android 7.0 (API level 24) limited implicit broadcasts and introduced Doze-on-the-Go
    - Android 8.0 (API level 26) further limited background behavior, such as getting location in the background and releasing cached wakelocks.
    - WorkManager is designed to give the best possible behavior under these restrictions.
* Schedule jobs intelligently: 
    - JobScheduler (Android > 5.0); AlarmManager; Firebase JobDispatcher (Similar to JobScheduler); SyncAdapter; Services
* Services:
    - Foreground: 
        - A foreground service performs some operation that is noticeable to the user.
    - Background: 
        - A background service performs an operation that isn't directly noticed by the user.
    - Bound: 
        - A service is bound when an application component binds to it by calling bindService(). 
    - A service runs in the main thread; should create a new thread within the service to complete that work
    - For security, always use an explicit intent when starting a Service and don't declare intent filters for your services.
    - Private service: android:exported = false
    - IntentService: 
        - a subclass of Service that uses a worker thread to handle all of the start requests, one at a time.
        - Creates a default worker thread; Creates a work queue that passes one intent at a time to your onHandleIntent() implementation;
        - Stops the service after all of the start requests are handled; onBind() returns null; onStartCommand() sends the intent to the work queue and then to your onHandleIntent() implementation.
    - A started service must manage its own lifecycle. System doesn't stop or destroy the service unless it must recover system memory
    - The service must stop itself by calling stopSelf(), or another component can stop it by calling stopService()
    - Bound service: 
        - bind to it by calling bindService(); 
        - Run in foreground: startForeground(ONGOING_NOTIFICATION_ID, notification);
    - startService() -> onCreate() -> onStartCommand() -> (Running) -> onDestroy() -> (down)
    - bindService() -> onCreate() -> onBind() -> client.unbindService() -> onUnbind() -> onDestroy() -> (down)
    - Report work status: Binder; broadcast
    - Using Messenger for bindService:
        - Service implements a Handler that receives a callback for each call from a client.
        - Service uses the Handler to create a Messenger object (which is a reference to the Handler).
        - Messenger creates an IBinder that the service returns to clients from onBind().
        - Clients use the IBinder to instantiate the Messenger (that references the service's Handler), and sends Message objects to the service.
        - The service receives each Message in its Handler—specifically, in the handleMessage() method.
    - AIDL: 
        - Only necessary if you allow clients from different applications to access service for IPC and want to handle multithreading in the service. 
        - If no need to perform concurrent IPC across different applications, use own defined Binder or Messenger.
        - Calls made from the local process are executed in the same thread that is making the call
        - Calls from a remote process are dispatched from a thread pool the platform maintains inside of your own process. Must be thread-safe
        oneway keyword: a remote call does not block; it simply sends the transaction data and immediately returns.
        - Implementation: 
            1. create .aidl interface 2. Create Stub class implementing the interface 3. Returns Stub class in onBind()
    - Optimizations:
        - Apps targeting > Android 7.0 do not receive CONNECTIVITY_ACTION broadcasts if registered in the manifest. Still receive CONNECTIVITY_ACTION broadcasts if registered BroadcastReceiver with Context.registerReceiver() and that context is still valid. 
        - Use JobSchedular
            ```
            JobScheduler js = (JobScheduler) context.getSystemService(Context.JOB_SCHEDULER_SERVICE);
            JobInfo job = new JobInfo.Builder(MY_BACKGROUND_JOB, new ComponentName(context, MyJobService.class))
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_UNMETERED).setRequiresCharging(true).build();
            js.schedule(job);
            ```
        - For Android > 7.0, apps cannot send or receive ACTION_NEW_PICTURE or ACTION_NEW_VIDEO broadcasts

# Broadcasts
* Manifest-declared receivers: 
    - If targeting API > 26, cannot use the manifest to receive implicit broadcasts, except for a few exempted
    - https://developer.android.com/guide/components/broadcast-exceptions
    - In most cases, you can use scheduled jobs instead.
* Context-registered receivers
* Consider as foreground process when executing; once returns from onReceive(), not active, may be killed
    - Can use goAsync for asynchronous:  
    final PendingResult pendingResult = goAsync(); pendingResult.finish(); 
    - Or schedule a job with JobScheduler
* Use LocalBroadcastManager if no need to send broadcasts to components outside of the app
* Do not broadcast sensitive information using an implicit intent:  
    Set permission; Specify the package setPackage(String); Use local broadcast
* Do not start Activity for bad user experience; Consider using notification

# Keep the device awake 
* Keep the screen on: android:keepScreenOn="true" in layout; getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
* Keep the CPU on: WAKE_LOCK
* Use WakefulBroadcastReceiver to keep awake

# Best practices for unique identifiers 
https://developer.android.com/training/articles/user-data-ids

# Gestures
* GestureDetectorCompat ScaleGestureDetector MotionEventCompat

#  Processes and threads 
* By default, all components of the same application run in the same process and most applications should not change this. 
* activity service receiver provider
    - supports an android:process attribute that can specify a process in which that component should run.
* Can also set android:process so that components of different applications run in the same process
    - provided that the applications share the same Linux user ID and are signed with the same certificates.
* Do not include explicit references to UI objects in threaded work tasks to avoid memory leaks and threading contention
* Implement references (anonymous inner class) may delay the destruction of Activity until the worker thread completes, and pressures memory  
    Use static AsyncTask
* Doze: 
    - deferring background CPU and network activity for apps when the device is unused for long periods of time
    - App Standby defers background network activity for apps with which the user has not recently interacted
    - Periodically, the system exits Doze for a brief time to let apps complete their deferred activities. 
    - During this maintenance window, the system runs all pending syncs, jobs, and alarms, and lets apps access the network. 
    - Doze restrictions: Network access is suspended; ignores wake locks; Alarms are deferred; No WiFi scan; No SyncAdapter, JobScheduler run
    - setAndAllowWhileIdle() and setExactAndAllowWhileIdle() set alarms which fires even the device is in Doze (at most once in 9 mins)
    - Consider Firebase Cloud Messaging (FCM)

# Performance tips
* Avoid creating unnecessary objects
* Prefer static over virtual
* Use static final for constants
* Use enhanced for loop syntax: ArrayList counted loop is faster; Otherwise for each is faster
* Consider package instead of private access with private inner classes  
    VM may generate extra static functions to let inner class accessing private data
* Avoid using floating point. Prefer double. No speed difference. Only space difference
* Use native methods carefully: Cost in transition and JIT cannot optimize

#  App security best practices 
* Use implicit intents and non-exported content providers 
* Apply signature-based permissions: check that the apps accessing the data are signed using the same signing key
    ```
    <permission android:name="my_custom_permission_name" android:protectionLevel="signature" />
    ```
* Disallow access to your app's content providers: android:exported="false"
* Add a network security configuration: android:networkSecurityConfig="@xml/network_security_config"
* Create your own trust manager
* Use WebView objects carefully: Don't use javascript
* Use HTML message channels instead of evaluateJavascript(): myWebView.createWebMessageChannel()
* Provide the right permissions
    - Use intents to defer permissions: eg, direct user to Contact app instead of asking for contact permission
    - Share data securely across apps: 
        - Enforce read-only or write-only permissions as needed
        - Use "content://" not "file://"; 
        - Provide clients one-time access to data by using the FLAG_GRANT_READ_URI_PERMISSION and FLAG_GRANT_WRITE_URI_PERMISSION flags. 

# Android keystore system 
* Extraction prevention: 
    - Key material never enters the application process
    - Key material may be bound to the secure hardware  
        KeyInfo.isInsideSecurityHardware()
* Key use authorizations: specify authorized uses of their keys when generating or importing the keys
* Use the KeyChain API when you want system-wide credentials.
* Use the Android Keystore provider to let an individual app store its own credentials that only the app itself can access.

# Direct Boot mode
* Android 7.0 runs in a secure, Direct Boot mode when the device has been powered on but the user has not unlocked the device. 
* Credential encrypted storage: default storage location and only available after the user has unlocked the device.
* Device encrypted storage: a storage location available both during Direct Boot mode and after the user has unlocked the device.
* Access device encrypted storage:  
    appContext.createDeviceProtectedStorageContext();
* use DevicePolicyManager.getStorageEncryptionStatus() to check the current encryption status of the device

