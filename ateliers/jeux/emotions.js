/* 💛 Emotions and good choices: recognise, understand and manage emotions. */
(function () {
const A = Atelier.api, { node, pioche, melange } = A;
const EMO = [['😀', 'la joie'], ['😢', 'la tristesse'], ['😠', 'la colère'], ['😨', 'la peur'], ['😲', 'la surprise'], ['🥱', 'la fatigue'], ['😌', 'le calme'], ['😳', 'la gêne']];
const SITU = [['🎂', 'C’est ta fête et toute la classe chante pour toi.', 'la joie'], ['🧱', 'Un ami fait tomber ta tour de blocs par accident.', 'la colère'], ['🐱', 'Ton chat est malade et doit aller chez le vétérinaire.', 'la tristesse'], ['⛈️', 'Il y a un gros orage avec beaucoup de tonnerre.', 'la peur'],
  ['🎁', 'Ta tante arrive avec un cadeau, sans prévenir.', 'la surprise'], ['🏃', 'Tu as couru pendant toute la récréation.', 'la fatigue'], ['🤝', 'Ton meilleur ami déménage dans une autre ville.', 'la tristesse'], ['🏆', 'Ton équipe gagne la partie de soccer.', 'la joie'], ['🐕', 'Un gros chien que tu ne connais pas aboie très fort.', 'la peur'], ['🚫', 'Quelqu’un prend ton crayon sans demander.', 'la colère']];
const CORPS = [['Ses poings sont serrés et son visage devient rouge.', 'la colère'], ['Des larmes coulent sur ses joues.', 'la tristesse'], ['Son cœur bat très vite et il tremble.', 'la peur'], ['Il bâille et ses yeux se ferment.', 'la fatigue'], ['Il sourit et saute sur place.', 'la joie'], ['Sa bouche et ses yeux s’ouvrent tout grands.', 'la surprise'], ['Ses épaules sont relâchées et il respire doucement.', 'le calme']];
const CALME = [['😠', 'Je suis fâché parce que j’ai perdu au jeu.', 'Je respire lentement : je sens une fleur, je souffle une chandelle.', ['Je lance les cartes par terre.', 'Je crie très fort sur mon ami.']],
  ['😟', 'Je suis inquiet avant la sortie scolaire.', 'J’en parle à mon enseignante ou à un adulte de confiance.', ['Je garde tout pour moi et je pleure seul.', 'Je refuse de sortir de la classe.']],
  ['😤', 'Il y a trop de bruit et je me sens dépassé.', 'Je demande une pause dans le coin calme ou je mets mes coquilles.', ['Je frappe la table.', 'Je pars de la classe sans le dire.']],
  ['😢', 'Je suis triste parce que mon ami ne veut pas jouer.', 'Je propose un autre jeu ou je joue avec un autre ami.', ['Je pousse mon ami.', 'Je dis des mots méchants.']],
  ['😡', 'Mon frère a brisé mon jouet.', 'Je compte jusqu’à 10, puis je lui dis calmement ce que je ressens.', ['Je brise un de ses jouets.', 'Je le tape.']],
  ['😰', 'J’ai peur de me tromper au tableau.', 'Je me dis : « Ce n’est pas grave de se tromper, j’apprends ! »', ['Je me cache sous mon pupitre.', 'Je dis que je suis nul.']]];
const SOCIAL = [['🧍', 'Un élève est seul à la récréation.', 'Je l’invite à jouer avec moi.', ['Je fais semblant de ne pas le voir.', 'Je me moque de lui.']],
  ['⚽', 'Je veux le ballon que mon ami utilise.', 'Je lui demande poliment et j’attends mon tour.', ['Je lui arrache le ballon.', 'Je boude dans mon coin.']],
  ['🧃', 'J’ai renversé le jus de mon voisin.', 'Je m’excuse et j’aide à essuyer.', ['Je dis que ce n’est pas moi.', 'Je ris et je m’en vais.']],
  ['🤕', 'Un ami tombe et se fait mal au genou.', 'Je lui demande s’il va bien et j’avertis un adulte.', ['Je continue à jouer.', 'Je ris de lui.']],
  ['🗣️', 'L’enseignante parle à la classe.', 'J’écoute et je lève la main pour parler.', ['Je parle en même temps qu’elle.', 'Je joue avec mon crayon.']],
  ['🎨', 'Mon ami me montre son dessin.', 'Je lui dis quelque chose de gentil sur son dessin.', ['Je dis que c’est laid.', 'Je regarde ailleurs sans répondre.']],
  ['🚪', 'Nous sortons en rang pour la récréation.', 'Je marche calmement à ma place dans le rang.', ['Je pousse pour être le premier.', 'Je cours dans le corridor.']]];
const THERMO = [[['😌', 'calme'], ['😕', 'un peu agacé'], ['😠', 'fâché'], ['😡', 'très fâché']], [['😌', 'calme'], ['😐', 'un peu inquiet'], ['😟', 'inquiet'], ['😱', 'très effrayé']], [['🙂', 'content'], ['😀', 'joyeux'], ['😄', 'très joyeux'], ['🤩', 'super excité']]];
const choixSimple = (api, opts, bon, consigne, indice, explication, oral) => { const f = api.choix(opts); return { consigne, oral, indice, explication, verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === bon, montrer() { f.boutons()[opts.indexOf(bon)].classList.add('bonne'); } }; };
const autres = (bon, n) => melange([bon, ...melange(EMO.map(x => x[1]).filter(x => x !== bon)).slice(0, n - 1)]);
const niveaux = [
  { titre: 'Nommer l’émotion', description: 'Regarde le visage.', manche(api) {
    const [e, n] = pioche(EMO); api.zone().append(node('p', 'image-mot grand-emo', e));
    return choixSimple(api, autres(n, 4), n, 'Quelle émotion ce visage montre-t-il ?', 'Regarde la bouche, les yeux et les sourcils.', 'Ce visage montre ' + n + '.'); } },
  { titre: 'Que ressent-il ?', description: 'Les indices du corps.', manche(api) {
    const [t, n] = pioche(CORPS); api.zone().append(node('p', 'grand-texte', t));
    return choixSimple(api, autres(n, 4), n, 'Que ressent probablement cet enfant ?', 'Notre corps nous donne des indices : nos mains, notre visage, notre cœur, notre respiration.', t + ' Il ressent probablement ' + n + '.', 'Que ressent cet enfant ? ' + t); } },
  { titre: 'Les situations', description: 'Quelle émotion ressentirais-tu ?', manche(api) {
    const [e, t, n] = pioche(SITU); api.zone().append(node('p', 'image-mot', e), node('p', 'grand-texte', t));
    return choixSimple(api, autres(n, 4), n, 'Quelle émotion pourrait-on ressentir ?', 'Imagine que ça t’arrive. Comment se sentirait ton cœur ?', 'Dans cette situation, beaucoup de personnes ressentent ' + n + '. Chaque personne peut ressentir les choses un peu différemment.', 'Quelle émotion pourrait-on ressentir ? ' + t); } },
  { titre: 'Le thermomètre des émotions', description: 'Du plus petit au plus grand.', manche(api) {
    const T = pioche(THERMO), items = melange(T.map(([e, t]) => ({ e, t }))), o = api.ordre(items), bon = T.map(([, t]) => items.findIndex(x => x.t === t));
    return { consigne: 'Range les émotions de la plus petite à la plus grande, comme sur un thermomètre.', indice: 'Commence par « ' + T[0][1] + ' » et finis par « ' + T[3][1] + ' ».', explication: T.map(x => x[1]).join(' → ') + '. Quand l’émotion monte, c’est le bon moment pour utiliser un truc pour se calmer.',
      verifier() { if (!o.complet()) return { manque: 'Place toutes les cartes.' }; return o.valeur().every((v, i) => v === bon[i]); }, montrer: () => o.montrer(bon) }; } },
  { titre: 'Mes trucs pour me calmer', description: 'Choisis la bonne stratégie.', manche(api) {
    const [e, t, bon, mauvais] = pioche(CALME); api.zone().append(node('p', 'image-mot', e), node('p', 'grand-texte', t));
    return choixSimple(api, melange([bon, ...mauvais]), bon, 'Quel est le meilleur choix ?', 'Le bon choix m’aide à me calmer sans faire de mal à personne, ni à moi, ni aux autres, ni au matériel.', 'Bon choix : ' + bon, 'Quel est le meilleur choix ? ' + t); } },
  { titre: 'Le bon choix avec les amis', description: 'Être un bon ami.', manche(api) {
    const [e, t, bon, mauvais] = pioche(SOCIAL); api.zone().append(node('p', 'image-mot', e), node('p', 'grand-texte', t));
    return choixSimple(api, melange([bon, ...mauvais]), bon, 'Que devrais-tu faire ?', 'Pense à comment l’autre personne va se sentir.', 'Bon choix : ' + bon, 'Que devrais-tu faire ? ' + t); } }];
Atelier.definir({ id: 'emotions', titre: 'Émotions et bons choix', icone: '💛', couleur: '#d4880f', intro: 'Apprends à reconnaître les émotions sur les visages et dans le corps, à mesurer leur force, et à faire de bons choix pour te calmer et pour être un bon ami.', niveaux });
})();
