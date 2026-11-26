importScripts(
  "${POD_OS_SERVICE_WORKER_URL}",
);

const CACHE_NAME = "pod-os-static-${POD_OS_CACHE_VERSION}";
const STATIC_ASSET_URL_PREFIX = new URL("${POD_OS_STATIC_CACHE_PREFIX}", self.location.href).href;

PodOsServiceWorker.setupServiceWorker(self, CACHE_NAME, STATIC_ASSET_URL_PREFIX, [
  "/",
  "./index.html",
]);
