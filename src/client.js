import createTimeout from './utils/createTimeout';

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
    const effectiveCallback = typeof requestOptions === 'function' ? requestOptions : callback;

    this.send({ method, params }, requestOptions, effectiveCallback);
  }

  send(request, requestOptions, callback) {
    const effectiveCallback = typeof requestOptions === 'function' ? requestOptions : callback;

    let usedOptions = this.options;
    if (typeof requestOptions === 'object') {
      usedOptions = { ...usedOptions, ...requestOptions };
    }

    const rpcRequest = {
      jsonrpc: '2.0',
      ...request,
    };

    createTimeout(usedOptions.timeout, this.fetchURL(rpcRequest, usedOptions))
      .then(res => res.json())
      .then(res => {
        if (res.error) {
          throw new Error('Response contains error', res.error);
        }

        if (!res.result) {
          throw new Error("Response doesn't contain results");
        }

        return res;
      })
      .then(res => {
        effectiveCallback(null, res.result);
      })
      .catch(err => effectiveCallback(err, null));
  }

  sendBatch(requests, requestOptions, callback) {
    const effectiveCallback = typeof requestOptions === 'function' ? requestOptions : callback;

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
          throw new Error("Response doesn't contain results");
        }
        return res;
      })
      .then(res => effectiveCallback(null, res.map(singleResponse => singleResponse.result)))
      .catch(err => effectiveCallback(err, null));
  }
}
