# okHttp
* Usage
    ```
    OkHttpClient client = new OkHttpClient.Builder()
        .readTimeout(...).connectTimeout(...).writeTimeout(...)
        .authenticator // Process request and add user name and password
                (new Authenticator() { })
        .cache(cache) // Can use file cache
        .certificatePinner(new CertificatePinner.Builder() // Certificate pinning
                .add("web.com", "sha1/hash_value"))
        .addInterceptor(log_interceptor) // Logging
        .addNetworkInterceptor(...) // Monitor progress
        .build();
    Request request = new Request.Builder()
        .url(...)
        .post(body) // Post method
        .header(field, value) // Add header
        .cacheControl(new CacheControl.Builder().noCache().build()) // Always request from network, no cache
        .build();
    /** Get response */
    Response response = client.newCall(request).execute();
    /** Get response in async mode */
    client.newCall(request).enqueue(new Callback() {
        @Override
        public void onFailure(Call call, IOException e);
        @Override
        public void onResponse(Call call, Response response) throws IOException;
    });
    /** Cancel task */
    call.cancel();
    ```   
# Design 
* Flow
    ```
    [OkHttpClient.Builder]
        ↓ build()
    [OkHttpClient]
        ↓ newCall()
        ↓ ← [Request] (url, method, header, body, ..)
        [RealCall] (async) → [Dispatcher]
        ↓                         ↓   
        execute()                 execute()     
        ↓                         ↓   
        getResponseWithInterceptorChain()
                        ↓
                interceptors // Do something before and after the action
                        ↓
            [RetryAndFollowUpInterceptor] // Retry and handle response
                [BridgeInterceptor]      // Add header parameters, handle compression
                [CacheInterceptor]       // Cache
                [ConnectInterceptor]      // 
            [CallServerInterceptor]    // Network IO
                        ↓
                    [Response]
    ```
* Resume from break point: Http Range:bytes=XXXX

# Retrofit
* Usage:
    ```
    interface ApiService // Define network interface
        @GET("some_end_point") // RESTful API
        Call<SomeData> getSomeData(); 
    Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(baseUrl)
                //.addCallAdapterFactory(RxJavaCallAdapterFactory.create()) // This allows to convert Call to Rx Observable
                .addConverterFactory(GsonConverterFactory.create()) // Convert JSON ResponseBody to java object
                .build();
    ApiService svc = retrofit.create(ApiService.class);
    Call<SomeData> call = svc.getSomeData();
    Response<SomeData> res = call.execute(); // Synchronize way
    call.enqueue(callback) // asynchronous way
    ```
* addCallAdapterFactory(RxJavaCallAdapterFactory.create()) 
    - allows to convert the return value from Call<Data> to Rx Observable<Data> in ApiService.  
    eg: Observable<SomeData> getSomeData() in ApiService
* addConverterFactory(GsonConverterFactory.create())
    - Convert the ResponseBody to Response<Data>
* Flow and Design patterns:
    - Build Retrofit  
        Facade pattern: Create Retrofit object
    - Retrofit.create(service_interface) 
        - Dynamic Proxy pattern:   
            return Proxy.newProxyInstance with InvocationHandler to intercept the function call in service interface. 
        - Create and cache ServiceMethod, make okhttp and use callAdapter to convert the response
    - ServiceMethod intercepts the function call with annotation and build okhttp request. 
    - CallAdapter convert the okhttp response to the return type in service interface. Also manages thread to run the call
        - Adpater pattern, Strategy pattern, Decorator pattern
    - Converter convert the service interface return type to user defined type

