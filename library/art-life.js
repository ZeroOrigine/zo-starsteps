/* Star Steps Library living pictures, part 2: life, the body, Earth and weather. */
(function(){
const A=window.LART,S=A.scenes,{rng,lerp,clamp,smooth,ease,grad,sky,ground,glow,circ,ball,rrect,sun,cloud,star,arrow,label,person,tree,stars,mkstars,wave,TAU}=A.h;

/* ---- life ---- */
S.cell={init(r){return{o:Array.from({length:9},(_,i)=>({a:r()*TAU,d:.35+r()*.45,s:.05+r()*.05,k:i%3,sp:(r()-.5)*.4}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#eaf7f0','#d4ecdf');const cx=w*.5,cy=h*.5,R=h*.42;const wob=i=>1+.02*Math.sin(t*1.3+i);
  c.fillStyle='rgba(255,220,160,.85)';c.strokeStyle='#c98a2e';c.lineWidth=4;c.beginPath();for(let i=0;i<=60;i++){const a=i/60*TAU,rr=R*(1+.04*Math.sin(a*5+t));i?c.lineTo(cx+Math.cos(a)*rr*1.5,cy+Math.sin(a)*rr):c.moveTo(cx+Math.cos(a)*rr*1.5,cy+Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();
  for(const o of s.o){const a=o.a+t*o.sp,x=cx+Math.cos(a)*o.d*R*1.4,y=cy+Math.sin(a)*o.d*R*.9;if(o.k===0){c.fillStyle='#e07a4a';c.beginPath();c.ellipse(x,y,R*o.s*1.6,R*o.s,a,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1.5;for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(x-R*o.s*1.2,y+k*R*o.s*.5);c.lineTo(x+R*o.s*1.2,y+k*R*o.s*.5);c.stroke();}}else if(o.k===1)ball(c,x,y,R*o.s*.7,'#3f9d55');else{c.strokeStyle='#9b4dff';c.lineWidth=2;c.beginPath();c.moveTo(x-R*.08,y);c.quadraticCurveTo(x,y-R*.1,x+R*.08,y);c.stroke();}}
  ball(c,cx,cy,R*.28,'#5b4ee0',.4);circ(c,cx+R*.06,cy-R*.04,R*.07,'#2d2578');
  label(c,'nucleus: the control centre',cx,cy+R*.42,{size:11});label(c,'mitochondria: tiny power plants',w*.2,h*.12,{size:11,col:'#ffd0b8'});label(c,'one cell, alive and busy',w*.5,h*.94);}};

S.dna={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#0f1a2a','#070d18');const cx=w*.5,n=34,L=w*.86,x0=cx-L/2;const cols=['#ff6b6b','#4ecdc4','#ffe66d','#6b8cff'];
  for(let i=0;i<=n;i++){const u=i/n,x=x0+u*L,ph=u*TAU*2.2+t*1.4;const y1=h*.5+Math.sin(ph)*h*.3,y2=h*.5+Math.sin(ph+Math.PI)*h*.3,z=Math.cos(ph);
   const k=i%4;if(i<n){c.strokeStyle=cols[k];c.lineWidth=4;c.globalAlpha=.55+.45*z;c.beginPath();c.moveTo(x,y1);c.lineTo(x,(y1+y2)/2);c.stroke();c.strokeStyle=cols[(k+2)%4];c.beginPath();c.moveTo(x,(y1+y2)/2);c.lineTo(x,y2);c.stroke();c.globalAlpha=1;}}
  for(const sg of[0,Math.PI]){c.lineWidth=6;c.beginPath();for(let i=0;i<=n*4;i++){const u=i/(n*4),x=x0+u*L,ph=u*TAU*2.2+t*1.4+sg,y=h*.5+Math.sin(ph)*h*.3;i?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=sg?'#cfe0ff':'#9fbaff';c.stroke();}
  label(c,'DNA: a twisted ladder of instructions',cx,h*.08);label(c,'A pairs with T, C pairs with G',cx,h*.93,{size:11});}};

S.heart={init(r){return{p:Array.from({length:60},()=>({u:r(),k:r()<.5}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#fff0f0','#ffe0e0');const cx=w*.5,cy=h*.5;const beat=Math.pow(Math.max(0,Math.sin(t*2.2)),6)*.08+Math.pow(Math.max(0,Math.sin(t*2.2+.6)),12)*.05;const R=h*.3*(1+beat);
  glow(c,cx,cy,R*2,'255,120,120',.2+beat*2);
  c.save();c.translate(cx,cy+R*.1);c.scale(R/60,R/60);c.fillStyle='#d9463a';c.beginPath();c.moveTo(0,40);c.bezierCurveTo(-70,-10,-50,-60,0,-30);c.bezierCurveTo(50,-60,70,-10,0,40);c.fill();c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse(-22,-25,12,18,.5,0,TAU);c.fill();c.restore();
  // vessels: blue in, red out
  for(const p of s.p){const u=(p.u+t*.25)%1;if(p.k){const x=w*.1+u*(cx-R*.9-w*.1),y=cy-R*.2+Math.sin(u*9)*6;circ(c,x,y,3.5,'#3b7dd8');}else{const x=cx+R*.9+u*(w*.9-cx-R*.9),y=cy-R*.6-Math.sin(u*9)*6;circ(c,x,y,3.5,'#ff5a4a');}}
  c.strokeStyle='rgba(59,125,216,.3)';c.lineWidth=14;c.beginPath();c.moveTo(w*.1,cy-R*.2);c.lineTo(cx-R*.8,cy-R*.2);c.stroke();c.strokeStyle='rgba(255,90,74,.3)';c.beginPath();c.moveTo(cx+R*.8,cy-R*.6);c.lineTo(w*.9,cy-R*.6);c.stroke();
  label(c,'blood low on oxygen comes in',w*.2,h*.12,{col:'#bcd8ff'});label(c,'fresh blood pumped out',w*.8,h*.12,{col:'#ffc1b8'});label(c,'about 100,000 beats every day',cx,h*.93);}};

S.lungs={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#eef6ff','#dbe9fb');const cx=w*.5,cy=h*.55,br=.5+.5*Math.sin(t*1.3),sz=h*.28*(1+br*.12);
  c.fillStyle='#e6a0a0';c.strokeStyle='#c97070';c.lineWidth=3;for(const sg of[-1,1]){c.beginPath();c.moveTo(cx+sg*h*.05,cy-sz*.8);c.bezierCurveTo(cx+sg*sz*1.3,cy-sz*.9,cx+sg*sz*1.25,cy+sz*.9,cx+sg*h*.08,cy+sz*.75);c.bezierCurveTo(cx+sg*h*.04,cy+sz*.3,cx+sg*h*.04,cy-sz*.3,cx+sg*h*.05,cy-sz*.8);c.fill();c.stroke();}
  c.strokeStyle='#f1d7a8';c.lineWidth=12;c.beginPath();c.moveTo(cx,cy-sz*1.5);c.lineTo(cx,cy-sz*.6);c.stroke();c.lineWidth=7;for(const sg of[-1,1]){c.beginPath();c.moveTo(cx,cy-sz*.6);c.quadraticCurveTo(cx+sg*sz*.2,cy-sz*.4,cx+sg*sz*.55,cy-sz*.1);c.stroke();c.lineWidth=4;for(let k=0;k<3;k++){c.beginPath();c.moveTo(cx+sg*sz*(.3+k*.12),cy-sz*(.3-k*.1));c.lineTo(cx+sg*sz*(.5+k*.15),cy+sz*(.05+k*.2));c.stroke();}c.lineWidth=7;}
  const dir=Math.cos(t*1.3);for(let k=0;k<3;k++){const u=((t*.5+k/3)%1);const y=dir>0?cy-sz*1.7+u*sz*.8:cy-sz*.9-u*sz*.8;c.fillStyle=dir>0?'rgba(120,200,255,'+(1-u)+')':'rgba(180,180,200,'+(1-u)+')';circ(c,cx+Math.sin(u*9)*6,y,4,c.fillStyle);}
  label(c,dir>0?'breathe in: oxygen comes down':'breathe out: carbon dioxide goes up',cx,h*.08);label(c,'tiny air sacs pass oxygen into your blood',cx,h*.94,{size:11});}};

S.seed={init(r){return{};},
 draw(c,w,h,t,s,v){const T=(t%9)/9;sky(c,w,h,'#bfe3ff','#eaf6ff');sun(c,w*.85,h*.15,h*.07,t);const gy=h*.7;c.fillStyle='#5a3b22';c.fillRect(0,gy,w,h-gy);c.fillStyle='#7cc36b';c.fillRect(0,gy-6,w,8);
  const cx=w*.4;ball(c,cx,gy+h*.15,h*.035,'#a97440');
  const g=smooth(.1,.5,T);c.strokeStyle='#e8d8b0';c.lineWidth=3;c.beginPath();c.moveTo(cx,gy+h*.15);c.quadraticCurveTo(cx-10,gy+h*.2,cx-g*20,gy+h*.15+g*h*.12);c.moveTo(cx,gy+h*.15);c.quadraticCurveTo(cx+10,gy+h*.2,cx+g*25,gy+h*.15+g*h*.1);c.stroke();
  const st=smooth(.25,.9,T);const top=gy-st*h*.5;c.strokeStyle='#3f9d55';c.lineWidth=5;c.beginPath();c.moveTo(cx,gy+h*.12);c.quadraticCurveTo(cx+8*Math.sin(t),(gy+top)/2,cx,top);c.stroke();
  const lf=(y,sg,sz)=>{c.fillStyle='#4fb866';c.beginPath();c.moveTo(cx,y);c.quadraticCurveTo(cx+sg*sz,y-sz*.5,cx+sg*sz*1.4,y-sz*.1);c.quadraticCurveTo(cx+sg*sz,y+sz*.3,cx,y);c.fill();};
  if(st>.3)lf(gy-h*.14,-1,h*.14*smooth(.3,.6,st));if(st>.5)lf(gy-h*.28,1,h*.16*smooth(.5,.8,st));if(st>.85){const fl=smooth(.85,1,st);for(let i=0;i<6;i++){const a=i/6*TAU;circ(c,cx+Math.cos(a)*h*.06*fl,top+Math.sin(a)*h*.06*fl,h*.035*fl,'#ffb3c6');}circ(c,cx,top,h*.03*fl,'#ffd35a');}
  if(T>.2){for(let k=0;k<3;k++){const u=((t*.4+k/3)%1);circ(c,w*.15+k*20+Math.sin(u*6)*5,gy+h*.08+u*h*.15,3,'rgba(120,200,255,'+(1-u)+')');}label(c,'water',w*.15,gy+h*.03,{size:11});}
  label(c,T<.3?'a seed waits in the dark soil':T<.6?'roots down, shoot up':T<.85?'leaves catch the sunlight':'a flower! ready to make new seeds',w*.5,h*.1);}};

S.foodchain={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#bfe3ff','#eaf6ff');sun(c,w*.1,h*.2,h*.09,t);ground(c,w,h,h*.72,'#86c76f','#4f9a46');const y=h*.62;
  const items=[[w*.3,'grass'],[w*.55,'rabbit'],[w*.8,'fox']];
  c.strokeStyle='#2e7d32';c.lineWidth=3;for(let k=0;k<7;k++){c.beginPath();c.moveTo(w*.3-24+k*8,h*.72);c.lineTo(w*.3-24+k*8+Math.sin(t*2+k)*4,h*.72-26-(k%2)*10);c.stroke();}
  const rx=w*.55,ry=h*.7+Math.abs(Math.sin(t*4))*-8;c.fillStyle='#bfa893';c.beginPath();c.ellipse(rx,ry-14,22,14,0,0,TAU);c.fill();circ(c,rx+18,ry-24,10,'#bfa893');c.fillStyle='#bfa893';c.beginPath();c.ellipse(rx+16,ry-40,4,12,-.2,0,TAU);c.ellipse(rx+24,ry-40,4,12,.2,0,TAU);c.fill();circ(c,rx+22,ry-26,2,'#222');
  const fx=w*.8,fy=h*.7;c.fillStyle='#e07a2a';c.beginPath();c.ellipse(fx,fy-18,30,16,0,0,TAU);c.fill();circ(c,fx+26,fy-30,11,'#e07a2a');c.beginPath();c.moveTo(fx+20,fy-38);c.lineTo(fx+24,fy-50);c.lineTo(fx+30,fy-38);c.fill();c.beginPath();c.moveTo(fx-26,fy-20);c.quadraticCurveTo(fx-55,fy-40+Math.sin(t*3)*6,fx-60,fy-10);c.lineWidth=10;c.strokeStyle='#e07a2a';c.stroke();circ(c,fx-58,fy-10,6,'#fff');circ(c,fx+30,fy-32,2,'#222');
  const f=(t*.4)%1;arrow(c,w*.16,h*.3,w*.27,h*.6,'rgba(255,180,60,.9)',3);arrow(c,w*.36,h*.6,w*.47,h*.6,'rgba(40,40,60,.8)',3);arrow(c,w*.62,h*.6,w*.72,h*.6,'rgba(40,40,60,.8)',3);
  items.forEach(([x,n])=>label(c,n,x,h*.86,{size:12}));label(c,'sunlight',w*.22,h*.42,{size:11,col:'#ffe08a'});label(c,'energy passes along a food chain',w*.5,h*.1);}};

S.butterfly={init(r){return{};},
 draw(c,w,h,t,s,v){const T=(t%12)/12;sky(c,w,h,'#dff3ff','#f6fbff');ground(c,w,h,h*.8,'#86c76f','#4f9a46');const bx=w*.5,by=h*.55;
  c.strokeStyle='#5a8a3a';c.lineWidth=8;c.beginPath();c.moveTo(w*.2,h*.8);c.quadraticCurveTo(w*.35,h*.3,w*.75,h*.25);c.stroke();
  const lf=(x,y,sz,a)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#4fb866';c.beginPath();c.ellipse(0,0,sz,sz*.45,0,0,TAU);c.fill();c.restore();};lf(w*.3,h*.5,h*.14,-.4);lf(w*.52,h*.33,h*.13,-.2);lf(w*.68,h*.28,h*.12,.1);
  const st=T<.2?0:T<.5?1:T<.75?2:3;
  if(st===0){for(let i=0;i<5;i++)circ(c,w*.3-10+i*5,h*.5-4,3.5,'#fff7d6');label(c,'1. tiny eggs on a leaf',bx,h*.1);}
  else if(st===1){const u=(T-.2)/.3,x=w*.3+u*w*.2,y=h*.5-u*h*.16;for(let i=0;i<7;i++)circ(c,x-i*9+Math.sin(t*8+i)*1.5,y-6+Math.sin(t*8+i*.8)*2,6+(i===0?2:0),i%2?'#ffd35a':'#3f9d55');circ(c,x+4,y-8,1.5,'#222');label(c,'2. a hungry caterpillar eats and grows',bx,h*.1);}
  else if(st===2){c.fillStyle='#8a7a5a';c.beginPath();c.ellipse(w*.52,h*.42,9,20,0,0,TAU);c.fill();c.strokeStyle='#5a4a3a';c.lineWidth=2;c.beginPath();c.moveTo(w*.52,h*.33);c.lineTo(w*.52,h*.42-20);c.stroke();label(c,'3. inside the chrysalis, it rebuilds itself',bx,h*.1);}
  else{const fl=Math.abs(Math.sin(t*9));const x=w*.6+Math.sin(t)*30,y=h*.4+Math.cos(t*1.3)*20;c.fillStyle='#ff8c42';for(const sg of[-1,1]){c.save();c.translate(x,y);c.scale(sg*(.4+.6*fl),1);c.beginPath();c.ellipse(22,-10,22,16,.3,0,TAU);c.fill();c.beginPath();c.ellipse(16,12,16,12,-.3,0,TAU);c.fill();c.fillStyle='#222';circ(c,22,-10,5,'#222');c.fillStyle='#ff8c42';c.restore();}c.fillStyle='#222';c.beginPath();c.ellipse(x,y,3,14,0,0,TAU);c.fill();label(c,'4. a butterfly! it will lay new eggs',bx,h*.1);}
  label(c,'the life cycle of a butterfly',bx,h*.94,{size:11});}};

S.neuron={init(r){return{n:Array.from({length:7},(_,i)=>({x:.12+i*.13,y:.3+((i%3)-1)*.2,b:Array.from({length:4},()=>({a:r()*TAU,l:.4+r()*.6}))}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#1a1030','#0c0818');const R=h*.07;
  s.n.forEach((n,i)=>{const x=n.x*w,y=n.y*h+h*.2;if(i<s.n.length-1){const m=s.n[i+1],x2=m.x*w,y2=m.y*h+h*.2;c.strokeStyle='rgba(180,140,255,.6)';c.lineWidth=4;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
    const u=((t*.9-i*.25)%1+1)%1;if(u>0&&u<1){glow(c,lerp(x,x2,u),lerp(y,y2,u),14,'255,230,120',.9);circ(c,lerp(x,x2,u),lerp(y,y2,u),4,'#fff');}}
   for(const b of n.b){c.strokeStyle='rgba(180,140,255,.5)';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(b.a)*R*2.6*b.l,y+Math.sin(b.a)*R*2.6*b.l);c.stroke();}
   const fire=Math.pow(Math.max(0,Math.sin((t*.9-i*.25)*TAU)),10);glow(c,x,y,R*2,'200,160,255',.3+.5*fire);ball(c,x,y,R,'#9b4dff');});
  label(c,'a message jumps from neuron to neuron',w*.5,h*.08);label(c,'your brain has about 86 billion of these',w*.5,h*.94,{size:11});}};

S.reef={init(r){return{f:Array.from({length:16},()=>({x:r(),y:.25+r()*.5,s:.6+r(),hue:(r()*360)|0,sp:(.03+r()*.05)*(r()<.5?1:-1),ph:r()*TAU})),bub:Array.from({length:30},()=>({x:r(),u:r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#1f8fd8','#083a6e');for(let k=0;k<5;k++){c.fillStyle='rgba(255,255,255,.05)';c.beginPath();c.moveTo(w*(.1+k*.2)+Math.sin(t+k)*10,0);c.lineTo(w*(.14+k*.2),0);c.lineTo(w*(.3+k*.2),h);c.lineTo(w*(.2+k*.2),h);c.fill();}
  // coral
  const cor=(x,y,col,n)=>{c.strokeStyle=col;c.lineWidth=7;c.lineCap='round';for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*.35+Math.sin(t*1.5+i)*.05;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*h*.1,y+Math.sin(a)*h*.1,x+Math.cos(a)*h*.22,y+Math.sin(a)*h*.22);c.stroke();}c.lineCap='butt';};
  c.fillStyle='#d9b77a';c.fillRect(0,h*.85,w,h*.15);cor(w*.15,h*.88,'#ff6b8a',5);cor(w*.45,h*.9,'#ffb347',4);cor(w*.8,h*.88,'#c77dff',6);
  for(let k=0;k<6;k++){c.strokeStyle='#2e9d5f';c.lineWidth=4;c.beginPath();c.moveTo(w*.6+k*12,h*.86);c.quadraticCurveTo(w*.6+k*12+Math.sin(t*2+k)*14,h*.7,w*.6+k*12+Math.sin(t*2+k+1)*10,h*.56);c.stroke();}
  for(const f of s.f){const x=((f.x+t*f.sp)%1.2+1.2)%1.2*w-w*.1,y=f.y*h+Math.sin(t*2+f.ph)*8,sz=h*.035*f.s,d=f.sp>0?1:-1;c.fillStyle='hsl('+f.hue+',80%,60%)';c.beginPath();c.ellipse(x,y,sz*1.6,sz,0,0,TAU);c.fill();c.beginPath();c.moveTo(x-d*sz*1.4,y);c.lineTo(x-d*sz*2.4,y-sz*.9+Math.sin(t*10+f.ph)*3);c.lineTo(x-d*sz*2.4,y+sz*.9);c.fill();circ(c,x+d*sz*.8,y-sz*.2,sz*.18,'#fff');circ(c,x+d*sz*.85,y-sz*.2,sz*.09,'#111');}
  for(const b of s.bub){const u=(b.u+t*.12)%1;circ(c,b.x*w+Math.sin(u*9)*5,h-u*h,2+u*3,'rgba(255,255,255,'+(.5*(1-u))+')');}
  label(c,'a coral reef: a city built by tiny animals',w*.5,h*.08);}};

S.deepsea={init(r){return{p:Array.from({length:80},()=>({x:r(),y:r(),s:r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#03142a','#000308');for(const p of s.p){c.fillStyle='rgba(120,180,255,'+(.1+.15*Math.sin(t+p.s*9))+')';c.fillRect(p.x*w,((p.y+t*.01)%1)*h,1.5,1.5);}
  const fx=w*.5+Math.sin(t*.4)*20,fy=h*.55+Math.cos(t*.6)*10;const lx=fx+h*.22,ly=fy-h*.26;glow(c,lx,ly,h*.22,'170,255,230',.5+.2*Math.sin(t*4));circ(c,lx,ly,6,'#d8fff0');
  c.strokeStyle='#2a3a4a';c.lineWidth=4;c.beginPath();c.moveTo(fx+h*.05,fy-h*.12);c.quadraticCurveTo(fx+h*.1,fy-h*.35,lx,ly);c.stroke();
  c.fillStyle='#223344';c.beginPath();c.ellipse(fx,fy,h*.26,h*.16,0,0,TAU);c.fill();c.beginPath();c.moveTo(fx-h*.24,fy);c.lineTo(fx-h*.4,fy-h*.12+Math.sin(t*3)*8);c.lineTo(fx-h*.4,fy+h*.12);c.fill();
  c.fillStyle='#0a0f16';c.beginPath();c.moveTo(fx+h*.26,fy-h*.02);c.quadraticCurveTo(fx+h*.1,fy+h*.1,fx+h*.2,fy+h*.14);c.quadraticCurveTo(fx+h*.26,fy+h*.08,fx+h*.26,fy-h*.02);c.fill();c.strokeStyle='#e8f4ff';c.lineWidth=2;for(let k=0;k<6;k++){c.beginPath();c.moveTo(fx+h*.12+k*h*.025,fy+h*.02+k*h*.012);c.lineTo(fx+h*.13+k*h*.025,fy+h*.07+k*h*.01);c.stroke();}
  circ(c,fx+h*.1,fy-h*.07,h*.035,'#e8f4ff');circ(c,fx+h*.11,fy-h*.07,h*.015,'#111');
  label(c,'4,000 metres down: no sunlight at all',w*.5,h*.08);label(c,'the anglerfish makes its own light to hunt',w*.5,h*.93,{size:11});}};

S.seasons={init(r){return{lv:Array.from({length:40},()=>({a:r()*TAU,d:r(),f:r()})),fl:Array.from({length:50},()=>({x:r(),y:r(),s:.5+r()}))};},
 draw(c,w,h,t,s,v){const T=(t%16)/16,q=Math.floor(T*4),f=T*4-q;const skyc=[['#8fd0ff','#e8f5ff'],['#5fb8ff','#dff1ff'],['#f3a65b','#ffd9a8'],['#c9d6e8','#eef3fa']][q];sky(c,w,h,skyc[0],skyc[1]);
  const gcol=['#7cc36b','#4fa84a','#c9a24a','#eef3fa'][q];ground(c,w,h,h*.78,gcol,q===3?'#d9e2ee':'#4f7a3a');if(q!==3)sun(c,w*.85,h*.18,h*.08,t);
  const cx=w*.4,gy=h*.78;c.fillStyle='#6b4a2b';c.fillRect(cx-h*.04,gy-h*.45,h*.08,h*.45);c.strokeStyle='#6b4a2b';c.lineWidth=7;for(const a of[-.9,-.3,.3,.9]){c.beginPath();c.moveTo(cx,gy-h*.42);c.lineTo(cx+Math.sin(a)*h*.22,gy-h*.42-Math.cos(a)*h*.22);c.stroke();}
  const lc=['#ffb3c6','#3f9d55','#e07a2a',null][q];if(lc){for(const l of s.lv){const a=l.a,d=.35+l.d*.65;const x=cx+Math.cos(a)*h*.3*d,y=gy-h*.5+Math.sin(a)*h*.22*d;const fall=q===2?smooth(.5,1,f+l.f*.5):0;if(fall>0&&l.f<.7){circ(c,x+fall*40,y+fall*(gy-y)+Math.sin(t*5+l.a)*4,h*.025,lc);}else circ(c,x,y,h*.045,q===0&&l.f<.5?'#4fb866':lc);}}
  if(q===3)for(const p of s.fl){const y=((p.y+t*.05*p.s)%1);circ(c,p.x*w+Math.sin(t+p.y*9)*8,y*h,2.5,'rgba(255,255,255,.9)');}
  label(c,['spring: blossom and new leaves','summer: full green, long days','autumn: leaves turn and fall','winter: bare branches, snow'][q],w*.5,h*.1);}};

S.bee={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#bfe3ff','#eaf6ff');ground(c,w,h,h*.8,'#86c76f','#4f9a46');const fl=[[w*.2,'#ff6b8a'],[w*.5,'#ffd35a'],[w*.8,'#c77dff']];
  fl.forEach(([x,col])=>{c.strokeStyle='#3f9d55';c.lineWidth=5;c.beginPath();c.moveTo(x,h*.8);c.lineTo(x,h*.5);c.stroke();for(let i=0;i<6;i++){const a=i/6*TAU;circ(c,x+Math.cos(a)*h*.08,h*.5+Math.sin(a)*h*.08,h*.05,col);}circ(c,x,h*.5,h*.045,'#ffb347');});
  const T=(t%6)/6,k=Math.floor(T*3),u=T*3-k;const x=lerp(fl[k][0],fl[(k+1)%3][0],ease(u)),y=h*.5-h*.06-Math.sin(u*Math.PI)*h*.25;
  const bw=Math.abs(Math.sin(t*40));c.fillStyle='rgba(200,230,255,.8)';c.beginPath();c.ellipse(x-4,y-14,10,8*bw+1,-.4,0,TAU);c.ellipse(x+6,y-14,10,8*bw+1,.4,0,TAU);c.fill();c.fillStyle='#ffd35a';c.beginPath();c.ellipse(x,y,16,11,0,0,TAU);c.fill();c.fillStyle='#222';for(let i=-1;i<=1;i++)c.fillRect(x+i*8-2,y-10,4,20);circ(c,x+14,y-2,6,'#222');
  for(let i=0;i<5;i++){const a=t*4+i;circ(c,x-20-i*6+Math.sin(a)*3,y+8+i*3,2,'rgba(255,200,60,.8)');}
  label(c,'pollen rides from flower to flower on the bee',w*.5,h*.1);label(c,'without bees, many fruits could not grow',w*.5,h*.94,{size:11});}};

S.germs={init(r){return{g:Array.from({length:12},()=>({x:r(),y:r(),dx:(r()-.5)*.12,dy:(r()-.5)*.12,k:(r()*3)|0,ph:r()*TAU}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#ffe9e9','#ffd6d6');for(const g of s.g){const x=((g.x+g.dx*t)%1+1)%1*w,y=((g.y+g.dy*t)%1+1)%1*h,R=h*.05;c.fillStyle=['#8fd14f','#c77dff','#ffb347'][g.k];
   if(g.k===0){c.beginPath();c.ellipse(x,y,R*1.4,R*.7,g.ph+t*.5,0,TAU);c.fill();}else if(g.k===1){circ(c,x,y,R,c.fillStyle);for(let i=0;i<8;i++){const a=i/8*TAU+t;circ(c,x+Math.cos(a)*R*1.2,y+Math.sin(a)*R*1.2,R*.22,c.fillStyle);}}else{c.strokeStyle=c.fillStyle;c.lineWidth=5;c.beginPath();for(let i=0;i<=20;i++){const u=i/20;const px=x-R*1.5+u*R*3,py=y+Math.sin(u*TAU*2+t*4)*R*.5;i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}}
  const wx=w*.5+Math.sin(t*.7)*w*.3,wy=h*.5+Math.cos(t*.9)*h*.25;glow(c,wx,wy,h*.2,'255,255,255',.5);c.fillStyle='rgba(255,255,255,.95)';c.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,rr=h*.12*(1+.12*Math.sin(a*6+t*3));i?c.lineTo(wx+Math.cos(a)*rr,wy+Math.sin(a)*rr):c.moveTo(wx+Math.cos(a)*rr,wy+Math.sin(a)*rr);}c.fill();circ(c,wx,wy,h*.045,'#9fbaff');
  label(c,'germs: tiny living things, some make you ill',w*.5,h*.08);label(c,'a white blood cell hunts them down',w*.5,h*.93,{size:11});}};

S.bones={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#eef2f7','#dde4ee');const cx=w*.5,gy=h*.9,sz=h*.8;const bone=(x1,y1,x2,y2,wd)=>{c.strokeStyle='#f6f2e8';c.lineWidth=wd;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.strokeStyle='#cfc6b4';c.lineWidth=1.5;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.lineCap='butt';};
  const wob=Math.sin(t*1.5)*.05;circ(c,cx,gy-sz*.9,sz*.1,'#f6f2e8');c.fillStyle='#cfc6b4';c.fillRect(cx-sz*.04,gy-sz*.84,sz*.08,sz*.04);circ(c,cx-sz*.035,gy-sz*.91,sz*.02,'#8a8f98');circ(c,cx+sz*.035,gy-sz*.91,sz*.02,'#8a8f98');
  bone(cx,gy-sz*.8,cx,gy-sz*.45,sz*.05);for(let k=0;k<5;k++){const y=gy-sz*.74+k*sz*.055;c.strokeStyle='#f6f2e8';c.lineWidth=sz*.025;c.beginPath();c.ellipse(cx,y,sz*.13-k*sz*.008,sz*.03,0,0,Math.PI);c.stroke();}
  bone(cx,gy-sz*.76,cx-sz*.18,gy-sz*.76,sz*.035);bone(cx,gy-sz*.76,cx+sz*.18,gy-sz*.76,sz*.035);
  for(const sg of[-1,1]){const ex=cx+sg*sz*.26,ey=gy-sz*.56+sg*wob*sz;bone(cx+sg*sz*.18,gy-sz*.76,ex,ey,sz*.035);bone(ex,ey,cx+sg*sz*(.22),gy-sz*.36,sz*.03);
   bone(cx+sg*sz*.07,gy-sz*.45,cx+sg*sz*.1,gy-sz*.22,sz*.04);bone(cx+sg*sz*.1,gy-sz*.22,cx+sg*sz*.11,gy-sz*.02,sz*.035);}
  c.fillStyle='#f6f2e8';c.beginPath();c.ellipse(cx,gy-sz*.46,sz*.12,sz*.05,0,0,TAU);c.fill();
  label(c,'206 bones hold you up and protect you',w*.5,h*.08);label(c,'the skull guards the brain, the ribs guard the heart',w*.5,h*.95,{size:11});}};

/* ---- Earth and weather ---- */
S.volcano={init(r){return{p:Array.from({length:120},()=>({u:r(),vx:(r()-.5)*2,s:.5+r()})),rk:Array.from({length:30},()=>({u:r(),vx:(r()-.5)*3,s:r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#2a1a2e','#120a14');glow(c,w*.5,h*.3,h*.5,'255,120,40',.35);const cx=w*.5,gy=h*.85;
  c.fillStyle='#4a3a3a';c.beginPath();c.moveTo(w*.1,gy);c.lineTo(cx-w*.08,h*.3);c.lineTo(cx+w*.08,h*.3);c.lineTo(w*.9,gy);c.closePath();c.fill();
  // cross-section: magma chamber + pipe
  c.fillStyle='#ff7a2a';c.beginPath();c.ellipse(cx,gy+h*.05,w*.12,h*.1,0,0,TAU);c.fill();c.fillStyle='#ff9a3a';c.fillRect(cx-h*.03,h*.3,h*.06,gy-h*.3);glow(c,cx,gy+h*.03,h*.14,'255,180,80',.6);
  for(const p of s.p){const u=(p.u+t*.35*p.s)%1;const x=cx+p.vx*u*w*.15,y=h*.3-u*h*.28+u*u*h*.2;c.fillStyle='rgba(255,'+Math.round(220-u*160)+',40,'+(1-u)+')';circ(c,x,y,3+(1-u)*4,c.fillStyle);}
  for(const q of s.rk){const u=(q.u+t*.25)%1;const x=cx+q.vx*u*w*.12,y=h*.3-Math.sin(u*Math.PI)*h*.25+u*h*.5;if(y<gy)circ(c,x,y,3,'#2a1a1a');}
  // lava flows
  c.strokeStyle='#ff6a1a';c.lineWidth=6;for(const sg of[-1,1]){c.beginPath();c.moveTo(cx+sg*w*.06,h*.32);c.quadraticCurveTo(cx+sg*w*.2,h*.55,cx+sg*w*(.28+.05*Math.sin(t)),gy);c.stroke();}
  for(let k=0;k<4;k++){c.fillStyle='rgba(120,110,110,'+(.35-k*.07)+')';circ(c,cx+(k-1.5)*40+Math.sin(t+k)*10,h*.12-k*8,h*.08+k*6,c.fillStyle);}
  ground(c,w,h,gy,'#2a2a2a','#111');label(c,'melted rock (magma) pushes up and bursts out as lava',w*.5,h*.95,{size:11});label(c,'ash cloud',cx+w*.22,h*.12,{size:11});label(c,'magma chamber',cx,gy+h*.05,{size:11,box:false,col:'#fff',bold:1});}};

S.watercycle={init(r){return{dr:Array.from({length:60},()=>({x:r(),u:r()})),ev:Array.from({length:30},()=>({x:r(),u:r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#7fc4ff','#dff1ff');sun(c,w*.12,h*.15,h*.09,t);
  c.fillStyle='#4f8a3a';c.beginPath();c.moveTo(w*.5,h*.9);c.lineTo(w*.72,h*.3);c.lineTo(w*.86,h*.45);c.lineTo(w,h*.35);c.lineTo(w,h*.9);c.closePath();c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(w*.68,h*.4);c.lineTo(w*.72,h*.3);c.lineTo(w*.76,h*.38);c.closePath();c.fill();
  c.fillStyle=grad(c,0,h*.7,0,h,['#3b9ad8','#1f5fa8']);c.fillRect(0,h*.7,w*.55,h*.3);c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.beginPath();for(let x=0;x<=w*.55;x+=4){const y=h*.7+Math.sin(x*.04+t*2)*3;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  c.strokeStyle='#3b9ad8';c.lineWidth=8;c.beginPath();c.moveTo(w*.74,h*.42);c.quadraticCurveTo(w*.66,h*.6,w*.55,h*.72);c.stroke();
  for(const e of s.ev){const u=(e.u+t*.15)%1;c.fillStyle='rgba(255,255,255,'+(.6*(1-u))+')';circ(c,w*.1+e.x*w*.35+Math.sin(u*6)*8,h*.68-u*h*.4,3+u*4,c.fillStyle);}
  cloud(c,w*.35,h*.22,w*.11);cloud(c,w*.62,h*.18,w*.09,'#dde6f0');
  for(const d of s.dr){const u=(d.u+t*.5)%1;const x=w*.52+d.x*w*.2,y=h*.26+u*h*.1;c.strokeStyle='rgba(60,120,220,.8)';c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x-1,y+8);c.stroke();}
  arrow(c,w*.34,h*.3,w*.55,h*.2,'rgba(60,60,90,.6)',2);label(c,'evaporation',w*.2,h*.5,{size:11});label(c,'condensation',w*.35,h*.08,{size:11});label(c,'rain',w*.62,h*.3,{size:11});label(c,'rivers run back to the sea',w*.78,h*.6,{size:11});label(c,'the same water, round and round',w*.5,h*.95,{size:11});}};

S.layers={init(r){return{st:mkstars(r,80)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#05071a','#0a0c22');stars(c,w,h,s.st,t);const cx=w*.5,cy=h*.52,R=h*.44;
  c.save();c.beginPath();c.arc(cx,cy,R,0,TAU);c.clip();c.fillStyle='#2f6fb0';c.fillRect(0,0,w,h);c.fillStyle='#4f8a3a';[[.3,.3,.18],[.7,.6,.15],[.45,.75,.12]].forEach(([x,y,r])=>{c.beginPath();c.ellipse(cx-R+x*2*R,cy-R+y*2*R,R*r*1.4,R*r,0,0,TAU);c.fill();});
  // cut-away quarter
  c.fillStyle='#8a5a3a';c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,0,Math.PI/2);c.closePath();c.fill();
  const lay=[[.98,'#8a5a3a'],[.94,'#c2622a'],[.55,'#e8902a'],[.35,'#ffcf3a']];lay.forEach(([f,col],i)=>{c.fillStyle=col;c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R*f,0,Math.PI/2);c.closePath();c.fill();});
  glow(c,cx+R*.15,cy+R*.15,R*.35,'255,240,150',.6+.2*Math.sin(t*3));c.restore();
  c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();
  [['crust: thin and rocky',.1],['mantle: hot, slowly flowing rock',.32],['outer core: liquid iron',.54],['inner core: solid, hot as the Sun',.76]].forEach(([tx,yy],i)=>{label(c,tx,w*.03,h*(yy+.06),{align:'left',size:11});});}};

S.plates={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#8fd0ff','#dff1ff');const T=(t%8)/8,push=smooth(.1,.9,T);const gy=h*.6;c.fillStyle='#e8902a';c.fillRect(0,gy+h*.1,w,h);for(let k=0;k<6;k++){const u=((t*.08+k/6)%1);c.strokeStyle='rgba(255,220,120,.4)';c.lineWidth=2;c.beginPath();c.arc(w*.5,h*1.1,h*.25+u*h*.35,Math.PI*1.15,Math.PI*1.85);c.stroke();}
  c.fillStyle='#6b7a4a';c.beginPath();c.moveTo(0,gy);c.lineTo(w*.5-20,gy);c.lineTo(w*.5-20+push*30,gy-push*h*.3);c.lineTo(w*.5-20+push*10,gy+h*.1);c.lineTo(0,gy+h*.1);c.closePath();c.fill();
  c.fillStyle='#7a6b4a';c.beginPath();c.moveTo(w,gy);c.lineTo(w*.5+20,gy);c.lineTo(w*.5+20-push*30,gy-push*h*.3);c.lineTo(w*.5+20-push*10,gy+h*.1);c.lineTo(w,gy+h*.1);c.closePath();c.fill();
  c.fillStyle='#8a8f98';c.beginPath();c.moveTo(w*.5-80-push*20,gy);c.lineTo(w*.5,gy-push*h*.42);c.lineTo(w*.5+80+push*20,gy);c.closePath();c.fill();if(push>.6){c.fillStyle='#fff';c.beginPath();c.moveTo(w*.5-20,gy-push*h*.3);c.lineTo(w*.5,gy-push*h*.42);c.lineTo(w*.5+20,gy-push*h*.3);c.closePath();c.fill();}
  arrow(c,w*.15,gy+h*.05,w*.3,gy+h*.05,'rgba(255,255,255,.9)',4);arrow(c,w*.85,gy+h*.05,w*.7,gy+h*.05,'rgba(255,255,255,.9)',4);
  label(c,'two plates push together...',w*.5,h*.08);label(c,'...and the crust crumples up into mountains, a few centimetres a year',w*.5,h*.94,{size:11});}};

S.iceberg={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#dff1ff','#ffffff');const wy=h*.35;c.fillStyle=grad(c,0,wy,0,h,['#4aa3e8','#0b2a55']);c.fillRect(0,wy,w,h-wy);
  const cx=w*.5,bob=Math.sin(t)*3;c.fillStyle='rgba(200,235,255,.85)';c.beginPath();c.moveTo(cx-w*.12,wy+bob);c.lineTo(cx-w*.05,wy-h*.22+bob);c.lineTo(cx+w*.03,wy-h*.12+bob);c.lineTo(cx+w*.12,wy+bob);c.closePath();c.fill();
  c.fillStyle='rgba(170,215,245,.7)';c.beginPath();c.moveTo(cx-w*.12,wy+bob);c.lineTo(cx+w*.12,wy+bob);c.lineTo(cx+w*.3,wy+h*.25+bob);c.lineTo(cx+w*.1,wy+h*.6+bob);c.lineTo(cx-w*.15,wy+h*.55+bob);c.lineTo(cx-w*.3,wy+h*.2+bob);c.closePath();c.fill();
  c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.beginPath();for(let x=0;x<=w;x+=4){const y=wy+Math.sin(x*.03+t*2)*3;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  label(c,'only about 1/10 shows above the water',cx,h*.08);label(c,'9/10 of the ice hides below',cx,h*.9,{size:12});}};

S.tilt={init(r){return{st:mkstars(r,120)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#05071a','#0a0c22');stars(c,w,h,s.st,t);const cx=w*.5,cy=h*.5;sun(c,cx,cy,h*.1,t);c.strokeStyle='rgba(255,255,255,.2)';c.setLineDash([4,6]);c.lineWidth=1.5;c.beginPath();c.ellipse(cx,cy,w*.38,h*.3,0,0,TAU);c.stroke();c.setLineDash([]);
  const a=t*.5,ex=cx+Math.cos(a)*w*.38,ey=cy+Math.sin(a)*h*.3,R=h*.07;ball(c,ex,ey,R,'#3b7dd8');if(KID())face(c,ex,ey,R,t,{ink:'#10233f'});c.save();c.translate(ex,ey);c.rotate(-.41);c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(0,-R*1.5);c.lineTo(0,R*1.5);c.stroke();c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.ellipse(0,-R*.8,R*.5,R*.25,0,0,TAU);c.fill();c.restore();
  const north=-Math.cos(a)*Math.sin(.41);label(c,north>.2?'north tilted toward the Sun: summer in the north':north<-.2?'north tilted away: winter in the north':'in between: spring or autumn',w*.5,h*.08);label(c,'the tilt never changes direction; the seasons come from where Earth is',w*.5,h*.94,{size:11});}};

S.moonphases={init(r){return{st:mkstars(r,120)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#05071a','#0a0c22');stars(c,w,h,s.st,t);const n=8,R=h*.09;const names=['new','crescent','first quarter','gibbous','full','gibbous','last quarter','crescent'];const cur=Math.floor(t/1.5)%n;
  for(let i=0;i<n;i++){const x=w*(.08+i*.12),y=h*.42,ph=i/n;circ(c,x,y,R,'#2a2c3a');c.save();c.beginPath();c.arc(x,y,R,0,TAU);c.clip();c.fillStyle='#f3efe4';
   const k=Math.cos(ph*TAU);if(ph<.5){c.beginPath();c.arc(x,y,R,-Math.PI/2,Math.PI/2);c.ellipse(x,y,Math.abs(k)*R,R,0,Math.PI/2,-Math.PI/2,k>0);c.fill();}else{c.beginPath();c.arc(x,y,R,Math.PI/2,-Math.PI/2);c.ellipse(x,y,Math.abs(k)*R,R,0,-Math.PI/2,Math.PI/2,k>0);c.fill();}
   c.restore();if(KID()&&i===4)face(c,x,y,R,t,{ink:'#5a5040'});if(i===cur){c.strokeStyle='#F2C46D';c.lineWidth=3;c.beginPath();c.arc(x,y,R+6,0,TAU);c.stroke();label(c,names[i],x,y+R+26,{size:11,bg:'rgba(242,196,109,.9)',col:'#1b1206'});}}
  label(c,'the Moon makes no light: we see the sunlit half from different sides',w*.5,h*.1,{size:11});label(c,'one full cycle takes about 29.5 days',w*.5,h*.9,{size:11});}};

S.daynight={init(r){return{st:mkstars(r,120),pts:(function(){const r2=rng(7),o=[];for(let i=0;i<500;i++)o.push({lat:(r2()*2-1)*70,lon:r2()*360});return o;})()};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#05071a','#0a0c22');stars(c,w,h,s.st,t);const cx=w*.5,cy=h*.5,R=h*.4;glow(c,w*.04,cy,h*.5,'255,220,120',.6);
  ball(c,cx,cy,R,'#2f6fb0',.2);const D=Math.PI/180;for(const p of s.pts){const la=p.lat*D,lm=(p.lon+t*25)*D;const z=Math.cos(la)*Math.cos(lm);if(z<=0)continue;const x=cx+R*Math.cos(la)*Math.sin(lm),y=cy-R*Math.sin(la);c.fillStyle='rgba(120,200,110,'+(.9*z)+')';c.fillRect(x-1.5,y-1.5,3,3);}
  c.save();c.beginPath();c.arc(cx,cy,R,0,TAU);c.clip();c.fillStyle=grad(c,cx-R*.1,0,cx+R*.3,0,['rgba(0,0,20,0)','rgba(0,0,20,.85)']);c.fillRect(cx-R*.1,0,R*1.2,h);c.restore();
  if(KID())face(c,cx-R*.3,cy-R*.05,R*.5,t,{ink:'#10233f'});
  label(c,'day',cx-R*.55,cy-R*1.15,{col:'#ffe08a'});label(c,'night',cx+R*.55,cy-R*1.15,{col:'#bcd8ff'});label(c,'Earth spins once every 24 hours',w*.5,h*.94,{size:11});}};

S.strata={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#8fd0ff','#dff1ff');const lays=[['#8a7a5a',.3],['#c9a24a',.42],['#a07a4a',.55],['#7a6b5a',.68],['#5a5a66',.82]];lays.forEach(([col,y],i)=>{c.fillStyle=col;c.beginPath();c.moveTo(0,h*y);for(let x=0;x<=w;x+=20)c.lineTo(x,h*y+Math.sin(x*.02+i)*5);c.lineTo(w,h);c.lineTo(0,h);c.fill();});
  const T=Math.floor(t/2)%5;const fos=[[w*.2,.36,'🐚'],[w*.5,.49,'🦴'],[w*.75,.61,'🐟'],[w*.35,.75,'🌿'],[w*.65,.89,'🦕']];
  fos.forEach(([x,y,e],i)=>{c.font=(h*.09)+'px serif';c.textAlign='center';c.textBaseline='middle';c.globalAlpha=i===T?1:.75;c.fillText(e,x,h*y);c.globalAlpha=1;if(i===T){c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(x,h*y,h*.07,0,TAU);c.stroke();}});
  label(c,'newer',w*.93,h*.34,{size:11});label(c,'older',w*.93,h*.86,{size:11});label(c,'deeper layers are older: a page from Earth\'s diary',w*.5,h*.12,{size:11});c.textAlign='left';}};

S.dinowalk={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#f3a65b','#ffd9a8');sun(c,w*.8,h*.2,h*.1,t);ground(c,w,h,h*.8,'#6b8f4a','#3e5e2c');for(let k=0;k<5;k++)tree(c,w*(.05+k*.22),h*.8,h*.22,'#2f6f3f');
  const x=((t*40)%(w*1.4))-w*.2,gy=h*.8,u=Math.min(w,h)/420,bob=Math.sin(t*4)*2;c.fillStyle='#2f4f3f';c.beginPath();c.ellipse(x,gy-70*u+bob,80*u,34*u,0,0,TAU);c.fill();
  c.lineCap='round';c.strokeStyle='#2f4f3f';c.lineWidth=18*u;c.beginPath();c.moveTo(x+60*u,gy-80*u+bob);c.quadraticCurveTo(x+110*u,gy-140*u,x+150*u,gy-190*u+Math.sin(t)*4);c.stroke();c.beginPath();c.ellipse(x+160*u,gy-194*u+Math.sin(t)*4,18*u,10*u,.2,0,TAU);c.fill();
  c.lineWidth=14*u;c.beginPath();c.moveTo(x-70*u,gy-70*u+bob);c.quadraticCurveTo(x-140*u,gy-60*u,x-190*u,gy-20*u+Math.sin(t*1.2)*6);c.stroke();
  c.lineWidth=16*u;for(const [lx,ph] of [[-40,0],[-15,Math.PI],[30,Math.PI],[55,0]]){const sw=Math.sin(t*4+ph)*12*u;c.beginPath();c.moveTo(x+lx*u,gy-50*u);c.lineTo(x+lx*u+sw,gy);c.stroke();}c.lineCap='butt';
  label(c,'a sauropod: as long as three buses',w*.5,h*.1);label(c,'it ate about 500 kg of plants every day',w*.5,h*.94,{size:11});}};

S.tornado={init(r){return{d:Array.from({length:200},()=>({u:r(),a:r()*TAU,s:.5+r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#2a2f3a','#6a7080');cloud(c,w*.5,h*.1,w*.2,'#3b3f4c');cloud(c,w*.2,h*.14,w*.12,'#454a58');cloud(c,w*.8,h*.14,w*.12,'#454a58');ground(c,w,h,h*.86,'#5a6a3a','#3a4a2a');
  const cx=w*.5;for(const p of s.d){const u=p.u,a=p.a+t*(4+u*6),R=h*.26*(1-u)+h*.02,x=cx+Math.cos(a)*R+Math.sin(t*2+u*5)*h*.04*u,y=h*.12+u*h*.74;c.fillStyle='rgba(200,200,215,'+(.25+.5*Math.sin(a))+')';c.fillRect(x-1.5,y-1.5,3,3);}
  c.fillStyle='rgba(120,120,135,.45)';c.beginPath();c.moveTo(cx-h*.3,h*.14);c.quadraticCurveTo(cx-h*.05,h*.6,cx-h*.03+Math.sin(t*2)*h*.04,h*.86);c.lineTo(cx+h*.03+Math.sin(t*2)*h*.04,h*.86);c.quadraticCurveTo(cx+h*.05,h*.6,cx+h*.3,h*.14);c.fill();
  for(let k=0;k<5;k++){const a=t*5+k*1.3,R=h*.08+k*h*.03;c.fillStyle='#5a4a2a';c.fillRect(cx+Math.cos(a)*R-3,h*.8-k*h*.08+Math.sin(a)*R*.3,6,4);}
  label(c,'spinning air, faster than a race car',w*.5,h*.94,{size:12});}};
})();
/* ---- two gentle scenes for the smallest readers ---- */
(function(){
const A=window.LART,S=A.scenes,{rng,lerp,smooth,grad,sky,ground,glow,circ,ball,sun,cloud,star,label,tree,stars,mkstars,face,KID,TAU}=A.h;
S.sunny={init(r){return{fl:Array.from({length:14},()=>({x:r(),h:.5+r()*.5,c:['#ff6b8a','#ffd35a','#c77dff','#ff8c42'][(r()*4)|0]})),bd:Array.from({length:3},()=>({x:r(),y:.15+r()*.25,s:.6+r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#8fd0ff','#e6f6ff');sun(c,w*.78,h*.22,h*.13,t);if(!KID())face(c,w*.78,h*.22,h*.13,t);
  const cx=w*.25+Math.sin(t*.15)*10,cy=h*.2;cloud(c,cx,cy,w*.08);face(c,cx,cy+w*.01,w*.045,t+1,{ink:'#5a6a80'});cloud(c,w*.5+Math.sin(t*.12+2)*8,h*.12,w*.06);
  for(const b of s.bd){const x=((b.x+t*.03*b.s)%1.1)*w,y=b.y*h+Math.sin(t*2+b.x*9)*6;c.strokeStyle='#3b3f48';c.lineWidth=2;c.beginPath();c.moveTo(x-8,y);c.quadraticCurveTo(x-4,y-5,x,y);c.quadraticCurveTo(x+4,y-5,x+8,y);c.stroke();}
  c.fillStyle='#7cc36b';c.beginPath();c.moveTo(0,h);c.lineTo(0,h*.72);c.quadraticCurveTo(w*.3,h*.5,w*.55,h*.7);c.quadraticCurveTo(w*.8,h*.86,w,h*.66);c.lineTo(w,h);c.fill();c.fillStyle='#5fae55';c.beginPath();c.moveTo(0,h);c.lineTo(0,h*.86);c.quadraticCurveTo(w*.5,h*.72,w,h*.88);c.lineTo(w,h);c.fill();
  tree(c,w*.12,h*.74,h*.26);tree(c,w*.86,h*.72,h*.22,'#4fb866');
  s.fl.forEach((f,i)=>{const x=f.x*w,y=h*.9-f.h*h*.06;c.strokeStyle='#3f9d55';c.lineWidth=3;c.beginPath();c.moveTo(x,h*.95);c.lineTo(x,y);c.stroke();for(let k=0;k<5;k++){const a=k/5*TAU+t*.5;circ(c,x+Math.cos(a)*7,y+Math.sin(a)*7,5,f.c);}circ(c,x,y,4,'#fff3a8');});
  label(c,'a sunny day: light everywhere',w*.5,h*.08,{bg:'rgba(60,80,120,.7)'});}};
S.nightsky={init(r){return{st:Array.from({length:26},()=>({x:.05+r()*.9,y:.08+r()*.6,s:.5+r(),p:r()*TAU})),dust:mkstars(r,120)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#2b3a8a','#5a4a9a');stars(c,w,h,s.dust,t);
  for(const q of s.st){const tw=.7+.3*Math.sin(t*2+q.p);star(c,q.x*w,q.y*h,h*.035*q.s*tw,'#fff3a8',t*.2+q.p);}
  const mx=w*.78,my=h*.24,R=h*.14;glow(c,mx,my,R*2.2,'255,240,200',.35);c.fillStyle='#fff3c4';c.beginPath();c.arc(mx,my,R,0,TAU);c.fill();c.fillStyle=A.h.soften('#2b3a8a');c.beginPath();c.arc(mx-R*.45,my-R*.1,R*.85,0,TAU);c.fill();face(c,mx+R*.3,my+R*.05,R*.5,t,{ink:'#7a5a20'});
  c.fillStyle='#1d2a4a';c.beginPath();c.moveTo(0,h);c.lineTo(0,h*.8);c.quadraticCurveTo(w*.3,h*.62,w*.55,h*.78);c.quadraticCurveTo(w*.8,h*.9,w,h*.74);c.lineTo(w,h);c.fill();
  for(let k=0;k<4;k++){const x=w*(.12+k*.22),gy=h*.82-k*h*.02;c.fillStyle='#152040';c.fillRect(x-h*.06,gy-h*.12,h*.12,h*.12);c.fillStyle='rgba(255,220,120,'+(.6+.4*Math.sin(t*1.3+k))+')';c.fillRect(x-h*.035,gy-h*.09,h*.03,h*.03);c.fillRect(x+h*.005,gy-h*.09,h*.03,h*.03);}
  label(c,'at night the stars come out: far-away suns',w*.5,h*.94,{bg:'rgba(20,30,70,.75)'});}};
})();
