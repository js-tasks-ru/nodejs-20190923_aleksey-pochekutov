const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.temp = '';
  }

  _isEmptyTemp() {
    return this.temp.length === 0;
  }

  _haveEOL(text) {
    return text.indexOf(os.EOL) !== -1;
  }

  _getTemp() {
    const template = this.temp;
    this._clearTemp();
    return template;
  }

  _clearTemp() {
    this.temp = '';
  }

  _transform(chunk, encoding, callback) {
    let text = chunk.toString();

    if (this._haveEOL(text)) {
      text = this._getTemp() + text;

      const list = text.split(os.EOL);
      this.temp = (list.length > 1 && list.pop()) || '';

      list.forEach((item) => this.push(item));
    } else {
      this.temp += text;
    }

    callback();
  }

  _flush(callback) {
    if (!this._isEmptyTemp()) {
      this.push(this.temp);
    }

    callback();
  }
}


module.exports = LineSplitStream;
