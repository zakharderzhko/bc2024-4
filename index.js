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

const fs = require('fs').promises;
const path = require('path');

async function ensureCacheDirectoryExists() {
  try {
    await fs.mkdir(cache, { recursive: true }); 
  } catch (error) {
    console.error(`Failed to create cache directory: ${error.message}`);
    process.exit(1);
  }
}
ensureCacheDirectoryExists();

const http = require('http');

async function getCachedImage(statusCode) {
  const filePath = path.join(cache, `${statusCode}.jpg`);
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    return null;  
  }
}
async function putCacheImage(statusCode, data) {
  const filePath = path.join(cache, `${statusCode}.jpg`);
  await fs.writeFile(filePath, data);
}
async function deleteCachedImage(statusCode) {
  const filePath = path.join(cache, `${statusCode}.jpg`);
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

const handleRequest = async (req, res) => {
  const statusCode = req.url.slice(1); 

  if (req.method === 'GET') {
    let image = await getCachedImage(statusCode);  

    if (!image) {  
      console.log(`Image for status code ${statusCode} not found in cache. Fetching from http.cat...`);
      
      image = await fetchCatImage(statusCode);  
      
      if (image) {
        await putCacheImage(statusCode, image);  
        console.log(`Image for status code ${statusCode} cached successfully.`);
      }
    }
    if (image) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(image);  
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');  
    }
  } else if (req.method === 'PUT') {
    let data = [];
    req.on('data', chunk => data.push(chunk));
    req.on('end', async () => {
      await putCacheImage(statusCode, Buffer.concat(data));
      res.writeHead(201, { 'Content-Type': 'text/plain' });
      res.end('Created');
    });
  } else if (req.method === 'DELETE') {
    const success = await deleteCachedImage(statusCode);
    if (success) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Deleted');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  }
};

const server = http.createServer(handleRequest);

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});

const superagent = require('superagent');
async function fetchCatImage(statusCode) {
  try {
    const response = await superagent.get(`https://http.cat/${statusCode}`);
    return response.body;
  } catch (error) {
    return null;
  }
}