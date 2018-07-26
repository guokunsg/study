# Android component lifecycle function calls
http://gityuan.com/2016/03/18/start-activity-cycle/

* ActivityThread.H.handleMessage() controls life cycles
    ```
    public void handleMessage(Message msg) {
        switch (msg.what) {
            case LAUNCH_ACTIVITY: {
                final ActivityClientRecord r = (ActivityClientRecord)msg.obj;
                r.packageInfo = getPackageInfoNoCheck(r.activityInfo.applicationInfo, r.compatInfo);
                handleLaunchActivity(r, null);
            } break;
            case RELAUNCH_ACTIVITY: {
                ActivityClientRecord r = (ActivityClientRecord)msg.obj;
                handleRelaunchActivity(r);
            } break;
            case PAUSE_ACTIVITY:
                handlePauseActivity((IBinder)msg.obj, false, (msg.arg1&1) != 0, 
                    msg.arg2,(msg.arg1&2) != 0);
                maybeSnapshot();
                break;
            case STOP_ACTIVITY_SHOW:
                handleStopActivity((IBinder)msg.obj, true, msg.arg2);
                break;
            case STOP_ACTIVITY_HIDE:
                handleStopActivity((IBinder)msg.obj, false, msg.arg2);
                break;
            case RESUME_ACTIVITY:
                handleResumeActivity((IBinder) msg.obj, true, msg.arg1 != 0, true);
                break;
            case DESTROY_ACTIVITY:
                handleDestroyActivity((IBinder)msg.obj, msg.arg1 != 0, msg.arg2, false);
                break;
            ...
        }
    }
    ```

* LAUNCH_ACTIVITY
    ```
    ActivityThread.handleLaunchActivity
        ActivityThread.handleConfigurationChanged
            ActivityThread.performConfigurationChanged
                ComponentCallbacks2.onConfigurationChanged      << User
        ActivityThread.performLaunchActivity
            LoadedApk.makeApplication
                Instrumentation.callApplicationOnCreate
                    Application.onCreate                        << User
            Instrumentation.callActivityOnCreate
                Activity.performCreate
                    Activity.onCreate                           << User
            Instrumentation.callActivityonRestoreInstanceState
                Activity.performRestoreInstanceState
                    Activity.onRestoreInstanceState             << User
        ActivityThread.handleResumeActivity (continue)
    ```

* RESUME_ACTIVITY
    ```
    ActivityThread.handleResumeActivity
        ActivityThread.performResumeActivity
            Activity.performResume
                Activity.performRestart
                    Instrumentation.callActivityOnRestart
                        Activity.onRestart                      << User
                    Activity.performStart
                        Instrumentation.callActivityOnStart
                            Activity.onStart                    << User
                Instrumentation.callActivityOnResume
                    Activity.onResume                           << User
    ```

* PAUSE_ACTIVITY
    ```
    ActivityThread.handlePauseActivity
        ActivityThread.performPauseActivity
            ActivityThread.callCallActivityOnSaveInstanceState
                Instrumentation.callActivityOnSaveInstanceState
                    Activity.performSaveInstanceState
                        Activity.onSaveInstanceState            << User
            Instrumentation.callActivityOnPause
                Activity.performPause
                    Activity.onPause                            << User
    ```

* STOP_ACTIVITY_HIDE
    ```
    ActivityThread.handleStopActivity
        ActivityThread.performStopActivityInner
            ActivityThread.callCallActivityOnSaveInstanceState
                Instrumentation.callActivityOnSaveInstanceState
                    Activity.performSaveInstanceState
                        Activity.onSaveInstanceState            << User
            ActivityThread.performStop
                Activity.performStop
                    Instrumentation.callActivityOnStop
                        Activity.onStop                         << User
        updateVisibility
        H.post(StopInfo)
            AMP.activityStopped
                AMS.activityStopped
                    ActivityStack.activityStoppedLocked
                    AMS.trimApplications
                        ProcessRecord.kill
                        ApplicationThread.scheduleExit
                            Looper.myLooper().quit()
                        AMS.cleanUpApplicationRecordLocked
                        AMS.updateOomAdjLocked
    ```

* DESTROY_ACTIVITY
    ```
    ActivityThread.handleDestroyActivity
        ActivityThread.performDestroyActivity
            Instrumentation.callActivityOnPause
            Activity.performStop()
            Instrumentation.callActivityOnDestroy
                Activity.performDestroy
                    Window.destroy
                    Activity.onDestroy                          << User
        AMP.activityDestroyed
            AMS.activityDestroyed
                ActivityStack.activityDestroyedLocked
                    ActivityStackSupervisor.resumeTopActivitiesLocked
                        ActivityStack.resumeTopActivityLocked
                            ActivityStack.resumeTopActivityInnerLocked
    ```

* NEW_INTENT
    ```
    ActivityThread.handleNewIntent
        performNewIntents
            Instrumentation.callActivityOnPause
                Activity.performPause
                    Activity.onPause                            << User
            deliverNewIntents
                Instrumentation.callActivityOnNewIntent
                    Activity.onNewIntent                        << User
            Activity.performResume
                Activity.performRestart
                    Instrumentation.callActivityOnRestart
                        Activity.onRestart                      << User
                    Activity.performStart
                        Instrumentation.callActivityOnStart
                            Activity.onStart                    << User
                Instrumentation.callActivityOnResume
                    Activity.onResume                           << User
    ```

# Android components record management
http://gityuan.com/2017/05/19/ams-abstract/
* Activity: AMS, ActivityStack, ActivityStackSupervisor
* Service: AMS, ActiveServices
* Broadcast: AMS, BroadcastQueue
* Provider: AMS, ProviderMap

# Starting Window
* http://gityuan.com/2017/01/22/start-activity-wms/  
    ```
    AS.startActivityLocked
        WMS.setAppStartingWindow
            PhoneWindowManager.addStartingWindow
                WindowManagerImpl.addView

    WMS.performLayoutAndPlaceSurfacesLocked
        WMS.performLayoutAndPlaceSurfacesLockedLoop
            WMS.performLayoutAndPlaceSurfacesLockedInner
                WindowStateAnimator.commitFinishDrawingLocked
                    WindowStateAnimator.performShowLocked
                        PhoneWindowManager.removeStartingWindow
                            WindowManagerImpl.removeView
    ```

