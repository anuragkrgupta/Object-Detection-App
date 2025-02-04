self.addEventListener("install", function(event) {
  event.waitUntil(preLoad());
});

var preLoad = function() {
  console.log("Installing web app");
  return caches.open("offline").then(function(cache) {
    console.log("caching index and important routes");
    return cache.addAll(["/offline.html", "/offline.gif"]);
  });
};

self.addEventListener("fetch", function(event) {
  event.respondWith(
    checkResponse(event.request).catch(function() {
      return returnFromCache(event.request);
    })
  );
  event.waitUntil(
    addToCache(event.request)
  );
});

var checkResponse = function(request) {
  return fetch(request).then(function(response) {
    if (response.status === 404) {
      return Promise.reject("Not found");
    }
    return response;
  });
};

var returnFromCache = function(request) {
  return caches.open("offline").then(function(cache) {
    return cache.match(request).then(function(matching) {
      return matching || cache.match("/offline.html");
    });
  });
};

var addToCache = function(request) {
  return caches.open("offline").then(function(cache) {
    return fetch(request).then(function(response) {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    });
  });
};




  // var addToCache = function(request){
  //   return caches.open("offline").then(function (cache) {
  //     return fetch(request).then(function (response) {
  //       console.log(response.url + " was cached");
  //       return cache.put(request, response);
  //     });
  //   });
  // };
  