/* Theme tabs on the category pages: only the chosen theme block is shown.
   The buttons at the top (.sommaire-jeux) become tabs; the address (#id) keeps the choice,
   so the links of the side menu open the right block directly. */
(function () {
  'use strict';
  var nav = document.querySelector('.sommaire-jeux');
  var blocs = Array.prototype.slice.call(document.querySelectorAll('main section.jeux-niveau[aria-labelledby]'));
  if (!nav || blocs.length < 2) return;
  var css = document.createElement('style');
  css.textContent = '.sommaire-jeux a.actif{background:#0b6e7a;color:#fff;border-color:#0b6e7a}.sommaire-jeux a.actif:hover{color:#fff}';
  document.head.appendChild(css);
  var liens = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  function idDe(s) { return s.getAttribute('aria-labelledby'); }
  function montrer(id, defiler) {
    var bloc = blocs.filter(function (s) { return idDe(s) === id; })[0] || blocs[0];
    blocs.forEach(function (s) { s.hidden = s !== bloc; });
    liens.forEach(function (a) {
      var actif = a.getAttribute('href') === '#' + idDe(bloc);
      a.classList.toggle('actif', actif);
      if (actif) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (defiler) nav.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  liens.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var id = a.getAttribute('href').slice(1);
      history.replaceState(null, '', '#' + id);
      montrer(id, false);
    });
  });
  window.addEventListener('hashchange', function () { montrer(location.hash.slice(1), true); });
  montrer(location.hash.slice(1), !!location.hash);
})();
