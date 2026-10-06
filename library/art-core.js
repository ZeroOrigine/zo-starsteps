/* Star Steps Library: living pictures, drawn by code (2026-10-06).
   Every book page picks a scene by name and optional values. Scenes are 2:1 and animate with time t (seconds).
   Part 1: helpers + physics + chemistry. Registry: window.LART.scenes[name] = {init(r,v), draw(c,w,h,t,s,v)} */
window.LART=(function(){
const TAU=Math.PI*2, scenes={};
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const lerp=(a,b,f)=>a+(b-a)*f, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), smooth=(a,b,v)=>{const x=clamp((v-a)/(b-a),0,1);return x*x*(3-2*x);};
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
function grad(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g;}
function sky(c,w,h,top,bot){c.fillStyle=grad(c,0,0,0,h,[top,bot]);c.fillRect(0,0,w,h);}
function ground(c,w,h,y,col,col2){c.fillStyle=grad(c,0,y,0,h,[col,col2||col]);c.beginPath();c.moveTo(0,y);for(let x=0;x<=w;x+=20)c.lineTo(x,y+Math.sin(x*.01)*4);c.lineTo(w,h);c.lineTo(0,h);c.fill();}
function glow(c,x,y,r,col,a){if(r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function circ(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function ball(c,x,y,r,col,hi){circ(c,x,y,r,col);const g=c.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);g.addColorStop(0,'rgba(255,255,255,'+(hi==null?.55:hi)+')');g.addColorStop(.6,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.25)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function rrect(c,x,y,w,h,r,col){c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function sun(c,x,y,r,t){glow(c,x,y,r*2.6,'255,200,80',.45);ball(c,x,y,r,'#FFD35A',.7);c.strokeStyle='rgba(255,210,90,.55)';c.lineWidth=3;for(let i=0;i<12;i++){const a=i/12*TAU+t*.2,l=r*(1.35+.12*Math.sin(t*3+i));c.beginPath();c.moveTo(x+Math.cos(a)*r*1.15,y+Math.sin(a)*r*1.15);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}}
function cloud(c,x,y,s,col){c.fillStyle=col||'rgba(255,255,255,.95)';[[0,0,1],[-.9,.15,.7],[.9,.1,.75],[-.4,-.35,.7],[.45,-.4,.65]].forEach(([dx,dy,r])=>{c.beginPath();c.arc(x+dx*s,y+dy*s,r*s*.62,0,TAU);c.fill();});c.fillRect(x-s*.9,y,s*1.8,s*.45);}
function star(c,x,y,r,col,rot){c.fillStyle=col;c.beginPath();for(let i=0;i<10;i++){const a=(rot||0)-Math.PI/2+i/10*TAU,rr=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();}
function arrow(c,x1,y1,x2,y2,col,wd){const a=Math.atan2(y2-y1,x2-x1),L=Math.hypot(x2-x1,y2-y1);if(L<2)return;wd=wd||3;c.strokeStyle=col;c.fillStyle=col;c.lineWidth=wd;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2-Math.cos(a)*wd*3,y2-Math.sin(a)*wd*3);c.stroke();c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-Math.cos(a-.5)*wd*4.5,y2-Math.sin(a-.5)*wd*4.5);c.lineTo(x2-Math.cos(a+.5)*wd*4.5,y2-Math.sin(a+.5)*wd*4.5);c.closePath();c.fill();c.lineCap='butt';}
function label(c,text,x,y,opt){if(c.__nl)return;opt=opt||{};const size=opt.size||12;c.font=(opt.bold?'700 ':'600 ')+size+'px "Figtree","Segoe UI",system-ui,sans-serif';c.textAlign=opt.align||'center';c.textBaseline='middle';const wd=c.measureText(text).width+size*1.1;if(opt.box!==false){c.fillStyle=opt.bg||'rgba(20,18,30,.72)';c.beginPath();c.roundRect((opt.align==='left'?x-size*.55:opt.align==='right'?x-wd+size*.55:x-wd/2),y-size*.85,wd,size*1.7,size*.85);c.fill();}c.fillStyle=opt.col||'#fff';c.fillText(text,x,y+1);c.textAlign='left';c.textBaseline='alphabetic';}
function person(c,x,y,s,col,t,opt){opt=opt||{};const sw=Math.sin((t||0)*6)*(opt.walk?1:0);c.strokeStyle=col;c.fillStyle=col;c.lineWidth=s*.16;c.lineCap='round';
 circ(c,x,y-s*.82,s*.17,opt.skin||'#f1c7a3');c.beginPath();c.moveTo(x,y-s*.62);c.lineTo(x,y-s*.25);c.stroke();
 c.beginPath();c.moveTo(x,y-s*.25);c.lineTo(x-s*.16+sw*s*.1,y);c.moveTo(x,y-s*.25);c.lineTo(x+s*.16-sw*s*.1,y);c.stroke();
 const ar=opt.arms||0;c.beginPath();c.moveTo(x,y-s*.55);c.lineTo(x-s*.22,y-s*.3-ar*s*.4);c.moveTo(x,y-s*.55);c.lineTo(x+s*.22,y-s*.3-ar*s*.4);c.stroke();c.lineCap='butt';}
function tree(c,x,y,s,leaf,trunk){c.fillStyle=trunk||'#6b4a2b';c.fillRect(x-s*.06,y-s*.5,s*.12,s*.5);[[0,-.72,.3],[-.2,-.56,.24],[.2,-.56,.24],[0,-.5,.26]].forEach(([dx,dy,r])=>circ(c,x+dx*s,y+dy*s,r*s,leaf||'#3f9d55'));}
function stars(c,w,h,st,t){for(const q of st){const a=q.a*(.6+.4*Math.sin((t||0)*q.f+q.p));c.fillStyle='rgba(255,255,255,'+a+')';c.fillRect(q.x*w,q.y*h,q.z,q.z);}}
function mkstars(r,n){return Array.from({length:n||120},()=>({x:r(),y:r(),a:.3+r()*.7,z:1+r()*1.4,f:1+r()*3,p:r()*TAU}));}
function wave(c,x0,x1,y,amp,len,ph,col,wd){c.strokeStyle=col;c.lineWidth=wd||2.5;c.beginPath();for(let x=x0;x<=x1;x+=3){const yy=y+Math.sin((x-x0)/len*TAU+ph)*amp;x===x0?c.moveTo(x,yy):c.lineTo(x,yy);}c.stroke();}
const H={rng,lerp,clamp,smooth,ease,grad,sky,ground,glow,circ,ball,rrect,sun,cloud,star,arrow,label,person,tree,stars,mkstars,wave,TAU};

/* ============ PHYSICS ============ */
scenes.prism={init(r){return{dust:Array.from({length:60},()=>({x:r(),y:r(),s:r()}))};},
 draw(c,w,h,t,s){sky(c,w,h,'#101225','#05060f');for(const d of s.dust){c.fillStyle='rgba(255,255,255,'+(.15+.2*Math.sin(t*2+d.s*9))+')';c.fillRect(d.x*w,d.y*h,1.5,1.5);}
  const px=w*.5,py=h*.5,S=h*.3;const beamY=py+S*.1;c.strokeStyle='rgba(255,255,255,.92)';c.lineWidth=5;c.beginPath();c.moveTo(0,beamY+h*.08);c.lineTo(px-S*.42,beamY);c.stroke();glow(c,px-S*.42,beamY,18,'255,255,255',.6);
  const cols=['#ff3b3b','#ff8c1a','#ffe23b','#3ddc5a','#2bb3ff','#4b5bff','#9b4dff'];const spread=.9+.1*Math.sin(t*1.3);
  cols.forEach((col,i)=>{const a=(i-3)*.055*spread+.18;c.strokeStyle=col;c.lineWidth=7;c.globalAlpha=.9;c.beginPath();c.moveTo(px+S*.3,py+S*.05+(i-3)*2);c.lineTo(w,py+S*.05+Math.tan(a)*(w-px)+(i-3)*3);c.stroke();});c.globalAlpha=1;
  c.fillStyle='rgba(190,220,255,.35)';c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2;c.beginPath();c.moveTo(px,py-S*.6);c.lineTo(px+S*.55,py+S*.4);c.lineTo(px-S*.55,py+S*.4);c.closePath();c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(px-S*.05,py-S*.5);c.lineTo(px+S*.12,py-S*.2);c.lineTo(px-S*.3,py+S*.3);c.closePath();c.fill();
  label(c,'white light',w*.12,beamY+h*.02);label(c,'a rainbow of colours',w*.8,h*.18);}};

scenes.pendulum={init(r,v){return{L:(v&&v.len)||.62};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#f7efe2','#efe2cc');const px=w*.5,py=h*.08,L=h*s.L,A=.6,a=Math.sin(t*Math.sqrt(9.8/s.L)*.9)*A;
  c.fillStyle='#6b4a2b';c.fillRect(w*.2,py-8,w*.6,12);
  c.strokeStyle='rgba(60,40,20,.18)';c.lineWidth=2;c.setLineDash([5,6]);c.beginPath();c.arc(px,py,L,Math.PI/2-A,Math.PI/2+A);c.stroke();c.setLineDash([]);
  const bx=px+Math.sin(a)*L,by=py+Math.cos(a)*L;c.strokeStyle='#3b2f24';c.lineWidth=2.5;c.beginPath();c.moveTo(px,py);c.lineTo(bx,by);c.stroke();
  ball(c,bx,by,h*.075,'#d9463a');circ(c,px,py,6,'#3b2f24');
  if(!(v&&v.quiet)){const sp=Math.abs(Math.cos(t*Math.sqrt(9.8/s.L)*.9));label(c,sp>.7?'fastest at the bottom':'slowest at the ends',w*.5,h*.92,{bg:'rgba(60,40,20,.75)'});}}};

scenes.ramp={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#e8f4ff','#cfe6ff');ground(c,w,h,h*.82,'#7cc36b','#4f9a46');
  const x0=w*.08,y0=h*.25,x1=w*.62,y1=h*.82;c.fillStyle='#8a6a4a';c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.lineTo(x0,y1);c.closePath();c.fill();c.fillStyle='#b08a62';c.fillRect(x0-6,y0-6,12,y1-y0+6);
  const T=t%5,f=Math.min(1,T/3);const u=f*f;let bx,by;if(T<3){bx=lerp(x0+14,x1-10,u);by=lerp(y0-14,y1-14,u)+0;}else{const e=T-3;bx=x1-10+e*w*.22;by=y1-14-Math.abs(Math.sin(e*5))*18*Math.max(0,1-e/1.5);}
  const ang=Math.atan2(y1-y0,x1-x0);const rr=14;c.save();c.translate(bx,by);c.rotate(T<3?u*14:14+(T-3)*6);ball(c,0,0,rr,'#3b7dd8');c.fillStyle='rgba(255,255,255,.7)';c.fillRect(-2,-rr+3,4,6);c.restore();
  arrow(c,x0+w*.1,y0+h*.02,x0+w*.1+Math.cos(ang)*50,y0+h*.02+Math.sin(ang)*50,'rgba(220,60,40,.9)',3);label(c,'gravity pulls it down the slope',w*.42,h*.14);
  if(T>=3)label(c,'it keeps rolling: that is momentum',w*.66,h*.62);}};

scenes.magnet={init(r){return{f:Array.from({length:260},()=>({u:r(),k:r(),s:r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#fbf6ec','#efe6d6');const cx=w*.5,cy=h*.5,L=w*.26,H=h*.16;
  // field lines
  c.lineWidth=1.6;for(let k=1;k<=6;k++){const R=k*h*.075+H*.6;c.strokeStyle='rgba(90,80,140,'+(.55-k*.06)+')';for(const sg of[1,-1]){c.beginPath();c.moveTo(cx+L*.95,cy);c.bezierCurveTo(cx+L+R*.9,cy+sg*R*1.1,cx-L-R*.9,cy+sg*R*1.1,cx-L*.95,cy);c.stroke();}}
  // moving arrows along lines (from N to S)
  for(const f of s.f){const k=1+Math.floor(f.k*6),R=k*h*.075+H*.6,sg=f.s<.5?1:-1,u=(f.u+t*.08*(1+f.k))%1;
   const bx=(p0,p1,p2,p3,u)=>Math.pow(1-u,3)*p0+3*Math.pow(1-u,2)*u*p1+3*(1-u)*u*u*p2+u*u*u*p3;
   const x=bx(cx+L*.95,cx+L+R*.9,cx-L-R*.9,cx-L*.95,u),y=bx(cy,cy+sg*R*1.1,cy+sg*R*1.1,cy,u);c.fillStyle='rgba(60,50,120,.7)';c.fillRect(x-1.2,y-1.2,2.4,2.4);}
  rrect(c,cx-L,cy-H/2,L,H,6,'#d9463a');rrect(c,cx,cy-H/2,L,H,6,'#3b7dd8');c.fillStyle='rgba(255,255,255,.25)';c.fillRect(cx-L+4,cy-H/2+4,L*2-8,H*.22);
  label(c,'N',cx-L/2,cy,{size:20,bold:1,box:false});label(c,'S',cx+L/2,cy,{size:20,bold:1,box:false});
  label(c,'invisible field lines loop from N to S',cx,h*.9,{bg:'rgba(60,40,20,.75)'});}};

scenes.circuit={init(r){return{e:Array.from({length:40},()=>({u:r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#101a2a','#0a1220');const x0=w*.2,x1=w*.8,y0=h*.2,y1=h*.8;const on=(v&&v.on!=null)?!!v.on:(Math.floor(t/3)%2===0);
  c.strokeStyle='#c98a2e';c.lineWidth=5;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y0);c.lineTo(x1,y1);c.lineTo(x0+w*.14,y1);c.moveTo(x0+w*.06,y1);c.lineTo(x0,y1);c.lineTo(x0,y0);c.stroke();
  // battery
  const by=(y0+y1)/2;c.fillStyle='#101a2a';c.fillRect(x0-14,by-28,28,56);c.strokeStyle='#eee';c.lineWidth=4;c.beginPath();c.moveTo(x0-16,by-12);c.lineTo(x0+16,by-12);c.moveTo(x0-8,by+12);c.lineTo(x0+8,by+12);c.stroke();label(c,'battery',x0,by+44,{size:11});
  // switch
  const sx=x0+w*.06,sy=y1;c.strokeStyle='#eee';c.lineWidth=4;c.beginPath();c.moveTo(sx,sy);const a=on?0:-.6;c.lineTo(sx+Math.cos(a)*w*.08,sy+Math.sin(a)*w*.08);c.stroke();circ(c,sx,sy,5,'#eee');circ(c,sx+w*.08,sy,5,'#eee');label(c,on?'switch closed':'switch open',sx+w*.04,sy+28,{size:11});
  // bulb
  const bx=(x0+x1)/2,byy=y0;if(on)glow(c,bx,byy,h*.3,'255,220,120',.75);c.fillStyle=on?'#fff1a8':'#56606e';c.beginPath();c.arc(bx,byy-6,22,0,TAU);c.fill();c.fillStyle='#8a8f98';c.fillRect(bx-10,byy+12,20,10);c.strokeStyle=on?'#ff9a2e':'#2a2f38';c.lineWidth=2;c.beginPath();c.moveTo(bx-8,byy+12);c.lineTo(bx-4,byy-4);c.lineTo(bx,byy+4);c.lineTo(bx+4,byy-4);c.lineTo(bx+8,byy+12);c.stroke();
  // electrons
  if(on){const P=2*(x1-x0)+2*(y1-y0);for(const e of s.e){const d=((e.u+t*.12)%1)*P;let x,y;if(d<x1-x0){x=x0+d;y=y0;}else if(d<x1-x0+y1-y0){x=x1;y=y0+(d-(x1-x0));}else if(d<2*(x1-x0)+y1-y0){x=x1-(d-(x1-x0)-(y1-y0));y=y1;}else{x=x0;y=y1-(d-2*(x1-x0)-(y1-y0));}circ(c,x,y,3,'#7fd6ff');}}
  label(c,on?'electrons flow: the bulb lights':'no loop, no flow, no light',w*.5,h*.93);}};

scenes.sound={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#1d1030','#0c0818');const sx=w*.18,sy=h*.5;rrect(c,sx-30,sy-45,40,90,8,'#2b2b38');circ(c,sx-10,sy,26,'#111');circ(c,sx-10,sy,12,'#3a3a4a');
  for(let k=0;k<7;k++){const R=((t*120+k*52)%(w*.9));const a=Math.max(0,1-R/(w*.9));c.strokeStyle='rgba(160,200,255,'+a*.8+')';c.lineWidth=3;c.beginPath();c.arc(sx,sy,R,-.9,.9);c.stroke();}
  const ex=w*.85,ey=h*.5;circ(c,ex,ey-h*.3,h*.13,'#f1c7a3');c.fillStyle='#f1c7a3';c.beginPath();c.ellipse(ex-h*.12,ey-h*.3,h*.05,h*.075,0,0,TAU);c.fill();
  wave(c,w*.3,w*.72,h*.85,10+4*Math.sin(t*3),44,t*8,'rgba(255,210,120,.95)',3);label(c,'air wobbles back and forth: a sound wave',w*.5,h*.12);label(c,'the ear catches the wobble',ex-10,ey+h*.05,{size:11});}};

scenes.orbit={init(r){return{st:mkstars(r,140)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#05071a','#0a0c22');stars(c,w,h,s.st,t);const cx=w*.5,cy=h*.5,R=h*.36;sun(c,cx,cy,h*.1,t);
  c.strokeStyle='rgba(255,255,255,.2)';c.lineWidth=1.5;c.setLineDash([4,6]);c.beginPath();c.ellipse(cx,cy,R*1.5,R,0,0,TAU);c.stroke();c.setLineDash([]);
  const a=t*.7,px=cx+Math.cos(a)*R*1.5,py=cy+Math.sin(a)*R;ball(c,px,py,h*.05,'#3b7dd8');
  const dx=cx-px,dy=cy-py,L=Math.hypot(dx,dy);arrow(c,px,py,px+dx/L*60,py+dy/L*60,'rgba(255,120,80,.95)',3);
  const vx=-Math.sin(a)*R*1.5,vy=Math.cos(a)*R,VL=Math.hypot(vx,vy);arrow(c,px,py,px+vx/VL*60,py+vy/VL*60,'rgba(120,220,255,.95)',3);
  label(c,'gravity pulls inward',w*.14,h*.12,{col:'#ffb59a'});label(c,'speed carries it sideways',w*.82,h*.12,{col:'#a9e8ff'});label(c,'pull + speed = an orbit',cx,h*.92);}};

scenes.lever={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#eef7ff','#d6ebff');ground(c,w,h,h*.84,'#86c76f','#4f9a46');const cx=w*.5,cy=h*.7;const tilt=.22*Math.sin(t*.9);
  c.fillStyle='#6b4a2b';c.beginPath();c.moveTo(cx-22,cy+h*.14);c.lineTo(cx+22,cy+h*.14);c.lineTo(cx,cy);c.closePath();c.fill();
  c.save();c.translate(cx,cy);c.rotate(tilt);rrect(c,-w*.4,-7,w*.8,14,5,'#8a6a4a');
  rrect(c,-w*.38,-7-h*.22,h*.22,h*.22,6,'#d9463a');label(c,'heavy',-w*.38+h*.11,-7-h*.11,{size:12,box:false,col:'#fff',bold:1});
  rrect(c,w*.3,-7-h*.12,h*.12,h*.12,5,'#3b7dd8');label(c,'light',w*.3+h*.06,-7-h*.06,{size:11,box:false,col:'#fff',bold:1});c.restore();
  label(c,'a long arm lifts a heavy load: a lever',cx,h*.12);label(c,'pivot',cx,cy+h*.2,{size:11});}};

scenes.gears={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#2a2420','#17120f');function gear(x,y,R,n,a,col){c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;c.beginPath();for(let i=0;i<n*2;i++){const ang=i/(n*2)*TAU,rr=i%2?R:R*1.22;c.lineTo(Math.cos(ang)*rr,Math.sin(ang)*rr);const ang2=(i+.5)/(n*2)*TAU;c.lineTo(Math.cos(ang2)*rr,Math.sin(ang2)*rr);}c.closePath();c.fill();circ(c,0,0,R*.3,'#17120f');for(let i=0;i<4;i++){const q=i/4*TAU;circ(c,Math.cos(q)*R*.6,Math.sin(q)*R*.6,R*.1,'#17120f');}c.restore();}
  const R1=h*.26,n1=12,R2=h*.14,n2=6,R3=h*.2,n3=9;const a=t*.6;gear(w*.32,h*.5,R1,n1,a,'#d9a441');gear(w*.32+R1*1.22+R2*1.1-6,h*.5,R2,n2,-a*n1/n2+Math.PI/n2,'#b8c4d6');gear(w*.32+R1*1.22+R2*2.2+R3*1.15-10,h*.56,R3,n3,a*n1/n3+Math.PI/n3*.5,'#e07a4a');
  label(c,'big gear: slow and strong',w*.32,h*.12);label(c,'small gear: spins fast',w*.68,h*.14,{size:11});}};

scenes.rocket={init(r){return{st:mkstars(r,100),fl:Array.from({length:120},()=>({u:r(),o:(r()-.5)}))};},
 draw(c,w,h,t,s,v){const T=t%8,f=smooth(1,6,T);sky(c,w,h,lerp(0,1,f)>.5?'#0b1030':'#8fd0ff',f>.5?'#1a2a60':'#dff1ff');stars(c,w,h,s.st,t);c.globalAlpha=f;stars(c,w,h,s.st,t);c.globalAlpha=1;
  ground(c,w,h,h*.9+f*h*.3,'#6b8f4a','#3e5e2c');const rx=w*.5,ry=h*.78-f*h*.75+(T<1?Math.sin(t*40)*1.5:0);
  // flame
  if(T>.6){c.globalCompositeOperation='lighter';for(const p of s.fl){const u=(p.u+t*1.6)%1;const y=ry+h*.12+u*h*.3,x=rx+p.o*30*u;c.fillStyle='rgba(255,'+Math.round(220-u*180)+',60,'+(1-u)*.8+')';circ(c,x,y,10*(1-u)+2,c.fillStyle);}c.globalCompositeOperation='source-over';}
  c.fillStyle='#e9eef5';c.beginPath();c.moveTo(rx,ry-h*.28);c.quadraticCurveTo(rx+h*.09,ry-h*.1,rx+h*.08,ry+h*.1);c.lineTo(rx-h*.08,ry+h*.1);c.quadraticCurveTo(rx-h*.09,ry-h*.1,rx,ry-h*.28);c.fill();
  c.fillStyle='#d9463a';c.beginPath();c.moveTo(rx-h*.08,ry+h*.02);c.lineTo(rx-h*.15,ry+h*.14);c.lineTo(rx-h*.08,ry+h*.1);c.fill();c.beginPath();c.moveTo(rx+h*.08,ry+h*.02);c.lineTo(rx+h*.15,ry+h*.14);c.lineTo(rx+h*.08,ry+h*.1);c.fill();circ(c,rx,ry-h*.08,h*.04,'#3b7dd8');
  if(T>.6){arrow(c,rx+w*.14,ry+h*.1,rx+w*.14,ry-h*.05,'rgba(120,220,255,.95)',3);label(c,'push up',rx+w*.2,ry+h*.02,{size:11});arrow(c,rx-w*.14,ry-h*.05,rx-w*.14,ry+h*.1,'rgba(255,170,90,.95)',3);label(c,'gas pushed down',rx-w*.22,ry+h*.02,{size:11});}
  label(c,'every push has an equal push back',w*.5,h*.1);}};

scenes.float={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#e9f5ff','#cfe9ff');const wy=h*.45;c.fillStyle=grad(c,0,wy,0,h,['#4aa3e8','#1f5fa8']);c.fillRect(0,wy,w,h-wy);c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=3;c.beginPath();for(let x=0;x<=w;x+=4){const y=wy+Math.sin(x*.03+t*2)*4;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  // boat
  const bx=w*.3,by=wy+Math.sin(t*2)*3;c.fillStyle='#8a4a2b';c.beginPath();c.moveTo(bx-60,by-6);c.lineTo(bx+60,by-6);c.lineTo(bx+40,by+22);c.lineTo(bx-40,by+22);c.closePath();c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(bx,by-6);c.lineTo(bx,by-70);c.lineTo(bx+44,by-20);c.closePath();c.fill();
  arrow(c,bx,by+40,bx,by+8,'rgba(255,255,255,.9)',3);label(c,'water pushes up',bx+w*.13,by+36,{size:11});
  // stone sinking
  const T=t%4,sx=w*.72,sy=wy+20+smooth(0,2.5,T)*(h-wy-50);ball(c,sx,sy,18,'#5a5a66');c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1.5;for(let k=0;k<3;k++){const yy=sy-20-((t*40+k*20)%60);if(yy>wy)circ(c,sx+(k-1)*8,yy,2.5,'rgba(255,255,255,.6)');}
  label(c,'light for its size: floats',bx,h*.14);label(c,'heavy for its size: sinks',sx,h*.14);}};

scenes.heat={init(r){return{sm:Array.from({length:40},()=>({u:r(),o:r()-.5}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#fff4e6','#f6e3c8');const cx=w*.33,cy=h*.6;rrect(c,cx-50,cy-40,100,90,10,'#d9463a');c.strokeStyle='#d9463a';c.lineWidth=10;c.beginPath();c.arc(cx+62,cy+5,22,-1.2,1.2);c.stroke();c.fillStyle='#7a2a20';c.beginPath();c.ellipse(cx,cy-40,50,10,0,0,TAU);c.fill();
  for(const p of s.sm){const u=(p.u+t*.25)%1;c.fillStyle='rgba(120,120,140,'+(.35*(1-u))+')';circ(c,cx+p.o*60+Math.sin(u*6+p.o*9)*10,cy-50-u*h*.42,6+u*14,c.fillStyle);}
  // thermometer
  const tx=w*.72,ty=h*.2,TH=h*.6;rrect(c,tx-10,ty,20,TH,10,'#fff');c.strokeStyle='#999';c.lineWidth=1.5;c.strokeRect(tx-10,ty,20,TH);const lvl=.35+.3*(.5+.5*Math.sin(t*.8));c.fillStyle='#d9463a';c.fillRect(tx-5,ty+TH*(1-lvl),10,TH*lvl);circ(c,tx,ty+TH+4,18,'#d9463a');for(let k=0;k<8;k++){c.fillStyle='#777';c.fillRect(tx+12,ty+k*TH/8+6,8,2);}
  // heat arrows
  for(let k=0;k<3;k++){const u=((t*.5+k/3)%1);c.globalAlpha=1-u;arrow(c,cx+80,cy-10+k*14,cx+80+u*(tx-cx-110),cy-10+k*14,'rgba(255,120,60,1)',2.5);}c.globalAlpha=1;
  label(c,'heat moves from hot to cold',w*.5,h*.1);}};

scenes.lightning={init(r){return{r,seed:0,drops:Array.from({length:160},()=>({x:r(),y:r(),s:.6+r()}))};},
 draw(c,w,h,t,s,v){const fl=(t%3)<.15;sky(c,w,h,fl?'#3a3f5c':'#1a1d2e',fl?'#2a2f45':'#0e1020');ground(c,w,h,h*.85,'#1d2a1d','#0d140d');
  cloud(c,w*.5,h*.22,w*.14,'#3b3f55');cloud(c,w*.3,h*.26,w*.1,'#2f3347');cloud(c,w*.72,h*.25,w*.11,'#2f3347');
  for(const d of s.drops){const y=((d.y+t*d.s*.5)%1);if(y*h>h*.3){c.strokeStyle='rgba(170,190,230,.5)';c.lineWidth=1.2;c.beginPath();c.moveTo(d.x*w,y*h);c.lineTo(d.x*w-2,y*h+10);c.stroke();}}
  if(fl){const r=rng(Math.floor(t/3)*7+1);let x=w*.5,y=h*.3;glow(c,x,y+h*.3,h*.5,'200,210,255',.5);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(x,y);while(y<h*.85){x+=(r()-.5)*40;y+=18+r()*16;c.lineTo(x,y);if(r()<.25){c.moveTo(x,y);c.lineTo(x+(r()-.5)*70,y+30);c.moveTo(x,y);}}c.stroke();}
  label(c,'static charge builds in the cloud',w*.5,h*.08,{size:11});label(c,fl?'FLASH! it jumps to the ground':'count the seconds until the thunder',w*.5,h*.94);}};

scenes.rainbow={init(r){return{drops:Array.from({length:120},()=>({x:r(),y:r(),s:.6+r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#6fa8dc','#cfe6ff');sun(c,w*.1,h*.15,h*.09,t);ground(c,w,h,h*.8,'#7cc36b','#4f9a46');
  const cols=['#ff3b3b','#ff8c1a','#ffe23b','#3ddc5a','#2bb3ff','#4b5bff','#9b4dff'];const cx=w*.6,cy=h*.85,R=h*.62;cols.forEach((col,i)=>{c.strokeStyle=col;c.globalAlpha=.75;c.lineWidth=h*.03;c.beginPath();c.arc(cx,cy,R-i*h*.03,Math.PI,TAU);c.stroke();});c.globalAlpha=1;
  for(const d of s.drops){const y=((d.y+t*d.s*.4)%1);if(d.x>.35){c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.3;c.beginPath();c.moveTo(d.x*w,y*h*.8);c.lineTo(d.x*w-1,y*h*.8+8);c.stroke();}}
  cloud(c,w*.8,h*.18,w*.1);tree(c,w*.2,h*.82,h*.3);label(c,'sun behind you + rain in front = rainbow',w*.5,h*.94);}};

scenes.shadow={init(r){return{};},
 draw(c,w,h,t,s,v){const T=(t%10)/10;const a=Math.PI*(1-T);const sx=w*.5+Math.cos(a)*w*.42,sy=h*.78-Math.sin(a)*h*.62;const day=Math.sin(a);sky(c,w,h,day>.3?'#8fd0ff':'#f3a65b',day>.3?'#dff1ff':'#ffd9a8');ground(c,w,h,h*.78,'#7cc36b','#4f9a46');sun(c,sx,sy,h*.08,t);
  const tx=w*.5,ty=h*.78;const len=Math.min(w*.45,h*.3/Math.max(.12,Math.tan(Math.max(.1,a>Math.PI/2?Math.PI-a:a))));const dir=sx>tx?-1:1;
  c.fillStyle='rgba(20,30,20,.45)';c.beginPath();c.moveTo(tx-8,ty);c.lineTo(tx+dir*len,ty+6);c.lineTo(tx+dir*len*1.05,ty+14);c.lineTo(tx+8,ty+2);c.closePath();c.fill();
  person(c,tx,ty,h*.36,'#3b7dd8',0,{});label(c,T<.5?'morning: long shadow, then shorter':'afternoon: the shadow grows again',w*.5,h*.1);}};

scenes.echo={init(r){return{st:mkstars(r,80)};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#0b0f22','#04060f');stars(c,w,h,s.st,t);c.fillStyle='#3a3a44';c.fillRect(w*.86,0,w*.14,h);c.fillStyle='#2a2a32';for(let y=0;y<h;y+=18)c.fillRect(w*.86,y,w*.14,2);
  const bx=w*.25,by=h*.45+Math.sin(t*3)*8;c.fillStyle='#5a4a7a';c.beginPath();c.ellipse(bx,by,16,10,0,0,TAU);c.fill();const fl=Math.sin(t*12)*.5;for(const sg of[1,-1]){c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx+sg*40,by-30*fl-10,bx+sg*70,by-10*fl);c.quadraticCurveTo(bx+sg*40,by+8,bx,by+6);c.fill();}circ(c,bx-5,by-3,2,'#fff');circ(c,bx+5,by-3,2,'#fff');
  const T=t%2;for(let k=0;k<3;k++){const u=((T+k*.3)%2);let R,alpha,cx;if(u<1){R=u*(w*.6);cx=bx;alpha=1-u*.5;c.strokeStyle='rgba(255,220,120,'+alpha*.8+')';c.beginPath();c.arc(cx,by,R,-.7,.7);c.stroke();}else{R=(u-1)*(w*.6);cx=w*.86;c.strokeStyle='rgba(120,200,255,'+(1-(u-1))*.8+')';c.beginPath();c.arc(cx,by,R,Math.PI-.7,Math.PI+.7);c.stroke();}c.lineWidth=2.5;}
  label(c,'a squeak goes out...',w*.4,h*.12,{col:'#ffe08a'});label(c,'...and bounces back: an echo',w*.5,h*.9,{col:'#a9e8ff'});}};

scenes.wing={init(r){return{p:Array.from({length:14},(_,i)=>({y:i/14}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#9fd3ff','#e8f5ff');cloud(c,w*.15+((t*20)%w*.2),h*.2,w*.08);const cx=w*.5,cy=h*.55,L=w*.46;
  // streamlines
  c.lineWidth=2;for(const p of s.p){const y0=h*.1+p.y*h*.8;c.strokeStyle='rgba(60,110,200,.7)';c.beginPath();for(let x=0;x<=w;x+=6){const u=(x-(cx-L/2))/L;let y=y0;if(u>0&&u<1){const d=y0-cy;const bump=Math.sin(u*Math.PI)*h*.14*(d<0?1.5:.6)*Math.exp(-Math.abs(d)/(h*.25));y=y0-(d<0?bump:-bump*.4);}x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
   const dash=((t*120+p.y*300)%w);c.fillStyle=p.y<.5?'#ff7a45':'#3b7dd8';let u=(dash-(cx-L/2))/L,y=y0;if(u>0&&u<1){const d=y0-cy;const bump=Math.sin(u*Math.PI)*h*.14*(d<0?1.5:.6)*Math.exp(-Math.abs(d)/(h*.25));y=y0-(d<0?bump:-bump*.4);}circ(c,dash,y,3,c.fillStyle);}
  c.fillStyle='#eef0f4';c.strokeStyle='#8a8f98';c.lineWidth=2;c.beginPath();c.moveTo(cx-L/2,cy);c.bezierCurveTo(cx-L*.3,cy-h*.2,cx+L*.2,cy-h*.14,cx+L/2,cy);c.bezierCurveTo(cx+L*.1,cy+h*.03,cx-L*.3,cy+h*.04,cx-L/2,cy);c.fill();c.stroke();
  arrow(c,cx,cy+h*.06,cx,cy-h*.3,'rgba(220,60,40,.95)',4);label(c,'LIFT',cx+40,cy-h*.2,{col:'#ffb59a',bold:1});label(c,'air over the top speeds up and the wing is pushed up',w*.5,h*.92);}};

scenes.pulley={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#fbf6ec','#efe6d6');c.fillStyle='#6b4a2b';c.fillRect(0,h*.06,w,12);const px=w*.5,py=h*.2;const u=.5+.5*Math.sin(t*.8);
  circ(c,px,py,h*.09,'#8a8f98');circ(c,px,py,h*.03,'#3b3f48');c.fillStyle='#6b4a2b';c.fillRect(px-6,h*.06,12,h*.08);
  const ly=h*.42+u*h*.3,hy=h*.42+(1-u)*h*.3+h*.1;c.strokeStyle='#c98a2e';c.lineWidth=3;c.beginPath();c.moveTo(px-h*.09,py);c.lineTo(px-h*.09,ly-30);c.moveTo(px+h*.09,py);c.lineTo(px+h*.09,hy-h*.36);c.stroke();
  rrect(c,px-h*.09-40,ly-30,80,60,6,'#d9463a');label(c,'load',px-h*.09,ly,{box:false,bold:1});
  person(c,px+h*.09,hy+h*.02,h*.4,'#3b7dd8',t,{arms:1});arrow(c,px+h*.09+50,hy-h*.3,px+h*.09+50,hy-h*.1,'rgba(60,60,80,.8)',3);label(c,'pull down',px+h*.09+110,hy-h*.2,{size:11});arrow(c,px-h*.09-70,ly+10,px-h*.09-70,ly-40,'rgba(60,60,80,.8)',3);label(c,'load goes up',px-h*.09-150,ly-15,{size:11});
  label(c,'a pulley changes the direction of your pull',w*.5,h*.94);}};

/* ============ CHEMISTRY ============ */
scenes.states={init(r,v){return{p:Array.from({length:48},(_,i)=>({x:(i%8)/8,y:Math.floor(i/8)/6,dx:r()-.5,dy:r()-.5,ph:r()*TAU}))};},
 draw(c,w,h,t,s,v){const st=(v&&v.state)||['solid','liquid','gas'][Math.floor(t/4)%3];sky(c,w,h,'#f4f7ff','#dde6f5');const bx=w*.25,by=h*.15,bw=w*.5,bh=h*.7;c.strokeStyle='#5a6a80';c.lineWidth=3;c.strokeRect(bx,by,bw,bh);
  s.p.forEach((p,i)=>{let x,y;if(st==='solid'){x=bx+bw*.18+p.x*bw*.64+Math.sin(t*9+p.ph)*2;y=by+bh*.4+p.y*bh*.55+Math.cos(t*9+p.ph)*2;}
   else if(st==='liquid'){x=bx+bw*.1+((p.x*bw*.8+Math.sin(t*1.2+p.ph)*20+bw)%(bw*.8));y=by+bh*.45+((p.y*bh*.5+Math.cos(t*1.5+p.ph)*10+bh)%(bh*.5));}
   else{x=bx+((p.x*bw+p.dx*t*60+bw*4)%bw);y=by+((p.y*bh+p.dy*t*60+bh*4)%bh);}
   ball(c,x,y,h*.03,st==='solid'?'#3b7dd8':st==='liquid'?'#2bb3ff':'#9b4dff');});
  label(c,st.toUpperCase()+(st==='solid'?': packed tight, just jiggling':st==='liquid'?': sliding past each other':': flying free and far apart'),w*.5,h*.08,{bold:1});
  label(c,'the same water molecules, three ways',w*.5,h*.94,{size:11});}};

scenes.molecule={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#101a2a','#0a1220');const cx=w*.5,cy=h*.52,R=h*.2;const a=t*.5;
  function atom(x,y,r,col,txt){glow(c,x,y,r*1.8,col==='#d9463a'?'220,70,58':'230,230,240',.35);ball(c,x,y,r,col);label(c,txt,x,y,{box:false,size:r*.9,bold:1,col:col==='#d9463a'?'#fff':'#223'});}
  const hx1=cx+Math.cos(a+.9)*R*1.5,hy1=cy+Math.sin(a+.9)*R*.7,hx2=cx+Math.cos(a-.9)*R*1.5,hy2=cy+Math.sin(a-.9)*R*.7;
  c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=8;c.beginPath();c.moveTo(cx,cy);c.lineTo(hx1,hy1);c.moveTo(cx,cy);c.lineTo(hx2,hy2);c.stroke();
  atom(hx1,hy1,R*.42,'#eef',"H");atom(hx2,hy2,R*.42,'#eef',"H");atom(cx,cy,R*.7,'#d9463a','O');
  label(c,'H₂O: two hydrogens holding hands with one oxygen',w*.5,h*.1);label(c,'a molecule of water',w*.5,h*.92,{size:11});}};

scenes.reaction={init(r){return{b:Array.from({length:40},()=>({x:r(),u:r(),s:.5+r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#f7f3ea','#e9e2d2');const bx=w*.5,by=h*.9,bw=w*.26,bh=h*.6;const T=t%6,mix=smooth(1.5,4,T);
  // beaker
  c.fillStyle='rgba(255,255,255,.5)';c.fillRect(bx-bw/2,by-bh,bw,bh);const liq=by-bh*.55;c.fillStyle=`rgb(${Math.round(lerp(120,230,mix))},${Math.round(lerp(190,120,mix))},${Math.round(lerp(255,80,mix))})`;c.fillRect(bx-bw/2+3,liq,bw-6,bh*.55-3);
  c.strokeStyle='#5a6a80';c.lineWidth=3;c.beginPath();c.moveTo(bx-bw/2,by-bh);c.lineTo(bx-bw/2,by);c.lineTo(bx+bw/2,by);c.lineTo(bx+bw/2,by-bh);c.stroke();
  if(T<2.5){const u=T/2.5;const dx=bx-bw*.6+u*bw*.6,dy=by-bh*1.3+u*(liq-(by-bh*1.3));c.fillStyle='#e8a33a';c.beginPath();c.ellipse(bx-bw*.8,by-bh*1.25,30,12,.5,0,TAU);c.fill();for(let k=0;k<4;k++)circ(c,dx+k*3,dy-k*12,4,'#e8a33a');}
  if(mix>0){for(const b of s.b){const u=(b.u+t*.5*b.s)%1;circ(c,bx-bw/2+8+b.x*(bw-16),liq+(bh*.55)*(1-u)-6,3+u*4,'rgba(255,255,255,'+(.8*mix*(1-u))+')');}}
  label(c,mix<.5?'pour one liquid into another...':'...a new substance: colour changes, bubbles rise',w*.5,h*.1);label(c,'a chemical reaction makes something new',w*.5,h*.97,{size:11});}};

scenes.candle={init(r){return{};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#1a1410','#0a0806');const cx=w*.5,top=h*.45;glow(c,cx,top-h*.1,h*.5,'255,170,80',.35);rrect(c,cx-h*.09,top,h*.18,h*.5,6,'#f3e9d2');c.fillStyle='#e6d8ba';c.beginPath();c.ellipse(cx,top,h*.09,h*.025,0,0,TAU);c.fill();c.fillStyle='#333';c.fillRect(cx-2,top-h*.07,4,h*.07);
  const fl=1+.08*Math.sin(t*14)+.05*Math.sin(t*23);c.save();c.translate(cx,top-h*.07);c.scale(1,fl);c.fillStyle='#ff9a2e';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(h*.07,-h*.08,0,-h*.22);c.quadraticCurveTo(-h*.07,-h*.08,0,0);c.fill();c.fillStyle='#fff3a8';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(h*.035,-h*.05,0,-h*.13);c.quadraticCurveTo(-h*.035,-h*.05,0,0);c.fill();c.fillStyle='#3b7dd8';c.beginPath();c.ellipse(0,-h*.015,h*.03,h*.02,0,0,TAU);c.fill();c.restore();
  for(let k=0;k<3;k++){const u=((t*.3+k/3)%1);arrow(c,cx-w*.3+k*0,top+h*.1-u*h*.3,cx-h*.12,top-h*.1-u*h*.1,'rgba(120,200,255,'+(1-u)+')',2.5);}label(c,'oxygen from the air',cx-w*.3,top+h*.2,{size:11,col:'#a9e8ff'});
  for(let k=0;k<3;k++){const u=((t*.4+k/3)%1);c.fillStyle='rgba(200,200,220,'+(.5*(1-u))+')';circ(c,cx+Math.sin(u*8)*10,top-h*.3-u*h*.25,5+u*10,c.fillStyle);}label(c,'water vapour + carbon dioxide',cx+w*.26,top-h*.3,{size:11});
  label(c,'burning is a reaction: wax + oxygen → heat, light, new gases',w*.5,h*.95,{size:11});}};

scenes.dissolve={init(r){return{p:Array.from({length:70},()=>({x:r(),y:r(),u:r()}))};},
 draw(c,w,h,t,s,v){sky(c,w,h,'#f7f3ea','#e9e2d2');const bx=w*.5,by=h*.9,bw=w*.3,bh=h*.62,liq=by-bh*.6;c.fillStyle='rgba(120,190,255,.45)';c.fillRect(bx-bw/2+3,liq,bw-6,bh*.6-3);c.strokeStyle='#5a6a80';c.lineWidth=3;c.beginPath();c.moveTo(bx-bw/2,by-bh);c.lineTo(bx-bw/2,by);c.lineTo(bx+bw/2,by);c.lineTo(bx+bw/2,by-bh);c.stroke();
  const T=t%7,f=smooth(.5,5.5,T);const sx=bx,sy=by-14;for(const p of s.p){const tx=bx-bw/2+10+p.x*(bw-20),ty=liq+8+p.y*(bh*.6-20);const x=lerp(sx+(p.x-.5)*40,tx,ease(clamp((f-p.u*.6)/.4,0,1))),y=lerp(sy-(p.y)*22,ty,ease(clamp((f-p.u*.6)/.4,0,1)));c.fillStyle='rgba(255,255,255,'+(.95-.4*f)+')';c.fillRect(x-2,y-2,4,4);}
  if(T<2.5){const u=T/2.5;c.fillStyle='#8a8f98';c.fillRect(bx+bw*.25-u*bw*.3,by-bh*1.1,70,16);}
  label(c,f<.3?'a spoon of salt drops in':f<.9?'the water pulls the grains apart...':'...until they are too small to see: dissolved',w*.5,h*.1);label(c,'it is still there: taste it!',w*.5,h*.97,{size:11});}};

return{scenes,h:H};})();
