/* ---- ART: every picture is drawn live by code ---- */
window.ART=(function(){
const TAU=Math.PI*2;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function glow(c,x,y,r,col,a){if(r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
const lerp=(a,b,f)=>a+(b-a)*f;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const x=clamp((v-a)/(b-a),0,1);return x*x*(3-2*x);};
function bg(c,w,h,top,bot){const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fillRect(0,0,w,h);}

/* ---------- SCENES ---------- */
const scenes={
cometart:{init(r){return{st:Array.from({length:300},()=>({x:r(),y:r(),a:r()*.7})),d:Array.from({length:700},()=>({u:r(),o:(r()-.5),z:.6+r()*1.5})),io:Array.from({length:400},()=>({u:r(),o:(r()-.5)*.15,z:.5+r()}))};},
 draw(c,w,h,t,s){c.fillStyle='#03040b';c.fillRect(0,0,w,h);for(const q of s.st){c.fillStyle='rgba(220,225,255,'+q.a+')';c.fillRect(q.x*w,q.y*h,1,1);}
  const T=t%16,grow=smooth(1,9,T),sx=-w*.05,sy=h*.5;glow(c,sx,sy,h*.5,'255,200,110',.6);
  const nx=w*.32+Math.sin(t*.2)*6,ny=h*.55,L=w*.75*grow;c.globalCompositeOperation='lighter';
  for(const p of s.io){const x=nx+p.u*L,y=ny-p.u*L*.08+p.o*h*p.u;c.fillStyle='rgba(120,180,255,'+(.6*(1-p.u))+')';c.fillRect(x,y,p.z,p.z);}
  for(const p of s.d){const x=nx+p.u*L*.85,y=ny+p.u*p.u*h*.35+p.o*h*.12*p.u;c.fillStyle='rgba(255,226,170,'+(.55*(1-p.u))+')';c.fillRect(x,y,p.z,p.z);}
  glow(c,nx,ny,20+40*grow,'200,230,255',.7);c.globalCompositeOperation='source-over';c.fillStyle='#3a3530';c.beginPath();c.ellipse(nx,ny,5,3.5,.4,0,TAU);c.fill();}},
pulsarart:{init(r){return{st:Array.from({length:300},()=>({x:r(),y:r(),a:r()*.7}))};},
 draw(c,w,h,t,s){c.fillStyle='#02030a';c.fillRect(0,0,w,h);for(const q of s.st){c.fillStyle='rgba(220,225,255,'+q.a+')';c.fillRect(q.x*w,q.y*h,1,1);}
  const cx=w/2,cy=h/2,R=Math.min(w,h),a=t*2.2;c.strokeStyle='rgba(140,170,255,.25)';c.lineWidth=1.2;for(let k=1;k<=4;k++){c.beginPath();c.ellipse(cx-k*R*.06,cy,k*R*.06,k*R*.1,0,0,TAU);c.stroke();c.beginPath();c.ellipse(cx+k*R*.06,cy,k*R*.06,k*R*.1,0,0,TAU);c.stroke();}
  c.globalCompositeOperation='lighter';for(const sg of[1,-1]){const ang=a+(sg>0?0:Math.PI);const g=c.createLinearGradient(cx,cy,cx+Math.cos(ang)*R*.7,cy+Math.sin(ang)*R*.35);g.addColorStop(0,'rgba(200,220,255,.85)');g.addColorStop(1,'rgba(120,150,255,0)');c.fillStyle=g;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ang-.12)*R*.7,cy+Math.sin(ang-.12)*R*.35);c.lineTo(cx+Math.cos(ang+.12)*R*.7,cy+Math.sin(ang+.12)*R*.35);c.closePath();c.fill();}
  const face=Math.pow(Math.max(0,Math.cos(a)),40);if(face>.02){c.fillStyle='rgba(200,220,255,'+(face*.35)+')';c.fillRect(0,0,w,h);}
  glow(c,cx,cy,R*.08,'190,215,255',1);glow(c,cx,cy,R*.025,'255,255,255',1);c.globalCompositeOperation='source-over';}},

saturnart:{init(r){return{st:Array.from({length:260},()=>({x:r(),y:r(),a:r()*.7})),band:Array.from({length:14},(_,i)=>['#e8d2a4','#d1b07a','#f2e2bf','#c49c62'][i%4]),ring:Array.from({length:90},(_,i)=>({k:i/90,a:(i>56&&i<62)?.03:.12+.55*Math.abs(Math.sin(i*1.7+r()))})),m:[[2.9,.5,0],[3.5,.3,2],[4.2,.2,4]]};},
 draw(c,w,h,t,s){c.fillStyle='#04040a';c.fillRect(0,0,w,h);for(const q of s.st){c.fillStyle='rgba(220,225,255,'+q.a+')';c.fillRect(q.x*w,q.y*h,1,1);}
  const cx=w/2,cy=h/2,R=Math.min(w*.2,h*.3),T=t%20,tilt=.05+.33*Math.abs(Math.cos(T/20*Math.PI)),rot=-.22;
  function rings(back){for(const q of s.ring){const rr=R*(1.25+q.k*1.05);c.strokeStyle='rgba(232,212,172,'+q.a+')';c.lineWidth=Math.max(1,R*.014);c.beginPath();c.ellipse(cx,cy,rr,rr*tilt,rot,back?Math.PI:0,back?TAU:Math.PI);c.stroke();}}
  rings(true);c.save();c.beginPath();c.arc(cx,cy,R,0,TAU);c.clip();c.save();c.translate(cx,cy);c.rotate(rot);s.band.forEach((b,i)=>{c.fillStyle=b;c.fillRect(-R*1.2,-R+i*(2*R/14),R*2.4,2*R/14+1);});c.restore();
  const g=c.createRadialGradient(cx-R*.4,cy-R*.4,R*.2,cx,cy,R*1.05);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.65)');c.fillStyle=g;c.fillRect(cx-R,cy-R,2*R,2*R);c.restore();rings(false);
  for(const[rr,sp,ph]of s.m){const a=t*sp+ph,x=cx+Math.cos(a)*R*rr,y=cy+Math.sin(a)*R*rr*tilt;glow(c,x,y,5,'255,240,210',.9);}}},

atomart:{init(r){return{p:Array.from({length:2600},()=>{const k=r();let x,y;if(k<.3){const d=-Math.log(r()*r()+1e-6)*.05,a=r()*TAU;x=Math.cos(a)*d;y=Math.sin(a)*d;}else if(k<.6){const d=.22+(r()+r()+r()-1.5)*.05,a=r()*TAU;x=Math.cos(a)*d;y=Math.sin(a)*d;}else{const sg=r()<.5?-1:1,d=.12+r()*.22,sp=(r()-.5)*.5;const vert=k>.8;x=vert?sp*d:sg*d;y=vert?sg*d:sp*d;}return{x,y,c:k<.3?'140,240,255':k<.6?'90,140,255':k<.8?'215,115,255':'255,130,200',z:.8+r()*1.4};}),n:Array.from({length:12},(_,i)=>({a:i*2.4,d:.02+(i%3)*.012,red:i%2}))};},
 draw(c,w,h,t,s){c.fillStyle='#07050f';c.fillRect(0,0,w,h);const cx=w/2,cy=h/2,R=Math.min(w,h)*1.05;c.globalCompositeOperation='lighter';
  for(const p of s.p){const j=Math.sin(t*3+p.x*50)*.004;c.fillStyle='rgba('+p.c+',.55)';c.fillRect(cx+(p.x+j)*R,cy+(p.y-j)*R,p.z,p.z);}
  glow(c,cx,cy,R*.09,'255,170,140',.9);c.globalCompositeOperation='source-over';
  for(const q of s.n){const x=cx+Math.cos(q.a+t*.5)*q.d*R+Math.sin(t*9+q.a)*1.2,y=cy+Math.sin(q.a+t*.5)*q.d*R;const g=c.createRadialGradient(x-2,y-2,1,x,y,R*.022);g.addColorStop(0,q.red?'#ff9a8a':'#c9d8ff');g.addColorStop(1,q.red?'#a3221a':'#3b5a9a');c.fillStyle=g;c.beginPath();c.arc(x,y,R*.022,0,TAU);c.fill();}
  for(let k=0;k<6;k++){const a=t*(1.3+k*.4)+k,d=(k<2?.07:k<4?.22:.3)*R;glow(c,cx+Math.cos(a*1.7)*d,cy+Math.sin(a)*d*(k>3?.4:1),7,'255,255,255',1);}}},

nothing:{init(r){return{p:Array.from({length:320},()=>({x:r(),y:r(),ph:r()*TAU,rate:.6+r()*2.4}))};},
 draw(c,w,h,t,s){c.fillStyle='#000';c.fillRect(0,0,w,h);
  for(const p of s.p){const a=Math.pow(Math.max(0,Math.sin(t*p.rate+p.ph)),14);if(a>.02){c.fillStyle='rgba(200,210,255,'+a+')';c.fillRect(p.x*w,p.y*h,1.6,1.6);}}}},

bang:{init(r){const cols=['255,250,235','255,214,140','255,150,80','255,110,60','180,200,255'];return{p:Array.from({length:900},()=>({a:r()*TAU,s:.15+r()*1.1,c:cols[(r()*cols.length)|0],z:.6+r()*1.8}))};},
 draw(c,w,h,t,s){const T=t%10;c.fillStyle='#000';c.fillRect(0,0,w,h);const cx=w/2,cy=h/2,M=Math.hypot(w,h)/2;
  const R=M*(1-Math.exp(-T*.65))+2,k=Math.exp(-T*.22);
  const g=c.createRadialGradient(cx,cy,0,cx,cy,R);g.addColorStop(0,'rgba(255,255,255,'+k+')');g.addColorStop(.22,'rgba(255,228,165,'+(.9*k)+')');g.addColorStop(.6,'rgba(255,110,50,'+(.55*k)+')');g.addColorStop(1,'rgba(120,20,40,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.globalCompositeOperation='lighter';
  for(const p of s.p){const d=R*p.s;c.fillStyle='rgba('+p.c+','+(.85*Math.min(1,k+.25))+')';c.fillRect(cx+Math.cos(p.a)*d,cy+Math.sin(p.a)*d,p.z,p.z);}
  c.globalCompositeOperation='source-over';
  if(T<.35){c.fillStyle='rgba(255,255,255,'+(1-T/.35)+')';c.fillRect(0,0,w,h);}}},

light:{init(r){const o=document.createElement('canvas');o.width=900;o.height=450;const x=o.getContext('2d');
  x.fillStyle='rgb(150,170,205)';x.fillRect(0,0,900,450);
  const stops=[[0,[30,50,150]],[.33,[100,165,230]],[.5,[235,228,205]],[.68,[245,155,60]],[1,[190,35,30]]];
  function col(v){for(let i=1;i<stops.length;i++){if(v<=stops[i][0]){const a=stops[i-1],b=stops[i],f=(v-a[0])/(b[0]-a[0]);return a[1].map((q,j)=>Math.round(lerp(q,b[1][j],f))).join(',');}}return'190,35,30';}
  for(let i=0;i<3400;i++){const px=r()*900,py=r()*450,rad=3+Math.pow(r(),2)*30;glow(x,px,py,rad,col(r()),.42);}
  return{o};},
 draw(c,w,h,t,s){const T=t%11;c.fillStyle='#000';c.fillRect(0,0,w,h);
  const rx=Math.min(w*.46,h*.86),ry=rx/2,cx=w/2,cy=h*.46;
  c.save();c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,TAU);c.clip();
  const pan=Math.sin(t*.07)*30;c.drawImage(s.o,cx-rx-40+pan,cy-ry-20,rx*2+80,ry*2+40);
  c.restore();
  c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=1;c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,TAU);c.stroke();
  const fog=.92*(1-smooth(.5,4.5,T));if(fog>0){c.fillStyle='rgba(255,140,60,'+fog+')';c.fillRect(0,0,w,h);}}},

stars:{init(r){return{p:Array.from({length:160},()=>{const big=r()<.16,b=r()*8;return{x:r(),y:r(),b,big,ex:big?b+2+r()*3:99,z:.6+r()};})};},
 draw(c,w,h,t,s){const T=t%13;bg(c,w,h,'#02030a','#070a1c');c.globalCompositeOperation='lighter';
  for(const p of s.p){if(T<p.b)continue;const x=p.x*w,y=p.y*h,br=Math.min(1,(T-p.b)/1.2);
   if(T>p.ex){const e=T-p.ex,a=Math.max(0,1-e/2.6);if(a<=0)continue;c.strokeStyle='rgba(255,150,80,'+a+')';c.lineWidth=2;c.beginPath();c.arc(x,y,e*55,0,TAU);c.stroke();glow(c,x,y,60*a,'255,190,120',a);continue;}
   glow(c,x,y,(p.big?26:9)*br*p.z,p.big?'170,200,255':'210,220,255',.9*br);c.fillStyle='rgba(255,255,255,'+br+')';c.fillRect(x-1,y-1,2,2);}
  c.globalCompositeOperation='source-over';}},

galaxy:{init(r){const p=[];for(let i=0;i<3200;i++){const arm=r()<.5?0:1,rr=Math.pow(r(),.75);const th=arm*Math.PI+rr*5.4+(r()-.5)*(.9-rr*.4);const col=rr<.25?'255,226,175':rr<.55?'230,215,255':'150,180,255';p.push({rr,th,col,z:.8+r()*1.2});}
  const halo=Array.from({length:350},()=>({x:r(),y:r(),a:r()*.6}));return{p,halo};},
 draw(c,w,h,t,s){c.fillStyle='#03040b';c.fillRect(0,0,w,h);for(const q of s.halo){c.fillStyle='rgba(220,225,255,'+q.a+')';c.fillRect(q.x*w,q.y*h,1,1);}
  const cx=w/2,cy=h*.47,R=Math.min(w*.46,h*.9),tilt=.5;c.globalCompositeOperation='lighter';
  for(const p of s.p){const a=p.th+t*.22/(.25+p.rr);c.fillStyle='rgba('+p.col+',.75)';c.fillRect(cx+Math.cos(a)*p.rr*R,cy+Math.sin(a)*p.rr*R*tilt,p.z,p.z);}
  glow(c,cx,cy,R*.28,'255,215,150',.75);glow(c,cx,cy,R*.08,'255,245,220',1);c.globalCompositeOperation='source-over';}},

sun:{init(r){return{p:Array.from({length:2200},()=>({r0:.12+Math.pow(r(),.8)*.88,a:r()*TAU,z:.6+r()*1.4,o:.25+r()*.5})),pl:[.32,.48,.66,.86].map(v=>({r0:v,a:r()*TAU}))};},
 draw(c,w,h,t,s){const T=t%14;c.fillStyle='#050308';c.fillRect(0,0,w,h);const cx=w/2,cy=h*.5,R=Math.min(w*.47,h*1.05),tilt=.3;
  c.globalCompositeOperation='lighter';
  for(const p of s.p){const a=p.a+t*.25/Math.pow(p.r0,1.5);c.fillStyle='rgba(225,150,90,'+p.o+')';c.fillRect(cx+Math.cos(a)*p.r0*R,cy+Math.sin(a)*p.r0*R*tilt,p.z,p.z);}
  const grow=.35+.65*smooth(0,6,T);glow(c,cx,cy,R*.3*grow,'255,190,100',.8);glow(c,cx,cy,R*.07*grow,'255,250,225',1);
  for(const q of s.pl){const a=q.a+t*.25/Math.pow(q.r0,1.5);const x=cx+Math.cos(a)*q.r0*R,y=cy+Math.sin(a)*q.r0*R*tilt;glow(c,x,y,9,'255,210,170',.9);}
  c.globalCompositeOperation='source-over';}},

moon:{init(r){return{d:Array.from({length:600},()=>({a:r()*TAU,rad:1.5+r()*1.4,z:.8+r()*1.6,sp:.6+r()*.6}))};},
 draw(c,w,h,t,s){const T=t%13;c.fillStyle='#030307';c.fillRect(0,0,w,h);const ex=w*.42,ey=h*.52,er=Math.min(w,h)*.17;
  const eg=c.createRadialGradient(ex-er*.35,ey-er*.35,er*.1,ex,ey,er);eg.addColorStop(0,'#ffb35c');eg.addColorStop(.5,'#c2421c');eg.addColorStop(1,'#3a0b06');c.fillStyle=eg;c.beginPath();c.arc(ex,ey,er,0,TAU);c.fill();glow(c,ex,ey,er*1.5,'255,90,40',.25);
  if(T<3){const f=T/3,tx=lerp(w+er,ex+er*1.25,f),ty=lerp(h*.1,ey-er*.35,f),tr=er*.55;const tg=c.createRadialGradient(tx-tr*.3,ty-tr*.3,1,tx,ty,tr);tg.addColorStop(0,'#c9b8a5');tg.addColorStop(1,'#4a3c35');c.fillStyle=tg;c.beginPath();c.arc(tx,ty,tr,0,TAU);c.fill();}
  else{const e=T-3,spread=smooth(0,2.2,e),fade=1-.85*smooth(5,8,T);const ix=ex+er*.8,iy=ey-er*.4;c.globalCompositeOperation='lighter';
   for(const p of s.d){const a=p.a+e*p.sp/p.rad;const ox=ex+Math.cos(a)*er*p.rad,oy=ey+Math.sin(a)*er*p.rad*.45;c.fillStyle='rgba(255,170,100,'+(.7*fade)+')';c.fillRect(lerp(ix,ox,spread),lerp(iy,oy,spread),p.z,p.z);}
   c.globalCompositeOperation='source-over';
   if(e<1){glow(c,ix,iy,er*3*(1-e*.4),'255,245,220',1-e);}
   const m=smooth(5,9,T);if(m>0){const ma=t*.3,mx=ex+Math.cos(ma)*er*2.8,my=ey+Math.sin(ma)*er*1.2,mr=er*.27*m;const mg=c.createRadialGradient(mx-mr*.3,my-mr*.3,1,mx,my,mr);mg.addColorStop(0,'#e8e4dc');mg.addColorStop(1,'#5b5650');c.fillStyle=mg;c.beginPath();c.arc(mx,my,mr,0,TAU);c.fill();}}}},

life:{init(r){const memo={};function pos(i,g){const k=i+':'+g;if(memo[k])return memo[k];if(g===0)return memo[k]={x:0,y:0};const par=pos(i>>1,g-1);const rr=rng(i*7919+g*104729)();const a=rr*TAU;const st=95/(1+g*.55);return memo[k]={x:par.x+Math.cos(a)*st,y:par.y+Math.sin(a)*st*.8};}
  return{pos,rays:Array.from({length:6},()=>({x:r(),w:.04+r()*.08,ph:r()*TAU})),snow:Array.from({length:120},()=>({x:r(),y:r(),s:.01+r()*.03}))};},
 draw(c,w,h,t,s){const T=t%15;bg(c,w,h,'#06414a','#011317');
  for(const ry of s.rays){const x=(ry.x+Math.sin(t*.2+ry.ph)*.03)*w;c.fillStyle='rgba(180,255,240,.05)';c.beginPath();c.moveTo(x-ry.w*w*.3,0);c.lineTo(x+ry.w*w*.3,0);c.lineTo(x+ry.w*w*2,h);c.lineTo(x-ry.w*w*.6,h);c.fill();}
  for(const q of s.snow){c.fillStyle='rgba(220,255,245,.35)';c.fillRect(q.x*w,((q.y+t*q.s)%1)*h,1.5,1.5);}
  const sc=Math.min(w,h)/420,cx=w/2,cy=h*.46;const gf=T/1.7,g=Math.min(7,Math.floor(gf)),f=g<7?smooth(.55,1,gf-g):0;
  const n=g<7?Math.pow(2,g+1):Math.pow(2,7);const rad=26/(1+g*.3)*sc;
  for(let i=0;i<n;i++){let p;if(g<7){const a=s.pos(i>>1,g),b=s.pos(i,g+1);p={x:lerp(a.x,b.x,f),y:lerp(a.y,b.y,f)};}else p=s.pos(i,7);
   const x=cx+p.x*sc+Math.sin(t*.8+i)*2,y=cy+p.y*sc+Math.cos(t*.7+i)*2;
   c.fillStyle='rgba(120,235,185,.22)';c.strokeStyle='rgba(160,255,210,.75)';c.lineWidth=1.4;c.beginPath();c.arc(x,y,rad,0,TAU);c.fill();c.stroke();
   c.fillStyle='rgba(200,255,225,.85)';c.beginPath();c.arc(x+rad*.2,y-rad*.15,rad*.28,0,TAU);c.fill();}}},

cambrian:{init(r){return{k:Array.from({length:58},()=>({x0:r(),y0:.1+r()*.8,sp:(.012+r()*.03)*(r()<.5?1:-1),z:6+r()*16,hue:(r()*360)|0,ty:(r()*3)|0,f:.5+r()*1.5,ph:r()*TAU})),snow:Array.from({length:140},()=>({x:r(),y:r(),s:.005+r()*.02}))};},
 draw(c,w,h,t,s){bg(c,w,h,'#0a3456','#020a14');for(const q of s.snow){c.fillStyle='rgba(220,235,255,.3)';c.fillRect(q.x*w,((q.y+t*q.s)%1)*h,1.4,1.4);}
  for(const p of s.k){let fx=((p.x0+t*p.sp)%1.2+1.2)%1.2-.1;const x=fx*w,y=p.y0*h+Math.sin(t*p.f+p.ph)*16,z=p.z,dir=p.sp>0?1:-1,col='hsla('+p.hue+',75%,62%,.85)',wig=Math.sin(t*6*p.f+p.ph);
   c.save();c.translate(x,y);c.scale(dir,1);c.fillStyle=col;c.strokeStyle=col;c.lineWidth=1.2;
   if(p.ty===0){c.beginPath();c.arc(0,0,z*.7,Math.PI,0);c.fill();for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*z*.25,0);c.quadraticCurveTo(i*z*.25+wig*4,z*.8,i*z*.25,z*1.6);c.stroke();}}
   else if(p.ty===1){c.beginPath();c.ellipse(0,0,z,z*.4,0,0,TAU);c.fill();c.beginPath();c.moveTo(-z*.9,0);c.lineTo(-z*1.6,-z*.4+wig*3);c.lineTo(-z*1.6,z*.4+wig*3);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(z*.55,-z*.08,z*.12,0,TAU);c.fill();}
   else{for(let i=0;i<5;i++){c.beginPath();c.ellipse(-i*z*.32+z*.6,0,z*.22,z*.55*(1-i*.1),0,0,TAU);c.fill();}c.beginPath();c.moveTo(z*.8,-z*.2);c.lineTo(z*1.4,-z*.6+wig*2);c.moveTo(z*.8,z*.2);c.lineTo(z*1.4,z*.6-wig*2);c.stroke();}
   c.restore();}}},

dino:{init(r){return{ferns:Array.from({length:9},()=>({x:r(),hgt:.12+r()*.14}))};},
 draw(c,w,h,t,s){const T=t%13,gy=h*.74;bg(c,w,h,'#2b3a67','#f3a65b');
  const ax=w*.7,ay=gy-6;
  if(T<3.6){const f=T/3.6,x=lerp(w*1.02,ax,f),y=lerp(-30,ay,f*f*.2+f*.8);const tg=c.createLinearGradient(x,y,x+w*.25,y-h*.35);tg.addColorStop(0,'rgba(255,240,200,.95)');tg.addColorStop(1,'rgba(255,140,60,0)');c.strokeStyle=tg;c.lineWidth=5;c.beginPath();c.moveTo(x,y);c.lineTo(x+w*.25,y-h*.35);c.stroke();glow(c,x,y,22,'255,230,180',1);}
  else{const e=T-3.6;const fr=Math.min(w*.55,e*w*.14);const fg=c.createRadialGradient(ax,ay,0,ax,ay,fr);fg.addColorStop(0,'rgba(255,240,190,'+Math.max(0,1-e/5)+')');fg.addColorStop(.4,'rgba(255,120,40,'+Math.max(0,.9-e/6)+')');fg.addColorStop(1,'rgba(120,20,10,0)');c.fillStyle=fg;c.beginPath();c.arc(ax,ay,fr,Math.PI,TAU);c.fill();
   c.fillStyle='rgba(30,10,5,'+Math.min(.82,e/4)+')';c.fillRect(0,0,w,h);if(e<.6){c.fillStyle='rgba(255,255,255,'+(1-e/.6)+')';c.fillRect(0,0,w,h);}}
  c.fillStyle='#120a08';c.beginPath();c.moveTo(0,h);c.lineTo(0,gy);for(let x=0;x<=w;x+=20)c.lineTo(x,gy+Math.sin(x*.01)*8+Math.sin(x*.037)*4);c.lineTo(w,h);c.fill();
  c.strokeStyle='#120a08';c.lineWidth=2;for(const f of s.ferns){const x=f.x*w,ht=f.hgt*h;c.beginPath();c.moveTo(x,gy+4);c.lineTo(x,gy-ht);c.stroke();for(let i=0;i<7;i++){const a=i/7*Math.PI;c.beginPath();c.moveTo(x,gy-ht);c.quadraticCurveTo(x+Math.cos(a)*ht*.4,gy-ht-Math.sin(a)*ht*.35,x+Math.cos(a)*ht*.55,gy-ht+ht*.15);c.stroke();}}
  const dx=w*.28,dy=gy-h*.09,u=Math.min(w,h)/420,bob=Math.sin(t*1.5)*1.5;c.fillStyle='#120a08';
  c.beginPath();c.ellipse(dx,dy+bob,60*u,26*u,0,0,TAU);c.fill();
  c.lineCap='round';c.strokeStyle='#120a08';c.lineWidth=15*u;c.beginPath();c.moveTo(dx+45*u,dy-8*u+bob);c.quadraticCurveTo(dx+80*u,dy-60*u,dx+105*u,dy-95*u+Math.sin(t)*3);c.stroke();
  c.beginPath();c.ellipse(dx+112*u,dy-98*u+Math.sin(t)*3,14*u,8*u,.2,0,TAU);c.fill();
  c.lineWidth=12*u;c.beginPath();c.moveTo(dx-50*u,dy+bob);c.quadraticCurveTo(dx-110*u,dy+5*u,dx-150*u,dy+25*u+Math.sin(t*1.2)*5);c.stroke();
  c.lineWidth=13*u;for(const lx of[-30,-12,22,40]){c.beginPath();c.moveTo(dx+lx*u,dy+15*u+bob);c.lineTo(dx+lx*u,gy+2);c.stroke();}c.lineCap='butt';}},

fire:{init(r){return{st:Array.from({length:420},()=>({a:r()*TAU,d:Math.sqrt(r()),z:.5+r()*1.3})),fl:Array.from({length:200},()=>({ph:r(),sp:.6+r()*.9,xo:(r()-.5)*2})),pp:[-1,1,1.8].map(v=>v)};},
 draw(c,w,h,t,s){bg(c,w,h,'#03051a','#171b3e');const px=w*.82,py=-h*.15,M=Math.hypot(w,h);
  for(const q of s.st){const a=q.a+t*.015;c.fillStyle='rgba(225,230,255,.75)';c.fillRect(px+Math.cos(a)*q.d*M,py+Math.sin(a)*q.d*M,q.z,q.z);}
  const gy=h*.8;c.fillStyle='#06050c';c.beginPath();c.moveTo(0,h);c.lineTo(0,gy);for(let x=0;x<=w;x+=25)c.lineTo(x,gy+Math.sin(x*.008)*14);c.lineTo(w,h);c.fill();
  const fx=w*.5,fy=gy+4,fl=.85+.15*Math.sin(t*13)*Math.sin(t*7);glow(c,fx,fy,Math.min(w,h)*.42*fl,'255,130,40',.35);
  c.globalCompositeOperation='lighter';
  for(const p of s.fl){const life=(t*p.sp+p.ph)%1,y=fy-life*Math.min(110,h*.2),x=fx+p.xo*(1-life)*18+Math.sin(t*9+p.ph*20)*3*life,z=(1-life)*8;c.fillStyle='rgba(255,'+Math.round(220-life*170)+','+Math.round(90-life*80)+','+(1-life)*.75+')';c.beginPath();c.arc(x,y,z,0,TAU);c.fill();}
  c.globalCompositeOperation='source-over';
  const u=Math.min(w,h)/420;c.fillStyle='#000';for(const v of[-1,1,1.9]){const x=fx+v*70*u,y=fy;c.beginPath();c.arc(x,y-46*u,10*u,0,TAU);c.fill();c.beginPath();c.ellipse(x,y-18*u,15*u,26*u,0,0,TAU);c.fill();}}},

earth:{init(r){const C=[[10,50,9,190],[78,23,8,170],[115,32,8,190],[138,36,3,60],[-80,39,6,120],[-120,37,4,60],[-46,-22,5,70],[5,8,5,60],[31,29,3,50],[-100,20,5,60],[105,13,6,90],[110,-7,5,70],[150,-33,3,30],[-79,44,3,40],[-58,-34,3,30],[28,-26,3,30],[37,55,6,60]];const pts=[];
  for(const[lo,la,sp,n]of C)for(let i=0;i<n;i++)pts.push({lon:lo+(r()-.5)*sp*2,lat:la+(r()-.5)*sp*1.3,b:.4+r()*.6});
  return{pts,st:Array.from({length:300},()=>({x:r(),y:r(),a:r()*.7})),sat:Array.from({length:7},()=>({a:r()*TAU,rr:1.12+r()*.35,tl:(r()-.5)*1.2,sp:.4+r()*.5}))};},
 draw(c,w,h,t,s){c.fillStyle='#02030a';c.fillRect(0,0,w,h);for(const q of s.st){c.fillStyle='rgba(220,225,255,'+q.a+')';c.fillRect(q.x*w,q.y*h,1,1);}
  const cx=w/2,cy=h*.5,R=Math.min(w,h)*.36,tilt=.38,rot=t*7,D=Math.PI/180;
  glow(c,cx,cy,R*1.25,'90,140,255',.35);const g=c.createRadialGradient(cx-R*.3,cy-R*.3,R*.1,cx,cy,R);g.addColorStop(0,'#13274a');g.addColorStop(1,'#02060f');c.fillStyle=g;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
  c.globalCompositeOperation='lighter';
  for(const p of s.pts){const la=p.lat*D,lm=(p.lon+rot)*D;const z=Math.sin(la)*Math.sin(tilt)+Math.cos(la)*Math.cos(lm)*Math.cos(tilt);if(z<=0)continue;const x=cx+R*Math.cos(la)*Math.sin(lm),y=cy-R*(Math.sin(la)*Math.cos(tilt)-Math.cos(la)*Math.cos(lm)*Math.sin(tilt));c.fillStyle='rgba(255,200,110,'+(.9*z*p.b)+')';c.fillRect(x,y,1.6,1.6);}
  for(const q of s.sat){const a=q.a+t*q.sp,x=cx+Math.cos(a)*R*q.rr,y=cy+Math.sin(a)*R*q.rr*.35+Math.cos(a)*R*q.tl*.3;if(Math.sin(a)<0&&Math.hypot(x-cx,y-cy)<R)continue;glow(c,x,y,5,'200,230,255',.9);}
  c.globalCompositeOperation='source-over';c.strokeStyle='rgba(120,170,255,.45)';c.lineWidth=2;c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();}},

hole:{init(r){return{p:Array.from({length:1600},()=>({a:r()*TAU,rr:1.35+Math.pow(r(),1.6)*1.5,z:.6+r()*1.6})),st:Array.from({length:260},()=>({x:r(),y:r(),a:r()*.7}))};},
 draw(c,w,h,t,s){c.fillStyle='#000';c.fillRect(0,0,w,h);for(const q of s.st){c.fillStyle='rgba(220,225,255,'+q.a+')';c.fillRect(q.x*w,q.y*h,1,1);}
  const cx=w/2,cy=h*.5,R=Math.min(w,h)*.13,tl=.26;
  function disk(back){c.globalCompositeOperation='lighter';for(const p of s.p){const a=p.a+t*1.1/Math.pow(p.rr,1.5);const sn=Math.sin(a);if(back?sn>0:sn<=0)continue;const dop=.45+.55*(1+Math.cos(a))/2;c.fillStyle='rgba(255,'+Math.round(150+80*dop)+','+Math.round(70+60*dop)+','+(.85*dop)+')';c.fillRect(cx+Math.cos(a)*p.rr*R*1.6,cy+sn*p.rr*R*1.6*tl,p.z,p.z);}c.globalCompositeOperation='source-over';}
  disk(true);
  c.lineWidth=R*.35;const lg=c.createLinearGradient(cx-R*1.6,0,cx+R*1.6,0);lg.addColorStop(0,'rgba(255,190,110,.75)');lg.addColorStop(1,'rgba(255,120,60,.35)');c.strokeStyle=lg;c.beginPath();c.ellipse(cx,cy,R*1.45,R*1.3,0,Math.PI*1.04,Math.PI*1.96);c.stroke();
  glow(c,cx,cy,R*1.25,'255,200,140',.7);c.fillStyle='#000';c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
  c.strokeStyle='rgba(255,230,190,.9)';c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,R*1.04,0,TAU);c.stroke();
  disk(false);}},

kilonova:{init(r){return{g:Array.from({length:500},()=>({a:r()*TAU,s:.3+r(),z:.8+r()*1.8,gold:r()<.4}))};},
 draw(c,w,h,t,s){const T=t%13;c.fillStyle='#04030a';c.fillRect(0,0,w,h);const cx=w/2,cy=h*.5,R0=Math.min(w,h)*.3;
  c.strokeStyle='rgba(150,170,255,.18)';c.lineWidth=1.2;for(let k=0;k<9;k++){const rr=((t*60+k*55)%(Math.hypot(w,h)*.6));c.beginPath();c.ellipse(cx,cy,rr,rr*.62,0,0,TAU);c.stroke();}
  if(T<5){const f=1-T/5,r=R0*Math.pow(Math.max(f,.02),.35),om=t*1.5+(1-Math.pow(f,1.6))*40;c.globalCompositeOperation='lighter';
   for(const sgn of[1,-1]){const x=cx+Math.cos(om)*r*sgn,y=cy+Math.sin(om)*r*.6*sgn;glow(c,x,y,26,'190,215,255',.9);c.fillStyle='#fff';c.beginPath();c.arc(x,y,4,0,TAU);c.fill();}
   c.globalCompositeOperation='source-over';}
  else{const e=T-5;if(e<.5){c.fillStyle='rgba(255,255,255,'+(1-e/.5)+')';c.fillRect(0,0,w,h);}
   glow(c,cx,cy,Math.min(w,h)*(.12+e*.08),'255,120,90',Math.max(0,.9-e*.1));glow(c,cx,cy,Math.min(w,h)*(.06+e*.03),'140,170,255',Math.max(0,.8-e*.12));
   c.globalCompositeOperation='lighter';for(const p of s.g){const d=e*p.s*Math.min(w,h)*.12;c.fillStyle=p.gold?'rgba(255,214,90,'+Math.max(0,1-e/8)+')':'rgba(255,140,110,'+Math.max(0,.7-e/8)+')';c.fillRect(cx+Math.cos(p.a)*d,cy+Math.sin(p.a)*d*.7,p.z,p.z);}c.globalCompositeOperation='source-over';}}},

transit:{init(r){return{st:Array.from({length:220},()=>({x:r(),y:r(),a:r()*.6}))};},
 draw(c,w,h,t,s){c.fillStyle='#03040a';c.fillRect(0,0,w,h);for(const q of s.st){c.fillStyle='rgba(220,225,255,'+q.a+')';c.fillRect(q.x*w,q.y*h*.6,1,1);}
  const cx=w/2,cy=h*.32,R=Math.min(w,h)*.17,P=8,ph=(t%P)/P,px=cx+(ph*2-1)*R*2.4,pr=R*.16;
  glow(c,cx,cy,R*2.2,'255,170,90',.35);const g=c.createRadialGradient(cx,cy,0,cx,cy,R);g.addColorStop(0,'#fff3d6');g.addColorStop(.7,'#ffb04a');g.addColorStop(1,'#e46a1d');c.fillStyle=g;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
  c.fillStyle='#05060c';c.beginPath();c.arc(px,cy+R*.15,pr,0,TAU);c.fill();
  const gx=w*.1,gw=w*.8,gy=h*.68,gh=h*.18;c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=1;c.beginPath();c.moveTo(gx,gy+gh);c.lineTo(gx+gw,gy+gh);c.moveTo(gx,gy-8);c.lineTo(gx,gy+gh);c.stroke();
  c.fillStyle='rgba(255,255,255,.55)';c.font='11px "JetBrains Mono",monospace';c.fillText('STAR BRIGHTNESS',gx+6,gy-12);
  function dip(q){const x=(q*2-1)*R*2.4;const d=Math.abs(x);return d<R?1:smooth(R+pr,R-pr,d)||0;}
  c.strokeStyle='#F2C46D';c.lineWidth=2;c.beginPath();for(let i=0;i<=200;i++){const q=i/200;if(q>ph)break;const y=gy+gh*.15+dip(q)*gh*.55;i?c.lineTo(gx+q*gw,y):c.moveTo(gx+q*gw,y);}c.stroke();
  glow(c,gx+ph*gw,gy+gh*.15+dip(ph)*gh*.55,8,'242,196,109',1);}},

mars:{init(r){return{pts:Array.from({length:2600},()=>({lon:r()*360,lat:Math.asin(r()*2-1)*180/Math.PI,b:r()})),st:Array.from({length:200},()=>({x:r(),y:r(),a:r()*.6}))};},
 draw(c,w,h,t,s){const T=t%14;c.fillStyle='#030305';c.fillRect(0,0,w,h);for(const q of s.st){c.fillStyle='rgba(220,225,255,'+q.a+')';c.fillRect(q.x*w,q.y*h,1,1);}
  const cx=w/2,cy=h*.5,R=Math.min(w,h)*.36,D=Math.PI/180,tilt=.3,wet=1-smooth(4,10,T);
  glow(c,cx,cy,R*1.2,'120,170,255',.35*wet);const g=c.createRadialGradient(cx-R*.3,cy-R*.3,R*.1,cx,cy,R);g.addColorStop(0,'#d9784a');g.addColorStop(1,'#4a1a0e');c.fillStyle=g;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
  for(const p of s.pts){const la=p.lat*D,lm=(p.lon+t*10)*D;const z=Math.sin(la)*Math.sin(tilt)+Math.cos(la)*Math.cos(lm)*Math.cos(tilt);if(z<=0)continue;const x=cx+R*Math.cos(la)*Math.sin(lm),y=cy-R*(Math.sin(la)*Math.cos(tilt)-Math.cos(la)*Math.cos(lm)*Math.sin(tilt));
   const sea=p.lat>28+Math.sin(p.lon*D*3)*8;if(sea&&wet>0.02){c.fillStyle='rgba(60,120,210,'+(.85*wet*z)+')';c.fillRect(x,y,2.4,2.4);}else{c.fillStyle=p.b<.3?'rgba(70,25,15,'+(.6*z)+')':'rgba(240,150,100,'+(.35*z)+')';c.fillRect(x,y,1.6,1.6);}}
  c.fillStyle='rgba(255,255,255,.6)';c.font='12px "JetBrains Mono",monospace';c.fillText(wet>.5?'MARS · LONG AGO':'MARS · TODAY',16,24);}},

jupiter:{init(r){return{b:Array.from({length:16},(_,i)=>({y:i/16,sp:(r()-.5)*40,c:['#d9b48a','#b98a63','#efd9bb','#a46e4c','#e7c9a2'][i%5]})),sw:Array.from({length:240},()=>({a:r()*TAU,d:Math.sqrt(r()),z:.8+r()}))};},
 draw(c,w,h,t,s){c.fillStyle='#04040a';c.fillRect(0,0,w,h);const cx=w*.5,cy=h*.5,R=Math.min(w*.46,h*.44);
  c.save();c.beginPath();c.arc(cx,cy,R,0,TAU);c.clip();
  for(const b of s.b){const y0=cy-R+b.y*2*R;c.fillStyle=b.c;c.beginPath();c.moveTo(cx-R,y0);for(let x=-R;x<=R;x+=10)c.lineTo(cx+x,y0+Math.sin((x+t*b.sp)*.03)*4);c.lineTo(cx+R,y0+2*R/16+6);c.lineTo(cx-R,y0+2*R/16+6);c.fill();}
  const sx=cx+R*.25,sy=cy+R*.38,srx=R*.26,sry=R*.13;const sg=c.createRadialGradient(sx,sy,1,sx,sy,srx);sg.addColorStop(0,'#c4442b');sg.addColorStop(1,'#a8503a');c.fillStyle=sg;c.beginPath();c.ellipse(sx,sy,srx,sry,0,0,TAU);c.fill();
  for(const p of s.sw){const a=p.a+t*(1.4-p.d);c.fillStyle='rgba(255,210,180,.5)';c.fillRect(sx+Math.cos(a)*p.d*srx*.95,sy+Math.sin(a)*p.d*sry*.95,p.z,p.z);}
  const shade=c.createRadialGradient(cx-R*.35,cy-R*.35,R*.2,cx,cy,R*1.05);shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.7)');c.fillStyle=shade;c.fillRect(cx-R,cy-R,2*R,2*R);c.restore();
  const er=srx*2/1.3/2,ex=sx,ey=sy-sry-er-14;c.fillStyle='#3b6fb6';c.beginPath();c.arc(ex,ey,er,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.85)';c.font='11px "JetBrains Mono",monospace';c.fillText('EARTH, TO SCALE',ex+er+8,ey+4);}},

voyager:{init(r){return{st:Array.from({length:500},()=>({x:r(),y:r(),z:r()}))};},
 draw(c,w,h,t,s){c.fillStyle='#010106';c.fillRect(0,0,w,h);for(const q of s.st){const x=((q.x-t*.004*q.z)%1+1)%1*w;c.fillStyle='rgba(220,225,255,'+(.25+q.z*.6)+')';c.fillRect(x,q.y*h,q.z*1.6,q.z*1.6);}
  const sx=w*.12,sy=h*.7;glow(c,sx,sy,14,'255,230,170',.9);c.fillStyle='#fff';c.fillRect(sx-1,sy-1,2,2);c.fillStyle='rgba(255,255,255,.6)';c.font='11px "JetBrains Mono",monospace';c.fillText('THE SUN',sx+12,sy+16);
  const vx=w*.68,vy=h*.4+Math.sin(t*.4)*4,u=Math.min(w,h)/420;
  for(let k=0;k<4;k++){const e=((t*.5+k/4)%1);c.strokeStyle='rgba(143,178,255,'+(1-e)*.6+')';c.lineWidth=1.5;c.beginPath();c.arc(vx,vy,20*u+e*(vx-sx),Math.PI*.82,Math.PI*1.05);c.stroke();}
  c.save();c.translate(vx,vy);c.rotate(-.35);c.strokeStyle='#cfd6e6';c.fillStyle='#e8ecf5';c.lineWidth=2*u;
  c.beginPath();c.ellipse(0,0,7*u,26*u,0,0,TAU);c.fill();c.fillStyle='#9aa4b8';c.fillRect(4*u,-6*u,16*u,12*u);
  c.beginPath();c.moveTo(20*u,0);c.lineTo(80*u,-8*u);c.moveTo(14*u,4*u);c.lineTo(50*u,40*u);c.moveTo(14*u,-4*u);c.lineTo(-10*u,-60*u);c.stroke();
  c.fillStyle='#F2C46D';c.beginPath();c.arc(12*u,8*u,4*u,0,TAU);c.fill();c.restore();}},

andromeda:{init(r){function gal(n,seed){const q=rng(seed);return Array.from({length:n},()=>{const rr=Math.pow(q(),.75),arm=q()<.5?0:1;return{rr,th:arm*Math.PI+rr*5+(q()-.5)*.8};});}return{a:gal(1500,7),b:gal(1500,11)};},
 draw(c,w,h,t,s){const T=t%16;c.fillStyle='#03030a';c.fillRect(0,0,w,h);const f=smooth(0,11,T),R=Math.min(w,h)*.3,cy=h*.5;
  const ax=lerp(w*.22,w*.47,f),bx=lerp(w*.8,w*.53,f);c.globalCompositeOperation='lighter';
  function draw(arr,x,y,tilt,rot,col,sz){for(const p of arr){const a=p.th+t*.12/(.3+p.rr)+rot;const px=Math.cos(a)*p.rr*sz,py=Math.sin(a)*p.rr*sz*tilt;c.fillStyle='rgba('+col+',.6)';c.fillRect(x+px,y+py+px*.15,1.2,1.2);}glow(c,x,y,sz*.25,col,.6);}
  draw(s.a,ax,cy-R*.1*f,.45,0,'180,200,255',R*.8);draw(s.b,bx,cy+R*.1*f,.3,1,'255,215,170',R*1.05);
  if(T>11)glow(c,w/2,cy,R*(.4+(T-11)*.12),'255,235,210',smooth(11,15,T)*.6);
  c.globalCompositeOperation='source-over';c.fillStyle='rgba(255,255,255,.6)';c.font='11px "JetBrains Mono",monospace';c.fillText('MILKY WAY',Math.max(8,ax-R*.4),cy-R*.55);c.fillText('ANDROMEDA',Math.min(w-90,bx-R*.3),cy+R*.62);}},

fade:{init(r){return{p:Array.from({length:700},()=>({x:r(),y:r(),d:r()*13,red:r()<.25,z:.6+r()*1.6}))};},
 draw(c,w,h,t,s){const T=t%17;c.fillStyle='#000';c.fillRect(0,0,w,h);c.globalCompositeOperation='lighter';
  for(const p of s.p){const life=p.red?p.d+3.5:p.d;const a=1-smooth(life,life+1.2,T);if(a<=0)continue;const col=p.red?'255,110,80':'215,225,255';if(p.z>1.8)glow(c,p.x*w,p.y*h,7,col,.6*a);c.fillStyle='rgba('+col+','+a+')';c.fillRect(p.x*w,p.y*h,p.z,p.z);}
  c.globalCompositeOperation='source-over';}},

giant:{init(){return{};},
 draw(c,w,h,t,s){c.fillStyle='#0b0204';c.fillRect(0,0,w,h);const cx=w*.4,cy=h*.5,R=Math.min(w*.42,h*.48)*(1+.035*Math.sin(t*.8));
  glow(c,cx,cy,R*1.8,'255,70,30',.35);c.beginPath();for(let i=0;i<=160;i++){const a=i/160*TAU,rr=R*(1+.025*Math.sin(a*7+t*1.3)+.018*Math.sin(a*13-t*2.1)+.01*Math.sin(a*29+t*3));const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();
  const g=c.createRadialGradient(cx-R*.2,cy-R*.2,R*.05,cx,cy,R);g.addColorStop(0,'#ffcf7a');g.addColorStop(.45,'#f2662a');g.addColorStop(1,'#7a1009');c.fillStyle=g;c.fill();
  const ex=cx+R*1.22+Math.sin(t*.3)*6,ey=cy+Math.cos(t*.3)*8;glow(c,ex,ey,14,'255,150,90',.6);c.fillStyle='#3b5f8a';c.beginPath();c.arc(ex,ey,4,0,TAU);c.fill();}}
};

return{scenes,h:{rng,glow,lerp,clamp,smooth,bg}};})();

