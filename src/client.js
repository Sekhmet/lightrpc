import createTimeout from './utils/createTimeout';
import { JSONRPCError, JSONRPCNoResult } from './utils/errors';

let fetch;
if (typeof window !== 'undefined' && window.fetch) {
  ({ fetch } = window);
} else {
  fetch = require('cross-fetch'); // eslint-disable-line global-require
}

export default class Client {
  constructor(address, defaultOptions = {}) {
    if (typeof address !== 'string') throw new Error('InvalidArgument: address has to ba a string');
    if (typeof defaultOptions !== 'object')
      throw new Error('InvalidArgument: defaultOptions has to be an object');

    this.address = address;

    this.options = {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' },
      ...defaultOptions,
    };

    this.nextRequestId = 0;

    this.fetchURL = this.fetchURL.bind(this);
    this.send = this.send.bind(this);
  }

  fetchURL(request, options) {
    return fetch(this.address, {
      body: JSON.stringify(request),
      headers: options.headers,
      method: 'post',
      mode: 'cors',
    });
  }

  send(method, params, requestOptions, callback) {
    if (typeof method !== 'string') throw new Error('InvalidArgument: method has to be a string');
    if (!(params instanceof Array)) throw new Error('InvalidArgument: params has to be an array');
    if (typeof callback !== 'function') {
      throw new Error('InvalidArgument: callback has to be a function');
    }

    const request = {
      id: this.nextRequestId,
      jsonrpc: '2.0',
      method,
      params,
    };
    this.nextRequestId += 1;

    let usedOptions = this.options;
    if (typeof requestOptions === 'object') {
      usedOptions = {
        ...usedOptions,
        ...requestOptions,
      };
    }

    createTimeout(usedOptions.timeout, this.fetchURL(request, usedOptions))
      .then(res => res.json())
      .then(res => {
        if (res.error) {
          throw new JSONRPCError(
            'Response contains error. See error property for details.',
            res.err,
          );
        }
        if (!res.result) {
          throw new JSONRPCNoResult("Response doesn't contain result");
        }
        return res;
      })
      .then(res => {
        callback(null, res.result);
        return res;
      })
      .catch(err => callback(err, null));
  }
}
