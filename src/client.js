import createTimeout from './utils/createTimeout';
import { JSONRPCNoResult } from './utils/errors';

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

  call(method, params, requestOptions, callback) {
    if (typeof method !== 'string') throw new Error('InvalidArgument: method has to be a string');
    if (!(params instanceof Array)) throw new Error('InvalidArgument: params has to be an array');

    this.send({ method, params }, requestOptions, callback);
  }

  send(request, requestOptions, callback) {
    if (typeof request !== 'object')
      throw new Error('InvalidArgument: request has to be an object');

    this.sendBatch([request], requestOptions, (err, res) => {
      if (err) return callback(err, res);

      return callback(err, res[0]);
    });
  }

  sendBatch(requests, requestOptions, callback) {
    if (!(requests instanceof Array))
      throw new Error('InvalidArgument: requests has to be an array');
    if (typeof callback !== 'function') {
      throw new Error('InvalidArgument: callback has to be a function');
    }

    const rpcRequests = requests.map(request => ({
      jsonrpc: '2.0',
      ...request,
    }));

    let usedOptions = this.options;
    if (typeof requestOptions === 'object') {
      usedOptions = { ...usedOptions, ...requestOptions };
    }

    createTimeout(usedOptions.timeout, this.fetchURL(rpcRequests, usedOptions))
      .then(res => res.json())
      .then(res => {
        if (res.length < 1) {
          throw new JSONRPCNoResult("Response doesn't contain results");
        }
        return res;
      })
      .then(res => {
        callback(null, res.map(singleResponse => singleResponse.result));
        return res;
      })
      .catch(err => callback(err, null));
  }
}
