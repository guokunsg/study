# ANR & Crash处理

## Android ANR
* http://gityuan.com/2016/07/02/android-anr/
* Scenarios:
    - Service Timeout: Foreground service 20s, background 200s
    - BroadcastQueue Timeout：Foreground 10s, Background 60s. 
    - ContentProvider Timeout：Publish timeout 10s
    - InputDispatching Timeout: Input event dispatch more than 5s
* For Service, BroadcastQueue, InputDispatching: ActivityManagerService.appNotResponding will be called  
    ContentProvider will not, process will be killed
* Service implementation:
    - ActivityManagerService: schedule a time message which should be removed by Service
    ```
    void scheduleServiceTimeoutLocked(ProcessRecord proc) {
        long now = SystemClock.uptimeMillis();
        Message msg = mAm.mHandler.obtainMessage(ActivityManagerService.SERVICE_TIMEOUT_MSG);
        msg.obj = proc;
        // If SERVICE_TIMEOUT_MSG is not removed, execute timeout routine
        mAm.mHandler.sendMessageAtTime(msg,
            proc.execServicesFg ? (now + SERVICE_TIMEOUT) : (now + SERVICE_BACKGROUND_TIMEOUT));
    }
    ```
    - ActivityThread: Remove the message
    ```
    private void handleCreateService(CreateServiceData data) {
        ... 
        ActivityManagerNative.getDefault().serviceDoneExecuting(
                    data.token, SERVICE_DONE_EXECUTING_ANON, 0, 0);
        ... 
    }
    ```
* Broadcast implementation
    - Timeout when execution time > mTimeoutPeriod for a single receiver, or 2 * mTimeoutPeriod * numReceivers for all
    ```
    final void processNextBroadcast(boolean fromMsg) {
        synchronized(mService) {
            ... do {
                r = mOrderedBroadcasts.get(0);
                int numReceivers = (r.receivers != null) ? r.receivers.size() : 0;
                if (mService.mProcessesReady && r.dispatchTime > 0) {
                    long now = SystemClock.uptimeMillis();
                    if ((numReceivers > 0) &&
                            (now > r.dispatchTime + (2 * mTimeoutPeriod * numReceivers))) {
                        broadcastTimeoutLocked(false); ...
                    }
                }
                if (r.receivers == null || r.nextReceiver >= numReceivers 
                        || r.resultAbort || forceReceive) {
                    if (r.resultTo != null) {
                        performReceiveLocked(r.callerApp, r.resultTo, new Intent(r.intent), 
                            r.resultCode, r.resultData, r.resultExtras, false, false, r.userId);
                        r.resultTo = null;
                    }
                    cancelBroadcastTimeoutLocked();
                }
            } while (r == null); ...
            // Next receiver
            r.receiverTime = SystemClock.uptimeMillis();
            if (!mPendingBroadcastTimeoutMessage) {
                long timeoutTime = r.receiverTime + mTimeoutPeriod;
                setBroadcastTimeoutLocked(timeoutTime);
            } ...
        }
    }
    ```
* ContentProvider: 
    - ActivityManagerService.attachApplicationLocked schedules timeout message
    - ActivityManagerService.publishContentProviders removes it

## Watchdog
* Watchdog是一个运行在system_server进程的名为”watchdog”的线程
* Watchdog运作过程，当阻塞时间超过1分钟则触发一次watchdog，会杀死system_server,触发上层重启
* 监控Handler线程: main, android.fg, android.ui, android.io, android.display, ActivityManager, PowerManagerService, PackageManager

## Crash
0. Function calls
    ```
    UncaughtHandler.uncaughtException(Thread t, Throwable e) 
    => try {
        ActivityManagerNative.getDefault().handleApplicationCrash()
        => ActivityManagerService.handleApplicationCrash
            AMS.findAppProcess
            AMS.handleApplicationCrashInner
                AMS.addErrorToDropBox
                AMS.crashApplication
                    AMS.makeAppCrashingLocked
                        AMS.startAppProblemLocked
                        ProcessRecord.stopFreezingAllLocked
                            ActivityRecord.stopFreezingScreenLocked
                                WMS.stopFreezingScreenLocked
                                    WMS.stopFreezingDisplayLocked
                        AMS.handleAppCrashLocked
                    mUiHandler.sendMessage(SHOW_ERROR_MSG)
    } finally {
        Process.killProcess(Process.myPid());
        System.exit(10);
    }
    ```
1. crash所在进程实现Thread.UncaughtExceptionHandler用来处理Uncaught Exception，并输出crash基本信息
2. 调用当前进程中的AMP.handleApplicationCrash；经过binder ipc机制，传递到system_server进程；
3. system_server进程，调用binder服务端执行AMS.handleApplicationCrash；
4. 从mProcessNames查找到目标进程的ProcessRecord对象；并将进程crash信息输出到目录/data/system/dropbox；
5. 执行makeAppCrashingLocked
    - 创建当前用户下的crash应用的error receiver，并忽略当前应用的广播；
    - 停止当前进程中所有activity中的WMS的冻结屏幕消息，并执行相关一些屏幕相关操作；
6. 再执行handleAppCrashLocked方法，
    - 当1分钟内同一进程连续crash两次时，且非persistent进程，则直接结束该应用所有activity，并杀死该进程以及同一个进程组下的所有进程。然后再恢复栈顶第一个非finishing状态的activity;
    - 当1分钟内同一进程连续crash两次时，且persistent进程，，则只执行恢复栈顶第一个非finishing状态的activity;
    - 当1分钟内同一进程未发生连续crash两次时，则执行结束栈顶正在运行activity的流程。
7. 通过mUiHandler发送消息SHOW_ERROR_MSG，弹出crash对话框；
8. 到此，system_server进程执行完成。回到crash进程开始执行杀掉当前进程的操作；
9. 当crash进程被杀，通过binder死亡通知，告知system_server进程来执行appDiedLocked()；
10. 最后，执行清理应用相关的activity/service/ContentProvider/receiver组件信息。
* 对于同一个app连续crash的情况：
    - 当60s内连续crash两次的非persistent进程时，被认定为bad进程：那么如果第3次从后台启动该进程(Intent.getFlags来判断)，则会拒绝创建进程；
    - 当crash次数达到两次的非persistent进程时，则再次杀该进程，即便允许自启的service也会在被杀后拒绝再次启动。
* Native crash: http://gityuan.com/2016/06/25/android-native-crash/
