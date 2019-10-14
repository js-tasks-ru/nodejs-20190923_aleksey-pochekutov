const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

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
    case 'POST':

      const isHaveFile = fs.existsSync(filepath);
      if (isHaveFile) {
        res.statusCode = 409;
        res.end('Файл с таким именем уже существует');
        return;
      }

      const limitStream = new LimitSizeStream({limit: 1048576});

      const file = fs.createWriteStream(filepath);

      limitStream.on('error', (err) => {
        file.destroy();
        fs.unlinkSync(filepath);
        res.statusCode = 413;
        res.end('Request Entity Too Larg');
      });

      file.on('error', (err) => {
        res.statusCode = 500;
        res.end('Error for write file');
      });

      file.on('close', () => {
        res.statusCode = 201;
        res.end('File created');
      });

      req.on('close', (err) => {
        try {
          fs.unlinkSync(filepath);
        } catch (err) {
          console.log(err);
        }

        res.statusCode = 500;
        res.end('Internal Server Error');
        file.destroy();
      });

      req
          .pipe(limitStream)
          .pipe(file);

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
