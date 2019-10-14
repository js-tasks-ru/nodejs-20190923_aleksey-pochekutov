const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.includes('/')) {
    res.statusCode = 400;
    res.end('Вложенные папки не поддерживаются');
    return;
  }

  switch (req.method) {
    case 'GET':

      fs.access(filepath, fs.constants.F_OK, async (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('Нет такого файла');
          } else {
            res.statusCode = 500;
            res.end();
          }
          return;
        }

        try {
          const file = await fs.readFileSync(filepath);
          res.statusCode = 200;
          res.end(file);
        } catch (err) {
          res.statusCode = 500;
          res.end('Ошибка при чтении файла: ', err);
        }
      });


      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
