export class JSONRPCError extends Error {
  constructor(message, error) {
    super(message);
    this.name = 'JSONRPCError';
    this.error = error;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export class JSONRPCNoResult extends Error {
  constructor(message) {
    super(message);
    this.name = 'JSONRPCNoResult';
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
