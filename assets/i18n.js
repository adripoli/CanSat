// Language switch shared by every page. Spanish is the default; the choice is kept in localStorage, so it carries
// across pages and into the pages the home page opens in a frame.
// Markup: data-es="…" holds an element's Spanish innerHTML (the English stays in the page);
// data-es-<attr>="…" holds the Spanish value of attribute <attr> (data-es-title, data-es-aria-label, data-es-content, …).
// Script: I18N.t(en, es) picks a string for the current language; 'langchange' fires on window after a switch.
// Any button with [data-lang-toggle] flips the language.
(function () {
  const KEY = 'runnysat-lang';
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  const orig = new WeakMap();   // element -> { html, attrs: { name: englishValue } }

  function apply() {
    const es = I18N.lang === 'es';
    document.documentElement.lang = I18N.lang;
    document.querySelectorAll('*').forEach(el => {
      const names = el.getAttributeNames().filter(n => n === 'data-es' || n.startsWith('data-es-'));
      if (!names.length) return;
      let o = orig.get(el);
      if (!o) { o = { html: null, attrs: {} }; orig.set(el, o); }
      for (const n of names) {
        if (n === 'data-es') {
          if (o.html === null) o.html = el.innerHTML;
          const v = es ? el.getAttribute(n) : o.html;
          if (el.innerHTML !== v) el.innerHTML = v;
        } else {
          const target = n.slice(8);
          if (!(target in o.attrs)) o.attrs[target] = el.getAttribute(target);
          const v = es ? el.getAttribute(n) : o.attrs[target];
          if (v === null) el.removeAttribute(target); else el.setAttribute(target, v);
        }
      }
    });
    document.querySelectorAll('[data-lang-toggle]').forEach(b => {
      b.setAttribute('aria-label', es ? 'Switch to English' : 'Cambiar a español');
      b.title = es ? 'English' : 'Español';
    });
  }

  const I18N = window.I18N = {
    lang: saved === 'en' ? 'en' : 'es',
    t: (en, es) => (I18N.lang === 'es' ? es : en),
    set(lang, store = true) {
      if (lang !== 'en' && lang !== 'es') return;
      const changed = lang !== I18N.lang;
      I18N.lang = lang;
      if (store) try { localStorage.setItem(KEY, lang); } catch (e) {}
      apply();
      if (changed) dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    },
    toggle() { I18N.set(I18N.lang === 'es' ? 'en' : 'es'); },
    apply,
  };

  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-lang-toggle]');
    if (b) { e.preventDefault(); I18N.toggle(); }
  });
  // Another page or frame on this site switched language.
  addEventListener('storage', e => { if (e.key === KEY && e.newValue) I18N.set(e.newValue, false); });

  apply();
})();
