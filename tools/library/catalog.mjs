import fs from 'fs';
const D='/tmp/claude-0/-home-claude/4b3afc06-246e-5478-b440-46a46d6cfa84/scratchpad/ssproj/public/library/';
const words=s=>String(s).trim().split(/\s+/).filter(Boolean).length;
const out=[];
for(const f of fs.readdirSync(D+'books').filter(f=>f.endsWith('.json')).sort()){
 const b=JSON.parse(fs.readFileSync(D+'books/'+f,'utf8'));
 const tw=b.pages.reduce((a,pg)=>a+words((pg.p||[]).join(' '))+words(pg.h||'')+words(pg.fact||'')+words((pg.steps||[]).join(' ')),0);
 out.push({id:b.id,title:b.title,subtitle:b.subtitle,grade:b.grade,subject:b.subject,minutes:b.minutes,pages:b.pages.length+3,words:tw,cover:b.cover,chapters:b.pages.filter(p=>p.k==='ch').length,quizzes:b.pages.filter(p=>p.k==='quiz').length});
}
out.sort((a,b)=>a.grade-b.grade||a.title.localeCompare(b.title));
fs.writeFileSync(D+'catalog.json',JSON.stringify({built:new Date().toISOString().slice(0,10),books:out}));
const tp=out.reduce((a,b)=>a+b.pages,0),tw=out.reduce((a,b)=>a+b.words,0);
console.log(out.length,'books',tp,'pages',tw,'words; pages min',Math.min(...out.map(b=>b.pages)),'max',Math.max(...out.map(b=>b.pages)));
console.log(out.map(b=>b.grade+' '+b.id+' '+b.pages+'p').join('\n'));
