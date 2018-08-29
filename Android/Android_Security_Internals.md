# Reading notes for Android Security Internals
Android 4.4

# Chapter1: Android's Security Model
### Android's Architecture
* Linux Kernel: Slightly different from a "regular" Linux kernel.  
    New features (Androidisms): Low memory killer, wakelocks, anonymous shared memory, alarms, paranoid networking, and Binder
* Native userspace: consisting of the init binary (first process), several native daemons, hundreds native libraries.
* Dalvik VM: Cannot run Java bytecode directly. Runs Dalvik Executable (DEX).  
    * Dalvik is register-based architecture and JVM is stack-based. 
    * Register-based VMs use fewer instructions but the resulting code is larger than the corresponding code in a stack-based VM. 
    * DEX code is converted to a device-dependent format and stored in an Optimized DEX (.odex) file.
* Java Runtime Libraries: 
    * Core java libraries are originally derived from Apache Harmony project. 
    * Has changed significantly. Have native code dependencies. 
* System services: Implement most of the fundamental Android features
* Inter-Process Communication
    * Processes in Android have separate address spaces and a process cannot directly access another process's memory (process isolation)
* Binder
    * Based on OpenBinder. Similar to Windows Common Object Model (COM) and Common Object Broker Request Architectures(COBRA) on Unix.
    * Binder implementation
        - Binder driver is the central object and all IPC calls go through it
        - IPC is implemented with a single ioctl() call that both sends and receives data through the binder_write_read structure
        - Binder driver managed chunk of memory is read-only to the process, and all writing is performed by the kernel module. 
        - When a process sends a message to another process, kernel allocates some space in the destination process's memory and copy the message data from the sending process.
        - It then queues a short message to the receiving process telling it where the received message is. 
        - Recipient can then access the message directly because it is in its own memory space. 
        - When a process is finished with the message, it notifies the Binder driver to mark the memory as free.
        - Higher-level IPC (Intents, Messengers, ContentProviders, AIDL) are built on top of Binder
    * Binder security
        - Each object that can be accessed through the Binder framework implements the IBinder interface and is called a Binder Object.
        - Calls to a Binder object are performed inside a Binder transaction, which contains a reference to the target object, ID of the method to execute and a data buffer. 
        - Binder driver automatically adds the process ID (PID) and effective user ID (EUID) of the calling process to the transaction data. 
        - The called process (callee) can inspect the PID and EUID and decide whether it should execute the requested method based on its internal logic or system-wide metadata about the calling application.
        - Since PID and EUID filled in by the kernel, caller processes cannot fake their identity (Binder prevents privilege escalation)
    * Binder identity
        - One important property of Binder object is that they maintain a unique identity across processes.  
          Process A creates a Binder object, passes it to B and C, they all operate on the same object. A references the Binder object directly in its memory address, while B and C receives only a handle to the object.
        - A Binder object is a unique, unforgeable, and communicable object that can act as a security token. 
    * Capability-Based security
        - Programs are granted access to a particular resource by giving them an unforgeable capability that both references the target object and encapsulates a set of access rights to it. No need to maintain access control list (ACL).
    * Binder tokens
        - Binder objects can act as capabilities and are called Binder tokens when used in this way. Can be both a capability and a target resource.
        - The possession of a Binder token grants the owning process full access to a Binder object. 
        - Binder object can implement multiple actions with permission checks.  
            - A common pattern is to allow all actions to callers running as system (UID 1000) or root (UID 0), but perform additional permission checks for all other processes. 
            - Access to important Binder objects such as system services is controlled in two ways: by limiting who can get a reference to that Binder object and by checking the caller identity before performing an action to the Binder object (optional, implemented by Binder object itself).
        - A Binder object can be used only as a capability without implementing any other functionality
            - The same Binder object is held by two or more cooperating processes, and the one acting as a server uses the Binder token to authenticate its clients.
            - Used internally by the Android framework and is mostly invisible to applications.  
              One notable use case is Window Tokens. Top-level window of each activity is associated with a Binder token, which Android window manager keeps track of. Applications can obtain their own window token but not others. 
    * Accessing Binder objects
        - Binder framework has a single context manager, which maintains references to Binder objects. 
        - Android's context manager implementation is the ServiceManager native daemon. Started very early in the boot process so that system services can register with it as they startup. 
        - Services are registered by passing a service name and a Binder reference to the service manager. Client obtain service Binder reference by using the name. 
        - Only a small set of whitelisted system processes can register system services. 
    * Other Binder features
        - Reference counting: Guarantees that Binder objects are automatically freed when no one references them.   
          Implemented in the kernel driver with BC_INCREFS, BC_ACQUIRE, BC_RELEASE and BC_DECREFS commands. 
        - Death notification: Allows applications that use Binder objects that are hosted by other processes to be notified when those processes are killed by the kernel and to perform any necessary cleanup.   
          Implemented with BC_REQUEST_DEATH_NOTIFICATION and BC_CLEAR_DEATH_NOTIFICATION commands in kernel driver and linkToDeath() and unlinkToDeath() methods of the IBinder interface in the framework. 
* Android Framework Libraries
    * Includes the basic blocks for building Android applications, such as the base classes for activities, services, content providers, GUI widgets, classes for file and database access, classes that interact with device hardware
    * Accessed via facade classes called managers, which backed by a corresponding system service. 
* Applications: Programs that user directly interact with. 
    * System apps: Included in the OS image, which is read-only on production devices. Given more privileges. 
    * User-installed apps: Lives in a dedicated security sandbox. 
* Android App Components
    * Android applications are a combination of loosely coupled components and can have more than one entry point. 
    * Components, entry points, additional metadata are defined in the application's manifest file, AndroidManifest.xml.
### Android's security model
* Application Sandboxing
    * Android automatically assigns a unique UID, often called an app ID, to each application at installation and executes that application in a dedicated process running as that UID.
        - Automatically generated UIDs for applications start at 10000 (AID_APP), and the corresponding usernames are in the form app_XXX or uY_aXXX (eg. u0_a37)
    * Each application is given a dedicated data directory which only it has permission to read and write to. 
        - Data directory is named after its package name and is created under /data/data on single-user devices. All files insdie the data directory are owned by the dedicated Linux user (uY_aXXX)
    * Shared user ID: Applications can be installed using the same UID, in which case they can share files and even run in the same process. 
        - Used extensively by system applications, which often needs to use the same resources across different packages for modularity.
        - Available to third-party apps but not recommended. Need to be signed by the same code signing key. 
* SELinux
    * Discretionary access control (DAC): Once a user gets access to a particular resource, they can pass it on to another user at their discretion, such as by setting the access mode to world-readable.
    * Mandatory access control (MAC: Ensures that access to resources conforms to a system-wide set of authorization rules called a policy.  
      Policy can only be changed by an administrator.
    * Security Enhanced Linux (SELinux) is a MAC implementation for the Linux kernel.  
      Used to isolate core system daemons and user applications in different security domains and to define different access policies for each domain. 

# Chapter 2: Permissions (Android 4.4)
* Permission Management
    * Permissions are assigned to each application at install time by the system package manager service. 
    * Package manager maintains a central database of installed packages, with information about the install path, version, signing certificate, and assigned permissions of each package, as well as a list of all permissions defined on a device.   
      Stored in the XML /data/system/package.xml, updated each time an application is installed, updated, or uninstalled. 
* Permission Protection Levels
    * normal: Default value. Defines a permission with low risk to the system or other applications. Automatically granted without requiring user conformation. 
    * dangerous: Give access to user data or some form of control over the device. 
    * signature: Only granted to applications that are signed with the same key as the application that declared the permission. 
    * signatureOrSystem: Granted to applications that are either part of the system image, or that are signed with the same key as the app declares the permission. 
* Permission Assignment
    * Higher-level components such as applications and system services query the package manager to determine which permissions have been assigned to an application and decide whether to grant access.
    * Lower-level components like native daemons typically do not have access to the package manager and reply on the UID, GID and supplementary GIDs assigned to a process. 
    * Access to system resources like device files, Unix domain sockets (local sockets) and network sockets is regulated by the kernel based on the owner and access mode of the target resource and the UID and GIDs of the accessing process.
    * Permissions and process attributes
        - Each Android application is assigned a unique UID at install time and executes in a dedicated process
        - When the application is started, the process's UID and GID are set to the application UID assigned by package manager.
        - Additional permissions are mapped to GIDs and assigned as supplementary GIDs to the process.  
          - Permission to GID mappings for built-in permissions are defined in /etc/permission/platform.xml
          ```
          <permission name="android.permission.WRITE_EXTERNAL_STORAGE">
            <group gid="sdcard_r" />
            <group gid="sdcard_rw" />
          </permission>
          <assign-permission name="android.permission.MODIFY_AUDIO_SETTINGS" uid="media">
          ```
          - assign-permission is used to assign higher-level permissions to system processes running under a specific UID that do not have a corresponding package.
          - Android does not have an /etc/group file, so the mapping from group names to GIDs is static and defined in android_filesystem_config.h
    * Process attribute assignment
        - Android uses a partially initialized process called zygote and forks it when it needs to start a new application.  
          Forked process inherits the memory image of the zygote process, which has preloaded most core and application framework Java classes.
        - Child process is able to change its resource limits and all process attributes because it initially executes as root, just like its parent process zygote. After new process attributes are set, child process with the assigned UID and GIDs cannot go back as root. 
* Permission Enforcement
    * Kernel-level enforcement  
      Access to regular files, device nodes, and local socket is regulated just as it i sin any Linux system.  
      One Android-specific addition is network socket. (Android M changed to normal permission level )
    * Native daemon-level enforcement  
      Lower-level native daemons often use Unix domain sockets for IPC, standard filesystem permission can be used to control access.
    * Framework-level enforcement  
      Declare required permissions in the manifest of the application. System keeps track of the permissions associated with each component and checks to see whether calls have been granted the required permissions before allowing access.  
        - Dynamic enforcement  
          Context.checkPermission(String permission, int pid, int uid)
            - Returns PERMISSION_GRANTED if the passed UID has the permission, return PERMISSION_DENIED otherwise.
            - If the caller is root or system, the permission is automatically granted. 
            - If the requested permission has been declared by the calling app, it is granted without examining the actual permission.
            - Checks to see whether the target component is public (exported) or private, and denies access to all private components.
            - Queries the package manager service to see if the caller has been granted the requested permission. 
        - Static enforcement  
            - When an application tries to interact with a component declared by another application.
            - Permission checks are performed by the ActivityManagerService, which resolves the specified intent and checks to see whether the target component has an associated permission attribute. 
        - Activity and Service permission enforcement  
          Permission checks are performed for startActivity(), startActivityForResult(), startService(), stopService(), bindService()
        - Content provider permission enforcement  
          Read permission for ContentResolver.query(), write permission for insert(), update(), delete()
        - Broadcast permission enforcement  
            - Can require that receiver hold a particular permission by using Context.sendBroadcast(Intent intent, String receiverPermission).  
            - Broadcasts are async, no permission check when calling the method. Check is performed when delivering the intent. If no permission, skipped without exception. 
            - Receiver can also require that broadcasters hold a specific permission in order to be able to target it.
        - Protected and sticky broadcasts  
            - Some broadcasts can only be sent by a system process running with system UIDs. 
            - Sticky broadcasts (system will preserves the Intent object) requires that the sender holds BROADCAST_STICKY permission.
* System permissions
    - Framework classes are packaged in JAR files in /system/framework/
    - A framework-res.apk packages framework resources without actual code, and defines the android package and system permissions.  
        - AndroidManifest.xml defines permissions and permission groups.  
          < permission-group > specifies a name for a set of related permissions to display related permissions in the system UI, but each permission still needs to be requested individually. 
    - Signature permissions  
      System applications are signed by a platform key. 4 different keys:  
      - platform: Signs all packages considered part of the core platform (System UI, Settings, Phone, Bluetooth, etc)
      - shared: Signs search and contacts related packages
      - media: Signs gallery app and media related providers
      - testkey (releasekey for release builds): Signs everything else.
      - framework-res.apk is signed with platform key. Any app trying to request a system permission with signature protection level needs to be signed with the platform key. 
* Shared User ID
    * Android applications signed with the same key can request to run as the same UID, and optionally in the same process.
    * Extensively used by core framework. Available to third-party app but not recommended.
    * Enabled by adding sharedUserId attribute to AndroidManifest.xml root element. If shared UID does not exist, it is created. If another package with the same shared UID is installed, the signing certificate is compared. INSTALL_FAILED_SHARED_USER_INCOMPATIBLE error if not match. 
    * Not able to change. Have to design from start. 
    * Built-in shared UIDs: android.uid.system(1000), .phone(1001), .bluetooth(1002), .log(1007), .nfc(1027)
    * Inherit the permissions from the shared user.
    * Applications that are part of a shared user can run in the same process, because they have the same Linux UID, and can access the same system resources. Google applications run in the same process under com.google.uid.shared shared user.
* Custom Permissions
    * Permissions declared by third-party applications.
    * System can only grant a permissions it knows about. Application that defines the custom permissions need to be installed before the applications that use the permissions. If an application requests a permission unknown to system, it is ignored and not granted. 
    * Applications can also add new permissions dynamically using android.content.pm.PackageManager.addPermission() and remove them using removePermission(). Added permissions must belong to a permission tree defined by the application. 
    * Custom permissions defined by applications are registered using a "first one wins" strategy.  
      - Can result in permission protection level downgrade: If A's permission definition has a lower protection level than B and A is installed first, access to B's components protected by B's permission will not require callers to be signed with the same key as B. 
      - When using custom permissions to protect components, be sure to check whether the currently registered permission has the protection level your app expects. https://github.com/commonsguy/cwac-security
* Public and Private Components
    * Private components can be called only by the declaring application, public ones are available to other applications. 
    * All components are private by default except content providers (changed in Android 4.2 to private as well).
    * Public by exported=true or implicitly by declaring an intent filter. 
* Activity and Service Permissions
    * Activities and services can be protected by a single permission set with the permission attribute of the target component. 
* Broadcast permissions
    * Can be specified both by the receiver and the sender. 
    * Context.sendBroadcast(Intent intent, String receiverPermission)
    * Android 4.0 can use Intent.setPackage(String packageName) to limit the scope of receivers. 
    * Multi-user: sendBroadcastAsUser(Intent intent, UserHandler user) sendBroadcastAsUser(Intent intent, UserHandler user, String receiverPermission)
    * Receiver uses permission attribute in the < receiver > tag in the manifest or dynamic registerReceiver(BroadcastReceiver receiver, IntentFilter filter, String broadcastPermission, Handler scheduler)
* Content Provider Permissions
    * Static provider permissions  
    ```
    <provider android:readPermission="android.permission.READ_CONTACTS" android:writePermission="android.permission.WRITE_CONTACTS">
        <!-- Per-URI permission: Higher priority than the component-level permission -->
        <path-permission android:pathPattern="/contacts/.*/photo" android:readPermission="android.permission.GLOBAL_SEARCH" />
    </provider>
    ```
    * Dynamic provider permissions  
        - Dynamically grant temporary per-URI access using Context.grantUriPermission(String toPackage, Uri uri, int modeFlags) and remove access using revokeUriPermission(Uri uri, int modeFlags). 
        - Enabled by setting the global grantUriPermissions attribute to true or by adding a < grant-uri-permission > tag. 
        - Often set FLAG_GRANT_READ_URI_PERMISSION or FLAG_GRANT_WRITE_URI_PERMISSION to intent to start the application. 
        - Android 4.4: Can persist per-URI access grants by ContentResolver.takePersistableUriPermission(). Grants are persisted to /data/system/urigrants.xml and can be revoked by releasePersistableUriPermission()
* Pending Intents
    * Pending intents encapsulate an intent and a target action to perform with it. Also includes the identity of the application that creates it. 
    * When an application creates a pending intent, the system retrieves its UID and PID using Binder.getCallingUid() and Binder.getCallingPid(). Based on those, the system retrieves the package name and user ID of the creator and stores them in a PendingIntentRecord along with the base intent and any additional metadata. Activity manager keeps a list of active pending intents by storing the corresponding records and when triggered, retrieves the necessary records. It then uses the information in the record to assume the creator id and execute the action. 

# Chapter 3: Package Management
## Android Application Package Format  
    APK format is an extension of the Java JAR format, which in turn is an extension of the ZIP format.  
    MIME type: application/vnd.android.package-archive
* Java code signing
    - MANIFEST.MF has entries with the filename and digest value of each file in the archive.
    - Signature file (CERT.SF) contains the digest of the whole manifest and digests for each entry in MANIFEST.MF. 
    - Actual signature is in CMS format and includes the signature value and signing certificate. .RSA, .DSA, .EC.  
      Can have multiple signature .SF and .RSA/DSA/EC files 
* Android code signing
    - Do not validate signing certificate in PKI sense. Signing certificate can be self-signed, expired, without trusted CA. 
    - All APK entries must be signed by the same set of certificates.
## APK Install Process
* Location of Application Packages and Data
    * System apps: Most are in /system/app/, /system/priv-app/ holds privileged apps which can be granted signatureOrSystem permission level. /system/vendor/app/ hosts vendor-specific applications. 
    * Must user-installed apps are in /data/app/
    * Data directories for both system and user apps are created on the userdata partition under /data/data/. userdata partition also hosts the optimized DEX files (/data/dalvik-cache/), system package database (/data/system/packages.xml), and other system databases and settings. 
* Active Components
    * PackageManagerService: Responsible for parsing APK files, starting install, upgrading and uninstalling packages, maintaining the package database, and managing permissions. Runs in the system server process.   
      android.content.pm.PackageManager facade class exposes a subset of the functionalities of the PckageManagerService to third-party apps.
    * Installer class: connects to the installd daemon through /dev/socket/installd Unix domain socket and encapsulates the installd command-oriented protocol. PackageManagerService lacks of superuser rights and use installer to delegates privileged operations. 
    * installd daemon: A native daemon with elevated privileges that provides application and user directory management functionality to the system package manager. Also used to optimize DEX files.  
      Accessed via the installd local socket, which is only accessible to processes running as system UID.  
      Does not execute as root but instead takes advantage of the CAP_DAC_OVERRIDE and CAP_CHOWN Linux capabilities to set owner and group UID.
    * MountService: Mounting detachable external storage such as SD cards, opaque binary blob(OBB) files, which are used as expansion files for apps. Also manages secure containers, which hold application files that should not be accessible to non-system applications. Secure containers are encrypted and used to implement a form of DRM called forward locking for paid apps. 
    * vold daemon: Android's volume management daemon. Runs as root to provide privileged operations for MountService. 
    * MediaContainerService: Copies APK files to their final install location or encrypted container, and allows PackageManagerService to access files on removable storage. 
    * AppDirObserver: Monitors app directory for APK file changes and calls PackageManagerService
* Installing a Local Package
    * Parsing and verifying the package
    * Accepting permissions and starting the install process
    * Copying to the application directory /data/app/. By default, APK files are world-readable. 
    * Package scan, creating data directories, generating optimized DEX
    * Adding the new package to packages.xml, updating components and permissions
* Installing Encrypted APK
    * adb install [-l] [-r] [-s] [--algo < algo name > --key < hex-encoded key > --iv < hex-encoded iv >] < file >
    * pm install -r --algo xxx --key hex_encoded --iv hex_encoded --macalgo HmacSHA1 --mackey hex_encoded --tag hex_enc file
* Forward Locking (Android 4.1)
    * Encrypted app containers: Android Secure External Caches (ASEC containers). 
    * Install process of forward-locked APK involves two additional steps: Creating and mounting the secure container, and extracting the public resource files from the APK file. 
    * INSTALL_FORWARD_LOCK flag is set when installing a paid app. Free apps are decrypted and APKs end up in /data/app, while an encrypted container in /data/app-asec/ is created and mounted under /mnt/asec/< package-name > for paid apps. 
* Package Verification
    * APK scanned by a verifier prior to installation and system shows a warning or blocks installation if the verifier deems the APK potentially harmful. 
    * Verification agents:
        - Declaring a broadcast receiver with an intent filter matches PACKAGE_NEEDS_VERIFICATION and the APK file MIME type
        ```
        <receiver android:name=".MyPackageVerificationReceiver" android:permission="android.permission.BIND_PACKAGE_VERIFIER">
            <intent-filter>
                <action android:name="android.intent.action.PACKAGE_NEEDS_VERIFICATION" />
                <action android:name="android.intent.action.PACKAGE_VERIFIED" />
                <data android:mimeType="application/vnd.android.package-archive">
            </intent-filter>
        </receiver>
        ```
        - Needs to be granted PACKAGE_VERIFICATION_AGENT permission.

# Chapter 4: User Management
* Types of Users
    * Primary user (owner): 
        - The first user created on a multi-user device. User ID 0. 
        - Assigned all privileges and can create and delete other users, change system settings that affect all users. 
    * Secondary users:
        - All added users are secondary users. Each gets a dedicated user directory, their own list of installed apps, and private data directories for each installed app.
        - Cannot add or manage users
    * Restricted profiles: 
        - Based on primary user and share its applications, data and accounts with certain restrictions. 
        - Restrictions to control what users are allowed to do
    * Guest user: Android supports a single guest user. Disabled by default
* User Management
    * UserManagerService to read and persist user information and maintain the list of active users. 
    * android.os.UserManager prvides a facade to UserManagerService and exposes a subset of the functionality to third party applications.
    * pm list users
    * User states and related broadcasts: USER_ADDED, USER_REMOVED, USER_INFO_CHANGED. USER_BACKGROUND, USER_FOREGROUND, USER_SWITCHED
    * Supports 8 users but only 3 can be running at a time. Stops user in LRU. Primary user never stops. When a user is stopped, its processes are killed and it no longer receives any broadcasts. 
* User metadata
    * /data/system/users/: Each user has own xml and data directory
* Per-User Application Management
    * Each user gets own copy of application data that cannot be accessed by other users. 
    * Assigning a new, per-user effective UID for each application and create a dedicated application data directory owned by that UID.
    * Application data directories
        - Primary data is still in /data/data for backward compatibility
        - User data directories are in /data/user/ and named after the user's ID. Device owner directory (0/) is a symbolic link to /data/data.
    * On multi-user devices, the app UID is derived from the user ID and the app ID:  
      uid = userId * 100000 + (appId % 100000)
    * Application sharing
        - APK/libraries/optimized DEX files are shared. Once an application is installed, it is accessible to all users. 
        - package-restrictions.xml in the system directory of each user to track whether an app is enabled for a user or not.  
          Also contains information about the disabled components of each app, a list of preferred apps. 
* External Storage
    * Filesystem in Userspace (FUSE)
        - A Linux feature that allows the implementation of a fully functional filesystem in a userspace program. 
        - Use a generic FUSE kernel module that routes all Virtual Filesystem (VFS) system calls for the target filesystem to its userspace implementation, via a special file descriptor /dev/fuse
    * Android 4.4: App only allowed to write arbitrary files on primary external storage. Limited access to other secondary external storages. 
    * Multi-User external storage
        - Each user instance on an Android device must have separate and isolated external storage directories.
        - Leverages three Linux kernel features: Mount namespaces, bind mounts, and shared subtrees
            - Per-process mount namespaces, which allows each process to have its own set of mount points. 
            - bind mount allows a directory or file to be mounted at another path in the directory tree, making the same file or directory visible at multiple locations
            - Shared subtrees provides a way to control how filesystem mounts are propagated across mount namespaces
        - Android implementation
            - Android 4.4, mounting external storage directly is no longer supported but emulated using FUSE sdcard daemon, even for sdcard.
            - Creates emulated filesystem at /mnt/shell/emulated/
            - Each user gets a dedicated external storage data directory named after their user ID. 
              eg: /mnt/shell/emulated/0, /mnt/shell/emulated/10, /mnt/shell/emulated/11
            - Android uses a combination of mount namespaces and bind mounts in order to make each user's external storage data directory available only to the applications that the user starts, without showing them other user's data directories. 
        - External storage permissions
            - In order to emulated the FAT filesystem, sdcard FUSE daemon assigns fixed owner, group and access permissions to each file or directory on external storage. Permissions are not changeable and symlinks and hardlinks are not supported. 

# Chapter 5: Cryptographic Providers
(Ignored)
# Chapter 6: Network Security and PKI
(Ignored)

# Chapter 7: Credential Storage
## Credential Storage Implementation
* KeyStore Service
    * Key files: /data/misc/keystore/user_x  
        Sample: .masterkey 1000_USRCERT_test 1000_USRPKEY_test
        - .masterkey is encryupted with AES128 key derived from the screen unlock password by applying PBKDF2 8192 iterations and 128 random salt. salt is stored in .masterkey file's info header. 
        - All other files store key blobs: Metadata header, IV, MD5 hash of data, and AES128 master key encrypted data. 
        - Each file name consists of the app UID, the entry type (CA certificate, user certificate, or private key), and the key name (alias)
        - When an app that owns store-managed keys is uninstalled for a user, only keys created by that user are deleted. 
        - If an app is completely removed form the system, its keys are deleted for all users. 
    * Access restrictions
        - Key blobs are owned by the keystore user, need to go through keystore service to access them. 
        - root user cannot lock or unlock the keystore but can access system keys
        - system user can perform most keystore management operations but cannot use or retrieve other user's keys.
        - Non-system user can insert, delete, and access keys but can only see their own keys. 
* keymaster module and keystore service implementation
    * Android 4.1 introduced a keymaster Hardware Abstraction Layer (HAL) system module for generating asymmetric keys and signing/verifying data without the need to export the keys. 
    * softkeymaster module performs all key operations in software only (OpenSSL). Used on the emulator and devices that lack cryptographic hardware. 
    * HAL module interface is defined in hardware/keymaster.h and only provides asymmetric operations:  
      generate_keypair, import_keypair, sign_data, verify_data, get_keypair_public, delete_keypair, delete_all
    * Service registered as android.security.keystore, implemented in C++ and resides in system/security/keystore/
    * Nexus 4 hardware-backed implementation
        - ARM TrustZone provides two virtual processors: Secure world for security subsystem, Normal world for everything else.
        - Applications running in secure world are referred to as trusted applications and can only be accessed by normal world apps through a limited interface that they explicityl expose. 
    * Framework integration
        - android.security.KeyStore is a hidden class to obtain a reference to the keystore service and serves as a proxy to IKeystoreService interface it exposes. 
* KeyChain API implementation
    * Public KeyChain class and supporting interfaces reside in the android.security Java package. 
    * Package contains two hidden AIDL files: IKeyChainService.aidl and IKeyChainAliasCallback 
    * KeyChainService is a wrapper for the android.security.KeyStore proxy class that directly communicates with the native keystore service. 
    * Access control: Based on caller's UID and using a key access grant database to regulate access to individual keys.  
      /data/data/com.android.keychain/databases/grants.db maps UIDs to the key aliases they are allowed to use. 
    * KeyChainBroadcastReceiver: Listens for android.intent.action.PACKAGE_REMOVED and delete dead entries. 

# Chapter 8: Online Account Management  
Android provides a centralized registry of user online accounts via the AccountManager class, which let you get tokens for existing accounts without having to handle the raw user credentials and register your own custom account types. 
* Account Management Implementation
    * AccountManager is a facade for AccountManagerService, which doesn't provide an implementation for any particular form of authentication.
        - It merely coordinates a number of pluggable authenticator modules for different account types. 
        - Any app can register an authenticator module by implementing and account authenticator and related classes. 
    * Authenticator modules are defined and hosted by applications, and each is a bound service that implements android.accounts.IAccountAuthenticator AIDL interface. 
        - Has methods for adding an account, prompting the user for their credentials, getting an authentication token and for updating account metadata. 
        - Practically extends AbstractAccountAuthenticator class. 
        - Each authenticator module implements an account id uniquely by a string called account type. 
        - The service can be bound to by using the android.accounts.AccountAuthenticator intent action. 
    * Operations and permissions
        - Listing and authenticating accounts: 
            - getAccounts() hasFeatures(): Require normal protection level GET_ACCOUNTS permission. 
            - addAccount(): dangerous protection MANAGE_ACCOUNTS permission
            - addAccountExplicitly() getPassword() getUserData() peekAuthToken() setAuthToken() setPassword() setUserData()  
                dangerous protection level AUTHENTICATE_ACCOUNTS permission and same UID as the account's authenticator
        - Managing accounts: clearPassword() confirmCredentials() editProperties() invalidateAuthToken() removeAccount() updateCredentials()  
                require MANAGE_ACCOUNT permission
        - Using account credentials: getAuthToken() invalidateAuthToken()
            - USE_CREDENTIALS permission protects methods that return or modify authentication tokens
            - token: A service-dependent credential string that clients can use to authenticate requests to the server without sending their password with each request. Server returns an authenticator token after the client successfully authenticates with user name and password. 
    * Accounts database
        - /data/system/users/< user ID >/accounts.db
        - tables: accounts, extras, authtokens, grants, shared_users, meta
        - Password security: Not encrypted. Encrypting or protecting credentials is left to the authenticator module to implement. 

# Chapter 9: Enterprise Security
# Chapter 10: Device Security
## Controlling OS Boot-Up and Installation
* Bootloader
    * A specialized, hardware-specific program that executes when a device is first powered on. 
    * Initialize device hardware, optionally provide a minimal device configuration interface, and then find and start the operating system.
* Recovery
    * Recovery is a minimal Linux-based OS that includes a kernel, RAM disk with various low-level tools, and a minimal UI.
    * Apply post-ship updates. Stored on a dedicated partition. 
    * Can replace the main OS and can also allow unrestricted root access via ADB on non-encrypted devices. 
    * userdata partition could be encrypted, making direct data access impossible, it is trivial to install a malicious program (rootkit) on the system partition in recovery mode. Rootkit can enable remote access to the device and user data when main OS is booted and data is decrypted. 
    * Verified boot can prevent rootkit but only if the device verifies the boot partition using an unmodifiable verification key stored in hardware.
* Verified Boot
    * Based on dm-verify device-mapper block integrity checking target. 
    * Device-mapper is a Linux kernel framework that provides a generic way to implement virtual block devices, mapping a virtual block device to one or more physical block devices and optionally modifying transferred data in transit. 
    * dm-verify is implemented using a precalculated hash tree (Merkle tree) that includes the hashes of all device blocks. 
* Disk Encryption
    * Full Disk Encryption (FDE) promises that everything on disk is encrypted, including OS files, cache and temporary files. 
    * In practice, a small part of the OS, or a separate OS loader, must be unencrypted so that it can obtain the decryption key and then decrypt and mount the disk volumes used by main OS. 
    * Disk encryption key is usually stored encrypted and requires an additional key encryption key (KEK). KEK can either be stored in a hardware module (smart card or TPM), or derived from a passphrase obtained from the user on each boot. 
    * Android's FDE only encrypts the userdata partition, which stores system configuration files and application data. 
    * boot and system partitions, which store the kernel and OS files, are not encrypted, but system can optionally be verified using Verified Boot. 
    * Cipher mode: dm-crypt, AES-128-CBC  
    * Encrypted Salt-Sector Initialization Vector (ESSIV): Derive a secondary key s form the disk encryption key K, called a slat. Then uses the salt as an encryption key and encrypts the sector number SN of each sector to produce a per-sector IV. 
    * ESSIV does not change CBC's malleability property and does not ensure the integrity of encrypted blocks. Attacker who knows the original plaintext stored on disk can manipulate stored data and even inject a backdoor on volumes that use CBC for disk encryption. 
    * Can switch to XTS
    * Key derivation: 
        - PBKDF2 2000 iterations 128 bit random salt. 
        - Android 4.4 chagned to scrypt, specifically designed to require large amounts of memory. N=32768, r=8, p=2
    * Desk encryption password: Device unlock PIN or password. Changing PIN also changes encryption password.

# Chapter 11: NFC and Secure Element
# Chapter 12: SELinux
* SELinux Introduction
    * SELinux is a mandatory access control mechanism for the Linux kernel, implemented as a Linux security module. 
    * Linux Security Modules (LSM) framework allows third-party access control mechanisms to be linked into the kernel and to modify the default DA implementation. 
    * LSM is implemented as a series of security funtion hooks (upcalls) and related data structures that are integrated into the vairous modules of the Linux kernel responsible for access control.
    * If no security module is installed, Linux uses its built-in DA mechanism to regulate access. If a security module is installed, Linux consults it in addtion to the DAC in order to reach a final security decision. 
    * SELinux was the first LSM module integrated into the Linux kernel and has been officially available since version 2.6.
* Mandatory Access Control (MAC)
    * Based on three main concepts
        - Subjects: The active actors that perform actions on objects, usually the running process. 
        - Objects: OS-level resources managed by the kernel, such as files and sockets. 
        - Actions: Action is carried out only if the security policy allows it
        - Mac policy is only consulted if the DA allows access to a resource. 
    * Two forms of MAC: type enforcement (TE) and multi-level security (MLS). MLS not used in Android.  
        - TE requires that all subjects and objects have an associated type and SELinux uses this type to enforce the rules of its security policy.  
        - type is simply a string that's defined in the policy and associated with objects or subjects. 
        - subject types reference processes or groups of processes are also referred to as domains. 
* SELinux modes
    - disabled: No policy is loaded and only the default DAC security is enforced
    - permissive: Policy is loaded and object access is checked, but access denial is only logged - not enforced. 
    - enforcing: Security policy is loaded and enforced with violations logged. 
    - On Android, SELinux mode can be checked and changed with getenforce and setenforce. Not persistent and reset after reboot. 
* Security Context
    * A string with four fields delimited with colons: username, role, type and an optional MLS security range. 
    * For objects (usually associated with a file), security context is persistent and usually stored as an extended attribute in the file metadata.  
      Objects typically inherit the type label of their parent. Can also receive a different label (called type transition) if allowed by policy. 
    * Subjects inherit the security context of their parent process, or they can change via domain transition if allowed by policy.  
      Policy can specify automatic domain transition as well. 
* Security Policy
    * SELinux security policy is used by the security server in the kernel to allow or disallow access to kernel objects at runtime. 
    * Typically in a binary form generated by policy source files.
    * Policy statements contains: Type and attribute, user and role, object class and permission, type transition rules, domain transition rules, access vector rules (allow, auditallow, dontaudi, neverallow)
* Android implementation
    * Android has its extensions in kernel and userspace
    * Kernel changes: LSM hooks on Binder driver, binder object class
    * Userspace chagnes: (Ignored)
    * Android 4.4 SELinux policy: (Ignored)

# Chapter 13: System Updates and Root Access
## Root Access
* Commercial devices use the user build variant. 
  getprop ro.build.type -> user  
  getprop ro.secure -> 1
  eng and userdebug build 
* Root access on production builds
    * Rooting by changing the boot or system image
        - On some devices, a user build can be turned into an engineering or userdebug build by flashing a new boot image, which changes the value of ro.secure and ro.debuggable system properties. Changing these properties allows ADB daemon to execute as root and enables root access via Android shell. 
        - Another way is to unpack the system image, add SUID su binary or a similar utility, and overwrite the system partition with the new system image. This would typically allow root access not only from the shell but from third-party applications as well. However, Android 4.3 disallow apps from executing SUID programs by dropping all capabilities from the bounding set of Zygote-spawned processes, and mounting the system partition with the nosetuid flag.
        - Additionally, on Android versions that set SELinux to enforcing mode, executing a process with root privileges does not typically change its security context, and such a process is still limited by the MAC policy. 
* Rooting by flashing an OTA package
    * SuperSU (ignored)
* Rooting via exploits
    * On production devices that don't have an unlockable bootloader, root access can be obtained by exploiting a privilege escalation vulnerability, which allows an app or shell process to start a root shell (also called soft root) and modify the system. 
    * The exploits are typically packaged into "one-click" apps or scripts, which ty to persist root access by installing a su binary or modifying system configuration. 
