/* 🖼️ My day in pictures: routines, times of the day, before and after. */
(function () {
const A = Atelier.api, { node, hasard, pioche, melange } = A;
const MATIN = [['⏰', 'Je me réveille.'], ['🚽', 'Je vais à la toilette.'], ['👕', 'Je m’habille.'], ['🥣', 'Je déjeune.'], ['🪥', 'Je me brosse les dents.'], ['🧥', 'Je mets mon manteau.'], ['🚌', 'Je prends l’autobus.']];
const MAINS = [['💧', 'Je mouille mes mains.'], ['🧼', 'Je mets du savon.'], ['👐', 'Je frotte pendant 20 secondes.'], ['🚿', 'Je rince mes mains.'], ['🧻', 'Je sèche mes mains.']];
const SOIR = [['🍽️', 'Je soupe.'], ['🛁', 'Je prends mon bain.'], ['👚', 'Je mets mon pyjama.'], ['🪥', 'Je me brosse les dents.'], ['📖', 'J’écoute une histoire.'], ['😴', 'Je dors.']];
const ECOLE = [['🧥', 'J’accroche mon manteau.'], ['🗓️', 'Le cercle du matin.'], ['➕', 'Les mathématiques.'], ['⚽', 'La récréation.'], ['🥪', 'Le dîner.'], ['📚', 'La lecture.'], ['🎒', 'Je range mon sac.'], ['🚌', 'L’autobus du retour.']];
const MOMENTS = ['le matin 🌅', 'le midi 🕛', 'l’après-midi 🌤️', 'le soir 🌆', 'la nuit 🌙'];
const QUAND = [['🥣', 'Je déjeune avant l’école.', 0], ['🌅', 'Le soleil se lève.', 0], ['🥪', 'Je mange mon dîner à l’école.', 1], ['🚌', 'L’autobus me ramène à la maison après l’école.', 2], ['🍽️', 'Je soupe avec ma famille.', 3], ['🌆', 'Le soleil se couche.', 3], ['😴', 'Je dors dans mon lit.', 4], ['🌙', 'La lune et les étoiles brillent, tout le monde dort.', 4], ['⏰', 'Mon réveille-matin sonne.', 0], ['🛁', 'Je prends mon bain avant d’aller au lit.', 3]];
const AVANT = [['🍎', 'Qu’est-ce que je fais avant de manger ?', 'Je me lave les mains.', ['Je vais me coucher.', 'Je mets mes bottes.']],
  ['🛝', 'Qu’est-ce que je fais avant d’aller jouer dehors en hiver ?', 'Je mets mon habit de neige.', ['Je mets mon pyjama.', 'Je prends mon bain.']],
  ['🚽', 'Qu’est-ce que je fais après être allé à la toilette ?', 'Je tire la chasse d’eau et je me lave les mains.', ['Je mange une collation.', 'Je mets mon manteau.']],
  ['🧩', 'Qu’est-ce que je fais après avoir joué ?', 'Je range les jouets.', ['Je laisse tout par terre.', 'Je vais dormir tout de suite.']],
  ['🚌', 'Qu’est-ce que je fais avant de monter dans l’autobus ?', 'J’attends mon tour à l’arrêt.', ['Je cours dans la rue.', 'Je pousse les autres.']],
  ['🪥', 'Qu’est-ce que je fais après avoir mis le dentifrice sur ma brosse ?', 'Je brosse mes dents en haut et en bas.', ['Je me couche.', 'Je mets mes souliers.']],
  ['🔔', 'Qu’est-ce que je fais quand la cloche de la récréation sonne la fin ?', 'Je me mets en rang.', ['Je continue à jouer.', 'Je me cache.']]];
function routine(api, liste, n, quoi) {
  const d = hasard(0, liste.length - n), part = liste.slice(d, d + n), items = melange(part.map(([e, t]) => ({ e, t }))), o = api.ordre(items), bon = part.map(([, t]) => items.findIndex(x => x.t === t));
  return { consigne: 'Remets ' + quoi + ' dans l’ordre.', indice: 'Qu’est-ce qui arrive en premier ? Ici, c’est : « ' + part[0][1] + ' »', explication: part.map(x => x[1]).join(' → '),
    verifier() { if (!o.complet()) return { manque: 'Place toutes les cartes.' }; const v = o.valeur(); const faux = v.findIndex((x, i) => x !== bon[i]); return faux < 0 ? true : { aide: 'La carte n° ' + (faux + 1) + ' n’est pas à la bonne place.' }; }, montrer: () => o.montrer(bon) };
}
const niveaux = [
  { titre: 'Se laver les mains', description: 'Les 5 étapes.', manche: api => routine(api, MAINS, 5, 'les étapes pour se laver les mains') },
  { titre: 'Ma routine du matin', description: 'Du réveil à l’autobus.', manche: api => routine(api, MATIN, 4, 'la routine du matin') },
  { titre: 'Ma routine du soir', description: 'Du souper au dodo.', manche: api => routine(api, SOIR, 4, 'la routine du soir') },
  { titre: 'Les moments de la journée', description: 'Matin, midi, après-midi, soir, nuit.', manche(api) {
    const [e, t, m] = pioche(QUAND); api.zone().append(node('p', 'image-mot', e), node('p', 'grand-texte', t)); const f = api.choix(MOMENTS);
    return { consigne: 'À quel moment de la journée cela arrive-t-il ?', oral: 'À quel moment de la journée ? ' + t, indice: 'Pense à ta journée : le matin on se lève, le midi on dîne, l’après-midi on finit l’école, le soir on soupe, la nuit on dort.', explication: 'C’est ' + MOMENTS[m].replace(/ \S+$/, '') + '.',
      verifier: () => f() === null ? { manque: 'Choisis un moment.' } : f() === m, montrer() { f.boutons()[m].classList.add('bonne'); } }; } },
  { titre: 'Avant ou après ?', description: 'La bonne étape au bon moment.', manche(api) {
    const [e, q, bon, mauvais] = pioche(AVANT), opts = melange([bon, ...mauvais]); api.zone().append(node('p', 'image-mot', e), node('p', 'grand-texte', q)); const f = api.choix(opts);
    return { consigne: q, indice: 'Pense à ce que tu fais chaque jour. Qu’est-ce qui est logique ?', explication: bon,
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === bon, montrer() { f.boutons()[opts.indexOf(bon)].classList.add('bonne'); } }; } },
  { titre: 'Mon horaire à l’école', description: 'La journée de classe en ordre.', manche: api => routine(api, ECOLE, 5, 'l’horaire de la journée à l’école') }];
Atelier.definir({ id: 'journee', titre: 'Ma journée en images', icone: '🖼️', couleur: '#5a6fd6', intro: 'Avec des images, remets en ordre les routines de la journée : se laver les mains, le matin, le soir, l’école. Découvre aussi les moments de la journée.', niveaux });
})();
