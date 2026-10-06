/* Star Steps Library living pictures, part 3: history, inventions, maths, people and places. */
(function(){
const A=window.LART,S=A.scenes,{rng,lerp,clamp,smooth,ease,grad,sky,ground,glow,circ,ball,rrect,sun,cloud,star,arrow,label,person,tree,stars,mkstars,wave,TAU}=A.h;

/* ---- history & inventions ---- */
S.pyramid={init(r){return{wk:Array.from({length:8},(_,i)=>({u:i/8}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#ffb347','#ffe4b8');sun(c,w*.82,h*.18,h*.09,t);ground(c,w,h,h*.8,'#e8c47a','#c9a24a');const cx=w*.45,by=h*.8,H=h*.6,B=w*.46;
  const done=.55+.1*Math.sin(t*.3);c.fillStyle='#d9a441';c.beginPath();c.moveTo(cx-B/2,by);c.lineTo(cx,by-H);c.lineTo(cx+B/2,by);c.closePath();c.fill();c.fillStyle='#b8862a';c.beginPath();c.moveTo(cx,by-H);c.lineTo(cx+B/2,by);c.lineTo(cx+B*.1,by);c.closePath();c.fill();
  for(let k=1;k<10;k++){const y=by-k*H/10;c.strokeStyle='rgba(120,80,20,.25)';c.lineWidth=1;c.beginPath();c.moveTo(cx-B/2*(1-k/10),y);c.lineTo(cx+B/2*(1-k/10),y);c.stroke();}
  c.fillStyle='rgba(255,230,180,.6)';c.beginPath();c.moveTo(cx-B/2*(1-done),by-done*H);c.lineTo(cx,by-H);c.lineTo(cx+B/2*(1-done),by-done*H);c.closePath();c.fill();
  // ramp with workers hauling a block
  c.fillStyle='#c98a2e';c.beginPath();c.moveTo(w*.05,by);c.lineTo(cx-B/2*(1-done)+10,by-done*H);c.lineTo(cx-B/2*(1-done)+10,by);c.closePath();c.fill();
  s.wk.forEach(wk=>{const u=(wk.u+t*.05)%1;const x=lerp(w*.08,cx-B/2*(1-done),u),y=lerp(by,by-done*H,u);person(c,x,y,h*.09,'#5a3b22',t,{walk:1});});
  const u=(t*.05+.5)%1;rrect(c,lerp(w*.08,cx-B/2*(1-done),u)-14,lerp(by,by-done*H,u)-14,22,14,2,'#e8d8b0');
  label(c,'2.3 million blocks, each as heavy as a car',w*.5,h*.1);label(c,'hauled up ramps by thousands of workers',w*.5,h*.94,{size:11});}};

S.castle={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#8fd0ff','#dff1ff');cloud(c,w*.2+((t*8)%40),h*.2,w*.09);ground(c,w,h,h*.8,'#7cc36b','#4f9a46');const cx=w*.5,by=h*.8;
  c.fillStyle='#8a8f98';c.fillRect(cx-w*.3,by-h*.3,w*.6,h*.3);for(const x of[cx-w*.3,cx+w*.22]){c.fillRect(x,by-h*.52,w*.08,h*.52);for(let k=0;k<3;k++)c.fillRect(x+k*w*.03,by-h*.56,w*.016,h*.05);c.fillStyle='#d9463a';c.beginPath();c.moveTo(x-6,by-h*.56);c.lineTo(x+w*.04,by-h*.72);c.lineTo(x+w*.08+6,by-h*.56);c.fill();c.fillStyle='#8a8f98';}
  for(let k=0;k<9;k++)c.fillRect(cx-w*.3+w*.08+k*w*.05,by-h*.34,w*.025,h*.05);
  c.fillStyle='#5a3b22';c.beginPath();c.moveTo(cx-w*.05,by);c.lineTo(cx-w*.05,by-h*.12);c.arc(cx,by-h*.12,w*.05,Math.PI,0);c.lineTo(cx+w*.05,by);c.fill();c.strokeStyle='#3b2f24';c.lineWidth=2;for(let k=0;k<4;k++){c.beginPath();c.moveTo(cx-w*.05,by-k*h*.04);c.lineTo(cx+w*.05,by-k*h*.04);c.stroke();}
  c.fillStyle='#3b7dd8';c.fillRect(cx-w*.3+w*.03,by-h*.8,3,h*.26);const fl=Math.sin(t*5)*4;c.beginPath();c.moveTo(cx-w*.3+w*.03+3,by-h*.8);c.lineTo(cx-w*.3+w*.03+40,by-h*.78+fl);c.lineTo(cx-w*.3+w*.03+3,by-h*.74);c.fill();
  c.fillStyle='#2f6fb0';c.fillRect(0,by-4,w,h*.06);c.fillStyle='#4aa3e8';c.fillRect(0,by-4,w,4);
  label(c,'thick walls, high towers, a moat and a drawbridge',w*.5,h*.08,{size:11});label(c,'built to keep attackers out and people safe',w*.5,h*.95,{size:11});}};

S.wheel={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#bfe3ff','#eaf6ff');ground(c,w,h,h*.78,'#c9a24a','#a07a4a');const x=((t*50)%(w*1.3))-w*.15,gy=h*.78;
  rrect(c,x-70,gy-70,140,40,6,'#8a5a3a');c.fillStyle='#e8d8b0';c.fillRect(x-60,gy-95,50,25);c.fillRect(x-5,gy-90,40,20);
  c.strokeStyle='#5a3b22';c.lineWidth=6;c.beginPath();c.moveTo(x+70,gy-55);c.lineTo(x+140,gy-50);c.stroke();
  for(const wx of[x-45,x+45]){c.save();c.translate(wx,gy-24);c.rotate(t*2.2);circ(c,0,0,26,'#5a3b22');circ(c,0,0,20,'#c9a24a');c.strokeStyle='#5a3b22';c.lineWidth=4;for(let k=0;k<6;k++){const a=k/6*TAU;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*22,Math.sin(a)*22);c.stroke();}circ(c,0,0,5,'#5a3b22');c.restore();}
  person(c,x+150,gy,h*.3,'#3b7dd8',t,{walk:1,arms:-.2});
  label(c,'the wheel: about 5,500 years old and still turning',w*.5,h*.1,{size:11});}};

S.timeline={init(r){return{};},
 draw(c,w,h,t,s,v){const items=(v&&v.items)||[['3000 BC','writing'],['1440','printing'],['1876','telephone'],['1969','Moon landing'],['1989','the web']];sky(c,w,h,'#fbf6ec','#efe6d6');const y=h*.55,x0=w*.08,x1=w*.92;c.strokeStyle='#5a4a3a';c.lineWidth=4;c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke();arrow(c,x1-30,y,x1,y,'#5a4a3a',4);
  const cur=Math.floor(t/1.6)%items.length;items.forEach(([d,n],i)=>{const x=lerp(x0+20,x1-40,i/(items.length-1));const on=i===cur;glow(c,x,y,on?30:0,'242,196,109',.8);circ(c,x,y,on?12:8,on?'#F2C46D':'#e07a2a');label(c,d,x,y-34,{size:11,bg:'rgba(60,40,20,.8)'});label(c,n,x,y+34,{size:on?13:11,bold:on,bg:on?'rgba(242,196,109,.95)':'rgba(60,40,20,.6)',col:on?'#1b1206':'#fff'});});
  label(c,(v&&v.title)||'a few big moments in human history',w*.5,h*.1,{size:11});}};

S.ship={init(r){return{st:mkstars(r,80)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#0f1b3d','#3d5a99');stars(c,w,h,s.st,t);star(c,w*.5,h*.1,7,'#ffe08a',t*.3);label(c,'the North Star',w*.5,h*.22,{size:11});const wy=h*.66;c.fillStyle=grad(c,0,wy,0,h,['#1f4f8a','#0b2a55']);c.fillRect(0,wy,w,h-wy);
  const roll=Math.sin(t*1.2)*.05,x=w*.45,y=wy+Math.sin(t*1.2)*5;c.save();c.translate(x,y);c.rotate(roll);c.fillStyle='#5a3b22';c.beginPath();c.moveTo(-90,-10);c.lineTo(90,-10);c.lineTo(70,30);c.lineTo(-70,30);c.closePath();c.fill();c.fillStyle='#3b2f24';c.fillRect(-4,-120,8,110);c.fillRect(-50,-100,8,90);
  c.fillStyle='#f3efe4';c.beginPath();c.moveTo(4,-115);c.quadraticCurveTo(70+Math.sin(t*3)*4,-70,4,-25);c.fill();c.beginPath();c.moveTo(-42,-95);c.quadraticCurveTo(10+Math.sin(t*3)*3,-60,-42,-30);c.fill();c.restore();
  for(let k=0;k<4;k++)wave(c,0,w,wy+10+k*h*.08,4,60,t*2+k,'rgba(255,255,255,'+(.35-k*.07)+')',2);
  label(c,'sailors steered by the stars for thousands of years',w*.5,h*.94,{size:11});}};

S.bridge={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#8fd0ff','#dff1ff');const wy=h*.78;c.fillStyle='#2f6fb0';c.fillRect(0,wy,w,h-wy);const dy=h*.5;
  c.fillStyle='#8a8f98';for(const x of[w*.3,w*.7]){c.fillRect(x-10,h*.15,20,wy-h*.15);}
  c.strokeStyle='#d9463a';c.lineWidth=5;c.beginPath();c.moveTo(0,h*.3);c.quadraticCurveTo(w*.15,dy-10,w*.3,h*.15);c.quadraticCurveTo(w*.5,dy+h*.1,w*.7,h*.15);c.quadraticCurveTo(w*.85,dy-10,w,h*.3);c.stroke();
  c.lineWidth=2;for(let x=w*.05;x<w;x+=w*.05){let cy;if(x<w*.3){const u=x/(w*.3);cy=(1-u)*(1-u)*h*.3+2*(1-u)*u*(dy-10)+u*u*h*.15;}else if(x<w*.7){const u=(x-w*.3)/(w*.4);cy=(1-u)*(1-u)*h*.15+2*(1-u)*u*(dy+h*.1)+u*u*h*.15;}else{const u=(x-w*.7)/(w*.3);cy=(1-u)*(1-u)*h*.15+2*(1-u)*u*(dy-10)+u*u*h*.3;}c.beginPath();c.moveTo(x,cy);c.lineTo(x,dy);c.stroke();}
  c.fillStyle='#3b3f48';c.fillRect(0,dy,w,10);
  const cx=((t*60)%(w*1.2))-w*.1;rrect(c,cx-18,dy-18,36,18,4,'#ffd35a');circ(c,cx-10,dy,5,'#222');circ(c,cx+10,dy,5,'#222');
  arrow(c,cx,dy-24,cx,dy-50,'rgba(220,60,40,.9)',3);label(c,'the weight pulls the cables, the cables pull the towers',w*.5,h*.92,{size:11});label(c,'a suspension bridge',w*.5,h*.08,{size:11});}};

S.lightbulb={init(r){return{};},
 draw(c,w,h,t,s,v){const on=Math.floor(t/2.5)%2===0;sky(c,w,h,on?'#2a2210':'#15121a',on?'#1a1508':'#0a0810');const cx=w*.5,cy=h*.45,R=h*.26;if(on)glow(c,cx,cy,R*2.4,'255,220,120',.7);
  c.fillStyle=on?'rgba(255,245,200,.95)':'rgba(150,160,180,.5)';c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();c.fillStyle=on?'rgba(255,245,200,.95)':'rgba(150,160,180,.5)';c.beginPath();c.moveTo(cx-R*.45,cy+R*.85);c.lineTo(cx-R*.35,cy+R*1.3);c.lineTo(cx+R*.35,cy+R*1.3);c.lineTo(cx+R*.45,cy+R*.85);c.fill();
  rrect(c,cx-R*.36,cy+R*1.3,R*.72,R*.4,4,'#8a8f98');c.fillStyle='#5a5f68';for(let k=0;k<3;k++)c.fillRect(cx-R*.36,cy+R*1.36+k*R*.12,R*.72,R*.04);
  c.strokeStyle='#8a8f98';c.lineWidth=3;c.beginPath();c.moveTo(cx-R*.2,cy+R*1.3);c.lineTo(cx-R*.2,cy+R*.2);c.moveTo(cx+R*.2,cy+R*1.3);c.lineTo(cx+R*.2,cy+R*.2);c.stroke();
  c.strokeStyle=on?'#ff9a2e':'#444';c.lineWidth=3;c.beginPath();for(let i=0;i<=20;i++){const u=i/20;c.lineTo(cx-R*.2+u*R*.4,cy+R*.2-Math.sin(u*Math.PI*6)*R*.08);}c.stroke();if(on)glow(c,cx,cy+R*.15,R*.5,'255,200,120',.9);
  label(c,on?'electricity heats a thin wire until it glows':'no current: dark',w*.5,h*.08,{size:11});label(c,'Edison and others tested thousands of materials to get here',w*.5,h*.95,{size:11});}};

S.train={init(r){return{sm:Array.from({length:40},()=>({u:r(),o:r()-.5}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#bfe3ff','#eaf6ff');for(let k=0;k<4;k++)tree(c,((w*.25*k-t*30)%(w*1.2)+w*1.2)%(w*1.2)-w*.1,h*.72,h*.25);ground(c,w,h,h*.72,'#7cc36b','#4f9a46');
  c.fillStyle='#5a4a3a';c.fillRect(0,h*.84,w,6);for(let x=((-t*120)%40);x<w;x+=40)c.fillRect(x,h*.85,20,10);
  const x=w*.45,gy=h*.84;rrect(c,x-120,gy-60,120,50,4,'#2a2f38');rrect(c,x,gy-80,70,70,6,'#d9463a');rrect(c,x-110,gy-100,20,40,3,'#2a2f38');c.fillStyle='#3b3f48';c.fillRect(x+10,gy-72,50,30);
  for(const wx of[-90,-50,20,50]){c.save();c.translate(x+wx,gy-14);c.rotate(t*5);circ(c,0,0,16,'#222');circ(c,0,0,11,'#8a8f98');c.strokeStyle='#222';c.lineWidth=3;c.beginPath();c.moveTo(-11,0);c.lineTo(11,0);c.moveTo(0,-11);c.lineTo(0,11);c.stroke();c.restore();}
  c.strokeStyle='#d9463a';c.lineWidth=4;c.beginPath();c.moveTo(x-90,gy-14);c.lineTo(x-50+Math.cos(t*5)*8,gy-14+Math.sin(t*5)*8);c.stroke();
  for(const p of s.sm){const u=(p.u+t*.4)%1;c.fillStyle='rgba(230,230,240,'+(.7*(1-u))+')';circ(c,x-100-u*w*.3+p.o*20*u,gy-110-u*h*.3,6+u*18,c.fillStyle);}
  label(c,'steam pushes pistons, pistons turn wheels',w*.5,h*.1,{size:11});label(c,'in 1830 a train went faster than any horse: 48 km/h',w*.5,h*.96,{size:11});}};

S.telescope={init(r){return{st:mkstars(r,160)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#05071a','#1a1f45');stars(c,w,h,s.st,t);ground(c,w,h,h*.86,'#1d2a1d','#0d140d');const mx=w*.82,my=h*.22;circ(c,mx,my,h*.09,'#f3efe4');circ(c,mx-h*.03,my-h*.02,h*.015,'#d9d2c0');circ(c,mx+h*.03,my+h*.03,h*.01,'#d9d2c0');
  const px=w*.3,py=h*.86;person(c,px,py,h*.42,'#3b7dd8',0,{arms:.6});c.save();c.translate(px+h*.08,py-h*.3);c.rotate(-Math.atan2(py-h*.3-my,mx-px-h*.08));c.fillStyle='#8a8f98';c.fillRect(0,-10,h*.3,20);c.fillStyle='#5a5f68';c.fillRect(h*.3,-13,h*.06,26);c.restore();
  c.strokeStyle='#5a5f68';c.lineWidth=4;c.beginPath();c.moveTo(px+h*.1,py-h*.28);c.lineTo(px+h*.02,py);c.moveTo(px+h*.1,py-h*.28);c.lineTo(px+h*.2,py);c.stroke();
  for(let k=0;k<3;k++){const u=((t*.4+k/3)%1);c.strokeStyle='rgba(255,240,200,'+(.5*(1-u))+')';c.lineWidth=2;c.beginPath();c.moveTo(mx,my);c.lineTo(lerp(mx,px+h*.3,u),lerp(my,py-h*.4,u));c.stroke();}
  label(c,'in 1609 Galileo pointed a telescope at the sky and saw mountains on the Moon',w*.5,h*.08,{size:11});}};

S.computer={init(r){return{b:Array.from({length:8},()=>r()<.5?1:0)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#0f1a2a','#070d18');const n=8,sz=w*.09,x0=w*.5-n*sz/2,y=h*.4;const k=Math.floor(t*2)%n;if(Math.floor(t*2)!==s.last){s.last=Math.floor(t*2);s.b[k]=1-s.b[k];}
  let val=0;s.b.forEach((b,i)=>{val+=b*Math.pow(2,n-1-i);const x=x0+i*sz;rrect(c,x+4,y-sz*.5,sz-8,sz,8,b?'#F2C46D':'#1d2a3a');if(b)glow(c,x+sz/2,y,sz,'242,196,109',.4);label(c,String(b),x+sz/2,y,{box:false,size:sz*.5,bold:1,col:b?'#1b1206':'#5a6a80'});label(c,String(Math.pow(2,n-1-i)),x+sz/2,y+sz*.85,{size:10,box:false,col:'#8a9ab0'});});
  label(c,'8 switches, on or off: a byte',w*.5,h*.1);label(c,'this pattern means the number '+val,w*.5,h*.85,{bold:1});}};

S.robot={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#e9eef7','#d6deec');ground(c,w,h,h*.84,'#b8c4d6','#8a9ab0');const cx=w*.5,gy=h*.84,bob=Math.sin(t*3)*3;
  rrect(c,cx-h*.16,gy-h*.5+bob,h*.32,h*.34,12,'#8a8f98');rrect(c,cx-h*.12,gy-h*.72+bob,h*.24,h*.2,10,'#b8c4d6');
  const lk=Math.sin(t*2)*h*.02;circ(c,cx-h*.06+lk,gy-h*.63+bob,h*.035,'#3b7dd8');circ(c,cx+h*.06+lk,gy-h*.63+bob,h*.035,'#3b7dd8');circ(c,cx-h*.06+lk,gy-h*.63+bob,h*.015,'#fff');circ(c,cx+h*.06+lk,gy-h*.63+bob,h*.015,'#fff');c.fillStyle='#222';c.fillRect(cx-h*.05,gy-h*.57+bob,h*.1,h*.015);
  c.fillStyle='#5a5f68';c.fillRect(cx-2,gy-h*.8+bob,4,h*.08);circ(c,cx,gy-h*.8+bob,6,Math.sin(t*6)>0?'#d9463a':'#7a2a20');
  rrect(c,cx-h*.1,gy-h*.44+bob,h*.2,h*.12,6,'#223');for(let i=0;i<4;i++){rrect(c,cx-h*.08+i*h*.05,gy-h*.4+bob,h*.03,h*.04,2,Math.floor(t*4+i)%3?'#3ddc5a':'#1a3a2a');}
  for(const sg of[-1,1]){const ay=Math.sin(t*2+sg)*h*.06;c.strokeStyle='#8a8f98';c.lineWidth=h*.05;c.lineCap='round';c.beginPath();c.moveTo(cx+sg*h*.16,gy-h*.42+bob);c.lineTo(cx+sg*h*.3,gy-h*.3+ay+bob);c.stroke();c.lineCap='butt';circ(c,cx+sg*h*.3,gy-h*.3+ay+bob,h*.05,'#5a5f68');
   c.fillStyle='#5a5f68';c.fillRect(cx+sg*h*.08-h*.04,gy-h*.16,h*.08,h*.16);}
  label(c,'a robot follows instructions: sense, think, act',w*.5,h*.08,{size:11});label(c,'it only knows what it was programmed to know',w*.5,h*.96,{size:11});}};

/* ---- maths ---- */
S.fractions={init(r){return{};},
 draw(c,w,h,t,s,v){const d=(v&&v.d)||4;const n=(v&&v.n!=null)?v.n:(Math.floor(t/1.5)%(d+1));sky(c,w,h,'#fff7ea','#ffe9cc');const cx=w*.5,cy=h*.52,R=h*.36;
  for(let i=0;i<d;i++){const a0=-Math.PI/2+i/d*TAU,a1=-Math.PI/2+(i+1)/d*TAU;c.fillStyle=i<n?'#e07a2a':'#f8e0c0';c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,a0,a1);c.closePath();c.fill();c.strokeStyle='#8a5a3a';c.lineWidth=3;c.stroke();}
  c.strokeStyle='#8a5a3a';c.lineWidth=4;c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();
  label(c,n+' of '+d+' slices',w*.5,h*.1,{bold:1});label(c,n+'/'+d+(n===d?' = 1 whole':n*2===d?' = one half':''),w*.5,h*.94,{size:18,bold:1,bg:'rgba(224,122,42,.95)'});}};

S.numberline={init(r){return{};},
 draw(c,w,h,t,s,v){const N=(v&&v.max)||10,hop=(v&&v.hop)||2;sky(c,w,h,'#eaf7f0','#d4ecdf');const y=h*.62,x0=w*.08,x1=w*.92;c.strokeStyle='#2e5e3e';c.lineWidth=4;c.beginPath();c.moveTo(x0,y);c.lineTo(x1,y);c.stroke();
  for(let i=0;i<=N;i++){const x=lerp(x0,x1,i/N);c.beginPath();c.moveTo(x,y-10);c.lineTo(x,y+10);c.stroke();label(c,String(i),x,y+30,{size:13,box:false,col:'#2e5e3e',bold:1});}
  const steps=Math.floor(N/hop),T=(t%(steps+1.5)),k=Math.min(steps,Math.floor(T)),u=T-k;const from=k*hop,to=Math.min(N,(k+1)*hop);const fx=lerp(x0,x1,from/N),tx=lerp(x0,x1,to/N);const px=k<steps?lerp(fx,tx,ease(Math.min(1,u))):fx,py=y-20-(k<steps?Math.sin(Math.min(1,u)*Math.PI)*h*.3:0);
  for(let i=0;i<k;i++){const a=lerp(x0,x1,i*hop/N),b=lerp(x0,x1,(i+1)*hop/N);c.strokeStyle='rgba(60,160,90,.6)';c.lineWidth=3;c.beginPath();c.moveTo(a,y-14);c.quadraticCurveTo((a+b)/2,y-h*.3,b,y-14);c.stroke();}
  // frog
  c.fillStyle='#3f9d55';c.beginPath();c.ellipse(px,py,18,12,0,0,TAU);c.fill();circ(c,px-8,py-10,6,'#3f9d55');circ(c,px+8,py-10,6,'#3f9d55');circ(c,px-8,py-10,3,'#fff');circ(c,px+8,py-10,3,'#fff');circ(c,px-7,py-10,1.5,'#111');circ(c,px+9,py-10,1.5,'#111');
  label(c,'counting by '+hop+'s: '+Array.from({length:Math.min(k+1,steps+1)},(_,i)=>i*hop).join(', ')+(k<steps?'…':''),w*.5,h*.12,{bold:1});}};

S.shapes={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#f3efff','#e3dcff');const T=t%12,k=Math.floor(T/3),u=smooth(0,.6,T-k*3);const names=['triangle','square','pentagon','hexagon'],sides=[3,4,5,6];const cx=w*.5,cy=h*.5,R=h*.32;
  const n0=sides[k],n1=sides[(k+1)%4];c.fillStyle='#9b4dff';c.strokeStyle='#5b2ea0';c.lineWidth=4;c.beginPath();const N=60;for(let i=0;i<=N;i++){const a=i/N*TAU-Math.PI/2;const r0=R*Math.cos(Math.PI/n0)/Math.cos((a+Math.PI/2)%(TAU/n0)-Math.PI/n0);const r1=R*Math.cos(Math.PI/n1)/Math.cos((a+Math.PI/2)%(TAU/n1)-Math.PI/n1);const rr=lerp(r0,r1,0)*(1-0);const r=lerp(r0,r1,0);c.lineTo(cx+Math.cos(a+t*.2)*r,cy+Math.sin(a+t*.2)*r);}c.closePath();c.fill();c.stroke();
  for(let i=0;i<n0;i++){const a=i/n0*TAU-Math.PI/2+t*.2;circ(c,cx+Math.cos(a)*R,cy+Math.sin(a)*R,7,'#F2C46D');}
  label(c,names[k]+': '+n0+' sides, '+n0+' corners',w*.5,h*.1,{bold:1});label(c,'a shape with 1,000 sides looks almost like a circle',w*.5,h*.94,{size:11});}};

S.symmetry={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#eaf7f0','#d4ecdf');const cx=w*.5,cy=h*.52;c.strokeStyle='rgba(60,60,80,.4)';c.setLineDash([6,6]);c.lineWidth=2;c.beginPath();c.moveTo(cx,h*.12);c.lineTo(cx,h*.95);c.stroke();c.setLineDash([]);
  const fl=.7+.3*Math.abs(Math.sin(t*2));for(const sg of[-1,1]){c.save();c.translate(cx,cy);c.scale(sg*fl,1);c.fillStyle='#ff8c42';c.beginPath();c.ellipse(h*.2,-h*.1,h*.2,h*.15,.3,0,TAU);c.fill();c.fillStyle='#ffb347';c.beginPath();c.ellipse(h*.15,h*.12,h*.14,h*.11,-.3,0,TAU);c.fill();circ(c,h*.22,-h*.1,h*.05,'#5b2ea0');circ(c,h*.22,-h*.1,h*.025,'#fff');circ(c,h*.14,h*.12,h*.03,'#5b2ea0');c.restore();}
  c.fillStyle='#222';c.beginPath();c.ellipse(cx,cy,h*.03,h*.22,0,0,TAU);c.fill();c.strokeStyle='#222';c.lineWidth=2;c.beginPath();c.moveTo(cx-4,cy-h*.2);c.quadraticCurveTo(cx-20,cy-h*.3,cx-24,cy-h*.33);c.moveTo(cx+4,cy-h*.2);c.quadraticCurveTo(cx+20,cy-h*.3,cx+24,cy-h*.33);c.stroke();
  label(c,'a line of symmetry: fold it and both halves match',w*.5,h*.07,{size:11});}};

S.graph={init(r){return{};},
 draw(c,w,h,t,s,v){const bars=(v&&v.bars)||[['Mon',3],['Tue',5],['Wed',2],['Thu',7],['Fri',4]];const title=(v&&v.title)||'books read this week';sky(c,w,h,'#fff7ea','#ffe9cc');const x0=w*.1,y0=h*.85,x1=w*.92,y1=h*.2;c.strokeStyle='#5a4a3a';c.lineWidth=3;c.beginPath();c.moveTo(x0,y1);c.lineTo(x0,y0);c.lineTo(x1,y0);c.stroke();
  const mx=Math.max(...bars.map(b=>b[1]));const bw=(x1-x0)/bars.length;const grow=smooth(0,2,t%6);const cols=['#e07a2a','#3b7dd8','#3f9d55','#9b4dff','#d9463a','#F2C46D'];
  bars.forEach(([n,val],i)=>{const x=x0+bw*(i+.2),bh=(y0-y1)*val/mx*grow;rrect(c,x,y0-bh,bw*.6,bh,6,cols[i%cols.length]);label(c,n,x+bw*.3,y0+18,{size:11,box:false,col:'#5a4a3a',bold:1});if(grow>.95)label(c,String(val),x+bw*.3,y0-bh-14,{size:12,box:false,col:'#5a4a3a',bold:1});});
  label(c,title,w*.5,h*.09,{bold:1});}};

S.spiral={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#fff7ea','#ffe9cc');const cx=w*.5,cy=h*.55;const n=Math.min(260,Math.floor(((t%14)/14)*260)+10);const g=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<n;i++){const a=i*g+t*.1,r=Math.sqrt(i)*h*.028;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;c.fillStyle=i>n-12?'#F2C46D':'#8a5a3a';c.beginPath();c.ellipse(x,y,4+r*.012,3+r*.01,a,0,TAU);c.fill();}
  for(let i=0;i<14;i++){const a=i/14*TAU+t*.1;c.fillStyle='#ffd35a';c.beginPath();c.ellipse(cx+Math.cos(a)*h*.47,cy+Math.sin(a)*h*.47,h*.1,h*.045,a,0,TAU);c.fill();}
  label(c,'a sunflower packs its seeds in spirals',w*.5,h*.08,{size:11});label(c,'count the spirals: 34 one way, 55 the other. Fibonacci numbers!',w*.5,h*.95,{size:11});}};

S.compare={init(r){return{};},
 draw(c,w,h,t,s,v){const a=(v&&v.a)||1,b=(v&&v.b)||11,la=(v&&v.la)||'Earth',lb=(v&&v.lb)||'Jupiter',ca=(v&&v.ca)||'#3b7dd8',cb=(v&&v.cb)||'#e8c47a';sky(c,w,h,'#05071a','#0a0c22');const mx=Math.max(a,b),R=h*.4/mx*(1);const ra=R*a*(a===mx?1:1),rb=R*b;const grow=smooth(0,1.2,t%6);
  const xa=w*.2,xb=w*.62;ball(c,xa,h*.55,Math.max(4,ra*grow),ca);ball(c,xb,h*.55,Math.max(4,rb*grow),cb);
  label(c,la,xa,Math.min(h*.9,h*.55+Math.max(ra,20)+22),{size:12});label(c,lb,xb,Math.min(h*.9,h*.55+rb+22),{size:12});label(c,(v&&v.title)||(lb+' is about '+Math.round(b/a)+' times wider than '+la),w*.5,h*.09,{bold:1,size:12});}};

S.scale={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#fbf6ec','#efe6d6');const cx=w*.5,top=h*.22,tilt=Math.sin(t*.9)*.18;c.fillStyle='#5a4a3a';c.fillRect(cx-8,top,16,h*.6);c.fillRect(cx-w*.12,h*.82,w*.24,14);
  c.save();c.translate(cx,top);c.rotate(tilt);c.fillStyle='#8a5a3a';c.fillRect(-w*.3,-6,w*.6,12);for(const sg of[-1,1]){c.strokeStyle='#5a4a3a';c.lineWidth=2;c.beginPath();c.moveTo(sg*w*.28,0);c.lineTo(sg*w*.28-30,h*.25);c.moveTo(sg*w*.28,0);c.lineTo(sg*w*.28+30,h*.25);c.stroke();c.fillStyle='#c98a2e';c.beginPath();c.ellipse(sg*w*.28,h*.26,44,10,0,0,TAU);c.fill();}
  const nl=tilt<0?3:2,nr=tilt<0?2:3;for(let i=0;i<nl;i++)ball(c,-w*.28+(i-(nl-1)/2)*22,h*.26-14,10,'#d9463a');for(let i=0;i<nr;i++)ball(c,w*.28+(i-(nr-1)/2)*22,h*.26-14,10,'#3b7dd8');c.restore();
  label(c,'the heavier side goes down',w*.5,h*.1,{bold:1});label(c,'a balance compares two weights',w*.5,h*.95,{size:11});}};

S.dice={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#eaf7f0','#d4ecdf');const T=t%3,roll=T<1;const cx=w*.5,cy=h*.5,sz=h*.36;const r=rng(Math.floor(t/3)*31+7);const face=1+Math.floor(r()*6);
  c.save();c.translate(cx,cy);if(roll)c.rotate(T*TAU*2);rrect(c,-sz/2,-sz/2,sz,sz,sz*.18,'#fff');c.strokeStyle='#8a8f98';c.lineWidth=3;c.strokeRect(-sz/2,-sz/2,sz,sz);
  const f=roll?1+Math.floor(r()*6+T*20)%6:face;const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};P[f].forEach(([x,y])=>circ(c,x*sz*.27,y*sz*.27,sz*.08,'#222'));c.restore();
  label(c,roll?'rolling…':'a '+face+'. Each face had a 1 in 6 chance.',w*.5,h*.1,{bold:1});label(c,'chance: you cannot know one roll, but you can know the odds',w*.5,h*.95,{size:11});}};

S.city={init(r){return{b:Array.from({length:14},(_,i)=>({x:i/14,w:.05+r()*.04,h:.2+r()*.5,win:r()})),st:mkstars(r,100)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#0b1030','#2a2060');stars(c,w,h,s.st,t);circ(c,w*.85,h*.18,h*.07,'#f3efe4');ground(c,w,h,h*.88,'#1a1a2a','#0a0a14');
  s.b.forEach((b,i)=>{const x=b.x*w,bw=b.w*w,bh=b.h*h;c.fillStyle='#1d1d33';c.fillRect(x,h*.88-bh,bw,bh);for(let r=0;r<Math.floor(bh/18);r++)for(let k=0;k<Math.floor(bw/14);k++){const on=Math.sin(t*.7+i*3+r*1.7+k*2.3+b.win*9)>-.2;c.fillStyle=on?'rgba(255,220,120,.9)':'rgba(40,40,60,.9)';c.fillRect(x+5+k*14,h*.88-bh+6+r*18,7,9);}});
  const cx=((t*90)%(w*1.2))-w*.1;rrect(c,cx-16,h*.88-16,32,14,3,'#d9463a');circ(c,cx+18,h*.88-9,3,'#fff');
  label(c,'more than half of all people now live in cities',w*.5,h*.08,{size:11});}};

S.coins={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#fff7ea','#ffe9cc');const items=(v&&v.items)||[[1,'1¢'],[5,'5¢'],[10,'10¢'],[25,'25¢'],[100,'$1']];const n=Math.min(items.length,1+Math.floor((t%8)/1.4));let total=0;
  items.slice(0,n).forEach(([val,txt],i)=>{total+=val;const x=w*(.15+i*.17),y=h*.5+Math.sin(t*2+i)*4;const R=h*.1+Math.log(val+1)*h*.012;glow(c,x,y,R*1.4,'255,210,90',.3);ball(c,x,y,R,val>=100?'#F2C46D':val===1?'#c97a3a':'#c8ccd4');label(c,txt,x,y,{box:false,bold:1,size:R*.6,col:'#333'});});
  label(c,'count the money: '+(total>=100?'$'+(total/100).toFixed(2):total+'¢'),w*.5,h*.1,{bold:1});}};

S.clock={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#eef2f7','#dde4ee');const cx=w*.5,cy=h*.52,R=h*.4;ball(c,cx,cy,R,'#fff',.1);c.strokeStyle='#3b3f48';c.lineWidth=5;c.beginPath();c.arc(cx,cy,R,0,TAU);c.stroke();
  for(let i=0;i<12;i++){const a=i/12*TAU-Math.PI/2;label(c,String(i===0?12:i),cx+Math.cos(a)*R*.82,cy+Math.sin(a)*R*.82,{box:false,size:R*.17,bold:1,col:'#3b3f48'});}
  const mins=(t*6)%720,ha=mins/720*TAU-Math.PI/2,ma=(mins%60)/60*TAU-Math.PI/2;c.lineCap='round';c.strokeStyle='#3b3f48';c.lineWidth=8;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ha)*R*.5,cy+Math.sin(ha)*R*.5);c.stroke();c.lineWidth=5;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ma)*R*.72,cy+Math.sin(ma)*R*.72);c.stroke();c.lineCap='butt';circ(c,cx,cy,8,'#d9463a');
  const hh=Math.floor(mins/60)||12,mm=Math.floor(mins%60);label(c,(hh===0?12:hh)+':'+String(mm).padStart(2,'0'),w*.82,h*.5,{size:22,bold:1,bg:'rgba(59,63,72,.95)'});label(c,'the short hand counts hours, the long hand counts minutes',w*.5,h*.95,{size:11});}};

S.people={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#bfe3ff','#eaf6ff');ground(c,w,h,h*.84,'#86c76f','#4f9a46');const cols=['#3b7dd8','#d9463a','#3f9d55','#9b4dff','#e07a2a','#F2C46D'];const skins=['#f1c7a3','#c68642','#8d5524','#e0ac69','#ffdbac','#5c3a1e'];
  for(let i=0;i<6;i++){const x=w*(.1+i*.16),y=h*.84;person(c,x,y,h*.45+((i*7)%3)*h*.03,cols[i],t+i,{arms:.3+.3*Math.sin(t*2+i),skin:skins[i]});}
  label(c,(v&&v.title)||'8 billion people, every one different, every one made of the same atoms',w*.5,h*.1,{size:11});}};
})();
