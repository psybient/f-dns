export function createWorkerClient({
  workerUrl = null,
  workerClass = null,
  workerFactory = null,
  fallbackModule = null,
} = {}) {
  const supportsWorker =
    typeof Worker !== "undefined" &&
    (workerClass || workerFactory || workerUrl);
  let worker;
  let callId = 0;
  const pending = new Map();

  if (supportsWorker) {
    if (workerClass) {
      // Webpack-exposed Worker constructor (worker-loader style)
      worker = new workerClass();
    } else if (workerFactory) {
      // caller provides a factory function to build a Worker
      worker = workerFactory();
    } else {
      // workerUrl can be string/URL (used for native new URL(...) approach)
      worker = new Worker(workerUrl, { type: "module" });
    }

    worker.onmessage = (e) => {
      const { id, data, error } = e.data || {};
      if (typeof id === "undefined") {
        // backward compatibility: resolve oldest pending with raw data
        const first = pending.keys().next();
        if (!first.done) {
          const { resolve } = pending.get(first.value);
          pending.delete(first.value);
          resolve(e.data);
        }
        return;
      }
      const p = pending.get(id);
      if (!p) return;
      pending.delete(id);
      if (error) p.reject(new Error(error));
      else p.resolve(data);
    };

    worker.onerror = (err) => {
      for (const [, { reject }] of pending) reject(err);
      pending.clear();
    };
  }

  return {
    async call(method, payload) {
      if (supportsWorker && worker) {
        const id = ++callId;
        worker.postMessage({ id, method, payload });
        return new Promise((resolve, reject) => {
          pending.set(id, { resolve, reject });
        });
      } else {
        if (!fallbackModule || typeof fallbackModule[method] !== "function") {
          return Promise.reject(
            new Error("No worker and no fallback for method " + method)
          );
        }
        try {
          return await Promise.resolve(fallbackModule[method](payload));
        } catch (err) {
          return Promise.reject(err);
        }
      }
    },
    terminate() {
      if (supportsWorker && worker) worker.terminate();
    },
  };
}
