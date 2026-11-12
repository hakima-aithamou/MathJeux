'use strict';
(function () {
const el = id => document.getElementById(id);
const q = new URLSearchParams(location.search);
const prof = q.get('role') === 'teacher';
/* Only go back to a page of this site (never to another site). */
let retour = null;
try { const r = q.get('retour'); if (r) { const u = new URL(r, location.href); if (u.origin === location.origin && !/connexion\.html$/.test(u.pathname)) retour = u.href; } } catch {}

function dire(t, ok) { const n = el('notice'); n.textContent = t || ''; n.hidden = !t; n.className = 'notice' + (ok ? ' ok' : ''); }
el('titrePage').textContent = prof ? 'Connexion enseignante' : 'Connexion élève';
document.title = el('titrePage').textContent + ' · MathJeux';
el('formEleve').hidden = prof; el('formProf').hidden = !prof; el('introEleve').hidden = prof;
document.querySelectorAll('[data-compte]').forEach(a => { if ((a.dataset.compte === 'prof') === prof) a.setAttribute('aria-current', 'page'); });

async function occupe(form, fn) {
  const b = form.querySelectorAll('button'); b.forEach(x => x.disabled = true); dire('');
  try { await fn(); } catch (e) { dire(e.message); } finally { b.forEach(x => x.disabled = false); }
}
el('formEleve').onsubmit = e => {
  e.preventDefault();
  const mode = e.submitter && e.submitter.value || 'login';
  const f = Object.fromEntries(new FormData(e.target));
  occupe(e.target, async () => {
    if (mode === 'signup') await EC.inscriptionEleve(f);
    else {
      try { await EC.connexionEleve(f); }
      catch (err) { if (/incorrect/i.test(err.message)) throw Error(err.message + ' Vérifie l’orthographe de ton prénom et de ton nom. Si c’est ta première visite, ouvre « C’est ma première visite ».'); throw err; }
    }
    e.target.reset();
    if (retour && mode !== 'signup') { location.href = retour; return; }
    afficherConnecte(mode === 'signup');
  });
};
el('formProf').onsubmit = e => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  occupe(e.target, async () => {
    const d = await EC.connexionEnseignante(f);
    e.target.elements.password.value = '';
    if (d.role !== 'teacher') { await EC.deconnexion(); throw Error('Ce compte n’est pas un compte enseignante.'); }
    location.href = 'mon-espace.html';
  });
};
function afficherConnecte(premiereFois) {
  const p = EC.profil();
  if (!EC.connecte() || !p) return;
  el('formEleve').hidden = el('formProf').hidden = el('introEleve').hidden = true;
  el('dejaConnecte').hidden = false;
  el('titrePage').textContent = 'Tu es connecté';
  el('bonjour').textContent = p.role === 'teacher' ? 'Bonjour Mme Hakima !' : (premiereFois ? 'Ton compte est créé. Bienvenue ' : 'Bonjour ') + p.nom + ' !';
  const cl = p.classes || [];
  el('mesClasses').textContent = p.role === 'teacher' ? '' : cl.length ? (cl.length > 1 ? 'Tes classes : ' : 'Ta classe : ') + cl.join(', ') : 'Tu n’es pas encore dans une classe. Mme Hakima va t’ajouter. Tu peux déjà faire les activités : tes scores sont gardés.';
  el('voirEspace').textContent = p.role === 'teacher' ? 'Gérer mes élèves' : 'Voir mes progrès';
  if (retour) el('continuer').href = retour;
}
el('deconnexion').onclick = async () => { await EC.deconnexion(); location.href = location.pathname + '?role=' + (prof ? 'teacher' : 'eleve'); };
if (EC.connecte()) {
  if (EC.profil()) afficherConnecte();
  else EC.chargerProfil().then(() => afficherConnecte()).catch(() => {});
}
})();
