import fs from 'fs';
const lines=fs.readFileSync('edge/src/A.html','utf8').split('\n');
const code=lines.slice(572,871).join('\n'); // lines 573..871 (1-based): BOOKS, PICS, PHIL, Object.assign blocks
const sandbox={};new Function('window',code+';window.BOOKS=BOOKS;')(sandbox);
const BOOKS=sandbox.BOOKS;
const SH=[["Beginnings",["nothing","bang","light","stars"]],["Galaxies & strange objects",["galaxy","andromeda","hole","waves","kilonova","pulsar"]],["The Sun & planets",["sun","solar","jupiter","saturn","mars","comet"]],["The Moon & Earth",["moonfull","moon","home","life","cambrian","dino","fire"]],["Inside you & beyond",["atom","transit","voyager","giant","fade"]]];
const out=[];SH.forEach(([s,ids])=>ids.forEach(id=>{const b=BOOKS[id];out.push({id,t:b.t,s:b.s,c:b.c,n:b.pages.length,shelf:s});}));
fs.writeFileSync('ssproj/public/library/edge-books.json',JSON.stringify(out));console.log(out.length,JSON.stringify(out.slice(0,2)));
