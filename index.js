const { Command } = require('commander');
const program = new Command();

program
  .option('-h, --host <type>', 'server host')
  .option('-p, --port <type>', 'server port')
  .option('-c, --cache <path>', 'cache directory')
  .parse(process.argv);
  
const option = program.opts();

if(!option.host){
    console.error("Please, specify the server address")
}
if(!option.port){
    console.error("Please, specify the server port")
}
if(!option.cache){
    console.error("Please, specify the path to the directory that will contain cached files")
}
const { host, port, cache } = program.opts();
console.log(`Host: ${host}, Port: ${port}, Cache Directory: ${cache}`);

const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Proxy Server Running');
  });
  
  server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
  });

const fs = require('fs').promises;
const path = require('path');

async function getCachedImage(statusCode) {
  const filePath = path.join(cache, `${statusCode}.jpg`);
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    return null;  
  }
}

const handleRequest = async (req, res) => {
  const statusCode = req.url.slice(1);  

  if (req.method === 'GET') {
    const image = await getCachedImage(statusCode);
    if (image) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(image);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } 
};