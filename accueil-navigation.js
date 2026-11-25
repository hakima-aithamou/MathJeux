(()=>{const groups=[...document.querySelectorAll('.navgroup')];const close=()=>groups.forEach(g=>{g.classList.remove('active');g.querySelector('.navbtn').setAttribute('aria-expanded','false');g.querySelectorAll('.nested').forEach(n=>{n.classList.remove('open');n.querySelector('a').setAttribute('aria-expanded','false')})});function show(g){close();g.classList.add('active');g.querySelector('.navbtn').setAttribute('aria-expanded','true')}const hover=matchMedia('(hover:hover)');groups.forEach(g=>{let timer;g.addEventListener('pointerenter',()=>{clearTimeout(timer);if(hover.matches)show(g)});g.addEventListener('pointerleave',()=>{if(hover.matches)timer=setTimeout(()=>{if(!g.matches(':hover')){g.classList.remove('active');g.querySelector('.navbtn').setAttribute('aria-expanded','false')}},180)});g.querySelector('.navbtn').addEventListener('click',()=>show(g));g.querySelectorAll('.nested').forEach(n=>{const a=n.querySelector('a');function open(){g.querySelectorAll('.nested').forEach(o=>{o.classList.toggle('open',o===n);o.querySelector('a').setAttribute('aria-expanded',String(o===n))})}n.addEventListener('pointerenter',()=>{if(hover.matches)open()});a.addEventListener('click',e=>{e.preventDefault();open()})})});document.addEventListener('click',e=>{if(!e.target.closest('.sidebar'))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})})();

/* Keep the open menus inside the window: a menu that would go below the bottom of the screen moves up. */
(()=>{const marge=10;
function ajuster(m){if(!m)return;m.style.top='';const st=getComputedStyle(m);if(st.display==='none')return;
 if(st.position==='static'){const c=m.closest('.submenu');if(c){const rc=c.getBoundingClientRect(),rm=m.getBoundingClientRect();if(rm.bottom>rc.bottom)c.scrollTop+=Math.min(rm.bottom-rc.bottom+8,rm.top-rc.top-8);}return;}
 if(st.position!=='absolute')return;
 const r=m.getBoundingClientRect(),h=window.innerHeight;let dessous=r.bottom-(h-marge);
 if(dessous>0){const monte=Math.min(dessous,r.top-marge);if(monte>0)m.style.top=(parseFloat(st.top)||0)-monte+'px';}}
function tout(){document.querySelectorAll('.navgroup.active .submenu').forEach(ajuster);document.querySelectorAll('.navgroup .nested.open>.third').forEach(ajuster);}
const plus_tard=()=>requestAnimationFrame(()=>requestAnimationFrame(tout));
document.addEventListener('pointerover',e=>{if(e.target.closest&&e.target.closest('.sidebar'))plus_tard()});
document.addEventListener('click',plus_tard);document.addEventListener('focusin',plus_tard);window.addEventListener('resize',plus_tard);})();
