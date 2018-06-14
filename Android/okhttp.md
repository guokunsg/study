# Usage
* OkHttpClient client = 
    new OkHttpClient.Builder()
        .readTimeout(...).connectTimeout(...).writeTimeout(...)
        .authenticator // Process request and add user name and password
                (new Authenticator() { })
        .cache(cache) // Can use file cache
        .certificatePinner(new CertificatePinner.Builder() // Certificate pinning
                .add("web.com", "sha1/hash_value"))
        .addInterceptor(log_interceptor) // Logging
        .addNetworkInterceptor(...) // Monitor progress
        .build();
* Request request = new Request.Builder()
        .url(...)
        .post(body) // Post method
        .header(field, value) // Add header
        .cacheControl(new CacheControl.Builder().noCache().build()) // Always request from network, no cache
        .build();
* Get response:
    Response response = client.newCall(request).execute();
* Async mode
    client.newCall(request).enqueue(new Callback() {
        @Override
        public void onFailure(Call call, IOException e);
        @Override
        public void onResponse(Call call, Response response) throws IOException;
    });
* Call task: call.cancel();

# Design 
## Flow
Request.Builder
       ↓
Dispatcher (ApplicationInterceptorChain)
       ↓
HttpEngine [Cache]
       ↓
ConnectionPool [Connection] 
       ↓
  [Rote] [Platform] 
Data    →     [Server (Socket)]
## More details
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

 * Resume from break point: Http Range:bytes=XXXX













