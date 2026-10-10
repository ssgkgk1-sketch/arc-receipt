import {mkdir,copyFile} from 'node:fs/promises';
await mkdir(new URL('./docs/',import.meta.url),{recursive:true});
for(const [src,dest] of [['site/index.html','index.html'],['site/app.mjs','app.mjs'],['receipt.mjs','receipt.mjs'],['demo.mjs','demo.mjs']])await copyFile(new URL(src,import.meta.url),new URL('docs/'+dest,import.meta.url));
console.log('Read-only GitHub Pages build complete. Wallet/deployment files excluded.');
