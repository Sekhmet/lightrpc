/**
 * Adds timeout to promise.
 * @param {number} timeout Timeout in miliseconds.
 * @param {Promise} promise Promise to wrap in timeout
 * @returns {Promise} A promise that will fail if it doesn't resolve or reject in specified timeout
 */
export default function createTimeout(timeout, promise) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`Request has timed out. It should take no longer than ${timeout}ms.`));
    }, timeout);
    promise.then(resolve, reject);
  });
}
