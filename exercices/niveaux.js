'use strict';
/* =====================================================================
   LEVELS OF THE MATHEMATICS ACTIVITIES
   Each activity contains levels of 10 exercises, from the easiest
   to the hardest. The questions are always in the same order
   (fixed-seed generator): every student sees the same thing.
   To change a level: change its title, its description or the
   function that builds its 10 questions.
   ===================================================================== */
(function () {
const N = 15; // exercises per level

/* --- fixed-seed pseudo-random generator (same questions for everyone) --- */
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
const int=(r,min,max)=>min+Math.floor(r()*(max-min+1));
const pick=(r,list)=>list[Math.floor(r()*list.length)];
/* Builds N unique questions from a drawing function. */
function make(seed,draw){const r=rng(seed),out=[],seen=new Set();let guard=0;while(out.length<N&&guard++<5000){const q=draw(r,out.length);if(q==null)continue;const k=JSON.stringify(q);if(!seen.has(k)){seen.add(k);out.push(q)}}return out}
const rep=(s,n)=>Array(n).fill(s).join(' ');

/* ============================ CALCULATIONS ============================ */
const calc=(a,op,b,blank,extra)=>Object.assign({type:'calcul',v:[a,b,op==='+'?a+b:op==='−'?a-b:a*b],op,blank},extra||{});
const calculs={id:'calculs',titre:'Calculs',icone:'+ −',couleur:'#0d5d6e',
 consigne:'Écris le nombre manquant dans la case jaune.',
 niveaux:[
 {titre:'Additionner jusqu’à 10',description:'Avec des dessins pour compter.',
  questions:()=>make(101,r=>{const a=int(r,1,5),b=int(r,1,5);const e=pick(r,['🍎','⭐','🔵','🟢']);return calc(a,'+',b,2,{dessin:rep(e,a)+'   +   '+rep(e,b),aide:'Compte tous les dessins.'})})},
 {titre:'Soustraire jusqu’à 10',description:'Avec des dessins : on retire des jetons.',
  questions:()=>make(102,r=>{const a=int(r,3,10),b=int(r,1,a-1);const e=pick(r,['🍎','⭐','🔵','🟢']);return calc(a,'−',b,2,{dessin:rep(e,a),aide:'Tu as '+a+' dessins. Cache-en '+b+' avec ton doigt. Combien en reste-t-il ?'})})},
 {titre:'Additionner jusqu’à 20',description:'Sans dessin, résultats entre 11 et 20.',
  questions:()=>make(103,r=>{const a=int(r,4,12),b=int(r,Math.max(1,11-a),20-a);return calc(a,'+',b,2,{aide:'Pars du plus grand nombre et compte en avançant.'})})},
 {titre:'Soustraire jusqu’à 20',description:'Sans dessin.',
  questions:()=>make(104,r=>{const a=int(r,11,20),b=int(r,2,9);return calc(a,'−',b,2,{aide:'Pars de '+a+' et recule.'})})},
 {titre:'Trouver le nombre manquant',description:'Le trou n’est pas toujours à la fin.',
  questions:()=>make(105,r=>{const op=pick(r,['+','−']);if(op==='+'){const a=int(r,2,12),b=int(r,2,8);return calc(a,'+',b,int(r,0,1),{aide:'Quel nombre faut-il ajouter ou enlever pour que l’égalité soit vraie ?'})}const a=int(r,8,20),b=int(r,2,7);return calc(a,'−',b,int(r,0,1),{aide:'Quel nombre faut-il ajouter ou enlever pour que l’égalité soit vraie ?'})})},
 {titre:'Additionner jusqu’à 100',description:'Les dizaines avec les dizaines, les unités avec les unités.',
  questions:()=>make(106,r=>{const a=int(r,1,6)*10+int(r,0,4),b=int(r,1,3)*10+int(r,0,5);return calc(a,'+',b,2,{aide:'Additionne d’abord les dizaines, puis les unités.'})})},
 {titre:'Soustraire jusqu’à 100',description:'Sans regrouper.',
  questions:()=>make(107,r=>{const a=int(r,4,9)*10+int(r,5,9),b=int(r,1,3)*10+int(r,0,5);return calc(a,'−',b,2,{aide:'Soustrais d’abord les dizaines, puis les unités.'})})},
 {titre:'Calculer en regroupant',description:'Additions et soustractions jusqu’à 100.',
  questions:()=>make(108,r=>{if(r()<.5){const a=int(r,1,5)*10+int(r,5,9),b=int(r,1,3)*10+int(r,5,9);return calc(a,'+',b,2,{aide:'Les unités font 10 ou plus : regroupe 10 unités en 1 dizaine.'})}const a=int(r,4,9)*10+int(r,0,4),b=int(r,1,3)*10+int(r,5,9);return calc(a,'−',b,2,{aide:'Il faut regrouper : défais 1 dizaine en 10 unités.'})})},
 {titre:'Multiplier : tables de 2, 5 et 10',description:'Des groupes de même taille.',
  questions:()=>make(109,r=>{const t=pick(r,[2,5,10]),n=int(r,1,10);return calc(n,'×',t,2,{aide:n+' groupes de '+t+'. Compte de '+t+' en '+t+'.'})})},
 {titre:'Multiplier : tables de 3 et 4',description:'',
  questions:()=>make(110,r=>{const t=pick(r,[3,4]),n=int(r,1,10);return calc(n,'×',t,r()<.8?2:1,{aide:'Compte de '+t+' en '+t+'.'})})},
 {titre:'Multiplier : tables de 6 à 9',description:'Le défi final des calculs.',
  questions:()=>make(111,r=>{const t=int(r,6,9),n=int(r,2,9);return calc(n,'×',t,r()<.8?2:pick(r,[0,1]),{aide:'Utilise une table que tu connais : par exemple 6 × '+t+' = 5 × '+t+' + '+t+'.'})})}
 ]};

/* ============================ TIME ============================ */
const heure=(h,m)=>({type:'heure',h,m});
const lireHeure={id:'heure',titre:'Lire l’heure',icone:'🕘',couleur:'#08665d',
 consigne:'Quelle heure indique l’horloge ? La petite aiguille montre les heures, la grande aiguille montre les minutes.',
 niveaux:[
 {titre:'Les heures justes',description:'La grande aiguille est sur le 12.',questions:()=>make(201,r=>heure(int(r,1,12),0))},
 {titre:'Les heures et demie',description:'La grande aiguille est sur le 12 ou sur le 6.',questions:()=>make(202,(r,i)=>heure(int(r,1,12),i%3===0?0:30))},
 {titre:'Les quarts d’heure',description:'La grande aiguille est sur le 3 ou sur le 9.',questions:()=>make(203,(r,i)=>heure(int(r,1,12),[15,45,15,45,30][i%5]))},
 {titre:'De 5 en 5 minutes (1)',description:'Les minutes de 5 à 25.',questions:()=>make(204,r=>heure(int(r,1,12),pick(r,[5,10,15,20,25])))},
 {titre:'De 5 en 5 minutes (2)',description:'Toutes les minutes par bonds de 5.',questions:()=>make(205,r=>heure(int(r,1,12),pick(r,[35,40,45,50,55,5,20])))}
 ]};

/* ============================ MEASUREMENT ============================ */
const mesures={id:'mesures',titre:'Mesurer et comparer',icone:'📏',couleur:'#08665d',
 consigne:'Observe les deux bandes.',
 niveaux:[
 {titre:'La bande la plus longue',description:'Comparer deux longueurs.',
  questions:()=>make(301,r=>{const a=int(r,2,14);let b=int(r,2,14);if(Math.abs(a-b)<3)b=a>8?a-4:a+4;return{type:'choix',texte:'Quelle bande est la plus longue ?',visuel:{bandes:[a,b]},choix:['Bande A','Bande B'],reponse:a>b?0:1,aide:'Regarde où se termine chaque bande.'}})},
 {titre:'La bande la plus courte',description:'Comparer deux longueurs.',
  questions:()=>make(302,r=>{const a=int(r,2,14);let b=int(r,2,14);if(Math.abs(a-b)<2)b=a>8?a-3:a+3;return{type:'choix',texte:'Quelle bande est la plus courte ?',visuel:{bandes:[a,b]},choix:['Bande A','Bande B'],reponse:a<b?0:1,aide:'La plus courte se termine en premier.'}})},
 {titre:'Trouver la différence (jusqu’à 10 cm)',description:'Combien manque-t-il à la bande A ?',
  questions:()=>make(303,r=>{const a=int(r,1,8),d=int(r,1,Math.min(10,12-a));return{type:'nombre',texte:'Combien de centimètres faut-il ajouter à la bande A pour atteindre la longueur de la bande B ?',visuel:{bandes:[a,a+d],regle:true},reponse:d,unite:'cm',aide:'Compte les centimètres entre la fin de la bande A et la fin de la bande B.'}})},
 {titre:'Trouver la différence (jusqu’à 30 cm)',description:'',
  questions:()=>make(304,r=>{const a=int(r,5,20),d=int(r,3,10);return{type:'nombre',texte:'Combien de centimètres faut-il ajouter à la bande A pour atteindre la longueur de la bande B ?',visuel:{bandes:[a,a+d]},reponse:d,unite:'cm',aide:'Calcule '+(a+d)+' − '+a+'.'}})},
 {titre:'Trouver la différence (jusqu’à 100 cm)',description:'',
  questions:()=>make(305,r=>{const a=int(r,10,60),d=int(r,5,35);return{type:'nombre',texte:'Quelle est la différence de longueur entre les deux bandes ?',visuel:{bandes:[a,a+d]},reponse:d,unite:'cm',aide:'Calcule la plus grande longueur moins la plus petite.'}})}
 ]};

/* ============================ SHARING ============================ */
const part=(total,groupes)=>({type:'nombre',texte:'Répartis les '+total+' jetons entre '+groupes+' personnes. Chaque personne doit en avoir autant.',visuel:{jetons:total,groupes},reponse:total/groupes,unite:'jetons par personne',aide:'Donne un jeton à chaque personne, chacune son tour, jusqu’à ce qu’il n’en reste plus.'});
const partage={id:'partage',titre:'Partager équitablement',icone:'÷',couleur:'#0d5d6e',
 video:'Partager-equitablement.mp4',
 consigne:'Combien de jetons chaque personne reçoit-elle ?',
 niveaux:[
 {titre:'Partager entre 2 personnes',description:'De 2 à 30 jetons.',questions:()=>[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30].map(t=>part(t,2))},
 {titre:'Partager entre 3 personnes',description:'De 3 à 45 jetons.',questions:()=>[3,6,9,12,15,18,21,24,27,30,33,36,39,42,45].map(t=>part(t,3))},
 {titre:'Partager entre 4 ou 5 personnes',description:'',questions:()=>make(403,r=>{const g=pick(r,[4,5]);return part(g*int(r,1,8),g)})},
 {titre:'Partager entre 6 à 10 personnes',description:'De plus grands groupes.',questions:()=>make(404,r=>{const g=int(r,6,10);return part(g*int(r,2,6),g)})}
 ]};

/* ================= ONES, TENS, HUNDREDS (place value) =================
   Types "nombre", "choix" and "position" (table); visuals "blocs" and "chiffres". */
const pl=(n,mot)=>n+' '+(n>1?mot+'s':mot);       // 0 tens, 1 ten, 3 tens
const plU=n=>n+' '+(n>1?'unités':'unité');
const plUM=n=>n+' '+(n>1?'unités de mille':'unité de mille');
const chif=(n,k)=>Math.floor(n/10**k)%10;
const NOMPOS=['unités','dizaines','centaines','unités de mille'];
const mil=n=>n>=1000?Math.floor(n/1000)+'\u202f'+String(n%1000).padStart(3,'0'):String(n); // 4 743
const LECON_BLOCS=['Un petit cube, c’est 1 unité.','Une barre de 10 cubes, c’est 1 dizaine : 10 unités.','Une plaque de 10 barres, c’est 1 centaine : 100 unités.','Compte d’abord les centaines, puis les dizaines, puis les unités.'];
const LECON_TAB=['Chaque chiffre a sa place : U pour les unités, D pour les dizaines, C pour les centaines, UM pour les unités de mille.','On lit le nombre de gauche à droite, mais la colonne des unités est toujours à droite.','S’il n’y a rien dans une colonne, on écrit 0.'];
const LECON_VAL=['La valeur d’un chiffre dépend de sa place.','Dans 472, le 7 est aux dizaines : il vaut 7 dizaines, donc 70.','Aux centaines, un 4 vaut 400. Aux unités, un 2 vaut 2.'];
const LECON_ECH=['10 unités = 1 dizaine.','10 dizaines = 1 centaine.','10 centaines = 1 unité de mille.','C’est ce qu’on fait quand on regroupe.'];
const valeur={id:'valeur',titre:'Unités, dizaines, centaines : tout ensemble',icone:'C D U',couleur:'#08565f',
 video:'Unites-dizaines-centaines.mp4',
 consigne:'Observe bien la place de chaque chiffre.',
 niveaux:[
 {titre:'Compter les blocs jusqu’à 99',description:'Des dizaines et des unités.',lecon:LECON_BLOCS,questions:()=>make(1201,r=>{const d=int(r,1,9),u=int(r,0,9),n=d*10+u;return{type:'nombre',texte:'Combien de petits cubes y a-t-il en tout ? Compte les dizaines, puis les unités.',visuel:{blocs:{d,u}},reponse:n,aide:pl(d,'dizaine')+' et '+plU(u)+', ça fait '+n+'.'}})},
 {titre:'Compter les blocs jusqu’à 999',description:'Des centaines, des dizaines et des unités.',lecon:LECON_BLOCS,questions:()=>make(1202,r=>{const c=int(r,1,6),d=int(r,0,9),u=int(r,0,9),n=c*100+d*10+u;return{type:'nombre',texte:'Combien de petits cubes y a-t-il en tout ? Compte les centaines, les dizaines, puis les unités.',visuel:{blocs:{c,d,u}},reponse:n,aide:pl(c,'centaine')+', '+pl(d,'dizaine')+' et '+plU(u)+', ça fait '+n+'.'}})},
 {titre:'Le tableau : dizaines et unités',description:'Écrire chaque chiffre à sa place.',lecon:LECON_TAB,questions:()=>make(1203,r=>{const n=int(r,10,99);return{type:'position',n:2,v:n,texte:'Écris le nombre '+n+' dans le tableau : un chiffre dans chaque case.',aide:'Dans '+n+', il y a '+pl(chif(n,1),'dizaine')+' et '+plU(chif(n,0))+'.'}})},
 {titre:'Le tableau : jusqu’aux centaines',description:'Attention aux zéros !',lecon:LECON_TAB,questions:()=>make(1204,r=>{const c=int(r,1,9),d=r()<.3?0:int(r,0,9),u=r()<.2?0:int(r,0,9),n=c*100+d*10+u;return{type:'position',n:3,v:n,texte:'Écris le nombre '+n+' dans le tableau.',aide:'Dans '+n+' : '+pl(c,'centaine')+', '+pl(d,'dizaine')+' et '+plU(u)+'.'}})},
 {titre:'Le chiffre des…',description:'Trouver le chiffre à une place donnée.',lecon:LECON_TAB,questions:()=>make(1205,r=>{const n=int(r,102,987),k=int(r,0,2);return{type:'nombre',texte:'Dans le nombre '+n+', quel est le chiffre des '+NOMPOS[k]+' ?',visuel:{chiffres:{n,pos:-1}},reponse:chif(n,k),aide:'Les unités sont tout à droite, puis les dizaines, puis les centaines.'}})},
 {titre:'Que vaut ce chiffre ?',description:'La valeur dépend de la place.',lecon:LECON_VAL,questions:()=>make(1206,r=>{let n,k,c;do{n=int(r,102,987);k=int(r,0,2);c=chif(n,k)}while(c===0||String(n).split('').filter(x=>x==c).length>1);const v=c*10**k;const l=[v,...[0,1,2].filter(j=>j!==k).map(j=>c*10**j),c*1000].slice(0,4).map(mil);return quizQ(r,{type:'choix',texte:'Dans '+n+', que vaut le chiffre '+c+' en couleur ?',visuel:{chiffres:{n,pos:k}},oral:'Dans '+n+', que vaut le chiffre '+c+' ? Réponds : '+l.join(', ou ')+'.',aide:'Le '+c+' est aux '+NOMPOS[k]+' : il vaut '+mil(v)+'.'},l)})},
 {titre:'Composer un nombre',description:'Des centaines, des dizaines et des unités → un nombre.',lecon:LECON_BLOCS,questions:()=>make(1207,r=>{const c=int(r,1,9),d=r()<.35?0:int(r,1,9),u=r()<.25?0:int(r,1,9),n=c*100+d*10+u;return{type:'nombre',texte:pl(c,'centaine')+', '+pl(d,'dizaine')+' et '+plU(u)+' : quel est ce nombre ?',reponse:n,aide:'Écris '+c+' aux centaines, '+d+' aux dizaines et '+u+' aux unités.'}})},
 {titre:'Décomposer un nombre',description:'Par exemple : 547 = 500 + 40 + 7.',lecon:LECON_VAL,questions:()=>make(1208,r=>{let n;do n=int(r,111,999);while(chif(n,1)===0||chif(n,0)===0);const P=[chif(n,2)*100,chif(n,1)*10,chif(n,0)],k=int(r,0,2),aff=P.map((x,j)=>j===k?'?':x);return{type:'nombre',texte:'Complète : '+n+' = '+aff.join(' + '),oral:'Complète : '+n+' égale '+aff.map(x=>x==='?'?'combien':x).join(' plus ')+'. Quel nombre manque ?',reponse:P[k],aide:n+' = '+P.join(' + ')+'.'}})},
 {titre:'Échanger : 10 pour 1',description:'Le lien avec regrouper.',lecon:LECON_ECH,questions:()=>make(1209,r=>{const t=int(r,0,4);
   if(t===0){const u=int(r,11,19);return{type:'nombre',texte:u+' unités, c’est 1 dizaine et combien d’unités ?',reponse:u-10,aide:'10 unités font 1 dizaine. Il reste '+(u-10)+'.'}}
   if(t===1){const d=int(r,11,19);return{type:'nombre',texte:d+' dizaines, c’est 1 centaine et combien de dizaines ?',reponse:d-10,aide:'10 dizaines font 1 centaine. Il reste '+(d-10)+'.'}}
   if(t===2){const c=int(r,2,9);return{type:'nombre',texte:pl(c,'centaine')+', c’est combien de dizaines ?',reponse:c*10,aide:'1 centaine = 10 dizaines, donc '+c+' centaines = '+(c*10)+' dizaines.'}}
   if(t===3){const d=int(r,1,9),u=int(r,10,19);return{type:'nombre',texte:pl(d,'dizaine')+' et '+u+' unités : quel est ce nombre ?',reponse:d*10+u,aide:'Regroupe : '+u+' unités = 1 dizaine et '+plU(u-10)+'. Ça fait '+(d*10+u)+'.'}}
   const c=int(r,1,8),d=int(r,10,19);return{type:'nombre',texte:pl(c,'centaine')+' et '+d+' dizaines : quel est ce nombre ?',reponse:c*100+d*10,aide:'Regroupe : '+d+' dizaines = 1 centaine et '+pl(d-10,'dizaine')+'. Ça fait '+(c*100+d*10)+'.'}})},
 {titre:'Jusqu’aux unités de mille',description:'Des nombres jusqu’à 9 999.',lecon:['10 centaines = 1 unité de mille (1 000).','Les unités de mille sont à gauche des centaines.','S’il n’y a rien dans une colonne, on écrit 0.'],questions:()=>make(1210,r=>{const m=int(r,1,9),c=r()<.3?0:int(r,0,9),d=r()<.3?0:int(r,0,9),u=int(r,0,9),n=m*1000+c*100+d*10+u,t=int(r,0,2);
   if(t===0)return{type:'position',n:4,v:n,texte:'Écris le nombre '+mil(n)+' dans le tableau.',aide:'Dans '+mil(n)+' : '+plUM(m)+', '+pl(c,'centaine')+', '+pl(d,'dizaine')+' et '+plU(u)+'.'};
   if(t===1)return{type:'nombre',texte:plUM(m)+', '+pl(c,'centaine')+', '+pl(d,'dizaine')+' et '+plU(u)+' : quel est ce nombre ?',reponse:n,aide:'Écris un chiffre par colonne : '+m+', '+c+', '+d+', '+u+'.'};
   const k=int(r,0,3);return{type:'nombre',texte:'Dans le nombre '+mil(n)+', quel est le chiffre des '+NOMPOS[k]+' ?',visuel:{chiffres:{n,pos:-1}},reponse:chif(n,k),aide:'De droite à gauche : unités, dizaines, centaines, unités de mille.'}})}
 ]};

/* ===================== WHOLE NUMBERS (6 activities) =====================
   composer, egal, comparer, situer, sortes, proprietes.
   chx(): choice question (right answer = l[0] before shuffling). */
const chx=(r,base,l)=>{const ch=melange(r,l.map(String));return Object.assign({type:'choix',choix:ch,reponse:ch.indexOf(String(l[0]))},base)};
const nb=(r,a,b)=>int(r,a,b);
const diffs=(r,n,a,b,exclure)=>{const o=[];let g=0;while(o.length<n&&g++<500){const v=int(r,a,b);if(!o.includes(v)&&!(exclure||[]).includes(v))o.push(v)}return o};
const estPremier=n=>{if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true};
const diviseurs=n=>{const o=[];for(let d=1;d<=n;d++)if(n%d===0)o.push(d);return o};
const CARRES=[1,4,9,16,25,36,49,64,81,100,121,144],TRIS=[1,3,6,10,15,21,28,36,45,55,66,78];
const SIGNES=['<','=','>'],LIRE_SIGNE={'<':'plus petit que','=':'égal à','>':'plus grand que'};
function cmpQ(r,a,b){const bon=a<b?'<':a>b?'>':'=';return{type:'choix',texte:'Choisis le bon signe : '+mil(a)+' ? '+mil(b),visuel:{grand:mil(a)+'  ?  '+mil(b)},choix:SIGNES.slice(),reponse:SIGNES.indexOf(bon),
  oral:'Compare '+a+' et '+b+'. '+a+' est-il plus petit que, égal à, ou plus grand que '+b+' ?',aide:mil(a)+' est '+LIRE_SIGNE[bon]+' '+mil(b)+'. Compare d’abord le chiffre le plus à gauche.'}}
function ordreQ(r,liste,sens){const rep=liste.slice().sort((x,y)=>sens==='decroissant'?y-x:x-y);return{type:'ordre',nombres:melange(r,liste),reponse:rep,sens,texte:sens==='decroissant'?'Range les nombres en ordre décroissant : du plus grand au plus petit.':'Range les nombres en ordre croissant : du plus petit au plus grand.',aide:'Cherche d’abord le '+(sens==='decroissant'?'plus grand':'plus petit')+' nombre, puis le suivant.'}}

/* ---------- 1. Composing and decomposing ---------- */
const LEC_COMP=['Composer, c’est former un nombre avec ses parties : 3 centaines, 4 dizaines et 5 unités font 345.','Décomposer, c’est séparer un nombre en parties : 345 = 300 + 40 + 5.','On peut décomposer de plusieurs façons : 345 = 2 centaines + 14 dizaines + 5 unités.'];
const composer={id:'composer',titre:'Composer et décomposer un nombre',icone:'345',couleur:'#08565f',video:'Composer-decomposer.mp4',consigne:'Trouve le nombre ou la partie qui manque.',niveaux:[
 {titre:'Composer avec C, D, U',description:'Des centaines, des dizaines et des unités.',lecon:LEC_COMP,questions:()=>make(1301,r=>{const c=nb(r,1,9),d=nb(r,0,9),u=nb(r,0,9),n=c*100+d*10+u;return{type:'nombre',texte:pl(c,'centaine')+' + '+pl(d,'dizaine')+' + '+plU(u)+' = ?',oral:pl(c,'centaine')+', '+pl(d,'dizaine')+' et '+plU(u)+'. Quel est ce nombre ?',reponse:n,aide:'Écris '+c+' aux centaines, '+d+' aux dizaines et '+u+' aux unités : '+n+'.'}})},
 {titre:'Composer dans le désordre',description:'Attention : les parties ne sont pas dans l’ordre.',lecon:LEC_COMP,questions:()=>make(1302,r=>{const c=nb(r,1,9),d=nb(r,1,9),u=nb(r,1,9),n=c*100+d*10+u,P=melange(r,[plU(u),pl(d,'dizaine'),pl(c,'centaine')]);return{type:'nombre',texte:P.join(' + ')+' = ?',oral:P.join(', ')+'. Quel est ce nombre ?',reponse:n,aide:'Range d’abord : '+c+' centaines, '+d+' dizaines, '+u+' unités. Ça fait '+n+'.'}})},
 {titre:'Décomposer : 300 + 40 + 5',description:'Trouver la partie qui manque.',lecon:LEC_COMP,questions:()=>make(1303,r=>{let n;do n=nb(r,111,999);while(chif(n,1)===0||chif(n,0)===0);const P=[chif(n,2)*100,chif(n,1)*10,chif(n,0)],k=nb(r,0,2),aff=P.map((x,j)=>j===k?'?':x);return{type:'nombre',texte:'Complète : '+n+' = '+aff.join(' + '),oral:n+' égale '+aff.map(x=>x==='?'?'combien':x).join(' plus ')+'.',reponse:P[k],aide:n+' = '+P.join(' + ')+'.'}})},
 {titre:'Décomposer en mots',description:'Combien de centaines, de dizaines, d’unités ?',lecon:LEC_COMP,questions:()=>make(1304,r=>{const n=nb(r,101,999),k=nb(r,0,2),P=[chif(n,2),chif(n,1),chif(n,0)],m=['centaines','dizaines','unités'],aff=P.map((x,j)=>(j===2-k?'?':x)+' '+m[j]);return{type:'nombre',texte:'Complète : '+n+' = '+aff.join(' + '),oral:n+' égale '+aff.map(x=>x.replace('?','combien de')).join(', plus ')+'.',reponse:chif(n,k),aide:'Dans '+n+' : '+P[0]+' centaines, '+P[1]+' dizaines et '+P[2]+' unités.'}})},
 {titre:'Une autre façon de décomposer',description:'Par exemple : 345 = 2 centaines + 14 dizaines + 5 unités.',lecon:LEC_COMP,questions:()=>make(1305,r=>{const c=nb(r,2,9),d=nb(r,0,9),u=nb(r,0,9),n=c*100+d*10+u,t=nb(r,0,1);
   if(t===0)return{type:'nombre',texte:'Complète : '+n+' = '+pl(c-1,'centaine')+' + ? dizaines + '+plU(u),oral:n+' égale '+pl(c-1,'centaine')+', plus combien de dizaines, plus '+plU(u)+' ?',reponse:d+10,aide:'1 centaine = 10 dizaines. Donc '+d+' + 10 = '+(d+10)+' dizaines.'};
   return{type:'nombre',texte:'Complète : '+n+' = ? dizaines + '+plU(u),oral:n+' égale combien de dizaines, plus '+plU(u)+' ?',reponse:c*10+d,aide:c+' centaines = '+(c*10)+' dizaines. Avec les '+d+' dizaines, ça fait '+(c*10+d)+' dizaines.'}})},
 {titre:'Combien de dizaines en tout ?',description:'Dans 340, il y a 34 dizaines.',lecon:['Pour savoir combien de dizaines il y a en tout, cache le chiffre des unités.','Dans 340, il y a 34 dizaines. Dans 1 200, il y a 12 centaines.'],questions:()=>make(1306,r=>{const t=nb(r,0,1);if(t===0){const n=nb(r,12,98)*10;return{type:'nombre',texte:'Combien de dizaines y a-t-il en tout dans '+mil(n)+' ?',reponse:n/10,aide:'Cache le 0 des unités : il reste '+(n/10)+'.'}}const n=nb(r,11,49)*100;return{type:'nombre',texte:'Combien de centaines y a-t-il en tout dans '+mil(n)+' ?',reponse:n/100,aide:'Cache les deux 0 : il reste '+(n/100)+'.'}})},
 {titre:'Jusqu’aux unités de mille',description:'Composer et décomposer jusqu’à 9 999.',lecon:['1 unité de mille = 10 centaines = 1 000.','4 728 = 4 000 + 700 + 20 + 8.'],questions:()=>make(1307,r=>{const m=nb(r,1,9),c=nb(r,0,9),d=nb(r,0,9),u=nb(r,1,9),n=m*1000+c*100+d*10+u;
   if(r()<.5)return{type:'nombre',texte:plUM(m)+' + '+pl(c,'centaine')+' + '+pl(d,'dizaine')+' + '+plU(u)+' = ?',oral:plUM(m)+', '+pl(c,'centaine')+', '+pl(d,'dizaine')+' et '+plU(u)+'. Quel est ce nombre ?',reponse:n,aide:'Un chiffre par colonne : '+m+', '+c+', '+d+', '+u+'.'};
   const P=[m*1000,c*100,d*10,u].filter(x=>x>0),j=int(r,0,P.length-1),aff=P.map((x,i)=>i===j?'?':mil(x));return{type:'nombre',texte:'Complète : '+mil(n)+' = '+aff.join(' + '),oral:n+' égale '+aff.map(x=>x==='?'?'combien':x).join(' plus ')+'.',reponse:P[j],aide:mil(n)+' = '+P.map(mil).join(' + ')+'.'}})}
]};

/* ---------- 2. One number, several ways (2 + 3 = 1 + 4) ---------- */
const LEC_EGAL=['Un nombre peut s’écrire de plusieurs façons.','2 + 3 = 5 et 1 + 4 = 5, donc 2 + 3 = 1 + 4.','Le signe = veut dire : « a la même valeur que ».','Si un nombre diminue de 1, l’autre augmente de 1 : la somme ne change pas.'];
const fauxSomme=(r,s)=>{let a,b;do{a=nb(r,0,s);b=nb(r,0,s)}while(a+b===s||a+b>s+3||a+b<s-3);return a+' + '+b};
const egal={id:'egal',titre:'Un nombre, plusieurs façons',icone:'2+3',couleur:'#08565f',video:'Un-nombre-plusieurs-facons.mp4',consigne:'Les deux côtés du signe = ont la même valeur.',niveaux:[
 {titre:'Quelle addition fait aussi… ?',description:'Les nombres jusqu’à 10.',lecon:LEC_EGAL,questions:()=>make(1401,r=>{const s=nb(r,4,10),a=nb(r,1,s-1),b=s-a;let c;do c=nb(r,0,s);while(c===a);const bonne=c+' + '+(s-c);const l=[bonne];while(l.length<4){const f=fauxSomme(r,s);if(!l.includes(f))l.push(f)}return chx(r,{texte:a+' + '+b+' = '+s+'. Quelle addition fait aussi '+s+' ?',visuel:{grand:a+' + '+b+' = '+s},aide:bonne+' = '+s+', comme '+a+' + '+b+'.'},l)})},
 {titre:'Compléter l’égalité',description:'Par exemple : 2 + 3 = 1 + ?',lecon:LEC_EGAL,questions:()=>make(1402,r=>{const s=nb(r,5,10),a=nb(r,1,s-1),c=nb(r,0,s);if(c===a)return null;return{type:'nombre',texte:'Complète : '+a+' + '+(s-a)+' = '+c+' + ?',oral:a+' plus '+(s-a)+' égale '+c+' plus combien ?',visuel:{grand:a+' + '+(s-a)+' = '+c+' + ?'},reponse:s-c,aide:a+' + '+(s-a)+' = '+s+'. Il faut '+(s-c)+' pour aller de '+c+' à '+s+'.'}})},
 {titre:'Vrai ou faux ?',description:'Les deux côtés sont-ils égaux ?',lecon:LEC_EGAL,questions:()=>make(1403,r=>{const s=nb(r,5,12),a=nb(r,1,s-1),c=nb(r,0,s),vrai=r()<.5,d=vrai?s-c:s-c+pick(r,[-2,-1,1,2]);if(d<0||c===a)return null;const g=a+' + '+(s-a),dr=c+' + '+d;return chx(r,{texte:'Est-ce vrai ? '+g+' = '+dr,visuel:{grand:g+' = '+dr},oral:'Est-ce vrai ? '+a+' plus '+(s-a)+' égale '+c+' plus '+d+'. Réponds : vrai ou faux.',aide:g+' = '+s+' et '+dr+' = '+(c+d)+'. '+(vrai?'C’est pareil : vrai.':'Ce n’est pas pareil : faux.')},vrai?['Vrai','Faux']:['Faux','Vrai'])})},
 {titre:'Jusqu’à 20',description:'Par exemple : 8 + 7 = 10 + ?',lecon:LEC_EGAL.concat(['Astuce : 8 + 7 = 10 + 5. On donne 2 au 8 pour faire 10.']),questions:()=>make(1404,r=>{const a=nb(r,6,9),b=nb(r,3,9),s=a+b;if(s<=10)return null;return{type:'nombre',texte:'Complète : '+a+' + '+b+' = 10 + ?',oral:a+' plus '+b+' égale 10 plus combien ?',visuel:{grand:a+' + '+b+' = 10 + ?'},reponse:s-10,aide:a+' + '+b+' = '+s+', et '+s+' = 10 + '+(s-10)+'.'}})},
 {titre:'Avec la soustraction',description:'Par exemple : 9 − 3 = 8 − ?',lecon:['9 − 3 = 6 et 8 − 2 = 6, donc 9 − 3 = 8 − 2.','Si les deux nombres diminuent de 1, la différence ne change pas.'],questions:()=>make(1405,r=>{const a=nb(r,6,15),b=nb(r,1,a-2),dif=a-b,c=a-nb(r,1,3);if(c-dif<0)return null;return{type:'nombre',texte:'Complète : '+a+' − '+b+' = '+c+' − ?',oral:a+' moins '+b+' égale '+c+' moins combien ?',visuel:{grand:a+' − '+b+' = '+c+' − ?'},reponse:c-dif,aide:a+' − '+b+' = '+dif+'. '+c+' − '+(c-dif)+' = '+dif+' aussi.'}})},
 {titre:'Plus grands nombres',description:'Par exemple : 38 + 25 = 40 + ?',lecon:LEC_EGAL.concat(['Astuce : 38 + 25 = 40 + 23. On donne 2 au 38 pour faire 40.']),questions:()=>make(1406,r=>{const a=nb(r,2,9)*10-nb(r,1,3),b=nb(r,12,49),k=Math.ceil(a/10)*10;return{type:'nombre',texte:'Complète : '+a+' + '+b+' = '+k+' + ?',oral:a+' plus '+b+' égale '+k+' plus combien ?',visuel:{grand:a+' + '+b+' = '+k+' + ?'},reponse:a+b-k,aide:'On ajoute '+(k-a)+' à '+a+' pour faire '+k+', donc on enlève '+(k-a)+' à '+b+' : '+(a+b-k)+'.'}})}
]};

/* ---------- 3. Comparing and ordering ---------- */
const LEC_CMP=['< veut dire « plus petit que » : 3 < 8.','> veut dire « plus grand que » : 8 > 3.','La pointe montre toujours le plus petit nombre.','Pour comparer : regarde d’abord combien de chiffres, puis compare de gauche à droite.'];
const LEC_ORD=['Ordre croissant : du plus petit au plus grand (comme un escalier qui monte).','Ordre décroissant : du plus grand au plus petit (comme un escalier qui descend).'];
const comparer={id:'comparer',titre:'Comparer et ordonner',icone:'< >',couleur:'#08565f',video:'Comparer-ordonner.mp4',consigne:'Compare les nombres.',niveaux:[
 {titre:'Comparer jusqu’à 100',description:'Choisir <, = ou >.',lecon:LEC_CMP,questions:()=>make(1501,r=>{const a=nb(r,1,99),b=r()<.15?a:nb(r,1,99);return cmpQ(r,a,b)})},
 {titre:'Comparer jusqu’à 1 000',description:'Les centaines d’abord.',lecon:LEC_CMP,questions:()=>make(1502,r=>{const a=nb(r,100,999);const b=r()<.4?a+pick(r,[-10,10,-1,1,-100,100,90,-90]):r()<.1?a:nb(r,100,999);return b<1?null:cmpQ(r,a,b)})},
 {titre:'Comparer jusqu’à 9 999',description:'Attention aux nombres qui se ressemblent.',lecon:LEC_CMP,questions:()=>make(1503,r=>{const a=nb(r,1000,9999);const b=r()<.5?Number(String(a).split('').reverse().join('')):a+pick(r,[-1,1,-10,10,-100,100,900,-900]);return(b<10||b===a)?null:cmpQ(r,a,b)})},
 {titre:'Le plus grand, le plus petit',description:'Trouver le bon nombre parmi 4.',lecon:LEC_CMP,questions:()=>make(1504,r=>{const big=r()<.5,base=nb(r,1,8)*100,l=diffs(r,4,base,base+199);const rep=big?Math.max(...l):Math.min(...l);return chx(r,{texte:'Quel est le '+(big?'plus grand':'plus petit')+' nombre ?',aide:'Compare les centaines, puis les dizaines, puis les unités. Le '+(big?'plus grand':'plus petit')+' est '+rep+'.'},[rep,...l.filter(x=>x!==rep)])})},
 {titre:'Ordre croissant jusqu’à 100',description:'Du plus petit au plus grand.',lecon:LEC_ORD,questions:()=>make(1505,r=>ordreQ(r,diffs(r,4,1,99),'croissant'))},
 {titre:'Ordre décroissant jusqu’à 100',description:'Du plus grand au plus petit.',lecon:LEC_ORD,questions:()=>make(1506,r=>ordreQ(r,diffs(r,4,1,99),'decroissant'))},
 {titre:'Ordonner jusqu’à 1 000',description:'Croissant ou décroissant : lis bien !',lecon:LEC_ORD,questions:()=>make(1507,r=>{const b=nb(r,1,7)*100;return ordreQ(r,diffs(r,5,b,b+250),r()<.5?'croissant':'decroissant')})},
 {titre:'Ordonner jusqu’à 9 999',description:'Des nombres qui se ressemblent.',lecon:LEC_ORD,questions:()=>make(1508,r=>{const b=nb(r,1,8)*1000,l=diffs(r,5,b,b+1500),q=ordreQ(r,l,r()<.5?'croissant':'decroissant');q.affiche=mil;return q})}
]};

/* ---------- 4. Locating a number ---------- */
const situer={id:'situer',titre:'Situer un nombre',icone:'↔',couleur:'#08565f',video:'Situer-un-nombre.mp4',consigne:'Trouve la place du nombre.',niveaux:[
 {titre:'Entre deux nombres',description:'Quel nombre est entre les deux ?',lecon:['Un nombre est entre a et b s’il est plus grand que a et plus petit que b.','Entre 34 et 38, il y a 35, 36 et 37.'],questions:()=>make(1601,r=>{const a=nb(r,5,90),b=a+nb(r,3,6),bon=nb(r,a+1,b-1),f=[a-nb(r,1,4),b+nb(r,1,4),pick(r,[a,b])];return chx(r,{texte:'Quel nombre est entre '+a+' et '+b+' ?',aide:bon+' est plus grand que '+a+' et plus petit que '+b+'.'},[bon,...f])})},
 {titre:'Entre deux dizaines',description:'57 est entre 50 et 60.',lecon:['Pour trouver les dizaines autour d’un nombre, regarde le chiffre des dizaines.','57 : 5 dizaines. Il est entre 50 et 60.'],questions:()=>make(1602,r=>{let n;do n=nb(r,11,99);while(n%10===0);const d=Math.floor(n/10)*10;return chx(r,{texte:'Le nombre '+n+' est entre…',aide:n+' a '+(d/10)+' dizaines : il est entre '+d+' et '+(d+10)+'.'},[d+' et '+(d+10),(d-10)+' et '+d,(d+10)+' et '+(d+20),(d/10)+' et '+(d/10+1)])})},
 {titre:'Entre deux centaines',description:'347 est entre 300 et 400.',lecon:['Regarde le chiffre des centaines.','347 : 3 centaines. Il est entre 300 et 400.'],questions:()=>make(1603,r=>{let n;do n=nb(r,110,989);while(n%100===0);const c=Math.floor(n/100)*100;return chx(r,{texte:'Le nombre '+n+' est entre…',aide:n+' a '+(c/100)+' centaines : il est entre '+mil(c)+' et '+mil(c+100)+'.'},[mil(c)+' et '+mil(c+100),mil(c+100)+' et '+mil(c+200),mil(c-100>=0?c-100:c+200)+' et '+mil(c-100>=0?c:c+300),Math.floor(n/10)*10+' et '+(Math.floor(n/10)*10+10)])})},
 {titre:'Le nombre qui manque dans la liste',description:'Une liste rangée en ordre croissant.',lecon:['Dans une liste en ordre croissant, chaque nombre est plus grand que celui d’avant.','Le nombre qui manque doit être entre ses deux voisins.'],questions:()=>make(1604,r=>{const l=diffs(r,5,10,99).sort((x,y)=>x-y);const k=nb(r,1,3);if(l[k+1]-l[k-1]<3)return null;const bon=l[k];const vis=l.map((x,i)=>i===k?'?':x);const f=diffs(r,3,1,99,[]).filter(x=>x<l[k-1]||x>l[k+1]).slice(0,3);if(f.length<3)return null;return chx(r,{texte:'Quel nombre peut aller à la place du point d’interrogation ?',visuel:{liste:vis},oral:'La liste est : '+vis.map(x=>x==='?'?'un nombre caché':x).join(', ')+'. Quel nombre peut aller à la place du nombre caché ?',aide:'Il faut un nombre entre '+l[k-1]+' et '+l[k+1]+'.'},[bon,...f])})},
 {titre:'Où placer ce nombre ?',description:'Trouver sa place dans une liste rangée.',lecon:['Compare le nombre avec chaque nombre de la liste, de gauche à droite.','Il se place juste avant le premier nombre plus grand que lui.'],questions:()=>make(1605,r=>{const l=diffs(r,4,10,990).sort((x,y)=>x-y),n=nb(r,1,999);if(l.includes(n))return null;const k=l.filter(x=>x<n).length;const pos=j=>j===0?'avant '+l[0]:j===l.length?'après '+l[l.length-1]:'entre '+l[j-1]+' et '+l[j];const opts=[0,1,2,3,4].map(pos),bon=pos(k);return chx(r,{texte:'La liste est rangée en ordre croissant. Où places-tu '+n+' ?',visuel:{liste:l},oral:'La liste est : '+l.join(', ')+'. Où places-tu '+n+' ?',aide:'Réponse : '+bon+'.'},[bon,...opts.filter(x=>x!==bon).slice(0,3)])})},
 {titre:'Le plus proche',description:'68 est plus proche de 70 que de 60.',lecon:['Regarde le chiffre des unités.','De 0 à 4 : on est plus proche de la dizaine d’en bas. De 5 à 9 : de la dizaine d’en haut.'],questions:()=>make(1606,r=>{let n;do n=nb(r,11,99);while(n%10===0||n%10===5);const d=Math.floor(n/10)*10,bon=n%10<5?d:d+10;return chx(r,{texte:'Le nombre '+n+' est-il plus proche de '+d+' ou de '+(d+10)+' ?',aide:'De '+d+' à '+n+' : '+(n-d)+' pas. De '+n+' à '+(d+10)+' : '+(d+10-n)+' pas.'},[bon,bon===d?d+10:d])})}
]};

/* ---------- 5. Kinds of numbers ---------- */
const sortes={id:'sortes',titre:'Sortes de nombres',icone:'2·3·5',couleur:'#08565f',video:'Sortes-de-nombres.mp4',consigne:'Observe bien le nombre.',niveaux:[
 {titre:'Pair ou impair ?',description:'Avec des points en paires.',lecon:['Un nombre pair peut faire des paires sans reste : 2, 4, 6, 8, 10…','Un nombre impair a toujours 1 point tout seul : 1, 3, 5, 7, 9…'],questions:()=>make(1701,r=>{const n=nb(r,2,20);return chx(r,{texte:'Fais des paires. Le nombre '+n+' est-il pair ou impair ?',visuel:{motif:{forme:'paires',n}},aide:n%2?'Il reste 1 point tout seul : '+n+' est impair.':'Tous les points ont un ami : '+n+' est pair.'},n%2?['impair','pair']:['pair','impair'])})},
 {titre:'Pair ou impair : grands nombres',description:'Regarde le chiffre des unités.',lecon:['Un nombre est pair si son chiffre des unités est 0, 2, 4, 6 ou 8.','Il est impair si son chiffre des unités est 1, 3, 5, 7 ou 9.'],questions:()=>make(1702,r=>{const n=nb(r,21,9999);return chx(r,{texte:'Le nombre '+mil(n)+' est-il pair ou impair ?',visuel:{chiffres:{n,pos:0}},aide:'Le chiffre des unités est '+(n%10)+' : '+mil(n)+' est '+(n%2?'impair':'pair')+'.'},n%2?['impair','pair']:['pair','impair'])})},
 {titre:'Les nombres carrés',description:'Des points qui forment un carré.',lecon:['Un nombre carré, c’est un nombre multiplié par lui-même : 3 × 3 = 9.','Avec ses points, on peut faire un carré.','Les premiers nombres carrés : 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.'],questions:()=>make(1703,r=>{const k=nb(r,2,8),t=nb(r,0,1);if(t===0)return{type:'nombre',texte:'Combien de points y a-t-il dans ce carré ?',visuel:{motif:{forme:'carre',n:k}},reponse:k*k,aide:k+' rangées de '+k+' points : '+k+' × '+k+' = '+(k*k)+'.'};const f=diffs(r,3,2,60,CARRES);return chx(r,{texte:'Lequel est un nombre carré ?',aide:k*k+' = '+k+' × '+k+'. On peut faire un carré de '+k+' sur '+k+'.'},[k*k,...f])})},
 {titre:'Les nombres triangulaires',description:'Des points qui forment un triangle.',lecon:['Un nombre triangulaire se forme avec des rangées : 1, puis 2, puis 3…','1, 3, 6, 10, 15, 21, 28 sont triangulaires.','Pour trouver le suivant, on ajoute une rangée de 1 point de plus.'],questions:()=>make(1704,r=>{const k=nb(r,2,7),T=k*(k+1)/2,t=nb(r,0,2);if(t===0)return{type:'nombre',texte:'Combien de points y a-t-il dans ce triangle ?',visuel:{motif:{forme:'triangle',n:k}},reponse:T,aide:Array.from({length:k},(_,i)=>i+1).join(' + ')+' = '+T+'.'};if(t===1)return{type:'nombre',texte:'Les nombres triangulaires : '+TRIS.slice(0,k).join(', ')+'… Quel est le suivant ?',visuel:{motif:{forme:'triangle',n:k}},reponse:(k+1)*(k+2)/2,aide:'On ajoute une rangée de '+(k+1)+' points : '+T+' + '+(k+1)+' = '+((k+1)*(k+2)/2)+'.'};const f=diffs(r,3,2,40,TRIS);return chx(r,{texte:'Lequel est un nombre triangulaire ?',aide:T+' = '+Array.from({length:k},(_,i)=>i+1).join(' + ')+'.'},[T,...f])})},
 {titre:'Premier ou composé ? (jusqu’à 30)',description:'Compter les diviseurs.',lecon:['Un nombre premier a exactement 2 diviseurs : 1 et lui-même. Exemple : 7.','Un nombre composé a plus de 2 diviseurs. Exemple : 6 (1, 2, 3, 6).','Attention : 1 n’est ni premier ni composé.'],questions:()=>make(1705,r=>{const n=nb(r,2,30),p=estPremier(n);return chx(r,{texte:'Le nombre '+n+' est-il premier ou composé ?',aide:'Les diviseurs de '+n+' : '+diviseurs(n).join(', ')+'. '+(p?'Seulement 2 diviseurs : premier.':'Plus de 2 diviseurs : composé.')},p?['premier','composé']:['composé','premier'])})},
 {titre:'Premier ou composé ? (jusqu’à 100)',description:'Essaie de diviser par 2, 3, 5, 7.',lecon:['Pour savoir si un nombre est composé, essaie de le diviser par 2, 3, 5 ou 7.','S’il se divise sans reste, il est composé.','S’il ne se divise par aucun, il est premier.'],questions:()=>make(1706,r=>{let n;do n=nb(r,31,99);while(n%2===0&&r()<.6);const p=estPremier(n),d=[2,3,5,7].find(x=>n%x===0&&n!==x);return chx(r,{texte:'Le nombre '+n+' est-il premier ou composé ?',aide:p?n+' ne se divise ni par 2, ni par 3, ni par 5, ni par 7 : il est premier.':n+' = '+d+' × '+(n/d)+' : il est composé.'},p?['premier','composé']:['composé','premier'])})},
 {titre:'Trouve le bon nombre',description:'Pair, impair, carré, triangulaire, premier, composé.',lecon:['Pair : finit par 0, 2, 4, 6, 8. Impair : finit par 1, 3, 5, 7, 9.','Carrés : 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.','Triangulaires : 1, 3, 6, 10, 15, 21, 28, 36, 45, 55.','Premiers : 2, 3, 5, 7, 11, 13, 17, 19, 23, 29…'],questions:()=>make(1707,r=>{const S=[['pair',n=>n%2===0],['impair',n=>n%2===1],['carré',n=>CARRES.includes(n)],['triangulaire',n=>TRIS.includes(n)],['premier',estPremier],['composé',n=>n>3&&!estPremier(n)]];const[nom,f]=pick(r,S);const oui=[],non=[];for(let n=2;n<=60;n++)(f(n)?oui:non).push(n);const bon=pick(r,oui),faux=melange(r,non).slice(0,3);return chx(r,{texte:'Lequel est un nombre '+nom+' ?',aide:bon+' est un nombre '+nom+'.'},[bon,...faux])})},
 {titre:'Vrai ou faux ?',description:'Des phrases sur les nombres.',lecon:['Lis bien toute la phrase avant de répondre.','Un nombre peut être de plusieurs sortes : 36 est pair, carré et triangulaire !'],questions:()=>make(1708,r=>{const n=nb(r,2,50);const P=[['pair',n%2===0],['impair',n%2===1],['carré',CARRES.includes(n)],['triangulaire',TRIS.includes(n)],['premier',estPremier(n)],['composé',n>3&&!estPremier(n)]];const[nom,v]=pick(r,P);return chx(r,{texte:'Vrai ou faux : '+n+' est un nombre '+nom+'.',aide:n+(v?' est bien':' n’est pas')+' un nombre '+nom+'. Diviseurs de '+n+' : '+diviseurs(n).join(', ')+'.'},v?['Vrai','Faux']:['Faux','Vrai'])})}
]};

/* ---------- 6. Properties of whole numbers ---------- */
const proprietes={id:'proprietes',titre:'Propriétés des nombres naturels',icone:'0 1 2…',couleur:'#08565f',video:'Proprietes-nombres-naturels.mp4',consigne:'Utilise la propriété pour trouver la réponse.',niveaux:[
 {titre:'Avant, après',description:'Le nombre qui vient juste avant ou juste après.',lecon:['Les nombres naturels : 0, 1, 2, 3, 4… On commence à 0.','Après un nombre, on ajoute 1. Avant un nombre, on enlève 1.','Il n’y a pas de plus grand nombre naturel : on peut toujours ajouter 1.'],questions:()=>make(1801,r=>{const n=pick(r,[nb(r,10,99),nb(r,1,9)*100-pick(r,[0,1]),nb(r,1,9)*1000-pick(r,[0,1]),nb(r,100,999)]),ap=r()<.5;return{type:'nombre',texte:'Quel nombre vient juste '+(ap?'après':'avant')+' '+mil(n)+' ?',reponse:ap?n+1:n-1,aide:ap?mil(n)+' + 1 = '+mil(n+1)+'.':mil(n)+' − 1 = '+mil(n-1)+'.'}})},
 {titre:'L’ordre ne change rien (addition)',description:'7 + 5 = 5 + 7.',lecon:['On peut changer l’ordre des nombres dans une addition : 7 + 5 = 5 + 7.','Le résultat est le même.'],questions:()=>make(1802,r=>{const a=nb(r,3,99),b=nb(r,3,99);return{type:'nombre',texte:'Complète : '+a+' + '+b+' = '+b+' + ?',oral:a+' plus '+b+' égale '+b+' plus combien ?',visuel:{grand:a+' + '+b+' = '+b+' + ?'},reponse:a,aide:'L’ordre ne change rien : '+a+' + '+b+' = '+b+' + '+a+'.'}})},
 {titre:'L’ordre ne change rien (multiplication)',description:'3 × 4 = 4 × 3.',lecon:['On peut aussi changer l’ordre dans une multiplication : 3 × 4 = 4 × 3.','3 rangées de 4 ou 4 rangées de 3 : c’est 12 dans les deux cas.'],questions:()=>make(1803,r=>{const a=nb(r,2,9),b=nb(r,2,9);if(a===b)return null;return{type:'nombre',texte:'Complète : '+a+' × '+b+' = '+b+' × ?',oral:a+' fois '+b+' égale '+b+' fois combien ?',visuel:{grand:a+' × '+b+' = '+b+' × ?'},reponse:a,aide:a+' × '+b+' = '+b+' × '+a+' = '+(a*b)+'.'}})},
 {titre:'Regrouper autrement',description:'(2 + 3) + 4 = 2 + (3 + 4).',lecon:['Dans une addition de 3 nombres, on peut commencer par la paire qu’on veut.','(2 + 3) + 4 = 5 + 4 = 9 et 2 + (3 + 4) = 2 + 7 = 9.','Astuce : cherche les nombres qui font 10 ensemble.'],questions:()=>make(1804,r=>{const a=nb(r,1,9),b=nb(r,1,9),c=nb(r,1,9),t=nb(r,0,1);if(t===0)return{type:'nombre',texte:'Complète : ('+a+' + '+b+') + '+c+' = '+a+' + ('+b+' + ?)',oral:'Parenthèse '+a+' plus '+b+', plus '+c+', égale '+a+' plus, parenthèse '+b+' plus combien ?',visuel:{grand:'('+a+' + '+b+') + '+c+' = '+a+' + ('+b+' + ?)'},reponse:c,aide:'Les mêmes nombres, regroupés autrement : '+c+'.'};const x=nb(r,1,9),y=10-x,z=nb(r,2,9);return{type:'nombre',texte:'Calcule : '+x+' + '+z+' + '+y+' = ?',oral:x+' plus '+z+' plus '+y+'. Combien ?',visuel:{grand:x+' + '+z+' + '+y+' = ?'},reponse:x+y+z,aide:'Astuce : '+x+' + '+y+' = 10, puis 10 + '+z+' = '+(10+z)+'.'}})},
 {titre:'Les nombres spéciaux : 0 et 1',description:'+ 0, × 1, × 0.',lecon:['Ajouter 0 ne change rien : 8 + 0 = 8.','Multiplier par 1 ne change rien : 8 × 1 = 8.','Multiplier par 0 donne toujours 0 : 8 × 0 = 0.'],questions:()=>make(1805,r=>{const n=nb(r,2,999),t=nb(r,0,3);const E=[[n+' + 0',n,'Ajouter 0 ne change rien.'],[n+' × 1',n,'Multiplier par 1 ne change rien.'],[n+' × 0',0,'Multiplier par 0 donne toujours 0.'],['0 + '+n,n,'Ajouter 0 ne change rien.']][t];return{type:'nombre',texte:'Calcule : '+E[0]+' = ?',oral:E[0].replace('×','fois').replace('+','plus')+'. Combien ?',visuel:{grand:E[0]+' = ?'},reponse:E[1],aide:E[2]}})},
 {titre:'Pair + pair, impair + impair…',description:'Le résultat est-il pair ou impair ?',lecon:['pair + pair = pair (4 + 6 = 10).','impair + impair = pair (3 + 5 = 8).','pair + impair = impair (4 + 3 = 7).'],questions:()=>make(1806,r=>{const a=nb(r,11,99),b=nb(r,11,99),s=a+b;return chx(r,{texte:a+' + '+b+' : le résultat est-il pair ou impair ? (Pas besoin de calculer !)',oral:a+' plus '+b+'. Le résultat est-il pair ou impair ?',aide:a+' est '+(a%2?'impair':'pair')+', '+b+' est '+(b%2?'impair':'pair')+' : le résultat est '+(s%2?'impair':'pair')+'.'},s%2?['impair','pair']:['pair','impair'])})},
 {titre:'Vrai ou faux : les nombres naturels',description:'Ce qu’il faut savoir.',lecon:['Les nombres naturels sont 0, 1, 2, 3… sans fin.','Ils n’ont pas de virgule et ne sont pas négatifs.'],questions:()=>fixe(1807,[
   r=>chx(r,{texte:'Vrai ou faux : 0 est un nombre naturel.',aide:'Les nombres naturels commencent à 0.'},['Vrai','Faux']),
   r=>chx(r,{texte:'Vrai ou faux : il existe un plus grand nombre naturel.',aide:'On peut toujours ajouter 1 : il n’y a pas de plus grand nombre naturel.'},['Faux','Vrai']),
   r=>chx(r,{texte:'Vrai ou faux : 3,5 est un nombre naturel.',aide:'Un nombre naturel n’a pas de virgule.'},['Faux','Vrai']),
   r=>chx(r,{texte:'Vrai ou faux : chaque nombre naturel a un nombre qui vient juste après lui.',aide:'Après n, il y a toujours n + 1.'},['Vrai','Faux']),
   r=>chx(r,{texte:'Vrai ou faux : 0 a un nombre naturel juste avant lui.',aide:'0 est le premier nombre naturel : il n’y a rien avant.'},['Faux','Vrai']),
   r=>chx(r,{texte:'Vrai ou faux : 25 + 17 = 17 + 25.',aide:'L’ordre ne change rien dans une addition.'},['Vrai','Faux']),
   r=>chx(r,{texte:'Vrai ou faux : 9 − 4 = 4 − 9.',aide:'Dans une soustraction, l’ordre compte : 9 − 4 = 5, mais on ne peut pas enlever 9 à 4 avec les nombres naturels.'},['Faux','Vrai']),
   r=>chx(r,{texte:'Vrai ou faux : 125 × 0 = 125.',aide:'Multiplier par 0 donne toujours 0.'},['Faux','Vrai']),
   r=>chx(r,{texte:'Vrai ou faux : 6 × 7 = 7 × 6.',aide:'L’ordre ne change rien dans une multiplication.'},['Vrai','Faux']),
   r=>chx(r,{texte:'Vrai ou faux : la somme de deux nombres impairs est toujours paire.',aide:'impair + impair = pair. Exemple : 3 + 5 = 8.'},['Vrai','Faux']),
   r=>chx(r,{texte:'Vrai ou faux : 48 + 0 = 48.',aide:'Ajouter 0 ne change rien.'},['Vrai','Faux']),
   r=>chx(r,{texte:'Vrai ou faux : 1 000 est un nombre naturel.',aide:'C’est un nombre entier, sans virgule et pas négatif : il est naturel.'},['Vrai','Faux']),
   r=>chx(r,{texte:'Vrai ou faux : (4 + 5) + 6 = 4 + (5 + 6).',aide:'On peut regrouper les nombres d’une addition comme on veut : 15 dans les deux cas.'},['Vrai','Faux']),
   r=>chx(r,{texte:'Vrai ou faux : le nombre qui vient juste avant 300 est 299.',aide:'300 − 1 = 299.'},['Vrai','Faux']),
   r=>chx(r,{texte:'Vrai ou faux : 7 × 1 = 1.',aide:'Multiplier par 1 ne change rien : 7 × 1 = 7.'},['Faux','Vrai'])])()}
]};

/* ================= COMPLETING ADDITIONS AND SUBTRACTIONS =================
   Types "calcul" (yellow box anywhere), "trous" (hidden digits in columns), "nombre" (small problems). */
const AID_ADD=(a,c)=>'Pour trouver le nombre qui manque dans une addition, on soustrait : '+c+' − '+a+' = '+(c-a)+'. Vérifie : '+a+' + '+(c-a)+' = '+c+'.';
const LEC_COMPL=['Addition et soustraction vont ensemble : 5 + 3 = 8, donc 8 − 3 = 5 et 8 − 5 = 3.','Il manque un nombre dans une addition ? On soustrait.','Il manque le premier nombre d’une soustraction ? On additionne.','On peut aussi compter en avançant : de 5 à 8, il y a 3.'];
function complQ(r,max,min){const op=pick(r,['+','−']),pos=int(r,0,1);
  if(op==='+'){const a=int(r,min,max-min),b=int(r,min,max-a),c=a+b;return pos===0?calc(a,'+',b,1,{aide:AID_ADD(a,c)}):calc(a,'+',b,0,{aide:AID_ADD(b,c)})}
  const a=int(r,2*min,max),b=int(r,min,a-min),c=a-b;return pos===0?calc(a,'−',b,1,{aide:'Pour trouver le nombre qu’on enlève : '+a+' − '+c+' = '+b+'. Vérifie : '+a+' − '+b+' = '+c+'.'}):calc(a,'−',b,0,{aide:'Il manque le premier nombre : on additionne. '+c+' + '+b+' = '+a+'.'})}
function trouQ(r,op,n,nb){for(let g=0;g<300;g++){let a,b;const lo=10**(n-1);
    if(op==='+'){a=int(r,lo,10**n-1);b=int(r,lo,10**n-1);if(a+b>=10**n)continue}else{a=int(r,lo+lo,10**n-1);b=int(r,lo,a-1);if(a-b<lo)continue}
    const res=op==='+'?a+b:a-b,cols=melange(r,[...Array(n).keys()]).slice(0,nb);
    const cache=cols.map(i=>[int(r,0,2),i]);
    if(op==='+'?nbRegAdd(a,b)===0&&r()<.6:nbRegSou(a,b)===0&&r()<.6)continue;
    return{type:'trous',a,b,op,r:res,n,cache,aide:op==='+'?'Colonne par colonne, depuis les unités : chiffre du haut + chiffre du bas (+ 1 si tu as regroupé) donne le chiffre du résultat.':'Colonne par colonne, depuis les unités : vérifie avec l’addition. Le résultat + le nombre du bas = le nombre du haut.'}}}
const completer={id:'completer',titre:'Compléter des additions et des soustractions',icone:'□ + 5',couleur:'#0d5d6e',video:'Completer-operations.mp4',consigne:'Écris le nombre manquant dans la case jaune.',niveaux:[
 {titre:'L’addition à compléter (jusqu’à 20)',description:'Par exemple : 7 + ? = 12.',lecon:LEC_COMPL,questions:()=>make(1901,r=>{const a=int(r,2,12),b=int(r,2,20-a),c=a+b;return r()<.5?calc(a,'+',b,1,{aide:AID_ADD(a,c)}):calc(a,'+',b,0,{aide:AID_ADD(b,c)})})},
 {titre:'La soustraction à compléter (jusqu’à 20)',description:'Par exemple : 15 − ? = 9 ou ? − 4 = 7.',lecon:LEC_COMPL,questions:()=>make(1902,r=>{const a=int(r,6,20),b=int(r,2,a-2),c=a-b;return r()<.5?calc(a,'−',b,1,{aide:'On enlève combien ? '+a+' − '+c+' = '+b+'.'}):calc(a,'−',b,0,{aide:'Il manque le premier nombre : on additionne. '+c+' + '+b+' = '+a+'.'})})},
 {titre:'Compléter avec des dizaines',description:'Par exemple : 40 + ? = 70.',lecon:LEC_COMPL,questions:()=>make(1903,r=>{const q=complQ(r,9,1);q.v=q.v.map(x=>x*10);q.aide=q.aide.replace(/\d+/g,m=>String(Number(m)*10));return q})},
 {titre:'Compléter jusqu’à 100',description:'Additions et soustractions.',lecon:LEC_COMPL,questions:()=>make(1904,r=>complQ(r,100,11))},
 {titre:'Compléter à 10, à 100, à 1 000',description:'Par exemple : 37 + ? = 100.',lecon:['Pour aller à 100 : d’abord jusqu’à la dizaine suivante, puis jusqu’à 100.','37 + 3 = 40, puis 40 + 60 = 100. Donc 37 + 63 = 100.'],questions:()=>make(1905,r=>{const t=pick(r,[10,100,100,1000]);const a=t===10?int(r,1,9):t===100?int(r,11,89):int(r,11,89)*10;return calc(a,'+',t-a,1,{aide:a+' + '+(t-a)+' = '+mil(t)+'. Avance d’abord jusqu’à la '+(t===10?'':'dizaine ')+'suivante.'})})},
 {titre:'Compléter jusqu’à 1 000',description:'De plus grands nombres.',lecon:LEC_COMPL,questions:()=>make(1906,r=>complQ(r,999,101))},
 {titre:'Chiffres cachés : addition',description:'Retrouver les chiffres qui manquent en colonnes.',lecon:['Travaille une colonne à la fois, en commençant par les unités.','Si les unités font 10 ou plus, on regroupe : 1 dizaine va en haut de la colonne des dizaines.'],questions:()=>make(1907,r=>trouQ(r,'+',int(r,2,3),2))},
 {titre:'Chiffres cachés : soustraction',description:'Vérifie avec l’addition.',lecon:['Travaille une colonne à la fois, en commençant par les unités.','Pour vérifier une soustraction : le résultat + le nombre du bas = le nombre du haut.'],questions:()=>make(1908,r=>trouQ(r,'−',3,int(r,2,3)))},
 {titre:'Petits problèmes',description:'Trouver le nombre qui manque dans une histoire.',lecon:['Lis l’histoire deux fois.','Cherche ce que tu sais et ce qui manque.','Écris l’opération avec une case vide, puis complète-la.'],questions:()=>make(1909,r=>{const[N,P]=pick(r,[['Léa','elle'],['Sami','il'],['Noah','il'],['Inès','elle'],['Adam','il'],['Maya','elle']]),[O,G]=pick(r,[['billes','f'],['cartes','f'],['perles','f'],['autocollants','m']]),deO=(/^[aeiouéè]/.test(O)?'d’':'de ')+O,Pm=P[0].toUpperCase()+P.slice(1),t=int(r,0,3);
   if(t===0){const a=int(r,12,45),b=int(r,5,30);return{type:'nombre',texte:N+' a '+a+' '+O+'. On lui en donne d’autres. Maintenant, '+P+' en a '+(a+b)+'. Combien lui en a-t-on donné ?',reponse:b,aide:a+' + ? = '+(a+b)+'. On soustrait : '+(a+b)+' − '+a+' = '+b+'.'}}
   if(t===1){const a=int(r,30,90),b=int(r,5,a-10);return{type:'nombre',texte:N+' a '+a+' '+O+'. '+Pm+' en perd '+(G==='f'?'quelques-unes':'quelques-uns')+'. Il en reste '+(a-b)+'. Combien en a-t-'+P+' perdu ?',reponse:b,aide:a+' − ? = '+(a-b)+'. '+a+' − '+(a-b)+' = '+b+'.'}}
   if(t===2){const c=int(r,10,40),b=int(r,5,30);return{type:'nombre',texte:N+' donne '+b+' '+O+' à un ami. Il lui en reste '+c+'. Combien '+deO+' '+N+' avait-'+P+' au début ?',reponse:b+c,aide:'? − '+b+' = '+c+'. On additionne : '+c+' + '+b+' = '+(b+c)+'.'}}
   const a=int(r,20,70),c=int(r,a+10,100);return{type:'nombre',texte:N+' a '+a+' '+O+'. '+Pm+' en voudrait '+c+'. Combien lui en manque-t-il ?',reponse:c-a,aide:a+' + ? = '+c+'. '+c+' − '+a+' = '+(c-a)+'.'}})}
]};

/* ================= FRACTIONS ================= Fractions are written "[3/4]": the engine shows them with a fraction bar. */
const F=(n,d)=>'['+n+'/'+d+']';
const pgcd=(a,b)=>b?pgcd(b,a%b):a;
const fauxFrac=(r,n,d,k)=>{const o=[],vu=new Set([n+'/'+d]);let g=0;while(o.length<k&&g++<200){const c=pick(r,[[d-n,d],[n,d+1],[n+1,d],[Math.max(1,n-1),d],[d,n],[n,d*2]]);if(c[0]<1||c[1]<2||c[0]>c[1]*2)continue;const key=c[0]+'/'+c[1];if(!vu.has(key)){vu.add(key);o.push(F(c[0],c[1]))}}return o};
const LEC_FRAC=['Une fraction, c’est une partie d’un tout partagé en parts égales.','Le nombre du bas (dénominateur) dit en combien de parts égales on a partagé.','Le nombre du haut (numérateur) dit combien de parts on prend.','Exemple : [3/4], c’est 3 parts sur 4 parts égales.'];
const fractions={id:'fractions',titre:'Les fractions',icone:'¾',couleur:'#0d5d6e',video:'Les-fractions.mp4',consigne:'Observe bien les parts.',niveaux:[
 {titre:'Des parts égales ?',description:'Une fraction a toujours des parts égales.',lecon:['Pour faire une fraction, il faut des parts égales : toutes de la même grandeur.','Si une part est plus grande qu’une autre, ce ne sont pas des parts égales.'],questions:()=>make(2001,r=>{const d=int(r,2,6),eg=r()<.5;const L=eg?null:Array.from({length:d},()=>int(r,1,4));if(L&&L.every(x=>x===L[0]))L[0]+=2;return chx(r,{texte:'Cette bande est-elle partagée en parts égales ?',visuel:{frac:{forme:'inegal',d,n:0,largeurs:L}},aide:eg?'Toutes les parts ont la même largeur : oui, elles sont égales.':'Certaines parts sont plus larges que d’autres : elles ne sont pas égales.'},eg?['Oui, les parts sont égales','Non, les parts ne sont pas égales']:['Non, les parts ne sont pas égales','Oui, les parts sont égales'])})},
 {titre:'Un demi, un tiers, un quart',description:'Une seule part coloriée.',lecon:LEC_FRAC.concat(['[1/2] : un demi (la moitié). [1/3] : un tiers. [1/4] : un quart.']),questions:()=>make(2002,r=>{const d=pick(r,[2,3,4]),f=pick(r,['barre','cercle']);return chx(r,{texte:'Quelle fraction de la forme est coloriée ?',visuel:{frac:{forme:f,d,n:1}},aide:'Compte toutes les parts : '+d+'. Une seule est coloriée : '+F(1,d)+'.'},[F(1,d),...[2,3,4,5].filter(x=>x!==d).slice(0,2).map(x=>F(1,x))])})},
 {titre:'Lire une fraction',description:'Combien de parts coloriées, sur combien ?',lecon:LEC_FRAC,questions:()=>make(2003,r=>{const d=int(r,2,8),n=int(r,1,d-1),f=pick(r,['barre','cercle']);return chx(r,{texte:'Quelle fraction de la forme est coloriée ?',visuel:{frac:{forme:f,d,n}},aide:n+' parts coloriées sur '+d+' parts égales : '+F(n,d)+'.'},[F(n,d),...fauxFrac(r,n,d,3)])})},
 {titre:'Colorier une fraction',description:'Touche les parts pour les colorier.',lecon:LEC_FRAC.concat(['Pour colorier [2/5] : la forme a 5 parts, colorie-en 2.']),questions:()=>make(2004,r=>{const d=int(r,2,8),n=int(r,1,d-1);return{type:'fraccolor',forme:pick(r,['barre','cercle']),d,n,texte:'Colorie '+F(n,d)+' de la forme.',aide:'Le nombre du haut, '+n+', dit combien de parts colorier.'}})},
 {titre:'Fraction d’un ensemble',description:'Des billes : combien sont rouges ?',lecon:['Une fraction peut aussi parler d’un groupe d’objets.','S’il y a 5 billes et 2 sont rouges : [2/5] des billes sont rouges.'],questions:()=>make(2005,r=>{const t=int(r,3,10),n=int(r,1,t-1);return chx(r,{texte:'Quelle fraction des billes est rouge ?',visuel:{frac:{forme:'ensemble',total:t,n}},aide:n+' billes rouges sur '+t+' billes en tout : '+F(n,t)+'.'},[F(n,t),...fauxFrac(r,n,t,3)])})},
 {titre:'Comparer des fractions',description:'Laquelle est la plus grande ?',lecon:['Même dénominateur : la plus grande fraction a le plus grand numérateur. [3/5] > [2/5].','Même numérateur : plus il y a de parts, plus chaque part est petite. [1/3] > [1/6].','Regarde les bandes : la plus longue partie coloriée est la plus grande fraction.'],questions:()=>make(2006,r=>{let a,b,c,d;if(r()<.5){c=d=int(r,3,10);a=int(r,1,c-1);b=int(r,1,c-1);if(a===b)return null}else{a=b=int(r,1,3);c=int(r,a+1,10);d=int(r,a+1,10);if(c===d)return null}const v1=a/c,v2=b/d,bon=v1>v2?'A : '+F(a,c):'B : '+F(b,d);return chx(r,{texte:'Quelle fraction est la plus grande : A ('+F(a,c)+') ou B ('+F(b,d)+') ?',visuel:{frac:{forme:'deux',paires:[[a,c],[b,d]]}},oral:'Quelle fraction est la plus grande : A, '+a+' sur '+c+', ou B, '+b+' sur '+d+' ?',aide:c===d?'Même nombre de parts : compare les numérateurs.':'Même numérateur : la fraction avec les parts les plus grandes (le plus petit dénominateur) est la plus grande.'},[bon,bon[0]==='A'?'B : '+F(b,d):'A : '+F(a,c)])})},
 {titre:'Fractions équivalentes',description:'[1/2] = [2/4] = [3/6]',lecon:['Des fractions équivalentes ont la même valeur : la même longueur coloriée.','On multiplie le haut et le bas par le même nombre : [1/2] = [2/4] (× 2).'],questions:()=>make(2007,r=>{const d=pick(r,[2,3,4,5]),n=int(r,1,d-1),k=int(r,2,4),haut=r()<.5;return{type:'nombre',texte:'Complète : '+F(n,d)+' = '+(haut?'[?/'+(d*k)+']':'['+(n*k)+'/?]'),oral:n+' sur '+d+' égale '+(haut?'combien sur '+(d*k):(n*k)+' sur combien')+' ?',visuel:{frac:{forme:'deux',paires:[[n,d],[n*k,d*k]]}},reponse:haut?n*k:d*k,aide:'On a multiplié par '+k+' : '+F(n,d)+' = '+F(n*k,d*k)+'.'}})},
 {titre:'Fractions sur la droite numérique',description:'Où est le point ?',lecon:['Entre 0 et 1, la droite est partagée en parts égales.','Compte les bonds depuis 0 jusqu’au point : c’est le numérateur.','Le nombre de parts entre 0 et 1, c’est le dénominateur.'],questions:()=>make(2008,r=>{const d=int(r,2,8),n=int(r,1,d-1);return chx(r,{texte:'Quelle fraction est au point rouge ?',visuel:{frac:{forme:'droite',d,n}},aide:'Entre 0 et 1 il y a '+d+' parts. Le point est au bond '+n+' : '+F(n,d)+'.'},[F(n,d),...fauxFrac(r,n,d,2)])})},
 {titre:'Fraction d’un nombre',description:'[1/4] de 12, [2/3] de 9…',lecon:['Pour trouver [1/4] de 12 : partage 12 en 4 groupes égaux. 12 ÷ 4 = 3.','Pour [3/4] de 12 : un groupe vaut 3, alors 3 groupes valent 9.'],questions:()=>make(2009,r=>{const d=pick(r,[2,3,4,5,10]),k=int(r,1,d>5?5:6),t=d*int(r,2,6),n=r()<.5?1:int(r,1,d-1);return{type:'nombre',texte:'Combien font '+F(n,d)+' de '+t+' ?',visuel:t<=24?{frac:{forme:'ensemble',total:t,n:0}}:undefined,reponse:n*t/d,aide:t+' ÷ '+d+' = '+(t/d)+(n>1?', puis '+(t/d)+' × '+n+' = '+(n*t/d):'')+'.'}})},
 {titre:'Additionner et soustraire',description:'Même dénominateur : [2/5] + [1/5]',lecon:['Quand le dénominateur est le même, on additionne (ou on soustrait) seulement les numérateurs.','[2/5] + [1/5] = [3/5]. Le dénominateur ne change pas : ce sont toujours des cinquièmes.'],questions:()=>make(2010,r=>{const d=int(r,3,10),a=int(r,1,d-1),plus=r()<.6;let b,res;if(plus){b=int(r,1,d-a);res=a+b}else{b=int(r,1,a);res=a-b;if(!res)return null}return{type:'nombre',texte:'Complète : '+F(a,d)+(plus?' + ':' − ')+F(b,d)+' = [?/'+d+']',oral:a+' sur '+d+(plus?' plus ':' moins ')+b+' sur '+d+' égale combien sur '+d+' ?',visuel:{frac:{forme:'barre',d,n:plus?a:a}},reponse:res,aide:'Même dénominateur : '+a+(plus?' + ':' − ')+b+' = '+res+'. Réponse : '+F(res,d)+'.'}})}
]};

/* ================= DIVISION ================= */
const LEC_DIV=['Diviser, c’est partager en parts égales ou faire des groupes égaux.','12 ÷ 3 = 4 : 12 partagé en 3, cela fait 4 dans chaque part.','La division est le contraire de la multiplication : 3 × 4 = 12, donc 12 ÷ 3 = 4.'];
const divQ=(r,tables,maxF)=>{const b=pick(r,tables),q=int(r,1,maxF||10);return calc(b*q,'÷',b,2,{v:[b*q,b,q],aide:'Pense à la table de '+b+' : '+b+' × '+q+' = '+(b*q)+', donc '+(b*q)+' ÷ '+b+' = '+q+'.'})};
const division={id:'division',titre:'La division',icone:'÷',couleur:'#0d5d6e',video:'La-division.mp4',consigne:'Écris le nombre manquant dans la case jaune.',niveaux:[
 {titre:'Partager en parts égales',description:'Combien chacun reçoit-il ?',lecon:LEC_DIV,questions:()=>make(2101,r=>{const g=int(r,2,5),c=int(r,2,5),t=g*c;return{type:'nombre',texte:t+' jetons sont partagés également entre '+g+' amis. Combien de jetons chaque ami reçoit-il ?',visuel:{jetons:t,groupes:g},reponse:c,aide:'Donne un jeton à chacun, à tour de rôle : '+t+' ÷ '+g+' = '+c+'.'}})},
 {titre:'Faire des groupes égaux',description:'Combien de groupes ?',lecon:['Faire des groupes : 12 jetons, des groupes de 4. Combien de groupes ?','On compte les groupes de 4 : 12 ÷ 4 = 3 groupes.'],questions:()=>make(2102,r=>{const c=int(r,2,5),g=int(r,2,6),t=g*c;return{type:'nombre',texte:'Tu as '+t+' jetons. Tu fais des groupes de '+c+'. Combien de groupes peux-tu faire ?',visuel:{jetons:t,groupes:0},reponse:g,aide:'Entoure des groupes de '+c+' : '+t+' ÷ '+c+' = '+g+' groupes.'}})},
 {titre:'Division et multiplication',description:'3 × ? = 12, donc 12 ÷ 3 = ?',lecon:LEC_DIV,questions:()=>make(2103,r=>{const b=int(r,2,9),q=int(r,2,9);return r()<.5?calc(b,'×',q,1,{aide:'Cherche dans la table de '+b+'.'}):calc(b*q,'÷',b,2,{v:[b*q,b,q],aide:'Pense à '+b+' × ? = '+(b*q)+'. La réponse est '+q+'.'})})},
 {titre:'Diviser par 2, 5 et 10',description:'Les tables faciles.',lecon:['Diviser par 2 : prendre la moitié.','Diviser par 10 : 50 ÷ 10 = 5.','Diviser par 5 : compte de 5 en 5.'],questions:()=>make(2104,r=>divQ(r,[2,5,10]))},
 {titre:'Diviser par 3 et 4',description:'',lecon:['Diviser par 4 : c’est la moitié de la moitié. 20 ÷ 2 = 10, 10 ÷ 2 = 5.','Diviser par 3 : pense à la table de 3.'],questions:()=>make(2105,r=>divQ(r,[3,4]))},
 {titre:'Diviser par 6, 7, 8 et 9',description:'Les tables plus difficiles.',lecon:['Utilise la multiplication : 56 ÷ 8 ? Je cherche 8 × ? = 56. C’est 7.'],questions:()=>make(2106,r=>divQ(r,[6,7,8,9]))},
 {titre:'Division avec un reste',description:'17 ÷ 5 = 3, reste 2',lecon:['Parfois, le partage ne tombe pas juste : il reste quelque chose.','17 ÷ 5 : 5 × 3 = 15, il reste 2. On écrit : 17 ÷ 5 = 3 reste 2.','Le reste est toujours plus petit que le diviseur.'],questions:()=>make(2107,r=>{const b=int(r,2,9),q=int(r,1,9),rs=int(r,1,b-1),t=b*q+rs;return{type:'reste',texte:'Calcule : '+t+' ÷ '+b+' = ? reste ?',oral:'Combien fait '+t+' divisé par '+b+', et quel est le reste ?',visuel:{jetons:t<=40?t:0,groupes:0},q,r:rs,aide:b+' × '+q+' = '+(b*q)+'. Il reste '+t+' − '+(b*q)+' = '+rs+'.'}})},
 {titre:'Problèmes de division',description:'Des situations de la vie.',lecon:['Lis le problème deux fois.','Partager ou faire des groupes ? Les deux, c’est une division.','Attention au reste : parfois il faut un groupe de plus !'],questions:()=>make(2108,r=>{const t=int(r,0,3);
   if(t===0){const g=int(r,2,6),c=int(r,3,8);return{type:'nombre',texte:'Une enseignante a '+(g*c)+' crayons. Elle les partage également entre '+g+' tables. Combien de crayons y a-t-il sur chaque table ?',reponse:c,aide:(g*c)+' ÷ '+g+' = '+c+'.'}}
   if(t===1){const c=int(r,4,8),g=int(r,2,6);return{type:'nombre',texte:'Il y a '+(c*g)+' œufs. Une boîte contient '+c+' œufs. Combien de boîtes faut-il ?',reponse:g,aide:(c*g)+' ÷ '+c+' = '+g+' boîtes.'}}
   if(t===2){const p=int(r,4,6),n=p*int(r,2,5)+int(r,1,p-1),rep=Math.ceil(n/p);return{type:'nombre',texte:n+' élèves vont au musée. Une auto peut transporter '+p+' élèves. Combien d’autos faut-il pour que tout le monde y aille ?',reponse:rep,aide:n+' ÷ '+p+' = '+Math.floor(n/p)+' reste '+(n%p)+'. Il faut une auto de plus pour les '+(n%p)+' élèves qui restent : '+rep+' autos.'}}
   const p=int(r,2,5)*5,n=int(r,2,6);return{type:'nombre',texte:'Un paquet de '+n+' cartes coûte '+(p*n)+' ¢. Combien coûte une carte ?',reponse:p,aide:(p*n)+' ÷ '+n+' = '+p+' ¢.'}})},
 {titre:'Diviser des dizaines et des centaines',description:'80 ÷ 4, 600 ÷ 3',lecon:['80 ÷ 4 : c’est 8 dizaines ÷ 4 = 2 dizaines, donc 20.','600 ÷ 3 : 6 centaines ÷ 3 = 2 centaines, donc 200.'],questions:()=>make(2109,r=>{const b=int(r,2,9),q=int(r,1,9),m=pick(r,[10,100]);return calc(b*q*m,'÷',b,2,{v:[b*q*m,b,q*m],aide:(b*q)+' '+(m===10?'dizaines':'centaines')+' ÷ '+b+' = '+q+' '+(m===10?'dizaines':'centaines')+', donc '+(q*m)+'.'})})},
 {titre:'Diviser un nombre à 2 chiffres',description:'84 ÷ 4 = 80 ÷ 4 + 4 ÷ 4',lecon:['On décompose le nombre en parties faciles à diviser.','84 ÷ 4 : 80 ÷ 4 = 20 et 4 ÷ 4 = 1. Donc 84 ÷ 4 = 21.','72 ÷ 3 : 60 ÷ 3 = 20 et 12 ÷ 3 = 4. Donc 72 ÷ 3 = 24.'],questions:()=>make(2110,r=>{const b=int(r,2,6),q=int(r,11,Math.floor(99/b)),t=b*q,dz=Math.floor(q/10)*10*b;return calc(t,'÷',b,2,{v:[t,b,q],aide:'Décompose : '+dz+' ÷ '+b+' = '+(dz/b)+' et '+(t-dz)+' ÷ '+b+' = '+((t-dz)/b)+'. Total : '+q+'.'})})}
]};

/* ================= ADDING AND SUBTRACTING WITH REGROUPING =================
   Column calculation (type "colonnes" in moteur.js). The word used is always "regrouper" (regroup). */
const dig=(x,i)=>Math.floor(x/10**i)%10;
const nbRegAdd=(a,b)=>{let c=0,r=0;for(let i=0;i<4;i++){const t=dig(a,i)+dig(b,i)+r;r=t>=10?1:0;c+=r}return c};
const nbRegSou=(a,b)=>{let c=0,r=0;for(let i=0;i<4;i++){const t=dig(a,i)-r-dig(b,i);r=t<0?1:0;c+=r}return c};
const col=(a,op,b,aide)=>{const r=op==='+'?a+b:a-b;return{type:'colonnes',a,b,op,r,n:String(Math.max(a,b,r)).length,aide}};
/* Draws a and b until exactly the wanted number of regroupings is reached. */
const tire=(r,op,min,max,nb,minB)=>{for(let g=0;g<500;g++){let a=int(r,min,max),b=int(r,minB||min,max);if(op==='−'&&b>a)[a,b]=[b,a];if(op==='+'&&a+b>999)continue;if(op==='−'&&a===b)continue;const k=op==='+'?nbRegAdd(a,b):nbRegSou(a,b);if(typeof nb==='function'?nb(k,a,b):k===nb)return[a,b]}return[min+1,min]};
const AIDE_ADD0='Additionne les unités, puis les dizaines. Ici, pas besoin de regrouper.',AIDE_ADD='Si les unités font 10 ou plus : regroupe 10 unités en 1 dizaine. Écris le 1 en haut de la colonne des dizaines.';
const AIDE_SOU0='Soustrais les unités, puis les dizaines. Ici, pas besoin de regrouper.',AIDE_SOU='Si le chiffre du haut est plus petit : regroupe. Défais 1 dizaine en 10 unités, puis soustrais.';
const regrouper={id:'regrouper',titre:'Additionner et soustraire en regroupant',icone:'⁺¹⁰',couleur:'#0d5d6e',
 video:'Additionner-soustraire-en-regroupant.mp4',
 consigne:'Calcule en colonnes. Commence toujours par les unités, à droite.',
 niveaux:[
 {titre:'Additionner sans regrouper',description:'Deux chiffres. On commence par les unités.',questions:()=>make(1101,r=>{const[a,b]=tire(r,'+',10,88,0);return col(a,'+',b,AIDE_ADD0)})},
 {titre:'Additionner en regroupant les unités',description:'10 unités deviennent 1 dizaine.',questions:()=>make(1102,r=>{const[a,b]=tire(r,'+',12,79,(k,a,b)=>k===1&&a+b<100);return col(a,'+',b,AIDE_ADD)})},
 {titre:'Additionner avec 3 chiffres',description:'Un seul regroupement.',questions:()=>make(1103,r=>{const[a,b]=tire(r,'+',105,789,1,21);return col(a,'+',b,AIDE_ADD+' 10 dizaines deviennent 1 centaine.')})},
 {titre:'Additionner en regroupant deux fois',description:'Les unités, puis les dizaines.',questions:()=>make(1104,r=>{const[a,b]=tire(r,'+',115,789,2,45);return col(a,'+',b,AIDE_ADD+' Si les dizaines font 10 ou plus, regroupe aussi : 10 dizaines deviennent 1 centaine.')})},
 {titre:'Soustraire sans regrouper',description:'Deux chiffres. On commence par les unités.',questions:()=>make(1105,r=>{const[a,b]=tire(r,'−',11,99,0);return col(a,'−',b,AIDE_SOU0)})},
 {titre:'Soustraire en regroupant une dizaine',description:'1 dizaine devient 10 unités.',questions:()=>make(1106,r=>{const[a,b]=tire(r,'−',21,98,1,11);return col(a,'−',b,AIDE_SOU)})},
 {titre:'Soustraire avec 3 chiffres',description:'Un seul regroupement.',questions:()=>make(1107,r=>{const[a,b]=tire(r,'−',120,989,(k,a,b)=>k===1&&a-b>=100,21);return col(a,'−',b,AIDE_SOU+' S’il manque des dizaines, défais 1 centaine en 10 dizaines.')})},
 {titre:'Soustraire en regroupant deux fois',description:'Aussi avec des zéros, comme 300 − 146.',questions:()=>make(1108,r=>{let a,b;if(r()<.4){for(let g=0;g<200;g++){a=int(r,2,9)*100+pick(r,[0,int(r,1,9)]);b=int(r,101,a-30);if(nbRegSou(a,b)>=2)break}}else[a,b]=tire(r,'−',200,989,2,101);return col(a,'−',b,AIDE_SOU+' Avec un zéro aux dizaines : défais d’abord 1 centaine en 10 dizaines, puis 1 dizaine en 10 unités.')})},
 {titre:'Additions et soustractions mêlées',description:'Lis bien le signe avant de commencer.',questions:()=>make(1109,r=>{if(r()<.5){const[a,b]=tire(r,'+',105,789,k=>k>=1,21);return col(a,'+',b,'C’est une addition. '+AIDE_ADD)}const[a,b]=tire(r,'−',150,989,k=>k>=1,21);return col(a,'−',b,'C’est une soustraction. '+AIDE_SOU)})}
 ]};

/* ============================ PATTERNS ============================ */
const suite=(start,step,len)=>{const nums=[];for(let i=0;i<len;i++)nums.push(start+i*step);return{type:'nombre',texte:'Observe la suite. Quel nombre vient ensuite ?',visuel:{suite:nums},reponse:start+len*step,aide:step>0?'Chaque nombre augmente de '+step+'.':'Chaque nombre diminue de '+(-step)+'.'}};
const suites={id:'suites',titre:'Compléter une suite',icone:'2 4 6',couleur:'#12525c',
 consigne:'Trouve le nombre qui vient ensuite.',
 niveaux:[
 {titre:'Compter de 1 en 1',description:'',questions:()=>make(501,r=>suite(int(r,1,20),1,5))},
 {titre:'Compter de 2, de 5 ou de 10',description:'',questions:()=>make(502,r=>{const s=pick(r,[2,5,10]);return suite(s*int(r,0,5),s,4)})},
 {titre:'Compter de 3 ou de 4',description:'',questions:()=>make(503,r=>{const s=pick(r,[3,4]);return suite(int(r,0,12),s,4)})},
 {titre:'Les suites qui descendent',description:'On enlève à chaque fois.',questions:()=>make(504,r=>{const s=pick(r,[1,2,5,10]);return suite(s*int(r,5,10)+(s===1?int(r,0,9):0),-s,4)})},
 {titre:'Toutes les suites',description:'Monter ou descendre, avec de grands bonds.',questions:()=>make(505,r=>{const s=pick(r,[3,4,6,7,8,9,15,20,25]);return r()<.5?suite(int(r,0,30),s,4):suite(s*int(r,6,12),-s,4)})}
 ]};

/* ===================== READING POSITIONS ON A MAP =====================
   Gradual introduction to the Cartesian plane (type "plan" in moteur.js).
   Levels 1 to 8: first quadrant. Levels 9 to 14: negative numbers (−5 to 5).
   Modes: case, caseLire, deplacer, lire, placer, mystere, partie. */
const LETTRES='ABCDE';
const neg=v=>v<0?'−'+(-v):String(v);
const coord=(x,y)=>'('+neg(x)+', '+neg(y)+')';
/* Three choices to read a point: the right answer and two traps, shuffled. */
function choixPoint(r,x,y,pieges){const l=[[x,y]];for(const p of pieges)if(!l.some(o=>o[0]===p[0]&&o[1]===p[1]))l.push(p);
  let k=-1;while(l.length<3){const d=[[x+1,y],[x,y+1],[x-1,y],[x,y-1]][++k];if(!l.some(o=>o[0]===d[0]&&o[1]===d[1]))l.push(d)}
  const m=l.map(p=>[r(),p]).sort((a,b)=>a[0]-b[0]).map(a=>a[1]);return{choix:m.map(p=>coord(p[0],p[1])),reponse:m.findIndex(p=>p[0]===x&&p[1]===y)}}
const AIDE_LIRE='Lis d’abord en bas, sur l’axe rouge (x), puis sur le côté, sur l’axe bleu (y).';
const AIDE_PLACER='Pars de 0 : avance sur l’axe rouge (x), puis monte vers le nombre de l’axe bleu (y).';
const AIDE_NEG='Le signe − veut dire : à gauche pour x, vers le bas pour y.';
const lire=(r,x,y,o,pieges,aide)=>Object.assign({type:'plan',mode:'lire',min:0,max:6,pt:[x,y],aide:aide||AIDE_LIRE},o,choixPoint(r,x,y,pieges));
const placer=(x,y,o,aide)=>Object.assign({type:'plan',mode:'placer',min:0,max:6,cible:[x,y],aide:aide||AIDE_PLACER},o);
const nz=(r,a,b)=>{let v;do v=int(r,a,b);while(v===0);return v};
function deplacer(x,y,o,direct){
  const pas=(n,s1,s2)=>n>0?s1+' de '+n:s2+' de '+(-n);
  const texte=direct?'Va au point '+coord(x,y)+' avec les flèches, puis clique sur Vérifier.'
    :pas(x,'Avance','Recule')+(x>0?' vers la droite':' vers la gauche')+', puis '+pas(y,'monte','descends')+'. Utilise les flèches, puis clique sur Vérifier.';
  return Object.assign({type:'plan',mode:'deplacer',min:0,max:6,cible:[x,y],texte,aide:'Avance ou recule d’abord sur l’axe rouge, puis monte ou descends.'},o)}
const mystere=(pts,forme,o)=>pts.map((p,k)=>Object.assign({type:'plan',mode:'mystere',min:0,max:8,pts,k,forme,cible:p,aide:AIDE_PLACER},o));
function rectangle(r,o){const n=o.min<0;for(;;){const x1=int(r,o.min,o.max-3),y1=int(r,o.min,o.max-3),x2=int(r,x1+3,o.max),y2=int(r,y1+2,o.max);
  if(n&&!(x1<0&&y1<0||x1<0&&y2<0||x2>0&&y1<0))continue;
  const c=[[x1,y1],[x2,y1],[x2,y2],[x1,y2]],k=int(r,0,3),m=[0,1,2,3].filter(j=>j!==k);
  return Object.assign({type:'plan',mode:'placer',cible:c[k],donnes:m.map((j,t)=>['ABC'[t],c[j][0],c[j][1]]),
    texte:'A, B et C sont trois coins d’un rectangle. Clique sur le quatrième coin D, puis sur Vérifier.',aide:'Le coin D est sur la même ligne qu’un coin et sur la même colonne qu’un autre.'},o)}}
const DECOR_ILE=['🌴','⛰️','🏠','🌳','⛵','🐢'];
function carte(r,o,mode){const pris=new Set();const lib=()=>{for(;;){const x=int(r,o.min,o.max),y=int(r,o.min,o.max),k=x+','+y;if(x&&y&&!pris.has(k)){pris.add(k);return[x,y]}}};
  const deco=[0,1,2].map(k=>[...lib(),DECOR_ILE[(k+int(r,0,5))%6]]);
  if(mode==='lire'){const [x,y]=lib(),objet=pick(r,[['⛵','le bateau'],['🐢','la tortue'],['🏠','la cabane']]);
    return Object.assign({type:'plan',mode:'lire',pt:[x,y],emoji:objet[0],deco:deco.filter(d=>d[2]!==objet[0]),texte:'Sur la carte de l’île, quelle est la position de '+objet[1]+' ?',aide:AIDE_LIRE},o,choixPoint(r,x,y,o.min<0?[[y,x],[-x,y]]:[[y,x]]))}
  const [x,y]=lib();return Object.assign({type:'plan',mode:'placer',cible:[x,y],deco,tresor:true,texte:'Le trésor est caché en '+coord(x,y)+'. Clique sur sa cachette, puis sur Vérifier.',aide:AIDE_PLACER},o)}
const MAISON=[[1,1],[7,1],[7,4],[4,7],[1,4]],DIAMANT=[[2,6],[6,6],[8,4],[4,0],[0,4]];
const MAISON_N=[[-4,-4],[4,-4],[4,1],[0,5],[-4,1]],CRAYON=[[-5,2],[2,2],[5,0],[2,-2],[-5,-2]];
const QUART=[['En haut à gauche',-1,1],['En haut à droite',1,1],['En bas à gauche',-1,-1],['En bas à droite',1,-1]];
const PLEIN={min:-5,max:5};
const trajets={id:'trajets',titre:'Lire des positions sur un plan',icone:'(x, y)',couleur:'#08665d',
 consigne:'Repère-toi sur le plan.',
 niveaux:[
 {titre:'La grille',description:'Une lettre en bas, un chiffre sur le côté (comme C2).',
  questions:()=>make(1101,(r,i)=>{let c,l;do{c=int(r,0,4);l=int(r,0,4)}while(c===l);
    if(i%2===0)return{type:'plan',mode:'case',cible:[c,l],reponse:LETTRES[c]+(l+1),texte:'Clique sur la case '+LETTRES[c]+(l+1)+', puis sur Vérifier.',aide:'Trouve d’abord la lettre en bas, puis monte jusqu’au chiffre.'};
    const e=pick(r,['⭐','❤️','🐱','🍎','⚽']),bon=LETTRES[c]+(l+1),inv=LETTRES[l]+(c+1),aut=LETTRES[c]+(((l+2)%5)+1);
    const ch=[bon,inv,aut].map(s=>[r(),s]).sort((a,b)=>a[0]-b[0]).map(a=>a[1]);
    return{type:'plan',mode:'caseLire',cible:[c,l],emoji:e,choix:ch,reponse:ch.indexOf(bon),texte:'Dans quelle case est le dessin ?',aide:'Lis d’abord la lettre en bas, puis le chiffre sur le côté.'}})},
 {titre:'Se déplacer',description:'Partir de (0, 0) : avancer vers la droite, puis monter.',
  questions:()=>make(1102,(r,i)=>deplacer(int(r,1,5),int(r,1,5),{},i>=6))},
 {titre:'Lire un point',description:'Plan de 0 à 6 : trouver la position d’un point.',
  questions:()=>make(1103,r=>{let x,y;do{x=int(r,1,6);y=int(r,1,6)}while(x===y);return lire(r,x,y,{},[[y,x]])})},
 {titre:'Placer un point',description:'Plan de 0 à 6 : cliquer à la bonne position.',
  questions:()=>make(1104,r=>placer(int(r,1,6),int(r,1,6)))},
 {titre:'Sur les axes',description:'Les points avec un 0, posés sur un axe.',
  questions:()=>make(1105,(r,i)=>{const v=int(r,1,6),surX=r()<.5,x=surX?v:0,y=surX?0:v;
    const aide=surX?'0 pas vers le haut : le point reste sur l’axe rouge.':'0 pas vers la droite : le point reste sur l’axe bleu.';
    return i%2?lire(r,x,y,{},[[y,x],[v,v]],aide):placer(x,y,{},aide)})},
 {titre:'Dessin mystère',description:'Placer les points dans l’ordre : un dessin apparaît.',
  questions:()=>mystere(MAISON,'une maison').concat(mystere(DIAMANT,'un diamant'))},
 {titre:'Plan de 0 à 10',description:'Grande grille, nombres écrits de 2 en 2.',
  questions:()=>make(1107,(r,i)=>{let x,y;do{x=int(r,1,10);y=int(r,1,10)}while(x===y||x%2+y%2===0);const o={max:10,pas:2},aide='Les nombres sont écrits de 2 en 2 : compte les lignes entre deux nombres.';
    return i%2?lire(r,x,y,o,[[y,x]],aide):placer(x,y,o,aide)})},
 {titre:'Chasse au trésor',description:'Coin d’un rectangle et carte de l’île.',
  questions:()=>{const r=rng(1108),o={min:0,max:8};return[rectangle(r,o),carte(r,o,'lire'),carte(r,o,'placer'),rectangle(r,o),carte(r,o,'lire'),carte(r,o,'placer'),rectangle(r,o),carte(r,o,'lire'),carte(r,o,'placer'),rectangle(r,o)]}},
 {titre:'Les quatre parties',description:'Plan de −5 à 5 : où est le point ?',
  questions:()=>make(1109,(r,i)=>{const q=QUART[(i+int(r,0,3))%4],x=q[1]*int(r,1,5),y=q[2]*int(r,1,5);
    return{type:'plan',mode:'partie',...PLEIN,pt:[x,y],choix:QUART.map(t=>t[0]),reponse:QUART.indexOf(q),texte:'Dans quelle partie du plan est le point P ?',aide:'Regarde d’abord à gauche ou à droite de l’axe bleu, puis en haut ou en bas de l’axe rouge.'}})},
 {titre:'Se déplacer partout',description:'Partir du centre : à gauche et en bas, c’est négatif.',
  questions:()=>make(1110,(r,i)=>{let x,y;do{x=nz(r,-5,5);y=nz(r,-5,5)}while(x>0&&y>0);return deplacer(x,y,PLEIN,i>=6)})},
 {titre:'Lire un point négatif',description:'Plan de −5 à 5 : lire les deux nombres et leur signe.',
  questions:()=>make(1111,r=>{let x,y;do{x=nz(r,-5,5);y=nz(r,-5,5)}while(Math.abs(x)===Math.abs(y)||(x>0&&y>0));return lire(r,x,y,PLEIN,[[Math.abs(x),Math.abs(y)],[y,x]],AIDE_NEG)})},
 {titre:'Placer un point négatif',description:'Plan de −5 à 5 : cliquer à la bonne position.',
  questions:()=>make(1112,r=>{let x,y;do{x=int(r,-5,5);y=int(r,-5,5)}while((x>=0&&y>=0)||(!x&&!y));return placer(x,y,PLEIN,AIDE_NEG)})},
 {titre:'Dessin mystère négatif',description:'Un dessin qui traverse les quatre parties du plan.',
  questions:()=>mystere(MAISON_N,'une maison',PLEIN).concat(mystere(CRAYON,'un crayon',PLEIN))},
 {titre:'Trésor sur le plan complet',description:'Rectangles et carte au trésor de −5 à 5.',
  questions:()=>{const r=rng(1114),o=PLEIN;return[rectangle(r,o),carte(r,o,'lire'),carte(r,o,'placer'),rectangle(r,o),carte(r,o,'lire'),carte(r,o,'placer'),rectangle(r,o),carte(r,o,'lire'),carte(r,o,'placer'),rectangle(r,o)]}}
 ]};

/* ===================== DRAWING ON A PLANE =====================
   Type "dessin" in moteur.js: a shape is drawn on the plane, the student reads the
   position of each vertex (horizontal steps = x, vertical steps = y) and completes the table.
   Animated demo of point A in exercises 1 and 2 of each level (button afterwards). */
const FORMES={
 segment:[['un segment',[[0,0],[3,2]]],['un segment',[[0,3],[4,0]]],['un segment',[[0,0],[5,1]]],['un segment',[[1,0],[0,4]]]],
 triangle:[['un triangle',[[0,0],[4,0],[2,3]]],['un triangle',[[0,0],[3,0],[0,4]]],['un triangle',[[0,0],[4,1],[1,4]]],['un triangle',[[1,0],[5,2],[0,3]]]],
 quadri:[['un carré',[[0,0],[3,0],[3,3],[0,3]]],['un rectangle',[[0,0],[5,0],[5,2],[0,2]]],['un rectangle',[[0,0],[4,0],[4,3],[0,3]]],['un losange',[[2,0],[4,2],[2,4],[0,2]]],['un parallélogramme',[[0,0],[4,0],[5,3],[1,3]]]],
 cinq:[['une maison',[[0,0],[4,0],[4,3],[2,5],[0,3]]],['un pentagone',[[1,0],[3,0],[4,2],[2,4],[0,2]]],['un panneau',[[0,0],[3,0],[5,2],[3,4],[0,4]]]],
 avances:[['la lettre L',[[0,0],[3,0],[3,1],[1,1],[1,4],[0,4]]],['une flèche',[[0,1],[3,1],[3,0],[5,2],[3,4],[3,3],[0,3]]],['un hexagone',[[1,0],[3,0],[4,2],[3,4],[1,4],[0,2]]]],
 grands:[['un sapin',[[3,0],[5,0],[5,2],[8,2],[4,8],[0,2],[3,2]]],['une fusée',[[2,0],[6,0],[6,6],[4,9],[2,6]]],['une maison',[[0,0],[6,0],[6,5],[3,8],[0,5]]],['un bateau',[[0,3],[9,3],[7,0],[2,0]]]],
 centre:[['un carré',[[-2,-2],[2,-2],[2,2],[-2,2]]],['un losange',[[0,3],[3,0],[0,-3],[-3,0]]],['un triangle',[[-3,-2],[3,-2],[0,3]]],['un rectangle',[[-4,-1],[3,-1],[3,2],[-4,2]]]],
 centreAvance:[['une maison',[[-3,-3],[3,-3],[3,1],[0,4],[-3,1]]],['une flèche',[[-4,-1],[1,-1],[1,-3],[4,0],[1,3],[1,1],[-4,1]]],['un hexagone',[[-2,-3],[2,-3],[4,0],[2,3],[-2,3],[-4,0]]]]
};
/* Places the shape on the plane graded from −max to +max, to go in all 4 directions.
   "partie" mode: the whole shape in one part of the plane (the exercise's part, in turn);
   "axe" mode: one side of the shape touches an axis; "libre" mode: anywhere (it can cross the axes). */
const QUADRANTS=[[1,1],[-1,1],[-1,-1],[1,-1]];
function placerForme(r,pts,o,mode,i){
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);
  if(mode==='centre'){const dx=int(r,Math.max(-1,o.min-Math.min(...xs)),Math.min(1,o.max-Math.max(...xs))),dy=int(r,Math.max(-1,o.min-Math.min(...ys)),Math.min(1,o.max-Math.max(...ys)));return pts.map(([x,y])=>[x+dx,y+dy])}
  const base=pts.map(([x,y])=>[x-Math.min(...xs),y-Math.min(...ys)]);
  if(mode==='libre'){const dx=int(r,o.min,o.max-w),dy=int(r,o.min,o.max-h);return base.map(([x,y])=>[x+dx,y+dy])}
  const [sx,sy]=QUADRANTS[i%4],bas=mode==='axe'?0:1;
  let dx=int(r,bas,o.max-w),dy=int(r,bas,o.max-h);
  if(mode==='axe'){if(r()<.5)dx=0;else dy=0}
  return base.map(([x,y])=>[sx*(x+dx),sy*(y+dy)])}
function dessinQ(r,famille,o,i,mode,extra){const [nom,forme]=pick(r,FORMES[famille]);const pts=placerForme(r,forme,o,mode,i);
  return Object.assign({type:'dessin',...o,forme:nom,pts,demo:i<2,texte:'Voici '+nom+'. Lis la position de chaque point et complète la table de valeurs.',
    aide:'Pour chaque point : compte d’abord les pas horizontaux depuis 0 (x : à droite +, à gauche −), puis les pas verticaux (y : en haut +, en bas −).'},extra)}
const P6={min:-6,max:6},P10={min:-10,max:10,pas:2};
const dessins={id:'dessins',titre:'Dessiner sur un plan',icone:'(x, y)',couleur:'#08665d',
 video:'Plan-cartesien-le-signe.mp4',
 consigne:'Lis la position des points du dessin.',
 niveaux:[
 {titre:'Découvrir le plan',description:'Pas horizontaux = x, pas verticaux = y, dans les 4 sens. Un point à la fois.',intro:'plan',
  questions:()=>make(1301,(r,i)=>{const [sx,sy]=i<3?[1,1]:QUADRANTS[(i-2)%4];let x,y;do{x=int(r,1,5);y=int(r,1,5)}while(x===y);
    return{type:'dessin',min:-6,max:6,forme:'un point',pts:[[sx*x,sy*y]],noms:['P'],demo:false,texte:'Combien de pas horizontaux (x) et de pas verticaux (y) faut-il pour aller de 0 au point P ? Écris-les dans la table.',
      aide:'Horizontal : à droite, x est positif ; à gauche, x est négatif (−). Vertical : en haut, y est positif ; en bas, y est négatif (−).'}})},
 {titre:'Un segment',description:'Deux points, dans une des quatre parties du plan.',questions:()=>make(1302,(r,i)=>dessinQ(r,'segment',P6,i,'partie'))},
 {titre:'Un triangle',description:'Trois points, dans une des quatre parties du plan.',questions:()=>make(1303,(r,i)=>dessinQ(r,'triangle',P6,i,'partie'))},
 {titre:'Carrés et rectangles',description:'Quatre points, dans une des quatre parties du plan.',questions:()=>make(1304,(r,i)=>dessinQ(r,'quadri',P6,i,'partie'))},
 {titre:'Des points sur les axes',description:'Quand un point touche un axe, x ou y vaut 0.',lecon:['Si un point est posé sur l’axe rouge, il n’a fait aucun pas vertical : y = 0.','Si un point est posé sur l’axe bleu, il n’a fait aucun pas horizontal : x = 0.'],
  questions:()=>make(1305,(r,i)=>dessinQ(r,pick(r,['triangle','quadri']),P6,i,'axe'))},
 {titre:'Cinq points',description:'Maison, pentagone, panneau, n’importe où sur le plan.',questions:()=>make(1306,(r,i)=>dessinQ(r,'cinq',P6,i,'libre'))},
 {titre:'Formes avancées',description:'La lettre L, une flèche, un hexagone (6 ou 7 points).',questions:()=>make(1307,(r,i)=>dessinQ(r,'avances',P6,i,'libre'))},
 {titre:'Grand plan de −10 à 10',description:'Nombres écrits de 2 en 2 : compte bien les pas.',lecon:['Sur ce grand plan, les nombres sont écrits seulement de 2 en 2, d’un côté comme de l’autre.','Pour un nombre impair, compte les lignes : entre 2 et 4, il y a 3 ; entre −2 et −4, il y a −3.'],
  questions:()=>make(1308,(r,i)=>dessinQ(r,'grands',P10,i,i%3===2?'libre':'partie'))},
 {titre:'Autour de 0',description:'Des formes qui traversent les quatre parties du plan.',lecon:['Une même forme peut avoir des points dans les quatre parties du plan.','Regarde bien le signe de chaque nombre : à gauche ou en bas, il est négatif (−).'],
  questions:()=>make(1309,(r,i)=>dessinQ(r,'centre',P6,i,'centre'))},
 {titre:'Formes avancées autour de 0',description:'Maison, flèche, hexagone autour de 0.',
  questions:()=>make(1310,(r,i)=>dessinQ(r,'centreAvance',P6,i,'centre'))}
 ]};

/* ===================== DRAWING A LINE WITH A TABLE OF VALUES =====================
   Type "droite" in moteur.js. Each level has a short explanation ("lecon"),
   opened on the first exercise. Rules y = a·x + b with whole numbers. */
const regle=(a,b)=>'y = '+(a===1?'':a)+'x'+(b>0?' + '+b:b<0?' − '+(-b):'');
const regleOrale=(a,b)=>'y égale '+(a===1?'':a+' ')+'x'+(b>0?' plus '+b:b<0?' moins '+(-b):'');
const valeurY=(a,b,x)=>a*x+b;
const tableDe=(a,b,xs)=>({a,b,regle:regle(a,b),regleOrale:regleOrale(a,b),xs,ys:xs.map(x=>valeurY(a,b,x))});
const D1={min:0,max:10},DN={min:-6,max:6};
/* Chooses a rule whose y values all stay on the plane. */
function regleAuHasard(r,o,as,bs,xs){for(;;){const a=pick(r,as),b=pick(r,bs);if(xs.every(x=>{const y=a*x+b;return y>=o.min&&y<=o.max}))return[a,b]}}
const trois=(r,choix)=>{const l=choix.slice();const out=[];while(out.length<3){const k=int(r,0,l.length-1);out.push(l.splice(k,1)[0])}return out.sort((p,q)=>p-q)};
const droites={id:'droites',titre:'La droite · niveau avancé',icone:'y = ax + b',couleur:'#12525c',
 consigne:'Utilise la table de valeurs.',
 niveaux:[
 {titre:'Lire une table de valeurs',description:'Chaque colonne relie une valeur de x à une valeur de y.',
  lecon:['Une table de valeurs a deux lignes : en haut les valeurs de x, en bas les valeurs de y.','Chaque colonne va ensemble. Si la colonne montre x = 2 et y = 5, alors quand x vaut 2, y vaut 5.'],
  questions:()=>make(1201,(r,i)=>{const [a,b]=pick(r,[[1,int(r,1,4)],[int(r,2,3),0],[2,1]]);const t=tableDe(a,b,[0,1,2,3,4]);const k=int(r,0,4);
    return i%3===2?{type:'droite',mode:'tableLire',table:t,cherche:'x',k,reponse:t.xs[k],texte:'Dans la table, quand y = '+neg(t.ys[k])+', combien vaut x ?',aide:'Trouve '+neg(t.ys[k])+' dans la ligne du bas (y), puis regarde le nombre juste au-dessus.'}
      :{type:'droite',mode:'tableLire',table:t,cherche:'y',k,reponse:t.ys[k],texte:'Dans la table, quand x = '+t.xs[k]+', combien vaut y ?',aide:'Trouve '+t.xs[k]+' dans la ligne du haut (x), puis descends dans la même colonne.'}})},
 {titre:'Compléter : y = x + b',description:'Remplacer x par un nombre, puis additionner.',
  lecon:['La règle dit comment trouver y à partir de x.','Pour y = x + 3, on remplace x par le nombre de la colonne. Exemple : x = 2, alors y = 2 + 3 = 5.'],
  questions:()=>make(1202,(r,i)=>{const t=tableDe(1,int(r,1,6),[0,1,2,3,4]);return{type:'droite',mode:'completer',table:t,trous:i<5?[int(r,1,4)]:trois(r,[0,1,2,3,4]).slice(0,2),aide:'Ajoute '+t.b+' au nombre de x.'}})},
 {titre:'Compléter : y = ax',description:'Multiplier x par un nombre.',
  lecon:['y = 2x veut dire y = 2 × x.','Exemple : pour x = 4, y = 2 × 4 = 8. Pour x = 0, y = 0.'],
  questions:()=>make(1203,(r,i)=>{const t=tableDe(int(r,2,5),0,[0,1,2,3,4]);return{type:'droite',mode:'completer',table:t,trous:i<5?[int(r,1,4)]:trois(r,[1,2,3,4]).slice(0,2),aide:'Multiplie le nombre de x par '+t.a+'.'}})},
 {titre:'Compléter : y = ax + b',description:'Deux étapes : multiplier, puis additionner.',
  lecon:['La règle y = 2x + 1 se calcule en deux étapes.','1. Multiplier : 2 × x.  2. Additionner : + 1.','Exemple : pour x = 3, 2 × 3 = 6, puis 6 + 1 = 7. Donc y = 7.'],
  questions:()=>make(1204,(r,i)=>{const t=tableDe(int(r,2,3),int(r,1,4),[0,1,2,3,4]);return{type:'droite',mode:'completer',table:t,trous:i<4?[int(r,1,4)]:trois(r,[0,1,2,3,4]).slice(0,i<7?2:3),aide:'Calcule d’abord '+t.a+' × x, puis ajoute '+t.b+'.'}})},
 {titre:'De la colonne au point',description:'Une colonne de la table devient un point (x, y).',
  lecon:['Chaque colonne de la table devient un point du plan.','La colonne x = 2, y = 5 devient le point (2, 5) : 2 vers la droite, puis 5 vers le haut.'],
  questions:()=>make(1205,r=>{const xs=[0,1,2,3,4];const [a,b]=regleAuHasard(r,D1,[1,2],[0,1,2,3,4,5],xs);const t=tableDe(a,b,xs),k=int(r,0,4);
    return{type:'droite',mode:'pointTable',...D1,table:t,k,cibles:[[t.xs[k],t.ys[k]]],texte:'Place le point qui correspond à la colonne colorée, puis clique sur Vérifier.',aide:'Le nombre du haut (x) se lit sur l’axe rouge, le nombre du bas (y) sur l’axe bleu.'}})},
 {titre:'Placer tous les points',description:'Les points de la table sont alignés : la droite apparaît.',
  lecon:['Place un point pour chaque colonne de la table.','Si les points sont bien placés, ils sont alignés : on peut tracer une droite qui passe par tous les points.'],
  questions:()=>make(1206,r=>{const xs=trois(r,[0,1,2,3,4,5]);const [a,b]=regleAuHasard(r,D1,[1,2,3],[0,1,2,3,4],xs);const t=tableDe(a,b,xs);
    return{type:'droite',mode:'placerTous',...D1,table:t,cibles:t.xs.map((x,k)=>[x,t.ys[k]]),texte:'Place les 3 points de la table sur le plan, puis clique sur Vérifier.',aide:'Une colonne = un point. Clique encore sur un point pour l’enlever.'}})},
 {titre:'Compléter et tracer',description:'Calculer les y, puis placer les points.',
  lecon:['Pour tracer une droite avec une règle :','1. Compléter la table de valeurs avec la règle.','2. Placer chaque point (x, y) sur le plan.','3. Les points alignés forment la droite.'],
  questions:()=>make(1207,r=>{const xs=trois(r,[0,1,2,3,4]);const [a,b]=regleAuHasard(r,D1,[1,2,3],[0,1,2,3,4],xs);const t=tableDe(a,b,xs);
    return{type:'droite',mode:'completerTracer',...D1,table:t,trous:[0,1,2],cibles:t.xs.map((x,k)=>[x,t.ys[k]]),texte:'Complète la table avec la règle '+t.regle+', place les 3 points, puis clique sur Vérifier.',aide:'Calcule chaque y avec la règle, puis place un point pour chaque colonne.'}})},
 {titre:'Lire une droite',description:'Trouver y sur la droite pour une valeur de x.',
  lecon:['La droite passe par beaucoup de points.','Pour trouver y quand x = 4 : pars de 4 sur l’axe rouge, monte jusqu’à la droite, puis lis le nombre sur l’axe bleu.'],
  questions:()=>make(1208,r=>{const [a,b]=regleAuHasard(r,D1,[1,2],[0,1,2,3,4],[0,4]);const xmax=Math.floor((10-b)/a),x=int(r,1,Math.min(5,xmax));const t=tableDe(a,b,[]);
    return{type:'droite',mode:'lireDroite',...D1,table:t,x,reponse:valeurY(a,b,x),texte:'Sur la droite, quand x = '+x+', combien vaut y ?',aide:'Pars de '+x+' sur l’axe rouge, monte jusqu’à la droite, puis regarde l’axe bleu.'}})},
 {titre:'Trouver la règle',description:'Quelle règle marche pour toute la table ?',
  lecon:['Pour trouver la règle, essaie-la sur chaque colonne.','La bonne règle donne le bon y pour toutes les colonnes, pas seulement pour une.'],
  questions:()=>make(1209,r=>{const a=int(r,1,3),b=int(r,a===1?1:0,4);const t=tableDe(a,b,[0,1,2,3]);
    /* Trap: a rule that only works for the x = 1 column. */
    const p1=[a+b,0],p2=a===1?[2,b-1]:[a,b+1];const ch=[[a,b],p1,p2].filter((p,k,l)=>l.findIndex(o=>o[0]===p[0]&&o[1]===p[1])===k);
    while(ch.length<3)ch.push([a+ch.length,b]);const m=ch.map(p=>[r(),p]).sort((u,v)=>u[0]-v[0]).map(u=>u[1]);
    return{type:'droite',mode:'regle',table:t,choix:m.map(p=>regle(p[0],p[1])),reponse:m.findIndex(p=>p[0]===a&&p[1]===b),texte:'Quelle règle donne cette table de valeurs ?',aide:'Essaie chaque règle avec x = 0, puis avec x = 2.'}})},
 {titre:'Avec des nombres négatifs',description:'Plan de −6 à 6 : x et y peuvent être négatifs.',
  lecon:['x peut être un nombre négatif.','Exemple avec y = 2x + 1 et x = −2 : 2 × (−2) = −4, puis −4 + 1 = −3. Le point est (−2, −3).','Un nombre négatif de x va vers la gauche, un nombre négatif de y va vers le bas.'],
  questions:()=>make(1210,(r,i)=>{const xs=[int(r,-3,-1),int(r,0,1),int(r,2,3)];const [a,b]=regleAuHasard(r,DN,[1,2],[-3,-2,-1,1,2,3],xs);const t=tableDe(a,b,xs),c=t.xs.map((x,k)=>[x,t.ys[k]]);
    if(i<4)return{type:'droite',mode:'completer',table:t,trous:i%2?[0,2]:[0,1],aide:'Avec x négatif : '+t.a+' × un nombre négatif donne un nombre négatif.'};
    if(i<7)return{type:'droite',mode:'placerTous',...DN,table:t,cibles:c,texte:'Place les 3 points de la table sur le plan, puis clique sur Vérifier.',aide:'Un x négatif va vers la gauche, un y négatif va vers le bas.'};
    return{type:'droite',mode:'completerTracer',...DN,table:t,trous:[0,1,2],cibles:c,texte:'Complète la table avec la règle '+t.regle+', place les 3 points, puis clique sur Vérifier.',aide:'Calcule chaque y avec la règle. Attention aux signes.'}})}
 ]};

/* ===================== CHALLENGES: RIDDLES AND LOGIC CHALLENGES =====================
   Activities of the Challenges page (categorie:'defis'), medium level.
   Engine types: "quiz" (choice + explanation), "memo" (pairs), "simon" (colour sequence). */
const melange=(r,l)=>l.map(x=>[r(),x]).sort((a,b)=>a[0]-b[0]).map(a=>a[1]);
/* Choice question: the right answer is l[0] before shuffling. */
function quizQ(r,base,l,expl){const ch=melange(r,l);return Object.assign({type:'quiz',choix:ch,reponse:ch.indexOf(l[0]),expl},base)}
const devin=(r,indices,l,expl)=>quizQ(r,{titre:'Qui suis-je ?',indices,aide:'Relis chaque indice : la bonne réponse les respecte tous.'},l,expl);
const fixe=(seed,liste)=>()=>{const r=rng(seed);return liste.map(f=>f(r))};
/* Number riddles: 4 choices in a range, only one has the property. */
const PROP=[[n=>n%2===0,'Je suis pair.'],[n=>n%2===1,'Je suis impair.'],[n=>n%3===0,'Je suis un multiple de 3.'],[n=>n%5===0,'Je suis un multiple de 5.'],[n=>n%4===0,'Je suis un multiple de 4.']];
const sommeCh=n=>String(n).split('').reduce((s,c)=>s+Number(c),0);
function devinNombre(r,min,max,deux){for(;;){const a=int(r,min,max-6),choix=[];while(choix.length<4){const v=int(r,a,a+6);if(!choix.includes(v))choix.push(v)}
  const n=choix[0],props=PROP.filter(p=>p[0](n)).map(p=>[p[0],p[1]]);props.push([v=>sommeCh(v)===sommeCh(n),'La somme de mes chiffres est '+sommeCh(n)+'.']);
  const lo=Math.min(...choix),hi=Math.max(...choix),ind=['Je suis entre '+(lo-1)+' et '+(hi+1)+'.'];
  const bonnes=deux?props.flatMap((p,i)=>props.slice(i+1).map(q=>[p,q])):props.map(p=>[p]);
  const ok=bonnes.filter(ps=>choix.filter(v=>ps.every(p=>p[0](v))).length===1);
  if(!ok.length||n<10&&min>=10)continue;const ps=pick(r,ok);return devin(r,ind.concat(ps.map(p=>p[1])),choix.map(String),n+' respecte tous les indices.')}}
const OBJETS=[
 [['J’ai des aiguilles, mais je ne couds pas.','Je ne parle pas, mais je te dis l’heure.'],['🕰️ Une horloge','🧵 Un fil','🌲 Un sapin','📌 Une punaise'],'Les aiguilles de l’horloge montrent l’heure.'],
 [['J’ai des dents, mais je ne mange pas.','Je sers à démêler les cheveux.'],['Un peigne','Une scie','Une fourchette','Une brosse à dents'],'Le peigne a des dents pour les cheveux.'],
 [['J’ai un lit, mais je ne dors jamais.','Je coule, mais je ne tombe pas.'],['🏞️ Une rivière','⛰️ Une montagne','🛣️ Une route','🌧️ La pluie'],'Le lit d’une rivière, c’est le fond où l’eau coule.'],
 [['J’ai des touches, mais je n’ouvre aucune porte.','On m’utilise pour écrire à l’ordinateur.'],['⌨️ Un clavier','🔑 Une clé','🔒 Un cadenas','📱 Un téléphone'],'Les touches du clavier servent à écrire.'],
 [['Je monte et je descends…','… mais je ne bouge jamais.'],['Un escalier','Un ascenseur','Une balançoire','Un ballon'],'On monte et on descend l’escalier, mais lui ne bouge pas.'],
 [['Plus je sèche…','… plus je deviens mouillée.'],['Une serviette','Un parapluie','Un savon','Un manteau'],'La serviette sèche ton corps et devient mouillée.'],
 [['J’ai un cou, mais pas de tête.','J’ai deux bras, mais pas de mains.'],['👕 Une chemise','👖 Un pantalon','🧢 Une casquette','🧦 Une chaussette'],'La chemise a un col (un cou) et deux manches (des bras).'],
 [['On doit me casser avant de m’utiliser.','Je viens souvent d’une poule.'],['🥚 Un œuf','🥛 Un verre','🍽️ Une assiette','🎈 Un ballon'],'On casse l’œuf avant de le cuisiner.'],
 [['J’ai des pages, mais je ne suis pas un livre.','Je sers à compter les jours et les mois.'],['📅 Un calendrier','📰 Un journal','📓 Un cahier','🕰️ Une horloge'],'Le calendrier montre les jours et les mois.'],
 [['Je suis pleine de trous…','… mais je garde l’eau.'],['🧽 Une éponge','🪣 Un seau','🍶 Une bouteille','Une passoire'],'L’éponge garde l’eau dans ses petits trous.']];
const NATURE=[
 [['Je suis un mammifère.','Je vis dans l’océan.','Je respire par un trou sur ma tête.'],['🐋 Une baleine','🦈 Un requin','🐙 Une pieuvre','🐠 Un poisson'],'La baleine est un mammifère : elle respire de l’air.'],
 [['Je suis un reptile.','Je change de couleur pour me cacher.'],['🦎 Un caméléon','🐍 Un serpent','🐢 Une tortue','🐊 Un crocodile'],'Le caméléon change de couleur.'],
 [['Je suis un insecte.','Avant, j’étais une chenille.'],['🦋 Un papillon','🐝 Une abeille','🐞 Une coccinelle','🐜 Une fourmi'],'La chenille devient un papillon.'],
 [['Je dors presque tout l’hiver.','Je suis grand et brun.','J’aime le miel et le poisson.'],['🐻 Un ours','🦊 Un renard','🐺 Un loup','🦌 Un cerf'],'L’ours hiberne pendant l’hiver.'],
 [['Je construis des barrages sur les rivières.','Je suis sur la pièce de 5 cents.'],['🦫 Un castor','🦦 Une loutre','🦝 Un raton laveur','🐿️ Un écureuil'],'Le castor est un symbole du Canada.'],
 [['Je tombe du ciel en hiver.','Je suis blanche et froide.','Chacun de mes flocons est différent.'],['❄️ La neige','🌧️ La pluie','🌫️ Le brouillard','🧊 La glace'],'La neige tombe en flocons.'],
 [['Je suis une étoile.','Je donne la lumière et la chaleur à la Terre.'],['☀️ Le Soleil','🌙 La Lune','🪐 Saturne','⭐ L’étoile polaire'],'Le Soleil est l’étoile la plus proche de nous.'],
 [['Je suis un arbre.','Ma feuille est sur le drapeau du Canada.'],['🍁 L’érable','🌳 Le chêne','🌲 Le sapin','Le bouleau'],'La feuille d’érable est sur le drapeau.'],
 [['Je suis un oiseau, mais je ne vole pas.','Je nage très bien.','Je vis près du pôle Sud.'],['🐧 Le manchot','🦅 L’aigle','🦉 Le hibou','🦆 Le canard'],'Le manchot nage, mais ne vole pas.'],
 [['J’ai huit pattes.','Je tisse une toile pour attraper les insectes.'],['🕷️ L’araignée','🐜 La fourmi','🐝 L’abeille','🪲 Le scarabée'],'L’araignée a 8 pattes ; les insectes en ont 6.']];
const MONDE=[
 [['Je suis la capitale du Canada.','La rivière des Outaouais passe près de moi.'],['Ottawa','Toronto','Montréal','Québec'],'Ottawa est la capitale du Canada.'],
 [['Je suis la plus grande province du Canada.','On y parle surtout français.'],['Le Québec','L’Ontario','La Colombie-Britannique','L’Alberta'],'Le Québec est la plus grande province.'],
 [['Je suis un océan.','Je suis à l’ouest du Canada.'],['🌊 Le Pacifique','L’Atlantique','L’Arctique','L’océan Indien'],'La Colombie-Britannique touche l’océan Pacifique.'],
 [['Je suis le plus grand pays du monde.','Le Canada est juste après moi.'],['La Russie','La Chine','Les États-Unis','Le Brésil'],'La Russie est le plus grand pays ; le Canada est le 2e.'],
 [['Je suis la ville la plus peuplée du Canada.','J’ai la tour CN.'],['Toronto','Vancouver','Ottawa','Montréal'],'La tour CN est à Toronto.'],
 [['Je suis un continent.','Le Canada, les États-Unis et le Mexique sont sur moi.'],['L’Amérique du Nord','L’Europe','L’Asie','L’Amérique du Sud'],'Le Canada est en Amérique du Nord.'],
 [['Je suis une planète.','Je suis la plus proche du Soleil.'],['Mercure','Vénus','Mars','La Terre'],'Mercure est la première planète.'],
 [['Je suis un pays.','Je suis le voisin du Canada, au sud.'],['Les États-Unis','Le Mexique','La France','Le Groenland'],'Les États-Unis sont au sud du Canada.'],
 [['Je suis une langue.','Je suis la langue la plus parlée au Brésil.'],['Le portugais','L’espagnol','Le français','L’anglais'],'Au Brésil, on parle portugais.'],
 [['Je suis un pays d’Europe.','La tour Eiffel est chez moi.'],['La France','L’Italie','L’Espagne','La Belgique'],'La tour Eiffel est à Paris, en France.']];
const devinListe=(seed,liste)=>fixe(seed,liste.map(([i,c,e])=>r=>devin(r,i,c,e)));

/* ---------- Logic challenges ---------- */
const INTRUS_L=[
 [['🥕 Carotte','🍎 Pomme','🍌 Banane','🍇 Raisin'],'La carotte est un légume ; les autres sont des fruits.'],
 [['7','2','4','8','10'],'7 est impair ; les autres sont pairs.'],
 [['25','10','20','30','40'],'25 n’est pas un multiple de 10.'],
 [['Triangle','Carré','Rectangle','Losange'],'Le triangle a 3 côtés ; les autres en ont 4.'],
 [['🐔 Poule','🐶 Chien','🐱 Chat','🐰 Lapin'],'La poule a 2 pattes ; les autres en ont 4.'],
 [['Juillet','Lundi','Mardi','Jeudi'],'Juillet est un mois ; les autres sont des jours.'],
 [['🚲 Vélo','🚗 Auto','🚌 Autobus','🚚 Camion'],'Le vélo n’a pas de moteur.'],
 [['15','4','8','12','16'],'15 n’est pas un multiple de 4.'],
 [['Carré','Rouge','Bleu','Jaune'],'Carré est une forme ; les autres sont des couleurs.'],
 [['🍕 Pizza','🥛 Lait','🧃 Jus','💧 Eau'],'La pizza se mange ; les autres se boivent.']];
const intrusNiv=()=>{const r=rng(1401);return INTRUS_L.map(([l,e])=>quizQ(r,{titre:'Trouve l’intrus : celui qui ne suit pas la règle des autres.',aide:'Cherche ce que les autres ont en commun.'},l,e))};
function suiteQ(r,i){const t=i%5;let s,rep,e,faux;
  if(t===0){const a=int(r,1,20),k=int(r,2,9);s=[0,1,2,3].map(j=>a+j*k);rep=a+4*k;e='On ajoute '+k+' chaque fois.';faux=[rep+1,rep-k+1]}
  else if(t===1){const k=int(r,2,7),a=k*int(r,6,9);s=[0,1,2,3].map(j=>a-j*k);rep=a-4*k;e='On enlève '+k+' chaque fois.';faux=[rep+k,rep-1]}
  else if(t===2){const k=pick(r,[2,3]),a=int(r,1,3);s=[0,1,2,3].map(j=>a*k**j);rep=a*k**4;e='Chaque nombre est multiplié par '+k+'.';faux=[s[3]+(s[3]-s[2]),rep+k]}
  else if(t===3){const E=melange(r,['🔴','🔵','🟢','🟡','⭐','🔺']),m=pick(r,[[0,1,1],[0,0,1],[0,1,2]]);s=[0,1,2,3,4,5,6].map(j=>E[m[j%3]]);const rr=E[m[7%3]];
    const ch=[rr,...E.slice(0,3).filter(x=>x!==rr)].slice(0,3);return quizQ(r,{titre:'Quelle forme vient ensuite ?',suite:s,aide:'Trouve le groupe qui se répète.'},ch,'Le groupe de 3 se répète.')}
  else{const a=int(r,1,3);s=[0,1,2,3].map(j=>(a+j)*(a+j));rep=(a+4)*(a+4);e='Ce sont les carrés : '+(a+4)+' × '+(a+4)+' = '+rep+'.';faux=[rep-1,s[3]+(s[3]-s[2])]}
  const l=[rep,...faux.filter((v,k,arr)=>v!==rep&&arr.indexOf(v)===k)];while(l.length<3)l.push(rep+l.length*2);
  return quizQ(r,{titre:'Quel nombre vient ensuite ?',suite:s.map(String),aide:'Compare chaque nombre avec le suivant.'},l.map(String),e)}
function symbQ(r,i){const t=i%5,E=melange(r,['🍎','🍌','⭐','🌙','🔺','🔵','🐱','🐶','🍩','🍪']),X=E[0],Y=E[1];let eq,q,rep,e;
  if(t===0){const a=int(r,2,12);eq=[X+' + '+X+' = '+2*a];q=X;rep=a;e=a+' + '+a+' = '+2*a+'.'}
  else if(t===1){const a=int(r,2,9),b=int(r,1,9);eq=[X+' + '+X+' = '+2*a,X+' + '+Y+' = '+(a+b)];q=Y;rep=b;e=X+' = '+a+', donc '+Y+' = '+(a+b)+' − '+a+' = '+b+'.'}
  else if(t===2){const a=int(r,2,6),k=int(r,2,4),b=int(r,1,9);eq=[X+' × '+k+' = '+a*k,X+' + '+Y+' = '+(a+b)];q=Y;rep=b;e=X+' = '+a+', donc '+Y+' = '+b+'.'}
  else if(t===3){const a=int(r,2,8),b=int(r,1,6);eq=[X+' + '+X+' + '+X+' = '+3*a,Y+' = '+X+' + '+b];q=Y;rep=a+b;e=X+' = '+a+', donc '+Y+' = '+a+' + '+b+' = '+(a+b)+'.'}
  else{const b=int(r,1,5),a=b+int(r,1,5);eq=[X+' + '+Y+' = '+(a+b),X+' − '+Y+' = '+(a-b)];q=X;rep=a;e=a+' + '+b+' = '+(a+b)+' et '+a+' − '+b+' = '+(a-b)+', donc '+X+' = '+a+'.'}
  const l=[rep,rep+1,Math.abs(rep-2)||rep+3].filter((v,k,arr)=>arr.indexOf(v)===k);while(l.length<3)l.push(rep+5);
  return quizQ(r,{titre:'Chaque symbole vaut toujours le même nombre.',equations:eq,question:q+' = ?',aide:'Trouve d’abord le symbole qui est seul dans une équation.'},l.map(String),e)}
const PRENOMS=['Léa','Sam','Noé','Mia','Zoé','Léo','Emma','Adam','Lina','Tom','Inès','Yanis'];
const voy=w=>/^[aeiouyéèêàâîôûAEIOUYÉÈÊÀÂÎÔÛ]/.test(w),de=w=>(voy(w)?'d’':'de ')+w,que=w=>(voy(w)?'qu’':'que ')+w;
function enigmeQ(r,i){const t=i%4,N=melange(r,PRENOMS);
  if(t===0){const [a,b,c]=N,obj=pick(r,['billes','livres','cartes','autocollants']);const q=r()<.5;
    return quizQ(r,{titre:'Lis bien l’énigme.',texte:a+' a plus '+de(obj)+' '+que(b)+'. '+b+' a plus '+de(obj)+' '+que(c)+'. Qui a le '+(q?'plus':'moins')+' '+de(obj)+' ?',aide:'Range les trois personnes dans l’ordre.'},q?[a,b,c]:[c,b,a],a+' en a le plus, puis '+b+', puis '+c+'.')}
  if(t===1){const o=pick(r,[['poule','œuf','pond','œufs'],['abeille','fleur','visite','fleurs'],['élève','livre','lit','livres']]),n=int(r,2,4),j=int(r,3,5);
    return quizQ(r,{titre:'Lis bien l’énigme.',texte:'Une '+o[0]+' '+o[2]+' 1 '+o[1]+' par jour. Combien de '+o[3]+' pour '+n+' '+o[0]+'s en '+j+' jours ?',aide:'Multiplie le nombre de '+o[0]+'s par le nombre de jours.'},[String(n*j),String(n+j),String(n*j+n)],n+' × '+j+' = '+n*j+'.')}
  if(t===2){const [a,b,c]=N,A=melange(r,['un chat','un chien','un poisson']);
    return quizQ(r,{titre:'Lis bien l’énigme.',texte:a+', '+b+' et '+c+' ont chacun un animal : '+A.join(', ')+'. '+b+' a '+A[1]+'. '+a+' n’a pas '+A[2].replace(/^un /,'de ')+'. Qui a '+A[2]+' ?',aide:'Élimine les personnes une par une.'},[c,a,b],b+' a '+A[1]+' et '+a+' n’a pas '+A[2].replace(/^un /,'de ')+' : c’est '+c+'.')}
  const P=[['Un fermier a 17 moutons. Tous sauf 9 s’enfuient. Combien de moutons reste-t-il ?',['9','8','17'],'« Tous sauf 9 » s’enfuient : il en reste 9.'],
   ['Tom a 3 sœurs. Chaque sœur a un seul frère. Combien d’enfants y a-t-il dans la famille ?',['4','6','7'],'Le seul frère, c’est Tom : 3 + 1 = 4.'],
   ['Dans une course, tu dépasses la personne en 2e place. À quelle place es-tu ?',['2e','1re','3e'],'Tu prends sa place : la 2e.']];
  const [tx,l,e]=P[Math.floor(i/4)%3];return quizQ(r,{titre:'Attention, c’est un piège !',texte:tx,aide:'Lis chaque mot : la question est plus simple qu’elle en a l’air.'},l,e)}
function pairesCalc(r,n){const out=[],vus=new Set();while(out.length<n){const t=int(r,0,3);let a,b,res;
  if(t===0){a=int(r,2,9);b=int(r,2,9);res=a+b;out.push([a+' + '+b,String(res)])}
  else if(t===1){a=int(r,2,9);b=int(r,2,9);res=a*b;out.push([a+' × '+b,String(res)])}
  else if(t===2){a=int(r,10,20);b=int(r,2,9);res=a-b;out.push([a+' − '+b,String(res)])}
  else{b=int(r,2,5);res=int(r,2,9);out.push([b*res+' ÷ '+b,String(res)])}
  const v=out[out.length-1][1];if(vus.has(v))out.pop();else vus.add(v)}return out}
const SIMON_COUL=['rouge','bleu','vert','jaune'];
const simonQ=(r,long,envers)=>({type:'simon',suite:Array.from({length:long},()=>pick(r,SIMON_COUL)),envers});
const devinettes={id:'devinettes',titre:'Devinettes',icone:'❓',couleur:'#5a3fb0',categorie:'defis',
 consigne:'Lis les indices, puis choisis la réponse.',
 niveaux:[
 {titre:'Devinettes de nombres',description:'Deux indices pour trouver le nombre.',questions:()=>make(1501,r=>devinNombre(r,2,40,false))},
 {titre:'Objets à double sens',description:'Des devinettes avec un piège dans les mots.',questions:devinListe(1502,OBJETS)},
 {titre:'Animaux et nature',description:'Mammifères, insectes, arbres et saisons.',questions:devinListe(1503,NATURE)},
 {titre:'Nombres plus grands',description:'Trois indices, des nombres jusqu’à 99.',questions:()=>make(1504,r=>devinNombre(r,10,99,true))},
 {titre:'Le Canada et le monde',description:'Villes, pays, océans et planètes.',questions:devinListe(1505,MONDE)}
 ]};
const logique={id:'logique',titre:'Défis de logique',icone:'🧠',couleur:'#3d47a8',categorie:'defis',
 consigne:'Observe bien, puis réponds.',
 niveaux:[
 {titre:'L’intrus',description:'Trouver celui qui ne suit pas la règle.',questions:intrusNiv},
 {titre:'Les suites',description:'Trouver ce qui vient ensuite.',questions:()=>make(1402,(r,i)=>suiteQ(r,i))},
 {titre:'Les symboles',description:'Chaque symbole cache un nombre.',questions:()=>make(1403,(r,i)=>symbQ(r,i))},
 {titre:'Les énigmes',description:'Lire, comparer, déduire. Attention aux pièges !',questions:()=>make(1404,(r,i)=>enigmeQ(r,i))},
 {titre:'Mémoire des calculs',description:'Retrouver un calcul et son résultat : 4 paires.',questions:()=>{const r=rng(1405);return [0,1,2].map(()=>({type:'memo',paires:pairesCalc(r,4)}))}},
 {titre:'Grande mémoire',description:'6 paires de calculs.',questions:()=>{const r=rng(1406);return [0,1].map(()=>({type:'memo',paires:pairesCalc(r,6)}))}},
 {titre:'Suite de couleurs',description:'Regarder, retenir, refaire : de 3 à 6 couleurs.',questions:()=>{const r=rng(1407);return [3,3,4,4,5,6].map(n=>simonQ(r,n,false))}},
 {titre:'Couleurs à l’envers',description:'Refaire la suite en commençant par la fin.',questions:()=>{const r=rng(1408);return [3,3,4,4,5].map(n=>simonQ(r,n,true))}}
 ]};

/* ============================ FINANCES ============================ */
/* Items with a realistic price range [emoji, name, min price, max price]. */
const ART=[['🍎','Pomme',1,2],['🥪','Sandwich',4,8],['🧃','Jus',2,4],['🍪','Biscuit',1,3],['📓','Cahier',2,5],['✏️','Crayon',1,3],['🧸','Ourson',8,15],['⚽','Ballon',6,15],['🧢','Casquette',8,15],['🎒','Sac',10,19],['🍌','Banane',1,2],['🧁','Muffin',2,4],['🖍️','Boîte de crayons',3,7],['🧦','Chaussettes',3,8]];
const prixDe=(r,a,max)=>int(r,a[2],Math.max(a[2],Math.min(a[3],max||99)));
const finances={id:'finances',titre:'Gestion des finances',icone:'💵',couleur:'#215e63',
 consigne:'Lis la situation, puis réponds.',
 niveaux:[
 {titre:'Le plus cher, le moins cher',description:'Comparer des prix.',
  questions:()=>make(701,(r,i)=>{let s,p;do{s=[];while(s.length<3){const a=pick(r,ART);if(!s.find(x=>x[1]===a[1]))s.push(a)}p=s.map(a=>prixDe(r,a))}while(new Set(p).size<3);const cher=i%2===0;const best=p.indexOf(cher?Math.max(...p):Math.min(...p));return{type:'finance',title:cher?'Le plus cher':'Le moins cher',story:'Voici trois articles.',items:s.map((a,k)=>[a[0],a[1],p[k]]),question:cher?'Clique sur l’article qui coûte le plus cher.':'Clique sur l’article qui coûte le moins cher.',type2:'choice',cliquer:true,choices:s.map(a=>a[1]),answer:best,explain:'Compare les prix : '+p.join(' $, ')+' $.'}})},
 {titre:'Additionner deux prix',description:'Combien faut-il payer ?',
  questions:()=>make(702,r=>{const a=pick(r,ART);let b=pick(r,ART);while(b===a)b=pick(r,ART);const x=prixDe(r,a,12),y=prixDe(r,b,12);return{type:'finance',title:'Payer à la caisse',story:'Tu achètes ces deux articles.',items:[[a[0],a[1],x],[b[0],b[1],y]],question:'Combien dois-tu payer en tout ?',type2:'number',answer:x+y,explain:'Additionne '+x+' + '+y+'.'}})},
 {titre:'Rendre la monnaie',description:'Payer avec un billet de 10 $ ou de 20 $.',
  questions:()=>make(703,r=>{const a=pick(r,ART),prix=prixDe(r,a,19),billet=prix<10&&r()<.5?10:20;return{type:'finance',title:'La monnaie',story:'L’article coûte '+prix+' $. Tu paies avec un billet de '+billet+' $.',items:[[a[0],a[1],prix]],question:'Combien de monnaie dois-tu recevoir ?',type2:'number',answer:billet-prix,explain:'Calcule '+billet+' − '+prix+'.'}})},
 {titre:'Respecter un budget',description:'Est-ce que j’ai assez d’argent ?',
  questions:()=>make(704,(r,i)=>{const a=pick(r,ART);let b=pick(r,ART);while(b===a)b=pick(r,ART);const x=prixDe(r,a,12),y=prixDe(r,b,12),budget=i%2?x+y+int(r,0,4):x+y-int(r,1,4);if(i%3===2){const reste=Math.max(budget,x+y+1);return{type:'finance',title:'Ce qui reste',story:'Tu as '+reste+' $. Tu achètes ces deux articles.',items:[[a[0],a[1],x],[b[0],b[1],y]],question:'Combien d’argent te reste-t-il ?',type2:'number',answer:reste-x-y,explain:'Le total est '+(x+y)+' $. Calcule '+reste+' − '+(x+y)+'.'}}return{type:'finance',title:'Mon budget : '+budget+' $',story:'Tu as '+budget+' $.',items:[[a[0],a[1],x],[b[0],b[1],y]],question:'Peux-tu acheter les deux articles ?',type2:'choice',choices:['Oui','Non'],answer:x+y<=budget?0:1,explain:'Le total est '+x+' + '+y+' = '+(x+y)+' $.'}})},
 {titre:'Faire de bons choix',description:'Besoins, envies et vraies bonnes affaires.',questions:()=>[2,4,5,9,10,11,13,16,6,0].map(i=>finCurated(i))},
 {titre:'Situations du quotidien',description:'Des problèmes en plusieurs étapes.',questions:()=>[1,17,3,7,12,8,15,14,
   {title:'Le dîner de la semaine',story:'Ton dîner coûte 4 $ par jour. Tu manges à la cafétéria 5 jours.',items:[['🍱','Dîner',4]],question:'Combien dépenses-tu dans la semaine ?',type:'number',answer:20,explain:'Calcule 5 × 4.'},
   {title:'Économiser pour un ballon',story:'Le ballon coûte 18 $. Tu as déjà 11 $.',items:[['⚽','Ballon',18]],question:'Combien dois-tu encore économiser ?',type:'number',answer:7,explain:'Calcule 18 − 11.'}].map(x=>typeof x==='number'?finCurated(x):finConv(x))}
 ]};
/* Hand-written situations. */
const FIN=[{"title":"Que peux-tu acheter avec 10 $ ?","story":"Tu as 10 $. Choisis exactement trois articles différents.","items":[["🍎","Pomme",2],["🥪","Sandwich",5],["🧃","Jus",3],["🍪","Biscuit",4]],"question":"Sélectionne trois articles sans dépasser 10 $.","type":"basket","count":3,"budget":10,"explain":"Additionne les trois prix. Le total doit être inférieur ou égal à 10 $."},{"title":"La bonne monnaie","story":"La petite voiture coûte 6 $. Tu donnes 10 $. Le caissier te rend 3 $.","items":[["🚗","Petite voiture",6]],"question":"Combien devrait-il te rendre ?","type":"number","answer":4,"explain":"Calcule 10 − 6."},{"title":"La vraie bonne affaire","story":"Les deux chandails sont identiques. Le magasin A annonce une réduction.","items":[["👕","Magasin A · au lieu de 40 $",30],["👕","Magasin B",28]],"question":"Quel magasin propose le prix le plus bas ?","type":"choice","choices":["Magasin A","Magasin B"],"answer":1,"explain":"Compare les prix à payer : 30 $ et 28 $."},{"title":"Une erreur sur le reçu","story":"Voici les achats. Le reçu annonce un total de 14 $.","receipt":[["Pizza",8],["Boisson",2],["Biscuit",2]],"reportedTotal":14,"question":"Quel est le total correct ?","type":"number","answer":12,"explain":"Additionne 8 + 2 + 2."},{"title":"Besoin ou envie ?","story":"Tu as 35 $. Ton sac d’école est cassé. Tu peux acheter un seul de ces articles.","items":[["🎒","Nouveau sac",30],["🎮","Jeu vidéo",30]],"question":"Quel achat répond au besoin indiqué ?","type":"choice","choices":["Le nouveau sac","Le jeu vidéo"],"answer":0,"explain":"Le sac remplace celui qui est cassé."},{"title":"Une sortie avec 20 $","story":"Ton budget est de 20 $.","items":[["🎬","Cinéma",12],["🍿","Popcorn",5],["🥤","Boisson",4]],"question":"Peux-tu acheter les trois sans dépasser 20 $ ?","type":"choice","choices":["Oui","Non"],"answer":1,"explain":"12 + 5 + 4 = 21 $. Il manque 1 $."},{"title":"Quel format est le moins cher ?","story":"Compare le prix par boîte.","items":[["🥫","Paquet de 2 boîtes",6],["🥫","Paquet de 4 boîtes",10]],"question":"Quel paquet coûte moins cher par boîte ?","type":"choice","choices":["2 boîtes pour 6 $","4 boîtes pour 10 $"],"answer":1,"explain":"6 ÷ 2 = 3 $ par boîte. 10 ÷ 4 = 2,50 $ par boîte."},{"title":"Payer avec une carte de débit","story":"Ton compte contient 40 $. Les chaussures coûtent 45 $.","items":[["👟","Chaussures",45]],"question":"Combien manque-t-il sur ton compte pour cet achat ?","type":"number","answer":5,"explain":"Calcule 45 − 40."},{"title":"Compose ton repas","story":"Tu as 12 $. Choisis exactement trois articles différents.","items":[["🍔","Hamburger",6],["🍟","Frites",4],["🥤","Boisson",3],["🍎","Pomme",2]],"question":"Sélectionne trois articles sans dépasser 12 $.","type":"basket","count":3,"budget":12,"explain":"Additionne les trois prix. Le total doit être inférieur ou égal à 12 $."},{"title":"Une fausse promotion","story":"Le prix régulier est de 20 $. L’affiche annonce un prix en solde de 24 $.","items":[["🏷️","Prix régulier",20],["🏷️","Prix en solde",24]],"question":"Quelle affirmation est correcte ?","type":"choice","choices":["Le prix en solde est plus bas","Le prix en solde est plus élevé","Les deux prix sont égaux"],"answer":1,"explain":"24 $ est supérieur à 20 $. Cette offre ne réduit pas le prix."},{"title":"Qui a exactement 7 $ ?","story":"Les pièces sont décrites pour éviter toute ambiguïté.","money":[["Alex","2 $ + 2 $ + 1 $ + 1 $"],["Léa","2 $ + 2 $ + 2 $ + 1 $"],["Sam","2 $ + 1 $ + 1 $ + 1 $"]],"question":"Qui possède exactement 7 $ ?","type":"choice","choices":["Alex","Léa","Sam"],"answer":1,"explain":"Léa a 2 + 2 + 2 + 1 = 7 $."},{"title":"Le panier le moins cher","story":"Compare le total des deux paniers.","money":[["Panier A","5 $ + 3 $ + 2 $"],["Panier B","6 $ + 4 $ + 3 $"]],"question":"Quel panier coûte le moins cher ?","type":"choice","choices":["Panier A","Panier B"],"answer":0,"explain":"Le panier A coûte 10 $. Le panier B coûte 13 $."},{"title":"Combien manque-t-il ?","story":"Tu veux acheter des écouteurs à 25 $. Tu as un billet de 20 $ et une pièce de 2 $.","items":[["🎧","Écouteurs",25]],"question":"Combien te manque-t-il ?","type":"number","answer":3,"explain":"Tu as 22 $. Calcule 25 − 22."},{"title":"Dépenser ou économiser ?","story":"Tu as 40 $ et tu veux un vélo d’occasion à 80 $. Un jeu coûte 35 $.","items":[["🚲","Vélo",80],["🎮","Jeu",35]],"question":"Quelle décision te rapproche de ton objectif d’acheter le vélo ?","type":"choice","choices":["Acheter le jeu","Garder les 40 $ et continuer à économiser"],"answer":1,"explain":"En gardant ton argent, il ne te reste que 40 $ à économiser pour le vélo."},{"title":"Cinq jours, deux prix","story":"Le petit café coûte 2 $. Le grand coûte 3 $. Tu achètes un café chaque jour pendant 5 jours.","items":[["☕","Petit café",2],["☕","Grand café",3]],"question":"Combien économises-tu en choisissant le petit café pendant les 5 jours ?","type":"number","answer":5,"explain":"Les petits cafés coûtent 5 × 2 = 10 $. Les grands coûtent 5 × 3 = 15 $. La différence est de 5 $."},{"title":"Attention au budget","story":"Ton budget est de 30 $. Trois articles coûtent 12 $, 8 $ et 9 $. Une affiche dit qu’il te restera 5 $.","receipt":[["Article 1",12],["Article 2",8],["Article 3",9]],"reportedTotal":29,"question":"Combien te restera-t-il réellement ?","type":"number","answer":1,"explain":"Le total est 29 $. Calcule 30 − 29."},{"title":"Lequel choisir ?","story":"Ces trois sacs sont similaires. Le sac rouge porte une affiche « Promotion ».","items":[["🎒","Sac vert",15],["🎒","Sac rouge · promotion",18],["🎒","Sac jaune",12]],"question":"Quel sac coûte réellement le moins cher ?","type":"choice","choices":["Le sac vert","Le sac rouge","Le sac jaune"],"answer":2,"explain":"Le sac jaune coûte 12 $, moins que 15 $ et 18 $."},{"title":"Combien recevras-tu en retour ?","story":"Tu achètes un ourson à 13 $. Tu donnes un billet de 20 $.","items":[["🧸","Ourson",13]],"question":"Combien de monnaie dois-tu recevoir ?","type":"choice","choices":["5 $","7 $","9 $"],"answer":1,"explain":"Calcule 20 − 13 = 7 $."}];
/* Situations where the student clicks directly on the item (or the person) instead of a button. */
[2,4,6,10,11,16].forEach(i=>{FIN[i].cliquer=true});
function finConv(s){const q=Object.assign({},s);q.type2=s.type;q.type='finance';return q}
function finCurated(i){return finConv(FIN[i])}

/* ============================ SHAPES ============================ */
const FORMES_NOMS={cercle:'Cercle',triangle:'Triangle',carre:'Carré',rectangle:'Rectangle',pentagone:'Pentagone',hexagone:'Hexagone',ovale:'Ovale',losange:'Losange'};
const forme=(f,choix,extra)=>Object.assign({type:'choix',texte:'Quel est le nom de cette forme ?',visuel:{forme:f},choix,reponse:choix.indexOf(FORMES_NOMS[f]),aide:'Compte les côtés et regarde s’ils sont droits ou arrondis.'},extra||{});
const BASE=['Cercle','Triangle','Carré','Rectangle'];
const prop=(f,texte,choix,rep,rot)=>({type:'choix',texte,visuel:{forme:f,rotation:rot||0},choix,reponse:choix.indexOf(rep),aide:'Compte en posant ton doigt sur chaque côté ou chaque coin.'});
const formes={id:'formes',titre:'Les formes géométriques',icone:'△ ○ □',couleur:'#08665d',
 consigne:'Observe bien la forme.',
 niveaux:[
 {titre:'Les quatre formes de base',description:'Cercle, triangle, carré, rectangle.',
  questions:()=>['cercle','triangle','carre','rectangle','triangle','cercle','rectangle','carre','cercle','triangle','carre','rectangle','triangle','carre','rectangle'].map((f,i)=>forme(f,BASE,{visuel:{forme:f,rotation:i>=8?[25,40,15,30,45,20,35][i-8]:0}}))},
 {titre:'D’autres formes',description:'Pentagone, hexagone, ovale, losange…',
  questions:()=>[['pentagone',0],['ovale',0],['hexagone',0],['losange',0],['carre',30],['triangle',40],['pentagone',20],['rectangle',20],['hexagone',15],['ovale',30],['losange',20],['cercle',0],['pentagone',35],['hexagone',30],['losange',45]].map(([f,rot],i)=>{const all=Object.values(FORMES_NOMS);const r=rng(800+i);const ch=[FORMES_NOMS[f]];while(ch.length<4){const c=pick(r,all);if(!ch.includes(c))ch.push(c)}ch.sort();return forme(f,ch,{visuel:{forme:f,rotation:rot}})})},
 {titre:'Les côtés et les sommets',description:'Compter et reconnaître les propriétés.',
  questions:()=>[prop('triangle','Combien de côtés possède cette forme ?',['2','3','4','5'],'3'),prop('carre','Combien de sommets (coins) possède cette forme ?',['3','4','5','6'],'4'),prop('pentagone','Combien de côtés possède cette forme ?',['3','4','5','6'],'5'),prop('hexagone','Combien de sommets possède cette forme ?',['4','5','6','8'],'6'),prop('cercle','Combien de sommets possède cette forme ?',['0','1','2','4'],'0'),prop('rectangle','Cette forme a quatre angles droits, deux côtés longs et deux côtés courts. Quel est son nom ?',['Rectangle','Triangle','Cercle','Pentagone'],'Rectangle'),prop('carre','Cette forme a quatre côtés égaux et quatre angles droits. Quel est son nom ?',['Carré','Losange','Ovale','Triangle'],'Carré'),prop('losange','Combien de côtés possède cette forme ?',['3','4','5','6'],'4'),prop('triangle','Combien de sommets possède cette forme ?',['2','3','4','5'],'3',30),prop('ovale','Cette forme possède-t-elle des côtés droits ?',['Oui','Non'],'Non')]},
 {titre:'Compter les formes',description:'Combien de triangles, de carrés, de rectangles et de cercles vois-tu ?',
  questions:()=>['sapin','poisson','maison','camion','bonhomme','fusee','voilier','robot','train','chateau'].map(id=>({type:'compter',figure:id}))},
 {titre:'Colorier selon la légende : 3 formes',description:'Cercles en rouge, carrés en vert, triangles en jaune.',
  questions:()=>['bateau','maison','fusee','chateau','train','ville','ciel','sapin','neige','fleurs'].map(id=>({type:'colorier',dessin:id,legende:L3}))},
 {titre:'Colorier selon la légende : 6 formes',description:'Cercles, carrés, rectangles, triangles, ovales et hexagones.',
  questions:()=>['montgolfiere','jardin','espace','parc','plage','bord','aquarium','ferme','port','ruche'].map(id=>({type:'colorier',dessin:id}))},
 {titre:'Trouver une forme parmi beaucoup d’autres',description:'Des dessins avec plus de formes.',questions:()=>SCENES.slice(2,12).map((s,i)=>({type:'scene',scene:i+2,cible:['triangle','carre','cercle','rectangle'][i%4],decor:true}))}
 ]};
/* Pictures made of shapes (levels 6 and 7: find a shape). */
const R=(type,x,y,w,h)=>({type,tag:'rect',a:{x,y,width:w,height:h}}),C=(x,y,r)=>({type:'cercle',tag:'circle',a:{cx:x,cy:y,r}}),T=(a,b,c)=>({type:'triangle',tag:'polygon',a:{points:[a,b,c].map(v=>v.join(',')).join(' ')}});
const SCENES=[
{name:'Maison',parts:[R('carre',180,160,160,160),T([160,160],[260,55],[360,160]),R('rectangle',240,245,40,75),C(260,125,19)]},
{name:'Sapin',parts:[R('rectangle',245,245,30,80),T([260,45],[190,140],[330,140]),T([260,120],[165,220],[355,220]),T([260,190],[145,285],[375,285])]},
{name:'Fusée',parts:[R('rectangle',225,130,70,160),T([225,130],[260,55],[295,130]),C(260,195,22),T([225,235],[175,295],[225,295])]},
{name:'Bonhomme',parts:[C(260,90,40),R('carre',215,140,90,90),R('rectangle',215,240,30,85),R('rectangle',275,240,30,85)]},
{name:'Train',parts:[R('rectangle',140,175,235,90),R('carre',140,100,75,75),C(195,290,30),C(325,290,30)]},
{name:'Voilier',parts:[T([245,55],[245,220],[140,220]),T([265,100],[265,220],[350,220]),R('rectangle',130,240,250,55),C(255,267,17)]},
{name:'Robot',parts:[R('carre',215,65,90,90),R('rectangle',200,175,120,130),C(240,110,12),C(280,110,12)]},
{name:'Poisson',parts:[C(280,180,90),T([185,180],[115,105],[115,255]),T([265,90],[310,45],[340,110]),C(315,160,13)]},
{name:'Camion',parts:[R('rectangle',215,105,180,140),R('carre',125,155,90,90),C(175,270,30),C(340,270,30)]},
{name:'Fleur',parts:[C(260,130,45),C(260,65,25),R('rectangle',250,180,20,145),T([240,265],[170,210],[180,280])]},
{name:'Château',parts:[R('rectangle',145,155,230,170),T([145,155],[205,65],[265,155]),R('carre',170,195,35,35),C(300,220,25)]},
{name:'Montgolfière',parts:[C(260,120,85),R('carre',225,260,70,70),R('rectangle',225,210,12,50),R('rectangle',283,210,12,50)]}];
const DECOR=[R('carre',425,260,45,45),C(70,75,28),T([70,160],[35,225],[105,225]),R('rectangle',405,85,80,35),C(450,190,18),T([30,300],[70,250],[110,300])];

/* ================= SHAPES: COUNTING AND COLOURING (levels 4 and 5) =================
   Picture pieces: fR = square or rectangle (square if width = height),
   fC = circle, fT = triangle, fE = oval, fH = hexagon, fD = decoration (line not counted).
   The last argument is the colour (pictures to count only). */
const fR=(x,y,w,h,f)=>({type:w===h?'carre':'rectangle',tag:'rect',a:{x,y,width:w,height:h},f});
const fC=(cx,cy,r,f)=>({type:'cercle',tag:'circle',a:{cx,cy,r},f});
const fT=(points,f)=>({type:'triangle',tag:'polygon',a:{points},f});
const fE=(cx,cy,rx,ry,f)=>({type:'ovale',tag:'ellipse',a:{cx,cy,rx,ry},f});
const fH=(cx,cy,s,f)=>({type:'hexagone',tag:'polygon',a:{points:[[cx-s,cy],[cx-s/2,cy-s*.866],[cx+s/2,cy-s*.866],[cx+s,cy],[cx+s/2,cy+s*.866],[cx-s/2,cy+s*.866]].map(p=>p.map(v=>Math.round(v*10)/10).join(',')).join(' ')},f});
const fD=d=>({type:null,tag:'path',a:{d}});
const vagues=(x1,x2,y)=>{let d='M'+x1+' '+y;for(let x=x1;x<x2;x+=40)d+=' q10 -10 20 0 t20 0';return fD(d)};
const COUL={rouge:'#e53935',bleu:'#1e63c6',jaune:'#f7c843',orange:'#f08a24',vert:'#3aa655',brun:'#8b5a2b',gris:'#c9d1da',ciel:'#9fd3f2',beige:'#fbe3c5',violet:'#8e5bd1',marine:'#1d3f73'};
const K=COUL;

/* Colour pictures: the student counts the triangles, squares, rectangles and circles. */
const FIGURES={
 sapin:{nom:'Le sapin',parts:[fD('M60 330 H460'),fT('260,35 195,125 325,125',K.vert),fT('260,95 175,205 345,205',K.vert),fT('260,165 155,275 365,275',K.vert),fR(245,275,30,55,K.brun)]},
 camion:{nom:'Le camion',parts:[fD('M40 320 H480'),fR(200,80,230,160,K.bleu),fR(110,140,90,100,K.jaune),fR(130,155,45,45,K.ciel),fR(100,240,340,20,K.gris),fC(160,285,30,K.marine),fC(310,285,30,K.marine),fC(385,285,30,K.marine)]},
 bonhomme:{nom:'Le bonhomme',parts:[fT('220,95 260,40 300,95',K.orange),fC(260,125,30,K.beige),fR(215,160,90,90,K.bleu),fR(165,165,50,18,K.beige),fR(305,165,50,18,K.beige),fR(222,250,30,70,K.vert),fR(268,250,30,70,K.vert),fR(212,320,40,15,K.brun),fR(268,320,40,15,K.brun)]},
 robot:{nom:'Le robot',parts:[fD('M260 48 V75'),fC(260,40,9,K.rouge),fR(196,95,14,30,K.jaune),fR(310,95,14,30,K.jaune),fR(210,75,100,70,K.bleu),fC(240,103,12,K.ciel),fC(280,103,12,K.ciel),fR(245,125,30,8,K.rouge),fR(165,165,40,15,K.gris),fR(315,165,40,15,K.gris),fR(205,155,110,110,K.vert),fR(222,180,20,20,K.orange),fR(250,180,20,20,K.jaune),fR(278,180,20,20,K.orange),fR(222,265,28,60,K.jaune),fR(270,265,28,60,K.jaune),fR(212,325,45,15,K.bleu),fR(263,325,45,15,K.bleu)]},
 poisson:{nom:'Le poisson',parts:[fT('120,110 120,250 200,180',K.bleu),fT('255,95 290,40 320,95',K.bleu),fT('255,265 290,320 320,265',K.bleu),fC(285,180,95,K.jaune),fC(330,155,13,K.marine),fC(420,125,10,K.ciel),fC(442,92,14,K.ciel),fC(458,55,9,K.ciel)]},
 maison:{nom:'La maison',parts:[fD('M60 320 H460'),fT('150,160 260,62 370,160',K.rouge),fR(180,160,160,160,K.beige),fC(260,122,20,K.ciel),fR(198,190,40,40,K.ciel),fR(282,190,40,40,K.ciel),fR(240,250,40,70,K.brun),fC(150,298,22,K.vert),fC(370,298,22,K.vert)]},
 voilier:{nom:'Le voilier',parts:[vagues(60,460,325),fR(255,60,10,190,K.brun),fT('265,60 310,75 265,90',K.rouge),fT('248,85 248,240 150,240',K.jaune),fT('272,100 272,240 360,240',K.bleu),fR(140,250,240,55,K.violet),fC(190,277,14,K.ciel),fC(260,277,14,K.ciel),fC(330,277,14,K.ciel),fC(440,70,30,K.jaune)]},
 fusee:{nom:'La fusée',parts:[fT('225,210 175,270 225,270',K.bleu),fT('295,210 345,270 295,270',K.bleu),fR(225,120,70,150,K.gris),fT('225,120 260,50 295,120',K.rouge),fC(260,165,20,K.ciel),fR(245,205,30,30,K.ciel),fR(235,270,50,18,K.rouge),fT('240,288 280,288 260,335',K.orange)]},
 train:{nom:'Le train',parts:[fD('M40 282 H480'),fC(330,80,18,K.gris),fC(362,52,22,K.gris),fR(100,105,120,15,K.jaune),fR(110,120,100,100,K.vert),fR(135,140,50,50,K.ciel),fR(300,110,26,50,K.jaune),fR(210,160,170,60,K.rouge),fT('380,175 380,220 420,220',K.bleu),fR(110,220,270,14,K.marine),fC(150,252,28,K.orange),fC(240,254,26,K.orange),fC(320,254,26,K.orange)]},
 chateau:{nom:'Le château',parts:[fD('M60 320 H460'),fD('M140 70 V40'),fD('M380 70 V40'),fT('140,40 170,50 140,60',K.bleu),fT('380,40 410,50 380,60',K.bleu),fR(185,200,22,22,K.gris),fR(249,200,22,22,K.gris),fR(313,200,22,22,K.gris),fR(170,220,180,100,K.gris),fR(110,130,60,190,K.gris),fR(350,130,60,190,K.gris),fT('105,130 140,70 175,130',K.rouge),fT('345,130 380,70 415,130',K.rouge),fR(128,160,24,24,K.bleu),fR(128,230,24,24,K.bleu),fR(368,160,24,24,K.bleu),fR(368,230,24,24,K.bleu),fR(242,260,36,60,K.brun)]}
};

/* Colouring key (as on the worksheets): each kind of shape has its colour. */
const LEGENDE={cercle:['rouge','#e53935'],carre:['vert','#2e9e44'],rectangle:['bleu','#1e63c6'],triangle:['jaune','#f7c843'],ovale:['mauve','#8e44ad'],hexagone:['brun','#8b5a2b']};
const L3=['cercle','carre','triangle'],L4=['cercle','carre','rectangle','triangle'],L6=L4.concat(['ovale','hexagone']);
/* Sun: a circle surrounded by 8 triangle rays. */
const soleil=(cx,cy,r)=>{const P=(d,a)=>Math.round(cx+d*Math.cos(a))+','+Math.round(cy+d*Math.sin(a));const out=[];for(let k=0;k<8;k++){const a=k*Math.PI/4;out.push(fT(P(r+8,a-.24)+' '+P(r+8,a+.24)+' '+P(r+30,a)))}out.push(fC(cx,cy,r));return out};
/* Flower: 6 round petals around a round centre. */
const fleurRonde=(x,y)=>{const out=[];for(let k=0;k<6;k++){const a=k*Math.PI/3;out.push(fC(Math.round(x+30*Math.cos(a)),Math.round(y+30*Math.sin(a)),17))}out.push(fC(x,y,20));return out};
/* Flower: 4 oval petals around a round centre. */
const fleurOvale=(x,y)=>[fE(x,y-30,12,18),fE(x,y+30,12,18),fE(x-30,y,18,12),fE(x+30,y,18,12),fC(x,y,15)];
/* Fish: triangle tail, oval body, round eye. d = 1 (facing right) or -1. */
const poisson=(x,y,d)=>[fT((x-36*d)+','+y+' '+(x-70*d)+','+(y-24)+' '+(x-70*d)+','+(y+24)),fE(x,y,42,24),fC(x+22*d,y-6,6)];
/* Bee: oval wings, oval body, round head. */
const abeille=(x,y)=>[fE(x-4,y-18,12,9),fE(x+10,y-18,12,9),fE(x,y,22,13),fC(x+26,y-2,9)];
/* Row of hexagons. */
const hexas=(x0,y,s,n,pas)=>Array.from({length:n},(_,k)=>fH(x0+k*pas,y,s));

/* Pictures to colour (black outlines): the student colours each shape according to the key. */
const COLORIAGES={
 maison:{nom:'La maison et le soleil',legende:L4,parts:[fD('M10 350 H590'),
  fT('78,42 102,42 90,14'),fT('78,118 102,118 90,146'),fT('52,68 52,92 24,80'),fT('128,68 128,92 156,80'),fC(90,80,32),
  fT('220,170 330,85 440,170'),fC(330,138,18),fR(240,170,180,180),fR(260,195,45,45),fR(355,195,45,45),fR(310,270,40,80),
  fT('495,250 540,150 585,250'),fR(528,250,24,100)]},
 bateau:{nom:'Les bateaux',legende:L4,parts:[vagues(20,580,330),vagues(20,580,360),fC(525,70,35),
  fT('95,140 95,250 45,250'),fT('105,160 105,250 150,250'),fR(40,255,115,30),
  fR(280,150,40,40),fR(220,190,160,60),fR(240,205,30,30),fR(285,205,30,30),fR(330,205,30,30),
  fR(170,250,260,60),fC(230,280,14),fC(300,280,14),fC(370,280,14)]},
 train:{nom:'Le train',legende:L4,parts:[fD('M10 302 H590'),fD('M310 240 H330'),fD('M450 240 H470'),
  fC(140,128,14),fC(165,100,19),
  fT('90,215 90,260 55,260'),fR(90,200,130,60),fR(120,160,24,40),fR(220,170,90,90),fR(240,190,50,50),
  fR(330,190,120,70),fR(345,205,35,35),fR(400,205,35,35),
  fR(470,190,110,70),fC(500,225,15),fC(550,225,15),
  fC(125,280,20),fC(195,280,20),fC(265,280,20),fC(360,280,20),fC(420,280,20),fC(500,280,20),fC(550,280,20)]},
 ville:{nom:'La ville',legende:L4,parts:[fD('M10 270 H590'),fD('M240 60 V25'),
  fC(555,48,28),
  fT('20,170 80,100 140,170'),fC(80,143,15),fR(30,170,100,100),fR(42,185,28,28),fR(87,215,30,55),
  fR(240,25,40,22),fR(180,60,120,210),fR(198,80,30,30),fR(252,80,30,30),fR(198,130,30,30),fR(252,130,30,30),fR(198,180,30,30),fR(252,180,30,30),fR(225,216,30,54),
  fT('330,160 395,95 460,160'),fC(395,137,13),fR(340,160,110,110),fR(355,180,80,30),
  fT('500,145 540,95 580,145'),fT('492,195 540,130 588,195'),fT('484,245 540,175 596,245'),fR(533,245,14,25)]},
 montgolfiere:{nom:'La montgolfière',legende:L6,parts:[fD('M10 330 H590'),fD('M240 195 L278 240 M360 195 L322 240'),fD('M95 290 V330'),fD('M520 340 V385'),
  fT('78,32 102,32 90,6'),fT('78,108 102,108 90,134'),fT('52,58 52,82 24,70'),fT('128,58 128,82 156,70'),fC(90,70,30),
  fE(470,65,42,24),fE(525,82,30,18),
  fE(300,110,78,95),fR(275,240,50,50),
  fR(40,250,110,40),
  fH(80,365,24),fH(160,365,24),fH(240,365,24),fH(320,365,24),fH(400,365,24),
  fE(520,252,14,20),fE(520,318,14,20),fE(487,285,20,14),fE(553,285,20,14),fC(520,285,16)]},
 parc:{nom:'Le parc',legende:L6,parts:[fD('M10 290 H590'),
  fE(150,40,40,20),fE(560,50,30,18),
  fE(80,130,50,75),fC(65,105,12),fC(95,132,12),fC(68,160,12),fR(70,205,20,85),
  fC(250,120,60),fR(222,92,22,22),fR(256,92,22,22),fR(222,126,22,22),fR(256,126,22,22),fR(240,180,20,110),
  fT('400,110 440,50 480,110'),fT('390,160 440,90 490,160'),fT('380,210 440,140 500,210'),fR(430,210,20,80),
  fH(60,345,26),fH(140,345,26),fH(220,345,26),fH(300,345,26),fH(380,345,26),fH(460,345,26),
  fE(548,345,40,22)]},
 fusee:{nom:'La fusée dans le ciel',legende:L4,parts:[fD('M10 380 H590'),
  fC(500,80,40),fC(110,90,20),fC(150,300,14),fT('470,230 485,200 500,230'),fT('90,190 105,160 120,190'),fT('520,330 535,300 550,330'),
  fT('260,230 210,300 260,300'),fT('340,230 390,300 340,300'),fR(260,120,80,180),fT('260,120 300,40 340,120'),fC(300,165,22),fR(285,215,30,30),
  fT('275,300 325,300 300,355'),fR(220,360,160,20)]},
 chateau:{nom:'Le château',legende:L4,parts:[fD('M10 370 H590'),fD('M165 70 V35'),fD('M435 70 V35'),fT('165,35 195,45 165,55'),fT('435,35 465,45 435,55'),
  fC(530,70,35),
  fR(130,150,70,220),fR(400,150,70,220),fT('120,150 165,70 210,150'),fT('390,150 435,70 480,150'),
  fR(210,205,25,25),fR(260,205,25,25),fR(315,205,25,25),fR(365,205,25,25),fR(200,230,200,140),fR(275,290,50,80),
  fC(165,200,14),fC(435,200,14),fR(150,260,30,30),fR(420,260,30,30)]},
 jardin:{nom:'Le jardin',legende:L6,parts:[fD('M10 300 H590'),fD('M150 245 V300'),fD('M450 245 V300'),
  fE(120,60,45,22),fE(185,72,35,18),fC(520,70,32),
  fE(150,170,12,18),fE(150,230,12,18),fE(120,200,18,12),fE(180,200,18,12),fC(150,200,15),
  fE(450,170,12,18),fE(450,230,12,18),fE(420,200,18,12),fE(480,200,18,12),fC(450,200,15),
  fT('260,170 310,120 360,170'),fR(270,170,80,80),fC(310,205,14),fR(302,250,16,50),
  fH(75,350,24),fH(165,350,24),fH(255,350,24),fH(345,350,24),fH(435,350,24),fH(525,350,24)]},
 ciel:{nom:'Le soleil et les nuages',legende:L3,parts:[fD('M10 360 H590'),fD('M482 350 V360 M498 350 V360'),
  ...soleil(115,105,38),
  fC(310,95,30),fC(355,72,36),fC(402,95,30),fC(470,175,24),fC(505,155,30),fC(542,175,24),
  fT('230,250 300,185 370,250'),fR(245,250,110,110),fR(280,280,40,40),
  fT('440,350 490,250 540,350')]},
 sapin:{nom:'Le sapin décoré',legende:L3,parts:[fD('M10 370 H590'),fD('M285 330 V370 H315 V330'),
  fT('288,44 312,44 300,16'),fT('300,44 225,150 375,150'),fT('300,110 195,240 405,240'),fT('300,185 160,330 440,330'),
  fC(285,120,12),fC(318,175,13),fC(255,215,13),fC(345,225,13),fC(300,275,14),fC(225,305,13),fC(375,305,13),
  fC(70,70,10),fC(160,130,8),fC(500,80,10),fC(545,170,8),fC(110,210,8),fC(470,200,9),
  fR(60,300,70,70),fR(140,320,50,50),fR(460,310,60,60),fR(530,330,40,40)]},
 fleurs:{nom:'Les fleurs',legende:L3,parts:[fD('M10 390 H590'),fD('M130 195 V320 M300 195 V320 M470 195 V320'),
  ...[130,300,470].flatMap(x=>[fT(x+',290 '+(x-55)+',255 '+(x-42)+',300'),fT(x+',270 '+(x+55)+',235 '+(x+42)+',280'),fR(x-35,320,70,70),...fleurRonde(x,145)])]},
 neige:{nom:'Le bonhomme de neige',legende:L3,parts:[fD('M10 360 H590'),fD('M255 58 H345'),fD('M120 250 V285 M480 250 V285'),
  fT('70,250 120,160 170,250'),fT('80,195 120,110 160,195'),fT('430,250 480,160 530,250'),fT('440,195 480,110 520,195'),
  fC(300,290,68),fC(300,180,50),fC(300,98,40),fR(272,8,56,50),
  fC(285,90,7),fC(315,90,7),fT('300,100 300,114 334,107'),fC(300,160,7),fC(300,182,7),fC(300,204,7),
  fC(60,60,8),fC(200,40,9),fC(420,50,8),fC(550,90,9),fC(230,120,7),fC(380,130,8),
  fR(400,310,50,50),fR(160,320,40,40)]},
 ruche:{nom:'La ruche',legende:L6,parts:[fD('M10 350 H590'),fD('M190 60 H420 M300 60 V87'),fD('M480 315 V350 M560 315 V350'),
  ...soleil(70,70,28),
  fH(300,110,26),fH(300,155,26),fH(300,200,26),fH(339,132,26),fH(339,177,26),fH(261,132,26),fH(261,177,26),
  ...abeille(450,120),...abeille(470,200),...abeille(150,220),
  fR(100,270,12,80),fR(76,215,60,60),
  fT('200,350 212,320 224,350'),fT('240,350 252,320 264,350'),fT('330,350 342,320 354,350'),fT('380,350 392,320 404,350'),
  ...fleurOvale(480,285),...fleurOvale(560,285)]},
 ferme:{nom:'La ferme',legende:L6,parts:[fD('M10 330 H590'),fD('M262 285 H400 M262 310 H400'),fD('M430 290 V325 M465 290 V325 M535 312 V330 M560 312 V330'),
  ...soleil(530,70,28),fE(290,60,42,20),fE(340,72,30,16),
  fT('70,180 155,95 240,180'),fC(155,150,14),fR(80,180,150,150),fR(135,195,40,40),fR(135,260,40,70),
  fR(270,265,14,65),fR(310,265,14,65),fR(350,265,14,65),fR(390,265,14,65),
  fE(450,280,45,28),fC(500,262,15),fE(548,300,30,20),fC(578,292,10),
  ...hexas(60,368,20,8,60)]},
 aquarium:{nom:'L’aquarium',legende:L6,parts:[fD('M10 30 q15 -10 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0'),fD('M10 340 H590'),
  fD('M60 340 q-15 -30 0 -60 t0 -60 M400 340 q-15 -30 0 -55 t0 -55'),
  ...poisson(170,120,1),...poisson(440,95,-1),...poisson(260,240,1),
  fC(215,70,8),fC(228,45,6),fC(400,45,9),fC(330,190,7),fC(345,165,5),
  fR(450,230,24,110),fR(546,230,24,110),fT('450,230 462,205 474,230'),fT('546,230 558,205 570,230'),fR(474,260,72,72),fR(500,272,20,20),fR(500,300,20,32),
  ...hexas(60,365,16,6,60)]},
 plage:{nom:'La plage',legende:L6,parts:[fD('M10 120 H590'),vagues(20,580,165),fD('M10 210 H590'),
  ...soleil(85,62,26),
  fR(355,140,130,20),fT('415,140 415,70 365,140'),fT('425,140 425,85 470,140'),
  fR(176,250,8,95),fT('110,250 180,200 250,250'),fR(230,322,110,40),fC(400,300,25),
  fR(460,295,70,70),fR(460,258,30,30),fR(500,258,30,30),fT('475,258 475,236 492,247'),
  fE(70,350,16,10),fE(120,375,12,8),fE(565,380,14,9),
  fH(60,280,16),fH(300,250,14),fH(570,300,14)]},
 espace:{nom:'Dans l’espace',legende:L6,parts:[
  fC(90,90,45),fE(510,300,85,18),fC(510,300,52),fC(470,70,20),
  fR(270,140,60,150),fT('270,140 300,70 330,140'),fT('270,230 235,290 270,290'),fT('330,230 365,290 330,290'),fC(300,185,18),fT('285,290 315,290 300,330'),
  fC(130,262,22),fE(130,282,62,18),
  fR(110,170,50,20),fR(200,170,50,20),fR(160,160,40,40),
  fH(420,170,18),fH(225,60,16),fH(560,170,16),fH(400,330,14),
  fT('40,220 48,205 56,220'),fT('380,40 388,25 396,40'),fT('560,30 568,15 576,30'),fT('230,350 238,335 246,350')]},
 port:{nom:'Le port',legende:L6,parts:[fD('M10 240 H590'),vagues(20,580,355),vagues(20,580,380),fD('M450 215 V240 M530 218 V240'),
  fC(545,50,28),fE(350,50,40,18),fE(400,60,30,14),
  fT('30,150 85,100 140,150'),fC(85,130,10),fR(40,150,90,90),fR(58,168,22,22),fR(92,168,22,22),fR(75,205,20,35),
  fR(170,90,100,150),fR(185,105,25,25),fR(230,105,25,25),fR(185,145,25,25),fR(230,145,25,25),fR(210,200,20,40),
  fT('290,150 345,95 400,150'),fR(300,150,90,90),fR(318,170,55,25),fR(335,205,20,35),
  fE(450,175,30,42),fE(530,185,25,35),
  ...hexas(30,262,13,6,32),...hexas(420,262,13,6,32),
  fR(285,262,30,30),fR(215,292,170,40),fC(250,312,9),fC(300,312,9),fC(350,312,9)]},
 bord:{nom:'Au bord de l’eau',legende:L6,parts:[vagues(20,580,315),fD('M307 70 V245'),fD('M80 300 V345'),
  fT('78,32 102,32 90,6'),fT('78,108 102,108 90,134'),fT('52,58 52,82 24,70'),fT('128,58 128,82 156,70'),fC(90,70,30),
  fE(400,60,40,22),
  fR(310,70,40,22),fT('300,92 300,240 210,240'),fT('315,110 315,240 390,240'),fR(200,245,210,50),fC(250,270,13),fC(305,270,13),fC(360,270,13),
  fT('460,140 515,100 570,140'),fR(470,140,90,90),fR(485,160,25,25),fR(522,180,24,50),
  fE(80,227,14,20),fE(80,293,14,20),fE(47,260,20,14),fE(113,260,20,14),fC(80,260,16),
  fH(170,365,22),fH(250,365,22),fH(330,365,22),fH(410,365,22)]}
};


/* ===================== COUNTING: TENS, HUNDREDS, THOUSANDS =====================
   Three simple lessons (ASD students, elementary): short sentences, one thing at a time.
   Each lesson has its video. The "Ones, tens, hundreds" video groups all three. */
const suiteCompte=(debut,pas,n,f)=>{const l=[];for(let k=0;k<n;k++)l.push(debut+k*pas);const rep=debut+n*pas;
  return{type:'nombre',texte:'Quel nombre vient après ?',visuel:{grand:l.map(f||mil).join(', ')+', ?'},oral:'Quel nombre vient après ? '+l.join(', '),reponse:rep,aide:'On ajoute '+mil(pas)+' chaque fois.'}};
const LEC_DIZ=['Une barre a 10 cubes.','1 barre = 1 dizaine = 10.','On compte les barres : 10, 20, 30…','Puis on compte les cubes : 31, 32, 33…'];
const dizaines={id:'dizaines',titre:'Les dizaines',icone:'10 20',couleur:'#9a5612',video:'Les-dizaines.mp4',consigne:'Compte de 10 en 10.',niveaux:[
 {titre:'Compter les barres',description:'Jusqu’à 5 barres.',lecon:LEC_DIZ,questions:()=>make(1501,r=>{const d=int(r,1,5);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les barres de dix en dix. Combien de cubes ?',visuel:{blocs:{d}},reponse:d*10,aide:'Compte : '+Array.from({length:d},(_,k)=>10*(k+1)).join(', ')+'.'}})},
 {titre:'Encore des barres',description:'Jusqu’à 10 barres.',lecon:LEC_DIZ,questions:()=>make(1502,r=>{const d=int(r,3,10);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les barres de dix en dix. Combien de cubes ?',visuel:{blocs:{d}},reponse:d*10,aide:'Compte : '+Array.from({length:d},(_,k)=>10*(k+1)).join(', ')+'.'}})},
 {titre:'De 10 en 10',description:'10, 20, 30, ?',lecon:LEC_DIZ,questions:()=>make(1503,r=>suiteCompte(10*int(r,1,6),10,3))},
 {titre:'Combien de dizaines ?',description:'50, c’est 5 dizaines.',lecon:LEC_DIZ,questions:()=>make(1504,r=>{const d=int(r,1,9);return{type:'nombre',texte:d*10+', c’est combien de dizaines ?',visuel:{grand:String(d*10)},reponse:d,aide:d*10+', c’est '+pl(d,'barre')+' de 10.'}})},
 {titre:'Barres et cubes',description:'Des dizaines et quelques unités.',lecon:LEC_DIZ,questions:()=>make(1505,r=>{const d=int(r,1,5),u=int(r,1,5);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les barres, puis les cubes. Combien de cubes ?',visuel:{blocs:{d,u}},reponse:d*10+u,aide:'Barres : '+d*10+'. Puis les cubes : '+Array.from({length:u},(_,k)=>d*10+k+1).join(', ')+'.'}})},
 {titre:'Barres et cubes jusqu’à 99',description:'Compte les barres, puis les cubes.',lecon:LEC_DIZ,questions:()=>make(1506,r=>{const d=int(r,1,9),u=int(r,0,9);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les barres, puis les cubes. Combien de cubes ?',visuel:{blocs:{d,u}},reponse:d*10+u,aide:pl(d,'dizaine')+' et '+plU(u)+' : '+(d*10+u)+'.'}})},
 {titre:'De 10 en 10, autrement',description:'24, 34, 44, ?',lecon:LEC_DIZ,questions:()=>make(1507,r=>suiteCompte(int(r,1,9)+10*int(r,0,4),10,3))},
 {titre:'10 de plus',description:'On ajoute une barre.',lecon:['10 de plus : on ajoute 1 barre.','Le chiffre des dizaines monte de 1.','24 → 34'],questions:()=>make(1508,r=>{const n=int(r,11,89),pm=r()<.7;if(!pm&&n<20)return null;return{type:'nombre',texte:pm?'10 de plus que '+n+' ?':'10 de moins que '+n+' ?',visuel:{grand:n+(pm?' + 10':' − 10')},oral:pm?'Dix de plus que '+n+' ?':'Dix de moins que '+n+' ?',reponse:pm?n+10:n-10,aide:pm?'On ajoute 1 barre : les dizaines montent de 1.':'On enlève 1 barre : les dizaines baissent de 1.'}})}]};
const LEC_CEN=['Une plaque a 10 barres.','1 plaque = 1 centaine = 100.','On compte les plaques : 100, 200, 300…','Puis les barres : 310, 320…'];
const centaines={id:'centaines',titre:'Les centaines',icone:'100 200',couleur:'#2b7a3b',video:'Les-centaines.mp4',consigne:'Compte de 100 en 100.',niveaux:[
 {titre:'Compter les plaques',description:'Jusqu’à 5 plaques.',lecon:LEC_CEN,questions:()=>make(1601,r=>{const c=int(r,1,5);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les plaques de cent en cent. Combien de cubes ?',visuel:{blocs:{c}},reponse:c*100,aide:'Compte : '+Array.from({length:c},(_,k)=>100*(k+1)).join(', ')+'.'}})},
 {titre:'Encore des plaques',description:'Jusqu’à 9 plaques.',lecon:LEC_CEN,questions:()=>make(1602,r=>{const c=int(r,3,9);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les plaques de cent en cent. Combien de cubes ?',visuel:{blocs:{c}},reponse:c*100,aide:'Compte : '+Array.from({length:c},(_,k)=>100*(k+1)).join(', ')+'.'}})},
 {titre:'De 100 en 100',description:'100, 200, 300, ?',lecon:LEC_CEN,questions:()=>make(1603,r=>suiteCompte(100*int(r,1,6),100,3))},
 {titre:'Combien de centaines ?',description:'300, c’est 3 centaines.',lecon:LEC_CEN,questions:()=>make(1604,r=>{const c=int(r,1,9);return{type:'nombre',texte:c*100+', c’est combien de centaines ?',visuel:{grand:String(c*100)},reponse:c,aide:c*100+', c’est '+pl(c,'plaque')+' de 100.'}})},
 {titre:'Plaques et barres',description:'Des centaines et des dizaines.',lecon:LEC_CEN,questions:()=>make(1605,r=>{const c=int(r,1,5),d=int(r,1,5);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les plaques, puis les barres. Combien de cubes ?',visuel:{blocs:{c,d}},reponse:c*100+d*10,aide:'Plaques : '+c*100+'. Puis les barres : '+Array.from({length:d},(_,k)=>c*100+10*(k+1)).join(', ')+'.'}})},
 {titre:'Plaques, barres et cubes',description:'Jusqu’à 999.',lecon:LEC_CEN,questions:()=>make(1606,r=>{const c=int(r,1,9),d=int(r,0,9),u=int(r,0,9);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les plaques, les barres, puis les cubes. Combien de cubes ?',visuel:{blocs:{c,d,u}},reponse:c*100+d*10+u,aide:pl(c,'centaine')+', '+pl(d,'dizaine')+' et '+plU(u)+' : '+(c*100+d*10+u)+'.'}})},
 {titre:'De 100 en 100, autrement',description:'120, 220, 320, ?',lecon:LEC_CEN,questions:()=>make(1607,r=>suiteCompte(10*int(r,1,9)+100*int(r,0,4),100,3))},
 {titre:'100 de plus',description:'On ajoute une plaque.',lecon:['100 de plus : on ajoute 1 plaque.','Le chiffre des centaines monte de 1.','245 → 345'],questions:()=>make(1608,r=>{const n=int(r,101,899),pm=r()<.7;if(!pm&&n<200)return null;return{type:'nombre',texte:pm?'100 de plus que '+n+' ?':'100 de moins que '+n+' ?',visuel:{grand:n+(pm?' + 100':' − 100')},oral:pm?'Cent de plus que '+n+' ?':'Cent de moins que '+n+' ?',reponse:pm?n+100:n-100,aide:pm?'On ajoute 1 plaque : les centaines montent de 1.':'On enlève 1 plaque : les centaines baissent de 1.'}})}]};
const LEC_MIL=['10 plaques empilées font un gros cube.','1 gros cube = 1 millier = 1 000.','On compte : 1 000, 2 000, 3 000…','Le tableau a 4 colonnes : UM (les milliers), C, D, U.'];
const milliers={id:'milliers',titre:'Les milliers',icone:'1 000',couleur:'#623aa0',video:'Les-milliers.mp4',consigne:'Compte de 1 000 en 1 000.',niveaux:[
 {titre:'10 centaines = 1 millier',description:'Le gros cube.',lecon:LEC_MIL,questions:()=>make(1701,r=>{const t=int(r,0,2);
   if(t===0)return chx(r,{texte:'10 plaques, c’est combien de cubes ?',visuel:{blocs:{c:10}},aide:'10 plaques de 100 = 1 000.'},['1 000','100','10']);
   if(t===1)return chx(r,{texte:'1 gros cube, c’est combien de cubes ?',visuel:{blocs:{m:1}},aide:'1 gros cube = 1 millier = 1 000.'},['1 000','100','10']);
   const c=int(r,1,3);return chx(r,{texte:'Combien de plaques font 1 millier ?',aide:'10 centaines = 1 millier.'},['10','100',String(c)])})},
 {titre:'Compter les gros cubes',description:'1 000, 2 000, 3 000…',lecon:LEC_MIL,questions:()=>make(1702,r=>{const m=int(r,1,5);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les gros cubes de mille en mille. Combien de cubes ?',visuel:{blocs:{m}},reponse:m*1000,aide:'Compte : '+Array.from({length:m},(_,k)=>mil(1000*(k+1))).join(', ')+'.'}})},
 {titre:'De 1 000 en 1 000',description:'1 000, 2 000, ?',lecon:LEC_MIL,questions:()=>make(1703,r=>suiteCompte(1000*int(r,1,6),1000,3))},
 {titre:'Combien de milliers ?',description:'3 000, c’est 3 milliers.',lecon:LEC_MIL,questions:()=>make(1704,r=>{const m=int(r,1,9);return{type:'nombre',texte:mil(m*1000)+', c’est combien de milliers ?',visuel:{grand:mil(m*1000)},reponse:m,aide:mil(m*1000)+', c’est '+pl(m,'gros cube')+' de 1 000.'}})},
 {titre:'Gros cubes et plaques',description:'Des milliers et des centaines.',lecon:LEC_MIL,questions:()=>make(1705,r=>{const m=int(r,1,4),c=int(r,1,5);return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les gros cubes, puis les plaques. Combien de cubes ?',visuel:{blocs:{m,c}},reponse:m*1000+c*100,aide:'Gros cubes : '+mil(m*1000)+'. Puis les plaques : '+Array.from({length:c},(_,k)=>mil(m*1000+100*(k+1))).join(', ')+'.'}})},
 {titre:'Le tableau M C D U',description:'Un chiffre dans chaque case.',lecon:LEC_MIL,questions:()=>make(1706,r=>{const m=int(r,1,9),c=int(r,0,9),d=r()<.3?0:int(r,0,9),u=int(r,0,9),n=m*1000+c*100+d*10+u;return{type:'position',n:4,v:n,texte:'Écris '+mil(n)+' dans le tableau.',aide:m+' millier'+(m>1?'s':'')+', '+pl(c,'centaine')+', '+pl(d,'dizaine')+', '+plU(u)+'.'}})},
 {titre:'Tous les blocs',description:'Milliers, centaines, dizaines, unités.',lecon:LEC_MIL,questions:()=>make(1707,r=>{const m=int(r,1,3),c=int(r,0,4),d=int(r,0,4),u=int(r,0,5),n=m*1000+c*100+d*10+u;return{type:'nombre',texte:'Combien de cubes ?',oral:'Compte les gros cubes, les plaques, les barres, puis les cubes.',visuel:{blocs:{m,c,d,u}},reponse:n,aide:m+' millier'+(m>1?'s':'')+', '+pl(c,'centaine')+', '+pl(d,'dizaine')+', '+plU(u)+' : '+mil(n)+'.'}})},
 {titre:'1 000 de plus',description:'On ajoute un gros cube.',lecon:['1 000 de plus : on ajoute 1 gros cube.','Le chiffre des milliers monte de 1.','2 345 → 3 345'],questions:()=>make(1708,r=>{const n=int(r,1001,8999),pm=r()<.7;if(!pm&&n<2000)return null;return{type:'nombre',texte:pm?'1 000 de plus que '+mil(n)+' ?':'1 000 de moins que '+mil(n)+' ?',visuel:{grand:mil(n)+(pm?' + 1 000':' − 1 000')},oral:pm?'Mille de plus que '+n+' ?':'Mille de moins que '+n+' ?',reponse:pm?n+1000:n-1000,aide:pm?'Les milliers montent de 1.':'Les milliers baissent de 1.'}})}]};

window.EC_MATHS={
  ordre:['devinettes','logique'],
  activites:{devinettes,logique},
  formesNoms:FORMES_NOMS,scenes:SCENES,decor:DECOR,
  figures:FIGURES,coloriages:COLORIAGES,legende:LEGENDE
};
})();
