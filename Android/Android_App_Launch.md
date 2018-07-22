# Android App Launch Process

# Application start
* Go to android.app.ActivityThread.main()

# Activity start
* Go to com.android.launcher3.Launcher.startActivitySafely()

# Involved classes implementation (Android 8.0)
## android.app.ActivityThread
* This manages the execution of the main thread in an application process, scheduling and executing activities, broadcasts, and other operations on it as the activity manager requests.
* public static void main(): 
    ```
    public static void main(String[] args) {
        // CloseGuard defaults to true and can be quite spammy.  We
        // disable it here, but selectively enable it later (via
        // StrictMode) on debug builds, but using DropBox, not logs.
        CloseGuard.setEnabled(false);

        Environment.initForCurrentUser();

        // Make sure TrustedCertificateStore looks in the right place for CA certificates
        final File configDir = Environment.getUserConfigDirectory(UserHandle.myUserId());
        TrustedCertificateStore.setDefaultUserDirectory(configDir);
        Process.setArgV0("<pre-initialized>");

        Looper.prepareMainLooper();
        ActivityThread thread = new ActivityThread();
        thread.attach(false);
        if (sMainThreadHandler == null) {
            sMainThreadHandler = thread.getHandler();
        }
        // End of event ActivityThreadMain.
        Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);
        Looper.loop();
        throw new RuntimeException("Main thread loop unexpectedly exited");
    }
    ```
 * attach(): Called by main(), Calls ActivityManagerService.attachApplication()
    ```
    public void attach(boolean system) {
        ...
        if (system) {
            // Don't set application object here -- if the system crashes,
            // we can't display an alert, we just want to die die die.
            android.ddm.DdmHandleAppName.setAppName("system_process", UserHandle.myUserId());
            try {
                mInstrumentation = new Instrumentation();
                ContextImpl context = ContextImpl.createAppContext(this, getSystemContext().mLoadedApk);
                mInitialApplication = context.mLoadedApk.makeApplication(true, null);
                mInitialApplication.onCreate();
            } catch (Exception e) { ... }
        } else {
            ...
            final IActivityManager mgr = ActivityManager.getService();
            try {
                mgr.attachApplication(mAppThread);
            } catch (RemoteException ex) {
                throw ex.rethrowFromSystemServer();
            }
            ...
        }
    }
    ```
* ActivityThread.ApplicationThread extends IApplicationThread.Stub  
    - scheduleLaunchActivity(): Called by ActivityStackSupervisor.realStartActivityLocked(), 
    ```
    public final void scheduleLaunchActivity(Intent intent, IBinder token, int ident,
        ActivityInfo info, Configuration curConfig, Configuration overrideConfig,
        CompatibilityInfo compatInfo, String referrer, IVoiceInteractor voiceInteractor,
        int procState, Bundle state, PersistableBundle persistentState,
        List<ResultInfo> pendingResults, List<ReferrerIntent> pendingNewIntents,
        boolean notResumed, boolean isForward, ProfilerInfo profilerInfo) {
        updateProcessState(procState, false);
        ActivityClientRecord r = new ActivityClientRecord();
        r.token = token;
        r.ident = ident;
        ...
        updatePendingConfiguration(curConfig);
        sendMessage(H.LAUNCH_ACTIVITY, r);
    }
    ```
    - bindApplication(): Called by ActivityManagerService.attachApplicationLocked(), 
    ```
    public final void bindApplication(String processName, ApplicationInfo appInfo,
                List<ProviderInfo> providers, ComponentName instrumentationName,
                ProfilerInfo profilerInfo, Bundle instrumentationArgs,
                IInstrumentationWatcher instrumentationWatcher,
                IUiAutomationConnection instrumentationUiConnection, int debugMode,
                boolean enableBinderTracking, boolean trackAllocation,
                boolean isRestrictedBackupMode, boolean persistent, Configuration config,
                CompatibilityInfo compatInfo, Map services, Bundle coreSettings,
                String buildSerial) {
            if (services != null) {
                // Setup the service cache in the ServiceManager
                ServiceManager.initServiceCache(services);
            }
            setCoreSettings(coreSettings);
            AppBindData data = new AppBindData();
            // Fill in data with input parameters
            ...
            sendMessage(H.BIND_APPLICATION, data);
        }
    ```
* sendMessage(): Called by ActivityThread.ApplicationThread.scheduleLaunchActivity(), Calls H.sendMessage()
    ```
    final H mH = new H();
    private void sendMessage(int what, Object obj, int arg1, int arg2, boolean async) {
        ...
        Message msg = Message.obtain(); 
        msg.what = what; msg.obj = obj; msg.arg1 = arg1; msg.arg2 = arg2;
        if (async) {
            msg.setAsynchronous(true);
        }
        mH.sendMessage(msg);
    }
    ```
* H: Called by sendMessage()
    ```
    private class H extends Handler {
        public static final int LAUNCH_ACTIVITY         = 100;
        public static final int PAUSE_ACTIVITY          = 101;
        public static final int PAUSE_ACTIVITY_FINISHING= 102;
        public static final int STOP_ACTIVITY_SHOW      = 103;
        ...
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case LAUNCH_ACTIVITY:
                    final ActivityClientRecord r = (ActivityClientRecord) msg.obj;
                    r.loadedApk = getLoadedApkNoCheck(r.activityInfo.applicationInfo, r.compatInfo);
                    handleLaunchActivity(r, null, "LAUNCH_ACTIVITY");
                    break;
                case BIND_APPLICATION:
                    AppBindData data = (AppBindData)msg.obj;
                    handleBindApplication(data);
                    break;
                ...
            }
            Object obj = msg.obj;
            if (obj instanceof SomeArgs) {
                ((SomeArgs) obj).recycle();
            }
        }
    }
    ```
* handleLaunchActivity(): Called by H.handleMessage
    ```
    private void handleLaunchActivity(ActivityClientRecord r, Intent customIntent, String reason) {
        ...
        Activity a = performLaunchActivity(r, customIntent);
        if (a != null) {
            r.createdConfig = new Configuration(mConfiguration);
            reportSizeConfigurations(r);
            Bundle oldState = r.state;
            handleResumeActivity(r.token, false, r.isForward,
                    !r.activity.mFinished && !r.startsNotResumed, r.lastProcessedSeq, reason);
            ...
        } else { ...}
    }
    ```
* performLaunchActivity(): Called by handleLaunchActivity(), Calls Instrumentation.callActivityOnCreate()
    ```
    private Activity performLaunchActivity(ActivityClientRecord r, Intent customIntent) {
        ActivityInfo aInfo = r.activityInfo;
        if (r.loadedApk == null) {
            r.loadedApk = getLoadedApk(aInfo.applicationInfo, r.compatInfo, Context.CONTEXT_INCLUDE_CODE);
        }

        ComponentName component = r.intent.getComponent();
        if (component == null) {
            component = r.intent.resolveActivity(mInitialApplication.getPackageManager());
            r.intent.setComponent(component);
        }

        if (r.activityInfo.targetActivity != null) {
            component = new ComponentName(r.activityInfo.packageName,r.activityInfo.targetActivity);
        }
        
        ContextImpl appContext = createBaseContextForActivity(r);
        Activity activity = null;
        try {
            java.lang.ClassLoader cl = appContext.getClassLoader();
            activity = mInstrumentation.newActivity(cl, component.getClassName(), r.intent);
            StrictMode.incrementExpectedActivityCount(activity.getClass());
            r.intent.setExtrasClassLoader(cl);
            r.intent.prepareToEnterProcess();
            if (r.state != null) {
                r.state.setClassLoader(cl);
            }
        } catch (Exception e) { ... }

        try {
            Application app = r.loadedApk.makeApplication(false, mInstrumentation);
            ...
            if (activity != null) {
                ...
                activity.attach(appContext, this, getInstrumentation(), r.token,
                        r.ident, app, r.intent, r.activityInfo, title, r.parent,
                        r.embeddedID, r.lastNonConfigurationInstances, config,
                        r.referrer, r.voiceInteractor, window, r.configCallback);
                ...
                if (r.isPersistable()) {
                    mInstrumentation.callActivityOnCreate(activity, r.state, r.persistentState);
                } else {
                    mInstrumentation.callActivityOnCreate(activity, r.state);
                }
                ...
            }
            ...
            mActivities.put(r.token, r);
        } catch (Exception e) { ... }
        return activity;
    }
    ```
* handleBindApplication(): Called by H.handleMessage(), Application is created by LoadedApk.makeApplication()
    ```
    private void handleBindApplication(AppBindData data) {
        ... 
        // Instrumentation info affects the class loader, so load it before setting up the app context.
        final InstrumentationInfo ii; ... // Load InstrumentationInfo
        if (ii != null) {
            final ApplicationInfo instrApp = new ApplicationInfo();
            ii.copyTo(instrApp);
            instrApp.initForUser(UserHandle.myUserId());
            final LoadedApk loadedApk = getLoadedApk(
                instrApp, data.compatInfo, appContext.getClassLoader(), false, true, false);
            final ContextImpl instrContext = ContextImpl.createAppContext(this, loadedApk);
            try {
                final ClassLoader cl = instrContext.getClassLoader();
                mInstrumentation = (Instrumentation)
                    cl.loadClass(data.instrumentationName.getClassName()).newInstance();
            } catch (Exception e) { throw ... }

            final ComponentName component = new ComponentName(ii.packageName, ii.name);
            mInstrumentation.init(this, instrContext, appContext, component,
                    data.instrumentationWatcher, data.instrumentationUiAutomationConnection);
            ...
        } else {
            mInstrumentation = new Instrumentation();
        }
        
        // If the app is being launched for full backup or restore, bring it up in
        // a restricted environment with the base application class.
        ... 
        Application app = data.loadedApk.makeApplication(data.restrictedBackupMode, null);
        ... 
        try {
            // android.app.Instrumentation.onCreate() does nothing
            mInstrumentation.onCreate(data.instrumentationArgs); // 
        } catch (Exception e) { throw ... }
        try {
            // android.app.Instrumentation.callApplicationOnCreate() just call app.onCreate()
            mInstrumentation.callApplicationOnCreate(app);
        } catch (Exception e) { throw ... }
        ...
    }
    ```

## android.app.LoadedApk 
* Local state maintained about a currently loaded .apk.
* makeApplication(): Called by ActivityThread.ApplicationThread.handleBindApplication(), Calls Instrumentation.newApplication() to create Application
    ```
    public Application makeApplication(boolean forceDefaultAppClass, Instrumentation instrumentation) {
        if (mApplication != null) {
            return mApplication;
        }
        Application app = null;
        String appClass = mApplicationInfo.className;
        if (forceDefaultAppClass || (appClass == null)) {
            appClass = "android.app.Application";
        }
        try {
            java.lang.ClassLoader cl = getClassLoader();
            if (!mPackageName.equals("android")) {
                initializeJavaContextClassLoader();
            }
            ContextImpl appContext = ContextImpl.createAppContext(mActivityThread, this);
            app = mActivityThread.mInstrumentation.newApplication(
                    cl, appClass, appContext);
            appContext.setOuterContext(app);
        } catch (Exception e) { ... }
        mActivityThread.mAllApplications.add(app);
        mApplication = app;
        if (instrumentation != null) {
            try {
                instrumentation.callApplicationOnCreate(app);
            } catch (Exception e) { ... }
        }
        // Rewrite the R 'constants' for all library apks.
        ...
        return app;
    }
    ```

## com.android.launcher3.Launcher
* startActivitySafely(): Calls Activity.startActivity
    ```
    public boolean startActivitySafely(View v, Intent intent, ItemInfo item)
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    try {
       if (...Shortcuts need some special checks due to legacy reasons) {
               startShortcutIntentSafely(intent, optsBundle, item);
       } else if (user == null || user.equals(Process.myUserHandle())) {
           // Could be launching some bookkeeping activity
           //** Launcher is an Activity, will call Activity.startActivity()
           startActivity(intent, optsBundle); 
       } else {
           LauncherAppsCompat.getInstance(this).startActivityForProfile(
                   intent.getComponent(), user, intent.getSourceBounds(), optsBundle);
       }
       return true;
    } catch (ActivityNotFoundException|SecurityException e) {
        ...
    }
    ```

## android.app.Activity
* startActivity(): Called by Launcher
    ```
    public void startActivity(Intent intent) {
		startActivityForResult(intent, -1);
	}
    ```
 * startActivityForResult: Calls Instrumentation.execStartActivity
    ```
    public void startActivityForResult(@RequiresPermission Intent intent, int requestCode, @Nullable Bundle options) {
        ...
        options = transferSpringboardActivityOptions(options);
        // mMainThread is ActivityThread. ApplicationThread is a Binder
        Instrumentation.ActivityResult ar = mInstrumentation.execStartActivity(
                this, mMainThread.getApplicationThread(), mToken, this,
                intent, requestCode, options);
        ...
    }
    ```

## android.app.Instrumentation
* Doc: Base class for implementing application instrumentation code.  When running with instrumentation turned on, this class will be instantiated for you before any of the application code, allowing you to monitor all of the interaction the system has with the application.  An Instrumentation implementation is described to the system through an AndroidManifest.xml instrumentation tag.
* execStartActivity(): Called by Activity.startActivityForResult, Calls ActivityManager.getService().startActivity()
    ```
    public ActivityResult execStartActivity(
        Context who, IBinder contextThread, IBinder token, String target, 
        Intent intent, int requestCode, Bundle options) {
        IApplicationThread whoThread = (IApplicationThread) contextThread;
        if (mActivityMonitors != null) { ... }
        try {
            intent.migrateExtraStreamToClipData();
            intent.prepareToLeaveProcess(who);
            int result = ActivityManager.getService()
                .startActivity(whoThread, who.getBasePackageName(), intent,
                        intent.resolveTypeIfNeeded(who.getContentResolver()),
                        token, target, requestCode, 0, null, options);
            checkStartActivityResult(result, intent);
        } catch (RemoteException e) { ... }
        return null;
    }
    ```

 * callActivityOnCreate(): Called by ActivityThread.performLaunchActivity(), Calls Activity.performCreate()
    ```
    public void callActivityOnCreate(Activity activity, Bundle icicle) {
        prePerformCreate(activity);
        activity.performCreate(icicle);
        postPerformCreate(activity);
    }
    ```
* newApplication(): Called by LoadedApk.makeApplication()
    ```
    public Application newApplication(ClassLoader cl, String className, Context context)
            throws InstantiationException, IllegalAccessException, ClassNotFoundException {
        return newApplication(cl.loadClass(className), context);
    }
    static public Application newApplication(Class<?> clazz, Context context)
            throws InstantiationException, IllegalAccessException, ClassNotFoundException {
        Application app = (Application)clazz.newInstance();
        app.attach(context);
        return app;
    }
    ```

## android.app.ActivityManager
* Doc: This class gives information about, and interacts with, activities, services, and the containing process.
* getService(): Called by Instrumentation.execStartActivity(), Calls ActivityManagerService.startActivity()
    ```
    public static IActivityManager getService() {
        return IActivityManagerSingleton.get();
    }
    private static final Singleton<IActivityManager> IActivityManagerSingleton =
        new Singleton<IActivityManager>() {
            @Override
            protected IActivityManager create() {
                /* Context.ACTIVITY_SERVICE is registered in ActivityManagerService
                 * public void setSystemProcess()
                 * ... ServiceManager.addService(Context.ACTIVITY_SERVICE, this, true); ... 
                 */
                final IBinder b = ServiceManager.getService(Context.ACTIVITY_SERVICE);
                // IActivityManager AIDL. Before 8.0, using proxy ActivityManagerProxy
                final IActivityManager am = IActivityManager.Stub.asInterface(b);
                return am;
            }
        };
    ```

## com.android.server.am.ActivityManagerService
* startActivity(): Called by ActivityManager singleton, Calls startActivityAsUser()
    ```
    public final int startActivity(IApplicationThread caller, String callingPackage,
        Intent intent, String resolvedType, IBinder resultTo, String resultWho, int requestCode,
        int startFlags, ProfilerInfo profilerInfo, Bundle bOptions) {
        return startActivityAsUser(caller, callingPackage, intent, resolvedType, resultTo,
            resultWho, requestCode, startFlags, profilerInfo, bOptions,
            UserHandle.getCallingUserId());
    }
    ```
 * startActivityAsUser(): Calls ActivityStarter.startActivityMayWait()
    ```
    /*void enforceNotIsolatedCaller(String caller) {
        if (UserHandle.isIsolated(Binder.getCallingUid())) {
            throw new SecurityException("Isolated process not allowed to call " + caller);
        }
    }*/
    public final int startActivityAsUser(IApplicationThread caller, String callingPackage,
        Intent intent, String resolvedType, IBinder resultTo, String resultWho, int requestCode,
        int startFlags, ProfilerInfo profilerInfo, Bundle bOptions, int userId) {
        enforceNotIsolatedCaller("startActivity");
        userId = mUserController.handleIncomingUser(Binder.getCallingPid(), 
            Binder.getCallingUid(), userId, false, ALLOW_FULL_ONLY, "startActivity", null);
        // TODO: Switch to user app stacks here.
        return mActivityStarter.startActivityMayWait(caller, -1, callingPackage, intent,
            resolvedType, null, null, resultTo, resultWho, requestCode, startFlags,
            profilerInfo, null, null, bOptions, false, userId, null, "startActivityAsUser");
    }
    ```
* attachApplication(): Called by ActivityThread.attach()
    ```
    public final void attachApplication(IApplicationThread thread) {
        synchronized (this) {
            int callingPid = Binder.getCallingPid();
            final long origId = Binder.clearCallingIdentity();
            attachApplicationLocked(thread, callingPid);
            Binder.restoreCallingIdentity(origId);
        }
    }
    ```
 * attachApplicationLocked(): Called by attachApplication(), Calls ActivityThread.ApplicationThread.bindApplication()
    ```
    private final boolean attachApplicationLocked(IApplicationThread thread, int pid) {
        ProcessRecord app;
        // Find the application record that is being attached
        // Update app data
        ... 
        thread.bindApplication(processName, appInfo, providers, app.instrumentationClass,
                    profilerInfo, app.instrumentationArguments, app.instrumentationWatcher,
                    app.instrumentationUiAutomationConnection, testMode, enableOpenGlTrace,
                    isRestrictedBackupMode || !normalMode, app.persistent,
                    new Configuration(mConfiguration), app.compat, getCommonServicesLocked(),
                    mCoreSettingsObserver.getCoreSettingsLocked());
        updateLruProcessLocked(app, false, null);
        ...
        // See if the top visible activity is waiting to run in this process...
        if (normalMode) {
            try {
                if (mStackSupervisor.attachApplicationLocked(app))
                    didSomething = true;
            } catch (Exception e) { badApp = true; }
        }
        // Find any services that should be running in this process...
        if (!badApp) {
            try {
                didSomething |= mServices.attachApplicationLocked(app, processName);
            } catch (Exception e) { badApp = true; }
        }
        // Check if a next-broadcast receiver is in this process...
        if (!badApp && isPendingBroadcastProcessLocked(pid)) {
            try {
                didSomething |= sendPendingBroadcastsLocked(app);
            } catch (Exception e) { badApp = true; }
        }
        // Check whether the next backup agent is in this process...
        // thread.scheduleCreateBackupAgent(mBackupTarget.appInfo, 
        //        compatibilityInfoForPackageLocked(mBackupTarget.appInfo), mBackupTarget.backupMode);
        ...
        if (badApp) {
            app.kill("error during init", true);
            handleAppDiedLocked(app, false, true);
            return false;
        }
        ...
        return true;
    }
    ```

## com.android.server.am.ActivityStarter
* Controller for interpreting how and then launching activities. This class collects all the logic for determining how an intent and flags should be turned into an activity and associated task and stack.
* startActivityMayWait(): Called by ActivityManagerService.startActivityAsUser, Calls startActivityLocked()
    ```
    final int startActivityMayWait(IApplicationThread caller, int callingUid,
        String callingPackage, Intent intent, String resolvedType,
        IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
        IBinder resultTo, String resultWho, int requestCode, int startFlags,
        ProfilerInfo profilerInfo, WaitResult outResult,
        Configuration globalConfig, Bundle bOptions, boolean ignoreTargetSecurity, int userId,
        TaskRecord inTask, String reason) {
        ...
        // Save a copy in case ephemeral needs it
        final Intent ephemeralIntent = new Intent(intent);
        // Don't modify the client's object!
        intent = new Intent(intent);
        ...
        ResolveInfo rInfo = mSupervisor.resolveIntent(intent, resolvedType, userId);
        ...
        // Collect information about the target of the Intent.
        ActivityInfo aInfo = mSupervisor.resolveActivity(intent, rInfo, startFlags, profilerInfo);
        ...
        int res = startActivityLocked(caller, intent, ephemeralIntent, resolvedType,
                aInfo, rInfo, voiceSession, voiceInteractor,
                resultTo, resultWho, requestCode, callingPid,
                callingUid, callingPackage, realCallingPid, realCallingUid, startFlags,
                options, ignoreTargetSecurity, componentSpecified, outRecord, inTask,
                reason);
        ...
        return res;
    }
    ```
* startActivityLocked(): Calls startActivity()
    ```
    int startActivityLocked(IApplicationThread caller, Intent intent, Intent ephemeralIntent,
            String resolvedType, ActivityInfo aInfo, ResolveInfo rInfo,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            IBinder resultTo, String resultWho, int requestCode, int callingPid, int callingUid,
            String callingPackage, int realCallingPid, int realCallingUid, int startFlags,
            ActivityOptions options, boolean ignoreTargetSecurity, boolean componentSpecified,
            ActivityRecord[] outActivity, TaskRecord inTask, String reason) {
        ...
        mLastStartActivityResult = startActivity(caller, intent, ephemeralIntent, resolvedType,
                aInfo, rInfo, voiceSession, voiceInteractor, resultTo, resultWho, requestCode,
                callingPid, callingUid, callingPackage, realCallingPid, realCallingUid, startFlags,
                options, ignoreTargetSecurity, componentSpecified, mLastStartActivityRecord,
                inTask);
        ...
        return mLastStartActivityResult != START_ABORTED ? mLastStartActivityResult : START_SUCCESS;
    }
    ```
* startActivity(): Calls another startActivity()
    ```
    private int startActivity(IApplicationThread caller, Intent intent, Intent ephemeralIntent,
        String resolvedType, ActivityInfo aInfo, ResolveInfo rInfo,
        IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
        IBinder resultTo, String resultWho, int requestCode, int callingPid, int callingUid,
        String callingPackage, int realCallingPid, int realCallingUid, int startFlags,
        ActivityOptions options, boolean ignoreTargetSecurity, boolean componentSpecified,
        ActivityRecord[] outActivity, TaskRecord inTask) {
        int err = ActivityManager.START_SUCCESS;
        // Pull the optional Ephemeral Installer-only bundle out of the options early.
        final Bundle verificationBundle
            = options != null ? options.popAppVerificationBundle() : null;

        ProcessRecord callerApp = null;
        if (caller != null) {
            callerApp = mService.getRecordForAppLocked(caller);
            if (callerApp != null) {
                callingPid = callerApp.pid;
                callingUid = callerApp.info.uid;
            } else {
                err = ActivityManager.START_PERMISSION_DENIED;
            }
        }
        final int userId = aInfo != null ? UserHandle.getUserId(aInfo.applicationInfo.uid) : 0;

        ActivityRecord sourceRecord = null;
        ActivityRecord resultRecord = null;
        if (resultTo != null) {
            sourceRecord = mSupervisor.isInAnyStackLocked(resultTo);
            if (sourceRecord != null) {
                if (requestCode >= 0 && !sourceRecord.finishing) {
                    resultRecord = sourceRecord;
                }
            }
        }

        final int launchFlags = intent.getFlags();
        if ((launchFlags & Intent.FLAG_ACTIVITY_FORWARD_RESULT) != 0 && sourceRecord != null) {
            ...
        }
        boolean abort = !mSupervisor.checkStartAnyActivityPermission(intent, aInfo, resultWho,
            requestCode, callingPid, callingUid, callingPackage, ignoreTargetSecurity, callerApp,
            resultRecord, resultStack, options);
        ...
        ActivityRecord r = new ActivityRecord(mService, callerApp, callingPid, callingUid,
            callingPackage, intent, resolvedType, aInfo, mService.getGlobalConfiguration(),
            resultRecord, resultWho, requestCode, componentSpecified, voiceSession != null,
            mSupervisor, options, sourceRecord);
        ...
        final ActivityStack stack = mSupervisor.mFocusedStack;
        if (voiceSession == null && (stack.mResumedActivity == null
            || stack.mResumedActivity.info.applicationInfo.uid != callingUid)) {
            if (!mService.checkAppSwitchAllowedLocked(callingPid, callingUid,
                    realCallingPid, realCallingUid, "Activity start")) {
                PendingActivityLaunch pal =  new PendingActivityLaunch(r,
                        sourceRecord, startFlags, stack, callerApp);
                mPendingActivityLaunches.add(pal);
                ActivityOptions.abort(options);
                return ActivityManager.START_SWITCHES_CANCELED;
            }
        }
        ...
        doPendingActivityLaunchesLocked(false);
        return startActivity(r, sourceRecord, voiceSession, voiceInteractor, startFlags, true,
                options, inTask, outActivity);
    }
    ```
 * startActivty(): Calls startActivityUnchecked()
    ```
    private int startActivity(final ActivityRecord r, ActivityRecord sourceRecord,
        IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
        int startFlags, boolean doResume, ActivityOptions options, TaskRecord inTask,
        ActivityRecord[] outActivity) {
        int result = START_CANCELED;
        try {
            mService.mWindowManager.deferSurfaceLayout();
            result = startActivityUnchecked(r, sourceRecord, voiceSession, voiceInteractor,
                    startFlags, doResume, options, inTask, outActivity);
        } finally { ... }
        ...
        return result;
    }
    ```
* startActivityUnChecked():  
        Handles different launch mode and launch flags
    ```
    private int startActivityUnchecked(final ActivityRecord r, ActivityRecord sourceRecord,
        IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
        int startFlags, boolean doResume, ActivityOptions options, TaskRecord inTask,
        ActivityRecord[] outActivity) {
        ...
        // If the top activity is the same as the activity to be started, check whether should start only once
        final ActivityStack topStack = mSupervisor.mFocusedStack;
        final ActivityRecord topFocused = topStack.topActivity();
        final ActivityRecord top = topStack.topRunningNonDelayedActivityLocked(mNotTop);
        final boolean dontStart = top != null && mStartActivity.resultTo == null
                && top.realActivity.equals(mStartActivity.realActivity)
                && top.userId == mStartActivity.userId
                && top.app != null && top.app.thread != null
                && ((mLaunchFlags & FLAG_ACTIVITY_SINGLE_TOP) != 0
                || mLaunchSingleTop || mLaunchSingleTask);
        if (dontStart) {
            topStack.mLastPausedActivity = null;
            if (mDoResume) {
                mSupervisor.resumeFocusedStackTopActivityLocked();
            }
            ActivityOptions.abort(mOptions);
            if ((mStartFlags & START_FLAG_ONLY_IF_NEEDED) != 0) {
                // We don't need to start a new activity, and the client said not to do
                // anything if that is the case, so this is it!
                return START_RETURN_INTENT_TO_CALLER;
            }

            deliverNewIntent(top);

            mSupervisor.handleNonResizableTaskIfNeeded(top.getTask(), preferredLaunchStackId,
                preferredLaunchDisplayId, topStack.mStackId);
            return START_DELIVERED_TO_TOP;
        }

        boolean newTask = false;
        final TaskRecord taskToAffiliate = (mLaunchTaskBehind && mSourceRecord != null)
            ? mSourceRecord.getTask() : null;

        // Should this be considered a new task?
        int result = START_SUCCESS;
        if (mStartActivity.resultTo == null && mInTask == null && !mAddingToTask
            && (mLaunchFlags & FLAG_ACTIVITY_NEW_TASK) != 0) {
            newTask = true;
            result = setTaskFromReuseOrCreateNewTask(
                taskToAffiliate, preferredLaunchStackId, topStack);
        } else if (mSourceRecord != null) {
            result = setTaskFromSourceRecord();
        } else if (mInTask != null) {
            result = setTaskFromInTask();
        } else {
            setTaskToCurrentTopOrCreateNewTask();
        }
        if (result != START_SUCCESS) {
            return result;
        }
        ...
        if (mDoResume) {
            final ActivityRecord topTaskActivity =
                mStartActivity.getTask().topRunningActivityLocked();
            if (!mTargetStack.isFocusable()
                || (topTaskActivity != null && topTaskActivity.mTaskOverlay
                && mStartActivity != topTaskActivity)) {
                ...
            } else {
                if (mTargetStack.isFocusable() && !mSupervisor.isFocusedStack(mTargetStack)) {
                    mTargetStack.moveToFront("startActivityUnchecked");
                }
                mSupervisor.resumeFocusedStackTopActivityLocked(mTargetStack, mStartActivity, mOptions);
            }
        } else {
            mTargetStack.addRecentActivityLocked(mStartActivity);
        }
        ...
        return START_SUCCESS;
    }
    ```

## com.android.server.am.ActivityStackSupervisor
* resumeFocusedStackTopActivityLocked(): Called by ActivityStarter.startActivityUnchecked, Calls ActivityStack.resumeTopActivityUncheckedLocked()
    ```
    boolean resumeFocusedStackTopActivityLocked(
        ActivityStack targetStack, ActivityRecord target, ActivityOptions targetOptions) {
        if (!readyToResume()) {
            return false;
        }
        if (targetStack != null && isFocusedStack(targetStack)) {
            // Resume as focused
            return targetStack.resumeTopActivityUncheckedLocked(target, targetOptions);
        }
    
        final ActivityRecord r = mFocusedStack.topRunningActivityLocked();
        if (r == null || r.state != RESUMED) {
            mFocusedStack.resumeTopActivityUncheckedLocked(null, null);
        } else if (r.state == RESUMED) {
            // Kick off any lingering app transitions form the MoveTaskToFront operation.
            mFocusedStack.executeAppTransition(targetOptions);
        }
        return false;
    }
    ```
* startSpecificActivityLocked(): Called by ActivityStack.resumeTopActivityInnerLocked(), Calls realStartActivityLocked()
    ```
    void startSpecificActivityLocked(ActivityRecord r, boolean andResume, boolean checkConfig) {
        // Is this activity's application already running?
        ProcessRecord app = mService.getProcessRecordLocked(r.processName,
                r.info.applicationInfo.uid, true);
        r.getStack().setLaunchTime(r);
        if (app != null && app.thread != null) {
            try {
                if ((r.info.flags&ActivityInfo.FLAG_MULTIPROCESS) == 0
                        || !"android".equals(r.info.packageName)) {
                    app.addPackage(r.info.packageName, r.info.applicationInfo.versionCode,
                            mService.mProcessStats);
                }
                realStartActivityLocked(r, app, andResume, checkConfig);
                return;
            } catch (RemoteException e) { ... } }
        }
        mService.startProcessLocked(r.processName, r.info.applicationInfo, true, 0,
            "activity", r.intent.getComponent(), false, false, true);
    }
    ```
* realStartActivityLocked(): Called by startSpecificActivityLocked(), Calls ActivityThread.ApplicationThread.scheduleLaunchActivity()
    ```
    final boolean realStartActivityLocked(ActivityRecord r, ProcessRecord app,
          boolean andResume, boolean checkConfig) throws RemoteException {
        ...
        // app.thread is IApplicationThread implemented as ActivityThread.ApplicationThread
        app.thread.scheduleLaunchActivity(new Intent(r.intent), r.appToken,
            System.identityHashCode(r), r.info, new Configuration(mService.mConfiguration),
            new Configuration(task.mOverrideConfig), r.compat, r.launchedFromPackage,
            task.voiceInteractor, app.repProcState, r.icicle, r.persistentState, results,
            newIntents, !andResume, mService.isNextTransitionForward(), profilerInfo);
        ...      
        return true;
    }
    ```

## com.android.server.am.ActivityStack
* State and management of a single stack of activities.
* resumeTopActivityUncheckedLocked(): Called by ActivityStackSupervisor.resumeFocusedStackTopActivityLocked()
    ```
    boolean resumeTopActivityUncheckedLocked(ActivityRecord prev, ActivityOptions options) {
        ...
        result = resumeTopActivityInnerLocked(prev, options);
        ...
        return result;
    }
    ```
* resumeTopActivityInnerLocked(): Calls ActivityStackSupervisor.startSpecificActivityLocked()
    ```
    private boolean resumeTopActivityInnerLocked(ActivityRecord prev, ActivityOptions options) {
        ...
        mStackSupervisor.startSpecificActivityLocked(next, true, true);
        ...
        return true;
    }
    ```
   
## android.app.Activity
* performCreate(): Called by Instrumentation.callActivityOnCreate()
    ```
    final void performCreate(Bundle icicle, PersistableBundle persistentState) {
        mCanEnterPictureInPicture = true;
        restoreHasCurrentPermissionRequest(icicle);
        if (persistentState != null) {
            onCreate(icicle, persistentState);
        } else {
            onCreate(icicle);
        }
        ...
    }
    ```
