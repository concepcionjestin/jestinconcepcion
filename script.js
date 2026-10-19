/* Original procedural racing-game scene. No external libraries or image requests. */
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d');
const drive=document.querySelector('.drive');
let W=0,H=0,DPR=1,progress=0,raf=0;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=canvas.clientWidth;H=canvas.clientHeight;canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);draw()}
function path(t){ // t=0 foreground, t=1 distant mountain curve
  const x=W*(.53 + .14*Math.sin(t*3.0) + .055*Math.sin(t*8.5));
  const y=H*(.94-.60*t);return {x,y};
}
function roadWidth(t){return W*(.50*Math.pow(1-t,1.35)+.014)}
function line(points,color,width,blur=0){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.stroke();ctx.shadowBlur=0}
function sky(){let g=ctx.createLinearGradient(0,0,0,H*.75);g.addColorStop(0,'#030916');g.addColorStop(.58,'#14233c');g.addColorStop(1,'#8c4255');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#fcb19b';ctx.globalAlpha=.1;ctx.fillRect(0,H*.33,W,H*.1);ctx.globalAlpha=1}
function mountains(){ctx.fillStyle='#091525';ctx.beginPath();ctx.moveTo(0,H*.44);for(let x=0;x<=W+20;x+=25){let y=H*(.44+.045*Math.sin(x/W*12)+.07*Math.sin(x/W*4+1));ctx.lineTo(x,y)}ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();ctx.fillStyle='#0b1b2b';ctx.beginPath();ctx.moveTo(0,H*.53);for(let x=0;x<=W+20;x+=20){ctx.lineTo(x,H*(.55+.05*Math.sin(x/W*10+2)))}ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill()}
function forest(){let seed=27;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}for(let i=0;i<160;i++){let side=i%2===0?-1:1;let t=rand();let p=path(t),w=roadWidth(t);let x=p.x+side*(w*.65+rand()*W*.20),y=p.y+(rand()-.5)*H*.09;let size=lerp(5,75,1-t)*(0.5+rand());ctx.fillStyle=i%3?'#081623':'#1b2d3e';ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x-size*.33,y+size*.12);ctx.lineTo(x+size*.33,y+size*.12);ctx.fill();ctx.fillStyle='#b2c2d0';ctx.globalAlpha=.22;ctx.fillRect(x-size*.16,y-size*.17,size*.25,2);ctx.globalAlpha=1}}
function roadway(){let left=[],right=[],middle=[];for(let i=0;i<=110;i++){let t=i/110,p=path(t),w=roadWidth(t);left.push({x:p.x-w*.53,y:p.y});right.push({x:p.x+w*.53,y:p.y});middle.push(p)}ctx.beginPath();left.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));right.reverse().forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();let g=ctx.createLinearGradient(0,H*.4,0,H);g.addColorStop(0,'#17202c');g.addColorStop(1,'#0a101a');ctx.fillStyle=g;ctx.fill();line(left,'#c2ced8',3);line(right,'#b8c6d4',3);ctx.setLineDash([22,25]);line(middle,'#bb9154',2);ctx.setLineDash([]);for(let t=.05;t<1;t+=.07){let p=path(t),w=roadWidth(t);ctx.fillStyle='#e3d5ba';ctx.globalAlpha=.5*(1-t);ctx.fillRect(p.x+w*.57,p.y,Math.max(1,4*(1-t)),Math.max(2,12*(1-t)))}ctx.globalAlpha=1}
function trail(){if(progress<=.16)return;const points1=[],points2=[];let driveProgress=clamp((progress-.16)/.84);let head=.07+driveProgress*.87;for(let i=0;i<=180;i++){let t=.01+(head-.01)*i/180,p=path(t),w=roadWidth(t);points1.push({x:p.x-w*.11,y:p.y});points2.push({x:p.x+w*.11,y:p.y})}const alpha=clamp((progress-.16)*6);ctx.globalAlpha=alpha;line(points1,'#ff1645',Math.max(2,W*.003),17);line(points2,'#ff1645',Math.max(2,W*.003),17);line(points1,'#ffc2ca',Math.max(1,W*.0009),2);line(points2,'#ffc2ca',Math.max(1,W*.0009),2);ctx.globalAlpha=1}
// Custom generic performance coupe, entering after the user starts scrolling.
function car(){
  // The homepage starts with an empty road. At 5% scroll the coupe
  // sweeps in from the lower-left, merges onto the road, then drives away.
  if(progress<=.045)return;
  const entrance=clamp((progress-.045)/.15);
  const eased=1-Math.pow(1-entrance,3);
  const driveProgress=clamp((progress-.16)/.84);
  const t=.045+driveProgress*.78;
  const pos=path(t), road=roadWidth(t);
  const size=Math.max(30,Math.min(W*.29,road*.63));
  const next=path(Math.min(.99,t+.025));
  const curveAngle=Math.atan2(next.x-pos.x,pos.y-next.y)*.26;
  const entryX=-W*.28;
  const x=lerp(entryX,pos.x,eased);
  const y=lerp(H*1.16,pos.y-size*.07,eased);
  const angle=lerp(-.32,curveAngle,eased);
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  const scale=size/300;ctx.scale(scale,scale);
  // Contact shadow and red reflected light
  ctx.fillStyle='#000b';ctx.beginPath();ctx.ellipse(0,10,155,26,0,0,Math.PI*2);ctx.fill();
  let reflection=ctx.createRadialGradient(0,3,3,0,18,130);
  reflection.addColorStop(0,'#ff244d99');reflection.addColorStop(1,'#ff244d00');
  ctx.fillStyle=reflection;ctx.fillRect(-150,-25,300,140);
  // Rear wheels
  ctx.fillStyle='#06070a';ctx.fillRect(-143,-57,32,69);ctx.fillRect(111,-57,32,69);
  // Body silhouette
  const paint=ctx.createLinearGradient(0,-155,0,8);
  paint.addColorStop(0,'#8292a4');paint.addColorStop(.35,'#25364c');paint.addColorStop(.75,'#101b2a');paint.addColorStop(1,'#03070d');
  ctx.beginPath();ctx.moveTo(-140,-35);ctx.lineTo(-132,-92);ctx.quadraticCurveTo(-115,-114,-89,-117);
  ctx.lineTo(-67,-153);ctx.quadraticCurveTo(0,-174,67,-153);ctx.lineTo(89,-117);
  ctx.quadraticCurveTo(115,-114,132,-92);ctx.lineTo(140,-35);
  ctx.quadraticCurveTo(139,-4,110,0);ctx.lineTo(-110,0);
  ctx.quadraticCurveTo(-139,-4,-140,-35);ctx.closePath();ctx.fillStyle=paint;ctx.fill();
  ctx.strokeStyle='#a3b1bf';ctx.lineWidth=2;ctx.stroke();
  // Rear window
  ctx.beginPath();ctx.moveTo(-68,-145);ctx.quadraticCurveTo(0,-160,68,-145);
  ctx.lineTo(86,-109);ctx.quadraticCurveTo(0,-119,-86,-109);ctx.closePath();
  ctx.fillStyle='#050b15';ctx.fill();ctx.strokeStyle='#526779';ctx.stroke();
  // Sleek ducktail spoiler instead of an oversized race wing
  ctx.fillStyle='#0b1421';
  ctx.beginPath();ctx.moveTo(-132,-115);ctx.quadraticCurveTo(0,-134,132,-115);
  ctx.lineTo(122,-105);ctx.quadraticCurveTo(0,-119,-122,-105);ctx.closePath();ctx.fill();
  // Razor-thin LED taillights, bright red with bloom
  ctx.shadowColor='#ff1644';ctx.shadowBlur=23;ctx.strokeStyle='#ff1d4b';ctx.lineWidth=11;
  ctx.beginPath();ctx.moveTo(-123,-75);ctx.lineTo(-85,-75);ctx.lineTo(-61,-65);ctx.stroke();
  ctx.beginPath();ctx.moveTo(123,-75);ctx.lineTo(85,-75);ctx.lineTo(61,-65);ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle='#ffc1cc';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-123,-75);ctx.lineTo(-85,-75);ctx.lineTo(-61,-65);ctx.moveTo(123,-75);ctx.lineTo(85,-75);ctx.lineTo(61,-65);ctx.stroke();
  // Rear diffuser, license plate, exhaust
  ctx.fillStyle='#02050a';ctx.fillRect(-114,-31,228,23);
  ctx.fillStyle='#253347';ctx.fillRect(-29,-56,58,20);
  ctx.fillStyle='#b6c5d4';ctx.fillRect(-24,-52,48,11);
  ctx.fillStyle='#111';ctx.fillRect(-108,-24,24,12);ctx.fillRect(84,-24,24,12);
  ctx.strokeStyle='#8796a3';ctx.lineWidth=3;ctx.strokeRect(-108,-24,24,12);ctx.strokeRect(84,-24,24,12);
  ctx.restore();
}
function draw(){if(!W||!H)return;ctx.clearRect(0,0,W,H);sky();mountains();forest();roadway();trail();car();let vignette=ctx.createRadialGradient(W*.5,H*.5,H*.12,W*.5,H*.5,W*.85);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#000000b8');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H)}
function scroll(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const length=drive.offsetHeight-innerHeight;progress=clamp(-drive.getBoundingClientRect().top/Math.max(1,length));draw()})}
addEventListener('scroll',scroll,{passive:true});addEventListener('resize',()=>{resize();scroll()});document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b===btn));document.querySelectorAll('.cards article').forEach(card=>card.hidden=btn.dataset.filter!=='all'&&!card.dataset.tags.split(' ').includes(btn.dataset.filter))}));
resize();scroll();
