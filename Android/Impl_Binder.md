# Android Binder
Notes for http://gityuan.com/2015/10/31/binder-prepare/ Based on Android 6.0

![alt text](images/binder.jpg "Binder")

# Binder原理
* 非共享内存的用户空间进程利用进程间可共享的内核内存空间来完成底层通信工作
* Client/Server架构
    - 包含Client、Server、ServiceManager (C++)以及binder驱动
    - 注册服务(addService)：Server进程要先注册Service到ServiceManager
    - 获取服务(getService)：Client进程须先向ServiceManager中获取相应的Service
    - 使用服务：Client根据得到的Service信息建立与Service所在的Server进程通信的通路，然后就可以直接与Service交互
    - 彼此之间不是直接交互的，而是都通过与Binder驱动进行交互的
    - IBinder: Base class. Functions: + transact(); + localBinder(): BBinder*; + remoteBinder(): BpBinder*; + queryLocalInterface();
    - BpBinder: Client端 extends IBinder
    - BBinder: Server端 extends IBinder

# Binder驱动
* 底层的驱动架构与Linux驱动一样
* 内核态系统调用(syscall): open-> __open() -> binder_open()
* init(): 初始化，创建/dev/binder
* open(): 获取文件描述符，过程需要持有binder_main_lock同步锁
* mmap(): 在内核分配内存，用于存放数据，该过程需要持有binder_mmap_lock同步锁
* ioctl(): 负责在两个进程间收发IPC数据和IPC reply数据，该过程需要持有binder_main_lock同步锁

# 通信协议
* BINDER_COMMAND_PROTOCOL：BC_，用于从IPC层传递到Binder Driver层
* BINDER_RETURN_PROTOCOL ：BR_，用于从Binder Driver层传递到IPC层
```
Sample:
Client                    Bind Driver                     Service
1.BC_TRANSACTION           -> |                              |
2.BR_TRANSACTION_COMPLETE  <- |                              |
                              | 3.BR_TRANSACTION ->          |
                              | <- 4.BC_REPLY                |
                              | 5.BR_TRANSACTION_COMPLETE -> |
6.BR_REPLY                 <- |                                  
```
* Client进程执行Binder driver binder_thread_write，driver根据BC_XXX命令，生成相应的binder_work
* Server进程执行binder_thread_read，根据binder_work.type类型，生成BR_XXX，发送到用户空间处理
* 内存机制
    - 虚拟进程地址空间(vm_area_struct)和虚拟内核地址空间(vm_struct)都映射到同一块物理内存空间。
    - Client从自己的进程空间把IPC通信数据copy_from_user拷贝到内核空间
    - Server端与内核共享数据，不再需要拷贝数据，而是通过内存地址空间的偏移量，即可获悉内存地址
    - 整个过程只发生一次内存拷贝。

# ServiceManager
* 查询和注册服务
* 注册服务：记录服务名和handle信息，保存到svclist列表；
* 查询服务：根据服务名查询相应的的handle信息。
* 一个简化版的Binder服务，没有采用libbinder中的多线程模型来与Binder驱动通信，只有一个循环binder_loop来进行读取和处理事务，简单高效。
* 过程
    - 打开binder驱动，并调用mmap()方法分配128k的内存映射空间：binder_open();
    - 通知binder驱动使其成为守护进程：binder_become_context_manager()；
    - 验证selinux权限，判断进程是否有权注册或查看指定服务；
    - 进入循环状态，等待Client端的请求：binder_loop()。
    - 注册服务的过程，根据服务名称，但同一个服务已注册，重新注册前会先移除之前的注册信息；
    - 死亡通知: 当binder所在进程死亡后,会调用binder_release方法,然后调用binder_node_release.这个过程便会发出死亡通知的回调.
* 通过defaultServiceManager()方法(C++)来生成或获取ServiceManager: 单例模式

# 服务注册(addService)
* 服务注册过程(addService)核心功能：  
    在服务所在进程创建binder_node，在ServiceManager进程创建binder_ref。 其中binder_ref的desc再同一个进程内是唯一的：
    - 每个进程binder_proc所记录的binder_ref的handle值是从1开始递增的；
    - 所有进程binder_proc所记录的handle=0的binder_ref都指向ServiceManager；
    - 同一个服务的binder_node在不同进程的binder_ref的handle值可以不同；
* Media服务注册
    ```
    int main(int argc __unused, char** argv) {
        ...
        InitializeIcuOrDie();
        // 获得ProcessState单例对象，一个进程只打开binder设备一次
        sp<ProcessState> proc(ProcessState::self());
        // 获取BpServiceManager对象
        sp<IServiceManager> sm = defaultServiceManager();
        // 注册多媒体及其它服务
        MediaPlayerService::instantiate(); AudioFlinger::instantiate(); ... 略
        registerExtensions();
        // 启动Binder线程池
        ProcessState::self()->startThreadPool();
        // 当前线程加入到线程池
        IPCThreadState::self()->joinThreadPool();
    }
    void MediaPlayerService::instantiate() {
        defaultServiceManager()->addService(String16("media.player"), new MediaPlayerService());
    }
    ```

# 请求服务(getService)
* 向ServiceManager进程查询指定服务
    - 当请求服务的进程与服务属于不同进程  
        请求服务所在进程创建binder_ref对象，指向服务进程中的binder_node;  
        最终readStrongBinder()，返回的是BpBinder对象；
    - 请求服务的进程与服务属于同一进程  
        不再创建新对象，只是引用计数加1，并且修改type为BINDER_TYPE_BINDER或BINDER_TYPE_WEAK_BINDER。  
        最终readStrongBinder()，返回的是BBinder对象的真实子类；

# App进程创建
* system_server进程：用于管理整个Java framework层，包含ActivityManager，PowerManager等各种系统服务
* Zygote进程：Android的首个Java进程，是所有Java进程的父进程
* 流程
    - startActivity/startService通过Binder发送消息给system_server进程
    - system_server进程：Process.start()通过socket向Zygote进程发送参数并等待返回
    - zygote进程：在执行ZygoteInit.main()后便进入runSelectLoop()循环体内;   
        当有客户端连接时执行ZygoteConnection.runOnce()方法，经过层层调用后fork出新的应用进程；
    - 新进程: 进入handleChildProc()方法，设置进程名，打开binder驱动，启动新的binder线程；  
        然后设置art虚拟机参数，再反射调用目标类的main()方法，即ActivityThread.main()方法。

# 进程的Binder线程池工作过程
* 只有第一个Binder主线程(也就是Binder_1线程)是由应用程序主动创建
* Binder线程池的普通线程都是由Binder驱动根据IPC通信需求创建
* 三类Binder线程
    - Binder主线程：进程创建过程调用startThreadPool()再进入spawnPooledThread(true)创建主线程
    - Binder普通线程：Binder Driver根据是否有空闲的binder线程来决定是否创建binder线程  
        回调spawnPooledThread(false) ，isMain=false，该线程名格式为binder_x。
    - Binder其他线程：没有调用spawnPooledThread，而是调用IPC.joinThreadPool()将当前线程加入 binder线程队列。  
        例如：system_server的主线程并非binder线程。
* 三类Binder Transaction
    - call: 发起进程的线程不一定是在Binder线程
    - reply: 发起者一定是binder线程，接收者线程是上次call时的发起线程(可以是任意线程)
    - async: oneway方式不需要回复，发起进程的线程不一定是在Binder线程

# Framework层
* jni方法注册
    ```
    int AndroidRuntime::startReg(JNIEnv* env) {
        ...
        // gRegJNI是一个数组，记录所有需要注册的jni方法, 
        // 其中有一项便是REG_JNI(register_android_os_Binder)
        if (register_jni_procs(gRegJNI, NELEM(gRegJNI), env) < 0) {
            ... return -1;
        }
        ... return 0;
    }
    int register_android_os_Binder(JNIEnv* env) {
        // 保存Java层Binder，BinderInternal，类以供调用，注册C++层JNI方法
        if (int_register_android_os_Binder(env) < 0) return -1;
        if (int_register_android_os_BinderInternal(env) < 0) return -1;
        if (int_register_android_os_BinderProxy(env) < 0) return -1;
        ... return 0;
    }
    ```
* android.os.ServiceManager
    ```
    private static IServiceManager sServiceManager;
    private static HashMap<String, IBinder> sCache = new HashMap<String, IBinder>();
    private static IServiceManager getIServiceManager() {
        if (sServiceManager != null) return sServiceManager;
        // BinderInternal.getContextObject()的实现android_os_BinderInternal_getContextObject
        // 将返回new BpBinder(0) (Client)
        sServiceManager = ServiceManagerNative
                .asInterface(Binder.allowBlocking(BinderInternal.getContextObject()));
        return sServiceManager;
    }
    public static void addService(String name, IBinder service) {
        try {
            getIServiceManager().addService(name, service, false);
        } catch (RemoteException e) { ... }
    }
    public static IBinder getService(String name) {
        try {
            IBinder service = sCache.get(name);
            if (service != null) {
                return service;
            } else {
                return Binder.allowBlocking(getIServiceManager().getService(name));
            }
        } catch (RemoteException e) { ... }
    }
    ...
    ```
* android.os.ServiceManagerNative
    ```
    public abstract class ServiceManagerNative extends Binder implements IServiceManager {
        static public IServiceManager asInterface(IBinder obj) {
            if (obj == null) return null; // obj is BpBinder (Client)
            IServiceManager in = (IServiceManager)obj.queryLocalInterface(descriptor);
            if (in != null) { return in; } // BpBinder默认返回null
            return new ServiceManagerProxy(obj); // 实际返回proxy，jni调用BpBinder方法
        } 
        public void addService(String name, IBinder service, boolean allowIsolated) throws RemoteException {
            Parcel data = Parcel.obtain(); Parcel reply = Parcel.obtain();
            data.writeInterfaceToken(IServiceManager.descriptor);
            data.writeString(name);
            data.writeStrongBinder(service); // 将java层Parcel转换为native层Parcel
            data.writeInt(allowIsolated ? 1 : 0);
            mRemote.transact(ADD_SERVICE_TRANSACTION, data, reply, 0); // mRemote为BinderProxy
            reply.recycle(); data.recycle();
        }
        public IBinder getService(String name) throws RemoteException {
            Parcel data = Parcel.obtain(); Parcel reply = Parcel.obtain();
            data.writeInterfaceToken(IServiceManager.descriptor);
            data.writeString(name);
            mRemote.transact(GET_SERVICE_TRANSACTION, data, reply, 0); 
            IBinder binder = reply.readStrongBinder(); // 从reply里面解析出获取的IBinder对象
            reply.recycle(); data.recycle();
            return binder;
        }
    }
    ```
* BinderProxy.transact
    ```
    static jboolean android_os_BinderProxy_transact(JNIEnv* env, jobject obj,
    jint code, jobject dataObj, jobject replyObj, jint flags) {
        ... // java Parcel转为native Parcel
        // gBinderProxyOffsets.mObject中保存的是new BpBinder(0)对象
        IBinder* target = (IBinder*) env->GetLongField(obj, gBinderProxyOffsets.mObject); ...
        // 此处便是BpBinder::transact(), 经过native层，进入Binder驱动程序
        status_t err = target->transact(code, *data, reply, flags); ...
    }
    ```
* BpBinder::transact
    ```
    status_t BpBinder::transact(uint32_t code, const Parcel& data, Parcel* reply, uint32_t flags) {
        ...
        status_t status = IPCThreadState::self()->transact(mHandle, code, data, reply, flags);
        ...
    }
    ```
* IPCThreadState::transact
    ```
    status_t IPCThreadState::transact(int32_t handle,uint32_t code, const Parcel& data, Parcel* reply, uint32_t flags) {
        status_t err = data.errorCheck(); //数据错误检查
        flags |= TF_ACCEPT_FDS; ....
        if (err == NO_ERROR) {
            err = writeTransactionData(BC_TRANSACTION, flags, handle, code, data, NULL); // 传输数据
        } ...
        // 默认情况下,都是采用非oneway的方式, 也就是需要等待服务端的返回结果
        if ((flags & TF_ONE_WAY) == 0) {
            if (reply) {
                err = waitForResponse(reply); //等待回应事件
            } else {
                Parcel fakeReply;
                err = waitForResponse(&fakeReply);
            }
        } else {
            err = waitForResponse(NULL, NULL);
        }
        return err;
    }
    ```
* IWindowManager实例
    ```
    public interface IWindowManager extends android.os.IInterface {
        public static abstract class Stub extends android.os.Binder implements android.view.IWindowManager {
            private static final java.lang.String DESCRIPTOR = "android.view.IWindowManager";

            public Stub() {
                this.attachInterface(this, DESCRIPTOR);
            }

            public static android.view.IWindowManager asInterface(android.os.IBinder obj) {
                if ((obj == null)) return null;
                android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
                if (((iin != null) && (iin instanceof android.view.IWindowManager)))
                    return ((android.view.IWindowManager) iin);
                return new android.view.IWindowManager.Stub.Proxy(obj);
            }

            public android.os.IBinder asBinder() { return this; }

            private static class Proxy implements android.view.IWindowManager {
                private android.os.IBinder mRemote;
                Proxy(android.os.IBinder remote) { mRemote = remote; }
                public android.os.IBinder asBinder() { return mRemote; }
            }
            ...
        }
    }
    ```

# Binder权限管理
* clearCallingIdentity：
    清空远程调用端的uid和pid，用当前本地进程的uid和pid替代
* restoreCallingIdentity:
    恢复远程调用端的uid和pid信息，正好是clearCallingIdentity的反过程

# Binder使用
* 底层方式实现：http://gityuan.com/2015/11/22/binder-use/
* AIDL方式实现：http://gityuan.com/2015/11/23/binder-aidl/

