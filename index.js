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

