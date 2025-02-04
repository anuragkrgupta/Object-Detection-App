self.addEventListener("install", function(event) {
  event.waitUntil(preLoad());
});

var preLoad = function() {
  console.log("Installing web app");
  return caches.open("offline").then(function(cache) {
    console.log("caching index and important routes");
    return cache.addAll(["offline.html"]);
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
      return caches.match("offline.html");
    }
    return response;
  });
};

var returnFromCache = function(request) {
  return caches.open("offline").then(function(cache) {
    return cache.match(request).then(function(matching) {
      if (!matching || matching.status === 404) {
        return caches.match("offline.html");
      } else {
        return matching;
      }
    });
  });
};

var addToCache = function(request) {
  return fetch(request).then(function(response) {
    if (response.ok) {
      return caches.open("offline").then(function(cache) {
        return cache.put(request, response.clone());
      });
    }
  });
};