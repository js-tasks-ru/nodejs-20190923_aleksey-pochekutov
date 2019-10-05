const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.fileSize = 0;
  }

  _transform(chunk, encoding, callback) {
    const nextSumByte = this.fileSize + chunk.length;

    if ( nextSumByte >= this.limit ) {
      callback(new LimitExceededError, chunk);
    } else {
      callback(null, chunk);
    }

    this.fileSize += chunk.length;
  }
}

module.exports = LimitSizeStream;
