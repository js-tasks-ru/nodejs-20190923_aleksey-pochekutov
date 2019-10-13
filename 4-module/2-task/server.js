const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

// server.on('error', () => {
//   console.log('server error');
// });

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

      const limitStream = new LimitSizeStream({limit: 1000});

      const file = fs.createWriteStream(filepath);

      limitStream.on('error', (err) => {
        console.log(err.code, 'error limitStream');

        file.destroy();
        fs.unlinkSync(filepath);
        // limitStream.destroy();
        res.statusCode = 413;
        res.end('Error limit');
      });

      file.on('end', (data) => {
        console.log(data, 'finish file');
      });

      limitStream.on('close', () => {
        console.log('end limitStream');
      });

      file.on('error', (err) => {
        // console.log(err.code, 'error file');
        res.statusCode = 500;
        res.end('Error for write file');
      });

      file.on('close', () => {
        // console.log('close file');
        res.statusCode = 201;
        res.end('File created');
      });

      req.on('close', (err) => {
        console.log(err && err.code, 'REQUEST CLOSE');
        fs.unlinkSync(filepath);

        res.statusCode = 500;
        res.end('Ops');
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


// server.on('request', async (req, res) => {
//   const pathname = url.parse(req.url).pathname.slice(1);

//   const filepath = path.join(__dirname, 'files', pathname);

//   if (pathname.includes('/')) {
//     res.statusCode = 400;
//     res.end('Вложенные папки не поддерживаются');
//     return;
//   }


//   switch (req.method) {
//     case 'POST':

//       const isHaveFile = await fs.existsSync(filepath);
//       if (isHaveFile) {
//         res.statusCode = 409;
//         res.end('Файл с таким именем уже существует');
//         return;
//       }

//       req.on('close', (err) => {
//         console.log(err, ' close err');
//         fs.unlinkSync(filepath);
//       });
//       // fs.createWriteStream(filepath);

//       const newFile = new LimitSizeStream({limit: 1024});
//       newFile.on('error', async (err) => {
//         console.log(err, ' err');
//         fs.unlinkSync(filepath);
//         res.statusCode = 413;
//         res.end('Превышен лимит размера файла');
//       });

//       newFile.on('finish', () => {
//         console.log('finish');
//         const file = fs.createWriteStream(filepath);


//         file.on('error', (err) => {
//           fs.unlinkSync(filepath);
//           res.statusCode = 400;
//           res.end('Произошла ошибка при записи файла');
//         });

//         file.on('finish', () => {
//           res.statusCode = 200;
//           res.end('Файл успешно создан');
//         });

//         newFile.pipe(file);
//       });

//       req.pipe(newFile);

//       break;

//     default:
//       res.statusCode = 501;
//       res.end('Not implemented');
//   }
// });
