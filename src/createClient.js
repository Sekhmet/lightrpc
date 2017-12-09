import createTimeout from './utils/createTimeout';
import { JSONRPCError, JSONRPCNoResult } from './utils/errors';

let fetch;
if (typeof window !== 'undefined' && window.fetch) {
  ({ fetch } = window);
} else {
  fetch = require('cross-fetch'); // eslint-disable-line global-require
}

/**
 * Creates new JSON-RPC client.
 *
 * @param {String} address Address of the JSON RPC (HTTP) server.
 * @returns {Client} JSON-RPC client that you can use for sending and receiving data.
 */
export default function createClient(address, options = {}) {
  if (typeof address !== 'string') throw new Error('InvalidArgument: address has to ba a string');
  if (typeof options !== 'object') throw new Error('InvalidArgument: options has to be an object');

  const clientOptions = {
    timeout: 5000,
    ...options,
  };

  let nextRequestId = 0;

  const fetchURL = request =>
    fetch(address, {
      body: JSON.stringify(request),
      method: 'post',
      mode: 'cors',
    });

  /**
   * Sends command to node
   * @param {String} method Method to execute
   * @param {any} params Method params
   * @param {Function} callback A callback that is called when response has been received
   * or request failed.
   */
  const send = (method, params, callback) => {
    if (typeof method !== 'string') throw new Error('InvalidArgument: method has to be a string');
    if (!(params instanceof Array)) throw new Error('InvalidArgument: params has to be an array');
    if (typeof callback !== 'function') {
      throw new Error('InvalidArgument: callback has to be a function');
    }

    const request = {
      id: nextRequestId,
      jsonrpc: '2.0',
      method,
      params,
    };
    nextRequestId += 1;

    createTimeout(clientOptions.timeout, fetchURL(request))
      .then(res => res.json())
      .then((res) => {
        if (res.error) {
          throw new JSONRPCError('Response contains error. See error property for details.', res.err);
        }
        if (!res.result) {
          throw new JSONRPCNoResult("Response doesn't contain result");
        }
        return res;
      })
      .then((res) => {
        callback(null, res.result);
        return res;
      })
      .catch(err => callback(err, null));
  };

  return { send };
}
