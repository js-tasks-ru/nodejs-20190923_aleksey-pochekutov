const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':

      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end('Nested paths are not allowed');
      }

      req.on('error', () => {
        res.statusCode = 500;
        res.end('internal error');
      });

      fs.unlink(filepath, (err) => {
        if (!err) {
          res.statusCode = 200;
          res.end('OK');
        } else {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('file is not define');
          } else {
            res.statusCode = 500;
            res.end('internal error');
          }
        }
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
