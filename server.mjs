import http from 'node:http';
import {readFile} from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const paths=new Map([['/',['web/index.html','text/html; charset=utf-8']],['/app.js',['web/app.js','text/javascript']],['/policy.mjs',['web/policy.mjs','text/javascript']],['/source.sol',['contracts/ReceiptAnchor.sol','text/plain; charset=utf-8']]]);
http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  if(req.headers.host!=='127.0.0.1:5190'||req.method!=='GET'){res.writeHead(403);return res.end('Forbidden');}
  try{
    if(req.url==='/artifact.json'){
      const a=JSON.parse(await readFile(new URL('out/ReceiptAnchor.sol/ReceiptAnchor.json',root),'utf8'));
      res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({bytecode:a.bytecode.object,contract:'ReceiptAnchor',compiler:'0.8.18'}));
    }
    const entry=paths.get(req.url);if(!entry){res.writeHead(404);return res.end('Not found');}
    res.setHeader('Content-Type',entry[1]);res.end(await readFile(new URL(entry[0],root)));
  }catch{res.writeHead(500);res.end('Build artifact or page unavailable');}
}).listen(5190,'127.0.0.1',()=>console.log('ArcReceipt wallet page: http://127.0.0.1:5190/'));
