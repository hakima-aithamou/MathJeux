// Money levels shared by the Math City games.
// Level N: every amount of money is at most MAX[N-1] dollars.
(function(){
 const MAX=[20,30,40,50,60];
 const CLE='mathcity-niveau';
 function valide(n){return n>=1&&n<=MAX.length}
 function lire(){
  let n=Number(new URLSearchParams(location.search).get('niveau'));
  if(!valide(n)){try{n=Number(localStorage.getItem(CLE))}catch(e){n=0}}
  return valide(n)?n:1;
 }
 let niveau=lire();
 try{localStorage.setItem(CLE,niveau)}catch(e){}

 // Style of the level selector (pills), added once
 const css=document.createElement('style');
 css.textContent='.mcNiveaux{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px;font:700 15px system-ui,sans-serif}'
  +'.mcNiveaux span{margin-right:2px}'
  +'.mcNiveaux button{font:inherit;cursor:pointer;border:2px solid #d9a86b;border-radius:999px;background:#fff7e6;color:#5a3418;padding:5px 11px;line-height:1.2;box-shadow:0 2px 0 #a86a3a55}'
  +'.mcNiveaux button:hover{background:#fff}'
  +'.mcNiveaux button[aria-pressed="true"]{background:#ffd84d;border-color:#b8860b;color:#3b2508}'
  +'.mcNiveaux button:focus-visible{outline:3px solid #6e3fc2;outline-offset:2px}'
  +'@media(max-width:600px){.mcNiveaux{font-size:12px}.mcNiveaux button{padding:4px 8px}}';
 document.head.append(css);

 window.MC_NIVEAU={
  get niveau(){return niveau},
  get max(){return MAX[niveau-1]},
  // Possible amounts of money for the current level (whole dollars)
  montants(){
   const max=MAX[niveau-1],min=niveau===1?10:MAX[niveau-2]+1,liste=[];
   for(let v=min;v<=max;v++)liste.push(v);
   return liste;
  },
  // Random amount of money for the current level, different from the previous one when possible
  auHasard(avant){
   const l=this.montants().filter(v=>v!==avant);
   return l[Math.floor(Math.random()*l.length)];
  },
  // Draw the selector in the element; onChange(n) is called when the level changes
  afficher(el,onChange){
   if(!el)return;
   el.classList.add('mcNiveaux');
   el.setAttribute('role','group');el.setAttribute('aria-label','Niveau');
   el.innerHTML='<span>Niveau :</span>'+MAX.map((m,i)=>
    `<button type="button" data-n="${i+1}" aria-pressed="${i+1===niveau}" title="Jusqu'à ${m} $">${i+1} · ${m} $</button>`).join('');
   el.addEventListener('click',e=>{
    const b=e.target.closest('button[data-n]');if(!b)return;
    const n=Number(b.dataset.n);if(n===niveau)return;
    niveau=n;try{localStorage.setItem(CLE,n)}catch(err){}
    el.querySelectorAll('button[data-n]').forEach(x=>x.setAttribute('aria-pressed',Number(x.dataset.n)===n));
    if(onChange)onChange(n);
   });
  }
 };
})();
