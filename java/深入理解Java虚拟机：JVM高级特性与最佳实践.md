# 深入理解Java虚拟机：JVM高级特性与最佳实践
深入理解Java虚拟机：JVM高级特性与最佳实践 第2版 笔记

## 第一章：走进Java

# 自动内存管理机制
## 第二章：Java内存区域与内存溢出异常
### 2.2 运行时数据区域
1. 程序计数器
    * Program Counter Register是一块较小的内存空间，可以看作是当前线程所执行的字节码的行号指示器
    * 一个内核只会执行一条线程中的指令，每条线程都需要有一个独立的程序计数器
    * 如果执行的是一个方法，计数器记录的是正在执行的虚拟机字节码指令的地址；如果是Native方法，计数器为undefined
2. Java虚拟机栈
    * Java Virtual Machine Stacks也是线程私有，生命周期与线程相同。
    * 每个方法在执行的同时都会创建一个栈帧（Stack Frame）用于存储局部变量表，操作数栈，动态链接，方法出口等信息；方法调用到完成的过程对应栈帧入栈到出栈的过程
    * 局部变量表所需内存空间在编译期间完成分配，方法运行期间不会改变局部变量表的大小
    * 如果线程请求的栈深度大于虚拟机所允许的深度，将抛出StackOverflowError；如果虚拟机栈动态扩展时无法申请到足够内存，抛出OutOfMemoryError
3. 本地方法栈
    * Native Method Stack执行Native方法；虚拟机规范中未强制规定本地语言，使用方式与数据结构，由虚拟机自由实现
4. Java堆
    * Java Heap是被所有线程共享的一块内存区域，在虚拟机启动时创建。唯一目的是存放对象实例，几乎所有对象实例都在这里分配内存。
    * Java堆是GC管理的主要区域。
5. 方法区
    * Method Area与Java Heap一样，是各个线程共享的内存区域，用于存储已被虚拟机加载的类信息，常量，静态变量，即使编译器编译后的代码等数据。
    * 如何实现方法区不受虚拟机规范约束
6. 运行时常量池
    * Runtime Constant Pool是方法区的一部分，用于存放编译器生成的字面量和符号引用。
    * 运行期间也可将新的常量放入池中，常用的有String intern()
7. 直接内存
    * Direct Memory不是虚拟机运行时数据区的一部分，也不是虚拟机规范中定义的内存区域。
    * NIO（New Input/Output）类引入了一种基于通道（Channel）与缓冲区（Buffer）的I/O方式，可以使用Native函数库直接分配堆外内存，然后通过一个存储在Java堆中的DirectByteBuffer对象作为这块内存的引用进行操作。
### 2.3 HotSpot虚拟机对象探秘
1. 对象的创建
    * 虚拟机遇到new指令时，首先去检查指令的参数是否能在常量池中定位到一个类的符号引用，并且检查类是否已被加载，解析和初始化过；如没有，执行类加载过程
    * 类加载检查通过后，虚拟机将为新生对象分配内存。所需内存大小在类加载完成后便可完全确定，从Java堆中分配一块确定大小的内存。
        * 指针碰撞（Bump the Pointer）方式：假设Java堆中内存是绝对规整的，所有用过的在一边，空闲的在另一边，中间指针作为指示器，分配内存就是把指针向空闲空间挪动一段与对象大小相等的距离。
        * 空闲列表（Free List）方式：维护一个列表记录哪些内存块可用，分配时从列表中找到一块足够大的空间划分给对象实例。
        * 线程安全：对分配空间的动作进行同步处理，采用CAS配上失败重试的方式保证更新操作的原子性；或按照线程划分在不同的空间中进行，即每个线程在Java堆中预先分配一小块内存，成为本地线程分配缓冲（Thread Local Allocation Buffer，TLAB）
    * 内存分配完成后，虚拟机将分配到的内存空间初始化为零值，然后进行必要的设置，如是那个类的实例，如何查找类的元数据信息，对象的hash，GC分代年龄等。信息存放在对象的对象头（Object Head）
    * 执行`<init>`函数
2. 对象的内存布局
  * HotSpot中，对象在内存中的布局可以分为三块：
    * 对象头：一部分存储运行时数据，如HashCode，GC分代年龄，锁状态标志，线程持有的锁，偏向线程ID，偏向时间戳等，称为Mark Word；另一部分是类型指针，即对象指向它的类元数据的指针；另外如果是数组，还需有数组长度
    * 实例数据：对象真正存储的有效信息，即程序代码中所定义的各种类型的字段内容。存储顺序受虚拟机分配策略和字段在源码中定义顺序影响，相同宽度的字段被分配到一起，父类中定义的变量在子类前(子类中较窄的变量也可能会插入到父类变量的空隙中)。
    * 对齐填充：HotSpot内存管理要求对象起始地址必须是8字节的整数倍
3. 对象的访问定位
    * Java程序通过栈上的reference数据来操作堆上的具体对象
    * 规范中未定义如何通过引用去定位，访问堆中对象的具体位置，具体方式取决于虚拟机实现
        * 句柄访问：Java堆中划分一块内存作为句柄池，reference中存储的是对象的句柄地址，句柄中包含对象的实例数据与类型数据各自的具体地址信息。优势是在对象移动时只需改变句柄中的实例数据指针，reference本身不需修改。
        * 使用指针直接访问：reference中存储的直接就是对象地址，对象中放置类型数据地址。速度更快，节省了一次指针定位的时间开销。
### 2.4 实战：OutOfMemoryError异常
1. Java堆溢出：while(true) list.add(new Object()); -> OutOfMemoryError: Java heap space  
   解决方法：通过内存映像分析工具对dump出来的快照分析，确认Leak还是Overflow。Leak查看GC Roots引用链；非泄漏尝试增加JVM堆参数，检查是否某些对象生命周期过长
2. 虚拟机栈和本地方法栈溢出：void leak() { leak(); } -> StackOverflowError: 
3. 方法区和运行时常量溢出：while(true) list.add(String.valueOf(i++).intern()) -> OutOfMemoryError: PermGen space （1.7 may not be this error)
    - String.intern()是一个Native方法：如果字符串常量池中已经包含一个等于此String对象的字符串，则返回池中对象；否则，添加并返回对象。
    - 方法区溢出也是一种常见内存溢出，在经常动态生成大量Class的应用中，需要特别注意类的回收状况。
4. 本机直接内存溢出：通过reflection使用unsafe.allocateMemory(xxx) -> OutOfMemoryError  
   Heap Dump中不会看见明显异常，如果dump文件很小，程序中有调用nio，可以考虑此方面原因。

## 第三章：垃圾收集器与内存分配策略
### 3.2 对象已死吗
1. 引用计数算法
    * 主流JVM没有选用引用计数法来管理内存，主要原因是它很难解决对象之间相互循环引用的问题。
2. 可达性分析算法
    * 主流商用程序语言都是通过可达性分析（Reachability Analysis）来判定对象存活的
    * 通过一系列被称为GC Roots的对象作为起始点向下搜索，搜索走过的路径称为引用链（Reference Chain），当一个对象到GC Roots没有任何引用链相连时，则此对象不可用
    * 可作为GC Roots的对象：
        * 虚拟机栈中引用的对象
        * 方法区中类静态属性引用的对象
        * 方法区中常量引用的对象
        * 本地方法栈中JNI引用的对象
3. 再谈引用
    * 强引用（Strong Reference）：= new Object()
    * 软引用（Soft Reference）：系统将要内存溢出前会将这些对象回收
    * 弱引用（Weak Reference）：GC时，无论当前内存是否足够，都会回收
    * 虚引用（Phantom Reference）：虚引用不会对对象生存时间构成影响。唯一目的是能在对象被回收时受到通知
4. 生存还是死亡
    * 回收对象进行两次标记：
        * 如果对象没有GC Roots的引用链，将会被第一次标记，如果对象有覆盖finalize（）且并未调用过，对象会被放置到F-Queue队列中
        * 一个由虚拟机自动建立的低优先级的Finalizer线程去finalize F-Queue中的对象。虚拟机会触发这个方法但不承诺会等待运行结束（执行缓慢或死循环）。如果对象在finalize（）中重新与引用链上的任何一个对象建立关联，第二次标记时将被移出即将回收的集合（仅能拯救一次）。
5. 回收方法区  
    * 废弃常量：没有任何对象引用
    * 无用的类：满足下列条件可能会回收
        * 该类的所有实例已被回收
        * 加载该类的ClassLoader已被回收
        * 该类对应的Class对象没有在任何地方被引用，无法在任何地方通过反射访问该类的方法
### 3.3 垃圾收集算法
1. 标记-清除算法 
    * Mark-Sweep：首先标记出所有需要回收的对象，在标记完成后统一回收
    * 不足：效率不高；内存碎片空间
2. 复制算法
    * 将可用内存按容量分为大小相等的两块，每次只用其中一块；回收时将存活对象复制到另一块上，然后清除使用过的空间
    * 实现简单，运行高效，代价是内存空间是原来一半
    * 商业虚拟机用来回收*新生代*：不按1：1划分内存空间，分为较大的Eden空间和两块较小的Survivor空间，每次使用Eden和其中一块Survivor；回收时清理Eden和用过的Survivor。HotSpot默认Eden和Survivor比例为8:1。Survivor空间不足时需其他内存进行分配担保(Handle Promotion)
3. 标记-整理算法
    * Mark-Compact：标记，然后让存活对象向一端移动，最后清理掉端边界外的内存
4. 分代收集算法
    * Generational Collection：根据对象存活周期的不同将内存划分为几块。一般分为新生代和老年代。
### 3.4 HotSpot的算法实现
1. 枚举根节点  
    * 可达性分析必须在一个能确保一致性的快照中进行，不可以出现分析过程中对象引用关系还在不断变化的情况；导致GC时必须停顿所有Java执行线程
    * 通过OopMap进行GC Roots枚举
2. 安全点
    * 在特定位置生成OopMap代码，这些位置称为安全点（Safepoint）；程序在到达安全点时才暂停进行GC
    * 以是否让程序长时间执行为标准选定，明显特征是指令序列复用，如方法调用，循环跳转，异常跳转等
    * GC时让所有线程跑到最近的安全点停顿下来
        * 抢先式中断(Preemptive Suspension)：中断所有线程，如未到达安全点，恢复执行至安全点。几乎没有JVM使用
        * 主动式中断(Voluntary Suspension)：GC需要中断线程时，仅仅设置一个标记，各线程轮询标记，发现为真时自己挂起。
3. 安全区域
    * Safe Region指在一段代码片段中，引用关系不会发生变化。
### 3.5 垃圾收集器
  * 并行：指多条垃圾收集线程并行工作，但此时用户线程仍处于等待状态
  * 并发：指用户线程与垃圾收集线程同时执行（并不一定是并行的，可交替执行），用户程序在继续运行，垃圾收集程序运行于另一个CPU上
1. Serial收集器
    * 新生代；只使用一个收集线程进行GC；必须暂停其他所有工作线程，直至结束
    * 简单高效，虚拟机运行在Client模式下的默认新生代收集器
2. ParNew收集器
    * 新生代；Serial收集器的多线程版本；默认开启的收集线程数与CPU数量相同
    * Serial和ParNew可与CMS老年代收集器协同工作，Parallel Scavenge不可
3. Parallel Scavenge收集器
    * 新生代；目标是达到一个可控制的吞吐量（Throughput）= 运行用户代码时间 / （运行用户代码时间 + 垃圾收集时间）
    * -XX:MaxGCPauseMillis控制最大垃圾收集停顿时间（非越小越好，因可能频繁启动）；-XX:GCTimeRatio控制吞吐量大小。
4. Serial Old收集器
    * 老年代；标记-整理算法
5. Parallel Old收集器
    * 老年代；Parallel Scavenge的老年代版本；标记-整理算法；可与Parallel Scavenge组合使用
6. CMS收集器
    * Concurrent Mark Sweep收集器是一种以获取最短回收停顿时间为目标的收集器；主要用于服务端
    * 四个步骤：初始标记(initial mark)；并发标记(concurrent mark)；重新标记(remark)；并发清除(concurrent sweep)
    * 初始标记及重新标记仍需Stop the world；初始标记仅仅标记Roots能直接关联的对象，速度很快；并发标记进行Tracing；重新标记修正并发标记期间因用户程序运行而导致的标记变动
    * 缺点：
        * 对CPU资源敏感：占用CPU线程导致应用程序变慢。
        * 无法处理浮动垃圾（Floating Garbage）：用户线程可能产生新的垃圾
        * 产生大量空间碎片
    * 失败可触发Full GC
7. G1收集器
    * 特点：并行与并发；分代收集，独立管理整个GC堆；空间整合；可预测的停顿
    * 将堆划分为多个大小相等的独立区域（Region），跟踪各个Region里面的垃圾堆积的价值大小（获得的空间及回收时间），维护一个优先列表，每次根据允许的收集时间，优先回收价值最大的Region。
    * 引用可能跨Regeion；每个Region有对应的Remembered Set记录信息避免全堆扫描
    * 大致步骤：初始标记(Initial Marking)；并发标记(Concurrent Marking)；最终标记(Final Marking)；筛选回收(Live data counting and evacuation)
8. 理解GC日志
9. 垃圾收集器参数总结
### 3.6 内存分配与回收策略
  * 新生代GC（Minor GC）：指发生在新生代的垃圾收集，频繁，速度快
  * 老年代GC（Major/Full GC）：指发生在老年代的GC，通常伴随至少一次Minor GC，慢
1. 对象优先在Eden分配
2. 大对象直接进入老年代  
    * 避免朝生夕灭的短命大对象
    * 参数-XX:PretenureSizeThreshold（只对Serial和ParNew有效）
3. 长期存活的对象将进入老年代  
    * 每个对象定义一个对象年龄（Age）计数器，每存活一次Minor GC，年龄增加1岁，增加到一定程度（默认15），将被移入老年代。
    * 年龄阈值参数：-XX:MaxTenuringThreshold
4. 动态对象年龄判定  
   如果在Survivor空间中相同年龄所有对象大小的总和大于Survivor空间的一半，年龄大于或等于该年龄的对象就可以直接进入老年代。
5. 空间分配担保  
    发生Minor GC之前，JVM会先检查老年代最大可用的连续空间是否大于新生代所有对象总空间
    * 如大于，可确保Minor GC安全进行
    * 如小于，查看HandlePromotionFailure是否允许担保失败
        * 如允许，继续检查老年代最大可用连续空间是否大于历次晋升到老年代对象的平均大小；如大于，进行有风险的Minor GC；如小于，Full GC
        * 不允许，进行Full GC

## 第四章：虚拟机性能监控与故障处理工具
### 4.2 JDK的命令行工具
1. jps：虚拟机进程状况工具  
   列出正在运行的虚拟机进程，并显示执行主类名称进这些进程的本地虚拟机唯一ID（Local Virtual Machine Identifier）
2. jstat：虚拟机统计信息监视工具  
   显示本地或者远程虚拟机进程中的类加载，内存，垃圾收集，JIT编译等运行数据
3. jinfo：Java配置信息工具  
   实时地查看和调整虚拟机各项参数
4. jmap：Java内存映像工具  
   用于生成堆转储快照。还可以查询finalize执行队列，Java堆和永久代的详细信息
5. jhat：虚拟机堆转储快照分析工具  
   分析jmap生成的堆转储快照
6. jstack：Java堆栈跟踪工具  
   生成虚拟机当前时刻的线程快照
7. HSDIS：JIT生成代码反汇编
### 4.3 JDK的可视化工具
1. JConsole：Java监视与管理控制台  
   基于JMX的可视化监视，管理工具
2. VisualVM：多合一故障处理工具  
   最强大的运行监视和故障处理程序
## 第五章：调优案例分析与实战
### 5.2 案例分析  
    1. 高性能硬件上的程序部署策略 2. 集群间同步导致的内存溢出 3. 堆外内存导致的溢出错误 4. 外部命令导致系统缓慢 5. 服务器JVM进程崩溃 6. 不恰当数据导致内存占用过大 7. 由Windows虚拟内存导致的长时间停顿
### 5.3 实战：Eclipse运行速度调优
    1. 调优前的程序运行状态 2. 升级jdk1.6的性能变化及兼容问题 3. 编译时间和类加载时间的优化 4. 调整内存设置控制垃圾收集频率 5. 选择收集器降低延迟

# 虚拟机执行子系统
## 第六章：类文件结构
### 6.2 无关性的基石
  * Java语言规范 Java Language Specification 和 Java虚拟机规范 Java Virtual Machine Specification
  * Java虚拟机不和任何语言绑定，只与特定的Class二进制文件格式相关联。Class文件中包含了Java虚拟机指令集和符号表以及若干其他辅助信息。
  * 字节码命令所能提供的语义描述能力比Java语言本身更为强大，这为其他语言实现一些有别于Java的语言特性提供了基础
### 6.3 Class类文件的结构
  * Class文件是一组以8位字节为基础单位的二进制流；占用8位字节以上空间的数据项采用高位在前（Big Endian）的方式分割成字节进行存储
  * 文件格式采用一种类似于C语言结构体的伪结构，只有两种数据类型：无符号数和表
  * u1, u2, u3, u4一到四个字节的无符号数
1. 模数与Class文件的版本
    * 头4个字节称为魔数（Magic Number），作用是确定这个文件是否为Class文件，值为0xCAFEBABE
    * Minor Version (2 bytes)；Major Version (2 bytes)；虚拟机拒绝执行超过其版本号的Class文件
2. 常量池
    * 数量可变；入口为u2的计数值（constant_pool_count）；计数从1开始（0用来表示不引用任何常量池项目）
    * 两大类常量：
        * 字面量（Literal）：字面量比较接近于Java的常量概念，如文本字符串，声明为final的常量值等
        * 符号引用（Symbolic References）：主要包含：类和接口的全限定名（Fully Qualified Name）；字段的名称和描述符（Descriptor）；方法的名称和描述符
    * 虚拟机加载Class文件时进行动态连接；从常量池获得对应的符号引用，再在类创建时或运行时解析，翻译到具体的内存地址中。
    * 类型：UTF8，Integer，Float，Long，Double，Class，String，Fieldref， Methodref，InterfaceMethodref，NameAndType，MethodHandle，MethodType，InvokeDynamic。（结构略）
3. 访问标志
    * 常量池后的两个字节为access_flags，用于识别一些类或者接口层次的访问信息，如类还是接口，public，abstract，final
4. 类索引，父类索引与接口索引集合
    * this_class (2 bytes)； super_class (2 bytes)；interfaces是一组u2类型的数据集合
    * 类索引用于确定类的全限定名；父类索引用于确定父类的全限定名，除Object外皆不为0；索引集合描述类实现的接口
    * 各自指向CONSTANT_Class_info的类描述符常量，并通过此常量中的索引值找到定义在CONSTANT_Utf8_info类型的常量中的全限定字符串
5. 字段表集合
    * field_info用于描述接口或者类中声明的变量，包括类及实例级变量，不包含局部变量。
    * 结构：access_flags (2B); name_index (2B); descriptor_index (2B); attributes_count (2B); attributes (attributes_count)
    * Java中字段无法重载；对于字节码，如果描述符不一致，字段重名合法
6. 方法表集合
    * 用于存储对方法的描述；结构类似于字段表集合；方法实现存储于属性表集合中
    * 两个拥有相同名称和特征签名但返回值不同的方法可以合法共存于同一个Class文件中
7. 属性表集合
    * Class文件，字段表，方法表都可以携带自己的属性表集合，用于描述某些场景专有的信息
    * 虚拟机规范7中预定义了21项属性
    * attribute_name_index (2B); attribute_length (4B)；info (attribute_length)
    1. Code属性
        * attribute_name_index (2B)； attribute_length (4B) 
        * info: max_stack (2B)；max_locals (2B)；code_length (4B); code (code_length)；exception_table (exception_info); attributes_count (2B); attributes (attributes_count)
    2. Exceptions属性；3.LineNumberTable；4.LocalVariableTable；5.SourceFile；6.ConstantValue；7.InnerClasses；8.Deprecated及Synthetic；9.StackMapTable；10.Signature；11.BootstrapMethods
### 6.4 字节码指令简介
  * Java虚拟机的指令由一个字节长度的，代表着某种特定操作含义的数字（opcode）及紧随其后的0到多个所需参数（operands）构成。
1.字节码与数据类型 2.加载和存储指令 3.运算指令 4.类型转换指令 5.对象创建和访问指令 6.操作数栈管理指令 7.控制转移指令 8.方法调用和返回指令 9.异常处理指令 10.同步指令
### 6.5 共有设计和私有实现
  Java虚拟机必须能够读取Class文件并精确实现包含在其中的Java虚拟机代码的语义；在规范约束下可对具体实现做出修改和优化
### 6.6 Class文件结构的发展

## 第七章：虚拟机类加载机制
### 7.2 类加载的时机
  * 类的生命周期：加载(Loading)，验证(Verification)，准备(Preparation)，解析(Resolution)，初始化(Initialization)，使用(Using)，卸载(Unloading)
  * 加载，验证，准备，初始化和卸载的顺序是确定的；解析某些情况下可以在初始化后再开始，为了支持运行时绑定（动态绑定或晚期绑定）
  * 有且仅有下列5种情况时，如果类未初始化，需立即对类进行初始化
    * 遇到new，getstatic，putstatic或invokestatic四条字节码指令时，对应Java场景：new Object, 读取或设置类的静态字段，及调用类的静态方法
    * 使用reflect包的方法对类进行反射调用时
    * 初始化一个类，其父类未初始化时
    * 虚拟机启动时要执行的类（包含main（）的类）
    * 使用JDK1.7的动态语言支持时，如果一个MethodHandle实例最后的解析结果是REF_getStatic，REF_putStatic，REF_invokeStatic的方法句柄时
  * 所有引用类的方式都不会触发初始化
  ```
    class SuperClass {
        static { 初始化 }
        static int value = 123;
    }
    class SubClass extends SuperClass {  } 
    使用SubClass.value // 不会初始化SuperClass
    new SuperClass[10] // 使用数组不会初始化SuperClass
    class NotInit {
        static void main(String[] args) {
            System.out.println(SuperClass.value); // 常量传播优化，值转存到NotInit常量池中，SuperClass不会初始化
        }
    }
  ```
  * 接口也有初始化过程，与类初始化类似；接口初始化不要求父接口初始化，调用父接口时才初始化
### 7.3 类加载的过程
1. 加载
    * 虚拟机需完成三件事
        * 通过一个类的全限定名来获取定义此类的二进制字节流
        * 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构
        * 在内存中生成一个代表这个类的java.lang.Class对象，作为类的访问入口
    * Class二进制流的获取：Zip包（JAR,EAR,WAR）；网络中（Applet）；运行时计算生成（动态代理，ProxyGenerator.generateProxyClass）；由其它文件生成（JSP文件生成类）；数据库读取（某些中间件服务器把程序安装到数据库中在集群中分发，如SAP Netweaver）；...
2. 验证  
    * 文件格式验证
    * 元数据验证：对信息进行语义分析以确保符合规范，如是否有父类，是否继承不可继承的类，是否实现抽象类的方法
    * 字节码验证：通过数据流和控制流分析确定语义是合法，符合逻辑的
    * 符号引用验证：对类自身以外（常量池中的各种符号引用）的信息进行匹配性校验
    * -Xverify:none可关闭验证
3. 准备
    * 准备阶段是正式为类变量分配内存并设置类变量初始值的阶段
    * 进行内存分配的仅包括类变量（static修饰的），不包括实例变量；仅初始化为0或final值，不包括`<init>`赋值
4. 解析
    * 解析阶段是虚拟机将常量池内的符号引用替换为直接引用的过程
    * 符号引用（Symbolic References）：符号引用以一组符号来描述所引用的目标，可以是任意字面量，只要能无歧义定位目标即可。
    * 直接引用（Direct References）：直接指向目标的指针，相对偏移量或是一个能间接定位到目标的句柄。同内存布局相关，引用目标必定已在内存存在。
    * 虚拟机可选择在加载时对符号引用解析还是使用前才进行解析
    * 解析动作主要针对类或接口，字段，类方法，接口方法，方法类型，方法句柄和调用点限定符7类符号引用进行
5. 初始化
    * 初始化是执行类构造器`<clinit>()`方法的过程
    * clinit方法是由编译器自动收集类中的所有类变量的赋值动作和static块中的语句合并产生的，顺序由源文件中出现顺序决定。静态语句块只能访问到定义在其之前的变量，定义在其之后的变量可以赋值但不能访问
    ```
        class Test {
            value = 0; // 赋值可以编译通过
            System.out.println(value); // 编译错误：非法向前引用
        }
        static int value = 1;
    ```
    * clinit不需要显式调用父类构造器，虚拟机保证在子类构造方法执行前执行完毕父类构造器
    * clinit方法对于类或接口来说不是必需的，如果类中没有静态语块也没有对变量赋值，编译器可不生成clinit方法
    * 虚拟机会保证一个类的clinit方法在多线程环境中被正确地加锁，同步
### 7.4 类加载器
1. 类与类加载器  
   对于任意一个类，都需要由加载它的类加载器和这个类本身一同确立其唯一性，每一个加载器都拥有一个独立的类名称空间。只有两个类是同一个加载器加载的前提下才可比较
2. 双亲委派模型  
    只存在两种不同的类加载器
    * 启动类加载器（Bootstrap ClassLoader）：使用C++实现，是虚拟机自身的一部分
    * 所有其他的类加载器：由Java实现，独立于虚拟机外部，继承自java.lang.ClassLoader
    * 扩展类加载器（Extension ClassLoader）：由sun.misc.Launcher$ExtClassLoader实现，负责加载`<Java_HOME>\lib\ext`中或被java.ext.dirs系统变量指定的路径中的类库
    * 应用程序类加载器（Application ClassLoader）：由sun.misc.Launcher$AppClassLoader实现，是getSystemClassLoader()的返回值。负责加载用户类路径上的类库
    * 双亲委派模型（Parents Delegation Model）：
        * User ClassLoader -> Application ClassLoader -> Extension ClassLoader -> Bootstrap ClassLoader
        * 如果一个类加载器收到请求，首先会把这个请求委派给父加载器完成，只有当父加载器反馈无法完成时（未发现所需类），子加载器才尝试自己加载。
        * 可确保类的唯一性
3. 破坏双亲委派模型
    * 不要直接使用loadClass，覆盖findClass方法以确保双拼委派模型
    * 基础类回调用户代码：使用Thread Context ClassLoader去加载所需要的代码，涉及SPI的加载，如JNDI，JDBC，JCE,JAXB，JBI等
    * 代码热替换（HotSwap），模块热部署（Hot Deployment）等：OSGi每一个程序模块（Bundle in OSGi）都有一个自己的类加载器，当需要更换一个Bundle时，就把Bundle连同类加载器一起换掉。

## 第八章：虚拟机字节码执行引擎
### 8.2 运行时栈帧结构
  * Stack Frame是用于支持虚拟机进行方法调用和方法执行的数据结构，它是虚拟机运行时数据区中的虚拟机栈（Virtual Machine Stack）的栈元素
  * 每一个栈帧都包括了局部变量表，操作数栈，动态连接，方法返回地址和一些额外的附加信息。
  * 每一个方法从调用开始至执行完成的过程都对应着一个栈帧在虚拟机栈里入栈到出栈的过程
1. 局部变量表
    * Local Variable Table是一组变量值存储空间，用于存放方法参数和方法内部定义的局部变量。
    * Java程序编译为Class文件时，在方法的Code属性的max_locals数据项中确定该方法所需分配的局部变量表的最大容量
    * 局部变量表的容量以变量槽（Variable Slot）为最小单位，规范未明确大小，但应能存放boolean,byte,char,short,int,float,reference,returnAddress类型的数据，Slot的长度可以随处理器，操作系统或虚拟机不同而变化。
    * reference类型表示对一个对象实例的引用，从中直接或间接地查找到对象在Java堆中的数据存放的起始地址索引，及对象所属数据类型在方法区中的存储类型信息
    * 对于64位数据类型，虚拟机会以高位对齐的方式为其分配两个连续的Slot空间。
    * 虚拟机通过索引定位的方式使用局部变量，索引值从0开始至局部变量表最大的slot数量
    * 在方法执行时，虚拟机使用局部变量表完成参数值到参数变量列表的传递过程的；如果执行的是实例方法，局部变量表0位索引的slot默认对象实例，其余参数按照参数表顺序排列。
    * 为节省栈帧空间，局部变量表中的slot是可以重用的。某些情况下，slot复用可能影响到GC
    ```
        public static void main(String[] args)() {
            { byte[] placeHolder = new byte[64 * 1024 * 1024]; }
            int a = 0; // 没有此语句，slot未被复用，仍保存引用，placeHolder可能不被回收。另外可以将placeHolder设置为null以加快回收
            System.gc();
        }
    ```
2. 操作数栈
    * Operand Stack，后入先出栈（Last In First Out, LIFO）。最大深度在编译时写入到Code属性的max_stacks数据项中。
    * 方法刚开始执行时，操作数栈为空；执行过程中，会有各种字节码指令向其中写入和读取内容。如iadd运行时相加栈顶的两个元素。
    * 概念模型中，两个栈帧完全相互独立；大多虚拟机实现会做一些优化处理，令两个栈帧出现一部分重叠，如局部变量表，操作数栈共享区域。
3. 动态连接
    * 每个栈帧都包含一个指向运行时常量池中该栈帧所属方法的引用，目的是支持动态连接
    * 符号引用一部分会在类加载阶段或第一次使用时转化为直接引用，称为静态解析；另一部分在每一次运行期间转化为直接引用，称为动态连接
4. 方法返回地址
    * 正常完成出口（Normal Method Invocation Completion）：执行引擎遇到任意一个方法返回的字节码指令
    * 异常完成出口（Abrupt Method Invocation Completion）：方法执行中遇到异常且本方法异常表中没有相匹配的异常处理器
    * 一般来说，方法正常退出时，调用者的PC计数器的值可以作为返回地址，栈帧中很可能会保存这个计数器值；异常退出时，返回地址要通过异常处理器来确定，栈帧中一般不会保存信息
    * 退出时可能执行的操作有：恢复上层方法的局部变量表和操作数栈，把返回值压入调用者栈帧的操作数栈中，调整PC计数器的值以指向后一条指令。
5. 附加信息
###　方法调用
1. 解析 Resolution
    * 静态解析的前提：方法在程序真正运行之前就有一个可确定的调用版本，而且在运行期不可改变；主要包括静态方法和私有方法
    * 方法调用指令：
        * invokestatic：调用静态方法
        * invokespecial：调用实例构造器方法，私有方法和父类方法
        * invokevirtual：调用虚方法
        * invokeinterface：调用接口方法，会在运行时再确定一个实现此接口的对象
        * invokedynamic：先在运行时动态解析出调用点限定符好所引用的方法，然后再执行该方法，分派逻辑由用户设定的引导方法决定
    * 非虚方法：静态，私有，实例构造器，父类方法；final方法使用invokevirtual来调用，但其无法被覆盖，也是一种非虚方法
2. 分派 Dispatch
    * 静态分派
        * Human man = new Man(); Human称为变量的静态类型（Static Type）或外观类型（Apparent Type）；Man称为实际类型（Actual Type）
        * 静态类型是在编译器可知的；实际类型在运行期才可确定
        * 所有依赖静态类型来定位方法执行版本的分派动作称为静态分派；典型应用是方法重载
        * 静态分派发生在编译阶段，确定静态分派的动作实际上不是由虚拟机执行
        * 编译器只能确定一个“更加合适”的版本：如自动转型重载，char->int->long->float->double
    * 动态分派
        * 在运行期根据实际类型确定方法执行版本的分派过程称为动态分派
        * invokevirtual指令的多态查找过程：
            * 找到操作数栈顶的第一个元素所指向的对象的实际类型
            * 如果在类型中找到与常量中的描述符和简单名称相符的方法，进行访问权限校验；如通过则返回此方法的直接引用，查找结束；不通过则抛出IllegalAccessError
            * 否则，按照继承关系从下往上依次对父类进行搜索和验证过程
            * 如未找到，抛出AbstractMethodError
        * 调用会把常量池中的类方法符号引用解析到不同的直接引用上，实现方法重载（Override）
    * 单分派与多分派
        * 方法的接收者与方法的参数统称为方法的宗量；单分派是根据一个宗量对目标方法进行选择；多分派则是根据多于一个宗量对目标方法进行选择
        * Java的静态分派属于多分派类型；动态分派属于单分派类型
    * 虚拟机动态分派的实现
        * 常用"稳定优化"手段是为类在方法区建立一个虚方法表（Virtual Method Table），虚方法表中存放着各个方法的实际入口地址。如果某方法在子类中未被重写，子类的虚方法表中的地址入口与父方法相同方法的地址入口一致。具有相同签名的方法在父类子类的虚方法表中有相同索引序号。
        * 激进优化手段：内联缓存（Inline Cache）；基于“类型继承关系分析”（Class Hierarchy Analysis， CHA）的守护内联（Guarded Inlining）
3. 动态类型语言支持
    * invokedynamic是JDK7实现动态型语言支持而进行的改进之一，也是为JDK8 Lambda做技术准备
    * 动态类型语言：
        * 关键特征是它的类型检查的主体过程是在运行期而不是编译器
        * 静态语言在编译期确定类型，编译器可以提供严谨的类型检查，便于发现与类型相关的问题，利于稳定性和大规模代码
        * 动态语言有更好的灵活性
    * java.lang.invoke包
        * 提供一种新的动态确定目标方法的机制，称为MethodHandle
        * 与Reflection的区别
            * Reflection模拟Java代码层次的方法调用；MethodHandle模拟字节码层次的方法调用
            * Reflection的Method对象包含更多信息，重量级；MethodHandle仅包含与执行该方法相关的信息，轻量级
            * MethodHandle理论上可采用对字节码的优化方式
            * MethodHandle可服务于所有Java虚拟机上的语言
    * invokedynamic指令
        * 每一处含有invokedynamic指令的位置都被称作动态调用点（Dynamic Call State），指令的第一个参数不是代表方法符号引用的CONSTANT_Methodref_info常量，而是JDK1.7新加入的CONSTANT_InvokeDynamic_info常量
        * 从常量中可以得到：引导方法（Bootstrap Method），方法类型（Method Type）和名称
        * 引导方法有固定参数，并返回CallSite对象代表真正要执行的目标方法调用。虚拟机可通过CallSite执行目标方法
    * 掌控方法分派规则
        * 可以让程序员决定分派逻辑，如通过MethodHandle调用祖父类方法
### 8.4 基于栈的字节码解释执行引擎
1. 解释执行
    * Javac编译器完成了程序源码->词法分析->单词流->语法分析->抽象语法树，再遍历语法树生成线性的字节码指令流的过程
    * 解释器在虚拟机内部解释执行
2. 基于栈的指令集与基于寄存器的指令集
    * Java编译器输出的指令流，基本上是一种基于栈的指令集架构（Instruction Set Architecture，ISA）。指令流的指令大部分都是零地址指令，依赖操作数栈进行工作。  
        eg: iconst_1;  iconst_1;  iadd;  istore_0; 压入两个常量1，iadd相加存储结果至栈顶，istore把栈顶的值放到局部变量表Slot 0中
    * 另一套常用的指令集架构是基于寄存器的指令集，典型的是x86  
        eg: mov eax, 1;  add eax, 1; mov指令把EAX寄存器的值设为1，然后add指令加1，结果保存在EAX寄存器中
    * 基于栈的指令集优点在于易于移植，代码相对更加紧凑，编译器实现更加简单等，但执行速度相对较慢，完成相同功能所需的指令数量一般比寄存器架构多，而且栈实现在内存中，频繁的栈访问意味着频繁的内存访问
    * 寄存器由硬件直接提供，程序不可避免地受到硬件约束，主流物理机的指令集都是寄存器架构
3. 基于栈的解释器执行过程  
    Sample略
## 第九章：类加载及执行子系统的案例与实战
### 9.2. 案例分析
1. Tomcat：正统的类加载器架构
    * 主流Java Web服务器都实现了自己定义的类加载器（一般不止一个），为了要解决几个问题：
        * 部署在同一个服务器上的两个Web应用程序所使用的Java类库可以实现相互隔离（可能使用不同版本）
        * 部署在同一个服务器上的两个Web应用程序所使用的Java类库可以相互共享
        * 服务器需要尽可能地保证自身的安全不受部署的Web应用程序影响。一般来说，服务器所使用的类库应该与应用程序的类库互相独立
        * 支持JSP应用的Web服务器，大多数都需要支持HotSwap功能
    * Web服务器一般提供几个ClassPath路径供用户存放第三方库，这些路径一般以lib或classes命名。
    * Tomcat用户类库
        * /common目录：类库可被Tomcat和所有Web应用程序共同使用
        * /server目录：类库可被Tomcat使用，对所有Web应用程序不可见
        * /shared目录：类库可被所有Web应用程序共同使用，但对Tomcat不可见
        * /WebApp/WEB-INF目录：类库仅被此Web应用程序使用，对其他皆不可见
    * Tomcat类加载器
        * 按照双亲委派模型实现
        * CommonClassLoader：加载common中类库，父加载器Application ClassLoader->Extension ClassLoader->Bootstrap ClassLoader
        * CatalinaClassLoader：加载server中类库，父加载器CommonClassLoader
        * SharedClassLoader：加载shared中类库，父加载器CommonClassLoader
        * WebAppClassLoader：父加载器SharedClassLoader，各个WebAppClassLoader实例间相互隔离
        * JasperLoader：JSP类加载器，父加载器WebAppClassLoader，服务器检测到JSP文件修改会替换掉当前JasperLoader实例，并通过建立一个新的JSP类加载器来实现HotSwap功能
2. OSGi：灵活的类加载器架构
    * Open Service Gateway Initiative是OSGi联盟制定的一个基于Java语言的动态模块化规范，成为Java世界中“事实上”的模块化标准。
    * 一个模块（Bundle）可以声明它所依赖的Java Package（Import-Package描述），也可以声明它允许导出发布的Package（Export-Package描述）
        * Bundle间的依赖关系从传统的上层模块依赖底层模块转变为平级模块之间的依赖，而且可以控制可见性（Export）
        * 基于OSGi的程序很可能（不一定）可以实现模块级热插拔
    * Bundle类加载器之间只有规则，没有固定的委派关系，对Package的类加载动作会委派给发布它的Bundle类加载器去完成
    * 一个Bundle类加载器为其他Bundle服务时，会根据Export列表严格控制访问范围
    * 引入了额外的复杂度，带来了线程死锁和内存泄漏的风险
3. 字节码生成技术与动态代理的实现  
    Proxy.newProxyInstance()；InvocationHandler
4. Retrotranslator：跨越JDK版本  
    Java逆向移植：高版本中编写的代码向低版本部署使用
### 实战：自己动手实现远程执行功能  
  在服务器端执行临时代码（略）

# 程序编译与代码优化
## 第十章：早期（编译期）优化
### 10.1 概述
  * 前端编译器：把*.java文件转变成*.class文件，如javac，Eclipse JDT中的增量式编译器
  * 后端运行期编译器：JIT编译器（Just In Time）：HotSpot VM的C1，C2编译器
  * 静态提前编译器（AOT编译器，Ahead Of Time）：直接把*.java编译成本地机器代码，如GNU Compiler for the Java (GCJ), Excelsior JET
  * javac对代码的运行效率几乎没有任何优化，但做了许多针对Java语言编码过程的优化措施（语法糖）
  * 性能的优化集中到了后端的即时编译器中，不是由Javac产生的Class文件也可享受
### 10.2 Javac编译器
1. Javac的源码与调试  
    编译过程大致可分为三个过程：
2. 解析与填充符号表
    1.词法，语法分析 2.填充符号表 
3. 注解处理器
4. 语义分析与字节码生成
    1.标注检查 2.数据及控制流分析 3.解语法糖 4.字节码生成
### 10.3 Java语法糖的味道
1. 泛型与类型擦除
2. 自动装箱，拆箱与遍历循环
3. 条件编译
### 10.4 实战：插入式注解处理器  
  NameCheckProcessor（略)

## 第十一章：晚期（运行期）优化
### 11.2 HotSpot虚拟机内的即时编译器
1. 解释器与编译器
    * 解释器与编译器各有优势；程序需要迅速启动和执行时，解释器可以先发挥作用；程序运行后，编译器把代码编译成本地代码可以获得更高的执行效率；解释器更节约内存及优化失败时逃生。
    * HotSpot内置了两个即时编译器：Client Compiler（C1），Server Compiler（C2）
    * 可通过-Xint强制运行解释模式，-Xcomp强制运行编译模式
2. 编译对象与触发条件
    * 运行中会被即时编译器编译的热点代码有两类：被多次调用的方法；被多次执行的循环体  
      第二种情况，编译器仍以整个方法作为编译对象，编译发生在方法执行过程中，称为栈上替换（On Stack Replacement，OSR）
    * 热点探测判定方式：
        * 基于采样的热点探测（Sample Based Hot Spot Detection）：周期性检查各线程栈顶，如果某方法经常出现，即为热点方法。简单高效但不精确。
        * 基于计数器的热点探测（Counter Based Hot Spot Detection）：为每个方法建立计数器并统计方法的执行次数，超过一定阈值即为热点方法。
    * HotSpot采用计数器方法，每个方法有两类计数器
        * 方法调用计数器（Invocation Counter）：
            * 默认阈值Client模式1500，Server模式10000，可通过-XX:CompileThreshold设定
            * 方法调用时，先检查是否存在编译过版本；如存在，使用编译版本；不存在，计数器加一，并检查是否超过阈值，超过则触发异步编译
            * 计数器统计的不是绝对次数，而是相对执行频率，即一段时间内调用次数。超过一定时间仍未编译，计数减半，称为热度衰减（Counter Decay），时间被称为方法统计的半衰周期（Counter Half Life Time）。热度衰减在GC时进行，相关参数-XX:-UseCounterDecay -XX:CounterHalfLifeTime
        * 回边计数器（Back Edge Counter）：
            * 统计一个方法中循环体代码执行的次数；字节码中遇到控制流向后跳转的指令称为回边（Back Edge）
            * -XX:BackEdgeThreshold设置阈值，常用-XX:OnStackReplacePercentage来间接调整
            * 遇到回边指令时，先检查是否存在编译过版本；如存在，使用编译版本；不存在，计数器加一，并检查是否超过阈值，超过则触发OSR编译请求
            * 没有计数热度衰减
3. 编译过程
    Client Compiler相对简单，Server Compiler会进行大量优化
4. 查看及分析即使编译结果
### 11.3 编译优化技术
1.概览 2.公共子表达式消除 3.数组边界检查消除 4.方法内联 5.逃逸分析
### 11.4 Java与C/C++编译器对比
* Java即时编译器，C/C++静态编译器
* Java的劣势
    * 即时编译器占用用户程序运行时间，谨慎使用大规模的优化技术；静态优化编译器不占用用户时间
    * Java是动态的类型语言，虚拟机必须频繁进行动态检查，如实例空指针，数组上下界，继承关系等
    * Java语言没有virtual关键字，但使用虚方法的频率远大于C/C++，方法接收者多态选择频率大于C/C++，优化难度大
    * Java可以动态扩展，运行时加载新的类可能改变继承关系，妨碍全局优化，许多全局优化只能以激进方式进行，可能随时撤销或重优化
    * Java对象内存分配都在堆上进行，只有方法的局部变量才在栈上分配。C/C++存在多种分配方式，减轻内存回收压力
* Java性能上的劣势换取开发效率上的优势；即时编译可以做一些静态优化无法完成的优化

# 高效并发
## 第十二章：Java内存模型与线程
### 12.2 硬件的效率与一致性
### 12.3 Java内存模型  
Java虚拟机规范中试图定义一种Java内存模型（Java Memory Model，JMM）来屏蔽掉各种硬件和操作系统的内存访问差异，以实现各平台下一致的内存访问效果。
1. 主内存与工作内存
    * JMM规定了所有的变量（指实例字段，静态字段和构成数组对象的元素，不包括局部变量和方法参数）都存储在主内存（Main Memory）中
        * 如果局部变量是一个reference类型，它引用的对象在Java堆中可被各个线程共享，但是referenc本身在局部变量表中，是线程私有的
    * 每条线程还有自己的工作内存（Working Memory）
        * 线程工作内存中保存了被该线程使用到的变量的主内存副本拷贝
        * 线程对变量的所有操作（读取赋值等）都必须在工作内存中进行，而不能直接读写主内存的变量
        * 不同线程间无法直接访问对方工作内存中的变量，线程间变量值的传递需要通过主内存完成
2. 内存间交互操作
    * JMM定义了8中操作完成主内存与工作内存的交互
        * lock：作用于主内存的变量，把一个变量标识为一条线程独占的状态
        * unlock：作用于主内存的变量，把一个处于锁定状态的变量释放出来，释放后的变量才可以被其他线程锁定
        * read：作用于主内存的变量，把一个变量的值从主内存传输到线程的工作内存中，以便随后的load使用
        * load：作用于主内存的变量，把read操作从主内存中得到的变量值放入工作内存的变量副本中
        * use：作用于工作内存的变量，把工作内存中一个变量的值传递给执行引擎，每当虚拟机遇到一个需要使用到变量的值的指令时都会执行此操作
        * assign：作用于工作内存的变量，把一个从执行引擎接收到的值赋给工作内存的变量，每当虚拟机遇到一个给变量赋值的指令时执行此操作
        * store：作用于工作内存的变量，把工作内存中一个变量的值传送到主内存中以便write操作使用
        * write：作用于主内存的变量，把store操作从工作内存得到的变量的值放入主内存的变量中
    * 执行操作的规则
        * 不允许read和load，store和write操作之一单独出现
        * 不允许一个线程丢弃它最近的assign操作，即变量在工作内存中改变了之后必须同步回主内存
        * 不允许一个线程无原因地（没有发生过assign）把数据从工作内存同步回主内存
        * 一个新的变量只能在主内存中“诞生”，不允许在工作内存中直接使用一个未被初始化（load或assign）的变量，即实施use，store前必须assign或load
        * 一个变量在同一时刻只允许一条线程对其lock，但lock可以被同一条线程重复多次；多次执行后需执行同样次数的unlock才能解锁
        * 如果对一个变量执行lock操作，将会清空工作内存中此变量的值，在执行引擎使用此变量前，需要重新执行load或assign操作初始化变量值
        * 如果一个变量没有被lock，不允许使用unlock，也不允许unlock被其它线程锁住的变量
        * 对一个变量unlock前，必须先把此变量同步回主内存中（store，write）
3. 对于volatile型变量的特殊规则
    * 两种特性：
        * 保证此变量对所有线程的可见性：当一条线程修改了这个变量的值，新值对于其他线程立刻得知
            * 只保证可见性，不保证原子性；在不符合以下两条规则的场景中仍然要通过加锁来保证原子性
                * 运算结果不依赖变量的当前值，或能确保只有单一线程修改变量的值
                * 变量不需要与其他的状态变量共同参与不变约束
        * 禁止指令重排序优化；普通变量不能保证变量赋值操作的顺序与程序代码中的执行顺序一致
    * 大多数场景下volatile的总开销比锁要低；volatile变量读操作性能消耗与普通变量近乎没有区别，写操作可能会慢一些，因为需要在本地代码中插入许多内存屏障指令来确保处理器不会乱序执行。
    * 操作执行规则：
        * 只有当线程对变量执行的前一个动作是load时，线程才能对变量执行use操作，而且只有当后一个动作是use时才能执行load（保证工作内存中每次使用变量前都从主内存刷新）
        * 只有当线程对变量执行的前一个动作是assign时，线程才能对变量执行store操作，而且只有当后一个动作是store时才能执行assign（保证工作内存中每次修改变量后都立即同步回主内存中）
        * 同一线程中，两组操作，A1[use/assign]->A2[load/store]->A3[read/write]，B1[use/assign]->B2[load/store]->B3[read/write]，如果A1先于B1，则A3先于B3（保证volatile修饰的变量不会被指令重排序优化，保证代码的执行顺序与程序顺序相同）
4. 对于long和double型变量的特殊规则  
    * 模型允许虚拟机将没有被volatile修饰的64位数据的读写操作划分为两次32位操作，非原子性协定（Nonatomic Treatment)
    * 主流商用虚拟机都作为原子操作处理，一般不需专门声明为volatile
5. 原子性，可见性与有序性
    * 原子性（Atomicity）：大致可认为基本数据类型的访问读写是具备原子性的，更大范围的保证通过lock，unlock操作
    * 可见性（Visibility）：指当一个线程修改了共享变量的值，其他线程能立即得知这个修改。
        * volatile的特殊规则保证了新值能立即同步回主内存及每次使用前立即刷新，普通变量不能保证。
        * synchronize和final也可实现。同步块通过“对一个变量执行unlock前必须先把此变量同步回主内存中”规则获得
    * 有序性（Ordering）：如果在本线程内观察，所有操作都是有序的；如果在一个线程观察另一个线程，所有操作都是无序的。
6. 先行发生原则
* JMM下“天然的”的先行发生原则
    * 程序次序规则（Program Order Rule）:在一个线程内，按照代码顺序，写在前面的操作先行发生于写在后面的操作
    * 管城锁定规则（Monitor Lock Rule）：一个unlock操作先行发生于后面对同一个锁的lock操作
    * volatile变量规则（Volatile Variable Rule）：对一个volatile变量的写操作先行发生于后面对这个变量的读操作
    * 线程启动规则（Thread Start Rule）：Thread对象的start（）方法先行发生于此线程的每一个动作
    * 线程终止规则（Thread Termination Rule）：线程中的所有操作都先行发生于对此线程的终止检测，可以通过join，isAlive的返回值检测线程结束
    * 对象终结规则（Finalizer Rule）：一个对象的初始化完成先行于其finalize（）
    * 传递性（Transitivity）：如果操作A先于B，B先于C，则A先于C
### 12.4 Java与线程
1. 线程的实现  
    Thread的关键方法是native的
    * 使用内核线程实现：
        * Kernel-Level Thread直接由操作系统内核支持的线程。线程由内核来完成切换，调度，并将线程任务映射到各个处理器上。
        * 程序使用内核线程的高级接口，轻量级进程（Light Weight Process，LWP）；轻量级进程即线程，每个轻量级进程由一个内核线程支持
        * 每个轻量级进程是一个独立的调度单元，即便阻塞也不会影响整个进程工作；局限性：线程操作需要系统调用，代价相对较高，而且每个轻量级进程需要有一个内核进程支持，消耗内核资源
    * 使用用户线程实现
        * 狭义上的用户线程完全建立在用户空间的线程库上，用户线程的建立同步销毁调度完全在用户态中完成，不需要内核帮助。
        * 劣势在于所有线程操作由用户程序自己处理，比较复杂
    * 使用用户线程加轻量级进程混合实现
    * Java线程的实现：虚拟机规范未限定使用哪种线程模型；Sun JDK Window和Linux版采用一条Java线程映射到一条轻量级进程线程模型实现
2. Java线程调度
    * 线程调度指系统为线程分配处理器使用权的过程
    * 协同式线程调度（Cooperative Threads-Scheduling）：
        * 线程的执行时间由线程本身来控制，线程把自己的工作执行完后主动通知系统切换至另一线程。
        * 实现简单，而且由于线程把自己的事情干完后才切换，没有线程同步问题
        * 程序执行时间不受控制，如果一个线程有问题，程序阻塞
    * 抢占式线程调度（Preemptive Thread-Scheduling）：
        * 每个线程由系统来分配执行时间
    * Java使用抢占式调度
3. 状态转换  
    5种状态：新建，运行，等待，阻塞，结束

## 第十三章：线程安全与锁优化
### 13.2 线程安全
1. Java语言中的线程安全
    * 不可变
    * 绝对线程安全：一个类不管运行时环境如何，调用者都不需要任何额外的同步措施；绝大多数不满足
    * 相对线程安全：对对象单独的操作是线程安全的，连续调用则需要额外的同步手段
    * 线程兼容：对象本身不是线程安全的，但调用端可以通过同步手段保证线程安全
    * 线程对立：无论调用端是否采用同步措施，都无法安全并发使用，如Thread.suspend和resume，System.setIn(), System.setOut(), System.runFinalizersOnExit()
2. 线程安全的实现方法
    * 互斥同步（Mutual Exclusion & Synchronization）
    * 非阻塞同步（Non-Blocking Synchronization）
    * 无同步方案：不涉及共享数据，天然线程安全
        * 可重入代码（Reentrant Code）：可以在代码执行的任何时刻中断它，转而执行另一段代码，而在控制权返回后，原来程序不会出现任何错误。
        * 线程本地存储（Thread Local Storage）：把共享数据的可见范围限制在同一个线程之内
### 13.3 锁优化
1. 自旋锁与自适应自旋
    * 为了节约挂起和恢复线程的时间，让后一个请求锁的线程不放弃处理器的执行时间，执行一个忙循环（自旋），称为自旋锁
    * 自适应意味着自旋时间不固定，由前一次在同一个锁上的自旋时间及锁的拥有者的状态来决定。
2. 锁消除
    * 指虚拟机即时编译器在运行时，对一些代码上要求同步，但被检测到不可能存在共享数据竞争的锁进行消除。
    * 通过逃逸分析进行优化
    * 程序中存在隐式加锁，如"A" + "B"编译成StringBuffer append
3. 锁粗化
    * 如果有一串对同一个对象的加锁操作，会把加锁同步的范围扩展（粗化）到整个操作序列的外部
4. 轻量级锁
    * 通过HotSpot对象头信息的CAS操作
    * 根据经验数据，“绝大部分的锁在同步周期内不存在竞争”，虚拟机使用CAS操作避免使用互斥量
5. 偏向锁
    * 在无竞争的情况下把整个同步都消除掉；锁会偏向于第一个获得它的线程，如果后续执行中，该锁没有被其他线程获取，则持有偏向锁的线程永远不需要再同步
