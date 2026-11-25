'use strict';
/* Turbo Maths Racing: endless road drawn by the game, scenery objects scrolling on both sides.
   The kart drives by itself; the three answers come down the road; driving over the right one gives a star. */
const $=id=>document.getElementById(id),c=$('canvas'),g=c.getContext('2d'),W=1200,H=675,HY=270,FAR=850,NEAR=18,LOOP=4800;
const names=['palmier-1','palmier-2','cabane','maison-plage','hibiscus','cascade','rocher-plage','parasol','arbre-1','arbre-2','chalet','fleurs','rocher','cypres','cloture','lanterne','fond-plage','fond-campagne','fond-cascades','kart'];
const images={};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mod=(v,n)=>((v%n)+n)%n,lisse=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const QUESTIONS=10;
const zoneAt=p=>Math.floor(mod(p,LOOP)/1200);
const labels=['🌴 Plage tropicale','🏡 Village côtier','💦 Cascades tropicales','🌺 Jungle fleurie'];
// Far background of each zone (only the sky and the horizon are shown, above the road)
const fonds=['fond-plage','fond-plage','fond-cascades','fond-campagne'];
const heights={'palmier-1':115,'palmier-2':85,cabane:95,'maison-plage':105,hibiscus:27,cascade:130,'rocher-plage':30,parasol:48,'arbre-1':105,'arbre-2':110,chalet:110,fleurs:28,rocher:35,cypres:95,cloture:22,lanterne:53};
const objects=[];let seed=821;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function add(z,side,name,offset,scale=1){objects.push({z:mod(z,LOOP),side,name,offset,scale});}
const buildings=[[210,1,'cabane'],[940,-1,'maison-plage'],[1800,1,'cabane'],[3550,-1,'maison-plage'],[4340,1,'chalet']];
for(const [z,side,name] of buildings)add(z,side,name,2.3,1.1);
for(let z=45;z<LOOP;z+=23){for(const side of [-1,1]){
 const beach=z<1200, jungle=!beach && (Math.sin(z/180+side)>-.45 || z>=2400&&z<3600);
 const near=beach?['hibiscus','rocher-plage','palmier-2','parasol']:['hibiscus','fleurs','rocher','rocher-plage','palmier-2'];
 if(rand()<(beach?.60:.85))add(z+rand()*12,side,near[Math.floor(rand()*near.length)],1.24+rand()*.48,.65+rand()*.65);
 if(rand()<(jungle?.95:.45)){const trees=beach?['palmier-1','palmier-2']:['palmier-1','palmier-2','arbre-1','arbre-2'];add(z+rand()*15,side,trees[Math.floor(rand()*trees.length)],2.1+rand()*1.7,.8+rand()*.7);}
 if(jungle&&rand()<.85)add(z+rand()*18,side,['arbre-1','palmier-2','fleurs','hibiscus'][Math.floor(rand()*4)],3.4+rand()*2.4,1.1+rand()*.65);
 if(beach&&rand()<.22)add(z,side,'cloture',1.1);
}}
for(let z=1250;z<4650;z+=11){for(const side of [-1,1]){if(Math.sin(z/160+side)>-.65){add(z+rand()*8,side,['hibiscus','fleurs','rocher','palmier-2'][Math.floor(rand()*4)],1.55+rand()*1.2,.7+rand()*.65);}}}
// Disperse existing vegetation across the grassy areas, leaving irregular clearings.
for (const o of objects) {
 if (o.z<1200 || !['palmier-1','palmier-2','arbre-1','arbre-2','rocher','rocher-plage','hibiscus','fleurs'].includes(o.name)) continue;
 const r=rand();
 if (r<.48) o.offset=2.0+rand()*3.9;
 else if(r<.72) o.offset=1.35+rand()*.8;
}
// A few mixed natural clusters farther from the road, not continuous rows.
for(let z=1300;z<4600;z+=85+rand()*95){
 const side=rand()<.5?-1:1, center=3.1+rand()*1.7;
 for(let i=0;i<3;i++)add(z+rand()*34,side,['rocher','fleurs','hibiscus','palmier-2','arbre-1'][Math.floor(rand()*5)],center+(rand()-.5)*1.5,.7+rand()*.4);
}
// Additional inland vegetation only; existing roadside objects remain untouched.
for(let z=25;z<LOOP;z+=38+rand()*25){
 for(const side of [-1,1]){
  const beach=z<1200;
  if(rand()<(beach?.72:.92)){
   const center=4.0+rand()*3.8;
   const tree=beach?['palmier-1','palmier-2']:['arbre-1','arbre-2','palmier-1','palmier-2'];
   add(z,side,tree[Math.floor(rand()*tree.length)],center,.85+rand()*.45);
   for(let i=0;i<4;i++){
    const plants=['hibiscus','fleurs','rocher-plage','rocher','palmier-2'];
    add(z+rand()*22-11,side,plants[Math.floor(rand()*plants.length)],Math.max(3.2,center+(rand()-.5)*2.2),.65+rand()*.55);
   }
  }
 }
}
// Restore prominent tropical huts without moving any existing vegetation.
for(const [z,side,offset] of [[480,-1,2.7],[1450,-1,2.6],[2450,1,2.8],[3100,-1,2.7],[4000,1,2.8]]){
 add(z,side,'cabane',offset,1.65);
}
// Keep original huts visible above nearby low vegetation.
for(const o of objects)if(o.name==='cabane')o.scale=Math.max(o.scale,1.65);
// One distant waterfall panorama, revealed only in the jungle section.
// Continuous periodic road curvature. No scene resets or image overlays.

// ---------- Road geometry ----------
// Continuous periodic road curvature
function bend(z){return 120*Math.sin(z*Math.PI*2/1200)+55*Math.sin(z*Math.PI*2/2400)}
let pos=0;
function project(d,x=0){const t=NEAR/Math.max(NEAR,d),y=HY+(H-HY)*t,half=18+555*t;const curve=(bend(pos+d)-bend(pos))*0.75*(1-t);return {x:W/2+curve+x*half,y,half,t}}
// Distance ahead of a screen row (inverse of project)
const distEcran=y=>NEAR*(H-HY)/Math.max(1,y-HY);
function polygon(points,fill){g.fillStyle=fill;g.beginPath();g.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))g.lineTo(p.x,p.y);g.closePath();g.fill()}

// ---------- Background: sky and horizon of the zone, grass in moving bands ----------
function fond(nom,alpha){
 const im=images[nom],h=HY/0.6,w=h*im.width/im.height;
 // The horizon of the picture (60% of its height) is on the horizon of the road; it slides a little with the curves
 const x=(W-w)/2-clamp(bend(pos)*.35,-(w-W)/2,(w-W)/2);
 g.globalAlpha=alpha;g.drawImage(im,0,0,im.width,im.height*.6,x,0,w,HY);g.globalAlpha=1;
}
function drawBackground(){
 const z=zoneAt(pos),f=mod(pos,1200),suivant=(z+1)%4;
 fond(fonds[z],1);
 // Last 200 m of a zone: the next horizon appears slowly (very far away, not noticeable)
 if(f>1000&&fonds[suivant]!==fonds[z])fond(fonds[suivant],lisse((f-1000)/200));
 // Grass: light and dark bands that come toward the kart (same rhythm as the road)
 for(let y=HY;y<H;y+=2){
  const d=distEcran(y+1),clair=Math.floor((pos+d)/9)%2===0,brume=clamp((d-120)/600,0,.55);
  g.fillStyle=clair?'#78b843':'#6aab3a';g.fillRect(0,y,W,2);
  if(brume>0){g.fillStyle=`rgba(190,220,170,${brume})`;g.fillRect(0,y,W,2)}
 }
}
function road(){
 const steps=160,ds=Array.from({length:steps+1},(_,i)=>NEAR*Math.pow(FAR/NEAR,i/steps));
 const strip=(l,r,color)=>polygon([...ds.map(d=>project(d,l)),...ds.slice().reverse().map(d=>project(d,r))],color);
 strip(-1.055,1.055,'#fff3e1');strip(-1,1,'#d8a36b');
 // Segments every 6 m: darker road bands, red kerb pieces and the dashed lane lines
 for(let d=NEAR;d<FAR;){
  const end=Math.min(FAR,d+6-mod(pos+d,6)),n=Math.floor((pos+d+.001)/6);
  if(n%2===0)polygon([project(d,-1),project(end,-1),project(end,1),project(d,1)],'#d29c63');
  if(Math.floor(n/2)%2===0)for(const x of [-1,1])polygon([project(d,x),project(end,x),project(end,x*1.055),project(d,x*1.055)],'#e84e43');
  // Dashes: 6 m painted, 6 m empty, fading far away
  if(n%2===0&&d<520){g.globalAlpha=clamp((520-d)/180,0,1);for(const x of [-1/3,1/3])polygon([project(d,x-.012),project(end,x-.012),project(end,x+.012),project(d,x+.012)],'#fffaf0');g.globalAlpha=1}
  d=end+.0001;
 }
}
function sprite(o,d){const p=project(d,o.side*o.offset),im=images[o.name],h=heights[o.name]*p.t*7*(o.scale||1),w=h*im.width/im.height;const edge=project(d,o.side*1.06).x;const x=o.side<0?Math.min(p.x,edge-w*.43):Math.max(p.x,edge+w*.43);g.drawImage(im,x-w/2,p.y-h,w,h)}

// ---------- Questions ----------
let gains=0,state='loading',last=0,stars=0,bons=0,round=0,serie=0,boost=0,wave=null,feedback='',feedbackTime=0,sound=true,lecture=true,audio,debut=0;
let lane=0,target=0,kartY=H-14,penche=0,temps=0,particles=[],prochaine=0;
const KART_MIN=H-170,KART_MAX=H-14;
const keys=new Set(),used=new Set();
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
/* Levels: additions up to 10, 20, 30, 40, 50, 100; subtractions up to 10, 20, 30, 40; times tables.
   "Up to N": the sum (or the first number of a subtraction) is at most N, and above about half of the previous level. */
const NIVEAUX=[
 {op:'+',max:10,nom:'Additions jusqu’à 10'},{op:'+',max:20,nom:'Additions jusqu’à 20'},{op:'+',max:30,nom:'Additions jusqu’à 30'},
 {op:'+',max:40,nom:'Additions jusqu’à 40'},{op:'+',max:50,nom:'Additions jusqu’à 50'},{op:'+',max:100,nom:'Additions jusqu’à 100'},
 {op:'-',max:10,nom:'Soustractions jusqu’à 10'},{op:'-',max:20,nom:'Soustractions jusqu’à 20'},{op:'-',max:30,nom:'Soustractions jusqu’à 30'},
 {op:'-',max:40,nom:'Soustractions jusqu’à 40'},{op:'×',tables:[2,5,10],nom:'Tables de 2, 5 et 10'},{op:'×',tables:[1,2,3,4,5,6,7,8,9,10],nom:'Tables de 1 à 10'}];
// First level of each family is always open; the next one opens with 6 correct answers or more out of 10
const DEBUT=[0,6,10],ETOILES_POUR_OUVRIR=6;
const CLE='turbo-maths-niveaux';
function meilleurs(){try{return JSON.parse(localStorage.getItem(CLE))||{}}catch(e){return {}}}
function garder(n,e){const m=meilleurs();if(!(m[n]>=e)){m[n]=e;try{localStorage.setItem(CLE,JSON.stringify(m))}catch(err){}}}
const ouvert=n=>n>=1&&n<=NIVEAUX.length;
const medaille=e=>e>=10?'🥇':e>=8?'🥈':e>=6?'🥉':'';
function listeNiveaux(choisi){
 const m=meilleurs(),sel=$('niveau');choisi=choisi||Number(sel.value)||1;
 sel.innerHTML=NIVEAUX.map((v,i)=>{const n=i+1,e=m[n],o=ouvert(n);
  return `${DEBUT.includes(i)?(i?'</optgroup>':'')+'<optgroup label="'+({0:'Additions',6:'Soustractions',10:'Multiplications'}[i])+'">':''}<option value="${n}" ${o?'':'disabled'} ${n===choisi?'selected':''}>${o?'':'🔒 '}${n} · ${v.nom}${e!==undefined?` · ✔ ${e}/10 ${medaille(e)}`:''}</option>`}).join('')+'</optgroup>';
 if(!ouvert(choisi))sel.value='1';
 afficherNiveaux();
}
const niveau=()=>Number($('niveau').value)||1;

function afficherNiveaux(){
 const root=$('levelCards'),tabs=$('levelTabs');if(!root)return;
 const ranges=[[1,6],[7,10],[11,12]], names=['Additions','Soustractions','Multiplications'], signs=['+','−','×'];
 function show(group){
  root.replaceChildren();root.dataset.group=group;
  tabs.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===group);b.setAttribute('aria-expanded',String(i===group))});
  const heading=document.createElement('h3');heading.textContent=names[group]+' : choisis un niveau';root.append(heading);
  for(let n=ranges[group][0];n<=ranges[group][1];n++){
   const v=NIVEAUX[n-1],b=document.createElement('button');b.type='button';b.className='levelCard';
   const ex=v.max?(group===0?Math.floor(v.max*.6)+' + '+Math.floor(v.max*.3):Math.floor(v.max*.8)+' − '+Math.floor(v.max*.3)):(n===11?'5 × 2':'7 × 8');
   const best=meilleurs()[n];
   b.innerHTML='<strong>'+(v.max?'Jusqu’à '+v.max:v.nom)+'</strong><small>'+ex+' = ?</small>'+(best!==undefined?'<em class="record">'+(medaille(best)||'✔')+' '+best+'/10</em>':'')+'<span aria-hidden="true">▶</span>';
   if(best!==undefined)b.setAttribute('aria-label',(v.max?'Jusqu’à '+v.max:v.nom)+', meilleur résultat '+best+' sur 10');
   b.onclick=()=>{if(state==='loading')return;$('niveau').value=String(n);start()};root.append(b);
  }
 }
 tabs.replaceChildren();root.replaceChildren();delete root.dataset.group;
 const hint=document.createElement('p');hint.className='submenuHint';hint.textContent='← Choisis une opération';root.append(hint);
 names.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.className='opCard op'+i;b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','levelCards');b.innerHTML='<span class="opSymbol">'+signs[i]+'</span><strong>'+name+'</strong><span aria-hidden="true">›</span>';b.onpointerenter=e=>{if(e.pointerType==='mouse')show(i)};b.onclick=()=>{show(i);root.querySelector('button')?.focus()};tabs.append(b)});
}

const maths=()=>$('mode').value==='math';
function makeQuestion(){
 const N=NIVEAUX[niveau()-1],prec=NIVEAUX[niveau()-2];
 const bas=N.op!=='×'&&prec&&prec.op===N.op?Math.floor(prec.max/2)+1:N.op==='+'?2:1;
 let a,b,k,essais=0;
 do{
  if(N.op==='+'){const s=rnd(bas,N.max);a=rnd(0,s);b=s-a}
  else if(N.op==='-'){a=rnd(bas,N.max);b=rnd(0,a)}
  else{a=N.tables[rnd(0,N.tables.length-1)];b=rnd(1,10);if(Math.random()<.5)[a,b]=[b,a]}
  k=a+N.op+b;
 }while(used.has(k)&&++essais<40);
 used.add(k);
 const op=N.op,answer=op==='+'?a+b:op==='-'?a-b:a*b,opts=[answer];
 // Wrong answers like real mistakes: ±1, ±2, ±10 (tens), or a neighbouring multiple
 const proche=()=>{const r=Math.random();
  if(op==='×')return r<.6?answer+(Math.random()<.5?-1:1)*Math.min(a,b):answer+rnd(-2,2);
  if(answer>=15&&r<.35)return answer+(Math.random()<.5?-10:10);
  return answer+rnd(-3,3)};
 while(opts.length<3){const n=proche();if(n>=0&&!opts.includes(n))opts.push(n)}
 for(let i=2;i>0;i--){const j=rnd(0,i);[opts[i],opts[j]]=[opts[j],opts[i]]}
 return {a,b,op,answer,opts,text:`${a} ${op==='-'?'−':op} ${b} = ?`};
}
// French narration: prefer natural voices, with local fallback.
const synth = window.speechSynthesis;
let voix = null, parole = null, correctionEnCours = false, correctionTexte = null;
function choisirVoix(){
 if(!synth)return;
 const score=v=> (/natural|neural|premium|enhanced|online|google/i.test(v.name)?100:0)+(/^fr[-_]CA$/i.test(v.lang)?20:0)+(v.localService?5:0);
 voix=synth.getVoices().filter(v=>/^fr(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>score(b)-score(a))[0]||null;
}
if(synth){choisirVoix();synth.addEventListener('voiceschanged',choisirVoix);}
function arreterVoix(){parole=null;correctionEnCours=false;if(synth)synth.cancel();}
function parler(texte, vitesse=.85, correction=false){
 if(!lecture||!synth||!window.SpeechSynthesisUtterance)return;
 arreterVoix();if(!voix)choisirVoix();
 try{const u=new SpeechSynthesisUtterance(texte);u.lang=voix?voix.lang:'fr-CA';if(voix)u.voice=voix;u.rate=vitesse;u.pitch=1.02;u.volume=1;parole=u;correctionEnCours=correction;
 if(correction)setTimeout(()=>{if(parole===u){parole=null;correctionEnCours=false}},4000);
 u.onend=u.onerror=()=>{if(parole===u){parole=null;correctionEnCours=false;}};synth.speak(u);}catch(e){parole=null;correctionEnCours=false;}
}
function dire(q){
 const mot={'+':'plus','-':'moins','×':'fois'}[q.op];
 parler(`${q.a} ${mot} ${q.b}.`);
}
function makeWave(){
 const q=makeQuestion();wave={...q,z:pos+300,done:false,picked:-1};
 $('qtext').textContent=q.text;$('question').classList.remove('hidden');dire(q);hud();
}
function tone(f,d=.2){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),v=audio.createGain();o.frequency.value=f;v.gain.value=.05;o.connect(v);v.connect(audio.destination);o.start();v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch{}}
// Kart: distance of its wheels on the road, its x, its width
function kartGeo(){const dk=distEcran(kartY),p=project(dk,lane*2/3),larg=clamp(205*p.half/573,120,205);return {dk,x:p.x,larg}}
function sparks(good){const k=kartGeo();for(let i=0;i<22;i++)particles.push({x:k.x,y:kartY-50,vx:rnd(-190,190),vy:rnd(-260,-60),t:.8,c:good?'#ffe352':'#ff6363'})}
function answerHit(){
 const l=clamp(Math.round(lane)+1,0,2),good=wave.opts[l]===wave.answer;
 wave.done=true;wave.picked=l;round++;
 if(good){bons++;serie++;let n=10;feedback='⭐ Bravo ! +10 étoiles';tone(920);sparks(true);
  if(serie%3===0){n+=5;boost=4;feedback='⚡ TURBO ! +15 étoiles';tone(1200,.25)}
  gains+=n;garage.award(n)}
 else{serie=0;boost=0;const perte=0;
  feedback=(perte?'💥 −5 étoiles':'💥 Oups !')+` · ${wave.a} ${wave.op==='-'?'−':wave.op} ${wave.b} = ${wave.answer}`;tone(220,.24);sparks(false)}
 correctionTexte=good?(serie%3===0?"Super !":"Bravo !"):`La bonne réponse est ${wave.answer}.`;
 parler(correctionTexte,.92,true);
 feedbackTime=2;hud();
}
function drawAnswers(){
 if(!wave)return;
 const d=wave.z-pos;if(d<NEAR-6||d>FAR)return;
 const fade=d<NEAR?clamp((d-NEAR+6)/6,0,1):clamp((320-d)/30,0,1);
 g.globalAlpha=fade;
 for(let i=0;i<3;i++){
  const x=(i-1)*2/3,a=Math.max(NEAR,d-4),b=d+12;
  let fill=['#ffe68c','#a9e9ff','#ffc5e0'][i];
  if(wave.done){if(wave.opts[i]===wave.answer)fill='#7be07b';else if(i===wave.picked)fill='#ff8a8a'}
  const pts=[project(a,x-.3),project(b,x-.3),project(b,x+.3),project(a,x+.3)];
  polygon(pts,fill);g.strokeStyle='#ffffffcc';g.lineWidth=Math.max(1,pts[0].half*.012);g.beginPath();pts.forEach((p,k)=>k?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.stroke();
  const m=project(d+4,x),fs=clamp(m.half*.34,12,72);
  g.font=`900 ${fs}px system-ui`;g.textAlign='center';g.textBaseline='middle';
  g.lineWidth=Math.max(2,fs*.16);g.strokeStyle='#fff';g.strokeText(wave.opts[i],m.x,m.y);g.fillStyle='#143454';g.fillText(wave.opts[i],m.x,m.y);
 }
 g.globalAlpha=1;g.textBaseline='alphabetic';
}
function draw(){
 if(state==='loading')return;
 drawBackground();road();drawAnswers();
 const visible=objects.map(o=>({o,d:mod(o.z-pos,LOOP)})).filter(v=>v.d>=NEAR&&v.d<FAR).sort((a,b)=>b.d-a.d);
 for(const v of visible)sprite(v.o,v.d);
 // Smoke and sparks, then the kart (it shakes a little and leans when it turns)
 for(const p of particles){g.globalAlpha=clamp(p.t,0,1)*(p.fum?.7:1);g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.fum?(p.r*(1.6-p.t)):6,0,Math.PI*2);g.fill()}g.globalAlpha=1;
 const im=garage.sprite(images.kart),k=kartGeo(),h=k.larg*im.height/im.width,saut=state==='play'?Math.abs(Math.sin(temps*17))*2:0;
 g.save();g.translate(k.x,kartY-saut);g.rotate(penche*.09);g.drawImage(im,-k.larg/2,-h,k.larg,h);g.restore();
 if(boost>0)texte('⚡ TURBO',265,30,'#ffd23f','#4a1d00');
 if(feedbackTime>0)texte(feedback,215,32,'#fff4a0','#173450');
}
function texte(t,y,size,fill,stroke){g.font=`900 ${size}px system-ui`;g.textAlign='center';g.lineWidth=6;g.strokeStyle=stroke;g.strokeText(t,600,y);g.fillStyle=fill;g.fillText(t,600,y)}
function update(dt){
 if(state!=='play')return;
 temps+=dt;boost=Math.max(0,boost-dt);feedbackTime=Math.max(0,feedbackTime-dt);
 // Automatic driving; the arrows move the kart: ← → lane, ↑ ↓ up and down the road
 const v=[35,58,85][+$('speed').value]*(boost>0?1.6:1);
 pos+=v*dt;
 if(keys.has('ArrowLeft'))target-=dt*1.9;
 if(keys.has('ArrowRight'))target+=dt*1.9;
 target=clamp(target,-1,1);lane+=(target-lane)*Math.min(1,dt*14);
 if(keys.has('ArrowUp'))kartY=clamp(kartY-dt*170,KART_MIN,KART_MAX);
 if(keys.has('ArrowDown'))kartY=clamp(kartY+dt*170,KART_MIN,KART_MAX);
 const cible=keys.has('ArrowLeft')?-1:keys.has('ArrowRight')?1:0;penche+=(cible-penche)*Math.min(1,dt*8);
 // Exhaust smoke, turbo flames
 const k=kartGeo();
 if(Math.random()<dt*9)particles.push({x:k.x+(Math.random()<.5?-.12:.12)*k.larg,y:kartY-k.larg*.1,vx:rnd(-25,25),vy:rnd(20,60),t:.6,c:'rgba(235,235,235,.8)',r:4+Math.random()*4,fum:1});
 if(boost>0&&Math.random()<.7)particles.push({x:k.x+rnd(-45,45),y:kartY-6,vx:rnd(-40,40),vy:rnd(60,160),t:.45,c:Math.random()<.5?'#ffb347':'#ffe352'});
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;if(!p.fum)p.vy+=350*dt;p.t-=dt}particles=particles.filter(p=>p.t>0);
 if(maths()){
  if(wave){
   if(!wave.done&&wave.z-pos<=k.dk)answerHit();
   if(wave.done&&wave.z-pos<NEAR-6&&!correctionEnCours){
    wave=null;correctionTexte=null;$('question').classList.add('hidden');
    if(round>=QUESTIONS){finish();return}
    prochaine=.8;
   }
  }else{prochaine-=dt;if(prochaine<=0)makeWave()}
 }
 $('zone').textContent=labels[zoneAt(pos)];$('distance').textContent='🏁 '+Math.floor(pos)+' m';
}
function hud(){
 $('score').textContent=maths()?`⭐ ${garage.snapshot().stars} · ✔ ${bons} · Question ${Math.min(wave&&wave.done?round:round+1,QUESTIONS)}/${QUESTIONS}`:`⭐ ${garage.snapshot().stars} · 🌴 Promenade`;
}
function panel(t,m,b,niv=true){$('rejouer').hidden=true;$('title').textContent=t;$('message').textContent=m;$('start').textContent=b;$('niveauPick').classList.toggle('hidden',!niv);$('levelRule').classList.toggle('hidden',!niv);$('overlay').classList.remove('hidden')}
function finish(){
 state='end';
 parler('Course terminée. Bravo pour tes efforts !',.9);
 garage.award(10);gains+=10;
 try{localStorage.setItem('turboBest',String(Math.max(gains,Number(localStorage.getItem('turboBest'))||0)))}catch(e){}
 const n=niveau(),suite=n<NIVEAUX.length&&NIVEAUX[n].op===NIVEAUX[n-1].op,avant=ouvert(n+1);garder(n,bons);
 let msg=`${medaille(bons)} Tu as trouvé ${bons} bonne${bons>1?'s':''} réponse${bons>1?'s':''} sur ${QUESTIONS} et gagné ${gains} étoiles ⭐ (bonus de fin : +10).`;
 listeNiveaux(n);
 panel('🏆 Course terminée !',msg,'↻ Rejouer');
 // Replay the same level in one click
 $('rejouer').hidden=false;$('rejouer').textContent='↻ Rejouer : '+NIVEAUX[n-1].nom;
 tone(900,.3);
 // Saved in the student's account when the game runs inside a class site (compte.js loaded)
 if(window.EC&&EC.enregistrerNiveau)EC.enregistrerNiveau({activity:'jeu-turbo',level:n,score:bons,total:QUESTIONS,seconds:Math.min(86400,Math.round((performance.now()-debut)/1000))}).then(r=>{if(r&&r.ok)$('message').textContent+=' Ton résultat est enregistré ✓'}).catch(()=>{});
}
function start(){
 arreterVoix();
 pos=0;lane=target=0;kartY=KART_MAX;round=stars=bons=serie=gains=0;boost=0;used.clear();wave=null;feedbackTime=0;particles=[];prochaine=1.2;keys.clear();debut=performance.now();
 state='play';$('overlay').classList.add('hidden');$('question').classList.add('hidden');$('pause').textContent='⏸ Pause';tone(550);hud();
}
function pause(){
 if(state==='play'){arreterVoix();state='pause';keys.clear();panel('⏸ Pause','Ton kart est arrêté. Reprends quand tu veux.','▶ Reprendre',false);$('pause').textContent='▶ Reprendre'}
 else if(state==='pause'){state='play';$('overlay').classList.add('hidden');$('pause').textContent='⏸ Pause';last=performance.now();if(wave&&!wave.done)dire(wave);else if(wave&&wave.done&&correctionTexte)parler(correctionTexte,.92,true)}
}
$('rejouer').onclick=()=>{if(state==='end')start()};
$('start').onclick=()=>state==='pause'?pause():start();
$('restart').onclick=()=>{if(state!=='loading')start()};
$('mode').onchange=()=>{if(state!=='loading')start()};
$('pause').onclick=pause;
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'🔊 Sons':'🔇 Muet'};
$('lecture').onclick=()=>{lecture=!lecture;$('lecture').textContent=lecture?'🗣️ Lecture':'🤐 Sans lecture';$('lecture').setAttribute('aria-pressed',lecture);if(!lecture)arreterVoix();else if(wave&&!wave.done)dire(wave);else if(wave&&wave.done&&correctionTexte)parler(correctionTexte,.92,true)};
window.addEventListener('keydown',e=>{if(e.key.startsWith('Arrow')||e.key===' '){if(e.target.closest('select,input,dialog')||(e.key===' '&&e.target.closest('button'))||document.querySelector('main').hidden)return;e.preventDefault();if(e.key===' '){if(!e.repeat)pause()}else if(state==='play')keys.add(e.key)}});
window.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>keys.clear());
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(state==='play')keys.add(b.dataset.key)};for(const k of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(k,()=>keys.delete(b.dataset.key))});
// Touch screens: tap the left or right half of the game to change lane
c.addEventListener('pointerdown',e=>{if(state!=='play')return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width;target=clamp(Math.round(target)+(x<.5?-1:1),-1,1);tone(360,.05)});
function frame(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(frame)}
Promise.all(names.map(async n=>{const im=new Image();im.src='assets/'+n+(n==='kart'?'.png':'.webp');await im.decode();images[n]=im})).then(()=>{state='menu';listeNiveaux(1);$('start').disabled=false;$('start').textContent='▶ C’est parti !';hud();requestAnimationFrame(frame)}).catch(e=>{$('message').textContent='Impossible de charger les images : '+e.message});
