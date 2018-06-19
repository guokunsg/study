# Android window
details: Android窗口机制 https://blog.csdn.net/HoHohong/article/details/54616053
* Structure
[Activity]: Contains a window, normally PhoneWindow
[PhoneWindows]: Set DecorView as the root view
[DecorView]: Top level view
    Dispatch event 
    System layout with styling and window features
    getWindow().getDecorView();
    Only one child LinearLayout, contains actionbar, title, content
[TitleView][ContentView id="content"]:
* setContentView
    Activity.setContentView() {
        getWindow().setContentView() {
            installDecor();
            ... animation if requested
            ... load layout and resources
            callback.onContentChanged(); // Activity implements callback
        }
        initWindowDecorActionBar();
    }
* ViewManager: interface with addView, updateViewLayout, remoteView
  WindowManager: extends ViewManager with getDefaultDisplay, removeViewImmediate
    Content.getSystemService(Context.WINDOW_SERVICE);
  New start:
    ActivityThread
        handleLaunchActivity()  
            ... WindowManagerGlobal.initialize();
            Activity a = performLaunchActivity();
            ... read configuration, old state
            handleResumeActivity(...);
        performLaunchActivity(ActivityClientRecord r, ...) 
            ... activity = mInstrumentation.newActivity() // Create Activity with class loader r.packageInfo.getClassLoader()
            ... Create application: Application app = r.packageInfo.makeApplication(...)
            ... Context appContext = createBaseContextForActivity(r, activity);
            ... activity.attach(...) // Bind base context, create Window, set WindowManager, configuration
            ... mInstrumentation.callActivityOnCreate(...) // prePerformCreate, Activity.onCreate, postPerformCreate
            ... activity.performStart(); // Activity.onStart()
            ... mInstrumentation.callActivityOnRestoreInstanceState // Activity.onRestoreInstanceState
        handleResumeActivity() 
            ... ActivityClientRecord r = performResumeActivity(token, clearHide);
            ... Set r.window.getDecorView() visible and bind with WindowManager 
            ... Update with configuration changes
* ViewRootImpl: Top of a view hierarchy, implementing the needed protocol between View and the WindowManager
    WindowManagerGlobal.addView(View view ...) 
        ... root = new ViewRootImpl(view.getContext(), display);
        ... Configure view and save
        ... root.setView(view, wparams, panelParentView);
    ViewRootImpl
        setView()
            ... requestLayout()
            ... mWindowSession.addToDisplay(...) // IPC call WindowManagerService to add view
        requestLayout()
            ... checkThread();
            ... scheduleTraversals(); // Start a runnable to do measure and draw
        performTraversals()
            ... performMeasure() // Recursive call view.measure
            ... performLayout // Recursive call view.layout
            ... performDraw // Recursive call view.draw
* View is only drawn in activity.handleResumeActivity after DecorView is added WindowManager
    view.getMeasureHeight() == 0 in onCreate()
    Cannot use view.getMeasureHeight() in onResume because view drawn is asynchronous (Handler)
    view.getViewTreeObserver().addOnGlobalLayoutListener(new OnGlobalLayoutListener() // View not drawn yet but can get size
    ViewRootImpl.performTraversals calls mTreeObserver.dispatchOnGlobalLayout()
* View.getViewRootImpl() can get ViewRootImpl
* Token: To identify a window. IBinder
    static inner class AttachInfo:
        final IWindow mWindow; final IBinder mWindowToken;
        AttachInfo(IWindowSession session, IWindow window, Display display, ViewRootImpl viewRootImpl, Handler handler, Callbacks effectPlayer)
            mSession = session;
            mWindow = window;
            mWindowToken = window.asBinder();
* WindowManager.LayoutParams
    Three window types: 
        Application: FIRST_APPLICATION_WINDOW ~ LAST_APPLICATION_WINDOW, view token is Activity token, eg: Activity window, dialog
        Sub: FIRST_SUB_WINDOW ~ LAST_SUB_WINDOW, view token is the token which the view is attached to, eg: PopupWindow
        System: FIRST_SYSTEM_WINDOW ~ LAST_SYSTEM_WINDOW, eg: Toast, Input

# Touch event handling
* ACTION_DOWN ACTION_MOVE ACTION_UP
* Activity & View: dispatchTouchEvent, onTouchEvent
* ViewGroup: dispatchTouchEvent, onInterceptTouchEvent, onTouchEvent
* dispatchTouchEvent: If return true, handled and consumed. If return false, continue passing.
* onInterceptTouchEvent: If return true, pass event to own onTouchEvent. If return false, pass event to child view and child view dispatchTouchEvent
* onTouchEvent: If return true, handled and consumed. If return false, event shall be handled by upper view.
* Flow
              [Action] [Down, move, up]
                  ↓
Activity  dispatchTouchEvent →(ViewGroup dispatch return false)→ onTouchEvent
                  ↓                                                
ViewGroup dispatchTouchEvent → onInterceptTouchEvent    →(yes)-> onTouchEvent
       (Return true if consumed)       ↓                 (Return true if consumed)          
                                       ↓ loop all child views     
View                            dispatchTouchEvent      →(yes)→  onTouchEvent
                            (Return true if consumed)    (Return true if consumed)






